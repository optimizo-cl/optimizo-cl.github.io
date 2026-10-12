/* Secciones construidas (v2). Mientras una sección v1 no se rehace, se reusa bajo su id nuevo. */
import { identidad, REPINTAR_IDENTIDAD } from "./identidad.js?v=8ed8960";
import { identidad2, REPINTAR_IDENTIDAD2 } from "./identidad2.js?v=8ed8960";
import { escenas2 } from "./escenas2.js?v=8ed8960";
import { punto2 } from "./punto2.js?v=8ed8960";
import { kit2 } from "./kit2.js?v=8ed8960";
import { formularios2 } from "./formularios2.js?v=8ed8960";
import { formularios3 } from "./formularios3.js?v=8ed8960";
import { datos2, numeros2 } from "./datos2.js?v=8ed8960";
import { producto2 } from "./producto2.js?v=8ed8960";
import { familia2 } from "./familia2.js?v=8ed8960";
import { web2 } from "./web2.js?v=8ed8960";
import { manual2 } from "./manual2.js?v=8ed8960";
import { resto2, iconosApp2 } from "./resto2.js?v=8ed8960";
import { escenas } from "./escenas.js?v=8ed8960";
import { movimiento } from "./movimiento.js?v=8ed8960";
import { kit } from "./kit.js?v=8ed8960";
import { formularios } from "./formularios.js?v=8ed8960";
import { patrones } from "./patrones.js?v=8ed8960";
import { producto } from "./producto.js?v=8ed8960";
import { web } from "./web.js?v=8ed8960";
import { manual } from "./manual.js?v=8ed8960";
export { PORTADAS } from "./portadas.js?v=8ed8960";

const v1 = { ...identidad, ...escenas, ...movimiento, ...kit, ...formularios, ...patrones, ...producto, ...web, ...manual };

// ids v2 que todavía usan la versión v1 (se reemplazan ola por ola)
const renombres = {
  cargas: async (el) => { await v1.carga(el); const extra = document.createElement("div"); el.querySelector(".seccion__cuerpo").appendChild(extra); extra.className = "pila"; await v1.estados({ querySelector: (s) => (s === ".seccion__cuerpo" ? extra : extra.querySelector(s)) }); },
};
// lo que la app real va a reemplazar, lo que se fusionó y lo que Max sacó (3D, Trama, Órbitas: son de Medula, no de Optimizo)
const fuera = ["isotipo-3d", "trama", "orbitas", "busqueda", "aura", "flujos", "nav-app", "sellos", "carga", "estados", "nav-celular", "nav-sitio", "paneles", "flujo-conecta"];

export const CONSTRUIDAS = Object.fromEntries(Object.entries({ ...v1, ...renombres, ...identidad2, ...escenas2, ...punto2, ...kit2, ...formularios2, ...formularios3, ...datos2, ...producto2, ...familia2, landing: web2.landing, video: web2.video, presentacion: web2.presentacion, "error-404": web2["error-404"], redes: web2.redes(v1.redes), papeleria: web2.papeleria(v1.papeleria), "manual-logo": manual2["manual-logo"](v1["manual-logo"]), "movimiento-spec": manual2["movimiento-spec"], descargas: manual2.descargas, ...resto2, "iconos-app": iconosApp2(v1["iconos-app"]), numeros: numeros2(v1.numeros), logo: (el) => punto2.logo(el, v1.logo) }).filter(([k, v]) => v && !fuera.includes(k)));
export const REPINTAR = [...REPINTAR_IDENTIDAD.filter((x) => x !== "portada"), ...REPINTAR_IDENTIDAD2, "landing", "correos", "firma-correo", "manual-logo", "descargas"];

/** Marcador honesto de una sección que todavía no se construye. */
export function pendiente(sec) {
  return `<div class="pendiente mate"><p class="pendiente__que">${sec.contiene}</p><span class="estado">Ola ${sec.fase} · por hacer</span></div>`;
}
