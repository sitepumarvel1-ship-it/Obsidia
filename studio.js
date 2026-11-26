/* Obsidia Studio: Studio Slide (presentasi + PPTX) dan Studio Video (MP4/WebM). */
(() => {
const O = window.OBS, esc = O.esc, ico = O.ico;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clone = o => JSON.parse(JSON.stringify(o));

/* ================= warna ================= */
const hx2rgb = h => { h = String(h || '#000').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgb2hx = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase();
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; }
function hsl2hx(h, s, l) { h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return rgb2hx(f(0) * 255, f(8) * 255, f(4) * 255); }
const lum = h => { const [r, g, b] = hx2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const rgba = (h, a) => { const [r, g, b] = hx2rgb(h); return `rgba(${r},${g},${b},${a})`; };
const PMODES = [['komplementer', 'Komplementer'], ['analog', 'Analog'], ['triadik', 'Triadik'], ['monokrom', 'Monokrom'], ['terang', 'Terang'], ['lembut', 'Pastel']];
function palette(base, mode) {
  const [h, s] = rgb2hsl(...hx2rgb(base));
  const h2 = { komplementer: h + 180, analog: h + 35, triadik: h + 120, monokrom: h, terang: h + 150, lembut: h + 40 }[mode] ?? h + 180;
  let p;
  if (mode === 'terang' || mode === 'lembut') {
    const soft = mode === 'lembut';
    p = { bg: hsl2hx(h, soft ? 70 : 25, 97), bg2: hsl2hx(h, soft ? 60 : 30, 91), ink: hsl2hx(h, 35, 12), mute: hsl2hx(h, 14, 38), acc: hsl2hx(h, clamp(s, 55, 85), soft ? 55 : 44), acc2: hsl2hx(h2, clamp(s, 45, 80), soft ? 60 : 40) };
  } else {
    p = { bg: hsl2hx(h, clamp(s * .55, 18, 45), 8), bg2: hsl2hx(h, clamp(s * .55, 16, 40), 15), ink: hsl2hx(h, 15, 95), mute: hsl2hx(h, 14, 70), acc: hsl2hx(h, clamp(s, 60, 95), 60), acc2: hsl2hx(h2, clamp(s, 50, 90), mode === 'monokrom' ? 80 : 68) };
  }
  if (contrast(p.ink, p.bg) < 7) p.ink = lum(p.bg) > .4 ? '#111111' : '#FFFFFF';
  return p;
}

/* ================= template & font ================= */
const THEMES = [
  { id: 'obsidian', n: 'Obsidian', bg: '#0F1013', bg2: '#1C1E25', ink: '#F2F1EE', mute: '#A0A3AD', acc: '#FF5A48', acc2: '#9FE6FF', hf: 'Sora', bf: 'Inter', deco: 'facets' },
  { id: 'samudra', n: 'Samudra', bg: '#0B2545', bg2: '#13315C', ink: '#EEF4ED', mute: '#8DA9C4', acc: '#F4B942', acc2: '#4FB3E8', hf: 'Montserrat', bf: 'Open Sans', deco: 'waves' },
  { id: 'kertas', n: 'Kertas', bg: '#FBF8F1', bg2: '#EFE7D6', ink: '#1D1A16', mute: '#6B6358', acc: '#C8553D', acc2: '#2F6690', hf: 'Playfair Display', bf: 'Lato', deco: 'lines' },
  { id: 'neon', n: 'Neon', bg: '#120B24', bg2: '#21174A', ink: '#F5F3FF', mute: '#A79FD1', acc: '#22F2C4', acc2: '#FF4FD8', hf: 'Space Grotesk', bf: 'Inter', deco: 'grid' },
  { id: 'hutan', n: 'Hutan', bg: '#10261B', bg2: '#1B3A2A', ink: '#EEF2E6', mute: '#9DB4A0', acc: '#E9C46A', acc2: '#8FD694', hf: 'Poppins', bf: 'Nunito', deco: 'circles' },
  { id: 'senja', n: 'Senja', bg: '#2B1B3D', bg2: '#45264A', ink: '#FFF4E8', mute: '#D9B8C4', acc: '#FF8C42', acc2: '#FFD166', hf: 'DM Serif Display', bf: 'DM Sans', deco: 'sun' },
  { id: 'minimal', n: 'Minimal', bg: '#FFFFFF', bg2: '#F2F4F7', ink: '#111827', mute: '#6B7280', acc: '#2563EB', acc2: '#10B981', hf: 'Inter', bf: 'Inter', deco: 'none' },
  { id: 'pastel', n: 'Pastel', bg: '#FFF5F8', bg2: '#FDE2EC', ink: '#3A2233', mute: '#8A6A7D', acc: '#E0457B', acc2: '#7C9CF5', hf: 'Fredoka', bf: 'Nunito', deco: 'blobs' },
  { id: 'korporat', n: 'Korporat', bg: '#F7F9FC', bg2: '#E3EAF4', ink: '#0F2442', mute: '#56708F', acc: '#0F62FE', acc2: '#FF832B', hf: 'IBM Plex Sans', bf: 'IBM Plex Sans', deco: 'bar' },
  { id: 'retro', n: 'Retro Pop', bg: '#FFE8C2', bg2: '#FFD08A', ink: '#2B1E16', mute: '#7A5C45', acc: '#E63946', acc2: '#1D3557', hf: 'Bebas Neue', bf: 'Work Sans', deco: 'dots' },
];
const DECOS = [['facets', 'Kristal'], ['waves', 'Gelombang'], ['lines', 'Garis'], ['grid', 'Kisi'], ['circles', 'Lingkaran'], ['sun', 'Matahari'], ['blobs', 'Gumpalan'], ['bar', 'Pita'], ['dots', 'Titik'], ['none', 'Polos']];
const FONTS = { 'Sora': '400;600;700', 'Inter': '400;600;700', 'Montserrat': '400;600;700', 'Open Sans': '400;600;700', 'Playfair Display': '400;700', 'Lato': '400;700', 'Space Grotesk': '400;600;700', 'Poppins': '400;600;700', 'Nunito': '400;600;700', 'DM Serif Display': '400', 'DM Sans': '400;600;700', 'Bebas Neue': '400', 'Work Sans': '400;600;700', 'Fredoka': '400;600;700', 'IBM Plex Sans': '400;600;700', 'Merriweather': '400;700', 'Source Sans 3': '400;600;700', 'Archivo Black': '400', 'Archivo': '400;600;700', 'Fraunces': '400;600;700', 'Oswald': '400;600;700', 'Roboto': '400;700', 'Lora': '400;700', 'Raleway': '400;600;700' };
const PAIRS = [['Sora', 'Inter'], ['Montserrat', 'Open Sans'], ['Playfair Display', 'Lato'], ['Space Grotesk', 'Inter'], ['Poppins', 'Nunito'], ['DM Serif Display', 'DM Sans'], ['Bebas Neue', 'Work Sans'], ['Fredoka', 'Nunito'], ['IBM Plex Sans', 'IBM Plex Sans'], ['Merriweather', 'Source Sans 3'], ['Archivo Black', 'Archivo'], ['Fraunces', 'Work Sans'], ['Oswald', 'Roboto'], ['Lora', 'Raleway']];
const hb = f => (FONTS[f] || '700').includes('700');
const loaded = new Set();
function loadFont(f) { if (!f || loaded.has(f)) return; loaded.add(f); const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + f.replace(/ /g, '+') + ':wght@' + (FONTS[f] || '400;700') + '&display=swap'; document.head.appendChild(l); }
async function fontsReady(T) { loadFont(T.hf); loadFont(T.bf); try { await Promise.all([document.fonts.load(`${hb(T.hf) ? 700 : 400} 40px "${T.hf}"`), document.fonts.load(`400 40px "${T.bf}"`)]); } catch (e) { } }
const themeOf = id => clone(THEMES.find(t => t.id === id) || THEMES[0]);

/* ================= latar dekoratif (SVG) ================= */
function rnd(seed) { let s = (seed * 9301 + 49297) % 233280 || 7; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function decoSVG(T, W, H, strong, seed) {
  const r = rnd(seed + 3), a = strong ? 1 : .55, S = Math.min(W, H) / 720;
  let g = '';
  switch (T.deco) {
    case 'facets': {
      const cx = W * (.82 + r() * .1), cy = H * (.2 + r() * .2), R = 330 * S;
      const pts = [0, 1, 2, 3, 4, 5].map(i => [cx + Math.cos(i / 6 * 6.283 + .3) * R * (0.7 + r() * .4), cy + Math.sin(i / 6 * 6.283 + .3) * R * (0.7 + r() * .4)]);
      pts.forEach((p, i) => { const q = pts[(i + 1) % 6]; g += `<polygon points="${cx},${cy} ${p[0]},${p[1]} ${q[0]},${q[1]}" fill="${i % 2 ? T.bg2 : T.ink}" fill-opacity="${(i % 2 ? .9 : .04) * a}"/>`; });
      g += `<polyline points="${pts.map(p => p.join(',')).join(' ')} ${pts[0].join(',')}" fill="none" stroke="${T.acc}" stroke-opacity="${.55 * a}" stroke-width="${3 * S}"/>`;
      break;
    }
    case 'waves': for (let i = 0; i < 3; i++) { const y = H * (.72 + i * .09), amp = 30 * S * (1 + i * .4); g += `<path d="M0 ${y} C ${W * .25} ${y - amp} ${W * .45} ${y + amp} ${W * .7} ${y} S ${W * .95} ${y - amp} ${W} ${y} V ${H} H 0 Z" fill="${i === 1 ? T.acc2 : T.bg2}" fill-opacity="${(i === 1 ? .18 : .7) * a}"/>`; } break;
    case 'lines': for (let i = 0; i < 12; i++) g += `<line x1="0" x2="${W}" y1="${H * (i + 1) / 13}" y2="${H * (i + 1) / 13}" stroke="${T.ink}" stroke-opacity="${.05 * a}" stroke-width="${1.2 * S}"/>`; g += `<rect x="${W - 46 * S}" y="0" width="${14 * S}" height="${H}" fill="${T.acc}" fill-opacity="${.85 * a}"/>`; break;
    case 'grid': { const st = 64 * S; for (let x = st; x < W; x += st) g += `<line x1="${x}" x2="${x}" y1="0" y2="${H}" stroke="${T.acc}" stroke-opacity="${.07 * a}"/>`; for (let y = st; y < H; y += st) g += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="${T.acc}" stroke-opacity="${.07 * a}"/>`; g += `<circle cx="${W * .86}" cy="${H * .18}" r="${260 * S}" fill="url(#gl)"/>`; break; }
    case 'circles': g += `<circle cx="${W * .92}" cy="${H * .08}" r="${300 * S}" fill="${T.bg2}" fill-opacity="${a}"/><circle cx="${W * .97}" cy="${H * .9}" r="${150 * S}" fill="none" stroke="${T.acc}" stroke-opacity="${.5 * a}" stroke-width="${4 * S}"/><circle cx="${W * .05}" cy="${H * 1.02}" r="${180 * S}" fill="${T.bg2}" fill-opacity="${.8 * a}"/>`; break;
    case 'sun': g += `<circle cx="${W * .85}" cy="${H * .95}" r="${380 * S}" fill="url(#sg)" fill-opacity="${.9 * a}"/>`; for (let i = 0; i < 5; i++) g += `<rect x="${W * .55}" y="${H * (.78 + i * .05)}" width="${W * .6}" height="${6 * S}" fill="${T.bg}"/>`; break;
    case 'blobs': g += `<path d="M${W * .78} ${-40 * S} C ${W * 1.05} ${H * .02}, ${W * 1.02} ${H * .42}, ${W * .86} ${H * .38} S ${W * .62} ${H * .12}, ${W * .78} ${-40 * S} Z" fill="${T.acc2}" fill-opacity="${.28 * a}"/><path d="M${-60 * S} ${H * .78} C ${W * .1} ${H * .66}, ${W * .26} ${H * .9}, ${W * .18} ${H * 1.08} L ${-60 * S} ${H * 1.08} Z" fill="${T.acc}" fill-opacity="${.18 * a}"/>`; break;
    case 'bar': g += `<rect x="0" y="0" width="${W}" height="${18 * S}" fill="${T.acc}" fill-opacity="${a}"/><rect x="0" y="${18 * S}" width="${W * .3}" height="${6 * S}" fill="${T.acc2}" fill-opacity="${a}"/>`; break;
    case 'dots': for (let y = 0; y < 10; y++) for (let x = 0; x < 14; x++) { const rr = (1 - (x + y) / 24) * 9 * S; if (rr > 1) g += `<circle cx="${W - x * 34 * S - 30 * S}" cy="${y * 34 * S + 30 * S}" r="${rr}" fill="${T.acc}" fill-opacity="${.55 * a}"/>`; } break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="gl"><stop offset="0" stop-color="${T.acc2}" stop-opacity="${.35 * a}"/><stop offset="1" stop-color="${T.acc2}" stop-opacity="0"/></radialGradient><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.acc2}"/><stop offset="1" stop-color="${T.acc}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="${T.bg}"/>${g}</svg>`;
}
const decoCache = new Map();
function decoURL(T, strong, seed, W = 1280, H = 720) { const k = [T.bg, T.bg2, T.ink, T.acc, T.acc2, T.deco, strong, seed, W, H].join('|'); if (!decoCache.has(k)) { if (decoCache.size > 200) decoCache.clear(); decoCache.set(k, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(decoSVG(T, W, H, strong, seed))); } return decoCache.get(k); }
function svgToPNG(url, W, H) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(im, 0, 0, W, H); res(c.toDataURL('image/png')); }; im.onerror = rej; im.src = url; }); }
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
async function fileToData(f, max = 1600) { const url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }); if (!/^image\//.test(f.type) || f.type === 'image/gif') return url; const im = await loadImg(url); const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)); const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .86); }

/* ================= penyimpanan ================= */
let ST = { decks: [], videos: [], deck: null, video: null, vmode: 'ai', aivids: [], aiImg: null, aiPrompt: '', aiDur: 3.5, aiSteps: 6, aiEnh: true, hf: { token: '', space: 'zerogpu-aoti/wan2-2-fp8da-aoti-faster' } };
let saveT = 0;
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => O.idbSet('studio', ST), 400); };
const loadState = (async () => { const d = await O.idbGet('studio'); if (d && typeof d === 'object') ST = Object.assign(ST, d); (ST.aivids || []).forEach(x => { if (x.status === 'pending' && !x.job) { x.status = 'error'; x.err = 'Terhenti karena Obsidia ditutup sebelum video selesai. Aktifkan mode latar belakang agar tetap berjalan.'; delete x.stage; } }); })();
const hist = [];
function commit(fn) { hist.push(JSON.stringify(ST)); if (hist.length > 40) hist.shift(); fn(); save(); }
function undo(rerender) { const s = hist.pop(); if (!s) { O.toast('Tidak ada yang bisa diurungkan.'); return; } ST = JSON.parse(s); save(); rerender(); }

/* ================= panel desain bersama ================= */
function designPanel(tab, T, extra) {
  if (tab === 'tpl') return `<div class="tgrid">${THEMES.map(t => `<button type="button" class="tcard${t.id === T.id ? ' on' : ''}" data-theme="${t.id}" style="background:${t.bg};color:${t.ink};border-color:${t.id === T.id ? t.acc : 'transparent'}"><img src="${decoURL(t, true, 1, 320, 180)}" alt=""><span style="font-family:'${t.hf}';">${t.n}</span><i style="background:${t.acc}"></i><i style="background:${t.acc2}"></i></button>`).join('')}</div><p class="sfine">Template mengganti warna, font, dan hiasan latar sekaligus. Ubah detailnya di tab Warna dan Font.</p>`;
  if (tab === 'color') return `<div class="crow">${[['bg', 'Latar'], ['bg2', 'Latar kedua'], ['ink', 'Teks'], ['mute', 'Teks redup'], ['acc', 'Aksen'], ['acc2', 'Aksen kedua']].map(([k, n]) => `<label class="cpk"><input type="color" data-col="${k}" value="${T[k]}"><span>${n}<small>${T[k]}</small></span></label>`).join('')}</div>
    <p class="slab">Buat palet dari satu warna</p><div class="prow"><input type="color" id="pBase" value="${T.acc}" aria-label="Warna dasar"><select id="pMode" class="in">${PMODES.map(m => `<option value="${m[0]}">${m[1]}</option>`).join('')}</select><button type="button" class="btn" id="pGen">Terapkan</button></div>
    <button type="button" class="btn wide" id="pRand">${ico('spark')} Acak palet kreatif</button>
    <p class="slab">Hiasan latar</p><div class="chipset">${DECOS.map(d => `<button type="button" class="schip${T.deco === d[0] ? ' on' : ''}" data-deco="${d[0]}">${d[1]}</button>`).join('')}</div>
    <p class="sfine" id="cWarn">${contrast(T.ink, T.bg) < 4.5 ? 'Kontras teks dan latar terlalu rendah, teks bisa sulit dibaca.' : 'Kontras teks dan latar: ' + contrast(T.ink, T.bg).toFixed(1) + ':1, mudah dibaca.'}</p>`;
  if (tab === 'font') return `<div class="flist">${PAIRS.map(([h, b]) => { loadFont(h); loadFont(b); return `<button type="button" class="fcard${T.hf === h && T.bf === b ? ' on' : ''}" data-pair="${esc(h)}|${esc(b)}"><b style="font-family:'${h}';font-weight:${hb(h) ? 700 : 400}">${esc(h)}</b><span style="font-family:'${b}'">${esc(b)}: teks isi yang nyaman dibaca.</span></button>`; }).join('')}</div>
    <p class="slab">Atur sendiri</p><div class="prow"><select class="in" id="fH" aria-label="Font judul">${Object.keys(FONTS).map(f => `<option${f === T.hf ? ' selected' : ''}>${f}</option>`).join('')}</select><select class="in" id="fB" aria-label="Font isi">${Object.keys(FONTS).map(f => `<option${f === T.bf ? ' selected' : ''}>${f}</option>`).join('')}</select></div><p class="sfine">Di PowerPoint, font yang tidak terpasang di perangkat diganti otomatis dengan font serupa.</p>`;
  return extra || '';
}
function bindDesign(root, getT, apply) {
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-theme],[data-pair],[data-deco],#pGen,#pRand'); if (!b) return;
    if (b.dataset.theme) apply(T => Object.assign(T, themeOf(b.dataset.theme)));
    else if (b.dataset.pair) { const [h, f] = b.dataset.pair.split('|'); apply(T => { T.hf = h; T.bf = f; }); }
    else if (b.dataset.deco) apply(T => { T.deco = b.dataset.deco; });
    else if (b.id === 'pGen') { const base = $('#pBase', root).value, mode = $('#pMode', root).value; apply(T => Object.assign(T, palette(base, mode))); }
    else if (b.id === 'pRand') { const m = PMODES[Math.floor(Math.random() * PMODES.length)][0]; const base = hsl2hx(Math.random() * 360, 60 + Math.random() * 30, 55); apply(T => { Object.assign(T, palette(base, m)); T.deco = DECOS[Math.floor(Math.random() * (DECOS.length - 1))][0]; }); O.toast('Palet ' + PMODES.find(x => x[0] === m)[1].toLowerCase() + ' diterapkan.'); }
  });
  root.addEventListener('change', e => {
    const c = e.target.closest('[data-col]'); if (c) { apply(T => { T[c.dataset.col] = c.value.toUpperCase(); }); return; }
    if (e.target.id === 'fH' || e.target.id === 'fB') { const h = $('#fH', root).value, f = $('#fB', root).value; apply(T => { T.hf = h; T.bf = f; }); }
  });
}

