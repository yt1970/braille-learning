# braille-learning Issue管理台帳
更新日: 2026-06-06

## 目的

AI（ChatGPT / Claude Code等）のセッション切断・レート制限・モデル変更が発生しても、現在の開発状況を把握できるようにする。

作業開始時は `AUDIT_RULES.md` → `ISSUE_AUDIT.md` → コードの順で確認すること。

## 環境情報

- 公開URL: http://18.181.77.20:8000
- インフラ: AWS ECS Fargate（ap-northeast-1）
- ECRリポジトリ: 063526152066.dkr.ecr.ap-northeast-1.amazonaws.com/braille-learning
- ECSクラスター: braille-learning-cluster
- ECSサービス: braille-learning-service
- 自動デプロイ: static/ / main.py / Dockerfile / requirements.txt の変更時のみ
- ⚠️ AWSクレジット有効期限: 2026-07-27（7/20に停止作業予定・カレンダー登録済み）

## 判定ルール

判定は `AUDIT_RULES.md` に従う。

Status: DONE / REVIEW / TODO / HOLD
AI Action: IMPLEMENT / REVIEW / IGNORE

---

## Issue一覧

### #28 メニュー画面の追加

Status: DONE
AI Action: IGNORE
根拠: `static/index.html`, `static/style.css`, `static/app.js`

判定メモ:
- 起動時にメニュー画面（`#menu-screen`）を表示し、モード（読む/打つ）とレベル（初級/中級/四字熟語/数字/記号/アルファベット/漢数字熟語）を選択してからスタートできるようにした
- 出題画面（`#quiz-screen`）にはヘッダーに「← メニュー」ボタン、現在のモード・レベルのバッジを表示
- タブ切替UIを出題画面から削除し、メニュー選択に一本化
- 読むモードの確認ボタンを入力フィールド下段・中央配置に変更（#28 副次対応）
- 結果画面に「メニューへ」ボタンを追加

---

### #27 アルファベット・漢数字熟語の追加

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/index.html`, `static/app.js`

判定メモ:
- `ALPHABETS`（A〜Z 26語）を `braille_data.js` に追加
- `ALPHA_PATTERNS`（アルファベット符6点 + 英字パターン）を実装
- `KANJI_YOJIJUKUGO`（漢数字を含む四字熟語 24語）を追加
- メニューに「アルファベット」「漢数字熟語」タブを追加
- `buildDeck()`・`renderCard()`・`renderTypingCard()`・`getReadingCells()` に対応ロジックを追加
- アルファベット符（`ALPHA_PREFIX`）は緑色（`.dot.alpha`）で表示

---

### #5 数字・句読点・記号の追加

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/index.html`, `static/app.js`

判定メモ:
- `NUMBER_PATTERNS`（0〜9）、`SUUFU_PREFIX`（数符 3456点）を `braille_data.js` に追加
- `PUNCTUATION_ITEMS`（句点・読点・感嘆符・疑問符・始め括弧・終わり括弧）を追加
- 数符はオレンジ色（`.dot.suufu`）で表示して視覚的に区別できるようにした
- メニューに「数字」「記号」タブを追加
- `buildDeck()`・`renderCard()`・`renderTypingCard()`・`getReadingCells()` に数字・記号の出題ロジックを追加
- `getAnswerKeys()` に `number` / `punct` / `alpha` / `kanji_idiom` の分岐を追加

---

### #19 【至急修正】UIの改修不十分

Status: DONE
AI Action: IGNORE
根拠: `static/index.html`, `static/style.css`, `.github/workflows/deploy.yml`

判定メモ:
- 読むモードの入力欄を点字表示の直下に移動した
- 得点表示を下部バー側に移動した
- 読むモードで本文だけをスクロールできる構成にした

---

### #24 読むモードの読みの誤り

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

判定メモ:
- `適者生存` の読みを `テキシャセイゾン` に修正した

---

### #25 読みモードの読み方の点字の間違い

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

判定メモ:
- `YOUON_MAP` の `チョ` を正しいた行ベースに修正済み

---

### #26 中級のレベルアップ

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`

判定メモ:
- `WORDS` に形容詞、カタカナ語、和製英語、長音を含む語を追加した

---

### #23 読むモードのタ行の誤り

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

判定メモ:
- た行の拗音 `チャ/チュ/チョ` を `4 + 1-3-5 / 1-3-4-5 / 2-3-4-5` に修正

---

### #22 読むモードの回答誤り

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

---

### #21 打つモードの解答誤り

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

---

### #20 打つ方の点字領域の不足

Status: DONE
AI Action: IGNORE
根拠: `static/style.css`

---

### #18 出題のランダム化

Status: DONE
AI Action: IGNORE
根拠: `static/app.js`

---

### #17 打つモードの採点時のUI改善

Status: DONE
AI Action: IGNORE
根拠: `static/app.js`, `static/index.html`

---

### #16 打つモードのチャ、チュ、チョの左のマスがおかしい

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

---

### #15 打ちモードの解答誤り

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

---

### #14 読むモードのヒント

Status: DONE
AI Action: IGNORE
根拠: `static/app.js`, `static/index.html`

---

### #13 打つモードの答え合わせ

Status: DONE
AI Action: IGNORE
根拠: `static/app.js`, `static/index.html`

---

### #12 濁音、半濁音、拗音、特殊音の表現

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

---

### #11 打つモードの誤り修正

Status: DONE
AI Action: IGNORE
根拠: `static/app.js`

---

### #10 UI、UXの改善2

Status: DONE
AI Action: IGNORE
根拠: `static/index.html`, `static/style.css`, `static/app.js`

---

### #9 点字を打つモードの追加

Status: DONE
AI Action: IGNORE
根拠: `static/index.html`, `static/app.js`, `static/style.css`

---

### #8 問題カテゴリーの細部

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`

---

### #7 問題カテゴリーの整理と問題数の増加

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`

---

### #6 UIの改善

Status: DONE
AI Action: IGNORE
根拠: `static/index.html`, `static/style.css`, `static/app.js`

---

### #4 インターネット公開

Status: DONE
AI Action: IGNORE
根拠: `.github/workflows/deploy.yml`, `Dockerfile`, `main.py`

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
根拠: `static/braille_data.js`

---

### #1 拗音（キャ・シュ・チョなど）の追加

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`

---

## 次回実施タスク

優先度A:
- `#3` 学習進捗のlocalStorage保存を実装

優先度B:
- WORDS / IDIOMS を各100語に増やして #7/#8 を完全クローズ

優先度C:
- 公開URLを固定IP or ドメイン化（現状はタスク再起動でIPが変わる可能性あり）
- 7/20にAWS ECSを停止、Renderへの移行を検討

---

## AI作業ルール

開始時:
1. `AUDIT_RULES.md` を確認する
2. `ISSUE_AUDIT.md` を確認する
3. 該当Issueのコードを確認する

終了時:
1. `ISSUE_AUDIT.md` の Status・次回タスクを更新する
2. コミットメッセージに `closes #XX` を含める
