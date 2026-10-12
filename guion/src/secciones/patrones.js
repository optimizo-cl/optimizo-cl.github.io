/* Capítulo 4 · Patrones (fase 9). Todo con datos de Quillay desde src/demo/quillay.js. */
import { marco, rejilla, ficha, ejemplo } from "../kit/guion.js?v=8ed8960";
import { boton, botonIcono, segmento } from "../kit/controles.js?v=8ed8960";
import { insignia, toast, alerta } from "../kit/avisos.js?v=8ed8960";
import { abrirMenu, abrirDialogo } from "../kit/popups.js?v=8ed8960";
import { icono, rellenarIconos } from "../kit/iconos.js?v=8ed8960";
import { isotipo } from "../kit/marca.js?v=8ed8960";
import { barras, linea, dona, heroe } from "../patrones/graficas.js?v=8ed8960";
import { tabla } from "../patrones/tabla.js?v=8ed8960";
import { calendario, HOY } from "../patrones/fechas.js?v=8ed8960";
import { abrirBuscador, activarAtajoBuscador, resultadosHTML } from "../patrones/buscador.js?v=8ed8960";
import { EMPRESA, PROCESOS, ESTADOS, COTIZACIONES, VENTAS, CANALES, KPIS, PERSONAS, clp, clpCorto, pct, fechaCorta } from "../demo/quillay.js?v=8ed8960";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const persona = (id) => PERSONAS.find((p) => p.id === id)?.nombre || "—";
const ESTADO_COT = { Ganada: "exito", Enviada: "info", "En negociación": "acento", Perdida: "error", Borrador: "neutro" };
const NAV = [["house", "Inicio"], ["tree-structure", "Procesos"], ["buildings", "Clientes"], ["receipt", "Cotizaciones"], ["brain", "Memoria"], ["users-three", "Agentes"]];