/* ================= AI ================= */
async function aiJSON(prompt, status) {
  if (!O.providersReady()) { O.toast('Atur penyedia AI dulu di Pengaturan.'); O.openSettings(); throw new Error('no provider'); }
  let n = 0;
  return O.askAI('Kamu asisten kreatif. Balas hanya dengan JSON valid, tanpa teks lain dan tanpa blok kode.', prompt, { json: true, onText: t => { if (status && ++n % 8 === 0) status(t.length); } });
}

/* =====================================================================
   STUDIO SLIDE
   ===================================================================== */
const LAYOUTS = [['title', 'Judul'], ['section', 'Pembuka bagian'], ['bullets', 'Poin-poin'], ['two-col', 'Dua kolom'], ['stat', 'Angka besar'], ['quote', 'Kutipan'], ['image', 'Gambar penuh'], ['timeline', 'Linimasa'], ['cards', 'Kartu'], ['closing', 'Penutup']];
const ENT = [['fade-up', 'Naik halus'], ['zoom', 'Membesar'], ['slide', 'Geser masuk'], ['wipe', 'Sapuan'], ['pop', 'Memantul'], ['fade', 'Pudar'], ['none', 'Tanpa animasi']];
const TRANS = [['fade', 'Pudar'], ['push', 'Dorong'], ['zoom', 'Zoom'], ['wipe', 'Sapu'], ['flip', 'Balik'], ['none', 'Langsung']];
const SPEED = [['fast', 'Cepat', .45], ['med', 'Sedang', .7], ['slow', 'Lambat', 1.1]];
const KEYF = { 'fade-up': 'obUp', zoom: 'obZoom', slide: 'obLeft', wipe: 'obWipe', pop: 'obPop', fade: 'obFade' };
const SAMPLE_DECK = () => ({
  id: 'd' + uid(), title: 'Contoh: Energi Terbarukan', theme: themeOf('obsidian'), anim: { entrance: 'fade-up', transition: 'fade', speed: 'med', stagger: true, pptAnim: true }, sample: true,
  slides: [
    { id: uid(), layout: 'title', title: 'Energi Terbarukan untuk Indonesia', subtitle: 'Peluang, tantangan, dan langkah berikutnya', notes: 'Buka dengan pertanyaan: dari mana listrik di rumah kita berasal?' },
    { id: uid(), layout: 'bullets', title: 'Kenapa sekarang', bullets: ['Biaya panel surya turun tajam dalam 10 tahun', 'Permintaan listrik terus naik', 'Target emisi nasional makin dekat'] },
    { id: uid(), layout: 'stat', title: '', stat: { value: '23%', label: 'Target bauran energi terbarukan' }, subtitle: 'Angka contoh untuk ilustrasi tampilan slide.' },
    { id: uid(), layout: 'cards', title: 'Tiga sumber utama', items: [{ t: 'Surya', d: 'Cocok untuk atap rumah dan daerah terpencil' }, { t: 'Air', d: 'Stabil, sudah lama dipakai di banyak daerah' }, { t: 'Panas bumi', d: 'Potensi besar di jalur gunung api' }] },
    { id: uid(), layout: 'timeline', title: 'Langkah ke depan', items: [{ t: 'Pemetaan', d: 'Data potensi tiap daerah' }, { t: 'Uji coba', d: 'Proyek kecil di desa' }, { t: 'Perluasan', d: 'Skala kota dan industri' }, { t: 'Evaluasi', d: 'Ukur dampak dan biaya' }] },
    { id: uid(), layout: 'closing', title: 'Terima kasih', subtitle: 'Ada pertanyaan?' },
  ]
});

function fit(text, size, w, h, lh = 1.15, cw = .52, minF = .4) { let s = size; const paras = String(text || '').split('\n'); for (let k = 0; k < 40; k++) { const cpl = Math.max(4, Math.floor(w / (s * cw))); const lines = paras.reduce((n, p) => n + Math.max(1, Math.ceil(p.length / cpl)), 0); if (lines * s * lh <= h || s <= size * minF) break; s *= .93; } return Math.round(s); }
const L = a => (Array.isArray(a) ? a : String(a || '').split('\n')).map(x => String(x).trim()).filter(Boolean);
function geo(deck, sl, idx) {
  const T = deck.theme, E = [], hbold = hb(T.hf);
  const H = o => E.push(Object.assign({ t: 'text', font: 'h', color: T.ink, bold: hbold, lh: 1.1, align: 'left', valign: 'top' }, o));
  const B = o => E.push(Object.assign({ t: 'text', font: 'b', color: T.ink, bold: false, lh: 1.3, align: 'left', valign: 'top' }, o));
  const title = sl.title || '', sub = sl.subtitle || '';
  const head = () => { H({ x: 80, y: 52, w: 1120, h: 118, text: title, size: fit(title, 50, 1120, 118, 1.1, .55), valign: 'bottom', i: 0 }); E.push({ t: 'rect', x: 80, y: 186, w: 64, h: 6, fill: T.acc, i: 1 }); };
  const bullets = (items, x, y, w, h, size, i) => { const it = L(items).slice(0, 7); const s = fit(it.join('\n'), size, w - 34, h / 1.35, 1.3, .5); E.push({ t: 'bullets', x, y, w, h, items: it, size: s, font: 'b', color: T.ink, dot: T.acc, i }); };
  switch (sl.layout) {
    case 'title':
      H({ x: 80, y: 150, w: 1040, h: 290, text: title, size: fit(title, 86, 1040, 290, 1.05, .55), lh: 1.05, valign: 'bottom', i: 0 });
      E.push({ t: 'rect', x: 80, y: 468, w: 96, h: 8, fill: T.acc, i: 1 });
      B({ x: 80, y: 500, w: 960, h: 130, text: sub, size: fit(sub, 30, 960, 130, 1.3), color: T.mute, i: 2 }); break;
    case 'section': {
      const n = deck.slides.slice(0, idx + 1).filter(s => s.layout === 'section').length;
      H({ x: 80, y: 140, w: 400, h: 180, text: String(n).padStart(2, '0'), size: 150, color: T.acc, lh: 1, valign: 'bottom', i: 0 });
      H({ x: 80, y: 340, w: 1080, h: 170, text: title, size: fit(title, 62, 1080, 170, 1.08, .55), i: 1 });
      B({ x: 80, y: 520, w: 960, h: 110, text: sub, size: fit(sub, 26, 960, 110, 1.3), color: T.mute, i: 2 }); break;
    }
    case 'two-col':
      head();
      H({ x: 80, y: 228, w: 520, h: 50, text: sl.leftTitle || '', size: fit(sl.leftTitle, 28, 520, 50), color: T.acc, i: 2 });
      bullets(sl.left, 80, 290, 520, 370, 24, 3);
      E.push({ t: 'rect', x: 639, y: 236, w: 2, h: 400, fill: T.bg2 });
      H({ x: 680, y: 228, w: 520, h: 50, text: sl.rightTitle || '', size: fit(sl.rightTitle, 28, 520, 50), color: T.acc2, i: 4 });
      bullets(sl.right, 680, 290, 520, 370, 24, 5); break;
    case 'stat': {
      const v = (sl.stat && sl.stat.value) || '', lb = (sl.stat && sl.stat.label) || '';
      if (title) H({ x: 80, y: 60, w: 1120, h: 70, text: title, size: fit(title, 34, 1120, 70), color: T.mute, i: 0 });
      H({ x: 80, y: 140, w: 1120, h: 280, text: v, size: fit(v, 200, 1120, 280, 1, .6), color: T.acc, lh: 1, valign: 'bottom', i: 1 });
      H({ x: 80, y: 440, w: 1040, h: 90, text: lb, size: fit(lb, 40, 1040, 90), i: 2 });
      B({ x: 80, y: 540, w: 1000, h: 110, text: sub, size: fit(sub, 24, 1000, 110), color: T.mute, i: 3 }); break;
    }
    case 'quote': {
      const q = sl.quote || title;
      H({ x: 70, y: 40, w: 220, h: 220, text: '“', size: 260, color: T.acc, lh: 1, bold: false, i: 0 });
      H({ x: 160, y: 200, w: 980, h: 300, text: q, size: fit(q, 46, 980, 300, 1.25, .5), lh: 1.25, bold: false, valign: 'middle', i: 1 });
      E.push({ t: 'rect', x: 160, y: 538, w: 48, h: 4, fill: T.acc, i: 2 });
      B({ x: 224, y: 516, w: 900, h: 50, text: sl.author || '', size: 24, color: T.mute, i: 2 }); break;
    }
    case 'image':
      if (sl.image) E.push({ t: 'image', x: 0, y: 0, w: 1280, h: 720, src: sl.image, i: 0 }); else E.push({ t: 'rect', x: 0, y: 0, w: 1280, h: 720, fill: T.bg2 });
      E.push({ t: 'rect', x: 0, y: 470, w: 1280, h: 250, fill: T.bg, opacity: .82, i: 1 });
      H({ x: 80, y: 500, w: 1120, h: 110, text: title, size: fit(title, 48, 1120, 110), valign: 'bottom', i: 1 });
      B({ x: 80, y: 618, w: 1120, h: 70, text: sub || (sl.image ? '' : 'Ketuk "Pilih gambar" untuk mengisi slide ini.'), size: 24, color: T.mute, i: 2 }); break;
    case 'timeline': {
      head();
      const it = (sl.items || []).slice(0, 5), n = Math.max(1, it.length), slot = 1120 / n;
      E.push({ t: 'rect', x: 80 + slot / 2, y: 378, w: slot * (n - 1), h: 4, fill: T.bg2, i: 2 });
      it.forEach((x, k) => { const cx = 80 + slot * k; E.push({ t: 'ellipse', x: cx + slot / 2 - 16, y: 364, w: 32, h: 32, fill: k % 2 ? T.acc2 : T.acc, i: 3 + k }); H({ x: cx + 10, y: 274, w: slot - 20, h: 74, text: x.t || '', size: fit(x.t, 26, slot - 20, 74), align: 'center', valign: 'bottom', i: 3 + k }); B({ x: cx + 10, y: 414, w: slot - 20, h: 230, text: x.d || '', size: fit(x.d, 20, slot - 20, 230), color: T.mute, align: 'center', i: 3 + k }); }); break;
    }
    case 'cards': {
      head();
      const it = (sl.items || []).slice(0, 4), n = Math.max(1, it.length), gap = 28, w = (1120 - gap * (n - 1)) / n;
      it.forEach((x, k) => { const cx = 80 + k * (w + gap); E.push({ t: 'rect', x: cx, y: 236, w, h: 410, fill: T.bg2, radius: 20, i: 2 + k }); E.push({ t: 'rect', x: cx + 32, y: 270, w: 40, h: 6, fill: k % 2 ? T.acc2 : T.acc, i: 2 + k }); H({ x: cx + 32, y: 296, w: w - 64, h: 90, text: x.t || '', size: fit(x.t, 30, w - 64, 90), i: 2 + k }); B({ x: cx + 32, y: 396, w: w - 64, h: 220, text: x.d || '', size: fit(x.d, 21, w - 64, 220), color: T.mute, i: 2 + k }); }); break;
    }
    case 'closing':
      H({ x: 80, y: 190, w: 1120, h: 190, text: title, size: fit(title, 88, 1120, 190, 1.05, .55), align: 'center', valign: 'bottom', lh: 1.05, i: 0 });
      E.push({ t: 'rect', x: 600, y: 404, w: 80, h: 6, fill: T.acc, i: 1 });
      B({ x: 140, y: 432, w: 1000, h: 120, text: sub, size: fit(sub, 30, 1000, 120), color: T.mute, align: 'center', i: 2 }); break;
    default: {
      head();
      const it = L(sl.bullets);
      if (sl.image) { bullets(it, 80, 226, 620, 440, 28, 2); E.push({ t: 'image', x: 740, y: 226, w: 460, h: 420, src: sl.image, radius: 24, i: 2 + it.length }); }
      else bullets(it, 80, 226, 1080, 440, 30, 2);
    }
  }
  return E;
}
const VAL = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };
function elHTML(e) {
  const pos = `left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;`, an = e.i != null ? ' a' : '', iv = e.i != null ? `--i:${e.i};` : '';
  if (e.t === 'text') return `<div class="e${an}" style="${pos}${iv}justify-content:${VAL[e.valign]};text-align:${e.align};color:${e.color};font:${e.bold ? 700 : 400} ${e.size}px/${e.lh} var(--${e.font}f);"><span>${esc(e.text).replace(/\n/g, '<br>')}</span></div>`;
  if (e.t === 'bullets') return `<ul class="e eb" style="${pos}color:${e.color};font:400 ${e.size}px/1.3 var(--bf);--dot:${e.dot}">${e.items.map((x, k) => `<li class="a" style="--i:${e.i + k};margin-bottom:${Math.round(e.size * .45)}px">${esc(x)}</li>`).join('')}</ul>`;
  if (e.t === 'rect' || e.t === 'ellipse') return `<div class="e${an}" style="${pos}${iv}background:${e.fill};border-radius:${e.t === 'ellipse' ? '50%' : (e.radius || 0) + 'px'};${e.opacity != null ? 'opacity:' + e.opacity : ''}"></div>`;
  if (e.t === 'image') return `<img class="e${an}" style="${pos}${iv}object-fit:cover;border-radius:${e.radius || 0}px" src="${esc(e.src)}" alt="">`;
  return '';
}
function slideHTML(deck, sl, idx, play) {
  const T = deck.theme, A = deck.anim, sp = (SPEED.find(s => s[0] === A.speed) || SPEED[1])[2];
  const strong = ['title', 'section', 'closing'].includes(sl.layout);
  const ent = play && A.entrance !== 'none' ? ' play' : '';
  return `<div class="sl${ent}" style="--hf:'${T.hf}';--bf:'${T.bf}';--ent:${KEYF[A.entrance] || 'none'};--stg:${A.stagger ? .12 : 0}s;--dur:${sp}s;background:${T.bg}"><img class="dec" src="${decoURL(T, strong, idx + 1)}" alt="">${geo(deck, sl, idx).map(elHTML).join('')}</div>`;
}
const SLIDE_CSS = `.sl{position:absolute;left:0;top:0;width:1280px;height:720px;overflow:hidden;transform-origin:0 0;font-synthesis:weight}
.sl .dec{position:absolute;inset:0;width:100%;height:100%}
.sl .e{position:absolute;margin:0;padding:0;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box}
.sl .eb{display:block;list-style:none;overflow:hidden}
.sl .eb li{position:relative;padding-left:1.15em}
.sl .eb li::before{content:'';position:absolute;left:.1em;top:.5em;width:.42em;height:.42em;border-radius:50%;background:var(--dot)}
.sl.play .a{opacity:0;animation:var(--ent) var(--dur) cubic-bezier(.2,.75,.25,1) forwards;animation-delay:calc(var(--i) * var(--stg) + .15s)}
@keyframes obUp{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
@keyframes obZoom{from{opacity:0;transform:scale(.82)}to{opacity:1;transform:none}}
@keyframes obLeft{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:none}}
@keyframes obWipe{from{opacity:1;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes obPop{0%{opacity:0;transform:scale(.6)}70%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:none}}
@keyframes obFade{from{opacity:0}to{opacity:1}}
.tr-in-fade{animation:obFade var(--td) ease both}.tr-out-fade{animation:obFade var(--td) ease reverse both}
.tr-in-push{animation:trPushIn var(--td) cubic-bezier(.6,0,.2,1) both}.tr-out-push{animation:trPushOut var(--td) cubic-bezier(.6,0,.2,1) both}
@keyframes trPushIn{from{transform:translateX(100%)}to{transform:none}}@keyframes trPushOut{from{transform:none}to{transform:translateX(-100%)}}
.tr-in-zoom{animation:trZoomIn var(--td) ease both}.tr-out-zoom{animation:trZoomOut var(--td) ease both}
@keyframes trZoomIn{from{opacity:0;transform:scale(1.15)}to{opacity:1;transform:none}}@keyframes trZoomOut{from{opacity:1;transform:none}to{opacity:0;transform:scale(.9)}}
.tr-in-wipe{animation:trWipe var(--td) cubic-bezier(.6,0,.2,1) both}.tr-out-wipe{animation:none}
@keyframes trWipe{from{clip-path:inset(0 0 0 100%)}to{clip-path:inset(0 0 0 0)}}
.tr-in-flip{animation:trFlipIn var(--td) ease both;backface-visibility:hidden}.tr-out-flip{animation:trFlipOut var(--td) ease both;backface-visibility:hidden}
@keyframes trFlipIn{0%,50%{opacity:0;transform:perspective(1600px) rotateY(-90deg)}100%{opacity:1;transform:perspective(1600px) rotateY(0)}}@keyframes trFlipOut{0%{transform:perspective(1600px) rotateY(0)}50%,100%{opacity:0;transform:perspective(1600px) rotateY(90deg)}}`;

/* ---------- presentasi ---------- */
function present(deck, start = 0) {
  [deck.theme.hf, deck.theme.bf].forEach(loadFont);
  const ov = document.createElement('div'); ov.className = 'obpres';
  ov.innerHTML = `<div class="ps"></div><button type="button" class="px" aria-label="Tutup presentasi">${ico('x')}</button><div class="pn"></div><button class="pz pl" type="button" aria-label="Slide sebelumnya"></button><button class="pz pr" type="button" aria-label="Slide berikutnya"></button>`;
  document.body.appendChild(ov);
  const stage = $('.ps', ov); let k = start, busy = false;
  const fitS = () => { const s = Math.min(innerWidth / 1280, innerHeight / 720); stage.style.transform = `translate(${(innerWidth - 1280 * s) / 2}px,${(innerHeight - 720 * s) / 2}px) scale(${s})`; };
  const sp = (SPEED.find(s => s[0] === deck.anim.speed) || SPEED[1])[2];
  const show = (n, dir) => {
    if (busy || n < 0 || n >= deck.slides.length) return; busy = true;
    const tr = dir ? deck.anim.transition : 'none';
    const slot = document.createElement('div'); slot.className = 'slot'; slot.innerHTML = slideHTML(deck, deck.slides[n], n, true);
    const old = $('.slot', stage); stage.appendChild(slot); stage.style.setProperty('--td', sp + 's');
    if (old && tr !== 'none') { slot.classList.add('tr-in-' + tr); old.classList.add('tr-out-' + tr); setTimeout(() => { old.remove(); busy = false; }, sp * 1000 + 30); }
    else { if (old) old.remove(); busy = false; }
    k = n; $('.pn', ov).textContent = (n + 1) + ' / ' + deck.slides.length;
  };
  const key = e => { if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); show(k + 1, 1); } else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); show(k - 1, -1); } else if (e.key === 'Escape') close(); };
  const close = () => { removeEventListener('keydown', key, true); removeEventListener('resize', fitS); ov.remove(); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { } };
  $('.pr', ov).onclick = () => show(k + 1, 1); $('.pl', ov).onclick = () => show(k - 1, -1); $('.px', ov).onclick = close;
  addEventListener('keydown', key, true); addEventListener('resize', fitS); fitS(); show(k, 0);
  try { ov.requestFullscreen && ov.requestFullscreen().catch(() => { }); } catch (e) { }
}

