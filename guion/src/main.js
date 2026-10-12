/* Guion v2: arma portada, portadas de capítulo, secciones, navegación lateral, dock, comparador A | B y modo presentación.
   Dos ejes: paleta (A/B) y tema (claro/oscuro). Las secciones se arman al acercarse. */
import { CAPITULOS, SECCIONES, seccionesDe, capituloDe, numeroDe } from "./plan.js?v=5bdbf1b";
import { CONSTRUIDAS, REPINTAR, pendiente, PORTADAS } from "./secciones/index.js?v=5bdbf1b";
import { icono, cargarIconos, rellenarIconos } from "./kit/iconos.js?v=5bdbf1b";
import { activarControles, prepararSegmentos } from "./kit/controles.js?v=5bdbf1b";
import { activarEtapas } from "./kit/etapas.js?v=5bdbf1b";
import { activarCampos } from "./kit/campos.js?v=5bdbf1b";
import { entrar, abrirEnCirculo, progreso } from "./kit/coreografia.js?v=5bdbf1b";
import { isotipo } from "./kit/marca.js?v=5bdbf1b";

for (const sec of SECCIONES) sec.estado = CONSTRUIDAS[sec.id] ? "listo" : "por-hacer";

const raiz = document.documentElement;
const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const params = new URLSearchParams(location.search);
const EMBEBIDO = params.has("embebido"); // dentro del comparador A | B
raiz.dataset.paleta = params.get("paleta") || leer("op-paleta") || "teal";
raiz.dataset.tema = params.get("tema") || leer("op-tema") || "claro";
if (EMBEBIDO) raiz.classList.add("embebido");

const app = document.getElementById("guion");

function portadaCapitulo(c) {
  const secs = seccionesDe(c.id).filter((x) => x.id !== "portada");
  return `<section class="cap-portada" id="cap-${c.id}" data-escena="${c.escena}" aria-labelledby="cap-${c.id}-t">
    <div class="cap-portada__escena" data-escena-de="${c.id}"></div>
    <div class="envoltura cap-portada__texto">
      <span class="cap-portada__n" aria-hidden="true">${c.n}</span>
      <div><p class="ceja">Capítulo ${c.n}</p><h2 class="cap-portada__nombre" id="cap-${c.id}-t">${c.nombre}</h2><p class="bajada">${c.que}</p>
        <p class="rotulo">${secs.filter((x) => x.id !== "portada").length} secciones</p></div>
    </div></section>`;
}

function seccionHTML(sec) {
  return `<section class="seccion" id="${sec.id}" data-estado="${sec.estado}"><div class="envoltura">
    <header class="sec-cabeza"><span class="sec-cabeza__n">${numeroDe(sec.id)}</span>
      <div><h2 class="titulo-1">${sec.nombre}</h2><p class="bajada">${sec.contiene}</p></div></header>
    <div class="seccion__cuerpo">${sec.estado === "por-hacer" ? pendiente(sec) : ""}</div>
  </div></section>`;
}

async function armar() {
  let html = `<header class="portada-envoltura" id="portada"></header>`;
  for (const c of CAPITULOS) {
    html += portadaCapitulo(c);
    for (const sec of seccionesDe(c.id)) if (sec.id !== "portada") html += seccionHTML(sec);
  }
  html += `<footer class="guion-pie envoltura">${isotipo({ clase: "guion-pie__iso" })}<p class="rotulo">Optimizo · guion visual v2 · todo proceso tiene una salida</p></footer>`;
  app.innerHTML = html;
  await pintarUna("portada");
  diferir();
  for (const c of CAPITULOS) {
    const el = document.getElementById(`cap-${c.id}`);
    abrirEnCirculo(el, { x: 18, y: 50 });
    PORTADAS[c.escena]?.(el.querySelector(".cap-portada__escena"));
  }
}

const pintadas = new Set();
async function pintarUna(id) {
  const el = document.getElementById(id), fn = CONSTRUIDAS[id];
  if (!el || pintadas.has(id)) return;
  pintadas.add(id);
  if (fn) { try { await fn(el); } catch (err) { console.error(`Sección ${id}:`, err); } }
  await rellenarIconos();
  prepararSegmentos(el); activarEtapas(el);
  const cuerpo = el.querySelector(".seccion__cuerpo");
  if (cuerpo && !el.hasAttribute("data-sin-entrada")) entrar(cuerpo);
  const cab = el.querySelector(".sec-cabeza"); if (cab) entrar(cab, ":scope > *");
}

function diferir() {
  const obs = new IntersectionObserver((entradas) => entradas.forEach((e) => { if (e.isIntersecting) { obs.unobserve(e.target); pintarUna(e.target.id); } }), { rootMargin: "150% 0px" });
  for (const sec of SECCIONES) { const el = document.getElementById(sec.id); if (el && !pintadas.has(sec.id)) obs.observe(el); }
  addEventListener("hashchange", () => pintarUna(location.hash.slice(1)));
}

