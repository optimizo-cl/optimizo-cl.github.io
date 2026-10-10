/* Película: piezas de marca animadas, dibujadas en canvas y exportables a video (MP4 si el navegador lo permite, WebM si no).
   Guiones: «marca» (16:9, 12 s: el logo se arma, la frase, el punto que se escapa), «dato» (4:5, 8 s: un número que se
   cuenta) y «frase» (1:1, 6 s: dos líneas con el punto como cursor). Todo lee los colores de la paleta activa. */
import { DISCO } from "./marca.js";
import { cargarLetras } from "./logo-vivo.js";

const P = { x: 25.863281, y: 22.753906, r: 17.289 }, C = { x: 75.207031, y: 71.753906 };
const LETRA = '"SF Pro Display", "Inter", system-ui, sans-serif';
const lleg = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4);
const suave = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const tramo = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const tok = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export const FORMATOS = { "16:9": [1280, 720], "4:5": [1080, 1350], "1:1": [1080, 1080] };
let largoContorno = 0;
function contorno() {
  if (largoContorno) return largoContorno;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", DISCO.split(" Z ")[0] + " Z"); svg.style.cssText = "position:absolute;width:0;height:0"; svg.appendChild(p); document.body.appendChild(svg);
  largoContorno = p.getTotalLength(); svg.remove(); return largoContorno;
}
let granoPat = null;
function grano(ctx) {
  if (granoPat) return granoPat;
  const c = document.createElement("canvas"); c.width = c.height = 160; const x = c.getContext("2d"), img = x.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 26; }
  x.putImageData(img, 0, 0); return (granoPat = ctx.createPattern(c, "repeat"));
}

/** Dibuja el isotipo (y opcionalmente las letras) con su construcción en el instante k (0 → 1). */
function logoEn(ctx, letras, col, { x, y, s, k = 1, conLetras = true, salida = 0, color = null }) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.translate(-6.054688, -2.601562);
  const disco = new Path2D(DISCO), gd = ctx.createLinearGradient(6.05, 0, 144.36, 0); gd.addColorStop(0, col.a); gd.addColorStop(1, col.b);
  const trazo = tramo(k, 0, 0.28);
  if (trazo < 1) { ctx.setLineDash([contorno() * trazo, contorno()]); ctx.lineWidth = 1.4 / Math.max(0.2, s / 2); ctx.strokeStyle = color || col.b; ctx.stroke(new Path2D(DISCO.split(" Z ")[0] + " Z")); ctx.setLineDash([]); }
  ctx.globalAlpha = tramo(k, 0.2, 0.36); ctx.fillStyle = color || gd; ctx.fill(disco, "evenodd"); ctx.globalAlpha = 1;
  // el punto: nace en el agujero, sale por la mordida y llega a su nido; «salida» lo saca de nuevo por la tangente
  const kp = lleg(tramo(k, 0.3, 0.62));
  if (kp > 0) {
    let px = C.x + (P.x - C.x) * kp, py = C.y + (P.y - C.y) * kp - Math.sin(kp * Math.PI) * 18;
    if (salida > 0) { const e = salida * salida; px += e * 900; py -= e * 420; }
    const gp = ctx.createLinearGradient(px - P.r, 0, px + P.r, 0); gp.addColorStop(0, col.a); gp.addColorStop(1, col.b);
    ctx.beginPath(); ctx.arc(px, py, P.r * (0.35 + 0.65 * kp), 0, Math.PI * 2); ctx.fillStyle = color || gp; ctx.fill();
  }
  ctx.restore();
  if (conLetras && letras) {
    ctx.fillStyle = color || col.navy;
    letras.letras.forEach((l, i) => { const kl = lleg(tramo(k, 0.58 + i * 0.03, 0.8 + i * 0.03)); if (!kl) return; ctx.save(); ctx.globalAlpha = kl; ctx.translate(0, (1 - kl) * 14); ctx.fill(new Path2D(l.d)); ctx.restore();
      if (l.tilde) { const kt = tramo(k, 0.82 + i * 0.012, 1); if (!kt) return; const caida = kt < 0.7 ? -40 * (1 - kt / 0.7) ** 2 : -3 * Math.sin(((kt - 0.7) / 0.3) * Math.PI); ctx.save(); ctx.translate(0, caida); ctx.fill(new Path2D(l.tilde.d)); ctx.restore(); } });
  }
  ctx.restore();
}

