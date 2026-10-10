/* Gráficas v2: la trama es material (y segunda codificación), todo entra dibujándose, la lectura tiene lupa
   y las gráficas cuentan una historia con anotaciones. Siempre con vista de tabla y un solo eje. */
import { movimientoReducido } from "../kit/escenas/vigia.js?v=19f4b98";

const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}, padre) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); padre?.appendChild(e); return e; };
let n = 0;

/** Patrones de textura (segunda codificación): sólido, diagonal, puntos, cuadrícula. Se definen una vez por gráfica. */
function texturas(svg) {
  const id = `tx${++n}`, defs = svgEl("defs", {}, svg);
  const pat = (k, w, contenido) => { const p = svgEl("pattern", { id: `${id}-${k}`, width: w, height: w, patternUnits: "userSpaceOnUse" }, defs); p.innerHTML = contenido; };
  pat("puntos", 6, `<circle cx="3" cy="3" r="1.6" fill="currentColor"/>`);
  pat("diagonal", 6, `<path d="M0 1.5 H6 M0 4.5 H6" stroke="currentColor" stroke-width="1.4"/>`); // rayas rectas: nada en diagonal
  pat("cruz", 7, `<path d="M0 3.5 H7 M3.5 0 V7" stroke="currentColor" stroke-width="1.3"/>`);
  return (k) => `url(#${id}-${k})`;
}
/** Trama de imprenta: la densidad de puntos crece con el valor (0–1). */
function tramaValor(svg, v) {
  const id = `tv${++n}`, paso = 7 - v * 3.2, r = 1 + v * 1.4;
  const p = svgEl("pattern", { id, width: paso, height: paso, patternUnits: "userSpaceOnUse" }, svg.querySelector("defs") || svgEl("defs", {}, svg));
  svgEl("circle", { cx: paso / 2, cy: paso / 2, r, fill: "currentColor" }, p);
  return `url(#${id})`;
}

function marco(el, { titulo, columnas, filas }) {
  el.classList.add("viz", "viz2");
  el.innerHTML = `<div class="viz__cabeza"><b class="viz__titulo">${titulo}</b><button type="button" class="viz__tabla-boton" aria-pressed="false">Ver tabla</button></div>
    <div class="viz__lienzo"><div class="viz__tip papel" hidden></div></div>
    <div class="viz__tabla" hidden><table><thead><tr>${columnas.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${filas.map((f) => `<tr>${f.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const b = el.querySelector(".viz__tabla-boton");
  b.addEventListener("click", () => { const ver = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", ver); b.textContent = ver ? "Ver gráfica" : "Ver tabla"; el.querySelector(".viz__tabla").hidden = !ver; el.querySelector(".viz__lienzo").hidden = ver; });
  return { lienzo: el.querySelector(".viz__lienzo"), tip: el.querySelector(".viz__tip") };
}
const alVer = (el, fn) => { if (movimientoReducido()) return fn(true); const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(false); } }, { threshold: 0.35 }); io.observe(el); };
const alCambiarAncho = (el, fn) => { let w = el.clientWidth; new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 4) { w = el.clientWidth; fn(); } }).observe(el); };
function mostrarTip(tip, html, x, y, ancho) { tip.hidden = false; tip.innerHTML = html; const w = tip.offsetWidth; tip.style.left = Math.max(0, Math.min(x - w / 2, ancho - w)) + "px"; tip.style.top = Math.max(0, y - tip.offsetHeight - 14) + "px"; }

