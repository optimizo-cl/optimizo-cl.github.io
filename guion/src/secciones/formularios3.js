/* Capítulo 3 · Subir archivos y Encuesta, rehechos (plan en docs/PLAN-ARCHIVOS-ENCUESTA.md).
   Las dos piezas usan el isotipo como medidor: el disco se llena con lo que llega (archivos) o con la nota (encuesta),
   y el punto dice el estado: en su nido = todo bien; afuera = falta algo. */
import { campo } from "../kit/campos.js?v=7a04113";
import { boton, trabajar } from "../kit/controles.js?v=7a04113";
import { toast } from "../kit/avisos.js?v=7a04113";
import { icono, rellenarIconos } from "../kit/iconos.js?v=7a04113";
import { DISCO } from "../kit/marca.js?v=7a04113";
import { pieza, activarPiezas, codigo } from "../kit/presentar.js?v=7a04113";
import { movimientoReducido } from "../kit/escenas/vigia.js?v=7a04113";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const reducido = () => movimientoReducido();
const NIDO = { x: 25.863281, y: 22.753906, r: 17.289 };
const usoDe = (lista, cod) => `<div class="rejilla-2"><ul class="lista-punto">${lista.map((r) => `<li>${r}</li>`).join("")}</ul>${cod ? codigo(cod) : ""}</div>`;
let n = 0;

/** Isotipo medidor: contorno, relleno que sube desde abajo (--v 0–1) y el punto aparte (se mueve con moverPunto). */
const medidor = (clase = "") => { const id = `med${++n}`; return `<svg class="medidor ${clase}" viewBox="-40 -40 218 218" aria-hidden="true"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><rect class="medidor__nivel" x="0" y="2.6" width="160" height="140"/></clipPath></defs>
  <g transform="translate(-6.054688 -2.601562)"><path class="medidor__contorno" fill-rule="evenodd" d="${DISCO}"/><g clip-path="url(#${id})"><path class="medidor__relleno" fill-rule="evenodd" d="${DISCO}"/></g>
  <circle class="medidor__nido" cx="${NIDO.x}" cy="${NIDO.y}" r="${NIDO.r - 1.5}"/><circle class="medidor__punto" cx="${NIDO.x}" cy="${NIDO.y}" r="${NIDO.r}"/></g></svg>`; };
