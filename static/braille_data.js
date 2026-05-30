// 点字データ（CyberLibrarian点字表 + 日本点字委員会 準拠）
// 点番号定義: 左列 上=1 中=2 下=3 / 右列 上=4 中=5 下=6
// グリッド形式: [[左上,右上],[左中,右中],[左下,右下]]

function pts(arr) {
  const g = [[0,0],[0,0],[0,0]];
  arr.forEach(p => {
    if(p===1)g[0][0]=1; if(p===4)g[0][1]=1;
    if(p===2)g[1][0]=1; if(p===5)g[1][1]=1;
    if(p===3)g[2][0]=1; if(p===6)g[2][1]=1;
  });
  return g;
}

const SEION = {
  'ア':pts([1]),      'イ':pts([1,2]),      'ウ':pts([1,4]),    'エ':pts([1,2,4]),    'オ':pts([2,4]),
  'カ':pts([1,6]),    'キ':pts([1,2,6]),    'ク':pts([1,4,6]),  'ケ':pts([1,2,4,6]),  'コ':pts([2,4,6]),
  'サ':pts([1,5,6]),  'シ':pts([1,2,5,6]),  'ス':pts([1,4,5,6]),'セ':pts([1,2,4,5,6]),'ソ':pts([2,4,5,6]),
  'タ':pts([1,3,5]),  'チ':pts([1,2,3,5]),  'ツ':pts([1,3,4,5]),'テ':pts([1,2,3,4,5]),'ト':pts([2,3,4,5]),
  'ナ':pts([1,3]),    'ニ':pts([1,2,3]),    'ヌ':pts([1,3,4]),  'ネ':pts([1,2,3,4]),  'ノ':pts([2,3,4]),
  'ハ':pts([1,3,6]),  'ヒ':pts([1,2,3,6]),  'フ':pts([1,3,4,6]),'ヘ':pts([1,2,3,4,6]),'ホ':pts([2,3,4,6]),
  'マ':pts([1,3,5,6]),'ミ':pts([1,2,3,5,6]),'ム':pts([1,3,4,5,6]),'メ':pts([1,2,3,4,5,6]),'モ':pts([2,3,4,5,6]),
  'ヤ':pts([3,4]),                          'ユ':pts([3,4,6]),               'ヨ':pts([3,4,5]),
  'ラ':pts([1,5]),    'リ':pts([1,2,5]),    'ル':pts([1,4,5]),  'レ':pts([1,2,4,5]),  'ロ':pts([2,4,5]),
  'ワ':pts([3]),                                                 'ヲ':pts([3,5]),      'ン':pts([3,5,6]),
};

const DAKUON = {
  'ガ':pts([1,6]),   'ギ':pts([1,2,6]),   'グ':pts([1,4,6]),  'ゲ':pts([1,2,4,6]),  'ゴ':pts([2,4,6]),
  'ザ':pts([1,5,6]), 'ジ':pts([1,2,5,6]), 'ズ':pts([1,4,5,6]),'ゼ':pts([1,2,4,5,6]),'ゾ':pts([2,4,5,6]),
  'ダ':pts([1,3,5]), 'ヂ':pts([1,2,3,5]), 'ヅ':pts([1,3,4,5]),'デ':pts([1,2,3,4,5]),'ド':pts([2,3,4,5]),
  'バ':pts([1,3,6]), 'ビ':pts([1,2,3,6]), 'ブ':pts([1,3,4,6]),'ベ':pts([1,2,3,4,6]),'ボ':pts([2,3,4,6]),
};

const HANDAKUON = {
  'パ':pts([1,3,6]),'ピ':pts([1,2,3,6]),'プ':pts([1,3,4,6]),'ペ':pts([1,2,3,4,6]),'ポ':pts([2,3,4,6]),
};

const SPECIAL_ITEMS = [
  { key:'ン（撥音符）', cells:[pts([3,5,6])], desc:'3・5・6点' },
  { key:'ー（長音符）', cells:[pts([2,5])],   desc:'2・5点' },
  { key:'ッ（促音符）', cells:[pts([2])],     desc:'2点' },
];

const DAKU_PREFIX  = pts([5]);
const HANDAKU_PREFIX = pts([6]);

const WORDS = [
  {text:'ネコ',    meaning:'猫'},
  {text:'イヌ',    meaning:'犬'},
  {text:'サクラ',  meaning:'桜'},
  {text:'ニホン',  meaning:'日本'},
  {text:'タイヨウ',meaning:'太陽'},
  {text:'ハナ',    meaning:'花'},
  {text:'カワ',    meaning:'川'},
  {text:'ソラ',    meaning:'空'},
  {text:'アリガトウ', meaning:'ありがとう'},
  {text:'コンニチワ', meaning:'こんにちは'},
];

// 正規化: ひらがな→カタカナ、小文字→大文字
function normalize(s) {
  return s.replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60))
           .toUpperCase()
           .trim();
}

// 正解キーのリストを返す（カタカナ正規形）
function getAnswerKeys(item) {
  if (item.type === 'seion')   return [item.key];
  if (item.type === 'daku')    return [item.key];
  if (item.type === 'handaku') return [item.key];
  if (item.type === 'special') return [item.key.replace(/（.*?）/g,'')];
  if (item.type === 'word')    return [item.text];
  return [];
}
