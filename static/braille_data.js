// 点字データ（CyberLibrarian点字表 + 日本点字委員会 + 文科省資料 準拠）
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

const DAKU_PREFIX    = pts([5]);
const HANDAKU_PREFIX = pts([6]);
const YOUON_PREFIX   = pts([4]);

// ─── 拗音マッピング辞書 ────────────────────────────────────────────────
// 【規則】文科省資料・ほくてん点字五十音表 準拠
//   清音の拗音:   2マス = [拗音符(4点)] + [清音(ア/ウ/オ列)]
//   濁音の拗音:   2マス = [拗音符+濁音符(4+5点を1マスに合成)] + [清音]
//   半濁音の拗音: 2マス = [拗音符+半濁音符(4+6点を1マスに合成)] + [清音]
//
// ※ prefix は「1マスのグリッド」として直接渡す（pts()で生成済み）
// ※ チャ・チュ・チョ は カ・ク・コ ベース（タ行ではない）

const YOUON_MAP = {
  // ── 清音拗音（拗音符 4点 のみ = 1マス目） ──
  'キャ': { prefix: pts([4]),   base: 'カ' },
  'キュ': { prefix: pts([4]),   base: 'ク' },
  'キョ': { prefix: pts([4]),   base: 'コ' },
  'シャ': { prefix: pts([4]),   base: 'サ' },
  'シュ': { prefix: pts([4]),   base: 'ス' },
  'ショ': { prefix: pts([4]),   base: 'ソ' },
  'チャ': { prefix: pts([4]),   base: 'カ' }, // カ行ベース
  'チュ': { prefix: pts([4]),   base: 'ク' },
  'チョ': { prefix: pts([4]),   base: 'コ' },
  'ニャ': { prefix: pts([4]),   base: 'ナ' },
  'ニュ': { prefix: pts([4]),   base: 'ヌ' },
  'ニョ': { prefix: pts([4]),   base: 'ノ' },
  'ヒャ': { prefix: pts([4]),   base: 'ハ' },
  'ヒュ': { prefix: pts([4]),   base: 'フ' },
  'ヒョ': { prefix: pts([4]),   base: 'ホ' },
  'ミャ': { prefix: pts([4]),   base: 'マ' },
  'ミュ': { prefix: pts([4]),   base: 'ム' },
  'ミョ': { prefix: pts([4]),   base: 'モ' },
  'リャ': { prefix: pts([4]),   base: 'ラ' },
  'リュ': { prefix: pts([4]),   base: 'ル' },
  'リョ': { prefix: pts([4]),   base: 'ロ' },

  // ── 濁音拗音（拗音符4点 + 濁音符5点 を1マスに合成） ──
  'ギャ': { prefix: pts([4,5]), base: 'カ' },
  'ギュ': { prefix: pts([4,5]), base: 'ク' },
  'ギョ': { prefix: pts([4,5]), base: 'コ' },
  'ジャ': { prefix: pts([4,5]), base: 'サ' },
  'ジュ': { prefix: pts([4,5]), base: 'ス' },
  'ジョ': { prefix: pts([4,5]), base: 'ソ' },
  'ヂャ': { prefix: pts([4,5]), base: 'カ' },
  'ヂュ': { prefix: pts([4,5]), base: 'ク' },
  'ヂョ': { prefix: pts([4,5]), base: 'コ' },
  'ビャ': { prefix: pts([4,5]), base: 'ハ' },
  'ビュ': { prefix: pts([4,5]), base: 'フ' },
  'ビョ': { prefix: pts([4,5]), base: 'ホ' },

  // ── 半濁音拗音（拗音符4点 + 半濁音符6点 を1マスに合成） ──
  'ピャ': { prefix: pts([4,6]), base: 'ハ' },
  'ピュ': { prefix: pts([4,6]), base: 'フ' },
  'ピョ': { prefix: pts([4,6]), base: 'ホ' },
};

