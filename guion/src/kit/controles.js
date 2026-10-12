/* Botones y controles de elección. HTML como texto + comportamiento delegado (funciona en cualquier página). */
import { icono } from "./iconos.js?v=8ed8960";
import { carga } from "./punto.js?v=8ed8960";

/** Botón. variante: primario | acento | secundario | texto | peligro · tam: s | m | l */
export function boton(texto, { variante = "primario", tam = "m", ico = "", icoFin = "", deshabilitado = false, tipo = "button", attrs = "" } = {}) {
  const t = { s: 16, m: 20, l: 20 }[tam];
  return `<button type="${tipo}" class="boton boton--${variante} boton--${tam}" ${deshabilitado ? "disabled" : ""} ${attrs}>
    ${ico ? icono(ico, { tam: t }) : ""}<span class="boton__texto">${texto}</span>${icoFin ? icono(icoFin, { tam: t }) : ""}</button>`;
}

/** Botón solo ícono (siempre con etiqueta accesible). */
export function botonIcono(ico, etiqueta, { variante = "secundario", tam = "m", attrs = "" } = {}) {
  return `<button type="button" class="boton boton--${variante} boton--${tam} boton--icono" aria-label="${etiqueta}" title="${etiqueta}" ${attrs}>${icono(ico, { tam: tam === "s" ? 16 : 20 })}</button>`;
}

/** Estados de trabajo de un botón: cargando → listo → vuelve. */
export async function trabajar(btn, tarea, { cargando = "Guardando…", listo = "Listo" } = {}) {
  const original = btn.innerHTML, ancho = btn.offsetWidth;
  btn.style.minWidth = ancho + "px"; btn.disabled = true; btn.setAttribute("aria-busy", "true");
  btn.innerHTML = `${carga({ tam: 16, etiqueta: cargando })}<span class="boton__texto">${cargando}</span>`;
  try {
    await tarea();
    btn.classList.add("boton--listo");
    btn.innerHTML = `<span class="boton__aterriza" aria-hidden="true"><i></i>${icono("check", { tam: 18 })}</span><span class="boton__texto">${listo}</span>`;
    await new Promise((r) => setTimeout(r, 1400));
  } finally {
    btn.classList.remove("boton--listo"); btn.innerHTML = original; btn.disabled = false; btn.removeAttribute("aria-busy"); btn.style.minWidth = "";
  }
}

/** Segmentado: elección única entre 2–4 opciones visibles. */
export function segmento(opciones, { activa = 0, etiqueta = "", nombre = "" } = {}) {
  return `<div class="segmento" role="radiogroup" aria-label="${etiqueta}" data-segmento="${nombre}"><i class="segmento__ind" aria-hidden="true"></i>
    ${opciones.map((o, i) => `<button type="button" role="radio" aria-checked="${i === activa}" tabindex="${i === activa ? 0 : -1}" data-valor="${o}">${o}</button>`).join("")}</div>`;
}

/** Interruptor (encendido/apagado inmediato, sin «Guardar»). */
export function interruptor(texto, { activo = false, ayuda = "" } = {}) {
  return `<label class="interruptor"><span class="interruptor__texto"><b>${texto}</b>${ayuda ? `<span class="chico">${ayuda}</span>` : ""}</span>
    <button type="button" role="switch" aria-checked="${activo}" class="interruptor__boton"><i></i></button></label>`;
}

export function casilla(texto, { marcada = false, nombre = "c", indeterminada = false } = {}) {
  return `<label class="casilla"><input type="checkbox" name="${nombre}" ${marcada ? "checked" : ""} ${indeterminada ? "data-indeterminada" : ""}><span class="casilla__caja" aria-hidden="true"></span><span>${texto}</span></label>`;
}

export function radio(texto, { nombre = "r", marcado = false, ayuda = "" } = {}) {
  return `<label class="radio"><input type="radio" name="${nombre}" ${marcado ? "checked" : ""}><span class="radio__caja" aria-hidden="true"></span><span>${texto}${ayuda ? `<span class="chico">${ayuda}</span>` : ""}</span></label>`;
}

