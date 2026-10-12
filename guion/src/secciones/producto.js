/* Capítulo 5 · Producto Optimizo (fase 10): las piezas que solo Optimizo tiene. Datos de Quillay. */
import { ESCALERA } from "../kit/escalera.js?v=e33c371";
import { marco, rejilla, ficha, ejemplo } from "../kit/guion.js?v=e33c371";
import { boton } from "../kit/controles.js?v=e33c371";
import { insignia, toast } from "../kit/avisos.js?v=e33c371";
import { icono, rellenarIconos } from "../kit/iconos.js?v=e33c371";
import { isotipo, logo } from "../kit/marca.js?v=e33c371";
import { progreso } from "../kit/punto.js?v=e33c371";
import { flujos } from "../kit/escenas/flujos.js?v=e33c371";
import { heroe } from "../patrones/graficas.js?v=e33c371";
import { EMPRESA, PROCESOS, ESTADOS, PERSONAS, HORAS_PERDIDAS, clp } from "../demo/quillay.js?v=e33c371";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const persona = (id) => PERSONAS.find((p) => p.id === id)?.nombre || "Sin responsable";
let flujoVivo = null;

export const PASOS_MADUREZ = ESCALERA.map((p) => [p.etapa, p.etapaD, p.icoEtapa]); // la misma escalera de kit/escalera.js
/** Escalera de madurez: UNA pieza para el guion y el sitio. hoy = escalón actual (lleva el punto); el siguiente se marca. */
export function escaleraHTML(pasos, { hoy = 0, etiqueta = "La empresa está acá" } = {}) {
  return `<div class="escalera mate" style="--n:${pasos.length}">${pasos.map(([t, d, ic], i) => `
    <button type="button" class="escalon ${i === hoy ? "escalon--hoy" : ""} ${i === hoy + 1 ? "escalon--sigue" : ""}" style="--i:${i}" aria-pressed="${i === hoy}">
      <span class="escalon__n">${i + 1}</span>${icono(ic, { tam: 24 })}<b>${t}</b><span class="chico">${d}</span>
      ${i === hoy ? `<span class="escalon__punto" aria-label="${etiqueta}"></span>` : ""}${i === hoy + 1 ? '<span class="insignia insignia--acento"><i></i>Siguiente paso</span>' : ""}</button>`).join("")}</div>`;
}

/** Sello «de Optimizo»: isotipo mínimo + texto. Va bajo la marca del producto, nunca al lado ni más grande. */
export const sello = ({ claro = false } = {}) => `<span class="sello ${claro ? "sello--claro" : ""}">${isotipo({ clase: "sello__iso" })}<span>de Optimizo</span></span>`;

