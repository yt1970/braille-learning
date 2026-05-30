// ─── 定数 ───────────────────────────────────────────────────────────────
const CORRECT_MSGS    = ['すごい！', 'やったね！', '完璧！', 'さすが！', 'その調子！', 'ばっちり！'];
const CORRECT_MASCOTS = ['🐱','🐶','🐰','🦊','🐻','🐼','🐨','🐸','🦁','🐯'];
const WRONG_MSGS      = ['惜しい！', 'もう一度！', '次は大丈夫！', 'ファイト！', '諦めないで！'];
const WRONG_MASCOTS   = ['😢','😿','🥺','😖','💦'];

// ─── 状態 ────────────────────────────────────────────────────────────────
let mode = 'shokyu', inputMode = 'read';
let deck = [], idx = 0, right = 0, wrong = 0, retryDeck = [], answered = false;

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
  switchMode('shokyu');
});

// ─── カテゴリ切替 ────────────────────────────────────────────────────────
function switchMode(m) {
  mode = m;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === m));
  restart(false);
}

// ─── 読む / 打つ 切替 ────────────────────────────────────────────────────
function switchInputMode(m) {
  inputMode = m;
  document.getElementById('mode-read').classList.toggle('active', m === 'read');
  document.getElementById('mode-type').classList.toggle('active', m === 'type');
  restart(false);
}

// ─── デッキ構築 ──────────────────────────────────────────────────────────
function buildDeck() {
  if (mode === 'shokyu') {
    const seionCards   = Object.keys(SEION).map(k => ({ type: 'seion',   key: k }));
    const dakuCards    = Object.keys(DAKUON).map(k => ({ type: 'daku',   key: k }));
    const handakuCards = Object.keys(HANDAKUON).map(k => ({ type: 'handaku', key: k }));
    const specialCards = SPECIAL_ITEMS.map(s => ({ type: 'special', key: s.key, cells: s.cells, desc: s.desc }));
    const youonCards   = Object.keys(YOUON_MAP).map(k => ({ type: 'youon', key: k }));
    return [...seionCards, ...dakuCards, ...handakuCards, ...specialCards, ...youonCards];
  }
  if (mode === 'chukyu') return WORDS.map(w => ({ type: 'word',  text: w.text, meaning: w.meaning }));
  if (mode === 'idiom')  return IDIOMS.map(w => ({ type: 'idiom', text: w.text, meaning: w.meaning }));
  return [];
}

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// ═══════════════════════════════════════════════════════════════════════
// 読むモード: 点字レンダリング
// ═══════════════════════════════════════════════════════════════════════

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

function appendYouon(container, key) {
  const entry = YOUON_MAP[key];
  if (!entry) return;
  entry.prefix.forEach(pNum => renderDot(pts([pNum]), container, true));
  if (SEION[entry.base]) renderDot(SEION[entry.base], container, false);
}

function renderYouon(container, key) {
  container.innerHTML = '';
  appendYouon(container, key);
}

function renderWordBraille(container, text) {
  container.innerHTML = '';
  const chars = [...text];
  let i = 0;
  while (i < chars.length) {
    if (i + 1 < chars.length) {
      const two = chars[i] + chars[i + 1];
      if (YOUON_MAP[two]) { appendYouon(container, two); i += 2; continue; }
    }
    const ch = chars[i];
    if      (SEION[ch])     { renderDot(SEION[ch], container, false); }
    else if (DAKUON[ch])    { renderDot(DAKU_PREFIX, container, true);    renderDot(DAKUON[ch], container, false); }
    else if (HANDAKUON[ch]) { renderDot(HANDAKU_PREFIX, container, true); renderDot(HANDAKUON[ch], container, false); }
    else {
      const sp = SPECIAL_ITEMS.find(s => s.key.startsWith(ch));
      if (sp) renderDot(sp.cells[0], container, false);
    }
    i++;
  }
}

function updateScrollIndicator() {
  const row = document.getElementById('braille-display');
  const ind = document.getElementById('scroll-indicator');
  if (!row || !ind) return;
  ind.classList.toggle('hidden', row.scrollWidth <= row.clientWidth + 4);
  row.addEventListener('scroll', () => {
    ind.classList.toggle('hidden', row.scrollLeft + row.clientWidth >= row.scrollWidth - 4);
  }, { passive: true });
}

