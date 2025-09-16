const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const scoreContainer = document.getElementById('score-container');
const scoreText = document.getElementById('score');
const totalText = document.getElementById('total');
const restartButton = document.getElementById('restart-btn');
const progressText = document.getElementById('current-question-number');
const totalQuestionsText = document.getElementById('total-questions');
const timerElement = document.getElementById('time');

let questions = [
  {
    question: "Qual é a capital da Austrália?",
    answers: [
      { text: "Sydney", correct: false },
      { text: "Melbourne", correct: false },
      { text: "Canberra", correct: true },
      { text: "Brisbane", correct: false }
    ],
    explanation: "A capital da Austrália é Canberra, que foi escolhida como um compromisso entre Sydney e Melbourne."
  },
  {
    question: "Qual elemento químico tem símbolo 'Fe'?",
    answers: [
      { text: "Ferro", correct: true },
      { text: "Flúor", correct: false },
      { text: "Fósforo", correct: false },
      { text: "Francium", correct: false }
    ],
    explanation: "Fe é o símbolo químico do Ferro no sistema periódico."
  },
  {
    question: "Quem escreveu “Dom Quixote”?",
    answers: [
      { text: "Miguel de Cervantes", correct: true },
      { text: "William Shakespeare", correct: false },
      { text: "Machado de Assis", correct: false },
      { text: "Victor Hugo", correct: false }
    ],
    explanation: "Dom Quixote foi escrito por Miguel de Cervantes, autor espanhol."
  },
  {
    question: "Em que ano terminou a Segunda Guerra Mundial?",
    answers: [
      { text: "1944", correct: false },
      { text: "1945", correct: true },
      { text: "1946", correct: false },
      { text: "1943", correct: false }
    ],
    explanation: "A Segunda Guerra Mundial terminou em 1945."
  },
  {
    question: "Qual o maior planeta do sistema solar?",
    answers: [
      { text: "Terra", correct: false },
      { text: "Marte", correct: false },
      { text: "Júpiter", correct: true },
      { text: "Saturno", correct: false }
    ],
    explanation: "Júpiter é o maior planeta em massa e volume no sistema solar."
  },
  {
    question: "Verdadeiro ou falso: O corpo humano possui quatro pulmões.",
    answers: [
      { text: "Verdadeiro", correct: false },
      { text: "Falso", correct: true }
    ],
    explanation: "É falso — o corpo humano tem dois pulmões."
  },
  {
    question: "Qual país é conhecido pela Torre Eiffel?",
    answers: [
      { text: "Itália", correct: false },
      { text: "França", correct: true },
      { text: "Inglaterra", correct: false },
      { text: "Alemanha", correct: false }
    ],
    explanation: "A Torre Eiffel está localizada em Paris, que é a capital da França."
  },
  {
    question: "Quem pintou a “Noite Estrelada”?",
    answers: [
      { text: "Leonardo da Vinci", correct: false },
      { text: "Claude Monet", correct: false },
      { text: "Vincent van Gogh", correct: true },
      { text: "Pablo Picasso", correct: false }
    ],
    explanation: "A obra 'Noite Estrelada' é de Vincent van Gogh."
  },
  {
    question: "Qual o idioma oficial do Brasil?",
    answers: [
      { text: "Espanhol", correct: false },
      { text: "Português", correct: true },
      { text: "Inglês", correct: false },
      { text: "Francês", correct: false }
    ],
    explanation: "O idioma oficial do Brasil é Português."
  },
  {
    question: "Verdadeiro ou falso: A água ferve a 100°C ao nível do mar.",
    answers: [
      { text: "Verdadeiro", correct: true },
      { text: "Falso", correct: false }
    ],
    explanation: "Sim — ao nível do mar, a água ferve a 100°C sob pressão atmosférica padrão."
  }
];

let currentQuestionIndex = 0;
let score = 0;
let timer;
const TIME_PER_QUESTION = 15; // segundos
let timeLeft = TIME_PER_QUESTION;

startButton.addEventListener('click', startQuiz);
nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  setNextQuestion();
});
restartButton.addEventListener('click', restartQuiz);

function startQuiz() {
  startButton.classList.add('hide');
  scoreContainer.classList.add('hide');
  questionContainerElement.classList.remove('hide');
  currentQuestionIndex = 0;
  score = 0;
  totalText.innerText = questions.length;
  totalQuestionsText.innerText = questions.length;
  scoreText.innerText = 0;
  setNextQuestion();
}

function setNextQuestion() {
  resetState();
  showQuestion(questions[currentQuestionIndex]);
  progressText.innerText = currentQuestionIndex + 1;
  startTimer();
}

function showQuestion(question) {
  questionElement.innerText = question.question;
  answerButtonsElement.classList.remove('fade-in');
  answerButtonsElement.classList.remove('fade-out');
  question.answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer.text;
    button.classList.add('btn');
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener('click', selectAnswer);
    answerButtonsElement.appendChild(button);
  });
}

function resetState() {
  clearStatusClass(document.body);
  nextButton.classList.add('hide');
  clearInterval(timer);
  timeLeft = TIME_PER_QUESTION;
  timerElement.innerText = timeLeft;
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild);
  }
}

function selectAnswer(e) {
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct === 'true';
  setStatusClass(selectedButton, correct);

  // mostra explicações para todas as opções
  questions[currentQuestionIndex].explanation && showExplanation(questions[currentQuestionIndex].explanation);

  Array.from(answerButtonsElement.children).forEach(button => {
    setStatusClass(button, button.dataset.correct === 'true');
    button.disabled = true;
  });
  if (correct) score++;
  scoreText.innerText = score;

  clearInterval(timer);

  // espera um pouco antes de mostrar botão próxima
  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) {
      nextButton.classList.remove('hide');
    } else {
      showScore();
    }
  }, 1000);
}

function showExplanation(text) {
  const expDiv = document.createElement('div');
  expDiv.innerText = text;
  expDiv.classList.add('explanation');
  expDiv.style.marginTop = '15px';
  expDiv.style.color = '#cccccc';
  expDiv.style.fontStyle = 'italic';
  questionContainerElement.appendChild(expDiv);
}

function showScore() {
  questionContainerElement.classList.add('hide');
  timerElement.parentElement.classList.add('hide'); // esconde timer também
  nextButton.classList.add('hide');
  scoreContainer.classList.remove('hide');
}

function restartQuiz() {
  // volta tudo ao inicio
  timerElement.parentElement.classList.remove('hide');
  scoreContainer.classList.add('hide');
  startButton.classList.remove('hide');
}

function startTimer() {
  timerElement.innerText = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerElement.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      // se tempo acabar, considerar como erro e mostrar a próxima
      Array.from(answerButtonsElement.children).forEach(button => {
        if (button.dataset.correct === 'true') {
          setStatusClass(button, true);
        }
        button.disabled = true;
      });
      questions[currentQuestionIndex].explanation && showExplanation(questions[currentQuestionIndex].explanation);
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          nextButton.classList.remove('hide');
        } else {
          showScore();
        }
      }, 1000);
    }
  }, 1000);
}

function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add('correct');
  } else {
    element.classList.add('wrong');
  }
}

function clearStatusClass(element) {
  element.classList.remove('correct');
  element.classList.remove('wrong');
}
