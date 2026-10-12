/* Capítulo 3 · Formularios v2 (ola 5): pedir datos como una conversación. Mientras respondes, se dibuja tu empresa;
   la escalera única se elige peldaño a peldaño; la agenda muestra la disponibilidad como puntos; archivos y encuesta usan el isotipo como medidor. */
import { campo, validar } from "../kit/campos.js?v=7a04113";
import { boton, trabajar } from "../kit/controles.js?v=7a04113";
import { listo } from "../kit/punto.js?v=7a04113";
import { etapas, activarEtapas, moverEtapa } from "../kit/etapas.js?v=7a04113";
import { toast } from "../kit/avisos.js?v=7a04113";
import { icono, rellenarIconos } from "../kit/iconos.js?v=7a04113";
import { isotipo } from "../kit/marca.js?v=7a04113";
import { pieza, activarPiezas, codigo } from "../kit/presentar.js?v=7a04113";
import { contar } from "../kit/coreografia.js?v=7a04113";
import { movimientoReducido } from "../kit/escenas/vigia.js?v=7a04113";
import { ESCALERA, escaleraHTML, moverPunto } from "../kit/escalera.js?v=7a04113";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const reducido = () => movimientoReducido();
const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
const usoDe = (lista, cod) => `<div class="rejilla-2"><ul class="lista-punto">${lista.map((r) => `<li>${r}</li>`).join("")}</ul>${codigo(cod)}</div>`;
const fichaOp = (nombre, valor, texto, { multiple = true, ico = "" } = {}) => `<button type="button" class="ficha-ceramica ceramica opcion-conv" role="${multiple ? "checkbox" : "radio"}" aria-checked="false" data-nombre="${nombre}" data-valor="${valor}">${ico ? icono(ico, { tam: 18 }) : "<i aria-hidden=\"true\"></i>"}${texto}</button>`;

/* ═════════ Diagnóstico conversacional ═════════ */
const SISTEMAS = [["planillas", "Planillas", "files"], ["whatsapp", "WhatsApp", "whatsapp-logo"], ["correo", "Correo", "envelope-simple"], ["crm", "Un CRM", "users-three"], ["erp", "ERP o facturación", "receipt"], ["papel", "Papel", "folder-open"]];
const DOLORES = [["cotizaciones", "Cotizaciones"], ["seguimiento", "Seguimiento"], ["inventario", "Inventario"], ["reportes", "Reportes"], ["conocimiento", "Lo que sabe cada uno"], ["coordinacion", "Coordinación"]];
const PERSONAS = [["1-10", "1 a 10", 6], ["11-50", "11 a 50", 14], ["51-200", "51 a 200", 26], ["200+", "Más de 200", 40]];

/* Tu empresa, dibujada en orden (sin órbitas): arriba los sistemas con los que trabaja, que bajan por líneas rectas
   a un mismo cauce y entran al isotipo (los datos viajan por ahí); abajo su gente, en filas; y colgando del cauce de
   abajo, los nudos donde se pierde el tiempo. Todo recto, como la marca ordena. */