// ═══════════════════════════════════════════════════════════════════════
// 打つモード: ヘルパー関数
//
// 【点字台の向き】
//   読む向き（画面表示）: 左列=1・2・3点, 右列=4・5・6点
//   打つ向き（台に向かう）: 左列=4・5・6点, 右列=1・2・3点
//     → グリッドの列を左右入れ替え（mirrorGrid）
//
// 【複数マスの順序】
//   読む向き: 左のマスから右へ（先頭文字が左）
//   打つ向き: 右から左へ打つ（先頭文字を最後に打つ）
//     → 配列を逆順にして「打つ順に右端から並べる」
//
// 【UI上の並び】
//   画面には左→右の順で並べるが、
//   「先に打つマス = 右端」として逆順で配置する
//   つまり: readingCells[0] が画面右端、readingCells[N-1] が画面左端
// ═══════════════════════════════════════════════════════════════════════

// 左右反転: 読む向きグリッド → 打つ向きグリッド
function mirrorGrid(grid) {
  return grid.map(row => [row[1], row[0]]);
}

// アイテムの「読む順」グリッド配列（左から右の順）
function getReadingCells(item) {
  if (item.type === 'seion')   return [SEION[item.key]];
  if (item.type === 'daku')    return [DAKU_PREFIX, DAKUON[item.key]];
  if (item.type === 'handaku') return [HANDAKU_PREFIX, HANDAKUON[item.key]];
  if (item.type === 'special') return item.cells.slice();
  if (item.type === 'youon') {
    const e = YOUON_MAP[item.key];
    if (!e) return [];
    return [...e.prefix.map(p => pts([p])), SEION[e.base]];
  }
  if (item.type === 'word' || item.type === 'idiom') return getWordCells(item.text);
  return [];
}

// テキストを解析してグリッド配列を返す
function getWordCells(text) {
  const cells = [];
  const chars = [...text];
  let i = 0;
  while (i < chars.length) {
    if (i + 1 < chars.length) {
      const two = chars[i] + chars[i + 1];
      if (YOUON_MAP[two]) {
        const e = YOUON_MAP[two];
        e.prefix.forEach(p => cells.push(pts([p])));
        cells.push(SEION[e.base]);
        i += 2; continue;
      }
    }
    const ch = chars[i];
    if      (SEION[ch])     { cells.push(SEION[ch]); }
    else if (DAKUON[ch])    { cells.push(DAKU_PREFIX); cells.push(DAKUON[ch]); }
    else if (HANDAKUON[ch]) { cells.push(HANDAKU_PREFIX); cells.push(HANDAKUON[ch]); }
    else {
      const sp = SPECIAL_ITEMS.find(s => s.key.startsWith(ch));
      if (sp) cells.push(sp.cells[0]);
    }
    i++;
  }
  return cells;
}

// 「打つ向き」グリッド配列を返す
// fix: readingCells を逆順にしてから mirrorGrid を適用し、
//      UI上は「先に打つマスが右端」になるよう再び逆順で返す
// 結果: typingCells[0] = 画面左端（最後に打つ）, typingCells[N-1] = 画面右端（最初に打つ）
function getTypingCells(item) {
  const reading = getReadingCells(item);
  // 読む順（左→右）のグリッドを左右反転し、打つ順（右端から左へ）で並べる
  // UI表示は左→右なので、打つ順の逆（= 読む順）で配置 → mirrorGrid だけ適用
  return reading.map(mirrorGrid);
}

// checkTypingAnswer で使う「期待グリッド」は typingCells[cellIdx] と一致するよう
// UI生成側と評価側で同じ getTypingCells を参照する（統一済み）

// ═══════════════════════════════════════════════════════════════════════
// カード描画
// ═══════════════════════════════════════════════════════════════════════

