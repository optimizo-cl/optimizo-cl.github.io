/* Capítulo 1 · El punto v2 (ola 3): el logo que se arma, las «i» vivas, los dieciséis momentos de la firma
   y el Laboratorio del punto (un juguete de física para sentir el resorte de la marca). */
import { logoVivo, armar, instante, soltar, saltarIes, activarLogoVivo } from "../kit/logo-vivo.js";
import { isotipo, DISCO } from "../kit/marca.js";
import { pieza, activarPiezas, curvaMovimiento, activarCurvas, codigo } from "../kit/presentar.js";
import { boton } from "../kit/controles.js";
import { campo } from "../kit/campos.js";
import { icono } from "../kit/iconos.js";
import { contar } from "../kit/coreografia.js";
import { movimientoReducido } from "../kit/escenas/vigia.js";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const C = { x: 75.207, y: 71.754, r: 69.152 };
const P = { x: 25.863, y: 22.754, r: 17.289 };
const LLEGADA = "cubic-bezier(.16, 1, .3, 1)";
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const reducido = () => movimientoReducido();
const captura = (e) => { try { e.target.setPointerCapture(e.pointerId); } catch {} };

/** Isotipo con degradado de la paleta; opcional sin punto y con el nido punteado (para animarlo o arrastrarlo). */
const iso = (clase = "", { sinPunto = false, nido = false } = {}) => isotipo({ clase: `m-iso ${clase} ${sinPunto ? "m-iso--sin-punto" : ""}`, titulo: "" })
  .replace('role="img" aria-label=""', 'aria-hidden="true"')
  .replace('<g class="isotipo__punto">', `${nido ? `<circle class="m-iso__nido" cx="${P.x}" cy="${P.y}" r="${P.r - 1}"/>` : ""}<g class="isotipo__punto">`);

/** Una tarjeta de momento: número, nombre, escenario y nota. */
const momento = (n, nombre, escena, nota, { clase = "", accion = "" } = {}) => `<article class="momento2 ${clase}">
  <header class="momento2__cabeza"><span class="momento2__n">${String(n).padStart(2, "0")}</span><b>${nombre}</b>${accion}</header>
  <div class="momento2__escena">${escena}</div><p class="chico momento2__nota">${nota}</p></article>`;

