/* Capítulo 3 · Formularios v2 (ola 5): pedir datos como una conversación. Mientras respondes, se dibuja tu empresa;
   la escalera se ilumina; la agenda muestra la disponibilidad como puntos; los archivos caen al disco; la NPS es una órbita. */
import { campo, validar } from "../kit/campos.js?v=19f4b98";
import { boton, trabajar } from "../kit/controles.js?v=19f4b98";
import { listo } from "../kit/punto.js?v=19f4b98";
import { etapas, activarEtapas, moverEtapa } from "../kit/etapas.js?v=19f4b98";
import { toast } from "../kit/avisos.js?v=19f4b98";
import { icono, rellenarIconos } from "../kit/iconos.js?v=19f4b98";
import { isotipo } from "../kit/marca.js?v=19f4b98";
import { pieza, activarPiezas, codigo } from "../kit/presentar.js?v=19f4b98";
import { contar } from "../kit/coreografia.js?v=19f4b98";
import { movimientoReducido } from "../kit/escenas/vigia.js?v=19f4b98";

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

function mapaEmpresa(svg) {
  const C = 200, nodos = new Map(), trabas = new Map();
  const capaOrb = svgEl("g", { class: "mapa__orbitas" }), capaFlujo = svgEl("g", { class: "mapa__flujos" }), capaNodos = svgEl("g"), capaGente = svgEl("g", { class: "mapa__gente" });
  [128, 172].forEach((r) => capaOrb.appendChild(svgEl("circle", { cx: C, cy: C, r, class: "mapa__orbita" })));
  const centro = svgEl("g", { class: "mapa__centro" });
  centro.innerHTML = `<g transform="translate(${C - 46} ${C - 46}) scale(.665)">${isotipo({ clase: "" }).replace(/<svg[^>]*>|<\/svg>/g, "")}</g><text class="mapa__nombre" x="${C}" y="${C + 62}" text-anchor="middle">Tu empresa</text>`;
  svg.append(capaOrb, capaGente, capaFlujo, capaNodos, centro);
  let gente = 0, t0 = performance.now(), raf = 0, vivo = false;
  const posNodo = (i, n, r, t) => { const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2 + t * 0.00006; return [C + Math.cos(a) * r, C + Math.sin(a) * r]; };
  const cuadro = () => {
    const t = reducido() ? 0 : performance.now() - t0;
    const lista = [...nodos.values()];
    lista.forEach((nd, i) => {
      const [x, y] = posNodo(i, lista.length, 172, t);
      nd.g.setAttribute("transform", `translate(${x} ${y})`);
      // la etiqueta del sistema siempre hacia afuera de la órbita
      const ux = (x - C) / 172, uy = (y - C) / 172, tx = nd.g.querySelector("text");
      tx.setAttribute("x", ux * 30); tx.setAttribute("y", uy * 30 + 4); tx.setAttribute("text-anchor", ux > 0.35 ? "start" : ux < -0.35 ? "end" : "middle");
      nd.flujo.setAttribute("d", `M${x} ${y} Q ${(x + C) / 2 + (y - C) * 0.25} ${(y + C) / 2 - (x - C) * 0.25} ${C} ${C}`);
      if (nd.dato) { const L = nd.flujo.getTotalLength(), k = ((t / 2400) + i * 0.37) % 1; const p = nd.flujo.getPointAtLength(L * k); nd.dato.setAttribute("cx", p.x); nd.dato.setAttribute("cy", p.y); }
    });
    [...trabas.values()].forEach((tr, i, arr) => {
      const [x, y] = posNodo(i + 0.5, arr.length, 128, -t * 0.6); tr.setAttribute("transform", `translate(${x} ${y})`);
      // la etiqueta del nudo, hacia adentro: así no se cruza con las de los sistemas
      const ux = (x - C) / 128, uy = (y - C) / 128, tx = tr.querySelector("text");
      tx.setAttribute("x", -ux * 16); tx.setAttribute("y", -uy * 16 + 4); tx.setAttribute("text-anchor", ux > 0.35 ? "end" : ux < -0.35 ? "start" : "middle");
    });
    if (vivo) raf = requestAnimationFrame(cuadro);
  };
  new IntersectionObserver(([e]) => { vivo = e.isIntersecting; if (vivo && !raf) raf = requestAnimationFrame(cuadro); if (!vivo) { cancelAnimationFrame(raf); raf = 0; } }).observe(svg);
  return {
    nombre(txt) { centro.querySelector(".mapa__nombre").textContent = txt || "Tu empresa"; },
    personas(n) {
      if (n === gente) return; gente = n; capaGente.innerHTML = "";
      const total = Math.min(60, Math.max(8, n));
      for (let i = 0; i < total; i++) { const a = (i / total) * Math.PI * 2, r = 82 + (i % 2) * 7; capaGente.appendChild(svgEl("circle", { cx: C + Math.cos(a) * r, cy: C + Math.sin(a) * r, r: 2.2, style: `--i:${i}` })); }
    },
    sistemas(lista) {
      for (const [k, nd] of nodos) if (!lista.includes(k)) { nd.g.classList.add("sale"); nd.flujo.remove(); setTimeout(() => nd.g.remove(), 500); nodos.delete(k); }
      for (const k of lista) if (!nodos.has(k)) {
        const [, nombre] = SISTEMAS.find((s) => s[0] === k);
        const g = svgEl("g", { class: "mapa__nodo" });
        g.innerHTML = `<circle r="17" class="mapa__nodo-disco"/><circle r="5.5" class="mapa__nodo-hueco"/><text>${nombre}</text>`;
        const flujo = svgEl("path", { class: "mapa__flujo" }), dato = svgEl("circle", { r: 3, class: "mapa__dato" });
        capaFlujo.append(flujo, dato); capaNodos.appendChild(g);
        nodos.set(k, { g, flujo, dato });
      }
      cuadro();
    },
    dolores(lista) {
      for (const [k, tr] of trabas) if (!lista.includes(k)) { tr.remove(); trabas.delete(k); }
      for (const k of lista) if (!trabas.has(k)) {
        const [, nombre] = DOLORES.find((d) => d[0] === k);
        const g = svgEl("g", { class: "mapa__traba" });
        g.innerHTML = `<circle r="3.4" cx="-5" cy="1"/><circle r="3.4" cx="2" cy="-4"/><circle r="3.4" cx="4" cy="4"/><text>${nombre}</text>`;
        capaNodos.appendChild(g); trabas.set(k, g);
      }
      cuadro();
    },
    ordenar() { svg.classList.add("mapa--ordenado"); },
  };
}

