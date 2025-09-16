/* Quiz avançado: timer, pontos (base + tempo + streak), leaderboard (localStorage), analytics */
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

nextBtn.addEventListener('click', ()=>{ currentQuestionIndex++; setNextQuestion(); });
startBtn.addEventListener('click', startQuiz);
playAgainBtn.addEventListener('click', ()=> { closeScore(); startQuiz(); });
closeScoreBtn.addEventListener('click', closeScore);

leaderboardBtn.addEventListener('click', showLeaderboard);
closeLeaderboardBtn.addEventListener('click', ()=> leaderboardSection.classList.add('hide'));
clearLeaderboardBtn.addEventListener('click', () => { localStorage.removeItem('quiz_leaderboard'); renderLeaderboard(); });

/* QUESTIONS (10 perguntas) */
const questions = [
  { q:"Qual é a capital da Austrália?", a:[{t:"Sydney"},{t:"Melbourne"},{t:"Canberra",correct:true},{t:"Brisbane"}], exp:"Canberra foi criada como capital como um compromisso entre Sydney e Melbourne."},
  { q:"Qual elemento químico tem símbolo 'Fe'?", a:[{t:"Ferro",correct:true},{t:"Flúor"},{t:"Fósforo"},{t:"Francium"}], exp:"Fe = Ferrum (latim) → Ferro."},
  { q:"Quem escreveu 'Dom Quixote'?", a:[{t:"Miguel de Cervantes",correct:true},{t:"William Shakespeare"},{t:"Machado de Assis"},{t:"Victor Hugo"}], exp:"Autor espanhol Miguel de Cervantes."},
  { q:"Em que ano terminou a Segunda Guerra Mundial?", a:[{t:"1944"},{t:"1945",correct:true},{t:"1946"},{t:"1943"}], exp:"A guerra terminou em 1945."},
  { q:"Qual o maior planeta do sistema solar?", a:[{t:"Terra"},{t:"Marte"},{t:"Júpiter",correct:true},{t:"Saturno"}], exp:"Júpiter é o maior em massa e volume."},
  { q:"Verdadeiro ou falso: O corpo humano possui quatro pulmões.", a:[{t:"Verdadeiro"},{t:"Falso",correct:true}], exp:"Falso — o ser humano tem dois pulmões."},
  { q:"Qual país é conhecido pela Torre Eiffel?", a:[{t:"Itália"},{t:"França",correct:true},{t:"Inglaterra"},{t:"Alemanha"}], exp:"A Torre Eiffel está em Paris, França."},
  { q:"Quem pintou a 'Noite Estrelada'?", a:[{t:"Leonardo da Vinci"},{t:"Claude Monet"},{t:"Vincent van Gogh",correct:true},{t:"Pablo Picasso"}], exp:"Van Gogh pintou 'Noite Estrelada'."},
  { q:"Qual o idioma oficial do Brasil?", a:[{t:"Espanhol"},{t:"Português",correct:true},{t:"Inglês"},{t:"Francês"}], exp:"Português é o idioma oficial."},
  { q:"Verdadeiro ou falso: A água ferve a 100°C ao nível do mar.", a:[{t:"Verdadeiro",correct:true},{t:"Falso"}], exp:"Sim, sob pressão atmosférica padrão ao nível do mar."}
];

/* Configuráveis */
const TIME_PER_QUESTION = 15;       // segundos
const BASE_POINTS = 100;           // pontos por acerto base
const MAX_TIME_BONUS = 50;         // bônus máximo por tempo (0..MAX_TIME_BONUS)
const STREAK_BONUS_PER = 10;      // bônus por acerto em sequência por nível
const STREAK_BONUS_CAP = 50;      // teto do bônus por streak

/* Estado */
let currentQuestionIndex = 0;
let score = 0;
let correctCount = 0;
let streak = 0;
let timeLeft = TIME_PER_QUESTION;
let timer = null;
let times = []; // array de tempos usados por pergunta

totalQuestionsEl.textContent = questions.length;

/* START */
function startQuiz(){
  const name = (playerNameInput.value || 'Jogador').trim();
  playerNameInput.value = name; // normalize
  // reset state
  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  streak = 0;
  times = [];
  startBtn.classList.add('hide');
  playerNameInput.disabled = true;
  qb.classList.remove('hide');
  setNextQuestion();
}

/* NEXT QUESTION */
function setNextQuestion(){
  clearState();
  if(currentQuestionIndex >= questions.length){
    finishQuiz();
    return;
  }
  progressEl.textContent = currentQuestionIndex + 1;
  const q = questions[currentQuestionIndex];
  questionEl.textContent = q.q;
  explanationEl.classList.add('hide');
  // generate buttons
  q.a.forEach(opt=>{
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = opt.t;
    if(opt.correct) btn.dataset.correct = 'true';
    btn.addEventListener('click', selectAnswer);
    answerBtns.appendChild(btn);
  });
  // timer
  timeLeft = TIME_PER_QUESTION;
  timerEl.textContent = timeLeft;
  timer = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = timeLeft;
    if(timeLeft <= 0){
      clearInterval(timer);
      // mark correct answers visually and show explanation
      revealCorrectDueToTimeout();
      pushTime(TIME_PER_QUESTION); // user used full time
      setTimeout(() => {
        // allow next
        if(currentQuestionIndex < questions.length - 1) nextBtn.classList.remove('hide');
        else finishQuiz();
      }, 900);
    }
  },1000);
}