function mapaEmpresa(svg) {
  const W = 440, C = 220, CY = 196, BUS = 118, BAJO = 346;
  svg.setAttribute("viewBox", `0 0 ${W} 420`);
  const capa = (cls) => { const g = svgEl("g", { class: cls }); svg.appendChild(g); return g; };
  const capaFlujo = capa("mapa__flujos"), capaGente = capa("mapa__gente"), capaNodos = capa(""), capaNudos = capa("mapa__nudos");
  const cauce = svgEl("path", { class: "mapa__cauce" }), cauceBajo = svgEl("path", { class: "mapa__cauce mapa__cauce--bajo" });
  capaFlujo.append(cauce); capaNudos.append(cauceBajo);
  const centro = svgEl("g", { class: "mapa__centro" });
  centro.innerHTML = `<g transform="translate(${C - 46} ${CY - 46}) scale(.665)">${isotipo({ clase: "" }).replace(/<svg[^>]*>|<\/svg>/g, "")}</g><text class="mapa__nombre" x="${C}" y="${CY + 66}" text-anchor="middle">Tu empresa</text>`;
  svg.appendChild(centro);
  const nodos = new Map(), nudos = new Map();
  let gente = 0, raf = 0, vivo = false, t0 = performance.now();
  const repartir = (n, ancho = 360) => Array.from({ length: n }, (_, k) => (n === 1 ? C : C - ancho / 2 + (ancho / (n - 1)) * k));
  const dibujar = () => {
    const lista = [...nodos.values()], xs = repartir(lista.length, Math.min(390, 96 * Math.max(1, lista.length - 1)));
    lista.forEach((nd, k) => { const x = xs[k]; nd.x = x; nd.g.setAttribute("transform", `translate(${x} 54)`); nd.flujo.setAttribute("d", `M${x} 72 V${BUS} H${C} V${CY - 50}`); });
    cauce.setAttribute("d", lista.length ? `M${Math.min(...xs)} ${BUS} H${Math.max(...xs)} M${C} ${BUS} V${CY - 50}` : "");
    const ns = [...nudos.values()], xn = repartir(ns.length, Math.min(340, 84 * Math.max(1, ns.length - 1)));
    ns.forEach((g, k) => g.setAttribute("transform", `translate(${xn[k]} ${BAJO + 14})`));
    cauceBajo.setAttribute("d", ns.length ? `M${C} ${CY + 122} V${BAJO} M${Math.min(...xn)} ${BAJO} H${Math.max(...xn)}` : "");
  };
  const cuadro = () => {
    const t = movimientoReducido() ? 0 : performance.now() - t0;
    [...nodos.values()].forEach((nd, k) => { if (!nd.dato) return; const L = nd.flujo.getTotalLength(), q = ((t / 2600) + k * 0.31) % 1, p = nd.flujo.getPointAtLength(L * q); nd.dato.setAttribute("cx", p.x); nd.dato.setAttribute("cy", p.y); });
    if (vivo) raf = requestAnimationFrame(cuadro);
  };
  new IntersectionObserver(([e]) => { vivo = e.isIntersecting; if (vivo && !raf) raf = requestAnimationFrame(cuadro); if (!vivo) { cancelAnimationFrame(raf); raf = 0; } }).observe(svg);
  return {
    nombre(txt) { centro.querySelector(".mapa__nombre").textContent = txt || "Tu empresa"; },
    personas(n) {
      if (n === gente) return; gente = n; capaGente.innerHTML = "";
      const total = Math.min(60, Math.max(6, n)), porFila = 20, filas = Math.ceil(total / porFila);
      for (let k = 0; k < total; k++) { const f = Math.floor(k / porFila), enFila = Math.min(porFila, total - f * porFila), c = k % porFila;
        capaGente.appendChild(svgEl("circle", { cx: C + (c - (enFila - 1) / 2) * 11, cy: CY + 88 + f * 11, r: 3, style: `--i:${k}` })); }
      void filas;
    },
    sistemas(lista) {
      for (const [k, nd] of nodos) if (!lista.includes(k)) { nd.g.classList.add("sale"); nd.flujo.remove(); nd.dato.remove(); setTimeout(() => nd.g.remove(), 400); nodos.delete(k); }
      for (const k of lista) if (!nodos.has(k)) {
        const nombre = { erp: "ERP", crm: "CRM" }[k] || SISTEMAS.find((x) => x[0] === k)[1];
        const g = svgEl("g", { class: "mapa__nodo" });
        g.innerHTML = `<circle r="17" class="mapa__nodo-disco"/><circle r="5.5" class="mapa__nodo-hueco"/><text y="-26" text-anchor="middle">${nombre}</text>`;
        const flujo = svgEl("path", { class: "mapa__flujo" }), dato = svgEl("circle", { r: 3.4, class: "mapa__dato" });
        capaFlujo.append(flujo, dato); capaNodos.appendChild(g);
        nodos.set(k, { g, flujo, dato });
      }
      dibujar(); cuadro();
    },
    dolores(lista) {
      for (const [k, g] of nudos) if (!lista.includes(k)) { g.remove(); nudos.delete(k); }
      for (const k of lista) if (!nudos.has(k)) {
        const [, nombre] = DOLORES.find((d) => d[0] === k);
        const g = svgEl("g", { class: "mapa__traba" });
        g.innerHTML = `<circle r="3.4" cx="-5" cy="1"/><circle r="3.4" cx="2" cy="-4"/><circle r="3.4" cx="4" cy="4"/><text y="26" text-anchor="middle">${nombre}</text>`;
        capaNudos.appendChild(g); nudos.set(k, g);
      }
      dibujar();
    },
    ordenar() { svg.classList.add("mapa--ordenado"); },
  };
}