function renderCard() {
  if (inputMode === 'type') { renderTypingCard(); return; }

  if (idx >= deck.length) { showResult(); return; }
  const item = deck[idx];
  answered = false;

  updateProgress();
  hideFeedback();
  document.getElementById('btn-next-row').style.display = 'none';

  document.getElementById('input-area').style.display = '';
  document.getElementById('braille-wrapper').style.display = '';
  document.getElementById('typing-char').classList.add('hidden');
  document.getElementById('typing-area').classList.add('hidden');

  const inp = document.getElementById('answer-input');
  inp.value = ''; inp.disabled = false; inp.className = 'answer-input'; inp.focus();

  const braille = document.getElementById('braille-display');
  const sub     = document.getElementById('card-sub');
  const tag     = document.getElementById('card-tag');
  braille.scrollLeft = 0;

  if (item.type === 'seion') {
    tag.textContent = '点字（清音）';
    sub.textContent = 'この点字は何の文字？';
    renderBraille(braille, [SEION[item.key]]);
    inp.placeholder = '例: ア';
  } else if (item.type === 'daku') {
    tag.textContent = '点字（濁音）';
    sub.textContent = '緑=濁音符（5点）+ 清音で何の文字？';
    renderBraille(braille, [DAKUON[item.key]], { grid: DAKU_PREFIX });
    inp.placeholder = '例: ガ';
  } else if (item.type === 'handaku') {
    tag.textContent = '点字（半濁音）';
    sub.textContent = '緑=半濁音符（6点）+ は行で何の文字？';
    renderBraille(braille, [HANDAKUON[item.key]], { grid: HANDAKU_PREFIX });
    inp.placeholder = '例: パ';
  } else if (item.type === 'special') {
    tag.textContent = '点字（特殊符号）';
    sub.textContent = 'この特殊符号は何？';
    renderBraille(braille, item.cells);
    inp.placeholder = '例: ン';
  } else if (item.type === 'youon') {
    const e = YOUON_MAP[item.key];
    const prefLen = e ? e.prefix.length : 0;
    tag.textContent = prefLen === 1 ? '点字（拗音）'
                    : e.prefix[0] === 5 ? '点字（濁音の拗音）'
                    : '点字（半濁音の拗音）';
    sub.textContent = prefLen === 1 ? '緑=拗音符（4点）＋清音で何の文字？'
                    : '緑=前置符＋清音で何の文字？';
    renderYouon(braille, item.key);
    inp.placeholder = '例: キャ';
  } else if (item.type === 'word') {
    tag.textContent = '単語（中級）';
    sub.textContent = 'この点字は何と読む？';
    renderWordBraille(braille, item.text);
    inp.placeholder = '読み方をカタカナで入力';
  } else if (item.type === 'idiom') {
    tag.textContent = '四字熟語';
    sub.textContent = 'この点字は何と読む？';
    renderWordBraille(braille, item.text);
    inp.placeholder = '読み方をカタカナで入力';
  }

  requestAnimationFrame(() => updateScrollIndicator());
}