/* ---------- ekspor PPTX ---------- */
let pptxLib = null;
function loadPptx() { return pptxLib || (pptxLib = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'pptxgen.bundle.js'; s.onload = () => res(window.PptxGenJS); s.onerror = () => { pptxLib = null; rej(new Error('Pustaka PowerPoint gagal dimuat. Periksa internet lalu coba lagi.')); }; document.head.appendChild(s); })); }
const IN = px => +(px / 96).toFixed(4), PT = px => Math.max(6, Math.round(px * .75)), HX = c => String(c).replace('#', '').slice(0, 6).toUpperCase();
const TR_XML = { fade: '<p:fade/>', push: '<p:push dir="u"/>', zoom: '<p:zoom/>', wipe: '<p:wipe dir="r"/>', flip: '<p:cover dir="r"/>' };
const PRESET = { wipe: [22, 'entr', 8, 'wipe(left)'], fade: [10, 'entr', 0, 'fade'] };
function timingXML(groups, anim, durMs) {
  // groups: [[spid,...], ...] in order; each group fades in after the previous, starting when the slide opens
  const [pid, pcls, psub, filter] = PRESET[anim] || PRESET.fade; let id = 3, delay = 0; const stag = 250;
  const eff = (spid, d, first) => { const a = ++id, b = ++id, c = ++id; return `<p:par><p:cTn id="${a}" fill="hold"><p:stCondLst><p:cond delay="${d}"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${b}" presetID="${pid}" presetClass="${pcls}" presetSubtype="${psub}" fill="hold" grpId="0" nodeType="${first ? 'afterEffect' : 'withEffect'}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:set><p:cBhvr><p:cTn id="${c}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set><p:animEffect transition="in" filter="${filter}"><p:cBhvr><p:cTn id="${++id}" dur="${durMs}"/><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`; };
  let inner = '', first = true;
  groups.forEach(g => { g.forEach(sp => { inner += eff(sp.id, delay, first); first = false; }); delay += stag; });
  const all = groups.flat().filter(x => x.text).map(x => x.id);
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>${inner}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>${all.map(s => `<p:bldP spid="${s}" grpId="0"/>`).join('')}</p:bldLst></p:timing>`;
}
async function buildPptx(deck) {
  const PptxGenJS = await loadPptx();
  const T = deck.theme, A = deck.anim, pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE'; pres.title = deck.title || 'Presentasi'; pres.author = 'Obsidia';
  const animMap = [];
  for (let k = 0; k < deck.slides.length; k++) {
    const sl = deck.slides[k], s = pres.addSlide();
    const bg = await svgToPNG(decoURL(T, ['title', 'section', 'closing'].includes(sl.layout), k + 1, 1920, 1080), 1920, 1080);
    s.background = { data: bg.replace(/^data:/, '') };
    const order = [];
    for (const e of geo(deck, sl, k)) {
      const box = { x: IN(e.x), y: IN(e.y), w: IN(e.w), h: IN(e.h) };
      if (e.t === 'text') { if (!String(e.text || '').trim()) continue; s.addText(String(e.text), Object.assign(box, { fontFace: e.font === 'h' ? T.hf : T.bf, fontSize: PT(e.size), color: HX(e.color), bold: !!e.bold, align: e.align, valign: e.valign, margin: 0, isTextBox: true, lineSpacingMultiple: e.lh, fit: 'shrink' })); }
      else if (e.t === 'bullets') { if (!e.items.length) continue; s.addText(e.items.map((t, j) => ({ text: t, options: { bullet: { indent: PT(e.size * 1.1) }, breakLine: j < e.items.length - 1, paraSpaceAfter: PT(e.size * .45) } })), Object.assign(box, { fontFace: T.bf, fontSize: PT(e.size), color: HX(e.color), valign: 'top', margin: 0, isTextBox: true, fit: 'shrink' })); }
      else if (e.t === 'rect' || e.t === 'ellipse') { const o = Object.assign(box, { fill: { color: HX(e.fill), transparency: e.opacity != null ? Math.round((1 - e.opacity) * 100) : 0 }, line: { color: HX(e.fill), width: 0, transparency: 100 } }); if (e.radius) o.rectRadius = IN(e.radius); s.addShape(e.t === 'ellipse' ? pres.ShapeType.ellipse : e.radius ? pres.ShapeType.roundRect : pres.ShapeType.rect, o); }
      else if (e.t === 'image') { s.addImage(Object.assign(box, { data: e.src.replace(/^data:/, ''), sizing: { type: 'cover', w: box.w, h: box.h }, rounding: false })); }
      else continue;
      order.push({ i: e.i, text: e.t === 'text' || e.t === 'bullets' });
    }
    if (sl.notes) s.addNotes(String(sl.notes));
    animMap.push(order);
  }
  let out = await pres.write({ outputType: 'arraybuffer' });
  if ((A.transition && A.transition !== 'none') || (A.pptAnim && A.entrance !== 'none')) {
    const zip = await window.JSZip.loadAsync(out);
    const spd = A.speed === 'slow' ? 'slow' : A.speed === 'fast' ? 'fast' : 'med';
    for (let k = 0; k < deck.slides.length; k++) {
      const path = `ppt/slides/slide${k + 1}.xml`, f = zip.file(path); if (!f) continue;
      let xml = await f.async('string'), add = '';
      if (A.transition && A.transition !== 'none') add += `<p:transition spd="${spd}">${TR_XML[A.transition] || TR_XML.fade}</p:transition>`;
      if (A.pptAnim && A.entrance !== 'none') {
        const ids = [...xml.matchAll(/<p:(?:sp|pic)>\s*<p:nv(?:Sp|Pic)Pr>\s*<p:cNvPr id="(\d+)"/g)].map(m => m[1]);
        const groups = new Map(); ids.forEach((sp, j) => { const o = animMap[k][j]; if (!o || o.i == null) return; if (!groups.has(o.i)) groups.set(o.i, []); groups.get(o.i).push({ id: sp, text: o.text }); });
        const gl = [...groups.keys()].sort((a, b) => a - b).map(g => groups.get(g));
        if (gl.length) add += timingXML(gl, A.entrance, Math.round(((SPEED.find(s => s[0] === A.speed) || SPEED[1])[2]) * 1000));
      }
      if (!add) continue;
      xml = xml.replace(/<p:transition[\s\S]*?<\/p:transition>|<p:transition[^>]*\/>/, '').replace(/<p:timing>[\s\S]*?<\/p:timing>/, '');
      let at = xml.indexOf('</p:clrMapOvr>'); at = at >= 0 ? at + 14 : xml.indexOf('</p:cSld>') + 9;
      xml = xml.slice(0, at) + add + xml.slice(at);
      zip.file(path, xml);
    }
    out = await zip.generateAsync({ type: 'arraybuffer' });
  }
  // tulis ulang zip tanpa entri folder agar aman dibuka di layanan cloud (OneDrive, Google Drive)
  {
    const src = await window.JSZip.loadAsync(out), z = new window.JSZip(), names = Object.keys(src.files).filter(n => !src.files[n].dir);
    for (const n of names) z.file(n, await src.files[n].async('uint8array'), { createFolders: false });
    out = await z.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  }
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
}
function buildHTML(deck) {
  const T = deck.theme, sp = (SPEED.find(s => s[0] === deck.anim.speed) || SPEED[1])[2];
  const slides = deck.slides.map((s, k) => slideHTML(deck, s, k, true));
  const fam = [...new Set([T.hf, T.bf])].map(f => 'family=' + f.replace(/ /g, '+') + ':wght@' + (FONTS[f] || '400;700')).join('&');
  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(deck.title || 'Presentasi')}</title><link href="https://fonts.googleapis.com/css2?${fam}&display=swap" rel="stylesheet"><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}.ps{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0;--td:${sp}s}.slot{position:absolute;inset:0}.pz{position:fixed;top:0;bottom:0;width:50%;background:none;border:0;cursor:pointer}.pl{left:0}.pr{right:0}.pn{position:fixed;right:16px;bottom:12px;color:#fff8;font:14px system-ui}${SLIDE_CSS}</style></head><body><div class="ps"></div><button class="pz pl" aria-label="Sebelumnya"></button><button class="pz pr" aria-label="Berikutnya"></button><div class="pn"></div><script>const S=${JSON.stringify(slides).replace(/</g, '\\u003c')},TR=${JSON.stringify(deck.anim.transition)},D=${sp * 1000};let k=-1,busy=false;const st=document.querySelector('.ps');function fit(){const s=Math.min(innerWidth/1280,innerHeight/720);st.style.transform='translate('+(innerWidth-1280*s)/2+'px,'+(innerHeight-720*s)/2+'px) scale('+s+')'}function show(n){if(busy||n<0||n>=S.length)return;busy=true;const sl=document.createElement('div');sl.className='slot';sl.innerHTML=S[n];const old=st.querySelector('.slot');st.appendChild(sl);if(old&&TR!=='none'){sl.classList.add('tr-in-'+TR);old.classList.add('tr-out-'+TR);setTimeout(()=>{old.remove();busy=false},D+30)}else{if(old)old.remove();busy=false}k=n;document.querySelector('.pn').textContent=(n+1)+' / '+S.length}document.querySelector('.pr').onclick=()=>show(k+1);document.querySelector('.pl').onclick=()=>show(k-1);addEventListener('keydown',e=>{if(['ArrowRight',' ','PageDown','Enter'].includes(e.key))show(k+1);if(['ArrowLeft','PageUp'].includes(e.key))show(k-1)});addEventListener('resize',fit);fit();show(0)<\/script></body></html>`;
}

