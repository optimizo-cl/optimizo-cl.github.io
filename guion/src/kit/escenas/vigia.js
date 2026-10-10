/* Presupuesto de las escenas: nada se dibuja fuera de pantalla y el movimiento reducido se respeta.
   bucle(el, cuadro, { fps }) llama cuadro(t_segundos, dt) solo mientras el elemento se ve. */
export const movimientoReducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function bucle(el, cuadro, { fps = 60 } = {}) {
  let id = 0, visible = false, ultimo = 0, t = 0, previo = 0;
  const paso = 1000 / fps;
  const tic = (ahora) => {
    id = requestAnimationFrame(tic);
    if (ahora - ultimo < paso - 1) return;
    const dt = previo ? Math.min((ahora - previo) / 1000, 0.1) : 0;
    previo = ahora; ultimo = ahora; t += dt;
    cuadro(t, dt);
  };
  const arrancar = () => { if (!id && !movimientoReducido()) { previo = 0; id = requestAnimationFrame(tic); } };
  const parar = () => { cancelAnimationFrame(id); id = 0; };
  const obs = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? arrancar() : parar(); }, { rootMargin: "120px" });
  obs.observe(el);
  cuadro(0, 0); // siempre un cuadro (también con movimiento reducido)
  return { parar: () => { parar(); obs.disconnect(); }, visible: () => visible };
}

/** Avisa cuando cambian la paleta o el tema (para escenas que leen colores). */
export function alCambiarPaleta(fn) {
  const obs = new MutationObserver(() => fn());
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-paleta", "data-tema"] });
  return () => obs.disconnect();
}

/** Lee un color de los tokens como [r,g,b] en 0–1. */
export function rgbDe(variable) {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(variable).trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}