/* ═════════ Escalera de madurez ═════════ */
const PELDANOS = ["Ordenar", "Medir", "Conectar", "Automatizar", "Delegar"];
const SERVICIOS = [
  ["diagnostico", "Diagnóstico", "Medimos dónde se va el tiempo.", 1, [2, 4], "target"],
  ["memoria", "Memoria de la empresa", "Todo lo que sabe tu equipo, en un lugar (Medula).", 2, [4, 8], "brain"],
  ["crm", "CRM a medida", "Clientes, cotizaciones y seguimiento juntos.", 3, [6, 10], "users-three"],
  ["automatizaciones", "Automatizaciones", "Lo repetido se hace solo.", 4, [5, 9], "lightning"],
  ["agentes", "Equipo de agentes", "Agentes que atienden, ordenan y reportan.", 5, [8, 14], "robot"],
];

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
      <figure class="conv__mapa"><svg viewBox="-80 -30 560 460" role="img" aria-label="Mapa de tu empresa: se dibuja mientras respondes" data-mapa></svg><figcaption class="rotulo">Tu empresa, dibujada mientras respondes</figcaption></figure>
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

  /* ── Cotizador: la escalera de madurez se ilumina ── */
  async cotizacion(el) {
    const vivo = `<div class="cotizador" data-cotizador>
      <div class="cotizador__servicios"><p class="rotulo">Elige lo que te interesa</p>
        ${SERVICIOS.map(([k, n, d, p, , ico]) => `<button type="button" class="servicio ceramica" aria-pressed="false" data-servicio="${k}" data-peldano="${p}"><span class="servicio__ico">${icono(ico, { tam: 22 })}</span><span class="servicio__texto"><b>${n}</b><span class="chico">${d}</span></span><i class="servicio__check" aria-hidden="true"></i></button>`).join("")}</div>
      <div class="cotizador__escalera">
        <svg class="escalera" viewBox="0 0 520 330" role="img" aria-label="Escalera de madurez" data-escalera>
          ${PELDANOS.map((n, i) => { const x = 20 + i * 98, h = 50 + i * 48, y = 290 - h; return `<g class="peldano" data-p="${i + 1}"><path class="peldano__cara" d="M${x} ${y} h90 v${h} h-90 z"/><path class="peldano__tapa" d="M${x} ${y} l14 -14 h90 l-14 14 z"/><path class="peldano__lado" d="M${x + 90} ${y} l14 -14 v${h} l-14 14 z"/><text x="${x + 45}" y="314" text-anchor="middle">${n}</text><text class="peldano__n" x="${x + 12}" y="${y + 24}">${i + 1}</text></g>`; }).join("")}
          <circle class="escalera__punto" r="10" cx="0" cy="0"/>
        </svg>
        <div class="cotizador__estima"><div><span class="rotulo">Horas por semana recuperables</span><b data-estima-h>—</b></div><div><span class="rotulo">Llegas al peldaño</span><b data-estima-p>—</b></div><div><span class="rotulo">Plazo</span><b data-estima-s>—</b></div></div>
        <p class="chico">Estimaciones de ejemplo; la propuesta real sale del diagnóstico. Sin precios inventados.</p>
        ${boton("Pedir propuesta", { variante: "acento", icoFin: "arrow-right", attrs: "data-pedir disabled" })}
      </div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Se elige por resultado, no por tecnología.", "La escalera muestra hasta dónde llegas: el punto sube al peldaño más alto encendido.", "Nada de precios inventados: horas y plazos con rango y marcados como ejemplo."], 'escalera.encender(3); // ilumina hasta «Conectar»') });
    activarPiezas(el); await rellenarIconos();
    const raiz = el.querySelector("[data-cotizador]"), punto = raiz.querySelector(".escalera__punto");
    const ponerPunto = (p) => {
      const x = p ? 20 + (p - 1) * 98 + 52 : -30, y = p ? 290 - (50 + (p - 1) * 48) - 24 : 270;
      if (reducido()) { punto.setAttribute("cx", x); punto.setAttribute("cy", y); return; }
      const x0 = +punto.getAttribute("cx"), y0 = +punto.getAttribute("cy"), t0 = performance.now(), dur = 900;
      const paso = (ahora) => { const k = Math.min(1, (ahora - t0) / dur), e = 1 - Math.pow(1 - k, 4); punto.setAttribute("cx", x0 + (x - x0) * e); punto.setAttribute("cy", y0 + (y - y0) * e - Math.sin(k * Math.PI) * 40); if (k < 1) requestAnimationFrame(paso); };
      requestAnimationFrame(paso);
    };
    punto.setAttribute("cx", -30); punto.setAttribute("cy", 270);
    const recalcular = () => {
      const elegidos = SERVICIOS.filter(([k]) => raiz.querySelector(`[data-servicio="${k}"]`).getAttribute("aria-pressed") === "true");
      const max = Math.max(0, ...elegidos.map((s) => s[3]));
      raiz.querySelectorAll(".peldano").forEach((g) => g.classList.toggle("encendido", +g.dataset.p <= max));
      ponerPunto(max);
      const h0 = elegidos.reduce((a, s) => a + s[4][0], 0), h1 = elegidos.reduce((a, s) => a + s[4][1], 0);
      raiz.querySelector("[data-estima-h]").textContent = elegidos.length ? `${h0}–${h1} h` : "—";
      raiz.querySelector("[data-estima-p]").textContent = max ? `${max} · ${PELDANOS[max - 1]}` : "—";
      raiz.querySelector("[data-estima-s]").textContent = elegidos.length ? `${2 + elegidos.length}–${4 + elegidos.length * 2} semanas` : "—";
      raiz.querySelector("[data-pedir]").disabled = !elegidos.length;
    };
    raiz.querySelectorAll("[data-servicio]").forEach((b) => b.addEventListener("click", () => { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); recalcular(); }));
    raiz.querySelector("[data-pedir]").addEventListener("click", (e) => trabajar(e.currentTarget, () => espera(1200), { cargando: "Enviando…", listo: "Pedido" }));
  },

  /* ── Agendar: disponibilidad como densidad de puntos y una cinta de horas ── */
  async agendar(el) {
    const HOY = new Date(2026, 9, 12), MES = new Date(2026, 9, 1);
    const libres = (d) => { const dia = d.getDay(); if (dia === 0 || dia === 6 || d < HOY) return 0; return [1, 5, 3, 6, 2, 4, 6, 1, 5, 2][(d.getDate() * 7) % 10]; };
    const dias = []; const primero = (MES.getDay() + 6) % 7; for (let k = 0; k < primero; k++) dias.push(null);
    for (let d = 1; d <= 31; d++) dias.push(new Date(2026, 9, d));
    const vivo = `<div class="agenda" data-agenda>
      <div class="agenda__cal papel"><div class="agenda__mes"><b>Octubre 2026</b><span class="rotulo">Más puntos = más horas libres</span></div>
        <div class="agenda__semana" aria-hidden="true">${["L", "M", "M", "J", "V", "S", "D"].map((x) => `<span>${x}</span>`).join("")}</div>
        <div class="agenda__dias" role="group" aria-label="Días de octubre">${dias.map((d) => { if (!d) return `<span></span>`; const n = libres(d); return `<button type="button" class="agenda__dia" data-dia="${d.getDate()}" ${n ? "" : "disabled"} tabindex="-1" aria-label="${d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}${n ? `, ${n} horarios libres` : ", sin horarios"}"><span>${d.getDate()}</span><i class="agenda__puntos" style="--n:${n}">${"<i></i>".repeat(n)}</i></button>`; }).join("")}</div></div>
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
      const fecha = new Date(2026, 9, dia);
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
      l.innerHTML = `${listo({ tam: 56, texto: "Reunión agendada" })}<p class="chico">${new Date(2026, 9, dia).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })} a las ${hora} h. Te llega la invitación al correo.</p>`;
    });
    elegirDia(botones[0]);
  },

  /* ── Archivos: caen como puntos dentro del disco ── */
  async archivos(el) {
    const vivo = `<div class="caida" data-caida>
      <div class="caida__zona" data-zona tabindex="0" role="button" aria-label="Soltar archivos o presionar para elegirlos">
        <svg class="caida__disco" viewBox="0 0 240 240" aria-hidden="true">
          <circle class="caida__anillo-fondo" cx="120" cy="120" r="110"/><circle class="caida__anillo" cx="120" cy="120" r="110" pathLength="1" data-anillo/>
          <g transform="translate(51 51)">${isotipo({ clase: "" }).replace(/<svg[^>]*>|<\/svg>/g, "")}</g>
          <g data-caidos></g></svg>
        <div class="caida__texto"><b>Suelta tus planillas acá</b><span class="chico">o <u>elige archivos</u> · Excel, CSV o PDF · hasta 25 MB</span></div>
        <input type="file" multiple hidden data-input accept=".xlsx,.xls,.csv,.pdf">
      </div>
      <div class="caida__lista"><p class="rotulo">Archivos</p><ul data-lista><li class="chico caida__vacia">Aún nada. Prueba con los botones:</li></ul>
        <div class="fila-botones">${boton("Simular 3 planillas", { variante: "secundario", tam: "s", attrs: "data-sim=bien" })}${boton("Simular uno muy grande", { variante: "secundario", tam: "s", attrs: "data-sim=grande" })}</div></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Cada archivo cae como un punto dentro del disco; el anillo alrededor es el progreso total.", "El error rebota hacia afuera, con calma, y la fila dice qué hacer.", "Se puede soltar, hacer clic o usar el teclado (Enter)."], 'zona.addEventListener("drop", (e) => subir([...e.dataTransfer.files]));') });
    activarPiezas(el);
    const raiz = el.querySelector("[data-caida]"), zona = raiz.querySelector("[data-zona]"), input = raiz.querySelector("[data-input]"), lista = raiz.querySelector("[data-lista]"), caidos = raiz.querySelector("[data-caidos]"), anillo = raiz.querySelector("[data-anillo]");
    let total = 0, hechos = 0;
    const tam = (b) => b > 1e6 ? (b / 1e6).toFixed(1).replace(".", ",") + " MB" : Math.round(b / 1e3) + " kB";
    const subir = async (archivos, desde = null) => {
      lista.querySelector(".caida__vacia")?.remove(); anillo.style.opacity = 1;
      for (const [k, f] of archivos.entries()) {
        const malo = f.size > 25e6 ? "Pesa más de 25 MB. Divide el archivo o súbelo comprimido." : !/\.(xlsx|xls|csv|pdf)$/i.test(f.name) ? "Ese formato no se puede leer. Usa Excel, CSV o PDF." : "";
        total++;
        const li = document.createElement("li"); li.className = "archivo-fila"; li.innerHTML = `<span class="archivo-fila__ico">${icono(malo ? "warning-circle" : "files", { tam: 20 })}</span><span class="archivo-fila__nombre"><b>${f.name}</b><span class="chico">${malo || tam(f.size)}</span></span><span class="archivo-fila__estado" role="status">${malo ? "No se subió" : "Subiendo…"}</span><span class="archivo-fila__barra"><i></i></span>`;
        if (malo) li.classList.add("archivo-fila--error");
        lista.appendChild(li); await rellenarIconos();
        // el punto cae (o rebota)
        const a = 2 * Math.PI * Math.random(), x0 = desde ? desde.x : 120 + Math.cos(a) * 150, y0 = desde ? desde.y : -30;
        const p = svgEl("circle", { r: 6, cx: x0, cy: y0, class: malo ? "caida__punto caida__punto--error" : "caida__punto" });
        caidos.appendChild(p);
        const destino = malo ? { x: 120 + Math.cos(a) * 190, y: 120 + Math.sin(a) * 190 } : { x: 120 + Math.cos(a) * (14 + 30 * Math.random()), y: 120 + Math.sin(a) * (14 + 30 * Math.random()) };
        const via = malo ? [{ cx: x0, cy: y0 }, { cx: 120, cy: 60 }, { cx: destino.x, cy: destino.y }] : [{ cx: x0, cy: y0 }, { cx: destino.x, cy: destino.y }];
        if (!reducido()) {
          const t0 = performance.now(), dur = malo ? 1500 : 900;
          await new Promise((res) => { const paso = (ahora) => { const k = Math.min(1, (ahora - t0) / dur); const e = malo ? k : 1 - Math.pow(1 - k, 3);
            let x, y; if (via.length === 2) { x = via[0].cx + (via[1].cx - via[0].cx) * e; y = via[0].cy + (via[1].cy - via[0].cy) * e; } else { const u = 1 - e; x = u * u * via[0].cx + 2 * u * e * via[1].cx + e * e * via[2].cx; y = u * u * via[0].cy + 2 * u * e * via[1].cy + e * e * via[2].cy; }
            p.setAttribute("cx", x); p.setAttribute("cy", y); if (malo) p.setAttribute("opacity", 1 - Math.max(0, (k - 0.6) / 0.4));
            k < 1 ? requestAnimationFrame(paso) : res(); }; requestAnimationFrame(paso); });
        } else { p.setAttribute("cx", destino.x); p.setAttribute("cy", destino.y); }
        if (malo) { p.remove(); hechos++; }
        else {
          const barra = li.querySelector(".archivo-fila__barra i");
          for (let v = 0; v <= 100; v += 20) { barra.style.width = v + "%"; anillo.style.strokeDashoffset = 1 - (hechos + v / 100) / total; await espera(reducido() ? 0 : 120); }
          hechos++; li.querySelector(".archivo-fila__estado").textContent = "Listo"; li.classList.add("archivo-fila--listo");
        }
        anillo.style.strokeDashoffset = 1 - hechos / total;
        if (k < archivos.length - 1) await espera(140);
      }
      if (hechos === total) zona.classList.add("caida__zona--lleno");
    };
    const falso = (nombre, kb) => ({ name: nombre, size: kb * 1024 }); // archivos simulados: solo nombre y peso
    zona.addEventListener("click", () => input.click());
    zona.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    input.addEventListener("change", () => subir([...input.files]));
    zona.addEventListener("dragover", (e) => { e.preventDefault(); zona.classList.add("sobre"); });
    zona.addEventListener("dragleave", () => zona.classList.remove("sobre"));
    zona.addEventListener("drop", (e) => { e.preventDefault(); zona.classList.remove("sobre"); const r = zona.querySelector("svg").getBoundingClientRect(); subir([...e.dataTransfer.files], { x: ((e.clientX - r.left) / r.width) * 240, y: ((e.clientY - r.top) / r.height) * 240 }); });
    raiz.querySelector('[data-sim="bien"]').addEventListener("click", () => subir([falso("Cotizaciones 2026.xlsx", 840), falso("Clientes activos.csv", 126), falso("Inventario bodega 2.xlsx", 2300)]));
    raiz.querySelector('[data-sim="grande"]').addEventListener("click", () => subir([falso("Respaldo ERP completo.xlsx", 61000)]));
  },

  /* ── Encuesta: la NPS como órbitas ── */
  async encuesta(el) {
    const R = (n) => 32 + (10 - n) * 12;
    const caras = [["Muy mal", -10], ["Mal", -5], ["Regular", 0], ["Bien", 6], ["Muy bien", 11]];
    const vivo = `<div class="nps2" data-nps>
      <div class="nps2__escena"><svg viewBox="0 0 340 340" aria-hidden="true" data-nps-svg>${Array.from({ length: 11 }, (_, n) => `<circle class="nps2__orbita ${n >= 9 ? "nps2__orbita--promotor" : n <= 6 ? "nps2__orbita--detractor" : ""}" cx="170" cy="170" r="${R(n)}" data-o="${n}"/>`).join("")}
        <circle class="nps2__centro" cx="170" cy="170" r="22"/><circle class="nps2__hueco" cx="170" cy="170" r="7"/><circle class="nps2__punto" cx="170" cy="${170 - R(0) - 14}" r="9" data-nps-p/></svg></div>
      <div class="nps2__preguntas papel">
        <p class="conv__pregunta nps2__q" id="nps-q">¿Qué tan probable es que recomiendes Optimizo a un colega?</p>
        <div class="nps2__escala" role="radiogroup" aria-labelledby="nps-q">${Array.from({ length: 11 }, (_, n) => `<button type="button" role="radio" aria-checked="false" tabindex="${n ? -1 : 0}" data-n="${n}">${n}</button>`).join("")}</div>
        <div class="nps2__extremos rotulo"><span>Nada probable</span><span>Muy probable</span></div>
        <p class="chico nps2__sigue" data-sigue aria-live="polite">Elige un número: el punto se acerca al centro mientras más nos recomiendes.</p>
        <p class="rotulo">¿Y cómo te fue hoy?</p>
        <div class="caras" role="radiogroup" aria-label="Satisfacción">${caras.map(([t, c], i) => `<button type="button" role="radio" aria-checked="false" aria-label="${t}" class="cara" data-cara="${i}"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17"/><circle class="cara__ojo" cx="14" cy="16" r="2"/><circle class="cara__ojo" cx="26" cy="16" r="2"/><path d="M12 ${26 - c * 0.2} Q20 ${26 + c * 0.6} 28 ${26 - c * 0.2}"/></svg><span>${t}</span></button>`).join("")}</div>
      </div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["La nota mueve el punto: 10 lo deja en el centro, 0 lo deja en la órbita de afuera.", "La pregunta siguiente cambia según la nota (detractor, neutro, promotor).", "Caras dibujadas con el trazo de la marca, nunca emojis."], 'nps.addEventListener("cambio", (e) => guardar({ nps: e.detail }));') });
    activarPiezas(el);
    const raiz = el.querySelector("[data-nps]"), p = raiz.querySelector("[data-nps-p]"), botones = [...raiz.querySelectorAll(".nps2__escala button")];
    let pos = { x: 170, y: +p.getAttribute("cy") }, raf = 0;
    const llevar = (n) => {
      const a = -Math.PI / 2 + (n - 5) * 0.16, r = R(n), meta = { x: 170 + Math.cos(a) * r, y: 170 + Math.sin(a) * r };
      raiz.querySelectorAll(".nps2__orbita").forEach((o) => o.classList.toggle("activa", +o.dataset.o === n));
      if (reducido()) { pos = meta; p.setAttribute("cx", pos.x); p.setAttribute("cy", pos.y); return; }
      cancelAnimationFrame(raf); const v = { x: 0, y: 0 }; let prev = performance.now();
      const paso = (ahora) => { const dt = Math.min(0.033, (ahora - prev) / 1000); prev = ahora; const w = 9;
        for (const k of ["x", "y"]) { const ac = w * w * (meta[k] - pos[k]) - 2 * w * v[k]; v[k] += ac * dt; pos[k] += v[k] * dt; }
        p.setAttribute("cx", pos.x); p.setAttribute("cy", pos.y); if (Math.hypot(meta.x - pos.x, meta.y - pos.y) > 0.2) raf = requestAnimationFrame(paso); };
      raf = requestAnimationFrame(paso);
    };
    const elegir = (b) => {
      botones.forEach((x) => { const si = x === b; x.setAttribute("aria-checked", si); x.tabIndex = si ? 0 : -1; });
      const n = +b.dataset.n; llevar(n);
      raiz.dataset.tipo = n >= 9 ? "promotor" : n <= 6 ? "detractor" : "neutro";
      raiz.querySelector("[data-sigue]").textContent = n >= 9 ? "¡Gracias! ¿Qué fue lo que más te sirvió?" : n <= 6 ? "Gracias por decirlo. ¿Qué tendríamos que arreglar primero?" : "Gracias. ¿Qué nos falta para un 10?";
      raiz.dispatchEvent(new CustomEvent("cambio", { detail: n, bubbles: true }));
    };
    botones.forEach((b, i) => {
      b.addEventListener("click", () => elegir(b));
      b.addEventListener("keydown", (e) => { const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!d) return; e.preventDefault(); const s = botones[Math.max(0, Math.min(10, i + d))]; s.focus(); elegir(s); });
    });
    const caras2 = [...raiz.querySelectorAll(".cara")];
    caras2.forEach((c, i) => {
      c.addEventListener("click", () => caras2.forEach((x) => x.setAttribute("aria-checked", x === c)));
      c.addEventListener("keydown", (e) => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return; e.preventDefault(); const s = caras2[Math.max(0, Math.min(4, i + d))]; s.focus(); s.click(); });
    });
    caras2.forEach((c, i) => (c.tabIndex = i === 2 ? 0 : -1));
  },
};
