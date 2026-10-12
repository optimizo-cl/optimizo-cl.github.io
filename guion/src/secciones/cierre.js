/* Cierre del guion, espejo de la portada: al empezar, el punto sale por la mordida; acá vuelve a su nido.
   El punto del isotipo mide lo mismo que el hueco del centro (r 17,29), así que al volver el disco queda entero. */
import { isotipo, PUNTO, CENTRO } from "../kit/marca.js?v=7a04113";
import { movimientoReducido } from "../kit/escenas/vigia.js?v=7a04113";

export function cierreHTML() {
  return `<footer class="cierre" id="cierre" aria-labelledby="cierre-t">
    <div class="envoltura cierre__dentro">
      <div class="cierre__iso" aria-hidden="true">${isotipo({ clase: "cierre__isotipo", titulo: "" })}</div>
      <div class="cierre__texto"><p class="ceja">Fin del guion</p><h2 class="cierre__frase" id="cierre-t">Todo proceso tiene una salida.</h2>
        <p class="bajada">El punto salió por la mordida al empezar. Acá vuelve a su nido: todo en orden, funcionando.</p>
        <div class="fila-botones"><a class="boton boton--acento boton--l" href="assets/descargas/optimizo-marca.zip" download>Descargar la marca</a>
          <button type="button" class="boton boton--secundario boton--l" data-cierre-presentar>Presentar el guion</button>
          <a class="cierre__volver" href="#portada">Volver al inicio ↑</a></div></div>
    </div>
    <p class="rotulo cierre__pie">Optimizo · guion visual v2</p></footer>`;
}

export function activarCierre(el) {
  const punto = el.querySelector(".cierre__isotipo .isotipo__punto"), dx = CENTRO.cx - PUNTO.cx, dy = CENTRO.cy - PUNTO.cy;
  el.querySelector("[data-cierre-presentar]").addEventListener("click", () => document.querySelector("[data-presentar]")?.click());
  const poner = (e, alto = 0) => punto.setAttribute("transform", `translate(${(dx * e).toFixed(2)} ${(dy * e - alto).toFixed(2)})`);
  if (movimientoReducido()) { poner(1); el.classList.add("en-nido"); return; }
  let raf = 0;
  const volver = () => {
    cancelAnimationFrame(raf); el.classList.remove("en-nido"); poner(0);
    const t0 = performance.now() + 500, dur = 1500;
    const f = (ahora) => { const q = Math.max(0, Math.min(1, (ahora - t0) / dur)), e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      poner(e, 46 * 4 * e * (1 - e)); if (q < 1) raf = requestAnimationFrame(f); else el.classList.add("en-nido"); };
    raf = requestAnimationFrame(f);
  };
  new IntersectionObserver(([e]) => { if (e.isIntersecting) volver(); }, { threshold: 0.5 }).observe(el.querySelector(".cierre__iso"));
}
