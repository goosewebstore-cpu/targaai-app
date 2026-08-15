/* TargaAI by AutoEsperto — demo client-side, gratuito e offline */
let currentVehicle = null;
let garage = [];
let searchTimeout = null;
let uid = 0;
const U = () => 'g' + (++uid);

function trackEvent(n, p) { try { gtag('event', n, p || {}); } catch (e) {} }

/* ---------- Utili colore ---------- */
function hexToHsl(h) {
  const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = (mx === r) ? ((g - b) / d + (g < b ? 6 : 0)) : (mx === g) ? ((b - r) / d + 2) : ((r - g) / d + 4); hh /= 6; }
  return [hh * 360, s * 100, l * 100];
}
function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  const k = n => (n + h * 12) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = c => Math.round(c * 255).toString(16).padStart(2, '0');
  return '#' + to(f(0)) + to(f(8)) + to(f(4));
}
function shade(hex, amt) { const [h, s, l] = hexToHsl(hex); return hslToHex(h, s, Math.min(100, Math.max(0, l + amt))); }

/* ---------- Geometrie carrozzerie ---------- */
const BODIES = {
  hatch: {
    body: 'M56 316 C58 288 74 270 106 260 C124 254 142 252 158 252 C172 228 192 206 226 194 C250 185 278 182 306 182 C344 182 368 188 398 206 C416 216 428 228 438 242 C458 234 486 230 520 238 C556 246 576 256 586 272 C592 284 592 298 588 308 L584 328 L56 328 Z',
    glass: 'M212 248 C226 224 248 208 276 198 C300 190 322 188 340 192 C356 196 366 204 376 214 C386 226 390 240 392 248 Z',
    shoulder: 'M120 250 C260 238 400 238 534 250', wheels: [150, 480], r: 30, archR: [45, 25], archY: 324,
    mirror: [404, 206, 12, 9], doors: ['M252 252 C260 284 274 306 294 320', 'M384 250 C394 280 400 300 412 320'],
    handles: [[300, 238, 28, 6], [408, 236, 26, 6]], hl: 'M560 268 L584 262 L592 276 L566 282 Z', tl: 'M58 266 L78 262 L82 274 L62 278 Z',
    grille: [566, 282, 24, 12], intake: [546, 296, 44, 12]
  },
  sedan: {
    body: 'M46 316 C50 290 64 272 96 264 C118 258 140 256 158 256 L188 254 C202 228 226 208 258 196 C282 188 306 184 330 184 C366 184 392 190 424 208 C444 218 456 230 466 246 C488 238 518 234 548 242 C582 250 600 262 608 276 C614 288 614 302 610 312 L606 328 L46 328 Z',
    glass: 'M236 252 C250 226 272 210 302 200 C326 192 348 190 366 194 C382 198 392 206 402 216 C412 228 416 242 418 252 Z',
    shoulder: 'M108 252 C260 240 400 240 548 252', wheels: [150, 480], r: 30, archR: [45, 25], archY: 324,
    mirror: [424, 206, 13, 9], doors: ['M300 254 C310 288 322 308 340 320', 'M416 250 C428 284 436 304 452 320'],
    handles: [[330, 242, 30, 6], [448, 240, 28, 6]], hl: 'M560 272 L584 266 L592 280 L566 286 Z', tl: 'M44 268 L64 264 L68 276 L48 280 Z',
    grille: [574, 284, 30, 12], intake: [548, 298, 54, 12]
  },
  suv: {
    body: 'M50 330 C54 290 70 274 104 266 C128 260 152 258 176 258 L198 256 C208 234 226 218 252 210 C280 202 306 198 332 198 C360 198 388 202 418 210 C446 218 462 226 474 236 L488 244 C520 240 552 246 580 258 C602 266 616 280 620 294 C622 304 622 314 618 324 L614 330 L50 330 Z',
    glass: 'M228 256 C242 232 262 216 290 206 C314 198 336 196 356 200 C372 204 384 212 394 222 C404 234 410 248 412 256 Z',
    shoulder: 'M116 258 C280 246 420 246 562 258', wheels: [160, 470], r: 34, archR: [50, 30], archY: 322,
    mirror: [440, 214, 14, 10], doors: ['M286 260 C296 292 308 312 326 326', 'M400 258 C412 290 420 310 436 326'],
    handles: [[316, 250, 32, 6], [434, 248, 30, 6]], hl: 'M570 280 L592 272 L600 288 L576 294 Z', tl: 'M48 272 L70 268 L74 282 L52 286 Z',
    grille: [584, 292, 30, 12], intake: [556, 304, 56, 12], antenna: [[340, 196, 350, 164]]
  },
  sport: {
    body: 'M62 336 C64 296 78 280 108 272 C126 268 144 266 162 266 L190 262 C200 242 220 226 248 218 C272 210 296 208 318 210 C340 212 358 220 374 232 C392 244 402 258 408 274 L430 268 C458 264 486 268 512 278 C540 288 556 300 562 312 C566 322 566 330 560 336 L62 336 Z',
    glass: 'M222 260 C236 240 256 228 280 222 C300 218 318 218 336 222 C354 226 366 236 376 248 C384 258 388 268 390 276 L222 276 Z',
    shoulder: 'M118 268 C260 256 420 256 546 268', wheels: [165, 475], r: 30, archR: [45, 25], archY: 324,
    mirror: [386, 238, 12, 9], doors: ['M250 270 C258 300 270 316 288 330', 'M376 268 C386 298 394 316 410 330'],
    handles: [[404, 256, 28, 6]], hl: 'M556 282 L578 276 L586 290 L562 296 Z', tl: 'M60 278 L80 274 L84 286 L64 290 Z',
    grille: [560, 288, 24, 12], intake: [540, 302, 44, 12], spoiler: [58, 268, 32, 6]
  }
};
const COLORS = { Bianco: '#E8E9EB', Nero: '#1C1E22', Grigio: '#7E8490', Blu: '#1F5FA8', Rosso: '#C8301E', Argento: '#AEB4BC', Giallo: '#E8B600', Verde: '#2E6B4F', Arancio: '#D95A1E', Marrone: '#5B4636' };