/* ---------- UI Studio Slide ---------- */
let sRoot = null, sTab = 'isi', sSel = 0, sGen = false;
const curDeck = () => ST.decks.find(d => d.id === ST.deck) || null;
function ensureDeck() { if (!ST.decks.length) { const d = SAMPLE_DECK(); ST.decks.push(d); ST.deck = d.id; save(); } if (!curDeck()) ST.deck = ST.decks[0].id; return curDeck(); }
function thumbs(deck) { return deck.slides.map((s, k) => `<div class="th${k === sSel ? ' on' : ''}" role="button" tabindex="0" data-k="${k}" aria-label="Slide ${k + 1}"><span class="tn">${k + 1}</span><div class="tv"><div class="tsc">${slideHTML(deck, s, k, false)}</div></div></div>`).join('') + `<button type="button" class="th add" id="sAdd">${ico('plus')}<span>Slide baru</span></button>`; }
function slideForm(deck, sl) {
  if (!sl) return '';
  const f = (id, label, val, rows) => `<div class="fld"><label for="s_${id}">${label}</label>${rows ? `<textarea class="in" id="s_${id}" data-f="${id}" rows="${rows}">${esc(val || '')}</textarea>` : `<input class="in" id="s_${id}" data-f="${id}" type="text" value="${esc(val || '')}">`}</div>`;
  let h = `<div class="fld"><label for="fLayout">Tata letak</label><select class="in" id="fLayout" data-f="layout">${LAYOUTS.map(l => `<option value="${l[0]}"${l[0] === sl.layout ? ' selected' : ''}>${l[1]}</option>`).join('')}</select></div>`;
  const ly = sl.layout;
  if (ly === 'quote') h += f('quote', 'Kutipan', sl.quote, 3) + f('author', 'Sumber kutipan', sl.author);
  else h += f('title', ly === 'stat' ? 'Judul kecil (opsional)' : 'Judul', sl.title, 2);
  if (['title', 'section', 'stat', 'image', 'closing'].includes(ly)) h += f('subtitle', ly === 'stat' ? 'Keterangan' : 'Subjudul', sl.subtitle, 2);
  if (ly === 'stat') h += f('sv', 'Angka', sl.stat && sl.stat.value) + f('sl', 'Label angka', sl.stat && sl.stat.label);
  if (ly === 'bullets') h += f('bullets', 'Poin-poin (satu per baris)', L(sl.bullets).join('\n'), 6);
  if (ly === 'two-col') h += f('leftTitle', 'Judul kolom kiri', sl.leftTitle) + f('left', 'Isi kolom kiri (satu per baris)', L(sl.left).join('\n'), 4) + f('rightTitle', 'Judul kolom kanan', sl.rightTitle) + f('right', 'Isi kolom kanan (satu per baris)', L(sl.right).join('\n'), 4);
  if (ly === 'timeline' || ly === 'cards') h += f('items', (ly === 'cards' ? 'Kartu' : 'Tahap') + ' (satu per baris: judul | keterangan)', (sl.items || []).map(x => (x.t || '') + ' | ' + (x.d || '')).join('\n'), 5);
  if (ly === 'image' || ly === 'bullets') h += `<div class="fld"><label>Gambar</label><div class="prow"><button type="button" class="btn" id="fImg">${ico('img')} ${sl.image ? 'Ganti gambar' : 'Pilih gambar'}</button>${sl.image ? '<button type="button" class="btn dan" id="fImgX">Hapus gambar</button>' : ''}</div><input type="file" id="fImgF" accept="image/*" hidden></div>`;
  h += f('notes', 'Catatan pembicara', sl.notes, 3);
  h += `<div class="prow"><button type="button" class="btn" data-mv="-1">${ico('up')} Naik</button><button type="button" class="btn" data-mv="1">${ico('dn')} Turun</button><button type="button" class="btn" id="sDup">${ico('copy')} Gandakan</button><button type="button" class="btn dan" id="sDel">${ico('trash')} Hapus</button></div>`;
  return h;
}
function animPanel(A) {
  return `<p class="slab">Animasi masuk tiap elemen</p><div class="chipset">${ENT.map(e => `<button type="button" class="schip${A.entrance === e[0] ? ' on' : ''}" data-ent="${e[0]}">${e[1]}</button>`).join('')}</div>
  <p class="slab">Transisi antarslide</p><div class="chipset">${TRANS.map(e => `<button type="button" class="schip${A.transition === e[0] ? ' on' : ''}" data-tr="${e[0]}">${e[1]}</button>`).join('')}</div>
  <p class="slab">Kecepatan</p><div class="chipset">${SPEED.map(e => `<button type="button" class="schip${A.speed === e[0] ? ' on' : ''}" data-sp="${e[0]}">${e[1]}</button>`).join('')}</div>
  <label class="chk"><input type="checkbox" id="aStag"${A.stagger ? ' checked' : ''}>Muncul bergantian, satu per satu</label>
  <label class="chk"><input type="checkbox" id="aPpt"${A.pptAnim ? ' checked' : ''}>Sertakan animasi masuk di file PowerPoint</label>
  <button type="button" class="btn wide" id="aPrev">${ico('play', 1)} Lihat animasi slide ini</button>
  <p class="sfine">Di file PowerPoint, animasi masuk menjadi efek pudar (atau sapuan untuk "Sapuan"), dan transisi "Balik" menjadi "Tutup". Animasi lengkap tampil saat presentasi dari Obsidia atau berkas HTML.</p>`;
}
function renderSlides() {
  const deck = ensureDeck(); sSel = clamp(sSel, 0, Math.max(0, deck.slides.length - 1));
  [deck.theme.hf, deck.theme.bf].forEach(loadFont);
  const sl = deck.slides[sSel];
  sRoot.innerHTML = `<div class="stu">
  <div class="stbar"><select class="in sdeck" id="sDeck" aria-label="Pilih presentasi">${ST.decks.map(d => `<option value="${d.id}"${d.id === deck.id ? ' selected' : ''}>${esc(d.title || 'Tanpa judul')}</option>`).join('')}<option value="__new">+ Presentasi baru</option></select>
  <input class="in stitle" id="sTitle" value="${esc(deck.title)}" aria-label="Judul presentasi">
  <div class="sbtns"><button type="button" class="btn pri" id="sAI">${ico('spark')} Buat dengan AI</button><button type="button" class="btn" id="sPlay">${ico('play', 1)} Presentasikan</button><button type="button" class="btn" id="sPptx">${ico('down')} PowerPoint</button><button type="button" class="btn" id="sHtml">${ico('down')} HTML</button><button type="button" class="ib" id="sUndo" aria-label="Urungkan" title="Urungkan">${ico('redo')}</button><button type="button" class="ib" id="sDelDeck" aria-label="Hapus presentasi" title="Hapus presentasi">${ico('trash')}</button></div></div>
  <div class="aibox" id="sAiBox" hidden><textarea class="in" id="sTopic" rows="3" placeholder="Topik presentasi, misalnya: Strategi pengamanan kapal dari pembajakan di Selat Malaka"></textarea>
  <div class="prow"><label class="mini">Jumlah slide <select class="in" id="sN">${[5, 6, 8, 10, 12, 15].map(n => `<option${n === 8 ? ' selected' : ''}>${n}</option>`).join('')}</select></label><label class="mini">Gaya <select class="in" id="sTone"><option>Profesional</option><option>Santai dan menarik</option><option>Akademik</option><option>Persuasif untuk jualan</option><option>Untuk anak sekolah</option></select></label><label class="mini">Template <select class="in" id="sTpl"><option value="">Biarkan yang sekarang</option>${THEMES.map(t => `<option value="${t.id}">${t.n}</option>`).join('')}</select></label></div>
  <div class="prow"><button type="button" class="btn pri" id="sGo">Buat presentasi</button><span class="sfine" id="sAiMsg"></span></div></div>
  <div class="stmain"><div class="stleft" id="sThumbs">${thumbs(deck)}</div>
  <div class="stcenter"><div class="stage" id="sStage"><div class="ssc">${sl ? slideHTML(deck, sl, sSel, false) : ''}</div></div><p class="sfine center">Slide ${sSel + 1} dari ${deck.slides.length}${sl ? ', ' + LAYOUTS.find(l => l[0] === sl.layout)[1].toLowerCase() : ''}</p></div>
  <div class="stright"><div class="stabs2">${[['isi', 'Isi'], ['tpl', 'Template'], ['color', 'Warna'], ['font', 'Font'], ['anim', 'Animasi']].map(t => `<button type="button" class="${sTab === t[0] ? 'on' : ''}" data-tab2="${t[0]}">${t[1]}</button>`).join('')}</div>
  <div class="spanel" id="sPanel">${sTab === 'isi' ? slideForm(deck, sl) : sTab === 'anim' ? animPanel(deck.anim) : designPanel(sTab, deck.theme)}</div></div></div></div>`;
  scaleAll(); resizeObs.disconnect(); resizeObs.observe(sRoot); $$('.tv,#sStage', sRoot).forEach(x => resizeObs.observe(x));
}
function scaleAll() {
  if (!sRoot) return;
  const st = $('#sStage', sRoot); if (st) { const s = st.clientWidth / 1280; $('.ssc', st).style.transform = `scale(${s})`; st.style.height = 720 * s + 'px'; }
  $$('.tv', sRoot).forEach(t => { const s = t.clientWidth / 1280; $('.tsc', t).style.transform = `scale(${s})`; t.style.height = 720 * s + 'px'; });
}
function bindSlides() {
  const R = sRoot, deck = () => curDeck(), sl = () => deck().slides[sSel];
  const upd = (fn, keepFocus) => { commit(fn); if (keepFocus) { const d = deck(); $('#sStage .ssc', R).innerHTML = slideHTML(d, d.slides[sSel], sSel, false); const th = $(`.th[data-k="${sSel}"] .tsc`, R); if (th) th.innerHTML = slideHTML(d, d.slides[sSel], sSel, false); scaleAll(); } else renderSlides(); };
  bindDesign(R, () => deck().theme, fn => upd(() => fn(deck().theme)));
  R.addEventListener('click', async e => {
    const b = e.target.closest('button,[data-k]'); if (!b) return;
    const d = deck();
    if (b.dataset.k != null) { sSel = +b.dataset.k; renderSlides(); return; }
    if (b.dataset.tab2) { sTab = b.dataset.tab2; renderSlides(); return; }
    if (b.dataset.ent) return upd(() => { d.anim.entrance = b.dataset.ent; });
    if (b.dataset.tr) return upd(() => { d.anim.transition = b.dataset.tr; });
    if (b.dataset.sp) return upd(() => { d.anim.speed = b.dataset.sp; });
    if (b.dataset.mv) { const j = sSel + +b.dataset.mv; if (j < 0 || j >= d.slides.length) return; upd(() => { const [x] = d.slides.splice(sSel, 1); d.slides.splice(j, 0, x); sSel = j; }); return; }
    switch (b.id) {
      case 'sAdd': upd(() => { d.slides.splice(sSel + 1, 0, { id: uid(), layout: 'bullets', title: 'Judul slide', bullets: ['Poin pertama', 'Poin kedua'] }); sSel++; sTab = 'isi'; }); break;
      case 'sDup': upd(() => { const c = clone(sl()); c.id = uid(); d.slides.splice(sSel + 1, 0, c); sSel++; }); break;
      case 'sDel': if (d.slides.length < 2) { O.toast('Presentasi butuh minimal satu slide.'); return; } upd(() => { d.slides.splice(sSel, 1); sSel = Math.max(0, sSel - 1); }); break;
      case 'sUndo': undo(renderSlides); break;
      case 'sDelDeck': if (!b.dataset.ok) { b.dataset.ok = 1; b.style.color = 'var(--acc)'; O.toast('Tekan sekali lagi untuk menghapus presentasi ini.'); setTimeout(() => { delete b.dataset.ok; b.style.color = ''; }, 3000); return; } upd(() => { ST.decks = ST.decks.filter(x => x.id !== d.id); ST.deck = null; sSel = 0; }); break;
      case 'sAI': $('#sAiBox', R).hidden = !$('#sAiBox', R).hidden; $('#sTopic', R).focus(); break;
      case 'sGo': genDeck(); break;
      case 'sPlay': present(d, sSel); break;
      case 'aPrev': { const st = $('#sStage .ssc', R); st.innerHTML = slideHTML(d, sl(), sSel, true); break; }
      case 'sPptx': await exportDeck('pptx', b); break;
      case 'sHtml': await exportDeck('html', b); break;
      case 'fImg': $('#fImgF', R).click(); break;
      case 'fImgX': upd(() => { delete sl().image; }); break;
    }
  });
  R.addEventListener('change', async e => {
    const t = e.target, d = deck();
    if (t.id === 'sDeck') { if (t.value === '__new') { commit(() => { const nd = { id: 'd' + uid(), title: 'Presentasi baru', theme: clone(d.theme), anim: clone(d.anim), slides: [{ id: uid(), layout: 'title', title: 'Judul presentasi', subtitle: 'Subjudul' }] }; ST.decks.unshift(nd); ST.deck = nd.id; }); } else ST.deck = t.value; sSel = 0; save(); renderSlides(); return; }
    if (t.id === 'fImgF' && t.files[0]) { try { const data = await fileToData(t.files[0]); upd(() => { sl().image = data; }); } catch (err) { O.toast('Gambar tidak bisa dibaca.'); } return; }
    if (t.id === 'aStag') return upd(() => { d.anim.stagger = t.checked; });
    if (t.id === 'aPpt') return upd(() => { d.anim.pptAnim = t.checked; });
    if (t.dataset.f === 'layout') return upd(() => { sl().layout = t.value; });
  });
  R.addEventListener('input', e => {
    const t = e.target, d = deck();
    if (t.id === 'sTitle') { d.title = t.value; d.sample = false; save(); const o = $(`#sDeck option[value="${d.id}"]`, R); if (o) o.textContent = t.value || 'Tanpa judul'; return; }
    const k = t.dataset.f; if (!k || k === 'layout') return;
    upd(() => {
      const s = sl(); d.sample = false;
      if (k === 'sv' || k === 'sl') { s.stat = s.stat || {}; s.stat[k === 'sv' ? 'value' : 'label'] = t.value; }
      else if (k === 'bullets' || k === 'left' || k === 'right') s[k] = t.value.split('\n');
      else if (k === 'items') s.items = t.value.split('\n').filter(x => x.trim()).map(x => { const [a, ...r] = x.split('|'); return { t: a.trim(), d: r.join('|').trim() }; });
      else s[k] = t.value;
    }, true);
  });
  R.addEventListener('keydown', e => { const th = e.target.closest('[data-k]'); if (th && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); th.click(); } });
}
async function exportDeck(kind, btn) {
  const d = curDeck(); btn.disabled = true; const old = btn.innerHTML; btn.textContent = 'Menyiapkan…';
  try {
    const name = (d.title || 'presentasi').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 50) || 'presentasi';
    if (kind === 'pptx') { const blob = await buildPptx(d); await O.saveBlob(blob, name + '.pptx'); }
    else await O.saveBlob(new Blob([buildHTML(d)], { type: 'text/html' }), name + '.html');
  } catch (e) { O.toast(e.message || 'Gagal membuat berkas.'); }
  btn.disabled = false; btn.innerHTML = old;
}
async function genDeck() {
  if (sGen) return; const R = sRoot, topic = $('#sTopic', R).value.trim(); if (!topic) { $('#sTopic', R).focus(); return; }
  const n = +$('#sN', R).value, tone = $('#sTone', R).value, tpl = $('#sTpl', R).value, msg = $('#sAiMsg', R);
  sGen = true; $('#sGo', R).disabled = true; msg.textContent = 'AI sedang menyusun presentasi…';
  const prompt = `Buat presentasi dalam bahasa Indonesia tentang: "${topic}".
Jumlah slide: ${n}. Gaya bahasa: ${tone}.
Balas HANYA JSON dengan bentuk:
{"title":"judul presentasi","slides":[{"layout":"...","title":"...","subtitle":"...","bullets":["..."],"leftTitle":"...","left":["..."],"rightTitle":"...","right":["..."],"items":[{"t":"...","d":"..."}],"stat":{"value":"...","label":"..."},"quote":"...","author":"...","notes":"catatan pembicara 2-3 kalimat"}]}
Layout yang boleh: title (judul+subtitle), section (pembuka bagian: title+subtitle), bullets (title+bullets), two-col (title+leftTitle+left+rightTitle+right, cocok untuk perbandingan), stat (stat.value angka pendek seperti "73%" + stat.label + subtitle penjelasan), quote (quote+author), timeline (title+items 3-5 tahap), cards (title+items 3-4), closing (title+subtitle).
Aturan: slide pertama "title", slide terakhir "closing". Pakai minimal 5 jenis layout berbeda dan jangan dua slide berurutan dengan layout sama. Judul maksimal 8 kata. Maksimal 5 poin per slide, tiap poin maksimal 12 kata. Untuk items: "t" maksimal 4 kata, "d" maksimal 14 kata. Jangan mengarang data statistik spesifik; jika memakai angka, gunakan angka yang umum diketahui atau tulis sebagai perkiraan. Setiap slide wajib punya "notes". Hanya sertakan field yang dipakai layout itu.`;
  try {
    const j = await aiJSON(prompt, len => { msg.textContent = 'AI sedang menulis… ' + len + ' karakter'; });
    if (!j || !Array.isArray(j.slides) || !j.slides.length) throw new Error('Format presentasi dari AI tidak lengkap. Coba lagi.');
    const okL = new Set(LAYOUTS.map(l => l[0]));
    const cur = curDeck();
    const theme = tpl ? themeOf(tpl) : clone(cur ? cur.theme : THEMES[0]);
    const nd = { id: 'd' + uid(), title: String(j.title || topic).slice(0, 90), theme, anim: cur ? clone(cur.anim) : { entrance: 'fade-up', transition: 'fade', speed: 'med', stagger: true, pptAnim: true }, slides: j.slides.slice(0, 30).map(s => ({ id: uid(), layout: okL.has(s.layout) ? s.layout : 'bullets', title: String(s.title || ''), subtitle: String(s.subtitle || ''), bullets: L(s.bullets), leftTitle: String(s.leftTitle || ''), left: L(s.left), rightTitle: String(s.rightTitle || ''), right: L(s.right), items: (Array.isArray(s.items) ? s.items : []).map(x => ({ t: String((x && x.t) || ''), d: String((x && x.d) || '') })), stat: s.stat && typeof s.stat === 'object' ? { value: String(s.stat.value || ''), label: String(s.stat.label || '') } : undefined, quote: String(s.quote || ''), author: String(s.author || ''), notes: String(s.notes || '') })) };
    commit(() => { if (cur && cur.sample) ST.decks = ST.decks.filter(x => x.id !== cur.id); ST.decks.unshift(nd); ST.deck = nd.id; });
    sSel = 0; sTab = 'isi'; renderSlides(); O.toast('Presentasi siap: ' + nd.slides.length + ' slide.');
  } catch (e) { if (e.message !== 'no provider') msg.textContent = O.errText(e); }
  sGen = false; const g = $('#sGo', R); if (g) g.disabled = false;
}

/* =====================================================================
   STUDIO VIDEO
   ===================================================================== */
