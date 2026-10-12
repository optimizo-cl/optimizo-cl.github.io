/* Escenas de las portadas de capítulo: UN sistema. En cada capítulo el punto de la marca aterriza en lo que trata:
   sale por la mordida (identidad), hunde un botón (kit), es el cursor que escribe (formularios), es la punta de la
   gráfica (datos), sella «de Optimizo» (producto), es el punto de las «i» (web) y la cota que mide (manual).
   SVG y CSS, liviano; cada escena se duerme fuera de vista. */
import { isotipo } from "../kit/marca.js?v=e33c371";
import { icono } from "../kit/iconos.js?v=e33c371";
import { logoVivo, armar, saltarIes } from "../kit/logo-vivo.js?v=e33c371";
import { movimientoReducido } from "../kit/escenas/vigia.js?v=e33c371";

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const curva = (q) => (q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2);
/** El punto salta en arco de a → b (coordenadas dentro de su caja). */
const saltar = (punto, a, b, { dur = 1000, alto = 70 } = {}) => new Promise((fin) => {
  const t0 = performance.now();
  const f = (ahora) => { const q = Math.min(1, (ahora - t0) / dur), e = curva(q);
    punto.style.transform = `translate(${(a.x + (b.x - a.x) * e).toFixed(1)}px, ${(a.y + (b.y - a.y) * e - alto * 4 * e * (1 - e)).toFixed(1)}px)`;
    q < 1 ? requestAnimationFrame(f) : fin(); };
  requestAnimationFrame(f);
});
/** Corre un ciclo mientras la portada se ve; se duerme fuera de vista. */
const mientrasSeVe = (el, ciclo) => {
  let vivo = false, corriendo = false;
  const correr = async () => { if (corriendo) return; corriendo = true; while (vivo && el.isConnected) await ciclo(() => vivo); corriendo = false; };
  new IntersectionObserver(([e]) => { vivo = e.isIntersecting; if (vivo) correr(); }, { threshold: 0.35 }).observe(el);
};

const svg = (contenido, vb = "0 0 400 400") => `<svg viewBox="${vb}" class="escena-svg" aria-hidden="true">${contenido}</svg>`;

