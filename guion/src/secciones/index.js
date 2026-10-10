/* Todas las secciones construidas, por capítulo. Una sección está «lista» si tiene su función acá. */
import { identidad, REPINTAR_IDENTIDAD } from "./identidad.js";

export const CONSTRUIDAS = { ...identidad };
export const REPINTAR = [...REPINTAR_IDENTIDAD];

/** Marcador honesto de una sección que todavía no se construye. */
export function pendiente(sec) {
  return `<div class="pendiente mate"><p class="pendiente__que">${sec.contiene}</p><span class="estado">Fase ${sec.fase} · por hacer</span></div>`;
}
