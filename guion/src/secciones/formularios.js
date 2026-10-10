/* Capítulo 3 · Formularios (fase 8). Directos: piden lo justo, sin explicar el método. */
import { marco, rejilla, ficha, ejemplo } from "../kit/guion.js";
import { campo, validar } from "../kit/campos.js";
import { boton, trabajar, segmento, casilla } from "../kit/controles.js";
import { listo } from "../kit/punto.js";
import { toast } from "../kit/avisos.js";
import { icono, rellenarIconos } from "../kit/iconos.js";
import { asistente, tarjetasOpcion } from "../patrones/asistente.js";
import { calendario, horas, fechaLarga } from "../patrones/fechas.js";
import { soltar } from "../patrones/soltar.js";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const DOLORES = { cotizaciones: "Cotizaciones", seguimiento: "Seguimiento comercial", inventario: "Inventario", reportes: "Reportes", conocimiento: "Conocimiento", coordinacion: "Coordinación" };

export const formularios = {
  async diagnostico(el) {
    cuerpo(el).innerHTML = `<div class="formulario mate" data-asistente></div>
      ${ficha({ que: "Asistente en pasos para levantar cómo trabaja una empresa. Cada paso se valida antes de seguir; lo escrito se conserva al volver.", importar: 'import { asistente, tarjetasOpcion } from "./patrones/asistente.js";', codigo: 'asistente(el, { pasos: [{ nombre: "Empresa", html }, …], alTerminar: enviar, listoTexto: "Diagnóstico enviado" });', reglas: ["4 a 6 pasos, nunca más.", "Lo difícil al medio, lo fácil al principio y al final.", "El último paso es un resumen que se puede corregir."] })}`;
    asistente(el.querySelector("[data-asistente]"), {
      listoTexto: "Diagnóstico enviado",
      listoDetalle: "Te escribimos en menos de un día hábil con la fecha para la primera conversación.",
      alTerminar: () => espera(1500),
      pasos: [
        { nombre: "Empresa", html: `<p class="titulo-2">Cuéntanos de tu empresa</p><div class="formulario__rejilla">
            ${campo("Nombre de la empresa", { nombre: "empresa", requerido: true, marcador: "Quillay Suministros Industriales" })}
            ${campo("RUT", { nombre: "rut", tipo: "rut", requerido: true, marcador: "76.354.771-K" })}
            ${campo("Rubro", { nombre: "rubro", tipo: "selector", requerido: true, marcador: "Elige un rubro", opciones: ["Distribución industrial", "Manufactura", "Servicios", "Comercio", "Construcción", "Otro"] })}
            ${campo("Personas en la empresa", { nombre: "personas", tipo: "selector", requerido: true, marcador: "Elige un rango", opciones: ["1 a 10", "11 a 50", "51 a 200", "Más de 200"] })}</div>` },
        { nombre: "Procesos", html: `<p class="titulo-2">¿Dónde se les va el tiempo?</p><p class="chico">Elige todo lo que hoy cuesta más de lo que debería.</p>
            ${tarjetasOpcion("dolores", [["cotizaciones", "Cotizaciones", "Se arman a mano o se atrasan", "receipt"], ["seguimiento", "Seguimiento comercial", "Clientes que se enfrían en el chat", "chat-circle-text"], ["inventario", "Inventario", "Lo que dice el sistema no calza", "package"], ["reportes", "Reportes", "Armar números toma días", "chart-line-up"], ["conocimiento", "Conocimiento", "Todo está en la cabeza de pocos", "brain"], ["coordinacion", "Coordinación", "Correos y reuniones que no avanzan", "users-three"]], { requerido: true })}` },
        { nombre: "Sistemas", html: `<p class="titulo-2">¿Con qué trabajan hoy?</p>
            <div class="formulario__rejilla"><div class="pila">${["Planillas (Excel o Google)", "WhatsApp", "Correo", "Un CRM", "Un ERP o facturación (Bsale, Defontana…)", "Nada formal"].map((s) => casilla(s, { nombre: "sistemas" }).replace('type="checkbox"', `type="checkbox" value="${s}"`)).join("")}</div>
            ${campo("¿Algo más que debamos saber?", { nombre: "notas", tipo: "area", max: 400, marcador: "Ej. tenemos dos bodegas y un vendedor en terreno" })}</div>` },
        { nombre: "Contacto", html: `<p class="titulo-2">¿Con quién hablamos?</p><div class="formulario__rejilla">
            ${campo("Tu nombre", { nombre: "nombre", requerido: true, marcador: "Camila Rojas" })}
            ${campo("Cargo", { nombre: "cargo", marcador: "Gerenta comercial" })}
            ${campo("Correo de trabajo", { nombre: "correo", tipo: "correo", requerido: true, marcador: "camila@quillay.cl" })}
            ${campo("Celular", { nombre: "celular", tipo: "telefono", marcador: "9 1234 5678" })}</div>` },
        { nombre: "Resumen", html: (d) => `<p class="titulo-2">Revisa y envía</p>
            <dl class="resumen-form">
              <dt>Empresa</dt><dd>${d.empresa || "—"} · ${d.rut || "—"}</dd>
              <dt>Rubro y tamaño</dt><dd>${d.rubro || "—"} · ${d.personas || "—"} personas</dd>
              <dt>Dónde se va el tiempo</dt><dd>${[].concat(d.dolores || []).map((x) => DOLORES[x] || x).join(", ") || "—"}</dd>
              <dt>Sistemas</dt><dd>${[].concat(d.sistemas || []).join(", ") || "—"}</dd>
              <dt>Contacto</dt><dd>${d.nombre || "—"}${d.cargo ? ", " + d.cargo : ""} · ${d.correo || "—"}</dd>
            </dl><p class="chico">Si algo no está bien, vuelve atrás: lo que escribiste se mantiene.</p>` },
      ],
    });
  },

  async agendar(el) {
    cuerpo(el).innerHTML = `<div class="agendar mate">
        <div class="agendar__paso"><p class="titulo-3">1 · Elige el día</p><div data-cal></div></div>
        <div class="agendar__paso"><p class="titulo-3">2 · Elige la hora</p><div data-horas><p class="chico">Primero elige un día.</p></div></div>
        <form class="agendar__paso agendar__datos" novalidate><p class="titulo-3">3 · Tus datos</p>
          ${campo("Nombre", { requerido: true, marcador: "Jorge Molina" })}${campo("Correo de trabajo", { tipo: "correo", requerido: true, marcador: "jorge@quillay.cl" })}
          <p class="agendar__elegido chico" data-elegido>Reunión de 30 minutos por videollamada.</p>
          ${boton("Agendar reunión", { variante: "primario", tam: "l", attrs: "data-agendar disabled" })}</form>
      </div>
      ${ficha({ que: "Agenda en tres pasos visibles a la vez: día, hora, datos. El botón se habilita al elegir hora.", importar: 'import { calendario, horas } from "./patrones/fechas.js";', reglas: ["La zona horaria siempre visible.", "Solo días y horas realmente disponibles.", "Datos mínimos: nombre y correo."] })}`;
    let dia = null, hora = null;
    const elegido = el.querySelector("[data-elegido]"), btn = el.querySelector("[data-agendar]");
    const actualizar = () => { btn.disabled = !(dia && hora); if (dia && hora) elegido.innerHTML = `<b>${fechaLarga(dia)}, ${hora} h</b> · 30 minutos por videollamada.`; };
    calendario(el.querySelector("[data-cal]"), { disponible: (f) => f.getDay() > 0 && f.getDay() < 6, alElegir: (f) => { dia = f; hora = null; horas(el.querySelector("[data-horas]"), { fecha: f, alElegir: (h) => { hora = h; actualizar(); } }); actualizar(); } });
    btn.addEventListener("click", async () => {
      const ok = [...el.querySelectorAll(".agendar__datos input")].map(validar).every(Boolean);
      if (!ok) return;
      await trabajar(btn, () => espera(1200), { cargando: "Agendando…", listo: "Agendada" });
      el.querySelector(".agendar__datos").innerHTML = `<div class="asistente__fin">${listo({ texto: "Reunión agendada", tam: 64 })}<p class="chico">${fechaLarga(dia)}, ${hora} h. Te llegó la invitación al correo.</p></div>`;
    });
  },

  async contacto(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("El formulario corto del sitio", `<form class="pila" novalidate data-contacto>
          ${campo("Nombre", { requerido: true })}${campo("Correo de trabajo", { tipo: "correo", requerido: true })}
          ${campo("¿En qué te podemos ayudar?", { tipo: "area", max: 500, requerido: true, marcador: "Cuéntanos en dos líneas" })}
          <div class="fila-botones">${boton("Enviar mensaje", { tipo: "submit", icoFin: "arrow-right" })}<span class="rotulo">Respondemos en menos de un día hábil.</span></div></form>`),
      marco("Por qué así", `<ul class="lista-punto"><li><b>Tres campos.</b> Lo demás se pregunta en la conversación.</li><li><b>Promesa concreta</b> junto al botón: cuándo respondemos.</li><li><b>Sin captcha visible</b>: se filtra el spam en el servidor.</li><li><b>Al enviar</b>, el formulario se reemplaza por la confirmación (no un aviso que desaparece).</li></ul>`),
    ])}`;
    const f = el.querySelector("[data-contacto]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const malos = [...f.querySelectorAll("[data-tipo]")].filter((c) => !validar(c));
      if (malos.length) return malos[0].focus();
      await trabajar(f.querySelector("button[type=submit]"), () => espera(1100), { cargando: "Enviando…", listo: "Enviado" });
      f.innerHTML = `<div class="asistente__fin">${listo({ texto: "Mensaje enviado", tam: 64 })}<p class="chico">Te respondemos en menos de un día hábil.</p></div>`;
    });
  },

  async cotizacion(el) {
    cuerpo(el).innerHTML = `<form class="cotizar" novalidate>
        <div class="cotizar__form mate">
          <p class="titulo-3">¿Qué necesitas?</p>
          ${tarjetasOpcion("servicios", [["diagnostico", "Diagnóstico", "Mapa de procesos y por dónde empezar", "magnifying-glass"], ["crm", "CRM a medida", "Clientes, cotizaciones y ventas en un lugar", "kanban"], ["medula", "Medula", "La memoria de tu empresa, conectada", "brain"], ["agentes", "Equipo de agentes", "Un departamento que trabaja contigo", "users-three"], ["flujos", "Flujos comerciales", "WhatsApp, llamadas y seguimiento", "flow-arrow"]], { requerido: true })}
          <div class="formulario__rejilla">
            <div class="campo"><span class="campo__etiqueta">Tamaño del equipo</span>${segmento(["1–10", "11–50", "51–200", "200+"], { activa: 1, etiqueta: "Tamaño del equipo", nombre: "tamano" })}</div>
            <div class="campo"><span class="campo__etiqueta">¿Para cuándo?</span>${segmento(["Este mes", "Este trimestre", "Explorando"], { activa: 1, etiqueta: "Plazo", nombre: "plazo" })}</div>
          </div>
          ${campo("Correo para enviarte la propuesta", { tipo: "correo", requerido: true, marcador: "camila@quillay.cl" })}
        </div>
        <div class="cotizar__resumen mate" role="region" aria-label="Resumen de la propuesta"><p class="rotulo">Tu propuesta incluirá</p><ul class="lista-punto" data-incluye><li class="chico">Elige al menos un servicio.</li></ul>
          <p class="chico" data-plazo>Plazo: este trimestre · equipo de 11–50</p>${boton("Pedir propuesta", { tipo: "submit", tam: "l" })}<p class="rotulo">Sin compromiso. Te la enviamos en 3 días hábiles.</p></div>
      </form>`;
    rellenarIconos();
    const f = el.querySelector("form"), incl = el.querySelector("[data-incluye]"), plazo = el.querySelector("[data-plazo]");
    const nombres = { diagnostico: "Diagnóstico de procesos", crm: "CRM a medida", medula: "Medula, memoria de la empresa", agentes: "Equipo de agentes", flujos: "Flujos comerciales" };
    const refrescar = () => {
      const sel = [...f.querySelectorAll('[name="servicios"]:checked')].map((c) => nombres[c.value]);
      incl.innerHTML = sel.length ? sel.map((s) => `<li>${s}</li>`).join("") : '<li class="chico">Elige al menos un servicio.</li>';
      const val = (n) => f.querySelector(`[data-segmento="${n}"] [aria-checked="true"]`)?.dataset.valor;
      plazo.textContent = `Plazo: ${val("plazo").toLowerCase()} · equipo de ${val("tamano")}`;
    };
    f.addEventListener("change", refrescar); f.addEventListener("cambio", refrescar);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const grupo = f.querySelector("[data-requiere-uno]"), sinServicio = !f.querySelector('[name="servicios"]:checked');
      grupo.classList.toggle("grupo--error", sinServicio);
      const correo = validar(f.querySelector('[data-tipo="correo"]'));
      if (sinServicio || !correo) return;
      await trabajar(f.querySelector("[type=submit]"), () => espera(1300), { cargando: "Enviando…", listo: "Pedida" });
      toast("Pedimos tu propuesta. Llega en 3 días hábiles.", { tono: "exito" });
    });
  },

  async archivos(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Subir planillas y documentos", `<div data-soltar></div>`, { nota: "Arrastra cualquier archivo. Prueba también los botones de abajo para ver los errores." }),
      marco("Probar", `<div class="pila"><p class="chico">Simula archivos para ver cada caso:</p><div class="fila-botones">
          ${boton("Planilla válida", { variante: "secundario", tam: "s", attrs: 'data-sim="ok"' })}${boton("Archivo muy grande", { variante: "secundario", tam: "s", attrs: 'data-sim="grande"' })}${boton("Tipo no permitido", { variante: "secundario", tam: "s", attrs: 'data-sim="tipo"' })}</div>
          <ul class="lista-punto"><li>Cada archivo muestra su progreso y se puede quitar.</li><li>El error dice <b>qué hacer</b>: dividir, comprimir o cambiar el formato.</li><li>Nada se sube sin que lo veas en la lista.</li></ul></div>`),
    ])}`;
    const z = soltar(el.querySelector("[data-soltar]"));
    const falso = (nombre, mb) => { const f = new File([new Uint8Array(1)], nombre); Object.defineProperty(f, "size", { value: mb * 1e6 }); return f; };
    el.querySelectorAll("[data-sim]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.sim;
      z.agregar([k === "ok" ? falso("Cotizaciones-2026.xlsx", 1.8) : k === "grande" ? falso("Inventario-completo.csv", 48) : falso("Presentacion.key", 3)]);
    }));
  },

  async validacion(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Al enviar con errores", `<form class="pila" novalidate data-val>
          <div class="resumen-errores" hidden role="alert" tabindex="-1"></div>
          ${campo("Empresa", { requerido: true })}${campo("RUT", { tipo: "rut", requerido: true, valor: "76.354.771-0" })}${campo("Correo", { tipo: "correo", requerido: true, valor: "camila@quillay" })}
          <div>${boton("Enviar", { tipo: "submit" })}</div></form>`, { nota: "Presiona Enviar: aparece un resumen arriba y el foco va al primer error." }),
      marco("Cuándo validar", `<ul class="lista-punto"><li><b>Al salir del campo</b>, nunca mientras se escribe por primera vez.</li><li><b>Al corregir</b>, el error se va en el momento.</li><li><b>Al enviar</b>, resumen con enlaces a cada error si hay más de uno.</li><li><b>Formato</b> (RUT, teléfono, pesos) se ordena solo: no se le pide al usuario.</li></ul>`),
      marco("Cómo escribir un error", `<div class="pila errores-ej"><p><span class="no">No</span> «Campo inválido».</p><p><span class="si">Sí</span> «El RUT no calza con su dígito verificador. Revisa el número.»</p><p><span class="no">No</span> «Error 422».</p><p><span class="si">Sí</span> «No pudimos guardar. Revisa tu conexión e intenta de nuevo; lo escrito sigue acá.»</p></div>`, { ancho: true }),
    ])}`;
    const f = el.querySelector("[data-val]"), res = f.querySelector(".resumen-errores");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const malos = [...f.querySelectorAll("[data-tipo]")].filter((c) => !validar(c));
      if (!malos.length) { res.hidden = true; toast("Todo bien: enviado.", { tono: "exito" }); return; }
      res.hidden = false;
      res.innerHTML = `${icono("warning-circle", { tam: 20 })}<div><b>Revisa ${malos.length} ${malos.length === 1 ? "dato" : "datos"} antes de enviar</b><ul>${malos.map((m) => `<li><a href="#${m.id}">${f.querySelector(`label[for="${m.id}"]`).childNodes[0].textContent.trim()}</a></li>`).join("")}</ul></div>`;
      rellenarIconos();
      res.querySelectorAll("a").forEach((a) => a.addEventListener("click", (ev) => { ev.preventDefault(); document.getElementById(a.hash.slice(1)).focus(); }));
      malos[0].focus();
    });
  },

  async encuesta(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Recomendación (NPS)", `<form class="pila" data-nps><p class="titulo-3">¿Qué tan probable es que recomiendes Optimizo a otra empresa?</p>
          <div class="nps" role="radiogroup" aria-label="De 0 a 10">${Array.from({ length: 11 }, (_, k) => `<button type="button" role="radio" aria-checked="false" data-n="${k}">${k}</button>`).join("")}</div>
          <div class="nps__extremos rotulo"><span>Nada probable</span><span>Muy probable</span></div>
          <div data-nps-sigue hidden class="pila">${campo("", { tipo: "area", max: 300, marcador: "" })}${boton("Enviar respuesta", { tipo: "submit" })}</div></form>`, { nota: "La pregunta de seguimiento cambia según la nota." }),
      marco("Satisfacción por etapa", `<div class="pila">${["Diagnóstico", "Implementación del CRM", "Capacitación del equipo"].map((et) => `<div class="csat"><span>${et}</span><div class="csat__caras" role="radiogroup" aria-label="${et}">${[["smiley-sad", "Mal"], ["smiley-meh", "Regular"], ["smiley", "Bien"], ["smiley-wink", "Muy bien"]].map(([ic, t]) => `<button type="button" role="radio" aria-checked="false" aria-label="${t}" data-tip="${t}">${icono(ic, { tam: 22 })}</button>`).join("")}</div></div>`).join("")}${ejemplo()}</div>`, { nota: "Cuatro caras, sin neutro forzado. Una pregunta por etapa terminada." }),
    ])}`;
    rellenarIconos();
    const f = el.querySelector("[data-nps]"), sigue = f.querySelector("[data-nps-sigue]");
    f.querySelectorAll(".nps button").forEach((b) => b.addEventListener("click", () => {
      f.querySelectorAll(".nps button").forEach((x) => x.setAttribute("aria-checked", x === b));
      const n = +b.dataset.n; sigue.hidden = false;
      const lab = sigue.querySelector("label"), ta = sigue.querySelector("textarea");
      lab.textContent = n >= 9 ? "¡Gracias! ¿Qué es lo que más valoras?" : n >= 7 ? "¿Qué nos faltó para un 10?" : "¿Qué deberíamos hacer distinto?";
      ta.placeholder = n >= 9 ? "Ej. que lo dejaron funcionando" : "Cuéntanos con confianza";
    }));
    f.addEventListener("submit", (e) => { e.preventDefault(); f.innerHTML = `<div class="asistente__fin">${listo({ texto: "Gracias por responder", tam: 56 })}</div>`; });
    el.querySelectorAll(".csat__caras").forEach((g) => g.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) g.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", x === b)); }));
  },
};
