/* Manual de marca imprimible: las mismas secciones del guion, una por hoja A4 apaisada. Se exporta a PDF con herramientas/exportar.mjs. */
import { identidad } from "../src/secciones/identidad.js?v=5bdbf1b";
import { manual } from "../src/secciones/manual.js?v=5bdbf1b";
import { isotipo, logo } from "../src/kit/marca.js?v=5bdbf1b";
import { cargarIconos, rellenarIconos } from "../src/kit/iconos.js?v=5bdbf1b";

const p = new URLSearchParams(location.search);
document.documentElement.dataset.paleta = p.get("paleta") || "teal";
import { manual2 } from "../src/secciones/manual2.js?v=5bdbf1b";
// grupos con divisor: [número, nombre, hojas]
const GRUPOS = [
  ["1", "La marca", [["concepto", "Concepto", identidad], ["manual-logo", "Construcción del logo", { "manual-logo": manual2["manual-logo"](manual["manual-logo"]) }], ["logo", "Versiones del logo", identidad], ["usos-incorrectos", "Usos incorrectos", manual]]],
  ["2", "Color y letra", [["manual-color", "Color para producción", manual], ["tipografia", "Tipografía", identidad], ["manual-tipo", "Tipografía para producción", manual]]],
  ["3", "Movimiento, voz e imagen", [["movimiento-spec", "Movimiento", manual2], ["voz", "Voz y tono", manual], ["manual-imagen", "Imagen", manual]]],
];
const HOJAS = GRUPOS.flatMap((g) => g[2]);
const raiz = document.getElementById("manual");
await cargarIconos(["x-circle"]);
let n = 1;
const hoja = ([id, nombre]) => `<section class="hoja"><section class="seccion" id="${id}"><div class="seccion__cabeza"><p class="ceja">Manual · ${String(n).padStart(2, "0")}</p><h2 class="titulo-1">${nombre}</h2></div><div class="seccion__cuerpo"></div></section>
    <div class="hoja__pie"><span>Optimizo · Manual de marca</span><span>${++n}</span></div></section>`;
raiz.innerHTML = `<section class="tapa ceramica ceramica--navy">${isotipo()}<div><p class="ceja">Manual de marca · ${p.get("paleta") === "naranjo" ? "Paleta B · Mandarina" : "Paleta A · Teal"}</p><h1>Todo proceso<br>tiene una salida.</h1></div>
  <div class="tapa__pie"><span>Optimizo · guion visual v2</span><span>Octubre 2026</span></div></section>` +
  GRUPOS.map(([num, nombre, hojas]) => `<section class="divisor"><span class="divisor__n">${num}</span><h2>${nombre}</h2></section>${hojas.map(hoja).join("")}`).join("");
for (const [id, , grupo] of HOJAS) await grupo[id](document.getElementById(id));
await rellenarIconos();
document.body.dataset.listo = "1";
