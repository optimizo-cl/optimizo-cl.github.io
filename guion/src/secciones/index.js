/* Secciones construidas (v2). Mientras una sección v1 no se rehace, se reusa bajo su id nuevo. */
import { identidad, REPINTAR_IDENTIDAD } from "./identidad.js";
import { identidad2, REPINTAR_IDENTIDAD2 } from "./identidad2.js";
import { escenas2 } from "./escenas2.js";
import { punto2 } from "./punto2.js";
import { kit2 } from "./kit2.js";
import { formularios2 } from "./formularios2.js";
import { orbitas2 } from "./orbitas2.js";
import { datos2, numeros2 } from "./datos2.js";
import { producto2 } from "./producto2.js";
import { familia2 } from "./familia2.js";
import { web2 } from "./web2.js";
import { manual2 } from "./manual2.js";
import { resto2, iconosApp2 } from "./resto2.js";
import { escenas } from "./escenas.js";
import { movimiento } from "./movimiento.js";
import { kit } from "./kit.js";
import { formularios } from "./formularios.js";
import { patrones } from "./patrones.js";
import { producto } from "./producto.js";
import { web } from "./web.js";
import { manual } from "./manual.js";
export { PORTADAS } from "./portadas.js";

const v1 = { ...identidad, ...escenas, ...movimiento, ...kit, ...formularios, ...patrones, ...producto, ...web, ...manual };

// ids v2 que todavía usan la versión v1 (se reemplazan ola por ola)
const renombres = {
  cargas: async (el) => { await v1.carga(el); const extra = document.createElement("div"); el.querySelector(".seccion__cuerpo").appendChild(extra); extra.className = "pila"; await v1.estados({ querySelector: (s) => (s === ".seccion__cuerpo" ? extra : extra.querySelector(s)) }); },
};
// lo que la app real va a reemplazar, o que se fusionó
const fuera = ["aura", "flujos", "nav-app", "sellos", "carga", "estados", "nav-celular", "nav-sitio", "paneles", "flujo-conecta"];

export const CONSTRUIDAS = Object.fromEntries(Object.entries({ ...v1, ...renombres, ...identidad2, ...escenas2, ...punto2, ...kit2, ...formularios2, ...orbitas2, ...datos2, ...producto2, ...familia2, landing: web2.landing, video: web2.video, presentacion: web2.presentacion, "error-404": web2["error-404"], redes: web2.redes(v1.redes), papeleria: web2.papeleria(v1.papeleria), "manual-logo": manual2["manual-logo"](v1["manual-logo"]), "movimiento-spec": manual2["movimiento-spec"], descargas: manual2.descargas, ...resto2, "iconos-app": iconosApp2(v1["iconos-app"]), numeros: numeros2(v1.numeros), logo: (el) => punto2.logo(el, v1.logo) }).filter(([k, v]) => v && !fuera.includes(k)));
export const REPINTAR = [...REPINTAR_IDENTIDAD.filter((x) => x !== "portada"), ...REPINTAR_IDENTIDAD2, "landing", "correos", "firma-correo", "manual-logo", "descargas"];

/** Marcador honesto de una sección que todavía no se construye. */
export function pendiente(sec) {
  return `<div class="pendiente mate"><p class="pendiente__que">${sec.contiene}</p><span class="estado">Ola ${sec.fase} · por hacer</span></div>`;
}
