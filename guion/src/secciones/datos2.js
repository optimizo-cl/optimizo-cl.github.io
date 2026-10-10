/* Capítulo 4 · Datos v2 (ola 6): gráficas con trama que se dibujan, tablas que se ordenan deslizándose y se editan
   en línea, fechas sobre una pista de puntos, búsqueda en órbitas de relevancia y vacíos hechos con el disco. */
import { pieza, activarPiezas, codigo } from "../kit/presentar.js";
import { boton, segmento } from "../kit/controles.js";
import { toast, estado } from "../kit/avisos.js";
import { icono, rellenarIconos } from "../kit/iconos.js";
import { isotipo } from "../kit/marca.js";
import { ejemplo } from "../kit/guion.js";
import { contar } from "../kit/coreografia.js";
import { tabla } from "../patrones/tabla.js";
import { barrasTrama, lineaViva, antesDespuesBarras, apiladaTextura } from "../patrones/graficas2.js";
import { buscarMemoria, resultadosHTML, resaltar, abrirBuscador, activarAtajoBuscador } from "../patrones/buscador.js";
import { COTIZACIONES, VENTAS, PROCESOS, CANALES, NOTAS, clp, clpCorto, fechaCorta } from "../demo/quillay.js";
import { movimientoReducido } from "../kit/escenas/vigia.js";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const usoDe = (lista, cod) => `<div class="rejilla-2"><ul class="lista-punto">${lista.map((r) => `<li>${r}</li>`).join("")}</ul>${cod ? codigo(cod) : ""}</div>`;
const ESTADO_FORMA = { Ganada: ["lleno", "exito"], Enviada: ["medio", "info"], "En negociación": ["medio", "acento"], Perdida: ["vacio", "error"], Borrador: ["vacio", "neutro"] };
const isoSin = (clase) => isotipo({ clase: `m-iso m-iso--sin-punto ${clase}`, titulo: "" }).replace('role="img" aria-label=""', 'aria-hidden="true"');

