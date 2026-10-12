/* Flujos y nodos: los sistemas de una empresa conectados. El punto (la firma) recorre un camino fuente → Medula →
   destino, encendiendo cada nodo a su paso. Diagrama SVG; en angosto se reorganiza en vertical (no se achica). */
import { bucle } from "./vigia.js?v=8ed8960";

export const RED_QUILLAY = {
  fuentes: [["crm", "CRM a medida"], ["wsp", "WhatsApp"], ["correo", "Correo"], ["planillas", "Planillas"]],
  centro: ["medula", "Medula", "memoria de la empresa"],
  destinos: [["comercial", "Agente comercial"], ["operaciones", "Agente de operaciones"], ["gerencia", "Panel de gerencia"]],
  // recorridos que hace el punto, en orden
  rutas: [["wsp", "comercial"], ["planillas", "operaciones"], ["crm", "gerencia"], ["correo", "comercial"]],
};

const NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}, padre) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); padre && padre.appendChild(e); return e; };

function disposicion(ancho, red) {
  const vertical = ancho < 700;
  const W = vertical ? 360 : 1000, H = vertical ? 620 : 440;
  const nodos = {};
  const nW = vertical ? 156 : 190, nH = 52;
  if (!vertical) {
    red.fuentes.forEach(([id, n], i) => (nodos[id] = { x: 40, y: 40 + i * 96, w: nW, h: nH, n, lado: "der" }));
    nodos[red.centro[0]] = { x: W / 2 - 110, y: H / 2 - 56, w: 220, h: 112, n: red.centro[1], sub: red.centro[2], centro: true };
    red.destinos.forEach(([id, n], i) => (nodos[id] = { x: W - 40 - nW - 20, y: 74 + i * 112, w: nW + 20, h: nH, n, lado: "izq" }));
  } else {
    red.fuentes.forEach(([id, n], i) => (nodos[id] = { x: 16 + (i % 2) * 172, y: 16 + Math.floor(i / 2) * 66, w: nW, h: nH, n }));
    nodos[red.centro[0]] = { x: W / 2 - 110, y: 262, w: 220, h: 96, n: red.centro[1], sub: red.centro[2], centro: true };
    red.destinos.forEach(([id, n], i) => (nodos[id] = { x: 50, y: 432 + i * 62, w: 260, h: nH - 4, n }));
  }
  const ancla = (o, salida) => vertical
    ? { x: o.x + o.w / 2, y: salida ? o.y + o.h : o.y }
    : { x: salida ? o.x + o.w : o.x, y: o.y + o.h / 2 };
  const curva = (a, b) => vertical
    ? `M${a.x},${a.y} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y}`
    : `M${a.x},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}`;
  return { W, H, nodos, ancla, curva, vertical };
}

export function flujos(contenedor, red = RED_QUILLAY) {
  let lay, svg, caminos = {}, punto, rastro, ultimoT = 0;
  const centro = red.centro[0];

  const armar = () => {
    contenedor.innerHTML = "";
    lay = disposicion(contenedor.clientWidth, red);
    svg = el("svg", { viewBox: `0 0 ${lay.W} ${lay.H}`, class: "flujos__svg", role: "img", "aria-label": "Los sistemas de la empresa conectados a Medula y a los agentes" }, contenedor);
    const gLineas = el("g", { class: "flujos__lineas" }, svg);
    caminos = {};
    const conectar = (de, a) => {
      const d = lay.curva(lay.ancla(lay.nodos[de], true), lay.ancla(lay.nodos[a], false));
      caminos[`${de}>${a}`] = el("path", { d, class: "flujos__linea" }, gLineas);
    };
    red.fuentes.forEach(([id]) => conectar(id, centro));
    red.destinos.forEach(([id]) => conectar(centro, id));
    rastro = el("path", { class: "flujos__rastro", d: "" }, svg);
    for (const [id, o] of Object.entries(lay.nodos)) {
      const g = el("g", { class: `flujos__nodo ${o.centro ? "flujos__nodo--centro" : ""}`, "data-id": id }, svg);
      el("rect", { x: o.x, y: o.y, width: o.w, height: o.h, rx: o.centro ? 20 : 14 }, g);
      el("circle", { cx: o.x + 20, cy: o.y + (o.centro ? 30 : o.h / 2), r: 4, class: "flujos__luz" }, g);
      const t = el("text", { x: o.x + 34, y: o.y + (o.centro ? 35 : o.h / 2 + 5) }, g); t.textContent = o.n;
      if (o.sub) { const s = el("text", { x: o.x + 34, y: o.y + 58, class: "flujos__sub" }, g); s.textContent = o.sub; }
      if (o.centro) { const s = el("text", { x: o.x + 34, y: o.y + o.h - 18, class: "flujos__sello" }, g); s.textContent = "de Optimizo"; }
    }
    punto = el("circle", { r: lay.vertical ? 7 : 8, class: "flujos__punto", cx: -50, cy: -50 }, svg);
  };
  armar();
  // al rearmar (cambio de ancho) se dibuja el cuadro actual de inmediato: el punto nunca queda fuera de lugar
  const ro = new ResizeObserver(() => { if (disposicion(contenedor.clientWidth, red).vertical !== lay.vertical) { armar(); cuadro(ultimoT); } });
  ro.observe(contenedor);

  // Cada ruta: 2 tramos de 2,2 s + pausas. Llegada suave en cada tramo.
  const TRAMO = 2.2, PAUSA = 0.7, RUTA = TRAMO * 2 + PAUSA * 3;
  const suave = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
  const encender = (ids) => svg.querySelectorAll(".flujos__nodo").forEach((g) => g.classList.toggle("activo", ids.includes(g.dataset.id)));
  const cuadro = (t) => {
    ultimoT = t;
    if (!svg.isConnected) return;
    const i = Math.floor(t / RUTA) % red.rutas.length, c = t % RUTA;
    const [de, a] = red.rutas[i];
    const p1 = caminos[`${de}>${centro}`], p2 = caminos[`${centro}>${a}`];
    let camino, k, encendidos;
    if (c < PAUSA) { camino = p1; k = 0; encendidos = [de]; }
    else if (c < PAUSA + TRAMO) { camino = p1; k = suave((c - PAUSA) / TRAMO); encendidos = [de]; }
    else if (c < PAUSA * 2 + TRAMO) { camino = p2; k = 0; encendidos = [de, centro]; }
    else if (c < PAUSA * 2 + TRAMO * 2) { camino = p2; k = suave((c - PAUSA * 2 - TRAMO) / TRAMO); encendidos = [de, centro]; }
    else { camino = p2; k = 1; encendidos = [de, centro, a]; }
    const L = camino.getTotalLength(), pt = camino.getPointAtLength(L * k);
    punto.setAttribute("cx", pt.x); punto.setAttribute("cy", pt.y);
    rastro.setAttribute("d", camino.getAttribute("d"));
    rastro.style.strokeDasharray = `${L * k} ${L}`;
    encender(encendidos);
  };
  const b = bucle(contenedor, cuadro, { fps: 60 });
  return { parar() { b.parar(); ro.disconnect(); } };
}
