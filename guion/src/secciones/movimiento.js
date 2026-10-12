/* Capítulo 1 · Marca en movimiento (fase 6): la firma en sus siete momentos y la carga. */
import { marco, rejilla, ficha } from "../kit/guion.js?v=e33c371";
import { isotipo } from "../kit/marca.js?v=e33c371";
import { carga, cargaMarca, progreso, moverProgreso, listo, cursorPunto } from "../kit/punto.js?v=e33c371";
import { flujos } from "../kit/escenas/flujos.js?v=e33c371";
import { colorDe } from "../kit/color.js?v=e33c371";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
let guia = null;

export const movimiento = {
  async firma(el) {
    cuerpo(el).innerHTML = `
      ${rejilla([
        marco("1 · Portada", `<div class="momento">${isotipo({ clase: "momento__iso firma-escape" })}</div>`, { nota: "Sale por la mordida (1,6 s), espera, vuelve; el disco respira. Ciclo de 7 s." }),
        marco("2 · Carga", `<div class="momento">${cargaMarca({ tam: 120 })}</div>`, { nota: "Sale del nido, da la vuelta separado del disco y vuelve. 3,2 s por vuelta." }),
        marco("3 · Progreso", `<div class="momento momento--ancho">${progreso(["Datos", "Procesos", "Sistemas", "Resumen"], 1)}</div>
          <div class="momento__acciones"><button class="dock__boton" data-mover="-1">Atrás</button><button class="dock__boton" data-mover="1">Siguiente</button></div>`, { nota: "El punto viaja al paso actual con llegada larga (1,2 s) y deja encendido lo recorrido." }),
        marco("4 · Listo", `<div class="momento" data-listo>${listo({ texto: "Diagnóstico enviado" })}</div><div class="momento__acciones"><button class="dock__boton" data-repetir>Repetir</button></div>`, { nota: "El punto aterriza en su nido y el disco respira una vez. Solo en confirmaciones importantes." }),
        marco("5 · Guía", `<div class="momento momento--ancho momento--guia"></div>`, { nota: "En los diagramas, el punto recorre los caminos y enciende cada nodo.", ancho: true }),
        marco("6 · Viñeta e indicador", `<div class="momento momento--izq"><ul class="lista-punto"><li>Optimizo Recursos</li><li>Optimizo Tiempo</li><li>Optimizo Procesos</li></ul><p class="ceja">Activo</p></div>`, { nota: "Quieto. Color acento. En listas, cejas y estados activos." }),
        marco("7 · Cursor", `<div class="momento momento--cursor" style="cursor:${cursorPunto(colorDe("--navy"))}"><span class="chico">Pasa el mouse por acá</span></div>`, { nota: "Cursor del sistema con la forma del punto: lo dibuja el sistema operativo, así que no tiene retraso. Solo sobre zonas interactivas grandes." }),
      ])}
      <p class="titulo-3">Curvas y tiempos</p>
      <div class="tabla-mov mate">
        ${[["Llegada", "cubic-bezier(.16, 1, .3, 1)", "Todo lo que entra o llega a su lugar"], ["Suave", "cubic-bezier(.25, .1, .25, 1)", "Cambios de color, fundidos"], ["Respuesta", "160 ms", "Hover y presión"], ["Transición", "320 ms", "Menús, pestañas, segmentados"], ["Escena", "640 ms", "Hojas, diálogos, entradas de sección"], ["Recorrido", "1 200 ms", "Progreso, el punto viajando"], ["Firma", "1 600 ms", "El punto saliendo o aterrizando"]]
          .map(([n, v, u]) => `<div class="tabla-mov__fila"><b>${n}</b><span class="mono">${v}</span><span class="chico">${u}</span></div>`).join("")}
      </div>
      <p class="chico">Nada rebota ni es juguetón. Con «reducir movimiento» activado, el punto aparece directo en su destino.</p>`;

    const prog = el.querySelector(".progreso");
    el.querySelectorAll("[data-mover]").forEach((b) => b.addEventListener("click", () => {
      const n = prog.querySelectorAll("li").length;
      moverProgreso(prog, Math.max(0, Math.min(n - 1, +prog.dataset.actual + +b.dataset.mover)));
    }));
    el.querySelector("[data-repetir]").addEventListener("click", () => { el.querySelector("[data-listo]").innerHTML = listo({ texto: "Diagnóstico enviado" }); });
    guia?.parar(); guia = flujos(el.querySelector(".momento--guia"));
  },

  async carga(el) {
    cuerpo(el).innerHTML = `
      ${rejilla([
        marco("En línea y en botones", `<div class="cargas-fila">${[16, 20, 24, 32].map((t) => carga({ tam: t })).join("")}<span class="chico" style="display:inline-flex;gap:10px;align-items:center">${carga({ tam: 16 })} Guardando cambios…</span></div>`),
        marco("Pantalla de carga", `<div class="carga-pantalla">${cargaMarca({ tam: 112 })}<p class="chico">Preparando tu diagnóstico</p></div>`),
        marco("Espera larga (más de 4 s)", `<div class="carga-pantalla">${cargaMarca({ tam: 112, larga: true })}<p class="chico">Estamos leyendo 1.240 documentos. Puede tomar un minuto.</p></div>`, { nota: "La órbita se abre y el texto dice qué está pasando y cuánto falta." }),
        marco("Qué usar", `<ul class="lista-punto"><li><b>Menos de 1 s:</b> nada (no mostrar carga).</li><li><b>1–4 s:</b> carga chica en el botón o esqueleto en el contenido.</li><li><b>Más de 4 s:</b> carga de marca + qué está pasando.</li><li><b>Proceso largo:</b> progreso por pasos.</li></ul>`),
      ])}
      ${ficha({ que: "El punto como indicador de espera. La carga chica hereda el color del texto (anillo) y usa el acento (punto).", importar: 'import { carga, cargaMarca } from "./kit/punto.js?v=e33c371";', codigo: 'boton.innerHTML = carga({ tam: 16 }) + " Guardando…";\npantalla.innerHTML = cargaMarca({ tam: 112, larga: segundos > 4 });', reglas: ["Una sola carga por pantalla.", "Siempre con role=status y una etiqueta que diga qué se carga.", "Nunca un spinner genérico de terceros."] })}`;
  },
};