/* clear UI between Qs */
function clearState(){
  clearInterval(timer);
  nextBtn.classList.add('hide');
  while(answerBtns.firstChild) answerBtns.removeChild(answerBtns.firstChild);
  explanationEl.textContent = '';
  explanationEl.classList.add('hide');
}

/* when user selects an answer */
function selectAnswer(e){
  const selected = e.currentTarget;
  const isCorrect = selected.dataset.correct === 'true';
  // compute points BEFORE disabling
  clearInterval(timer);
  const usedTime = (TIME_PER_QUESTION - timeLeft);
  pushTime(usedTime);

  // scoring: base + timeBonus + streakBonus
  let timeBonus = Math.round((timeLeft / TIME_PER_QUESTION) * MAX_TIME_BONUS); // proportional
  let streakBonus = Math.min(streak * STREAK_BONUS_PER, STREAK_BONUS_CAP);
  if(isCorrect){
    streak++;
    correctCount++;
    const pointsThis = BASE_POINTS + timeBonus + streakBonus;
    score += pointsThis;
    selected.classList.add('correct');
  } else {
    // reset streak on wrong answer
    streak = 0;
    selected.classList.add('wrong');
    // highlight correct option
    Array.from(answerBtns.children).forEach(b=>{ if(b.dataset.correct==='true') b.classList.add('correct'); });
  }

  // disable buttons
  Array.from(answerBtns.children).forEach(b=> b.disabled = true);

  // show explanation (if exists)
  const exp = questions[currentQuestionIndex].exp || '';
  if(exp){
    explanationEl.textContent = exp + ` (+${isCorrect ? (BASE_POINTS + timeBonus + Math.min((streak-1)*STREAK_BONUS_PER,STREAK_BONUS_CAP)) : 0} pts)`;
    explanationEl.classList.remove('hide');
  }

  // show next or finish after small delay
  setTimeout(()=> {
    if(currentQuestionIndex < questions.length - 1){
      nextBtn.classList.remove('hide');
    } else {
      finishQuiz();
    }
  },800);
}

/* If time ends - reveal correct answer */
function revealCorrectDueToTimeout(){
  Array.from(answerBtns.children).forEach(b => {
    if(b.dataset.correct === 'true') b.classList.add('correct');
    else b.classList.add('wrong');
    b.disabled = true;
  });
  explanationEl.textContent = questions[currentQuestionIndex].exp || '';
  explanationEl.classList.remove('hide');
  streak = 0; // reset streak on timeout
}

/* push time used to array for analytics */
function pushTime(used){
  times.push(used);
}

/* Finish quiz - show overlay and save to leaderboard */
function finishQuiz(){
  clearInterval(timer);
  qb.classList.add('hide');
  // compute average time
  const avg = times.length ? (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1) : 0;
  const percent = Math.round((correctCount / questions.length) * 100);
  // fill overlay
  finalName.textContent = playerNameInput.value || 'Jogador';
  finalScoreEl.textContent = score;
  finalCorrect.textContent = correctCount;
  finalTotal.textContent = questions.length;
  finalPercent.textContent = percent;
  avgTimeEl.textContent = avg;
  scoreOverlay.classList.remove('hide');

  // persist to leaderboard
  saveToLeaderboard({ name: playerNameInput.value || 'Jogador', score, correct: correctCount, percent, avg: Number(avg), date: new Date().toISOString() });

  currentQuestionIndex = 0; // reset index to allow replay if chosen
}

/* Close score overlay */
function closeScore(){
  scoreOverlay.classList.add('hide');
  startBtn.classList.remove('hide');
  playerNameInput.disabled = false;
}

/* LEADERBOARD (localStorage) */
function getLeaderboard(){
  try{
    const raw = localStorage.getItem('quiz_leaderboard') || '[]';
    return JSON.parse(raw);
  }catch(e){ return []; }
}
function saveToLeaderboard(entry){
  const list = getLeaderboard();
  list.push(entry);
  // sort by score desc, then percent desc, then avg asc
  list.sort((a,b)=> b.score - a.score || b.percent - a.percent || a.avg - b.avg);
  // keep top 50 to avoid bloat
  const trimmed = list.slice(0,50);
  localStorage.setItem('quiz_leaderboard', JSON.stringify(trimmed));
  renderLeaderboard();
}
function renderLeaderboard(){
  const list = getLeaderboard();
  leaderboardList.innerHTML = '';
  if(!list.length){
    leaderboardList.innerHTML = '<li class="small">Sem resultados ainda — jogue para aparecer aqui!</li>';
    return;
  }
  const top = list.slice(0,10);
  top.forEach((row, idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>#${idx+1}</strong> ${escapeHtml(row.name)} — ${row.score} pts • ${row.correct}/${questions.length} • ${row.percent}% • ${new Date(row.date).toLocaleString()}`;
    leaderboardList.appendChild(li);
  });
}

/* small escaping helper */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[c])); }

/* Show leaderboard overlay */
function showLeaderboard(){
  renderLeaderboard();
  leaderboardSection.classList.remove('hide');
}

/* navigation: when next pressed */
nextBtn.addEventListener('click', ()=>{
  currentQuestionIndex++;
  // remove any explanation node text (already done in setNextQuestion)
  setNextQuestion();
});

/* init: render leaderboard on load (so user can open i:contentReference[oaicite:1]{index=1}:contentReference[oaicite:2]{index=2}*
