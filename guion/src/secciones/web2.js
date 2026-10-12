/* Capítulo 6 · Web y marca v2 (ola 8): el sitio nuevo, el video de marca exportable, redes animadas, una presentación
   con transiciones del punto, papelería en 3D y una 404 en la que se devuelve el punto a su nido. */
import { pieza, activarPiezas, codigo } from "../kit/presentar.js?v=7a04113";
import { boton, segmento } from "../kit/controles.js?v=7a04113";
import { toast } from "../kit/avisos.js?v=7a04113";
import { isotipo, logo } from "../kit/marca.js?v=7a04113";
import { icono, rellenarIconos } from "../kit/iconos.js?v=7a04113";
import { pelicula } from "../kit/pelicula.js?v=7a04113";
import { contar } from "../kit/coreografia.js?v=7a04113";
import { movimientoReducido } from "../kit/escenas/vigia.js?v=7a04113";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const raiz = document.documentElement;
const consulta = () => `?paleta=${raiz.dataset.paleta}&tema=${raiz.dataset.tema}`;
const usoDe = (lista, cod) => `<div class="rejilla-2"><ul class="lista-punto">${lista.map((r) => `<li>${r}</li>`).join("")}</ul>${cod ? codigo(cod) : ""}</div>`;
const isoLimpio = (clase = "") => isotipo({ clase, titulo: "" }).replace('role="img" aria-label=""', 'aria-hidden="true"');

/** Reproductor de una película con su barra de tiempo y el botón de descarga. */
async function reproductor(caja, guion, nombre) {
  caja.innerHTML = `<div class="peli"><canvas class="peli__lienzo" aria-label="${nombre} (animación)"></canvas>
    <div class="peli__mandos"><button type="button" class="boton boton--secundario boton--s boton--icono" data-play aria-label="Reproducir">${icono("play", { tam: 16 })}</button>
      <input type="range" min="0" max="1000" value="0" data-propio class="peli__tiempo" aria-label="Instante de ${nombre}"><span class="mono peli__t" data-t>0,0 s</span>
      <button type="button" class="boton boton--texto boton--s" data-grabar>${icono("download-simple", { tam: 16 })}<span class="boton__texto">Descargar video</span></button></div></div>`;
  await rellenarIconos();
  const c = caja.querySelector("canvas"), p = await pelicula(c, guion); c._peli = p;
  const r = caja.querySelector(".peli__tiempo"), t = caja.querySelector("[data-t]");
  c.addEventListener("tiempo", (e) => { if (document.activeElement !== r) { r.value = e.detail * 1000; r.style.setProperty("--p", e.detail * 100 + "%"); } t.textContent = (e.detail * p.dur).toFixed(1).replace(".", ",") + " s"; });
  caja.querySelector("[data-play]").addEventListener("click", () => p.reproducir(+r.value >= 999 ? 0 : (r.value / 1000) * p.dur));
  r.addEventListener("input", () => { r.style.setProperty("--p", r.value / 10 + "%"); p.ir((r.value / 1000) * p.dur); });
  caja.querySelector("[data-grabar]").addEventListener("click", async (e) => {
    const b = e.currentTarget; b.disabled = true; b.querySelector(".boton__texto").textContent = `Grabando… ${p.dur} s`;
    try { const { blob, ext } = await p.grabar(); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `optimizo-${guion}.${ext}`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast(`Video listo (${ext.toUpperCase()}, ${(blob.size / 1e6).toFixed(1).replace(".", ",")} MB).`, { tono: "exito" }); }
    catch (err) { toast(err.message || "No se pudo grabar.", { tono: "error" }); }
    finally { b.disabled = false; grabando = false; b.querySelector(".boton__texto").textContent = "Descargar video"; }
  });
  // se reproduce sola la primera vez que se ve; fuera de pantalla se pausa (no gasta)
  let visto = false, grabando = false;
  caja.querySelector("[data-grabar]").addEventListener("click", () => (grabando = true), { capture: true });
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !visto && !movimientoReducido()) { visto = true; p.reproducir(0); }
    if (!en.isIntersecting && !grabando) p.pausar();
  }, { threshold: 0.5 }).observe(c);
  return p;
}

