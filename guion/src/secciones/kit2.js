/* Capítulo 2 · Kit v2 (ola 4): cerámica que se hunde, controles con el punto, campos que validan en vivo,
   cargas que dibujan, avisos de papel, estados por forma, flotantes que nacen en círculo y diálogos que se expanden. */
import { pieza, activarPiezas, curvaMovimiento, activarCurvas, codigo } from "../kit/presentar.js";
import { boton, botonIcono, botonMantener, trabajar, segmento, interruptor, casilla, radio, deslizador, perilla } from "../kit/controles.js";
import { campo, validar } from "../kit/campos.js";
import { toast, banner, alerta, insignia, etiqueta, contador, estado, fichaCeramica } from "../kit/avisos.js";
import { abrirMenu, abrirPopover, abrirDialogo, confirmarDestructivo, confirmarManteniendo, cerrarFlotante } from "../kit/popups.js";
import { carga, cargaMarca, cargaDibuja, sincronizarCargas, progreso, moverProgreso } from "../kit/punto.js";
import { isotipo } from "../kit/marca.js";
import { icono } from "../kit/iconos.js";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const reglas = (lista) => `<ul class="lista-punto">${lista.map((r) => `<li>${r}</li>`).join("")}</ul>`;
const usoDe = (lista, cod) => `<div class="rejilla-2"><div class="pila"><p class="titulo-3">Reglas</p>${reglas(lista)}</div><div class="pila"><p class="titulo-3">Código</p>${codigo(cod)}</div></div>`;
const fila = (titulo, html, nota = "") => `<div class="banco__fila"><div class="banco__rotulo"><b>${titulo}</b>${nota ? `<span class="chico">${nota}</span>` : ""}</div><div class="banco__piezas">${html}</div></div>`;

