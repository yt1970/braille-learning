const CORRECT_MSGS    = ['すごい！', 'やったね！', '完璧！', 'さすが！', 'その調子！', 'ばっちり！'];
const CORRECT_MASCOTS = ['🐱','🐶','🐰','🦊','🐻','🐼','🐨','🐸','🦁','🐯'];
const WRONG_MSGS      = ['惜しい！', 'もう一度！', '次は大丈夫！', 'ファイト！', '諦めないで！'];
const WRONG_MASCOTS   = ['😢','😿','🥺','😖','💦'];

// #28: メニューで選択した状態を保持
let mode = 'shokyu', inputMode = 'read';
let deck = [], idx = 0, right = 0, wrong = 0, retryDeck = [], answered = false;

// ══════════════════════════════════════════════════════
// #28: メニュー画面の制御
// ══════════════════════════════════════════════════════

function showMenu() {
  document.getElementById('menu-screen').classList.remove('hidden');
  document.getElementById('quiz-screen').classList.add('hidden');
}

function startQuiz() {
  // メニューで選択中のモード・レベルを取得
  const selectedMode = document.querySelector('.menu-mode-btn.active')?.dataset.mode || 'read';
  const selectedLevel = document.querySelector('.menu-level-btn.active')?.dataset.level || 'shokyu';
  inputMode = selectedMode;
  mode = selectedLevel;

  document.getElementById('menu-screen').classList.add('hidden');
  document.getElementById('quiz-screen').classList.remove('hidden');

  // 出題画面の表示を更新
  updateQuizHeader();
  restart(false);
}

function updateQuizHeader() {
  // 出題画面上部のモード・レベル表示バッジを更新
  const modeLabelEl = document.getElementById('quiz-mode-label');
  const levelLabelEl = document.getElementById('quiz-level-label');
  if (modeLabelEl) modeLabelEl.textContent = inputMode === 'read' ? '👁 読むモード' : '✋ 打つモード';
  const levelNames = { shokyu:'初級', chukyu:'中級', idiom:'四字熟語', number:'数字', kigo:'記号', alpha:'アルファベット', kanji_idiom:'漢数字熟語' };
  if (levelLabelEl) levelLabelEl.textContent = levelNames[mode] || mode;
}