function sceneBg(scene, u) {
  if (scene === 'garage') {
    return '<rect width="640" height="380" fill="#101318"/>' +
      '<rect width="640" height="380" fill="url(#' + u + 'g)" opacity="0.85"/>' +
      '<rect x="60" y="40" width="230" height="26" rx="13" fill="#DCE4F0" opacity="0.06"/>' +
      '<rect x="70" y="48" width="210" height="9" rx="4.5" fill="#DCE4F0" opacity="0.22"/>' +
      '<rect x="350" y="40" width="230" height="26" rx="13" fill="#DCE4F0" opacity="0.06"/>' +
      '<rect x="360" y="48" width="210" height="9" rx="4.5" fill="#DCE4F0" opacity="0.22"/>' +
      '<g stroke="#8FA3C8" stroke-opacity="0.04" stroke-width="1">' + [80, 160, 240, 320, 400, 480, 560].map(x => '<line x1="' + x + '" y1="40" x2="' + x + '" y2="352"/>').join('') + '</g>' +
      '<rect y="352" width="640" height="28" fill="#12151C"/>' +
      '<line x1="0" y1="352" x2="640" y2="352" stroke="#262C38" stroke-width="1.5"/>';
  }
  if (scene === 'road') {
    return '<rect width="640" height="150" fill="#1A1E28"/>' +
      '<rect width="640" height="150" fill="url(#' + u + 'sky)" opacity="0.9"/>' +
      '<ellipse cx="320" cy="152" rx="310" ry="64" fill="#2A3342" opacity="0.4"/>' +
      '<rect y="150" width="640" height="230" fill="url(#' + u + 'road)"/>' +
      '<line x1="0" y1="150" x2="640" y2="150" stroke="#2A313E" stroke-width="2"/>' +
      [40, 160, 280, 400, 520].map(x => '<rect x="' + x + '" y="370" width="60" height="5" rx="2.5" fill="#313A49" opacity="0.7"/>').join('') +
      '<rect y="352" width="640" height="28" fill="#0B0C10"/>';
  }
  return '<rect width="640" height="380" fill="#14171E"/>' +
    '<rect width="640" height="380" fill="url(#' + u + 'glow)"/>' +
    '<rect y="352" width="640" height="28" fill="#0A0C10"/>' +
    '<line x1="0" y1="352" x2="640" y2="352" stroke="#232A38" stroke-width="1.5"/>';
}