// 中級単語
const WORDS = [
  {text:'ネコ',     meaning:'猫'},    {text:'イヌ',     meaning:'犬'},
  {text:'サクラ',   meaning:'桜'},    {text:'ハナ',     meaning:'花'},
  {text:'ソラ',     meaning:'空'},    {text:'カワ',     meaning:'川'},
  {text:'ウサギ',   meaning:'うさぎ'},{text:'キリン',   meaning:'きりん'},
  {text:'ゾウ',     meaning:'象'},    {text:'トラ',     meaning:'虎'},
  {text:'クマ',     meaning:'熊'},    {text:'シカ',     meaning:'鹿'},
  {text:'サル',     meaning:'猿'},    {text:'トリ',     meaning:'鳥'},
  {text:'カメ',     meaning:'亀'},    {text:'ヘビ',     meaning:'蛇'},
  {text:'クジラ',   meaning:'クジラ'},{text:'イルカ',   meaning:'イルカ'},
  {text:'タコ',     meaning:'タコ'},  {text:'イカ',     meaning:'イカ'},
  {text:'カニ',     meaning:'カニ'},  {text:'エビ',     meaning:'エビ'},
  {text:'スシ',     meaning:'寿司'},  {text:'ソバ',     meaning:'そば'},
  {text:'ウドン',   meaning:'うどん'},{text:'オチャ',   meaning:'お茶'},
  {text:'ミズ',     meaning:'水'},    {text:'サケ',     meaning:'酒'},
  {text:'カキ',     meaning:'柿'},    {text:'クリ',     meaning:'栗'},
  {text:'ナシ',     meaning:'梨'},    {text:'モモ',     meaning:'桃'},
  {text:'ウメ',     meaning:'梅'},    {text:'マツ',     meaning:'松'},
  {text:'タケ',     meaning:'竹'},    {text:'ユキ',     meaning:'雪'},
  {text:'アメ',     meaning:'雨'},    {text:'カゼ',     meaning:'風'},
  {text:'クモ',     meaning:'雲'},    {text:'ホシ',     meaning:'星'},
  {text:'ツキ',     meaning:'月'},    {text:'アサ',     meaning:'朝'},
  {text:'ヒル',     meaning:'昼'},    {text:'ヨル',     meaning:'夜'},
  {text:'ハル',     meaning:'春'},    {text:'ナツ',     meaning:'夏'},
  {text:'アキ',     meaning:'秋'},    {text:'フユ',     meaning:'冬'},
  {text:'ウミ',     meaning:'海'},    {text:'ヤマ',     meaning:'山'},
  {text:'モリ',     meaning:'森'},    {text:'イシ',     meaning:'石'},
  {text:'カネ',     meaning:'金'},    {text:'ギン',     meaning:'銀'},
  {text:'テツ',     meaning:'鉄'},    {text:'カミ',     meaning:'紙'},
  {text:'フデ',     meaning:'筆'},    {text:'ホン',     meaning:'本'},
  {text:'イエ',     meaning:'家'},    {text:'マド',     meaning:'窓'},
  {text:'ドア',     meaning:'ドア'},  {text:'カベ',     meaning:'壁'},
  {text:'ニワ',     meaning:'庭'},    {text:'クツ',     meaning:'靴'},
  {text:'カサ',     meaning:'傘'},    {text:'カバン',   meaning:'鞄'},
  {text:'サイフ',   meaning:'財布'},  {text:'トケイ',   meaning:'時計'},
  {text:'カギ',     meaning:'鍵'},    {text:'チョコ',   meaning:'チョコ'},
  {text:'シャチ',   meaning:'シャチ'},{text:'シュミ',   meaning:'趣味'},
  {text:'キュウ',   meaning:'球'},    {text:'リュック', meaning:'リュック'},
  {text:'キャベツ', meaning:'キャベツ'},{text:'チョウ', meaning:'蝶'},
  {text:'ヒャク',   meaning:'百'},    {text:'ギャグ',   meaning:'ギャグ'},
  {text:'ジャム',   meaning:'ジャム'},{text:'ビョウブ', meaning:'屏風'},
  {text:'コップ',   meaning:'コップ'},{text:'ラッパ',   meaning:'ラッパ'},
  {text:'ギョーザ', meaning:'餃子'},  {text:'ジョウ',   meaning:'錠'},
  {text:'ビャク',   meaning:'白'},    {text:'ピョン',   meaning:'ぴょん'},
  {text:'ショウ',   meaning:'賞'},    {text:'チャイ',   meaning:'チャイ'},
  {text:'シュッシャ',meaning:'出社'}, {text:'キョカ',   meaning:'許可'},
];

