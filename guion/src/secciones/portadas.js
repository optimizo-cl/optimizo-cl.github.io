/* Escenas de las portadas de capítulo: cada capítulo abre con algo propio, vivo y liviano (SVG + CSS).
   Todo es SVG y CSS: barato, y se duerme fuera de vista. */
import { isotipo } from "../kit/marca.js?v=aa26df1";

const svg = (contenido, vb = "0 0 400 400") => `<svg viewBox="${vb}" class="escena-svg" aria-hidden="true">${contenido}</svg>`;

export const PORTADAS = {
  // Identidad: el isotipo grande, con su firma
  isotipo(el) { el.innerHTML = isotipo({ clase: "escena-iso firma-escape" }); },

  // Kit: fichas de cerámica apiladas que se hunden por turnos
  ceramica(el) {
    el.innerHTML = `<div class="escena-fichas">${["Agendar diagnóstico", "Guardar", "Listo"].map((t, i) => `<span class="escena-ficha" style="--i:${i}"><i></i>${t}</span>`).join("")}</div>`;
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

  // Datos: una trama de puntos cuyo tamaño dibuja una curva de crecimiento
  trama(el) {
    const pts = [];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 24; x++) {
      const v = Math.max(0, Math.min(1, (x / 23) * 1.1 - Math.abs(y / 15 - (1 - x / 23) * 0.8 - 0.1) * 1.6 + 0.35));
      if (v > 0.04) pts.push(`<circle cx="${10 + x * 16.5}" cy="${20 + y * 16.5}" r="${(v * 6.5).toFixed(2)}" style="--d:${(x * 40 + y * 12)}ms"/>`);
    }
    el.innerHTML = svg(`<g class="escena-trama">${pts.join("")}</g>`, "0 0 400 290");
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

  // Web: piezas de marca que giran lentamente en profundidad
  pieza(el) {
    el.innerHTML = `<div class="escena-piezas">${["31 h", "Todo proceso tiene una salida.", "No recomendamos. Implementamos."].map((t, i) => `<div class="escena-pieza" style="--i:${i}"><span>${t}</span></div>`).join("")}</div>`;
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
