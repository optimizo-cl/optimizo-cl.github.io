/* Capítulo 1 · Órbitas (ola 6): el lenguaje de diagramas, con sus tres modos y su control de tiempo. */
import { sistema, proceso, antesDespues } from "../kit/orbitas.js";
import { pieza, activarPiezas, codigo } from "../kit/presentar.js";
import { segmento } from "../kit/controles.js";
import { icono, rellenarIconos } from "../kit/iconos.js";
import { ejemplo } from "../kit/guion.js";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");

export const QUILLAY = {
  centro: { nombre: "Medula", ficha: ["La memoria de Quillay", "Recibe lo que pasa en cada sistema y lo deja disponible para el equipo y los agentes."] },
  nodos: [
    { id: "whatsapp", nombre: "WhatsApp", peso: 3, estado: "lleno", ficha: ["Pedidos y consultas", "62 % de los pedidos llega por acá."] },
    { id: "crm", nombre: "CRM", peso: 3, estado: "lleno", ficha: ["Clientes y cotizaciones", "Cada cotización queda con su seguimiento."], enlaces: ["centro", "agente-v"] },
    { id: "correo", nombre: "Correo", peso: 2, estado: "lleno", ficha: ["Proveedores y licitaciones", "Se lee y se ordena solo."] },
    { id: "planillas", nombre: "Planillas", peso: 2, estado: "medio", tono: "alerta", ficha: ["Inventario en Excel", "Traba: dos bodegas, dos versiones."] },
    { id: "bsale", nombre: "Bsale", peso: 2, estado: "medio", ficha: ["Facturación", "Se conecta cada 15 minutos."] },
    { id: "gerencia", nombre: "Gerencia", peso: 1, estado: "lleno", ficha: ["Reporte del lunes", "Llega solo, con lo que cambió."] },
    { id: "agente-v", nombre: "Agente de ventas", peso: 1, estado: "lleno", ficha: ["Atiende en WhatsApp", "Cotiza con precios del CRM."], enlaces: ["centro", "whatsapp"] },
    { id: "agente-c", nombre: "Agente de cobranza", peso: 1, estado: "vacio", ficha: ["En preparación", "Usará Bsale y el correo."], enlaces: ["centro", "bsale"] },
  ],
};
export const COTIZAR = [
  { nombre: "Llega el pedido", ficha: ["WhatsApp o correo", "Hoy: se copia a mano."] },
  { nombre: "Se arma", traba: true, ficha: ["En planilla", "Traba: 1 de cada 4 se rehace."] },
  { nombre: "Aprobación", ficha: ["Gerencia comercial", "Mismo día."] },
  { nombre: "Se envía", ficha: ["PDF por correo", "Con plantilla."] },
  { nombre: "Seguimiento", traba: true, ficha: ["Por WhatsApp", "Traba: los clientes se enfrían."] },
  { nombre: "Venta", ficha: ["Factura en Bsale", "Cierra el ciclo."] },
];