export const datos2 = {
  async graficas(el) {
    const vivo = `<div class="graficas2">
      <div class="graficas2__fila"><div data-g1 class="graficas2__ancha"></div></div>
      <div class="graficas2__fila graficas2__fila--2"><div data-g2></div><div data-g3></div></div>
      <div class="graficas2__fila"><div data-g4></div></div>
      <div class="graficas2__pie">${ejemplo()}<span class="chico">Pasa el mouse por la línea: la lupa lee cada mes. Mueve el control de «antes y después».</span></div></div>`;
    const uso = usoDe(["<b>Un solo eje</b>, nunca dos escalas.", "Una serie, un tono; categorías en orden fijo de 4 colores validados y, además, <b>con textura</b> (sirve sin color e impreso).", "Las gráficas cuentan una historia: una o dos anotaciones, no más.", "Todo dato demo se marca; siempre hay «Ver tabla»."], 'lineaViva(el, { etiquetas, series }, { titulo, anotaciones: [{ i: 6, texto: "Acá empezó el CRM" }] });\nbarrasTrama(el, items, { titulo, formato: (v) => v + " h" });');
    cuerpo(el).innerHTML = pieza({ vivo, uso });
    activarPiezas(el);
    lineaViva(el.querySelector("[data-g1]"), { etiquetas: VENTAS.map((v) => v.mes), series: [{ nombre: "2026", valores: VENTAS.map((v) => v.actual), color: "--serie-1" }, { nombre: "2025", valores: VENTAS.map((v) => v.anterior), color: "--serie-2" }] },
      { titulo: "Ventas mensuales de Quillay", formato: clpCorto, formatoEje: (v) => clpCorto(v).replace("$ ", ""), anotaciones: [{ i: 6, texto: "Acá empezó el CRM" }] });
    barrasTrama(el.querySelector("[data-g2]"), PROCESOS.slice().sort((a, b) => b.horas - a.horas).map((p) => ({ etiqueta: p.nombre, valor: p.horas })), { titulo: "Horas por semana, por proceso", formato: (v) => v + " h", unidad: "horas", destacar: 1 });
    apiladaTextura(el.querySelector("[data-g3]"), CANALES, { titulo: "De dónde llegan los pedidos" });
    antesDespuesBarras(el.querySelector("[data-g4]"), PROCESOS.slice(0, 5).map((p, i) => ({ etiqueta: p.nombre, antes: p.horas, despues: Math.max(1, Math.round(p.horas * [0.25, 0.4, 0.3, 0.5, 0.35][i])) })), { titulo: "Horas por semana: antes y después de ordenar", formato: (v) => v + " h" });
  },

  async tablas(el) {
    const vivo = `<div class="tabla2 papel" data-tabla></div><p class="chico tabla2__nota">${ejemplo()} Ordena por una columna: las filas se deslizan a su lugar. Doble clic (o Enter) en <b>Vendedor</b> o <b>Monto</b> para editar.</p>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Números a la derecha y en tabulares; el estado por forma, con palabra.", "Al ordenar, las filas se mueven (no saltan): se entiende qué cambió.", "Editar en línea solo lo que se corrige seguido; con validación y Esc para deshacer.", "En angosto cada fila es una tarjeta."], 'tabla(el, { columnas: [{ clave: "monto", titulo: "Monto", alinear: "der", editable: { validar, leer } }], filas });') });
    activarPiezas(el);
    const filas = COTIZACIONES.map((c) => ({ ...c }));
    tabla(el.querySelector("[data-tabla]"), {
      buscarEn: ["folio", "cliente", "estado", "vendedor"], filas,
      acciones: boton("Exportar", { variante: "secundario", tam: "s", ico: "download-simple", attrs: 'data-exportar style="margin-left:auto"' }),
      columnas: [
        { clave: "folio", titulo: "Folio", formato: (v) => `<span class="mono">${v}</span>` },
        { clave: "cliente", titulo: "Cliente" },
        { clave: "fecha", titulo: "Fecha", formato: fechaCorta },
        { clave: "vendedor", titulo: "Vendedor", editable: { validar: (v) => (v.trim().length < 3 ? "Escribe el nombre completo." : "") } },
        { clave: "estado", titulo: "Estado", formato: (v) => estado(v, { forma: ESTADO_FORMA[v]?.[0] || "vacio", tono: ESTADO_FORMA[v]?.[1] || "neutro" }) },
        { clave: "monto", titulo: "Monto", alinear: "der", formato: (v) => `<span class="num">${clp(v)}</span>`, editable: { validar: (v) => (/^\$?\s*[\d.]+$/.test(v.trim()) && +v.replace(/\D/g, "") > 0 ? "" : "Solo números, ej. 1.250.000."), leer: (v) => +v.replace(/\D/g, "") } },
      ],
    });
    el.querySelector("[data-exportar]").addEventListener("click", () => toast("Exportando 24 cotizaciones a Excel…"));
  },

  async fechas(el) {
    const dias = 31, hoy = 12;
    const vivo = `<div class="pista-fechas papel" data-pista-f>
      <div class="pista-fechas__cabeza"><b>Octubre 2026</b>${segmento(["7 días", "30 días", "Este mes", "Elegir"], { activa: 3, etiqueta: "Periodo", nombre: "periodo-f" })}</div>
      <div class="pista-fechas__pista" role="group" aria-label="Días de octubre: elige el inicio y el fin"><i class="pista-fechas__tramo" aria-hidden="true"></i>
        ${Array.from({ length: dias }, (_, i) => { const d = new Date(2026, 9, i + 1), fin = d.getDay() === 0 || d.getDay() === 6; return `<button type="button" class="pista-fechas__dia ${fin ? "finde" : ""} ${i + 1 === hoy ? "hoy" : ""}" data-d="${i + 1}" aria-label="${d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}" aria-pressed="false"><i></i><span>${i + 1}</span></button>`; }).join("")}</div>
      <p class="pista-fechas__texto" aria-live="polite" data-rango-t>Elige el día de inicio.</p></div>
      <dl class="detalle detalle--ancho fechas-formatos"><dt>Fecha larga</dt><dd>lunes, 12 de octubre de 2026</dd><dt>Fecha corta</dt><dd>12 oct</dd><dt>En tablas</dt><dd class="mono">12-10-2026</dd><dt>Relativa</dt><dd>hace 4 minutos · ayer · el lunes</dd><dt>Hora</dt><dd>14:30 h (24 horas)</dd><dt>Rango</dt><dd>12 al 16 de octubre</dd></dl>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Día-mes-año, nunca mes/día.", "Atajos para lo común; la pista solo para lo personalizado.", "Lo reciente en relativo; lo antiguo en fecha.", "El rango se ve como un tramo encendido sobre la pista de puntos."]) });
    activarPiezas(el);
    const raiz = el.querySelector("[data-pista-f]"), botones = [...raiz.querySelectorAll(".pista-fechas__dia")], tramo = raiz.querySelector(".pista-fechas__tramo"), texto = raiz.querySelector("[data-rango-t]");
    let ini = null, fin = null;
    const pintar = () => {
      botones.forEach((b) => { const d = +b.dataset.d, en = ini && fin && d >= ini && d <= fin; b.classList.toggle("en-rango", !!en); b.classList.toggle("extremo", d === ini || d === fin); b.setAttribute("aria-pressed", d === ini || d === fin || !!en); });
      if (ini && fin) {
        const a = botones[ini - 1], z = botones[fin - 1], p = a.parentElement.getBoundingClientRect(), ra = a.getBoundingClientRect(), rz = z.getBoundingClientRect();
        const mismaFila = Math.abs(ra.top - rz.top) < 4;
        tramo.style.opacity = mismaFila ? 1 : 0;
        if (mismaFila) Object.assign(tramo.style, { left: ra.left - p.left + ra.width / 2 + "px", width: rz.left - ra.left + "px", top: ra.top - p.top + 14 + "px" });
        texto.textContent = `Del ${ini} al ${fin} de octubre · ${fin - ini + 1} días`;
      } else { tramo.style.opacity = 0; texto.textContent = ini ? `Desde el ${ini} de octubre. Ahora elige el día final.` : "Elige el día de inicio."; }
    };
    botones.forEach((b, i) => {
      b.addEventListener("click", () => { const d = +b.dataset.d; if (!ini || fin) { ini = d; fin = null; } else if (d < ini) { fin = ini; ini = d; } else fin = d; pintar(); });
      b.addEventListener("keydown", (e) => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return; e.preventDefault(); botones[Math.max(0, Math.min(botones.length - 1, i + k))].focus(); });
    });
    raiz.querySelector('[data-segmento="periodo-f"]').addEventListener("cambio", (e) => { const m = { "7 días": [6, 12], "30 días": [1, 30], "Este mes": [1, 31] }[e.detail]; if (m) { [ini, fin] = m; pintar(); } else { ini = fin = null; pintar(); } });
    addEventListener("resize", pintar);
  },

  async busqueda(el) {
    const vivo = `<div class="busqueda2" data-busqueda>
      <div class="busqueda2__barra"><label class="buscador__campo">${icono("magnifying-glass", { tam: 20 })}<input type="search" value="despacho" placeholder="Buscar en la memoria de Quillay" aria-label="Buscar en la memoria" data-q></label>${segmento(["Órbitas", "Lista"], { etiqueta: "Vista de resultados", nombre: "vista-b" })}</div>
      <div class="busqueda2__orbitas" data-orbitas><svg viewBox="0 0 640 360" role="group" aria-label="Resultados por relevancia: más cerca del centro, más relevante" data-svg></svg><div class="orb-ficha papel" data-ficha hidden><b></b><span class="chico"></span><span class="rotulo"></span></div></div>
      <div class="busqueda2__lista buscador__resultados" data-lista hidden aria-live="polite"></div>
      <div class="nav-pie">${ejemplo()}<p class="chico">Más cerca del centro = más relevante. Ignora tildes y mayúsculas y dice de dónde viene cada dato.</p></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Las órbitas muestran relevancia de un vistazo; la lista sigue a un clic (y es la vista con teclado más rápida).", "Cada resultado dice de dónde viene: correo, WhatsApp, planilla, reunión.", "Sin resultados: el disco sin su punto y una sugerencia concreta."]) });
    activarPiezas(el); await rellenarIconos();
    const raiz = el.querySelector("[data-busqueda]"), svg = raiz.querySelector("[data-svg]"), q = raiz.querySelector("[data-q]"), ficha = raiz.querySelector("[data-ficha]"), lista = raiz.querySelector("[data-lista]"), caja = raiz.querySelector("[data-orbitas]");
    const NS = "http://www.w3.org/2000/svg", C = { x: 320, y: 180 };
    const sinT = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const pintar = () => {
      const texto = q.value.trim(), { notas, procesos } = buscarMemoria(texto);
      lista.innerHTML = resultadosHTML(texto); rellenarIconos();
      const res = [...notas.map((x) => ({ nombre: x.titulo, detalle: x.texto, fuente: `${x.fuente} · ${x.fecha}`, puntaje: (sinT(x.titulo).includes(sinT(texto)) ? 1 : 0.55) })), ...procesos.map((x) => ({ nombre: x.nombre, detalle: `${x.area} · ${x.horas} h por semana`, fuente: "Proceso", puntaje: 0.8 }))];
      svg.innerHTML = `${[70, 120, 165].map((r) => `<ellipse cx="${C.x}" cy="${C.y}" rx="${r * 1.55}" ry="${r}" class="orb-orbita"/>`).join("")}<g class="busqueda2__centro" transform="translate(${C.x} ${C.y})"><circle r="30" class="orb-nodo__disco"/><circle r="9" class="orb-nodo__hueco"/><text y="52" text-anchor="middle" class="orb-nodo__nombre">«${texto || "…"}»</text></g>`;
      if (!texto || !res.length) { svg.insertAdjacentHTML("beforeend", `<text x="${C.x}" y="${C.y + 100}" text-anchor="middle" class="busqueda2__nada">${texto ? `Nada con «${texto}». Prueba con «precios» o «cotizar».` : "Escribe para buscar."}</text>`); return; }
      res.sort((a, b) => b.puntaje - a.puntaje).forEach((r, i) => {
        const radio = r.puntaje >= 0.95 ? 70 : r.puntaje >= 0.7 ? 120 : 165, a = -Math.PI / 2 + i * 2.4, x = C.x + Math.cos(a) * radio * 1.55, y = C.y + Math.sin(a) * radio;
        const g = document.createElementNS(NS, "g"); g.setAttribute("class", "orb-nodo busqueda2__res"); g.setAttribute("transform", `translate(${x} ${y})`); g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", `${r.nombre}. ${r.fuente}`); g.style.setProperty("--i", i);
        g.innerHTML = `<line x1="0" y1="0" x2="${C.x - x}" y2="${C.y - y}" class="orb-arco busqueda2__liga"/><circle r="${8 + r.puntaje * 8}" class="orb-nodo__disco"/><circle r="${3 + r.puntaje * 2}" class="orb-nodo__hueco"/><text y="${26 + r.puntaje * 6}" text-anchor="middle" class="orb-nodo__nombre busqueda2__nombre">${r.nombre.length > 26 ? r.nombre.slice(0, 25) + "…" : r.nombre}</text>`;
        const ver = () => { ficha.querySelector("b").innerHTML = resaltar(r.nombre, texto); ficha.querySelector(".chico").innerHTML = resaltar(r.detalle, texto); ficha.querySelector(".rotulo").textContent = r.fuente; ficha.hidden = false; const b = caja.getBoundingClientRect(), gb = g.getBoundingClientRect(); ficha.style.left = Math.max(8, Math.min(b.width - ficha.offsetWidth - 8, gb.left - b.left + gb.width / 2 - ficha.offsetWidth / 2)) + "px"; ficha.style.top = Math.max(8, gb.top - b.top - ficha.offsetHeight - 10) + "px"; };
        g.addEventListener("pointerenter", ver); g.addEventListener("focus", ver); g.addEventListener("pointerleave", () => (ficha.hidden = true)); g.addEventListener("blur", () => (ficha.hidden = true));
        svg.appendChild(g);
      });
    };
    q.addEventListener("input", pintar); pintar();
    raiz.querySelector('[data-segmento="vista-b"]').addEventListener("cambio", (e) => { const orb = e.detail === "Órbitas"; caja.hidden = !orb; lista.hidden = orb; });
  },

  async vacios(el) {
    const caso = (clase, fig, t, d, acc) => `<div class="vacio2 ${clase}"><div class="vacio2__fig">${fig}</div><b class="titulo-3">${t}</b><p class="chico">${d}</p>${acc}</div>`;
    const vivo = `<div class="vacios2">
      ${caso("vacio2--primero", `${isoSin("vacio2__iso")}`, "Empecemos por tu primer proceso", "Falta el punto: documenta algo que se repite cada semana y el disco se completa.", boton("Documentar un proceso", { ico: "plus", tam: "s" }))}
      ${caso("vacio2--busqueda", `${isoSin("vacio2__iso")}<i class="vacio2__perdido"></i>`, "Nada con «rodamientos SKF»", "El punto anda buscando. Prueba con menos palabras o por cliente.", boton("Limpiar búsqueda", { variante: "secundario", tam: "s" }))}
      ${caso("vacio2--permiso", `${isoSin("vacio2__iso")}<span class="vacio2__candado">${icono("lock-simple", { tam: 18 })}</span>`, "Esta sección es de administración", "Pídele acceso a Camila Rojas, administradora de Quillay.", boton("Pedir acceso", { variante: "secundario", tam: "s" }))}
      ${caso("vacio2--error", `${isoSin("vacio2__iso")}<svg class="vacio2__rebote" viewBox="0 0 120 120" aria-hidden="true"><path d="M30 34 Q 6 10 -14 30" /><circle cx="-14" cy="30" r="6"/></svg>`, "Algo falló de nuestro lado", "Ya nos llegó el aviso. Tus datos están a salvo; intenta en un minuto.", boton("Reintentar", { variante: "secundario", tam: "s", ico: "arrow-clockwise" }))}
    </div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["El vacío es el disco sin su punto: «falta algo», sin drama.", "Cada vacío dice qué va acá y ofrece el siguiente paso.", "Los errores no culpan y dicen qué hacer."]) });
    activarPiezas(el); await rellenarIconos();
  },
  /* ── Cimientos de app: la base (retícula, barra lateral, migas, ⌘K), sin pantallas inventadas ── */
  async cimientos(el) {
    activarAtajoBuscador();
    const pieza1 = (n, t, d, html) => `<figure class="cimiento"><div class="cimiento__escena">${html}</div><figcaption><span class="cimiento__n">${n}</span><b>${t}</b><span class="chico">${d}</span></figcaption></figure>`;
    const lateral = `<div class="cim-lateral"><div class="cim-lateral__marca">${isotipo({ clase: "cim-lateral__iso" })}<b>Quillay</b></div>
      ${[["house", "Inicio"], ["tree-structure", "Procesos"], ["users-three", "Clientes"], ["chart-line-up", "Reportes"]].map(([i, t], k) => `<a href="#cimientos" class="cim-nav ${k === 1 ? "activo" : ""}" ${k === 1 ? 'aria-current="page"' : ""}>${icono(i, { tam: 18 })}<span>${t}</span></a>`).join("")}</div>`;
    const reticula = `<div class="cim-reticula" aria-hidden="true"><div class="cim-reticula__lat"></div><div class="cim-reticula__cols">${"<i></i>".repeat(12)}</div><span class="cim-reticula__cota cim-reticula__cota--l">240</span><span class="cim-reticula__cota cim-reticula__cota--c">12 columnas · 24 de separación</span></div>`;
    const migas = `<nav class="migas cim-migas" aria-label="Migas (ejemplo)"><a href="#cimientos">Quillay</a><span aria-hidden="true">/</span><a href="#cimientos">Procesos</a><span aria-hidden="true">/</span><b aria-current="page">Cotizaciones</b></nav>`;
    const buscar = `<button type="button" class="cim-buscar ceramica" data-buscar>${icono("magnifying-glass", { tam: 18 })}<span>Buscar en Quillay</span><kbd>Ctrl K</kbd></button>`;
    const vivo = `<div class="cimientos">
      ${pieza1("01", "Retícula", "Barra lateral fija de 240 px y 12 columnas en el contenido. Todo se alinea a ellas.", reticula)}
      ${pieza1("02", "Barra lateral", "Cuatro a siete destinos. El activo lleva el punto, no un bloque de color.", lateral)}
      ${pieza1("03", "Migas", "Dónde estoy y cómo volver. La última no es enlace.", migas)}
      ${pieza1("04", "⌘K", "Buscar y saltar desde cualquier pantalla. Prueba Ctrl + K.", buscar)}
    </div><p class="chico cimientos__nota">Esto es la base: lo que toda app de Optimizo comparte. Las pantallas reales las diseña cada producto.</p>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["La app real reemplaza las maquetas: aquí solo vive lo que se comparte.", "El activo se marca con el punto del isotipo.", "⌘K (Ctrl K en Windows) abre la búsqueda desde cualquier parte."]) });
    activarPiezas(el); await rellenarIconos();
    el.querySelector("[data-buscar]").addEventListener("click", abrirBuscador);
    el.querySelectorAll(".cim-nav").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); el.querySelectorAll(".cim-nav").forEach((x) => { x.classList.toggle("activo", x === a); x.toggleAttribute("aria-current", x === a); }); }));
  },
};

/* Números: se reusa la versión 1 y se agrega el contador con el punto. */
export function numeros2(v1) {
  return async (el) => {
    await v1(el);
    const c = el.querySelector(".seccion__cuerpo");
    c.insertAdjacentHTML("afterbegin", `<div class="numeros2"><div class="numeros2__dato"><span class="rotulo">Horas recuperables por semana</span><b data-n1>0</b><i class="numeros2__tic" aria-hidden="true"></i></div><div class="numeros2__dato"><span class="rotulo">Cotizaciones respondidas el mismo día</span><b data-n2>0</b></div><div class="numeros2__dato"><span class="rotulo">Ventas del año</span><b data-n3>$ 0</b></div></div>`);
    const tic = c.querySelector(".numeros2__tic");
    contar(c.querySelector("[data-n1]"), 31, { duracion: 1800, formato: (v) => { const r = Math.round(v); if (tic && r !== +tic.dataset.u && !movimientoReducido()) { tic.dataset.u = r; tic.animate([{ transform: "scale(1.7)" }, { transform: "scale(1)" }], { duration: 200 }); } return r + " h"; } });
    contar(c.querySelector("[data-n2]"), 0.86, { duracion: 1800, formato: (v) => Math.round(v * 100) + " %" });
    contar(c.querySelector("[data-n3]"), 732_000_000, { duracion: 2000, formato: (v) => clpCorto(v) });
  };
}