/* La escalera es la única de Optimizo (kit/escalera.js): cada peldaño es un servicio. */

export const formularios2 = {
  async diagnostico(el) {
    const pasos = [
      { id: "empresa", q: "¿Cómo se llama tu empresa?", html: campo("Nombre de la empresa", { nombre: "empresa", requerido: true, marcador: "Quillay Suministros Industriales", attrs: "data-conv" }) },
      { id: "personas", q: "¿Cuántas personas trabajan ahí?", html: `<div class="opciones-conv" role="radiogroup" aria-label="Personas">${PERSONAS.map(([v, t]) => fichaOp("personas", v, t, { multiple: false })).join("")}</div>` },
      { id: "sistemas", q: "¿Con qué trabajan hoy?", ayuda: "Elige todo lo que usen. Aparecen en tu mapa.", html: `<div class="opciones-conv" role="group" aria-label="Sistemas">${SISTEMAS.map(([v, t, i]) => fichaOp("sistemas", v, t, { ico: i })).join("")}</div>` },
      { id: "dolores", q: "¿Dónde se les va el tiempo?", ayuda: "Cada uno es un nudo en tu mapa.", html: `<div class="opciones-conv" role="group" aria-label="Dónde se va el tiempo">${DOLORES.map(([v, t]) => fichaOp("dolores", v, t)).join("")}</div>` },
      { id: "contacto", q: "¿Con quién hablamos?", html: `<div class="formulario__rejilla">${campo("Tu nombre", { nombre: "nombre", requerido: true, marcador: "Camila Rojas", attrs: "data-conv" })}${campo("Correo de trabajo", { nombre: "correo", tipo: "correo", requerido: true, marcador: "camila@quillay.cl", attrs: "data-conv" })}</div>` },
    ];
    const vivo = `<div class="conv" data-conv-raiz>
      <div class="conv__charla">
        <div class="conv__etapas">${etapas(["Empresa", "Personas", "Sistemas", "Nudos", "Contacto"], { actual: 0, avance: 0, compacto: true, porcentaje: false, etiqueta: "Preguntas" })}</div>
        <p class="rotulo conv__cuenta" data-cuenta>1 de ${pasos.length}</p>
        <form class="conv__pasos" novalidate>${pasos.map((p, i) => `<fieldset class="conv__paso" data-paso="${p.id}" ${i ? "hidden" : ""}><legend class="conv__pregunta">${p.q}</legend>${p.ayuda ? `<p class="chico">${p.ayuda}</p>` : ""}${p.html}</fieldset>`).join("")}
          <div class="conv__final" hidden data-final><p class="rotulo">Así se ve hoy</p><p class="conv__pregunta" data-final-t>Tu empresa</p>
            <p class="conv__horas"><b data-horas>0</b><span>horas por semana que se podrían recuperar</span></p><p class="chico">Estimación de ejemplo según tamaño y nudos. El diagnóstico real la mide.</p></div>
          <div class="conv__acciones"><button type="button" class="boton boton--texto" data-atras hidden>${icono("arrow-left", { tam: 18 })}<span class="boton__texto">Atrás</span></button><button type="submit" class="boton boton--acento boton--l" data-seguir><span class="boton__texto">Seguir</span>${icono("arrow-right", { tam: 20 })}</button><span class="rotulo conv__tecla">o presiona Enter ↵</span></div>
        </form></div>
      <figure class="conv__mapa"><svg viewBox="0 0 440 420" role="img" aria-label="Mapa de tu empresa: se dibuja mientras respondes" data-mapa></svg><figcaption class="rotulo">Tu empresa, dibujada mientras respondes</figcaption></figure>
    </div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Una pregunta por pantalla, con letra grande; Enter avanza.", "Lo que respondes se ve al instante en el mapa: nadie llena a ciegas.", "Solo lo justo: 5 preguntas. El resto se conversa.", "Al final, el mapa y una estimación honesta (marcada como ejemplo)."], 'const mapa = mapaEmpresa(svg);\nmapa.sistemas(["planillas", "whatsapp"]);\nmapa.dolores(["cotizaciones"]);') });
    activarPiezas(el); await rellenarIconos(); activarEtapas(el);
    const raiz = el.querySelector("[data-conv-raiz]"), form = raiz.querySelector("form"), mapa = mapaEmpresa(raiz.querySelector("[data-mapa]"));
    const datos = { sistemas: [], dolores: [] };
    let i = 0;
    const fs = [...raiz.querySelectorAll(".conv__paso")];
    const ir = (n) => {
      fs[i].classList.add("sale"); const viejo = fs[i];
      setTimeout(() => { viejo.hidden = true; viejo.classList.remove("sale"); }, reducido() ? 0 : 260);
      i = n;
      setTimeout(() => {
        if (i < fs.length) { fs[i].hidden = false; fs[i].classList.add("entra-paso"); fs[i].querySelector("input, button")?.focus(); setTimeout(() => fs[i]?.classList.remove("entra-paso"), 700); }
        moverEtapa(raiz.querySelector("[data-etapas]"), i, 0);
        raiz.querySelector("[data-cuenta]").textContent = i < fs.length ? `${i + 1} de ${fs.length}` : "Listo";
        raiz.querySelector("[data-atras]").hidden = i === 0 || i >= fs.length;
      }, reducido() ? 0 : 280);
    };
    raiz.style.setProperty("--n", fs.length); raiz.style.setProperty("--paso", 0);
    raiz.addEventListener("input", (e) => { if (e.target.name === "empresa") mapa.nombre(e.target.value.trim()); });
    raiz.addEventListener("click", (e) => {
      const op = e.target.closest(".opcion-conv"); if (!op) return;
      const n = op.dataset.nombre;
      if (op.getAttribute("role") === "radio") { raiz.querySelectorAll(`[data-nombre="${n}"]`).forEach((x) => x.setAttribute("aria-checked", x === op)); datos[n] = op.dataset.valor; }
      else { const si = op.getAttribute("aria-checked") !== "true"; op.setAttribute("aria-checked", si); datos[n] = [...raiz.querySelectorAll(`[data-nombre="${n}"][aria-checked="true"]`)].map((x) => x.dataset.valor); }
      if (n === "personas") mapa.personas(PERSONAS.find((p) => p[0] === datos.personas)[2] * 1.5);
      if (n === "sistemas") mapa.sistemas(datos.sistemas);
      if (n === "dolores") mapa.dolores(datos.dolores);
    });
    raiz.querySelector("[data-atras]").addEventListener("click", () => ir(Math.max(0, i - 1)));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (i >= fs.length) return;
      const paso = fs[i], inputs = [...paso.querySelectorAll("input[data-conv]")];
      if (inputs.length && !inputs.map(validar).every(Boolean)) { paso.querySelector("[aria-invalid]")?.focus(); return; }
      if (paso.dataset.paso === "personas" && !datos.personas) { toast("Elige un rango para seguir."); return; }
      if (i === fs.length - 1) {
        const btn = raiz.querySelector("[data-seguir]");
        await trabajar(btn, () => espera(900), { cargando: "Dibujando…", listo: "Listo" });
        ir(fs.length); mapa.ordenar();
        const final = raiz.querySelector("[data-final]"); final.hidden = false;
        raiz.querySelector("[data-final-t]").textContent = `Así se ve hoy ${form.empresa?.value.trim() || "tu empresa"}`;
        const base = (PERSONAS.find((p) => p[0] === datos.personas) || PERSONAS[1])[2];
        contar(raiz.querySelector("[data-horas]"), Math.round(base * (0.6 + 0.22 * datos.dolores.length) + datos.sistemas.length * 1.5), { duracion: 1600 });
        btn.hidden = true; raiz.querySelector(".conv__tecla").hidden = true; raiz.querySelector("[data-atras]").hidden = true;
        return;
      }
      ir(i + 1);
    });
  },

  /* ── Cotizador: la misma escalera de Optimizo; se eligen los peldaños ── */
  async cotizacion(el) {
    // cada peldaño es un servicio: solo se encienden los elegidos; los que faltan abajo se marcan como «conviene antes»
    const vivo = `<div class="cotizador" data-cotizador>
      <div class="cotizador__escalera escalera2"><p class="rotulo">Elige uno o más peldaños</p>${escaleraHTML({ modo: "servicios" })}</div>
      <div class="cotizador__pie">
        <div class="cotizador__camino" aria-live="polite" data-camino><p class="chico">Elige uno o más servicios: la escalera muestra hasta dónde llegas y qué conviene tener antes.</p></div>
        <div class="cotizador__estima"><div><span class="rotulo">Horas por semana recuperables</span><b data-estima-h>—</b></div><div><span class="rotulo">Llegas a</span><b data-estima-p>—</b></div><div><span class="rotulo">Plazo</span><b data-estima-s>—</b></div></div>
        <div class="cotizador__pedir">${boton("Pedir propuesta", { variante: "acento", icoFin: "arrow-right", attrs: "data-pedir disabled" })}<p class="chico">Estimaciones de ejemplo; la propuesta real sale del diagnóstico. Sin precios inventados.</p></div>
      </div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Es la misma escalera de la sección Escalera de madurez: cada peldaño es un servicio.", "Solo se encienden los que eliges. Si eliges uno alto sin los de abajo, esos quedan punteados como «conviene antes», con la opción de sumarlos.", "El punto de la marca salta al peldaño más alto que elegiste.", "Nada de precios inventados: horas y plazos de ejemplo."], 'escaleraHTML({ modo: "servicios" });') });
    activarPiezas(el); await rellenarIconos();
    const raiz = el.querySelector("[data-cotizador]"), caja = raiz.querySelector(".escalera2__pasos"), camino = raiz.querySelector("[data-camino]");
    const pasos = [...raiz.querySelectorAll(".escalon2")];
    const elegido = (k) => raiz.querySelector(`.escalon2[data-k="${k}"]`).getAttribute("aria-pressed") === "true";
    const recalcular = () => {
      const elegidos = ESCALERA.filter((p) => elegido(p.k)), max = Math.max(0, ...elegidos.map((p) => ESCALERA.indexOf(p) + 1));
      const faltan = ESCALERA.filter((p, i) => i + 1 < max && !elegido(p.k));
      pasos.forEach((b, i) => { const si = elegido(b.dataset.k); b.classList.toggle("elegido", si); b.classList.toggle("falta", !si && i + 1 < max); });
      moverPunto(caja, max - 1);
      const h0 = elegidos.reduce((a, p) => a + p.horas[0], 0), h1 = elegidos.reduce((a, p) => a + p.horas[1], 0);
      raiz.querySelector("[data-estima-h]").textContent = elegidos.length ? `${h0}–${h1} h` : "—";
      raiz.querySelector("[data-estima-p]").textContent = max ? ESCALERA[max - 1].servicio : "—";
      raiz.querySelector("[data-estima-s]").textContent = elegidos.length ? `${2 + elegidos.length}–${4 + elegidos.length * 2} semanas` : "—";
      raiz.querySelector("[data-pedir]").disabled = !elegidos.length;
      const nombre = max ? ESCALERA[max - 1].servicio : "";
      camino.innerHTML = !elegidos.length ? `<p class="chico">Elige uno o más servicios: la escalera muestra hasta dónde llegas y qué conviene tener antes.</p>`
        : faltan.length ? `<p class="chico">Para que <b>${nombre}</b> rinda, conviene tener antes: ${faltan.map((f) => `<b>${f.servicio}</b>`).join(", ")}.</p>${boton(`Sumar ${faltan.length === 1 ? "ese paso" : "esos pasos"}`, { variante: "secundario", tam: "s", ico: "plus", attrs: "data-sumar" })}`
        : `<p class="chico">Camino completo hasta <b>${nombre}</b>: cada paso se apoya en el anterior.</p>`;
      rellenarIconos();
      camino.querySelector("[data-sumar]")?.addEventListener("click", () => { faltan.forEach((f) => raiz.querySelector(`.escalon2[data-k="${f.k}"]`).setAttribute("aria-pressed", "true")); recalcular(); });
    };
    pasos.forEach((b) => b.addEventListener("click", () => { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); recalcular(); }));
    requestAnimationFrame(() => moverPunto(caja, -1)); addEventListener("resize", recalcular);
    raiz.querySelector("[data-pedir]").addEventListener("click", (e) => trabajar(e.currentTarget, () => espera(1200), { cargando: "Enviando…", listo: "Pedido" }));
  },

  /* ── Agendar: disponibilidad como densidad de puntos y una cinta de horas ── */
  async agendar(el) {
    const HOY = new Date(2026, 8, 14), MES = new Date(2026, 8, 1);
    const libres = (d) => { const dia = d.getDay(); if (dia === 0 || dia === 6 || d < HOY) return 0; return [1, 5, 3, 6, 2, 4, 6, 1, 5, 2][(d.getDate() * 7) % 10]; };
    const dias = []; const primero = (MES.getDay() + 6) % 7; for (let k = 0; k < primero; k++) dias.push(null);
    for (let d = 1; d <= 30; d++) dias.push(new Date(2026, 8, d));
    const vivo = `<div class="agenda" data-agenda>
      <div class="agenda__cal papel"><div class="agenda__mes"><b>Septiembre 2026</b><span class="rotulo">Más puntos = más horas libres</span></div>
        <div class="agenda__semana" aria-hidden="true">${["L", "M", "M", "J", "V", "S", "D"].map((x) => `<span>${x}</span>`).join("")}</div>
        <div class="agenda__dias" role="group" aria-label="Días de septiembre">${dias.map((d) => { if (!d) return `<span></span>`; const n = libres(d); return `<button type="button" class="agenda__dia" data-dia="${d.getDate()}" ${n ? "" : "disabled"} tabindex="-1" aria-label="${d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}${n ? `, ${n} horarios libres` : ", sin horarios"}"><span>${d.getDate()}</span><i class="agenda__puntos" style="--n:${n}">${"<i></i>".repeat(n)}</i></button>`; }).join("")}</div></div>
      <div class="agenda__horas"><p class="rotulo" data-dia-t>Elige un día</p>
        <div class="cinta" data-cinta><div class="cinta__aguja" aria-hidden="true"></div><div class="cinta__pista" role="listbox" aria-label="Horarios" data-pista></div></div>
        <p class="chico agenda__zona">${icono("clock", { tam: 16 })} Hora de Santiago (GMT−3) · 30 minutos por videollamada</p>
        ${boton("Confirmar reunión", { variante: "acento", attrs: "data-confirmar disabled" })}
        <div class="agenda__listo" data-listo hidden></div></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["La disponibilidad se ve antes de elegir: cada punto es un horario libre.", "Las horas son una cinta: se arrastra o se elige con flechas; la aguja marca la elegida.", "Siempre se muestra la zona horaria.", "Al confirmar, la firma: el punto aterriza."], 'agenda.innerHTML = densidad(mes, libres);\ncinta(pista, { horas, alElegir: (h) => reservar(dia, h) });') });
    activarPiezas(el); await rellenarIconos();
    const raiz = el.querySelector("[data-agenda]"), pista = raiz.querySelector("[data-pista]"), cintaEl = raiz.querySelector("[data-cinta]");
    const botones = [...raiz.querySelectorAll(".agenda__dia:not(:disabled)")];
    let dia = null, hora = null;
    botones[0].tabIndex = 0;
    const elegirHora = (b, centrar = true) => {
      pista.querySelectorAll("[role=option]").forEach((x) => x.setAttribute("aria-selected", x === b));
      hora = b.dataset.h; raiz.querySelector("[data-confirmar]").disabled = false;
      if (centrar) cintaEl.scrollTo({ left: b.offsetLeft - cintaEl.clientWidth / 2 + b.offsetWidth / 2, behavior: reducido() ? "auto" : "smooth" });
    };
    const elegirDia = (b) => {
      botones.forEach((x) => { x.setAttribute("aria-pressed", x === b); x.tabIndex = x === b ? 0 : -1; });
      dia = +b.dataset.dia; hora = null; raiz.querySelector("[data-confirmar]").disabled = true;
      const fecha = new Date(2026, 8, dia);
      raiz.querySelector("[data-dia-t]").textContent = fecha.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
      const ocupadas = new Set(["10:00", "12:30", "15:00", "15:30"].filter((_, k) => (dia + k) % 3));
      const horas = []; for (let h = 9; h < 18; h++) for (const m of ["00", "30"]) horas.push(`${h}:${m}`);
      pista.innerHTML = horas.map((h) => `<button type="button" role="option" class="cinta__hora" data-h="${h}" aria-selected="false" ${ocupadas.has(h) || h === "13:00" || h === "13:30" ? 'aria-disabled="true" disabled' : ""}><b>${h}</b><span>${ocupadas.has(h) ? "ocupado" : h.startsWith("13") ? "almuerzo" : "libre"}</span></button>`).join("");
      pista.querySelectorAll(".cinta__hora:not(:disabled)").forEach((x) => x.addEventListener("click", () => elegirHora(x)));
      cintaEl.scrollTo({ left: 0 });
    };
    botones.forEach((b, k) => {
      b.addEventListener("click", () => elegirDia(b));
      b.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key]; if (!d) return; e.preventDefault();
        const objetivo = raiz.querySelector(`.agenda__dia[data-dia="${+b.dataset.dia + d}"]:not(:disabled)`) || botones[Math.max(0, Math.min(botones.length - 1, k + Math.sign(d)))];
        b.tabIndex = -1; objetivo.tabIndex = 0; objetivo.focus();
      });
    });
    // al soltar la cinta, la hora libre más cerca de la aguja queda elegida
    let quieto = 0;
    cintaEl.addEventListener("scroll", () => { clearTimeout(quieto); quieto = setTimeout(() => {
      const centro = cintaEl.scrollLeft + cintaEl.clientWidth / 2; let mejor = null, dist = 1e9;
      pista.querySelectorAll(".cinta__hora:not(:disabled)").forEach((x) => { const dd = Math.abs(x.offsetLeft + x.offsetWidth / 2 - centro); if (dd < dist) { dist = dd; mejor = x; } });
      if (mejor && dia) elegirHora(mejor, false);
    }, 160); }, { passive: true });
    // arrastrar la cinta con el mouse (en táctil ya se desliza sola)
    let arrastre = null;
    cintaEl.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; arrastre = { x: e.clientX, s: cintaEl.scrollLeft, movio: false }; });
    addEventListener("pointermove", (e) => { if (!arrastre) return; const dx = e.clientX - arrastre.x; if (Math.abs(dx) > 4) arrastre.movio = true; cintaEl.scrollLeft = arrastre.s - dx; });
    addEventListener("pointerup", () => { if (arrastre?.movio) cintaEl.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true }); arrastre = null; });
    raiz.querySelector("[data-confirmar]").addEventListener("click", async (e) => {
      await trabajar(e.currentTarget, () => espera(1000), { cargando: "Reservando…", listo: "Reservado" });
      const l = raiz.querySelector("[data-listo]"); l.hidden = false;
      l.innerHTML = `${listo({ tam: 56, texto: "Reunión agendada" })}<p class="chico">${new Date(2026, 8, dia).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })} a las ${hora} h. Te llega la invitación al correo.</p>`;
    });
    elegirDia(botones[0]);
  },
};
