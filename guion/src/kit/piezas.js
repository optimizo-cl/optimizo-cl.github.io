/* Piezas de marca en canvas, al tamaño real (redes, imagen para compartir, ícono de app). Se pueden descargar en PNG. */
const DISCO = "M 55.757812 5.390625 C 58.730469 10.496094 60.441406 16.425781 60.441406 22.753906 C 60.441406 41.851562 44.960938 57.332031 25.863281 57.332031 C 19.621094 57.332031 13.769531 55.667969 8.710938 52.773438 C 6.992188 58.804688 6.054688 65.167969 6.054688 71.753906 C 6.054688 109.945312 37.011719 140.90625 75.207031 140.90625 C 113.398438 140.90625 144.359375 109.945312 144.359375 71.753906 C 144.359375 33.5625 113.398438 2.601562 75.207031 2.601562 C 68.453125 2.601562 61.929688 3.585938 55.757812 5.390625 Z M 57.917969 71.753906 C 57.917969 62.207031 65.65625 54.464844 75.207031 54.464844 C 84.753906 54.464844 92.492188 62.207031 92.492188 71.753906 C 92.492188 81.300781 84.753906 89.042969 75.207031 89.042969 C 65.65625 89.042969 57.917969 81.300781 57.917969 71.753906 Z";
const tok = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
export const LETRA = '"SF Pro Display", "Inter", system-ui, sans-serif';

/** Dibuja el isotipo con degradado de la paleta activa (o un color plano). lado en px. */
export function isotipoCanvas(ctx, x, y, lado, color = null) {
  const s = lado / 138.305;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-6.054688, -2.601562);
  const g = (x0, x1) => { const gr = ctx.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, tok("--deg-a")); gr.addColorStop(1, tok("--deg-b")); return gr; };
  ctx.fillStyle = color || g(6.05, 144.36); ctx.fill(new Path2D(DISCO), "evenodd");
  ctx.beginPath(); ctx.arc(25.863281, 22.753906, 17.289, 0, Math.PI * 2);
  ctx.fillStyle = color || g(8.57, 43.15); ctx.fill();
  ctx.restore();
}

/** Grano de la marca sobre todo el lienzo (el material: mismo grano en pantalla y en las piezas). */
export function granoCanvas(ctx, w, h, fuerza = 0.06) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < d.length; i += 4) { const n = (azar() - 0.5) * 255 * fuerza; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  ctx.putImageData(img, 0, 0);
}

/** Texto con salto de línea automático. Devuelve la altura usada. */
export function parrafo(ctx, texto, x, y, ancho, alto, { peso = 700, tam = 64, color = tok("--navy"), tracking = -0.03 } = {}) {
  ctx.font = `${peso} ${tam}px ${LETRA}`; ctx.fillStyle = color; ctx.textBaseline = "alphabetic";
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${tracking * tam}px`;
  const palabras = texto.split(" "), lineas = []; let linea = "";
  for (const p of palabras) { const prueba = linea ? linea + " " + p : p; if (ctx.measureText(prueba).width > ancho && linea) { lineas.push(linea); linea = p; } else linea = prueba; }
  lineas.push(linea);
  lineas.forEach((l, i) => ctx.fillText(l, x, y + i * alto));
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  return lineas.length * alto;
}

/** Monta un lienzo al tamaño real dentro de un contenedor que lo muestra escalado, con botón de descarga. */
export function lienzoPieza(contenedor, { ancho, alto, nombre, dibujar }) {
  contenedor.innerHTML = `<div class="pieza"><div class="pieza__marco" style="aspect-ratio:${ancho}/${alto}"><canvas width="${ancho}" height="${alto}"></canvas></div>
    <div class="pieza__pie"><span class="rotulo">${nombre} · ${ancho} × ${alto}</span><button type="button" class="boton boton--texto boton--s" data-descargar>Descargar PNG</button></div></div>`;
  const c = contenedor.querySelector("canvas"), ctx = c.getContext("2d");
  const pintar = () => { ctx.clearRect(0, 0, ancho, alto); dibujar(ctx, ancho, alto, tok); };
  document.fonts.ready.then(pintar);
  new MutationObserver(pintar).observe(document.documentElement, { attributes: true, attributeFilter: ["data-paleta", "data-tema"] });
  contenedor.querySelector("[data-descargar]").addEventListener("click", () => c.toBlob((b) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `optimizo-${nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }));
}