export const punto2 = {
  /* ── Logo: construcción animada con línea de tiempo + las «i» vivas; debajo, versiones y superficies (v1) ── */
  async logo(el, v1) {
    const vivo = `<div class="logo-arma">
        <div class="logo-arma__escena">${await logoVivo({ clase: "logo-arma__logo", armado: false })}</div>
        <div class="logo-arma__mandos">
          ${boton("Armar de nuevo", { variante: "secundario", tam: "s", ico: "arrow-clockwise", attrs: "data-armar" })}
          <label class="logo-arma__tiempo"><span class="rotulo">Línea de tiempo</span><input type="range" min="0" max="4200" step="10" value="4200" data-tiempo aria-label="Instante de la construcción"><output class="mono" data-t>4,2 s</output></label>
        </div>
        <ol class="logo-arma__pasos">${[["0,0 s", "El disco se dibuja con un trazo"], ["1,2 s", "El agujero se perfora"], ["1,7 s", "La mordida se recorta"], ["1,9 s", "El punto sale del centro por la mordida"], ["2,7 s", "Las letras se asientan"], ["3,5 s", "Caen los puntos de las «i»"]].map(([t, d]) => `<li><span class="mono">${t}</span>${d}</li>`).join("")}</ol>
      </div>`;
    const ies = `<div class="logo-ies"><div class="logo-ies__escena">${await logoVivo({ clase: "logo-ies__logo" })}</div>
        <p class="chico">Los puntos de las «i» son puntos de verdad: al pasar el mouse por el logo saltan en ola, como si el punto del isotipo tuviera hermanos. Solo en piezas digitales y una vez por visita.</p></div>`;
    const uso = `<div class="rejilla-2"><ul class="lista-punto"><li>La construcción va <b>una vez</b>: en el primer ingreso del sitio, en el arranque de un video o al abrir una presentación.</li><li>Con «reducir movimiento» el logo aparece armado.</li><li>El logo estático sigue siendo el SVG de siempre; esto es su versión viva.</li></ul>
      ${codigo(`import { logoVivo, armar, activarLogoVivo } from "@optimizo/ui/logo-vivo";\ncontenedor.innerHTML = await logoVivo({ armado: false });\nactivarLogoVivo(contenedor.firstElementChild); // se arma al verse, las «i» saltan al pasar`)}</div>`;
    cuerpo(el).innerHTML = pieza({ vivo, movimiento: ies, uso }) + `<div class="logo-v1"></div>`;
    // las pestañas: Vivo = construcción · Movimiento = las «i» vivas
    el.querySelector('[role="tab"][id$="-t-movimiento"]').textContent = "Las «i» vivas";
    activarPiezas(el);
    const svg = el.querySelector(".logo-arma__logo"), t = el.querySelector("[data-tiempo]"), out = el.querySelector("[data-t]");
    activarLogoVivo(svg);
    activarLogoVivo(el.querySelector(".logo-ies__logo"), { armarAlVer: false, iesSolas: true });
    el.querySelector("[data-armar]").addEventListener("click", () => { armar(svg); t.value = 4200; out.textContent = "4,2 s"; });
    t.addEventListener("input", () => { instante(svg, +t.value); out.textContent = (t.value / 1000).toFixed(1).replace(".", ",") + " s"; });
    t.addEventListener("change", () => { if (+t.value < 4200) soltar(svg); });
    // versiones y superficies (lo que ya estaba), debajo
    const abajo = el.querySelector(".logo-v1");
    await v1({ querySelector: (s) => (s === ".seccion__cuerpo" ? abajo : abajo.querySelector(s)) });
  },

  /* ── La firma en movimiento: dieciséis momentos, cada uno funcionando ── */
  async firma(el) {
    const m = [];
    m.push(momento(1, "Construcción", `<div class="m-centro">${await logoVivo({ clase: "m-construccion", solo: "isotipo", armado: false })}</div>`, "El disco se dibuja, se perfora, se recorta y el punto sale. Una vez, al llegar.", { accion: `<button type="button" class="momento2__repetir" data-rep="construccion" aria-label="Repetir construcción">${icono("arrow-clockwise", { tam: 18 })}</button>` }));
    m.push(momento(2, "Las «i» vivas", `<div class="m-centro">${await logoVivo({ clase: "m-ies" })}</div>`, "Pasa el mouse: los puntos de las «i» saltan en ola.", { clase: "momento2--ancho" }));
    m.push(momento(3, "Transición de capítulo", `<div class="m-transicion" data-transicion><div class="m-transicion__a"><span class="rotulo">Capítulo 1</span><b>Identidad</b></div><div class="m-transicion__b"><span class="rotulo">Capítulo 2</span><b>Kit</b></div><i class="m-transicion__punto"></i></div>`, "El punto viaja al centro y se abre en un círculo que revela lo siguiente.", { accion: `<button type="button" class="momento2__repetir" data-rep="transicion" aria-label="Repetir transición">${icono("arrow-clockwise", { tam: 18 })}</button>` }));
    m.push(momento(4, "Indicador de lectura", `<div class="m-lectura"><div class="m-lectura__via"><i class="m-lectura__lleno"></i><i class="m-lectura__punto"></i></div><p><b class="m-lectura__n" data-lectura>0 %</b><span class="chico">del guion leído</span></p></div>`, "En la navegación, el punto recorre la línea según cuánto llevas. Es tu scroll real."));
    m.push(momento(5, "Hover de botón", `<div class="m-centro">${boton("Agendar diagnóstico", { clase: "", attrs: 'data-boton-punto', icoFin: "arrow-right" }).replace('class="boton', 'class="boton boton--punto')}</div>`, "Al pasar, la flecha se vuelve punto y avanza: el siguiente paso."));
    m.push(momento(6, "Carga que dibuja", `<div class="m-centro"><svg class="m-dibuja" viewBox="0 0 138.305 138.305" aria-hidden="true"><g transform="translate(-6.054688 -2.601562)">
        <path class="m-dibuja__trazo" pathLength="1" d="${DISCO}"/><path class="m-dibuja__relleno" fill-rule="evenodd" d="${DISCO}"/>
        <circle class="m-dibuja__punto" r="7"><animateMotion dur="3.6s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.62;1" calcMode="spline" keySplines=".45 .05 .55 .95;0 0 1 1" path="${DISCO.split(" Z ")[0]} Z"/></circle>
        <circle class="m-dibuja__nido" cx="${P.x}" cy="${P.y}" r="${P.r}"/></g></svg></div>`, "El punto traza el contorno del isotipo; al cerrarlo, el disco se llena y el punto aterriza en su nido."));
    m.push(momento(7, "Carga larga", `<div class="m-larga" data-larga><svg viewBox="0 0 140 140" aria-hidden="true"><circle class="m-larga__anillo" cx="70" cy="70" r="26"/><circle class="m-larga__anillo" cx="70" cy="70" r="40"/><circle class="m-larga__anillo" cx="70" cy="70" r="54"/><g class="m-larga__orbita"><circle class="m-larga__punto" cx="70" cy="44" r="6"/></g><circle class="m-larga__centro" cx="70" cy="70" r="12"/></svg>
        <div class="m-larga__texto" role="status"><b data-larga-t>Leyendo 1.240 documentos</b><span class="chico" data-larga-f>Fase 1 de 3</span></div></div>`, "Si la espera pasa de 4 s, las órbitas se abren por fases y el texto cuenta qué está pasando.", { clase: "momento2--ancho" }));
    m.push(momento(8, "Éxito", `<div class="m-exito" data-exito><button type="button" class="boton boton--primario m-exito__boton" data-exito-b>Enviar diagnóstico</button>${iso("m-exito__iso", { sinPunto: true, nido: true })}<i class="m-exito__punto"></i><svg class="m-exito__check" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" pathLength="1"/></svg></div>`, "El botón se contrae hasta ser un punto, viaja y aterriza en el disco: listo.", { clase: "momento2--ancho" }));
    m.push(momento(9, "Error", `<div class="m-error">${campo("RUT de la empresa", { tipo: "rut", valor: "76.123.456-1", requerido: true, attrs: "data-error-campo" })}<i class="m-error__punto"></i>${boton("Validar", { variante: "secundario", tam: "s", attrs: "data-error-b" })}</div>`, "El punto tiembla dos veces (corto, sin rebote) y señala el campo. El mensaje dice cómo arreglarlo."));
    m.push(momento(10, "Vacío", `<div class="m-vacio">${iso("m-vacio__iso", { sinPunto: true, nido: true })}<div><b>Aún no hay procesos</b><p class="chico">Falta el punto: agrega el primero y el disco se completa.</p>${boton("Agregar proceso", { variante: "secundario", tam: "s", ico: "plus", attrs: "data-vacio-b" })}</div></div>`, "El disco solo, con el nido punteado: la marca dice «falta algo» sin dramatismo."));
    m.push(momento(11, "404", `<div class="m-404" data-404><svg viewBox="0 0 300 180" role="group" aria-label="Isotipo sin su punto"><g transform="translate(40 20) scale(1)">${iso("", { sinPunto: true, nido: true }).replace(/<svg[^>]*>|<\/svg>/g, "")}</g><circle class="m-404__punto" cx="250" cy="150" r="17.3" tabindex="0" role="button" aria-label="Punto perdido: arrástralo a su nido o presiona Enter"/></svg><p class="chico" data-404-t>El punto se perdió. Devuélvelo a su nido.</p></div>`, "Arrastra el punto (o presiona Enter): vuelve con resorte y el disco respira.", { clase: "momento2--ancho" }));
    m.push(momento(12, "Selección", `<div class="m-seleccion" data-seleccion><div class="m-seleccion__ops">${["Cotizaciones", "Inventario", "Despachos", "Cobranza"].map((o) => `<button type="button" class="ficha-op" aria-pressed="false">${o}</button>`).join("")}</div><div class="m-seleccion__resumen"><span class="rotulo">Resumen</span><b data-sel-n>0</b><span class="chico">procesos</span></div></div>`, "Al marcar una opción, un punto viaja de la opción al resumen y el número sube.", { clase: "momento2--ancho" }));
    m.push(momento(13, "Contador", `<div class="m-contador"><b class="m-contador__n" data-contador>0</b><i class="m-contador__tic"></i><span class="chico">horas ahorradas por semana</span></div>`, "Los números grandes se cuentan con un punto que marca cada paso.", { clase: "momento2--ancho" }));
    m.push(momento(14, "Descanso", `<div class="m-descanso" data-descanso>${iso("m-descanso__iso")}<p class="chico" data-descanso-t>Quédate quieto…</p></div>`, "Después de 20 s sin moverse, el punto respira (acá, a los 4 s para probarlo)."));
    m.push(momento(15, "Laboratorio", `<a class="m-enlace" href="#laboratorio">${iso("m-enlace__iso")}<span><b>El punto con física</b><span class="chico">Tira del punto y siente el resorte de la marca.</span></span>${icono("arrow-right", { tam: 20 })}</a>`, "El juguete que define cómo se mueve todo: resorte crítico, llegada larga."));
    m.push(momento(16, "Video de marca", `<div class="m-video" data-video><div class="m-video__cuadro">${await logoVivo({ clase: "m-video__logo", armado: false })}<p class="m-video__frase" data-video-f>Todo proceso tiene una salida.</p></div><span class="m-video__rec rotulo"><i></i>20–30 s · se exporta a MP4 en «Web y marca»</span></div>`, "El guion de la pieza de marca: construcción, frase, el punto que sale. Se arma en el navegador.", { clase: "momento2--pleno" }));

    const curvas = [
      { nombre: "Llegada", bezier: [0.16, 1, 0.3, 1], ms: 1200, uso: "Todo lo que llega a su lugar: entradas, el punto aterrizando." },
      { nombre: "Suave", bezier: [0.25, 0.1, 0.25, 1], ms: 640, uso: "Fundidos y cambios de color." },
      { nombre: "Firma", bezier: [0.45, 0.05, 0.55, 0.95], ms: 1600, uso: "El punto en órbita: acelera y frena con calma." },
    ];
    cuerpo(el).innerHTML = `<div class="momentos">${m.join("")}</div>
      <div class="curvas-firma"><p class="titulo-3">Curvas y tiempos</p><div class="curvas-firma__lista">${curvas.map(curvaMovimiento).join("")}</div>
      <p class="chico">Nada rebota ni es juguetón: el «juego» está en las ideas, no en la elasticidad. Con «reducir movimiento» cada momento muestra su estado final.</p></div>`;
    activarCurvas(el);
    activarMomentos(el);
  },

  /* ── Laboratorio del punto: un juguete de física ── */
  async laboratorio(el) {
    cuerpo(el).innerHTML = `<div class="lab">
      <div class="lab__escena" data-lab>
        <svg class="lab__svg" viewBox="-160 -120 320 240" aria-hidden="false" role="group" aria-label="Laboratorio: arrastra el punto o usa las flechas">
          <g class="lab__estela"></g>
          <g transform="translate(-75.207 -71.754)">${iso("", { sinPunto: true, nido: true }).replace(/<svg[^>]*>|<\/svg>/g, "").replace('transform="translate(-6.054688 -2.601562)"', "")}</g>
          <line class="lab__liga" x1="0" y1="0" x2="0" y2="0"/>
          <circle class="lab__punto" r="17.289" tabindex="0" role="slider" aria-label="El punto: flechas para empujarlo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="en su nido"/>
        </svg>
        <p class="lab__ayuda rotulo"><i></i>Arrastra el punto y suéltalo · flechas para empujarlo</p>
      </div>
      <div class="lab__mandos">
        <div class="pila"><span class="rotulo">Modo</span><div class="segmento" role="radiogroup" aria-label="Modo" data-modo><button type="button" role="radio" aria-checked="true" data-valor="resorte">Resorte</button><button type="button" role="radio" aria-checked="false" tabindex="-1" data-valor="gravedad">Gravedad</button></div></div>
        <label class="deslizador"><span class="deslizador__cabeza"><b>Rigidez ω</b><output data-o="w">7,0</output></span><input type="range" min="2" max="20" step="0.5" value="7" data-k="w" style="--p:27.8%"></label>
        <label class="deslizador"><span class="deslizador__cabeza"><b>Amortiguación ζ</b><output data-o="z">1,00 · crítico</output></span><input type="range" min="0.15" max="1.6" step="0.05" value="1" data-k="z" style="--p:58.6%"></label>
        <div class="lab__medidas"><div><span class="rotulo">Llega en</span><b data-m="t">—</b></div><div><span class="rotulo">Rebote</span><b data-m="r">—</b></div></div>
        <canvas class="lab__grafico" width="560" height="200" aria-label="Distancia al nido en el tiempo"></canvas>
        <p class="chico">La marca usa <b>ζ = 1</b> (crítico): llega lo más rápido posible sin pasarse. Baja ζ para ver lo que no hacemos.</p>
        <button type="button" class="boton boton--secundario boton--s" data-lanzar>Lanzar el punto</button>
      </div></div>`;
    activarLaboratorio(el);
  },
};

