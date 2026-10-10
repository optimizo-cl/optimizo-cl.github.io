/* Capítulo 7 · Manual v2 (ola 9): la construcción del logo con cotas que se trazan, la especificación completa del
   movimiento (curvas, tiempos y el resorte), y descargas ampliadas (videos generados en el navegador). */
import { pieza, activarPiezas, curvaMovimiento, activarCurvas, codigo } from "../kit/presentar.js?v=19f4b98";
import { logo, isotipo } from "../kit/marca.js?v=19f4b98";
import { icono, rellenarIconos } from "../kit/iconos.js?v=19f4b98";
import { toast } from "../kit/avisos.js?v=19f4b98";
import { pelicula } from "../kit/pelicula.js?v=19f4b98";
import { movimientoReducido } from "../kit/escenas/vigia.js?v=19f4b98";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const raiz = document.documentElement;
const ANCHO = 446.654, LADO = 138.305;

export const manual2 = {
  /* ── Construcción del logo: las cotas se trazan sobre el logo real ── */
  "manual-logo": (v1) => async (el) => {
    const L = LADO, x0 = 0, o = { izq: 178.413, der: 213.347, arriba: 52.072, abajo: 86.233 };
    const cota = (x1, y1, x2, y2, txt, i, lado = "abajo") => `<g class="cota-svg" style="--i:${i}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" pathLength="1"/><line x1="${x1}" y1="${y1 - 5}" x2="${x1}" y2="${y1 + 5}" class="cota-svg__tope" ${y1 !== y2 ? `transform="rotate(90 ${x1} ${y1})"` : ""}/><line x1="${x2}" y1="${y2 - 5}" x2="${x2}" y2="${y2 + 5}" class="cota-svg__tope" ${y1 !== y2 ? `transform="rotate(90 ${x2} ${y2})"` : ""}/><text x="${(x1 + x2) / 2 + (y1 !== y2 ? 8 : 0)}" y="${(y1 + y2) / 2 + (y1 === y2 ? (lado === "abajo" ? 14 : -7) : 4)}" ${y1 === y2 ? 'text-anchor="middle"' : ""}>${txt}</text></g>`;
    const vivo = `<div class="construccion2" data-construccion><svg viewBox="-60 -50 ${ANCHO + 120} ${L + 110}" class="construccion2__svg" role="img" aria-label="Construcción del logo con sus medidas">
        <rect x="-34.6" y="-34.6" width="${ANCHO + 69.2}" height="${L + 69.2}" class="construccion2__resguardo"/>
        <g class="construccion2__reticula">${Array.from({ length: 9 }, (_, k) => `<line x1="${k * L / 8}" y1="0" x2="${k * L / 8}" y2="${L}"/><line x1="0" y1="${k * L / 8}" x2="${L}" y2="${k * L / 8}"/>`).join("")}</g>
        <circle cx="${75.207 - 6.055}" cy="${71.754 - 2.602}" r="69.152" class="construccion2__guia"/><circle cx="${25.863 - 6.055}" cy="${22.754 - 2.602}" r="34.578" class="construccion2__guia construccion2__guia--mordida"/>
        <g data-logo-svg></g>
        ${cota(x0, L + 18, L, L + 18, "L", 0)}${cota(L, L + 18, o.izq, L + 18, "0,29 L", 1)}${cota(o.izq, L + 18, ANCHO, L + 18, "2,23 L", 2)}
        ${cota(ANCHO + 18, o.arriba, ANCHO + 18, o.abajo, "0,247 L", 3)}${cota(-34.6, -22, 0, -22, "0,25 L · resguardo", 4, "arriba")}
      </svg>
      <div class="construccion2__ley">${[["L", "Lado del isotipo: la unidad de todo."], ["0,29 L", "Separación entre isotipo y logotipo."], ["0,247 L", "Alto de la «o»: centrada con el isotipo."], ["0,25 L", "Resguardo libre por cada lado: el diámetro del punto."]].map(([a, b]) => `<div><b class="mono">${a}</b><span class="chico">${b}</span></div>`).join("")}</div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: `<div class="manual2-v1"></div>` });
    activarPiezas(el);
    const svgLogo = await logo(); const tmp = document.createElement("div"); tmp.innerHTML = svgLogo; const s = tmp.querySelector("svg");
    el.querySelector("[data-logo-svg]").innerHTML = s.innerHTML;
    const caja = el.querySelector("[data-construccion]");
    if (movimientoReducido()) caja.classList.add("trazado"); else new IntersectionObserver(([e], ob) => { if (e.isIntersecting) { ob.disconnect(); caja.classList.add("trazado"); } }, { threshold: 0.4 }).observe(caja);
    const abajo = el.querySelector(".manual2-v1");
    await v1({ querySelector: (q) => (q === ".seccion__cuerpo" ? abajo : abajo.querySelector(q)) });
  },

  /* ── Movimiento: la especificación completa ── */
  async "movimiento-spec"(el) {
    const curvas = [
      { nombre: "Llegada", bezier: [0.16, 1, 0.3, 1], ms: 1200, uso: "Todo lo que entra o llega a su lugar: secciones, el punto aterrizando, menús." },
      { nombre: "Suave", bezier: [0.25, 0.1, 0.25, 1], ms: 640, uso: "Cambios de color, fundidos, el grano." },
      { nombre: "Firma", bezier: [0.45, 0.05, 0.55, 0.95], ms: 1600, uso: "El punto en órbita: acelera y frena con calma." },
    ];
    const tiempos = [["Respuesta", 160, "Hover y presión: la cerámica se hunde."], ["Transición", 320, "Pestañas, segmentados, interruptores."], ["Escena", 640, "Hojas, diálogos, entradas de sección."], ["Recorrido", 1200, "Progreso, el punto viajando."], ["Firma", 1600, "El punto saliendo o aterrizando."], ["Ciclo", 14000, "La firma del isotipo 3D (sale, da la vuelta, vuelve)."]];
    const vivo = `<div class="mov2">
      <div class="mov2__curvas">${curvas.map(curvaMovimiento).join("")}</div>
      <div class="mov2__tiempos" data-tiempos><p class="titulo-3">Tiempos</p>${tiempos.map(([n, ms, d], i) => `<div class="mov2__t" style="--w:${Math.min(100, (Math.log10(ms) - 2) / 2.2 * 100)}%;--i:${i}"><b>${n}</b><span class="mono">${ms >= 1000 ? (ms / 1000).toString().replace(".", ",") + " s" : ms + " ms"}</span><i></i><span class="chico">${d}</span></div>`).join("")}</div>
      <div class="mov2__resorte"><p class="titulo-3">El resorte de la marca</p><p class="chico">Lo que se arrastra y se suelta vuelve con un resorte <b>crítico</b>: rigidez ω = 7 y amortiguación ζ = 1. Llega lo más rápido posible sin pasarse. Nunca rebota.</p>
        ${codigo("// cada cuadro\nconst a = ω*ω*(meta - x) - 2*ζ*ω*v;\nv += a * dt; x += v * dt;   // ω = 7 · ζ = 1")}<a class="boton boton--secundario boton--s" href="#laboratorio">Probarlo en el laboratorio</a></div>
      <div class="mov2__reglas">${[["Nada rebota", "La elasticidad no es la marca. El juego está en las ideas."], ["Una firma por pantalla", "Solo una cosa compleja se mueve a la vez."], ["Reducir movimiento", "Con la preferencia activa, todo aparece en su estado final."], ["Se duerme fuera de pantalla", "Las escenas no consumen nada si no se ven."]].map(([t, d]) => `<div><b>${t}</b><span class="chico">${d}</span></div>`).join("")}</div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: `<div class="rejilla-2"><ul class="lista-punto"><li>Las curvas viven en los tokens: <code>--llegada</code>, <code>--suave</code>, <code>--firma</code>.</li><li>Los tiempos también: <code>--d-1</code> a <code>--d-4</code> y <code>--d-firma</code>.</li></ul>${codigo(".pieza { transition: transform var(--d-3) var(--llegada); }")}</div>` });
    activarPiezas(el); activarCurvas(el);
    const t = el.querySelector("[data-tiempos]");
    if (movimientoReducido()) t.classList.add("visto"); else new IntersectionObserver(([e], ob) => { if (e.isIntersecting) { ob.disconnect(); t.classList.add("visto"); } }, { threshold: 0.3 }).observe(t);
  },

  /* ── Descargas: archivos fijos y videos que se generan en el navegador ── */
  async descargas(el) {
    const p = raiz.dataset.paleta === "naranjo" ? "naranjo/" : "";
    const archivo = (ruta, nombre, tipo, ico) => `<a class="descarga2 ceramica" href="${ruta}" download><span class="descarga2__ico">${icono(ico, { tam: 22 })}</span><span><b>${nombre}</b><span class="rotulo">${tipo}</span></span>${icono("download-simple", { tam: 18 })}</a>`;
    const generado = (k, nombre, tipo, ico) => `<button type="button" class="descarga2 ceramica" data-generar="${k}"><span class="descarga2__ico">${icono(ico, { tam: 22 })}</span><span><b>${nombre}</b><span class="rotulo" data-estado-g>${tipo} · se genera al pedirlo</span></span>${icono("download-simple", { tam: 18 })}</button>`;
    const vivo = `<div class="descargas2">
      <div class="descargas2__grupo"><p class="titulo-3">Paquete y manual</p>${archivo("assets/descargas/optimizo-marca.zip", "Todos los logos (SVG + PNG) y la paleta", "ZIP · dos paletas", "file-zip")}${archivo(`assets/descargas/manual-optimizo${p ? "-paleta-b" : ""}.pdf`, `Manual de marca · paleta ${p ? "B" : "A"}`, "PDF · A4 apaisado", "file-pdf")}</div>
      <div class="descargas2__grupo"><p class="titulo-3">Logos · paleta ${p ? "B" : "A"}</p>${[["optimizo-logo.svg", "Logo principal"], ["optimizo-logo-sobre-oscuro.svg", "Logo sobre oscuro"], ["optimizo-isotipo.svg", "Isotipo"], ["optimizo-logo-mono-navy.svg", "Logo en un color (navy)"]].map(([f, n]) => archivo(`assets/logo/${p}${f}`, n, "SVG", "file-svg")).join("")}</div>
      <div class="descargas2__grupo"><p class="titulo-3">Animaciones</p>${generado("marca", "Animación del logo (12 s)", "Video 16:9", "film-strip")}${generado("dato", "Carrusel animado (8 s)", "Video 4:5", "film-strip")}${generado("frase", "Post animado (6 s)", "Video 1:1", "film-strip")}
        <canvas class="descargas2__lienzo" aria-hidden="true"></canvas><p class="chico">Los videos se graban en tu navegador con la paleta activa (MP4 si el navegador lo permite, si no WebM).</p></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el); await rellenarIconos();
    const lienzo = el.querySelector(".descargas2__lienzo");
    const bajar = (blob, nombre) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
    el.querySelectorAll("[data-generar]").forEach((b) => b.addEventListener("click", async () => {
      const k = b.dataset.generar, est = b.querySelector("[data-estado-g]"), antes = est.textContent; b.disabled = true; est.textContent = "Grabando…";
      try {
          const c = document.createElement("canvas"); c.className = "descargas2__lienzo visible"; lienzo.replaceWith(c);
          const peli = await pelicula(c, k), { blob, ext } = await peli.grabar(); c.replaceWith(lienzo);
          bajar(blob, `optimizo-${k}.${ext}`);
        toast("Video listo.", { tono: "exito" });
      } catch (err) { toast(err.message || "No se pudo grabar en este navegador.", { tono: "error" }); }
      finally { b.disabled = false; est.textContent = antes; }
    }));
  },
};
