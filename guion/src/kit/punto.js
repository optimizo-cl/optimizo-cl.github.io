/* El punto: la firma de Optimizo convertida en piezas reutilizables (carga, progreso, listo, cursor). */
import { isotipo, DISCO } from "./marca.js";

const PUNTO = { cx: 25.863281, cy: 22.753906, r: 17.289 };

/** Isotipo para cargas: disco y punto por separado (para animarlos), en coordenadas del PDF. */
const isoCarga = ({ clase, relleno = "", conTrazo = false, id = "" }) => `<svg class="${clase}" viewBox="0 0 138.305 138.305" aria-hidden="true"><g transform="translate(-6.054688 -2.601562)">
    ${conTrazo ? `<path class="cl__contorno" fill-rule="evenodd" d="${DISCO}"/>` : ""}
    <path class="cl__disco" fill-rule="evenodd" d="${DISCO}" ${relleno}/>
    <circle class="cl__punto" cx="${PUNTO.cx}" cy="${PUNTO.cy}" r="${PUNTO.r}"/></g></svg>`;

/** Carga chica (botones, líneas de texto): el isotipo en el color del texto; el punto salta fuera de la mordida y vuelve. */
export function carga({ tam = 20, etiqueta = "Cargando" } = {}) {
  return `<span class="carga carga--salto" style="--tam:${tam}px" role="status" aria-label="${etiqueta}">${isoCarga({ clase: "cl" })}</span>`;
}

/** Carga de marca (salto): el isotipo con su degradado; el punto sale por la mordida, da un salto y aterriza; el disco lo recibe. */
export function cargaSalto({ tam = 96, etiqueta = "Cargando" } = {}) {
  return `<span class="carga-logo carga-logo--salto" style="--tam:${tam}px" role="status" aria-label="${etiqueta}">${isoCarga({ clase: "cl cl--marca" })}</span>`;
}
/** Compatibilidad: la carga de marca de la versión 1 ahora es el salto. */
export const cargaMarca = ({ tam = 96, etiqueta = "Cargando" } = {}) => cargaSalto({ tam, etiqueta });

/** Carga que se llena: el disco se llena desde abajo con el degradado; al completarse, el punto salta fuera y vuelve.
    valor (0–100) la deja fija (carga con avance conocido); sin valor, se repite. */
export function cargaLlenado({ tam = 120, valor = null, etiqueta = "Cargando" } = {}) {
  return `<span class="carga-logo carga-logo--llenado ${valor == null ? "" : "carga-logo--fija"}" style="--tam:${tam}px;--v:${valor ?? 0}%" role="${valor == null ? "status" : "progressbar"}" aria-label="${etiqueta}" ${valor == null ? "" : `aria-valuenow="${valor}" aria-valuemin="0" aria-valuemax="100"`}>${isoCarga({ clase: "cl cl--marca", conTrazo: true })}</span>`;
}

/** Carga por fases (espera larga): el disco se llena por tercios; en cada fase nueva el punto salta. Mover con fijarFase(). */
export function cargaFases({ tam = 120, fase = 1, total = 3, etiqueta = "Cargando" } = {}) {
  return `<span class="carga-logo carga-logo--fases" style="--tam:${tam}px;--v:${(fase / total) * 100}%" data-fase="${fase}" data-total="${total}" role="progressbar" aria-label="${etiqueta}" aria-valuenow="${fase}" aria-valuemin="0" aria-valuemax="${total}">${isoCarga({ clase: "cl cl--marca", conTrazo: true })}</span>`;
}
export function fijarFase(el, fase) {
  const total = +el.dataset.total; el.dataset.fase = fase; el.setAttribute("aria-valuenow", fase);
  el.style.setProperty("--v", (fase / total) * 100 + "%");
  el.classList.remove("salta"); void el.offsetWidth; el.classList.add("salta");
}
/** Ya no hay relojes que sincronizar (todo es CSS); se deja por compatibilidad. */
export function sincronizarCargas() {}

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
