/* Presentar piezas en el guion v2: pestañas Vivo / Anatomía / Movimiento / Uso, cotas sobre la pieza
   y curvas de movimiento reproducibles. Es la forma de mostrar todo el kit (reemplaza el «marco» repetido). */
let n = 0;
const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Pieza con pestañas. vistas: { vivo, anatomia?, movimiento?, uso? } (HTML). Devuelve HTML; activar con activarPiezas(raiz). */
export function pieza({ vivo, anatomia = "", movimiento = "", uso = "", clase = "" }) {
  const id = `pz${++n}`;
  const vistas = [["vivo", "Vivo", vivo], ["anatomia", "Anatomía", anatomia], ["movimiento", "Movimiento", movimiento], ["uso", "Uso", uso]].filter((v) => v[2]);
  return `<div class="pieza ${clase}" data-pieza>
    ${vistas.length > 1 ? `<div class="pieza__pestanas" role="tablist" aria-label="Vistas de la pieza">${vistas.map(([k, t], i) => `<button type="button" role="tab" id="${id}-t-${k}" aria-controls="${id}-${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${t}</button>`).join("")}<i aria-hidden="true"></i></div>` : ""}
    ${vistas.map(([k, , html], i) => `<div class="pieza__panel" role="tabpanel" id="${id}-${k}" aria-labelledby="${id}-t-${k}" data-vista="${k}" ${i ? "hidden" : ""}>${html}</div>`).join("")}
  </div>`;
}

/** Comportamiento de pestañas (teclado incluido) y cotas al mostrar la anatomía. */
export function activarPiezas(raiz) {
  raiz.querySelectorAll("[data-pieza]").forEach((pz) => {
    const tabs = [...pz.querySelectorAll('[role="tab"]')], ind = pz.querySelector(".pieza__pestanas i");
    const mover = (t) => { if (ind) { ind.style.setProperty("--x", t.offsetLeft + "px"); ind.style.setProperty("--w", t.offsetWidth + "px"); } };
    const elegir = (t) => {
      tabs.forEach((x) => { const si = x === t; x.setAttribute("aria-selected", si); x.tabIndex = si ? 0 : -1; pz.querySelector("#" + x.getAttribute("aria-controls")).hidden = !si; });
      mover(t);
      const panel = pz.querySelector("#" + t.getAttribute("aria-controls"));
      panel.querySelectorAll("[data-anatomia]").forEach((a) => dibujarCotas(a));
      panel.dispatchEvent(new CustomEvent("vista", { bubbles: true, detail: t.id }));
    };
    tabs.forEach((t) => t.addEventListener("click", () => elegir(t)));
    pz.querySelector('[role="tablist"]')?.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement); if (i < 0) return;
      const sig = e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
      if (sig) { e.preventDefault(); sig.focus(); elegir(sig); }
    });
    if (tabs[0]) requestAnimationFrame(() => mover(tabs[0]));
  });
}

/** Cotas: el contenedor [data-anatomia] tiene hijos con data-cota="ancho|alto|caja" y data-cota-texto opcional.
    Las medidas se leen del render real (no se escriben a mano). */
export function dibujarCotas(cont) {
  cont.querySelectorAll(":scope > .cota").forEach((c) => c.remove());
  cont.classList.add("anatomia");
  const base = cont.getBoundingClientRect();
  let i = 0;
  cont.querySelectorAll("[data-cota]").forEach((el) => {
    const r = el.getBoundingClientRect(), x = r.left - base.left, y = r.top - base.top;
    for (const tipo of el.dataset.cota.split(" ")) {
      const c = document.createElement("span");
      c.style.setProperty("--i", i++);
      const cs = getComputedStyle(el);
      if (tipo === "ancho") { c.className = "cota cota--h"; Object.assign(c.style, { left: x + "px", top: y + r.height + 14 + "px", width: r.width + "px" }); c.innerHTML = `<span>${Math.round(r.width)}</span>`; }
      if (tipo === "alto") { c.className = "cota cota--v"; Object.assign(c.style, { left: x + r.width + 14 + "px", top: y + "px", height: r.height + "px" }); c.innerHTML = `<span>${Math.round(r.height)}</span>`; }
      if (tipo === "caja") { c.className = "cota cota--caja"; Object.assign(c.style, { left: x + "px", top: y + "px", width: r.width + "px", height: r.height + "px", borderRadius: cs.borderRadius }); c.innerHTML = `<span>${el.dataset.cotaTexto || `radio ${parseFloat(cs.borderTopLeftRadius)}`}</span>`; }
      if (tipo === "texto") { c.className = "cota"; Object.assign(c.style, { left: x + "px", top: y - 20 + "px" }); c.textContent = el.dataset.cotaTexto || `${cs.fontSize} · ${cs.fontWeight}`; }
      cont.appendChild(c);
    }
  });
  requestAnimationFrame(() => cont.classList.add("visible"));
}

/** Curva de movimiento dibujada + una bola que la recorre al apretar «Reproducir». bezier = [x1,y1,x2,y2]. */
export function curvaMovimiento({ nombre, bezier, ms, uso }) {
  const [x1, y1, x2, y2] = bezier, S = 140;
  const d = `M10 ${10 + S} C ${10 + x1 * S} ${10 + S - y1 * S}, ${10 + x2 * S} ${10 + S - y2 * S}, ${10 + S} 10`;
  return `<div class="curva-mov" data-curva="${bezier.join(",")}" data-ms="${ms}">
    <svg viewBox="0 0 160 160" aria-hidden="true"><rect x="10" y="10" width="${S}" height="${S}" class="curva-mov__marco"/><path d="${d}" class="curva-mov__linea"/>
      <line x1="10" y1="${10 + S}" x2="${10 + x1 * S}" y2="${10 + S - y1 * S}" class="curva-mov__marco"/><line x1="${10 + S}" y1="10" x2="${10 + x2 * S}" y2="${10 + S - y2 * S}" class="curva-mov__marco"/>
      <circle cx="${10 + x1 * S}" cy="${10 + S - y1 * S}" r="4" class="curva-mov__punto"/><circle cx="${10 + x2 * S}" cy="${10 + S - y2 * S}" r="4" class="curva-mov__punto"/></svg>
    <div class="pila"><div><b>${nombre}</b> <span class="mono rotulo">cubic-bezier(${bezier.join(", ")}) · ${ms} ms</span></div>
      <p class="chico">${uso}</p><div class="curva-mov__pista"><i class="curva-mov__bola"></i></div>
      <div class="fila-botones"><button type="button" class="boton boton--secundario boton--s" data-reproducir>Reproducir</button><button type="button" class="boton boton--texto boton--s" data-lento>Cámara lenta ×4</button></div></div>
  </div>`;
}
export function activarCurvas(raiz) {
  raiz.querySelectorAll("[data-curva]").forEach((c) => {
    const bola = c.querySelector(".curva-mov__bola"), pista = c.querySelector(".curva-mov__pista");
    const correr = (factor) => {
      const ms = +c.dataset.ms * factor, curva = `cubic-bezier(${c.dataset.curva})`, fin = pista.clientWidth - 44;
      bola.animate([{ transform: "translateX(0)" }, { transform: `translateX(${fin}px)` }], { duration: ms, easing: curva, fill: "forwards" });
    };
    c.querySelector("[data-reproducir]").addEventListener("click", () => correr(1));
    c.querySelector("[data-lento]").addEventListener("click", () => correr(4));
  });
}

export const codigo = (txt) => `<pre class="ficha__codigo"><code>${escapar(txt)}</code></pre>`;
