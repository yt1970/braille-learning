// ─── 定数 ───────────────────────────────────────────────────────────────
const CORRECT_MSGS  = ['すごい！', 'やったね！', '完璧！', 'さすが！', 'その調子！', 'ばっちり！'];
const CORRECT_MASCOTS = ['🐱','🐶','🐰','🦊','🐻','🐼','🐨','🐸','🦁','🐯'];
const WRONG_MSGS    = ['惜しい！', 'もう一度！', '次は大丈夫！', 'ファイト！', '諦めないで！'];
const WRONG_MASCOTS = ['😢','😿','🥺','😖','💦'];

// ─── 状態 ────────────────────────────────────────────────────────────────
let mode = 'seion', deck = [], idx = 0, right = 0, wrong = 0, retryDeck = [], answered = false;

// ─── 初期化 ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });
  document.getElementById('answer-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (!answered) checkAnswer();
      else nextCard();
    }
  });
  switchMode('seion');
});

// ─── モード切替 ──────────────────────────────────────────────────────────
function switchMode(m) {
  mode = m;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === m));
  restart(false);
}

// ─── デッキ構築 ──────────────────────────────────────────────────────────
function buildDeck() {
  if (mode === 'seion')    return Object.keys(SEION).map(k => ({type:'seion', key:k}));
  if (mode === 'dakuten')  return Object.keys(DAKUON).map(k => ({type:'daku', key:k}));
  if (mode === 'handaku')  return Object.keys(HANDAKUON).map(k => ({type:'handaku', key:k}));
  if (mode === 'special')  return SPECIAL_ITEMS.map(s => ({type:'special', key:s.key, cells:s.cells, desc:s.desc}));
  return WORDS.map(w => ({type:'word', text:w.text, meaning:w.meaning}));
}

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// ─── 点字レンダリング ──────────────────────────────────────────────────
function renderDot(grid, container, isPrefix = false) {
  const cell = document.createElement('div');
  cell.className = 'braille-cell';
  grid.flat().forEach(v => {
    const d = document.createElement('div');
    d.className = 'dot ' + (v ? (isPrefix ? 'prefix' : 'on') : 'off');
    cell.appendChild(d);
  });
  container.appendChild(cell);
}

function renderBraille(container, cells, prefix = null) {
  container.innerHTML = '';
  if (prefix) renderDot(prefix.grid, container, true);
  cells.forEach(g => renderDot(g, container, false));
}

function renderWordBraille(container, text) {
  container.innerHTML = '';
  [...text].forEach(ch => { if (SEION[ch]) renderDot(SEION[ch], container, false); });
}

// ─── カード描画 ──────────────────────────────────────────────────────────
function renderCard() {
  if (idx >= deck.length) { showResult(); return; }
  const item = deck[idx];
  answered = false;

  // プログレス・統計更新
  const pct = Math.round(idx / deck.length * 100);
  document.getElementById('prog').style.width = pct + '%';
  document.getElementById('stat-cur').textContent = idx + 1;
  document.getElementById('stat-right').textContent = right;
  document.getElementById('stat-wrong').textContent = wrong;

  // フィードバック非表示
  hideFeedback();
  document.getElementById('btn-next-row').style.display = 'none';
  document.getElementById('input-area').style.display = '';

  // 入力リセット
  const inp = document.getElementById('answer-input');
  inp.value = '';
  inp.disabled = false;
  inp.className = 'answer-input';
  inp.placeholder = '答えを入力（例: ア）';
  inp.focus();

  const braille = document.getElementById('braille-display');
  const sub     = document.getElementById('card-sub');
  const tag     = document.getElementById('card-tag');

  if (item.type === 'seion') {
    tag.textContent = '点字（清音）';
    sub.textContent = 'この点字は何の文字？';
    renderBraille(braille, [SEION[item.key]]);
  } else if (item.type === 'daku') {
    tag.textContent = '点字（濁音）';
    sub.textContent = '緑=濁音符（5点）+ 清音で何の文字？';
    renderBraille(braille, [DAKUON[item.key]], {grid: DAKU_PREFIX});
  } else if (item.type === 'handaku') {
    tag.textContent = '点字（半濁音）';
    sub.textContent = '緑=半濁音符（6点）+ は行で何の文字？';
    renderBraille(braille, [HANDAKUON[item.key]], {grid: HANDAKU_PREFIX});
  } else if (item.type === 'special') {
    tag.textContent = '点字（特殊符号）';
    sub.textContent = 'この特殊符号は何？';
    renderBraille(braille, item.cells);
  } else {
    tag.textContent = '単語（点字）';
    sub.textContent = 'この単語は何と読む？';
    renderWordBraille(braille, item.text);
  }
}

