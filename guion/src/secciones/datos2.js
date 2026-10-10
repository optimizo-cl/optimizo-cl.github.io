/* Capítulo 4 · Datos v2 (ola 6): gráficas con trama que se dibujan, tablas que se ordenan deslizándose y se editan
   en línea, fechas sobre una pista de puntos, búsqueda en órbitas de relevancia y vacíos hechos con el disco. */
import { pieza, activarPiezas, codigo } from "../kit/presentar.js";
import { boton, segmento } from "../kit/controles.js";
import { toast, estado } from "../kit/avisos.js";
import { icono, rellenarIconos } from "../kit/iconos.js";
import { isotipo, DISCO } from "../kit/marca.js";
import { ejemplo } from "../kit/guion.js";
import { contar } from "../kit/coreografia.js";
import { tabla } from "../patrones/tabla.js";
import { barrasTrama, lineaViva, antesDespuesBarras, apiladaTextura } from "../patrones/graficas2.js";
import { abrirBuscador, activarAtajoBuscador } from "../patrones/buscador.js";
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

  /* ── Vacíos y errores: cada estado es una «pose» del isotipo; la acción la resuelve con un gesto del punto ── */
  async vacios(el) {
    const NIDO = { x: 25.863, y: 22.754 };
    const POSES = [
      { k: "uso", t: "Empecemos por tu primer proceso", d: "Falta el punto: documenta algo que se repite cada semana y el disco se completa.", acc: "Documentar un proceso", ico: "plus", desde: [150, 92], fin: ["Listo: tu primer proceso", "El disco está completo. Ahora documenta el siguiente."] },
      { k: "busqueda", t: "Nada con «rodamientos SKF»", d: "El punto anda buscando. Prueba con menos palabras o por cliente.", acc: "Probar con «rodamientos»", ico: "magnifying-glass", desde: [-14, -18], fin: ["3 resultados con «rodamientos»", "Acuerdo de precios con Minera Los Bronces Sur, y 2 más."] },
      { k: "permiso", t: "Esta sección es de administración", d: "La mordida está cerrada: pídele acceso a Camila Rojas, administradora de Quillay.", acc: "Pedir acceso", ico: "lock-simple", desde: [-34, -46], fin: ["Acceso concedido", "Camila te dio acceso. Ya puedes entrar."] },
      { k: "conexion", t: "Sin conexión", d: "Lo que escribas se guarda en este equipo y se envía al volver.", acc: "Reintentar", ico: "arrow-clockwise", desde: [-78, -40], fin: ["Conectado de nuevo", "Se enviaron los 2 cambios que quedaron pendientes."] },
      { k: "servidor", t: "Algo falló de nuestro lado", d: "El punto se cayó. Ya nos llegó el aviso y tus datos están a salvo.", acc: "Reintentar", ico: "arrow-clockwise", desde: [28, 150], fin: ["Todo en su lugar", "Volvió a funcionar. Gracias por la paciencia."] },
    ];
    const pose = (p) => `<article class="pose pose--${p.k}" data-pose="${p.k}">
      <svg class="pose__svg" viewBox="-60 -60 260 260" aria-hidden="true"><g transform="translate(-6.054688 -2.601562)">
        ${p.k === "servidor" ? `<line x1="-20" y1="${NIDO.y + 168}" x2="170" y2="${NIDO.y + 168}" class="pose__piso"/><ellipse cx="${NIDO.x + 28}" cy="${NIDO.y + 167}" rx="20" ry="4" class="pose__sombra"/>` : ""}
        <path class="pose__disco" fill-rule="evenodd" d="${DISCO}"/>
        ${p.k === "permiso" ? `<path class="pose__cerrado" fill-rule="evenodd" d="M 6.054688 71.753906 A 69.152 69.152 0 1 1 144.359 71.753906 A 69.152 69.152 0 1 1 6.054688 71.753906 Z M 57.917969 71.753906 A 17.288 17.288 0 1 0 92.492 71.753906 A 17.288 17.288 0 1 0 57.917969 71.753906 Z"/>` : ""}
        <circle class="pose__nido" cx="${NIDO.x}" cy="${NIDO.y}" r="16.3"/>
        ${p.k === "conexion" ? `<line class="pose__cuerda" x1="${NIDO.x}" y1="${NIDO.y}" x2="${NIDO.x + p.desde[0]}" y2="${NIDO.y + p.desde[1]}"/>` : ""}
        <g class="pose__flota"><circle class="pose__punto" cx="${NIDO.x}" cy="${NIDO.y}" r="17.289" style="transform:translate(${p.desde[0]}px, ${p.desde[1]}px)"/></g>
      </g></svg>
      <div class="pose__texto"><b class="titulo-3" data-t>${p.t}</b><p class="chico" data-d>${p.d}</p>
        ${boton(p.acc, { variante: p.k === "uso" ? "primario" : "secundario", tam: "s", ico: p.ico, attrs: `data-resolver="${p.k}"` })}</div></article>`;
    const vivo = `<div class="poses">${POSES.map(pose).join("")}</div>`;
    const uso = usoDe(["Cada vacío o error es una pose del isotipo: el punto fuera de su nido dice «falta algo» sin dramatismo.", "La acción principal resuelve la pose: el punto vuelve a su lugar. El usuario ve que lo que hizo funcionó.", "Siempre se dice qué pasó, qué hacer y que los datos están a salvo.", "Con «reducir movimiento», el punto aparece directo en su lugar."]);
    cuerpo(el).innerHTML = pieza({ vivo, uso });
    activarPiezas(el); await rellenarIconos();
    const red = () => movimientoReducido();
    el.querySelectorAll("[data-pose]").forEach((art) => {
      const p = POSES.find((x) => x.k === art.dataset.pose), punto = art.querySelector(".pose__punto"), btn = art.querySelector("[data-resolver]");
      const t = art.querySelector("[data-t]"), d = art.querySelector("[data-d]"), etiqueta = btn.querySelector(".boton__texto");
      const volar = (de, a, alto) => red() ? Promise.resolve() : punto.animate([
        { transform: `translate(${de[0]}px, ${de[1]}px)` },
        { transform: `translate(${(de[0] + a[0]) / 2}px, ${Math.min(de[1], a[1]) - alto}px) scale(.92)`, offset: 0.5 },
        { transform: `translate(${a[0]}px, ${a[1]}px) scale(1.08, .9)`, offset: 0.86 },
        { transform: `translate(${a[0]}px, ${a[1]}px)` }], { duration: 1100, easing: "cubic-bezier(.45,.05,.55,.95)", fill: "forwards" }).finished;
      let resuelto = false;
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        if (!resuelto) {
          art.classList.add("resolviendo");
          if (p.k === "permiso") await new Promise((r) => setTimeout(r, red() ? 0 : 500)); // primero se abre la mordida
          if (p.k === "conexion") art.querySelector(".pose__cuerda").classList.add("tensa");
          await volar(p.desde, [0, 0], p.k === "servidor" ? 120 : p.k === "conexion" ? 10 : 40);
          punto.style.transform = "none";
          art.classList.remove("resolviendo"); art.classList.add("resuelta");
          t.textContent = p.fin[0]; d.textContent = p.fin[1]; etiqueta.textContent = "Ver de nuevo";
        } else {
          art.classList.remove("resuelta");
          if (p.k === "conexion") art.querySelector(".pose__cuerda").classList.remove("tensa");
          await volar([0, 0], p.desde, 30);
          punto.style.transform = `translate(${p.desde[0]}px, ${p.desde[1]}px)`;
          t.textContent = p.t; d.textContent = p.d; etiqueta.textContent = p.acc;
        }
        punto.getAnimations().forEach((x) => x.cancel());
        resuelto = !resuelto; btn.disabled = false;
      });
    });
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
