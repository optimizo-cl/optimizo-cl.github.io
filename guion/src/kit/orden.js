/* Del desorden al orden: las tareas de una empresa aparecen tiradas (giradas, encimadas, sin dueño) y, con un valor k
   de 0 a 1, cada una se desliza a su columna por área, recta, con su estado. Reemplaza a las órbitas de «caos → orden». */
import { estado } from "./avisos.js?v=aa26df1";

export const TAREAS_QUILLAY = {
  areas: ["Ventas", "Operaciones", "Finanzas"],
  tareas: [
    ["Cotización Minera", 0, "medio", "alerta"], ["Seguimiento Agrícola", 0, "vacio", "neutro"], ["Precios de octubre", 0, "lleno", "exito"],
    ["Pedido por WhatsApp", 1, "medio", "info"], ["Despacho a Requínoa", 1, "lleno", "exito"], ["Conteo bodega 2", 1, "medio", "alerta"],
    ["Factura en Bsale", 2, "lleno", "exito"], ["Cobranza vencida", 2, "vacio", "error"], ["Conciliación", 2, "medio", "info"],
  ],
};

export function orden(el, { areas, tareas } = TAREAS_QUILLAY) {
  el.classList.add("orden");
  el.innerHTML = `${areas.map((a, i) => `<span class="orden__area" style="--c:${i}">${a}</span>`).join("")}
    ${tareas.map(([t, a, f, tono], i) => `<div class="orden__tarea papel" style="--i:${i}" data-area="${a}">${estado(t, { forma: f, tono })}</div>`).join("")}`;
  const cards = [...el.querySelectorAll(".orden__tarea")], heads = [...el.querySelectorAll(".orden__area")];
  // desorden fijo (no aleatorio: se ve igual cada vez)
  const azar = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
  let caos = [], ordenado = [], k = 0;
  const medir = () => {
    const W = el.clientWidth, H = el.clientHeight, col = W / areas.length, cw = Math.min(col - 24, 280), ch = 46;
    heads.forEach((h, i) => { h.style.left = col * i + (col - cw) / 2 + "px"; h.style.width = cw + "px"; });
    const fila = [0, 0, 0];
    ordenado = cards.map((c, i) => { const a = +c.dataset.area, r = fila[a]++; return { x: col * a + (col - cw) / 2, y: 52 + r * (ch + 10), r: 0 }; });
    caos = cards.map((c, i) => ({ x: azar(i, 1) * (W - cw), y: 20 + azar(i, 2) * (H - ch - 40), r: (azar(i, 3) - 0.5) * 26 }));
    cards.forEach((c) => (c.style.width = cw + "px"));
    poner(k);
  };
  const suave = (x) => x * x * (3 - 2 * x);
  const poner = (v) => {
    k = v;
    cards.forEach((c, i) => {
      const a = caos[i], b = ordenado[i]; if (!a) return;
      const q = suave(Math.min(1, Math.max(0, (v - i * 0.035) / 0.68)));
      c.style.transform = `translate(${(a.x + (b.x - a.x) * q).toFixed(1)}px, ${(a.y + (b.y - a.y) * q).toFixed(1)}px) rotate(${(a.r * (1 - q)).toFixed(2)}deg)`;
      c.classList.toggle("en-su-lugar", q > 0.98);
    });
    heads.forEach((h) => (h.style.opacity = Math.min(1, Math.max(0, (v - 0.55) / 0.35))));
    el.style.setProperty("--k", v.toFixed(3));
  };
  new ResizeObserver(medir).observe(el); medir();
  return { orden: poner };
}
