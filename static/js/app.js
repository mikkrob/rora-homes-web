// RoRa Homes frontend: catalogue from /api/catalog, assistant demo, set customisation, sample cart.
import { BRAND, ORDER, EMPTY_ANSWERS, QUESTION_SHORT, ROOM_WORDS, CHANGES, CHANGE_REASON, MOODS, BUDGETS, SAMPLE_COMMANDS, CAT_WORDS, PLACEHOLDERS } from './content.js';
import { priceBundle, pctText } from './pricing.js';
import { productArt, roomScene } from './art.js';

const root = document.getElementById('app');
const KIND_Z = { rug: 1, rugr: 1, mat: 1, floorlamp: 2, art: 2, artwide: 2, wreath: 2, star: 2, tablelamp: 3, desklamp: 3, vase: 3, candles: 3, dispenser: 3, basket: 3, towel: 3, throw: 4, throwflat: 4, cushion: 5 };
const HERO_SET = 'roheline-tasakaal';
const BA_SET = 'metsa-vaikus';

/* ---------------- helpers ---------------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = (x) => JSON.parse(JSON.stringify(x));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const findWords = (t, words) => words.filter((w) => t.includes(w));
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')) + ' €';
const ICON = {
  arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  cart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  camera: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  image: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>',
  undo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
  sofa: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1F4A3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><path d="M2 12h20v5H2z"/><path d="M5 17v2M19 17v2"/></svg>',
  minus: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1F4A3A" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M8 12h8"/><circle cx="12" cy="12" r="9"/></svg>',
  list: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1F4A3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h7"/><path d="M17 15l2 2 3-4"/></svg>',
};

/* ---------------- catalogue (from Postgres via API) ---------------- */
let P = {};      // products by id
let SETS = {};   // sets by id
let SET_LIST = [];
let ROOMS = {};  // rooms by id
let ROOM_LIST = [];

function indexCatalog(cat) {
  P = {}; SETS = {}; ROOMS = {};
  cat.products.forEach((p) => { P[p.id] = p; });
  cat.sets.forEach((s) => { SETS[s.id] = s; });
  cat.rooms.forEach((r) => { ROOMS[r.id] = { ...r, words: ROOM_WORDS[r.id] || [r.name.toLowerCase()] }; });
  SET_LIST = cat.sets;
  ROOM_LIST = cat.rooms.map((r) => ROOMS[r.id]);
}

/* ---------------- set model ---------------- */
function makeRec(set, variant) {
  const lite = variant === 'lite';
  return { key: `${set.id}:${variant}`, setId: set.id, variant, swaps: lite ? set.lite.swaps : {}, removes: lite ? set.lite.removes : [] };
}
function workFromRec(rec) {
  const set = SETS[rec.setId];
  const items = [], removed = [];
  set.items.forEach((it) => {
    const copy = { ...it };
    if (rec.swaps[it.slot] && P[rec.swaps[it.slot]]) copy.product = rec.swaps[it.slot];
    (rec.removes.includes(it.slot) ? removed : items).push(copy);
  });
  return { setId: set.id, variant: rec.variant, items, removed };
}
const workPrice = (w) => priceBundle(SETS[w.setId], w.items.map((i) => P[i.product].price), w.removed.length);
const recPrice = (rec) => workPrice(workFromRec(rec));
const sortBySet = (w) => {
  const order = SETS[w.setId].items.map((i) => i.slot);
  w.items.sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
};

function scoreSet(set, a) {
  let s = 0;
  if (a.mood && set.moods.includes(a.mood)) s += 3;
  if (a.change && set.changes.includes(a.change)) s += 2;
  return s;
}
function computeRecs(a) {
  const budget = a.budget || 350;
  const sets = SET_LIST.filter((s) => s.room === a.room && !s.seasonal).sort((x, y) => scoreSet(y, a) - scoreSet(x, a));
  if (!sets.length) return [];
  const picks = sets.map((s) => (recPrice(makeRec(s, 'full')).total <= budget ? makeRec(s, 'full') : makeRec(s, 'lite')));
  if (picks.length < 2) picks.push(picks[0].variant === 'full' ? makeRec(sets[0], 'lite') : makeRec(sets[0], 'full'));
  return picks.slice(0, 2);
}
function recReasons(rec, a) {
  const set = SETS[rec.setId];
  const out = [set.reason];
  if (a.change && set.changes.includes(a.change)) out.push(CHANGE_REASON[a.change]);
  else if (a.changeText) out.push(`Arvestasin sinu sooviga: „${a.changeText}”.`);
  const md = MOODS.find((m) => m.id === a.mood);
  if (md && set.moods.includes(md.id)) out.push(`Toonid sobivad sinu valitud meeleoluga „${md.label.toLowerCase()}”.`);
  else if (md) out.push('Sinu valitud meeleolust veidi erinev – hea võrdlusvariant.');
  if (a.keep) out.push(/kõik/i.test(a.keep) ? 'Kogu suurem mööbel jääb alles – lisame vaid tekstiilid, valguse ja detailid.' : `Arvestasin, et alles jääb: ${a.keep.toLowerCase()}.`);
  const pr = recPrice(rec);
  if (a.budget) out.push(pr.total <= a.budget ? `Mahub sinu eelarvesse (kuni ${a.budget} €).` : `Ületab eelarvet ${eur(pr.total - a.budget)} võrra – saad tooteid asendada või välja jätta.`);
  if (rec.variant === 'lite' && set.lite.note) out.push(set.lite.note);
  return out;
}
function fitBudget(work, limit) {
  let w = clone(work);
  const changes = [];
  for (let guard = 0; guard < 12 && workPrice(w).total > limit; guard++) {
    const cur = workPrice(w).total;
    let cands = [];
    w.items.forEach((it, idx) => {
      P[it.product].alts.filter((aid) => P[aid]).forEach((aid) => {
        const t = clone(w); t.items[idx].product = aid;
        const tot = workPrice(t).total;
        if (tot < cur) cands.push({ tot, w: t, txt: `${P[it.product].name} → ${P[aid].name}` });
      });
    });
    if (!cands.length) {
      w.items.forEach((it, idx) => {
        const t = clone(w); t.removed.push(t.items.splice(idx, 1)[0]);
        const tot = workPrice(t).total;
        if (tot < cur && t.items.length) cands.push({ tot, w: t, txt: `välja jäetud ${P[it.product].name}` });
      });
    }
    if (!cands.length) break;
    const fits = cands.filter((c) => c.tot <= limit);
    const best = fits.length ? fits.sort((x, y) => y.tot - x.tot)[0] : cands.sort((x, y) => x.tot - y.tot)[0];
    w = best.w; changes.push(best.txt);
  }
  return { work: w, changes, ok: workPrice(w).total <= limit };
}

/* ---------------- state ---------------- */
const state = {
  status: 'loading', loadError: null,
  view: 'home', filter: 'koik', ba: 50,
  step: 'room', answers: clone(EMPTY_ANSWERS), messages: [], input: '',
  photoUrl: null, photoLoading: false, photoError: null,
  recs: [], work: null, history: [], sel: null, swapOpen: null, designed: true,
  cart: [], toast: null,
  signup: { email: '', consent: false, status: 'idle', msg: '' },
};
let mid = 0, cid = 0, thinkTimer = null, toastTimer = null, pendingScroll = null, drag = null, lastMsgCount = 0;

function set(patch) { Object.assign(state, patch); render(); }
const msg = (from, text) => ({ id: `m${++mid}`, from, text });