/** Barras horizontales con trama: más valor = trama más densa. Crecen desde la base al entrar. */
export function barrasTrama(el, items, { titulo, formato = String, unidad = "", destacar = 0 }) {
  const { lienzo, tip } = marco(el, { titulo, columnas: ["", unidad || "Valor"], filas: items.map((x) => [x.etiqueta, formato(x.valor)]) });
  let visto = false;
  const dibujar = () => {
    lienzo.querySelector("svg")?.remove();
    const W = lienzo.clientWidth, apilado = W < 480, fila = apilado ? 50 : 40, H = items.length * fila + 4, eti = apilado ? 0 : Math.min(200, W * 0.36), max = Math.max(...items.map((x) => x.valor));
    const s = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": titulo }); lienzo.prepend(s);
    items.forEach((x, i) => {
      const y = i * fila, w = Math.max(6, ((W - eti - 64) * x.valor) / max), yb = apilado ? y + 24 : y + 8, hb = apilado ? 18 : fila - 14;
      const g = svgEl("g", { class: `viz2__fila ${i < destacar ? "viz2__fila--destacada" : ""}`, style: `--i:${i}` }, s);
      svgEl("text", { x: 0, y: apilado ? y + 16 : y + fila / 2 + 5, class: "viz__eti" }, g).textContent = x.etiqueta;
      const barra = svgEl("g", { class: "viz2__barra", style: `--w:${w}px` }, g);
      svgEl("rect", { x: eti, y: yb, width: w, height: hb, rx: 5, class: "viz2__fondo" }, barra);
      svgEl("rect", { x: eti, y: yb, width: w, height: hb, rx: 5, class: "viz2__trama", fill: tramaValor(s, x.valor / max) }, barra);
      svgEl("rect", { x: eti + w - 4, y: yb, width: 4, height: hb, rx: 2, class: "viz2__canto" }, barra);
      svgEl("text", { x: eti + w + 10, y: yb + hb / 2 + 5, class: "viz__valor" }, g).textContent = formato(x.valor);
      svgEl("rect", { x: 0, y, width: W, height: fila, class: "viz__golpe" }, g).addEventListener("pointermove", () => mostrarTip(tip, `<b>${x.etiqueta}</b><span>${formato(x.valor)}${unidad ? " " + unidad : ""}</span>`, eti + w / 2, yb, W));
    });
    s.addEventListener("pointerleave", () => (tip.hidden = true));
    s.classList.toggle("viz2--visto", visto);
  };
  alCambiarAncho(lienzo, dibujar); dibujar();
  alVer(el, () => { visto = true; el.querySelector("svg")?.classList.add("viz2--visto"); });
}

/** Línea que se dibuja al entrar, área con grano, cursor de lectura con lupa y anotaciones narrativas.
    series: [{ nombre, valores, color }] · anotaciones: [{ i, texto }] */
