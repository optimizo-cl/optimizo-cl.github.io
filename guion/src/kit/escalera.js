/* Escalera de Optimizo: UNA sola escalera para todo el guion (madurez, cotizador, sitio, propuestas).
   Cada peldaño es a la vez una etapa de madurez de la empresa y el servicio que la lleva ahí:
   Sin CRM → CRM a medida → Medula → Agentes → Departamentos. El punto de la marca salta en arco al peldaño que toca. */
import { icono } from "./iconos.js?v=7a04113";
import { movimientoReducido } from "./escenas/vigia.js?v=7a04113";

export const ESCALERA = [
  { k: "diagnostico", etapa: "Sin CRM", etapaD: "Ventas en planillas y WhatsApp. Nadie ve el total.", icoEtapa: "file-xls",
    servicio: "Diagnóstico", servicioD: "Medimos dónde se va el tiempo y por dónde empezar.", ico: "target", horas: [2, 4] },
  { k: "crm", etapa: "CRM a medida", etapaD: "Clientes, cotizaciones y ventas en un solo lugar.", icoEtapa: "kanban",
    servicio: "CRM a medida", servicioD: "Clientes, cotizaciones y seguimiento, hecho para tu proceso.", ico: "kanban", horas: [6, 10] },
  { k: "medula", etapa: "Medula", etapaD: "La empresa recuerda: correos, reuniones y acuerdos, buscables.", icoEtapa: "brain",
    servicio: "Medula", servicioD: "La memoria de la empresa: lo que sabe uno, lo sabe el equipo.", ico: "brain", horas: [4, 8] },
  { k: "agentes", etapa: "Agentes", etapaD: "Tareas repetitivas que ya no hace una persona.", icoEtapa: "robot",
    servicio: "Agentes", servicioD: "Lo repetido se hace solo y avisa cuando algo falla.", ico: "robot", horas: [5, 9] },
  { k: "departamentos", etapa: "Departamentos", etapaD: "Un equipo completo (por ejemplo, marketing) trabajando con el tuyo.", icoEtapa: "users-three",
    servicio: "Departamentos", servicioD: "Un equipo de agentes completo, como marketing con Bárbara.", ico: "users-three", horas: [8, 14] },
];

/** Marcado de la escalera. modo "madurez" (una etapa actual) o "servicios" (se eligen varios). */
export function escaleraHTML({ modo = "madurez" } = {}) {
  const servicios = modo === "servicios";
  return `<div class="escalera2__pasos" data-modo="${modo}">${ESCALERA.map((p, i) => `<button type="button" class="escalon2" style="--i:${i}" data-i="${i}" data-k="${p.k}" aria-pressed="false">
      <span class="escalon2__bloque ceramica"><span class="escalon2__n">${i + 1}</span>${icono(servicios ? p.ico : p.icoEtapa, { tam: 22 })}<span class="escalon2__falta" aria-hidden="true">+</span></span>
      <b>${servicios ? p.servicio : p.etapa}</b><span class="chico">${servicios ? p.servicioD : p.etapaD}</span></button>`).join("")}
    <i class="escalera2__punto" aria-hidden="true"></i></div>`;
}

/** Lleva el punto de la marca sobre el peldaño i (−1 = fuera, a la izquierda) con un salto en arco. */
export function moverPunto(pasos, i) {
  const punto = pasos.querySelector(".escalera2__punto"), base = pasos.getBoundingClientRect();
  const destino = () => {
    if (i < 0) { const b = pasos.querySelector(".escalon2__bloque").getBoundingClientRect(); return { x: b.left - base.left - 18, y: b.bottom - base.top - 12 }; }
    const r = pasos.querySelectorAll(".escalon2__bloque")[i].getBoundingClientRect();
    return { x: r.left - base.left + r.width / 2, y: r.top - base.top - 12 };
  };
  const meta = destino(), de = punto._pos || meta;
  cancelAnimationFrame(punto._raf);
  const poner = (p) => { punto._pos = p; punto.style.left = p.x + "px"; punto.style.top = p.y + "px"; };
  if (movimientoReducido() || !punto._pos) return poner(meta);
  const t0 = performance.now(), dur = 900, alto = 28 + Math.abs(meta.x - de.x) * 0.15;
  const paso = (ahora) => {
    const q = Math.min(1, (ahora - t0) / dur), e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
    poner({ x: de.x + (meta.x - de.x) * e, y: de.y + (meta.y - de.y) * e - alto * 4 * e * (1 - e) });
    if (q < 1) punto._raf = requestAnimationFrame(paso);
  };
  punto._raf = requestAnimationFrame(paso);
}
