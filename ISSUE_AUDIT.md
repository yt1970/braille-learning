# braille-learning Issue管理台帳
更新日: 2026-06-01

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

### #19 【至急修正】UIの改修不十分

Status: DONE
AI Action: IGNORE
根拠: `static/index.html`, `static/style.css`, `.github/workflows/deploy.yml`

判定メモ:
- 読むモードの入力欄を点字表示の直下に移動した
- 得点表示を下部バー側に移動した
- 読むモードで本文だけをスクロールできる構成にした
- `deploy.yml` の `paths` 条件を維持して、UI系の更新だけで無駄なデプロイが走る状態を避けた

---

### #18 出題のランダム化

Status: DONE
AI Action: IGNORE
根拠: `static/app.js`

判定メモ:
- `shuffle()` が実装されている
- `restart()` で `deck = shuffle(source)` を実行している

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
- `YOUON_MAP` の `チャ/チュ/チョ` は `カ/ク/コ` ベースに修正済み
- 打つ向きの変換で拗音の順序を保持している

---

### #15 打ちモードの解答誤り

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

判定メモ:
- `getTypingCells()` と `checkTypingAnswer()` で処理している
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
- 不正解時に正しい点字を `feedback-braille` に打つ向きで表示している
- `feedback-braille` 要素がHTMLに追加されている

---

### #12 濁音、半濁音、拗音、特殊音の表現

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`

判定メモ:
- `DAKUON`, `HANDAKUON`, `YOUON_MAP`, `SPECIAL_ITEMS` がある
- 拗濁音・拗半濁音は `pts([4,5])` / `pts([4,6])` で1マスに合成済み

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
- 入力欄・次へボタン・タブが `.bottom-bar` として下部固定
- スマホでキーボードが出ても点字表示が隠れない構成

---

### #9 点字を打つモードの追加

Status: DONE
AI Action: IGNORE
根拠: `static/index.html`, `static/app.js`, `static/style.css`

判定メモ:
- 「読む / 打つ」切替がある
- 打つモード用のUI・採点・フィードバックが実装されている

---

### #8 問題カテゴリーの細部

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`

判定メモ:
- 初級 / 中級 / 四字熟語の3カテゴリ構成が実装されている
- WORDS 90語、IDIOMS 80語でほぼ要件を達成

---

### #7 問題カテゴリーの整理と問題数の増加

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`

判定メモ:
- 3カテゴリ構成と横スクロールUIが実装されている
- WORDS 90語、IDIOMS 80語でほぼ達成
- 完全な100語達成は優先度Bタスクとして残す

---

### #6 UIの改善

Status: DONE
AI Action: IGNORE
根拠: `static/index.html`, `static/style.css`, `static/app.js`

判定メモ:
- タブと入力エリアが下部固定バーに収まっている

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

Status: DONE
AI Action: IGNORE
根拠: `.github/workflows/deploy.yml`, `Dockerfile`, `main.py`

判定メモ:
- AWS ECS Fargate でデプロイ済み
- 公開URL: http://18.181.77.20:8000
- GitHub Actions で自動デプロイ設定済み（アプリ関連ファイルのみ）

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

判定メモ:
- `WORDS` は 90 語ある（要件の50語を上回る）

---

### #1 拗音（キャ・シュ・チョなど）の追加

Status: DONE
AI Action: IGNORE
根拠: `static/braille_data.js`, `static/app.js`, `static/index.html`

判定メモ:
- `YOUON_MAP` がある
- 読むモード / 打つモードの両方で拗音を扱っている

---

## 次回実施タスク

優先度A:
- `#3` 学習進捗のlocalStorage保存を実装
- `#5` 数字・記号の追加を実装

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
