// 単語データ
let WORDS = [];
 
// 出題範囲
const WORD_RANGES = [
  { label: "1〜100", start: 1, end: 100 },
  { label: "101〜200", start: 101, end: 200 },
  { label: "201〜300", start: 201, end: 300 },
  { label: "301〜400", start: 301, end: 400 },
  { label: "401〜500", start: 401, end: 500 },
  { label: "501〜600", start: 501, end: 600 },
  { label: "601〜700", start: 601, end: 700 },
  { label: "701〜800", start: 701, end: 800 },
  { label: "801〜900", start: 801, end: 900 },
  { label: "901〜1000", start: 901, end: 1000 },
  { label: "1001〜1100", start: 1001, end: 1100 },
  { label: "1101〜1200", start: 1101, end: 1200 },
  { label: "1201〜1300", start: 1201, end: 1300 },
  { label: "1301〜1400", start: 1301, end: 1400 },
  { label: "1401〜1500", start: 1401, end: 1500 },
  { label: "1501〜1600", start: 1501, end: 1600 },
  { label: "1601〜1700", start: 1601, end: 1700 },
  { label: "1701〜1800", start: 1701, end: 1800 },
  { label: "1801〜1900", start: 1801, end: 1900 },
  { label: "1901〜2027", start: 1901, end: 2027 }
]

// 状態管理
let selectedRange = { start: 1, end: 100 }
let quizWords = []
let wrongWords = []
let currentIndex = 0
let score = 0
let quizCount = 10
let allWords = []       // 全単語
let currentPage = 1;
const WORDS_PER_PAGE = 100
let currentAnswer = ""



// 初期化
document.addEventListener("DOMContentLoaded", async () => {
  await loadWords()

  initRangeButtons()
  updateWrongCount()

  // document.getElementById("quiz-input").addEventListener("keypress", (e) => {
  //   if (e.key === "Enter") {
  //     checkAnswer()
  //   }
  // })
})

async function loadWords() {
  try {
    const files = [
      "words_001_300.json",
      "words_301_600.json",
      "words_601_900.json",
      "words_901_1200.json",
      "words_1201_1500.json",
      "words_1501_1800.json",
      "words_1801_2027.json",
    ]

    const responses = await Promise.all(
      files.map((file) => fetch(file))
    )

    const jsonArrays = await Promise.all(
      responses.map((res) => {
        if (!res.ok) throw new Error(`${res.url} の読み込みに失敗`)
        return res.json()
      })
    )

    // すべて結合して WORDS に代入（← 変数名はそのまま）
    WORDS = jsonArrays.flat()
    console.log("単語数:", WORDS.length); 
  } catch (error) {
    console.error("単語データの読み込みに失敗しました", error)
    alert("単語データを読み込めませんでした")
  }
}


// 画面切り替え
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active")
  })
  document.getElementById(screenId).classList.add("active")

  if (screenId === "word-list") {
    currentPage = 1
    renderWordList()
  }

  if (screenId === "wrong-list") {
    renderWrongList()
  }
}


// 範囲ボタンの初期化
function initRangeButtons() {
  const container = document.getElementById("range-buttons")
  container.innerHTML = WORD_RANGES.map(
    (range) => `
    <button class="btn btn-secondary btn-range" onclick="selectRange(${range.start}, ${range.end})">
      ${range.label}
    </button>
  `,
  ).join("")
}

// 範囲選択
function selectRange(start, end) {
  selectedRange = { start, end }
  document.getElementById("selected-range-info").textContent = `出題範囲: ${start}〜${end}`
  showScreen("mode-select")
}

// クイズ開始
function startQuiz(count) {
  const rangeWords = WORDS.filter((w) => w.id >= selectedRange.start && w.id <= selectedRange.end)
  quizWords = shuffleArray(rangeWords).slice(0, Math.min(count, rangeWords.length))
  quizCount = quizWords.length
  currentIndex = 0
  score = 0
  wrongWords = []

  showScreen("quiz-screen")
  showQuestion()
}