const VLAYOUTS = [['title', 'Judul'], ['text', 'Teks'], ['list', 'Daftar'], ['stat', 'Angka besar'], ['quote', 'Kutipan'], ['image', 'Foto'], ['cta', 'Ajakan']];
const VANIM = [['rise', 'Naik'], ['pop', 'Memantul'], ['zoom', 'Membesar'], ['slide', 'Geser'], ['type', 'Ketik'], ['fade', 'Pudar']];
const VTRANS = [['fade', 'Pudar'], ['slide', 'Geser'], ['zoom', 'Zoom'], ['wipe', 'Sapu'], ['cut', 'Potong']];
const RATIOS = [['16:9', 'YouTube 16:9'], ['9:16', 'Story/Reels 9:16'], ['1:1', 'Feed 1:1']];
const MUSIC = [['none', 'Tanpa musik'], ['calm', 'Tenang'], ['upbeat', 'Ceria'], ['cinematic', 'Sinematik'], ['lofi', 'Lo-fi'], ['file', 'Unggah lagu']];
const VTPL = [
  { id: 'promo', n: 'Promo produk', ratio: '16:9', theme: 'neon', music: 'upbeat', anim: 'pop', trans: 'zoom', scenes: [['title', 'Kenalkan Produk Baru', 'Lebih cepat. Lebih mudah.'], ['list', 'Kenapa kamu akan suka', '', ['Hemat waktu', 'Mudah dipakai', 'Harga bersahabat']], ['stat', '10.000+', 'pengguna sudah mencoba'], ['cta', 'Coba sekarang', 'Kunjungi tautan di bio']] },
  { id: 'story', n: 'Story Instagram', ratio: '9:16', theme: 'pastel', music: 'upbeat', anim: 'rise', trans: 'slide', scenes: [['title', 'Hari ini aku belajar', 'sesuatu yang seru'], ['text', 'Ternyata', 'hal kecil yang dilakukan rutin bisa mengubah banyak hal'], ['list', '3 kebiasaan baik', '', ['Bangun lebih pagi', 'Minum air putih', 'Jalan kaki 20 menit']], ['cta', 'Kamu tim yang mana?', 'Balas di DM']] },
  { id: 'edukasi', n: 'Video edukasi', ratio: '16:9', theme: 'samudra', music: 'calm', anim: 'rise', trans: 'fade', scenes: [['title', 'Bagaimana Kapal Bisa Mengapung?', 'Penjelasan singkat hukum Archimedes'], ['text', 'Gaya ke atas', 'Air mendorong benda ke atas sebesar berat air yang dipindahkannya.'], ['list', 'Kuncinya', '', ['Lambung kapal berongga', 'Massa jenis rata-rata kecil', 'Air yang dipindahkan banyak']], ['quote', 'Eureka!', 'Archimedes'], ['cta', 'Paham sekarang?', 'Bagikan ke temanmu']] },
  { id: 'kutipan', n: 'Kutipan', ratio: '1:1', theme: 'senja', music: 'cinematic', anim: 'type', trans: 'fade', scenes: [['quote', 'Lautan yang tenang tidak pernah melahirkan pelaut yang tangguh.', 'Pepatah'], ['cta', 'Tetap semangat', 'Simpan untuk pengingat']] },
  { id: 'slideshow', n: 'Slideshow foto', ratio: '16:9', theme: 'obsidian', music: 'calm', anim: 'fade', trans: 'fade', scenes: [['title', 'Kenangan Perjalanan', '2026'], ['image', 'Hari pertama', 'Pilih foto untuk adegan ini'], ['image', 'Momen terbaik', 'Pilih foto untuk adegan ini'], ['cta', 'Sampai jumpa lagi', '']] },
  { id: 'acara', n: 'Pengumuman acara', ratio: '9:16', theme: 'retro', music: 'upbeat', anim: 'slide', trans: 'wipe', scenes: [['title', 'Jangan Lewatkan!', 'Seminar Maritim Nasional'], ['list', 'Detail acara', '', ['Sabtu, 12 Desember', 'Pukul 09.00 WIB', 'Aula utama kampus']], ['cta', 'Daftar sekarang', 'Kuota terbatas']] },
  { id: 'tutorial', n: 'Tutorial langkah', ratio: '16:9', theme: 'minimal', music: 'lofi', anim: 'slide', trans: 'slide', scenes: [['title', 'Cara Membuat Kopi Tubruk', 'Hanya 4 langkah'], ['text', 'Langkah 1', 'Panaskan air sampai hampir mendidih.'], ['text', 'Langkah 2', 'Masukkan dua sendok kopi ke gelas.'], ['text', 'Langkah 3', 'Tuang air, aduk, lalu tunggu 4 menit.'], ['cta', 'Selamat menikmati', '']] },
  { id: 'fakta', n: 'Fakta cepat', ratio: '9:16', theme: 'hutan', music: 'upbeat', anim: 'pop', trans: 'zoom', scenes: [['title', 'Fakta yang jarang diketahui', ''], ['stat', '70%', 'permukaan bumi tertutup air'], ['stat', '17.000+', 'pulau di Indonesia'], ['cta', 'Ikuti untuk fakta lain', '']] },
];
const vScene = (ly, title, text, items, V) => ({ id: uid(), layout: ly, title: title || '', text: text || '', items: items || [], dur: ly === 'title' || ly === 'cta' ? 3 : ly === 'list' ? 4.5 : ly === 'quote' ? 5 : 3.5, anim: (V && V.anim) || 'rise', trans: (V && V.trans) || 'fade' });
function videoFromTpl(tp) { const V = { id: 'v' + uid(), title: tp.n, tpl: tp.id, ratio: tp.ratio, theme: themeOf(tp.theme), music: { type: tp.music, vol: .7 }, narr: null, bar: true, sfx: true, anim: tp.anim, trans: tp.trans, scenes: [] }; V.scenes = tp.scenes.map(s => vScene(s[0], s[1], s[2], s[3], tp)); return V; }
const total = V => V.scenes.reduce((n, s) => n + (+s.dur || 3), 0);
function dims(ratio, q) { const b = q === '1080' ? 1080 : 720; if (ratio === '9:16') return [b, Math.round(b * 16 / 9)]; if (ratio === '1:1') return [b, b]; return [Math.round(b * 16 / 9), b]; }
const ease = { out: t => 1 - (1 - t) ** 3, back: t => { const c = 1.70158, d = c + 1; return 1 + d * (t - 1) ** 3 + c * (t - 1) ** 2; }, io: t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2 };
function wrap(ctx, text, maxW) { const out = []; String(text || '').split('\n').forEach(p => { const w = p.split(/\s+/).filter(Boolean); let line = ''; w.forEach(x => { const t = line ? line + ' ' + x : x; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = x; } else line = t; }); out.push(line); }); return out; }
function fitText(ctx, text, family, weight, size, maxW, maxLines, minSize) { let s = size, lines; for (; ;) { ctx.font = `${weight} ${s}px "${family}"`; lines = wrap(ctx, text, maxW); if (lines.length <= maxLines && lines.every(l => ctx.measureText(l).width <= maxW) || s <= minSize) break; s = Math.max(minSize, s * .92); } return { s, lines }; }
const imgCache = new Map();
function getImg(src) { if (!src) return null; if (!imgCache.has(src)) { const im = new Image(); im.src = src; imgCache.set(src, im); } const im = imgCache.get(src); return im.complete && im.naturalWidth ? im : null; }
function drawBg(ctx, W, H, T, gt, sc, t) {
  ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
  const u = Math.min(W, H) / 720;
  // cahaya bergerak
  const blobs = [[.18, .22, T.acc, .22], [.84, .78, T.acc2, .2], [.75, .15, T.bg2, .9]];
  blobs.forEach(([x, y, c, a], i) => { const cx = W * (x + .05 * Math.sin(gt * .4 + i * 2)), cy = H * (y + .05 * Math.cos(gt * .35 + i)), r = 420 * u * (1 + .08 * Math.sin(gt * .6 + i)); const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); });
  if (T.deco === 'grid' || T.deco === 'lines') { ctx.strokeStyle = rgba(T.acc, .07); ctx.lineWidth = 1; const st = 64 * u, off = (gt * 12 * u) % st; ctx.beginPath(); for (let x = -st + off; x < W; x += st) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y < H; y += st) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke(); }
  if (T.deco === 'dots' || T.deco === 'circles' || T.deco === 'blobs') { for (let i = 0; i < 14; i++) { const r = rnd(i + 5); const x = (r() * W + gt * 18 * u * (r() + .3)) % W, y = (r() * H - gt * 22 * u * (r() + .2)) % H; ctx.fillStyle = rgba(i % 2 ? T.acc : T.acc2, .18); ctx.beginPath(); ctx.arc(x, (y + H) % H, (4 + r() * 10) * u, 0, 7); ctx.fill(); } }
  if (sc.layout === 'image') { const im = getImg(sc.image); if (im) { const k = 1 + .1 * clamp(t / (sc.dur || 3), 0, 1), s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * k; const iw = im.naturalWidth * s, ih = im.naturalHeight * s; ctx.drawImage(im, (W - iw) / 2 - t * 6 * u, (H - ih) / 2, iw, ih); } else { ctx.fillStyle = T.bg2; ctx.fillRect(0, 0, W, H); } const g = ctx.createLinearGradient(0, H * .45, 0, H); g.addColorStop(0, rgba(T.bg, 0)); g.addColorStop(1, rgba(T.bg, .92)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
}
function drawScene(ctx, W, H, V, sc, t, gt) {
  const T = V.theme, u = Math.min(W, H) / 720, portrait = H > W, m = 70 * u, maxW = W - m * 2, hw = hb(T.hf) ? 700 : 400;
  drawBg(ctx, W, H, T, gt, sc, t);
  let j = 0;
  const el = (fn, kind) => { const st = .2 + j++ * .22, p = clamp((t - st) / .65, 0, 1); if (p <= 0 && sc.anim !== 'type') return; const a = sc.anim; ctx.save(); let e = ease.out(p); if (a === 'pop') e = ease.back(p); ctx.globalAlpha = a === 'type' ? (t >= st ? 1 : 0) : clamp(p * 1.4, 0, 1); const box = fn(true); if (box) { const cx = box[0] + box[2] / 2, cy = box[1] + box[3] / 2; if (a === 'rise') ctx.translate(0, (1 - e) * 46 * u); if (a === 'slide') ctx.translate((1 - e) * -90 * u, 0); if (a === 'zoom' || a === 'pop') { const s = a === 'zoom' ? .8 + .2 * e : .5 + .5 * e; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); } } fn(false, a === 'type' ? clamp((t - st) / Math.max(.6, (kind || 20) * .045), 0, 1) : 1); ctx.restore(); };
  const txt = (s, x, y, align, color) => { ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
  const block = (text, fam, wt, size, maxL, minS, color, x, yTop, align, lh = 1.15) => { const f = fitText(ctx, text, fam, wt, size, maxW - (x - m) * (align === 'center' ? 0 : 1), maxL, minS); return { f, h: f.lines.length * f.s * lh, draw: (frac = 1, y0 = yTop) => { ctx.font = `${wt} ${f.s}px "${fam}"`; let left = Math.round(f.lines.join(' ').length * frac); f.lines.forEach((l, i) => { const show = l.slice(0, Math.max(0, left)); left -= l.length + 1; if (show) txt(show, align === 'center' ? W / 2 : x, y0 + f.s * (i + .85) * lh, align, color); }); } }; };
  const center = portrait || ['title', 'stat', 'cta', 'quote'].includes(sc.layout);
  const al = center ? 'center' : 'left', X = m;
  switch (sc.layout) {
    case 'title': case 'cta': {
      const tb = block(sc.title, T.hf, hw, (portrait ? 92 : 96) * u, 4, 34 * u, T.ink, X, 0, al, 1.05), sb = block(sc.text, T.bf, 400, 34 * u, 3, 20 * u, sc.layout === 'cta' ? T.bg : T.mute, X, 0, al, 1.25);
      const gap = 40 * u, th = tb.h + (sc.text ? gap + sb.h + (sc.layout === 'cta' ? 36 * u : 0) : 0); let y = (H - th) / 2;
      el((mm, fr) => { if (mm) return [0, y, W, tb.h]; tb.draw(fr, y); }, sc.title.length);
      // garis aksen
      el(m => { const w = 110 * u, x = center ? (W - w) / 2 : X; if (m) return [x, y + tb.h + gap * .45, w, 8 * u]; ctx.fillStyle = T.acc; ctx.fillRect(x, y + tb.h + gap * .45, w, 7 * u); });
      if (sc.text) el((mm, fr) => { const yy = y + tb.h + gap; if (sc.layout === 'cta') { ctx.font = `400 ${sb.f.s}px "${T.bf}"`; const w = Math.max(...sb.f.lines.map(l => ctx.measureText(l).width)) + 70 * u, h = sb.h + 30 * u, x = center ? (W - w) / 2 : X; if (mm) return [x, yy, w, h]; ctx.fillStyle = T.acc; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, yy, w, h, h / 2) : ctx.rect(x, yy, w, h); ctx.fill(); const s2 = block(sc.text, T.bf, 400, sb.f.s, 3, sb.f.s, T.bg, x + 35 * u, yy + 15 * u, al, 1.25); s2.draw(fr); return; } if (mm) return [0, yy, W, sb.h]; const s2 = block(sc.text, T.bf, 400, sb.f.s, 3, sb.f.s, T.mute, X, yy, al, 1.25); s2.draw(fr); }, sc.text.length);
      break;
    }
    case 'text': {
      const tb = block(sc.title, T.hf, hw, 64 * u, 3, 30 * u, T.acc, X, 0, al), bb = block(sc.text, T.bf, 400, (portrait ? 46 : 42) * u, portrait ? 9 : 6, 22 * u, T.ink, X, 0, al, 1.3);
      let y = (H - tb.h - 30 * u - bb.h) / 2;
      el((mm, fr) => { if (mm) return [0, y, W, tb.h]; tb.draw(fr, y); }, sc.title.length);
      el((mm, fr) => { const yy = y + tb.h + 30 * u; if (mm) return [0, yy, W, bb.h]; const b2 = block(sc.text, T.bf, 400, bb.f.s, 9, bb.f.s, T.ink, X, yy, al, 1.3); b2.draw(fr); }, sc.text.length);
      break;
    }
    case 'list': {
      const items = L(sc.items).slice(0, 6), tb = block(sc.title, T.hf, hw, 62 * u, 2, 30 * u, T.ink, X, 0, 'left');
      const isz = clamp(Math.min((H * .55) / Math.max(1, items.length) / 1.9, 46 * u), 22 * u, 46 * u);
      const ibs = items.map(it => block(it, T.bf, 400, isz, 2, 18 * u, T.ink, X + 56 * u, 0, 'left', 1.2));
      const ih = ibs.reduce((n, b) => n + b.h + 26 * u, 0); let y = (H - tb.h - 50 * u - ih) / 2;
      el((mm, fr) => { if (mm) return [0, y, W, tb.h]; tb.draw(fr, y); }, sc.title.length);
      let yy = y + tb.h + 50 * u;
      ibs.forEach((b, k) => { const top = yy; el((mm, fr) => { if (mm) return [X, top, maxW, b.h]; ctx.fillStyle = k % 2 ? T.acc2 : T.acc; ctx.beginPath(); ctx.arc(X + 16 * u, top + b.f.s * .55, 11 * u, 0, 7); ctx.fill(); const b2 = block(L(sc.items)[k], T.bf, 400, b.f.s, 2, b.f.s, T.ink, X + 56 * u, top, 'left', 1.2); b2.draw(fr); }, 16); yy += b.h + 26 * u; });
      break;
    }
    case 'stat': {
      const vb = block(sc.title, T.hf, hw, (portrait ? 190 : 210) * u, 1, 60 * u, T.acc, X, 0, 'center', 1), lb = block(sc.text, T.bf, 400, 46 * u, 3, 22 * u, T.ink, X, 0, 'center', 1.25);
      let y = (H - vb.h - 30 * u - lb.h) / 2;
      el((mm, fr) => { if (mm) return [0, y, W, vb.h]; const p = clamp((t - .2) / .9, 0, 1), num = String(sc.title).match(/^([^\d]*)([\d.,]+)(.*)$/); if (num && sc.anim !== 'type') { const raw = +num[2].replace(/\./g, '').replace(',', '.'); if (isFinite(raw)) { const cur = raw * ease.out(p); const fmt = num[2].includes(',') && !num[2].includes('.') ? cur.toFixed(1).replace('.', ',') : /^\d{1,4}$/.test(num[2]) ? String(Math.round(cur)) : Math.round(cur).toLocaleString('id-ID'); ctx.font = `${hw} ${vb.f.s}px "${T.hf}"`; txt(num[1] + fmt + num[3], W / 2, y + vb.f.s * .85, 'center', T.acc); return; } } vb.draw(fr, y); }, 8);
      el((mm, fr) => { const yy = y + vb.h + 30 * u; if (mm) return [0, yy, W, lb.h]; const l2 = block(sc.text, T.bf, 400, lb.f.s, 3, lb.f.s, T.ink, X, yy, 'center', 1.25); l2.draw(fr); }, sc.text.length);
      break;
    }
    case 'quote': {
      const qb = block(sc.title, T.hf, 400, (portrait ? 60 : 56) * u, portrait ? 9 : 6, 26 * u, T.ink, X, 0, 'center', 1.3);
      let y = (H - qb.h - 140 * u) / 2 + 90 * u;
      el(mm => { if (mm) return [W / 2 - 60 * u, y - 150 * u, 120 * u, 140 * u]; ctx.font = `400 ${200 * u}px "${T.hf}"`; txt('“', W / 2, y - 10 * u, 'center', T.acc); });
      el((mm, fr) => { if (mm) return [0, y, W, qb.h]; qb.draw(fr, y); }, sc.title.length);
      if (sc.text) el((mm, fr) => { const yy = y + qb.h + 30 * u; if (mm) return [0, yy, W, 40 * u]; ctx.font = `400 ${30 * u}px "${T.bf}"`; txt('— ' + sc.text, W / 2, yy + 30 * u, 'center', T.mute); }, sc.text.length);
      break;
    }
    case 'image': {
      const tb = block(sc.title, T.hf, hw, 64 * u, 2, 28 * u, T.ink, X, 0, al), sb = block(sc.image ? sc.text : (sc.text || 'Pilih foto untuk adegan ini'), T.bf, 400, 30 * u, 2, 18 * u, T.mute, X, 0, al);
      const y = H - m - sb.h - 16 * u - tb.h;
      el((mm, fr) => { if (mm) return [0, y, W, tb.h]; tb.draw(fr, y); }, sc.title.length);
      el((mm, fr) => { const yy = y + tb.h + 16 * u; if (mm) return [0, yy, W, sb.h]; const s2 = block(sc.image ? sc.text : (sc.text || 'Pilih foto untuk adegan ini'), T.bf, 400, sb.f.s, 2, sb.f.s, T.mute, X, yy, al); s2.draw(fr); }, 20);
      break;
    }
  }
}
function frameAt(ctx, W, H, V, T, offA, offB) {
  const sc = V.scenes; if (!sc.length) { ctx.fillStyle = V.theme.bg; ctx.fillRect(0, 0, W, H); return; }
  let s0 = 0, k = 0; for (; k < sc.length - 1 && T >= s0 + (+sc[k].dur || 3); k++) s0 += +sc[k].dur || 3;
  const t = T - s0, TR = .55, tr = sc[k].trans;
  if (k > 0 && t < TR && tr !== 'cut') {
    const prev = sc[k - 1], ca = offA.getContext('2d'), cb = offB.getContext('2d');
    drawScene(ca, W, H, V, prev, (+prev.dur || 3) + t, T); drawScene(cb, W, H, V, sc[k], t, T);
    const p = ease.io(t / TR);
    ctx.save();
    if (tr === 'fade') { ctx.drawImage(offA, 0, 0); ctx.globalAlpha = p; ctx.drawImage(offB, 0, 0); }
    else if (tr === 'slide') { ctx.drawImage(offA, -p * W, 0); ctx.drawImage(offB, (1 - p) * W, 0); }
    else if (tr === 'zoom') { ctx.globalAlpha = 1 - p; ctx.translate(W / 2, H / 2); ctx.scale(1 + .2 * p, 1 + .2 * p); ctx.drawImage(offA, -W / 2, -H / 2); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = p; ctx.translate(W / 2, H / 2); ctx.scale(.85 + .15 * p, .85 + .15 * p); ctx.drawImage(offB, -W / 2, -H / 2); }
    else { ctx.drawImage(offA, 0, 0); ctx.beginPath(); ctx.rect(0, 0, W * p, H); ctx.clip(); ctx.drawImage(offB, 0, 0); ctx.restore(); ctx.save(); ctx.fillStyle = V.theme.acc; ctx.fillRect(W * p - 6, 0, 12, H); }
    ctx.restore();
  } else drawScene(ctx, W, H, V, sc[k], t, T);
  if (V.bar) { const all = total(V); ctx.fillStyle = rgba(V.theme.ink, .15); ctx.fillRect(0, H - 8 * Math.min(W, H) / 720, W, 8 * Math.min(W, H) / 720); ctx.fillStyle = V.theme.acc; ctx.fillRect(0, H - 8 * Math.min(W, H) / 720, W * clamp(T / all, 0, 1), 8 * Math.min(W, H) / 720); }
}

/* ---------- musik buatan (Web Audio) ---------- */
function noiseBuf(ac) { const b = ac.createBuffer(1, ac.sampleRate * .5, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
function musicGen(ac, out, style, dur, at) {
  const cfg = { calm: [78, 'triangle', .5], upbeat: [116, 'sawtooth', .35], cinematic: [62, 'sawtooth', .45], lofi: [84, 'triangle', .45] }[style]; if (!cfg) return;
  const [bpm, wave, pv] = cfg, beat = 60 / bpm, bar = beat * 4, nb = Math.ceil(dur / bar) + 1;
  const prog = style === 'cinematic' ? [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]] : style === 'lofi' ? [[0, 4, 7, 11], [-3, 0, 4, 7], [5, 9, 12, 16], [7, 11, 14, 17]] : [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]];
  const base = style === 'cinematic' ? 45 : 48, hz = n => 440 * 2 ** ((n - 69) / 12);
  const master = ac.createGain(); master.gain.setValueAtTime(0, at); master.gain.linearRampToValueAtTime(1, at + 1.2); master.gain.setValueAtTime(1, at + Math.max(1.3, dur - 1.6)); master.gain.linearRampToValueAtTime(0, at + dur); master.connect(out);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = style === 'lofi' ? 1400 : 1900; lp.connect(master);
  const note = (f, t0, len, type, vol, dest = lp, atk = .02) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + atk); g.gain.setTargetAtTime(0, t0 + len * .7, len * .25); o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + len + .5); };
  const nz = noiseBuf(ac);
  for (let b = 0; b < nb; b++) {
    const t0 = at + b * bar; if (t0 > at + dur) break; const ch = prog[b % prog.length];
    ch.forEach(n => { note(hz(base + 12 + n), t0, bar, wave, .05 * pv, lp, style === 'upbeat' ? .05 : .5); note(hz(base + 12 + n) * 1.004, t0, bar, wave, .04 * pv, lp, .6); });
    for (let q = 0; q < (style === 'upbeat' ? 8 : 4); q++) { const tb = t0 + q * (style === 'upbeat' ? beat / 2 : beat); note(hz(base + ch[0] - (q % 4 === 3 ? 5 : 0)), tb, style === 'upbeat' ? beat * .45 : beat * .9, 'triangle', .16, master, .01); }
    if (style !== 'cinematic') for (let q = 0; q < 8; q++) { if (style === 'calm' && q % 2) continue; const tn = t0 + q * beat / 2; note(hz(base + 24 + ch[q % ch.length]), tn, beat * .45, 'sine', .045, master, .005); }
    if (style === 'upbeat' || style === 'lofi') for (let q = 0; q < 4; q++) { const tk = t0 + q * beat; const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, tk); o.frequency.exponentialRampToValueAtTime(40, tk + .18); g.gain.setValueAtTime(style === 'lofi' ? .25 : .35, tk); g.gain.exponentialRampToValueAtTime(.001, tk + .25); o.connect(g); g.connect(master); o.start(tk); o.stop(tk + .3); const s = ac.createBufferSource(), hg = ac.createGain(), hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000; s.buffer = nz; hg.gain.setValueAtTime(.05, tk + beat / 2); hg.gain.exponentialRampToValueAtTime(.001, tk + beat / 2 + .06); s.connect(hp); hp.connect(hg); hg.connect(master); s.start(tk + beat / 2, 0, .08); }
    if (style === 'cinematic' && b % 2 === 0) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(90, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + .6); g.gain.setValueAtTime(.3, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + 1.4); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 1.5); }
  }
}
async function dataToBuffer(ac, data) { const ab = await (await fetch(data)).arrayBuffer(); return ac.decodeAudioData(ab); }
async function startAudio(ac, out, V, at) {
  const dur = total(V), nodes = [];
  if (V.music.type === 'file' && V.music.data) { try { const buf = await dataToBuffer(ac, V.music.data); const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = buf; s.loop = true; g.gain.setValueAtTime(V.music.vol, at); g.gain.setValueAtTime(V.music.vol, at + Math.max(0, dur - 1.5)); g.gain.linearRampToValueAtTime(0, at + dur); s.connect(g); g.connect(out); s.start(at); s.stop(at + dur + .1); nodes.push(s); } catch (e) { O.toast('Lagu tidak bisa diputar. Coba format MP3 atau M4A.'); } }
  else if (V.music.type !== 'none') { const g = ac.createGain(); g.gain.value = V.music.vol; g.connect(out); musicGen(ac, g, V.music.type, dur, at); }
  if (V.narr && V.narr.data) { try { const buf = await dataToBuffer(ac, V.narr.data); const s = ac.createBufferSource(), g = ac.createGain(); g.gain.value = V.narr.vol || 1; s.buffer = buf; s.connect(g); g.connect(out); s.start(at + .3); nodes.push(s); } catch (e) { O.toast('Narasi tidak bisa diputar.'); } }
  if (V.sfx) { let s0 = 0; const nz = noiseBuf(ac); V.scenes.forEach((sc, k) => { if (k > 0 && sc.trans !== 'cut') { const tt = at + s0 - .05, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nz; f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(400, tt); f.frequency.exponentialRampToValueAtTime(5000, tt + .45); g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(.12, tt + .15); g.gain.linearRampToValueAtTime(0, tt + .5); s.connect(f); f.connect(g); g.connect(out); s.start(tt, 0, .5); } s0 += +sc.dur || 3; }); }
  return nodes;
}