function carSVG(o) {
  o = Object.assign({ body: 'hatch', paint: '#C8301E', scene: 'studio' }, o);
  const u = U(), b = BODIES[o.body], p = o.paint;
  const pLight = shade(p, 16), pDark = shade(p, -30);
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 380">';
  s += '<defs>' +
    '<linearGradient id="' + u + 'paint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pLight + '"/><stop offset="0.45" stop-color="' + p + '"/><stop offset="1" stop-color="' + pDark + '"/></linearGradient>' +
    '<linearGradient id="' + u + 'glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4657"/><stop offset="1" stop-color="#12161E"/></linearGradient>' +
    (o.scene === 'studio' ? '<radialGradient id="' + u + 'glow" cx="0.5" cy="0.55" r="0.75"><stop offset="0" stop-color="#2A2F3A"/><stop offset="0.62" stop-color="#14171E"/><stop offset="1" stop-color="#10131A"/></radialGradient>' : '') +
    (o.scene === 'garage' ? '<linearGradient id="' + u + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171B24" stop-opacity="0.9"/><stop offset="1" stop-color="#0B0D11"/></linearGradient>' : '') +
    (o.scene === 'road' ? '<linearGradient id="' + u + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151922"/><stop offset="1" stop-color="#232A38"/></linearGradient>' +
      '<linearGradient id="' + u + 'road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171A20"/><stop offset="1" stop-color="#0B0C10"/></linearGradient>' : '') +
    '</defs>';
  s += sceneBg(o.scene, u);
  s += '<ellipse cx="320" cy="361" rx="272" ry="9" fill="#000" opacity="' + (o.scene === 'studio' ? 0.4 : 0.5) + '"/>';
  s += '<g id="' + u + 'car">';
  b.wheels.forEach(cx => { s += '<ellipse cx="' + cx + '" cy="' + b.archY + '" rx="' + b.archR[0] + '" ry="' + b.archR[1] + '" fill="#0B0D11" opacity="0.88"/>'; });
  s += '<path d="' + b.body + '" fill="url(#' + u + 'paint)"/>';
  s += '<path d="' + b.body + '" fill="none" stroke="' + pDark + '" stroke-width="1.5"/>';
  s += '<path d="' + b.shoulder + '" fill="none" stroke="#fff" stroke-opacity="0.16" stroke-width="2.5"/>';
  s += '<path d="' + b.glass + '" fill="url(#' + u + 'glass)" stroke="#000" stroke-opacity="0.35" stroke-width="1.2"/>';
  s += '<path d="' + b.glass + '" fill="none" stroke="#fff" stroke-opacity="0.10" stroke-width="6"/>';
  s += '<rect x="' + (b.mirror[0] - 3) + '" y="' + (b.mirror[1] + 8) + '" width="5" height="9" rx="2" fill="' + pDark + '"/>';
  s += '<rect x="' + b.mirror[0] + '" y="' + b.mirror[1] + '" width="' + b.mirror[2] + '" height="' + b.mirror[3] + '" rx="3" fill="' + p + '"/>';
  s += '<rect x="' + b.mirror[0] + '" y="' + b.mirror[1] + '" width="' + b.mirror[2] + '" height="' + (b.mirror[3] * 0.4).toFixed(1) + '" rx="2" fill="#fff" opacity="0.25"/>';
  b.doors.forEach(d => s += '<path d="' + d + '" fill="none" stroke="#000" stroke-opacity="0.28" stroke-width="1.6"/>');
  b.handles.forEach(h => s += '<rect x="' + h[0] + '" y="' + h[1] + '" width="' + h[2] + '" height="' + h[3] + '" rx="3" fill="#000" opacity="0.34"/>');
  s += '<path d="' + b.hl + '" fill="#FFE9A8" opacity="0.4"/>';
  s += '<path d="' + b.hl + '" fill="#FFF7CC"/>';
  s += '<path d="' + b.tl + '" fill="#FF3B30" opacity="0.45"/>';
  s += '<path d="' + b.tl + '" fill="#FF5544"/>';
  s += '<rect x="' + b.grille[0] + '" y="' + b.grille[1] + '" width="' + b.grille[2] + '" height="' + b.grille[3] + '" rx="4" fill="#0D1014"/>';
  s += '<line x1="' + (b.grille[0] + 3) + '" y1="' + (b.grille[1] + 4) + '" x2="' + (b.grille[0] + b.grille[2] - 3) + '" y2="' + (b.grille[1] + 4) + '" stroke="#232A38" stroke-width="1.6"/>';
  s += '<line x1="' + (b.grille[0] + 3) + '" y1="' + (b.grille[1] + 8) + '" x2="' + (b.grille[0] + b.grille[2] - 3) + '" y2="' + (b.grille[1] + 8) + '" stroke="#232A38" stroke-width="1.6"/>';
  s += '<rect x="' + b.intake[0] + '" y="' + b.intake[1] + '" width="' + b.intake[2] + '" height="' + b.intake[3] + '" rx="5" fill="#0D1014"/>';
  b.wheels.forEach(cx => {
    s += '<circle cx="' + cx + '" cy="330" r="' + b.r + '" fill="#10131A"/>' +
      '<circle cx="' + cx + '" cy="330" r="' + (b.r - 1.5) + '" fill="none" stroke="#1C212B" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="330" r="15.5" fill="#2E333C"/>' +
      '<circle cx="' + cx + '" cy="330" r="15.5" fill="none" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="5"/>' +
      '<g transform="translate(' + cx + ' 330)">' + [0, 72, 144, 216, 288].map(a => '<line x1="0" y1="-5" x2="0" y2="-14" stroke="#565E6B" stroke-width="3.4" stroke-linecap="round" transform="rotate(' + a + ')"/>').join('') + '</g>' +
      '<circle cx="' + cx + '" cy="330" r="5" fill="#E41D2D"/>' +
      '<circle cx="' + cx + '" cy="330" r="5" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="1"/>';
  });
  if (b.spoiler) s += '<rect x="' + b.spoiler[0] + '" y="' + b.spoiler[1] + '" width="' + b.spoiler[2] + '" height="' + b.spoiler[3] + '" rx="3" fill="' + pDark + '"/>';
  if (b.antenna) s += '<line x1="' + b.antenna[0][0] + '" y1="' + b.antenna[0][1] + '" x2="' + b.antenna[0][2] + '" y2="' + b.antenna[0][3] + '" stroke="#7A8394" stroke-width="2" stroke-linecap="round"/>';
  s += '</g>';
  if (o.scene === 'studio') {
    s += '<g transform="translate(0 722) scale(1 -1)" opacity="0.09">' +
      '<ellipse cx="150" cy="330" rx="45" ry="25" fill="#0B0D11"/>' +
      '<ellipse cx="480" cy="330" rx="45" ry="25" fill="#0B0D11"/>' +
      '<path d="' + b.body + '" fill="#0B0D11"/>' +
      '<circle cx="150" cy="330" r="30" fill="#0B0D11"/><circle cx="480" cy="330" r="30" fill="#0B0D11"/>' +
      '</g>';
  }
  s += '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
}
function photoURL(body, paint, scene) { return carSVG({ body: body, paint: paint, scene: scene }); }

/* ---------- Catalogo demo ---------- */
const FLEET = [
  { name: 'Fiat 500 Lounge', body: 'hatch', paint: COLORS.Bianco, scene: 'studio', meta: '1.0 Hybrid · 2019', fuel: 'Hybrid', cc: 1000, cv: 70, color: 'Bianco', trans: 'Automatico' },
  { name: 'Volkswagen Golf 1.5', body: 'hatch', paint: COLORS.Rosso, scene: 'road', meta: '1.5 TSI · 2021', fuel: 'Benzina', cc: 1500, cv: 130, color: 'Rosso', trans: 'Manuale 6 marce' },
  { name: 'BMW 320d', body: 'sedan', paint: COLORS.Nero, scene: 'garage', meta: '2.0 Diesel · 2020', fuel: 'Diesel', cc: 2000, cv: 190, color: 'Nero', trans: 'Automatico' },
  { name: 'Tesla Model Y', body: 'suv', paint: COLORS.Grigio, scene: 'road', meta: 'Elettrica · 2022', fuel: 'Elettrica', cc: 0, cv: 514, color: 'Grigio', trans: 'Automatico' },
  { name: 'Ford Mustang GT', body: 'sport', paint: COLORS.Giallo, scene: 'studio', meta: '5.0 V8 · 2018', fuel: 'Benzina', cc: 5000, cv: 450, color: 'Giallo', trans: 'Manuale 6 marce' },
  { name: 'Alfa Romeo Stelvio', body: 'suv', paint: COLORS.Blu, scene: 'garage', meta: '2.2 Diesel · 2020', fuel: 'Diesel', cc: 2200, cv: 210, color: 'Blu', trans: 'Automatico' },
  { name: 'Porsche 911 Carrera', body: 'sport', paint: COLORS.Grigio, scene: 'road', meta: '3.0 Benzina · 2021', fuel: 'Benzina', cc: 3000, cv: 385, color: 'Grigio', trans: 'Automatico DCT' },
  { name: 'Land Rover Defender', body: 'suv', paint: COLORS.Verde, scene: 'road', meta: '2.0 Diesel · 2022', fuel: 'Diesel', cc: 2000, cv: 240, color: 'Verde', trans: 'Automatico' },
  { name: 'Mini Cooper S', body: 'hatch', paint: COLORS.Arancio, scene: 'garage', meta: '2.0 Benzina · 2019', fuel: 'Benzina', cc: 2000, cv: 192, color: 'Arancio', trans: 'Manuale 6 marce' }
];
function buildGallery() {
  const g = document.getElementById('gallery');
  g.innerHTML = FLEET.map(f =>
    '<div class="g-card" onclick="searchFleet(' + FLEET.indexOf(f) + ')" role="button" tabindex="0" aria-label="Apri report demo: ' + f.name + '">' +
    '<span class="g-flag">Demo</span><img src="' + photoURL(f.body, f.paint, f.scene) + '" alt="' + f.name + '">' +
    '<div class="g-cap"><div class="g-name">' + f.name + '</div><div class="g-meta">' + f.meta + '</div></div></div>'
  ).join('');
}
function searchFleet(i) {
  const f = FLEET[i];
  currentVehicle = vehicleFromFleet(generatePlate(), f);
  hideSkeleton();
  renderReport(currentVehicle);
  scrollToReport();
  trackEvent('fleet_demo', { name: f.name });
}

/* ---------- Dati veicolo ---------- */
const BRANDS = {
  Fiat: { models: { '500': 'hatch', 'Panda': 'hatch', 'Tipo': 'sedan' } },
  Volkswagen: { models: { 'Golf': 'hatch', 'Polo': 'hatch', 'Passat': 'sedan', 'T-Roc': 'suv' } },
  Ford: { models: { 'Focus': 'hatch', 'Fiesta': 'hatch', 'Mondeo': 'sedan', 'Kuga': 'suv', 'Mustang': 'sport' } },
  Toyota: { models: { 'Yaris': 'hatch', 'Corolla': 'hatch', 'Rav4': 'suv' } },
  Renault: { models: { 'Clio': 'hatch', 'Captur': 'suv', 'Megane': 'hatch' } },
  Peugeot: { models: { '208': 'hatch', '3008': 'suv', '508': 'sedan' } },
  BMW: { models: { 'Serie 1': 'hatch', 'Serie 3': 'sedan', 'Serie 5': 'sedan', 'X3': 'suv' } },
  Audi: { models: { 'A3': 'hatch', 'A4': 'sedan', 'Q5': 'suv' } },
  Mercedes: { models: { 'Classe A': 'hatch', 'Classe C': 'sedan', 'GLA': 'suv' } },
  Opel: { models: { 'Corsa': 'hatch', 'Astra': 'hatch', 'Insignia': 'sedan', 'Grandland': 'suv' } },
  Tesla: { models: { 'Model 3': 'sedan', 'Model Y': 'suv' } },
  AlfaRomeo: { models: { 'Giulietta': 'hatch', 'Giulia': 'sedan', 'Stelvio': 'suv' } },
  Dacia: { models: { 'Sandero': 'hatch', 'Duster': 'suv' } },
  Hyundai: { models: { 'i20': 'hatch', 'Tucson': 'suv' } },
  Kia: { models: { 'Rio': 'hatch', 'Sportage': 'suv' } },
  Mazda: { models: { 'Mazda3': 'hatch', 'MX-5': 'sport', 'CX-5': 'suv' } }
};
const TRIMS = ['Lounge', 'Business', 'Sport', 'Active', 'Titanium', 'Hybrid', 'Premium', 'S-Line', 'AMG', 'GS Line', 'Style', 'Urban'];
const FUELS = ['Benzina', 'Diesel', 'Ibrida', 'Metano', 'GPL', 'Elettrica'];
const TRANS = ['Manuale 5 marce', 'Manuale 6 marce', 'Automatico', 'Automatico DCT', 'CVT'];
const COLNAME = Object.keys(COLORS);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function generatePlate() {
  const l = 'ABCDEFGHJKLMNPRSTUVWXYZ', n = '0123456789';
  return l[Math.floor(Math.random() * l.length)] + l[Math.floor(Math.random() * l.length)] + n[Math.floor(Math.random() * n.length)] + n[Math.floor(Math.random() * n.length)] + n[Math.floor(Math.random() * n.length)] + l[Math.floor(Math.random() * l.length)] + l[Math.floor(Math.random() * l.length)];
}
function makeVehicle(plate) {
  const bn = pick(Object.keys(BRANDS));
  const mn = pick(Object.keys(BRANDS[bn].models));
  const cv = 70 + Math.floor(Math.random() * 130);
  const v = {
    plate: plate, brand: bn, model: mn, trim: pick(TRIMS),
    year: 2015 + Math.floor(Math.random() * 10),
    km: Math.floor(Math.random() * 150000) + 8000,
    fuel: pick(FUELS), cv: cv, cc: Math.round(cv * 11.5 / 100) * 100,
    transmission: pick(TRANS), doors: [3, 5][Math.floor(Math.random() * 2)],
    color: pick(COLNAME), body: BRANDS[bn].models[mn], scene: 'garage',
    month: 1 + Math.floor(Math.random() * 12),
    chassis: generatePlate().slice(0, 3) + Math.floor(100000 + Math.random() * 899999)
  };
  const bv = 25000 - ((2026 - v.year) * 2300) - (v.km * 0.04);
  v.value = Math.max(3000, Math.floor(bv / 100) * 100);
  v.min = Math.floor(v.value * 0.92);
  v.max = Math.floor(v.value * 1.08);
  return v;
}
function vehicleFromFleet(plate, f) {
  return {
    plate: plate, brand: f.name.split(' ')[0], model: f.name.split(' ')[1], trim: f.name.split(' ').slice(2).join(' ') || 'GT',
    year: parseInt(f.meta.match(/\d{4}/)[0]), km: 28000, fuel: f.fuel,
    cv: f.cv, cc: f.cc, transmission: f.trans, doors: 5,
    color: f.color, body: f.body, scene: f.scene, value: 31500, min: 29000, max: 34000,
    month: 4, chassis: 'DEMO' + f.body.toUpperCase()
  };
}

/* ---------- Render report ---------- */
function vehiclePaint(v) { return COLORS[v.color] || '#C8301E'; }
function renderReport(v) {
  const ev = v.fuel === 'Elettrica';
  document.getElementById('reportPlate').textContent = v.plate;
  document.getElementById('reportName').textContent = v.brand + ' ' + v.model + ' ' + v.trim;
  document.getElementById('reportMeta').textContent = (ev ? 'EV' : (v.cc / 1000).toFixed(1) + ' L') + ' · ' + v.cv + ' CV · ' + v.fuel + ' · ' + v.year;
  document.getElementById('reportPrice').textContent = v.value.toLocaleString('it-IT') + ' EUR';
  document.getElementById('reportRange').textContent = 'Range: ' + v.min.toLocaleString('it-IT') + ' – ' + v.max.toLocaleString('it-IT') + ' EUR';
  document.getElementById('reportChips').innerHTML =
    '<span class="chip">' + v.fuel + '</span><span class="chip">' + v.transmission + '</span><span class="chip">' + v.doors + ' porte</span><span class="chip">' + v.color + '</span>';
  const it = n => n.toLocaleString('it-IT');
  document.getElementById('reportGrid').innerHTML =
    '<div class="info-item"><div class="info-label">Anno</div><div class="info-value">' + v.year + '</div></div>' +
    '<div class="info-item"><div class="info-label">KM</div><div class="info-value">' + it(v.km) + '</div></div>' +
    '<div class="info-item"><div class="info-label">Immatricolazione</div><div class="info-value">' + v.month + '/' + v.year + '</div></div>' +
    '<div class="info-item"><div class="info-label">Alimentazione</div><div class="info-value">' + v.fuel + '</div></div>' +
    '<div class="info-item"><div class="info-label">Potenza</div><div class="info-value">' + v.cv + ' CV</div></div>' +
    '<div class="info-item"><div class="info-label">Cilindrata</div><div class="info-value">' + (ev ? 'Motore elettrico' : v.cc + ' cc') + '</div></div>' +
    '<div class="info-item"><div class="info-label">Cambio</div><div class="info-value">' + v.transmission + '</div></div>' +
    '<div class="info-item"><div class="info-label">Telaio</div><div class="info-value">' + v.chassis + '</div></div>' +
    '<div class="info-item"><div class="info-label">Prossima revisione</div><div class="info-value">' + (v.year + 2) + '</div></div>' +
    '<div class="info-item"><div class="info-label">Colore</div><div class="info-value">' + v.color + '</div></div>';
  const paint = vehiclePaint(v);
  const scenes = ['garage', 'studio', 'road'];
  const main = document.getElementById('reportPhoto');
  main.src = photoURL(v.body, paint, 'garage');
  const strip = document.getElementById('photoStrip');
  strip.innerHTML = scenes.map((sc, i) =>
    '<img src="' + photoURL(v.body, paint, sc) + '" class="' + (i === 0 ? 'sel' : '') + '" alt="Scatto ' + (i + 1) + '" onclick="setReportPhoto(this)">'
  ).join('');
  drawGauge(document.getElementById('reportGauge'), v);
  trackEvent('report_generated', { plate: v.plate, brand: v.brand, model: v.model });
}
function setReportPhoto(img) {
  document.getElementById('reportPhoto').src = img.src;
  document.querySelectorAll('#photoStrip img').forEach(x => x.classList.remove('sel'));
  img.classList.add('sel');
}
function drawGauge(elm, v) {
  const pct = Math.min(1, Math.max(0, (v.value - v.min) / (v.max - v.min)));
  const a = Math.PI * (1 - pct);
  const x = 60 + 40 * Math.cos(a), y = 54 - 40 * Math.sin(a);
  elm.innerHTML =
    '<path d="M20 54 A40 40 0 0 1 100 54" fill="none" stroke="#232A38" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M20 54 A40 40 0 0 1 100 54" fill="none" stroke="#2FD57B" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (pct * 125.66).toFixed(1) + ' 200"/>' +
    '<line x1="60" y1="54" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#E41D2D" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="60" cy="54" r="5" fill="#F2F5F9"/>';
}
function scrollToReport() {
  document.getElementById('reportBox').classList.add('active');
  setTimeout(() => document.getElementById('reportBox').scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

/* ---------- Scan / ricerca ---------- */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'), x = c.getContext('2d');
        let w = img.width, h = img.height, m = 800;
        if (w > h && w > m) { h = h * (m / w); w = m; } else if (h > m) { w = w * (m / h); h = m; }
        c.width = w; c.height = h; x.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject; img.src = e.target.result;
    };
    r.onerror = reject; r.readAsDataURL(file);
  });
}
async function handleFile(e) {
  const f = e.target.files[0];
  if (f) { await processImage(f); }
  e.target.value = '';
}
async function handleDrop(e) {
  e.preventDefault(); e.currentTarget.classList.remove('dragover');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) await processImage(f);
}
function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('dragover'); }
function handleDragLeave(e) { e.currentTarget.classList.remove('dragover'); }
async function processImage(file) {
  try {
    const compressed = await compressImage(file);
    document.getElementById('previewImg').src = compressed;
    document.getElementById('previewBox').classList.add('active');
    showSkeleton();
    setTimeout(() => {
      const v = makeVehicle(generatePlate());
      currentVehicle = v;
      hideSkeleton();
      renderReport(v);
      scrollToReport();
    }, 2600);
  } catch (err) { showToast('Errore nell\u2019elaborazione dell\u2019immagine', 'error'); }
}
function showSkeleton() {
  document.getElementById('skeletonBox').classList.add('active');
  document.getElementById('reportBox').classList.remove('active');
  const msgs = ['Analisi della targa in corso...', 'Interrogazione database veicoli...', 'Elaborazione scheda tecnica...', 'Calcolo valutazione di mercato...'];
  let i = 0;
  window._skInt = setInterval(() => { document.getElementById('skeletonStatus').textContent = msgs[i % msgs.length]; i++; }, 700);
}
function hideSkeleton() {
  document.getElementById('skeletonBox').classList.remove('active');
  if (window._skInt) clearInterval(window._skInt);
}
function searchManual() {
  const p = document.getElementById('manualTarga').value.toUpperCase().trim();
  if (p.length < 5) { showToast('Inserisci una targa valida', 'error'); return; }
  document.getElementById('previewBox').classList.remove('active');
  showSkeleton();
  setTimeout(() => {
    currentVehicle = makeVehicle(p);
    hideSkeleton();
    renderReport(currentVehicle);
    scrollToReport();
  }, 2200);
}

