/* Asistente en pasos: el punto marca el avance, cada paso se valida antes de seguir y al final aterriza en «Listo». */
import { progreso, moverProgreso, listo } from "../kit/punto.js?v=e217e49";
import { boton, trabajar } from "../kit/controles.js?v=e217e49";
import { validar } from "../kit/campos.js?v=e217e49";
import { rellenarIconos } from "../kit/iconos.js?v=e217e49";

/** pasos: [{ nombre, html, resumen?(datos) }] · alTerminar(datos) → Promise · listoTexto */
export function asistente(el, { pasos, alTerminar = async () => {}, listoTexto = "Enviado", listoDetalle = "" }) {
  let i = 0;
  el.classList.add("asistente");
  el.innerHTML = `${progreso(pasos.map((p) => p.nombre), 0)}
    <form class="asistente__cuerpo" novalidate></form>
    <div class="asistente__pie"><span class="rotulo asistente__cuenta"></span>
      <div class="fila-botones">${boton("Atrás", { variante: "texto", attrs: "data-atras" })}${boton("Siguiente", { icoFin: "arrow-right", attrs: "data-siguiente" })}</div></div>`;
  const form = el.querySelector("form"), prog = el.querySelector(".progreso");
  const atras = el.querySelector("[data-atras]"), sig = el.querySelector("[data-siguiente]");
  const datos = () => Object.fromEntries([...new FormData(form).entries()].reduce((m, [k, v]) => (m.set(k, m.has(k) ? [].concat(m.get(k), v) : v), m), new Map()));
  const guardados = {};

  const mostrar = (n, dir = 1) => {
    Object.assign(guardados, datos());
    i = n;
    const p = pasos[i];
    form.innerHTML = `<div class="asistente__paso" style="--dir:${dir}">${typeof p.html === "function" ? p.html(guardados) : p.html}</div>`;
    // restaura lo que ya se había escrito
    for (const [k, v] of Object.entries(guardados)) form.querySelectorAll(`[name="${k}"]`).forEach((c) => {
      if (c.type === "checkbox" || c.type === "radio") c.checked = [].concat(v).includes(c.value);
      else c.value = v;
    });
    moverProgreso(prog, i);
    atras.style.visibility = i === 0 ? "hidden" : "visible";
    sig.querySelector(".boton__texto").textContent = i === pasos.length - 1 ? "Enviar" : "Siguiente";
    el.querySelector(".asistente__cuenta").textContent = `Paso ${i + 1} de ${pasos.length}`;
    rellenarIconos();
    p.alMostrar?.(form);
  };

  const pasoValido = () => {
    const campos = [...form.querySelectorAll("input[data-tipo], select[data-tipo], textarea[data-tipo]")];
    const malos = campos.filter((c) => !validar(c));
    const grupos = [...form.querySelectorAll("[data-requiere-uno]")].filter((g) => !g.querySelector("input:checked"));
    grupos.forEach((g) => g.classList.add("grupo--error"));
    if (malos[0]) malos[0].focus(); else if (grupos[0]) grupos[0].querySelector("input")?.focus();
    return !malos.length && !grupos.length;
  };
  form.addEventListener("change", (e) => e.target.closest("[data-requiere-uno]")?.classList.remove("grupo--error"));

  atras.addEventListener("click", () => i > 0 && mostrar(i - 1, -1));
  sig.addEventListener("click", async () => {
    if (!pasoValido()) return;
    if (i < pasos.length - 1) return mostrar(i + 1, 1);
    Object.assign(guardados, datos());
    await trabajar(sig, () => alTerminar(guardados), { cargando: "Enviando…", listo: "Enviado" }).catch(() => {});
    el.innerHTML = `<div class="asistente__fin">${listo({ texto: listoTexto, tam: 84 })}${listoDetalle ? `<p class="chico">${listoDetalle}</p>` : ""}
      <div class="fila-botones">${boton("Empezar de nuevo", { variante: "secundario", attrs: "data-reiniciar" })}</div></div>`;
    el.querySelector("[data-reiniciar]").addEventListener("click", () => asistente(el, { pasos, alTerminar, listoTexto, listoDetalle }));
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); sig.click(); });
  mostrar(0);
}

/** Tarjetas de opción (elegir una o varias con más contexto que una casilla). */
export function tarjetasOpcion(nombre, opciones, { multiple = true, requerido = false } = {}) {
  return `<div class="tarjetas-opcion" ${requerido ? "data-requiere-uno" : ""} role="${multiple ? "group" : "radiogroup"}">
    ${opciones.map(([valor, titulo, detalle, ico]) => `<label class="tarjeta-opcion">
      <input type="${multiple ? "checkbox" : "radio"}" name="${nombre}" value="${valor}">
      <span class="tarjeta-opcion__cuerpo">${ico ? `<svg class="icono" data-icono="${ico}" width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"></svg>` : ""}
        <b>${titulo}</b>${detalle ? `<span class="chico">${detalle}</span>` : ""}</span><i class="tarjeta-opcion__marca" aria-hidden="true"></i></label>`).join("")}
    ${requerido ? `<p class="campo__error grupo__error">Elige al menos una opción para seguir.</p>` : ""}
  </div>`;
}