export function deslizador(etiqueta, { min = 0, max = 100, valor = 50, paso = 1, formato = (v) => v, propio = false } = {}) {
  return `<label class="deslizador"><span class="deslizador__cabeza"><b>${etiqueta}</b><output>${formato(valor)}</output></span>
    <input type="range" min="${min}" max="${max}" step="${paso}" value="${valor}" ${propio ? "data-propio" : ""} style="--p:${((valor - min) / (max - min)) * 100}%"></label>`;
}

/** Perilla: un control giratorio de cerámica (role=slider). Se gira arrastrando hacia arriba o abajo, o con las flechas. */
export function perilla(etiqueta, { min = 0, max = 100, valor = 50, paso = 1, unidad = "" } = {}) {
  const marcas = Array.from({ length: 25 }, (_, i) => `<i style="--a:${-135 + i * 11.25}deg"></i>`).join("");
  return `<div class="perilla" data-perilla style="--v:${(valor - min) / (max - min)}">
    <div class="perilla__marcas" aria-hidden="true">${marcas}</div>
    <div class="perilla__cuerpo ceramica" role="slider" tabindex="0" aria-label="${etiqueta}" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${valor}" data-min="${min}" data-max="${max}" data-paso="${paso}" data-unidad="${unidad}"><i class="perilla__punto"></i></div>
    <span class="perilla__valor"><b data-perilla-v>${valor.toLocaleString("es-CL")}${unidad}</b><span class="rotulo">${etiqueta}</span></span></div>`;
}

/** Botón que se mantiene presionado para confirmar lo irreversible. La barra se llena; si se suelta antes, vuelve. */
export function botonMantener(texto, { ms = 1400, variante = "peligro", attrs = "" } = {}) {
  return `<button type="button" class="boton boton--${variante} boton--m boton--mantener" data-mantener="${ms}" ${attrs}><span class="boton__lleno" aria-hidden="true"></span><span class="boton__texto">${texto}</span><span class="solo-lector"> (mantén presionado)</span></button>`;
}

