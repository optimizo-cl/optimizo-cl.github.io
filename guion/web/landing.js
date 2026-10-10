/* Sitio de Optimizo v2: armado SOLO con piezas del guion (Trama, isotipo 3D, Órbitas, kit de cerámica, cotizador, familia). */
import { logo, isotipo } from "../src/kit/marca.js";
import { icono, rellenarIconos, cargarIconos } from "../src/kit/iconos.js";
import { campo, validar, activarCampos } from "../src/kit/campos.js";
import { boton, trabajar, activarControles, prepararSegmentos } from "../src/kit/controles.js";
import { listo } from "../src/kit/punto.js";
import { trama } from "../src/kit/escenas/trama.js";
import { antesDespues, proceso } from "../src/kit/orbitas.js";
import { progreso } from "../src/kit/coreografia.js";
import { movimientoReducido } from "../src/kit/escenas/vigia.js";
import { formularios2 } from "../src/secciones/formularios2.js";
import { sello2, auroraMedula, medulaSVG } from "../src/secciones/familia2.js";

const $ = (s) => document.querySelector(s);
const tramo = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const suave = (x) => x * x * (3 - 2 * x);
activarCampos(); activarControles();
await cargarIconos(["list", "x", "arrow-right"]);
$("[data-logo]").innerHTML = await logo({ clase: "l-logo" });
$("[data-logo-pie]").innerHTML = await logo({ clase: "l-logo" });

/* ── Héroe: letras que se asientan, Trama de fondo y el 3D que llega en ocio ── */
const frase = $("[data-frase]"), texto = frase.textContent; let i = 0;
frase.innerHTML = `<span class="solo-lector">${texto}</span><span aria-hidden="true">${texto.split(" ").map((p) => `<b class="cin-palabra">${[...p].map((c) => `<span class="cin-letra" style="--i:${i++}">${c}</span>`).join("")}</b>`).join(" ")}</span>`;
requestAnimationFrame(() => $("[data-heroe]").classList.add("heroe--listo"));
const fondo = trama($(".l-heroe__trama"), { variante: "trama", mascara: 0.85, centro: [0.42, 0.02], paso: 12 });
let iso = null;
const traer3d = () => import("../src/kit/escenas/isotipo3d.js").then(({ isotipo3d }) => {
  const c = $(".l-heroe__3d"); iso = isotipo3d(c);
  if (c.classList.contains("sin-webgl")) $("[data-respaldo]").innerHTML = isotipo({ clase: "firma-escape" });
  else requestAnimationFrame(() => $("[data-heroe]").classList.add("heroe--3d"));
});
$("[data-respaldo]").innerHTML = isotipo({ clase: "firma-escape" });
(window.requestIdleCallback || ((f) => setTimeout(f, 300)))(traer3d, { timeout: 1500 });
progreso($(".l-heroe__pista"), (_, r) => {
  const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
  fondo.poner({ densidad: 1 - 0.8 * suave(tramo(p, 0.05, 0.9)), orden: suave(tramo(p, 0, 0.7)) });
  $(".l-heroe__trama").style.opacity = String(1 - suave(tramo(p, 0.55, 1)));
  iso?.fase(tramo(p, 0, 0.6));
  $("[data-heroe]").style.setProperty("--p", p.toFixed(3));
});

/* ── Caos → orden ── */
const orden = antesDespues($("[data-o-svg]"), { puntos: 120 });
const sec = $("[data-orden]"); let fase = -1;
const textos = [
  ["Hoy", "Tu empresa da vueltas sobre sí misma.", "Cotizaciones en planillas, clientes en WhatsApp, acuerdos en el correo de alguien. Todo funciona, pero en círculo.", "31 h", "2,5 días"],
  ["Con Optimizo", "Cada cosa encuentra su órbita.", "Medimos, ordenamos y conectamos. Lo que chocaba ahora gira en orden alrededor de la memoria de tu empresa.", "−19 h", "minutos"],
];
const ponerFase = (f) => { if (f === fase) return; fase = f; const [c, t, d, h, k] = textos[f]; $("[data-o-ceja]").textContent = c; $("[data-o-t]").textContent = t; $("[data-o-d]").textContent = d; $("[data-o-h]").textContent = h; $("[data-o-c]").textContent = k; sec.classList.toggle("l-orden--orden", f === 1); };
if (movimientoReducido()) { orden.orden(1); ponerFase(1); }
else progreso(sec, (_, r) => { const k = tramo(-r.top / Math.max(1, r.height - innerHeight), 0.15, 0.75); orden.orden(k); ponerFase(k > 0.5 ? 1 : 0); sec.style.setProperty("--k", k.toFixed(3)); });

