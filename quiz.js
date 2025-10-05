let words = [];
let currentWord = null;
let wrongWords = [];

fetch('words.json')
  .then(res => res.json())
  .then(data => {
    words = data;
    nextQuestion();
  });

function getRandomWord() {
  const index = Math.floor(Math.random() * words.length);
  const word = words[index];
  const showChinese = Math.random() < 0.5;
  return { ...word, showChinese };
}

// 播放英文語音
function speakWord(word) {
  if (!word) return;

  // ✅ 若你想改用 ResponsiveVoice
  if (window.responsiveVoice) {
    responsiveVoice.speak(word, "US English Female");
  } else {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }
}

function showQuestion(wordObj) {
  currentWord = wordObj;
  const qDiv = document.getElementById('question');
  const aDiv = document.getElementById('answer');
  const repeatBtn = document.getElementById('repeatBtn');
  aDiv.innerText = '';

  if (wordObj.showChinese) {
    qDiv.innerText = wordObj.zh;
    repeatBtn.style.display = 'none';
  } else {
    qDiv.innerText = "🔊 聽音辨字";
    repeatBtn.style.display = 'inline-block';
    speakWord(wordObj.en);
  }
}

function revealAnswer() {
  if (!currentWord) return;
  document.getElementById('answer').innerText = `${currentWord.en} - ${currentWord.zh}`;
  speakWord(currentWord.en);
}

function nextQuestion() {
  const wordObj = getRandomWord();
  showQuestion(wordObj);
}

function recordWrongWord() {
  if (!currentWord) return;
  if (!wrongWords.some(w => w.en === currentWord.en)) {
    wrongWords.push({ en: currentWord.en, zh: currentWord.zh });
    alert(`已紀錄錯誤單字: ${currentWord.en} - ${currentWord.zh}`);
  } else {
    alert(`單字已在錯誤清單中: ${currentWord.en}`);
  }
  console.log('錯誤單字清單:', wrongWords);
}

// 綁定按鈕事件
document.getElementById('checkBtn').addEventListener('click', revealAnswer);
document.getElementById('nextBtn').addEventListener('click', nextQuestion);
document.getElementById('wrongBtn').addEventListener('click', recordWrongWord);
document.getElementById('repeatBtn').addEventListener('click', () => {
  if (currentWord && !currentWord.showChinese) speakWord(currentWord.en);
});
