/* Campos de formulario con formato y validación chilena (RUT, teléfono, pesos). Los errores dicen qué hacer. */
import { icono } from "./iconos.js";

let n = 0;
/** Campo de texto. tipo: texto | correo | rut | telefono | pesos | area | selector */
export function campo(etiqueta, { tipo = "texto", nombre = "", valor = "", ayuda = "", error = "", requerido = false, opciones = [], marcador = "", max = 0, ico = "", attrs = "" } = {}) {
  const id = `campo${++n}`;
  const desc = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ");
  const comunes = `id="${id}" name="${nombre || id}" ${requerido ? "required" : ""} ${desc ? `aria-describedby="${desc}"` : ""} ${error ? 'aria-invalid="true"' : ""} data-tipo="${tipo}" ${attrs}`;
  let control;
  if (tipo === "area") control = `<textarea ${comunes} rows="4" ${max ? `maxlength="${max}"` : ""} placeholder="${marcador}">${valor}</textarea>`;
  else if (tipo === "selector") control = `<select ${comunes}>${marcador ? `<option value="" disabled ${valor ? "" : "selected"}>${marcador}</option>` : ""}${opciones.map((o) => `<option ${o === valor ? "selected" : ""}>${o}</option>`).join("")}</select>${icono("caret-down", { tam: 16 })}`;
  else {
    const t = { correo: "email", telefono: "tel", pesos: "text", rut: "text", texto: "text" }[tipo] || "text";
    const modo = { telefono: 'inputmode="tel" autocomplete="tel"', pesos: 'inputmode="numeric"', rut: 'inputmode="text" autocomplete="off"', correo: 'autocomplete="email"' }[tipo] || "";
    const pre = tipo === "telefono" ? `<span class="campo__prefijo">+56</span>` : tipo === "pesos" ? `<span class="campo__prefijo">$</span>` : ico ? `<span class="campo__prefijo">${icono(ico, { tam: 18 })}</span>` : "";
    control = `${pre}<input type="${t}" ${modo} ${comunes} value="${valor}" placeholder="${marcador}" ${max ? `maxlength="${max}"` : ""}>`;
  }
  return `<div class="campo ${error ? "campo--error" : ""}" data-campo>
    <label class="campo__etiqueta" for="${id}">${etiqueta}${requerido ? "" : ' <span class="campo__opcional">opcional</span>'}</label>
    <div class="campo__control campo__control--${tipo}">${control}<i class="campo__punto" aria-hidden="true"></i></div>
    ${ayuda ? `<p class="campo__ayuda" id="${id}-ayuda">${ayuda}</p>` : ""}
    <p class="campo__error" id="${id}-error" ${error ? "" : "hidden"}>${icono("warning-circle", { tam: 16 })}<span>${error}</span></p>
    ${max && tipo === "area" ? `<p class="campo__contador"><span>${valor.length}</span>/${max}</p>` : ""}
  </div>`;
}

/* ── Formatos ── */
export function limpiarRut(v) { return v.replace(/[^0-9kK]/g, "").toUpperCase(); }
export function formatearRut(v) {
  const l = limpiarRut(v); if (l.length < 2) return l;
  const cuerpo = l.slice(0, -1), dv = l.slice(-1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
}
export function rutValido(v) {
  const l = limpiarRut(v); if (l.length < 8) return false;
  const cuerpo = l.slice(0, -1), dv = l.slice(-1);
  let s = 0, m = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) { s += +cuerpo[i] * m; m = m === 7 ? 2 : m + 1; }
  const r = 11 - (s % 11);
  return dv === (r === 11 ? "0" : r === 10 ? "K" : String(r));
}
export const formatearPesos = (v) => { const d = String(v).replace(/\D/g, ""); return d ? Number(d).toLocaleString("es-CL") : ""; };
export const formatearTelefono = (v) => { const d = String(v).replace(/\D/g, "").replace(/^56/, "").slice(0, 9); return d.replace(/^(\d)(\d{0,4})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")); };
const correoValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/** Valida un campo y muestra el error (qué hacer, no solo qué falló). Devuelve true si está bien. */
export function validar(input) {
  const v = input.value.trim(), tipo = input.dataset.tipo;
  let msg = "";
  if (input.required && !v) msg = "Completa este dato para seguir.";
  else if (v && tipo === "correo" && !correoValido(v)) msg = "Revisa el correo: falta la @ o el dominio (ej. nombre@empresa.cl).";
  else if (v && tipo === "rut" && !rutValido(v)) msg = "El RUT no calza con su dígito verificador. Revisa el número.";
  else if (v && tipo === "telefono" && v.replace(/\D/g, "").length !== 9) msg = "El celular tiene 9 dígitos y parte con 9.";
  mostrarError(input, msg);
  input.closest("[data-campo]")?.classList.toggle("campo--valido", !msg && !!v);
  return !msg;
}
export function mostrarError(input, msg) {
  const c = input.closest("[data-campo]"); if (!c) return;
  const e = c.querySelector(".campo__error");
  c.classList.toggle("campo--error", !!msg); input.toggleAttribute("aria-invalid", !!msg);
  e.hidden = !msg; e.querySelector("span").textContent = msg;
  const ids = (input.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
  if (msg && !ids.includes(e.id)) input.setAttribute("aria-describedby", [...ids, e.id].join(" "));
}

/* ── Comportamiento delegado ── */
let activo = false;
export function activarCampos() {
  if (activo) return; activo = true;
  document.addEventListener("input", (e) => {
    const i = e.target; if (!i.dataset?.tipo) return;
    const antes = i.value;
    if (i.dataset.tipo === "rut") i.value = formatearRut(i.value);
    if (i.dataset.tipo === "pesos") i.value = formatearPesos(i.value);
    if (i.dataset.tipo === "telefono") i.value = formatearTelefono(i.value);
    // cuando el formato reacomoda lo escrito (puntos, guion, espacios), el texto «se ordena» con un leve ajuste
    if (i.value !== antes && i.value.length > 3) { const c = i.closest("[data-campo]"); c?.classList.remove("campo--ordena"); void c?.offsetWidth; c?.classList.add("campo--ordena"); }
    if (i.matches("textarea[maxlength]")) { const c = i.closest("[data-campo]").querySelector(".campo__contador span"); if (c) c.textContent = i.value.length; }
    // si había error, se re-valida al escribir (el error se va apenas se corrige)
    if (i.closest(".campo--error")) validar(i);
  });
  // se valida al salir del campo, nunca mientras se escribe la primera vez
  document.addEventListener("focusout", (e) => { const i = e.target; if (i.dataset?.tipo && i.closest("[data-campo]") && (i.value || i.required) && !i.closest("[data-sin-validar]")) validar(i); });
}