/* ---------- Garage ---------- */
function saveToGarage() {
  if (!currentVehicle) return;
  if (garage.find(v => v.plate === currentVehicle.plate)) { showToast('Veicolo già presente nel garage', 'error'); return; }
  garage.unshift(currentVehicle);
  try {
    localStorage.setItem('targaai_garage', JSON.stringify(garage));
    trackEvent('vehicle_added', { plate: currentVehicle.plate });
    showToast('Veicolo salvato nel garage');
    updateGarage();
  } catch (e) { showToast('Memoria piena. Elimina alcuni veicoli.', 'error'); }
}
function loadGarage() {
  try { const d = localStorage.getItem('targaai_garage'); if (d) garage = JSON.parse(d); } catch (e) { garage = []; }
  updateGarage();
}
function garagePhoto(v) { return photoURL(v.body || 'hatch', vehiclePaint(v), v.scene || 'garage'); }
function updateGarage() {
  const b = document.getElementById('garageBadge'), c = document.getElementById('garageCount'), l = document.getElementById('garageList');
  b.textContent = garage.length;
  b.style.display = garage.length > 0 ? 'inline-flex' : 'none';
  c.textContent = garage.length + ' ' + (garage.length === 1 ? 'veicolo' : 'veicoli');
  if (garage.length === 0) {
    l.innerHTML = '<div class="garage-empty"><div class="garage-empty-title">Nessun veicolo salvato</div><div class="garage-empty-sub">Scansiona una targa per iniziare</div></div>';
    return;
  }
  l.innerHTML = garage.map(v =>
    '<div class="garage-item" onclick="loadVehicle(\'' + v.plate + '\')">' +
    '<img class="garage-item-img" src="' + garagePhoto(v) + '" alt="' + v.brand + ' ' + v.model + '">' +
    '<div class="garage-info"><div class="garage-plate">' + v.plate + '</div><div class="garage-car">' + v.brand + ' ' + v.model + ' ' + v.trim + ' · ' + v.year + '</div></div>' +
    '<div class="garage-arrow">›</div></div>'
  ).join('');
}
function loadVehicle(plate) {
  const v = garage.find(x => x.plate === plate);
  if (!v) return;
  currentVehicle = v;
  document.getElementById('garageBox').classList.remove('active');
  renderReport(v);
  scrollToReport();
}
function toggleGarage() {
  const g = document.getElementById('garageBox');
  g.classList.toggle('active');
  if (g.classList.contains('active')) g.scrollIntoView({ behavior: 'smooth' });
}

