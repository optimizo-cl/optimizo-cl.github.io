/* Capítulo 1 · Héroe: un banner plano, mate. El isotipo grande (con la firma: el punto sale y vuelve) y, al bajar,
   el isotipo viaja y se achica hasta el de la navegación. Sin 3D y sin trama. */
import { progreso } from "../kit/coreografia.js?v=aa26df1";
import { isotipo } from "../kit/marca.js?v=aa26df1";
import { SECCIONES } from "../plan.js?v=aa26df1";

const tramo = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const suave = (x) => x * x * (3 - 2 * x);

/** Frase cinética: cada letra cae y se asienta; las palabras no se cortan. */
const frase = (txt, clase) => {
  let i = 0;
  return `<span class="solo-lector">${txt.replace(/\n/g, " ")}</span><span class="${clase}" aria-hidden="true">${txt.split("\n").map((linea) => `<span class="cin-linea">${linea.split(" ").map((p) => `<b class="cin-palabra">${[...p].map((c) => `<span class="cin-letra" style="--i:${i++}">${c}</span>`).join("")}</b>`).join(" ")}</span>`).join("")}</span>`;
};

export const escenas2 = {
  async portada(el) {
    const listas = SECCIONES.filter((x) => x.estado === "listo").length;
    el.className = "heroe";
    el.innerHTML = `<div class="heroe__pista">
      <div class="heroe__escena">
        <div class="heroe__banner" aria-hidden="true"><span class="heroe__eco heroe__eco--1"></span><span class="heroe__eco heroe__eco--2"></span></div>
        <div class="heroe__hueco" aria-hidden="true"></div>
        <div class="heroe__objeto" aria-hidden="true">${isotipo({ clase: "firma-escape heroe__iso", titulo: "" })}</div>
        <div class="heroe__texto">
          <p class="ceja heroe__ceja">Guion visual · v2</p>
          <h1 class="heroe__frase">${frase("Todo proceso\ntiene una salida.", "heroe__letras")}</h1>
          <p class="bajada heroe__bajada">El lenguaje completo de Optimizo, funcionando: color, letra, material, movimiento, componentes, formularios y piezas.</p>
          <p class="rotulo heroe__estado"><i></i>${listas} secciones listas · se actualiza en cada avance</p>
        </div>
        <a class="heroe__bajar" href="#cap-identidad" aria-label="Bajar al capítulo 1"><span>Baja</span><i></i></a>
      </div></div>`;
    requestAnimationFrame(() => el.classList.add("heroe--listo"));

    const pista = el.querySelector(".heroe__pista"), hueco = el.querySelector(".heroe__hueco"), objeto = el.querySelector(".heroe__objeto");
    const destino = () => document.querySelector(".lateral__iso");
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) objeto.style.display = "none"; }).observe(pista);
    progreso(pista, (_, r) => {
      const h = innerHeight, p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - h)));
      // el isotipo vive fijo sobre su hueco y, al bajar, viaja al isotipo de la navegación achicándose
      const hu = hueco.getBoundingClientRect();
      Object.assign(objeto.style, { left: hu.left + "px", top: hu.top + "px", width: hu.width + "px", height: hu.height + "px" });
      let dx = 0, dy = -h * 0.45, esc = 0.2;
      const b = destino()?.getBoundingClientRect();
      if (b && b.width) { dx = b.left + b.width / 2 - (hu.left + hu.width / 2); dy = b.top + b.height / 2 - (hu.top + hu.height / 2); esc = b.width / hu.width; }
      const m = suave(tramo(p, 0.35, 1));
      objeto.style.transform = `translate(${dx * m}px, ${dy * m}px) scale(${1 + (esc - 1) * m})`;
      objeto.style.opacity = String(1 - suave(tramo(p, 0.9, 1)));
      objeto.style.display = p >= 0.999 || r.bottom < 0 ? "none" : "";
      el.style.setProperty("--p", p.toFixed(3));
      document.body.classList.toggle("heroe-pasado", p > 0.92);
    });
  },
};
