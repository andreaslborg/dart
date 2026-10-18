// Voice input: turning what the speech recogniser heard into a dart score.
// Supports English ("forty five", "ton forty", "one eighty") and Danish
// ("femogfyrre", "hundrede og fyrre"). Recognisers often return digits
// ("45"), which are handled too.

export const voiceSupported = typeof window !== 'undefined'
  && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

// Visit totals that cannot be thrown with three darts.
const IMPOSSIBLE = new Set([163, 166, 169, 172, 173, 175, 176, 178, 179]);
export const isPossibleScore = (n) => Number.isInteger(n) && n >= 0 && n <= 180 && !IMPOSSIBLE.has(n);

// ------------------------------------------------------------- words ----

const EN_UNITS = {
  zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
};
const EN_TENS = { twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

const DA_UNITS = {
  nul: 0, en: 1, 'én': 1, et: 1, to: 2, tre: 3, fire: 4, fem: 5, seks: 6, syv: 7, otte: 8, ni: 9,
  ti: 10, elleve: 11, tolv: 12, tretten: 13, fjorten: 14, femten: 15, seksten: 16,
  sytten: 17, atten: 18, nitten: 19,
};
const DA_TENS = {
  tyve: 20, tredive: 30, tredve: 30, fyrre: 40, fyrretyve: 40, halvtreds: 50, halvtredsindstyve: 50,
  tres: 60, tresindstyve: 60, halvfjerds: 70, halvfjerdsindstyve: 70, firs: 80, firsindstyve: 80,
  halvfems: 90, halvfemsindstyve: 90,
};

const ZERO_PHRASES = {
  en: ['no score', 'nothing', 'bust', 'zero', 'none'],
  da: ['ingen score', 'ingenting', 'bust', 'nul', 'intet'],
};
const CANCEL_WORDS = {
  en: ['no', 'cancel', 'stop', 'wrong', 'undo'],
  da: ['nej', 'fortryd', 'stop', 'forkert', 'annuller'],
};

const normalize = (text) => (text || '')
  .toLowerCase()
  .replace(/[-–]/g, ' ')
  .replace(/[.,!?:;"'()]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Value of a single token, or null.
function tokenValue(tok, lang) {
  if (/^\d{1,3}$/.test(tok)) return Number(tok);
  if (lang === 'da') {
    if (tok in DA_UNITS) return DA_UNITS[tok];
    if (tok in DA_TENS) return DA_TENS[tok];
    // "femogfyrre" = 5 + 40
    const m = tok.match(/^([a-zæøå]+)og([a-zæøå]+)$/);
    if (m && m[1] in DA_UNITS && m[2] in DA_TENS) return DA_UNITS[m[1]] + DA_TENS[m[2]];
    return null;
  }
  if (tok in EN_UNITS) return EN_UNITS[tok];
  if (tok in EN_TENS) return EN_TENS[tok];
  return null;
}

const isHundred = (tok, lang) => (lang === 'da' ? tok === 'hundrede' || tok === 'hundred' : tok === 'hundred');

// Parse a spoken number made of tokens. Returns null if anything is not a number word.
function parseTokens(tokens, lang) {
  const filler = lang === 'da' ? ['og', 'point'] : ['and', 'a', 'points', 'score'];
  let words = tokens.filter(t => !filler.includes(t) || isHundred(t, lang));
  if (!words.length) return null;

  // English dart slang: "ton" = 100 ("ton forty" = 140, "ton eighty" = 180).
  if (lang === 'en') words = words.flatMap(t => (t === 'ton' ? ['100'] : [t]));
  // English slang: "one forty" = 140, "one eighty" = 180, "one twenty five" = 125.
  if (lang === 'en' && words.length >= 2 && words[0] === 'one' && words[1] in EN_TENS) words = ['100', ...words.slice(1)];

  let total = 0;
  let current = 0;
  for (const tok of words) {
    if (isHundred(tok, lang)) {
      current = (current || 1) * 100;
      total += current;
      current = 0;
      continue;
    }
    const v = tokenValue(tok, lang);
    if (v === null) return null;
    current += v;
  }
  return total + current;
}

// What score (0-180) was said, or null if nothing usable was heard.
export function parseScore(text, lang = 'en') {
  const t = normalize(text);
  if (!t) return null;
  if (ZERO_PHRASES[lang].some(p => t === p || t.endsWith(` ${p}`) || t.startsWith(`${p} `))) return 0;
  const n = parseTokens(t.split(' '), lang);
  return n !== null && isPossibleScore(n) ? n : null;
}

// How many darts at a double (0-3), for the "darts på double?" question.
export function parseDarts(text, lang = 'en') {
  const t = normalize(text);
  const map = lang === 'da'
    ? { nul: 0, '0': 0, ingen: 0, en: 1, 'én': 1, et: 1, '1': 1, to: 2, '2': 2, tre: 3, '3': 3 }
    : { zero: 0, none: 0, nothing: 0, '0': 0, one: 1, won: 1, '1': 1, two: 2, to: 2, too: 2, '2': 2, three: 3, tree: 3, '3': 3 };
  const words = t.split(' ').filter(w => !['darts', 'dart', 'pile', 'pil'].includes(w));
  if (words.length !== 1) return null;
  return words[0] in map ? map[words[0]] : null;
}

export function isCancel(text, lang = 'en') {
  const t = normalize(text);
  return CANCEL_WORDS[lang].some(w => t === w || t.split(' ').includes(w));
}
