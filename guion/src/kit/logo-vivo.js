/* Logo vivo: el logo armado pieza por pieza para animarlo.
   El disco es un círculo con máscara: la mordida y el agujero son círculos negros que crecen (se «perforan»).
   Las letras y los puntos de las «i» son trazos aparte (assets/logo/letras.json, de marca/logo/letras_logo.py).
   armar(svg) reproduce la construcción; las «i» saltan en ola al pasar el mouse. */
import { movimientoReducido } from "./escenas/vigia.js?v=e217e49";

const C = { x: 75.207031, y: 71.753906, r: 69.152, hueco: 17.288 };
const P = { x: 25.863281, y: 22.753906, r: 17.289 };
const MORDIDA = 34.578;
const LADO = 138.305;
let datos = null, n = 0;

export async function cargarLetras() {
  datos ||= await (await fetch(new URL("../../assets/logo/letras.json", import.meta.url))).json();
  return datos;
}

/** SVG del logo vivo. solo = "isotipo" para el símbolo solo. armado: false = queda desarmado hasta llamar armar(). */
export async function logoVivo({ clase = "", solo = "", armado = true, titulo = "Optimizo" } = {}) {
  const d = await cargarLetras(), id = `lv${++n}`;
  const W = solo === "isotipo" ? LADO : d.viewBox[2];
  let j = 0;
  const texto = solo === "isotipo" ? "" : `<g class="lv__texto">${d.letras.map((l, i) => `<path class="lv__letra" style="--i:${i}" d="${l.d}"/>${l.tilde ? `<path class="lv__tilde" style="--j:${j++}" d="${l.tilde.d}"/>` : ""}`).join("")}</g>`;
  return `<svg class="lv ${armado ? "lv--armado" : ""} ${clase}" viewBox="0 0 ${W} ${LADO}" role="img" aria-label="${titulo}">
    <defs>
      <linearGradient id="${id}d" gradientUnits="userSpaceOnUse" x1="6.054688" x2="144.359375" y1="0" y2="0"><stop offset="0" style="stop-color:var(--deg-a)"/><stop offset="1" style="stop-color:var(--deg-b)"/></linearGradient>
      <linearGradient id="${id}p" gradientUnits="userSpaceOnUse" x1="8.574219" x2="43.152344" y1="0" y2="0"><stop offset="0" style="stop-color:var(--deg-a)"/><stop offset="1" style="stop-color:var(--deg-b)"/></linearGradient>
      <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="160">
        <rect width="160" height="160" fill="#fff"/>
        <circle class="lv__mordida" cx="${P.x}" cy="${P.y}" r="${MORDIDA}" fill="#000"/>
        <circle class="lv__hueco" cx="${C.x}" cy="${C.y}" r="${C.hueco}" fill="#000"/>
      </mask>
    </defs>
    <g transform="translate(-6.054688 -2.601562)">
      <circle class="lv__contorno" cx="${C.x}" cy="${C.y}" r="${C.r}" pathLength="1" fill="none" stroke="url(#${id}d)"/>
      <circle class="lv__disco" cx="${C.x}" cy="${C.y}" r="${C.r}" fill="url(#${id}d)" mask="url(#${id}m)"/>
      <g class="lv__punto"><circle cx="${P.x}" cy="${P.y}" r="${P.r}" fill="url(#${id}p)"/></g>
    </g>${texto}</svg>`;
}

/** Reproduce la construcción (o la deja armada con movimiento reducido). Devuelve la duración en ms. */
export function armar(svg) {
  if (movimientoReducido()) { svg.classList.add("lv--armado"); return 0; }
  svg.classList.remove("lv--armado", "lv--arma");
  void svg.getBoundingClientRect();
  svg.classList.add("lv--arma");
  return 4200;
}

/** Lleva la construcción a un instante (ms) y la deja en pausa: para la línea de tiempo. */
export function instante(svg, ms) {
  if (!svg.classList.contains("lv--arma")) { svg.classList.remove("lv--armado"); svg.classList.add("lv--arma"); }
  svg.getAnimations({ subtree: true }).forEach((a) => { a.pause(); a.currentTime = ms; });
}
export function soltar(svg) { svg.getAnimations({ subtree: true }).forEach((a) => a.play()); }

/** Las «i» saltan en ola (también se dispara solo, cada tanto, si se pide). */
export function saltarIes(svg) {
  if (movimientoReducido()) return;
  svg.querySelectorAll(".lv__tilde").forEach((t, k) => t.animate(
    [{ transform: "none", easing: "cubic-bezier(.2, .6, .35, 1)" },                         // impulso: sube frenando
     { transform: "translateY(-10px)", offset: 0.4, easing: "cubic-bezier(.55, 0, 1, .45)" }, // cae acelerando
     { transform: "translateY(0) scale(1.1, .86)", offset: 0.72, easing: "cubic-bezier(0, .55, .45, 1)" }, // impacto
     { transform: "translateY(-2px)", offset: 0.86, easing: "cubic-bezier(.55, 0, 1, .45)" },
     { transform: "none" }],
    { duration: 760, delay: k * 120, easing: "linear" }));
}

/** Cuando se ve, se arma una vez; al pasar el mouse, las «i» saltan. */
export function activarLogoVivo(svg, { armarAlVer = true, iesSolas = false } = {}) {
  if (armarAlVer && !movimientoReducido()) {
    svg.classList.remove("lv--armado");
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); armar(svg); } }, { threshold: 0.5 });
    io.observe(svg);
  }
  svg.addEventListener("pointerenter", () => saltarIes(svg));
  if (iesSolas) { const t = setInterval(() => { if (!svg.isConnected) return clearInterval(t); if (svg.getBoundingClientRect().bottom > 0) saltarIes(svg); }, 5200); }
}
