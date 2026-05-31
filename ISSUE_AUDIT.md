# braille-learning Issue管理台帳
更新日: 2026-05-31

## 目的

AI（ChatGPT / Claude Code等）のセッション切断・レート制限・モデル変更が発生しても、現在の開発状況を把握できるようにする。

作業開始時は `AUDIT_RULES.md` → Issue → コードの順で確認すること。

## 判定ルール

判定は `AUDIT_RULES.md` に従う。

Status:

- DONE
- REVIEW
- TODO
- HOLD

AI Action:

- IMPLEMENT
- REVIEW
- IGNORE

---

## Issue一覧

### #18 出題のランダム化

Status: DONE

AI Action: IGNORE

根拠: `static/app.js`

判定メモ:

- `shuffle()` が実装されている
- `restart()` で `deck = shuffle(source)` を実行している
- Issue本文の「完全にランダムにシャッフルして出題」に一致する

---

### #17 打つモードの採点時のUI改善

Status: DONE

AI Action: IGNORE

根拠: `static/app.js`, `static/index.html`

判定メモ:

- 不正解時のフィードバックで入力ドットを上書きしていない
- `feedback-braille` に正しい点字を別表示している

---

### #16 打つモードのチャ、チュ、チョの左のマスがおかしい

Status: DONE

AI Action: IGNORE

根拠: `static/braille_data.js`, `static/app.js`

判定メモ:

- `YOUON_MAP` に `チャ/チュ/チョ` が定義されている
- 打つ向きの変換で拗音の順序を保持している
- Issue本文の誤り修正に対応している

---

### #15 打ちモードの解答誤り

Status: DONE

AI Action: IGNORE

根拠: `static/braille_data.js`, `static/app.js`

判定メモ:

- 打つモードの判定は `getTypingCells()` と `checkTypingAnswer()` で処理している
- 拗音・濁音・半濁音を含む回答判定の基盤は修正済み

---

### #14 読むモードのヒント

Status: DONE

AI Action: IGNORE

根拠: `static/app.js`, `static/index.html`

判定メモ:

- `card-sub` を空表示にしている
- `placeholder` を空に統一している

---

### #13 打つモードの答え合わせ

Status: DONE

AI Action: IGNORE

根拠: `static/app.js`, `static/index.html`

判定メモ:

- 不正解時に正しい点字を `feedback-braille` に表示している
- `feedback-braille` 要素がHTMLに追加されている

---

### #12 濁音、半濁音、拗音、特殊音の表現

Status: DONE

AI Action: IGNORE

根拠: `static/braille_data.js`, `static/app.js`

判定メモ:

- `DAKUON`, `HANDAKUON`, `YOUON_MAP`, `SPECIAL_ITEMS` がある
- 1マス表現と prefix 表示が実装されている

---

### #11 打つモードの誤り修正

Status: DONE

AI Action: IGNORE

根拠: `static/app.js`

判定メモ:

- `getTypingCells()` で右から打つ順序に変換している
- マスの左右反転も含めて打つ向きが整理されている

---

### #10 UI、UXの改善2

Status: DONE

AI Action: IGNORE

根拠: `static/index.html`, `static/style.css`, `static/app.js`

判定メモ:

- 入力欄と次へボタンが下部固定バーに移動している
- スマホでキーボードが出ても点字表示が隠れにくい構成になっている

---

### #9 点字を打つモードの追加

Status: DONE

AI Action: IGNORE

根拠: `static/index.html`, `static/app.js`, `static/style.css`

判定メモ:

- 「読む / 打つ」切替がある
- 打つモード用のUI、採点、フィードバックが実装されている

---

### #8 問題カテゴリーの細部

Status: REVIEW

AI Action: REVIEW

根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`, `static/style.css`

判定メモ:

- 初級 / 中級 / 四字熟語 の3カテゴリ構成はある
- ただし `WORDS` は90語、`IDIOMS` は80語で、Issue本文の数量要件とは一致していない
- Issue本文との再確認が必要

---

### #7 問題カテゴリーの整理と問題数の増加

Status: REVIEW

AI Action: REVIEW

根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`, `static/style.css`

判定メモ:

- 3カテゴリ構成と横スクロールUIはある
- ただし `WORDS` 90語、`IDIOMS` 80語で、Issue本文の「100程度」には未達
- Issue本文との再確認が必要

---

### #6 UIの改善

Status: DONE

AI Action: IGNORE

根拠: `static/index.html`, `static/style.css`, `static/app.js`

判定メモ:

- タブと入力エリアが下部固定バーに収まっている
- 次へボタンがキーボードで隠れる問題への対処が入っている

---

### #5 数字・句読点・記号の追加

Status: TODO

AI Action: IMPLEMENT

根拠: `static/braille_data.js`, `static/index.html`, `static/app.js`

判定メモ:

- `NUMBERS` / `PUNCTUATION` の実装は見当たらない
- 数字・句読点・記号の学習UIも未追加

---

### #4 インターネット公開

Status: TODO

AI Action: IMPLEMENT

根拠: `main.py`, `Dockerfile`, `README.md`

判定メモ:

- FastAPI アプリ本体と Dockerfile はある
- ただし Railway / Render 等の公開設定や公開URLは未確認

---

### #3 学習進捗のlocalStorage保存

Status: TODO

AI Action: IMPLEMENT

根拠: `static/app.js`

判定メモ:

- `localStorage` の利用が見当たらない
- 進捗保存やリセット機能は未実装

---

### #2 単語辞書を50語に拡充

Status: DONE

AI Action: IGNORE

根拠: `static/braille_data.js`, `static/app.js`

判定メモ:

- `WORDS` は 90 語ある
- 各単語に `meaning` が付いている
- Issue要求は満たしている

---

### #1 拗音（キャ・シュ・チョなど）の追加

Status: DONE

AI Action: IGNORE

根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`

判定メモ:

- `YOUON_MAP` がある
- 初級タブに拗音が含まれている
- 読むモード / 打つモードの両方で拗音を扱っている

---

## 次回実施タスク

優先度A

- `#3` 学習進捗保存の実装有無を再確認
- `#4` 公開設定と公開URLを確認
- `#5` 数字・記号の追加を実装

優先度B

- `#7` / `#8` の数量要件を再確認して、必要なら Issue を分割

優先度C

- `REVIEW` の Issue を `DONE` / `TODO` に整理し直す

---

## AI作業ルール

開始時

1. `AUDIT_RULES.md` を確認する
2. Issue を確認する
3. コードを確認する

終了時

1. `ISSUE_AUDIT.md` を更新する
2. Status を更新する
3. 次回タスクを更新する
