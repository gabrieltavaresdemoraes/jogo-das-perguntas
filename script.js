/* script.js — versão completa e arrumada
   Compatível com: index.html (IDs usados no HTML) e questions.js (window.QUESTIONS_BY_CATEGORY / window.ALL_QUESTIONS)
*/

/* ---------- Configurações ---------- */
const TIME_PER_QUESTION = 15;      // segundos por pergunta
const BASE_POINTS = 100;           // pontos base por acerto
const MAX_TIME_BONUS = 50;         // bônus máximo por tempo (0..MAX_TIME_BONUS)
const STREAK_BONUS_PER = 10;       // bônus por cada acerto consecutivo
const STREAK_BONUS_CAP = 50;       // teto do bônus por streak

/* ---------- Seleção de elementos do DOM ---------- */
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const qb = document.getElementById('question-area');
const questionEl = document.getElementById('question');
const answerBtns = document.getElementById('answer-buttons');
const explanationEl = document.getElementById('explanation');
const timerEl = document.getElementById('time');
const progressEl = document.getElementById('current-question-number');
const totalQuestionsEl = document.getElementById('total-questions');
const playerNameInput = document.getElementById('player-name');
const categorySelect = document.getElementById('category-select');

const scoreOverlay = document.getElementById('score-container');
const finalName = document.getElementById('final-name');
const finalScoreEl = document.getElementById('final-score');
const finalCorrect = document.getElementById('final-correct');
const finalTotal = document.getElementById('final-total');
const finalPercent = document.getElementById('final-percent');
const avgTimeEl = document.getElementById('avg-time');

const playAgainBtn = document.getElementById('play-again');
const closeScoreBtn = document.getElementById('close-score');

const leaderboardBtn = document.getElementById('leaderboard-btn');
const leaderboardSection = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');
const clearLeaderboardBtn = document.getElementById('clear-leaderboard');
const closeLeaderboardBtn = document.getElementById('close-leaderboard');

/* ---------- Estado do quiz ---------- */
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let correctCount = 0;
let streak = 0;
let timeLeft = TIME_PER_QUESTION;
let timer = null;
let times = [];

/* ---------- Utilitários ---------- */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* ---------- Popula seletor de categorias ---------- */
function populateCategorySelect() {
  if (!categorySelect || !window.QUESTIONS_BY_CATEGORY) return;
  const existing = Array.from(categorySelect.options).map(o => o.value);
  Object.keys(window.QUESTIONS_BY_CATEGORY).forEach(cat => {
    if (!existing.includes(cat)) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    }
  });
}
populateCategorySelect();

/* ---------- Carrega perguntas ---------- */
function loadQuestionsForSelectedCategory() {
  const cat = categorySelect?.value || 'All';
  if (window.QUESTIONS_BY_CATEGORY && cat !== 'All') {
    questions = shuffleArray(window.QUESTIONS_BY_CATEGORY[cat] || []);
  } else if (window.QUESTIONS_BY_CATEGORY && cat === 'All') {
    questions = shuffleArray(Object.values(window.QUESTIONS_BY_CATEGORY).flat());
  } else if (window.ALL_QUESTIONS) {
    questions = shuffleArray(window.ALL_QUESTIONS);
  } else {
    questions = [];
  }
  if (totalQuestionsEl) totalQuestionsEl.textContent = questions.length;
}

/* questions.js — 25 perguntas por categoria */

