/* Sitio de Optimizo v2: armado SOLO con piezas del guion (isotipo, etapas, kit de cerámica, cotizador, familia). */
import { logo, isotipo } from "../src/kit/marca.js?v=5bdbf1b";
import { icono, rellenarIconos, cargarIconos } from "../src/kit/iconos.js?v=5bdbf1b";
import { campo, validar, activarCampos } from "../src/kit/campos.js?v=5bdbf1b";
import { boton, trabajar, activarControles, prepararSegmentos } from "../src/kit/controles.js?v=5bdbf1b";
import { listo } from "../src/kit/punto.js?v=5bdbf1b";
import { orden as ordenar } from "../src/kit/orden.js?v=5bdbf1b";
import { etapas, activarEtapas, moverEtapa } from "../src/kit/etapas.js?v=5bdbf1b";
import { progreso } from "../src/kit/coreografia.js?v=5bdbf1b";
import { movimientoReducido } from "../src/kit/escenas/vigia.js?v=5bdbf1b";
import { formularios2 } from "../src/secciones/formularios2.js?v=5bdbf1b";
import { ESCALERA } from "../src/kit/escalera.js?v=5bdbf1b";
import { sello2, auroraMedula, medulaSVG } from "../src/secciones/familia2.js?v=5bdbf1b";

const $ = (s) => document.querySelector(s);
const tramo = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const suave = (x) => x * x * (3 - 2 * x);
activarCampos(); activarControles();
await cargarIconos(["list", "x", "arrow-right"]);
$("[data-logo]").innerHTML = await logo({ clase: "l-logo" });
$("[data-logo-pie]").innerHTML = await logo({ clase: "l-logo" });

/* ── Héroe: letras que se asientan y el isotipo con su firma ── */
const frase = $("[data-frase]"), texto = frase.textContent; let i = 0;
frase.innerHTML = `<span class="solo-lector">${texto}</span><span aria-hidden="true">${texto.split(" ").map((p) => `<b class="cin-palabra">${[...p].map((c) => `<span class="cin-letra" style="--i:${i++}">${c}</span>`).join("")}</b>`).join(" ")}</span>`;
requestAnimationFrame(() => $("[data-heroe]").classList.add("heroe--listo"));
$("[data-respaldo]").innerHTML = isotipo({ clase: "firma-escape", titulo: "" });
progreso($(".l-heroe__pista"), (_, r) => {
  const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
  $("[data-heroe]").style.setProperty("--p", p.toFixed(3));
});

/* ── Caos → orden ── */
const orden = ordenar($("[data-o-svg]"));
const sec = $("[data-orden]"); let fase = -1;
const textos = [
  ["Hoy", "Tu empresa da vueltas sobre sí misma.", "Cotizaciones en planillas, clientes en WhatsApp, acuerdos en el correo de alguien. Todo funciona, pero en círculo.", "31 h", "2,5 días"],
  ["Con Optimizo", "Cada cosa en su lugar.", "Medimos, ordenamos y conectamos: cada tarea con su área, su dueño y su estado.", "−19 h", "minutos"],
];
const ponerFase = (f) => { if (f === fase) return; fase = f; const [c, t, d, h, k] = textos[f]; $("[data-o-ceja]").textContent = c; $("[data-o-t]").textContent = t; $("[data-o-d]").textContent = d; $("[data-o-h]").textContent = h; $("[data-o-c]").textContent = k; sec.classList.toggle("l-orden--orden", f === 1); };
if (movimientoReducido()) { orden.orden(1); ponerFase(1); }
else progreso(sec, (_, r) => { const k = tramo(-r.top / Math.max(1, r.height - innerHeight), 0.15, 0.75); orden.orden(k); ponerFase(k > 0.5 ? 1 : 0); sec.style.setProperty("--k", k.toFixed(3)); });

/* ── Cómo trabajamos ── */
$("[data-pista]").innerHTML = etapas([{ nombre: "Diagnóstico", detalle: "2 semanas · conocemos a tu equipo y medimos dónde se va el tiempo." }, { nombre: "Implementación", detalle: "4 a 8 semanas · construimos y conectamos, empezando por lo que más duele." }, { nombre: "Acompañamiento", detalle: "mensual · capacitamos, medimos y subimos el siguiente escalón." }], { actual: 0, avance: 0, etiqueta: "Cómo trabajamos" });
activarEtapas($("[data-pista]"));
// al verse, el punto recorre las tres etapas una vez
new IntersectionObserver(async ([e], o) => { if (!e.isIntersecting) return; o.disconnect(); const et = $("[data-pista] [data-etapas]"); await new Promise((r) => setTimeout(r, 500)); await moverEtapa(et, 0, 1); await new Promise((r) => setTimeout(r, 700)); await moverEtapa(et, 1, 1); await new Promise((r) => setTimeout(r, 700)); await moverEtapa(et, 2, 0.5); }, { threshold: 0.5 }).observe($("[data-pista]"));

/* ── Servicios ── */
// los servicios son los peldaños de la escalera única de Optimizo (kit/escalera.js)
const SERVICIOS = ESCALERA.map((p) => [p.ico, p.servicio, p.servicioD]);
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
$("[data-iso-cierre]").innerHTML = isotipo({ clase: "firma-escape", titulo: "" });
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