// 問題表示
function showQuestion() {
  if (currentIndex >= quizWords.length) {
    showResult()
    return
  }

  const word = quizWords[currentIndex]
  document.getElementById("quiz-question").textContent = word.jp
  // document.getElementById("quiz-input").value = ""
  // document.getElementById("quiz-input").focus()
  document.getElementById("quiz-current").textContent = currentIndex + 1
  document.getElementById("quiz-total").textContent = quizWords.length
  document.getElementById("quiz-score").textContent = score

  renderAnswerSlots(word.en.length)

  // プログレスバー更新
  const progress = (currentIndex / quizWords.length) * 100
  document.getElementById("progress-fill").style.width = `${progress}%`

  // フィードバック非表示
  document.querySelector(".quiz-content").classList.remove("hidden")
  document.getElementById("quiz-feedback").classList.remove("show")
  
  currentAnswer = ""
  renderAnswerSlots(word.en.length)
  updateAnswerDisplay()
}



document.getElementById("keyboard").addEventListener("click", (e) => {
  if (!e.target.classList.contains("key")) return

  const action = e.target.dataset.action
  const char = e.target.textContent
  const answerLength = quizWords[currentIndex].en.length

  if (action === "delete") {
    currentAnswer = currentAnswer.slice(0, -1)
  } else if (action === "enter") {
    checkAnswer()
    return
  } else {
    if (currentAnswer.length < answerLength) {
      currentAnswer += char
    }
  }

  updateAnswerDisplay()
})

function updateAnswerDisplay() {
  const chars = document.querySelectorAll(".answer-char")
  chars.forEach((span, i) => {
    span.textContent = currentAnswer[i] || ""
  })
}

function renderAnswerSlots(length) {
  const container = document.getElementById("answer-display")
  container.innerHTML = ""

  for (let i = 0; i < length; i++) {
    const span = document.createElement("span")
    span.className = "answer-char"
    span.textContent = ""
    container.appendChild(span)
  }
}

// document.getElementById("quiz-input").addEventListener("input", () => {
//   const inputValue = document.getElementById("quiz-input").value
//   const chars = document.querySelectorAll(".answer-char")

//   chars.forEach((span, i) => {
//   span.textContent = inputValue[i]
//     ? inputValue[i].toLowerCase()
//     : ""
//   })  
// })

// document.body.addEventListener("click", () => {
//   document.getElementById("quiz-input").focus()
// })

// function checkAnswer() {
//   // const input = document.getElementById("quiz-input").value.trim().toLowerCase()
//   const word = quizWords[currentIndex]

//   const isCorrect = input === word.en.toLowerCase()

//   if (isCorrect) {
//     score++
//   } else {
//     wrongWords.push(word)
//   }

//   showFeedback(isCorrect, word)
// }

// 回答チェック
function checkAnswer() {
  const word = quizWords[currentIndex]
  const isCorrect = currentAnswer === word.en.toLowerCase()
  lastUserAnswer = currentAnswer

  if (isCorrect) {
    score++
  } else {
    wrongWords.push(word)
  }

  showFeedback(isCorrect, word)
}


// フィードバック表示
function showFeedback(isCorrect, word) {
  document.querySelector(".quiz-content").classList.add("hidden")
  const feedback = document.getElementById("quiz-feedback")
  feedback.classList.add("show")

  const icon = document.getElementById("feedback-icon")
  icon.className = "feedback-icon " + (isCorrect ? "correct" : "wrong")
  icon.innerHTML = isCorrect
    ? '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>'

  document.getElementById("feedback-text").textContent = isCorrect ? "正解!" : "不正解..."
  document.getElementById("feedback-answer").innerHTML = `
  あなたの回答: <strong>${lastUserAnswer || "（未入力）"}</strong><br>正解: <strong>${word.en}</strong>`
  document.getElementById("quiz-score").textContent = score
}

// 次の問題
function nextQuestion() {
  currentIndex++

  if (currentIndex >= quizWords.length) {
    showResult()
  } else {
    showQuestion()
  }
}

