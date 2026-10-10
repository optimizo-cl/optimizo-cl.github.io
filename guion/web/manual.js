/* Manual de marca imprimible: las mismas secciones del guion, una por hoja A4 apaisada. Se exporta a PDF con herramientas/exportar.mjs. */
import { identidad } from "../src/secciones/identidad.js";
import { manual } from "../src/secciones/manual.js";
import { isotipo, logo } from "../src/kit/marca.js";
import { cargarIconos, rellenarIconos } from "../src/kit/iconos.js";

const p = new URLSearchParams(location.search);
document.documentElement.dataset.paleta = p.get("paleta") || "teal";
const HOJAS = [
  ["concepto", "Concepto", identidad], ["manual-logo", "Construcción del logo", manual], ["logo", "Versiones del logo", identidad],
  ["usos-incorrectos", "Usos incorrectos", manual], ["manual-color", "Color para producción", manual], ["tipografia", "Tipografía", identidad],
  ["manual-tipo", "Tipografía para producción", manual], ["voz", "Voz y tono", manual], ["manual-imagen", "Imagen", manual],
];
const raiz = document.getElementById("manual");
await cargarIconos(["x-circle"]);
raiz.innerHTML = `<section class="tapa">${isotipo()}<div><p class="ceja">Manual de marca · ${p.get("paleta") === "naranjo" ? "Paleta B · Mandarina" : "Paleta A · Teal"}</p><h1>Todo proceso<br>tiene una salida.</h1><p class="bajada">Optimizo · octubre 2026 · versión de trabajo</p></div></section>` +
  HOJAS.map(([id, nombre], i) => `<section class="hoja"><section class="seccion" id="${id}"><div class="seccion__cabeza"><p class="ceja">Manual · ${String(i + 1).padStart(2, "0")}</p><h2 class="titulo-1">${nombre}</h2></div><div class="seccion__cuerpo"></div></section>
    <div class="hoja__pie"><span>Optimizo · Manual de marca</span><span>${i + 2}</span></div></section>`).join("");
for (const [id, , grupo] of HOJAS) await grupo[id](document.getElementById(id));
await rellenarIconos();
document.body.dataset.listo = "1";