window.QUESTIONS_BY_CATEGORY = {
"Geografia": [
  { question: "Qual é o maior país do mundo em extensão territorial?", answers: [
    { text: "Rússia", correct: true },
    { text: "Canadá", correct: false },
    { text: "China", correct: false },
    { text: "Estados Unidos", correct: false }
  ]},
  { question: "Qual é o rio mais longo do mundo?", answers: [
    { text: "Nilo", correct: true },
    { text: "Amazonas", correct: false },
    { text: "Yangtzé", correct: false },
    { text: "Mississipi", correct: false }
  ]},
  { question: "Qual deserto é o mais seco do mundo?", answers: [
    { text: "Atacama", correct: true },
    { text: "Saara", correct: false },
    { text: "Kalahari", correct: false },
    { text: "Gobi", correct: false }
  ]},
  { question: "Qual é a capital da Austrália?", answers: [
    { text: "Sydney", correct: false },
    { text: "Camberra", correct: true },
    { text: "Melbourne", correct: false },
    { text: "Perth", correct: false }
  ]},
  { question: "O Brasil faz fronteira com quantos países?", answers: [
    { text: "10", correct: false },
    { text: "9", correct: true },
    { text: "7", correct: false },
    { text: "11", correct: false }
  ]},
  { question: "Qual é o ponto mais alto do planeta?", answers: [
    { text: "Monte Everest", correct: true },
    { text: "Monte Kilimanjaro", correct: false },
    { text: "Monte Aconcágua", correct: false },
    { text: "Mont Blanc", correct: false }
  ]},
  { question: "Qual é a capital do Canadá?", answers: [
    { text: "Toronto", correct: false },
    { text: "Vancouver", correct: false },
    { text: "Ottawa", correct: true },
    { text: "Montreal", correct: false }
  ]},
  { question: "Em que continente fica o deserto do Saara?", answers: [
    { text: "África", correct: true },
    { text: "Ásia", correct: false },
    { text: "América do Sul", correct: false },
    { text: "Europa", correct: false }
  ]},
  { question: "Qual oceano banha a costa leste do Brasil?", answers: [
    { text: "Oceano Pacífico", correct: false },
    { text: "Oceano Atlântico", correct: true },
    { text: "Oceano Índico", correct: false },
    { text: "Oceano Glacial Ártico", correct: false }
  ]},
  { question: "Qual é a capital do Japão?", answers: [
    { text: "Pequim", correct: false },
    { text: "Seul", correct: false },
    { text: "Tóquio", correct: true },
    { text: "Xangai", correct: false }
  ]},
  { question: "Qual país tem formato de bota no mapa?", answers: [
    { text: "Itália", correct: true },
    { text: "Espanha", correct: false },
    { text: "Grécia", correct: false },
    { text: "Portugal", correct: false }
  ]},
  { question: "Qual é o maior oceano da Terra?", answers: [
    { text: "Atlântico", correct: false },
    { text: "Pacífico", correct: true },
    { text: "Índico", correct: false },
    { text: "Ártico", correct: false }
  ]},
  { question: "Qual país é conhecido como 'Terra do Sol Nascente'?", answers: [
    { text: "Japão", correct: true },
    { text: "China", correct: false },
    { text: "Coreia do Sul", correct: false },
    { text: "Tailândia", correct: false }
  ]},
  { question: "Em qual continente fica o Brasil?", answers: [
    { text: "Ásia", correct: false },
    { text: "América do Sul", correct: true },
    { text: "África", correct: false },
    { text: "Oceania", correct: false }
  ]},
  { question: "Qual é a capital da Argentina?", answers: [
    { text: "Montevidéu", correct: false },
    { text: "Buenos Aires", correct: true },
    { text: "Santiago", correct: false },
    { text: "Assunção", correct: false }
  ]},
  { question: "Qual o menor país do mundo?", answers: [
    { text: "Mônaco", correct: false },
    { text: "Vaticano", correct: true },
    { text: "San Marino", correct: false },
    { text: "Liechtenstein", correct: false }
  ]},
  { question: "Qual é a capital da França?", answers: [
    { text: "Roma", correct: false },
    { text: "Paris", correct: true },
    { text: "Londres", correct: false },
    { text: "Berlim", correct: false }
  ]},
  { question: "Qual continente é conhecido como berço da humanidade?", answers: [
    { text: "América", correct: false },
    { text: "África", correct: true },
    { text: "Ásia", correct: false },
    { text: "Europa", correct: false }
  ]},
  { question: "Qual a capital da Rússia?", answers: [
    { text: "São Petersburgo", correct: false },
    { text: "Moscou", correct: true },
    { text: "Kiev", correct: false },
    { text: "Varsóvia", correct: false }
  ]},
  { question: "Qual é a capital de Portugal?", answers: [
    { text: "Lisboa", correct: true },
    { text: "Porto", correct: false },
    { text: "Madrid", correct: false },
    { text: "Barcelona", correct: false }
  ]},
  { question: "Qual o maior país da América do Sul?", answers: [
    { text: "Argentina", correct: false },
    { text: "Brasil", correct: true },
    { text: "Colômbia", correct: false },
    { text: "Peru", correct: false }
  ]},
  { question: "Qual a capital da Inglaterra?", answers: [
    { text: "Paris", correct: false },
    { text: "Londres", correct: true },
    { text: "Manchester", correct: false },
    { text: "Liverpool", correct: false }
  ]},
  { question: "Qual é a maior floresta tropical do mundo?", answers: [
    { text: "Floresta Amazônica", correct: true },
    { text: "Floresta do Congo", correct: false },
    { text: "Floresta Boreal", correct: false },
    { text: "Floresta da Malásia", correct: false }
  ]},
  { question: "Qual é o país mais populoso do mundo?", answers: [
    { text: "Índia", correct: true },
    { text: "China", correct: false },
    { text: "Estados Unidos", correct: false },
    { text: "Indonésia", correct: false }
  ]},
  { question: "Qual é a capital da Espanha?", answers: [
    { text: "Barcelona", correct: false },
    { text: "Madrid", correct: true },
    { text: "Valência", correct: false },
    { text: "Sevilha", correct: false }
  ]}
],

};