function question(step, answers) {
  const room = ROOMS[answers.room];
  switch (step) {
    case 'room': return `Tere! Olen ${BRAND} sisustusabiline. Aitan leida esemed, mis sinu olemasolevas toas omavahel kokku sobivad.\nMillist tuba soovid kujundada?`;
    case 'photo': return `${room ? room.name : 'Tuba'} – hea valik. Lisa toast foto, et näeksid soovitusi oma toa taustal. Võid ka proovida näidistoaga.`;
    case 'change': return 'Mida tahaksid oma toas muuta?';
    case 'keep': return 'Mis peab kindlasti alles jääma?';
    case 'mood': return 'Milline meeleolu sulle meeldib? Vali pilt, mis tundub kõige rohkem sinu moodi – stiilide nimesid pole vaja teada.';
    case 'budget': return 'Ja viimaseks: mis on sinu eelarve?';
    default: return '';
  }
}
function answerLabel(k) {
  const a = state.answers;
  if (k === 'room') return ROOMS[a.room] ? ROOMS[a.room].name : a.room;
  if (k === 'photo') return a.photo === 'own' ? 'Oma foto' : 'Näidistuba';
  if (k === 'change') { const c = CHANGES.find((x) => x.id === a.change); return c ? c.label : (a.changeText || 'Muu soov'); }
  if (k === 'keep') return `Alles: ${a.keep}`;
  if (k === 'mood') { const m = MOODS.find((x) => x.id === a.mood); return m ? m.label : a.mood; }
  if (k === 'budget') return `Kuni ${a.budget} €`;
  return '';
}

/* ---------------- flow ---------------- */
function startStudio() {
  if (!state.messages.length) set({ view: 'studio', step: 'room', messages: [msg('ai', question('room', state.answers))] });
  else set({ view: 'studio' });
}
function answer(key, value, label, extra) {
  const answers = { ...state.answers, ...(extra || {}), [key]: value };
  if (key === 'change' && !(extra && extra.changeText)) answers.changeText = null;
  const messages = [...state.messages, msg('user', label)];
  const next = ORDER.find((k) => answers[k] == null);
  if (next) {
    messages.push(msg('ai', question(next, answers)));
    set({ answers, messages, step: next, input: '' });
  } else {
    set({ answers, messages, step: 'thinking', input: '', work: null, sel: null, swapOpen: null });
    think(answers);
  }
}
function think(answers) {
  clearTimeout(thinkTimer);
  thinkTimer = setTimeout(() => {
    const recs = computeRecs(answers);
    const names = recs.map((r) => `„${SETS[r.setId].name}”${r.variant === 'lite' ? ' (kergem variant)' : ''}`).join(' ja ');
    pendingScroll = 'toaala';
    set({ recs, step: 'results', messages: [...state.messages, msg('ai', `Leidsin sinu toale kaks tervikut: ${names}. Vaata neid tööalal – kumbagi saad oma toa taustal proovida ja kohandada.`)] });
  }, 1300);
}
function editAnswer(key) {
  clearTimeout(thinkTimer);
  set({ step: key, work: null, sel: null, swapOpen: null, messages: [...state.messages, msg('ai', `Muudame. ${question(key, state.answers)}`)] });
}
function reply(userText, aiText) {
  set({ input: '', messages: [...state.messages, msg('user', userText), msg('ai', aiText)] });
}
function sendText(text) {
  const t = text.toLowerCase();
  const step = state.step;
  if (step === 'room') {
    const r = ROOM_LIST.find((x) => findWords(t, x.words).length);
    return r ? answer('room', r.id, text) : reply(text, 'Ma ei tundnud ruumi ära. Vali palun üks: elutuba, magamistuba, kodukontor, lastetuba või vannituba.');
  }
  if (step === 'photo') {
    if (/näidis|proovi|pole fotot|ei taha/.test(t)) return answer('photo', 'sample', text);
    return reply(text, 'Foto lisamiseks kasuta nuppe „Tee foto” või „Vali galeriist”. Kui fotot pole käepärast, vali „Proovi näidistoaga”.');
  }
  if (step === 'change') {
    const c = CHANGES.find((x) => findWords(t, x.words).length);
    return answer('change', c ? c.id : 'muu', text, { changeText: c ? null : text });
  }
  if (step === 'keep') return answer('keep', text, text);
  if (step === 'mood') {
    const m = MOODS.find((x) => findWords(t, x.words).length);
    return m ? answer('mood', m.id, text) : reply(text, 'Aitäh! Et tervik kokku sobiks, vali palun pilt, mis on sellele kõige lähemal.');
  }
  if (step === 'budget') {
    const n = t.match(/(\d{2,4})/);
    if (!n) return reply(text, 'Kirjuta summa eurodes, näiteks „250”.');
    const v = parseInt(n[1], 10);
    return answer('budget', Math.max(v, 150), v < 150 ? `${text} (tervikud algavad ~150 €)` : text);
  }
  if (step === 'thinking') return reply(text, 'Hetk, otsin veel – kohe on soovitused olemas.');
  if (step === 'results') {
    const b = t.match(/(\d{2,4})/);
    if (b) return answer('budget', Math.max(parseInt(b[1], 10), 150), text);
    const hit = state.recs.find((r) => t.includes(SETS[r.setId].name.toLowerCase().split(' ')[0]));
    if (hit) return openRec(hit, false, text);
    return reply(text, 'Ava üks tervikutest nupuga „Vaata oma toas”. Kui soovid teist eelarvet, kirjuta summa, näiteks „alla 200 euro”.');
  }
  if (step === 'customize') return command(text);
  return reply(text, 'Alustame: millist tuba soovid kujundada?');
}

/* ---------------- photo (stays in this browser) ---------------- */
function onFile(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  if (!/^image\//.test(f.type)) { input.value = ''; return set({ photoError: 'See fail ei ole pilt. Vali JPG- või PNG-foto.' }); }
  if (f.size > 25 * 1024 * 1024) { input.value = ''; return set({ photoError: 'Foto on liiga suur (üle 25 MB). Proovi väiksemat fotot.' }); }
  set({ photoLoading: true, photoError: null });
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.onload = () => {
    input.value = '';
    if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
    if (state.step === 'photo') {
      state.photoUrl = url; state.photoLoading = false;
      answer('photo', 'own', 'Lisasin oma toa foto');
    } else {
      set({ photoUrl: url, photoLoading: false, answers: { ...state.answers, photo: 'own' }, messages: [...state.messages, msg('ai', 'Uus foto on nüüd eelvaate taustaks. Lohista esemed vajadusel õigesse kohta.')] });
    }
  };
  img.onerror = () => {
    input.value = '';
    URL.revokeObjectURL(url);
    set({ photoLoading: false, photoError: 'Seda fotot ei õnnestunud brauseris avada (nt HEIC-vorming). Proovi JPG- või PNG-fotot või kasuta näidistuba.' });
  };
  img.src = url;
}
function removePhoto() {
  if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
  set({ photoUrl: null, answers: { ...state.answers, photo: state.answers.photo ? 'sample' : null }, messages: [...state.messages, msg('ai', 'Foto on eemaldatud. Kasutan näidistuba.')] });
}

/* ---------------- recommendations and customisation ---------------- */
function openRec(rec, focus, userText) {
  const work = workFromRec(rec);
  const set_ = SETS[rec.setId];
  const first = work.items[0] ? work.items[0].slot : null;
  const messages = [...state.messages];
  if (userText) messages.push(msg('user', userText));
  messages.push(msg('ai', `Avasin terviku „${set_.name}” ${state.photoUrl ? 'sinu foto' : 'näidistoa'} taustal. ${focus ? 'Vali toode, mida soovid asendada või välja jätta.' : 'Saad esemeid lohistada, asendada või välja jätta.'} Hind arvutub kohe ümber. Võid ka kirjutada, näiteks „Jäta lamp välja”.`));
  pendingScroll = 'toaala';
  set({ view: 'studio', step: 'customize', work, history: [], sel: focus ? first : null, swapOpen: focus ? first : null, designed: true, messages, input: '' });
}
function openSetDirect(setId) {
  const set_ = SETS[setId];
  let answers = clone(state.answers), recs = state.recs;
  if (answers.room !== set_.room) { answers = clone(EMPTY_ANSWERS); answers.room = set_.room; recs = []; }
  if (answers.photo == null) answers.photo = state.photoUrl ? 'own' : 'sample';
  const messages = state.messages.length ? state.messages : [msg('ai', `Tere! Olen ${BRAND} sisustusabiline.`)];
  Object.assign(state, { answers, recs, messages });
  openRec(makeRec(set_, 'full'), false);
}
function backFromCustomize() {
  if (state.recs.length) return set({ step: 'results', sel: null, swapOpen: null });
  const next = ORDER.find((k) => state.answers[k] == null);
  if (next) return set({ step: next, sel: null, swapOpen: null, messages: [...state.messages, msg('ai', `Leiame sinu toale kõige sobivama terviku. ${question(next, state.answers)}`)] });
  set({ step: 'thinking', work: null });
  think(state.answers);
}
function commit(work, extra) {
  set({ work, history: [...state.history, clone(state.work)].slice(-40), ...(extra || {}) });
}
function swap(slot, pid) {
  const w = clone(state.work);
  w.items.forEach((i) => { if (i.slot === slot) i.product = pid; });
  commit(w, { swapOpen: null, sel: slot });
}
function removeSlot(slot) {
  const w = clone(state.work);
  const idx = w.items.findIndex((i) => i.slot === slot);
  if (idx < 0) return;
  w.removed.push(w.items.splice(idx, 1)[0]);
  commit(w, { sel: null, swapOpen: null });
}
function restoreSlot(slot) {
  const w = clone(state.work);
  const idx = w.removed.findIndex((i) => i.slot === slot);
  if (idx < 0) return;
  w.items.push(w.removed.splice(idx, 1)[0]);
  sortBySet(w);
  commit(w, { sel: slot });
}
function undo() {
  if (!state.history.length) return;
  set({ work: state.history[state.history.length - 1], history: state.history.slice(0, -1), swapOpen: null });
}
function nudge(dx, dy, slot = state.sel) {
  if (!slot) return;
  const w = clone(state.work);
  w.items.forEach((i) => { if (i.slot === slot) { i.x = clamp(i.x + dx, -10, 100); i.y = clamp(i.y + dy, -10, 100); } });
  commit(w, { sel: slot });
}
function resize(d, slot = state.sel) {
  if (!slot) return;
  const w = clone(state.work);
  w.items.forEach((i) => { if (i.slot === slot) i.w = clamp(Math.round((i.w + d) * 10) / 10, 2, 70); });
  commit(w, { sel: slot });
}
function addToCart() {
  const w = state.work;
  if (!w || !w.items.length) return;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => set({ toast: null }), 5000);
  set({ cart: [...state.cart, { id: `c${++cid}`, setId: w.setId, items: clone(w.items), removed: clone(w.removed) }], toast: `„${SETS[w.setId].name}” lisati näidisostukorvi.` });
}

