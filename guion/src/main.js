/* Arma el guion desde plan.js: índice, capítulos, secciones y dock. Dos ejes: paleta (A/B) y tema (claro/oscuro). */
import { CAPITULOS, SECCIONES, seccionesDe, capituloDe } from "./plan.js";
import { CONSTRUIDAS, REPINTAR, pendiente } from "./secciones/index.js";
import { icono, cargarIconos, rellenarIconos } from "./kit/iconos.js";
import { activarControles } from "./kit/controles.js";
import { activarCampos } from "./kit/campos.js";

// El estado sale de lo construido: no se escribe a mano
for (const sec of SECCIONES) sec.estado = CONSTRUIDAS[sec.id] ? "listo" : "por-hacer";

const raiz = document.documentElement;
const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const params = new URLSearchParams(location.search);
raiz.dataset.paleta = params.get("paleta") || leer("op-paleta") || "teal";
raiz.dataset.tema = params.get("tema") || leer("op-tema") || "claro";

const app = document.getElementById("guion");

function indiceHTML() {
  return `<section class="seccion" id="indice"><div class="envoltura">
    <div class="seccion__cabeza"><p class="ceja">Índice</p><h2 class="titulo-1">Siete capítulos</h2></div>
    <div class="indice">${CAPITULOS.map((c) => `
      <div class="indice__cap mate"><span class="capitulo__n">Capítulo ${c.n}</span><h3>${c.nombre}</h3>
        <ol>${seccionesDe(c.id).map((x) => `<li><a href="#${x.id}" data-estado="${x.estado}">${x.nombre}<i></i></a></li>`).join("")}</ol>
      </div>`).join("")}</div>
  </div></section>`;
}

function seccionHTML(sec) {
  const cap = capituloDe(sec.id);
  return `<section class="seccion" id="${sec.id}" data-estado="${sec.estado}"><div class="envoltura">
    <div class="seccion__cabeza"><p class="ceja">${cap.nombre} · ${sec.nombre}</p><h2 class="titulo-1">${sec.nombre}</h2>
      ${sec.estado === "por-hacer" ? "" : `<p class="bajada">${sec.contiene}</p>`}</div>
    <div class="seccion__cuerpo">${sec.estado === "por-hacer" ? pendiente(sec) : ""}</div>
  </div></section>`;
}

async function armar() {
  const portada = SECCIONES.find((x) => x.id === "portada");
  let html = `<header class="portada-envoltura" id="portada"></header>` + indiceHTML();
  for (const c of CAPITULOS) {
    html += `<div class="capitulo envoltura" id="cap-${c.id}"><span class="capitulo__n">Capítulo ${c.n}</span>
      <p class="capitulo__nombre">${c.nombre}</p><p class="bajada capitulo__que">${c.que}</p></div>`;
    for (const sec of seccionesDe(c.id)) if (sec !== portada) html += seccionHTML(sec);
  }
  app.innerHTML = html;
  await pintar();
}

/** Pinta las secciones construidas. Con `solo`, repinta únicamente las que leen tokens con JS. */
async function pintar(solo = null) {
  for (const [id, fn] of Object.entries(CONSTRUIDAS)) {
    if (solo && !solo.includes(id)) continue;
    const el = document.getElementById(id);
    if (el) {
      try { await fn(el); } catch (err) { console.error(`Sección ${id}:`, err); }
    }
  }
  await rellenarIconos();
}

/* ── Dock ── */
function dock() {
  const d = document.createElement("nav");
  d.className = "dock";
  d.setAttribute("aria-label", "Guion");
  d.innerHTML = `
    <a class="dock__boton" href="#indice" aria-label="Índice">${icono("list")}</a>
    <div class="dock__donde" aria-live="polite"><b>Portada</b><span>Guion visual</span></div>
    <span class="dock__sep"></span>
    <button class="dock__boton" data-paleta="teal" aria-label="Paleta A · Teal"><i class="dock__muestra" style="background:linear-gradient(90deg,#91CEC4,#387E80)"></i><span class="solo-ancho">A</span></button>
    <button class="dock__boton" data-paleta="naranjo" aria-label="Paleta B · Mandarina"><i class="dock__muestra" style="background:linear-gradient(90deg,#FFA05A,#EE560E)"></i><span class="solo-ancho">B</span></button>
    <span class="dock__sep"></span>
    <button class="dock__boton" data-tema-boton aria-label="Cambiar a modo oscuro">${icono("moon")}</button>`;
  document.body.appendChild(d);

  const marcar = () => {
    d.querySelectorAll("[data-paleta]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.paleta === raiz.dataset.paleta));
    const oscuro = raiz.dataset.tema === "oscuro";
    const t = d.querySelector("[data-tema-boton]");
    t.innerHTML = icono(oscuro ? "sun" : "moon");
    t.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  };
  d.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.paleta) { raiz.dataset.paleta = b.dataset.paleta; guardar("op-paleta", b.dataset.paleta); }
    if (b.hasAttribute("data-tema-boton")) { raiz.dataset.tema = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro"; guardar("op-tema", raiz.dataset.tema); }
    marcar();
    await pintar(REPINTAR);
  });
  marcar();

  // Dónde estoy: la sección que cruza la mitad de la pantalla
  const donde = d.querySelector(".dock__donde");
  const obs = new IntersectionObserver((entradas) => {
    for (const en of entradas) {
      if (!en.isIntersecting) continue;
      const sec = SECCIONES.find((x) => x.id === en.target.id);
      const cap = sec ? capituloDe(sec.id) : null;
      donde.querySelector("b").textContent = sec ? sec.nombre : en.target.id === "indice" ? "Índice" : "Portada";
      donde.querySelector("span").textContent = cap ? `${cap.n} · ${cap.nombre}` : "Guion visual";
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("#guion section, #guion header").forEach((s) => obs.observe(s));
}

activarControles();
activarCampos();
await cargarIconos(["list", "moon", "sun"]);
await armar();
dock();
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
