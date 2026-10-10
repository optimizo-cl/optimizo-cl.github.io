/* Buscador ⌘K: busca en la memoria de la empresa y en las acciones. Resultados con la parte que coincide resaltada. */
import { icono, rellenarIconos } from "../kit/iconos.js?v=798d3f5";
import { NOTAS, PROCESOS } from "../demo/quillay.js?v=798d3f5";

const sinTildes = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function resaltar(texto, q) {
  if (!q) return texto;
  const i = sinTildes(texto).indexOf(sinTildes(q));
  return i < 0 ? texto : `${texto.slice(0, i)}<mark>${texto.slice(i, i + q.length)}</mark>${texto.slice(i + q.length)}`;
}
const ICONO_FUENTE = { Correo: "envelope-simple", WhatsApp: "whatsapp-logo", Planilla: "file-xls", Reunión: "users-three", "Nota de Jorge": "note-pencil" };

export function buscarMemoria(q) {
  const n = sinTildes(q);
  return {
    notas: NOTAS.filter((x) => sinTildes(x.titulo + " " + x.texto).includes(n)),
    procesos: PROCESOS.filter((x) => sinTildes(x.nombre + " " + x.area).includes(n)),
  };
}

/** Pinta resultados en un contenedor (sirve para la paleta ⌘K y para la sección de búsqueda). */
export function resultadosHTML(q) {
  if (!q.trim()) return `<p class="buscador__ayuda chico">Prueba con «despacho», «precios» o «cotizar».</p>`;
  const { notas, procesos } = buscarMemoria(q.trim());
  if (!notas.length && !procesos.length) return `<div class="vacio"><span class="vacio__ico">${icono("magnifying-glass", { tam: 24 })}</span><b>Nada con «${q}»</b><p class="chico">Prueba otra palabra o busca por cliente.</p></div>`;
  return `${notas.length ? `<p class="buscador__grupo rotulo">En la memoria</p>${notas.map((x) => `<button type="button" class="resultado"><span class="resultado__ico">${icono(ICONO_FUENTE[x.fuente] || "note", { tam: 18 })}</span>
      <span class="resultado__cuerpo"><b>${resaltar(x.titulo, q)}</b><span class="chico">${resaltar(x.texto, q)}</span><span class="rotulo">${x.fuente} · ${x.fecha}</span></span></button>`).join("")}` : ""}
    ${procesos.length ? `<p class="buscador__grupo rotulo">Procesos</p>${procesos.map((x) => `<button type="button" class="resultado"><span class="resultado__ico">${icono("tree-structure", { tam: 18 })}</span>
      <span class="resultado__cuerpo"><b>${resaltar(x.nombre, q)}</b><span class="rotulo">${x.area} · ${x.horas} h por semana</span></span></button>`).join("")}` : ""}`;
}

/** Abre la paleta de búsqueda (⌘K / Ctrl+K). */
export function abrirBuscador() {
  const d = document.createElement("dialog");
  d.className = "dialogo dialogo--buscador";
  d.innerHTML = `<div class="buscador"><label class="buscador__campo">${icono("magnifying-glass", { tam: 20 })}<input type="search" placeholder="Buscar en la memoria de Quillay" aria-label="Buscar"><kbd>Esc</kbd></label>
    <div class="buscador__resultados" aria-live="polite">${resultadosHTML("")}</div></div>`;
  document.body.appendChild(d); d.showModal(); rellenarIconos();
  const input = d.querySelector("input"), res = d.querySelector(".buscador__resultados");
  input.addEventListener("input", () => { res.innerHTML = resultadosHTML(input.value); rellenarIconos(); });
  input.addEventListener("keydown", (e) => {
    const items = [...res.querySelectorAll(".resultado")]; const i = items.indexOf(d.querySelector(".resultado.activo"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); items.forEach((x) => x.classList.remove("activo")); const n = items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]; n?.classList.add("activo"); n?.scrollIntoView({ block: "nearest" }); }
  });
  const cerrar = () => { d.close(); d.remove(); };
  d.addEventListener("close", () => d.remove());
  d.addEventListener("click", (e) => { if (e.target === d) cerrar(); });
  input.focus();
}
let atajo = false;
export function activarAtajoBuscador() {
  if (atajo) return; atajo = true;
  document.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (!document.querySelector(".dialogo--buscador")) abrirBuscador(); } });
}