export const producto = {
  async "mapa-procesos"(el) {
    const areas = [...new Set(PROCESOS.map((p) => p.area))];
    cuerpo(el).innerHTML = `<div class="mapa mate" data-estado="caos">
        <div class="mapa__columnas">${areas.map((a) => `<span class="rotulo">${a}</span>`).join("")}</div>
        ${PROCESOS.map((p, i) => `<article class="mapa__tarjeta" data-i="${i}" data-area="${areas.indexOf(p.area)}">
          <b>${p.nombre}</b><span class="rotulo">${p.horas} h por semana · ${p.sistemas.join(", ")}</span>${insignia(ESTADOS[p.estado][0], { tono: ESTADOS[p.estado][1] })}</article>`).join("")}
      </div>
      <div class="nav-pie">${boton("Ordenar los procesos", { attrs: "data-ordenar", icoFin: "arrow-right" })}${ejemplo()}<p class="chico">Así se ve Quillay antes y después del diagnóstico: lo que estaba suelto queda en su lugar, con dueño y horas medidas.</p></div>`;
    const mapa = el.querySelector(".mapa"), b = el.querySelector("[data-ordenar]");
    const posicionar = () => {
      const W = mapa.clientWidth, cols = areas.length, ordenado = mapa.dataset.estado === "orden", angosto = W < 640;
      const conteo = {};
      mapa.querySelectorAll(".mapa__tarjeta").forEach((t, i) => {
        const a = +t.dataset.area, k = (conteo[a] = (conteo[a] ?? -1) + 1);
        let x, y, r;
        if (ordenado) {
          if (angosto) { x = 16; y = 16 + i * 100; r = 0; t.style.width = W - 32 + "px"; }
          else { const cw = (W - 32) / cols; x = 16 + a * cw + 6; y = 56 + k * 116; r = 0; t.style.width = cw - 12 + "px"; }
        } else {
          // desorden estable (no aleatorio en cada pintada)
          x = ((i * 173) % Math.max(1, W - 260)) + 12; y = 40 + ((i * 97) % 260); r = ((i * 37) % 13) - 6; t.style.width = "240px";
        }
        t.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
      });
      mapa.style.height = (ordenado ? (angosto ? 32 + PROCESOS.length * 100 : 56 + 2 * 116 + 24) : 420) + "px";
    };
    b.addEventListener("click", () => {
      mapa.dataset.estado = mapa.dataset.estado === "orden" ? "caos" : "orden";
      b.querySelector(".boton__texto").textContent = mapa.dataset.estado === "orden" ? "Ver cómo estaba" : "Ordenar los procesos";
      posicionar();
    });
    new ResizeObserver(posicionar).observe(mapa); posicionar();
  },

  async escalera(el) {
    cuerpo(el).innerHTML = `${escaleraHTML(PASOS_MADUREZ, { hoy: 0 })}
      <div class="nav-pie">${ejemplo()}<p class="chico">El punto marca dónde está ${EMPRESA.corto} hoy. Cada escalón se apoya en el anterior: no se salta del 1 al 4.</p></div>`;
    rellenarIconos();
    el.querySelectorAll(".escalon").forEach((b) => b.addEventListener("click", () => el.querySelectorAll(".escalon").forEach((x) => x.setAttribute("aria-pressed", x === b))));
  },

  async "flujo-conecta"(el) {
    cuerpo(el).innerHTML = `<div class="flujos mate"><div class="flujos__lienzo"></div></div>
      ${rejilla([
        marco("1 · Entra", `<p class="chico">Lo que hoy vive suelto (chats, correos, planillas, el CRM) se conecta. Nada se pide copiar a mano.</p>`),
        marco("2 · Se ordena", `<p class="chico">Medula lo guarda como la memoria de la empresa: quién, qué, cuándo y con qué cliente.</p>`),
        marco("3 · Se usa", `<p class="chico">Los agentes y la gerencia trabajan sobre esa memoria: cotizan, hacen seguimiento, reportan.</p>`),
      ], 3)}`;
    flujoVivo?.parar(); flujoVivo = flujos(el.querySelector(".flujos__lienzo"));
  },

  async implementacion(el) {
    const etapas = [["Diagnóstico", "hecho", "14 sep – 25 sep"], ["CRM a medida", "en curso", "28 sep – 30 oct"], ["Medula", "pendiente", "nov"], ["Agentes", "pendiente", "dic"]];
    const tareas = [["Plantilla de cotización", "jm", true], ["Importar 1.240 clientes", "vs", true], ["Etapas del embudo", "jm", false], ["Capacitar al equipo comercial", "cr", false], ["Conectar Bsale", "pa", false]];
    cuerpo(el).innerHTML = `<div class="impl mate">
        <div class="impl__cabeza"><div><p class="ceja">${EMPRESA.nombre}</p><p class="titulo-2">Implementación</p></div>${insignia("En curso · a tiempo", { tono: "exito" })}</div>
        ${progreso(etapas.map((e) => e[0]), 1)}
        <div class="impl__etapas">${etapas.map(([n, est, f]) => `<div class="impl__etapa impl__etapa--${est.replace(" ", "-")}"><b>${n}</b><span class="rotulo">${f}</span><span class="chico">${est === "hecho" ? "Terminado" : est === "en curso" ? "60 % avanzado" : "Por empezar"}</span></div>`).join("")}</div>
        <div class="impl__dos">
          <div><p class="titulo-3">Tareas de esta etapa</p><ul class="tareas">${tareas.map(([t, p, ok]) => `<li class="${ok ? "hecha" : ""}"><span class="tarea__check">${ok ? icono("check", { tam: 14 }) : ""}</span><span>${t}</span><span class="rotulo">${persona(p)}</span></li>`).join("")}</ul></div>
          <div><p class="titulo-3">Próximos hitos</p><ul class="hitos"><li><b>16 oct</b><span>Embudo de ventas listo para usar</span></li><li><b>23 oct</b><span>Capacitación del equipo comercial (2 h)</span></li><li><b>30 oct</b><span>CRM en marcha · cierre de etapa</span></li></ul></div>
        </div></div>
      <div class="nav-pie">${ejemplo()}<p class="chico">El cliente ve exactamente lo mismo que el equipo de Optimizo: etapa, avance, quién hace qué y qué viene.</p></div>`;
  },

  async informe(el) {
    const hallazgos = [
      ["Cotizaciones a mano", "12 h/sem", "alto", "bajo", "Plantilla en el CRM con precios vigentes"],
      ["Seguimiento en WhatsApp", "7 h/sem", "alto", "medio", "Embudo con recordatorios automáticos al vendedor"],
      ["Inventario que no calza", "6 h/sem", "medio", "medio", "Conectar Bsale y conteo cíclico por bodega"],
      ["Cobranza sin dueño", "2 h/sem", "medio", "bajo", "Asignar responsable y aviso de vencimiento"],
      ["Conocimiento en 3 personas", "—", "alto", "alto", "Memoria de la empresa (Medula)"],
    ];
    const pos = { bajo: 0.2, medio: 0.5, alto: 0.82 };
    cuerpo(el).innerHTML = `<article class="documento mate">
        <header class="documento__cabeza">${await logo({ clase: "documento__logo" })}<span class="rotulo">Informe de diagnóstico · octubre 2026</span></header>
        <p class="ceja">${EMPRESA.nombre}</p><h3 class="titulo-1">Dónde se va el tiempo</h3>
        <div class="documento__resumen">${heroe({ rotulo: "Horas recuperables por semana", valor: HORAS_PERDIDAS + " h", nota: "en 6 procesos, sin contratar a nadie" })}
          <p class="bajada">El mayor costo de ${EMPRESA.corto} no está en lo que vende, sino en cómo cotiza y hace seguimiento: 19 de las ${HORAS_PERDIDAS} horas se van ahí.</p></div>
        <div class="documento__dos">
          <div><p class="titulo-3">Hallazgos priorizados</p><ol class="hallazgos">${hallazgos.map(([t, h, imp, esf, rec]) => `<li><div><b>${t}</b><span class="chico">${rec}</span></div><span class="mono">${h}</span></li>`).join("")}</ol></div>
          <figure class="matriz"><figcaption class="rotulo">Impacto vs. esfuerzo</figcaption>
            <svg viewBox="0 0 300 260" role="img" aria-label="Matriz de impacto y esfuerzo">
              <rect x="40" y="10" width="250" height="210" class="matriz__fondo"/><rect x="40" y="10" width="125" height="105" class="matriz__ganar"/>
              <line x1="165" y1="10" x2="165" y2="220" class="matriz__eje"/><line x1="40" y1="115" x2="290" y2="115" class="matriz__eje"/>
              <text x="48" y="106" class="matriz__zona">Empezar acá</text>
              <text x="165" y="245" class="matriz__rot" text-anchor="middle">Esfuerzo →</text><text x="14" y="115" class="matriz__rot" transform="rotate(-90 14 115)" text-anchor="middle">Impacto →</text>
              ${hallazgos.map(([t, , imp, esf], i) => `<g><circle cx="${40 + 250 * pos[esf]}" cy="${220 - 210 * pos[imp] + (i % 2) * 10}" r="9" class="matriz__punto"/><text x="${40 + 250 * pos[esf]}" y="${220 - 210 * pos[imp] + (i % 2) * 10 + 4}" text-anchor="middle" class="matriz__n">${i + 1}</text></g>`).join("")}
            </svg></figure>
        </div>
        <footer class="documento__pie rotulo">Preparado por Optimizo · ${ejemplo()}</footer>
      </article>`;
  },

  async propuesta(el) {
    const lineas = [["Diagnóstico de procesos", "2 semanas", 1_800_000], ["CRM a medida (ventas y cotizaciones)", "5 semanas", 6_400_000], ["Integración con Bsale", "1 semana", 1_200_000], ["Capacitación del equipo", "2 sesiones", 400_000]];
    const total = lineas.reduce((s, l) => s + l[2], 0);
    cuerpo(el).innerHTML = `<article class="documento mate">
        <header class="documento__cabeza">${await logo({ clase: "documento__logo" })}<span class="rotulo">Propuesta · válida hasta el 31 oct 2026</span></header>
        <p class="ceja">Para ${EMPRESA.nombre}</p><h3 class="titulo-1">Cotizar en minutos, no en días</h3>
        <p class="bajada">Primera etapa: dejar las cotizaciones y el seguimiento comercial funcionando en un CRM hecho para cómo trabaja ${EMPRESA.corto}.</p>
        <div class="documento__seccion"><p class="titulo-3">Qué incluye</p>
          <table class="tabla-num tabla-propuesta"><thead><tr><th>Etapa</th><th>Duración</th><th class="num">Inversión</th></tr></thead>
          <tbody>${lineas.map(([n, d, m]) => `<tr><td>${n}</td><td>${d}</td><td class="num">${clp(m)}</td></tr>`).join("")}
          <tr class="total"><td>Total implementación</td><td></td><td class="num">${clp(total)} + IVA</td></tr></tbody></table>
          <p class="chico">Después de la implementación: soporte y mejoras con mensualidad (se cotiza al cerrar la etapa).</p></div>
        <div class="documento__seccion documento__cierre"><div><p class="titulo-3">Para empezar</p><p class="chico">Aceptas la propuesta, agendamos el inicio y en la primera semana ya ves el embudo con tus clientes.</p></div>
          ${boton("Aceptar propuesta", { variante: "acento", tam: "l", attrs: "data-aceptar" })}</div>
        <footer class="documento__pie rotulo">Montos de ejemplo: no son precios de Optimizo · ${ejemplo()}</footer>
      </article>`;
    el.querySelector("[data-aceptar]").addEventListener("click", () => toast("Propuesta aceptada. Te escribimos hoy para agendar el inicio.", { tono: "exito" }));
  },

  async sellos(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Medula · identidad propia + sello", `<div class="producto-marca producto-marca--medula"><span class="producto-marca__simbolo"><img src="assets/productos/medula-marca-blanca.svg" alt=""></span><span><b>Medula</b>${sello({ claro: true })}</span></div>`, { nota: "Medula conserva su cobalto y su símbolo. El sello va debajo, más chico, en el color del texto." }),
      marco("Bárbara · identidad por definir", `<div class="producto-marca producto-marca--pendiente"><span class="producto-marca__simbolo">B</span><span><b>Bárbara</b>${sello()}</span></div>`, { nota: "Todavía no tiene marca propia. Cuando la tenga, el sello se aplica igual." }),
      marco("En una pantalla de inicio de sesión", `<div class="login-mini"><img src="assets/productos/medula-marca.svg" alt="" class="login-mini__simbolo"><b class="titulo-3">Entrar a Medula</b><span class="campo__control"><input placeholder="tu@empresa.cl" aria-label="Correo"></span>${boton("Continuar", { tam: "m" })}<span class="login-mini__pie">${sello()}</span></div>`, { nota: "Al pie, centrado. Nunca compite con el producto." }),
      marco("Reglas del sello", `<ul class="lista-punto"><li>Siempre <b>debajo</b> o <b>al pie</b> de la marca del producto, nunca al lado.</li><li>Altura del isotipo = alto de la x del texto del sello.</li><li>Color del texto que lo rodea; el isotipo puede ir en degradado o en un color.</li><li>No se usa en piezas donde Optimizo ya es la marca principal.</li></ul>`),
    ])}`;
  },
};