// ─── 打つモード カード描画 ─────────────────────────────────────────────
function renderTypingCard() {
  if (idx >= deck.length) { showResult(); return; }
  const item = deck[idx];
  answered = false;

  updateProgress();
  hideFeedback();
  document.getElementById('btn-next-row').style.display = 'none';

  document.getElementById('input-area').style.display = 'none';
  document.getElementById('braille-wrapper').style.display = 'none';
  document.getElementById('typing-char').classList.remove('hidden');
  document.getElementById('typing-area').classList.remove('hidden');

  const tag        = document.getElementById('card-tag');
  const sub        = document.getElementById('card-sub');
  const typingChar = document.getElementById('typing-char');

  if (item.type === 'seion') {
    tag.textContent        = '打つ練習（清音）';
    typingChar.textContent = item.key;
    sub.textContent        = '1マスを打ちましょう';
  } else if (item.type === 'daku') {
    tag.textContent        = '打つ練習（濁音）';
    typingChar.textContent = item.key;
    sub.textContent        = '2マス：左→濁音符、右→清音（左から順に打つ）';
  } else if (item.type === 'handaku') {
    tag.textContent        = '打つ練習（半濁音）';
    typingChar.textContent = item.key;
    sub.textContent        = '2マス：左→半濁音符、右→清音（左から順に打つ）';
  } else if (item.type === 'special') {
    tag.textContent        = '打つ練習（特殊符号）';
    typingChar.textContent = item.key.replace(/（.*?）/g, '');
    sub.textContent        = '1マスを打ちましょう';
  } else if (item.type === 'youon') {
    const e = YOUON_MAP[item.key];
    const n = e ? e.prefix.length + 1 : 2;
    tag.textContent        = '打つ練習（拗音）';
    typingChar.textContent = item.key;
    sub.textContent        = `${n}マスを左から順に打ちましょう`;
  } else if (item.type === 'word') {
    tag.textContent      = '打つ練習（単語）';
    typingChar.innerHTML = `${item.text}<span class="typing-meaning">（${item.meaning}）</span>`;
    const n = getReadingCells(item).length;
    sub.textContent      = `${n}マスを左から順に打ちましょう`;
  } else if (item.type === 'idiom') {
    tag.textContent      = '打つ練習（四字熟語）';
    typingChar.innerHTML = `${item.text}<span class="typing-meaning">（${item.meaning}）</span>`;
    const n = getReadingCells(item).length;
    sub.textContent      = `${n}マスを左から順に打ちましょう`;
  }

  // 打つマスを生成
  // fix: typingCells[i] は「打つ向き（左右反転）」のグリッド
  //      UI上は左→右の順（読む方向と同じ並び）で表示し、打つ向きに合わせて左右が反転している
  const typingCells = getTypingCells(item);
  const container   = document.getElementById('typing-cells');
  container.innerHTML = '';

  typingCells.forEach((grid, cellIdx) => {
    const cell = document.createElement('div');
    cell.className = 'braille-cell typing-cell';
    cell.dataset.cellIdx = cellIdx;

    // 3行×2列のクリッカブルドット
    // 打つ向き: 左列 = 4・5・6点, 右列 = 1・2・3点
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const dot = document.createElement('div');
        dot.className = 'dot typing-dot off';
        dot.dataset.row = row;
        dot.dataset.col = col;
        dot.addEventListener('click', () => {
          if (answered) return;
          dot.classList.toggle('on');
          dot.classList.toggle('off');
        });
        cell.appendChild(dot);
      }
    }
    container.appendChild(cell);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 回答チェック
// ═══════════════════════════════════════════════════════════════════════

function checkAnswer() {
  if (inputMode === 'type') { checkTypingAnswer(); return; }
  if (answered) return;

  const inp = document.getElementById('answer-input');
  const raw = inp.value.trim();
  if (!raw) { inp.focus(); return; }

  const item        = deck[idx];
  const userAns     = normalize(raw);
  const correctKeys = getAnswerKeys(item).map(k => normalize(k));
  const isCorrect   = correctKeys.includes(userAns);

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

  document.getElementById('input-area').style.display  = 'none';
  document.getElementById('btn-next-row').style.display = '';
}

// 打つモード: 回答チェック
function checkTypingAnswer() {
  if (answered) return;
  answered = true;

  const item        = deck[idx];
  // fix: getTypingCells で得た「打つ向きグリッド」と UI の dot を比較
  const typingCells = getTypingCells(item);
  const container   = document.getElementById('typing-cells');
  const cellEls     = container.querySelectorAll('.typing-cell');

  let allCorrect = true;

  cellEls.forEach((cellEl, cellIdx) => {
    const expected = typingCells[cellIdx];
    if (!expected) return;

    const dots = cellEl.querySelectorAll('.typing-dot');

    // ユーザーの入力グリッドを構築（row/col は DOM の dataset 通り）
    const userGrid = [[0,0],[0,0],[0,0]];
    dots.forEach(d => {
      userGrid[+d.dataset.row][+d.dataset.col] = d.classList.contains('on') ? 1 : 0;
    });

    const correct = expected.every((row, r) => row.every((v, c) => v === userGrid[r][c]));

    if (correct) {
      cellEl.classList.add('cell-correct');
    } else {
      allCorrect = false;
      cellEl.classList.add('cell-wrong');
      // 正解を重ね表示（緑=打ち忘れ, 赤=余分）
      dots.forEach(d => {
        const r = +d.dataset.row, c = +d.dataset.col;
        const shouldOn = expected[r][c] === 1;
        const wasOn    = userGrid[r][c]  === 1;
        d.classList.remove('on', 'off');
        d.classList.add(shouldOn ? 'on' : 'off');
        if ( shouldOn && !wasOn) d.classList.add('dot-missed');
        if (!shouldOn &&  wasOn) d.classList.add('dot-extra');
      });
    }
    cellEl.querySelectorAll('.typing-dot').forEach(d => d.style.pointerEvents = 'none');
  });

  let displayText = '';
  if (['seion','daku','handaku','youon'].includes(item.type)) displayText = item.key;
  else if (item.type === 'special') displayText = item.key.replace(/（.*?）/g, '');
  else displayText = item.text;

  if (allCorrect) {
    right++;
    document.getElementById('stat-right').textContent = right;
    showFeedback(true, displayText);
  } else {
    wrong++;
    retryDeck.push(item);
    document.getElementById('stat-wrong').textContent = wrong;
    showFeedback(false, displayText);
  }

  document.getElementById('btn-next-row').style.display = '';
}

// ─── 共通ヘルパー ──────────────────────────────────────────────────────
function updateProgress() {
  const pct = Math.round(idx / deck.length * 100);
  document.getElementById('prog').style.width            = pct + '%';
  document.getElementById('stat-cur').textContent        = idx + 1;
  document.getElementById('stat-right').textContent      = right;
  document.getElementById('stat-wrong').textContent      = wrong;
}

// ─── フィードバック ────────────────────────────────────────────────────
function showFeedback(isCorrect, correctAnswer) {
  const fb   = document.getElementById('feedback');
  const icon = document.getElementById('feedback-icon');
  const msg  = document.getElementById('feedback-msg');
  const corr = document.getElementById('feedback-correct');
  const masc = document.getElementById('mascot');

  fb.className = 'feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');

  if (isCorrect) {
    icon.textContent = '⭕'; icon.className = 'feedback-icon';
    msg.textContent  = pick(CORRECT_MSGS); msg.style.color = 'var(--teal)';
    corr.textContent = '';
    masc.textContent = pick(CORRECT_MASCOTS);
  } else {
    icon.textContent = '❌'; icon.className = 'feedback-icon shake-it';
    msg.textContent  = pick(WRONG_MSGS); msg.style.color = 'var(--coral)';
    corr.textContent = `正解は「${correctAnswer}」だよ！`;
    masc.textContent = pick(WRONG_MASCOTS);
  }
}

