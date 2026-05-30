# 点字を学ぼう 🔡

健常者が日本語点字（六点点字）を学ぶWebアプリです。  
フラッシュカード形式＋入力式回答で、清音・濁音・半濁音・特殊符号・単語を学習できます。

## 機能

- ✅ 清音 46文字 / 濁音 20文字 / 半濁音 5文字 / 特殊符号 3種
- ✅ 自分で答えを入力して正誤判定（⭕/❌ + マスコット演出）
- ✅ 正解率表示・不正解のみ再挑戦
- ✅ スマホブラウザ対応

## データソース

点字パターンは以下の公式資料をもとに実装しています：
- [CyberLibrarian 点字表](https://www.asahi-net.or.jp/~ax2s-kmtn/ref/braille_jsyll.html)
- 日本点字委員会

## セットアップ（ローカル）

```bash
# 1. クローン
git clone https://github.com/yt1970/braille-learning.git
cd braille-learning

# 2. 依存パッケージのインストール
pip install -r requirements.txt

# 3. サーバー起動
python main.py
# または
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

ブラウザで http://localhost:8000 にアクセス。

## ローカルネットワークからのアクセス

同一Wi-Fi内の別デバイスから `http://[MacのIPアドレス]:8000` でアクセスできます。

MacのIPアドレス確認:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## 技術スタック

| レイヤ | 技術 |
|--------|------|
| フロントエンド | HTML / CSS / Vanilla JavaScript |
| バックエンド | Python FastAPI + uvicorn |
| データ | JavaScript定数ファイル（braille_data.js） |

## ロードマップ

- [ ] #1 拗音の追加（キャ・シュ・チョなど）
- [ ] #2 単語辞書の拡充（50語以上）
- [ ] #3 学習進捗のローカルストレージ保存
- [ ] #4 インターネット公開（GitHub Pages / Railway）
- [ ] #5 数字・記号の追加

## ライセンス

MIT License