export const kit2 = {
  /* ── Botones ── */
  async botones(el) {
    const vivo = `<div class="banco ceramica-mesa">
      ${fila("La gran llamada", `${boton("Agendar diagnóstico", { variante: "acento", tam: "l", icoFin: "arrow-right" }).replace('class="boton', 'class="boton boton--punto')}${boton("Ver el plan", { variante: "secundario", tam: "l" })}`, "Acento, una por pantalla. Al pasar, la flecha se vuelve punto.")}
      ${fila("Variantes", `${boton("Guardar", { variante: "primario" })}${boton("Comenzar ahora", { variante: "acento" })}${boton("Exportar", { variante: "secundario", ico: "download-simple" })}${boton("Saber más", { variante: "texto", icoFin: "arrow-right" })}${boton("Eliminar", { variante: "peligro", ico: "trash" })}`, "Presiona y mantén: la cerámica se hunde.")}
      ${fila("Tamaños", ["s", "m", "l"].map((t) => boton(`Tamaño ${t.toUpperCase()}`, { variante: "secundario", tam: t })).join(""), "S 36 · M 44 · L 52 px")}
      ${fila("Trabajando → listo", `${boton("Guardar cambios", { attrs: "data-trabajar" })}${boton("Enviar propuesta", { variante: "acento", attrs: "data-trabajar" })}`, "El punto orbita y, al terminar, cae y se vuelve el check.")}
      ${fila("Mantener para confirmar", `${botonMantener("Mantén para eliminar", { attrs: "data-borrar" })}<span class="chico" data-borrado>Proceso «Cotizaciones» · 14 notas</span>`, "Lo irreversible no se confirma con un clic.")}
      ${fila("Solo ícono", `${botonIcono("dots-three", "Más opciones")}${botonIcono("pencil-simple", "Editar", { variante: "texto" })}${botonIcono("plus", "Agregar", { variante: "primario" })}${botonIcono("download-simple", "Descargar")}`)}
    </div>`;
    const anatomia = `<div class="anatomia-escena"><div class="anatomia-escena__pieza" data-anatomia>${boton("Agendar diagnóstico", { variante: "acento", tam: "l", icoFin: "arrow-right", attrs: 'data-cota="ancho alto caja" data-cota-texto="radio 12"' }).replace('<span class="boton__texto">', '<span class="boton__texto" data-cota="texto" data-cota-texto="16 · 600 · −1 %">')}</div>
      <div class="capas-ceramica">${[["Esmalte", "El color de base (acento, navy o hueso)."], ["Luz", "Un brillo ancho arriba a la izquierda."], ["Canto", "Filo iluminado arriba, sombra abajo."], ["Grano", "La textura de la marca, dentro."], ["Apoyo", "Sombra corta de contacto y una larga muy suave."]].map(([n, d], i) => `<figure class="capa-ceramica capa-ceramica--${i + 1}"><div class="capa-ceramica__muestra"></div><figcaption><b>${i + 1} · ${n}</b><span class="chico">${d}</span></figcaption></figure>`).join("")}</div></div>`;
    const movimiento = `<div class="curvas-firma__lista">${[
      { nombre: "Presión", bezier: [0.16, 1, 0.3, 1], ms: 160, uso: "Se hunde 1 px y la luz pasa adentro. Responde al instante." },
      { nombre: "Hover", bezier: [0.16, 1, 0.3, 1], ms: 160, uso: "Sube 1 px y se ilumina apenas." },
      { nombre: "Listo", bezier: [0.16, 1, 0.3, 1], ms: 520, uso: "El punto cae y se vuelve el check." },
    ].map(curvaMovimiento).join("")}</div>`;
    const uso = usoDe(["Primario navy para la acción principal; <b>acento</b> para la gran llamada (una por pantalla).", "El texto dice la acción: «Guardar cambios», no «Aceptar».", "Lo irreversible se confirma manteniendo presionado o escribiendo el nombre.", "Deshabilitado siempre con una razón visible cerca."],
      'contenedor.innerHTML = boton("Agendar diagnóstico", { variante: "acento", icoFin: "arrow-right" });\nbtn.onclick = () => trabajar(btn, () => api.guardar(), { cargando: "Guardando…" });\nmenu.innerHTML = botonMantener("Mantén para eliminar");\nmenu.addEventListener("confirmado", eliminar);');
    cuerpo(el).innerHTML = pieza({ vivo, anatomia, movimiento, uso });
    activarPiezas(el); activarCurvas(el);
    el.querySelectorAll("[data-trabajar]").forEach((b) => b.addEventListener("click", () => trabajar(b, () => espera(1500), { cargando: b.textContent.includes("Enviar") ? "Enviando…" : "Guardando…" })));
    el.querySelector("[data-borrar]").addEventListener("confirmado", () => { el.querySelector("[data-borrado]").textContent = "Eliminado. Puedes recuperarlo durante 30 días."; toast("Proceso eliminado.", { accion: { texto: "Deshacer", alHacer: () => (el.querySelector("[data-borrado]").textContent = "Proceso «Cotizaciones» · 14 notas") } }); });
  },

  /* ── Controles de elección: una consola de cerámica ── */
  async eleccion(el) {
    const vivo = `<div class="consola ceramica-mesa">
      <div class="consola__grupo consola__perillas"><span class="rotulo">Perillas</span>${perilla("Horas por semana", { min: 0, max: 60, valor: 31, unidad: " h" })}${perilla("Personas", { min: 1, max: 200, valor: 38 })}</div>
      <div class="consola__grupo"><span class="rotulo">Segmentados</span>${segmento(["Semana", "Mes", "Trimestre"], { activa: 1, etiqueta: "Periodo" })}${segmento(["Lista", "Tablero", "Mapa"], { etiqueta: "Vista" })}
        <span class="rotulo">Interruptores</span>${interruptor("Avisarme por correo", { activo: true, ayuda: "Cuando un proceso cambie" })}${interruptor("Resumen semanal", { ayuda: "Lunes 8:00" })}</div>
      <div class="consola__grupo"><span class="rotulo">Casillas</span>${casilla("Ventas", { marcada: true })}${casilla("Operaciones")}${casilla("Finanzas")}
        <span class="rotulo">Una opción</span>${radio("Tenemos CRM", { nombre: "crm2", marcado: true })}${radio("Usamos planillas", { nombre: "crm2" })}${radio("No llevamos registro", { nombre: "crm2" })}</div>
      <div class="consola__grupo consola__deslizadores"><span class="rotulo">Deslizadores con trama</span>${deslizador("Personas en el equipo", { min: 1, max: 200, valor: 38 })}<label class="deslizador"><span class="deslizador__cabeza"><b>Presupuesto mensual</b><output>$ 2.500.000</output></span><input type="range" min="500000" max="10000000" step="100000" value="2500000" data-formato="pesos" style="--p:21%"></label></div>
    </div>`;
    const uso = usoDe(["Segmentado: 2 a 4 opciones que se ven todas; el indicador lleva el punto.", "Interruptor: efecto inmediato, sin «Guardar». Encendido lleva el punto.", "Perilla: valores con sensación de ajuste fino (horas, porcentajes). Arrastra hacia arriba o usa las flechas.", "Deslizador: rangos aproximados; lo recorrido se pinta con trama de puntos.", "Siempre se puede usar con teclado."],
      'activarControles(); // una vez por página\npanel.innerHTML = perilla("Horas por semana", { min: 0, max: 60, valor: 31, unidad: " h" });\npanel.addEventListener("cambio", (e) => guardar(e.detail));');
    cuerpo(el).innerHTML = pieza({ vivo, uso });
    activarPiezas(el);
  },

  /* ── Campos: la ficha de la empresa, que se completa mientras escribes ── */
  async campos(el) {
    const datos = [["nombre", "Nombre de la empresa", { requerido: true, valor: "Quillay Suministros Industriales" }], ["correo", "Correo de trabajo", { tipo: "correo", requerido: true, marcador: "nombre@empresa.cl" }], ["rut", "RUT de la empresa", { tipo: "rut", requerido: true, marcador: "76.123.456-7", ayuda: "Se ordena solo. Prueba 76354771K" }], ["cel", "Celular", { tipo: "telefono", marcador: "9 1234 5678" }], ["pesos", "Facturación mensual", { tipo: "pesos", marcador: "25.000.000" }]];
    const vivo = `<div class="ficha-empresa">
      <form class="ficha-empresa__form papel" novalidate data-ficha>${datos.map(([k, e, o]) => campo(e, { ...o, attrs: `data-k2="${k}"` })).join("")}
        ${campo("Rubro", { tipo: "selector", marcador: "Elige un rubro", opciones: ["Distribución industrial", "Manufactura", "Servicios", "Comercio", "Otro"], attrs: 'data-k2="rubro"' })}</form>
      <div class="ficha-empresa__estado" role="status" aria-live="polite"><span class="rotulo">Así va la ficha</span><b class="ficha-empresa__n" data-ficha-n>1 de 6</b>
        <ul>${["Nombre", "Correo", "RUT", "Celular", "Facturación", "Rubro"].map((n, i) => `<li data-item="${["nombre", "correo", "rut", "cel", "pesos", "rubro"][i]}">${estado(n, { forma: i ? "vacio" : "lleno", tono: i ? "neutro" : "exito" })}</li>`).join("")}</ul>
        <p class="chico">Cada dato pasa de vacío a lleno cuando está bien. El punto de la derecha del campo dice lo mismo, sin colores solos.</p></div></div>`;
    const anatomia = `<div class="anatomia-escena"><div class="anatomia-escena__pieza anatomia-escena__pieza--campo" data-anatomia>${campo("RUT de la empresa", { tipo: "rut", requerido: true, valor: "76.354.771-K", ayuda: "Con dígito verificador" }).replace('class="campo__control', 'data-cota="ancho alto caja" data-cota-texto="radio 12" class="campo__control').replace('class="campo__etiqueta"', 'data-cota="texto" class="campo__etiqueta"')}</div></div>`;
    const uso = usoDe(["La etiqueta siempre visible: el marcador no la reemplaza.", "Se valida al salir del campo, nunca a la primera tecla; el error se va apenas se corrige.", "El error dice cómo arreglarlo («falta el dominio, ej. nombre@empresa.cl»).", "Formatos chilenos: RUT con dígito verificador, celular de 9 dígitos, pesos con punto de miles."],
      'activarCampos(); // formato y validación al salir del campo\nform.innerHTML = campo("RUT de la empresa", { tipo: "rut", requerido: true });');
    cuerpo(el).innerHTML = pieza({ vivo, anatomia, uso });
    activarPiezas(el);
    const form = el.querySelector("[data-ficha]");
    const revisar = () => {
      let n = 0;
      form.querySelectorAll("[data-k2]").forEach((i) => {
        const v = i.value.trim(), c = i.closest("[data-campo]"), bien = i.tagName === "SELECT" ? !!v : !!v && !c.classList.contains("campo--error") && (c.classList.contains("campo--valido") || i.dataset.k2 === "nombre");
        const medio = !!v && !bien;
        if (bien) n++;
        const li = el.querySelector(`[data-item="${i.dataset.k2}"]`);
        li.innerHTML = estado(li.textContent, { forma: bien ? "lleno" : medio ? "medio" : "vacio", tono: bien ? "exito" : medio ? "alerta" : "neutro" });
      });
      el.querySelector("[data-ficha-n]").textContent = `${n} de 6`;
    };
    form.addEventListener("focusout", () => setTimeout(revisar, 0));
    form.addEventListener("change", revisar);
    form.addEventListener("input", () => setTimeout(revisar, 0));
    form.querySelector('[data-k2="nombre"]').closest("[data-campo]").classList.add("campo--valido");
  },

  /* ── Cargas y estados ── */
  async cargas(el) {
    const vivo = `<div class="cargas2">
      <div class="cargas2__eje"><span class="rotulo">Cuánto se espera</span>
        <div class="eje-espera">${[["0–1 s", "Nada", "Mostrar carga ahí molesta más que ayuda."], ["1–4 s", "Carga chica o esqueleto", "En el botón o en el contenido que llega."], ["> 4 s", "Carga de marca + qué pasa", "El punto dibuja o las órbitas se abren."], ["Proceso", "Progreso por pasos", "Cuando se sabe cuántos pasos faltan."]].map(([t, q, d], i) => `<div class="eje-espera__tramo" style="--i:${i}"><span class="mono">${t}</span><b>${q}</b><span class="chico">${d}</span></div>`).join("")}</div></div>
      <div class="cargas2__mosaico">
        <figure class="carga-ficha"><div class="carga-ficha__escena"><div class="fila-botones">${boton("Guardando…", { attrs: "aria-busy=true disabled" }).replace('<span class="boton__texto">', `${carga({ tam: 16 })}<span class="boton__texto">`)}</div><span class="chico" style="display:inline-flex;gap:10px;align-items:center">${carga({ tam: 16 })} Sincronizando con Bsale…</span></div><figcaption><b>Chica</b><span class="chico">En botones y líneas de texto.</span></figcaption></figure>
        <figure class="carga-ficha"><div class="carga-ficha__escena">${cargaDibuja({ tam: 120, etiqueta: "Preparando tu diagnóstico" })}</div><figcaption><b>Dibuja</b><span class="chico">Pantallas de carga de marca.</span></figcaption></figure>
        <figure class="carga-ficha"><div class="carga-ficha__escena">${cargaMarca({ tam: 104, larga: true })}<span class="chico">Leyendo 1.240 documentos…</span></div><figcaption><b>Órbita larga</b><span class="chico">Más de 4 s, con texto que cuenta.</span></figcaption></figure>
        <figure class="carga-ficha carga-ficha--ancha"><div class="carga-ficha__escena"><div class="pila" style="width:100%">${progreso(["Datos", "Procesos", "Sistemas", "Resumen"], 1)}<div class="fila-botones">${boton("Atrás", { variante: "secundario", tam: "s", attrs: 'data-paso="-1"' })}${boton("Siguiente", { tam: "s", attrs: 'data-paso="1"' })}</div></div></div><figcaption><b>Etapas</b><span class="chico">El punto viaja al paso actual y deja encendido lo recorrido.</span></figcaption></figure>
        <figure class="carga-ficha carga-ficha--ancha"><div class="carga-ficha__escena"><div class="esq-tarjeta"><div class="esqueleto" style="width:48px;height:48px;border-radius:50%"></div><div style="display:grid;gap:9px;flex:1"><div class="esqueleto" style="height:14px;width:58%"></div><div class="esqueleto" style="height:11px;width:92%"></div><div class="esqueleto" style="height:11px;width:74%"></div></div></div></div><figcaption><b>Esqueleto de grano</b><span class="chico">El barrido es grano que se desplaza, no un brillo plano.</span></figcaption></figure>
      </div>
      <div class="cargas2__estados">
        <div class="estado-tarjeta">${isotipo({ clase: "m-iso m-iso--sin-punto estado-tarjeta__iso" })}<b>Aún no hay procesos</b><p class="chico">Documenta el primero y el disco se completa.</p>${boton("Documentar un proceso", { tam: "s", ico: "plus" })}</div>
        <div class="estado-tarjeta"><span class="estado-tarjeta__ico estado-tarjeta__ico--error">${icono("warning-circle", { tam: 24 })}</span><b>No pudimos traer las cotizaciones</b><p class="chico">El CRM no respondió a tiempo. Tus datos están a salvo.</p>${boton("Reintentar", { variante: "secundario", tam: "s", ico: "arrow-clockwise" })}</div>
        <div class="estado-tarjeta estado-tarjeta--ancha">${banner("Sin conexión", "Los cambios se guardan en este equipo y se envían al volver.", { tono: "alerta", cerrable: false })}</div>
      </div></div>`;
    const uso = usoDe(["Una sola carga por pantalla, siempre con <code>role=status</code> y una etiqueta que diga qué se carga.", "Ningún estado deja la pantalla en blanco: cada vista define su carga, su vacío y su error.", "Los errores no culpan y dicen qué hacer; el vacío invita a empezar."],
      'boton.innerHTML = carga({ tam: 16 }) + " Guardando…";\npantalla.innerHTML = cargaDibuja({ etiqueta: "Preparando tu diagnóstico" });\nsincronizarCargas(pantalla);');
    cuerpo(el).innerHTML = pieza({ vivo, uso });
    activarPiezas(el); sincronizarCargas(el);
    const prog = el.querySelector(".progreso");
    el.querySelectorAll("[data-paso]").forEach((b) => b.addEventListener("click", () => moverProgreso(prog, Math.max(0, Math.min(3, +prog.dataset.actual + +b.dataset.paso)))));
  },

  /* ── Avisos ── */
  async avisos(el) {
    const vivo = `<div class="avisos2">
      <div class="avisos2__disparos papel"><span class="rotulo">Toasts de papel</span>
        ${boton("Archivar proceso", { variante: "secundario", attrs: 'data-toast="deshacer"' })}${boton("Guardar", { variante: "secundario", attrs: 'data-toast="exito"' })}${boton("Simular error", { variante: "secundario", attrs: 'data-toast="error"' })}${boton("Tres seguidos", { attrs: 'data-toast="pila"' })}
        <p class="chico">Se apilan con profundidad abajo a la derecha. Pasa el mouse sobre la pila: se abre.</p></div>
      <div class="avisos2__banners pila">${banner("Tu diagnóstico está listo", "Revisa los 6 hallazgos y elige por dónde empezar.", { tono: "exito", accion: "Ver informe" })}${banner("Prueba de 14 días", "Te quedan 3 días. Elige un plan para no perder tus datos.", { tono: "info", accion: "Ver planes" })}${banner("No pudimos conectar el CRM", "La clave de acceso venció. Pide una nueva a tu administrador.", { tono: "error", accion: "Cómo hacerlo" })}
        ${alerta("Este proceso no tiene responsable. Asígnalo para que avance.", { titulo: "Falta responsable." })}${alerta("La integración con Bsale se sincroniza cada 15 minutos.", { tono: "info" })}</div></div>`;
    const uso = usoDe(["Toast: efímero, abajo a la derecha, máximo 3; 5 s (7 con acción), se pausa con el mouse.", "Toda acción destructiva reversible ofrece «Deshacer».", "Banner: persistente hasta resolverse. Alerta: en línea, junto a lo que afecta.", "No imitan notificaciones del sistema operativo."],
      'toast("Proceso archivado", { accion: { texto: "Deshacer", alHacer: restaurar } });\nzona.innerHTML = banner("Sin conexión", "Los cambios se guardan en este equipo.", { tono: "alerta" });');
    cuerpo(el).innerHTML = pieza({ vivo, uso });
    activarPiezas(el);
    const lanzar = (k) => {
      if (k === "deshacer") toast("Proceso «Cotizaciones» archivado.", { accion: { texto: "Deshacer", alHacer: () => toast("Restaurado.", { tono: "exito" }) } });
      if (k === "exito") toast("Cambios guardados.", { tono: "exito" });
      if (k === "error") toast("No se pudo enviar. Revisa tu conexión e intenta de nuevo.", { tono: "error", accion: { texto: "Reintentar" } });
    };
    el.querySelectorAll("[data-toast]").forEach((b) => b.addEventListener("click", async () => {
      if (b.dataset.toast !== "pila") return lanzar(b.dataset.toast);
      for (const k of ["exito", "deshacer", "error"]) { lanzar(k); await espera(420); }
    }));
  },

  /* ── Etiquetas y estados ── */
  async insignias(el) {
    const procesos = [["Cotizaciones", "Trabado", "medio", "alerta"], ["Despachos", "Documentado", "lleno", "exito"], ["Inventario", "En revisión", "medio", "info"], ["Cobranza", "Sin responsable", "vacio", "error"], ["Compras", "Borrador", "vacio", "neutro"]];
    const vivo = `<div class="estados2">
      <div class="estados2__tabla papel"><span class="rotulo">Estado por forma · se lee sin color</span>
        <table class="tabla-estados"><thead><tr><th>Proceso</th><th>Estado</th><th>Avance</th></tr></thead><tbody>${procesos.map(([p, e, f, t], i) => `<tr><td><b>${p}</b></td><td>${estado(e, { forma: f, tono: t })}</td><td><span class="avance" style="--v:${[0.5, 1, 0.6, 0, 0.1][i]}"><i></i></span></td></tr>`).join("")}</tbody></table>
        <p class="chico"><b>Lleno</b> = listo · <b>medio</b> = en curso o detenido · <b>vacío</b> = sin empezar. El color confirma; la forma informa.</p></div>
      <div class="estados2__lado">
        <div class="pila"><span class="rotulo">Fichas de cerámica (filtros)</span><div class="fila-botones">${["Ventas", "Operaciones", "Finanzas", "Rancagua", "Prioridad alta"].map((t, i) => fichaCeramica(t, { activa: i === 0 || i === 4 })).join("")}</div></div>
        <div class="pila"><span class="rotulo">Insignias</span><div class="fila-botones">${insignia("Documentado", { tono: "exito" })}${insignia("En revisión", { tono: "info" })}${insignia("Trabado", { tono: "alerta" })}${insignia("Sin responsable", { tono: "error" })}${insignia("Nuevo", { tono: "acento" })}</div></div>
        <div class="pila"><span class="rotulo">Etiquetas y contadores</span><div class="fila-botones">${etiqueta("Ventas")}${etiqueta("Q4", { quitar: false })}<span class="contador-linea">${icono("chat-circle-text", { tam: 20 })} Conversaciones ${contador(4)}</span><span class="contador-linea">${icono("envelope-simple", { tam: 20 })} Correos ${contador(128)}</span></div></div>
      </div></div>`;
    const uso = usoDe(["Los estados usan los colores reservados y siempre van con palabra.", "La forma del punto dice el avance (lleno, medio, vacío): sirve a quien no distingue colores.", "El acento solo marca lo «nuevo» o lo elegido.", "Máximo 2 insignias por fila de tabla."],
      'celda.innerHTML = estado("Trabado", { forma: "medio", tono: "alerta" });\nfiltros.innerHTML = fichaCeramica("Ventas", { activa: true });');
    cuerpo(el).innerHTML = pieza({ vivo, uso });
    activarPiezas(el);
    el.querySelectorAll(".ficha-ceramica").forEach((f) => f.addEventListener("click", () => f.setAttribute("aria-pressed", f.getAttribute("aria-pressed") !== "true")));
  },

  /* ── Menús y popovers ── */
  async menus(el) {
    const vivo = `<div class="flotantes2 ceramica-mesa">
      <div class="flotantes2__caso"><span class="rotulo">Menú de acciones</span><div class="fila-botones">${boton("Acciones", { variante: "secundario", icoFin: "caret-down", attrs: 'data-menu aria-haspopup="menu" aria-expanded="false"' })}${botonIcono("dots-three", "Más opciones", { attrs: 'data-menu-mas aria-haspopup="menu" aria-expanded="false"' })}</div><p class="chico">Nace del botón en círculo; el punto señala de dónde salió.</p></div>
      <div class="flotantes2__caso"><span class="rotulo">Popover</span><div class="fila-botones">${boton("Filtrar", { variante: "secundario", ico: "funnel", attrs: 'data-popover aria-haspopup="dialog" aria-expanded="false"' })}</div><p class="chico">Contenido corto con controles. Esc o «Aplicar» lo cierran.</p></div>
      <div class="flotantes2__caso"><span class="rotulo">Tooltip</span><div class="fila-botones">${botonIcono("download-simple", "Descargar", { attrs: 'data-tip="Descargar en PDF"' })}${botonIcono("link-simple", "Copiar enlace", { attrs: 'data-tip="Copiar enlace"' })}<span class="chico" data-tip="Horas por semana que se recuperan" tabindex="0" style="text-decoration:underline dotted;text-underline-offset:4px">31 h/sem</span></div><p class="chico">Aparece a los 450 ms; nunca lleva lo único importante.</p></div>
    </div>`;
    const uso = usoDe(["Un flotante a la vez. Van a &lt;body&gt;: ningún contenedor los recorta.", "Teclado completo: flechas, Inicio, Fin, Esc; el foco vuelve al botón.", "Si no cabe abajo, se abre hacia arriba (y el punto también cambia de lado)."],
      'btn.onclick = () => abrirMenu(btn, [\n  { texto: "Duplicar", ico: "copy", alHacer: duplicar },\n  "—",\n  { texto: "Eliminar", ico: "trash", peligro: true, alHacer: eliminar },\n]);');
    cuerpo(el).innerHTML = pieza({ vivo, uso });
    activarPiezas(el);
    const items = [{ texto: "Editar proceso", ico: "pencil-simple", atajo: "E" }, { texto: "Duplicar", ico: "copy", atajo: "D", alHacer: () => toast("Proceso duplicado.", { tono: "exito" }) }, { texto: "Copiar enlace", ico: "link-simple" }, "—", { texto: "Eliminar", ico: "trash", peligro: true, alHacer: () => toast("Proceso eliminado.", { accion: { texto: "Deshacer" } }) }];
    el.querySelector("[data-menu]").addEventListener("click", (e) => abrirMenu(e.currentTarget, items));
    el.querySelector("[data-menu-mas]").addEventListener("click", (e) => abrirMenu(e.currentTarget, items, { alinear: "fin" }));
    el.querySelector("[data-popover]").addEventListener("click", (e) => {
      abrirPopover(e.currentTarget, `<b>Filtrar procesos</b>${casilla("Trabados", { marcada: true })}${casilla("Sin responsable")}${casilla("Documentados")}<div class="fila-botones" style="justify-content:flex-end">${boton("Aplicar", { tam: "s", attrs: "data-aplicar" })}</div>`, { etiqueta: "Filtrar procesos" });
      document.querySelector("[data-aplicar]")?.addEventListener("click", () => { cerrarFlotante(); toast("Filtro aplicado: 1 condición."); });
    });
  },

  /* ── Diálogos ── */
  async dialogos(el) {
    const caso = (t, b, n) => `<div class="dialogos2__caso"><span class="rotulo">${t}</span>${b}<p class="chico">${n}</p></div>`;
    const vivo = `<div class="dialogos2 ceramica-mesa">
      ${caso("Modal", boton("Invitar al equipo", { attrs: "data-modal" }), "Un disco que se expande en ventana desde donde tocaste. En celular sube como hoja.")}
      ${caso("Hoja lateral", boton("Ver detalle del proceso", { variante: "secundario", attrs: "data-hoja" }), "Ver o editar sin perder la lista de fondo.")}
      ${caso("Mantener para eliminar", boton("Eliminar nota", { variante: "peligro", ico: "trash", attrs: "data-mantener-d" }), "Para lo irreversible pero frecuente: se confirma manteniendo, sin escribir.")}
      ${caso("Escribir para eliminar", boton("Eliminar proceso", { variante: "peligro", attrs: "data-destructivo" }), "Para lo grave: se escribe el nombre para confirmar.")}
    </div>`;
    const uso = usoDe(["Título que dice la tarea, no «Atención».", "El botón principal a la derecha y con verbo.", "Foco atrapado; Esc y clic afuera cierran; el foco vuelve al botón.", "Lo destructivo: mantener (frecuente) o escribir el nombre (grave)."],
      'abrirDialogo({ titulo: "Invitar al equipo", cuerpo, acciones: [{ texto: "Cancelar" }, { texto: "Enviar", variante: "primario", alHacer }] });\nconfirmarManteniendo({ titulo: "¿Eliminar la nota?", texto: "…", alConfirmar: eliminar });');
    cuerpo(el).innerHTML = pieza({ vivo, uso });
    activarPiezas(el);
    el.querySelector("[data-modal]").addEventListener("click", () => abrirDialogo({
      titulo: "Invitar al equipo",
      cuerpo: `<p class="chico">Les llegará un correo para entrar al panel de Quillay.</p>${campo("Correos", { tipo: "area", marcador: "camila@quillay.cl, jorge@quillay.cl" })}${campo("Rol", { tipo: "selector", opciones: ["Puede ver", "Puede editar", "Administrador"], valor: "Puede editar" })}`,
      acciones: [{ texto: "Cancelar" }, { texto: "Enviar invitaciones", variante: "primario", alHacer: () => toast("Invitaciones enviadas.", { tono: "exito" }) }],
    }));
    el.querySelector("[data-hoja]").addEventListener("click", () => abrirDialogo({
      tipo: "hoja", ancho: 460, titulo: "Cotizaciones",
      cuerpo: `<div class="fila-botones">${estado("Trabado", { forma: "medio", tono: "alerta" })}${insignia("Ventas", { punto: false })}</div>
        <p class="chico">Las cotizaciones se arman en planillas y se mandan por WhatsApp. Demoran 2,5 días en promedio y 1 de cada 4 se rehace.</p>
        <dl class="detalle"><dt>Responsable</dt><dd>Jorge Molina</dd><dt>Horas por semana</dt><dd>12 h</dd><dt>Sistemas</dt><dd>Excel, WhatsApp, correo</dd><dt>Próximo paso</dt><dd>Plantilla de cotización en el CRM</dd></dl>`,
      acciones: [{ texto: "Cerrar" }, { texto: "Asignar mejora", variante: "primario" }],
    }));
    el.querySelector("[data-mantener-d]").addEventListener("click", () => confirmarManteniendo({ titulo: "¿Eliminar esta nota?", texto: "La nota «Llamada con Jorge, 3 de octubre» se borra para todo el equipo.", accion: "Mantén para eliminar", alConfirmar: () => toast("Nota eliminada.", { tono: "error" }) }));
    el.querySelector("[data-destructivo]").addEventListener("click", () => confirmarDestructivo({ titulo: "¿Eliminar «Cotizaciones»?", texto: "Se borra el proceso, sus 14 notas y su historial. No se puede deshacer.", nombre: "Cotizaciones", alConfirmar: () => toast("Proceso eliminado.", { tono: "error" }) }));
  },
};
