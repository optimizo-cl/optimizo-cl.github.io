/* Escenas de las portadas de capítulo: cada capítulo abre con algo propio, vivo y liviano (SVG + CSS).
   Las escenas WebGL grandes (Trama, 3D) viven en sus secciones; acá todo es barato y se duerme fuera de vista. */
import { isotipo } from "../kit/marca.js";

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

  // Producto: órbitas concéntricas con puntos que las recorren y un disco al centro
  orbitas(el) {
    const anillos = [70, 115, 160].map((r, i) => `<circle cx="200" cy="200" r="${r}" class="escena-orbita"/>
      <g class="escena-gira" style="--t:${18 + i * 9}s;--dir:${i % 2 ? -1 : 1}"><circle cx="${200 + r}" cy="200" r="${7 - i}" class="escena-dato"/><circle cx="${200 - r * 0.7}" cy="${200 + r * 0.71}" r="${5 - i}" class="escena-dato escena-dato--b"/></g>`).join("");
    el.innerHTML = svg(`${anillos}<g transform="translate(150 150) scale(.72)">${isotipo({ clase: "escena-iso-mini" }).replace(/<svg[^>]*>|<\/svg>/g, "")}</g>`);
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
