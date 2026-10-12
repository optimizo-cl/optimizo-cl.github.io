/* Capítulo 5 · Producto v2 (ola 7): mapa de procesos que se ordena con el scroll (tareas rectas en columnas), la escalera
   única con el punto, implementación con etapas-isotipo, informe y propuesta como documentos vivos con portada de cerámica. */
import { orden } from "../kit/orden.js?v=e33c371";
import { etapas, activarEtapas, moverEtapa } from "../kit/etapas.js?v=e33c371";
import { pieza, activarPiezas, codigo } from "../kit/presentar.js?v=e33c371";
import { boton } from "../kit/controles.js?v=e33c371";
import { toast, estado } from "../kit/avisos.js?v=e33c371";
import { icono, rellenarIconos } from "../kit/iconos.js?v=e33c371";
import { isotipo, logo } from "../kit/marca.js?v=e33c371";
import { ejemplo } from "../kit/guion.js?v=e33c371";
import { progreso as alAvanzar, contar } from "../kit/coreografia.js?v=e33c371";
import { barrasTrama } from "../patrones/graficas2.js?v=e33c371";
import { EMPRESA, PROCESOS, PERSONAS, HORAS_PERDIDAS, HISTORIA, clp } from "../demo/quillay.js?v=e33c371";
import { ESCALERA, escaleraHTML, moverPunto } from "../kit/escalera.js?v=e33c371";
import { movimientoReducido } from "../kit/escenas/vigia.js?v=e33c371";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const persona = (id) => PERSONAS.find((p) => p.id === id)?.nombre || "Sin responsable";
const usoDe = (lista, cod) => `<div class="rejilla-2"><ul class="lista-punto">${lista.map((r) => `<li>${r}</li>`).join("")}</ul>${cod ? codigo(cod) : ""}</div>`;
const tramo = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Portada de documento en cerámica: el isotipo en relieve, el título y la empresa. */
const portadaDoc = async (tipo, titulo, fecha) => `<div class="doc-portada ceramica ceramica--navy">
  <div class="doc-portada__iso" aria-hidden="true">${isotipo({ clase: "" })}</div>
  <div class="doc-portada__texto"><span class="rotulo">${tipo}</span><p class="doc-portada__titulo">${titulo}</p><span class="doc-portada__para">${EMPRESA.nombre} · ${fecha}</span></div>
  <div class="doc-portada__logo">${await logo({ clase: "" })}</div></div>`;

