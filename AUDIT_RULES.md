# Issue Audit Rules

Issueとコードを突合して以下を判定する。

Status:

- DONE
- REVIEW
- TODO
- HOLD

AI Action:

- IMPLEMENT
- REVIEW
- IGNORE

判定基準

DONE
- Issue要求がコードで確認できる

REVIEW
- 実装痕跡あり
- Issue本文との確認が必要

TODO
- 実装なし

HOLD
- 人間判断待ち

更新時は根拠となるファイル名を記載する。