document.addEventListener('DOMContentLoaded', () => {
  // メニュー: モードボタン
  document.querySelectorAll('.menu-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.menu-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // メニュー: レベルボタン
  document.querySelectorAll('.menu-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.menu-level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // スタートボタン
  document.getElementById('btn-start').addEventListener('click', startQuiz);

  // 出題画面: メニューに戻るボタン
  document.getElementById('btn-back-menu').addEventListener('click', showMenu);

  // 出題画面: Enterキー
  document.getElementById('answer-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { if (!answered) checkAnswer(); else nextCard(); }
  });

  // 最初はメニュー画面を表示
  showMenu();
});

function buildDeck() {
  if (mode === 'shokyu') {
    return [
      ...Object.keys(SEION).map(k => ({ type: 'seion', key: k })),
      ...Object.keys(DAKUON).map(k => ({ type: 'daku', key: k })),
      ...Object.keys(HANDAKUON).map(k => ({ type: 'handaku', key: k })),
      ...SPECIAL_ITEMS.map(s => ({ type: 'special', key: s.key, cells: s.cells, desc: s.desc })),
      ...Object.keys(YOUON_MAP).map(k => ({ type: 'youon', key: k })),
    ];
  }
  if (mode === 'chukyu') return WORDS.map(w => ({ type: 'word',  text: w.text, meaning: w.meaning }));
  if (mode === 'idiom')  return IDIOMS.map(w => ({ type: 'idiom', text: w.text, meaning: w.meaning }));
  // #5: 数字モード
  if (mode === 'number') {
    return Object.entries(NUMBER_PATTERNS).map(([k, v]) => ({ type: 'number', key: k, cell: v }));
  }
  // #5: 記号モード
  if (mode === 'kigo') {
    return PUNCTUATION_ITEMS.map(s => ({ type: 'punct', key: s.key, cells: s.cells, desc: s.desc }));
  }
  // #27: アルファベットモード
  if (mode === 'alpha') {
    return ALPHABETS.map(a => ({ type: 'alpha', text: a.text, meaning: a.meaning }));
  }
  // #27: 漢数字四字熟語モード
  if (mode === 'kanji_idiom') {
    return KANJI_YOJIJUKUGO.map(w => ({ type: 'kanji_idiom', text: w.text, meaning: w.meaning }));
  }
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

// ══════════════════════════════════════════════════════
// 点字レンダリング（読むモード）
// ══════════════════════════════════════════════════════

function renderDot(grid, container, dotClass = 'on') {
  const cell = document.createElement('div');
  cell.className = 'braille-cell';
  grid.flat().forEach(v => {
    const d = document.createElement('div');
    d.className = 'dot ' + (v ? dotClass : 'off');
    cell.appendChild(d);
  });
  container.appendChild(cell);
}

// #12 fix: YOUON_MAP の prefix は既に pts() で生成済みの1マスグリッド
function appendYouon(container, key) {
  const entry = YOUON_MAP[key];
  if (!entry) return;
  renderDot(entry.prefix, container, 'prefix');
  if (SEION[entry.base]) renderDot(SEION[entry.base], container, 'on');
}

function renderYouon(container, key) {
  container.innerHTML = '';
  appendYouon(container, key);
}

function renderBraille(container, cells, prefixGrid = null, prefixClass = 'prefix') {
  container.innerHTML = '';
  if (prefixGrid) renderDot(prefixGrid, container, prefixClass);
  cells.forEach(g => renderDot(g, container, 'on'));
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
    if      (SEION[ch])     { renderDot(SEION[ch], container, 'on'); }
    else if (DAKUON[ch])    { renderDot(DAKU_PREFIX, container, 'prefix');    renderDot(DAKUON[ch], container, 'on'); }
    else if (HANDAKUON[ch]) { renderDot(HANDAKU_PREFIX, container, 'prefix'); renderDot(HANDAKUON[ch], container, 'on'); }
    else {
      const sp = SPECIAL_ITEMS.find(s => s.key.startsWith(ch));
      if (sp) renderDot(sp.cells[0], container, 'on');
    }
    i++;
  }
}

// #5: 数字の点字表示（数符 + 数字パターン）
function renderNumberBraille(container, key) {
  container.innerHTML = '';
  renderDot(SUUFU_PREFIX, container, 'suufu');   // 数符（オレンジ）
  const cell = NUMBER_PATTERNS[key];
  if (cell) renderDot(cell, container, 'on');
}

// #5: 記号の点字表示
function renderPunctBraille(container, cells) {
  container.innerHTML = '';
  cells.forEach(g => renderDot(g, container, 'on'));
}

// #27: アルファベットの点字表示（アルファベット符 + 英字パターン）
function renderAlphaBraille(container, text) {
  container.innerHTML = '';
  renderDot(ALPHA_PREFIX, container, 'alpha');   // アルファベット符（緑）
  const cell = ALPHA_PATTERNS[text.toUpperCase()];
  if (cell) renderDot(cell, container, 'on');
}

function updateScrollIndicator() {
  const row = document.getElementById('braille-display');
  const ind = document.getElementById('scroll-indicator');
  if (!row || !ind) return;
  const needsScroll = row.scrollWidth > row.clientWidth + 4;
  ind.classList.toggle('hidden', !needsScroll);
  row.addEventListener('scroll', () => {
    ind.classList.toggle('hidden', row.scrollLeft + row.clientWidth >= row.scrollWidth - 4);
  }, { passive: true });
}

// ══════════════════════════════════════════════════════
// 打つモード: グリッド変換
// ══════════════════════════════════════════════════════

function mirrorGrid(grid) {
  return grid.map(row => [row[1], row[0]]);
}

function getReadingCells(item) {
  if (item.type === 'seion')   return [SEION[item.key]];
  if (item.type === 'daku')    return [DAKU_PREFIX, DAKUON[item.key]];
  if (item.type === 'handaku') return [HANDAKU_PREFIX, HANDAKUON[item.key]];
  if (item.type === 'special') return item.cells.slice();
  if (item.type === 'youon') {
    const e = YOUON_MAP[item.key];
    if (!e) return [];
    return [e.prefix, SEION[e.base]];
  }
  if (item.type === 'word' || item.type === 'idiom' || item.type === 'kanji_idiom') return getWordCells(item.text);
  // #5: 数字
  if (item.type === 'number') return [SUUFU_PREFIX, item.cell];
  // #5: 記号
  if (item.type === 'punct') return item.cells.slice();
  // #27: アルファベット
  if (item.type === 'alpha') return [ALPHA_PREFIX, ALPHA_PATTERNS[item.text.toUpperCase()]].filter(Boolean);
  return [];
}

function getWordCells(text) {
  const cells = [];
  const chars = [...text];
  let i = 0;
  while (i < chars.length) {
    if (i + 1 < chars.length) {
      const two = chars[i] + chars[i + 1];
      if (YOUON_MAP[two]) {
        const e = YOUON_MAP[two];
        cells.push(e.prefix);
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

function getTypingCells(item) {
  const reading = getReadingCells(item);
  return [...reading].reverse().map(mirrorGrid);
}

function getYouonTagText(item) {
  const e = YOUON_MAP[item.key];
  if (!e) return '点字（拗音）';
  const p = e.prefix;
  const has5 = p[1][1] === 1;
  const has6 = p[2][1] === 1;
  if (has5) return '点字（濁音の拗音）';
  if (has6) return '点字（半濁音の拗音）';
  return '点字（拗音）';
}

// ══════════════════════════════════════════════════════
// カード描画
// ══════════════════════════════════════════════════════

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
  inp.value = ''; inp.disabled = false; inp.className = 'answer-input';
  inp.placeholder = '';
  inp.focus();

  const braille = document.getElementById('braille-display');
  const tag     = document.getElementById('card-tag');
  braille.scrollLeft = 0;
  document.getElementById('card-sub').textContent = '';

  if (item.type === 'seion') {
    tag.textContent = '点字（清音）';
    renderBraille(braille, [SEION[item.key]]);
  } else if (item.type === 'daku') {
    tag.textContent = '点字（濁音）';
    renderBraille(braille, [DAKUON[item.key]], DAKU_PREFIX);
  } else if (item.type === 'handaku') {
    tag.textContent = '点字（半濁音）';
    renderBraille(braille, [HANDAKUON[item.key]], HANDAKU_PREFIX);
  } else if (item.type === 'special') {
    tag.textContent = '点字（特殊符号）';
    renderBraille(braille, item.cells);
  } else if (item.type === 'youon') {
    tag.textContent = getYouonTagText(item);
    renderYouon(braille, item.key);
  } else if (item.type === 'word') {
    tag.textContent = '単語（中級）';
    renderWordBraille(braille, item.text);
  } else if (item.type === 'idiom') {
    tag.textContent = '四字熟語';
    renderWordBraille(braille, item.text);
  } else if (item.type === 'number') {
    // #5: 数字
    tag.textContent = '点字（数字）';
    renderNumberBraille(braille, item.key);
    document.getElementById('card-sub').textContent = '※ 左のマスは数符（オレンジ）';
  } else if (item.type === 'punct') {
    // #5: 記号
    tag.textContent = '点字（記号）';
    renderPunctBraille(braille, item.cells);
    document.getElementById('card-sub').textContent = item.desc || '';
  } else if (item.type === 'alpha') {
    // #27: アルファベット
    tag.textContent = '点字（アルファベット）';
    renderAlphaBraille(braille, item.text);
    document.getElementById('card-sub').textContent = '※ 左のマスはアルファベット符（緑）';
  } else if (item.type === 'kanji_idiom') {
    // #27: 漢数字四字熟語
    tag.textContent = '漢数字熟語';
    renderWordBraille(braille, item.text);
  }

  requestAnimationFrame(() => updateScrollIndicator());
}

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
  const readingN   = getReadingCells(item).length;

  if (item.type === 'seion') {
    tag.textContent = '打つ練習（清音）';
    typingChar.textContent = item.key;
    sub.textContent = '1マス';
  } else if (item.type === 'daku') {
    tag.textContent = '打つ練習（濁音）';
    typingChar.textContent = item.key;
    sub.textContent = '2マス（右から打つ）';
  } else if (item.type === 'handaku') {
    tag.textContent = '打つ練習（半濁音）';
    typingChar.textContent = item.key;
    sub.textContent = '2マス（右から打つ）';
  } else if (item.type === 'special') {
    tag.textContent = '打つ練習（特殊符号）';
    typingChar.textContent = item.key.replace(/（.*?）/g, '');
    sub.textContent = '1マス';
  } else if (item.type === 'youon') {
    tag.textContent = '打つ練習（拗音）';
    typingChar.textContent = item.key;
    sub.textContent = `${readingN}マス（右から打つ）`;
  } else if (item.type === 'word') {
    tag.textContent = '打つ練習（単語）';
    typingChar.innerHTML = `${item.text}<span class="typing-meaning">（${item.meaning}）</span>`;
    sub.textContent = `${readingN}マス（右から打つ）`;
  } else if (item.type === 'idiom') {
    tag.textContent = '打つ練習（四字熟語）';
    typingChar.innerHTML = `${item.text}<span class="typing-meaning">（${item.meaning}）</span>`;
    sub.textContent = `${readingN}マス（右から打つ）`;
  } else if (item.type === 'number') {
    // #5
    tag.textContent = '打つ練習（数字）';
    typingChar.textContent = item.key;
    sub.textContent = `${readingN}マス（右から打つ）`;
  } else if (item.type === 'punct') {
    // #5
    tag.textContent = '打つ練習（記号）';
    typingChar.textContent = item.key.replace(/（.*?）/g, '');
    sub.textContent = `${readingN}マス`;
  } else if (item.type === 'alpha') {
    // #27
    tag.textContent = '打つ練習（アルファベット）';
    typingChar.innerHTML = `${item.text}<span class="typing-meaning">（${item.meaning}）</span>`;
    sub.textContent = `${readingN}マス（右から打つ）`;
  } else if (item.type === 'kanji_idiom') {
    // #27
    tag.textContent = '打つ練習（漢数字熟語）';
    typingChar.innerHTML = `${item.text}<span class="typing-meaning">（${item.meaning}）</span>`;
    sub.textContent = `${readingN}マス（右から打つ）`;
  }

  const typingCells = getTypingCells(item);
  const container   = document.getElementById('typing-cells');
  container.innerHTML = '';

  typingCells.forEach((grid, cellIdx) => {
    const cell = document.createElement('div');
    cell.className = 'braille-cell typing-cell';
    cell.dataset.cellIdx = cellIdx;
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

  requestAnimationFrame(() => {
    container.scrollLeft = container.scrollWidth;
  });
}

// ══════════════════════════════════════════════════════
// 回答チェック
// ══════════════════════════════════════════════════════

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

  if (isCorrect) { right++; showFeedback(true, correctKeys[0]); }
  else           { wrong++; retryDeck.push(item); showFeedback(false, correctKeys[0]); }

  document.getElementById('stat-right').textContent = right;
  document.getElementById('stat-wrong').textContent = wrong;
  document.getElementById('input-area').style.display  = 'none';
  document.getElementById('btn-next-row').style.display = '';
}

function checkTypingAnswer() {
  if (answered) return;
  answered = true;

  const item        = deck[idx];
  const typingCells = getTypingCells(item);
  const container   = document.getElementById('typing-cells');
  const cellEls     = container.querySelectorAll('.typing-cell');

  let allCorrect = true;

  cellEls.forEach((cellEl, cellIdx) => {
    const expected = typingCells[cellIdx];
    if (!expected) return;

    const dots = cellEl.querySelectorAll('.typing-dot');
    const userGrid = [[0,0],[0,0],[0,0]];
    dots.forEach(d => { userGrid[+d.dataset.row][+d.dataset.col] = d.classList.contains('on') ? 1 : 0; });

    const correct = expected.every((row, r) => row.every((v, c) => v === userGrid[r][c]));

    if (correct) {
      cellEl.classList.add('cell-correct');
    } else {
      allCorrect = false;
      cellEl.classList.add('cell-wrong');
    }
    cellEl.querySelectorAll('.typing-dot').forEach(d => d.style.pointerEvents = 'none');
  });

  let displayText = '';
  if (['seion','daku','handaku','youon'].includes(item.type)) displayText = item.key;
  else if (item.type === 'special') displayText = item.key.replace(/（.*?）/g, '');
  else if (item.type === 'number') displayText = item.key;
  else if (item.type === 'punct') displayText = item.key.replace(/（.*?）/g, '');
  else if (item.type === 'alpha') displayText = `${item.text}（${item.meaning}）`;
  else displayText = item.text;

  if (allCorrect) {
    right++;
    document.getElementById('stat-right').textContent = right;
    showFeedback(true, displayText);
  } else {
    wrong++;
    retryDeck.push(item);
    document.getElementById('stat-wrong').textContent = wrong;
    showFeedbackWithBraille(displayText, item);
  }

  document.getElementById('btn-next-row').style.display = '';
}

// ══════════════════════════════════════════════════════
// フィードバック
// ══════════════════════════════════════════════════════

function showFeedback(isCorrect, correctAnswer) {
  const fb   = document.getElementById('feedback');
  const icon = document.getElementById('feedback-icon');
  const msg  = document.getElementById('feedback-msg');
  const corr = document.getElementById('feedback-correct');
  const masc = document.getElementById('mascot');
  const brailleAnswer = document.getElementById('feedback-braille');

  fb.className = 'feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');

  if (isCorrect) {
    icon.textContent = '⭕'; icon.className = 'feedback-icon';
    msg.textContent  = pick(CORRECT_MSGS); msg.style.color = 'var(--teal)';
    corr.textContent = '';
    masc.textContent = pick(CORRECT_MASCOTS);
    if (brailleAnswer) brailleAnswer.innerHTML = '';
  } else {
    icon.textContent = '❌'; icon.className = 'feedback-icon shake-it';
    msg.textContent  = pick(WRONG_MSGS); msg.style.color = 'var(--coral)';
    corr.textContent = `正解は「${correctAnswer}」`;
    masc.textContent = pick(WRONG_MASCOTS);
    if (brailleAnswer) brailleAnswer.innerHTML = '';
  }
}

function showFeedbackWithBraille(displayText, item) {
  const fb   = document.getElementById('feedback');
  const icon = document.getElementById('feedback-icon');
  const msg  = document.getElementById('feedback-msg');
  const corr = document.getElementById('feedback-correct');
  const masc = document.getElementById('mascot');
  const brailleAnswer = document.getElementById('feedback-braille');

  fb.className = 'feedback wrong-fb';
  icon.textContent = '❌'; icon.className = 'feedback-icon shake-it';
  msg.textContent  = pick(WRONG_MSGS); msg.style.color = 'var(--coral)';
  corr.textContent = `正解「${displayText}」の点字（打つ向き）:`;
  masc.textContent = pick(WRONG_MASCOTS);

  if (brailleAnswer) {
    brailleAnswer.innerHTML = '';
    const typingCells = getTypingCells(item);
    typingCells.forEach(g => renderDot(g, brailleAnswer, 'on'));
  }
}

function hideFeedback() {
  document.getElementById('feedback').className = 'feedback hidden';
  const ba = document.getElementById('feedback-braille');
  if (ba) ba.innerHTML = '';
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ══════════════════════════════════════════════════════
// ナビゲーション・共通
// ══════════════════════════════════════════════════════

function updateProgress() {
  document.getElementById('prog').style.width  = Math.round(idx / deck.length * 100) + '%';
  document.getElementById('stat-cur').textContent   = idx + 1;
  document.getElementById('stat-right').textContent = right;
  document.getElementById('stat-wrong').textContent = wrong;
}

function nextCard() { idx++; renderCard(); }

function showResult() {
  document.getElementById('card').style.display = 'none';
  document.getElementById('typing-area').classList.add('hidden');
  hideFeedback();
  document.getElementById('input-area').style.display   = 'none';
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

function restart(retryOnly) {
  right = 0; wrong = 0; idx = 0;
  const source = (retryOnly && retryDeck.length > 0) ? retryDeck : buildDeck();
  retryDeck = [];
  deck = shuffle(source);
  document.getElementById('card').style.display = '';
  document.getElementById('result').classList.add('hidden');
  renderCard();
}