async function pintar(solo) {
  for (const id of solo) {
    if (!pintadas.has(id) || !CONSTRUIDAS[id]) continue;
    try { await CONSTRUIDAS[id](document.getElementById(id)); } catch (err) { console.error(`Sección ${id}:`, err); }
  }
  await rellenarIconos();
}

/* ── Navegación lateral: capítulos, secciones y el punto como indicador de lectura ── */
function lateral() {
  const n = document.createElement("nav");
  n.className = "lateral"; n.setAttribute("aria-label", "Índice del guion");
  n.innerHTML = `<a class="lateral__marca" href="#portada">${isotipo({ clase: "lateral__iso" })}<span><b>Optimizo</b><span>guion visual</span></span></a>
    <div class="lateral__pista"><i class="lateral__punto"></i></div>
    <ol class="lateral__caps">${CAPITULOS.map((c) => `<li data-cap="${c.id}"><a href="#cap-${c.id}"><span>${c.n}</span>${c.nombre}</a>
      <ol>${seccionesDe(c.id).filter((x) => x.id !== "portada").map((x) => `<li><a href="#${x.id}" data-sec="${x.id}" data-estado="${x.estado}">${x.nombre}</a></li>`).join("")}</ol></li>`).join("")}</ol>`;
  document.body.appendChild(n);
  // el punto baja por la pista según lo leído
  const punto = n.querySelector(".lateral__punto");
  let raf = 0;
  addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const p = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); punto.style.setProperty("--p", p.toFixed(4)); }); }, { passive: true });
  // capítulo y sección actuales
  const obs = new IntersectionObserver((lista) => lista.forEach((e) => {
    if (!e.isIntersecting) return;
    const id = e.target.id, sec = SECCIONES.find((x) => x.id === id), cap = sec ? capituloDe(id) : CAPITULOS.find((c) => `cap-${c.id}` === id);
    n.querySelectorAll("[data-cap]").forEach((li) => li.classList.toggle("actual", li.dataset.cap === cap?.id));
    n.querySelectorAll("[data-sec]").forEach((a) => a.toggleAttribute("aria-current", a.dataset.sec === id));
    const donde = document.querySelector(".dock__donde");
    if (donde) { donde.querySelector("b").textContent = sec ? sec.nombre : cap ? cap.nombre : "Portada"; donde.querySelector("span").textContent = sec ? numeroDe(id) + " · " + cap.nombre : cap ? "Capítulo " + cap.n : "Guion visual"; }
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("#portada, .cap-portada, .seccion").forEach((s) => obs.observe(s));
}

/* ── Dock: dónde estoy, paleta, comparador, tema, presentación ── */
function dock() {
  const d = document.createElement("nav");
  d.className = "dock"; d.setAttribute("aria-label", "Controles del guion");
  d.innerHTML = `
    <button class="dock__boton dock__indice" data-indice aria-label="Índice">${icono("list")}</button>
    <div class="dock__donde" aria-live="polite"><b>Portada</b><span>Guion visual</span></div>
    <span class="dock__sep"></span>
    <button class="dock__boton" data-paleta="teal" aria-label="Paleta A · Teal"><i class="dock__muestra dock__muestra--a"></i><span class="solo-ancho">A</span></button>
    <button class="dock__boton" data-paleta="naranjo" aria-label="Paleta B · Mandarina"><i class="dock__muestra dock__muestra--b"></i><span class="solo-ancho">B</span></button>
    <button class="dock__boton" data-comparar aria-pressed="false" aria-label="Comparar A y B lado a lado" data-tip="Comparar A | B">${icono("columns")}</button>
    <span class="dock__sep"></span>
    <button class="dock__boton" data-tema-boton aria-label="Cambiar a modo oscuro">${icono("moon")}</button>
    <button class="dock__boton" data-presentar aria-pressed="false" aria-label="Modo presentación" data-tip="Presentar">${icono("presentation")}</button>`;
  document.body.appendChild(d);

  const marcar = () => {
    d.querySelectorAll("[data-paleta]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.paleta === raiz.dataset.paleta));
    const oscuro = raiz.dataset.tema === "oscuro", t = d.querySelector("[data-tema-boton]");
    t.innerHTML = icono(oscuro ? "sun" : "moon"); t.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  };
  d.addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.paleta) { raiz.dataset.paleta = b.dataset.paleta; guardar("op-paleta", b.dataset.paleta); comparador.actualizar(); }
    if (b.hasAttribute("data-tema-boton")) { raiz.dataset.tema = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro"; guardar("op-tema", raiz.dataset.tema); comparador.actualizar(); }
    if (b.hasAttribute("data-comparar")) b.setAttribute("aria-pressed", comparador.alternar());
    if (b.hasAttribute("data-presentar")) b.setAttribute("aria-pressed", presentacion.alternar());
    if (b.hasAttribute("data-indice")) document.querySelector(".lateral")?.classList.toggle("lateral--abierta");
    if (b.dataset.paleta || b.hasAttribute("data-tema-boton")) { marcar(); await pintar(REPINTAR); }
  });
  marcar();
}

/* ── Comparador A | B: la otra paleta en un marco encima, recortada por un divisor que se arrastra ── */
const comparador = (() => {
  let capa = null, marco = null, x = 0.5;
  const otra = () => (raiz.dataset.paleta === "naranjo" ? "teal" : "naranjo");
  // se sincroniza por sección (las alturas de las dos páginas pueden diferir mientras se arman)
  const sincronizar = () => { try {
    const w = marco?.contentWindow; if (!w?.document) return;
    const el = [...document.querySelectorAll("#guion > *")].find((e) => e.getBoundingClientRect().bottom > 0); if (!el) return;
    const t = w.document.getElementById(el.id); if (!t) return;
    w.scrollTo(0, t.getBoundingClientRect().top + w.scrollY - el.getBoundingClientRect().top);
  } catch {} };
  const recortar = () => { if (capa) { capa.style.setProperty("--x", x * 100 + "%"); } };
  return {
    alternar() {
      if (capa) { capa.remove(); capa = null; removeEventListener("scroll", sincronizar); return false; }
      capa = document.createElement("div");
      capa.className = "comparador";
      capa.innerHTML = `<iframe title="Paleta ${otra() === "naranjo" ? "B" : "A"}" tabindex="-1"></iframe>
        <div class="comparador__divisor" role="slider" aria-label="Divisor A | B" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0"><i></i></div>
        <span class="comparador__rotulo comparador__rotulo--izq">${raiz.dataset.paleta === "naranjo" ? "B · Mandarina" : "A · Teal"}</span><span class="comparador__rotulo comparador__rotulo--der">${otra() === "naranjo" ? "B · Mandarina" : "A · Teal"}</span>`;
      document.body.appendChild(capa);
      marco = capa.querySelector("iframe");
      marco.src = `${location.pathname}?embebido&paleta=${otra()}&tema=${raiz.dataset.tema}${location.hash}`;
      marco.addEventListener("load", () => { sincronizar(); marco.contentWindow.addEventListener("load", sincronizar); setTimeout(sincronizar, 1500); });
      addEventListener("scroll", sincronizar, { passive: true });
      const div = capa.querySelector(".comparador__divisor");
      const mover = (cx) => { x = Math.min(0.95, Math.max(0.05, cx / innerWidth)); div.setAttribute("aria-valuenow", Math.round(x * 100)); recortar(); };
      div.addEventListener("pointerdown", (e) => { div.setPointerCapture(e.pointerId); const m = (ev) => mover(ev.clientX); div.addEventListener("pointermove", m); div.addEventListener("pointerup", () => div.removeEventListener("pointermove", m), { once: true }); });
      div.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") mover((x - 0.05) * innerWidth); if (e.key === "ArrowRight") mover((x + 0.05) * innerWidth); });
      recortar();
      return true;
    },
    actualizar() { if (capa) { this.alternar(); this.alternar(); } },
  };
})();

/* ── Modo presentación: una sección por pantalla, flechas para avanzar, Esc para salir ── */
const presentacion = (() => {
  let activa = false;
  const piezas = () => [...document.querySelectorAll("#portada, .cap-portada, .seccion")];
  const actual = () => { const ps = piezas(); let mejor = 0; ps.forEach((p, i) => { if (p.getBoundingClientRect().top <= innerHeight * 0.4) mejor = i; }); return mejor; };
  const ir = (i) => { const ps = piezas(); const p = ps[Math.max(0, Math.min(ps.length - 1, i))]; pintarUna(p.id); p.scrollIntoView({ behavior: "smooth" }); };
  addEventListener("keydown", (e) => {
    if (!activa || e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); ir(actual() + 1); }
    if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); ir(actual() - 1); }
    if (e.key === "Escape") { document.querySelector("[data-presentar]")?.click(); }
  });
  return { alternar() { activa = !activa; raiz.classList.toggle("presentando", activa); if (activa) document.documentElement.requestFullscreen?.().catch(() => {}); else if (document.fullscreenElement) document.exitFullscreen?.(); return activa; } };
})();

activarControles();
document.addEventListener("vista", (e) => prepararSegmentos(e.target));
addEventListener("resize", () => prepararSegmentos());
document.fonts?.ready.then(() => prepararSegmentos());
activarCampos();
await cargarIconos(["list", "moon", "sun", "columns", "presentation"]);
await armar();
if (!EMBEBIDO) { lateral(); dock(); }
if (location.hash) { await pintarUna(location.hash.slice(1)); document.getElementById(location.hash.slice(1))?.scrollIntoView(); }
