/* La historia de Quillay como hilo del guion: las secciones de cliente se leen en orden, como un caso real.
   Al pie de cada una, el recorrido con el punto de la marca en el paso actual y el enlace al siguiente. */
import { numeroDe } from "../plan.js?v=e33c371";

export const RECORRIDO = [
  ["agendar", "Agenda la primera reunión"],
  ["diagnostico", "Responde el diagnóstico"],
  ["informe", "Recibe el informe"],
  ["propuesta", "Acepta la propuesta"],
  ["implementacion", "Sigue la implementación"],
  ["escalera", "Ve dónde está hoy"],
  ["correos", "Los correos que recibió"],
];

export function recorridoHTML(id) {
  const i = RECORRIDO.findIndex(([k]) => k === id);
  if (i < 0) return "";
  const sig = RECORRIDO[i + 1], ant = RECORRIDO[i - 1];
  return `<nav class="recorrido" aria-label="La historia de Quillay, paso ${i + 1} de ${RECORRIDO.length}">
    <p class="rotulo recorrido__t">La historia de Quillay · paso ${i + 1} de ${RECORRIDO.length}</p>
    <ol class="recorrido__pista">${RECORRIDO.map(([k, t], n) => `<li class="${n < i ? "hecho" : n === i ? "actual" : ""}"><a href="#${k}" aria-label="${t} (${numeroDe(k)})"${n === i ? ' aria-current="step"' : ""}><i></i></a></li>`).join("")}</ol>
    <div class="recorrido__enlaces">${ant ? `<a class="recorrido__ant" href="#${ant[0]}">← ${ant[1]}</a>` : "<span></span>"}${sig ? `<a class="boton boton--secundario boton--s" href="#${sig[0]}">Sigue: ${sig[1]} → ${numeroDe(sig[0])}</a>` : `<a class="boton boton--secundario boton--s" href="#${RECORRIDO[0][0]}">Volver al inicio de la historia</a>`}</div>
  </nav>`;
}