export const web2 = {
  /* ── Sitio: el de verdad, armado con el guion ── */
  async landing(el) {
    const vivo = `<div class="landing-vista">
      <div class="landing-vista__barra">${segmento(["Computador", "Celular"], { etiqueta: "Ancho", nombre: "ancho" })}<a class="boton boton--texto boton--s" href="web/landing.html${consulta()}" target="_blank" rel="noopener">Abrir completo ↗</a></div>
      <div class="landing-vista__marco"><iframe src="web/landing.html${consulta()}" title="Sitio de Optimizo" loading="lazy"></iframe></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Héroe con el isotipo de la portada: el punto sale por la mordida una vez, al llegar.", "La historia «caos → orden» ocurre con el scroll: las tareas se acomodan rectas en columnas por área.", "Servicios en cerámica, la familia (Medula y Bárbara con su material) y el cotizador vivo.", "Una sola llamada: «Agendar diagnóstico». El cierre es navy con el isotipo grande."]) });
    activarPiezas(el);
    el.querySelector('[data-segmento="ancho"]').addEventListener("cambio", (e) => el.querySelector(".landing-vista__marco").classList.toggle("landing-vista__marco--celular", e.detail === "Celular"));
  },

  /* ── Video de marca ── */
  async video(el) {
    const vivo = `<div class="video2"><div data-peli></div>
      <ol class="video2__guion">${[["0–4,4 s", "El logo se arma: el disco se dibuja, el punto sale del centro por la mordida y las letras se asientan."], ["4,4 s", "Caen los puntos de las «i» y aparece la frase."], ["4,4–7,6 s", "Las «i» saludan una vez. La frase se queda."], ["× 3", "Se repite con «Medimos antes de proponer» y «Lo dejamos funcionando» (22,8 s)."]].map(([t, d]) => `<li><span class="mono">${t}</span>${d}</li>`).join("")}</ol></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Se dibuja en el navegador con los colores de la paleta activa: cambia A/B y el video cambia.", "«Descargar video» lo graba en tiempo real (23 s) y baja un MP4 o WebM según el navegador.", "Para redes: sin sonido, legible sin audio, el logo arma la identidad en los primeros 4 segundos."], 'const peli = await pelicula(canvas, "marca");\nconst { blob, ext } = await peli.grabar();') });
    activarPiezas(el);
    await reproductor(el.querySelector("[data-peli]"), "marca", "Video de marca");
  },

  /* ── Redes: piezas animadas (arriba) y fijas (abajo, las de la versión 1) ── */
  redes: (v1) => async (el) => {
    await v1(el);
    const c = cuerpo(el);
    c.insertAdjacentHTML("afterbegin", `<div class="redes2"><div class="redes2__pieza"><span class="rotulo">Carrusel animado · 4:5 · 8 s</span><div data-r1></div></div><div class="redes2__pieza"><span class="rotulo">Post animado · 1:1 · 6 s</span><div data-r2></div></div></div><p class="titulo-3 redes2__fijas">Piezas fijas (PNG)</p>`);
    await reproductor(c.querySelector("[data-r1]"), "dato", "Carrusel animado");
    await reproductor(c.querySelector("[data-r2]"), "frase", "Post animado");
  },

  /* ── Presentación: láminas con transiciones del punto ── */
  async presentacion(el) {
    const laminas = [
      `<div class="pres__portada"><div class="pres__iso">${isoLimpio("firma-escape")}</div><div><p class="pres__ceja">Propuesta · septiembre 2026</p><p class="pres__titulo">Cotizar en minutos, no en días</p><p class="pres__sub">Quillay Suministros Industriales</p></div></div>`,
      `<p class="pres__ceja">Lo que encontramos</p><p class="pres__titulo pres__titulo--m">31 horas por semana se van en 6 procesos</p><ul class="pres__lista"><li><b>12 h</b> Cotizaciones a mano</li><li><b>7 h</b> Seguimiento en WhatsApp</li><li><b>6 h</b> Inventario que no calza</li></ul>`,
      `<p class="pres__ceja">El número</p><p class="pres__heroe" data-heroe-n>0 h</p><p class="pres__sub">recuperables por semana, sin contratar a nadie</p>`,
      `<p class="pres__ceja">El camino</p><p class="pres__titulo pres__titulo--m">Primero el CRM. Después, la memoria.</p><div class="pres__escalera">${["Sin CRM", "CRM a medida", "Medula", "Agentes"].map((t, i) => `<span style="--i:${i}" class="${i === 1 ? "hoy" : ""}">${t}</span>`).join("")}</div>`,
      `<div class="pres__iso-cierre" aria-hidden="true">${isoLimpio("firma-escape")}</div><div class="pres__cierre"><p class="pres__titulo">Todo proceso tiene una salida.</p><p class="pres__sub">martina@optimizo.cl · optimizo.cl</p></div>`,
    ];
    const vivo = `<div class="pres" data-pres tabindex="0" role="region" aria-roledescription="presentación" aria-label="Presentación de ejemplo: usa las flechas">
      <div class="pres__pantalla">${laminas.map((l, i) => `<section class="pres__lamina ${i === 0 ? "activa" : ""} ${i === 4 ? "pres__lamina--oscura" : ""}" aria-hidden="${i !== 0}" data-i="${i}">${l}</section>`).join("")}<i class="pres__punto" aria-hidden="true"></i></div>
      <div class="pres__mandos"><button type="button" class="boton boton--secundario boton--s boton--icono" data-ant aria-label="Lámina anterior">${icono("arrow-left", { tam: 16 })}</button>
        <div class="pres__puntos" aria-hidden="true">${laminas.map((_, i) => `<i class="${i ? "" : "activo"}"></i>`).join("")}</div><span class="mono pres__n" aria-live="polite" data-n>1 / ${laminas.length}</span>
        <button type="button" class="boton boton--secundario boton--s boton--icono" data-sig aria-label="Lámina siguiente">${icono("arrow-right", { tam: 16 })}</button>
        <button type="button" class="boton boton--texto boton--s" data-full>${icono("arrows-out", { tam: 16 })}<span class="boton__texto">Pantalla completa</span></button></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Una idea por lámina; el título dice la conclusión, no el tema.", "Entre láminas, el punto viaja al centro y se abre en un círculo que revela la siguiente.", "Flechas o espacio para avanzar; F para pantalla completa."]) });
    activarPiezas(el); await rellenarIconos();
    const p = el.querySelector("[data-pres]"), ls = [...p.querySelectorAll(".pres__lamina")], punto = p.querySelector(".pres__punto");
    let i = 0, ocupado = false;
    const ir = async (n) => {
      n = Math.max(0, Math.min(ls.length - 1, n)); if (n === i || ocupado) return; ocupado = true;
      const nueva = ls[n], vieja = ls[i];
      if (!movimientoReducido()) {
        punto.classList.remove("viaja"); void punto.offsetWidth; punto.classList.add("viaja");
        await new Promise((r) => setTimeout(r, 520));
        nueva.classList.add("entra"); nueva.style.zIndex = 2;
        await nueva.animate([{ clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)" }], { duration: 900, easing: "cubic-bezier(.16,1,.3,1)" }).finished;
        nueva.classList.remove("entra"); nueva.style.zIndex = "";
      }
      vieja.classList.remove("activa"); vieja.setAttribute("aria-hidden", "true"); nueva.classList.add("activa"); nueva.setAttribute("aria-hidden", "false");
      i = n; p.querySelectorAll(".pres__puntos i").forEach((x, k) => x.classList.toggle("activo", k === i)); p.querySelector("[data-n]").textContent = `${i + 1} / ${ls.length}`;
      if (i === 2) contar(nueva.querySelector("[data-heroe-n]"), 31, { duracion: 1400, formato: (v) => Math.round(v) + " h" });
      ocupado = false;
    };
    p.querySelector("[data-sig]").addEventListener("click", () => ir(i + 1));
    p.querySelector("[data-ant]").addEventListener("click", () => ir(i - 1));
    p.addEventListener("keydown", (e) => { if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); ir(i + 1); } if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); ir(i - 1); } if (e.key.toLowerCase() === "f") p.requestFullscreen?.(); });
    p.querySelector("[data-full]").addEventListener("click", () => (document.fullscreenElement ? document.exitFullscreen() : p.requestFullscreen?.()));
  },

  /* ── Papelería: la tarjeta de cerámica que gira ── */
  papeleria: (v1) => async (el) => {
    await v1(el);
    // una sola tarjeta (la que se da vuelta); en su lugar, la A4 se conecta con la propuesta y la presentación
    const digital = [...el.querySelectorAll(".marco")].find((m) => m.querySelector(".marco__titulo")?.textContent.includes("Tarjeta digital"));
    digital?.replaceWith(Object.assign(document.createElement("div"), { className: "papeleria2__misma", innerHTML: `<p class="titulo-3">Una propuesta, tres soportes</p>
      <p class="chico">La A4 es la misma propuesta de Quillay que se lee en pantalla y la misma portada de la presentación: cambia el formato, no la idea.</p>
      <div class="fila-botones"><a class="boton boton--secundario boton--s" href="#propuesta">Propuesta → 5.08</a><a class="boton boton--secundario boton--s" href="#presentacion">Presentación → 6.04</a></div>` }));
    cuerpo(el).insertAdjacentHTML("afterbegin", `<div class="tarjeta3d-banco"><div class="tarjeta3d" data-tarjeta tabindex="0" role="button" aria-label="Tarjeta de presentación: presiona para darla vuelta" aria-pressed="false">
        <div class="tarjeta3d__cara tarjeta3d__frente ceramica ceramica--navy">${isoLimpio("tarjeta3d__iso")}<span class="tarjeta3d__marca" data-logo-t></span></div>
        <div class="tarjeta3d__cara tarjeta3d__dorso ceramica ceramica--hueso"><div><b>Martina Fuentes</b><span>Directora de proyectos</span></div><div class="tarjeta3d__datos"><span>+56 9 1234 5678</span><span>martina@optimizo.cl</span><span>optimizo.cl</span></div><i class="tarjeta3d__punto" aria-hidden="true"></i></div></div>
      <p class="chico">Mueve el mouse sobre la tarjeta: la luz la recorre. Presiona para darla vuelta. Frente en cerámica navy con el isotipo en relieve; dorso hueso con el punto como único color.</p></div><p class="titulo-3">Propuesta impresa</p>`);
    const t = el.querySelector("[data-tarjeta]"); t.querySelector("[data-logo-t]").innerHTML = await logo({ clase: "" });
    t.addEventListener("pointermove", (e) => { if (movimientoReducido()) return; const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; t.style.setProperty("--rx", (-y * 14).toFixed(2) + "deg"); t.style.setProperty("--ry", (x * 18).toFixed(2) + "deg"); t.style.setProperty("--lx", (x + 0.5) * 100 + "%"); t.style.setProperty("--ly", (y + 0.5) * 100 + "%"); });
    t.addEventListener("pointerleave", () => { t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); });
    const voltear = () => { const si = !t.classList.contains("volteada"); t.classList.toggle("volteada", si); t.setAttribute("aria-pressed", si); };
    t.addEventListener("click", voltear); t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); voltear(); } });
  },

  /* ── 404: el punto se perdió; devuélvelo ── */
  async "error-404"(el) {
    const vivo = `<div class="e404" data-404b>
      <svg class="e404__svg" viewBox="0 0 800 420" role="group" aria-label="El isotipo sin su punto: arrastra el punto a su nido o presiona Enter">
        <text x="190" y="300" text-anchor="middle" class="e404__num">4</text><text x="610" y="300" text-anchor="middle" class="e404__num">4</text>
        <g transform="translate(296 91) scale(1.5)">${isoLimpio().replace(/<svg[^>]*>|<\/svg>/g, "").replace('<g class="isotipo__punto">', '<circle class="e404__nido" cx="25.863" cy="22.754" r="16.3"/><g class="isotipo__punto" style="display:none">')}</g>
        <circle class="e404__punto" r="26" cx="700" cy="70" tabindex="0" role="button" aria-label="Punto perdido: arrástralo a su nido o presiona Enter"/></svg>
      <div class="e404__texto"><p class="titulo-2" data-e-t>Esta página se salió del camino.</p><p class="chico" data-e-d>El punto se perdió. Devuélvelo a su nido y te llevamos al inicio.</p>
        <div class="fila-botones">${boton("Volver al inicio", { variante: "acento", attrs: "data-volver" })}${boton("Buscar en el sitio", { variante: "texto", ico: "magnifying-glass" })}</div></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Siempre ofrece salir: «Volver al inicio» funciona aunque no juegues.", "El juego es opcional y dura segundos: arrastrar el punto o presionar Enter.", "El mensaje no culpa: «esta página se salió de su órbita»."]) });
    activarPiezas(el); await rellenarIconos();
    const caja = el.querySelector("[data-404b]"), svg = caja.querySelector("svg"), p = caja.querySelector(".e404__punto");
    const nido = { x: 296 + (25.863 - 6.054688) * 1.5, y: 91 + (22.754 - 2.601562) * 1.5 }, inicio = { x: 700, y: 70 };
    let pos = { ...inicio }, v = { x: 0, y: 0 }, agarrado = false, raf = 0, deriva = 0;
    const poner = () => { p.setAttribute("cx", pos.x); p.setAttribute("cy", pos.y); };
    const aSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y }; };
    const resorte = (meta, alFin) => { cancelAnimationFrame(raf); let prev = performance.now(); const paso = (ahora) => { const dt = Math.min(0.033, (ahora - prev) / 1000); prev = ahora; const w = 8; for (const k of ["x", "y"]) { const a = w * w * (meta[k] - pos[k]) - 2 * w * v[k]; v[k] += a * dt; pos[k] += v[k] * dt; } poner(); if (Math.hypot(meta.x - pos.x, meta.y - pos.y) > 0.3 || Math.hypot(v.x, v.y) > 1) raf = requestAnimationFrame(paso); else { pos = { ...meta }; poner(); alFin?.(); } }; raf = requestAnimationFrame(paso); };
    // a la deriva: el punto flota lento mientras nadie lo toca
    const flotar = (ahora) => { if (agarrado || caja.classList.contains("encontrado")) return; deriva = requestAnimationFrame(flotar); if (movimientoReducido()) return; pos = { x: inicio.x + Math.sin(ahora / 1300) * 14, y: inicio.y + Math.cos(ahora / 1700) * 10 }; poner(); };
    new IntersectionObserver(([e]) => { cancelAnimationFrame(deriva); if (e.isIntersecting) deriva = requestAnimationFrame(flotar); }).observe(svg);
    const encontrado = () => {
      cancelAnimationFrame(deriva); caja.classList.add("encontrado");
      caja.querySelector("[data-e-t]").textContent = "Encontrado. Todo vuelve a su nido.";
      caja.querySelector("[data-e-d]").textContent = "En un sitio real, ahora te llevaríamos al inicio.";
      resorte(nido, () => caja.querySelector("[data-volver]").focus());
    };
    p.addEventListener("pointerdown", (e) => { agarrado = true; cancelAnimationFrame(deriva); cancelAnimationFrame(raf); try { p.setPointerCapture(e.pointerId); } catch {} });
    p.addEventListener("pointermove", (e) => { if (!agarrado) return; pos = aSvg(e); poner(); });
    p.addEventListener("pointerup", () => { agarrado = false; if (Math.hypot(pos.x - nido.x, pos.y - nido.y) < 50) encontrado(); else resorte(inicio, () => (deriva = requestAnimationFrame(flotar))); });
    p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); encontrado(); } });
    caja.querySelector("[data-volver]").addEventListener("click", () => toast("En el sitio real, esto te lleva al inicio."));
  },
};
