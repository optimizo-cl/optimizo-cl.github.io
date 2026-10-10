/* Botones y controles de elección. HTML como texto + comportamiento delegado (funciona en cualquier página). */
import { icono } from "./iconos.js";
import { carga } from "./punto.js";

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
    btn.innerHTML = `${icono("check", { tam: 18 })}<span class="boton__texto">${listo}</span>`;
    await new Promise((r) => setTimeout(r, 1400));
  } finally {
    btn.classList.remove("boton--listo"); btn.innerHTML = original; btn.disabled = false; btn.removeAttribute("aria-busy"); btn.style.minWidth = "";
  }
}

/** Segmentado: elección única entre 2–4 opciones visibles. */
export function segmento(opciones, { activa = 0, etiqueta = "", nombre = "" } = {}) {
  return `<div class="segmento" role="radiogroup" aria-label="${etiqueta}" data-segmento="${nombre}">
    ${opciones.map((o, i) => `<button type="button" role="radio" aria-checked="${i === activa}" aria-pressed="${i === activa}" tabindex="${i === activa ? 0 : -1}" data-valor="${o}">${o}</button>`).join("")}</div>`;
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

export function deslizador(etiqueta, { min = 0, max = 100, valor = 50, paso = 1, formato = (v) => v } = {}) {
  return `<label class="deslizador"><span class="deslizador__cabeza"><b>${etiqueta}</b><output>${formato(valor)}</output></span>
    <input type="range" min="${min}" max="${max}" step="${paso}" value="${valor}" style="--p:${((valor - min) / (max - min)) * 100}%"></label>`;
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
      op.parentElement.querySelectorAll("button").forEach((b) => { const si = b === op; b.setAttribute("aria-checked", si); b.setAttribute("aria-pressed", si); b.tabIndex = si ? 0 : -1; });
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
    r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
    const out = r.closest(".deslizador").querySelector("output");
    if (out) out.textContent = r.dataset.formato === "pesos" ? "$ " + Number(r.value).toLocaleString("es-CL") : r.value;
  });
  document.querySelectorAll("[data-indeterminada]").forEach((c) => (c.indeterminate = true));
}
