/* Capítulo 5 · Familia de marcas (ola 7). Optimizo es la madre mate; cada producto conserva su material propio
   (Medula: cobalto, aurora de grano, Geist; Bárbara: noche, lima, Fraunces y su personaje). Los une el punto y el sello. */
import { pieza, activarPiezas, codigo } from "../kit/presentar.js";
import { isotipo } from "../kit/marca.js";
import { icono, rellenarIconos } from "../kit/iconos.js";
import { boton } from "../kit/controles.js";
import { toast } from "../kit/avisos.js";
import { movimientoReducido } from "../kit/escenas/vigia.js";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const usoDe = (lista, cod) => `<div class="rejilla-2"><ul class="lista-punto">${lista.map((r) => `<li>${r}</li>`).join("")}</ul>${cod ? codigo(cod) : ""}</div>`;
let simboloMedula = null;
const medulaSVG = async (clase = "") => {
  simboloMedula ||= await (await fetch(new URL("../../assets/productos/medula-marca.svg", import.meta.url))).text();
  return simboloMedula.replace("<svg ", `<svg class="${clase}" `).replace('role="img" aria-label="Medula"', 'aria-hidden="true"');
};
/** El sello «de Optimizo»: isotipo mínimo + texto. tono: "" (sobre claro) · "claro" (sobre oscuro) · "medula" · "barbara". */
export const sello2 = (tono = "") => `<span class="sello2 ${tono ? "sello2--" + tono : ""}">${isotipo({ clase: "sello2__iso", titulo: "" }).replace('role="img" aria-label=""', 'aria-hidden="true"')}<span>de Optimizo</span></span>`;

/** Aurora de Medula: el degradado cobalto hecho de grano (cada píxel elige el tono de arriba o el de abajo).
    La luz vive arriba a la derecha; abajo a la izquierda, donde va el texto, manda el núcleo. Canvas 2D a 1:1, lento. */
function auroraMedula(lienzo) {
  const ctx = lienzo.getContext("2d"); if (!ctx) return;
  const C = [[1, 52, 180], [1, 62, 204], [8, 83, 224], [27, 117, 253], [99, 167, 252], [198, 223, 253]];
  let w = 0, h = 0, img, umbral, raf = 0, visible = false, ultimo = 0;
  const ajustar = () => {
    w = Math.max(1, Math.round(lienzo.clientWidth)); h = Math.max(1, Math.round(lienzo.clientHeight));
    lienzo.width = w; lienzo.height = h; img = ctx.createImageData(w, h);
    umbral = new Float32Array(w * h); for (let i = 0; i < umbral.length; i++) umbral[i] = Math.random();
  };
  const cuadro = (t) => {
    const d = img.data, cx = w * (0.86 + Math.sin(t * 0.00022) * 0.05), cy = h * (0.08 + Math.cos(t * 0.00018) * 0.08), R = Math.hypot(w, h) * 0.78, n = C.length - 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, dx = (x - cx) / R, dy = ((y - cy) * 1.3) / R;
      let v = 1 - Math.sqrt(dx * dx + dy * dy); v = v < 0 ? 0 : v; v = Math.min(0.999, Math.pow(v, 1.6)) * n;
      const b = v | 0, c = C[b + (v - b > umbral[i] ? 1 : 0)];
      d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };
  const tic = (ahora) => { raf = 0; if (ahora - ultimo > 140) { ultimo = ahora; cuadro(ahora); } if (visible && !movimientoReducido()) raf = requestAnimationFrame(tic); };
  ajustar(); cuadro(0);
  new ResizeObserver(() => { ajustar(); cuadro(performance.now()); }).observe(lienzo);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tic); }).observe(lienzo);
}