/* ---------- ekspor video ---------- */
function pickMime() { const L2 = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']; if (!window.MediaRecorder) return null; return L2.find(t => MediaRecorder.isTypeSupported(t)) || ''; }
async function prepVideo(V) { await fontsReady(V.theme); await Promise.all(V.scenes.filter(s => s.image).map(s => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = s.image; imgCache.set(s.image, im); }))); }
async function recordVideo(V, q, ac, onProg, isCancelled) {
  const mime = pickMime(); if (mime === null) throw new Error('Browser ini tidak bisa merekam video. Pakai Safari atau Chrome versi terbaru.');
  const [W, H] = dims(V.ratio, q), cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
  const offA = document.createElement('canvas'), offB = document.createElement('canvas'); offA.width = offB.width = W; offA.height = offB.height = H;
  await prepVideo(V);
  frameAt(ctx, W, H, V, 0, offA, offB);
  const stream = cv.captureStream(30), dest = ac.createMediaStreamDestination();
  const hasAudio = V.music.type !== 'none' || (V.narr && V.narr.data) || V.sfx;
  if (hasAudio) { await ac.resume(); dest.stream.getAudioTracks().forEach(t => stream.addTrack(t)); }
  const rec = new MediaRecorder(stream, Object.assign(mime ? { mimeType: mime } : {}, { videoBitsPerSecond: W * H > 1e6 ? 10e6 : 6e6, audioBitsPerSecond: 160000 }));
  const chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  const done = new Promise(r => { rec.onstop = r; });
  const dur = total(V);
  rec.start(250);
  const at = ac.currentTime + .05; if (hasAudio) await startAudio(ac, dest, V, at);
  const t0 = performance.now() + 50;
  await new Promise(res => { const loop = () => { if (isCancelled()) { res(); return; } const T = Math.max(0, (performance.now() - t0) / 1000); frameAt(ctx, W, H, V, Math.min(T, dur - .001), offA, offB); onProg(Math.min(1, T / dur)); if (T >= dur + .15) { res(); return; } requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
  rec.stop(); await done; stream.getTracks().forEach(t => t.stop());
  if (isCancelled()) return null;
  const type = (rec.mimeType || mime || 'video/webm').split(';')[0];
  return { blob: new Blob(chunks, { type }), ext: type.includes('mp4') ? 'mp4' : 'webm' };
}

/* ---------- Video AI dari foto (Hugging Face) ---------- */
const HF_SPACES = [{ id: 'zerogpu-aoti/wan2-2-fp8da-aoti-faster', n: 'Wan 2.2 Cepat (14B)', fn: 'generate_video', max: 5 }];
const HF_NEG = '色调艳丽, 过曝, 静态, 细节模糊不清, 字幕, 风格, 作品, 画作, 画面, 静止, 整体发灰, 最差质量, 低质量, JPEG压缩残留, 丑陋的, 残缺的, 多余的手指, 画得不好的手部, 画得不好的脸部, 畸形的, 毁容的, 形态畸形的肢体, 手指融合, 静止不动的画面, 杂乱的背景, 三条腿, 背景人很多, 倒着走';
const PROMPTS = [['Kamera mendekat', 'Kamera bergerak pelan mendekat ke subjek, gerakan halus dan sinematik'], ['Tertiup angin', 'Rambut dan pakaian tertiup angin sepoi-sepoi, daun di latar bergoyang'], ['Ombak & awan', 'Ombak bergulung pelan dan awan bergerak di langit, suasana tenang'], ['Tersenyum melambai', 'Orang di foto tersenyum lalu melambaikan tangan ke kamera'], ['Slow motion', 'Gerakan slow motion sinematik dengan cahaya lembut dan kedalaman ruang'], ['Kamera mengitari', 'Kamera berputar pelan mengitari subjek, latar bergeser alami'], ['Hujan turun', 'Hujan rintik turun, tetesan air memantulkan cahaya'], ['Hidup & dinamis', 'Buat foto ini hidup dengan gerakan alami, sinematik, dan halus']];
const STEPS = [[4, 'Cepat'], [6, 'Seimbang'], [8, 'Terbaik']];
const aivURL = new Map(), aiCtl = new Map(), aiPolls = new Set();
const hfE = (m, st) => { const e = new Error(m); e.status = st || 0; return e; };
function hfMsg(e) {
  const t = String((e && e.message) || e || ''), s = e && e.status;
  if (s === 401 || s === 403 || /token/i.test(t) && /tolak|invalid|unauthor/i.test(t)) return 'Token Hugging Face salah atau tidak berlaku. Periksa di bagian Akun Hugging Face.';
  if (s === 429 || /quota|exceeded/i.test(t)) return 'Kuota GPU gratis harian Hugging Face sudah habis. Kuota pulih 24 jam setelah pemakaian pertama hari ini.';
  if (/no gpu|gpu.*(available|busy)|queue is full/i.test(t)) return 'GPU Hugging Face sedang penuh. Coba lagi beberapa menit lagi.';
  if (s === 503 || /dinyalakan|sleeping|building|starting/i.test(t)) return 'Space Hugging Face sedang dinyalakan. Coba lagi 1–2 menit lagi.';
  if (!s && /fetch|network|failed/i.test(t)) return 'Tidak bisa terhubung ke Hugging Face. Periksa internet, atau aktifkan mode latar belakang di Pengaturan.';
  return t || 'Video gagal dibuat. Coba lagi.';
}
async function hfHostOf(space, auth) {
  try { const r = await fetch('https://huggingface.co/api/spaces/' + space + '/host', { headers: auth }); if (r.ok) { const j = await r.json(); if (j && j.host) return String(j.host).replace(/\/+$/, ''); } if (r.status === 401 || r.status === 403) throw hfE('Token Hugging Face ditolak.', 401); } catch (e) { if (e.status === 401) throw e; }
  return 'https://' + space.replace(/[\/._]/g, '-').toLowerCase() + '.hf.space';
}
async function hfDirect(job, onStage, signal) {
  const auth = job.token ? { Authorization: 'Bearer ' + job.token } : {};
  onStage('Menghubungi Hugging Face…');
  const host = await hfHostOf(job.space, auth);
  const img = await (await fetch(job.image)).blob();
  let base = null, up = null;
  onStage('Mengunggah foto…');
  for (const b of [host + '/gradio_api', host]) {
    const fd = new FormData(); fd.append('files', img, 'foto.jpg');
    const r = await fetch(b + '/upload', { method: 'POST', headers: auth, body: fd, signal });
    if (r.status === 404) continue;
    if (r.status === 401 || r.status === 403) throw hfE('Token Hugging Face ditolak.', 401);
    if (r.status === 502 || r.status === 503) throw hfE('Space sedang dinyalakan', 503);
    if (!r.ok) throw hfE('Gagal mengunggah foto (HTTP ' + r.status + ').', r.status);
    up = await r.json(); base = b; break;
  }
  if (!base || !Array.isArray(up) || !up[0]) throw hfE('Space tidak dapat dihubungi. Mungkin sedang mati atau berubah.', 404);
  const call = await fetch(base + '/call/' + job.fn, { method: 'POST', signal, headers: Object.assign({ 'Content-Type': 'application/json' }, auth), body: JSON.stringify({ data: [{ path: up[0], meta: { _type: 'gradio.FileData' }, orig_name: 'foto.jpg' }, ...job.params] }) });
  if (!call.ok) throw hfE('Space menolak permintaan (HTTP ' + call.status + ').', call.status);
  const { event_id } = await call.json();
  onStage('Menunggu GPU dan membuat video…');
  const res = await fetch(base + '/call/' + job.fn + '/' + event_id, { headers: auth, signal });
  if (!res.ok || !res.body) throw hfE('Gagal membaca hasil (HTTP ' + res.status + ').', res.status);
  const rd = res.body.getReader(), dec = new TextDecoder(); let buf = '', ev = 'message', out = null;
  outer: for (;;) { const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).replace(/\r$/, ''); buf = buf.slice(i + 1); if (line.startsWith('event:')) ev = line.slice(6).trim(); else if (line.startsWith('data:')) { const d = line.slice(5).trim(); if (ev === 'complete') { out = { ok: JSON.parse(d) }; break outer; } if (ev === 'error') { let m = d; try { m = JSON.parse(d); } catch (e) { } out = { err: String((m && (m.message || m.error || m)) || '') }; break outer; } } } }
  try { rd.cancel(); } catch (e) { }
  if (!out) throw hfE('Koneksi ke Space terputus sebelum video selesai.', 0);
  if (out.err != null) throw hfE(!out.err || out.err === 'null' ? 'Space gagal membuat video. Bisa jadi kuota GPU gratis harian sudah habis.' : out.err, /quota|exceeded/i.test(out.err) ? 429 : 500);
  const v = out.ok[0], fdv = (v && v.video) || v;
  if (!fdv || !(fdv.url || fdv.path)) throw hfE('Space tidak mengirim video.', 500);
  onStage('Mengunduh video…');
  const vr = await fetch(fdv.url || base + '/file=' + fdv.path, { headers: auth, signal });
  if (!vr.ok) throw hfE('Gagal mengunduh video (HTTP ' + vr.status + ').', vr.status);
  return await vr.blob();
}
const curSpace = () => HF_SPACES.find(x => x.id === ST.hf.space) || HF_SPACES[0];
async function smallThumb(src) { try { const im = await loadImg(src); const k = 360 / Math.max(im.naturalWidth, im.naturalHeight), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .8); } catch (e) { return null; } }
function aiCard(it) {
  const st = it.status === 'pending' ? `<div class="aistat"><span class="dots"><i></i><i></i><i></i></span><span class="tt" data-t0="${it.created}" data-l="${esc(it.stage || 'Membuat video')}">${esc(it.stage || 'Membuat video')}…</span></div><p class="sfine">${it.job ? 'Dikerjakan di server. Boleh tutup Obsidia, hasilnya tersimpan di sini.' : 'Biarkan Obsidia tetap terbuka sampai selesai.'}</p><button type="button" class="btn" data-acancel="${it.id}">Batalkan</button>`
    : it.status === 'error' ? `<p class="err">${esc(it.err || 'Gagal')}</p><div class="prow"><button type="button" class="btn" data-aretry="${it.id}">${ico('redo')} Coba lagi</button><button type="button" class="btn dan" data-adel="${it.id}">${ico('trash')} Hapus</button></div>`
    : `<video class="aivid" data-avid="${it.id}" controls loop playsinline muted preload="metadata" ${it.thumb ? `poster="${esc(it.thumb)}"` : ''}></video><div class="prow"><button type="button" class="btn" data-asave="${it.id}">${ico('down')} Simpan</button><button type="button" class="btn" data-areuse="${it.id}">${ico('redo')} Buat lagi</button><button type="button" class="btn dan" data-adel="${it.id}">${ico('trash')} Hapus</button></div>`;
  return `<div class="aicard" data-aid="${it.id}">${it.status !== 'done' && it.thumb ? `<img class="aithumb" src="${esc(it.thumb)}" alt="">` : ''}<div class="aibody"><p class="aip">${esc(it.prompt)}</p><p class="sfine">${(+it.dur).toFixed(1)} detik, ${(STEPS.find(x => x[0] === it.steps) || ['', ''])[1].toLowerCase()}, ${esc(rel(it.created))}</p>${st}</div></div>`;
}
const rel = t => { const x = (Date.now() - t) / 1000; return x < 60 ? 'baru saja' : x < 3600 ? Math.floor(x / 60) + ' menit lalu' : x < 86400 ? Math.floor(x / 3600) + ' jam lalu' : new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); };
function modeBar() { return `<div class="modesw" role="tablist"><button type="button" role="tab" class="${ST.vmode !== 'tpl' ? 'on' : ''}" data-vmode="ai">${ico('spark')} Video AI dari foto</button><button type="button" role="tab" class="${ST.vmode === 'tpl' ? 'on' : ''}" data-vmode="tpl">${ico('film')} Video template</button></div>`; }
function renderAIV() {
  const busy = ST.aivids.some(x => x.status === 'pending' && !x.job);
  vRoot.innerHTML = `<div class="stu">${modeBar()}<div class="aiv">
  <div class="aivl">
    <button type="button" class="drop${ST.aiImg ? ' has' : ''}" id="aDrop" aria-label="Pilih foto">${ST.aiImg ? `<img src="${esc(ST.aiImg)}" alt="Foto yang dipilih"><span class="chg">Ganti foto</span>` : `${ico('img')}<b>Pilih foto</b><span>JPG atau PNG. Foto akan dihidupkan menjadi video.</span>`}</button><input type="file" id="aImgF" accept="image/*" hidden>
    <div class="fld"><label for="aPrompt">Mau jadi video seperti apa?</label><textarea class="in" id="aPrompt" rows="3" placeholder="Contoh: kapal berlayar pelan, ombak bergerak, kamera menjauh perlahan">${esc(ST.aiPrompt)}</textarea></div>
    <div class="chipset">${PROMPTS.map((p, k) => `<button type="button" class="schip" data-pp="${k}">${p[0]}</button>`).join('')}</div>
    <label class="chk"><input type="checkbox" id="aEnh"${ST.aiEnh ? ' checked' : ''}>Sempurnakan perintah dengan AI chat (diterjemahkan ke bahasa Inggris agar lebih dipahami)</label>
    <div class="fld"><label for="aDur">Durasi: <b id="aDurL">${(+ST.aiDur).toFixed(1)} detik</b></label><input type="range" id="aDur" min="1.5" max="${curSpace().max}" step=".5" value="${ST.aiDur}"></div>
    <p class="slab">Kualitas</p><div class="chipset">${STEPS.map(x => `<button type="button" class="schip${ST.aiSteps === x[0] ? ' on' : ''}" data-ast="${x[0]}">${x[1]}</button>`).join('')}</div>
    <button type="button" class="btn pri wide" id="aGo"${busy ? ' disabled' : ''}>${ico('spark')} Buat video</button>
    <p class="sfine" id="aMsg">${O.relayOn() ? 'Mode latar belakang aktif: video tetap dibuat walau Obsidia ditutup.' : 'Tanpa mode latar belakang, biarkan Obsidia terbuka sampai video selesai (1–5 menit).'}</p>
    <details class="hfacc"${ST.hf.token ? '' : ' open'}><summary>Akun Hugging Face ${ST.hf.token ? '(tersambung)' : '(wajib diisi)'}</summary>
      <p class="sfine">Video dibuat gratis di Hugging Face, sekitar 2–3 video per hari. Buat akun di huggingface.co, lalu buat token di <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener">huggingface.co/settings/tokens</a> dengan jenis <b>Read</b>.</p>
      <div class="kr"><input class="in" id="aTok" type="password" value="${esc(ST.hf.token)}" placeholder="hf_..." autocomplete="off" spellcheck="false"><button type="button" class="btn" id="aTokT">Tes</button></div>
      <p class="msgp" id="aTokM"></p>
      <div class="fld"><label for="aSpace">Model</label><select class="in" id="aSpace">${HF_SPACES.map(x => `<option value="${x.id}"${x.id === ST.hf.space ? ' selected' : ''}>${x.n}</option>`).join('')}</select><small>Model Wan 2.2 dari Alibaba, hasil maksimal 5 detik, 16 fps, sisi terpanjang 832 piksel.</small></div>
    </details>
  </div>
  <div class="aivr"><p class="slab">Hasil video</p>${ST.aivids.length ? ST.aivids.map(aiCard).join('') : '<p class="sfine">Belum ada video. Pilih foto, tulis perintah, lalu tekan Buat video.</p>'}</div>
  </div></div>`;
  $$('video[data-avid]', vRoot).forEach(async v => { const id = v.dataset.avid; let u = aivURL.get(id); if (!u) { const b = await O.idbGet('aiv:' + id); if (!b) return; u = URL.createObjectURL(b); aivURL.set(id, u); } v.src = u; });
  ST.aivids.filter(x => x.status === 'pending' && x.job).forEach(pollAIV);
}
async function genAIV(reuse) {
  const R = vRoot, msg = $('#aMsg', R);
  if (reuse) { ST.aiPrompt = reuse.prompt; ST.aiDur = reuse.dur; ST.aiSteps = reuse.steps; }
  if (!ST.aiImg) { O.toast('Pilih foto dulu.'); return; }
  if (!ST.hf.token) { O.toast('Isi token Hugging Face dulu.'); const d = $('.hfacc', R); if (d) d.open = true; $('#aTok', R) && $('#aTok', R).focus(); return; }
  const prompt = (ST.aiPrompt || '').trim() || PROMPTS[7][1];
  const sp = curSpace(), dur = clamp(+ST.aiDur || 3.5, 1, sp.max), steps = ST.aiSteps || 6;
  const it = { id: 'a' + uid(), prompt, dur, steps, created: Date.now(), status: 'pending', stage: 'Menyiapkan', thumb: await smallThumb(ST.aiImg) };
  commit(() => ST.aivids.unshift(it)); renderAIV();
  let en = prompt;
  if (ST.aiEnh && O.providersReady()) { setStage(it, 'Menyempurnakan perintah'); try { en = String(await O.askAI('Kamu penulis prompt untuk AI pembuat video dari foto.', `Ubah perintah berikut menjadi prompt image-to-video berbahasa Inggris yang jelas dan sinematik, maksimal 60 kata. Fokus pada gerakan subjek, gerakan kamera, dan suasana. Jangan menambah objek yang tidak ada di foto. Balas hanya prompt-nya tanpa tanda kutip.\n\nPerintah: ${prompt}`, {})).trim().replace(/^["']|["']$/g, '').slice(0, 700) || prompt; } catch (e) { en = prompt; } }
  it.promptEn = en;
  const job = { space: sp.id, fn: sp.fn, token: ST.hf.token.trim(), image: ST.aiImg, params: [en, steps, HF_NEG, dur, 1, 1, Math.floor(Math.random() * 2147483647), true] };
  if (O.relayOn()) {
    try { setStage(it, 'Mengirim ke server'); await O.relay('POST', '/jobs', { id: it.id, kind: 'hfvideo', title: 'Video AI', hf: job }); it.job = it.id; it.stage = 'Dikerjakan di server'; save(); if (vRoot && ST.vmode !== 'tpl') renderAIV(); else pollAIV(it); return; }
    catch (e) { O.toast('Server latar belakang tidak bisa dihubungi, video dibuat langsung.'); }
  }
  const ctl = new AbortController(); aiCtl.set(it.id, ctl);
  try { const blob = await hfDirect(job, s => setStage(it, s.replace(/…$/, '')), ctl.signal); await O.idbSet('aiv:' + it.id, blob); it.status = 'done'; O.toast('Video AI siap.'); }
  catch (e) { if (ctl.signal.aborted) { ST.aivids = ST.aivids.filter(x => x !== it); } else { it.status = 'error'; it.err = hfMsg(e); } }
  aiCtl.delete(it.id); delete it.stage; save(); if (vRoot && ST.vmode !== 'tpl') renderAIV();
}
function setStage(it, s) { it.stage = s; const el = vRoot && $(`.aicard[data-aid="${it.id}"] .tt`, vRoot); if (el) el.dataset.l = s; }
async function pollAIV(it) {
  if (aiPolls.has(it.id)) return; aiPolls.add(it.id); let fails = 0;
  try {
    while (it.status === 'pending' && it.job && ST.aivids.includes(it)) {
      let s; try { s = await O.relay('GET', '/jobs/' + it.job); fails = 0; } catch (e) { if (e.status === 401) { it.status = 'error'; it.err = 'Kata sandi server latar belakang salah.'; break; } if (++fails > 40) { it.status = 'error'; it.err = 'Server latar belakang tidak bisa dihubungi.'; break; } await new Promise(r => setTimeout(r, 4000)); continue; }
      if (s.state === 'done') { setStage(it, 'Mengunduh video'); const r = await O.relayRaw('/jobs/' + it.job + '/video'); if (!r.ok) { it.status = 'error'; it.err = 'Video tidak bisa diambil dari server.'; break; } await O.idbSet('aiv:' + it.id, await r.blob()); it.status = 'done'; O.relay('DELETE', '/jobs/' + it.job).catch(() => { }); O.toast('Video AI siap.'); break; }
      if (s.state === 'error') { const l = (s.tried || [])[0]; it.status = 'error'; it.err = hfMsg(hfE(l ? l.msg : 'Gagal', l ? l.status : 0)); O.relay('DELETE', '/jobs/' + it.job).catch(() => { }); break; }
      if (s.state === 'missing' || s.state === 'cancelled') { it.status = 'error'; it.err = 'Tugas video tidak ditemukan di server. Tekan Coba lagi.'; break; }
      setStage(it, s.state === 'running' ? 'Dikerjakan di server' : 'Mengantre di server');
      await new Promise(r => setTimeout(r, 3000));
    }
  } finally { aiPolls.delete(it.id); delete it.stage; save(); if (vRoot && ST.vmode !== 'tpl') renderAIV(); }
}
function bindAIV() {
  const R = vRoot;
  R.addEventListener('click', async e => {
    if (ST.vmode === 'tpl') return;
    const b = e.target.closest('button'); if (!b) return;
    const find = id => ST.aivids.find(x => x.id === id);
    if (b.id === 'aDrop') { $('#aImgF', R).click(); return; }
    if (b.dataset.pp != null) { const t = $('#aPrompt', R); ST.aiPrompt = PROMPTS[+b.dataset.pp][1]; t.value = ST.aiPrompt; save(); return; }
    if (b.dataset.ast) { ST.aiSteps = +b.dataset.ast; save(); $$('[data-ast]', R).forEach(x => x.classList.toggle('on', x === b)); return; }
    if (b.id === 'aGo') { genAIV(); return; }
    if (b.id === 'aTokT') { const m = $('#aTokM', R); m.className = 'msgp'; m.textContent = 'Memeriksa…'; try { const r = await fetch('https://huggingface.co/api/whoami-v2', { headers: { Authorization: 'Bearer ' + ST.hf.token.trim() } }); if (!r.ok) throw hfE('', r.status); const j = await r.json(); m.className = 'msgp ok'; m.textContent = 'Tersambung sebagai ' + (j.name || 'akun Hugging Face') + '.'; } catch (err) { m.className = 'msgp bad'; m.textContent = err.status === 401 ? 'Token salah atau sudah tidak berlaku.' : 'Tidak bisa memeriksa token sekarang. Token tetap tersimpan.'; } return; }
    const id = b.dataset.acancel || b.dataset.aretry || b.dataset.adel || b.dataset.asave || b.dataset.areuse; if (!id) return; const it = find(id); if (!it) return;
    if (b.dataset.acancel) { const c = aiCtl.get(id); if (c) c.abort(); if (it.job) { O.relay('POST', '/jobs/' + it.job + '/cancel').catch(() => { }); O.relay('DELETE', '/jobs/' + it.job).catch(() => { }); } commit(() => { ST.aivids = ST.aivids.filter(x => x !== it); }); renderAIV(); return; }
    if (b.dataset.adel) { const u = aivURL.get(id); if (u) URL.revokeObjectURL(u); aivURL.delete(id); O.idbSet('aiv:' + id, null); commit(() => { ST.aivids = ST.aivids.filter(x => x !== it); }); renderAIV(); return; }
    if (b.dataset.asave) { const bl = await O.idbGet('aiv:' + id); if (bl) await O.saveBlob(bl, 'video-ai-' + id.slice(1, 7) + '.mp4'); return; }
    if (b.dataset.aretry) { commit(() => { ST.aivids = ST.aivids.filter(x => x !== it); }); genAIV(it); return; }
    if (b.dataset.areuse) { ST.aiPrompt = it.prompt; ST.aiDur = it.dur; ST.aiSteps = it.steps; save(); renderAIV(); vRoot.scrollTo && vRoot.scrollTo(0, 0); O.toast('Perintah dimuat. Ganti foto atau ubah perintah, lalu tekan Buat video.'); return; }
  });
  R.addEventListener('input', e => {
    if (ST.vmode === 'tpl') return; const t = e.target;
    if (t.id === 'aPrompt') { ST.aiPrompt = t.value; save(); }
    if (t.id === 'aDur') { ST.aiDur = +t.value; $('#aDurL', R).textContent = (+t.value).toFixed(1) + ' detik'; save(); }
    if (t.id === 'aTok') { ST.hf.token = t.value.trim(); save(); }
  });
  R.addEventListener('change', async e => {
    if (ST.vmode === 'tpl') return; const t = e.target;
    if (t.id === 'aEnh') { ST.aiEnh = t.checked; save(); }
    if (t.id === 'aSpace') { ST.hf.space = t.value; save(); }
    if (t.id === 'aImgF' && t.files[0]) { try { ST.aiImg = await fileToData(t.files[0], 1024); save(); renderAIV(); } catch (err) { O.toast('Foto tidak bisa dibaca.'); } t.value = ''; }
  });
}

/* ---------- UI Studio Video ---------- */
let vRoot = null, vTab = 'isi', vSel = 0, vPlay = null, vT = 0, vGen = false, vExp = null;
const curVideo = () => ST.videos.find(v => v.id === ST.video) || null;
function ensureVideo() { if (!ST.videos.length) { const v = videoFromTpl(VTPL[2]); v.sample = true; v.title = 'Contoh: ' + v.title; ST.videos.push(v); ST.video = v.id; save(); } if (!curVideo()) ST.video = ST.videos[0].id; return curVideo(); }
const sceneStart = (V, k) => V.scenes.slice(0, k).reduce((n, s) => n + (+s.dur || 3), 0);
function vForm(V, sc) {
  if (!sc) return '';
  const f = (id, label, val, rows) => `<div class="fld"><label for="v_${id}">${label}</label>${rows ? `<textarea class="in" id="v_${id}" data-vf="${id}" rows="${rows}">${esc(val || '')}</textarea>` : `<input class="in" id="v_${id}" data-vf="${id}" type="text" value="${esc(val || '')}">`}</div>`;
  const ly = sc.layout;
  let h = `<div class="fld"><label for="v_layout">Jenis adegan</label><select class="in" id="v_layout" data-vf="layout">${VLAYOUTS.map(l => `<option value="${l[0]}"${l[0] === ly ? ' selected' : ''}>${l[1]}</option>`).join('')}</select></div>`;
  h += f('title', { stat: 'Angka', quote: 'Kutipan' }[ly] || 'Judul', sc.title, ly === 'quote' ? 3 : 2);
  if (ly !== 'list') h += f('text', { stat: 'Keterangan angka', quote: 'Sumber kutipan', cta: 'Teks tombol ajakan', text: 'Isi teks' }[ly] || 'Subjudul', sc.text, ly === 'text' ? 4 : 2);
  if (ly === 'list') h += f('items', 'Butir daftar (satu per baris, maks 6)', L(sc.items).join('\n'), 5);
  if (ly === 'image') h += `<div class="fld"><label>Foto</label><div class="prow"><button type="button" class="btn" id="vImg">${ico('img')} ${sc.image ? 'Ganti foto' : 'Pilih foto'}</button></div><input type="file" id="vImgF" accept="image/*" hidden></div>`;
  h += `<div class="fld"><label for="v_dur">Durasi: <b id="vDurL">${(+sc.dur).toFixed(1)} detik</b></label><input type="range" id="v_dur" data-vf="dur" min="1.5" max="12" step=".5" value="${sc.dur}"></div>`;
  h += `<p class="slab">Animasi teks</p><div class="chipset">${VANIM.map(a => `<button type="button" class="schip${sc.anim === a[0] ? ' on' : ''}" data-van="${a[0]}">${a[1]}</button>`).join('')}</div>`;
  h += `<p class="slab">Transisi masuk ke adegan ini</p><div class="chipset">${VTRANS.map(a => `<button type="button" class="schip${sc.trans === a[0] ? ' on' : ''}" data-vtr="${a[0]}">${a[1]}</button>`).join('')}</div>`;
  h += `<div class="prow"><button type="button" class="btn" id="vAllAnim">Pakai animasi ini di semua adegan</button></div>`;
  h += `<div class="prow"><button type="button" class="btn" data-vmv="-1">${ico('up')} Naik</button><button type="button" class="btn" data-vmv="1">${ico('dn')} Turun</button><button type="button" class="btn" id="vDup">${ico('copy')} Gandakan</button><button type="button" class="btn dan" id="vDel">${ico('trash')} Hapus</button></div>`;
  return h;
}
function vMusicPanel(V) {
  return `<p class="slab">Musik latar</p><div class="chipset">${MUSIC.map(m => `<button type="button" class="schip${V.music.type === m[0] ? ' on' : ''}" data-mus="${m[0]}">${m[1]}</button>`).join('')}</div>
  ${V.music.type === 'file' ? `<div class="prow"><button type="button" class="btn" id="mFile">${ico('music')} ${V.music.data ? 'Ganti lagu' : 'Pilih lagu'}</button><span class="sfine">${esc(V.music.name || 'Belum ada lagu')}</span></div><input type="file" id="mFileF" accept="audio/*" hidden>` : ''}
  <div class="fld"><label for="mVol">Volume musik</label><input type="range" id="mVol" min="0" max="1" step=".05" value="${V.music.vol}"></div>
  <p class="slab">Narasi (suara kamu)</p><div class="prow"><button type="button" class="btn" id="nFile">${ico('mic')} ${V.narr ? 'Ganti narasi' : 'Unggah rekaman suara'}</button>${V.narr ? `<button type="button" class="btn dan" id="nDel">Hapus</button>` : ''}</div><input type="file" id="nFileF" accept="audio/*" hidden>
  <p class="sfine">Rekam suaramu dengan app Memo Suara, lalu unggah di sini. Narasi diputar dari awal video.</p>
  <label class="chk"><input type="checkbox" id="vSfx"${V.sfx ? ' checked' : ''}>Efek suara "whoosh" saat transisi</label>
  <label class="chk"><input type="checkbox" id="vBar"${V.bar ? ' checked' : ''}>Bilah kemajuan di bawah video</label>
  <p class="sfine">Musik buatan disusun otomatis oleh Obsidia, jadi bebas hak cipta.</p>`;
}
function vTplPanel(V) { return `<p class="slab">Template video</p><div class="vtpl">${VTPL.map(t => { const th = themeOf(t.theme); return `<button type="button" class="vcard${V.tpl === t.id ? ' on' : ''}" data-vtpl="${t.id}" style="background:${th.bg};color:${th.ink}"><b style="font-family:'${th.hf}'">${t.n}</b><span>${t.ratio}, musik ${MUSIC.find(m => m[0] === t.music)[1].toLowerCase()}</span><i style="background:${th.acc}"></i></button>`; }).join('')}</div><p class="sfine">Template mengganti rasio, warna, font, musik, animasi, dan contoh adegan. Isi adeganmu akan diganti.</p><p class="slab">Warna dan font saja</p>${designPanel('tpl', V.theme)}`; }
function renderVideo() {
  if (ST.vmode !== 'tpl') { renderAIV(); return; }
  const V = ensureVideo(); vSel = clamp(vSel, 0, Math.max(0, V.scenes.length - 1)); loadFont(V.theme.hf); loadFont(V.theme.bf);
  const sc = V.scenes[vSel], all = total(V);
  vRoot.innerHTML = `<div class="stu">${modeBar()}
  <div class="stbar"><select class="in sdeck" id="vSel" aria-label="Pilih video">${ST.videos.map(v => `<option value="${v.id}"${v.id === V.id ? ' selected' : ''}>${esc(v.title || 'Tanpa judul')}</option>`).join('')}<option value="__new">+ Video baru</option></select>
  <input class="in stitle" id="vTitle" value="${esc(V.title)}" aria-label="Judul video">
  <div class="sbtns"><button type="button" class="btn pri" id="vAI">${ico('spark')} Buat dengan AI</button><select class="in qsel" id="vQ" aria-label="Kualitas"><option value="720">720p</option><option value="1080">1080p</option></select><button type="button" class="btn" id="vExp">${ico('down')} Ekspor video</button><button type="button" class="ib" id="vUndo" aria-label="Urungkan" title="Urungkan">${ico('redo')}</button><button type="button" class="ib" id="vDelV" aria-label="Hapus video" title="Hapus video">${ico('trash')}</button></div></div>
  <div class="aibox" id="vAiBox" hidden><textarea class="in" id="vTopic" rows="3" placeholder="Isi video, misalnya: Promosi jasa servis AC dengan harga terjangkau"></textarea>
  <div class="prow"><label class="mini">Template <select class="in" id="vTpl">${VTPL.map(t => `<option value="${t.id}"${t.id === (V.tpl || 'promo') ? ' selected' : ''}>${t.n}</option>`).join('')}</select></label><label class="mini">Durasi <select class="in" id="vLen"><option value="15">15 detik</option><option value="30" selected>30 detik</option><option value="60">60 detik</option></select></label></div>
  <div class="prow"><button type="button" class="btn pri" id="vGo">Buat video</button><span class="sfine" id="vAiMsg"></span></div></div>
  <div class="stmain vmain"><div class="stleft" id="vScenes">${V.scenes.map((s, k) => `<div class="th vth${k === vSel ? ' on' : ''}" role="button" tabindex="0" data-vk="${k}"><span class="tn">${k + 1}</span><canvas class="vcv" data-vc="${k}"></canvas><span class="vlab">${esc(VLAYOUTS.find(l => l[0] === s.layout)[1])}, ${(+s.dur).toFixed(1)} dtk</span></div>`).join('')}<button type="button" class="th add" id="vAdd">${ico('plus')}<span>Adegan baru</span></button></div>
  <div class="stcenter"><div class="vstage r${V.ratio.replace(':', '')}"><canvas id="vCv"></canvas></div>
  <div class="vctl"><button type="button" class="ib" id="vPP" aria-label="Putar">${ico(vPlay ? 'pause' : 'play', 1)}</button><input type="range" id="vScrub" min="0" max="${all.toFixed(2)}" step=".01" value="${vT}" aria-label="Posisi video"><span class="vtime" id="vTime">${vT.toFixed(1)} / ${all.toFixed(1)} dtk</span></div>
  <div class="chipset rat">${RATIOS.map(r => `<button type="button" class="schip${V.ratio === r[0] ? ' on' : ''}" data-rat="${r[0]}">${r[1]}</button>`).join('')}</div>
  <div class="vprog" id="vProg" hidden><div><i id="vBarI"></i></div><span id="vProgT"></span><button type="button" class="btn" id="vCancel">Batal</button></div></div>
  <div class="stright"><div class="stabs2">${[['isi', 'Adegan'], ['tpl', 'Template'], ['color', 'Warna'], ['font', 'Font'], ['music', 'Musik']].map(t => `<button type="button" class="${vTab === t[0] ? 'on' : ''}" data-vtab="${t[0]}">${t[1]}</button>`).join('')}</div>
  <div class="spanel" id="vPanel">${vTab === 'isi' ? vForm(V, sc) : vTab === 'tpl' ? vTplPanel(V) : vTab === 'music' ? vMusicPanel(V) : designPanel(vTab, V.theme)}</div></div></div></div>`;
  $('#vQ', vRoot).value = ST.vq || '720';
  drawPreview(); drawThumbs(); fontsReady(V.theme).then(() => { if (vRoot) drawPreview(); });
}
let thumbT = 0;
function drawThumbs() { clearTimeout(thumbT); thumbT = setTimeout(async () => { const V = curVideo(); if (!V || !vRoot) return; await fontsReady(V.theme); const [W, H] = dims(V.ratio, '720'); $$('.vcv', vRoot).forEach(c => { const k = +c.dataset.vc, sc = V.scenes[k]; if (!sc) return; const s = 220 / Math.max(W, H); c.width = Math.round(W * s); c.height = Math.round(H * s); const x = c.getContext('2d'); x.save(); x.scale(s, s); drawScene(x, W, H, V, sc, (+sc.dur || 3) - .05, 0); x.restore(); }); }, 120); }
let offPA = null, offPB = null;
function drawPreview() {
  const V = curVideo(), cv = $('#vCv', vRoot); if (!V || !cv) return;
  const [W, H] = dims(V.ratio, '720'); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  if (!offPA || offPA.width !== W || offPA.height !== H) { offPA = document.createElement('canvas'); offPB = document.createElement('canvas'); offPA.width = offPB.width = W; offPA.height = offPB.height = H; }
  frameAt(cv.getContext('2d'), W, H, V, vT, offPA, offPB);
  const sb = $('#vScrub', vRoot), tl = $('#vTime', vRoot); if (sb) sb.value = vT; if (tl) tl.textContent = vT.toFixed(1) + ' / ' + total(V).toFixed(1) + ' dtk';
}
function stopPlay() { if (!vPlay) return; cancelAnimationFrame(vPlay.raf); try { vPlay.ac.close(); } catch (e) { } vPlay = null; const b = $('#vPP', vRoot); if (b) b.innerHTML = ico('play', 1); }
async function togglePlay() {
  if (vPlay) { stopPlay(); return; }
  const V = curVideo(), all = total(V); if (vT >= all - .05) vT = 0;
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  vPlay = { ac, raf: 0 }; $('#vPP', vRoot).innerHTML = ico('pause', 1);
  await prepVideo(V);
  const from = vT, at = ac.currentTime + .05;
  if (from < .1) startAudio(ac, ac.destination, V, at); else O.toast('Musik diputar saat pratinjau dimulai dari awal.');
  const t0 = performance.now();
  const loop = () => { if (!vPlay) return; vT = Math.min(all, from + (performance.now() - t0) / 1000); drawPreview(); if (vT >= all) { stopPlay(); return; } vPlay.raf = requestAnimationFrame(loop); };
  loop();
}
function bindVideo() {
  const R = vRoot, V = () => curVideo(), sc = () => V().scenes[vSel];
  const upd = (fn, light) => { commit(fn); if (light) { drawPreview(); drawThumbs(); const v = V(), s = sc(); const lab = $(`.vth[data-vk="${vSel}"] .vlab`, R); if (lab && s) lab.textContent = VLAYOUTS.find(l => l[0] === s.layout)[1] + ', ' + (+s.dur).toFixed(1) + ' dtk'; const sb = $('#vScrub', R); if (sb) sb.max = total(v).toFixed(2); } else renderVideo(); };
  const jump = k => { vSel = k; vT = sceneStart(V(), k) + Math.min(1.6, (+V().scenes[k].dur || 3) - .1); };
  bindDesign(R, () => V().theme, fn => upd(() => fn(V().theme)));
  R.addEventListener('click', async e => {
    const mb = e.target.closest('[data-vmode]'); if (mb) { stopPlay(); ST.vmode = mb.dataset.vmode; save(); renderVideo(); return; }
    if (ST.vmode !== 'tpl') return;
    const b = e.target.closest('button,[data-vk]'); if (!b) return; const v = V();
    if (b.dataset.vk != null) { stopPlay(); jump(+b.dataset.vk); renderVideo(); return; }
    if (b.dataset.vtab) { vTab = b.dataset.vtab; renderVideo(); return; }
    if (b.dataset.van) return upd(() => { sc().anim = b.dataset.van; });
    if (b.dataset.vtr) return upd(() => { sc().trans = b.dataset.vtr; });
    if (b.dataset.rat) return upd(() => { v.ratio = b.dataset.rat; });
    if (b.dataset.mus) return upd(() => { v.music.type = b.dataset.mus; });
    if (b.dataset.vtpl) { const tp = VTPL.find(t => t.id === b.dataset.vtpl); upd(() => { const nv = videoFromTpl(tp); Object.assign(v, { tpl: nv.tpl, ratio: nv.ratio, theme: nv.theme, music: Object.assign(nv.music, { vol: v.music.vol }), anim: nv.anim, trans: nv.trans, scenes: nv.scenes }); vSel = 0; vT = 0; }); return; }
    if (b.dataset.vmv) { const j = vSel + +b.dataset.vmv; if (j < 0 || j >= v.scenes.length) return; upd(() => { const [x] = v.scenes.splice(vSel, 1); v.scenes.splice(j, 0, x); vSel = j; }); return; }
    switch (b.id) {
      case 'vPP': togglePlay(); break;
      case 'vAdd': upd(() => { v.scenes.splice(vSel + 1, 0, vScene('text', 'Judul adegan', 'Tulis isi adegan di sini.', [], v)); vSel++; vTab = 'isi'; }); break;
      case 'vDup': upd(() => { const c = clone(sc()); c.id = uid(); v.scenes.splice(vSel + 1, 0, c); vSel++; }); break;
      case 'vDel': if (v.scenes.length < 2) { O.toast('Video butuh minimal satu adegan.'); return; } upd(() => { v.scenes.splice(vSel, 1); vSel = Math.max(0, vSel - 1); }); break;
      case 'vAllAnim': upd(() => { const s = sc(); v.scenes.forEach(x => { x.anim = s.anim; if (x !== v.scenes[0]) x.trans = s.trans; }); }); O.toast('Animasi dan transisi diterapkan ke semua adegan.'); break;
      case 'vUndo': undo(renderVideo); break;
      case 'vDelV': if (!b.dataset.ok) { b.dataset.ok = 1; b.style.color = 'var(--acc)'; O.toast('Tekan sekali lagi untuk menghapus video ini.'); setTimeout(() => { delete b.dataset.ok; b.style.color = ''; }, 3000); return; } stopPlay(); upd(() => { ST.videos = ST.videos.filter(x => x.id !== v.id); ST.video = null; vSel = 0; vT = 0; }); break;
      case 'vAI': $('#vAiBox', R).hidden = !$('#vAiBox', R).hidden; $('#vTopic', R).focus(); break;
      case 'vGo': genVideo(); break;
      case 'vExp': exportVid(); break;
      case 'vCancel': if (vExp) vExp.cancel = true; break;
      case 'vImg': $('#vImgF', R).click(); break;
      case 'mFile': $('#mFileF', R).click(); break;
      case 'nFile': $('#nFileF', R).click(); break;
      case 'nDel': upd(() => { v.narr = null; }); break;
    }
  });
  R.addEventListener('change', async e => {
    if (ST.vmode !== 'tpl') return;
    const t = e.target, v = V();
    if (t.id === 'vSel') { stopPlay(); if (t.value === '__new') { commit(() => { const nv = videoFromTpl(VTPL[0]); nv.title = 'Video baru'; ST.videos.unshift(nv); ST.video = nv.id; }); } else ST.video = t.value; vSel = 0; vT = 0; save(); renderVideo(); return; }
    if (t.id === 'vQ') { ST.vq = t.value; save(); return; }
    if (t.id === 'vImgF' && t.files[0]) { try { const d = await fileToData(t.files[0], 1920); upd(() => { sc().image = d; }); } catch (err) { O.toast('Foto tidak bisa dibaca.'); } return; }
    if ((t.id === 'mFileF' || t.id === 'nFileF') && t.files[0]) { const f = t.files[0]; if (f.size > 15e6) { O.toast('Berkas audio maksimal 15 MB.'); return; } const d = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); }); upd(() => { if (t.id === 'mFileF') Object.assign(v.music, { type: 'file', data: d, name: f.name }); else v.narr = { data: d, name: f.name, vol: 1 }; }); return; }
    if (t.id === 'vSfx') return upd(() => { v.sfx = t.checked; }, true);
    if (t.id === 'vBar') return upd(() => { v.bar = t.checked; }, true);
    if (t.dataset.vf === 'layout') return upd(() => { sc().layout = t.value; });
  });
  R.addEventListener('input', e => {
    if (ST.vmode !== 'tpl') return;
    const t = e.target, v = V();
    if (t.id === 'vTitle') { v.title = t.value; v.sample = false; save(); const o = $(`#vSel option[value="${v.id}"]`, R); if (o) o.textContent = t.value || 'Tanpa judul'; return; }
    if (t.id === 'vScrub') { stopPlay(); vT = +t.value; drawPreview(); return; }
    if (t.id === 'mVol') { v.music.vol = +t.value; save(); return; }
    const k = t.dataset.vf; if (!k || k === 'layout') return;
    upd(() => { const s = sc(); v.sample = false; if (k === 'items') s.items = t.value.split('\n'); else if (k === 'dur') { s.dur = +t.value; const l = $('#vDurL', R); if (l) l.textContent = (+t.value).toFixed(1) + ' detik'; } else s[k] = t.value; vT = sceneStart(v, vSel) + Math.min(1.6, (+s.dur || 3) - .1); }, true);
  });
  R.addEventListener('keydown', e => { const th = e.target.closest('[data-vk]'); if (th && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); th.click(); } });
}
async function exportVid() {
  if (vExp) return; stopPlay();
  const V = clone(curVideo()), q = $('#vQ', vRoot).value, R = vRoot;
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  vExp = { cancel: false };
  const pg = $('#vProg', R); pg.hidden = false; $('#vExp', R).disabled = true;
  const upd = p => { $('#vBarI', R).style.width = (p * 100).toFixed(1) + '%'; $('#vProgT', R).textContent = 'Merekam video… ' + Math.round(p * 100) + '%. Biarkan layar tetap menyala dan jangan pindah aplikasi.'; };
  upd(0);
  try {
    const r = await recordVideo(V, q, ac, upd, () => vExp.cancel);
    if (r) { $('#vProgT', R).textContent = 'Menyimpan…'; const name = (V.title || 'video').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 50) || 'video'; await O.saveBlob(r.blob, name + '.' + r.ext); if (r.ext === 'webm') O.toast('Video tersimpan sebagai WebM. Di iPhone, Safari biasanya membuat MP4.'); }
  } catch (e) { O.toast(e.message || 'Gagal membuat video.'); }
  try { ac.close(); } catch (e) { }
  vExp = null; if ($('#vProg', R)) { pg.hidden = true; $('#vExp', R).disabled = false; }
}
async function genVideo() {
  if (vGen) return; const R = vRoot, topic = $('#vTopic', R).value.trim(); if (!topic) { $('#vTopic', R).focus(); return; }
  const tp = VTPL.find(t => t.id === $('#vTpl', R).value) || VTPL[0], len = +$('#vLen', R).value, msg = $('#vAiMsg', R);
  vGen = true; $('#vGo', R).disabled = true; msg.textContent = 'AI sedang menyusun naskah video…';
  const prompt = `Buat naskah video pendek dalam bahasa Indonesia tentang: "${topic}".
Gaya template: ${tp.n}. Rasio ${tp.ratio}. Total durasi sekitar ${len} detik.
Balas HANYA JSON: {"title":"judul video","scenes":[{"layout":"...","title":"...","text":"...","items":["..."],"dur":3.5}]}
Layout yang boleh: title (judul pembuka + text subjudul), text (title pendek + text isi maksimal 18 kata), list (title + items 3-5 butir, tiap butir maksimal 5 kata), stat (title berisi angka pendek seperti "70%" atau "17.000+", text keterangan), quote (title berisi kutipan maksimal 20 kata, text sumber), cta (title ajakan maksimal 5 kata, text detail singkat).
Aturan: adegan pertama "title", terakhir "cta". Judul maksimal 7 kata. dur antara 2.5 dan 6 detik (lebih lama untuk teks panjang), jumlah dur mendekati ${len}. Variasikan layout. Jangan mengarang angka spesifik yang tidak umum diketahui.`;
  try {
    const j = await aiJSON(prompt, n => { msg.textContent = 'AI sedang menulis… ' + n + ' karakter'; });
    if (!j || !Array.isArray(j.scenes) || !j.scenes.length) throw new Error('Format naskah dari AI tidak lengkap. Coba lagi.');
    const ok = new Set(VLAYOUTS.map(l => l[0]).filter(x => x !== 'image')), cur = curVideo();
    const nv = videoFromTpl(tp); nv.title = String(j.title || topic).slice(0, 90);
    nv.scenes = j.scenes.slice(0, 20).map(s => { const x = vScene(ok.has(s.layout) ? s.layout : 'text', String(s.title || ''), String(s.text || ''), L(s.items), tp); x.dur = clamp(+s.dur || x.dur, 1.5, 12); return x; });
    if (cur && cur.music.type === 'file') nv.music = clone(cur.music);
    commit(() => { if (cur && cur.sample) ST.videos = ST.videos.filter(x => x.id !== cur.id); ST.videos.unshift(nv); ST.video = nv.id; });
    vSel = 0; vT = 0; vTab = 'isi'; renderVideo(); O.toast('Video siap: ' + nv.scenes.length + ' adegan, ' + Math.round(total(nv)) + ' detik.');
  } catch (e) { if (e.message !== 'no provider') msg.textContent = O.errText(e); }
  vGen = false; const g = $('#vGo', R); if (g) g.disabled = false;
}