export const producto2 = {
  /* ── Mapa de procesos: el caos se ordena mientras bajas ── */
  async "mapa-procesos"(el) {
    const vivo = `<div class="mapa-scroll" data-mapa-scroll><div class="mapa-scroll__fijo">
        <div class="mapa-scroll__texto"><p class="ceja" data-mapa-ceja>Hoy</p><p class="titulo-2" data-mapa-t>Así se mueve ${EMPRESA.corto} hoy</p><p class="chico" data-mapa-d>Cada punto es algo que pasa: un pedido, un correo, una cotización. Hoy cada uno va por su lado.</p>
          <div class="mapa-scroll__barra" aria-hidden="true"><i></i></div></div>
        <div class="mapa-scroll__orden" data-orden role="img" aria-label="Las tareas de la empresa pasan de estar desordenadas a ordenadas por área"></div></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["El paso de caos a orden ocurre con el scroll: quien lee lo provoca.", "La misma pieza que en el sitio y en las propuestas.", "Con «reducir movimiento» se muestran los dos estados, sin animar."]) });
    activarPiezas(el);
    const raiz = el.querySelector("[data-mapa-scroll]"), d = orden(raiz.querySelector("[data-orden]"));
    const t = raiz.querySelector("[data-mapa-t]"), dsc = raiz.querySelector("[data-mapa-d]"), ceja = raiz.querySelector("[data-mapa-ceja]");
    if (movimientoReducido()) { d.orden(1); t.textContent = `Así se mueve ${EMPRESA.corto} con Optimizo`; return; }
    let fase = -1;
    alAvanzar(raiz, (p, r) => {
      const h = innerHeight, k = tramo(-r.top / Math.max(1, r.height - h), 0.12, 0.8);
      d.orden(k); raiz.style.setProperty("--k", k.toFixed(3));
      const f = k < 0.35 ? 0 : k < 0.85 ? 1 : 2;
      if (f !== fase) { fase = f;
        ceja.textContent = ["Hoy", "Ordenando", "Con Optimizo"][f];
        t.textContent = [`Así se mueve ${EMPRESA.corto} hoy`, "Cada cosa en su lugar", `${EMPRESA.corto}, en orden`][f];
        dsc.textContent = ["Cotizaciones, pedidos, despachos, cobranza: hoy cada cosa está tirada donde cayó.", "Los procesos se documentan, se conectan y se les pone dueño.", "Cada tarea con su área, su dueño y su estado. Se ve qué está trabado y qué está listo."][f]; }
    });
  },

  /* ── Escalera de madurez: el punto sube al escalón donde está la empresa ── */
  async escalera(el) {
    const vivo = `<div class="escalera2" data-escalera2>${escaleraHTML({ modo: "madurez" })}
      <p class="escalera2__estado" aria-live="polite" data-estado-e></p></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Es la misma escalera del cotizador y del sitio: cada etapa de la empresa es el servicio que la lleva ahí.", "El punto marca dónde está la empresa y salta en arco cuando cambia; el siguiente escalón se marca.", "Se elige haciendo clic en un escalón."], 'escaleraHTML({ modo: "madurez" }); moverPunto(pasos, i);') });
    activarPiezas(el); await rellenarIconos();
    const raiz = el.querySelector("[data-escalera2]"), caja = raiz.querySelector(".escalera2__pasos"), pasos = [...raiz.querySelectorAll(".escalon2")], est = raiz.querySelector("[data-estado-e]");
    let actual = 1;
    const ir = (i) => {
      actual = i;
      pasos.forEach((b, k) => { b.setAttribute("aria-pressed", k === i); b.classList.toggle("hecho", k < i); b.classList.toggle("sigue", k === i + 1); });
      moverPunto(caja, i);
      est.textContent = `${EMPRESA.corto} está en «${ESCALERA[i].etapa}». Siguiente paso: ${ESCALERA[i + 1]?.etapa || "seguir creciendo"}.`;
    };
    pasos.forEach((b) => b.addEventListener("click", () => ir(+b.dataset.i)));
    requestAnimationFrame(() => ir(1)); addEventListener("resize", () => ir(actual));
  },

  /* ── Implementación: una pista con estaciones ── */
  async implementacion(el) {
    const tareas = [["Plantilla de cotización", "jm", true], ["Importar 1.240 clientes", "vs", true], ["Etapas del embudo", "jm", false], ["Capacitar al equipo comercial", "cr", false], ["Conectar Bsale", "pa", false]];
    const vivo = `<div class="impl2 papel">
      <div class="impl2__cabeza"><div><p class="ceja">${EMPRESA.nombre}</p><p class="titulo-2">Implementación</p></div>${estado("En curso · a tiempo", { forma: "medio", tono: "exito" })}</div>
      ${etapas([{ nombre: "Diagnóstico", detalle: HISTORIA.diagnostico }, { nombre: "CRM a medida", detalle: HISTORIA.crm }, { nombre: "Medula", detalle: HISTORIA.medula }, { nombre: "Agentes", detalle: HISTORIA.agentes }], { actual: 1, avance: HISTORIA.crmAvance, etiqueta: "Etapas de la implementación" })}<div class="impl2__mandos">${boton("Retroceder", { variante: "texto", tam: "s", ico: "arrow-left", attrs: "data-etapa=-1" })}${boton("Simular avance", { variante: "secundario", tam: "s", icoFin: "arrow-right", attrs: "data-etapa=1" })}</div>
      <div class="impl2__dos">
        <div><p class="titulo-3">Tareas de esta etapa</p><ul class="tareas2">${tareas.map(([t, p, ok]) => `<li class="${ok ? "hecha" : ""}">${estado(t, { forma: ok ? "lleno" : "vacio", tono: ok ? "exito" : "neutro" })}<span class="rotulo">${persona(p)}</span></li>`).join("")}</ul></div>
        <div><p class="titulo-3">Próximos hitos</p><ol class="hitos2">${HISTORIA.hitos.map(([f, t]) => `<li><b>${f}</b><span>${t}</span></li>`).join("")}</ol></div>
      </div></div><div class="nav-pie">${ejemplo()}<p class="chico">El cliente ve lo mismo que el equipo: etapa, avance, quién hace qué y qué viene.</p></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el);
    activarEtapas(el);
    const et = el.querySelector("[data-etapas]"), avances = [1, HISTORIA.crmAvance, 0.3, 0.15];
    el.querySelectorAll("[data-etapa]").forEach((b) => b.addEventListener("click", () => { const i = Math.max(0, Math.min(4, +et.dataset.actual + +b.dataset.etapa)); moverEtapa(et, i, avances[i] ?? 1); }));
  },

  /* ── Informe: documento vivo ── */
  async informe(el) {
    const hallazgos = [["Cotizaciones a mano", 12, "alto", "bajo", "Plantilla en el CRM con precios vigentes"], ["Seguimiento en WhatsApp", 7, "alto", "medio", "Embudo con recordatorios al vendedor"], ["Inventario que no calza", 6, "medio", "medio", "Conectar Bsale y conteo cíclico"], ["Cobranza sin dueño", 2, "medio", "bajo", "Responsable y aviso de vencimiento"], ["Conocimiento en 3 personas", 0, "alto", "alto", "Memoria de la empresa (Medula)"]];
    const pos = { bajo: 0.2, medio: 0.5, alto: 0.82 };
    const vivo = `<article class="doc2">
      ${await portadaDoc("Informe de diagnóstico", "Dónde se va el tiempo", HISTORIA.informe)}
      <div class="doc2__cuerpo papel">
        <div class="doc2__resumen"><div class="doc2__heroe"><span class="rotulo">Horas recuperables por semana</span><b data-h>0 h</b><span class="chico">en 6 procesos, sin contratar a nadie</span></div>
          <p class="bajada">El mayor costo de ${EMPRESA.corto} no está en lo que vende, sino en cómo cotiza y hace seguimiento: <b>19 de las ${HORAS_PERDIDAS} horas</b> se van ahí.</p></div>
        <div class="doc2__dos"><div data-barras></div>
          <figure class="matriz2"><figcaption class="rotulo">Impacto vs. esfuerzo</figcaption>
            <svg viewBox="0 0 300 260" role="img" aria-label="Matriz de impacto y esfuerzo"><rect x="40" y="10" width="250" height="210" class="matriz__fondo"/><rect x="40" y="10" width="125" height="105" class="matriz__ganar"/>
              <line x1="165" y1="10" x2="165" y2="220" class="matriz__eje"/><line x1="40" y1="115" x2="290" y2="115" class="matriz__eje"/><text x="48" y="28" class="matriz__zona">Empezar acá</text>
              <text x="165" y="245" class="matriz__rot" text-anchor="middle">Esfuerzo →</text><text x="14" y="115" class="matriz__rot" transform="rotate(-90 14 115)" text-anchor="middle">Impacto →</text>
              ${hallazgos.map(([t, , imp, esf], i) => `<g class="matriz2__p" style="--i:${i}"><circle cx="${40 + 250 * pos[esf]}" cy="${220 - 210 * pos[imp] + (i % 2) * 12}" r="10" class="matriz__punto"/><text x="${40 + 250 * pos[esf]}" y="${220 - 210 * pos[imp] + (i % 2) * 12 + 4}" text-anchor="middle" class="matriz__n">${i + 1}</text></g>`).join("")}
            </svg></figure></div>
        <ol class="hallazgos2">${hallazgos.map(([t, h, , , rec], i) => `<li><span class="hallazgos2__n">${i + 1}</span><div><b>${t}</b><span class="chico">${rec}</span></div><span class="mono">${h ? h + " h/sem" : "—"}</span></li>`).join("")}</ol>
        <footer class="documento__pie rotulo">Preparado por Optimizo · ${ejemplo()}</footer></div></article>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Portada en cerámica navy con el isotipo en relieve.", "Un número héroe y una frase que lo explica; después, el detalle.", "Las gráficas se dibujan al llegar; la matriz numera los hallazgos."]) });
    activarPiezas(el);
    contar(el.querySelector("[data-h]"), HORAS_PERDIDAS, { duracion: 1600, formato: (v) => Math.round(v) + " h" });
    barrasTrama(el.querySelector("[data-barras]"), hallazgos.filter((h) => h[1]).map(([t, h]) => ({ etiqueta: t, valor: h })), { titulo: "Horas por semana", formato: (v) => v + " h", destacar: 2 });
  },

  /* ── Propuesta: documento vivo ── */
  async propuesta(el) {
    const lineas = [["Diseño del embudo y la cotización", "1 semana", 1_200_000], ["CRM a medida (ventas y cotizaciones)", "3 semanas", 6_400_000], ["Integración con Bsale", "1 semana", 1_200_000], ["Capacitación del equipo", "2 sesiones", 400_000]];
    const total = lineas.reduce((s, l) => s + l[2], 0);
    const vivo = `<article class="doc2">
      ${await portadaDoc("Propuesta", "Cotizar en minutos, no en días", `${HISTORIA.propuesta.fecha} · válida hasta el ${HISTORIA.propuesta.valida}`)}
      <div class="doc2__cuerpo papel">
        <p class="bajada">Primera etapa: dejar las cotizaciones y el seguimiento comercial funcionando en un CRM hecho para cómo trabaja ${EMPRESA.corto}.</p>
        ${etapas(lineas.map(([n, d]) => ({ nombre: n.split(" (")[0], detalle: d })), { actual: 0, avance: 0, porcentaje: false, etiqueta: "Etapas de la propuesta" })}
        <table class="tabla-num tabla-propuesta"><thead><tr><th>Etapa</th><th>Duración</th><th class="num">Inversión</th></tr></thead>
          <tbody>${lineas.map(([n, d, m]) => `<tr><td>${n}</td><td>${d}</td><td class="num">${clp(m)}</td></tr>`).join("")}<tr class="total"><td>Total implementación</td><td></td><td class="num">${clp(total)} + IVA</td></tr></tbody></table>
        <div class="doc2__cierre"><div><p class="titulo-3">Para empezar</p><p class="chico">Aceptas, agendamos el inicio y en la primera semana ya ves el embudo con tus clientes.</p></div>${boton("Aceptar propuesta", { variante: "acento", tam: "l", attrs: "data-aceptar" })}</div>
        <footer class="documento__pie rotulo">Montos de ejemplo: no son precios de Optimizo · ${ejemplo()}</footer></div></article>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el);
    activarEtapas(el);
    el.querySelector("[data-aceptar]").addEventListener("click", () => toast("Propuesta aceptada. Te escribimos hoy para agendar el inicio.", { tono: "exito" }));
  },
};
