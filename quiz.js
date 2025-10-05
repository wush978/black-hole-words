let allUnits = {};
let words = [];
let current = 0;
let wrongWords = new Set();

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
  words = [...allUnits[unitName]]; // 複製一份
  // Fisher-Yates 洗牌
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  current = -1;
  wrongWords = new Set();
  document.getElementById('unit-selector').classList.add('hidden');
  document.getElementById('quiz-area').classList.remove('hidden');
  // 隱藏錯誤單字
  document.getElementById('wrong-words-area').classList.add('hidden');
  nextQuestion();
}

function finishUnit() {
  // 顯示錯誤單字
  const wrongArea = document.getElementById('wrong-words-area');
  const wrongList = document.getElementById('wrong-words-list');
  wrongList.innerHTML = '';
  wrongWords.forEach(word => {
    const li = document.createElement('li');
    li.textContent = `${word.en} - ${word.zh}`;
    wrongList.appendChild(li);
  });
  wrongArea.classList.remove('hidden');
  document.getElementById('quiz-area').classList.add('hidden');
  document.getElementById('unit-selector').classList.remove('hidden');
  return;
}

function nextQuestion() {
  current += 1;
  if (words.length === 0) return;
  if (current >= words.length) {
    return finishUnit();
  }
  const word = words[current];


  // 清除文字
  document.getElementById('answer').innerHTML = `<b></b>`;  
  // 出題：只顯示中文意思或播放英文語音
  const showChinese = Math.random() < 0.5;
  if (showChinese) {
    document.getElementById('question').textContent = word.zh;
  } else {
    document.getElementById('question').textContent = '「聽音」';
    speak(word.en);
  }

  document.getElementById('answer').classList.add('hidden');
  document.getElementById('show-answer-btn').classList.remove('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('mark-wrong-btn').classList.add('hidden');

  document.getElementById('replay-btn').onclick = () => {
    if (!showChinese) speak(word.en);
  };
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
  speak(word.en);
};

document.getElementById('next-btn').onclick = nextQuestion;

document.getElementById('mark-wrong-btn').onclick = () => {
  const word = words[current];
  wrongWords.add(word);
  nextQuestion();
};

loadWords();