/* ================= CSS & pintu masuk ================= */
const CSS = `${SLIDE_CSS}
.stu{display:flex;flex-direction:column;gap:12px;height:100%;min-height:0;padding:4px max(12px,2vw) 16px}
.stbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.stbar .sdeck{width:auto;max-width:220px;height:42px;padding:0 10px}
.stbar .stitle{flex:1;min-width:160px;height:42px;font:600 16px Sora,Inter,sans-serif}
.sbtns{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.sbtns .btn{display:inline-flex;align-items:center;gap:6px}
.sbtns .btn .i,.btn .i{width:17px;height:17px}
.qsel{width:auto;height:42px;padding:0 8px}
.aibox{border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--card);display:grid;gap:10px}
.mini{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--mute)}
.mini .in{width:auto;padding:8px 10px}
.prow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px}
.stmain{flex:1;min-height:0;display:grid;grid-template-columns:200px minmax(0,1fr) 340px;gap:14px}
.stleft{overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:2px}
.th{position:relative;display:block;width:100%;border:2px solid transparent;border-radius:10px;background:var(--card);padding:0;cursor:pointer;text-align:left}
.th.on{border-color:var(--acc)}
.th .tn{position:absolute;left:6px;top:4px;z-index:2;font-size:12px;background:rgba(0,0,0,.55);color:#fff;border-radius:6px;padding:0 6px}
.tv{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:8px;pointer-events:none}
.tsc,.ssc{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0}
.th.add{display:flex;align-items:center;justify-content:center;gap:8px;min-height:64px;border:1px dashed var(--line);color:var(--mute);font-size:14px}
.stcenter{min-width:0;display:flex;flex-direction:column;gap:8px;overflow-y:auto}
.stage{position:relative;width:100%;overflow:hidden;border-radius:12px;box-shadow:0 12px 40px -18px rgba(0,0,0,.5);flex:none}
.center{text-align:center}
.stright{min-width:0;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:14px;background:var(--card);min-height:0}
.stabs2{display:flex;gap:2px;padding:6px;border-bottom:1px solid var(--line);overflow-x:auto}
.stabs2 button{flex:1;height:36px;border:0;border-radius:8px;background:transparent;font-size:13.5px;white-space:nowrap;padding:0 8px}
.stabs2 button.on{background:var(--ink);color:var(--bg)}
.spanel{padding:12px;overflow-y:auto;min-height:0}
.spanel .fld label{font-size:13.5px}
.slab{font-size:13.5px;font-weight:600;margin:14px 0 8px}
.sfine{font-size:12.5px;color:var(--mute);margin:6px 0}
.chipset{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 6px}
.schip{height:34px;padding:0 12px;border:1px solid var(--line);border-radius:999px;background:transparent;font-size:13px}
.schip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.btn.wide{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;margin:6px 0}
.tgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.tcard{position:relative;display:block;border:2px solid transparent;border-radius:10px;padding:0;overflow:hidden;cursor:pointer;text-align:left}
.tcard img{display:block;width:100%;aspect-ratio:16/9}
.tcard span{position:absolute;left:8px;bottom:8px;font-size:15px;font-weight:700}
.tcard i{position:absolute;top:8px;width:12px;height:12px;border-radius:50%}
.tcard i:nth-of-type(1){right:24px}.tcard i:nth-of-type(2){right:8px}
.crow{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.cpk{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:10px;padding:6px;font-size:13px;cursor:pointer}
.cpk input{width:34px;height:34px;border:0;padding:0;background:none;flex:none}
.cpk small{display:block;color:var(--mute);font-size:11.5px}
.prow input[type=color]{width:42px;height:42px;border:0;padding:0;background:none}
.prow select.in{width:auto;flex:1}
.flist{display:grid;gap:6px}
.fcard{display:block;text-align:left;border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:transparent}
.fcard.on{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc)}
.fcard b{display:block;font-size:20px;line-height:1.2}
.fcard span{font-size:13.5px;color:var(--mute)}
.vth{padding:0}
.vcv{display:block;width:auto;max-width:100%;height:auto;max-height:190px;margin:0 auto;border-radius:8px;background:#000}
.vlab{display:block;font-size:12px;color:var(--mute);padding:4px 6px}
.vstage{position:relative;margin:0 auto;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 12px 40px -18px rgba(0,0,0,.5);max-width:100%}
.vstage canvas{display:block;width:100%;height:100%}
.vstage.r169{width:100%;aspect-ratio:16/9}.vstage.r916{height:min(62vh,620px);aspect-ratio:9/16}.vstage.r11{height:min(56vh,560px);aspect-ratio:1}
.vctl{display:flex;align-items:center;gap:8px}
.vctl input{flex:1;accent-color:var(--acc)}
.vtime{font-size:13px;color:var(--mute);white-space:nowrap;font-variant-numeric:tabular-nums}
.rat{justify-content:center}
.vprog{border:1px solid var(--line);border-radius:12px;padding:10px;display:grid;gap:8px;background:var(--card)}
.vprog div{height:8px;border-radius:4px;background:var(--bub);overflow:hidden}.vprog i{display:block;height:100%;width:0;background:var(--acc)}
.vprog span{font-size:13.5px}
.vtpl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.vcard{position:relative;text-align:left;border:2px solid transparent;border-radius:10px;padding:12px;min-height:84px}
.vcard.on{border-color:var(--acc)}
.vcard b{display:block;font-size:16px}.vcard span{font-size:12px;opacity:.8}
.vcard i{position:absolute;right:10px;top:10px;width:12px;height:12px;border-radius:50%}
.modesw{display:flex;gap:4px;background:var(--bub);border-radius:12px;padding:4px;align-self:flex-start;max-width:100%}
.modesw button{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 14px;border:0;border-radius:9px;background:transparent;font-size:14px;white-space:nowrap}
.modesw button.on{background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.12);font-weight:600}
.modesw .i{width:16px;height:16px}
.aiv{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:18px;overflow:hidden}
.aivl,.aivr{overflow-y:auto;min-height:0;padding:2px 4px 16px 2px}
.drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:100%;min-height:200px;border:2px dashed var(--line);border-radius:16px;background:var(--card);color:var(--mute);padding:16px;margin:0 0 14px;position:relative;overflow:hidden}
.drop .i{width:34px;height:34px}.drop b{color:var(--ink);font-size:16px}.drop span{font-size:13.5px;text-align:center}
.drop.has{padding:0;border-style:solid;min-height:0}
.drop img{display:block;width:100%;max-height:340px;object-fit:contain;background:#000}
.drop .chg{position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.6);color:#fff;border-radius:999px;padding:4px 12px;font-size:13px}
.hfacc{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:12px}
.hfacc summary{cursor:pointer;font-weight:600;font-size:14.5px}
.hfacc a{color:var(--acc)}
.aicard{display:flex;gap:12px;border:1px solid var(--line);border-radius:14px;background:var(--card);padding:12px;margin:0 0 12px}
.aithumb{width:96px;height:96px;object-fit:cover;border-radius:10px;flex:none}
.aibody{flex:1;min-width:0}
.aip{margin:0 0 2px;font-size:15px}
.aivid{display:block;width:100%;max-height:420px;border-radius:10px;background:#000;margin:6px 0 10px}
.aistat{display:flex;align-items:center;gap:10px;color:var(--mute);font-size:14.5px;margin:6px 0}
#aDur{width:100%}
@media(max-width:1000px){.aiv{grid-template-columns:minmax(0,1fr);grid-auto-rows:max-content;align-content:start;overflow-y:auto}.aivl,.aivr{overflow:visible;min-height:max-content}}
.obpres{position:fixed;inset:0;z-index:100;background:#000;overflow:hidden}
.obpres .ps{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0}
.obpres .slot{position:absolute;inset:0}
.obpres .pz{position:absolute;top:0;bottom:0;width:50%;background:none;border:0;z-index:3;cursor:pointer}
.obpres .pl{left:0}.obpres .pr{right:0}
.obpres .px{position:absolute;right:12px;top:max(12px,env(safe-area-inset-top));z-index:5;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.15);color:#fff;display:grid;place-items:center}
.obpres .pn{position:absolute;right:16px;bottom:max(12px,env(safe-area-inset-bottom));z-index:4;color:rgba(255,255,255,.6);font:14px system-ui}
@media(max-width:1000px){.stmain{grid-template-columns:minmax(0,1fr);grid-auto-rows:max-content;overflow-y:auto}.stleft{flex-direction:row;overflow-x:auto;overflow-y:hidden;order:2;min-height:max-content;padding-bottom:6px}.stleft .th{width:150px;flex:none}.stcenter{order:1;overflow:visible}.stright{order:3;min-height:auto}.spanel{overflow:visible}.stu{overflow-y:auto}.vstage.r916{height:min(58vh,560px)}}
@media(prefers-reduced-motion:reduce){.sl.play .a{animation-duration:.01s!important}}`;
let cssDone = false, bound = { slides: false, video: false };
const resizeObs = new ResizeObserver(() => scaleAll());
window.Studio = {
  async open(kind, el) {
    if (!cssDone) { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); cssDone = true; }
    await loadState;
    stopPlay();
    el.innerHTML = '<div class="studio-host"></div>';
    const host = el.firstChild; host.style.height = '100%';
    if (kind === 'slides') { sRoot = host; vRoot = null; renderSlides(); bindSlides(); }
    else { vRoot = host; sRoot = null; renderVideo(); bindVideo(); bindAIV(); }
  },
  close() { stopPlay(); if (vExp) vExp.cancel = true; },
  _test: { geo, buildPptx, buildHTML, recordVideo, videoFromTpl, VTPL, THEMES, palette, contrast, get ST() { return ST; } }
};
})();