/* Free-text instructions while customising (demo rules, not a real AI). */
function command(text) {
  const t = text.toLowerCase();
  const s = state;
  const w = clone(s.work);
  const finish = (aiText, changedWork, extra) => {
    const patch = { input: '', messages: [...s.messages, msg('user', text), msg('ai', aiText)], ...(extra || {}) };
    if (changedWork) { patch.work = changedWork; patch.history = [...s.history, clone(s.work)].slice(-40); }
    set(patch);
  };
  const priceLine = (wk) => { const p = workPrice(wk); return `Uus komplektihind on ${eur(p.total)} (${p.count} toodet, tavahind ${eur(p.regular)}, soodustus ${pctText(p.rate)}).`; };
  const catHit = CAT_WORDS.find((c) => findWords(t, c[1]).length);
  const pick = (list) => {
    if (catHit) {
      const inCat = list.filter((i) => P[i.product].category === catHit[0]);
      if (!inCat.length) return null;
      const words = findWords(t, catHit[1]);
      return inCat.find((i) => findWords(P[i.product].name.toLowerCase(), words).length) || inCat.find((i) => i.slot === s.sel) || inCat[0];
    }
    return list.find((i) => i.slot === s.sel) || null;
  };

  if (/(võta|tee).*tagasi|^tagasi|ennista|undo/.test(t) && !/lisa/.test(t)) {
    if (!s.history.length) return finish('Pole veel midagi, mida tagasi võtta.');
    const prev = s.history[s.history.length - 1];
    return set({ input: '', work: prev, history: s.history.slice(0, -1), messages: [...s.messages, msg('user', text), msg('ai', `Võtsin viimase muudatuse tagasi. ${priceLine(prev)}`)] });
  }
  if (/lisa.*tagasi|too tagasi|taasta/.test(t)) {
    const r = pick(w.removed) || w.removed[0];
    if (!r) return finish('Komplektist pole midagi välja jäetud.');
    w.removed = w.removed.filter((i) => i.slot !== r.slot);
    w.items.push(r); sortBySet(w);
    return finish(`Lisasin tagasi: ${P[r.product].name}. ${priceLine(w)}`, w, { sel: r.slot });
  }
  if (/jäta.*välja|eemalda|ilma|ei taha|ei vaja|võta ära|on juba olemas|mul on juba/.test(t)) {
    const target = pick(w.items);
    if (!target) return finish(catHit ? `Selles komplektis pole seda tooteliiki. Praegu on komplektis: ${w.items.map((i) => P[i.product].name).join(', ')}.` : 'Millise eseme välja jätan? Vali see pildilt või nimekirjast või kirjuta näiteks „Jäta lamp välja”.');
    w.items = w.items.filter((i) => i.slot !== target.slot);
    w.removed.push(target);
    if (!w.items.length) return finish('Jätsin välja ka viimase toote – komplekt on nüüd tühi. Lisa tooteid tagasi nimekirjast.', w, { sel: null });
    return finish(`Jätsin välja: ${P[target.product].name}. ${priceLine(w)}`, w, { sel: null, swapOpen: null });
  }
  const num = t.match(/(\d{2,4})/);
  if (num && /(alla|kuni|max|eelarve|eur|€|hind)/.test(t)) {
    const limit = parseInt(num[1], 10);
    const res = fitBudget(w, limit);
    if (!res.changes.length) return finish(`Komplekt mahub juba ${limit} euro sisse: ${eur(workPrice(w).total)}.`);
    return finish(`${res.ok ? `Hoidsin koguhinna alla ${limit} euro. ` : `Alla ${limit} euro ei jõua ilma komplekti lõhkumata, aga vähendasin hinda nii palju kui mõistlik. `}Muudatused: ${res.changes.join('; ')}. ${priceLine(res.work)}`, res.work, { sel: null, swapOpen: null });
  }
  const toTag = (tags, label) => {
    const changed = [];
    w.items.forEach((i) => {
      const p = P[i.product];
      if (tags.some((tg) => p.tags.includes(tg))) return;
      const alt = p.alts.map((id) => P[id]).filter(Boolean).find((a) => tags.some((tg) => a.tags.includes(tg)));
      if (alt) { changed.push(`${p.name} → ${alt.name}`); i.product = alt.id; }
    });
    if (!changed.length) return finish(`Selles tervikus on ${label} juba seal, kus see sobib. Proovi mõnda teist komplekti või vaheta tooteid käsitsi.`);
    return finish(`Lisasin ${label}: ${changed.join('; ')}. ${priceLine(w)}`, w, { sel: null, swapOpen: null });
  };
  if (/roheli/.test(t)) return toTag(['roheline'], 'rohelist');
  if (/must|kuld|tumedam|julgem/.test(t)) return toTag(['mustkuld'], 'musta ja kuldset');
  if (/rahulik|heledam|neutraal|vaiksem|pehmem/.test(t)) {
    const tg = pick(w.items) || w.items.find((i) => P[i.product].category === 'Padjakate');
    if (!tg) return finish('Vali ese, mida soovid rahulikumaks muuta, ja proovi uuesti.');
    const p0 = P[tg.product];
    const calm = p0.alts.map((id) => P[id]).filter(Boolean).find((a) => a.tags.includes('rahulik') || a.tags.includes('hele'));
    if (!calm) return finish(`${p0.name} on juba selle komplekti rahulikum valik. Vaata teisi asendusi nimekirjast.`, null, { sel: tg.slot, swapOpen: tg.slot });
    w.items.forEach((i) => { if (i.slot === tg.slot) i.product = calm.id; });
    return finish(`Asendasin: ${p0.name} → ${calm.name} (${calm.colorName}). ${priceLine(w)}`, w, { sel: tg.slot });
  }
  if (/asenda|vaheta|muu|teine/.test(t)) {
    const tgt = pick(w.items);
    if (!tgt) return finish('Millist toodet asendame? Vali see pildilt või kirjuta näiteks „Asenda pleed”.');
    return finish(`Avasin asendused tootele „${P[tgt.product].name}”. Vali nimekirjast sobiv.`, null, { sel: tgt.slot, swapOpen: tgt.slot });
  }
  return finish('Sellest ma demos veel aru ei saa. Proovi näiteks: „Tahan rohkem rohelist”, „Asenda see padi rahulikuma tooniga”, „Jäta lamp välja” või „Hoia koguhind alla 250 euro”.');
}

