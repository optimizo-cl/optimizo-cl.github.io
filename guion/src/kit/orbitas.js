/* Órbitas: el lenguaje de diagramas de Optimizo (reemplaza a «flujos y nodos»).
   - Nodos: discos con agujero (el idioma del isotipo). Tamaño = importancia; anillo exterior = estado (lleno, medio, vacío).
   - Conexiones: arcos orbitales; los datos son puntos que viajan por ellos.
   - Tres modos: sistema (todo orbita un centro), proceso (una pista con estaciones), antesDespues (caos → anillos).
   - Pasar sobre un nodo muestra su ficha; clic traza su ruta; un control de tiempo adelanta o retrocede. */
import { movimientoReducido } from "./escenas/vigia.js";

const NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}, padre) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); padre?.appendChild(e); return e; };
const ESTADO = { lleno: 1, medio: 0.5, vacio: 0 };

function nodoSVG(padre, { x, y, r, nombre, estado = "lleno", tono = "", centro = false, id }) {
  const g = el("g", { class: `orb-nodo ${centro ? "orb-nodo--centro" : ""} ${tono ? "orb-nodo--" + tono : ""}`, transform: `translate(${x} ${y})`, tabindex: 0, role: "button", "aria-label": `${nombre}${centro ? "" : `, estado ${estado}`}`, "data-id": id }, padre);
  el("circle", { r: r + 6, class: "orb-nodo__halo" }, g);
  const c = 2 * Math.PI * (r + 4);
  el("circle", { r: r + 4, class: "orb-nodo__estado", "stroke-dasharray": `${c * ESTADO[estado]} ${c}`, transform: "rotate(-90)" }, g);
  el("circle", { r, class: "orb-nodo__disco" }, g);
  el("circle", { r: r * 0.3, class: "orb-nodo__hueco" }, g);
  const t = el("text", { y: r + 20, "text-anchor": "middle", class: "orb-nodo__nombre" }, g); t.textContent = nombre;
  return g;
}

function arco(x1, y1, x2, y2, curva = 0.22) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
  return `M${x1} ${y1} Q ${mx - dy * curva} ${my + dx * curva} ${x2} ${y2}`;
}

