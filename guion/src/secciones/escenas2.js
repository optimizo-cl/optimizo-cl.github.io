/* Capítulo 1 · Escenas v2 (ola 2): el héroe que se funde con el fondo, la Trama orbital y el isotipo 3D premium. */
import { progreso } from "../kit/coreografia.js";
import { pieza, activarPiezas, codigo } from "../kit/presentar.js";
import { segmento, deslizador } from "../kit/controles.js";
import { isotipo } from "../kit/marca.js";
import { trama } from "../kit/escenas/trama.js";
import { SECCIONES } from "../plan.js";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const vivas = new Map();
const reemplazar = (id, inst) => { vivas.get(id)?.parar?.(); vivas.set(id, inst); return inst; };
const tramo = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const suave = (x) => x * x * (3 - 2 * x);

/** Frase cinética: cada letra cae y se asienta; las palabras no se cortan. */
const frase = (txt, clase) => {
  let i = 0;
  return `<span class="solo-lector">${txt.replace(/\n/g, " ")}</span><span class="${clase}" aria-hidden="true">${txt.split("\n").map((linea) => `<span class="cin-linea">${linea.split(" ").map((p) => `<b class="cin-palabra">${[...p].map((c) => `<span class="cin-letra" style="--i:${i++}">${c}</span>`).join("")}</b>`).join(" ")}</span>`).join("")}</span>`;
};