/* ---------------- sign-up (Postgres) ---------------- */
async function submitSignup() {
  const s = state.signup;
  if (!s.consent) return set({ signup: { ...s, status: 'error', msg: 'Palun kinnita, et võime sulle kirjutada.' } });
  set({ signup: { ...s, status: 'sending', msg: '' } });
  try {
    const res = await fetch('/api/signups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: s.email, consent: true, source: 'home' }) });
    if (res.ok) return set({ signup: { email: '', consent: false, status: 'done', msg: 'Aitäh! Anname teada, kui pood avatakse.' } });
    const data = await res.json().catch(() => ({}));
    const detail = typeof data.detail === 'string' ? data.detail : 'Palun kontrolli e-posti aadressi.';
    set({ signup: { ...state.signup, status: 'error', msg: detail } });
  } catch {
    set({ signup: { ...state.signup, status: 'error', msg: 'Ühendus ebaõnnestus. Proovi uuesti.' } });
  }
}

/* ---------------- render helpers ---------------- */
function productVisual(p, kind) {
  if (p.images && p.images.cutout) {
    return `<img src="${esc(p.images.cutout)}" alt="" draggable="false"${p.category === 'Kunstitrükk' ? ' class="framed"' : ''}>`;
  }
  return productArt(kind || p.kind, p.colors);
}
function thumb(p, extra = '', attrs = '') {
  const inner = p.images && (p.images.cutout || p.images.photo)
    ? `<img src="${esc(p.images.cutout || p.images.photo)}" alt="">`
    : productArt(p.kind, p.colors, true);
  return attrs ? `<button type="button" class="thumb thumb-lg ${extra}" ${attrs}>${inner}</button>` : `<span class="thumb ${extra}">${inner}</span>`;
}
function layer(it, opts = {}) {
  const p = P[it.product];
  const sel = opts.interactive && state.sel === it.slot;
  const style = `left:${it.x}%;top:${it.y}%;width:${it.w}%;z-index:${(KIND_Z[it.kind] || 2) + (sel ? 20 : 0)}`;
  if (opts.interactive) {
    return `<button type="button" class="layer${sel ? ' sel' : ''}" data-layer="${esc(it.slot)}" data-act="select" data-slot="${esc(it.slot)}" aria-label="${esc(p.name)}${sel ? ', valitud' : ''}. Lohista või liiguta nooleklahvidega." style="${style}">${productVisual(p, it.kind)}</button>`;
  }
  return `<div class="layer" style="${style}">${productVisual(p, it.kind)}</div>`;
}
function stage({ room, items = [], photo = null, interactive = false, extra = '', id = '' }) {
  const bg = photo ? `<img class="photo" src="${esc(photo)}" alt="Sinu toa foto">` : roomScene(room);
  return `<div class="stage"${id ? ` id="${id}"` : ''}>${bg}${items.map((it) => layer(it, { interactive })).join('')}${extra}</div>`;
}
const illustr = (pos = 'br', text = 'Illustratiivne eelvaade') => `<span class="stage-tag ${pos}">${esc(text)}</span>`;

/* ---------------- views ---------------- */
function header() {
  const n = state.cart.length;
  return `<header class="site-header"><div class="wrap">
<button type="button" class="brand" data-act="go-home" aria-label="${BRAND} avaleht">${BRAND}</button>
<span class="pill">Prototüüp</span>
<nav class="nav" aria-label="Peamenüü">
<button type="button" class="nav-link hide-m" data-act="go-sets">Komplektid</button>
<button type="button" class="nav-link hide-m" data-act="go-season">Hooajalised</button>
<button type="button" class="btn btn-outline btn-sm" style="color:var(--green);border-color:var(--green)" data-act="start">Kujunda oma tuba</button>
<button type="button" class="cart-btn" data-act="go-cart" aria-label="Näidisostukorv, ${n} komplekti">${ICON.cart}<span>${n}</span></button>
</nav></div></header>`;
}

function setCard(s) {
  const pr = recPrice(makeRec(s, 'full'));
  return `<article class="set-card">
<button type="button" class="media" data-act="open-set" data-id="${esc(s.id)}" aria-label="Ava komplekt ${esc(s.name)} toa vaates">${stage({ room: s.room, items: s.items })}</button>
<div class="meta-row"><span>${esc(ROOMS[s.room]?.name || s.room)}</span><span>${pr.count} toodet</span></div>
<h3>${esc(s.name)}</h3>
<p>${esc(s.summary)}</p>
<div class="prices"><span class="big">${eur(pr.total)}</span><span class="rest">komplektihind · eraldi <s>${eur(pr.regular)}</s></span></div>
<button type="button" class="link" style="align-self:flex-start" data-act="open-set" data-id="${esc(s.id)}">Vaata ja kohanda</button>
</article>`;
}

function home() {
  const hero = SETS[HERO_SET] || SET_LIST[0];
  const heroPrice = recPrice(makeRec(hero, 'full'));
  const ba = SETS[BA_SET] || SET_LIST[0];
  const baPrice = recPrice(makeRec(ba, 'full'));
  const exItems = hero.items.slice(0, -1);
  const ex = priceBundle(hero, exItems.map((i) => P[i.product].price), 1);
  const exName = P[hero.items[hero.items.length - 1].product].name.split(' ')[0].toLowerCase();
  const filters = [{ id: 'koik', name: 'Kõik' }, ...ROOM_LIST];
  const shown = SET_LIST.filter((s) => !s.seasonal && (state.filter === 'koik' || s.room === state.filter));
  const seasonal = SET_LIST.filter((s) => s.seasonal);
  const su = state.signup;
  return `<main>
<section class="wrap hero">
<div class="hero-text">
<p class="eyebrow">Sisustuskomplektid 150–350 €</p>
<h1 class="display">Ilus tervik. <em>Sinu kodu moodi.</em></h1>
<p class="lead">Näita oma tuba ja leiame kokku sobivad sisustusesemed sinu stiili ning eelarve järgi.</p>
<div class="btn-row"><button type="button" class="btn btn-primary" data-act="start">Leia minu toa tervik ${ICON.arrow}</button><button type="button" class="btn btn-outline" data-act="go-sets">Vaata sisustuskomplekte</button></div>
<p class="note-line">Sinu suur mööbel jääb paigale – lisame tekstiilid, valguse ja detailid.</p>
</div>
<div class="hero-media">
${stage({ room: hero.room, items: hero.items, extra: illustr('tr') })}
<div class="hero-card">
<div class="eyebrow" style="margin:0;font-size:11px">Näide tervikust · ${esc(ROOMS[hero.room]?.name || '')}</div>
<div class="name">${esc(hero.name)}</div>
<div class="thumbs">${hero.items.map((i) => thumb(P[i.product])).join('')}</div>
<div class="price-line"><span class="muted">${heroPrice.count} toodet · <s>${eur(heroPrice.regular)}</s></span><span class="price-strong" style="font-size:18px">${eur(heroPrice.total)}</span></div>
</div>
</div>
</section>

<section class="band"><div class="wrap steps">
<div><div class="num">01</div><h2>Näita oma tuba</h2><p>Tee telefoniga foto või proovi näidistoaga. Diivan, voodi ja kapid jäävad paigale.</p></div>
<div><div class="num">02</div><h2>Leia sobiv tervik</h2><p>Vasta paarile lühikesele küsimusele. Abiline pakub kaks omavahel sobivat komplekti sinu eelarve piires.</p></div>
<div><div class="num">03</div><h2>Kohanda ja telli</h2><p>Vaheta või jäta esemeid välja ja näe kohe uut hinda. Telli kogu tervik korraga.</p></div>
</div></section>

<section id="komplektid" class="band-sand"><div class="wrap section">
<div class="section-head"><div><h2 class="h2">Kujundatud tervikud</h2><p>Iga komplekt on kokku pandud kindla ruumi jaoks. Terve komplekt on soodsam kui samad tooted eraldi.</p></div>
<div class="filters" role="group" aria-label="Filtreeri ruumi järgi">${filters.map((f) => `<button type="button" class="chip" data-act="filter" data-id="${esc(f.id)}" aria-pressed="${state.filter === f.id}">${esc(f.name)}</button>`).join('')}</div></div>
<div class="cards">${shown.length ? shown.map(setCard).join('') : '<p class="muted">Selle ruumi komplektid on veel tulekul.</p>'}</div>
</div></section>

<section class="wrap section split">
<div class="text">
<p class="eyebrow">Enne ja pärast</p>
<h2 class="h2">Sama tuba, uus tervik</h2>
<p style="margin:0 0 24px;color:var(--ink2);font-size:17px">${esc(ROOMS[ba.room]?.name || '')} enne ja pärast komplekti „${esc(ba.name)}”. Suur mööbel ja seinad jäid samaks – muutusid tekstiilid, valgus ja seinapilt.</p>
<label class="muted" style="display:block;font-size:14px">Liiguta liugurit, et võrrelda<input type="range" min="0" max="100" value="${state.ba}" data-range="ba" aria-label="Enne ja pärast võrdlus"></label>
<p style="margin:18px 0 0">${baPrice.count} toodet · komplektihind <strong style="color:var(--green)">${eur(baPrice.total)}</strong></p>
</div>
<div class="media">
${stage({ room: ba.room, items: ba.items, extra: illustr('br') })}
<div class="ba-before" id="ba-before" style="clip-path:inset(0 ${100 - state.ba}% 0 0)">${stage({ room: ba.room })}</div>
<div class="ba-line" id="ba-line" style="left:${state.ba}%"></div>
<span class="ba-label l">Enne</span><span class="ba-label r">Pärast</span>
</div>
</section>

<section class="band-sage"><div class="wrap section split" style="align-items:flex-start">
<div class="text" style="max-width:520px"><h2 class="h2">Sinu lemmikud jäävad alles</h2><p style="margin:0;color:var(--ink2);font-size:17px">Me ei alusta tühjast toast. Komplekt täiendab seda, mis sul juba on. Kui sul on sobiv lamp või vaip olemas, jäta see komplektist välja – hind arvutub kohe ümber.</p></div>
<div class="features">
<div>${ICON.sofa}<h3>Suur mööbel jääb paigale</h3><p>Diivan, voodi ja kapid jäävad. Lisame tekstiilid, valguse, kunsti ja detailid.</p></div>
<div>${ICON.minus}<h3>Jäta välja, mis on olemas</h3><p>Näide: „${esc(hero.name)}” ilma ${esc(exName)}ita maksab ${eur(ex.total)} (${eur(ex.regular)} − ${pctText(ex.rate)} soodustust).</p></div>
<div>${ICON.list}<h3>Selged hinnareeglid</h3><p>Täiskomplektil on suurim soodustus. Iga eemaldatud toode vähendab koguhinda.</p></div>
</div></div></section>

<section id="hooaeg" class="wrap section">
<div class="split" style="gap:32px">
<div class="text" style="max-width:420px">
<p class="eyebrow">Hooajalised tervikud</p>
<h2 style="font-family:var(--serif);font-weight:400;font-size:34px;line-height:1.15;margin-bottom:12px">Pidulik meeleolu olemasolevasse tuppa</h2>
<p class="muted" style="margin:0 0 16px">Hooajalised komplektid tulevad ja lähevad. Need sobivad sinu igapäevase terviku juurde.</p>
<ul class="season-list"><li><span>Jõulud</span><span style="color:var(--green);font-weight:600">Saadaval</span></li><li><span>Halloween</span><span class="muted">Kollektsioon lisandub hiljem</span></li></ul>
</div>
<div style="flex:1.4 1 420px;min-width:0;display:grid;gap:32px">${seasonal.map(setCard).join('')}</div>
</div>
</section>

<section id="liitu" class="band-green"><div class="wrap section signup">
<div style="max-width:560px">
<h2 class="h2">Valmis oma tuba näitama?</h2>
<p style="margin:0 0 24px;font-size:17px;color:#D9E2DA">Alusta fotoga või proovi näidistoaga. Pood avatakse peagi – jäta e-post ja anname teada.</p>
<button type="button" class="btn btn-light" data-act="start">Leia minu toa tervik</button>
</div>
<form data-form="signup" novalidate>
<label for="signup-email" style="font-weight:600">Teata, kui pood avatakse</label>
<div class="row"><input id="signup-email" type="email" autocomplete="email" placeholder="sinu@e-post.ee" value="${esc(su.email)}" required>
<button type="submit" class="btn btn-light"${su.status === 'sending' ? ' disabled' : ''}>${su.status === 'sending' ? 'Saadan…' : 'Teata mulle'}</button></div>
<label class="consent"><input type="checkbox" id="signup-consent"${su.consent ? ' checked' : ''}> Nõustun, et ${BRAND} saadab mulle e-kirja poe avamisest. E-posti ei jagata ega kasutata muuks.</label>
${su.msg ? `<p class="msg ${su.status === 'done' ? 'ok' : 'err'}" role="${su.status === 'done' ? 'status' : 'alert'}">${esc(su.msg)}</p>` : ''}
</form>
</div></section>
</main>`;
}

function chatColumn() {
  const s = state;
  const step = s.step;
  const room = ROOMS[s.answers.room];
  const chips = ORDER.filter((k) => s.answers[k] != null);
  let quick = [];
  if (step === 'room') quick = ROOM_LIST.map((r) => ({ act: 'answer', key: 'room', value: r.id, label: r.name }));
  if (step === 'photo') quick = [{ act: 'use-sample', label: 'Proovi näidistoaga' }];
  if (step === 'change') quick = CHANGES.map((c) => ({ act: 'answer', key: 'change', value: c.id, label: c.label }));
  if (step === 'keep') quick = (room ? room.keeps : []).map((k) => ({ act: 'answer', key: 'keep', value: k, label: k }));
  if (step === 'budget') quick = BUDGETS.map((b) => ({ act: 'answer', key: 'budget', value: b.v, label: b.label }));
  if (step === 'results') quick = s.recs.map((r, i) => ({ act: 'open-rec', i, label: `Ava „${SETS[r.setId].name}”` }));
  if (step === 'customize') quick = SAMPLE_COMMANDS.map((c) => ({ act: 'cmd', text: c, label: c }));
  const quickHtml = quick.map((q) => `<button type="button" class="chip chip-white" data-act="${q.act}"${q.key ? ` data-key="${q.key}" data-value="${esc(q.value)}"` : ''}${q.i != null ? ` data-i="${q.i}"` : ''}${q.text ? ` data-text="${esc(q.text)}"` : ''} data-label="${esc(q.label)}">${esc(q.label)}</button>`).join('');
  const photoInputs = step === 'photo' ? `
<label class="btn btn-primary btn-sm file-btn"><input type="file" accept="image/*" capture="environment" class="sr" data-file>${ICON.camera}Tee foto</label>
<label class="btn btn-outline btn-sm file-btn" style="color:var(--green);border-color:var(--green)"><input type="file" accept="image/*" class="sr" data-file>${ICON.image}Vali galeriist</label>` : '';
  const moods = step === 'mood' ? `<div class="moods">${MOODS.map((m) => `<button type="button" class="mood" data-act="answer" data-key="mood" data-value="${m.id}" data-label="${esc(m.label)}"><div class="pic" style="background:${m.bg}">${m.items.map((i) => `<div style="${i.pos}">${productArt(i.kind, i.colors)}</div>`).join('')}</div><div class="label">${esc(m.label)}</div></button>`).join('')}</div>` : '';
  return `<section class="chat" aria-label="Sisustusabiline">
<div class="chat-head"><div class="top"><h1>Sisustusabiline</h1><span class="pill">Demo</span></div>
<p>Näidisvestlus: vastused tulevad eelnevalt koostatud reeglitest ja kataloogist, mitte päris tehisintellektist.</p></div>
${chips.length ? `<div class="answers"><div class="small muted">Sinu valikud – vajuta, et muuta</div><div class="list">${chips.map((k) => `<button type="button" class="answer-chip" data-act="edit-answer" data-key="${k}" aria-label="Muuda: ${QUESTION_SHORT[k]} – praegu ${esc(answerLabel(k))}">${esc(answerLabel(k))} ✎</button>`).join('')}</div></div>` : ''}
<div class="msgs" id="msgs" aria-live="polite">
${s.messages.map((m) => m.from === 'ai' ? `<div class="msg ai"><div class="who">Abiline</div>${esc(m.text)}</div>` : `<div class="msg user">${esc(m.text)}</div>`).join('')}
${step === 'thinking' ? '<div class="msg muted pulse">Otsin sinu toale sobivaid tervikuid…</div>' : ''}
</div>
<div class="quick">${photoInputs}${quickHtml}${moods}</div>
<form class="chat-form" data-form="chat">
<label for="chat-input" class="sr">Kirjuta abilisele</label>
<input id="chat-input" type="text" autocomplete="off" value="${esc(s.input)}" placeholder="${esc(PLACEHOLDERS[step] || 'Kirjuta abilisele…')}">
<button type="submit" class="send" aria-label="Saada">${ICON.arrow}</button>
</form>
</section>`;
}

function workspace() {
  const s = state;
  const step = s.step;
  const room = ROOMS[s.answers.room];
  const roomId = room ? room.id : 'elutuba';
  if (step === 'room') {
    return `<h2 class="ws-title">Millist tuba kujundame?</h2><p class="muted" style="margin:0 0 20px">Vali ruum siit või vestluses. Igal ruumil on oma kujundatud tervikud.</p>
<div class="rooms-grid">${ROOM_LIST.map((r) => `<button type="button" class="room-tile" data-act="answer" data-key="room" data-value="${esc(r.id)}" data-label="${esc(r.name)}">${stage({ room: r.id })}<div class="name">${esc(r.name)}</div></button>`).join('')}</div>`;
  }
  if (step === 'photo') {
    return `<div class="upload">
${ICON.camera.replace('width="18" height="18"', 'width="44" height="44"')}
<h2>Lisa foto oma toast</h2>
<p class="muted">Pildista nii, et näha oleks suurem mööbel ja vaba seinapind. Sobib tavaline telefonifoto (JPG või PNG).</p>
<div class="btn-row" style="justify-content:center">
<label class="btn btn-primary file-btn"><input type="file" accept="image/*" capture="environment" class="sr" data-file>Tee foto</label>
<label class="btn btn-outline file-btn"><input type="file" accept="image/*" class="sr" data-file>Vali galeriist või failidest</label>
</div>
<button type="button" class="link" data-act="use-sample">Proovi näidistoaga (${esc(room ? room.name.toLowerCase() : 'näidistuba')})</button>
${s.photoLoading ? '<p role="status" class="pulse" style="margin:0;color:var(--green);font-weight:600">Laen eelvaadet…</p>' : ''}
${s.photoError ? `<p role="alert" class="alert">${esc(s.photoError)}</p>` : ''}
<p class="small muted" style="margin-top:8px">Fotot kasutatakse ainult selles brauseriaknas eelvaate taustana. Seda ei saadeta serverisse ega salvestata – lehe sulgemisel või värskendamisel kaob see.</p>
</div>`;
  }
  if (['change', 'keep', 'mood', 'budget'].includes(step)) {
    return `<div class="ws-bar"><h2 class="ws-title" style="margin:0">Sinu ${esc(room ? room.name.toLowerCase() : 'tuba')}</h2>
<div class="btn-row" style="gap:8px"><label class="chip file-btn" style="display:inline-flex;align-items:center"><input type="file" accept="image/*" class="sr" data-file>${s.photoUrl ? 'Vaheta fotot' : 'Lisa oma foto'}</label>
${s.photoUrl ? '<button type="button" class="chip" data-act="remove-photo">Eemalda foto</button>' : ''}</div></div>
${stage({ room: roomId, photo: s.photoUrl, extra: `<span class="stage-label">${s.photoUrl ? 'Sinu foto · algne' : 'Näidistuba · algne'}</span>` })}
${s.photoError ? `<p role="alert" class="alert" style="margin-top:12px">${esc(s.photoError)}</p>` : ''}
<p class="muted" style="margin:14px 0 0">Vasta abilise küsimustele – soovitused ilmuvad siia. Valitud vastuseid saad alati muuta.</p>`;
  }
  if (step === 'thinking') {
    return `<div role="status"><h2 class="ws-title">Sobitan tervikuid…</h2><div class="skeletons"><div class="pulse"></div><div class="pulse"></div></div>
<p class="muted" style="margin:16px 0 0">Võrdlen sinu vastuseid komplektide toonide, materjalide ja hindadega.</p></div>`;
  }
  if (step === 'results') {
    return `<h2 class="ws-title">Kaks tervikut sinu toale</h2><p class="muted" style="margin:0 0 22px">Valitud sinu vastuste järgi. Kumbagi saad oma toa taustal vaadata ja kohandada.</p>
<div class="recs">${s.recs.map((r, i) => {
      const set_ = SETS[r.setId];
      const w = workFromRec(r);
      const pr = workPrice(w);
      return `<article class="rec">
${stage({ room: set_.room, items: w.items, photo: s.photoUrl, extra: illustr('br') + (r.variant === 'lite' ? '<span class="badge-green">Eelarvesõbralikum variant</span>' : '') })}
<div class="eyebrow" style="margin:0;font-size:12px">Soovitus ${i + 1}</div>
<h3>${esc(set_.name)}</h3>
<p style="margin:0">${esc(set_.summary)}</p>
<div class="why"><div style="font-size:13px;font-weight:700;margin-bottom:6px">Miks see sobib</div><ul>${recReasons(r, s.answers).slice(0, 5).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div class="total"><span>${pr.count} toodet · komplektihind</span><span class="big">${eur(pr.total)}</span><span class="small muted">eraldi <s>${eur(pr.regular)}</s> · säästad ${eur(pr.discount)}</span></div>
<div class="btn-row" style="gap:10px"><button type="button" class="btn btn-primary btn-sm" data-act="open-rec" data-i="${i}">Vaata oma toas</button><button type="button" class="btn btn-outline btn-sm" data-act="open-rec" data-i="${i}" data-focus="1">Kohanda komplekti</button></div>
</article>`;
    }).join('')}</div>`;
  }
  if (step === 'customize' && s.work) return customize();
  return '';
}

function customize() {
  const s = state;
  const w = s.work;
  const set_ = SETS[w.setId];
  const pr = workPrice(w);
  const sel = w.items.find((i) => i.slot === s.sel);
  const labels = ['Täiskomplekt', '1 toode vähem', '2 toodet vähem', 'Rohkem'];
  const removedN = Math.min(w.removed.length, 3);
  const items = w.items.map((it) => {
    const p = P[it.product];
    const open = s.swapOpen === it.slot;
    const alts = p.alts.map((id) => P[id]).filter(Boolean);
    return `<li class="pitem"><div class="row">
${thumb(p, s.sel === it.slot ? 'sel' : '', `data-act="select" data-slot="${esc(it.slot)}" aria-label="Vali ${esc(p.name)}"`)}
<div class="info"><div class="name">${esc(p.name)}</div><div class="meta">${esc([p.category, p.colorName, p.material, p.dims].join(' · '))}</div><div class="sku">${esc(p.id)}${p.demo ? ' · näidistoode' : ''}</div></div>
<div class="price">${eur(p.price)}</div></div>
<div class="acts"><button type="button" class="chip chip-sm" data-act="toggle-swap" data-slot="${esc(it.slot)}" aria-expanded="${open}">${open ? 'Sulge asendused' : `Asenda (${alts.length})`}</button><button type="button" class="chip chip-sm" data-act="remove" data-slot="${esc(it.slot)}">Eemalda</button></div>
${open ? `<div class="alts">${alts.length ? alts.map((a) => { const d = a.price - p.price; return `<div class="alt">${thumb(a)}<div class="info"><div style="font-weight:600">${esc(a.name)}</div><div class="muted">${esc(a.colorName)}, ${esc(a.material)} · ${eur(a.price)} (${d === 0 ? 'sama hind' : (d > 0 ? '+' : '−') + eur(Math.abs(d))})</div></div><button type="button" class="mini-green" data-act="swap" data-slot="${esc(it.slot)}" data-pid="${esc(a.id)}" aria-label="Asenda tootega ${esc(a.name)}">Vali</button></div>`; }).join('') : '<p class="small muted" style="margin:8px 0">Sellele tootele pole asendust valitud. Saad selle välja jätta.</p>'}</div>` : ''}
</li>`;
  }).join('');
  return `<div class="cust-head">
<button type="button" class="link" style="text-decoration:none" data-act="back">← ${s.recs.length ? 'Soovituste juurde' : 'Leia mulle sobivaim'}</button>
<div class="title"><div class="eyebrow" style="margin:0;font-size:12px">${esc(ROOMS[set_.room]?.name || '')} · ${pr.count} toodet</div><h2>${esc(set_.name)}${w.variant === 'lite' ? ' · kergem variant' : ''}</h2></div>
<div class="seg" role="group" aria-label="Vaade"><button type="button" data-act="view-original" aria-pressed="${!s.designed}">Algne</button><button type="button" data-act="view-designed" aria-pressed="${s.designed}">Kujundatud</button></div>
<button type="button" class="undo" data-act="undo"${s.history.length ? '' : ' disabled'}>${ICON.undo}Võta tagasi</button>
</div>
<div class="cust-grid">
<div class="left">
${stage({ room: set_.room, items: s.designed ? w.items : [], photo: s.photoUrl, interactive: true, id: 'stage', extra: illustr('bl', 'Illustratiivne eelvaade – mitte täpsed mõõdud') + (s.designed && !w.items.length ? '<div class="stage-label" style="top:45%;left:50%;transform:translateX(-50%);text-transform:none;letter-spacing:0;font-size:15px">Kõik tooted on komplektist välja jäetud.</div>' : '') })}
${sel ? `<div class="tools" role="group" aria-label="Valitud ese"><span style="font-size:14px;margin-right:6px"><span class="muted">Valitud:</span> <strong>${esc(P[sel.product].name)}</strong></span>
<button type="button" class="round" data-act="nudge" data-dx="-1.5" data-dy="0" aria-label="Liiguta vasakule">←</button><button type="button" class="round" data-act="nudge" data-dx="0" data-dy="-1.5" aria-label="Liiguta üles">↑</button><button type="button" class="round" data-act="nudge" data-dx="0" data-dy="1.5" aria-label="Liiguta alla">↓</button><button type="button" class="round" data-act="nudge" data-dx="1.5" data-dy="0" aria-label="Liiguta paremale">→</button>
<button type="button" class="round" data-act="resize" data-d="-1" aria-label="Väiksemaks">−</button><button type="button" class="round" data-act="resize" data-d="1" aria-label="Suuremaks">+</button>
<button type="button" class="chip" style="border-color:var(--green);color:var(--green);font-weight:600" data-act="toggle-swap" data-slot="${esc(sel.slot)}" data-scroll="tooted">Asenda</button><button type="button" class="chip" data-act="remove" data-slot="${esc(sel.slot)}">Eemalda</button></div>`
      : '<p class="small muted" style="margin:14px 0 0">Vali ese pildilt või nimekirjast. Lohista, et liigutada; nooleklahvid ja +/− töötavad ka klaviatuuriga.</p>'}
</div>
<aside class="panel" id="tooted" aria-label="Komplekti tooted">
<h3>Komplektis</h3><ul class="plist">${items}</ul>
${w.removed.length ? `<h3 style="margin-top:18px">Välja jäetud</h3><ul class="plist removed">${w.removed.map((it) => `<li><span style="flex:1;min-width:0;font-size:14px"><s>${esc(P[it.product].name)}</s> · ${eur(P[it.product].price)}</span><button type="button" class="chip chip-sm" data-act="restore" data-slot="${esc(it.slot)}">Lisa tagasi</button></li>`).join('')}</ul>` : ''}
<div class="summary"><dl>
<dt>Tavahind (${pr.count} toodet)</dt><dd>${eur(pr.regular)}</dd>
<dt>Komplektisoodustus ${pctText(pr.rate)}</dt><dd style="color:var(--green)">−${eur(pr.discount)}</dd>
<dt class="tot">Komplektihind</dt><dd class="tot">${eur(pr.total)}</dd></dl>
<div class="small muted" style="margin-top:12px">Soodustuse reegel</div>
<div class="tiers">${labels.map((l, n) => `<span class="tier${n === removedN ? ' on' : ''}">${l} −${pctText(n < set_.discounts.length ? set_.discounts[n] : 0)}</span>`).join('')}</div>
<button type="button" class="btn btn-primary" data-act="add-cart"${w.items.length ? '' : ' disabled'}>Lisa komplekt ostukorvi</button>
<p class="small muted" style="margin:10px 0 0">Näidisostukorv – päris tellimust ega makset ei tehta.</p>
</div>
</aside>
</div>
<div class="mbar"><div style="flex:1;min-width:0;line-height:1.2"><div class="small muted">${pr.count} toodet</div><div style="font-weight:700;font-size:19px;color:var(--green)">${eur(pr.total)}</div></div>
<a href="#tooted" class="chip" style="display:inline-flex;align-items:center;text-decoration:none;color:var(--ink)">Tooted</a>
<button type="button" class="btn btn-primary btn-sm" data-act="add-cart"${w.items.length ? '' : ' disabled'}>Ostukorvi</button></div>`;
}

function studio() {
  return `<main class="wrap studio">${chatColumn()}<section class="ws" id="toaala" aria-label="Tööala">${workspace()}</section></main>`;
}

function cart() {
  let regular = 0, discount = 0, total = 0;
  const lines = state.cart.map((line) => {
    const set_ = SETS[line.setId];
    const pr = priceBundle(set_, line.items.map((i) => P[i.product].price), line.removed.length);
    regular += pr.regular; discount += pr.discount; total += pr.total;
    return `<article class="cart-line">
<div class="media">${stage({ room: set_.room, items: line.items })}</div>
<div class="info"><div class="eyebrow" style="margin:0;font-size:12px">${esc(ROOMS[set_.room]?.name || '')}</div><h2>${esc(set_.name)}</h2>
<ul>${line.items.map((i) => `<li><span>${esc(P[i.product].name)} <span class="muted">· ${esc(i.product)}</span></span><span>${eur(P[i.product].price)}</span></li>`).join('')}</ul>
${line.removed.length ? `<p class="small muted" style="margin:0 0 8px">Välja jäetud: ${esc(line.removed.map((i) => P[i.product].name).join(', '))}</p>` : ''}
<button type="button" class="link danger" data-act="cart-remove" data-id="${line.id}">Eemalda ostukorvist</button></div>
<dl><dt class="muted">Tavahind</dt><dd>${eur(pr.regular)}</dd><dt class="muted">Soodustus ${pctText(pr.rate)}</dt><dd style="color:var(--green)">−${eur(pr.discount)}</dd><dt style="font-weight:700">Komplektihind</dt><dd style="font-weight:700;font-size:18px;color:var(--green)">${eur(pr.total)}</dd></dl>
</article>`;
  }).join('');
  return `<main class="cart">
<h1>Näidisostukorv</h1>
<p class="muted" style="margin:0 0 28px">Prototüüp: ostukorv on olemas ainult selles brauseriaknas ega salvestu. Päris tellimusi ega makseid ei tehta.</p>
${state.cart.length ? `${lines}
<div class="cart-total"><dl><dt class="muted">Tavahind kokku</dt><dd>${eur(regular)}</dd><dt class="muted">Komplektisoodustused</dt><dd style="color:var(--green)">−${eur(discount)}</dd><dt style="font-weight:700;font-size:18px">Kokku</dt><dd style="font-weight:700;font-size:24px;color:var(--green)">${eur(total)}</dd></dl>
<div style="max-width:320px"><button type="button" class="btn" style="width:100%" disabled>Vormista tellimus</button><p class="small muted" style="margin:8px 0 0">Kassa ühendatakse hiljem (nt Shopify). <button type="button" class="link" style="min-height:0;padding:0;font-size:13px" data-act="go-signup">Jäta e-post</button> ja anname avamisest teada.</p></div></div>`
    : `<div style="border-top:1px solid var(--line);padding:40px 0"><p style="margin:0 0 18px;font-size:18px">Ostukorv on veel tühi.</p><div class="btn-row"><button type="button" class="btn btn-primary" data-act="start">Leia minu toa tervik</button><button type="button" class="btn btn-outline" data-act="go-sets">Vaata sisustuskomplekte</button></div></div>`}
</main>`;
}

function footer() {
  return `<footer class="site-footer"><div class="wrap"><span class="brand-f">${BRAND}</span><span>Prototüüp. Hinnad ja osa tootepilte on näidisandmed; toavaated on illustratiivsed.</span></div></footer>`;
}

/* ---------------- render ---------------- */
function render() {
  if (state.status === 'loading') { root.innerHTML = '<div class="state-box muted pulse">Laen kataloogi…</div>'; return; }
  if (state.status === 'error') {
    root.innerHTML = `<div class="state-box"><p>Kataloogi laadimine ebaõnnestus.</p><p class="small muted">${esc(state.loadError)}</p><button type="button" class="btn btn-primary" data-act="retry">Proovi uuesti</button></div>`;
    return;
  }
  const active = document.activeElement;
  const focusId = active && active.id ? active.id : null;
  const selStart = active && typeof active.selectionStart === 'number' ? active.selectionStart : null;
  const prevMsgs = document.getElementById('msgs');
  const prevScroll = prevMsgs ? prevMsgs.scrollTop : 0;
  const prevView = root.dataset.view;

  const view = state.view === 'studio' ? studio() : state.view === 'cart' ? cart() : home();
  const toast = state.toast ? `<div class="toast" role="status"><span>${esc(state.toast)}</span><button type="button" data-act="go-cart">Vaata ostukorvi</button></div>` : '';
  root.innerHTML = header() + view + footer() + toast;
  root.dataset.view = state.view;

  if (focusId) {
    const el = document.getElementById(focusId);
    if (el) { el.focus({ preventScroll: true }); if (selStart != null && el.setSelectionRange) { try { el.setSelectionRange(selStart, selStart); } catch { /* email inputs */ } } }
  }
  const msgs = document.getElementById('msgs');
  if (msgs) msgs.scrollTop = state.messages.length !== lastMsgCount ? msgs.scrollHeight : prevScroll;
  lastMsgCount = state.messages.length;
  if (pendingScroll) {
    const el = document.getElementById(pendingScroll);
    pendingScroll = null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (prevView && prevView !== state.view) {
    window.scrollTo(0, 0);
  }
}

/* ---------------- events ---------------- */
const ACTIONS = {
  'go-home': () => set({ view: 'home' }),
  'go-sets': () => { pendingScroll = 'komplektid'; set({ view: 'home' }); },
  'go-season': () => { pendingScroll = 'hooaeg'; set({ view: 'home' }); },
  'go-signup': () => { pendingScroll = 'liitu'; set({ view: 'home' }); },
  'go-cart': () => set({ view: 'cart', toast: null }),
  start: () => startStudio(),
  retry: () => loadCatalog(),
  filter: (d) => set({ filter: d.id }),
  'open-set': (d) => openSetDirect(d.id),
  answer: (d) => answer(d.key, d.key === 'budget' ? parseInt(d.value, 10) : d.value, d.label),
  'edit-answer': (d) => editAnswer(d.key),
  'use-sample': () => answer('photo', 'sample', 'Proovin näidistoaga'),
  'remove-photo': () => removePhoto(),
  'open-rec': (d) => openRec(state.recs[+d.i], d.focus === '1'),
  cmd: (d) => sendText(d.text),
  back: () => backFromCustomize(),
  'view-original': () => set({ designed: false }),
  'view-designed': () => set({ designed: true }),
  undo: () => undo(),
  select: (d) => { if (state.sel !== d.slot) set({ sel: d.slot }); },
  nudge: (d) => nudge(parseFloat(d.dx), parseFloat(d.dy)),
  resize: (d) => resize(parseFloat(d.d)),
  'toggle-swap': (d) => { if (d.scroll) pendingScroll = d.scroll; set({ swapOpen: state.swapOpen === d.slot ? null : d.slot, sel: d.slot }); },
  remove: (d) => removeSlot(d.slot),
  swap: (d) => swap(d.slot, d.pid),
  restore: (d) => restoreSlot(d.slot),
  'add-cart': () => addToCart(),
  'cart-remove': (d) => set({ cart: state.cart.filter((c) => c.id !== d.id) }),
};

document.addEventListener('click', (e) => {
  if (drag && drag.moved) return; // the click that ends a drag
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset); }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'chat-input') state.input = t.value;
  else if (t.id === 'signup-email') state.signup.email = t.value;
  else if (t.dataset.range === 'ba') {
    state.ba = parseInt(t.value, 10) || 0;
    const before = document.getElementById('ba-before');
    const line = document.getElementById('ba-line');
    if (before) before.style.clipPath = `inset(0 ${100 - state.ba}% 0 0)`;
    if (line) line.style.left = `${state.ba}%`;
  }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.matches('input[data-file]')) onFile(t);
  else if (t.id === 'signup-consent') state.signup.consent = t.checked;
});
document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-form]');
  if (!form) return;
  e.preventDefault();
  if (form.dataset.form === 'chat') {
    const text = (state.input || '').trim();
    if (text) sendText(text);
  } else if (form.dataset.form === 'signup') {
    submitSignup();
  }
});
document.addEventListener('keydown', (e) => {
  const el = e.target.closest && e.target.closest('button.layer[data-layer]');
  if (!el) return;
  const slot = el.dataset.layer;
  const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (map[e.key]) { e.preventDefault(); nudge(map[e.key][0], map[e.key][1], slot); }
  else if (e.key === '+' || e.key === '=') { e.preventDefault(); resize(1, slot); }
  else if (e.key === '-') { e.preventDefault(); resize(-1, slot); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSlot(slot); }
  else return;
  requestAnimationFrame(() => { const again = document.querySelector(`button.layer[data-layer="${CSS.escape(slot)}"]`); if (again) again.focus(); });
});

