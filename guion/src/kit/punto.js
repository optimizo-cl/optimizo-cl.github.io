/* El punto: la firma de Optimizo convertida en piezas reutilizables (carga, progreso, listo, cursor). */
import { isotipo } from "./marca.js";

/** Carga chica: el punto orbita un anillo. tam en px. Para botones y líneas de texto. */
export function carga({ tam = 20, etiqueta = "Cargando" } = {}) {
  return `<span class="carga" style="--tam:${tam}px" role="status" aria-label="${etiqueta}">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle class="carga__anillo" cx="12" cy="12" r="8"/>
      <g class="carga__orbita"><circle class="carga__punto" cx="12" cy="4" r="2.6"/></g></svg></span>`;
}

/** Carga de marca: el isotipo con el punto orbitando el disco. Si la espera se alarga, la órbita se abre. */
export function cargaMarca({ tam = 96, larga = false, etiqueta = "Cargando" } = {}) {
  return `<span class="carga-marca ${larga ? "carga-marca--larga" : ""}" style="--tam:${tam}px" role="status" aria-label="${etiqueta}">
    ${isotipo({ clase: "carga-marca__iso" })}</span>`;
}

/** Progreso por pasos: el punto viaja al paso actual y deja encendidos los anteriores. */
export function progreso(pasos, actual = 0) {
  return `<div class="progreso" style="--n:${pasos.length};--i:${actual}" data-actual="${actual}">
    <div class="progreso__via"><i class="progreso__lleno"></i><i class="progreso__punto"></i></div>
    <ol class="progreso__pasos">${pasos.map((p, i) => `<li class="${i < actual ? "hecho" : i === actual ? "actual" : ""}" ${i === actual ? 'aria-current="step"' : ""}>${p}</li>`).join("")}</ol>
  </div>`;
}
export function moverProgreso(el, i) {
  el.style.setProperty("--i", i); el.dataset.actual = i;
  el.querySelectorAll(".progreso__pasos li").forEach((li, k) => {
    li.className = k < i ? "hecho" : k === i ? "actual" : "";
    k === i ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current");
  });
}

/** Listo: el punto vuelve al disco y el disco respira una vez. */
export function listo({ tam = 72, texto = "Listo" } = {}) {
  return `<span class="listo" style="--tam:${tam}px" role="status">${isotipo({ clase: "listo__iso" })}<span class="listo__texto">${texto}</span></span>`;
}

/** Cursor del sistema con el punto (SVG). Lo dibuja el sistema operativo: cero latencia. */
export function cursorPunto(color = getComputedStyle(document.documentElement).getPropertyValue("--navy").trim()) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><circle cx='14' cy='14' r='7' fill='${color}' stroke='white' stroke-width='2'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 14 14, pointer`;
}
