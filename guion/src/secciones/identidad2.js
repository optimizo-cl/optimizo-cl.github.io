/* Capítulo 1 · Identidad v2 (ola 1): concepto narrado con scroll, pigmentos, tipografía cinética, retícula viva,
   forma bajo luz real, banco de materiales, íconos con gesto. Cada sección tiene su propia composición. */
import { progreso, entrar, contar } from "../kit/coreografia.js?v=7a04113";
import { pieza, activarPiezas, codigo } from "../kit/presentar.js?v=7a04113";
import { contraste, colorDe } from "../kit/color.js?v=7a04113";
import { icono, cargarIconos, rellenarIconos } from "../kit/iconos.js?v=7a04113";
import { boton } from "../kit/controles.js?v=7a04113";
import { ICONOS_IDENTIDAD } from "./identidad.js?v=7a04113";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const raiz = document.documentElement;
const lerp = (a, b, t) => a + (b - a) * t;
const tramo = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const suave = (x) => x * x * (3 - 2 * x);

// Geometría del isotipo (coordenadas del PDF)
const C = { x: 75.207, y: 71.754, r: 69.152, hueco: 17.288 };
const NIDO = { x: 25.863, y: 22.754, r: 17.289 };
const MORDIDA = 34.578;

export const identidad2 = {
  /* ── Concepto: un relato que se cuenta con el scroll ── */
  async concepto(el) {
    el.setAttribute("data-sin-entrada", "");
    const pasos = [
      ["01", "Una empresa da vueltas sobre sí misma.", "Todo funciona, pero en círculo: las mismas planillas, los mismos chats, el mismo atraso."],
      ["02", "En algún lugar, el proceso se traba.", "Siempre hay un punto que no sale: una cotización, un seguimiento, un dato que nadie encuentra."],
      ["03", "Optimizo encuentra la salida.", "Entramos, medimos y abrimos el camino. El punto sale por la mordida."],
      ["04", "Y la deja funcionando.", "Lo que estaba atrapado ahora se mueve en orden. El hueco del centro recuerda de dónde salió."],
    ];
    cuerpo(el).innerHTML = `<div class="relato" style="--pasos:${pasos.length}">
      <div class="relato__escena">
        <div class="relato__lienzo">
          <svg viewBox="-20 -20 190 190" class="relato__svg" aria-label="El isotipo de Optimizo armándose">
            <defs>
              <linearGradient id="rel-g" gradientUnits="userSpaceOnUse" x1="6" y1="0" x2="144" y2="0"><stop offset="0" style="stop-color:var(--deg-a)"/><stop offset="1" style="stop-color:var(--deg-b)"/></linearGradient>
              <mask id="rel-m"><rect x="-40" y="-40" width="240" height="240" fill="#fff"/><circle cx="${NIDO.x}" cy="${NIDO.y}" r="0" fill="#000" class="relato__mordida"/><circle cx="${C.x}" cy="${C.y}" r="${C.hueco}" fill="#000" class="relato__hueco" style="opacity:0"/></mask>
            </defs>
            <g class="relato__giro" style="transform-origin:${C.x}px ${C.y}px">
              <circle cx="${C.x}" cy="${C.y}" r="${C.r}" fill="url(#rel-g)" mask="url(#rel-m)"/>
              <circle cx="${C.x}" cy="${C.y}" r="${C.r + 9}" class="relato__orbita"/>
            </g>
            <circle cx="${C.x}" cy="${C.y}" r="${NIDO.r}" class="relato__punto" fill="url(#rel-g)"/>
            <path class="relato__estela" d="" />
          </svg>
          <ol class="relato__marcas">${pasos.map(([n]) => `<li>${n}</li>`).join("")}</ol>
        </div>
        <div class="relato__textos">${pasos.map(([n, t, d], i) => `<div class="relato__paso" data-i="${i}"><span class="relato__n">${n}</span><p class="relato__titulo">${t}</p><p class="bajada">${d}</p></div>`).join("")}</div>
      </div>
    </div>`;
    const svg = el.querySelector(".relato__svg"), mord = svg.querySelector(".relato__mordida"), hueco = svg.querySelector(".relato__hueco");
    const punto = svg.querySelector(".relato__punto"), giro = svg.querySelector(".relato__giro"), estela = svg.querySelector(".relato__estela");
    const textos = [...el.querySelectorAll(".relato__paso")], marcas = [...el.querySelectorAll(".relato__marcas li")];
    const relato = el.querySelector(".relato");
    progreso(relato, (p0) => {
      // el relato dura lo que el bloque alto tarda en pasar por la pantalla
      const r = relato.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      const a = tramo(p, 0, 0.22), b = suave(tramo(p, 0.2, 0.45)), c = suave(tramo(p, 0.45, 0.72)), d = suave(tramo(p, 0.72, 0.95));
      giro.style.transform = `rotate(${lerp(-40, 0, suave(tramo(p, 0, 0.5)))}deg)`;
      mord.setAttribute("r", (MORDIDA * b).toFixed(2));
      // el punto sale del centro por la mordida (curva) y aterriza en su nido
      const cx = (1 - c) ** 2 * C.x + 2 * (1 - c) * c * 30 + c * c * NIDO.x, cy = (1 - c) ** 2 * C.y + 2 * (1 - c) * c * 78 + c * c * NIDO.y;
      punto.setAttribute("cx", cx.toFixed(2)); punto.setAttribute("cy", cy.toFixed(2));
      hueco.style.opacity = c > 0.02 ? 1 : 0;
      estela.setAttribute("d", c > 0.02 && c < 0.999 ? `M${C.x} ${C.y} Q30 78 ${cx.toFixed(1)} ${cy.toFixed(1)}` : "");
      estela.style.opacity = (1 - d) * (c > 0.02 ? 1 : 0);
      punto.style.transform = d > 0 && d < 1 ? `scale(${1 + Math.sin(d * Math.PI) * 0.08})` : "";
      punto.style.transformOrigin = `${cx}px ${cy}px`;
      const paso = Math.min(pasos.length - 1, Math.floor(p * pasos.length * 0.999));
      textos.forEach((t, i) => t.classList.toggle("activo", i === paso));
      marcas.forEach((m, i) => m.classList.toggle("activo", i <= paso));
      void a;
    });
  },

  /* ── Color: pigmentos de esmalte, A y B siempre a la vista, proporción que se ordena ── */
  async color(el) {
    const pal = raiz.dataset.paleta === "naranjo" ? "B · Mandarina" : "A · Teal";
    const acentos = [["--acento-claro", "--nombre-claro"], ["--acento", "--nombre-acento"], ["--acento-profundo", "--nombre-profundo"]];
    const nombre = (v) => getComputedStyle(raiz).getPropertyValue(v).trim().replace(/"/g, "");
    const neutros = [["--navy", "Navy"], ["--grafito", "Grafito"], ["--hueso", "Hueso"], ["--papel", "Papel"], ["--navy-profundo", "Navy profundo"], ["--tinta", "Tinta"]];
    const aa = (hex) => { const c = Math.max(contraste(hex, "#EDEEE8"), contraste(hex, "#16263A")); return c >= 4.5 ? "AA texto" : c >= 3 ? "AA grande" : "solo acento"; };
    const pigmento = (v, n, grande) => { const hex = colorDe(v); return `<figure class="pigmento ${grande ? "pigmento--grande" : ""}" style="--c:var(${v})">
      <div class="pigmento__esmalte"></div><figcaption><b>${n}</b><span class="mono">${hex}</span><span class="pigmento__aa">${aa(hex)}</span></figcaption></figure>`; };
    const PAL = { teal: [["Menta", "#91CEC4"], ["Teal", "#59BDB1"], ["Teal profundo", "#387E80"]], naranjo: [["Durazno", "#FFB98A"], ["Mandarina", "#FF6A13"], ["Brasa", "#B8420A"]] };
    const DEG = { teal: ["#91CEC4", "#387E80"], naranjo: ["#FFA05A", "#EE560E"] };
    cuerpo(el).innerHTML = `
      <div class="pigmentos"><p class="rotulo">Acentos · paleta ${pal} (activa)</p>
        <div class="pigmentos__fila">${acentos.map(([v, nn]) => pigmento(v, nombre(nn), true)).join("")}</div>
        <div class="esmalte-barra"><span>Degradado del isotipo</span></div>
      </div>
      <div class="ab">${["teal", "naranjo"].map((k) => `<div class="ab__col ${raiz.dataset.paleta === k ? "activa" : ""}">
          <p class="rotulo">${k === "teal" ? "A · Teal" : "B · Mandarina"}${raiz.dataset.paleta === k ? " · activa" : ""}</p>
          <div class="ab__chips">${PAL[k].map(([n, h]) => `<span style="--c:${h}"><i></i>${n}</span>`).join("")}</div>
          <div class="ab__deg" style="background:linear-gradient(90deg,${DEG[k][0]},${DEG[k][1]})"></div></div>`).join("")}
        <p class="chico ab__nota">Las dos paletas viven en todo el guion hasta que se elija una. Usa el comparador A | B del dock para verlas lado a lado.</p></div>
      <div class="pigmentos pigmentos--neutros"><p class="rotulo">Neutros · iguales en A y B</p><div class="pigmentos__fila">${neutros.map(([v, nn]) => pigmento(v, nn)).join("")}</div></div>
      <div class="proporcion-viva"><div><p class="titulo-3">La proporción</p><p class="chico">Cien fichas: así se reparte el color en cualquier pieza. Al llegar acá se ordenan solas.</p>
          <ul class="proporcion-viva__ley">${[["--hueso", "Hueso", 56], ["--papel", "Papel", 24], ["--navy", "Navy", 12], ["--grafito", "Grafito", 4], ["--acento", "Acento", 4]].map(([v, n, k]) => `<li><i style="background:var(${v})"></i>${n}<b>${k} %</b></li>`).join("")}</ul></div>
        <div class="mosaico" aria-hidden="true"></div></div>`;
    // mosaico 10×10: desordenado → ordenado (las fichas viajan a su lugar)
    const mosaico = el.querySelector(".mosaico");
    const reparto = [["--hueso", 56], ["--papel", 24], ["--navy", 12], ["--grafito", 4], ["--acento", 4]].flatMap(([v, k]) => Array(k).fill(v));
    const orden = reparto.map((_, i) => i), azar = orden.slice().sort((a, b) => ((a * 7919) % 101) - ((b * 7919) % 101));
    mosaico.innerHTML = reparto.map((v, i) => `<i style="background:var(${v});--d:${(i % 10) * 30 + Math.floor(i / 10) * 18}ms"></i>`).join("");
    const fichas = [...mosaico.children];
    const ubicar = (mapa) => fichas.forEach((f, i) => { const k = mapa[i]; f.style.setProperty("--x", (k % 10) * 10 + "%"); f.style.setProperty("--y", Math.floor(k / 10) * 10 + "%"); });
    ubicar(azar.map((_, i) => azar.indexOf(i)));
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { setTimeout(() => ubicar(orden), 300); o.disconnect(); } }, { threshold: 0.5 }).observe(mosaico);
  },

  /* ── Tipografía: cinética, espécimen interactivo, escala en escalera ── */
  async tipografia(el) {
    const letraActiva = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "SF Pro (del sistema)" : "Inter (respaldo de SF)";
    const frase = "Todo proceso tiene una salida.";
    const escala = [["Héroe", "--t-hero", 700], ["Título 1", "--t-1", 700], ["Título 2", "--t-2", 650], ["Título 3", "--t-3", 600], ["Cuerpo", "--t-cuerpo", 400], ["Chico", "--t-chico", 400], ["Rótulo", "--t-rotulo", 600]];
    cuerpo(el).innerHTML = `
      <p class="cinetica"><span class="solo-lector">${frase}</span>${(() => { let i = 0; return frase.split(" ").map((p) => `<b class="cinetica__palabra" aria-hidden="true">${[...p].map((c) => `<span style="--i:${i++}">${c}</span>`).join("")}</b>`).join(" "); })()}</p>
      ${pieza({
        vivo: `<div class="especimen">
            <div class="especimen__aa" data-aa>Aa</div>
            <div class="especimen__ctrl pila">
              <p class="rotulo">Este equipo muestra: <b>${letraActiva}</b></p>
              <label class="deslizador"><span class="deslizador__cabeza"><b>Peso</b><output data-o="peso">650</output></span><input type="range" min="300" max="800" step="10" value="650" data-c="peso"></label>
              <label class="deslizador"><span class="deslizador__cabeza"><b>Tracking</b><output data-o="track">−3,5 %</output></span><input type="range" min="-60" max="20" value="-35" data-c="track"></label>
              <label class="deslizador"><span class="deslizador__cabeza"><b>Tamaño</b><output data-o="tam">180 px</output></span><input type="range" min="40" max="260" value="180" data-c="tam"></label>
              <p class="chico">Los títulos se aprietan como SF Display; el texto chico se abre. Poppins queda solo para el logo.</p>
            </div></div>`,
        anatomia: `<div class="tipo-anatomia" data-anatomia><span class="tipo-anatomia__muestra" data-cota="caja" data-cota-texto="caja de la línea">Hxgé</span>
            <i class="tipo-linea" style="--y:22%"><span>ascendente</span></i><i class="tipo-linea" style="--y:33%"><span>alto de mayúscula</span></i><i class="tipo-linea" style="--y:52%"><span>alto de x</span></i><i class="tipo-linea tipo-linea--base" style="--y:78%"><span>línea base</span></i><i class="tipo-linea" style="--y:92%"><span>descendente</span></i></div>`,
        uso: `<div class="pila">${codigo(`--letra: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;\n.titulo-1 { font-size: var(--t-1); font-weight: 700; letter-spacing: -0.032em; }\n.cuerpo   { font-size: 17px; line-height: 1.5; letter-spacing: -0.011em; }`)}<p class="chico">Pesos permitidos: 400 cuerpo · 500 interfaz · 600 énfasis · 650–700 títulos.</p></div>`,
      })}
      <div class="escalera-tipo">${escala.map(([n, v, w], i) => `<div class="escalera-tipo__fila" style="--i:${i}"><span class="rotulo">${n} · <span class="mono" data-tam="${v}"></span></span><p style="font-size:var(${v});font-weight:${w};letter-spacing:${w >= 650 ? "-0.03em" : "-0.01em"};${n === "Rótulo" ? "text-transform:uppercase;letter-spacing:.04em;" : ""}">${["Todo proceso", "Diagnóstico", "Dónde se pierde el tiempo", "Cotizaciones atrasadas", "Quillay cotiza en planillas y sigue por WhatsApp.", "Última actualización hace 4 minutos.", "Estado del proceso"][i]}</p></div>`).join("")}</div>
      <div class="numeros-vivos"><div><span class="rotulo">Tabulares · montos que se comparan</span><p class="numeros-vivos__n" data-contar="31">0</p><span class="chico">horas por semana</span></div>
        <div><span class="rotulo">Pesos chilenos</span><p class="numeros-vivos__n" data-contar="88000000" data-pesos>$ 0</p><span class="chico">ventas de octubre (ejemplo)</span></div></div>`;
    activarPiezas(el);
    el.querySelectorAll("[data-tam]").forEach((s) => { const v = getComputedStyle(raiz).getPropertyValue(s.dataset.tam).trim(); s.textContent = v.includes("clamp") ? "fluido" : Math.round(parseFloat(v) * (v.includes("rem") ? 16 : 1)) + " px"; });
    const aa = el.querySelector("[data-aa]");
    const aplicar = () => {
      const g = (k) => el.querySelector(`[data-c="${k}"]`).value;
      aa.style.fontWeight = g("peso"); aa.style.letterSpacing = g("track") / 1000 + "em"; aa.style.fontSize = g("tam") + "px";
      el.querySelector('[data-o="peso"]').textContent = g("peso"); el.querySelector('[data-o="track"]').textContent = (g("track") / 10).toLocaleString("es-CL") + " %"; el.querySelector('[data-o="tam"]').textContent = g("tam") + " px";
    };
    el.querySelectorAll("[data-c]").forEach((r) => r.addEventListener("input", aplicar)); aplicar();
    el.querySelectorAll("[data-contar]").forEach((n) => contar(n, +n.dataset.contar, { duracion: 1800, formato: n.hasAttribute("data-pesos") ? (v) => "$ " + Math.round(v).toLocaleString("es-CL") : (v) => Math.round(v) + " h" }));
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { el.querySelector(".cinetica").classList.add("viva"); o.disconnect(); } }, { threshold: 0.6 }).observe(el.querySelector(".cinetica"));
  },

  /* ── Retícula y espacio: una composición real con su retícula y sus medidas ── */
  /* ── Espacio: se mide con el punto. Los aires entre piezas se ven como el punto de la marca, del tamaño del aire. ── */
  async espacio(el) {
    const pasos = [4, 8, 12, 16, 24, 32, 48, 64, 96, 144];
    cuerpo(el).innerHTML = pieza({
      vivo: `<div class="espacio2" data-espacio>
          <div class="espacio2__lamina papel" data-lamina>
            <div class="espacio2__comp" data-comp>
              <p class="ceja">Diagnóstico</p>
              <p class="titulo-1">Dónde se pierde el tiempo</p>
              <p class="bajada">Medimos antes de proponer. Sin medir, todo es opinión.</p>
              <div class="fila-botones">${boton("Agendar diagnóstico", { icoFin: "arrow-right" })}${boton("Ver el plan", { variante: "texto" })}</div>
            </div>
            <div class="espacio2__capa" aria-hidden="true" data-capa></div>
          </div>
          <div class="espacio2__lado">
            <label class="interruptor"><span class="interruptor__texto"><b>Ver los espacios</b><span class="chico">Cada aire, medido con el punto</span></span><button type="button" role="switch" aria-checked="true" class="interruptor__boton" data-ver><i></i></button></label>
            <ul class="espacio2__ley" data-ley></ul>
          </div></div>`,
      uso: codigo(`--e-1: 4px; --e-2: 8px; --e-3: 12px; --e-4: 16px; --e-5: 24px;\n--e-6: 32px; --e-7: 48px; --e-8: 64px; --e-9: 96px; --e-10: 144px;\n--ancho: 1180px; --gutter: clamp(16px, 4vw, 40px);`),
    }) + `<div class="escala-punto"><p class="titulo-3">La escala es el punto</p>
        <div class="escala-punto__fila">${pasos.map((p, i) => `<button type="button" class="escala-punto__paso" style="--d:${p}px;--i:${i}" aria-label="e-${i + 1}: ${p} px"><i></i><b>${p}</b><span class="mono">e-${i + 1}</span></button>`).join("")}</div>
        <p class="chico">El punto del isotipo mide 0,25 L: es la unidad del resguardo y el origen de la escala. Entre piezas relacionadas 8–16 · entre grupos 24–48 · entre secciones 96–144.</p></div>`;
    activarPiezas(el);
    const caja = el.querySelector("[data-espacio]"), lam = el.querySelector("[data-lamina]"), comp = el.querySelector("[data-comp]"), capa = el.querySelector("[data-capa]"), ley = el.querySelector("[data-ley]");
    const nombres = ["ceja → título", "título → texto", "texto → acciones"];
    const medir = () => {
      const base = lam.getBoundingClientRect(), hijos = [...comp.children], marcas = [];
      for (let k = 0; k < hijos.length - 1; k++) {
        const a = hijos[k].getBoundingClientRect(), b = hijos[k + 1].getBoundingClientRect(), g = Math.round(b.top - a.bottom);
        if (g > 1) marcas.push({ x: a.left - base.left, y: a.bottom - base.top, g, n: nombres[k] || "" });
      }
            capa.innerHTML = marcas.map((m, i) => `<span class="espacio2__marca" style="left:${m.x - 12}px;top:${m.y}px;--g:${m.g}px;--i:${i}"><b>${m.g}</b><i></i></span>`).join("");
      ley.innerHTML = marcas.map((m) => `<li><i style="--g:${Math.min(m.g, 28)}px"></i><span>${m.n}</span><b class="mono">${m.g}</b></li>`).join("");
    };
    requestAnimationFrame(medir); new ResizeObserver(medir).observe(lam); document.fonts?.ready.then(medir);
    el.querySelector("[data-ver]").addEventListener("click", (e) => { const si = e.currentTarget.getAttribute("aria-checked") !== "true"; caja.classList.toggle("espacio2--oculto", !si); });
    el.querySelectorAll(".escala-punto__paso").forEach((b) => b.addEventListener("click", () => { b.classList.remove("salta"); void b.offsetWidth; b.classList.add("salta"); }));
  },

  /* ── Forma y profundidad: objetos de cerámica bajo una luz que se arrastra ── */
  async forma(el) {
    cuerpo(el).innerHTML = `<div class="banco-luz" data-luz style="--lx:30%;--ly:12%">
        <div class="banco-luz__objetos">
          <div class="objeto ceramica" style="border-radius:8px"><b>r-1 · 8</b><span>Insignias</span></div>
          <div class="objeto ceramica" style="border-radius:12px"><b>r-2 · 12</b><span>Botones y campos</span></div>
          <div class="objeto ceramica objeto--alto" style="border-radius:16px"><b>r-3 · 16</b><span>Tarjetas</span></div>
          <div class="objeto ceramica objeto--ancho" style="border-radius:24px"><b>r-4 · 24</b><span>Hojas y diálogos</span></div>
          <div class="objeto ceramica objeto--pildora" style="border-radius:999px"><b>pleno</b><span>Píldoras y la marca</span></div>
        </div>
        <button type="button" class="banco-luz__sol" aria-label="Fuente de luz: arrástrala" data-sol></button>
        <p class="banco-luz__nota rotulo">Arrastra la luz: las sombras se mueven como en un objeto real.</p>
      </div>
      <div class="capas-3d"><div class="capas-3d__pila">${[["Página", 0], ["Dock · z 50", 50], ["Menús · z 60", 60], ["Hojas y diálogos · z 70", 70], ["Avisos · z 80", 80]].map(([n, z], i) => `<div class="capas-3d__plano" style="--i:${i}"></div>`).join("")}<ol class="capas-3d__rotulos">${[["Página", 0], ["Dock · z 50", 50], ["Menús · z 60", 60], ["Hojas y diálogos · z 70", 70], ["Avisos · z 80", 80]].map(([n], i) => `<li style="--i:${i}">${n}</li>`).join("")}</ol></div>
        <div><p class="titulo-3">Capas</p><p class="chico">Una sola escala de profundidad, centralizada en los tokens. Pasa el mouse: la pila se abre.</p></div></div>`;
    const banco = el.querySelector("[data-luz]"), sol = el.querySelector("[data-sol]");
    const poner = (x, y) => { banco.style.setProperty("--lx", x + "%"); banco.style.setProperty("--ly", y + "%"); banco.style.setProperty("--sx", (50 - x) * 0.45 + "px"); banco.style.setProperty("--sy", Math.max(4, (60 - y) * 0.5) + "px"); banco.style.setProperty("--sb", 10 + Math.hypot(50 - x, 60 - y) * 0.2 + "px"); };
    innerWidth < 760 ? poner(84, 5) : poner(30, 12);
    sol.addEventListener("pointerdown", (e) => {
      sol.setPointerCapture(e.pointerId);
      const mover = (ev) => { const r = banco.getBoundingClientRect(); poner(Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100)), Math.max(0, Math.min(100, ((ev.clientY - r.top) / r.height) * 100))); };
      sol.addEventListener("pointermove", mover); sol.addEventListener("pointerup", () => sol.removeEventListener("pointermove", mover), { once: true });
    });
    sol.addEventListener("keydown", (e) => { const s = getComputedStyle(banco); let x = parseFloat(s.getPropertyValue("--lx")), y = parseFloat(s.getPropertyValue("--ly")); if (e.key === "ArrowLeft") x -= 5; if (e.key === "ArrowRight") x += 5; if (e.key === "ArrowUp") y -= 5; if (e.key === "ArrowDown") y += 5; poner(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y))); });
  },

  /* ── Material: el banco de materiales ── */
  async material(el) {
    cuerpo(el).innerHTML = `<div class="materiales">${[["ceramica", "Cerámica esmaltada", "Lo que se toca: botones, controles, fichas. Luz desde arriba, canto iluminado, se hunde al presionar."], ["papel", "Papel", "Lo que flota: menús, avisos, tooltips. Plano, con grano fino y una sombra larga."], ["bizcocho", "Bizcocho", "Lo que contiene: superficies grandes y fondos. Porcelana sin esmalte: grano visible, nada de brillo."]].map(([k, n, d]) => `
        <figure class="material material--${k}" data-material><div class="material__muestra ${k === "ceramica" ? "ceramica" : k === "papel" ? "papel" : ""}"></div>
          <div class="material__macro" aria-hidden="true"></div><figcaption><b>${n}</b><p class="chico">${d}</p></figcaption></figure>`).join("")}</div>
      <div class="material-manifiesto"><p class="titulo-2">¿Por qué mate?</p><p class="bajada">Porque Optimizo no promete brillo: deja cosas funcionando. Lo mate se siente fabricado, hecho a mano, durable. El grano es la huella del taller; la precisión, la de la ingeniería.</p>
        <label class="deslizador"><span class="deslizador__cabeza"><b>Grano en todo el guion</b><output data-o>0,70</output></span><input type="range" min="0" max="1.2" step="0.05" value="0.7" data-grano></label></div>`;
    el.querySelectorAll("[data-material]").forEach((m) => m.addEventListener("pointermove", (e) => { const r = m.getBoundingClientRect(); m.style.setProperty("--lx", ((e.clientX - r.left) / r.width) * 100 + "%"); m.style.setProperty("--ly", ((e.clientY - r.top) / r.height) * 100 + "%"); }));
    el.querySelector("[data-grano]").addEventListener("input", (e) => { raiz.style.setProperty("--grano-opacidad", e.target.value); el.querySelector("[data-o]").textContent = String(e.target.value).replace(".", ","); });
  },

  /* ── Íconos: cada uno con su gesto, y una retícula de construcción ── */
  async iconos(el) {
    const gestos = { gira: ["gear-six", "arrow-clockwise", "sort-ascending"], empuja: ["arrow-right", "arrow-up-right", "upload-simple", "download-simple", "truck", "path", "flow-arrow"], late: ["check-circle", "warning-circle", "info", "x-circle", "lightning", "target", "brain", "chat-circle-text"], balancea: ["users-three", "handshake", "buildings", "package", "receipt", "calendar-blank", "clock", "files", "folder-open"] };
    const gestoDe = (n) => Object.entries(gestos).find(([, l]) => l.includes(n))?.[0] || "late";
    cuerpo(el).innerHTML = `<div class="iconos-v2">
        <div class="iconos-v2__construccion ceramica--hueso"><div class="iconos-v2__reticula" aria-hidden="true"><i class="k-circulo"></i><i class="k-cuadro"></i><i class="k-vertical"></i><i class="k-horizontal"></i></div>
          <div class="iconos-v2__grande" data-grande>${icono("flow-arrow", { tam: 220 })}</div><p class="rotulo" data-nombre>flow-arrow · 256 unidades · trazo 1,5 (light)</p></div>
        <div class="pila"><label class="tabla-datos__buscar"><svg class="icono" data-icono="magnifying-glass" width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"></svg><input type="search" placeholder="Buscar ícono" aria-label="Buscar ícono" data-filtro></label>
          <ul class="iconos-v2__rejilla">${ICONOS_IDENTIDAD.map((n) => `<li><button type="button" class="icono-celda" data-n="${n}" data-gesto="${gestoDe(n)}" aria-label="${n}">${icono(n, { tam: 26 })}<span>${n}</span></button></li>`).join("")}</ul>
          <p class="chico">Pasa el mouse: cada ícono hace su gesto (gira, empuja, late, se balancea). Clic: se ve en la retícula de construcción.</p></div></div>`;
    await rellenarIconos();
    const grande = el.querySelector("[data-grande]"), nombre = el.querySelector("[data-nombre]");
    el.querySelectorAll(".icono-celda").forEach((b) => b.addEventListener("click", () => { grande.innerHTML = icono(b.dataset.n, { tam: 220 }); rellenarIconos(); nombre.textContent = `${b.dataset.n} · 256 unidades · trazo 1,5 (light)`; grande.animate([{ transform: "scale(.9)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" }); }));
    el.querySelector("[data-filtro]").addEventListener("input", (e) => { const q = e.target.value.trim().toLowerCase(); el.querySelectorAll(".icono-celda").forEach((b) => (b.parentElement.hidden = !!q && !b.dataset.n.includes(q))); });
  },
};
export const REPINTAR_IDENTIDAD2 = ["color"];
