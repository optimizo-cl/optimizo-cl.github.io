/* Capítulo 7 · Manual de marca (fase 12): el brandbook sale del sistema real, no de láminas aparte. */
import { marco, rejilla } from "../kit/guion.js?v=19f4b98";
import { isotipo, logo, LADO } from "../kit/marca.js?v=19f4b98";
import { icono } from "../kit/iconos.js?v=19f4b98";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const raiz = document.documentElement;
const base = new URL("../../", import.meta.url).href; // raíz del guion, sirve desde index.html y desde web/

// Proporciones medidas del logo (construir_logo.py): ancho total 3,23 × el isotipo
const ANCHO_LOGO = 446.654;

// CMYK: paleta A del guideline v0 (medida por el diseñador); B y neutros nuevos, conversión referencial (pedir prueba de color a la imprenta).
export const COLORES = {
  teal: [["Menta", "#91CEC4", "145, 206, 196", "47, 0, 29, 0"], ["Teal", "#59BDB1", "89, 189, 177", "64, 0, 37, 0"], ["Teal profundo", "#387E80", "56, 126, 128", "76, 31, 45, 15"], ["Teal texto", "#337475", "51, 116, 117", "79, 36, 46, 20 *"]],
  naranjo: [["Durazno", "#FFB98A", "255, 185, 138", "0, 30, 47, 0 *"], ["Mandarina", "#FF6A13", "255, 106, 19", "0, 70, 95, 0 *"], ["Brasa", "#B8420A", "184, 66, 10", "15, 82, 100, 5 *"]],
  neutros: [["Navy", "#26405B", "38, 64, 91", "91, 69, 40, 33"], ["Grafito", "#424E4E", "66, 78, 78", "69, 50, 52, 47"], ["Hueso", "#EDEEE8", "237, 238, 232", "9, 5, 10, 0"], ["Papel", "#F6F6F1", "246, 246, 241", "4, 2, 6, 0 *"], ["Navy profundo", "#16263A", "22, 38, 58", "92, 76, 45, 55 *"]],
};

