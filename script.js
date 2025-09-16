/* script.js
   Quiz avançado (dark theme)
   - Timer por pergunta
   - Pontos: BASE + bônus de tempo + bônus por sequência (streak)
   - Leaderboard persistente via localStorage (Top 50, exibe Top 10)
   - Estatísticas finais (acertos, %, tempo médio)
   - Código defensivo: verifica existência de elementos antes de usar
*/

/* ---------- Configurações de pontuação e tempo ---------- */
const TIME_PER_QUESTION = 15;      // segundos por pergunta
const BASE_POINTS = 100;          // pontos base por acerto
const MAX_TIME_BONUS = 50;        // bônus máximo por tempo (0..MAX_TIME_BONUS)
const STREAK_BONUS_PER = 10;      // bônus por cada acerto consecutivo (por nível)
const STREAK_BONUS_CAP = 50;      // teto do bônus por streak

/* ---------- Elementos do DOM (verifica existência) ---------- */
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

/* ---------- Segurança: se algum elemento essencial faltar, avisa no console ---------- */
if (!questionEl || !answerBtns || !startBtn) {
  console.error('Elemento essencial não encontrado. Verifique se index.html contém os IDs esperados.');
}

/* ---------- Perguntas (10 perguntas de conhecimentos gerais) ---------- */
const questions = [
  { q:"Qual é a capital da Austrália?", a:[{t:"Sydney"},{t:"Melbourne"},{t:"Canberra",correct:true},{t:"Brisbane"}], exp:"Canberra foi escolhida como capital como compromisso entre Sydney e Melbourne."},
  { q:"Qual elemento químico tem símbolo 'Fe'?", a:[{t:"Ferro",correct:true},{t:"Flúor"},{t:"Fósforo"},{t:"Francium"}], exp:"Fe vem do latim 'Ferrum' — Ferro."},
  { q:"Quem escreveu 'Dom Quixote'?", a:[{t:"Miguel de Cervantes",correct:true},{t:"William Shakespeare"},{t:"Machado de Assis"},{t:"Victor Hugo"}], exp:"'Dom Quixote' foi escrito por Miguel de Cervantes."},
  { q:"Em que ano terminou a Segunda Guerra Mundial?", a:[{t:"1944"},{t:"1945",correct:true},{t:"1946"},{t:"1943"}], exp:"A Segunda Guerra Mundial terminou em 1945."},
  { q:"Qual o maior planeta do sistema solar?", a:[{t:"Terra"},{t:"Marte"},{t:"Júpiter",correct:true},{t:"Saturno"}], exp:"Júpiter é o maior planeta em massa e volume."},
  { q:"Verdadeiro ou falso: O corpo humano possui quatro pulmões.", a:[{t:"Verdadeiro"},{t:"Falso",correct:true}], exp:"Falso — o ser humano possui dois pulmões."},
  { q:"Qual país é conhecido pela Torre Eiffel?", a:[{t:"Itália"},{t:"França",correct:true},{t:"Inglaterra"},{t:"Alemanha"}], exp:"A Torre Eiffel fica em Paris, França."},
  { q:"Quem pintou a 'Noite Estrelada'?", a:[{t:"Leonardo da Vinci"},{t:"Claude Monet"},{t:"Vincent van Gogh",correct:true},{t:"Pablo Picasso"}], exp:"'Noite Estrelada' é de Vincent van Gogh."},
  { q:"Qual o idioma oficial do Brasil?", a:[{t:"Espanhol"},{t:"Português",correct:true},{t:"Inglês"},{t:"Francês"}], exp:"O idioma oficial do Brasil é o Português."},
  { q:"Verdadeiro ou falso: A água ferve a 100°C ao nível do mar.", a:[{t:"Verdadeiro",correct:true},{t:"Falso"}], exp:"Sim — ao nível do mar, sob pressão atmosférica padrão, a água ferve a 100°C."}
];

/* ---------- Estado do quiz ---------- */
let currentQuestionIndex = 0;
let score = 0;
let correctCount = 0;
let streak = 0;
let timeLeft = TIME_PER_QUESTION;
let timer = null;
let times = []; // tempos usados por pergunta

/* Atualiza total de perguntas no UI (se existir) */
if (totalQuestionsEl) totalQuestionsEl.textContent = questions.length;

