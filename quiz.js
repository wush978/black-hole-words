let allUnits = {};
let words = [];
let current = 0;
let wrongWords = [];

async function loadWords() {
  const res = await fetch('words.json');
  allUnits = await res.json();
  showUnitSelector();
}

function showUnitSelector() {
  const container = document.getElementById('unit-buttons');
  Object.keys(allUnits).forEach(unit => {
    const btn = document.createElement('button');
    btn.textContent = unit;
    btn.className = "bg-white border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-100";
    btn.onclick = () => startUnit(unit);
    container.appendChild(btn);
  });
}

function startUnit(unitName) {
  words = allUnits[unitName];
  current = 0;
  wrongWords = [];
  document.getElementById('unit-selector').classList.add('hidden');
  document.getElementById('quiz-area').classList.remove('hidden');
  nextQuestion();
}

function nextQuestion() {
  if (words.length === 0) return;
  const randomIndex = Math.floor(Math.random() * words.length);
  const word = words[randomIndex];
  current = randomIndex;

  // 出題：只顯示中文意思 + 播放英文語音
  document.getElementById('question').textContent = word.zh;
  speak(word.en);

  document.getElementById('answer').classList.add('hidden');
  document.getElementById('show-answer-btn').classList.remove('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('mark-wrong-btn').classList.add('hidden');

  document.getElementById('replay-btn').onclick = () => speak(word.en);
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  // 若系統支援 Google US English 可選用較自然的聲音
  const voices = speechSynthesis.getVoices();
  const googleVoice = voices.find(v => v.name.includes('Google US English'));
  if (googleVoice) utter.voice = googleVoice;
  speechSynthesis.speak(utter);
}

document.getElementById('show-answer-btn').onclick = () => {
  const word = words[current];
  document.getElementById('answer').innerHTML = `<b>${word.en}</b> - ${word.zh}`;
  document.getElementById('answer').classList.remove('hidden');
  document.getElementById('show-answer-btn').classList.add('hidden');
  document.getElementById('next-btn').classList.remove('hidden');
  document.getElementById('mark-wrong-btn').classList.remove('hidden');
};

document.getElementById('next-btn').onclick = nextQuestion;

document.getElementById('mark-wrong-btn').onclick = () => {
  const word = words[current];
  wrongWords.push(word);
  alert(`已紀錄錯誤：${word.en}`);
  nextQuestion();
};

loadWords();
