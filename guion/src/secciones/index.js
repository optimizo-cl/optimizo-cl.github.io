/* Todas las secciones construidas, por capítulo. Una sección está «lista» si tiene su función acá. */
import { identidad, REPINTAR_IDENTIDAD } from "./identidad.js";
import { escenas } from "./escenas.js";
import { movimiento } from "./movimiento.js";
import { kit } from "./kit.js";
import { formularios } from "./formularios.js";
import { patrones } from "./patrones.js";
import { producto } from "./producto.js";
import { web } from "./web.js";
import { manual } from "./manual.js";

export const CONSTRUIDAS = { ...identidad, ...escenas, ...movimiento, ...kit, ...formularios, ...patrones, ...producto, ...web, ...manual };
export const REPINTAR = [...REPINTAR_IDENTIDAD, "firma", "landing", "correos", "firma-correo", "manual-logo", "descargas"];

/** Marcador honesto de una sección que todavía no se construye. */
export function pendiente(sec) {
  return `<div class="pendiente mate"><p class="pendiente__que">${sec.contiene}</p><span class="estado">Fase ${sec.fase} · por hacer</span></div>`;
}
