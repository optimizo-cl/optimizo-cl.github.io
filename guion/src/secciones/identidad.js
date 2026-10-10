/* Capítulo 1 · Identidad. Las secciones solo MUESTRAN; las piezas viven en src/kit. */
import { SECCIONES } from "../plan.js?v=19f4b98";
import { isotipo, logo } from "../kit/marca.js?v=19f4b98";
import { contraste, colorDe } from "../kit/color.js?v=19f4b98";
import { icono } from "../kit/iconos.js?v=19f4b98";
import { marco, rejilla } from "../kit/guion.js?v=19f4b98";

const raiz = document.documentElement;
const paletaActiva = () => raiz.dataset.paleta || "teal";
const base = new URL("../../", import.meta.url).href; // raíz del guion (funciona también desde web/)
const rutaLogos = () => `${base}assets/logo/${paletaActiva() === "naranjo" ? "naranjo/" : ""}`;
const acentosMono = () => (paletaActiva() === "naranjo" ? ["durazno", "mandarina", "brasa"] : ["menta", "teal", "teal-profundo"]);
const cuerpo = (el) => el.querySelector(".seccion__cuerpo");

export const ICONOS_IDENTIDAD = [
  "chart-line-up", "flow-arrow", "gear-six", "users-three", "buildings", "package", "truck", "receipt", "calendar-blank",
  "clock", "files", "folder-open", "magnifying-glass", "database", "plugs-connected", "brain", "robot", "chat-circle-text",
  "envelope-simple", "phone", "whatsapp-logo", "check-circle", "warning-circle", "info", "x-circle", "arrow-right",
  "arrow-up-right", "plus", "minus", "dots-three", "caret-down", "funnel", "sort-ascending", "download-simple",
  "upload-simple", "pencil-simple", "trash", "copy", "link-simple", "lock-simple", "shield-check", "lightning",
  "target", "path", "tree-structure", "kanban", "currency-circle-dollar", "handshake",
];