/* Para fallback */
window.ALL_QUESTIONS = Object.values(window.QUESTIONS_BY_CATEGORY).flat();


/* ---------- Eventos ---------- */
startBtn?.addEventListener('click', () => { loadQuestionsForSelectedCategory(); startQuiz(); });
nextBtn?.addEventListener('click', () => { currentQuestionIndex++; setNextQuestion(); });
playAgainBtn?.addEventListener('click', () => { closeScore(); startQuiz(); });
closeScoreBtn?.addEventListener('click', closeScore);
leaderboardBtn?.addEventListener('click', showLeaderboard);
clearLeaderboardBtn?.addEventListener('click', () => { localStorage.removeItem('quiz_leaderboard'); renderLeaderboard(); });
closeLeaderboardBtn?.addEventListener('click', () => { leaderboardSection?.classList.add('hide'); });

playerNameInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); startBtn?.click(); }
});

/* ---------- Controle ---------- */
function startQuiz() {
  const name = (playerNameInput?.value || 'Jogador').trim();
  if (playerNameInput) {
    playerNameInput.value = name;
    playerNameInput.disabled = true;
  }
  startBtn?.classList.add('hide');

  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  streak = 0;
  times = [];

  if (!questions.length) loadQuestionsForSelectedCategory();
  if (!questions.length) {
    questionEl.textContent = 'Nenhuma pergunta disponível.';
    return;
  }

  scoreOverlay?.classList.add('hide');
  leaderboardSection?.classList.add('hide');

  qb?.classList.remove('hide');
  setNextQuestion();
}

function setNextQuestion() {
  clearState();
  if (currentQuestionIndex >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[currentQuestionIndex];
  progressEl.textContent = (currentQuestionIndex + 1);
  questionEl.textContent = q.question;

  (q.answers || []).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'button';
    btn.textContent = opt.text;
    if (opt.correct) btn.dataset.correct = 'true';
    btn.addEventListener('click', selectAnswer);
    answerBtns?.appendChild(btn);
  });

  timeLeft = TIME_PER_QUESTION;
  timerEl.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = Math.max(timeLeft, 0);
    if (timeLeft <= 0) {
      clearInterval(timer);
      revealCorrectDueToTimeout();
      pushTime(TIME_PER_QUESTION);
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) nextBtn?.classList.remove('hide');
        else finishQuiz();
      }, 900);
    }
  }, 1000);
}

function clearState() {
  clearInterval(timer);
  nextBtn?.classList.add('hide');
  while (answerBtns.firstChild) answerBtns.removeChild(answerBtns.firstChild);
  explanationEl.classList.add('hide');
  explanationEl.textContent = '';
  removeContainerGlows();
}

/* ---------- Seleção ---------- */
function selectAnswer(e) {
  const selected = e.currentTarget;
  const isCorrect = selected.dataset.correct === 'true';

  clearInterval(timer);
  const usedTime = Math.max(0, TIME_PER_QUESTION - (timeLeft || 0));
  pushTime(usedTime);

  const timeBonus = Math.round(((timeLeft || 0) / TIME_PER_QUESTION) * MAX_TIME_BONUS);
  const streakBonus = Math.min(streak * STREAK_BONUS_PER, STREAK_BONUS_CAP);

  if (isCorrect) {
    const pointsThis = BASE_POINTS + timeBonus + streakBonus;
    score += pointsThis;
    streak++;
    correctCount++;
    applyCorrectAnimation(selected);
  } else {
    streak = 0;
    applyWrongAnimation(selected);
    Array.from(answerBtns.children).forEach(b => {
      if (b.dataset.correct === 'true') applyCorrectVisual(b);
      else if (b !== selected) applyWrongVisual(b);
    });
  }

  Array.from(answerBtns.children).forEach(b => b.disabled = true);

  explanationEl.textContent = isCorrect ? `Correto! +${BASE_POINTS + timeBonus + streakBonus} pts` : 'Resposta incorreta.';
  explanationEl.classList.remove('hide');

  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) nextBtn?.classList.remove('hide');
    else finishQuiz();
  }, 700);
}