export const PORTADAS = {
  // Identidad: el isotipo grande, con su firma
  isotipo(el) { el.innerHTML = isotipo({ clase: "escena-iso firma-escape" }); },

  // Kit: el punto cae sobre el botón, la cerámica se hunde y el botón confirma
  ceramica(el) {
    el.innerHTML = `<div class="escena-boton" aria-hidden="true"><span class="escena-boton__pieza ceramica"><span class="escena-boton__t">Agendar diagnóstico</span><span class="escena-boton__ok">${icono("check", { tam: 30 })}Listo</span></span><i class="escena-punto"></i></div>`;
    import("../kit/iconos.js?v=e33c371").then((m) => m.rellenarIconos());
    const caja = el.querySelector(".escena-boton"), pieza = caja.querySelector(".escena-boton__pieza"), punto = caja.querySelector(".escena-punto");
    const lugar = () => { const b = caja.getBoundingClientRect(), r = pieza.getBoundingClientRect(), d = punto.offsetWidth / 2;
      return { fuera: { x: r.left - b.left - 120, y: r.top - b.top - 150 }, encima: { x: r.right - b.left - 46 - d, y: r.top - b.top + r.height / 2 - d } }; };
    if (movimientoReducido()) { requestAnimationFrame(() => { const l = lugar(); punto.style.transform = `translate(${l.encima.x}px, ${l.encima.y}px)`; caja.classList.add("listo"); }); return; }
    mientrasSeVe(el, async (vivo) => {
      const l = lugar(); caja.classList.remove("hundido", "listo"); punto.style.transform = `translate(${l.fuera.x}px, ${l.fuera.y}px)`; punto.style.opacity = "1";
      await espera(900); if (!vivo()) return;
      await saltar(punto, l.fuera, l.encima, { dur: 1100, alto: 90 });
      caja.classList.add("hundido"); await espera(380); caja.classList.remove("hundido"); caja.classList.add("listo");
      await espera(3200); punto.style.opacity = "0"; await espera(500);
    });
  },

  // Formularios: una frase que se escribe sola con el punto como cursor
  escritura(el) {
    el.innerHTML = `<p class="escena-escribe" aria-hidden="true"><span class="escena-escribe__texto"></span><i class="escena-escribe__punto"></i></p>`;
    const frases = ["¿Dónde se te va el tiempo?", "Cotizaciones a mano: 12 h", "Seguimiento en WhatsApp: 7 h", "Listo. Esta es tu empresa."];
    const t = el.querySelector(".escena-escribe__texto");
    let f = 0, c = 0, borrando = false, vivo = false;
    const tic = () => {
      if (!vivo) return;
      const frase = frases[f];
      if (!borrando) { c++; t.textContent = frase.slice(0, c); if (c >= frase.length) { borrando = true; return setTimeout(tic, 1800); } }
      else { c -= 2; t.textContent = frase.slice(0, Math.max(0, c)); if (c <= 0) { borrando = false; f = (f + 1) % frases.length; } }
      setTimeout(tic, borrando ? 28 : 62);
    };
    new IntersectionObserver(([e]) => { const antes = vivo; vivo = e.isIntersecting; if (vivo && !antes) tic(); }).observe(el);
  },

  // Datos: la gráfica se dibuja y el punto viaja en su punta hasta el último dato
  grafica(el) {
    const v = [62, 58, 71, 69, 74, 66, 72, 79, 83, 88], X = (k) => 20 + k * 40, Y = (n) => 250 - (n - 40) * 4;
    const d = v.map((n, k) => `${k ? "L" : "M"}${X(k)} ${Y(n)}`).join(" ");
    el.innerHTML = `<div class="escena-grafica" aria-hidden="true"><svg viewBox="0 0 400 290" class="escena-svg">
      ${[0, 1, 2, 3].map((k) => `<line x1="20" x2="380" y1="${70 + k * 60}" y2="${70 + k * 60}" class="escena-grafica__guia"/>`).join("")}
      <path d="${d} L380 270 L20 270 Z" class="escena-grafica__area"/><path d="${d}" class="escena-grafica__linea" pathLength="1"/></svg>
      <i class="escena-punto"></i><p class="escena-grafica__dato"><b>31 h</b><span>recuperadas por semana</span></p></div>`;
    const caja = el.querySelector(".escena-grafica"), svgEl = caja.querySelector("svg"), linea = caja.querySelector(".escena-grafica__linea"), punto = caja.querySelector(".escena-punto");
    const en = (q) => { const L = linea.getTotalLength(), p = linea.getPointAtLength(L * q), m = svgEl.getScreenCTM(), b = caja.getBoundingClientRect(), r = punto.offsetWidth / 2;
      const pt = new DOMPoint(p.x, p.y).matrixTransform(m); return { x: pt.x - b.left - r, y: pt.y - b.top - r }; };
    const poner = (q) => { const p = en(q); punto.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`; linea.style.strokeDashoffset = String(1 - q); };
    if (movimientoReducido()) { requestAnimationFrame(() => { poner(1); caja.classList.add("listo"); }); return; }
    mientrasSeVe(el, async (vivo) => {
      caja.classList.remove("listo"); poner(0); await espera(700); if (!vivo()) return;
      await new Promise((fin) => { const t0 = performance.now(); const f = (ahora) => { const q = Math.min(1, (ahora - t0) / 2600); poner(curva(q)); q < 1 ? requestAnimationFrame(f) : fin(); }; requestAnimationFrame(f); });
      caja.classList.add("listo"); await espera(4200);
    });
  },

  // Producto: el punto es el apellido. Sale del isotipo de Optimizo y va a sellar a cada producto («de Optimizo»);
  // al final vuelve a su nido. Cada producto conserva su material (Medula cobalto, Bárbara noche y lima).
  familia(el) {
    const isoSin = isotipo({ clase: "ef-iso", titulo: "" }).replace('role="img" aria-label=""', 'aria-hidden="true"').replace('<g class="isotipo__punto">', '<g class="isotipo__punto" style="opacity:0">');
    el.innerHTML = `<div class="escena-familia" aria-hidden="true">
      <div class="ef-ficha ef-ficha--opt">${isoSin}<b>Optimizo</b></div>
      <div class="ef-ficha ef-ficha--med"><img src="assets/productos/medula-marca-blanca.svg" alt=""><b class="medula-palabra">Medula</b><span class="ef-sello"><i class="ef-sello__punto"></i>de Optimizo</span></div>
      <div class="ef-ficha ef-ficha--bar"><img src="assets/productos/barbara-avatar.webp" alt=""><b class="barbara-palabra">BÁRBARA</b><span class="ef-sello"><i class="ef-sello__punto"></i>de Optimizo</span></div>
      <i class="ef-punto"></i></div>`;
    const caja = el.querySelector(".escena-familia"), punto = caja.querySelector(".ef-punto"), sellos = [...caja.querySelectorAll(".ef-sello")];
    const nido = () => { const n = caja.querySelector(".ef-iso .isotipo__punto circle").getBoundingClientRect(), b = caja.getBoundingClientRect(); return { x: n.left + n.width / 2 - b.left, y: n.top + n.height / 2 - b.top, d: n.width }; };
    const sello = (i) => { const n = sellos[i].querySelector(".ef-sello__punto").getBoundingClientRect(), b = caja.getBoundingClientRect(); return { x: n.left + n.width / 2 - b.left, y: n.top + n.height / 2 - b.top, d: n.width }; };
    const poner = (p) => Object.assign(punto.style, { width: p.d + "px", height: p.d + "px", transform: `translate(${(p.x - p.d / 2).toFixed(1)}px, ${(p.y - p.d / 2).toFixed(1)}px)` });
    const saltar = (a, b, dur = 1000) => new Promise((fin) => { const t0 = performance.now(), alto = 60;
      const f = (ahora) => { const q = Math.min(1, (ahora - t0) / dur), e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
        poner({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e - alto * 4 * e * (1 - e), d: a.d + (b.d - a.d) * e }); q < 1 ? requestAnimationFrame(f) : fin(); };
      requestAnimationFrame(f); });
    const espera = (ms) => new Promise((r) => setTimeout(r, ms));
    let vivo = false, corriendo = false;
    const ciclo = async () => {
      if (corriendo) return; corriendo = true;
      while (vivo && caja.isConnected) {
        poner(nido()); sellos.forEach((x) => x.classList.remove("puesto")); await espera(1400);
        for (let i = 0; i < sellos.length && vivo; i++) { await saltar(i ? sello(i - 1) : nido(), sello(i)); sellos[i].classList.add("puesto"); await espera(1500); }
        if (vivo) { await saltar(sello(sellos.length - 1), nido(), 1200); await espera(2400); }
      }
      corriendo = false;
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { sellos.forEach((x) => x.classList.add("puesto")); requestAnimationFrame(() => poner(nido())); return; }
    new IntersectionObserver(([e]) => { vivo = e.isIntersecting; if (vivo) ciclo(); }).observe(el);
    requestAnimationFrame(() => poner(nido()));
  },

  // Web: una pieza de marca (post 4:5) donde el logo se arma y los puntos de las «i» saludan
  async pieza(el) {
    el.innerHTML = `<div class="escena-post" aria-hidden="true"><div class="escena-post__logo">${await logoVivo({ armado: false, titulo: "" })}</div>
      <p class="escena-post__frase">Todo proceso<br>tiene una salida.</p><span class="escena-post__pie">optimizo.cl</span></div>`;
    const svg = el.querySelector(".escena-post__logo svg");
    if (movimientoReducido()) { armar(svg); return; }
    mientrasSeVe(el, async (vivo) => { const ms = armar(svg); await espera(ms + 600); for (let k = 0; k < 3 && vivo(); k++) { saltarIes(svg); await espera(2600); } });
  },

  // Manual: retícula técnica con cotas que se dibujan
  reticula(el) {
    const lineas = Array.from({ length: 13 }, (_, i) => `<line x1="${20 + i * 30}" y1="20" x2="${20 + i * 30}" y2="380" class="escena-reticula__l"/>`).join("") +
      Array.from({ length: 13 }, (_, i) => `<line x1="20" y1="${20 + i * 30}" x2="380" y2="${20 + i * 30}" class="escena-reticula__l"/>`).join("");
    el.innerHTML = svg(`${lineas}<g class="escena-cotas"><path d="M80 300 H320" class="escena-cota"/><path d="M80 292 V308 M320 292 V308" class="escena-cota"/><text x="200" y="326" text-anchor="middle">3,23 L</text>
      <path d="M60 80 V260" class="escena-cota"/><text x="50" y="174" text-anchor="end">1 L</text></g>
      <g transform="translate(80 80) scale(1.3)">${isotipo({ clase: "escena-iso-mini" }).replace(/<svg[^>]*>|<\/svg>/g, "")}</g>`);
  },
};
