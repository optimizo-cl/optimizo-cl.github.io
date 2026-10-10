/* Piezas del propio guion (no de la marca): marco de demostración y ficha de uso. */

const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Marco de una demostración: título corto, contenido vivo y nota opcional. */
export function marco(titulo, contenido, { nota = "", clase = "", ancho = false } = {}) {
  return `<figure class="marco mate ${ancho ? "marco--ancho" : ""} ${clase}">
    <figcaption class="marco__titulo">${titulo}</figcaption>
    <div class="marco__vivo">${contenido}</div>
    ${nota ? `<p class="marco__nota rotulo">${nota}</p>` : ""}
  </figure>`;
}

/** Ficha de uso: qué es, cómo se importa, reglas. Plegable para no tapar la demo. */
export function ficha({ que, importar = "", codigo = "", reglas = [] }) {
  return `<details class="ficha">
    <summary><span>Ficha de uso</span></summary>
    <div class="ficha__cuerpo">
      <p>${que}</p>
      ${importar ? `<pre class="ficha__codigo"><code>${escapar(importar)}</code></pre>` : ""}
      ${codigo ? `<pre class="ficha__codigo"><code>${escapar(codigo)}</code></pre>` : ""}
      ${reglas.length ? `<ul class="ficha__reglas">${reglas.map((r) => `<li>${r}</li>`).join("")}</ul>` : ""}
    </div>
  </details>`;
}

/** Rejilla de marcos. */
export const rejilla = (items, cols = 2) => `<div class="rejilla rejilla--${cols}">${items.join("")}</div>`;

/** Etiqueta de dato de ejemplo (regla de marca: todo dato demo se marca). */
export const ejemplo = () => `<span class="ejemplo">Datos de ejemplo</span>`;