export const identidad = {
  async portada(el) {
    const listas = SECCIONES.filter((x) => x.estado === "listo").length;
    el.classList.add("portada");
    el.innerHTML = `
      <div class="portada__escena">${isotipo({ clase: "portada__iso firma-escape" })}</div>
      <div class="portada__texto">
        <p class="ceja">Guion visual · Optimizo</p>
        <h1 class="portada__frase">Todo proceso<br>tiene una salida.</h1>
        <p class="bajada">El lenguaje completo de la marca, funcionando: color, letra, material, movimiento, componentes,
          formularios y piezas. Todo lo que se construya después sale de acá.</p>
        <p class="rotulo">${listas} de ${SECCIONES.length} secciones listas · se actualiza en cada avance</p>
      </div>`;
  },

  async concepto(el) {
    cuerpo(el).innerHTML = `
      <div class="concepto">
        <figure class="concepto__fig mate">${isotipo({ clase: "concepto__iso" })}
          <figcaption class="rotulo">El disco: la empresa dando vueltas sobre sí misma. La mordida: la salida. El punto: Optimizo.</figcaption></figure>
        <div class="concepto__texto">
          <p class="titulo-2">Un disco cerrado y un punto que se escapa por la mordida.</p>
          <p class="bajada">Así trabaja Optimizo: entra a la empresa, encuentra dónde está trabado el proceso y lo convierte en
            movimiento ordenado. El punto es la firma de la marca: aparece en la portada, en la carga, en el progreso, en los diagramas.</p>
          <ul class="lista-punto">
            <li><b>Sobria.</b> Calma, aire, autoridad: habla una consultora que sabe.</li>
            <li><b>Táctil.</b> Superficies mate con grano, como papel o cerámica.</li>
            <li><b>Precisa.</b> Diagramas que explican; nada decorativo sin función.</li>
            <li><b>Lenta.</b> Lo que se mueve, se mueve con calma. Una sola firma por pantalla.</li>
          </ul>
        </div>
      </div>`;
  },

  async logo(el) {
    const r = rutaLogos();
    const monos = ["hueso", ...acentosMono(), "grafito", "navy"];
    cuerpo(el).innerHTML = `
      <div class="logo-fondos">
        <div class="logo-fondo mate" style="--sup:var(--blanco)">${await logo()}</div>
        <div class="logo-fondo mate" style="--sup:var(--hueso)">${await logo()}</div>
        <div class="logo-fondo logo-fondo--oscuro mate">${await logo()}</div>
      </div>
      <div class="logo-monos">
        ${monos.map((m) => `<div class="logo-mono mate ${m === "hueso" ? "logo-mono--oscuro" : ""}"><img src="${r}optimizo-logo-mono-${m}.svg" alt="Logo en ${m}" loading="lazy"><span class="rotulo">${m.replace("-", " ")}</span></div>`).join("")}
      </div>
      <p class="chico">Logotipo en Poppins ExtraBold convertido a trazos (no se escribe con la fuente). La «o» mide 24,7 % del isotipo
        y la separación es 29 %: medidas del logo original. Construcción, resguardo y mínimos van en el Manual.</p>`;
  },

  async color(el) {
    const acentos = [["--acento-claro", "--nombre-claro"], ["--acento", "--nombre-acento"], ["--acento-profundo", "--nombre-profundo"]];
    const neutros = [["--navy", "Navy"], ["--navy-profundo", "Navy profundo"], ["--grafito", "Grafito"], ["--hueso", "Hueso"], ["--papel", "Papel"], ["--tinta", "Tinta"]];
    const ficha = (hex, nombre, varCss) => `
      <div class="muestra mate">
        <div class="muestra__color" style="background:var(${varCss})"></div>
        <div class="muestra__dato"><b>${nombre}</b><span class="mono">${hex}</span>
          <span class="rotulo">sobre hueso ${contraste(hex, "#EDEEE8").toFixed(2)} · sobre blanco ${contraste(hex, "#FFFFFF").toFixed(2)}</span></div>
      </div>`;
    const nombre = (v) => getComputedStyle(raiz).getPropertyValue(v).trim().replace(/"/g, "");
    const pal = paletaActiva() === "naranjo" ? "B · Mandarina" : "A · Teal";
    const estados = [["--exito", "--exito-suave", "Éxito"], ["--alerta", "--alerta-suave", "Alerta"], ["--error", "--error-suave", "Error"], ["--info", "--info-suave", "Información"]];
    cuerpo(el).innerHTML = `
      <div class="color-cabeza"><p class="titulo-3">Acentos · paleta ${pal}</p><p class="rotulo">Cambia la paleta en el dock para comparar</p></div>
      <div class="muestras">${acentos.map(([v, n]) => ficha(colorDe(v), nombre(n), v)).join("")}</div>
      <div class="degradado mate"><div class="degradado__barra"></div><span class="rotulo">Degradado del isotipo · <span class="mono">${colorDe("--deg-a")} → ${colorDe("--deg-b")}</span></span></div>
      <p class="titulo-3">Neutros · iguales en las dos paletas</p>
      <div class="muestras muestras--neutros">${neutros.map(([v, n]) => ficha(colorDe(v), n, v)).join("")}</div>
      <p class="titulo-3">Estados · reservados para avisar, nunca decoran</p>
      <div class="estados-color">${estados.map(([c, s, n]) => `<div class="estado-color" style="background:var(${s});color:var(${c})"><b>${n}</b><span class="mono">${colorDe(c)}</span></div>`).join("")}</div>
      <p class="titulo-3">Reglas de uso</p>
      <div class="reglas">
        <div class="mate regla"><b>Texto con acento</b><p class="chico">Solo <span class="mono">${colorDe("--acento-texto-claro")}</span> (${contraste(colorDe("--acento-texto-claro"), "#EDEEE8").toFixed(2)}:1 sobre hueso). El tono vivo no se usa para letra chica.</p></div>
        <div class="mate regla"><b>Botón de acento</b><p class="chico">Fondo vivo con letra tinta: ${contraste("#14212F", colorDe("--acento")).toFixed(2)}:1. Uno por pantalla.</p></div>
        <div class="mate regla"><b>Proporción</b><p class="chico">Hueso y papel ≈ 80 %, navy y grafito ≈ 15 %, acento ≤ 5 %. Sobria: el acento señala, no pinta.</p></div>
      </div>`;
  },

  async tipografia(el) {
    const escala = [
      ["Héroe", "--t-hero", 700, "-0.045em", "Todo proceso tiene una salida."],
      ["Título 1", "--t-1", 700, "-0.032em", "Diagnóstico de procesos"],
      ["Título 2", "--t-2", 650, "-0.022em", "Dónde se pierde el tiempo"],
      ["Título 3", "--t-3", 600, "-0.015em", "Cotizaciones atrasadas"],
      ["Cuerpo", "--t-cuerpo", 400, "-0.011em", "Quillay arma sus cotizaciones en planillas y las sigue por WhatsApp."],
      ["Chico", "--t-chico", 400, "-0.006em", "Última actualización hace 4 minutos."],
      ["Rótulo", "--t-rotulo", 600, "0.04em", "ESTADO DEL PROCESO"],
    ];
    const tam = (v) => Math.round(parseFloat(getComputedStyle(raiz).getPropertyValue(v)) * (getComputedStyle(raiz).getPropertyValue(v).includes("rem") ? 16 : 1)) || "fluido";
    const letraActiva = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "SF Pro (del sistema)" : "Inter (respaldo de SF)";
    cuerpo(el).innerHTML = `
      <div class="tipo-activa mate"><span class="rotulo">Este equipo está mostrando</span><b>${letraActiva}</b>
        <p class="chico">En Mac y iPhone se ve SF, la letra del sistema de Apple. En el resto, Inter, diseñada a la par. Poppins es solo el logo.</p></div>
      <div class="escala">${escala.map(([n, v, w, tr, txt]) => `
        <div class="escala__fila">
          <div class="escala__meta"><b>${n}</b><span class="mono">${typeof tam(v) === "number" ? tam(v) + " px" : "fluido"} · ${w} · ${tr}</span></div>
          <p style="font-size:var(${v});font-weight:${w};letter-spacing:${tr};line-height:${w >= 650 ? 1.08 : 1.5};${n === "Rótulo" ? "text-transform:uppercase;" : ""}">${txt}</p>
        </div>`).join("")}</div>
      ${rejilla([
        marco("Pesos", `<div class="pesos">${[400, 500, 600, 700].map((w) => `<span style="font-weight:${w}">${w} · Optimizo Procesos</span>`).join("")}</div>`, { nota: "Cuerpo 400 · énfasis 600 · títulos 650–700. Nunca 300 ni 800 en texto." }),
        marco("Números", `<div class="numeros-muestra"><p><span class="rotulo">Tabulares (tablas, montos)</span><br><span style="font-variant-numeric:tabular-nums">$ 1.111.111<br>$ 9.874.320</span></p><p><span class="rotulo">Proporcionales (texto)</span><br>$ 1.111.111<br>$ 9.874.320</p></div>`, { nota: "En tablas y montos siempre tabulares: las cifras quedan alineadas." }),
        marco("Tracking", `<p style="font-size:44px;font-weight:700;letter-spacing:-0.035em;line-height:1">Ajustado</p><p style="font-size:44px;font-weight:700;letter-spacing:0;line-height:1;color:var(--texto-3)">Sin ajustar</p>`, { nota: "Los títulos grandes se aprietan (como SF Display). El texto chico se abre un poco." }),
        marco("Párrafo", `<p style="max-width:58ch">Después del diagnóstico, Quillay sabe exactamente dónde pierde 31 horas a la semana: cotizaciones que se rehacen, pedidos que se pierden en el chat y un inventario que nadie confía. El plan empieza por lo que más duele.</p>`, { nota: "Largo de línea 55–70 caracteres. Interlineado 1,5." }),
      ])}`;
  },

  async espacio(el) {
    const pasos = [4, 8, 12, 16, 24, 32, 48, 64, 96, 144];
    cuerpo(el).innerHTML = rejilla([
      marco("Escala de espacio (base 4)", `<div class="espacios">${pasos.map((p, i) => `<div class="espacio"><span class="mono">e-${i + 1}</span><i style="width:${p}px"></i><span class="rotulo">${p} px</span></div>`).join("")}</div>`,
        { nota: "Entre piezas relacionadas 8–16. Entre grupos 24–48. Entre secciones 96–144: el aire es parte de la marca." }),
      marco("Retícula de 12 columnas", `<div class="reticula">${Array.from({ length: 12 }, () => "<i></i>").join("")}<div class="reticula__bloque" style="grid-column:1/8"><b>7 col · contenido</b></div><div class="reticula__bloque reticula__bloque--b" style="grid-column:8/13"><b>5 col · apoyo</b></div></div>`,
        { nota: `Ancho máximo 1180 px, margen lateral 16–40 px fluido. En celular, una columna.` }),
      marco("Ritmo vertical", `<div class="ritmo"><p class="ceja">Diagnóstico</p><p class="titulo-2">Dónde se pierde el tiempo</p><p class="chico">El primer paso es medir. Sin medir, todo es opinión.</p><div class="ritmo__regla"></div></div>`,
        { nota: "Ceja → título 12 px · título → texto 16 px · texto → acción 24 px." }),
      marco("Densidad", `<div class="densidad"><div class="mate densidad__a"><b>Cómoda</b><span class="chico">Sitio, informes, propuestas</span></div><div class="mate densidad__b"><b>Compacta</b><span class="chico">Tablas y paneles de trabajo</span></div></div>`,
        { nota: "Dos densidades, nunca una tercera. La compacta solo dentro de la app." }),
    ]);
  },

  async forma(el) {
    const radios = [["r-1", 8, "Insignias, campos chicos"], ["r-2", 12, "Botones, campos"], ["r-3", 16, "Tarjetas"], ["r-4", 24, "Hojas, diálogos"], ["pleno", 999, "Solo marca y píldoras"]];
    cuerpo(el).innerHTML = rejilla([
      marco("Radios · redondeo medio", `<div class="radios">${radios.map(([n, r, uso]) => `<div class="radio-ej"><i class="mate" style="border-radius:${Math.min(r, 48)}px"></i><b>${n}</b><span class="rotulo">${r === 999 ? "pleno" : r + " px"} · ${uso}</span></div>`).join("")}</div>`,
        { nota: "El círculo pleno se reserva para la marca (isotipo, punto) y para píldoras de estado.", ancho: true }),
      marco("Profundidad", `<div class="sombras">${[1, 2, 3].map((n) => `<div class="mate sombra" style="box-shadow:var(--sombra-${n}),inset 0 0 0 1px var(--borde)"><b>Nivel ${n}</b><span class="rotulo">${["Tarjetas en reposo", "Menús y popovers", "Diálogos y el dock"][n - 1]}</span></div>`).join("")}</div>`,
        { nota: "Sombras largas y suaves, nunca negras duras. En oscuro, la profundidad la da la superficie más clara.", ancho: true }),
      marco("Bordes", `<div class="bordes"><div class="borde-ej" style="box-shadow:inset 0 0 0 1px var(--borde)">Borde suave</div><div class="borde-ej" style="box-shadow:inset 0 0 0 1px var(--borde-fuerte)">Borde fuerte · campos</div><div class="borde-ej" style="box-shadow:inset 0 0 0 2px var(--foco)">Foco</div></div>`,
        { nota: "Bordes de 1 px como línea interior, nunca un recuadro grueso alrededor de todo." }),
      marco("Capas", `<ol class="capas">${[["Dock", 50], ["Menús", 60], ["Hojas y diálogos", 70], ["Avisos", 80]].map(([n, z]) => `<li><b>${n}</b><span class="mono">z ${z}</span></li>`).join("")}</ol>`,
        { nota: "Una escala de capas, centralizada en los tokens. Nada de z-index sueltos." }),
    ]);
  },

  async iconos(el) {
    cuerpo(el).innerHTML = rejilla([
      marco("Phosphor · línea fina", `<div class="iconos-rejilla">${ICONOS_IDENTIDAD.map((n) => `<span class="icono-celda" title="${n}">${icono(n, { tam: 24 })}<span>${n}</span></span>`).join("")}</div>`,
        { ancho: true, nota: "Set profesional con licencia MIT. Nada dibujado a mano. Siempre del color del texto que acompañan." }),
      marco("Tamaños", `<div class="iconos-tam">${[16, 20, 24, 32].map((t) => `<span>${icono("flow-arrow", { tam: t })}<span class="mono">${t}</span></span>`).join("")}</div>`, { nota: "16 en texto chico · 20 en botones y listas · 24 en navegación · 32 en tarjetas destacadas." }),
      marco("Con texto", `<div class="iconos-texto"><span>${icono("check-circle")} Proceso documentado</span><span>${icono("clock")} 31 horas a la semana</span><span>${icono("arrow-right")} Ver el plan</span></div>`, { nota: "Centrados con el alto de la x; separación 8 px. El ícono acompaña, no reemplaza la palabra." }),
    ]);
  },
};

/** Secciones que leen valores de los tokens con JS y deben repintarse al cambiar paleta o tema. */
export const REPINTAR_IDENTIDAD = ["portada", "logo", "color"];