export const patrones = {
  async "nav-app"(el) {
    activarAtajoBuscador();
    cuerpo(el).innerHTML = `<div class="app-marco mate">
        <div class="app-lateral">
          <div class="app-lateral__marca">${isotipo({ clase: "app-lateral__iso" })}<b>${EMPRESA.corto}</b></div>
          <nav aria-label="Secciones de la app"><ul>${NAV.map(([ic, n], i) => `<li><a href="#nav-app" class="app-nav ${i === 1 ? "activo" : ""}" ${i === 1 ? 'aria-current="page"' : ""}>${icono(ic, { tam: 20 })}<span>${n}</span>${n === "Procesos" ? '<span class="contador" style="margin-left:auto">2</span>' : ""}</a></li>`).join("")}</ul></nav>
          <div class="app-lateral__pie"><span class="avatar">CR</span><span><b>Camila Rojas</b><span class="rotulo">Gerenta general</span></span></div>
        </div>
        <div class="app-principal">
          <header class="app-cabeza"><nav class="migas" aria-label="Migas"><a href="#nav-app">${EMPRESA.corto}</a><span>/</span><a href="#nav-app">Procesos</a><span>/</span><b aria-current="page">Cotizaciones</b></nav>
            <button type="button" class="app-buscar" data-buscar>${icono("magnifying-glass", { tam: 18 })}<span>Buscar</span><kbd>Ctrl K</kbd></button></header>
          <div class="app-contenido"><div class="app-titulo"><div><p class="ceja">Ventas</p><p class="titulo-2">Cotizaciones</p></div>${insignia("Trabado", { tono: "alerta" })}</div>
            <p class="chico">12 horas a la semana · 1 de cada 4 se rehace · responsable ${persona("jm")}</p>
            ${alerta("Este proceso tiene una mejora propuesta: plantilla de cotización en el CRM.", { tono: "info" })}</div>
        </div></div>
      <div class="nav-pie">${ejemplo()}<p class="chico">Prueba <kbd>Ctrl</kbd> + <kbd>K</kbd> (o <kbd>⌘</kbd> + <kbd>K</kbd>) desde cualquier parte del guion. El activo se marca con el punto.</p></div>`;
    el.querySelector("[data-buscar]").addEventListener("click", abrirBuscador);
    el.querySelectorAll(".app-nav").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); el.querySelectorAll(".app-nav").forEach((x) => { x.classList.toggle("activo", x === a); x.toggleAttribute("aria-current", x === a); }); }));
  },

  async "nav-sitio"(el) {
    cuerpo(el).innerHTML = `<div class="navegador mate"><div class="navegador__barra"><i></i><i></i><i></i><span>optimizo.cl</span></div>
        <div class="sitio-mini" data-desplaza>
          <header class="sitio-nav"><span class="sitio-nav__logo">${isotipo()}<b>optimizo</b></span>
            <nav class="sitio-nav__links"><button type="button" data-servicios aria-haspopup="menu" aria-expanded="false">Servicios ${icono("caret-down", { tam: 14 })}</button><a href="#nav-sitio">Medula</a><a href="#nav-sitio">Casos</a><a href="#nav-sitio">Nosotros</a></nav>
            ${boton("Agendar diagnóstico", { tam: "s" })}</header>
          <div class="sitio-mini__hero"><p class="ceja">Partner de transformación digital</p><p class="titulo-1">Todo proceso tiene una salida.</p><p class="bajada">Desplaza dentro de este marco: la barra se compacta y gana una sombra suave.</p></div>
          <div class="sitio-mini__relleno">${Array.from({ length: 3 }, () => '<div class="esqueleto" style="height:120px;border-radius:16px"></div>').join("")}</div>
        </div></div>
      ${ficha({ que: "Barra del sitio: logo, 4 enlaces, una sola llamada a la acción. Al bajar se compacta (64 → 52 px); en celular pasa a menú de pantalla completa.", reglas: ["Máximo 5 enlaces.", "La llamada a la acción siempre visible.", "Servicios abre un menú con descripción corta de cada uno."] })}`;
    const caja = el.querySelector("[data-desplaza]"), nav = el.querySelector(".sitio-nav");
    caja.addEventListener("scroll", () => nav.classList.toggle("sitio-nav--compacta", caja.scrollTop > 24), { passive: true });
    el.querySelector("[data-servicios]").addEventListener("click", (e) => abrirMenu(e.currentTarget, [
      { texto: "Diagnóstico de procesos", ico: "magnifying-glass" }, { texto: "CRM a medida", ico: "kanban" }, { texto: "Equipos de agentes", ico: "users-three" }, { texto: "Flujos comerciales", ico: "flow-arrow" }]));
  },

  async "nav-celular"(el) {
    cuerpo(el).innerHTML = `<div class="celulares">
        <div class="celular"><div class="celular__pantalla">
          <div class="celular__cabeza"><b>Procesos</b>${botonIcono("magnifying-glass", "Buscar", { variante: "texto", tam: "s" })}</div>
          <div class="celular__lista">${PROCESOS.slice(0, 5).map((p) => `<button type="button" class="celular__fila" data-proc="${p.id}"><span><b>${p.nombre}</b><span class="rotulo">${p.area} · ${p.horas} h/sem</span></span>${insignia(ESTADOS[p.estado][0], { tono: ESTADOS[p.estado][1] })}</button>`).join("")}</div>
          <nav class="celular__tabs" aria-label="Secciones del celular">${NAV.slice(0, 4).map(([ic, n], i) => `<button type="button" class="${i === 1 ? "activo" : ""}">${icono(ic, { tam: 22 })}<span>${n}</span></button>`).join("")}</nav>
          <div class="celular__hoja" hidden><div class="celular__asa"></div><div data-hoja-cuerpo></div></div>
        </div></div>
        <div class="celulares__nota pila"><p class="titulo-3">En celular las piezas son otras</p>
          <ul class="lista-punto"><li><b>Barra inferior</b> con 4 destinos, al alcance del pulgar.</li><li><b>Filas táctiles</b> de 56 px en vez de tabla.</li><li><b>Hoja que sube</b> para el detalle (toca una fila).</li><li><b>Menú del sitio</b> a pantalla completa, no un desplegable chico.</li></ul></div></div>`;
    const hoja = el.querySelector(".celular__hoja"), hc = el.querySelector("[data-hoja-cuerpo]");
    el.querySelectorAll("[data-proc]").forEach((b) => b.addEventListener("click", () => {
      const p = PROCESOS.find((x) => x.id === b.dataset.proc);
      hc.innerHTML = `<p class="titulo-3">${p.nombre}</p>${insignia(ESTADOS[p.estado][0], { tono: ESTADOS[p.estado][1] })}<dl class="detalle"><dt>Horas por semana</dt><dd>${p.horas} h</dd><dt>Responsable</dt><dd>${persona(p.responsable)}</dd><dt>Sistemas</dt><dd>${p.sistemas.join(", ")}</dd></dl>${boton("Cerrar", { variante: "secundario", attrs: "data-cerrar-hoja" })}`;
      hoja.hidden = false; requestAnimationFrame(() => hoja.classList.add("abierta"));
      hc.querySelector("[data-cerrar-hoja]").addEventListener("click", () => { hoja.classList.remove("abierta"); setTimeout(() => (hoja.hidden = true), 320); });
    }));
    el.querySelectorAll(".celular__tabs button").forEach((b) => b.addEventListener("click", () => el.querySelectorAll(".celular__tabs button").forEach((x) => x.classList.toggle("activo", x === b))));
  },

  async paneles(el) {
    cuerpo(el).innerHTML = `<div class="kpis">
        ${[heroe({ rotulo: "Ventas de octubre", valor: clpCorto(KPIS.ventasMes), variacion: KPIS.variacionMes, nota: "vs. septiembre" }), heroe({ rotulo: "Tasa de cierre", valor: pct(KPIS.tasaCierre, 0), nota: "cotizaciones ganadas" }), heroe({ rotulo: "Días para cotizar", valor: KPIS.diasCotizar.toLocaleString("es-CL", { maximumFractionDigits: 1 }), nota: "promedio" }), heroe({ rotulo: "Horas perdidas", valor: KPIS.horasPerdidas + " h", nota: "por semana, en 6 procesos" })].map((h) => `<div class="mate kpi">${h}</div>`).join("")}</div>
      <div class="panel-dos"><div class="mate panel-graf" data-graf></div>
        <div class="mate panel-lista"><p class="titulo-3">Procesos que más cuestan</p><ul class="lista-procesos">${PROCESOS.slice().sort((a, b) => b.horas - a.horas).slice(0, 4).map((p) => `<li><button type="button" data-detalle="${p.id}"><span><b>${p.nombre}</b><span class="rotulo">${persona(p.responsable)}</span></span><span class="mono">${p.horas} h</span></button></li>`).join("")}</ul></div></div>
      <div class="nav-pie">${ejemplo()}<p class="chico">Toca un proceso para abrir su detalle en una hoja lateral.</p></div>`;
    linea(el.querySelector("[data-graf]"), { etiquetas: VENTAS.map((v) => v.mes), series: [{ nombre: "2026", valores: VENTAS.map((v) => v.actual), color: "--serie-1" }, { nombre: "2025", valores: VENTAS.map((v) => v.anterior), color: "--serie-2", tenue: true }] }, { titulo: "Ventas mensuales", formato: clp, formatoEje: clpCorto });
    el.querySelectorAll("[data-detalle]").forEach((b) => b.addEventListener("click", () => {
      const p = PROCESOS.find((x) => x.id === b.dataset.detalle);
      abrirDialogo({ tipo: "hoja", ancho: 440, titulo: p.nombre, cuerpo: `${insignia(ESTADOS[p.estado][0], { tono: ESTADOS[p.estado][1] })}<dl class="detalle"><dt>Área</dt><dd>${p.area}</dd><dt>Horas por semana</dt><dd>${p.horas} h</dd><dt>Responsable</dt><dd>${persona(p.responsable)}</dd><dt>Sistemas</dt><dd>${p.sistemas.join(", ")}</dd></dl>`, acciones: [{ texto: "Cerrar" }] });
    }));
  },

  async tablas(el) {
    cuerpo(el).innerHTML = `<div class="mate" style="padding:var(--e-4)" data-tabla></div>
      ${ficha({ que: "Tabla con orden por columna (clic en el título), filtro, selección y paginación. En angosto cada fila es una tarjeta.", importar: 'import { tabla } from "./patrones/tabla.js?v=8ed8960";', reglas: ["Números a la derecha y tabulares.", "Máximo 2 insignias por fila.", "La acción en lote aparece solo con selección."] })}`;
    tabla(el.querySelector("[data-tabla]"), {
      buscarEn: ["folio", "cliente", "estado", "vendedor"],
      acciones: boton("Exportar", { variante: "secundario", tam: "s", ico: "download-simple", attrs: 'data-exportar style="margin-left:auto"' }),
      columnas: [
        { clave: "folio", titulo: "Folio", formato: (v) => `<span class="mono">${v}</span>` },
        { clave: "cliente", titulo: "Cliente" },
        { clave: "fecha", titulo: "Fecha", formato: fechaCorta },
        { clave: "vendedor", titulo: "Vendedor" },
        { clave: "estado", titulo: "Estado", formato: (v) => insignia(v, { tono: ESTADO_COT[v] }) },
        { clave: "monto", titulo: "Monto", alinear: "der", formato: (v) => `<span class="num">${clp(v)}</span>` },
      ],
      filas: COTIZACIONES,
    });
    el.querySelector("[data-exportar]").addEventListener("click", () => toast("Exportando 24 cotizaciones a Excel…"));
  },

  async fechas(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Rango de fechas", `<div class="pila">${segmento(["7 días", "30 días", "Este trimestre", "Personalizado"], { activa: 3, etiqueta: "Periodo" })}<div data-rango></div><p class="chico" data-rango-texto>Elige el inicio y el fin.</p></div>`, { nota: "Atajos para lo común; el calendario solo para lo personalizado." }),
      marco("Formatos", `<dl class="detalle detalle--ancho"><dt>Fecha larga</dt><dd>${HOY.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</dd><dt>Fecha corta</dt><dd>${fechaCorta(HOY)}</dd><dt>En tablas</dt><dd class="mono">10-10-2026</dd><dt>Relativa</dt><dd>hace 4 minutos · ayer · el lunes</dd><dt>Hora</dt><dd>14:30 h (24 horas)</dd><dt>Rango</dt><dd>12 al 16 de octubre</dd></dl>`, { nota: "Día-mes-año, nunca mes/día. Lo reciente en relativo; lo antiguo en fecha." }),
    ])}`;
    const t = el.querySelector("[data-rango-texto]");
    calendario(el.querySelector("[data-rango]"), { rango: true, alElegir: ({ ini, fin }) => { t.textContent = fin ? `Del ${ini.toLocaleDateString("es-CL", { day: "numeric", month: "long" })} al ${fin.toLocaleDateString("es-CL", { day: "numeric", month: "long" })} · ${Math.round((fin - ini) / 864e5) + 1} días` : "Ahora elige el día final."; } });
  },

  async graficas(el) {
    cuerpo(el).innerHTML = `${rejilla([
      `<div class="mate marco" data-g1></div>`, `<div class="mate marco" data-g2></div>`, `<div class="mate marco" data-g3></div>`,
      marco("Reglas", `<ul class="lista-punto"><li><b>Una serie, un tono</b> (el acento de texto).</li><li><b>Categorías</b> en orden fijo de 4 colores validados para daltonismo; más de 4 → «Otros».</li><li><b>Un solo eje.</b> Nunca dos escalas.</li><li><b>Etiquetas directas</b> en el último punto, no en todos.</li><li><b>Siempre</b> tooltip y vista de tabla.</li></ul>`),
    ])}<div class="series-muestra">${[1, 2, 3, 4].map((n) => `<span><i style="background:var(--serie-${n})"></i>Serie ${n}</span>`).join("")}<span class="rotulo">· cambia con la paleta y el tema</span></div>`;
    linea(el.querySelector("[data-g1]"), { etiquetas: VENTAS.map((v) => v.mes), series: [{ nombre: "2026", valores: VENTAS.map((v) => v.actual), color: "--serie-1" }, { nombre: "2025", valores: VENTAS.map((v) => v.anterior), color: "--serie-2", tenue: true }] }, { titulo: "Ventas mensuales de Quillay", formato: clp, formatoEje: clpCorto });
    barras(el.querySelector("[data-g2]"), PROCESOS.slice().sort((a, b) => b.horas - a.horas).map((p) => ({ etiqueta: p.nombre, valor: p.horas })), { titulo: "Horas por semana, por proceso", formato: (v) => v + " h", unidad: "horas" });
    dona(el.querySelector("[data-g3]"), CANALES, { titulo: "De dónde llegan los pedidos", centro: CANALES[0][1] + " %", subcentro: "por WhatsApp" });
  },

  async numeros(el) {
    const v = [0.124, -0.031, 0, 0.452];
    cuerpo(el).innerHTML = `${rejilla([
      marco("Pesos chilenos", `<dl class="detalle detalle--ancho"><dt>Completo</dt><dd class="num">${clp(88_000_000)}</dd><dt>Abreviado</dt><dd class="num">${clpCorto(88_000_000)}</dd><dt>Miles de millones</dt><dd class="num">${clpCorto(1_250_000_000)}</dd><dt>Con decimales (UF)</dt><dd class="num">UF 1.234,56</dd><dt>Sin datos</dt><dd>—</dd></dl>`, { nota: "Punto para miles, coma para decimales. «MM» para millones." }),
      marco("Variaciones", `<div class="pila">${v.map((x) => `<div class="variacion-fila"><span class="chico">vs. mes anterior</span><span class="variacion ${x > 0 ? "variacion--sube" : x < 0 ? "variacion--baja" : ""}">${x > 0 ? "▲" : x < 0 ? "▼" : "="} ${Math.abs(x * 100).toLocaleString("es-CL", { maximumFractionDigits: 1 })} %</span></div>`).join("")}</div>`, { nota: "Siempre flecha + número: el color nunca va solo. Sube no siempre es bueno (costos): el color lo decide el significado." }),
      marco("Alineación", `<table class="tabla-num"><tbody>${COTIZACIONES.slice(0, 5).map((c) => `<tr><td>${c.cliente}</td><td class="num">${clp(c.monto)}</td></tr>`).join("")}<tr class="total"><td>Total</td><td class="num">${clp(COTIZACIONES.slice(0, 5).reduce((s, c) => s + c.monto, 0))}</td></tr></tbody></table>`, { nota: "Tabulares y a la derecha: las cifras se comparan de un vistazo." }),
      marco("Número héroe", heroe({ rotulo: "Horas recuperables por semana", valor: KPIS.horasPerdidas + " h", nota: "Si se resuelven los 6 procesos del diagnóstico." }), { nota: "Un solo dato importante: sin gráfica, en grande." }),
    ])}`;
  },

  async vacios(el) {
    const vacio = (ic, t, d, acc, tono = "") => `<div class="vacio">${`<span class="vacio__ico" ${tono}>${icono(ic, { tam: 26 })}</span>`}<b class="titulo-3">${t}</b><p class="chico">${d}</p>${acc}</div>`;
    cuerpo(el).innerHTML = rejilla([
      marco("Primer uso", vacio("sparkle", "Empecemos por tu primer proceso", "Documenta cómo se hace hoy algo que se repite cada semana. Lo demás lo ordenamos juntos.", boton("Documentar un proceso", { ico: "plus" }))),
      marco("Búsqueda sin resultados", vacio("magnifying-glass", "Nada con «rodamientos SKF»", "Prueba con menos palabras o busca por cliente.", boton("Limpiar búsqueda", { variante: "secundario" }))),
      marco("Sin permiso", vacio("lock-simple", "Esta sección es de administración", "Pídele acceso a Camila Rojas, administradora de Quillay.", boton("Pedir acceso", { variante: "secundario" }))),
      marco("Error del servidor", vacio("cloud-x", "Algo falló de nuestro lado", "Ya nos llegó el aviso. Tus datos están a salvo; intenta en un minuto.", boton("Reintentar", { variante: "secundario", ico: "arrow-clockwise" }), 'style="background:var(--error-suave);color:var(--error)"')),
    ]);
  },

  async busqueda(el) {
    cuerpo(el).innerHTML = `<div class="mate busqueda-demo"><label class="buscador__campo">${icono("magnifying-glass", { tam: 20 })}<input type="search" value="despacho" placeholder="Buscar en la memoria de Quillay" aria-label="Buscar"></label>
        <div class="buscador__resultados" aria-live="polite">${resultadosHTML("despacho")}</div></div>
      <div class="nav-pie">${ejemplo()}<p class="chico">La búsqueda ignora tildes y mayúsculas, muestra de dónde viene cada dato (correo, WhatsApp, planilla, reunión) y resalta lo que coincide.</p></div>`;
    const i = el.querySelector("input"), r = el.querySelector(".buscador__resultados");
    i.addEventListener("input", () => { r.innerHTML = resultadosHTML(i.value); rellenarIconos(); });
  },
};