/** Diagrama de sistema. datos: { centro: {nombre, ficha}, nodos: [{ id, nombre, peso 1-3, estado, ficha, enlaces: [ids] }] } */
export function sistema(svg, datos, { alFicha = () => {} } = {}) {
  svg.setAttribute("viewBox", "0 0 640 460"); svg.classList.add("orb");
  const C = { x: 320, y: 230 };
  const capas = { orbitas: el("g", {}, svg), arcos: el("g", { class: "orb-arcos" }, svg), datos: el("g", { class: "orb-datos" }, svg), nodos: el("g", {}, svg) };
  [120, 190].forEach((r) => el("ellipse", { cx: C.x, cy: C.y, rx: r * 1.25, ry: r * 0.86, class: "orb-orbita" }, capas.orbitas));
  const pos = new Map([["centro", { ...C, r: 34 }]]);
  datos.nodos.forEach((n, i) => {
    const anillo = n.peso >= 2 ? 120 : 190, enAnillo = datos.nodos.filter((m) => (m.peso >= 2 ? 120 : 190) === anillo), k = enAnillo.indexOf(n);
    const a = (k / enAnillo.length) * Math.PI * 2 - Math.PI / 2 + (anillo === 190 ? 0.4 : 0);
    pos.set(n.id, { x: C.x + Math.cos(a) * anillo * 1.25, y: C.y + Math.sin(a) * anillo * 0.86, r: 10 + n.peso * 5 });
  });
  const arcos = [];
  datos.nodos.forEach((n) => [...(n.enlaces || ["centro"])].forEach((dest) => {
    const a = pos.get(n.id), b = pos.get(dest); if (!b) return;
    const p = el("path", { d: arco(a.x, a.y, b.x, b.y), class: "orb-arco", "data-de": n.id, "data-a": dest }, capas.arcos);
    const punto = el("circle", { r: 3.5, class: "orb-dato" }, capas.datos);
    arcos.push({ p, punto, de: n.id, a: dest, fase: Math.random() });
  }));
  const g0 = nodoSVG(capas.nodos, { ...pos.get("centro"), nombre: datos.centro.nombre, centro: true, id: "centro" });
  const gs = [g0, ...datos.nodos.map((n) => nodoSVG(capas.nodos, { ...pos.get(n.id), nombre: n.nombre, estado: n.estado, tono: n.tono, id: n.id }))];
  const fichaDe = (id) => (id === "centro" ? datos.centro : datos.nodos.find((n) => n.id === id));
  // ruta: el nodo, sus arcos y los nodos que toca
  const trazar = (id) => {
    svg.classList.toggle("orb--ruta", !!id);
    const tocados = new Set([id]);
    arcos.forEach((r) => { const si = id && (r.de === id || r.a === id); r.p.classList.toggle("en-ruta", si); r.punto.classList.toggle("en-ruta", si); if (si) { tocados.add(r.de); tocados.add(r.a); } });
    gs.forEach((g) => g.classList.toggle("en-ruta", !!id && tocados.has(g.dataset.id)));
  };
  let elegido = null;
  gs.forEach((g) => {
    const mostrar = () => alFicha(fichaDe(g.dataset.id), g.getBoundingClientRect());
    g.addEventListener("pointerenter", mostrar); g.addEventListener("focus", mostrar);
    g.addEventListener("pointerleave", () => alFicha(null)); g.addEventListener("blur", () => alFicha(null));
    const elegir = () => { elegido = elegido === g.dataset.id ? null : g.dataset.id; trazar(elegido); };
    g.addEventListener("click", elegir); g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(); } });
  });
  return motor(svg, (t) => arcos.forEach((r) => { const L = r.p.getTotalLength(), k = (t * 0.32 + r.fase) % 1, q = r.p.getPointAtLength(L * k); r.punto.setAttribute("cx", q.x); r.punto.setAttribute("cy", q.y); }));
}

/** Proceso: una pista con estaciones que el punto recorre. pasos: [{ nombre, dur (días), traba? }] */
export function proceso(svg, pasos, { alFicha = () => {} } = {}) {
  svg.setAttribute("viewBox", "0 0 640 220"); svg.classList.add("orb", "orb--proceso");
  const x0 = 50, x1 = 590, y = 110, n = pasos.length;
  const xs = pasos.map((_, i) => x0 + ((x1 - x0) * i) / (n - 1));
  const via = `M${x0} ${y} ` + xs.slice(1).map((x, i) => `Q ${(xs[i] + x) / 2} ${i % 2 ? y + 46 : y - 46} ${x} ${y}`).join(" ");
  el("path", { d: via, class: "orb-pista" }, svg);
  const lleno = el("path", { d: via, class: "orb-pista orb-pista--lleno", pathLength: 1 }, svg);
  const camino = el("path", { d: via, class: "orb-pista-guia" }, svg);
  const gs = pasos.map((p, i) => { const g = nodoSVG(svg, { x: xs[i], y, r: 14, nombre: p.nombre, estado: p.traba ? "medio" : "lleno", tono: p.traba ? "alerta" : "", id: String(i) }); g.addEventListener("pointerenter", () => alFicha(p, g.getBoundingClientRect())); g.addEventListener("focus", () => alFicha(p, g.getBoundingClientRect())); g.addEventListener("pointerleave", () => alFicha(null)); g.addEventListener("blur", () => alFicha(null)); return g; });
  const punto = el("circle", { r: 8, class: "orb-viajero" }, svg);
  const L = camino.getTotalLength();
  return motor(svg, (t) => {
    const k = (t * 0.09) % 1, q = camino.getPointAtLength(L * k);
    punto.setAttribute("cx", q.x); punto.setAttribute("cy", q.y);
    lleno.style.strokeDashoffset = 1 - k;
    gs.forEach((g, i) => g.classList.toggle("pasado", xs[i] <= q.x + 1));
  }, { periodo: 1 / 0.09 });
}

