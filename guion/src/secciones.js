/* Secciones del guion: solo MUESTRAN. Las piezas viven en src/kit y src/patrones. */
import { CAPITULOS, SECCIONES, seccionesDe } from "./plan.js";
import { isotipo, logo } from "./kit/marca.js";
import { contraste, colorDe } from "./kit/color.js";

const paletaActiva = () => document.documentElement.dataset.paleta || "teal";
const rutaLogos = () => (paletaActiva() === "naranjo" ? "assets/logo/naranjo/" : "assets/logo/");
const acentosMono = () => (paletaActiva() === "naranjo" ? ["durazno", "mandarina", "brasa"] : ["menta", "teal", "teal-profundo"]);

export const CONSTRUIDAS = {
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
    el.querySelector(".seccion__cuerpo").innerHTML = `
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
    el.querySelector(".seccion__cuerpo").innerHTML = `
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
    const nombre = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim().replace(/"/g, "");
    const pal = paletaActiva() === "naranjo" ? "B · Mandarina" : "A · Teal";
    el.querySelector(".seccion__cuerpo").innerHTML = `
      <div class="color-cabeza"><p class="titulo-3">Acentos · paleta ${pal}</p><p class="rotulo">Cambia la paleta en el dock para comparar</p></div>
      <div class="muestras">${acentos.map(([v, n]) => ficha(colorDe(v), nombre(n), v)).join("")}</div>
      <div class="degradado mate"><div class="degradado__barra"></div><span class="rotulo">Degradado del isotipo · <span class="mono">${colorDe("--deg-a")} → ${colorDe("--deg-b")}</span></span></div>
      <p class="titulo-3">Neutros · iguales en las dos paletas</p>
      <div class="muestras muestras--neutros">${neutros.map(([v, n]) => ficha(colorDe(v), n, v)).join("")}</div>
      <p class="titulo-3">Reglas de uso</p>
      <div class="reglas">
        <div class="mate regla"><b>Texto con acento</b><p class="chico">Solo <span class="mono">${colorDe("--acento-texto-claro")}</span> (${contraste(colorDe("--acento-texto-claro"), "#EDEEE8").toFixed(2)}:1 sobre hueso). El tono vivo no se usa para letra chica.</p></div>
        <div class="mate regla"><b>Botón de acento</b><p class="chico">Fondo vivo con letra tinta: ${contraste("#14212F", colorDe("--acento")).toFixed(2)}:1. Uno por pantalla.</p></div>
        <div class="mate regla"><b>Proporción</b><p class="chico">Hueso y papel ≈ 80 %, navy y grafito ≈ 15 %, acento ≤ 5 %. Sobria: el acento señala, no pinta.</p></div>
      </div>`;
  },
};

/** Marcador de una sección que todavía no se construye. */
export function pendiente(sec) {
  return `<div class="pendiente mate"><p class="pendiente__que">${sec.contiene}</p><span class="estado">Fase ${sec.fase} · por hacer</span></div>`;
}

export { CAPITULOS, SECCIONES, seccionesDe };
