/* Avisos: toast con deshacer (cola), banner, alerta, insignias. Los avisos de app viven en la app, no imitan al sistema. */
import { icono } from "./iconos.js";

const ICO = { exito: "check-circle", alerta: "warning", error: "warning-circle", info: "info", neutro: "info" };

/* ── Toast ── */
let pila;
function asegurarPila() {
  if (pila?.isConnected) return pila;
  pila = document.createElement("div");
  pila.className = "toasts"; pila.setAttribute("role", "region"); pila.setAttribute("aria-label", "Avisos");
  document.body.appendChild(pila);
  return pila;
}
/** Muestra un toast. accion: { texto, alHacer }. Dura 5 s (7 s si tiene acción); se pausa con el mouse encima. */
export function toast(texto, { tono = "neutro", accion = null, duracion } = {}) {
  const p = asegurarPila();
  const t = document.createElement("div");
  t.className = `toast toast--${tono}`; t.setAttribute("role", tono === "error" ? "alert" : "status");
  t.innerHTML = `${icono(ICO[tono], { tam: 20 })}<span class="toast__texto">${texto}</span>
    ${accion ? `<button type="button" class="toast__accion">${accion.texto}</button>` : ""}
    <button type="button" class="toast__cerrar" aria-label="Cerrar aviso">${icono("x", { tam: 16 })}</button>`;
  p.appendChild(t);
  import("./iconos.js").then((m) => m.rellenarIconos());
  const cerrar = () => { t.classList.add("toast--sale"); t.addEventListener("animationend", () => t.remove(), { once: true }); };
  let restante = duracion ?? (accion ? 7000 : 5000), inicio = Date.now(), timer = setTimeout(cerrar, restante);
  t.addEventListener("mouseenter", () => { clearTimeout(timer); restante -= Date.now() - inicio; });
  t.addEventListener("mouseleave", () => { inicio = Date.now(); timer = setTimeout(cerrar, Math.max(restante, 1500)); });
  t.querySelector(".toast__cerrar").addEventListener("click", cerrar);
  t.querySelector(".toast__accion")?.addEventListener("click", () => { accion.alHacer?.(); cerrar(); });
  while (p.children.length > 3) p.firstElementChild.remove(); // máximo 3 a la vez
  return cerrar;
}

/** Banner de página o sección (persistente hasta que se resuelve o se cierra). */
export function banner(titulo, texto, { tono = "info", accion = "", cerrable = true } = {}) {
  return `<div class="banner banner--${tono}" role="${tono === "error" ? "alert" : "status"}">${icono(ICO[tono], { tam: 20 })}
    <div class="banner__texto"><b>${titulo}</b><span>${texto}</span></div>
    ${accion ? `<button type="button" class="banner__accion">${accion}</button>` : ""}
    ${cerrable ? `<button type="button" class="banner__cerrar" aria-label="Cerrar" onclick="this.closest('.banner').remove()">${icono("x", { tam: 16 })}</button>` : ""}</div>`;
}

/** Alerta en línea: dentro del contenido, junto a lo que afecta. */
export function alerta(texto, { tono = "alerta", titulo = "" } = {}) {
  return `<div class="alerta alerta--${tono}" role="note">${icono(ICO[tono], { tam: 18 })}<p>${titulo ? `<b>${titulo}</b> ` : ""}${texto}</p></div>`;
}

/** Insignia de estado. tono: neutro | exito | alerta | error | info | acento */
export const insignia = (texto, { tono = "neutro", punto = true } = {}) => `<span class="insignia insignia--${tono}">${punto ? "<i></i>" : ""}${texto}</span>`;
export const etiqueta = (texto, { quitar = true } = {}) => `<span class="etiqueta">${texto}${quitar ? `<button type="button" aria-label="Quitar ${texto}" onclick="this.parentElement.remove()">${icono("x", { tam: 12 })}</button>` : ""}</span>`;
export const contador = (n) => `<span class="contador" aria-label="${n} sin leer">${n > 99 ? "99+" : n}</span>`;
