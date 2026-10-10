/* Capítulo 1 · Material y escenas (fase 5). */
import { marco, rejilla, ejemplo } from "../kit/guion.js?v=798d3f5";
import { aura } from "../kit/escenas/aura.js?v=798d3f5";
import { flujos } from "../kit/escenas/flujos.js?v=798d3f5";
import { isotipo } from "../kit/marca.js?v=798d3f5";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const vivas = new Map(); // una instancia viva por sección
const reemplazar = (id, inst) => { vivas.get(id)?.parar?.(); vivas.set(id, inst); };

export const escenas = {
  async material(el) {
    cuerpo(el).innerHTML = `
      <div class="material-controles mate">
        <label>Grano <input type="range" min="0" max="1" step="0.05" value="0.55" data-ctrl="opacidad"><output>0,55</output></label>
        <label>Tamaño <span class="segmento" role="group" aria-label="Tamaño del grano">
          <button data-tam="160">Fino</button><button data-tam="220" aria-pressed="true">Medio</button><button data-tam="320">Grueso</button></span></label>
      </div>
      <div class="superficies">
        <div class="superficie mate superficie--papel"><b>Papel</b><p class="chico">Fondo de páginas y tarjetas. Grano fino, plano, sin brillo.</p></div>
        <div class="superficie mate superficie--ceramica"><b>Cerámica</b><p class="chico">Piezas protagonistas: una luz suave de arriba y un canto apenas iluminado.</p></div>
        <div class="superficie superficie--hundida"><b>Hundida</b><p class="chico">Campos, zonas de arrastre, código. Más oscura y sin sombra.</p></div>
        <div class="superficie superficie--sin"><b>Sin grano (comparación)</b><p class="chico">Lo mismo, plano. Se ve digital y frío: por eso la marca lleva grano.</p></div>
      </div>
      ${rejilla([
        marco("Cómo se hace", `<ul class="lista-punto"><li>El grano vive <b>dentro</b> de cada superficie, detrás del contenido, y se mezcla con su color (soft-light).</li><li>No hay una capa de ruido encima de la página: el texto queda limpio.</li><li>Sin transparencias ni vidrio: la marca es mate.</li></ul>`),
        marco("Dónde no va", `<ul class="lista-punto"><li>Sobre fotos o capturas de pantalla.</li><li>En textos, íconos o bordes.</li><li>En correos (Outlook no lo pinta): ahí va plano.</li></ul>`),
      ])}`;
    const sup = el.querySelector(".superficies");
    const out = el.querySelector("output");
    el.querySelector('[data-ctrl="opacidad"]').addEventListener("input", (e) => { sup.style.setProperty("--grano-opacidad", e.target.value); out.textContent = String(e.target.value).replace(".", ","); });
    el.querySelectorAll("[data-tam]").forEach((b) => b.addEventListener("click", () => {
      el.querySelectorAll("[data-tam]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      sup.style.setProperty("--grano-tam", b.dataset.tam + "px");
    }));
  },

  async aura(el) {
    cuerpo(el).innerHTML = `
      <div class="aura-escena">
        <canvas class="aura-lienzo" aria-hidden="true"></canvas>
        <div class="aura-texto"><p class="ceja">Cierre de página</p><p class="titulo-1">Hablemos de tus procesos.</p>
          <p class="bajada">Treinta minutos para entender dónde se traba tu operación. Sin compromiso.</p></div>
      </div>
      <div class="material-controles mate">
        <label>Niveles <input type="range" min="3" max="14" step="1" value="9" data-ctrl="niveles"><output>9</output></label>
        <label>Grano <input type="range" min="1" max="3.5" step="0.1" value="1.5" data-ctrl="grano"><output>1,5</output></label>
      </div>
      <p class="chico">El grano <b>es</b> el degradado: el color se reparte en pocos niveles y cada grano elige el de arriba o el de abajo.
        El campo se mueve muy lento (30 cuadros por segundo, se duerme fuera de pantalla). Va en cierres, login y secciones destacadas; nunca detrás de texto largo.</p>`;
    const inst = aura(el.querySelector(".aura-lienzo"));
    reemplazar("aura", inst);
    el.querySelectorAll("[data-ctrl]").forEach((r) => r.addEventListener("input", () => {
      r.nextElementSibling.textContent = String(r.value).replace(".", ",");
      inst.poner?.({ [r.dataset.ctrl]: parseFloat(r.value) });
    }));
  },

  async flujos(el) {
    cuerpo(el).innerHTML = `
      <div class="flujos mate"><div class="flujos__lienzo"></div></div>
      <div class="flujos-pie">${ejemplo()}<p class="chico">Quillay: lo que hoy vive en WhatsApp, correos y planillas entra a su memoria (Medula) y de ahí lo usan los agentes y la gerencia.
        El punto recorre cada camino y enciende los nodos que toca.</p></div>`;
    reemplazar("flujos", flujos(el.querySelector(".flujos__lienzo")));
  },
};
