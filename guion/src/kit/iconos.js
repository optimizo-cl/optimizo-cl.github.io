/* Íconos Phosphor, peso línea fina (light), MIT. Se incrustan en línea para heredar el color del texto.
   Los SVG viven en assets/iconos/<nombre>-light.svg; los usados por el guion se cachean acá. */
const cache = new Map();

// Los íconos que el guion usa al arrancar van incrustados (sin esperar la red).
const INCRUSTADOS = {
  list: '<path d="M222,128a6,6,0,0,1-6,6H40a6,6,0,0,1,0-12H216A6,6,0,0,1,222,128ZM40,70H216a6,6,0,0,0,0-12H40a6,6,0,0,0,0,12ZM216,186H40a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12Z"/>',
};

export function icono(nombre, { tam = 20, etiqueta = "" } = {}) {
  const aria = etiqueta ? `role="img" aria-label="${etiqueta}"` : 'aria-hidden="true"';
  const cuerpo = INCRUSTADOS[nombre] ?? cache.get(nombre) ?? "";
  return `<svg class="icono" data-icono="${nombre}" width="${tam}" height="${tam}" viewBox="0 0 256 256" fill="currentColor" ${aria}>${cuerpo}</svg>`;
}

// Paquete con todos los íconos que usa el código (herramientas/iconos.mjs): un solo pedido.
let paquete = null;
function traerPaquete() {
  return (paquete ??= fetch(new URL("../../assets/iconos-usados.json", import.meta.url)).then((r) => (r.ok ? r.json() : {})).then((j) => { for (const [k, v] of Object.entries(j)) cache.set(k, v); }).catch(() => {}));
}

/** Carga los íconos pedidos y rellena los <svg data-icono> vacíos de la página. */
export async function cargarIconos(nombres) {
  await traerPaquete();
  // los que no estén en el paquete se traen uno a uno (y el aviso recuerda regenerar el paquete)
  await Promise.all(nombres.filter((n) => !cache.has(n) && !INCRUSTADOS[n]).map(async (n) => {
    const r = await fetch(new URL(`../../assets/iconos/${n}-light.svg`, import.meta.url));
    if (!r.ok) { console.warn(`Ícono inexistente: ${n}`); cache.set(n, ""); return; }
    console.warn(`Ícono fuera del paquete: ${n} (corre node herramientas/iconos.mjs)`);
    const txt = await r.text();
    cache.set(n, txt.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, ""));
  }));
  document.querySelectorAll("svg.icono[data-icono]").forEach((s) => { if (!s.innerHTML) s.innerHTML = cache.get(s.dataset.icono) || ""; });
}

/** Busca los íconos vacíos de la página, los trae y los rellena. */
export async function rellenarIconos() {
  const nombres = [...new Set([...document.querySelectorAll("svg.icono[data-icono]")].filter((s) => !s.innerHTML).map((s) => s.dataset.icono))];
  if (nombres.length) await cargarIconos(nombres);
}