function hideFeedback() { document.getElementById('feedback').className = 'feedback hidden'; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── 次へ ─────────────────────────────────────────────────────────────
function nextCard() { idx++; renderCard(); }

// ─── 結果表示 ──────────────────────────────────────────────────────────
function showResult() {
  document.getElementById('card').style.display = 'none';
  document.getElementById('typing-area').classList.add('hidden');
  hideFeedback();
  document.getElementById('input-area').style.display  = 'none';
  document.getElementById('btn-next-row').style.display = 'none';

  const total = right + wrong;
  const pct   = total > 0 ? Math.round(right / total * 100) : 0;
  document.getElementById('result-score').textContent = pct + '%';
  document.getElementById('result-sub').textContent   = `${total}問中 ${right}問正解`;

  let emoji, title;
  if      (pct === 100) { emoji = '👑'; title = '完璧！全問正解！'; }
  else if (pct >= 80)   { emoji = '🎉'; title = '素晴らしい！'; }
  else if (pct >= 60)   { emoji = '😊'; title = 'よくできました！'; }
  else if (pct >= 40)   { emoji = '👍'; title = 'もう少し！'; }
  else                  { emoji = '💪'; title = '練習あるのみ！'; }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result').classList.remove('hidden');
}

// ─── 再挑戦 ───────────────────────────────────────────────────────────
function restart(retryOnly) {
  right = 0; wrong = 0; idx = 0;
  const source = (retryOnly && retryDeck.length > 0) ? retryDeck : buildDeck();
  retryDeck = [];
  deck = shuffle(source);

  document.getElementById('card').style.display = '';
  document.getElementById('result').classList.add('hidden');
  renderCard();
}