function frasePorPalabras(ctx, texto, x, y, ancho, tam, k, color, { peso = 700, alto = 1.04 } = {}) {
  ctx.font = `${peso} ${tam}px ${LETRA}`; ctx.fillStyle = color; ctx.textBaseline = "alphabetic";
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${-tam * 0.04}px`;
  const palabras = texto.split(" "), lineas = [[]]; let w = 0;
  for (const p of palabras) { const m = ctx.measureText(p + " ").width; if (w + m > ancho && lineas.at(-1).length) { lineas.push([]); w = 0; } lineas.at(-1).push(p); w += m; }
  let n = 0; const total = palabras.length;
  lineas.forEach((l, li) => { let cx = x; l.forEach((p) => { const kk = lleg(tramo(k * total * 1.3 - n * 1, 0, 1)); n++; if (kk > 0) { ctx.save(); ctx.globalAlpha = kk; ctx.fillText(p, cx, y + li * tam * alto + (1 - kk) * tam * 0.3); ctx.restore(); } cx += ctx.measureText(p + " ").width; }); });
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  return lineas.length * tam * alto;
}

const GUIONES = {
  /* 16:9 · 12 s */
  marca: { formato: "16:9", dur: 12, cuadro(ctx, w, h, t, col, letras) {
    const k = tramo(t, 0, 4.6), sube = suave(tramo(t, 4.8, 6));
    const s = Math.min(h * 0.0042, (w * 0.56) / 446.654) * (1 - 0.28 * sube), lw = 446.654 * s;
    logoEn(ctx, letras, col, { x: (w - lw) / 2, y: h * 0.5 - 69 * s - sube * h * 0.18, s, k, salida: Math.max(0, tramo(t, 8.4, 9.8) - lleg(tramo(t, 10, 11.4))) }); // sale y vuelve: la firma
    const kf = tramo(t, 5.6, 7.6);
    if (kf > 0) { ctx.textAlign = "left"; const tam = h * 0.075; ctx.font = `700 ${tam}px ${LETRA}`; const anchoF = Math.min(w * 0.8, ctx.measureText("Todo proceso tiene una salida.").width * 1.04); frasePorPalabras(ctx, "Todo proceso tiene una salida.", (w - anchoF) / 2, h * 0.64, anchoF + 10, tam, kf, col.navy); }
    // la estela del punto que escapa
    const ke = tramo(t, 8.6, 10.6);
    if (ke > 0 && ke < 1) { ctx.save(); ctx.strokeStyle = col.acento; ctx.lineWidth = 3; ctx.setLineDash([3, 9]); ctx.globalAlpha = 1 - ke; ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.3); ctx.quadraticCurveTo(w * 0.6, h * 0.05, w * (0.3 + ke * 0.8), h * (0.3 - ke * 0.45)); ctx.stroke(); ctx.restore(); }
    const kw = tramo(t, 10.2, 11.2);
    if (kw > 0) { ctx.save(); ctx.globalAlpha = kw; ctx.font = `600 ${h * 0.03}px ${LETRA}`; ctx.fillStyle = col.acentoTexto; ctx.textAlign = "center"; ctx.fillText("optimizo.cl", w / 2, h * 0.9); ctx.restore(); }
  } },
  /* 4:5 · 8 s */
  dato: { formato: "4:5", dur: 8, cuadro(ctx, w, h, t, col, letras) {
    const kc = tramo(t, 0.6, 3.6), v = Math.round(31 * lleg(kc));
    ctx.textAlign = "left";
    ctx.save(); ctx.globalAlpha = lleg(tramo(t, 0.2, 1)); ctx.font = `600 ${w * 0.034}px ${LETRA}`; ctx.fillStyle = col.grafito; ctx.fillText("HORAS POR SEMANA QUE SE PIERDEN", w * 0.075, h * 0.17); ctx.restore();
    ctx.font = `700 ${w * 0.34}px ${LETRA}`; ctx.fillStyle = col.navy; if ("letterSpacing" in ctx) ctx.letterSpacing = `${-w * 0.016}px`; ctx.fillText(`${v} h`, w * 0.06, h * 0.45); if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    // el punto que marca cada paso del conteo
    const tic = kc > 0 && kc < 1 ? 1 + 0.5 * Math.abs(Math.sin(v * 1.7)) : 1;
    ctx.beginPath(); ctx.arc(w * 0.9, h * 0.25, w * 0.018 * tic, 0, Math.PI * 2); ctx.fillStyle = col.acento; ctx.fill();
    frasePorPalabras(ctx, "Cotizar a mano, seguir clientes por WhatsApp y cuadrar el inventario: ahí se va.", w * 0.075, h * 0.56, w * 0.82, w * 0.048, tramo(t, 3.4, 6), col.grafito, { peso: 500, alto: 1.3 });
    const kl = tramo(t, 5.6, 7.6); logoEn(ctx, letras, col, { x: w * 0.075, y: h * 0.84, s: w * 0.00068, k: 0.2 + 0.8 * kl });
  } },
  /* 1:1 · 6 s */
  frase: { formato: "1:1", dur: 6, cuadro(ctx, w, h, t, col, letras) {
    ctx.textAlign = "left"; const tam = w * 0.1;
    const a = "No recomendamos.", b = "Implementamos.";
    const ka = tramo(t, 0.4, 2.0), kb = tramo(t, 2.4, 4.0);
    ctx.font = `700 ${tam}px ${LETRA}`; if ("letterSpacing" in ctx) ctx.letterSpacing = `${-tam * 0.04}px`;
    const na = Math.round(a.length * ka), nb = Math.round(b.length * kb);
    ctx.fillStyle = col.navy; ctx.fillText(a.slice(0, na), w * 0.08, h * 0.46);
    ctx.fillStyle = col.acentoTexto; ctx.fillText(b.slice(0, nb), w * 0.08, h * 0.46 + tam * 1.1);
    // el punto como cursor: al final de lo escrito; termina aterrizando en el isotipo
    const enB = t > 2.2, txt = enB ? b.slice(0, nb) : a.slice(0, na), cx = w * 0.08 + ctx.measureText(txt).width + tam * 0.18, cy = (enB ? h * 0.46 + tam * 1.1 : h * 0.46) - tam * 0.32;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    const kf = lleg(tramo(t, 4.2, 5.2)), dx = w * 0.12, dy = h * 0.82;
    if (kf < 1) { ctx.beginPath(); ctx.arc(cx + (dx - cx) * kf, cy + (dy - cy) * kf, tam * 0.12, 0, Math.PI * 2); ctx.fillStyle = col.acento; ctx.fill(); }
    logoEn(ctx, letras, col, { x: w * 0.08, y: h * 0.78, s: w * 0.00072, k: kf > 0.95 ? 1 : 0.62, conLetras: kf > 0.6 });
  } },
};

/** Monta una película en un canvas. Devuelve { reproducir, ir(t), pausar, grabar() → Promise<{blob, ext}> }. */
export async function pelicula(canvas, guion = "marca") {
  const g = GUIONES[guion], [w, h] = FORMATOS[g.formato], letras = await cargarLetras();
  canvas.width = w; canvas.height = h; const ctx = canvas.getContext("2d");
  const colores = () => ({ hueso: tok("--hueso"), navy: tok("--navy"), grafito: tok("--grafito"), a: tok("--deg-a"), b: tok("--deg-b"), acento: tok("--acento"), acentoTexto: tok("--acento-texto-claro") });
  let col = colores(), t = 0, raf = 0, t0 = 0, alTerminar = null;
  new MutationObserver(() => { col = colores(); pintar(t); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-paleta", "data-tema"] });
  const pintar = (tt) => {
    t = tt; ctx.save(); ctx.fillStyle = col.hueso; ctx.fillRect(0, 0, w, h); ctx.fillStyle = grano(ctx); ctx.fillRect(0, 0, w, h); ctx.restore();
    g.cuadro(ctx, w, h, tt, col, letras);
    canvas.dispatchEvent(new CustomEvent("tiempo", { detail: tt / g.dur }));
  };
  const tic = (ahora) => { const tt = (ahora - t0) / 1000; if (tt >= g.dur) { pintar(g.dur); raf = 0; alTerminar?.(); return; } pintar(tt); raf = requestAnimationFrame(tic); };
  const reproducir = (desde = 0) => new Promise((res) => { cancelAnimationFrame(raf); t0 = performance.now() - desde * 1000; alTerminar = res; raf = requestAnimationFrame(tic); });
  pintar(matchMedia("(prefers-reduced-motion: reduce)").matches ? g.dur : 0);
  return {
    dur: g.dur, formato: g.formato, reproducir,
    ir(tt) { cancelAnimationFrame(raf); raf = 0; pintar(Math.max(0, Math.min(g.dur, tt))); },
    pausar() { cancelAnimationFrame(raf); raf = 0; },
    async grabar() {
      const tipos = ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
      const tipo = tipos.find((x) => window.MediaRecorder?.isTypeSupported?.(x));
      if (!tipo) throw new Error("Este navegador no puede grabar video.");
      const flujo = canvas.captureStream(30), rec = new MediaRecorder(flujo, { mimeType: tipo, videoBitsPerSecond: 6_000_000 }), partes = [];
      rec.ondataavailable = (e) => e.data.size && partes.push(e.data);
      const listo = new Promise((r) => (rec.onstop = r));
      rec.start(); await reproducir(0); await new Promise((r) => setTimeout(r, 200)); rec.stop(); await listo;
      return { blob: new Blob(partes, { type: tipo.split(";")[0] }), ext: tipo.includes("mp4") ? "mp4" : "webm" };
    },
  };
}
