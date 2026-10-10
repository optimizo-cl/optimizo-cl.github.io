/* Landing de Optimizo construida SOLO con piezas del guion (kit, escenas, patrones). */
import { logo } from "../src/kit/marca.js";
import { icono, rellenarIconos, cargarIconos } from "../src/kit/iconos.js";
import { campo, validar, activarCampos } from "../src/kit/campos.js";
import { boton, trabajar } from "../src/kit/controles.js";
import { listo } from "../src/kit/punto.js";
import { isotipo } from "../src/kit/marca.js";
import { isotipo3d } from "../src/kit/escenas/isotipo3d.js";
import { aura } from "../src/kit/escenas/aura.js";
import { flujos } from "../src/kit/escenas/flujos.js";
import { sello } from "../src/secciones/producto.js";

activarCampos();
await cargarIconos(["list", "x"]);
document.querySelector("[data-logo]").innerHTML = await logo({ clase: "l-logo" });
document.querySelector("[data-logo-pie]").innerHTML = await logo({ clase: "l-logo" });
document.querySelector("[data-sello]").innerHTML = sello({ claro: true });

// Héroe: isotipo 3D (respaldo plano si no hay WebGL)
const c3d = document.querySelector(".l-hero__3d");
isotipo3d(c3d);
if (c3d.classList.contains("sin-webgl")) document.querySelector("[data-respaldo]").innerHTML = isotipo({ clase: "firma-escape" });

flujos(document.querySelector("[data-flujos]"));
aura(document.querySelector(".l-cierre__aura"));

const SERVICIOS = [["magnifying-glass", "Diagnóstico de procesos", "Mapa de cómo trabaja tu empresa y por dónde empezar."], ["kanban", "CRM a medida", "Clientes, cotizaciones y ventas en un solo lugar, hecho para tu proceso."], ["brain", "Medula", "La memoria de la empresa, conectada a tus sistemas."], ["users-three", "Equipos de agentes", "Un departamento completo trabajando con el tuyo."], ["flow-arrow", "Flujos comerciales", "WhatsApp, llamadas y seguimiento que no se pierden."], ["plugs-connected", "Integraciones", "Tu facturación, tu ERP y tus planillas, hablando entre sí."]];
document.querySelector("[data-servicios]").innerHTML = SERVICIOS.map(([ic, t, d]) => `<article class="mate l-servicio">${icono(ic, { tam: 28 })}<b class="titulo-3">${t}</b><p class="chico">${d}</p></article>`).join("");

const ESC = [["Sin CRM", "Planillas y WhatsApp"], ["CRM a medida", "Cotiza en minutos"], ["Medula", "La empresa recuerda"], ["Agentes", "Lo repetitivo, resuelto"]];
document.querySelector("[data-escalera]").innerHTML = `<ol class="l-escalera">${ESC.map(([t, d], i) => `<li class="${i === 1 ? "activo" : ""}"><span class="l-escalera__n">${i + 1}</span><b>${t}</b><span class="chico">${d}</span></li>`).join("")}</ol>
  <p class="chico">Una distribuidora industrial de 38 personas pasó de cotizar en 2,5 días a hacerlo en la misma conversación. Siguiente escalón: su memoria en Medula. <span class="ejemplo">Datos de ejemplo</span></p>`;

const form = document.querySelector("[data-form]");
form.innerHTML = `${campo("Nombre", { requerido: true })}${campo("Correo de trabajo", { tipo: "correo", requerido: true })}${campo("Empresa", { requerido: true })}${boton("Agendar diagnóstico", { tipo: "submit", tam: "l" })}<p class="rotulo">Respondemos en menos de un día hábil.</p>`;
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const malos = [...form.querySelectorAll("[data-tipo]")].filter((x) => !validar(x));
  if (malos.length) return malos[0].focus();
  await trabajar(form.querySelector("[type=submit]"), () => new Promise((r) => setTimeout(r, 1200)), { cargando: "Enviando…", listo: "Enviado" });
  form.innerHTML = `<div class="asistente__fin">${listo({ texto: "Listo, te escribimos hoy", tam: 64 })}</div>`;
});

// Barra: se compacta al bajar; en celular, menú a pantalla completa
const nav = document.querySelector(".l-nav");
addEventListener("scroll", () => nav.classList.toggle("l-nav--compacta", scrollY > 24), { passive: true });
const bMenu = document.querySelector("[data-menu-movil]");
bMenu.innerHTML = icono("list", { tam: 22 });
bMenu.addEventListener("click", () => {
  const abierto = nav.classList.toggle("l-nav--abierta");
  bMenu.innerHTML = icono(abierto ? "x" : "list", { tam: 22 }); bMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  document.body.style.overflow = abierto ? "hidden" : "";
});
nav.querySelectorAll(".l-nav__links a").forEach((a) => a.addEventListener("click", () => { if (nav.classList.contains("l-nav--abierta")) bMenu.click(); }));
rellenarIconos();