/* ---------- Event listeners (só adiciona se os elementos existirem) ---------- */
if (startBtn) startBtn.addEventListener('click', startQuiz);
if (nextBtn) nextBtn.addEventListener('click', () => { currentQuestionIndex++; setNextQuestion(); });
if (playAgainBtn) playAgainBtn.addEventListener('click', () => { closeScore(); startQuiz(); });
if (closeScoreBtn) closeScoreBtn.addEventListener('click', closeScore);
if (leaderboardBtn) leaderboardBtn.addEventListener('click', showLeaderboard);
if (clearLeaderboardBtn) clearLeaderboardBtn.addEventListener('click', () => { localStorage.removeItem('quiz_leaderboard'); renderLeaderboard(); });
if (closeLeaderboardBtn) closeLeaderboardBtn.addEventListener('click', () => { if (leaderboardSection) leaderboardSection.classList.add('hide'); });

/* permitir Enter para começar (quando focado no campo de nome) */
if (playerNameInput) {
  playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (startBtn) startBtn.click();
    }
  });
}

/* ---------- Funções principais ---------- */

function startQuiz() {
  if (!playerNameInput) return;
  const name = (playerNameInput.value || 'Jogador').trim();
  playerNameInput.value = name; // normaliza
  playerNameInput.disabled = true;
  startBtn?.classList.add('hide');

  // reset estado
  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  streak = 0;
  times = [];

  if (scoreOverlay) scoreOverlay.classList.add('hide');
  if (leaderboardSection) leaderboardSection.classList.add('hide');

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
  if (progressEl) progressEl.textContent = (currentQuestionIndex + 1);
  if (questionEl) questionEl.textContent = q.q;
  if (explanationEl) {
    explanationEl.classList.add('hide');
    explanationEl.textContent = '';
  }

  // criar botões com opções
  q.a.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'button';
    btn.textContent = opt.t;
    if (opt.correct) btn.dataset.correct = 'true';
    btn.addEventListener('click', selectAnswer);
    answerBtns?.appendChild(btn);
  });

  // inicia timer
  timeLeft = TIME_PER_QUESTION;
  if (timerEl) timerEl.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    if (timerEl) timerEl.textContent = Math.max(timeLeft, 0);
    if (timeLeft <= 0) {
      clearInterval(timer);
      // considera como timeout
      revealCorrectDueToTimeout();
      pushTime(TIME_PER_QUESTION); // tempo máximo usado
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
  // limpa botões
  while (answerBtns && answerBtns.firstChild) answerBtns.removeChild(answerBtns.firstChild);
  if (explanationEl) {
    explanationEl.classList.add('hide');
    explanationEl.textContent = '';
  }
}

function selectAnswer(e) {
  const selected = e.currentTarget;
  const isCorrect = selected.dataset.correct === 'true';

  // para timer e registra tempo
  clearInterval(timer);
  const usedTime = Math.max(0, TIME_PER_QUESTION - (timeLeft || 0));
  pushTime(usedTime);

  // calcula bônus
  const timeBonus = Math.round(((timeLeft || 0) / TIME_PER_QUESTION) * MAX_TIME_BONUS);
  const streakBonus = Math.min(streak * STREAK_BONUS_PER, STREAK_BONUS_CAP);

  if (isCorrect) {
    // aplica pontuação
    const pointsThis = BASE_POINTS + timeBonus + streakBonus;
    score += pointsThis;
    streak++;
    correctCount++;
    selected.classList.add('correct');
  } else {
    // erro reseta streak
    streak = 0;
    selected.classList.add('wrong');
    // mostra a opção correta
    Array.from(answerBtns.children).forEach(b => {
      if (b.dataset.correct === 'true') b.classList.add('correct');
      else if (b !== selected) b.classList.add('wrong');
    });
  }

  // desabilita todas as opções
  Array.from(answerBtns.children).forEach(b => b.disabled = true);

  // mostra explicação e pontuação parcial (se existir)
  const expText = questions[currentQuestionIndex].exp || '';
  if (explanationEl) {
    const extra = isCorrect ? ` (+${BASE_POINTS + timeBonus + Math.min((streak - 1) * STREAK_BONUS_PER, STREAK_BONUS_CAP)} pts)` : '';
    explanationEl.textContent = expText + extra;
    explanationEl.classList.remove('hide');
  }

  // avançar após pequeno delay
  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) {
      nextBtn?.classList.remove('hide');
    } else {
      finishQuiz();
    }
  }, 800);
}