export const escenas2 = {
  /* ── Héroe: Trama + isotipo 3D a pantalla completa. Al bajar, el 3D se aplana y viaja al isotipo de la
        navegación; la Trama pierde densidad hasta quedar convertida en el grano de la página. ── */
  async portada(el) {
    const listas = SECCIONES.filter((x) => x.estado === "listo").length;
    el.className = "heroe";
    el.innerHTML = `<div class="heroe__pista">
      <div class="heroe__escena">
        <canvas class="heroe__trama" aria-hidden="true"></canvas>
        <div class="heroe__hueco" aria-hidden="true"></div>
        <div class="heroe__objeto"><canvas class="heroe__3d" aria-label="Isotipo de Optimizo en 3D: arrástralo, tira del punto o haz doble clic"></canvas>
          <div class="heroe__respaldo">${isotipo({ clase: "firma-escape" })}</div></div>
        <div class="heroe__texto">
          <p class="ceja heroe__ceja">Guion visual · v2</p>
          <h1 class="heroe__frase">${frase("Todo proceso\ntiene una salida.", "heroe__letras")}</h1>
          <p class="bajada heroe__bajada">El lenguaje completo de Optimizo, funcionando: color, letra, material, movimiento, componentes, formularios y piezas.</p>
          <p class="rotulo heroe__estado"><i></i>${listas} de ${SECCIONES.length} secciones listas · se actualiza en cada avance</p>
        </div>
        <a class="heroe__bajar" href="#cap-identidad" aria-label="Bajar al capítulo 1"><span>Baja</span><i></i></a>
      </div></div>`;

    const hueco = el.querySelector(".heroe__hueco"), lienzoT = el.querySelector(".heroe__trama"), lienzo3 = el.querySelector(".heroe__3d"), objeto = el.querySelector(".heroe__objeto");
    const t = reemplazar("heroe-trama", trama(lienzoT, { variante: "trama", mascara: 0.85, centro: [0.42, 0.02], paso: 12 }));
    requestAnimationFrame(() => el.classList.add("heroe--listo"));

    let iso = null;
    // three.js no entra en la carga inicial: primero se ve el isotipo plano y el 3D lo reemplaza con un fundido
    const traer3d = () => import("../kit/escenas/isotipo3d.js").then(({ isotipo3d }) => {
      iso = reemplazar("heroe-3d", isotipo3d(lienzo3));
      if (!lienzo3.classList.contains("sin-webgl")) requestAnimationFrame(() => el.classList.add("heroe--3d"));
    });
    const ocioso = () => (window.requestIdleCallback ? requestIdleCallback(traer3d, { timeout: 1500 }) : setTimeout(traer3d, 300));
    document.readyState === "complete" ? ocioso() : addEventListener("load", ocioso, { once: true });

    // el recorrido: 0 → 1 mientras la pista (2 pantallas) pasa
    const pista = el.querySelector(".heroe__pista");
    const destino = () => document.querySelector(".lateral__iso");
    progreso(pista, (_, r) => {
      const h = innerHeight, p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - h)));
      const k = suave(tramo(p, 0.05, 0.9));
      t.poner({ densidad: 1 - 0.82 * k, orden: suave(tramo(p, 0, 0.7)) });
      lienzoT.style.opacity = String(1 - suave(tramo(p, 0.55, 1)));
      iso?.fase(tramo(p, 0, 0.6));
      // el objeto vive fijo sobre su hueco y, al bajar, viaja al isotipo de la navegación (si se ve) achicándose
      const hu = hueco.getBoundingClientRect();
      Object.assign(objeto.style, { left: hu.left + "px", top: hu.top + "px", width: hu.width + "px", height: hu.height + "px" });
      let dx = 0, dy = -h * 0.45, esc = 0.2;
      const b = destino()?.getBoundingClientRect();
      if (b && b.width) { dx = b.left + b.width / 2 - (hu.left + hu.width / 2); dy = b.top + b.height / 2 - (hu.top + hu.height / 2); esc = b.width / (hu.width * 0.52); }
      const m = suave(tramo(p, 0.45, 1));
      objeto.style.transform = `translate(${dx * m}px, ${dy * m}px) scale(${1 + (esc - 1) * m})`;
      objeto.style.opacity = String(1 - suave(tramo(p, 0.88, 1)));
      objeto.style.display = p >= 0.999 || r.bottom < 0 ? "none" : "";
      el.style.setProperty("--p", p.toFixed(3));
      document.body.classList.toggle("heroe-pasado", p > 0.92);
    });
  },

  /* ── Trama orbital: el fondo propio, con sus tres variantes y sus perillas ── */
  async trama(el) {
    const vivo = `<div class="trama-banco">
        <div class="trama-banco__escena"><canvas class="trama-banco__lienzo" aria-hidden="true"></canvas>
          <div class="trama-banco__texto" data-texto><p class="ceja">Cierre de página</p><p class="titulo-1">Hablemos de tus procesos.</p><p class="bajada">Treinta minutos para encontrar dónde se traba tu operación.</p></div></div>
        <div class="trama-banco__mandos">
          <div class="pila"><span class="rotulo">Variante</span>${segmento(["Trama", "Órbitas", "Anillos"], { etiqueta: "Variante de la Trama", nombre: "variante" })}</div>
          ${deslizador("Caos → orden", { min: 0, max: 1, paso: 0.01, valor: 0, formato: (v) => Math.round(v * 100) + " %" })}
          ${deslizador("Densidad", { min: 0.1, max: 1, paso: 0.01, valor: 1, formato: (v) => Math.round(v * 100) + " %" })}
          ${deslizador("Paso de la retícula", { min: 7, max: 22, paso: 1, valor: 12, formato: (v) => v + " px" })}
          <label class="casilla"><input type="checkbox" data-mascara checked><span class="casilla__caja" aria-hidden="true"></span><span>Dejar aire para el texto</span></label>
        </div></div>`;
    const uso = `<div class="rejilla-2">
        <div class="pila"><p class="titulo-3">Cómo funciona</p><ul class="lista-punto">
          <li><b>Pozos invisibles</b>: tres procesos de la empresa; los puntos orbitan alrededor de ellos.</li>
          <li><b>La fuga</b>: 56 puntos se escapan por la tangente cada 7–14 s. Es la firma, hecha fondo.</li>
          <li><b>Orden</b>: al bajar (o con la perilla) las órbitas caóticas se acomodan en anillos concéntricos.</li>
          <li><b>El cursor</b> aparta los puntos cercanos con un resorte crítico: llega sin rebotar.</li>
          <li><b>Costo</b>: WebGL1, un solo dibujo por capa, 40 cuadros por segundo y se duerme fuera de pantalla.</li></ul></div>
        <div class="pila"><p class="titulo-3">Dónde va</p><ul class="lista-punto"><li>Héroe del sitio y del guion (variante Trama).</li><li>Cierres, login y portadas de propuesta (Anillos).</li><li>Videos y redes (Órbitas, con estela).</li><li>Nunca detrás de texto largo: la máscara deja aire a la izquierda.</li></ul>
          ${codigo(`import { trama } from "@optimizo/ui/escenas";\nconst fondo = trama(canvas, { variante: "trama", mascara: .85 });\nfondo.poner({ orden: .6, densidad: .4 });`)}</div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso, clase: "pieza--ancha" });
    activarPiezas(el);
    const inst = reemplazar("trama", trama(el.querySelector(".trama-banco__lienzo"), { variante: "trama", mascara: 0.85, centro: [0.5, 0] }));
    const mapa = { "Trama": "trama", "Órbitas": "orbitas", "Anillos": "anillos" };
    el.querySelector('[data-segmento="variante"]').addEventListener("cambio", (e) => inst.poner({ variante: mapa[e.detail] }));
    const rangos = el.querySelectorAll(".deslizador input");
    const claves = ["orden", "densidad", "paso"];
    rangos.forEach((r, i) => r.addEventListener("input", () => {
      const v = parseFloat(r.value); r.style.setProperty("--p", ((v - r.min) / (r.max - r.min)) * 100 + "%");
      r.closest(".deslizador").querySelector("output").textContent = i === 2 ? v + " px" : Math.round(v * 100) + " %";
      inst.poner({ [claves[i]]: v });
    }));
    el.querySelector("[data-mascara]").addEventListener("change", (e) => { inst.poner({ mascara: e.target.checked ? 0.85 : 0 }); el.querySelector("[data-texto]").hidden = !e.target.checked; });
  },

  /* ── Isotipo 3D: el objeto, sus tres materiales y cómo está hecho ── */
  async "isotipo-3d"(el) {
    const vivo = `<div class="iso3d-banco">
        <div class="iso3d-banco__escena"><canvas class="iso3d-banco__lienzo" aria-label="Isotipo de Optimizo en 3D: arrástralo, tira del punto o haz doble clic"></canvas>
          <div class="iso3d-banco__respaldo" hidden>${isotipo({ clase: "firma-escape" })}</div>
          <ul class="iso3d-banco__ayuda rotulo"><li><i></i>Arrastra para girar</li><li><i></i>Tira del punto y suéltalo</li><li><i></i>Doble clic: una vuelta</li></ul></div>
        <div class="iso3d-banco__materiales" role="radiogroup" aria-label="Material">
          ${[["esmalte", "Esmalte mate", "La marca. Terciopelo del esmalte, canto apenas brillante."], ["bizcocho", "Bizcocho", "Porcelana sin esmaltar: polvo y grano, nada de brillo."], ["piedra", "Piedra pulida", "Para piezas de lujo: pulida, con reflejo profundo."]].map(([k, n, d], i) => `<button type="button" role="radio" aria-checked="${i === 0}" tabindex="${i ? -1 : 0}" class="iso3d-material iso3d-material--${k}" data-material="${k}"><i aria-hidden="true"></i><b>${n}</b><span>${d}</span></button>`).join("")}
        </div></div>`;
    const anatomia = `<div class="iso3d-anatomia">${[
      ["Geometría", "El trazado exacto del PDF, extruido 18 u con un bisel redondo de 10 segmentos. Las normales se suavizan: el canto no se ve facetado."],
      ["El punto", "Una canica achatada (esfera al 62 % de profundidad), no un disco: así atrapa la luz como un objeto."],
      ["Esmalte", "Material físico: rugosidad 0,52, terciopelo (sheen) 0,5 y una capa transparente mínima. El color es el degradado de la paleta; en los cantos se acumula el tono profundo."],
      ["Grano", "Mapa de normales hecho del mismo grano de la marca, sin costuras. Se siente con la luz rasante."],
      ["Luz", "Un estudio propio: caja grande cálida arriba a la izquierda, relleno frío, contraluz que dibuja el canto y rebote del piso."],
      ["Sombra", "Sombra de contacto con la silueta real, desenfocada: el objeto se apoya, no flota."],
    ].map(([t, d], i) => `<div class="iso3d-anatomia__item"><span class="iso3d-anatomia__n">${String(i + 1).padStart(2, "0")}</span><b>${t}</b><p class="chico">${d}</p></div>`).join("")}</div>`;
    const uso = `<div class="rejilla-2"><div class="pila"><p class="titulo-3">Dónde</p><ul class="lista-punto"><li>Héroe del sitio y del guion; portadas de presentación.</li><li>Una sola vez por página.</li><li>Sin WebGL se ve el isotipo plano con la firma.</li></ul></div>
      ${codigo(`const { isotipo3d } = await import("@optimizo/ui/escenas/isotipo3d");\nconst iso = isotipo3d(canvas, { material: "esmalte" });\niso.material("piedra");   // esmalte · bizcocho · piedra\niso.fase(.5);             // 0 = 3D · 1 = plano de frente\niso.vuelta();             // el punto da una vuelta`)}</div>`;
    cuerpo(el).innerHTML = pieza({ vivo, anatomia, uso });
    activarPiezas(el);
    const lienzo = el.querySelector(".iso3d-banco__lienzo");
    const { isotipo3d } = await import("../kit/escenas/isotipo3d.js");
    const inst = reemplazar("isotipo-3d", isotipo3d(lienzo));
    if (lienzo.classList.contains("sin-webgl")) el.querySelector(".iso3d-banco__respaldo").hidden = false;
    const mats = [...el.querySelectorAll("[data-material]")];
    const elegir = (b) => { mats.forEach((x) => { const si = x === b; x.setAttribute("aria-checked", si); x.tabIndex = si ? 0 : -1; }); inst.material(b.dataset.material); };
    mats.forEach((b, i) => {
      b.addEventListener("click", () => elegir(b));
      b.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0; if (d) { e.preventDefault(); const s = mats[(i + d + mats.length) % mats.length]; s.focus(); elegir(s); } });
    });
  },
};

