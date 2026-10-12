/* Coreografía: nada aparece sin entrada, todo lento y con llegada larga.
   - entrar(contenedor): cada hijo marcado (o los hijos directos) entra en cascada al verse.
   - progreso(el, fn): fn(p 0→1) mientras el elemento cruza la pantalla (solo cuando se ve).
   - abrirEnCirculo(el): revela con una máscara circular que nace de un punto.
   Con «reducir movimiento» todo aparece directo en su estado final. */
import { movimientoReducido } from "./escenas/vigia.js?v=8ed8960";

const entradas = new IntersectionObserver((lista) => lista.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("entro");
  entradas.unobserve(e.target);
}), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

/** Marca y observa los hijos de un contenedor para que entren en cascada. selector opcional. */
export function entrar(contenedor, selector = ":scope > *", { paso = 70, max = 10 } = {}) {
  const hijos = [...contenedor.querySelectorAll(selector)];
  hijos.forEach((h, i) => {
    if (h.classList.contains("entra")) return;
    h.classList.add("entra");
    h.style.setProperty("--i", Math.min(i, max));
    h.style.setProperty("--paso", paso + "ms");
    if (movimientoReducido()) h.classList.add("entro"); else entradas.observe(h);
  });
}

/** Llama fn(p) con el avance 0→1 del elemento por la pantalla (0 = entra por abajo, 1 = sale por arriba). */
export function progreso(el, fn) {
  let visible = false, raf = 0;
  const calc = () => {
    raf = 0;
    const r = el.getBoundingClientRect(), h = innerHeight;
    fn(Math.min(1, Math.max(0, (h - r.top) / (h + r.height))), r);
  };
  const pedir = () => { if (visible && !raf) raf = requestAnimationFrame(calc); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) pedir(); }).observe(el);
  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", pedir, { passive: true });
  calc();
}

/** Revela el elemento con un círculo que crece desde (x, y) en %. */
export function abrirEnCirculo(el, { x = 50, y = 50 } = {}) {
  el.style.setProperty("--cx", x + "%"); el.style.setProperty("--cy", y + "%");
  el.classList.add("circulo");
  if (movimientoReducido()) { el.classList.add("abierto"); return; }
  // un elemento recortado a 0 % no tiene área visible y el observador nunca lo ve: se observa un centinela hermano
  const centinela = document.createElement("i");
  centinela.className = "centinela"; centinela.setAttribute("aria-hidden", "true");
  el.before(centinela);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting || e.boundingClientRect.top < 0) { el.classList.add("abierto"); io.disconnect(); centinela.remove(); } }, { rootMargin: "0px 0px -30% 0px" });
  io.observe(centinela);
}

/** Cuenta un número hacia su valor final al verse (con el formato que se pase). */
export function contar(el, final, { duracion = 1400, formato = (v) => Math.round(v).toLocaleString("es-CL") } = {}) {
  if (movimientoReducido()) { el.textContent = formato(final); return; }
  el.textContent = formato(0);
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return; io.disconnect();
    const t0 = performance.now();
    const tic = (t) => { const k = Math.min(1, (t - t0) / duracion), s = 1 - Math.pow(1 - k, 4); el.textContent = formato(final * s); if (k < 1) requestAnimationFrame(tic); };
    requestAnimationFrame(tic);
  }, { threshold: 0.5 });
  io.observe(el);
}