// 四字熟語
const IDIOMS = [
  {text:'イチゴイチエ',     meaning:'一期一会'},   {text:'イッセキニチョウ', meaning:'一石二鳥'},
  {text:'イッシンフラン',   meaning:'一心不乱'},   {text:'イコウドウオン',   meaning:'異口同音'},
  {text:'イッショウケンメイ',meaning:'一生懸命'},  {text:'インガオウホ',     meaning:'因果応報'},
  {text:'ガシンショウタン', meaning:'臥薪嘗胆'},   {text:'ガリョウテンセイ', meaning:'画竜点睛'},
  {text:'キシカイセイ',     meaning:'起死回生'},   {text:'ギシンアンキ',     meaning:'疑心暗鬼'},
  {text:'コクシムソウ',     meaning:'国士無双'},   {text:'ゴエツドウシュウ', meaning:'呉越同舟'},
  {text:'シメンソカ',       meaning:'四面楚歌'},   {text:'シンラバンショウ', meaning:'森羅万象'},
  {text:'タイキバンセイ',   meaning:'大器晩成'},   {text:'タントウチョクニュウ',meaning:'単刀直入'},
  {text:'トウホンセイソウ', meaning:'東奔西走'},   {text:'ハッポウビジン',   meaning:'八方美人'},
  {text:'ユウジュウフダン', meaning:'優柔不断'},   {text:'リンキオウヘン',   meaning:'臨機応変'},
  {text:'イチモクリョウゼン',meaning:'一目瞭然'},  {text:'オンコチシン',     meaning:'温故知新'},
  {text:'カンゼンムケツ',   meaning:'完全無欠'},   {text:'キュウシイッショ', meaning:'九死一生'},
  {text:'ケンニンフバツ',   meaning:'堅忍不抜'},   {text:'ゴリムチュウ',     meaning:'五里霧中'},
  {text:'サンミイッタイ',   meaning:'三位一体'},   {text:'ジゴウジトク',     meaning:'自業自得'},
  {text:'ジキュウジソク',   meaning:'自給自足'},   {text:'シュウシイッカン', meaning:'終始一貫'},
  {text:'ショシカンテツ',   meaning:'初志貫徹'},   {text:'セッサタクマ',     meaning:'切磋琢磨'},
  {text:'センペンバンカ',   meaning:'千変万化'},   {text:'ダイドウショウイ', meaning:'大同小異'},
  {text:'テキシャセイブン', meaning:'適者生存'},   {text:'テットウテツビ',   meaning:'徹頭徹尾'},
  {text:'テンシンランマン', meaning:'天真爛漫'},   {text:'バジトウフ',       meaning:'馬耳東風'},
  {text:'ハクランキョウキ', meaning:'博覧強記'},   {text:'ハランバンジョウ', meaning:'波乱万丈'},
  {text:'ハンシンハンギ',   meaning:'半信半疑'},   {text:'ヒャッカリョウラン',meaning:'百花繚乱'},
  {text:'フンコツサイシン', meaning:'粉骨砕身'},   {text:'ホンマツテントウ', meaning:'本末転倒'},
  {text:'ムガムチュウ',     meaning:'無我夢中'},   {text:'メイキョウシスイ', meaning:'明鏡止水'},
  {text:'ユウオウマイシン', meaning:'勇往邁進'},   {text:'リロセイゼン',     meaning:'理路整然'},
  {text:'ワキアイアイ',     meaning:'和気藹々'},   {text:'シンシンキエイ',   meaning:'新進気鋭'},
  {text:'イットウリョウダン',meaning:'一刀両断'},   {text:'フウリンカザン',   meaning:'風林火山'},
  {text:'イッカクセンキン', meaning:'一攫千金'},   {text:'ヘンゲンジザイ',   meaning:'変幻自在'},
  {text:'イシンデンシン',   meaning:'以心伝心'},   {text:'シコウサクゴ',     meaning:'試行錯誤'},
  {text:'テンペンチイ',     meaning:'天変地異'},   {text:'ヒャクセンレンマ', meaning:'百戦錬磨'},
  {text:'ユウモウカカン',   meaning:'勇猛果敢'},   {text:'ジョウシャヒッスイ',meaning:'盛者必衰'},
  {text:'ジコムジュン',     meaning:'自己矛盾'},   {text:'チコウゴウイツ',   meaning:'知行合一'},
  {text:'セイテンヘキレキ', meaning:'青天の霹靂'}, {text:'ドクダンセンコウ', meaning:'独断専行'},
  {text:'ムビョウソクサイ', meaning:'無病息災'},   {text:'メイロウカイカツ', meaning:'明朗快活'},
  {text:'ユウシュウノビ',   meaning:'有終の美'},   {text:'サイショクケンビ', meaning:'才色兼備'},
  {text:'サンカンシオン',   meaning:'三寒四温'},   {text:'キョシンタンカイ', meaning:'虚心坦懐'},
  {text:'ケントウジュウライ',meaning:'捲土重来'},  {text:'コウトウムケイ',   meaning:'荒唐無稽'},
  {text:'ソウシソウアイ',   meaning:'相思相愛'},   {text:'チョウサンボシ',   meaning:'朝三暮四'},
  {text:'ボウゼンジシツ',   meaning:'茫然自失'},   {text:'フソクフリ',       meaning:'不即不離'},
  {text:'フエキリュウコウ', meaning:'不易流行'},   {text:'ヒャッカソウメイ', meaning:'百家争鳴'},
  {text:'アンシンリツメイ', meaning:'安心立命'},   {text:'アゼンボウゼン',   meaning:'唖然呆然'},
];

// 正規化: ひらがな→カタカナ
function normalize(s) {
  return s.replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60))
           .toUpperCase().trim();
}

function getAnswerKeys(item) {
  if (item.type === 'seion')   return [item.key];
  if (item.type === 'daku')    return [item.key];
  if (item.type === 'handaku') return [item.key];
  if (item.type === 'special') return [item.key.replace(/（.*?）/g,'')];
  if (item.type === 'youon')   return [item.key];
  if (item.type === 'word')    return [item.text];
  if (item.type === 'idiom')   return [item.text];
  return [];
}
