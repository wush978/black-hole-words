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

function startQuiz(words) {
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
  document.getElementById('congrat-all-correct').classList.add('hidden');
  nextQuestion();
}

function startUnit(unitName) {
  words = [...allUnits[unitName]]; // 複製一份
  startQuiz(words);
}

function reviewWrongWords() {
  if (wrongWords.size === 0) return;
  words = Array.from(wrongWords);
  startQuiz(words);
}

function showFirework() {
  const container = document.getElementById('firework-animation');
  container.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const fw = document.createElement('div');
    fw.className = 'firework';
    fw.style.left = Math.random() * 90 + '%';
    fw.style.top = Math.random() * 60 + '%';
    container.appendChild(fw);
  }
  setTimeout(() => { container.innerHTML = ''; }, 2000);
}

function finishUnit() {
  // 顯示錯誤單字
  const wrongArea = document.getElementById('wrong-words-area');
  const wrongList = document.getElementById('wrong-words-list');
  const congratAllCorrect = document.getElementById('congrat-all-correct');
  wrongList.innerHTML = '';
  if (wrongWords.size === 0) {
    // 全部答對
    congratAllCorrect.classList.remove('hidden');
    wrongArea.classList.add('hidden');
    document.getElementById('firework-audio').play();
    showFirework();
  } else {
    // 有答錯
    wrongWords.forEach(word => {
      const li = document.createElement('li');
      li.textContent = `${word.en} - ${word.zh}`;
      wrongList.appendChild(li);
    });
    document.getElementById('review-wrong-btn').onclick = reviewWrongWords;
    congratAllCorrect.classList.add('hidden');
    wrongArea.classList.remove('hidden');
  }
  document.getElementById('quiz-area').classList.add('hidden');
  document.getElementById('unit-selector').classList.remove('hidden');
  return;
}

function updateQuestionUI(showChinese, word) {
  const questionEl = document.getElementById('question');
  const replayBtn = document.getElementById('replay-btn');
  if (showChinese) {
    questionEl.classList.remove('hidden');
    questionEl.textContent = word.zh;
    replayBtn.classList.add('hidden');
  } else {
    questionEl.classList.add('hidden');
    questionEl.textContent = '';
    replayBtn.classList.remove('hidden');
    speak(word.en);
  }
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
  updateQuestionUI(showChinese, word);

  document.getElementById('answer').classList.add('hidden');
  document.getElementById('show-answer-btn').classList.remove('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('mark-wrong-btn').classList.add('hidden');

  document.getElementById('replay-btn').onclick = () => {
    if (!showChinese) speak(word.en);
  };
}

function speakBySpeechSynthesis(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  const voices = speechSynthesis.getVoices();
  let selectedVoice = voices.find(v => v.name.includes('Google US English'));
  if (!selectedVoice && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    selectedVoice = voices.find(v => v.lang === 'en-US' && v.localService);
  }
  if (selectedVoice) utter.voice = selectedVoice;
  speechSynthesis.speak(utter);
}

function speak(text) {
  // 檢查 mp3/text.mp3 是否存在
  fetch(`mp3/${text}.mp3`, { method: 'HEAD' })
    .then(res => {
      if (res.ok) {
        // 存在 mp3 檔案，播放音檔
        const audio = new Audio(`mp3/${text}.mp3`);
        audio.play();
      } else {
        // 不存在，使用語音合成
        speakBySpeechSynthesis(text);
      }
    })
    .catch(() => {
      // 發生錯誤時也使用語音合成
      speakBySpeechSynthesis(text);
    });
}

document.getElementById('show-answer-btn').onclick = () => {
  const word = words[current];
  document.getElementById('answer').innerHTML = `<b>${word.en}</b> - ${word.zh}`;
  document.getElementById('answer').classList.remove('hidden');
  document.getElementById('show-answer-btn').classList.add('hidden');
  document.getElementById('next-btn').classList.remove('hidden');
  document.getElementById('mark-wrong-btn').classList.remove('hidden');
  speak(word.en);

  // 加入重聽聲音按鈕
  let replayAnswerBtn = document.getElementById('replay-answer-btn');
  if (!replayAnswerBtn) {
    replayAnswerBtn = document.createElement('button');
    replayAnswerBtn.id = 'replay-answer-btn';
    replayAnswerBtn.className = 'bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg mt-3 ml-2';
    replayAnswerBtn.textContent = '🔁 重聽單字';
    replayAnswerBtn.onclick = () => speak(word.en);
    document.getElementById('answer').appendChild(replayAnswerBtn);
  } else {
    replayAnswerBtn.onclick = () => speak(word.en);
    replayAnswerBtn.classList.remove('hidden');
  }
};

document.getElementById('next-btn').onclick = nextQuestion;

document.getElementById('mark-wrong-btn').onclick = () => {
  const word = words[current];
  wrongWords.add(word);

  // 顯示答案
  document.getElementById('answer').innerHTML = `<b>${word.en}</b> - ${word.zh}`;
  document.getElementById('answer').classList.remove('hidden');
  document.getElementById('show-answer-btn').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('mark-wrong-btn').classList.add('hidden');

  // 插入提示要背誦三遍
  let memorizeTip = document.getElementById('memorize-tip');
  if (!memorizeTip) {
    memorizeTip = document.createElement('div');
    memorizeTip.id = 'memorize-tip';
    memorizeTip.className = 'text-red-600 text-lg font-bold mt-4';
    document.getElementById('quiz-area').appendChild(memorizeTip);
  }
  memorizeTip.textContent = '請大聲背誦這個單字三遍！';

  // 插入重聽單字按鈕
  let replayMemorizeBtn = document.getElementById('replay-memorize-btn');
  if (!replayMemorizeBtn) {
    replayMemorizeBtn = document.createElement('button');
    replayMemorizeBtn.id = 'replay-memorize-btn';
    replayMemorizeBtn.className = 'bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg mt-3 ml-2';
    replayMemorizeBtn.textContent = '🔁 重聽單字';
    replayMemorizeBtn.onclick = () => speak(word.en);
    memorizeTip.appendChild(replayMemorizeBtn);
  } else {
    replayMemorizeBtn.onclick = () => speak(word.en);
    replayMemorizeBtn.classList.remove('hidden');
  }

  // 插入「我已經背誦三遍」按鈕
  let memorizeBtn = document.getElementById('memorize-next-btn');
  if (!memorizeBtn) {
    memorizeBtn = document.createElement('button');
    memorizeBtn.id = 'memorize-next-btn';
    memorizeBtn.className = 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mt-4';
    memorizeBtn.textContent = '我已經背誦三遍，進入下一題';
    memorizeBtn.onclick = () => {
      memorizeTip.textContent = '';
      memorizeBtn.remove();
      replayMemorizeBtn.remove();
      nextQuestion();
    };
    document.getElementById('quiz-area').appendChild(memorizeBtn);
  } else {
    memorizeBtn.classList.remove('hidden');
  }
};

loadWords();
