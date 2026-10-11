/* Etapas de avance: cada etapa es un isotipo. Hecha = disco lleno con su punto en el nido. Actual = el disco se llena
   según el avance y el punto de la marca está en su nido. Pendiente = contorno punteado y el nido vacío.
   Al avanzar, el disco actual termina de llenarse, la línea recta hasta la siguiente se completa y el punto salta
   en un arco limpio al nido de la siguiente etapa, que empieza a llenarse. Reemplaza al progreso por pasos y a la «pista». */
import { DISCO } from "./marca.js?v=aa26df1";
import { movimientoReducido } from "./escenas/vigia.js?v=aa26df1";

const NIDO = { x: 25.863281, y: 22.753906, r: 17.289 };
let n = 0;
const disco = (clip) => `<svg class="etapa__iso" viewBox="0 0 138.305 138.305" aria-hidden="true"><defs><clipPath id="${clip}" clipPathUnits="userSpaceOnUse"><rect class="etapa__nivel" x="0" y="2.6" width="160" height="140"/></clipPath></defs>
  <g transform="translate(-6.054688 -2.601562)">
    <path class="etapa__contorno" fill-rule="evenodd" d="${DISCO}"/>
    <g clip-path="url(#${clip})"><path class="etapa__relleno" fill-rule="evenodd" d="${DISCO}"/></g>
    <circle class="etapa__nido" cx="${NIDO.x}" cy="${NIDO.y}" r="${NIDO.r - 1.5}"/>
    <circle class="etapa__punto" cx="${NIDO.x}" cy="${NIDO.y}" r="${NIDO.r}"/></g></svg>`;

/** pasos: [{ nombre, detalle? } | "nombre"] · actual: índice (−1 = sin empezar, n = todo hecho) · avance: 0–1 de la actual. */
export function etapas(pasos, { actual = 0, avance = 0.5, compacto = false, porcentaje = true, etiqueta = "Etapas" } = {}) {
  const id = `et${++n}`, ps = pasos.map((p) => (typeof p === "string" ? { nombre: p } : p));
  return `<div class="etapas progreso ${compacto ? "etapas--compacto" : ""}" data-etapas ${porcentaje ? "" : "data-sin-pct"} data-actual="${actual}" data-avance="${avance}" style="--n:${ps.length}" role="list" aria-label="${etiqueta}">
    ${ps.map((p, i) => `<div class="etapa" role="listitem" style="--i:${i}" data-i="${i}">
      <span class="etapa__marca">${disco(`${id}-${i}`)}</span>${i < ps.length - 1 ? `<span class="etapa__linea" aria-hidden="true"><i></i></span>` : ""}
      <span class="etapa__texto"><span class="etapa__n">${String(i + 1).padStart(2, "0")}</span><b>${p.nombre}</b>${p.detalle && !compacto ? `<span class="etapa__detalle">${p.detalle}</span>` : ""}<span class="etapa__estado" data-estado></span></span></div>`).join("")}
    <i class="etapas__viajero" aria-hidden="true"></i></div>`;
}

/** Pinta el estado (clases, nivel de llenado, textos) sin animar el viajero. */
function pintar(el, actual, avance) {
  el.dataset.actual = actual; el.dataset.avance = avance;
  el.querySelectorAll(".etapa").forEach((e, i) => {
    const est = i < actual ? "hecha" : i === actual ? "actual" : "pendiente";
    e.className = `etapa etapa--${est}`;
    const v = est === "hecha" ? 1 : est === "actual" ? avance : 0;
    e.style.setProperty("--v", v);
    e.querySelector(".etapa__nivel").style.transform = `translateY(${(138.4 * (1 - v)).toFixed(2)}px)`; // se llena desde abajo
    e.querySelector("[data-estado]").textContent = "sinPct" in el.dataset ? "" : est === "hecha" ? "Lista" : est === "actual" ? `${Math.round(avance * 100)} %` : "";
    e.setAttribute("aria-label", `${e.querySelector("b").textContent}: ${est === "hecha" ? "lista" : est === "actual" ? `en curso, ${Math.round(avance * 100)} %` : "pendiente"}`);
    if (est === "actual") e.setAttribute("aria-current", "step"); else e.removeAttribute("aria-current");
  });
}
/** Centro del nido de la etapa i, relativo al componente. */
function nido(el, i) {
  const e = el.querySelectorAll(".etapa")[i]; if (!e) return null;
  const n = e.querySelector(".etapa__nido").getBoundingClientRect(), b = el.getBoundingClientRect();
  return { x: n.left + n.width / 2 - b.left, y: n.top + n.height / 2 - b.top, d: n.width * (NIDO.r / (NIDO.r - 1.5)) };
}
function ponerViajero(el, p) {
  const v = el.querySelector(".etapas__viajero");
  if (!p) { v.style.opacity = 0; return; }
  Object.assign(v.style, { width: p.d + "px", height: p.d + "px", opacity: 1, transform: `translate(${p.x - p.d / 2}px, ${p.y - p.d / 2}px)` });
}

/** Activa un componente de etapas (posiciona el punto y lo mantiene en su lugar al cambiar el tamaño). */
export function activarEtapas(raiz = document) {
  raiz.querySelectorAll("[data-etapas]:not([data-activo])").forEach((el) => {
    el.dataset.activo = "1";
    pintar(el, +el.dataset.actual, +el.dataset.avance);
    const ubicar = () => { const a = +el.dataset.actual; if (!el._moviendo) ponerViajero(el, a >= 0 ? nido(el, Math.min(a, el.querySelectorAll(".etapa").length - 1)) : null); };
    requestAnimationFrame(ubicar); new ResizeObserver(ubicar).observe(el); document.fonts?.ready.then(ubicar);
  });
}

/** Lleva el componente a la etapa i con su avance. Devuelve una promesa que termina cuando el punto aterriza. */
export function moverEtapa(el, i, avance = 0) {
  const total = el.querySelectorAll(".etapa").length, de = +el.dataset.actual;
  i = Math.max(-1, Math.min(total, i));
  if (movimientoReducido() || i === de) { pintar(el, i, avance); ponerViajero(el, i >= 0 && i < total ? nido(el, i) : i >= total ? nido(el, total - 1) : null); return Promise.resolve(); }
  // 1 · lo que queda atrás se completa (o se vacía al retroceder); la nueva etapa parte vacía
  pintar(el, i, 0);
  const a = de >= 0 ? nido(el, Math.min(de, total - 1)) : null, b = nido(el, Math.min(Math.max(i, 0), total - 1));
  if (!a || !b || i >= total) { ponerViajero(el, b); return Promise.resolve(); }
  // 2 · el punto salta en un arco limpio (parábola), acelerando y frenando
  el._moviendo = true;
  const v = el.querySelector(".etapas__viajero"), alto = Math.min(42, 22 + Math.abs(b.x - a.x) * 0.06), dur = 820 + Math.abs(i - de) * 120;
  return new Promise((fin) => {
    const t0 = performance.now();
    const f = (ahora) => {
      const q = Math.min(1, (ahora - t0) / dur), e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e - alto * 4 * e * (1 - e), d = a.d + (b.d - a.d) * e;
      Object.assign(v.style, { width: d + "px", height: d + "px", opacity: 1, transform: `translate(${(x - d / 2).toFixed(2)}px, ${(y - d / 2).toFixed(2)}px)` });
      if (q < 1) return requestAnimationFrame(f);
      el._moviendo = false; pintar(el, i, avance); fin();
    };
    requestAnimationFrame(f);
  });
}