/* ---------- PDF ---------- */
function exportPDF() {
  if (!currentVehicle) return;
  const v = currentVehicle, it = n => n.toLocaleString('it-IT');
  document.getElementById('pdfDate').textContent = 'Generato il ' + new Date().toLocaleDateString('it-IT') + ' · TargaAI by AutoEsperto';
  document.getElementById('pdfTable').innerHTML =
    '<tr><td>Targa</td><td><strong>' + v.plate + '</strong></td></tr>' +
    '<tr><td>Veicolo</td><td>' + v.brand + ' ' + v.model + ' ' + v.trim + '</td></tr>' +
    '<tr><td>Anno</td><td>' + v.year + ' (immatricolazione ' + v.month + '/' + v.year + ')</td></tr>' +
    '<tr><td>Kilometraggio</td><td>' + it(v.km) + ' km</td></tr>' +
    '<tr><td>Alimentazione</td><td>' + v.fuel + '</td></tr>' +
    '<tr><td>Potenza</td><td>' + v.cv + ' CV · ' + (v.fuel === 'Elettrica' ? 'Motore elettrico' : v.cc + ' cc') + '</td></tr>' +
    '<tr><td>Cambio</td><td>' + v.transmission + '</td></tr>' +
    '<tr><td>Porte</td><td>' + v.doors + '</td></tr>' +
    '<tr><td>Colore</td><td>' + v.color + '</td></tr>' +
    '<tr><td>Telaio</td><td>' + v.chassis + '</td></tr>' +
    '<tr><td>Valutazione AI</td><td><strong style="color:#15803d;">' + it(v.value) + ' EUR</strong></td></tr>' +
    '<tr><td>Range di mercato</td><td>' + it(v.min) + ' – ' + it(v.max) + ' EUR</td></tr>';
  const p = document.getElementById('pdfPreview');
  p.classList.add('active');
  trackEvent('pdf_export', { plate: v.plate });
  setTimeout(() => { window.print(); p.classList.remove('active'); }, 400);
}

/* ---------- Toast ---------- */
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' error' : '');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ---------- Init ---------- */
(function init() {
  buildGallery();
  loadGarage();
  trackEvent('app_open');
  const inp = document.getElementById('manualTarga');
  inp.addEventListener('input', e => {
    clearTimeout(searchTimeout);
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    e.target.value = v;
    if (v.length >= 5) searchTimeout = setTimeout(() => searchManual(), 800);
  });
  inp.addEventListener('keypress', e => { if (e.key === 'Enter') searchManual(); });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
  if (location.hash === '#demo') setTimeout(() => searchFleet(0), 600);
})();