/* ═════════ comportamiento de los momentos ═════════ */
function activarMomentos(el) {
  if (reducido()) el.querySelectorAll("animateMotion").forEach((a) => a.remove()); // SMIL no respeta «reducir movimiento»
  // 6 · el punto (SMIL) corre con el reloj del documento y el trazo (CSS) con el suyo: se ponen en cero juntos
  el.querySelectorAll("svg.m-dibuja").forEach((s) => { s.setCurrentTime?.(0); s.getAnimations({ subtree: true }).forEach((a) => (a.currentTime = 0)); });
  // 1 · construcción (y repetir)
  const cons = el.querySelector(".m-construccion"); activarLogoVivo(cons);
  el.querySelector('[data-rep="construccion"]').addEventListener("click", () => armar(cons));
  // 2 · «i» vivas
  activarLogoVivo(el.querySelector(".m-ies"), { armarAlVer: false, iesSolas: true });
  // 3 · transición
  const tr = el.querySelector("[data-transicion]");
  const transicion = async () => { tr.classList.remove("viaja", "abre"); void tr.offsetWidth; if (reducido()) { tr.classList.add("abre"); return; } tr.classList.add("viaja"); await esperar(900); tr.classList.add("abre"); };
  el.querySelector('[data-rep="transicion"]').addEventListener("click", transicion);
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); transicion(); } }, { threshold: 0.6 }).observe(tr);
  // 4 · lectura (scroll real)
  const via = el.querySelector(".m-lectura"), n = el.querySelector("[data-lectura]");
  const leer = () => { const p = Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)); via.style.setProperty("--p", p.toFixed(4)); n.textContent = Math.round(p * 100) + " %"; };
  addEventListener("scroll", leer, { passive: true }); leer();
  // 7 · carga larga: fases
  const larga = el.querySelector("[data-larga]"), fases = [["Leyendo 1.240 documentos", 1], ["Ordenando por proceso", 2], ["Cruzando con tus sistemas", 3]];
  let f = 0; larga.dataset.fase = 1;
  const tic = setInterval(() => { if (!larga.isConnected) return clearInterval(tic); f = (f + 1) % fases.length; larga.dataset.fase = fases[f][1]; larga.querySelector("[data-larga-t]").textContent = fases[f][0]; larga.querySelector("[data-larga-f]").textContent = `Fase ${fases[f][1]} de 3`; }, 2600);
  // 8 · éxito
  const ex = el.querySelector("[data-exito]"), bEx = el.querySelector("[data-exito-b]");
  bEx.addEventListener("click", async () => {
    if (ex.classList.contains("corriendo")) return;
    if (ex.classList.contains("hecho")) { ex.classList.remove("hecho"); return; }
    ex.classList.add("corriendo");
    if (!reducido()) {
      const b = bEx.getBoundingClientRect(), dest = ex.querySelector(".m-iso__nido").getBoundingClientRect(), base = ex.getBoundingClientRect();
      const punto = ex.querySelector(".m-exito__punto");
      await bEx.animate([{ width: b.width + "px", color: "var(--texto-sobre-acento, #fff)" }, { width: b.height + "px", color: "transparent", borderRadius: "999px" }], { duration: 420, easing: LLEGADA, fill: "forwards" }).finished;
      const x0 = b.left - base.left + b.height / 2, y0 = b.top - base.top + b.height / 2, x1 = dest.left - base.left + dest.width / 2, y1 = dest.top - base.top + dest.height / 2;
      Object.assign(punto.style, { left: x0 + "px", top: y0 + "px", width: b.height * 0.5 + "px", height: b.height * 0.5 + "px" });
      bEx.style.opacity = 0;
      await punto.animate([{ transform: "translate(-50%,-50%) scale(1.6)", opacity: 1 }, { transform: `translate(calc(-50% + ${(x1 - x0) * 0.55}px), calc(-50% + ${(y1 - y0) - 40}px)) scale(1)`, opacity: 1, offset: 0.55 }, { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) scale(${dest.width / (b.height * 0.5)})`, opacity: 1 }], { duration: 1100, easing: LLEGADA, fill: "forwards" }).finished;
      bEx.getAnimations().forEach((a) => a.cancel()); bEx.style.opacity = "";
      punto.getAnimations().forEach((a) => a.cancel()); punto.style.cssText = "";
    }
    ex.classList.remove("corriendo"); ex.classList.add("hecho");
  });
  // 9 · error
  const er = el.querySelector(".m-error"), inp = er.querySelector("[data-error-campo]"), pE = er.querySelector(".m-error__punto");
  el.querySelector("[data-error-b]").addEventListener("click", () => {
    const c = er.querySelector("[data-campo]"); c.classList.add("campo--error"); inp.setAttribute("aria-invalid", "true");
    const msg = c.querySelector(".campo__error"); msg.hidden = false; msg.querySelector("span").textContent = "El dígito verificador no calza: revisa el último número.";
    const r = inp.getBoundingClientRect(), b = er.getBoundingClientRect();
    Object.assign(pE.style, { left: r.right - b.left - 22 + "px", top: r.top - b.top + r.height / 2 + "px" }); pE.classList.add("visible");
    if (!reducido()) pE.animate([{ transform: "translate(-50%,-50%)" }, { transform: "translate(calc(-50% - 4px),-50%)" }, { transform: "translate(calc(-50% + 4px),-50%)" }, { transform: "translate(calc(-50% - 3px),-50%)" }, { transform: "translate(calc(-50% + 2px),-50%)" }, { transform: "translate(-50%,-50%)" }], { duration: 420, easing: "linear" });
    inp.focus();
  });
  inp.addEventListener("input", () => { er.querySelector("[data-campo]").classList.remove("campo--error"); inp.removeAttribute("aria-invalid"); er.querySelector(".campo__error").hidden = true; pE.classList.remove("visible"); });
  // 10 · vacío
  el.querySelector("[data-vacio-b]").addEventListener("click", (e) => { const v = e.target.closest(".m-vacio"); v.classList.toggle("lleno"); e.target.closest("button").querySelector(".boton__texto").textContent = v.classList.contains("lleno") ? "Quitar proceso" : "Agregar proceso"; });
  // 11 · 404: arrastrar el punto al nido
  arrastrar404(el.querySelector("[data-404]"));
  // 12 · selección
  const sel = el.querySelector("[data-seleccion]"), nSel = sel.querySelector("[data-sel-n]");
  sel.querySelectorAll(".ficha-op").forEach((op) => op.addEventListener("click", () => {
    const si = op.getAttribute("aria-pressed") !== "true"; op.setAttribute("aria-pressed", si);
    const total = sel.querySelectorAll('[aria-pressed="true"]').length;
    if (reducido()) { nSel.textContent = total; return; }
    const a = op.getBoundingClientRect(), z = nSel.getBoundingClientRect(), base = sel.getBoundingClientRect();
    const p = document.createElement("i"); p.className = "m-seleccion__viajero"; sel.appendChild(p);
    const [x0, y0, x1, y1] = si ? [a.right - base.left - 14, a.top - base.top + a.height / 2, z.left - base.left + z.width / 2, z.top - base.top + z.height / 2] : [z.left - base.left + z.width / 2, z.top - base.top + z.height / 2, a.right - base.left - 14, a.top - base.top + a.height / 2];
    p.animate([{ transform: `translate(${x0}px, ${y0}px)` }, { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 34}px)`, offset: 0.5 }, { transform: `translate(${x1}px, ${y1}px)` }], { duration: 760, easing: "cubic-bezier(.45,.05,.55,.95)" }).finished.then(() => { p.remove(); nSel.textContent = total; nSel.animate([{ transform: "scale(1.25)" }, { transform: "none" }], { duration: 420, easing: LLEGADA }); });
  }));
  // 13 · contador con tic
  const cn = el.querySelector("[data-contador]"), tic13 = el.querySelector(".m-contador__tic");
  contar(cn, 31, { duracion: 2200, formato: (v) => { const r = Math.round(v); if (r !== +cn.dataset.ult) { cn.dataset.ult = r; tic13.animate?.([{ transform: "scale(1.6)", opacity: 1 }, { transform: "scale(1)", opacity: 0.7 }], { duration: 160 }); } return r; } });
  // 14 · descanso
  const des = el.querySelector("[data-descanso]"), desT = des.querySelector("[data-descanso-t]");
  let quieto = 0, reloj = setInterval(() => { if (!des.isConnected) return clearInterval(reloj); quieto += 1; if (quieto >= 4) { des.classList.add("respira"); desT.textContent = "El punto respira."; } else desT.textContent = `Quédate quieto… ${4 - quieto} s`; }, 1000);
  des.addEventListener("pointermove", () => { quieto = 0; des.classList.remove("respira"); });
  // 16 · video: se arma en bucle mientras se ve
  const vid = el.querySelector("[data-video]"), vLogo = vid.querySelector(".m-video__logo"), vF = vid.querySelector("[data-video-f]");
  const frases = ["Todo proceso tiene una salida.", "Medimos antes de proponer.", "Lo dejamos funcionando."];
  let k = 0, vivo = false;
  const ciclo = async () => { while (vivo && vid.isConnected) { vid.classList.remove("frase"); armar(vLogo); await esperar(4400); vF.textContent = frases[k++ % frases.length]; vid.classList.add("frase"); saltarIes(vLogo); await esperar(3200); } };
  new IntersectionObserver(([e]) => { const antes = vivo; vivo = e.isIntersecting && !reducido(); if (vivo && !antes) ciclo(); }, { threshold: 0.4 }).observe(vid);
}