/** Antes / después: órbitas cruzadas (caos) que se ordenan en anillos. Se controla con orden(0–1). */
export function antesDespues(svg, { puntos = 90 } = {}) {
  svg.setAttribute("viewBox", "0 0 640 360"); svg.classList.add("orb", "orb--ad");
  const C = { x: 320, y: 180 };
  const centro = el("g", { transform: `translate(${C.x} ${C.y})` }, svg);
  el("circle", { r: 26, class: "orb-nodo__disco" }, centro); el("circle", { r: 8, class: "orb-nodo__hueco" }, centro);
  const anillos = [70, 110, 150].map((r) => el("ellipse", { cx: C.x, cy: C.y, rx: r * 1.4, ry: r * 0.8, class: "orb-orbita orb-orbita--orden" }, svg));
  const ps = Array.from({ length: puntos }, (_, i) => {
    const caos = { cx: C.x + (Math.random() - 0.5) * 520, cy: C.y + (Math.random() - 0.5) * 300, rx: 40 + Math.random() * 120, ry: 20 + Math.random() * 70, giro: Math.random() * Math.PI, vel: (Math.random() < 0.5 ? -1 : 1) * (0.2 + Math.random() * 0.5) };
    const anillo = [70, 110, 150][i % 3];
    return { c: el("circle", { r: i % 9 === 0 ? 4.5 : 2.6, class: i % 9 === 0 ? "orb-dato orb-dato--grande" : "orb-dato" }, svg), caos, anillo, fase: Math.random() * Math.PI * 2 };
  });
  let k = 0;
  const m = motor(svg, (t) => {
    const e = k * k * (3 - 2 * k);
    anillos.forEach((a) => (a.style.opacity = e));
    ps.forEach((p) => {
      const ac = p.fase + t * p.caos.vel, cg = Math.cos(p.caos.giro), sg = Math.sin(p.caos.giro);
      const xc = p.caos.cx + Math.cos(ac) * p.caos.rx * cg - Math.sin(ac) * p.caos.ry * sg, yc = p.caos.cy + Math.cos(ac) * p.caos.rx * sg + Math.sin(ac) * p.caos.ry * cg;
      const ao = p.fase + t * (0.5 * 70 / p.anillo), xo = C.x + Math.cos(ao) * p.anillo * 1.4, yo = C.y + Math.sin(ao) * p.anillo * 0.8;
      p.c.setAttribute("cx", xc + (xo - xc) * e); p.c.setAttribute("cy", yc + (yo - yc) * e);
    });
  });
  return { ...m, orden(v) { k = Math.max(0, Math.min(1, v)); m.redibujar(); } };
}

/* Motor común: reloj propio que se puede pausar, adelantar y llevar a un instante (control de tiempo). */
function motor(svg, cuadro, { periodo = 12 } = {}) {
  let t = 0, prev = 0, corriendo = !movimientoReducido(), raf = 0, visible = false, velocidad = 1;
  const tic = (ahora) => { raf = 0; const dt = prev ? Math.min(0.05, (ahora - prev) / 1000) : 0; prev = ahora; if (corriendo) t += dt * velocidad; cuadro(t); if (visible && corriendo) raf = requestAnimationFrame(tic); };
  const pedir = () => { if (!raf) { prev = 0; raf = requestAnimationFrame(tic); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) pedir(); }).observe(svg);
  cuadro(0);
  return {
    get t() { return t; }, periodo,
    pausa(si = !corriendo) { corriendo = !si; if (corriendo) pedir(); return !corriendo; },
    ir(nuevo) { t = Math.max(0, nuevo); cuadro(t); },
    velocidad(v) { velocidad = v; },
    redibujar() { cuadro(t); },
  };
}
