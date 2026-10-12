/* Avisos: toast con deshacer (cola), banner, alerta, insignias. Los avisos de app viven en la app, no imitan al sistema. */
import { icono } from "./iconos.js?v=5bdbf1b";

const ICO = { exito: "check-circle", alerta: "warning", error: "warning-circle", info: "info", neutro: "info" };

/* ── Toast ── */
let pila;
function asegurarPila() {
  if (pila?.isConnected) return pila;
  pila = document.createElement("div");
  pila.className = "toasts"; pila.setAttribute("role", "region"); pila.setAttribute("aria-label", "Avisos");
  document.body.appendChild(pila);
  new MutationObserver(() => reordenar(pila)).observe(pila, { childList: true });
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
  import("./iconos.js?v=5bdbf1b").then((m) => m.rellenarIconos());
  const cerrar = () => { t.classList.add("toast--sale"); t.addEventListener("animationend", () => t.remove(), { once: true }); };
  let restante = duracion ?? (accion ? 7000 : 5000), inicio = Date.now(), timer = setTimeout(cerrar, restante);
  t.addEventListener("mouseenter", () => { clearTimeout(timer); restante -= Date.now() - inicio; });
  t.addEventListener("mouseleave", () => { inicio = Date.now(); timer = setTimeout(cerrar, Math.max(restante, 1500)); });
  t.querySelector(".toast__cerrar").addEventListener("click", cerrar);
  t.querySelector(".toast__accion")?.addEventListener("click", () => { accion.alHacer?.(); cerrar(); });
  while (p.children.length > 3) p.firstElementChild.remove(); // máximo 3 a la vez
  reordenar(p);
  t.addEventListener("animationend", () => reordenar(p));
  return cerrar;
}
function reordenar(p) {
  const hijos = [...p.children].filter((x) => !x.classList.contains("toast--sale"));
  hijos.forEach((t, i) => t.style.setProperty("--k", hijos.length - 1 - i));
  let alto = 0; [...hijos].reverse().forEach((t) => { t.style.setProperty("--y", alto + "px"); alto += t.offsetHeight + 10; });
}

/** El estado dicho con el isotipo: el punto en su nido (listo), asomado en la mordida (atención), saliendo como en el
    logo (informa) o lejos, afuera (algo falló). El disco lleva el color; la posición del punto lo dice sin color. */
let nIso = 0;
const POSE = { exito: [16, 17], info: [6.2, 7.2], alerta: [9, 10], error: [28.4, 5.4], neutro: [6.2, 7.2] };
export function isoEstado(tono = "info") {
  const id = `iso-e${++nIso}`, [px, py] = POSE[tono] ?? POSE.info;
  return `<svg class="iso-estado iso-estado--${tono}" viewBox="0 0 32 32" aria-hidden="true"><defs><mask id="${id}"><rect width="32" height="32" fill="#fff"/><circle cx="8.6" cy="9.6" r="6.2" fill="#000"/><circle cx="16" cy="17" r="3.6" fill="#000"/></mask></defs>
    <circle cx="16" cy="17" r="11" mask="url(#${id})" class="iso-estado__disco"/><circle cx="${px}" cy="${py}" r="3.3" class="iso-estado__punto"/></svg>`;
}

/** Banner de página o sección (persistente hasta que se resuelve o se cierra). Papel con canto de color y el estado en el isotipo. */
export function banner(titulo, texto, { tono = "info", accion = "", cerrable = true } = {}) {
  return `<div class="banner banner--${tono}" role="${tono === "error" ? "alert" : "status"}">${isoEstado(tono)}
    <div class="banner__texto"><b>${titulo}</b><span>${texto}</span></div>
    ${accion ? `<button type="button" class="banner__accion">${accion}</button>` : ""}
    ${cerrable ? `<button type="button" class="banner__cerrar" aria-label="Cerrar" onclick="this.closest('.banner').remove()">${icono("x", { tam: 16 })}</button>` : ""}</div>`;
}

/** Alerta en línea: dentro del contenido, junto a lo que afecta. */
export function alerta(texto, { tono = "alerta", titulo = "" } = {}) {
  return `<div class="alerta alerta--${tono}" role="note">${isoEstado(tono)}<p>${titulo ? `<b>${titulo}</b> ` : ""}${texto}</p></div>`;
}

/** Insignia de estado. tono: neutro | exito | alerta | error | info | acento */
export const insignia = (texto, { tono = "neutro", punto = true } = {}) => `<span class="insignia insignia--${tono}">${punto ? "<i></i>" : ""}${texto}</span>`;
/** Estado por forma: el avance se lee por la forma del punto (lleno, medio, vacío), no solo por el color. */
export const estado = (texto, { forma = "lleno", tono = "neutro" } = {}) => `<span class="estado-forma estado-forma--${forma} estado-forma--${tono}"><i aria-hidden="true"></i>${texto}</span>`;
/** Ficha de cerámica: clasificación tocable (filtros, rubros). activa = elegida. */
export const fichaCeramica = (texto, { activa = false } = {}) => `<button type="button" class="ficha-ceramica ceramica" aria-pressed="${activa}"><i aria-hidden="true"></i>${texto}</button>`;
export const etiqueta = (texto, { quitar = true } = {}) => `<span class="etiqueta">${texto}${quitar ? `<button type="button" aria-label="Quitar ${texto}" onclick="this.parentElement.remove()">${icono("x", { tam: 12 })}</button>` : ""}</span>`;
export const contador = (n) => `<span class="contador" aria-label="${n} sin leer">${n > 99 ? "99+" : n}</span>`;