function arrastrar404(caja) {
  const svg = caja.querySelector("svg"), p = caja.querySelector(".m-404__punto"), t = caja.querySelector("[data-404-t]");
  const nido = { x: 40 + P.x - 6.054688, y: 20 + P.y - 2.601562 }, inicio = { x: 250, y: 150 };
  let pos = { ...inicio }, v = { x: 0, y: 0 }, agarrado = false, raf = 0, meta = null;
  const poner = () => { p.setAttribute("cx", pos.x); p.setAttribute("cy", pos.y); };
  const aSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y }; }; // objeto plano: un SVGPoint no se copia con «...»
  const volver = (destino) => {
    meta = destino; cancelAnimationFrame(raf); let prev = performance.now();
    const paso = (ahora) => { const dt = Math.min(0.033, (ahora - prev) / 1000); prev = ahora; const w = 8;
      for (const k of ["x", "y"]) { const a = w * w * (meta[k] - pos[k]) - 2 * w * v[k]; v[k] += a * dt; pos[k] += v[k] * dt; }
      poner(); if (Math.hypot(meta.x - pos.x, meta.y - pos.y) > 0.2 || Math.hypot(v.x, v.y) > 0.5) raf = requestAnimationFrame(paso); else { pos = { ...meta }; poner(); } };
    raf = requestAnimationFrame(paso);
  };
  const encontrado = () => { caja.classList.add("encontrado"); t.textContent = "Encontrado. Todo vuelve a funcionar."; volver(nido); setTimeout(() => { caja.classList.remove("encontrado"); t.textContent = "El punto se perdió. Devuélvelo a su nido."; pos = { ...inicio }; v = { x: 0, y: 0 }; poner(); }, 5000); };
  p.addEventListener("pointerdown", (e) => { agarrado = true; captura(e); cancelAnimationFrame(raf); });
  p.addEventListener("pointermove", (e) => { if (!agarrado) return; const q = aSvg(e); pos = { x: Math.max(10, Math.min(290, q.x)), y: Math.max(10, Math.min(170, q.y)) }; poner(); });
  p.addEventListener("pointerup", () => { agarrado = false; if (Math.hypot(pos.x - nido.x, pos.y - nido.y) < 36) encontrado(); else volver(inicio); });
  p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); encontrado(); } });
}