export function lineaViva(el, { etiquetas, series }, { titulo, formato = String, formatoEje = formato, anotaciones = [] }) {
  const { lienzo, tip } = marco(el, { titulo, columnas: ["", ...series.map((s) => s.nombre)], filas: etiquetas.map((e, i) => [e, ...series.map((s) => formato(s.valores[i]))]) });
  el.insertAdjacentHTML("beforeend", `<div class="viz__leyenda">${series.map((s, k) => `<span><i class="viz2__muestra ${k ? "viz2__muestra--tenue" : ""}" style="background:var(${s.color})"></i>${s.nombre}</span>`).join("")}</div>`);
  let visto = false;
  const dibujar = () => {
    lienzo.querySelector("svg")?.remove();
    const W = lienzo.clientWidth, H = 280, m = { i: 54, d: 18, a: 34, b: 30 }, todos = series.flatMap((s) => s.valores);
    const min = 0, max = Math.max(...todos) * 1.08, x = (i) => m.i + ((W - m.i - m.d) * i) / (etiquetas.length - 1), y = (v) => m.a + (H - m.a - m.b) * (1 - (v - min) / (max - min));
    const s = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": titulo }); lienzo.prepend(s);
    const defs = svgEl("defs", {}, s), gid = `ga${++n}`;
    const grad = svgEl("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); grad.innerHTML = `<stop offset="0" style="stop-color:var(${series[0].color})" stop-opacity=".24"/><stop offset="1" style="stop-color:var(${series[0].color})" stop-opacity="0"/>`;
    [0, 0.25, 0.5, 0.75, 1].forEach((k) => { const v = min + (max - min) * k; svgEl("line", { x1: m.i, x2: W - m.d, y1: y(v), y2: y(v), class: "viz__grilla" }, s); svgEl("text", { x: m.i - 10, y: y(v) + 4, class: "viz__eje", "text-anchor": "end" }, s).textContent = formatoEje(v); });
    etiquetas.forEach((e, i) => { if (W < 520 && i % 2) return; svgEl("text", { x: x(i), y: H - 8, class: "viz__eje", "text-anchor": "middle" }, s).textContent = e; });
    series.slice().reverse().forEach((se, kk) => {
      const k = series.length - 1 - kk, d = se.valores.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join(" ");
      const g = svgEl("g", { class: `viz2__serie ${k ? "viz2__serie--tenue" : ""}`, style: `color:var(${se.color})` }, s);
      if (!k) svgEl("path", { d: `${d} L${x(se.valores.length - 1)} ${y(min)} L${x(0)} ${y(min)} Z`, fill: `url(#${gid})`, class: "viz2__area" }, g);
      svgEl("path", { d, class: "viz2__linea", pathLength: 1 }, g);
    });
    // anotaciones: un punto, una línea y una frase
    anotaciones.forEach((a, k) => {
      const v = series[0].valores[a.i], ax = x(a.i), ay = y(v), g = svgEl("g", { class: "viz2__nota", style: `--k:${k}` }, s), arriba = ay > H / 2;
      svgEl("line", { x1: ax, y1: ay, x2: ax, y2: arriba ? ay - 46 : ay + 46, class: "viz2__nota-linea" }, g);
      svgEl("circle", { cx: ax, cy: ay, r: 5, class: "viz2__nota-punto" }, g);
      svgEl("text", { x: ax + (ax > W * 0.7 ? -8 : 8), y: arriba ? ay - 50 : ay + 60, "text-anchor": ax > W * 0.7 ? "end" : "start", class: "viz2__nota-texto" }, g).textContent = a.texto;
    });
    // cursor de lectura con lupa
    const cursor = svgEl("g", { class: "viz2__cursor" }, s);
    svgEl("line", { y1: m.a - 6, y2: H - m.b, class: "viz2__cursor-linea" }, cursor);
    const lupas = series.map((se, k) => svgEl("circle", { r: k ? 5 : 9, class: `viz2__lupa ${k ? "viz2__lupa--tenue" : ""}`, style: `color:var(${se.color})` }, cursor));
    const zona = svgEl("rect", { x: m.i, y: 0, width: W - m.i - m.d, height: H, class: "viz__golpe" }, s);
    const leer = (cx) => {
      const i = Math.max(0, Math.min(etiquetas.length - 1, Math.round(((cx - m.i) / (W - m.i - m.d)) * (etiquetas.length - 1))));
      cursor.setAttribute("transform", `translate(${x(i)} 0)`); cursor.classList.add("visible");
      lupas.forEach((l, k) => l.setAttribute("cy", y(series[k].valores[i])));
      mostrarTip(tip, `<b>${etiquetas[i]}</b>${series.map((se) => `<span><i style="background:var(${se.color})"></i>${se.nombre}: ${formato(se.valores[i])}</span>`).join("")}`, x(i), y(series[0].valores[i]) - 10, W);
    };
    zona.addEventListener("pointermove", (e) => { const b = s.getBoundingClientRect(); leer((e.clientX - b.left) * (W / b.width)); });
    zona.addEventListener("pointerleave", () => { cursor.classList.remove("visible"); tip.hidden = true; });
    s.classList.toggle("viz2--visto", visto);
  };
  alCambiarAncho(lienzo, dibujar); dibujar();
  alVer(el, () => { visto = true; el.querySelector("svg")?.classList.add("viz2--visto"); });
}

/** Antes / después: un control lleva cada barra de su valor «antes» a su valor «después»; lo recuperado queda en trama.
    items: [{ etiqueta, antes, despues }] */
export function antesDespuesBarras(el, items, { titulo, formato = String }) {
  const { lienzo } = marco(el, { titulo, columnas: ["", "Antes", "Después"], filas: items.map((x) => [x.etiqueta, formato(x.antes), formato(x.despues)]) });
  lienzo.insertAdjacentHTML("beforebegin", `<label class="ad2__control"><span class="rotulo">Antes</span><input type="range" min="0" max="100" value="0" data-propio aria-label="De antes a después"><span class="rotulo">Después</span><output class="ad2__total" aria-live="polite"></output></label>`);
  const r = el.querySelector(".ad2__control input"), total = el.querySelector(".ad2__total");
  let k = 0;
  const dibujar = () => {
    lienzo.querySelector("svg")?.remove();
    const W = lienzo.clientWidth, apilado = W < 480, fila = apilado ? 50 : 40, H = items.length * fila + 4, eti = apilado ? 0 : Math.min(190, W * 0.34), max = Math.max(...items.map((x) => x.antes)), ancho = (v) => Math.max(6, ((W - eti - 70) * v) / max);
    const s = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": titulo }); lienzo.prepend(s);
    const defs = svgEl("defs", {}, s), id = `rec${++n}`;
    const p = svgEl("pattern", { id, width: 5, height: 5, patternUnits: "userSpaceOnUse" }, defs); svgEl("circle", { cx: 2.5, cy: 2.5, r: 1.3, class: "ad2__trama" }, p);
    items.forEach((x, i) => {
      const y = i * fila, yb = apilado ? y + 24 : y + 8, hb = apilado ? 18 : fila - 14, v = x.antes + (x.despues - x.antes) * k;
      svgEl("text", { x: 0, y: apilado ? y + 16 : y + fila / 2 + 5, class: "viz__eti" }, s).textContent = x.etiqueta;
      svgEl("rect", { x: eti, y: yb, width: ancho(x.antes), height: hb, rx: 5, class: "ad2__antes" }, s);
      svgEl("rect", { x: eti + ancho(v), y: yb, width: Math.max(0, ancho(x.antes) - ancho(v)), height: hb, class: "ad2__recuperado", fill: `url(#${id})` }, s);
      svgEl("rect", { x: eti, y: yb, width: ancho(v), height: hb, rx: 5, class: "ad2__ahora" }, s);
      svgEl("text", { x: eti + ancho(x.antes) + 8, y: yb + hb / 2 + 5, class: "viz__valor" }, s).textContent = k > 0.02 ? `${formato(Math.round(v))} · −${formato(Math.round(x.antes - v))}` : formato(x.antes);
    });
    const ahorro = items.reduce((a, x) => a + (x.antes - (x.antes + (x.despues - x.antes) * k)), 0);
    total.textContent = k > 0.02 ? `${Math.round(ahorro)} h recuperadas por semana` : "";
  };
  r.addEventListener("input", () => { k = +r.value / 100; r.style.setProperty("--p", r.value + "%"); dibujar(); });
  alCambiarAncho(lienzo, dibujar); dibujar();
  // al verse, se muestra el «después» una vez, lento, para que se entienda qué hace el control
  alVer(el, (reducido) => {
    if (reducido) return;
    const t0 = performance.now(), paso = (ahora) => { const q = Math.min(1, (ahora - t0) / 2200), e = 1 - Math.pow(1 - q, 3); k = e; r.value = e * 100; r.style.setProperty("--p", e * 100 + "%"); dibujar(); if (q < 1) requestAnimationFrame(paso); };
    setTimeout(() => requestAnimationFrame(paso), 600);
  });
}

/** Barra apilada al 100 % con textura por categoría (se distingue sin color). partes: [[nombre, %], …] (máx. 4) */
export function apiladaTextura(el, partes, { titulo }) {
  const { lienzo } = marco(el, { titulo, columnas: ["Canal", "%"], filas: partes.map(([a, b]) => [a, b + " %"]) });
  const s = svgEl("svg", { viewBox: "0 0 600 70", class: "apilada", role: "img", "aria-label": `${titulo}: ${partes.map(([a, b]) => `${a} ${b} %`).join(", ")}` });
  const tx = texturas(s), tipos = ["solido", "diagonal", "puntos", "cruz"];
  let x = 0;
  partes.forEach(([nombre, v], i) => {
    const w = (600 * v) / 100 - 2, g = svgEl("g", { class: "apilada__parte", style: `color:var(--serie-${i + 1});--i:${i}` }, s);
    svgEl("rect", { x, y: 8, width: w, height: 40, rx: 6, class: "apilada__fondo" }, g);
    if (tipos[i] !== "solido") svgEl("rect", { x, y: 8, width: w, height: 40, rx: 6, fill: tx(tipos[i]), class: "apilada__textura" }, g);
    x += w + 2;
  });
  lienzo.prepend(s);
  el.insertAdjacentHTML("beforeend", `<div class="viz__leyenda">${partes.map(([a, b], i) => `<span><i class="apilada__muestra apilada__muestra--${tipos[i]}" style="color:var(--serie-${i + 1})"></i>${a} · ${b} %</span>`).join("")}</div>`);
}
