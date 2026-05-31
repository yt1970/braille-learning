# braille-learning Issue管理台帳
更新日: 2026-05-31

## 目的

AI（ChatGPT / Claude Code等）のセッション切断・レート制限・モデル変更が発生しても、現在の開発状況を把握できるようにする。

作業開始時は本ファイル → Issue → コードの順で確認すること。

---

# ステータス定義

| Status | 意味 |
|----------|----------|
| DONE | 実装済み・確認済み |
| REVIEW | 実装済みの可能性あり。コード確認要 |
| TODO | 未実装 |
| HOLD | 保留 |
| CLOSED | Issueクローズ済み |

---

# Issue一覧

## #18 出題のランダム化

Status: HOLD

### 確認結果

static/app.js に以下を確認。

- shuffle() 実装あり
- restart() 内で deck = shuffle(source)

技術的にはランダム出題済み。

### 判定

Issue本来の目的が「固定順をランダム化」であれば完了。

ただし、

- 同カテゴリ連続出題
- 出題バランス

は未解決の可能性あり。

### 対応

保留。

必要なら別Issue化。

候補:

- 出題バランス最適化
- 同カテゴリ連続防止
- 苦手問題優先出題

---

## #17

Status: REVIEW

app.js に #17 fix コメントあり。

Issue本文との突合が必要。

---

## #16

Status: REVIEW

app.js に #16 fix コメントあり。

Issue本文との突合が必要。

---

## #15

Status: REVIEW

Issue本文確認待ち。

---

## #14

Status: REVIEW

app.js に #14 fix コメントあり。

Issue本文との突合が必要。

---

## #13

Status: REVIEW

app.js に #13 fix コメントあり。

Issue本文との突合が必要。

---

## #12

Status: REVIEW

app.js に #12 fix コメントあり。

Issue本文との突合が必要。

---

## #11

Status: REVIEW

app.js に #11 fix コメントあり。

Issue本文との突合が必要。

---

## #10

Status: REVIEW

app.js に #10 fix コメントあり。

Issue本文との突合が必要。

---

## #9

Status: REVIEW

Issue本文確認待ち。

---

## #8

Status: REVIEW

Issue本文確認待ち。

---

## #7

Status: REVIEW

Issue本文確認待ち。

---

## #6

Status: REVIEW

Issue本文確認待ち。

---

## #5 数字・句読点・記号の追加

Status: TODO

未確認。

次回調査対象。

---

## #4 インターネット公開

Status: TODO

未確認。

Railway / Render 等の公開状況確認。

---

## #3 学習進捗保存

Status: TODO

localStorage 実装確認。

---

## #2 単語辞書拡充

Status: TODO

単語数確認。

---

## #1 拗音追加

Status: REVIEW

YOUON_MAP 存在確認。

実装済みの可能性高い。

Issue本文との突合が必要。

---

# 次回実施タスク

優先度A

- Open Issue一覧取得
- 各Issue本文取得
- コードとの突合

優先度B

- REVIEW → DONE整理
- 不要Issueクローズ

優先度C

- 新Issue作成
  - 出題バランス最適化
  - 苦手問題優先出題

---

# AI作業ルール

開始時

1. 本ファイル確認
2. Issue確認
3. コード確認

終了時

1. 本ファイル更新
2. Status更新
3. 次回タスク更新
