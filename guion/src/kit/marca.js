/* La marca como piezas: isotipo (disco + punto aparte para animarlo) y logotipo en trazos.
   El degradado lee las variables de la paleta activa (--deg-a, --deg-b): cambia solo con data-paleta. */

// Geometría exacta del PDF original (coordenadas del PDF; el <g> la lleva a una caja de 0–138,305).
const DISCO = "M 55.757812 5.390625 C 58.730469 10.496094 60.441406 16.425781 60.441406 22.753906 C 60.441406 41.851562 44.960938 57.332031 25.863281 57.332031 C 19.621094 57.332031 13.769531 55.667969 8.710938 52.773438 C 6.992188 58.804688 6.054688 65.167969 6.054688 71.753906 C 6.054688 109.945312 37.011719 140.90625 75.207031 140.90625 C 113.398438 140.90625 144.359375 109.945312 144.359375 71.753906 C 144.359375 33.5625 113.398438 2.601562 75.207031 2.601562 C 68.453125 2.601562 61.929688 3.585938 55.757812 5.390625 Z M 57.917969 71.753906 C 57.917969 62.207031 65.65625 54.464844 75.207031 54.464844 C 84.753906 54.464844 92.492188 62.207031 92.492188 71.753906 C 92.492188 81.300781 84.753906 89.042969 75.207031 89.042969 C 65.65625 89.042969 57.917969 81.300781 57.917969 71.753906 Z";
export const PUNTO = { cx: 25.863281, cy: 22.753906, r: 17.289 };
export const CENTRO = { cx: 75.207031, cy: 71.753906, r: 69.152, hueco: 17.288 };
export const LADO = 138.305;

let n = 0;
/** Isotipo como SVG en texto. color: null = degradado de la paleta; si no, un color plano (CSS). */
export function isotipo({ color = null, clase = "", titulo = "Optimizo" } = {}) {
  const id = `iso${++n}`;
  const relleno = (k) => (color ? color : `url(#${id}${k})`);
  const grad = (k, x1, x2) =>
    `<linearGradient id="${id}${k}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="0" x2="${x2}" y2="0">` +
    `<stop offset="0" style="stop-color:var(--deg-a)"/><stop offset="1" style="stop-color:var(--deg-b)"/></linearGradient>`;
  return `<svg class="isotipo ${clase}" viewBox="0 0 ${LADO} ${LADO}" role="img" aria-label="${titulo}">
    ${color ? "" : `<defs>${grad("d", 6.054688, 144.359375)}${grad("p", 8.574219, 43.152344)}</defs>`}
    <g transform="translate(-6.054688 -2.601562)">
      <path class="isotipo__disco" fill="${relleno("d")}" fill-rule="evenodd" d="${DISCO}"/>
      <g class="isotipo__punto"><circle cx="${PUNTO.cx}" cy="${PUNTO.cy}" r="${PUNTO.r}" fill="${relleno("p")}"/></g>
    </g></svg>`;
}

let logotipoD = null;
/** Trae el trazo del logotipo (Poppins en vectores) desde el SVG generado. */
export async function cargarLogotipo() {
  if (logotipoD) return logotipoD;
  const txt = await (await fetch(new URL("../../assets/logo/optimizo-logotipo.svg", import.meta.url))).text();
  const doc = new DOMParser().parseFromString(txt, "image/svg+xml");
  const svg = doc.querySelector("svg");
  const path = doc.querySelector("path");
  logotipoD = { viewBox: svg.getAttribute("viewBox"), transform: path.getAttribute("transform"), d: path.getAttribute("d") };
  return logotipoD;
}

/** Logotipo en el color del texto actual (currentColor): sirve en claro y oscuro. */
export async function logotipo({ clase = "" } = {}) {
  const l = await cargarLogotipo();
  return `<svg class="logotipo ${clase}" viewBox="${l.viewBox}" role="img" aria-label="optimizo"><path fill="currentColor" transform="${l.transform}" d="${l.d}"/></svg>`;
}

let logoTxt = null;
/** Logo horizontal (el SVG generado por construir_logo.py): texto en currentColor y degradado de la paleta activa. */
export async function logo({ clase = "", titulo = "Optimizo" } = {}) {
  if (!logoTxt) logoTxt = await (await fetch(new URL("../../assets/logo/optimizo-logo.svg", import.meta.url))).text();
  const id = `logo${++n}`;
  return logoTxt
    .replace(/<\?xml[^>]*>/, "")
    .replace("<svg ", `<svg class="logo ${clase}" `)
    .replace(/ width="[^"]*" height="[^"]*"/, "")
    .replace(/aria-label="[^"]*"/, `aria-label="${titulo}"`)
    .replace(/id="gl([ab])"/g, `id="${id}$1"`)
    .replace(/url\(#gl([ab])\)/g, `url(#${id}$1)`)
    .replace(/stop-color="#91CEC4"/g, 'style="stop-color:var(--deg-a)"')
    .replace(/stop-color="#387E80"/g, 'style="stop-color:var(--deg-b)"')
    .replace(/fill="#26405B"/g, 'fill="currentColor"');
}
