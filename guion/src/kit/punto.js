/* El punto: la firma de Optimizo convertida en piezas reutilizables (carga, progreso, listo, cursor). */
import { isotipo, DISCO } from "./marca.js";

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

/** Carga que dibuja: el punto traza el contorno del isotipo; al cerrarlo, el disco se llena y el punto aterriza en su nido.
    Al montarla hay que poner en cero su reloj (sincronizarCargas) porque el punto usa SMIL y el trazo, CSS. */
export function cargaDibuja({ tam = 150, etiqueta = "Cargando" } = {}) {
  return `<svg class="m-dibuja" style="width:${tam}px" viewBox="0 0 138.305 138.305" role="img" aria-label="${etiqueta}"><g transform="translate(-6.054688 -2.601562)">
    <path class="m-dibuja__trazo" pathLength="1" d="${DISCO}"/><path class="m-dibuja__relleno" fill-rule="evenodd" d="${DISCO}"/>
    <circle class="m-dibuja__punto" r="7"><animateMotion dur="3.6s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.62;1" calcMode="spline" keySplines=".45 .05 .55 .95;0 0 1 1" path="${DISCO.split(" Z ")[0]} Z"/></circle>
    <circle class="m-dibuja__nido" cx="25.863" cy="22.754" r="17.289"/></g></svg>`;
}
export function sincronizarCargas(raiz) {
  raiz.querySelectorAll("svg.m-dibuja").forEach((s) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { s.querySelectorAll("animateMotion").forEach((a) => a.remove()); return; }
    s.setCurrentTime?.(0); s.getAnimations({ subtree: true }).forEach((a) => (a.currentTime = 0));
  });
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