// Dragging products on the room preview: move the element directly, commit on release.
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('#stage button.layer[data-layer]');
  if (!el || (e.button != null && e.button !== 0)) return;
  const it = state.work && state.work.items.find((i) => i.slot === el.dataset.layer);
  if (!it) return;
  const rect = document.getElementById('stage').getBoundingClientRect();
  drag = { slot: it.slot, el, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, x: it.x, y: it.y, rect, moved: false };
  try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
});
document.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = (e.clientX - drag.sx) / drag.rect.width * 100;
  const dy = (e.clientY - drag.sy) / drag.rect.height * 100;
  if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 0.8) return;
  drag.moved = true;
  drag.x = clamp(drag.ox + dx, -10, 100);
  drag.y = clamp(drag.oy + dy, -10, 100);
  drag.el.style.left = `${drag.x}%`;
  drag.el.style.top = `${drag.y}%`;
});
function endDrag() {
  if (!drag) return;
  const d = drag;
  if (d.moved) {
    const w = clone(state.work);
    w.items.forEach((i) => { if (i.slot === d.slot) { i.x = d.x; i.y = d.y; } });
    commit(w, { sel: d.slot });
    setTimeout(() => { drag = null; }, 0); // swallow the click that follows
  } else {
    drag = null;
  }
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

/* ---------------- start ---------------- */
async function loadCatalog() {
  set({ status: 'loading' });
  try {
    const res = await fetch('/api/catalog');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cat = await res.json();
    if (!cat.sets || !cat.sets.length) throw new Error('Kataloog on tühi.');
    indexCatalog(cat);
    set({ status: 'ready' });
  } catch (err) {
    set({ status: 'error', loadError: String(err.message || err) });
  }
}
loadCatalog();