function revealCorrectDueToTimeout() {
  // marca respostas corretas e erradas, desabilita botões
  Array.from(answerBtns.children).forEach(b => {
    if (b.dataset.correct === 'true') b.classList.add('correct');
    else b.classList.add('wrong');
    b.disabled = true;
  });
  if (explanationEl) {
    explanationEl.textContent = questions[currentQuestionIndex].exp || 'Tempo esgotado.';
    explanationEl.classList.remove('hide');
  }
  // timeout reseta streak
  streak = 0;
}

function pushTime(used) {
  // garante número e limite
  const v = Number.isFinite(used) ? Math.max(0, Math.min(used, TIME_PER_QUESTION)) : TIME_PER_QUESTION;
  times.push(v);
}

/* ---------- Final do quiz: estatísticas e leaderboard ---------- */
function finishQuiz() {
  clearInterval(timer);
  qb?.classList.add('hide');

  const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const percent = Math.round((correctCount / questions.length) * 100);

  if (finalName) finalName.textContent = (playerNameInput?.value || 'Jogador');
  if (finalScoreEl) finalScoreEl.textContent = score;
  if (finalCorrect) finalCorrect.textContent = correctCount;
  if (finalTotal) finalTotal.textContent = questions.length;
  if (finalPercent) finalPercent.textContent = percent;
  if (avgTimeEl) avgTimeEl.textContent = avg.toFixed(1);

  // mostra overlay de resultado
  scoreOverlay?.classList.remove('hide');

  // salva no leaderboard
  const entry = {
    name: playerNameInput?.value || 'Jogador',
    score,
    correct: correctCount,
    percent,
    avg: Number(avg.toFixed(1)),
    date: new Date().toISOString()
  };
  saveToLeaderboard(entry);

  // prepara para próximo jogo (não inicia automaticamente)
  currentQuestionIndex = 0;
}

/* fechar overlay de resultado */
function closeScore() {
  if (scoreOverlay) scoreOverlay.classList.add('hide');
  if (startBtn) startBtn.classList.remove('hide');
  if (playerNameInput) playerNameInput.disabled = false;
  // reset visual: show question area hidden state (user must click começar de novo)
}

/* ---------- Leaderboard: localStorage ---------- */
function getLeaderboard() {
  try {
    const raw = localStorage.getItem('quiz_leaderboard') || '[]';
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler leaderboard do localStorage', e);
    return [];
  }
}

function saveToLeaderboard(entry) {
  const list = getLeaderboard();
  list.push(entry);
  // ordenar: score desc, percent desc, avg asc (melhor avg = menor tempo médio)
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.percent !== a.percent) return b.percent - a.percent;
    return a.avg - b.avg;
  });
  const trimmed = list.slice(0, 50);
  localStorage.setItem('quiz_leaderboard', JSON.stringify(trimmed));
  renderLeaderboard();
}

function renderLeaderboard() {
  if (!leaderboardList) return;
  const list = getLeaderboard();
  leaderboardList.innerHTML = '';
  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'small';
    li.textContent = 'Sem resultados ainda — jogue para aparecer aqui!';
    leaderboardList.appendChild(li);
    return;
  }
  const top = list.slice(0, 10);
  top.forEach((row, idx) => {
    const li = document.createElement('li');
    // formata data legível
    const dateStr = new Date(row.date).toLocaleString();
    li.innerHTML = `<strong>#${idx + 1}</strong> ${escapeHtml(row.name)} — ${row.score} pts • ${row.correct}/${questions.length} • ${row.percent}% • ${dateStr}`;
    leaderboardList.appendChild(li);
  });
}

/* ---------- Helpers ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c]));
}

/* ---------- Mostrar / esconder leaderboard ---------- */
function showLeaderboard() {
  renderLeaderboard();
  if (leaderboardSection) leaderboardSection.classList.remove('hide');
}

/* inicializa leaderboard na carga (para mostrar mesmo antes de jogar) */
renderLeaderboard();

/* ---------- Extra: prevenção de reloads acidentais (opcional) ---------- */
/* Se quiser ativar, descomente abaixo para avisar o usuário se tentar fechar a guia durante o jogo */
/*
window.addEventListener('beforeunload', (e) => {
  if (!qb?.classList.contains('hide')) {
    e.preventDefault();
    e.returnValue = '';
  }
});
*/
