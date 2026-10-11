/* Capítulo 2 · Kit (fase 7). Cada pieza: demostración viva + ficha de uso. */
import { marco, rejilla, ficha } from "../kit/guion.js?v=e217e49";
import { boton, botonIcono, trabajar, segmento, interruptor, casilla, radio, deslizador } from "../kit/controles.js?v=e217e49";
import { campo } from "../kit/campos.js?v=e217e49";
import { toast, banner, alerta, insignia, etiqueta, contador } from "../kit/avisos.js?v=e217e49";
import { abrirMenu, abrirPopover, abrirDialogo, confirmarDestructivo, cerrarFlotante } from "../kit/popups.js?v=e217e49";
import { carga } from "../kit/punto.js?v=e217e49";
import { icono } from "../kit/iconos.js?v=e217e49";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export const kit = {
  async botones(el) {
    const variantes = [["primario", "Agendar diagnóstico"], ["acento", "Comenzar ahora"], ["secundario", "Ver el plan"], ["texto", "Saber más"], ["peligro", "Eliminar proceso"]];
    cuerpo(el).innerHTML = `${rejilla([
      marco("Variantes", `<div class="fila-botones">${variantes.map(([v, t]) => boton(t, { variante: v })).join("")}</div>`, { ancho: true, nota: "Primario navy para la acción principal; acento solo para la gran llamada de una página (una por pantalla)." }),
      marco("Tamaños", `<div class="fila-botones">${["s", "m", "l"].map((t) => boton(`Tamaño ${t.toUpperCase()}`, { tam: t })).join("")}</div>`, { nota: "S 36 px (tablas) · M 44 px (por defecto) · L 52 px (sitio y celular)." }),
      marco("Con ícono", `<div class="fila-botones">${boton("Subir planilla", { variante: "secundario", ico: "upload-simple" })}${boton("Ver el plan", { variante: "texto", icoFin: "arrow-right" })}${botonIcono("dots-three", "Más opciones")}${botonIcono("pencil-simple", "Editar", { variante: "texto" })}</div>`, { nota: "El ícono acompaña al texto. Solo ícono cuando el significado es universal, siempre con etiqueta." }),
      marco("Trabajando → listo", `<div class="fila-botones">${boton("Guardar cambios", { attrs: "data-trabajar" })}${boton("Enviar propuesta", { variante: "acento", attrs: "data-trabajar" })}</div>`, { nota: "Presiona: el punto orbita mientras trabaja y confirma con «Listo». El ancho no salta." }),
      marco("Deshabilitado", `<div class="fila-botones">${boton("Enviar", { deshabilitado: true })}${boton("Enviar", { variante: "secundario", deshabilitado: true })}</div>`, { nota: "Siempre con una razón visible cerca (qué falta para habilitarlo)." }),
    ])}
    ${ficha({ que: "Botón de la marca. Navy por defecto, acento para la gran llamada, texto para acciones menores.", importar: 'import { boton, botonIcono, trabajar } from "./kit/controles.js?v=e217e49";', codigo: 'contenedor.innerHTML = boton("Agendar diagnóstico", { variante: "primario", icoFin: "arrow-right" });\nbtn.onclick = () => trabajar(btn, () => api.guardar(), { cargando: "Guardando…" });', reglas: ["Verbos concretos: «Agendar diagnóstico», no «Enviar».", "Un solo botón de acento por pantalla.", "Mínimo 44 px de alto en táctil."] })}`;
    el.querySelectorAll("[data-trabajar]").forEach((b) => b.addEventListener("click", () => trabajar(b, () => espera(1600), { cargando: b.textContent.includes("Enviar") ? "Enviando…" : "Guardando…" })));
  },

  async eleccion(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Segmentado", `<div style="display:grid;gap:14px">${segmento(["Semana", "Mes", "Trimestre"], { activa: 1, etiqueta: "Periodo" })}${segmento(["Lista", "Tablero"], { etiqueta: "Vista" })}</div>`, { nota: "2 a 4 opciones que se ven todas. Flechas del teclado para moverse." }),
      marco("Interruptor", `<div style="display:grid;gap:18px">${interruptor("Avisarme por correo", { activo: true, ayuda: "Cuando un proceso cambie de estado" })}${interruptor("Resumen semanal", { ayuda: "Los lunes a las 8:00" })}</div>`, { nota: "Efecto inmediato, sin botón «Guardar»." }),
      marco("Casillas", `<div style="display:grid;gap:12px">${casilla("Ventas", { marcada: true })}${casilla("Operaciones", { marcada: true })}${casilla("Finanzas")}${casilla("Todas las áreas", { indeterminada: true })}</div>`, { nota: "Varias opciones independientes. La indeterminada resume a sus hijas." }),
      marco("Opciones", `<div style="display:grid;gap:14px">${radio("Tenemos CRM", { nombre: "crm", marcado: true, ayuda: "Zoho, HubSpot, Pipedrive u otro" })}${radio("Usamos planillas", { nombre: "crm" })}${radio("No llevamos registro", { nombre: "crm" })}</div>`, { nota: "Una opción entre varias, con ayuda cuando hace falta." }),
      marco("Deslizador", `<div style="display:grid;gap:22px">${deslizador("Personas en el equipo", { min: 1, max: 200, valor: 38 })}<label class="deslizador"><span class="deslizador__cabeza"><b>Presupuesto mensual</b><output>$ 2.500.000</output></span><input type="range" min="500000" max="10000000" step="100000" value="2500000" data-formato="pesos" style="--p:21%"></label></div>`, { nota: "Para rangos aproximados. Si el número exacto importa, mejor un campo." }),
    ])}
    ${ficha({ que: "Controles de elección: segmentado, interruptor, casilla, opción y deslizador.", importar: 'import { segmento, interruptor, casilla, radio, deslizador, activarControles } from "./kit/controles.js?v=e217e49";', codigo: 'activarControles(); // una vez por página\nvista.innerHTML = segmento(["Lista", "Tablero"], { etiqueta: "Vista" });\nvista.addEventListener("cambio", (e) => mostrar(e.detail));', reglas: ["Segmentado ≤ 4 opciones; más de 4 → selector.", "El interruptor nunca necesita confirmar.", "Todo se maneja con teclado."] })}`;
    el.querySelectorAll("[data-indeterminada]").forEach((c) => (c.indeterminate = true));
  },

  async campos(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Texto y correo", `<div class="pila">${campo("Nombre de la empresa", { requerido: true, valor: "Quillay Suministros Industriales" })}${campo("Correo de trabajo", { tipo: "correo", requerido: true, marcador: "nombre@empresa.cl" })}</div>`, { nota: "Escribe un correo sin @ y sal del campo: el error dice cómo arreglarlo." }),
      marco("Formatos chilenos", `<div class="pila">${campo("RUT de la empresa", { tipo: "rut", requerido: true, marcador: "76.123.456-7", ayuda: "Se formatea solo. Prueba con 76.354.771-K" })}${campo("Celular", { tipo: "telefono", marcador: "9 1234 5678" })}${campo("Facturación mensual aproximada", { tipo: "pesos", marcador: "25.000.000" })}</div>`, { nota: "RUT con dígito verificador real, celular de 9 dígitos, pesos con punto de miles." }),
      marco("Selector y área", `<div class="pila">${campo("Rubro", { tipo: "selector", marcador: "Elige un rubro", opciones: ["Distribución industrial", "Manufactura", "Servicios", "Comercio", "Otro"] })}${campo("¿Qué te gustaría resolver primero?", { tipo: "area", max: 280, marcador: "Ej. las cotizaciones se nos atrasan…" })}</div>`),
      marco("Estados", `<div class="pila">${campo("Con error", { valor: "contacto@quillay", tipo: "correo", error: "Revisa el correo: falta el dominio (ej. nombre@empresa.cl)." })}${campo("Deshabilitado", { valor: "Plan Business", attrs: "disabled" })}${campo("Buscar", { ico: "magnifying-glass", marcador: "Buscar en la memoria de Quillay" })}</div>`, { nota: "El error aparece al salir del campo y se va apenas se corrige." }),
    ])}
    ${ficha({ que: "Campos con etiqueta siempre visible, ayuda, error accionable y formatos chilenos.", importar: 'import { campo, validar, activarCampos, rutValido } from "./kit/campos.js?v=e217e49";', codigo: 'activarCampos(); // formato y validación al salir del campo\nform.innerHTML = campo("RUT de la empresa", { tipo: "rut", requerido: true });', reglas: ["La etiqueta nunca se reemplaza por el marcador.", "Opcional se marca «opcional»; lo requerido no lleva asterisco.", "Los errores dicen qué hacer, no solo qué falló."] })}`;
  },

  async estados(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Esqueleto", `<div class="esq-tarjeta"><div class="esqueleto" style="width:44px;height:44px;border-radius:50%"></div><div style="display:grid;gap:8px;flex:1"><div class="esqueleto" style="height:14px;width:60%"></div><div class="esqueleto" style="height:12px;width:90%"></div><div class="esqueleto" style="height:12px;width:75%"></div></div></div>`, { nota: "Para contenido que llega en 1–4 s. Barrido lento (2,4 s), nunca parpadeo." }),
      marco("Progreso", `<div class="pila"><div style="display:flex;justify-content:space-between" class="chico"><span>Importando clientes</span><b data-pct>40 %</b></div><div class="barra" data-barra><i style="--v:40%"></i></div><div class="fila-botones">${boton("Avanzar", { variante: "secundario", tam: "s", attrs: "data-avanzar" })}</div></div>`, { nota: "Cuando se sabe cuánto falta. Si no, carga con el punto." }),
      marco("Vacío", `<div class="vacio"><span class="vacio__ico">${icono("tree-structure", { tam: 26 })}</span><b class="titulo-3">Aún no hay procesos</b><p class="chico">Documenta el primero y Optimizo te muestra dónde se traba.</p>${boton("Documentar un proceso", { ico: "plus" })}</div>`, { nota: "Un vacío invita: dice qué va acá y cómo empezar." }),
      marco("Error al cargar", `<div class="vacio"><span class="vacio__ico" style="background:var(--error-suave);color:var(--error)">${icono("warning-circle", { tam: 26 })}</span><b class="titulo-3">No pudimos traer las cotizaciones</b><p class="chico">El CRM no respondió a tiempo. Tus datos están a salvo.</p>${boton("Reintentar", { variante: "secundario", ico: "arrow-clockwise" })}</div>`),
      marco("Sin conexión", `${banner("Sin conexión", "Los cambios se guardan en este equipo y se envían al volver.", { tono: "alerta", cerrable: false })}`, { ancho: true }),
    ])}
    ${ficha({ que: "Estados de espera y de resultado. Cada pantalla define su carga, su vacío y su error.", reglas: ["< 1 s nada · 1–4 s esqueleto · > 4 s carga de marca con texto.", "Los errores nunca culpan al usuario y dicen qué hacer.", "Ningún estado deja la pantalla en blanco."] })}`;
    const barra = el.querySelector("[data-barra] i"), pct = el.querySelector("[data-pct]");
    el.querySelector("[data-avanzar]").addEventListener("click", () => {
      const v = Math.min(100, parseInt(barra.style.getPropertyValue("--v")) + 20);
      barra.style.setProperty("--v", v + "%"); pct.textContent = v === 100 ? "Listo" : v + " %";
    });
  },

  async avisos(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Toast con deshacer", `<div class="fila-botones">${boton("Archivar proceso", { variante: "secundario", attrs: 'data-toast="deshacer"' })}${boton("Guardar", { variante: "secundario", attrs: 'data-toast="exito"' })}${boton("Simular error", { variante: "secundario", attrs: 'data-toast="error"' })}</div>`, { nota: "Abajo a la derecha, máximo 3. Dura 5 s (7 con acción) y se pausa con el mouse encima." }),
      marco("Alerta en línea", `<div class="pila">${alerta("Este proceso no tiene responsable. Asígnalo para que avance.", { titulo: "Falta responsable." })}${alerta("La integración con Bsale se sincroniza cada 15 minutos.", { tono: "info" })}</div>`, { nota: "Junto a lo que afecta, dentro del contenido." }),
      marco("Banners", `<div class="pila">${banner("Tu diagnóstico está listo", "Revisa los 6 hallazgos y elige por dónde empezar.", { tono: "exito", accion: "Ver informe" })}${banner("Prueba de 14 días", "Te quedan 3 días. Elige un plan para no perder tus datos.", { tono: "info", accion: "Ver planes" })}${banner("No pudimos conectar el CRM", "La clave de acceso venció. Pide una nueva a tu administrador.", { tono: "error" })}</div>`, { ancho: true, nota: "Arriba de la página o sección; persiste hasta que se resuelve." }),
    ])}
    ${ficha({ que: "Avisos de la app: toast (efímero), alerta (en línea), banner (persistente). No imitan notificaciones del sistema operativo.", importar: 'import { toast, banner, alerta } from "./kit/avisos.js?v=e217e49";', codigo: 'toast("Proceso archivado", { accion: { texto: "Deshacer", alHacer: restaurar } });', reglas: ["Toda acción destructiva reversible ofrece «Deshacer».", "Los errores usan role=alert; el resto role=status.", "Nunca más de 3 toasts a la vez."] })}`;
    el.querySelectorAll("[data-toast]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.toast;
      if (k === "deshacer") toast("Proceso «Cotizaciones» archivado.", { accion: { texto: "Deshacer", alHacer: () => toast("Restaurado.", { tono: "exito" }) } });
      if (k === "exito") toast("Cambios guardados.", { tono: "exito" });
      if (k === "error") toast("No se pudo enviar. Revisa tu conexión e intenta de nuevo.", { tono: "error", accion: { texto: "Reintentar" } });
    }));
  },

  async insignias(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Estados de proceso", `<div class="fila-botones">${insignia("Documentado", { tono: "exito" })}${insignia("En revisión", { tono: "info" })}${insignia("Trabado", { tono: "alerta" })}${insignia("Sin responsable", { tono: "error" })}${insignia("Borrador")}${insignia("Nuevo", { tono: "acento" })}</div>`, { nota: "El color siempre va con palabra: nunca solo color." }),
      marco("Etiquetas", `<div class="fila-botones">${etiqueta("Ventas")}${etiqueta("Rancagua")}${etiqueta("Prioridad alta")}${etiqueta("Q4", { quitar: false })}</div>`, { nota: "Filtros y clasificación; se pueden quitar." }),
      marco("Contadores", `<div class="fila-botones" style="gap:28px"><span style="display:inline-flex;gap:8px;align-items:center">${icono("chat-circle-text", { tam: 20 })} Conversaciones ${contador(4)}</span><span style="display:inline-flex;gap:8px;align-items:center">${icono("envelope-simple", { tam: 20 })} Correos ${contador(128)}</span></div>`),
    ])}
    ${ficha({ que: "Insignias (estado), etiquetas (clasificación) y contadores (pendientes).", importar: 'import { insignia, etiqueta, contador } from "./kit/avisos.js?v=e217e49";', reglas: ["Estados con los colores reservados; acento solo para «Nuevo».", "Máximo 2 insignias por fila de tabla."] })}`;
  },

  async menus(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Menú de acciones", `<div class="fila-botones">${boton("Acciones", { variante: "secundario", icoFin: "caret-down", attrs: 'data-menu aria-haspopup="menu" aria-expanded="false"' })}${botonIcono("dots-three", "Más opciones", { attrs: 'data-menu-mas aria-haspopup="menu" aria-expanded="false"' })}</div>`, { nota: "Nace del botón. Flechas, Inicio, Fin, Esc y clic afuera. Si no cabe abajo, abre arriba." }),
      marco("Popover", `<div class="fila-botones">${boton("Filtrar", { variante: "secundario", ico: "funnel", attrs: 'data-popover aria-haspopup="dialog" aria-expanded="false"' })}</div>`, { nota: "Contenido corto con controles. Se cierra con Esc o al aplicar." }),
      marco("Tooltip", `<div class="fila-botones">${botonIcono("download-simple", "Descargar", { attrs: 'data-tip="Descargar en PDF"' })}${botonIcono("link-simple", "Copiar enlace", { attrs: 'data-tip="Copiar enlace"' })}<span class="chico" data-tip="Horas por semana que se recuperan" tabindex="0" style="text-decoration:underline dotted;text-underline-offset:4px">31 h/sem</span></div>`, { nota: "Aparece a los 450 ms con mouse o con foco de teclado. Nunca con información esencial." }),
    ])}
    ${ficha({ que: "Flotantes anclados a un botón. Van a &lt;body&gt; para que ningún contenedor los recorte.", importar: 'import { abrirMenu, abrirPopover } from "./kit/popups.js?v=e217e49";', codigo: 'btn.onclick = () => abrirMenu(btn, [\n  { texto: "Duplicar", ico: "copy", alHacer: duplicar },\n  "—",\n  { texto: "Eliminar", ico: "trash", peligro: true, alHacer: eliminar },\n]);', reglas: ["Un flotante abierto a la vez.", "El foco vuelve al botón al cerrar.", "Acciones peligrosas al final, separadas."] })}`;
    const items = [{ texto: "Editar proceso", ico: "pencil-simple", atajo: "E" }, { texto: "Duplicar", ico: "copy", atajo: "D", alHacer: () => toast("Proceso duplicado.", { tono: "exito" }) }, { texto: "Copiar enlace", ico: "link-simple" }, "—", { texto: "Eliminar", ico: "trash", peligro: true, alHacer: () => toast("Proceso eliminado.", { accion: { texto: "Deshacer" } }) }];
    el.querySelector("[data-menu]").addEventListener("click", (e) => abrirMenu(e.currentTarget, items));
    el.querySelector("[data-menu-mas]").addEventListener("click", (e) => abrirMenu(e.currentTarget, items, { alinear: "fin" }));
    el.querySelector("[data-popover]").addEventListener("click", (e) => {
      abrirPopover(e.currentTarget, `<b>Filtrar procesos</b>${casilla("Trabados", { marcada: true })}${casilla("Sin responsable")}${casilla("Documentados")}<div class="fila-botones" style="justify-content:flex-end">${boton("Aplicar", { tam: "s", attrs: "data-aplicar" })}</div>`, { etiqueta: "Filtrar procesos" });
      document.querySelector("[data-aplicar]")?.addEventListener("click", () => { cerrarFlotante(); toast("Filtro aplicado: 1 condición."); });
    });
  },

  async dialogos(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Modal", `<div class="fila-botones">${boton("Invitar al equipo", { attrs: "data-modal" })}</div>`, { nota: "Para una tarea corta que interrumpe. En celular sube desde abajo como hoja." }),
      marco("Hoja lateral", `<div class="fila-botones">${boton("Ver detalle del proceso", { variante: "secundario", attrs: "data-hoja" })}</div>`, { nota: "Para ver o editar el detalle sin perder la lista de fondo." }),
      marco("Confirmación destructiva", `<div class="fila-botones">${boton("Eliminar proceso", { variante: "peligro", attrs: "data-destructivo" })}</div>`, { nota: "Para lo que no se puede deshacer: se escribe el nombre para confirmar." }),
    ], 3)}
    ${ficha({ que: "Diálogos nativos (&lt;dialog&gt;): foco atrapado, Esc cierra, clic afuera cierra.", importar: 'import { abrirDialogo, confirmarDestructivo } from "./kit/popups.js?v=e217e49";', codigo: 'abrirDialogo({ titulo: "Invitar", cuerpo, acciones: [{ texto: "Cancelar" }, { texto: "Enviar", variante: "primario", alHacer }] });', reglas: ["Título que dice la tarea, no «Atención».", "El botón principal a la derecha; cancelar a su izquierda.", "Si se puede deshacer, no se pide confirmación: se ofrece «Deshacer»."] })}`;
    el.querySelector("[data-modal]").addEventListener("click", () => abrirDialogo({
      titulo: "Invitar al equipo",
      cuerpo: `<p class="chico">Les llegará un correo para entrar al panel de Quillay.</p>${campo("Correos", { tipo: "area", marcador: "camila@quillay.cl, jorge@quillay.cl" })}${campo("Rol", { tipo: "selector", opciones: ["Puede ver", "Puede editar", "Administrador"], valor: "Puede editar" })}`,
      acciones: [{ texto: "Cancelar" }, { texto: "Enviar invitaciones", variante: "primario", alHacer: () => toast("Invitaciones enviadas.", { tono: "exito" }) }],
    }));
    el.querySelector("[data-hoja]").addEventListener("click", () => abrirDialogo({
      tipo: "hoja", ancho: 460, titulo: "Cotizaciones",
      cuerpo: `<div class="fila-botones">${insignia("Trabado", { tono: "alerta" })}${insignia("Ventas", { punto: false })}</div>
        <p class="chico">Las cotizaciones se arman en planillas y se mandan por WhatsApp. Demoran 2,5 días en promedio y 1 de cada 4 se rehace.</p>
        <dl class="detalle"><dt>Responsable</dt><dd>Jorge Molina</dd><dt>Horas por semana</dt><dd>12 h</dd><dt>Sistemas</dt><dd>Excel, WhatsApp, correo</dd><dt>Próximo paso</dt><dd>Plantilla de cotización en el CRM</dd></dl>`,
      acciones: [{ texto: "Cerrar" }, { texto: "Asignar mejora", variante: "primario" }],
    }));
    el.querySelector("[data-destructivo]").addEventListener("click", () => confirmarDestructivo({
      titulo: "¿Eliminar «Cotizaciones»?", texto: "Se borra el proceso, sus 14 notas y su historial. No se puede deshacer.", nombre: "Cotizaciones", alConfirmar: () => toast("Proceso eliminado.", { tono: "error" }),
    }));
  },
};
