/* Gráficas SVG de la marca: marcas delgadas, extremos redondeados de 4 px, separación de 2 px, ejes discretos,
   tooltip al pasar el mouse, leyenda + etiquetas directas, y siempre una vista de tabla. Colores = tokens --serie-n. */
const NS = "http://www.w3.org/2000/svg";

function base(el, { titulo, filas, columnas, formato }) {
  el.classList.add("viz");
  el.innerHTML = `<div class="viz__cabeza"><b class="viz__titulo">${titulo}</b>
      <button type="button" class="viz__tabla-boton" aria-pressed="false">Ver tabla</button></div>
    <div class="viz__lienzo"><div class="viz__tip" hidden></div></div>
    <div class="viz__tabla" hidden><table><thead><tr>${columnas.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${filas.map((f) => `<tr>${f.map((v, i) => `<td>${i && typeof v === "number" ? formato(v) : v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const b = el.querySelector(".viz__tabla-boton");
  b.addEventListener("click", () => {
    const ver = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", ver); b.textContent = ver ? "Ver gráfica" : "Ver tabla";
    el.querySelector(".viz__tabla").hidden = !ver; el.querySelector(".viz__lienzo").hidden = ver;
  });
  return { lienzo: el.querySelector(".viz__lienzo"), tip: el.querySelector(".viz__tip") };
}
const svgEl = (tag, attrs, padre) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); padre?.appendChild(e); return e; };
function tip(tipEl, html, x, y, ancho) {
  tipEl.hidden = false; tipEl.innerHTML = html;
  const w = tipEl.offsetWidth;
  tipEl.style.left = Math.max(0, Math.min(x - w / 2, ancho - w)) + "px"; tipEl.style.top = Math.max(0, y - tipEl.offsetHeight - 12) + "px";
}
function escalaBonita(max, n = 4) {
  const paso0 = max / n, mag = 10 ** Math.floor(Math.log10(paso0)), r = paso0 / mag;
  const paso = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
  return { tope: Math.ceil(max / paso) * paso, paso };
}
function alCambiarAncho(el, dibujar) { let w = 0; const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 4) { w = el.clientWidth; dibujar(); } }); ro.observe(el); }

/** Barras horizontales de magnitud (una serie, un tono). items: [{ etiqueta, valor }] ordenados. */
export function barras(el, items, { titulo, formato = String, unidad = "" }) {
  const { lienzo, tip: t } = base(el, { titulo, filas: items.map((x) => [x.etiqueta, x.valor]), columnas: ["", unidad || "Valor"], formato });
  const dibujar = () => {
    lienzo.querySelector("svg")?.remove();
    // en angosto la etiqueta va arriba de la barra (no se monta ni se corta)
    const W = lienzo.clientWidth, apilado = W < 480, fila = apilado ? 46 : 34, H = items.length * fila, eti = apilado ? 0 : Math.min(190, W * 0.38), max = Math.max(...items.map((x) => x.valor));
    const s = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": titulo }, null);
    lienzo.prepend(s);
    items.forEach((x, i) => {
      const y = i * fila, w = Math.max(4, ((W - eti - 70) * x.valor) / max);
      const yb = apilado ? y + 24 : y + 8, hb = apilado ? 14 : fila - 16;
      const g = svgEl("g", { class: "viz__fila" }, s);
      svgEl("text", { x: 0, y: apilado ? y + 15 : y + fila / 2 + 5, class: "viz__eti" }, g).textContent = x.etiqueta;
      svgEl("rect", { x: eti, y: yb, width: w, height: hb, rx: 4, class: "viz__barra", style: `fill:var(${x.color || "--magnitud"})` }, g);
      svgEl("text", { x: eti + w + 8, y: yb + hb / 2 + 4.5, class: "viz__valor" }, g).textContent = formato(x.valor);
      svgEl("rect", { x: 0, y, width: W, height: fila, class: "viz__golpe" }, g)
        .addEventListener("pointermove", () => tip(t, `<b>${x.etiqueta}</b><span>${formato(x.valor)}${unidad ? " " + unidad : ""}</span>`, eti + w / 2, yb, W));
    });
    s.addEventListener("pointerleave", () => (t.hidden = true));
  };
  alCambiarAncho(lienzo, dibujar); dibujar();
}

/** Línea en el tiempo, 1–4 series en un solo eje. series: [{ nombre, valores, color: "--serie-1", tenue }] */
export function linea(el, { etiquetas, series }, { titulo, formato = String, formatoEje = formato }) {
  const { lienzo, tip: t } = base(el, { titulo, filas: etiquetas.map((e, i) => [e, ...series.map((s) => s.valores[i])]), columnas: ["", ...series.map((s) => s.nombre)], formato });
  el.insertAdjacentHTML("beforeend", `<div class="viz__leyenda">${series.map((s) => `<span><i style="background:var(${s.color})${s.tenue ? ";opacity:.55" : ""}"></i>${s.nombre}</span>`).join("")}</div>`);
  const dibujar = () => {
    lienzo.querySelector("svg")?.remove();
    const W = lienzo.clientWidth, H = 260, m = { i: 64, d: 72, a: 14, b: 30 };
    const max = Math.max(...series.flatMap((s) => s.valores)), { tope, paso } = escalaBonita(max);
    const X = (i) => m.i + (i * (W - m.i - m.d)) / (etiquetas.length - 1), Y = (v) => m.a + (H - m.a - m.b) * (1 - v / tope);
    const s = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": titulo }, null);
    lienzo.prepend(s);
    for (let v = 0; v <= tope; v += paso) {
      svgEl("line", { x1: m.i, x2: W - m.d, y1: Y(v), y2: Y(v), class: "viz__grilla" }, s);
      svgEl("text", { x: m.i - 10, y: Y(v) + 4, class: "viz__eje", "text-anchor": "end" }, s).textContent = formatoEje(v);
    }
    etiquetas.forEach((e, i) => { if (W > 520 || i % 2 === 0) svgEl("text", { x: X(i), y: H - 8, class: "viz__eje", "text-anchor": "middle" }, s).textContent = e; });
    series.slice().reverse().forEach((se) => {
      svgEl("path", { d: se.valores.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(""), class: "viz__linea", style: `stroke:var(${se.color})${se.tenue ? ";opacity:.55;stroke-dasharray:5 5" : ""}` }, s);
      const u = se.valores.length - 1;
      svgEl("circle", { cx: X(u), cy: Y(se.valores[u]), r: 4.5, class: "viz__marca", style: `fill:var(${se.color})` }, s);
      svgEl("text", { x: X(u) + 10, y: Y(se.valores[u]) + 4, class: "viz__valor" }, s).textContent = formatoEje(se.valores[u]);
    });
    const cruz = svgEl("line", { y1: m.a, y2: H - m.b, class: "viz__cruz", visibility: "hidden" }, s);
    const puntos = series.map((se) => svgEl("circle", { r: 5, class: "viz__marca", style: `fill:var(${se.color})`, visibility: "hidden" }, s));
    const golpe = svgEl("rect", { x: m.i, y: 0, width: W - m.i - m.d, height: H, class: "viz__golpe" }, s);
    golpe.addEventListener("pointermove", (ev) => {
      const r = s.getBoundingClientRect(), x = ((ev.clientX - r.left) / r.width) * W;
      const i = Math.max(0, Math.min(etiquetas.length - 1, Math.round(((x - m.i) / (W - m.i - m.d)) * (etiquetas.length - 1))));
      cruz.setAttribute("x1", X(i)); cruz.setAttribute("x2", X(i)); cruz.setAttribute("visibility", "visible");
      puntos.forEach((p, k) => { p.setAttribute("cx", X(i)); p.setAttribute("cy", Y(series[k].valores[i])); p.setAttribute("visibility", "visible"); });
      tip(t, `<b>${etiquetas[i]}</b>${series.map((se) => `<span><i style="background:var(${se.color})"></i>${se.nombre}: ${formato(se.valores[i])}</span>`).join("")}`, X(i), Y(Math.max(...series.map((se) => se.valores[i]))), W);
    });
    golpe.addEventListener("pointerleave", () => { t.hidden = true; cruz.setAttribute("visibility", "hidden"); puntos.forEach((p) => p.setAttribute("visibility", "hidden")); });
  };
  alCambiarAncho(lienzo, dibujar); dibujar();
}

/** Dona de composición (≤ 4 partes, colores en orden fijo) con número héroe al centro. partes: [[nombre, valor]] */
export function dona(el, partes, { titulo, centro = "", subcentro = "", formato = (v) => v + " %" }) {
  const { lienzo, tip: t } = base(el, { titulo, filas: partes, columnas: ["", "Participación"], formato });
  const total = partes.reduce((s, [, v]) => s + v, 0);
  const R = 92, r = 62, C = 110;
  const s = svgEl("svg", { viewBox: "0 0 220 220", class: "viz__dona", role: "img", "aria-label": titulo }, null);
  let a0 = -Math.PI / 2;
  const hueco = 0.025; // separación entre segmentos
  partes.forEach(([n, v], i) => {
    const a1 = a0 + (v / total) * Math.PI * 2;
    const [p, q] = [a0 + hueco / 2, a1 - hueco / 2];
    const punto = (rad, a) => `${C + rad * Math.cos(a)},${C + rad * Math.sin(a)}`;
    const largo = q - p > Math.PI ? 1 : 0;
    const d = `M${punto(R, p)} A${R},${R} 0 ${largo} 1 ${punto(R, q)} L${punto(r, q)} A${r},${r} 0 ${largo} 0 ${punto(r, p)} Z`;
    svgEl("path", { d, class: "viz__segmento", style: `fill:var(--serie-${i + 1})` }, s)
      .addEventListener("pointermove", () => tip(t, `<b>${n}</b><span>${formato(v)}</span>`, (C + 105 * Math.cos((p + q) / 2)) * (lienzo.clientWidth > 300 ? 1 : 1), 110 + 105 * Math.sin((p + q) / 2), lienzo.clientWidth));
    a0 = a1;
  });
  svgEl("text", { x: C, y: C + 4, class: "viz__centro", "text-anchor": "middle" }, s).textContent = centro;
  svgEl("text", { x: C, y: C + 26, class: "viz__subcentro", "text-anchor": "middle" }, s).textContent = subcentro;
  s.addEventListener("pointerleave", () => (t.hidden = true));
  lienzo.classList.add("viz__lienzo--dona");
  lienzo.prepend(s);
  lienzo.insertAdjacentHTML("beforeend", `<ul class="viz__leyenda viz__leyenda--lista">${partes.map(([n, v], i) => `<li><i style="background:var(--serie-${i + 1})"></i><span>${n}</span><b>${formato(v)}</b></li>`).join("")}</ul>`);
}

/** Número héroe: un solo dato importante, sin gráfica. */
export const heroe = ({ rotulo, valor, variacion = null, nota = "" }) => `<div class="heroe">
  <span class="rotulo">${rotulo}</span><b class="heroe__valor">${valor}</b>
  ${variacion !== null ? `<span class="variacion ${variacion >= 0 ? "variacion--sube" : "variacion--baja"}">${variacion >= 0 ? "▲" : "▼"} ${Math.abs(variacion * 100).toLocaleString("es-CL", { maximumFractionDigits: 1 })} %</span>` : ""}
  ${nota ? `<span class="chico">${nota}</span>` : ""}</div>`;
