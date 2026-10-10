/* Menús, popovers y diálogos. Los flotantes van a <body> (no los recorta ningún contenedor) y nacen del botón. */
import { icono, rellenarIconos } from "./iconos.js";

let abierto = null; // un flotante a la vez
function cerrarAbierto(devolverFoco = true) {
  if (!abierto) return;
  const { el, ancla, limpiar } = abierto; abierto = null;
  limpiar();
  el.classList.add("flotante--sale");
  el.addEventListener("animationend", () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 400);
  ancla.setAttribute("aria-expanded", "false");
  if (devolverFoco) ancla.focus();
}

function posicionar(el, ancla, { alinear = "inicio" } = {}) {
  const r = ancla.getBoundingClientRect(), m = el.getBoundingClientRect();
  const abajo = innerHeight - r.bottom > m.height + 16 || r.top < m.height + 16;
  let x = alinear === "fin" ? r.right - m.width : r.left;
  x = Math.max(12, Math.min(x, innerWidth - m.width - 12));
  const y = abajo ? r.bottom + 8 : r.top - m.height - 8;
  el.style.left = x + scrollX + "px"; el.style.top = y + scrollY + "px";
  // nace del botón: el origen de la animación queda en el punto del ancla
  el.style.transformOrigin = `${r.left + r.width / 2 - x}px ${abajo ? 0 : m.height}px`;
}

function montar(el, ancla, opciones) {
  if (abierto?.ancla === ancla) { cerrarAbierto(); return null; }
  cerrarAbierto(false);
  document.body.appendChild(el); rellenarIconos();
  posicionar(el, ancla, opciones);
  ancla.setAttribute("aria-expanded", "true");
  const fuera = (e) => { if (!el.contains(e.target) && !ancla.contains(e.target)) cerrarAbierto(false); };
  const tecla = (e) => { if (e.key === "Escape") { e.preventDefault(); cerrarAbierto(); } };
  const reubicar = () => posicionar(el, ancla, opciones);
  setTimeout(() => document.addEventListener("pointerdown", fuera), 0);
  document.addEventListener("keydown", tecla); addEventListener("resize", reubicar); addEventListener("scroll", reubicar, true);
  abierto = { el, ancla, limpiar: () => { document.removeEventListener("pointerdown", fuera); document.removeEventListener("keydown", tecla); removeEventListener("resize", reubicar); removeEventListener("scroll", reubicar, true); } };
  return el;
}

/** Menú de acciones. items: [{ texto, ico, atajo, alHacer, peligro } | "—" (separador)] */
export function abrirMenu(ancla, items, opciones = {}) {
  const el = document.createElement("div");
  el.className = "flotante menu"; el.setAttribute("role", "menu");
  el.innerHTML = items.map((it) => it === "—" ? `<hr class="menu__sep" role="separator">` :
    `<button type="button" role="menuitem" class="menu__item ${it.peligro ? "menu__item--peligro" : ""}" tabindex="-1">${it.ico ? icono(it.ico, { tam: 18 }) : "<i></i>"}<span>${it.texto}</span>${it.atajo ? `<kbd>${it.atajo}</kbd>` : ""}</button>`).join("");
  if (!montar(el, ancla, opciones)) return;
  const botones = [...el.querySelectorAll(".menu__item")];
  botones[0]?.focus();
  el.addEventListener("keydown", (e) => {
    const i = botones.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); botones[(i + 1) % botones.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); botones[(i - 1 + botones.length) % botones.length].focus(); }
    if (e.key === "Home") { e.preventDefault(); botones[0].focus(); }
    if (e.key === "End") { e.preventDefault(); botones.at(-1).focus(); }
    if (e.key === "Tab") cerrarAbierto(false);
  });
  const reales = items.filter((x) => x !== "—");
  botones.forEach((b, i) => b.addEventListener("click", () => { cerrarAbierto(); reales[i].alHacer?.(); }));
}

/** Popover: contenido libre anclado a un botón (filtros, detalles). */
export function abrirPopover(ancla, html, opciones = {}) {
  const el = document.createElement("div");
  el.className = "flotante popover"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", opciones.etiqueta || "Detalle");
  el.innerHTML = html;
  if (montar(el, ancla, opciones)) el.querySelector("button, input, select, a")?.focus();
}
export const cerrarFlotante = () => cerrarAbierto();

/* ── Diálogos ── */
/** Diálogo modal o de hoja. acciones: [{ texto, variante, alHacer, cierra = true }]. Devuelve el <dialog>. */
export function abrirDialogo({ titulo, cuerpo, acciones = [], tipo = "modal", ancho = 520 }) {
  const d = document.createElement("dialog");
  d.className = `dialogo dialogo--${tipo}`; d.style.setProperty("--ancho", ancho + "px");
  d.setAttribute("aria-labelledby", "dialogo-titulo");
  d.innerHTML = `<div class="dialogo__caja">
    <header class="dialogo__cabeza"><h2 id="dialogo-titulo" class="titulo-3">${titulo}</h2>
      <button type="button" class="boton boton--texto boton--s boton--icono" data-cerrar aria-label="Cerrar">${icono("x", { tam: 18 })}</button></header>
    <div class="dialogo__cuerpo">${cuerpo}</div>
    ${acciones.length ? `<footer class="dialogo__pie">${acciones.map((a, i) => `<button type="button" class="boton boton--${a.variante || "secundario"} boton--m" data-accion="${i}">${a.texto}</button>`).join("")}</footer>` : ""}
  </div>`;
  document.body.appendChild(d); rellenarIconos();
  const cerrar = () => { d.classList.add("dialogo--sale"); setTimeout(() => { d.close(); d.remove(); }, 260); };
  d.addEventListener("cancel", (e) => { e.preventDefault(); cerrar(); });
  d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-cerrar]")) cerrar(); });
  d.querySelectorAll("[data-accion]").forEach((b) => b.addEventListener("click", () => {
    const a = acciones[+b.dataset.accion]; const r = a.alHacer?.(d);
    if (r !== false && a.cierra !== false) cerrar();
  }));
  d.showModal();
  (d.querySelector(".dialogo__cuerpo input, .dialogo__cuerpo button") || d.querySelector("[data-accion]"))?.focus();
  return d;
}

/** Confirmación destructiva: se escribe el nombre para habilitar el botón. */
export function confirmarDestructivo({ titulo, texto, nombre, accion = "Eliminar", alConfirmar }) {
  const d = abrirDialogo({
    titulo, ancho: 460,
    cuerpo: `<p class="chico">${texto}</p><label class="campo" style="margin-top:16px"><span class="campo__etiqueta">Escribe <b>${nombre}</b> para confirmar</span>
      <span class="campo__control"><input type="text" autocomplete="off" data-confirmar></span></label>`,
    acciones: [{ texto: "Cancelar" }, { texto: accion, variante: "peligro", alHacer: () => alConfirmar?.() }],
  });
  const boton = d.querySelector('[data-accion="1"]'); boton.disabled = true;
  d.querySelector("[data-confirmar]").addEventListener("input", (e) => (boton.disabled = e.target.value.trim() !== nombre));
  return d;
}
