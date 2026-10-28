// UI texts and assistant rules (demo logic, not a real AI). Catalogue data comes from the API.

export const BRAND = 'RoRa Homes';

export const ORDER = ['room', 'photo', 'change', 'keep', 'mood', 'budget'];
export const EMPTY_ANSWERS = { room: null, photo: null, change: null, changeText: null, keep: null, mood: null, budget: null };
export const QUESTION_SHORT = { room: 'ruum', photo: 'foto', change: 'mida muuta', keep: 'mis jääb alles', mood: 'meeleolu', budget: 'eelarve' };

export const ROOM_WORDS = {
  elutuba: ['elutu', 'elutoa', 'diivan', 'külalis'],
  magamistuba: ['magam', 'voodi'],
  kodukontor: ['kontor', 'töötuba', 'töölaud', 'kabinet'],
  lastetuba: ['laste', 'lapse'],
  vannituba: ['vann', 'duš', 'wc', 'pesu'],
};

export const CHANGES = [
  { id: 'hubasemaks', label: 'Hubasemaks', words: ['hubas', 'soojem', 'mõnus', 'pehm'] },
  { id: 'varv', label: 'Rohkem värvi', words: ['värv', 'erksam', 'elav'] },
  { id: 'rahulik', label: 'Rahulikumaks', words: ['rahul', 'vaiks', 'lihtsam', 'puhtam'] },
  { id: 'isikupara', label: 'Isikupärasemaks', words: ['isiku', 'julge', 'eriline', 'omanäo'] },
];

export const CHANGE_REASON = {
  hubasemaks: 'Soovisid hubasemat tuba – rõhk on pehmetel tekstiilidel ja soojal valgusel.',
  varv: 'Soovisid rohkem värvi – aktsendid tulevad tekstiilidest ja seinapildist, mitte suurtest pindadest.',
  rahulik: 'Soovisid rahulikumat tuba – piiratud värvipalett ja looduslikud materjalid.',
  isikupara: 'Soovisid isikupärasemat tuba – julge kontrast ja paar silmapaistvat detaili.',
};

export const MOODS = [
  { id: 'roheline', label: 'Roheline ja looduslähedane', words: ['roheli', 'loodus', 'mets', 'taim'], bg: '#DCE2D5',
    items: [{ kind: 'artwide', colors: ['#3E6250', '#D9C9A3', '#EEE8DA', '#8A6A44'], pos: 'left:12%;top:10%;width:46%' }, { kind: 'cushion', colors: ['#2F5A45', '#C9A55A', '#24463A'], pos: 'left:14%;bottom:8%;width:30%' }, { kind: 'vase', colors: ['#3E6250', '#9DB09A', '#2E4B3D'], pos: 'right:14%;bottom:8%;width:16%' }] },
  { id: 'mustkuld', label: 'Must, kuldne ja julge', words: ['must', 'kuld', 'tume', 'messing', 'julge'], bg: '#3A3631',
    items: [{ kind: 'art', colors: ['#1E1E1E', '#C9A55A', '#F3ECDF', '#C9A55A'], pos: 'left:14%;top:10%;width:28%' }, { kind: 'cushion', colors: ['#1F1F1F', '#C9A55A', '#2E2E2E'], pos: 'left:46%;bottom:10%;width:30%' }, { kind: 'candles', colors: ['#B08D4A', '#F3ECDF', '#8A6A2E'], pos: 'left:10%;bottom:10%;width:28%' }] },
  { id: 'hele', label: 'Hele, pehme ja rahulik', words: ['hele', 'valge', 'rahul', 'beež', 'pehme', 'skandi'], bg: '#EFE9DF',
    items: [{ kind: 'artwide', colors: ['#7F98A0', '#D9D4C7', '#EEF0EC', '#B58A5C'], pos: 'left:12%;top:10%;width:46%' }, { kind: 'cushion', colors: ['#E4D9C6', '#CDBEA5', '#D6C9B3'], pos: 'left:14%;bottom:8%;width:30%' }, { kind: 'vase', colors: ['#E4D9C6', '#9DB09A', '#CDBEA5'], pos: 'right:14%;bottom:8%;width:16%' }] },
  { id: 'soe', label: 'Soe ja maalähedane', words: ['soe', 'pruun', 'maa', 'terrakota', 'liiv', 'punane'], bg: '#E8D7C0',
    items: [{ kind: 'art', colors: ['#C9A27A', '#8A6A44', '#F1E9DC', '#B58A5C'], pos: 'right:14%;top:8%;width:26%' }, { kind: 'cushion', colors: ['#8E2F2C', '#C9A55A', '#7A2522'], pos: 'left:12%;bottom:10%;width:30%' }, { kind: 'basket', colors: ['#C2A77A', '#8A6A44', '#A88C5E'], pos: 'right:12%;bottom:8%;width:26%' }] },
];

export const BUDGETS = [{ v: 200, label: 'Kuni 200 €' }, { v: 250, label: 'Kuni 250 €' }, { v: 350, label: 'Kuni 350 €' }];
export const SAMPLE_COMMANDS = ['Tahan rohkem rohelist.', 'Asenda see padi rahulikuma tooniga.', 'Jäta lamp välja.', 'Hoia koguhind alla 250 euro.'];

export const CAT_WORDS = [
  ['Padjakate', ['padi', 'padja', 'padju']],
  ['Pleed', ['pleed']],
  ['Vaip', ['vaip', 'vaiba']],
  ['Valgusti', ['lamp', 'lambi', 'valgust']],
  ['Kunstitrükk', ['pilt', 'pildi', 'trükk', 'trüki', 'kunst', 'print', 'plakat']],
  ['Vaas', ['vaas']],
  ['Dekoratsioon', ['küünla', 'küünal', 'korv', 'täht', 'tähe', 'pärg', 'pärja', 'alus']],
  ['Vannitoa tekstiil', ['rätik', 'rätt', 'matt', 'mati']],
  ['Vannitoa tarvik', ['dosaator', 'seebi']],
];

export const PLACEHOLDERS = {
  room: 'Või kirjuta, nt „magamistuba”', photo: 'Kirjuta abilisele…', change: 'Või kirjuta oma sõnadega…',
  keep: 'Nt „roheline diivan ja raamaturiiul”', mood: 'Või kirjelda meeleolu…', budget: 'Nt „220”',
  thinking: 'Hetk…', results: 'Nt „alla 200 euro”', customize: 'Nt „Jäta lamp välja”',
};