/* ── Cómo trabajamos ── */
proceso($("[data-pista]"), [{ nombre: "Diagnóstico", ficha: ["2 semanas", "Medimos dónde se va el tiempo."] }, { nombre: "Implementación", ficha: ["4 a 8 semanas", "Lo dejamos funcionando."] }, { nombre: "Acompañamiento", ficha: ["Mensual", "Medimos y subimos el siguiente escalón."] }], { compacto: true });

/* ── Servicios ── */
const SERVICIOS = [["target", "Diagnóstico de procesos", "Mapa de cómo trabaja tu empresa y por dónde empezar."], ["users-three", "CRM a medida", "Clientes, cotizaciones y ventas en un solo lugar, hecho para tu proceso."], ["brain", "Memoria de la empresa", "Lo que sabe una persona, lo sabe la empresa (Medula)."], ["lightning", "Automatizaciones", "Lo repetido se hace solo y avisa cuando algo falla."], ["robot", "Equipos de agentes", "Agentes que atienden, ordenan y reportan con tus datos."]];
$("[data-servicios]").innerHTML = SERVICIOS.map(([ic, t, d], k) => `<article class="l-servicio2 ceramica" style="--i:${k}"><span class="l-servicio2__ico">${icono(ic, { tam: 24 })}</span><b class="titulo-3">${t}</b><p class="chico">${d}</p></article>`).join("");

/* ── Familia ── */
$("[data-medula]").innerHTML = `${await medulaSVG("l-producto__simbolo")}<div><b class="medula-palabra">Medula</b>${sello2("medula")}</div>`;
$("[data-sello-b]").innerHTML = sello2("barbara");
auroraMedula($(".l-producto__aurora"));

/* ── Cotizador: la misma pieza del guion, sin las pestañas del manual ── */
await formularios2.cotizacion($("[data-cotiza]"));
$("[data-cotiza] .pieza__pestanas")?.remove();
$("[data-cotiza] [data-vista='uso']")?.remove();

/* ── Cierre ── */
trama($(".l-cierre2__trama"), { variante: "anillos", mascara: 0.85, centro: [0.62, 0], fps: 30 });
const form = $("[data-form]");
form.innerHTML = `${campo("Nombre", { requerido: true, nombre: "nombre" })}${campo("Correo de trabajo", { tipo: "correo", requerido: true, nombre: "correo" })}${campo("Empresa", { requerido: true, nombre: "empresa" })}${boton("Agendar diagnóstico", { tipo: "submit", tam: "l", variante: "acento" })}<p class="rotulo">Respondemos en menos de un día hábil.</p>`;
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const malos = [...form.querySelectorAll("[data-tipo]")].filter((x) => !validar(x));
  if (malos.length) return malos[0].focus();
  await trabajar(form.querySelector("[type=submit]"), () => new Promise((r) => setTimeout(r, 1200)), { cargando: "Enviando…", listo: "Enviado" });
  form.innerHTML = `<div class="asistente__fin">${listo({ texto: "Listo, te escribimos hoy", tam: 64 })}</div>`;
});

/* ── Barra: se compacta al bajar; en celular, menú a pantalla completa ── */
const nav = $(".l-nav");
addEventListener("scroll", () => nav.classList.toggle("l-nav--compacta", scrollY > 24), { passive: true });
const bMenu = $("[data-menu-movil]");
bMenu.innerHTML = icono("list", { tam: 22 });
bMenu.addEventListener("click", () => {
  const abierto = nav.classList.toggle("l-nav--abierta");
  bMenu.innerHTML = icono(abierto ? "x" : "list", { tam: 22 }); bMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú"); bMenu.setAttribute("aria-expanded", abierto);
  document.body.style.overflow = abierto ? "hidden" : ""; rellenarIconos();
});
nav.querySelectorAll(".l-nav__links a").forEach((a) => a.addEventListener("click", () => { if (nav.classList.contains("l-nav--abierta")) bMenu.click(); }));
await rellenarIconos(); prepararSegmentos();