/* ═════════ laboratorio ═════════ */
function activarLaboratorio(el) {
  const svg = el.querySelector(".lab__svg"), p = el.querySelector(".lab__punto"), liga = el.querySelector(".lab__liga"), estela = el.querySelector(".lab__estela");
  const g = el.querySelector(".lab__grafico"), ctx = g.getContext("2d");
  const grad = svg.querySelector('linearGradient[id$="p"]'); if (grad) p.setAttribute("fill", `url(#${grad.id})`); // el punto con el degradado de la marca
  const nido = { x: P.x - C.x, y: P.y - C.y };
  const o = { w: 7, z: 1, modo: "resorte" };
  let pos = { ...nido }, vel = { x: 0, y: 0 }, agarrado = false, historia = [], soltadoEn = 0, maxRebote = 0, llego = null, distSoltar = 0, tiempoGrav = 0;
  const rastro = [];
  for (let i = 0; i < 26; i++) { const c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); c.setAttribute("r", 3); estela.appendChild(c); rastro.push(c); }
  const aSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y }; }; // objeto plano: un SVGPoint no se copia con «...»
  let u0 = { x: 0, y: 0 };
  const soltar = () => { soltadoEn = performance.now(); maxRebote = 0; llego = null; distSoltar = Math.hypot(pos.x - nido.x, pos.y - nido.y); u0 = distSoltar > 2 ? { x: (pos.x - nido.x) / distSoltar, y: (pos.y - nido.y) / distSoltar } : { x: 0, y: 0 }; historia = []; tiempoGrav = 0; };
  let ultimo = null;
  p.addEventListener("pointerdown", (e) => { agarrado = true; captura(e); ultimo = { ...aSvg(e), t: performance.now() }; el.querySelector("[data-lab]").classList.add("tirando"); });
  p.addEventListener("pointermove", (e) => { if (!agarrado) return; const q = aSvg(e), ahora = performance.now(), dt = Math.max(8, ahora - ultimo.t) / 1000; vel = { x: (q.x - ultimo.x) / dt, y: (q.y - ultimo.y) / dt }; pos = { x: Math.max(-150, Math.min(150, q.x)), y: Math.max(-110, Math.min(110, q.y)) }; ultimo = { ...q, t: ahora }; });
  const fin = () => { if (!agarrado) return; agarrado = false; el.querySelector("[data-lab]").classList.remove("tirando"); soltar(); };
  p.addEventListener("pointerup", fin); p.addEventListener("pointercancel", fin);
  p.addEventListener("keydown", (e) => { const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return; e.preventDefault(); vel.x += d[0] * 260; vel.y += d[1] * 260; soltar(); });
  el.querySelector("[data-lanzar]").addEventListener("click", () => { const a = Math.random() * Math.PI * 2; vel = { x: Math.cos(a) * 420, y: Math.sin(a) * 420 }; soltar(); });
  el.querySelector("[data-modo]").addEventListener("cambio", (e) => { o.modo = e.detail; soltar(); });
  el.querySelectorAll("[data-k]").forEach((r) => r.addEventListener("input", () => {
    o[r.dataset.k] = +r.value; r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
    el.querySelector(`[data-o="${r.dataset.k}"]`).textContent = r.dataset.k === "w" ? (+r.value).toFixed(1).replace(".", ",") : `${(+r.value).toFixed(2).replace(".", ",")}${Math.abs(r.value - 1) < 0.03 ? " · crítico" : r.value < 1 ? " · rebota" : " · lento"}`;
  }));
  const medir = () => {
    if (!soltadoEn || agarrado) return;
    const d = Math.hypot(pos.x - nido.x, pos.y - nido.y);
    // rebote = cuánto se pasa del nido hacia el otro lado, respecto a la distancia desde donde se soltó
    const lado = (pos.x - nido.x) * u0.x + (pos.y - nido.y) * u0.y; if (lado < 0) maxRebote = Math.max(maxRebote, -lado);
    if (!llego && d < 1.2 && Math.hypot(vel.x, vel.y) < 6) llego = performance.now() - soltadoEn;
    el.querySelector('[data-m="t"]').textContent = llego ? `${Math.round(llego)} ms` : "…";
    el.querySelector('[data-m="r"]').textContent = distSoltar > 2 ? `${Math.round(Math.min(100, (maxRebote / distSoltar) * 100))} %` : "—";
  };
  const dibujarGrafico = () => {
    const W = g.width, H = g.height, cs = getComputedStyle(el);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = cs.getPropertyValue("--borde-fuerte"); ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(0, H - 20); ctx.lineTo(W, H - 20); ctx.stroke(); ctx.setLineDash([]);
    if (historia.length < 2) return;
    const max = Math.max(40, ...historia.map((h) => h.d));
    ctx.strokeStyle = cs.getPropertyValue("--acento-profundo"); ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.beginPath(); historia.forEach((h, i) => { const x = (i / 180) * W, y = H - 20 - (h.d / max) * (H - 40); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    const u = historia[historia.length - 1], x = ((historia.length - 1) / 180) * W, y = H - 20 - (u.d / max) * (H - 40);
    ctx.fillStyle = cs.getPropertyValue("--acento"); ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
  };
  let prev = 0, vivo = false, raf = 0;
  const paso = (ahora) => {
    raf = vivo ? requestAnimationFrame(paso) : 0;
    const dt = prev ? Math.min(0.033, (ahora - prev) / 1000) : 0; prev = ahora;
    if (!agarrado && dt) {
      const sub = 4, h = dt / sub;
      for (let s = 0; s < sub; s++) {
        let ax, ay;
        if (o.modo === "gravedad" && tiempoGrav < 4.5) {
          // atracción al centro del disco (órbita) + un resorte débil hacia el nido que crece con el tiempo
          tiempoGrav += h; const r = Math.max(30, Math.hypot(pos.x, pos.y)), GM = 2.2e6;
          ax = (-GM * pos.x) / (r * r * r); ay = (-GM * pos.y) / (r * r * r);
          const kN = (tiempoGrav / 4.5) ** 2 * o.w * o.w; ax += kN * (nido.x - pos.x) - 0.4 * vel.x; ay += kN * (nido.y - pos.y) - 0.4 * vel.y;
        } else {
          ax = o.w * o.w * (nido.x - pos.x) - 2 * o.z * o.w * vel.x; ay = o.w * o.w * (nido.y - pos.y) - 2 * o.z * o.w * vel.y;
        }
        vel.x += ax * h; vel.y += ay * h; pos.x += vel.x * h; pos.y += vel.y * h;
      }
    }
    p.setAttribute("cx", pos.x); p.setAttribute("cy", pos.y);
    liga.setAttribute("x1", nido.x); liga.setAttribute("y1", nido.y); liga.setAttribute("x2", pos.x); liga.setAttribute("y2", pos.y);
    const d = Math.hypot(pos.x - nido.x, pos.y - nido.y);
    liga.style.opacity = Math.min(1, d / 30) * (agarrado ? 1 : 0.5);
    p.setAttribute("aria-valuenow", Math.round(Math.min(100, d))); p.setAttribute("aria-valuetext", d < 1.5 ? "en su nido" : `a ${Math.round(d)} unidades del nido`);
    // estela
    rastro.unshift(rastro.pop()); rastro[0].setAttribute("cx", pos.x); rastro[0].setAttribute("cy", pos.y);
    rastro.forEach((c, i) => { c.setAttribute("opacity", d < 1 ? 0 : (1 - i / rastro.length) * 0.45); c.setAttribute("r", 3.4 * (1 - i / rastro.length) + 0.6); });
    if (soltadoEn) { historia.push({ d }); if (historia.length > 180) historia.shift(); }
    medir(); dibujarGrafico();
  };
  new IntersectionObserver(([e]) => { vivo = e.isIntersecting; if (vivo && !raf) { prev = 0; raf = requestAnimationFrame(paso); } }).observe(svg);
  if (reducido()) dibujarGrafico();
}