/* ── Comportamiento delegado (una vez por documento) ── */
let activo = false;
export function activarControles(raiz = document) {
  if (activo) return; activo = true;
  raiz.addEventListener("click", (e) => {
    // el <label> reenvía el clic a su botón: basta con escuchar el botón
    const sw = e.target.closest?.(".interruptor__boton");
    if (sw) { sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") !== "true"); return; }
    const op = e.target.closest?.(".segmento[role=radiogroup] > button");
    if (op) {
      op.parentElement.querySelectorAll("button").forEach((b) => { const si = b === op; b.setAttribute("aria-checked", si); b.tabIndex = si ? 0 : -1; });
      op.parentElement.dispatchEvent(new CustomEvent("cambio", { detail: op.dataset.valor, bubbles: true }));
    }
  });
  raiz.addEventListener("keydown", (e) => {
    const op = e.target.closest?.(".segmento[role=radiogroup] > button");
    if (!op || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const hermanos = [...op.parentElement.children], i = hermanos.indexOf(op);
    const sig = hermanos[(i + (e.key === "ArrowRight" ? 1 : -1) + hermanos.length) % hermanos.length];
    sig.focus(); sig.click();
  });
  raiz.addEventListener("input", (e) => {
    const r = e.target.closest?.(".deslizador input[type=range]");
    if (!r) return;
    if (r.matches("[data-propio], [data-k], [data-c], [data-grano]")) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%"); return; } // escriben su propia salida
    r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
    const out = r.closest(".deslizador").querySelector("output");
    if (out) out.textContent = r.dataset.formato === "pesos" ? "$ " + Number(r.value).toLocaleString("es-CL") : r.value;
  });
  document.querySelectorAll("[data-indeterminada]").forEach((c) => (c.indeterminate = true));
  // hover de los botones: la luz del esmalte sigue al cursor (solo con mouse)
  raiz.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const b = e.target.closest?.(".boton"); if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%"); b.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
  }, { passive: true });
  // segmentado: el indicador (con su punto) se desliza a la opción elegida
  raiz.addEventListener("cambio", (e) => { if (e.target.matches?.(".segmento")) moverIndicador(e.target); });
  // perillas: arrastrar hacia arriba sube; flechas, Inicio, Fin y Re Pág / Av Pág
  raiz.addEventListener("pointerdown", (e) => {
    const k = e.target.closest?.(".perilla__cuerpo"); if (!k) return;
    e.preventDefault(); k.focus();
    try { k.setPointerCapture(e.pointerId); } catch {}
    const y0 = e.clientY, v0 = +k.getAttribute("aria-valuenow"), min = +k.dataset.min, max = +k.dataset.max;
    const mover = (ev) => ponerPerilla(k, v0 + ((y0 - ev.clientY) / 160) * (max - min));
    const soltar = () => { k.removeEventListener("pointermove", mover); k.removeEventListener("pointerup", soltar); };
    k.addEventListener("pointermove", mover); k.addEventListener("pointerup", soltar);
  });
  raiz.addEventListener("keydown", (e) => {
    const k = e.target.closest?.(".perilla__cuerpo"); if (!k) return;
    const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
    if (e.key === "Home") { e.preventDefault(); ponerPerilla(k, +k.dataset.min); }
    if (e.key === "End") { e.preventDefault(); ponerPerilla(k, +k.dataset.max); }
    if (d) { e.preventDefault(); ponerPerilla(k, +k.getAttribute("aria-valuenow") + d * +k.dataset.paso); }
  });
  // mantener presionado: la barra se llena en ms; si se suelta antes, vuelve
  raiz.addEventListener("pointerdown", (e) => {
    const b = e.target.closest?.("[data-mantener]"); if (!b || b.disabled) return;
    mantener(b);
  });
  raiz.addEventListener("keydown", (e) => {
    const b = e.target.closest?.("[data-mantener]"); if (!b || e.repeat || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault(); mantener(b, e.key);
  });
}

function mantener(b, tecla = null) {
  if (b.classList.contains("manteniendo")) return;
  const ms = +b.dataset.mantener, lleno = b.querySelector(".boton__lleno");
  const a = lleno.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: ms, easing: "linear", fill: "forwards" });
  b.classList.add("manteniendo");
  const quitar = () => { b.removeEventListener("pointerup", cancelar); b.removeEventListener("pointerleave", cancelar); removeEventListener("keyup", alSoltarTecla); };
  const cancelar = () => { quitar(); if (!b.classList.contains("manteniendo")) return; b.classList.remove("manteniendo"); a.reverse(); };
  const alSoltarTecla = (ev) => { if (ev.key === tecla) cancelar(); };
  b.addEventListener("pointerup", cancelar); b.addEventListener("pointerleave", cancelar);
  if (tecla) addEventListener("keyup", alSoltarTecla);
  a.finished.then(() => {
    if (!b.classList.contains("manteniendo")) return;
    quitar(); b.classList.remove("manteniendo"); b.classList.add("confirmado");
    b.dispatchEvent(new CustomEvent("confirmado", { bubbles: true }));
    setTimeout(() => { a.cancel(); b.classList.remove("confirmado"); }, 900);
  }).catch(() => {});
}

function ponerPerilla(k, v) {
  const min = +k.dataset.min, max = +k.dataset.max, paso = +k.dataset.paso;
  v = Math.round(Math.max(min, Math.min(max, v)) / paso) * paso;
  k.setAttribute("aria-valuenow", v);
  const p = k.closest(".perilla"); p.style.setProperty("--v", (v - min) / (max - min));
  p.querySelector("[data-perilla-v]").textContent = v.toLocaleString("es-CL") + k.dataset.unidad;
  p.dispatchEvent(new CustomEvent("cambio", { detail: v, bubbles: true }));
}

/** Pone el indicador del segmentado sobre la opción elegida (al pintar y al cambiar). */
export function moverIndicador(seg) {
  const op = seg.querySelector('[aria-checked="true"], [aria-pressed="true"]'), ind = seg.querySelector(".segmento__ind");
  if (!op || !ind || !op.offsetWidth) return;
  ind.style.setProperty("--x", op.offsetLeft + "px"); ind.style.setProperty("--w", op.offsetWidth + "px");
  seg.classList.add("segmento--listo");
}
export function prepararSegmentos(raiz = document) { raiz.querySelectorAll(".segmento").forEach(moverIndicador); }