export const orbitas2 = {
  async orbitas(el) {
    const vivo = `<div class="orbitas-banco">
      <div class="orbitas-banco__cabeza">${segmento(["Sistema", "Proceso", "Antes y después"], { etiqueta: "Tipo de diagrama", nombre: "modo-orb" })}${ejemplo()}</div>
      <div class="orbitas-banco__escena"><svg data-orb role="group" aria-label="Diagrama de órbitas: pasa sobre un nodo para ver su ficha; haz clic para trazar su ruta"></svg>
        <div class="orb-ficha papel" data-ficha hidden><b></b><span class="chico"></span></div></div>
      <div class="orbitas-banco__tiempo">
        <button type="button" class="boton boton--secundario boton--s boton--icono" data-pausa aria-label="Pausar">${icono("pause", { tam: 16 })}</button>
        <label class="orbitas-banco__reloj"><span class="rotulo" data-reloj-t>Tiempo</span><input type="range" min="0" max="100" value="0" data-reloj data-propio aria-label="Instante del diagrama"></label>
        ${segmento(["×0,5", "×1", "×2"], { activa: 1, etiqueta: "Velocidad", nombre: "vel-orb" })}
      </div></div>`;
    const anatomia = `<div class="orb-anatomia">${[
      ["Nodo", "Un disco con agujero, como el isotipo. Más grande = más importante.", '<svg viewBox="-30 -30 60 60"><circle r="20" class="orb-nodo__disco"/><circle r="6" class="orb-nodo__hueco"/></svg>'],
      ["Estado", "El anillo de afuera: lleno, medio o vacío. Se lee sin color.", '<svg viewBox="-30 -30 60 60"><circle r="24" class="orb-nodo__estado" stroke-dasharray="75 151" transform="rotate(-90)"/><circle r="18" class="orb-nodo__disco"/><circle r="5" class="orb-nodo__hueco"/></svg>'],
      ["Arco", "Las conexiones son órbitas, no curvas en S.", '<svg viewBox="0 0 80 50"><path d="M6 44 Q 40 -10 74 44" class="orb-arco"/></svg>'],
      ["Dato", "Un punto que viaja por el arco: lo que se mueve entre sistemas.", '<svg viewBox="0 0 80 50"><path d="M6 44 Q 40 -10 74 44" class="orb-arco"/><circle cx="40" cy="17" r="4" class="orb-dato"/></svg>'],
      ["Ruta", "Clic en un nodo: se encienden sus arcos y lo que toca.", '<svg viewBox="0 0 80 50"><path d="M6 44 Q 40 -10 74 44" class="orb-arco en-ruta"/></svg>'],
    ].map(([t, d, s]) => `<figure class="orb-anatomia__item">${s}<figcaption><b>${t}</b><span class="chico">${d}</span></figcaption></figure>`).join("")}</div>`;
    const uso = `<div class="rejilla-2"><ul class="lista-punto"><li><b>Sistema</b>: qué se conecta con qué (Medula al centro).</li><li><b>Proceso</b>: una pista con estaciones; las trabas van en ámbar con anillo a medias.</li><li><b>Antes y después</b>: el caos se ordena; sirve en propuestas e informes.</li><li>El mismo motor sirve en el diagnóstico, el sitio y las propuestas.</li></ul>
      ${codigo('import { sistema, proceso, antesDespues } from "@optimizo/ui/orbitas";\nconst d = sistema(svg, datos, { alFicha: mostrarFicha });\nd.pausa(); d.ir(4.2); // control de tiempo')}</div>`;
    cuerpo(el).innerHTML = pieza({ vivo, anatomia, uso });
    activarPiezas(el); await rellenarIconos();
    const svg = el.querySelector("[data-orb]"), ficha = el.querySelector("[data-ficha]"), escena = el.querySelector(".orbitas-banco__escena");
    const reloj = el.querySelector("[data-reloj]"), relojT = el.querySelector("[data-reloj-t]"), pausa = el.querySelector("[data-pausa]");
    const alFicha = (f, r) => {
      if (!f) { ficha.hidden = true; return; }
      ficha.querySelector("b").textContent = f.ficha?.[0] || f.nombre; ficha.querySelector("span").textContent = f.ficha?.[1] || "";
      ficha.hidden = false; const b = escena.getBoundingClientRect();
      ficha.style.left = Math.max(8, Math.min(b.width - ficha.offsetWidth - 8, r.left - b.left + r.width / 2 - ficha.offsetWidth / 2)) + "px";
      ficha.style.top = Math.max(8, r.top - b.top - ficha.offsetHeight - 12) + "px";
    };
    let d = null, modo = "Sistema";
    const montar = (m) => {
      modo = m; svg.innerHTML = ""; svg.className.baseVal = "";
      d = m === "Sistema" ? sistema(svg, QUILLAY, { alFicha }) : m === "Proceso" ? proceso(svg, COTIZAR, { alFicha }) : antesDespues(svg);
      relojT.textContent = m === "Antes y después" ? "Caos → orden" : "Tiempo";
      reloj.value = 0; reloj.style.setProperty("--p", "0%");
      if (m === "Antes y después") d.orden(0);
    };
    montar("Sistema");
    el.querySelector('[data-segmento="modo-orb"]').addEventListener("cambio", (e) => montar(e.detail));
    el.querySelector('[data-segmento="vel-orb"]').addEventListener("cambio", (e) => d.velocidad({ "×0,5": 0.5, "×1": 1, "×2": 2 }[e.detail]));
    pausa.addEventListener("click", () => { const quieto = d.pausa(); pausa.setAttribute("aria-label", quieto ? "Seguir" : "Pausar"); pausa.innerHTML = `${icono(quieto ? "play" : "pause", { tam: 16 })}`; rellenarIconos(); });
    reloj.addEventListener("input", () => {
      const v = +reloj.value / 100; reloj.style.setProperty("--p", reloj.value + "%");
      if (modo === "Antes y después") d.orden(v); else d.ir(v * d.periodo);
    });
    // el reloj sigue al tiempo cuando corre (4 veces por segundo basta)
    const seguir = setInterval(() => {
      if (!svg.isConnected) return clearInterval(seguir);
      if (d && modo !== "Antes y después" && document.activeElement !== reloj) { const v = ((d.t % d.periodo) / d.periodo) * 100; reloj.value = v; reloj.style.setProperty("--p", v + "%"); }
    }, 250);
  },
};