export const manual = {
  async "manual-logo"(el) {
    const L = await logo();
    const isoW = (LADO / ANCHO_LOGO) * 100, sep = ((LADO * 0.29) / ANCHO_LOGO) * 100, resg = 25;
    cuerpo(el).innerHTML = `${rejilla([
      marco("Construcción", `<div class="construccion"><div class="construccion__logo">${await logo()}
          <div class="construccion__guia construccion__guia--iso" style="width:${isoW}%"><span>1 L</span></div>
          <div class="construccion__guia construccion__guia--sep" style="left:${isoW}%;width:${sep}%"><span>0,29 L</span></div>
          <div class="construccion__guia construccion__guia--o" style="left:${isoW + sep}%"><span>«o» = 0,247 L</span></div></div></div>`,
        { ancho: true, nota: "L = lado del isotipo. La «o» del logotipo mide 0,247 L y su centro está a la altura del centro del isotipo. Ancho total: 3,23 L." }),
      marco("Área de resguardo", `<div class="resguardo"><div class="resguardo__caja">${await logo()}</div></div>`, { nota: `Alrededor del logo queda libre ${resg} % del isotipo (el diámetro del punto) por cada lado. Nada entra en esa zona.` }),
      marco("Tamaños mínimos", `<div class="minimos"><div><span style="width:96px">${await logo()}</span><span class="rotulo">Logo · 96 px / 24 mm</span></div><div><span style="width:20px">${isotipo()}</span><span class="rotulo">Isotipo · 16 px / 5 mm</span></div></div>`, { nota: "Bajo 96 px el logotipo deja de leerse: se usa solo el isotipo." }),
      marco("Versiones", `<div class="versiones">${[["Principal", "", ""], ["Sobre oscuro", "var(--navy)", "var(--hueso)"], ["Un color", "var(--papel)", "var(--navy)"]].map(([n, f, c], i) => `<div class="version" style="${f ? `background:${f};` : ""}${c ? `color:${c}` : ""}">${i === 2 ? `<img src="${base}assets/logo/${raiz.dataset.paleta === "naranjo" ? "naranjo/" : ""}optimizo-logo-mono-navy.svg" alt="">` : L}<span class="rotulo" ${i === 1 ? 'style="color:rgba(237,238,232,.75)"' : ""}>${n}</span></div>`).join("")}</div>`, { ancho: true }),
    ])}`;
  },

  async "usos-incorrectos"(el) {
    const L = await logo();
    const malos = [
      ["Deformar", `<span style="display:block;transform:scaleX(1.45)">${L}</span>`],
      ["Rotar", `<span style="display:block;transform:rotate(-12deg)">${L}</span>`],
      ["Colores fuera de la paleta", `<span style="display:block;filter:hue-rotate(150deg) saturate(1.8)">${L}</span>`],
      ["Sombras o efectos", `<span style="display:block;filter:drop-shadow(4px 6px 0 rgba(0,0,0,.45))">${L}</span>`],
      ["Fondo sin contraste", `<span style="display:block;background:var(--acento-profundo);padding:14px;border-radius:10px">${L}</span>`],
      ["Separar el punto o moverlo", `<span class="mal-punto">${L}</span>`],
      ["Cambiar la letra", `<span class="mal-letra">${isotipo()}<b>optimizo</b></span>`],
      ["Encerrar en una forma", `<span style="display:block;padding:18px;border:3px solid var(--navy);border-radius:999px">${L}</span>`],
    ];
    cuerpo(el).innerHTML = `<div class="incorrectos">${malos.map(([t, h]) => `<figure class="incorrecto mate"><div class="incorrecto__vista">${h}</div><figcaption>${icono("x-circle", { tam: 18 })}<span>${t}</span></figcaption></figure>`).join("")}</div>
      <p class="chico">El logo se usa siempre desde los archivos de Descargas. Nunca se redibuja ni se escribe con una fuente.</p>`;
  },

  async "manual-color"(el) {
    const tabla = (filas) => `<table class="tabla-color"><thead><tr><th><span class="solo-lector">Muestra</span></th><th>Nombre</th><th>HEX</th><th>RGB</th><th>CMYK</th></tr></thead><tbody>${filas.map(([n, hex, rgb, cmyk]) => `<tr><td><i style="background:${hex}"></i></td><td><b>${n}</b></td><td class="mono">${hex}</td><td class="mono">${rgb}</td><td class="mono">${cmyk}</td></tr>`).join("")}</tbody></table>`;
    cuerpo(el).innerHTML = `${rejilla([
      marco("Paleta A · Teal", tabla(COLORES.teal)), marco("Paleta B · Mandarina (en prueba)", tabla(COLORES.naranjo)),
      marco("Neutros (ambas paletas)", tabla(COLORES.neutros), { ancho: true, nota: "* CMYK referencial (conversión, no medido): antes de imprimir, pedir prueba de color. Los demás vienen del guideline del diseñador." }),
      marco("Proporción de uso", `<div class="proporcion"><i style="flex:56;background:var(--hueso)">Hueso 56 %</i><i style="flex:24;background:var(--papel)">Papel 24 %</i><i style="flex:12;background:var(--navy);color:var(--hueso)">Navy 12 %</i><i style="flex:4;background:var(--grafito);color:var(--hueso)"></i><i style="flex:4;background:var(--acento)"></i></div>`, { ancho: true, nota: "El acento señala (≤ 5 %): botón principal, el punto, un dato. Nunca fondos grandes de acento." }),
    ])}`;
  },

  async "manual-tipo"(el) {
    const filas = [["Logo", "Poppins ExtraBold, en trazos", "Nunca se escribe: se usa el archivo"], ["Sitio y app", "SF del sistema · Inter de respaldo", "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Inter\""], ["PDF, presentaciones, Figma", "Inter", "Archivo fijo: se ve igual en cualquier equipo"], ["Google Docs y Slides", "Inter", "Disponible en Google Fonts"], ["Correo (HTML)", "Fuente del sistema", "-apple-system, Segoe UI, Helvetica, Arial"], ["Redes y piezas", "Inter (o SF Pro en Mac)", "Títulos 700 con tracking negativo"]];
    cuerpo(el).innerHTML = `<div class="desplaza-x"><table class="tabla-color tabla-tipo"><thead><tr><th>Soporte</th><th>Letra</th><th>Detalle</th></tr></thead><tbody>${filas.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td class="chico">${c}</td></tr>`).join("")}</tbody></table></div>
      ${rejilla([marco("Licencias", `<ul class="lista-punto"><li><b>Poppins</b> e <b>Inter</b>: licencia abierta OFL, uso comercial libre.</li><li><b>SF Pro</b>: la pone el sistema de Apple; no se distribuye ni se incrusta.</li><li><b>Made Tommy</b> (versión anterior): no se usa.</li></ul>`), marco("Pesos permitidos", `<p class="chico">400 cuerpo · 500 interfaz · 600 énfasis y botones · 650–700 títulos. Nada bajo 400 ni sobre 700 en texto.</p>`)])}`;
  },

  async voz(el) {
    const pares = [["Automatizamos todos tus procesos con IA.", "Dejamos funcionando tus cotizaciones en un CRM: de 2,5 días a minutos."], ["Soluciones disruptivas de transformación digital.", "Entramos, entendemos cómo trabajas y lo dejamos funcionando."], ["Error: campo inválido.", "El RUT no calza con su dígito verificador. Revisa el número."], ["¡¡Revoluciona tu empresa hoy!!", "Treinta minutos para entender dónde se traba tu operación."]];
    cuerpo(el).innerHTML = `${rejilla([
      marco("Cómo habla Optimizo", `<ul class="lista-punto"><li><b>Como una consultora que sabe</b>: calma, concreta, sin apuro.</li><li><b>De tú</b>, español de Chile, sin modismos.</li><li><b>Con números</b> cuando los hay: horas, días, pesos.</li><li><b>Resultados, no tecnología</b>: se habla de cotizar más rápido, no de «IA».</li></ul>`),
      marco("Palabras", `<div class="palabras"><div><span class="rotulo">Sí</span><p>implementar · dejar funcionando · proceso · equipo · medir · ordenar · salida · acompañar</p></div><div><span class="rotulo">No</span><p>disruptivo · revolucionar · sinergia · automatizar todo · inteligencia artificial (como promesa) · solución integral</p></div></div>`),
      marco("Antes y después", `<div class="pares">${pares.map(([no, si]) => `<div class="par"><p><span class="no">No</span>${no}</p><p><span class="si">Sí</span>${si}</p></div>`).join("")}</div>`, { ancho: true }),
    ])}`;
  },

  async "manual-imagen"(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Sí", `<ul class="lista-punto"><li>Diagramas de procesos y flujos con nodos mate.</li><li>Interfaces reales del producto (capturas limpias).</li><li>El isotipo y el punto como protagonistas.</li><li>Datos y números grandes.</li></ul>`),
      marco("No", `<ul class="lista-punto lista-no"><li>Fotos de stock de personas en reunión.</li><li>Robots, cerebros brillantes, circuitos, neón.</li><li>Ilustraciones 3D tipo «plastilina».</li><li>Partículas o efectos sin función.</li></ul>`),
      marco("Reglas del diagrama", `<ul class="lista-punto"><li>Nodos: superficie papel, borde 1 px, radio 14, texto 600.</li><li>Líneas: 1,5 px, color borde fuerte; el camino activo en acento.</li><li>Un solo punto que recorre. Nunca flechas de colores.</li><li>Máximo 9 nodos por diagrama.</li></ul>`, { ancho: true }),
    ])}`;
  },

  async aplicaciones(el) {
    cuerpo(el).innerHTML = `<div class="aplicaciones">
        <a class="aplicacion mate" href="#landing"><span class="aplicacion__vista aplicacion__vista--web">${isotipo()}<b>Todo proceso tiene una salida.</b></span><span>Sitio web</span></a>
        <a class="aplicacion mate" href="#nav-app"><span class="aplicacion__vista aplicacion__vista--app"><i></i><i></i><i></i></span><span>App y paneles</span></a>
        <a class="aplicacion mate" href="#correos"><span class="aplicacion__vista aplicacion__vista--correo">${isotipo()}<i></i><i></i><i class="corta"></i></span><span>Correos</span></a>
        <a class="aplicacion mate" href="#redes"><span class="aplicacion__vista aplicacion__vista--redes"><b>31 h</b></span><span>Redes</span></a>
        <a class="aplicacion mate" href="#presentacion"><span class="aplicacion__vista aplicacion__vista--lamina"><b>Cotizar en minutos</b></span><span>Presentaciones</span></a>
        <a class="aplicacion mate" href="#papeleria"><span class="aplicacion__vista aplicacion__vista--tarjeta">${isotipo()}</span><span>Papelería</span></a>
        <a class="aplicacion mate" href="#sellos"><span class="aplicacion__vista aplicacion__vista--sello"><img src="${base}assets/productos/medula-marca-blanca.svg" alt=""></span><span>Productos con sello</span></a>
        <a class="aplicacion mate" href="#iconos-app"><span class="aplicacion__vista aplicacion__vista--icono">${isotipo()}</span><span>Íconos de app</span></a>
      </div><p class="chico">Cada aplicación lleva a su sección del guion, donde está funcionando.</p>`;
  },

  async descargas(el) {
    const p = raiz.dataset.paleta === "naranjo" ? "naranjo/" : "";
    const archivo = (ruta, nombre, tipo) => `<a class="descarga" href="${base}${ruta}" download>${icono(tipo === "PDF" ? "file-pdf" : tipo === "ZIP" ? "file-zip" : "file-svg", { tam: 22 })}<span><b>${nombre}</b><span class="rotulo">${tipo}</span></span>${icono("download-simple", { tam: 18 })}</a>`;
    cuerpo(el).innerHTML = `${rejilla([
      marco("Paquete completo", `<div class="pila">${archivo("assets/descargas/optimizo-marca.zip", "Todos los logos (SVG + PNG) y la paleta", "ZIP")}${archivo("assets/descargas/manual-optimizo.pdf", "Manual de marca", "PDF")}</div>`, { nota: "El paquete trae las dos paletas mientras se elige una." }),
      marco(`Logos sueltos · paleta ${p ? "B" : "A"}`, `<div class="pila">${[["optimizo-logo.svg", "Logo principal"], ["optimizo-logo-sobre-oscuro.svg", "Logo sobre oscuro"], ["optimizo-isotipo.svg", "Isotipo"], ["optimizo-logo-mono-navy.svg", "Logo en un color (navy)"], ["optimizo-logo-mono-hueso.svg", "Logo en un color (hueso)"]].map(([f, n]) => archivo(`assets/logo/${p}${f}`, n, "SVG")).join("")}</div>`),
    ])}`;
  },
};