// ─── 回答チェック ────────────────────────────────────────────────────────
function checkAnswer() {
  if (answered) return;
  const inp = document.getElementById('answer-input');
  const raw = inp.value.trim();
  if (!raw) { inp.focus(); return; }

  const item = deck[idx];
  const userAns = normalize(raw);
  const correctKeys = getAnswerKeys(item).map(k => normalize(k));
  const isCorrect = correctKeys.includes(userAns);

  answered = true;
  inp.disabled = true;
  inp.className = 'answer-input ' + (isCorrect ? 'input-correct' : 'input-wrong');

  if (isCorrect) {
    right++;
    document.getElementById('stat-right').textContent = right;
    showFeedback(true, correctKeys[0]);
  } else {
    wrong++;
    retryDeck.push(item);
    document.getElementById('stat-wrong').textContent = wrong;
    showFeedback(false, correctKeys[0]);
  }

  document.getElementById('input-area').style.display = 'none';
  document.getElementById('btn-next-row').style.display = '';
}

// ─── フィードバック表示 ──────────────────────────────────────────────────
function showFeedback(isCorrect, correctAnswer) {
  const fb   = document.getElementById('feedback');
  const icon = document.getElementById('feedback-icon');
  const msg  = document.getElementById('feedback-msg');
  const corr = document.getElementById('feedback-correct');
  const masc = document.getElementById('mascot');

  fb.className = 'feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');

  if (isCorrect) {
    icon.textContent = '⭕';
    icon.className = 'feedback-icon';
    msg.textContent  = pick(CORRECT_MSGS);
    msg.style.color  = 'var(--teal)';
    corr.textContent = '';
    masc.textContent = pick(CORRECT_MASCOTS);
  } else {
    icon.textContent = '❌';
    icon.className = 'feedback-icon shake-it';
    msg.textContent  = pick(WRONG_MSGS);
    msg.style.color  = 'var(--coral)';
    corr.textContent = `正解は「${correctAnswer}」だよ！`;
    masc.textContent = pick(WRONG_MASCOTS);
  }
}

function hideFeedback() {
  document.getElementById('feedback').className = 'feedback hidden';
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── 次へ ──────────────────────────────────────────────────────────────
function nextCard() {
  idx++;
  renderCard();
}

// ─── 結果表示 ─────────────────────────────────────────────────────────
function showResult() {
  document.getElementById('card').style.display = 'none';
  hideFeedback();
  document.getElementById('input-area').style.display = 'none';
  document.getElementById('btn-next-row').style.display = 'none';

  const total = right + wrong;
  const pct   = total > 0 ? Math.round(right / total * 100) : 0;
  document.getElementById('result-score').textContent = pct + '%';
  document.getElementById('result-sub').textContent   = `${total}問中 ${right}問正解`;

  let emoji, title;
  if (pct === 100) { emoji = '👑'; title = '完璧！全問正解！'; }
  else if (pct >= 80) { emoji = '🎉'; title = '素晴らしい！'; }
  else if (pct >= 60) { emoji = '😊'; title = 'よくできました！'; }
  else if (pct >= 40) { emoji = '👍'; title = 'もう少し！'; }
  else { emoji = '💪'; title = '練習あるのみ！'; }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result').classList.remove('hidden');
}

// ─── 再挑戦 ──────────────────────────────────────────────────────────────
function restart(retryOnly) {
  right = 0; wrong = 0; idx = 0;
  const source = (retryOnly && retryDeck.length > 0) ? retryDeck : buildDeck();
  retryDeck = [];
  deck = shuffle(source);

  document.getElementById('card').style.display = '';
  document.getElementById('result').classList.add('hidden');
  renderCard();
}