// 結果表示
function showResult() {
  showScreen("result-screen")

  const percent = Math.round((score / quizCount) * 100)
  document.getElementById("result-percent").textContent = `${percent}%`
  document.getElementById("result-correct").textContent = score
  document.getElementById("result-total").textContent = quizCount

  // スコアに応じた色
  const circle = document.getElementById("result-circle")
  circle.className = "result-circle"
  if (percent >= 80) {
    circle.classList.add("excellent")
  } else if (percent >= 50) {
    circle.classList.add("good")
  } else {
    circle.classList.add("poor")
  }

  // 間違えた単語表示
  const wrongSection = document.getElementById("wrong-words-section")
  const retryWrongBtn = document.getElementById("retry-wrong-btn")

  if (wrongWords.length > 0) {
    wrongSection.style.display = "block"
    retryWrongBtn.style.display = "flex"

    document.getElementById("result-wrong-list").innerHTML = wrongWords
      .map(
        (word) => `
      <div class="wrong-word-item">
        <span class="wrong-word-jp">${word.jp}</span>
        <span class="wrong-word-en">${word.en}</span>
      </div>
    `,
      )
      .join("")
  } else {
    wrongSection.style.display = "none"
    retryWrongBtn.style.display = "none"
  }

  updateWrongCount()
}

// もう一度
function retryQuiz() {
  startQuiz(quizCount)
}

// 間違えた単語を復習
function retryWrongWords() {
  if (wrongWords.length === 0) return
  quizWords = shuffleArray([...wrongWords])
  quizCount = quizWords.length
  currentIndex = 0
  score = 0
  wrongWords = []

  showScreen("quiz-screen")
  showQuestion()
}

// 終了確認
function confirmExit() {
  if (confirm("クイズを終了しますか？")) {
    showScreen("title-screen")
  }
}

// 単語一覧表示
// function renderWordList() {
//   const container = document.getElementById("words-container")
//   container.innerHTML = WORDS.map(
//     (word) => `
//     <div class="word-item">
//       <span class="word-id">${word.id}</span>
//       <span class="word-jp">${word.jp}</span>
//       <span class="word-en">${word.en}</span>
//     </div>
//   `,
//   ).join("")
// }

function renderWordList() {
  if (WORDS.length === 0) return;

  const container = document.getElementById("words-container");
  container.innerHTML = "";

  const start = (currentPage - 1) * WORDS_PER_PAGE;
  const end = start + WORDS_PER_PAGE;
  const pageWords = WORDS.slice(start, end);

  pageWords.forEach(word => {
    const div = document.createElement("div");
    div.className = "word-item";
    div.innerHTML = `
      <span class="word-id">${word.id}</span>
      <span class="word-jp">${word.jp}</span>
      <span class="word-en">${word.en}</span>
    `;
    container.appendChild(div);
  });

  updatePagination();
}



function updatePagination() {
  const pageInfo = document.getElementById("page-info");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (!pageInfo || WORDS.length === 0) return;

  const totalPages = Math.ceil(WORDS.length / WORDS_PER_PAGE);

  pageInfo.textContent = `${currentPage} / ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}




document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderWordList();
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  const totalPages = Math.ceil(WORDS.length / WORDS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderWordList();
  }
});

// 単語フィルター
function filterWords() {
  const query = document.getElementById("search-input").value.toLowerCase()
  const container = document.getElementById("words-container")

  const filtered = WORDS.filter(
    (word) => word.jp.toLowerCase().includes(query) || word.en.toLowerCase().includes(query),
  )

  container.innerHTML = filtered
    .map(
      (word) => `
    <div class="word-item">
      <span class="word-id">${word.id}</span>
      <span class="word-jp">${word.jp}</span>
      <span class="word-en">${word.en}</span>
    </div>
  `,
    )
    .join("")
}

// 間違えた単語一覧表示
function renderWrongList() {
  const container = document.getElementById("wrong-words-container")
  const emptyState = document.getElementById("wrong-empty")
  const practiceBtn = document.getElementById("practice-wrong-btn")

  if (wrongWords.length === 0) {
    emptyState.style.display = "block"
    container.style.display = "none"
    practiceBtn.style.display = "none"
  } else {
    emptyState.style.display = "none"
    container.style.display = "flex"
    practiceBtn.style.display = "block"

    container.innerHTML = wrongWords
      .map(
        (word) => `
      <div class="word-item">
        <span class="word-id">${word.id}</span>
        <span class="word-jp">${word.jp}</span>
        <span class="word-en">${word.en}</span>
      </div>
    `,
      )
      .join("")
  }
}

// 間違えた単語を練習
function practiceWrongWords() {
  retryWrongWords()
}

// 間違えた単語カウント更新
function updateWrongCount() {
  document.getElementById("wrong-count").textContent = wrongWords.length
}

// シャッフル関数
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