/* ---------- Visuais ---------- */
function applyCorrectVisual(btn) { btn.classList.add('correct'); }
function applyWrongVisual(btn) { btn.classList.add('wrong'); }
function applyCorrectAnimation(btn) {
  applyCorrectVisual(btn);
  btn.classList.add('correct-anim');
  document.querySelector('.quiz-container')?.classList.add('quiz-success-glow');
  btn.addEventListener('animationend', () => btn.classList.remove('correct-anim'), { once: true });
  setTimeout(() => document.querySelector('.quiz-container')?.classList.remove('quiz-success-glow'), 700);
}
function applyWrongAnimation(btn) {
  applyWrongVisual(btn);
  btn.classList.add('wrong-anim');
  document.querySelector('.quiz-container')?.classList.add('quiz-error-glow');
  btn.addEventListener('animationend', () => btn.classList.remove('wrong-anim'), { once: true });
  setTimeout(() => document.querySelector('.quiz-container')?.classList.remove('quiz-error-glow'), 700);
}
function removeContainerGlows() {
  const c = document.querySelector('.quiz-container');
  c?.classList.remove('quiz-success-glow', 'quiz-error-glow');
}

/* ---------- Timeout ---------- */
function revealCorrectDueToTimeout() {
  Array.from(answerBtns.children).forEach(b => {
    if (b.dataset.correct === 'true') applyCorrectVisual(b);
    else applyWrongVisual(b);
    b.disabled = true;
  });
  explanationEl.textContent = 'Tempo esgotado.';
  explanationEl.classList.remove('hide');
  streak = 0;
}

/* ---------- Tempos ---------- */
function pushTime(used) {
  const v = Number.isFinite(used) ? Math.max(0, Math.min(used, TIME_PER_QUESTION)) : TIME_PER_QUESTION;
  times.push(v);
}

/* ---------- Final ---------- */
function finishQuiz() {
  clearInterval(timer);
  qb?.classList.add('hide');

  const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const percent = Math.round((correctCount / questions.length) * 100);

  finalName.textContent = playerNameInput?.value || 'Jogador';
  finalScoreEl.textContent = score;
  finalCorrect.textContent = correctCount;
  finalTotal.textContent = questions.length;
  finalPercent.textContent = percent;
  avgTimeEl.textContent = avg.toFixed(1);

  scoreOverlay?.classList.remove('hide');

  const entry = {
    name: playerNameInput?.value || 'Jogador',
    score,
    correct: correctCount,
    percent,
    avg: Number(avg.toFixed(1)),
    date: new Date().toISOString()
  };
  saveToLeaderboard(entry);
}

/* ---------- Score overlay ---------- */
function closeScore() {
  scoreOverlay?.classList.add('hide');
  startBtn?.classList.remove('hide');
  if (playerNameInput) playerNameInput.disabled = false;
}

/* ---------- Leaderboard ---------- */
function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('quiz_leaderboard') || '[]');
  } catch { return []; }
}
function saveToLeaderboard(entry) {
  const list = getLeaderboard();
  list.push(entry);
  list.sort((a, b) => b.score - a.score || b.percent - a.percent || a.avg - b.avg);
  localStorage.setItem('quiz_leaderboard', JSON.stringify(list.slice(0, 50)));
  renderLeaderboard();
}
function renderLeaderboard() {
  leaderboardList.innerHTML = '';
  const list = getLeaderboard();
  if (!list.length) {
    const li = document.createElement('li');
    li.textContent = 'Sem resultados ainda.';
    leaderboardList.appendChild(li);
    return;
  }
  list.slice(0, 10).forEach((row, idx) => {
    const li = document.createElement('li');
    const dateStr = new Date(row.date).toLocaleString();
    li.innerHTML = `<strong>#${idx + 1}</strong> ${escapeHtml(row.name)} — ${row.score} pts • ${row.correct} acertos • ${row.percent}% • ${dateStr}`;
    leaderboardList.appendChild(li);
  });
}
function showLeaderboard() {
  renderLeaderboard();
  leaderboardSection?.classList.remove('hide');
}

/* ---------- Init ---------- */
(function init() {
  loadQuestionsForSelectedCategory();
  renderLeaderboard();
})();