const nivel = (svg, v) => (svg.querySelector(".medidor__nivel").style.transform = `translateY(${(138.4 * (1 - Math.max(0, Math.min(1, v)))).toFixed(2)}px)`);
/** Mueve el punto del medidor a (x, y) relativo a su nido, en un arco limpio. */
function moverPunto(svg, a, { alto = 26, dur = 800 } = {}) {
  const p = svg.querySelector(".medidor__punto"), de = p._pos || [0, 0];
  p._pos = a;
  if (reducido()) { p.style.transform = `translate(${a[0]}px, ${a[1]}px)`; return Promise.resolve(); }
  cancelAnimationFrame(p._raf);
  const cx = (de[0] + a[0]) / 2, cy = Math.min(de[1], a[1]) - alto, t0 = performance.now();
  return new Promise((fin) => { const f = (ahora) => { const q = Math.min(1, (ahora - t0) / dur), e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
    const x = (1 - e) * (1 - e) * de[0] + 2 * (1 - e) * e * cx + e * e * a[0], y = (1 - e) * (1 - e) * de[1] + 2 * (1 - e) * e * cy + e * e * a[1];
    p.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`; if (q < 1) p._raf = requestAnimationFrame(f); else fin(); }; p._raf = requestAnimationFrame(f); });
}

/* ═════════ Subir archivos ═════════ */
const TIPOS = { xlsx: "Excel", xls: "Excel", csv: "CSV", pdf: "PDF" }, MAX = 25 * 1024 * 1024;
const peso = (b) => (b >= 1e6 ? (b / 1e6).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1e3)) + " kB");
/** Lee un CSV de verdad y cuenta filas y columnas (solo los primeros 2 MB). */
async function leerCSV(f) {
  if (!(f instanceof Blob)) return "";
  const txt = await f.slice(0, 2e6).text(), filas = txt.split(/\r?\n/).filter((l) => l.trim());
  if (!filas.length) return "vacío";
  const sep = (filas[0].match(/;/g) || []).length > (filas[0].match(/,/g) || []).length ? ";" : ",";
  return `${(filas.length - 1).toLocaleString("es-CL")} filas · ${filas[0].split(sep).length} columnas`;
}
function ejemplos() {
  const csv = ["cliente;rut;comuna;vendedor", ...Array.from({ length: 1240 }, (_, i) => `Cliente ${i + 1};76.${100 + (i % 900)}.${300 + (i % 600)}-${i % 9};Rancagua;Jorge Molina`)].join("\n");
  return [
    new File([csv], "Clientes activos.csv", { type: "text/csv" }),
    new File([new Uint8Array(840 * 1024)], "Cotizaciones 2026.xlsx"),
    new File([new Uint8Array(310 * 1024)], "Lista de precios octubre.pdf"),
    new File(["x"], "Fotos de bodega.zip"),
  ];
}

export const formularios3 = {
  async archivos(el) {
    const vivo = `<div class="subir" data-subir>
      <div class="subir__zona" data-zona>
        ${medidor("subir__medidor")}
        <div class="subir__texto"><b data-z-t>Suelta tus planillas acá</b><span class="chico" data-z-d>Excel, CSV o PDF · hasta 25 MB cada uno</span>
          <div class="fila-botones">${boton("Elegir archivos", { variante: "secundario", ico: "upload-simple", attrs: "data-elegir" })}${boton("Usar archivos de ejemplo", { variante: "texto", tam: "s", attrs: "data-ejemplo" })}</div></div>
        <input type="file" multiple hidden data-input accept=".xlsx,.xls,.csv,.pdf"></div>
      <div class="subir__lista">
        <div class="subir__cabeza"><b>Archivos</b><span class="rotulo" data-resumen>Ninguno todavía</span></div>
        <ul class="subir__filas" data-filas aria-live="polite"></ul>
        <div class="subir__pie">${boton("Enviar a Optimizo", { variante: "acento", attrs: "data-enviar disabled" })}<span class="chico" data-pie>Se activa cuando todo lo que subiste está listo.</span></div>
      </div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["El disco grande se llena con todo lo que va subiendo; cada archivo tiene su propio disco chico.", "Con el archivo arriba, el punto aterriza en su nido. Si algo falla, el punto se queda afuera y la fila dice cómo arreglarlo.", "Los CSV se leen de verdad: muestra cuántas filas y columnas trae, para confirmar que es el archivo correcto.", "Se puede soltar en toda la zona, elegir con el botón o usar el teclado; cada archivo se puede quitar."], 'zona.addEventListener("drop", (e) => subir([...e.dataTransfer.files]));') });
    activarPiezas(el); await rellenarIconos();
    const raiz = el.querySelector("[data-subir]"), zona = raiz.querySelector("[data-zona]"), input = raiz.querySelector("[data-input]"), lista = raiz.querySelector("[data-filas]");
    const grande = raiz.querySelector(".subir__medidor"), enviar = raiz.querySelector("[data-enviar]");
    const archivos = []; // { f, fila, svg, total, hecho, error, listo }
    const estadoGeneral = () => {
      const buenos = archivos.filter((a) => !a.error), total = buenos.reduce((s, a) => s + a.total, 0), hecho = buenos.reduce((s, a) => s + a.hecho, 0);
      const todos = buenos.length && buenos.every((a) => a.listo);
      nivel(grande, total ? hecho / total : 0);
      raiz.querySelector("[data-resumen]").textContent = archivos.length ? `${buenos.length} de ${archivos.length} · ${peso(total)}` : "Ninguno todavía";
      enviar.disabled = !todos;
      raiz.querySelector("[data-pie]").textContent = todos ? "Todo listo para enviar." : archivos.some((a) => a.error) && !buenos.length ? "Ningún archivo se puede subir todavía." : "Se activa cuando todo lo que subiste está listo.";
      if (todos !== zona._lleno) { zona._lleno = todos; moverPunto(grande, todos ? [0, 0] : [-30, -34], { alto: 30 }); }
    };
    const agregar = async (lista0) => {
      for (const f of lista0) {
        const ext = (f.name.split(".").pop() || "").toLowerCase();
        const error = !TIPOS[ext] ? "Ese formato no se puede leer. Usa Excel, CSV o PDF (si son fotos, júntalas en un PDF)." : f.size > MAX ? `Pesa ${peso(f.size)}: el máximo es 25 MB. Divide el archivo o guárdalo como CSV.` : "";
        const a = { f, total: f.size, hecho: 0, error, listo: false };
        const li = document.createElement("li"); li.className = `subir__fila ${error ? "subir__fila--error" : ""}`;
        li.innerHTML = `${medidor("subir__mini")}<div class="subir__info"><b>${f.name}</b><span class="chico" data-meta>${error || `${TIPOS[ext]} · ${peso(f.size)}`}</span></div><span class="subir__estado rotulo" data-est>${error ? "No se puede subir" : "Subiendo…"}</span><button type="button" class="subir__quitar" aria-label="Quitar ${f.name}">${icono("x", { tam: 16 })}</button>`;
        lista.appendChild(li); a.fila = li; a.svg = li.querySelector(".medidor"); archivos.push(a);
        a.svg.querySelector(".medidor__punto").style.transform = "translate(-30px, -34px)"; a.svg.querySelector(".medidor__punto")._pos = [-30, -34];
        li.querySelector(".subir__quitar").addEventListener("click", () => { archivos.splice(archivos.indexOf(a), 1); a.cancelado = true; li.classList.add("sale"); setTimeout(() => li.remove(), reducido() ? 0 : 300); estadoGeneral(); });
        if (ext === "csv" && !error) leerCSV(f).then((t) => { if (t) li.querySelector("[data-meta]").textContent = `CSV · ${peso(f.size)} · ${t}`; });
        if (!error) subirUno(a);
      }
      await rellenarIconos(); estadoGeneral();
    };
    const subirUno = (a) => {
      const dur = reducido() ? 0 : 900 + Math.min(2600, a.total / 900), t0 = performance.now();
      const f = (ahora) => {
        if (a.cancelado) return;
        const q = dur ? Math.min(1, (ahora - t0) / dur) : 1; a.hecho = a.total * q; nivel(a.svg, q);
        a.fila.querySelector("[data-est]").textContent = q < 1 ? `${Math.round(q * 100)} %` : "Listo";
        estadoGeneral();
        if (q < 1) return requestAnimationFrame(f);
        a.listo = true; a.fila.classList.add("subir__fila--lista"); moverPunto(a.svg, [0, 0], { alto: 18, dur: 650 }); estadoGeneral();
      };
      requestAnimationFrame(f);
    };
    raiz.querySelector("[data-elegir]").addEventListener("click", () => input.click());
    raiz.querySelector("[data-ejemplo]").addEventListener("click", () => agregar(ejemplos()));
    input.addEventListener("change", () => { agregar([...input.files]); input.value = ""; });
    // soltar en toda la zona: el punto sale del nido como invitando a entrar
    let dentro = 0;
    zona.addEventListener("dragenter", (e) => { e.preventDefault(); if (!dentro++) { zona.classList.add("sobre"); raiz.querySelector("[data-z-t]").textContent = "Suéltalos"; } });
    zona.addEventListener("dragover", (e) => e.preventDefault());
    zona.addEventListener("dragleave", () => { if (!--dentro) { zona.classList.remove("sobre"); raiz.querySelector("[data-z-t]").textContent = "Suelta tus planillas acá"; } });
    zona.addEventListener("drop", (e) => { e.preventDefault(); dentro = 0; zona.classList.remove("sobre"); raiz.querySelector("[data-z-t]").textContent = "Suelta tus planillas acá"; agregar([...e.dataTransfer.files]); });
    enviar.addEventListener("click", async () => {
      await trabajar(enviar, () => new Promise((r) => setTimeout(r, 1100)), { cargando: "Enviando…", listo: "Enviado" });
      toast(`${archivos.filter((a) => !a.error).length} archivos enviados. Te avisamos cuando los revisemos.`, { tono: "exito" });
    });
    grande.querySelector(".medidor__punto").style.transform = "translate(-30px, -34px)"; grande.querySelector(".medidor__punto")._pos = [-30, -34];
    nivel(grande, 0);
  },

  /* ═════════ Encuesta ═════════ */
  async encuesta(el) {
    const vivo = `<div class="encuesta2" data-encuesta>
      <div class="encuesta2__medidor">${medidor("encuesta2__iso")}<p class="encuesta2__nota" aria-hidden="true"><b data-nota>–</b><span>/10</span></p></div>
      <form class="encuesta2__form papel" novalidate data-form>
        <div class="encuesta2__paso" data-paso="1">
          <p class="encuesta2__q" id="enc-q">¿Qué tan probable es que recomiendes Optimizo a un colega?</p>
          <div class="encuesta2__escala" role="radiogroup" aria-labelledby="enc-q">${Array.from({ length: 11 }, (_, k) => `<button type="button" role="radio" aria-checked="false" tabindex="${k ? -1 : 0}" data-n="${k}" style="--k:${k}">${k}</button>`).join("")}</div>
          <div class="encuesta2__extremos rotulo"><span>Nada probable</span><span>Muy probable</span></div>
        </div>
        <div class="encuesta2__paso encuesta2__paso--2" data-paso="2" hidden>
          <p class="encuesta2__q2" data-q2></p>
          ${campo("Tu respuesta", { tipo: "area", max: 400, marcador: "En una o dos líneas" })}
          <div class="fila-botones">${boton("Enviar", { variante: "acento", tipo: "submit" })}${boton("Cambiar nota", { variante: "texto", tam: "s", attrs: "data-volver" })}</div>
        </div>
        <div class="encuesta2__gracias" data-gracias hidden><b class="titulo-3">Gracias.</b><p class="chico" data-gracias-t></p>${boton("Responder otra vez", { variante: "texto", tam: "s", attrs: "data-otra" })}</div>
      </form></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["La nota llena el disco: 10 lo deja completo.", "El punto dice qué tan cerca estamos: 9–10 en su nido · 7–8 asomado en la mordida · 0–6 lejos, afuera.", "La segunda pregunta cambia según la nota y es una sola.", "Con teclado: flechas para elegir, Enter para seguir."]) });
    activarPiezas(el);
    const raiz = el.querySelector("[data-encuesta]"), svg = raiz.querySelector(".encuesta2__iso"), botones = [...raiz.querySelectorAll("[data-n]")];
    const paso1 = raiz.querySelector('[data-paso="1"]'), paso2 = raiz.querySelector('[data-paso="2"]'), gracias = raiz.querySelector("[data-gracias]");
    const LUGAR = { promotor: [0, 0], neutro: [-16, -20], detractor: [-58, -2] };
    let nota = null;
    svg.querySelector(".medidor__punto")._pos = LUGAR.detractor; svg.querySelector(".medidor__punto").style.transform = `translate(${LUGAR.detractor[0]}px, ${LUGAR.detractor[1]}px)`;
    nivel(svg, 0);
    const elegir = (b) => {
      botones.forEach((x) => { const si = x === b; x.setAttribute("aria-checked", si); x.tabIndex = si ? 0 : -1; x.classList.toggle("bajo", +x.dataset.n <= +b.dataset.n); });
      nota = +b.dataset.n; const tipo = nota >= 9 ? "promotor" : nota >= 7 ? "neutro" : "detractor";
      raiz.dataset.tipo = tipo; nivel(svg, nota / 10); moverPunto(svg, LUGAR[tipo], { alto: tipo === "promotor" ? 34 : 18, dur: 900 });
      raiz.querySelector("[data-nota]").textContent = nota;
      raiz.querySelector("[data-q2]").textContent = tipo === "promotor" ? "¡Gracias! ¿Qué fue lo que más te sirvió?" : tipo === "neutro" ? "Gracias. ¿Qué nos falta para un 10?" : "Gracias por decirlo. ¿Qué tendríamos que arreglar primero?";
      clearTimeout(raiz._t); raiz._t = setTimeout(() => { paso2.hidden = false; paso2.classList.add("entra-paso2"); }, reducido() ? 0 : 500);
    };
    botones.forEach((b, i) => {
      b.addEventListener("click", () => elegir(b));
      b.addEventListener("keydown", (e) => { const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!d) return; e.preventDefault(); const s = botones[Math.max(0, Math.min(10, i + d))]; s.focus(); elegir(s); });
    });
    raiz.querySelector("[data-volver]").addEventListener("click", () => botones[nota ?? 0].focus());
    raiz.querySelector("[data-form]").addEventListener("submit", async (e) => {
      e.preventDefault(); if (nota == null) return;
      await trabajar(e.submitter || raiz.querySelector("[type=submit]"), () => new Promise((r) => setTimeout(r, 700)), { cargando: "Enviando…", listo: "Enviado" });
      paso1.hidden = true; paso2.hidden = true; gracias.hidden = false;
      raiz.querySelector("[data-gracias-t]").textContent = nota >= 9 ? "Nos alegra. Seguimos así." : "Lo leemos todo y te contamos qué cambiamos.";
      if (nota < 9) { nivel(svg, 1); await moverPunto(svg, LUGAR.promotor, { alto: 40, dur: 1000 }); } // al responder, el disco se completa: lo escuchamos
    });
    raiz.querySelector("[data-otra]").addEventListener("click", () => { paso1.hidden = false; paso2.hidden = true; gracias.hidden = true; nota = null; botones.forEach((x) => { x.setAttribute("aria-checked", "false"); x.classList.remove("bajo"); }); nivel(svg, 0); moverPunto(svg, LUGAR.detractor, { alto: 20 }); raiz.querySelector("[data-nota]").textContent = "–"; delete raiz.dataset.tipo; });
  },
};