export const familia2 = {
  /* ── Arquitectura: la madre mate y los productos en órbita, unidos por el punto ── */
  async familia(el) {
    const vivo = `<div class="familia2">
      <svg class="familia2__orbitas" viewBox="0 0 1000 560" aria-hidden="true"><ellipse cx="500" cy="300" rx="420" ry="190"/><ellipse cx="500" cy="300" rx="300" ry="120"/>
        <path id="fam-arco-a" d="M500 300 Q 330 140 190 250"/><path id="fam-arco-b" d="M500 300 Q 670 140 810 250"/>
        <circle r="7" cx="0" cy="0" class="familia2__dato"><animateMotion dur="5s" repeatCount="indefinite" path="M500 300 Q 330 140 190 250"/></circle>
        <circle r="7" class="familia2__dato" opacity="0"><set attributeName="opacity" to="1" begin="2.5s"/><animateMotion dur="5s" begin="2.5s" repeatCount="indefinite" path="M500 300 Q 670 140 810 250"/></circle></svg>
      <div class="familia2__madre ceramica"><div class="familia2__iso">${isotipo({ clase: "firma-escape" })}</div><b>Optimizo</b><span class="chico">La madre: mate, cerámica, el punto.</span></div>
      <div class="familia2__hijo familia2__hijo--medula"><canvas class="familia2__aurora" aria-hidden="true"></canvas>${await medulaSVG("familia2__simbolo")}<b class="medula-palabra">Medula</b>${sello2("medula")}</div>
      <div class="familia2__hijo familia2__hijo--barbara"><img src="assets/productos/barbara-avatar.webp" alt="" class="familia2__avatar" width="92" height="92"><b class="barbara-palabra">BÁRBARA</b>${sello2("barbara")}</div>
      <div class="familia2__hijo familia2__hijo--proximo"><span class="familia2__vacio" aria-hidden="true"></span><b>Lo que viene</b><span class="chico">Cada producto nuevo entra con su material y el sello.</span></div>
    </div>
    <div class="familia2__reglas">${[["Material propio", "Cada producto conserva su color, su letra y su forma. Optimizo no los pinta de teal ni de mandarina."], ["El punto los une", "El sello «de Optimizo» y el punto aparecen en todos: es el apellido."], ["La madre se retira", "En la pantalla de un producto, Optimizo es solo el sello: no compite."]].map(([t, d], i) => `<div class="familia2__regla"><span class="familia2__n">0${i + 1}</span><b>${t}</b><span class="chico">${d}</span></div>`).join("")}</div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Arquitectura de marcas «respaldada»: el producto manda, Optimizo respalda con el sello.", "En comunicación corporativa (sitio, propuestas) Optimizo manda y los productos aparecen como su familia.", "Nunca se mezclan materiales: nada de aurora en piezas de Optimizo ni cerámica en Medula."]) });
    activarPiezas(el);
    auroraMedula(el.querySelector(".familia2__aurora"));
    if (movimientoReducido()) el.querySelectorAll("animateMotion").forEach((a) => a.remove());
  },

  /* ── Medula · de Optimizo: su sistema real ── */
  async medula(el) {
    const tonos = [["Núcleo", "#013ECC", "--medula-nucleo"], ["Médula", "#0853E0", "--medula-medula"], ["Impulso", "#1B75FD", "--medula-impulso"], ["Aire", "#63A7FC", "--medula-aire"], ["Bruma", "#C6DFFD", "--medula-bruma"], ["Hielo", "#F2F7FE", "--medula-hielo"], ["Tinta", "#06102E", "--medula-tinta"]];
    const vivo = `<div class="medula2">
      <div class="medula2__heroe"><canvas class="medula2__aurora" aria-hidden="true"></canvas>
        <div class="medula2__marca">${await medulaSVG("medula2__simbolo")}<div><b class="medula-palabra medula2__palabra">Medula</b>${sello2("medula")}</div></div>
        <p class="medula2__titular">La memoria de tu empresa, conectada a tu IA.</p>
        <button type="button" class="medula2__boton" data-medula-b>Probar Medula</button></div>
      <div class="medula2__interior" aria-label="Interior de Medula (ejemplo)">
        <div class="medula2__lado"><div class="medula2__lado-marca">${await medulaSVG("medula2__mini")}<b>Medula</b></div>${["Inicio", "Notas", "Cerebro", "Conectores"].map((t, i) => `<span class="medula2__nav ${i === 1 ? "activo" : ""}">${t}</span>`).join("")}</div>
        <div class="medula2__panel"><p class="medula2__ceja">NOTAS · 1.240</p><p class="medula2__h">Acuerdo de precios con Minera Los Bronces Sur</p><p class="medula2__p">Se mantiene el descuento de 8 % en rodamientos si el pedido supera los $ 4.000.000.</p><span class="medula2__chip">Correo · 12 sep</span></div>
      </div>
      <div class="medula2__tonos">${tonos.map(([n, h, v]) => `<div class="medula2__tono" style="--c:var(${v})"><i></i><b>${n}</b><span class="mono">${h}</span></div>`).join("")}</div>
      <div class="medula2__reglas">${[["Aurora solo en la entrada", "Héroe, cierre y login. Adentro, blanco y plano, como una herramienta."], ["Geist, apretada", "La palabra en Geist 640 con −6,5 % de tracking. Etiquetas en Geist Mono."], ["Un solo botón azul", "Degradado #1468EE → núcleo, texto blanco. Uno por pantalla."], ["Texto azul legible", "Para letra se usa #0035B5; impulso y médula no pasan AA como texto."]].map(([t, d]) => `<div><b>${t}</b><span class="chico">${d}</span></div>`).join("")}</div>
    </div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Medula es la marca principal en su producto: Optimizo solo aparece como sello.", "El sello va bajo la palabra Medula, en blanco al 80 % sobre la aurora.", "Siempre «Medula», sin tilde."]) });
    activarPiezas(el);
    auroraMedula(el.querySelector(".medula2__aurora"));
    el.querySelector("[data-medula-b]").addEventListener("click", () => toast("Así se ve el botón de Medula: uno por pantalla."));
  },

  /* ── Bárbara · de Optimizo: su material real ── */
  async barbara(el) {
    const vivo = `<div class="barbara2">
      <div class="barbara2__heroe">
        <div class="barbara2__texto"><b class="barbara-palabra barbara2__palabra">BÁRBARA</b>${sello2("barbara")}<p class="barbara2__bajada">Tu agente de IA que impulsa tu marca cada semana.</p>
          <p class="barbara2__p">Aprende tu negocio, planifica el mes y te trae carruseles, historias y videos para aprobar antes de publicar.</p></div>
        <div class="barbara2__figura"><span class="barbara2__anillo" aria-hidden="true"></span><img src="assets/productos/barbara-personaje.webp" alt="Bárbara, dibujada en línea, trabajando en su computador" width="420" height="420" loading="lazy"><i class="barbara2__chispa" aria-hidden="true">✦</i></div>
      </div>
      <div class="barbara2__chat" aria-label="Bárbara pide aprobación (ejemplo)">
        <div class="barbara2__msj"><img src="assets/productos/barbara-avatar.webp" alt="" width="36" height="36"><div><b>Bárbara</b><p>Te dejé la semana lista: 3 carruseles y 2 historias para Quillay. ¿Apruebo el del martes?</p>
          <div class="barbara2__pieza"><span class="barbara2__mini">Carrusel · mar 14</span><b>5 errores al comprar rodamientos</b><span>6 láminas · con tus colores</span></div>
          <div class="barbara2__acciones"><button type="button" class="barbara2__si" data-b-si>Aprobar</button><button type="button" class="barbara2__no">Pedir cambios</button></div></div></div>
      </div>
      <div class="barbara2__tonos">${[["Noche", "#0A0A0B"], ["Lima", "#CDFB3E"], ["Lima clara", "#DFFF7B"], ["Hueso", "#F4F5EF"], ["Gris", "#A5A69D"]].map(([n, h]) => `<div class="barbara2__tono"><i style="background:${h}"></i><b>${n}</b><span class="mono">${h}</span></div>`).join("")}</div>
      <p class="barbara2__nota chico">El punto lima del computador de Bárbara es el mismo punto de Optimizo: así se reconoce la familia.</p>
    </div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: usoDe(["Siempre de noche, con lima como acento; titulares en Fraunces, interfaz en Inter.", "El personaje se dibuja en línea crema dentro de un anillo lima.", "Habla directo y cercano: primero la respuesta, párrafos cortos, una sola pregunta.", "El sello «de Optimizo» va en crema bajo la palabra BÁRBARA."]) });
    activarPiezas(el);
    el.querySelector("[data-b-si]").addEventListener("click", (e) => { e.currentTarget.textContent = "Aprobado ✓"; e.currentTarget.disabled = true; toast("Carrusel aprobado: se publica el martes a las 10:00."); });
  },
};
