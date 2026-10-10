/* Calendario y horas. Semana parte el lunes; fechas en español de Chile; zona horaria explícita. */
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
export const HOY = new Date(2026, 9, 10); // fecha fija del guion (datos de ejemplo)

const igual = (a, b) => a && b && a.toDateString() === b.toDateString();
export const fechaLarga = (d) => d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

/** Calendario de un mes. disponible(d) decide qué días se pueden elegir. Rango opcional (inicio/fin). */
export function calendario(el, { mes = new Date(HOY.getFullYear(), HOY.getMonth(), 1), elegido = null, disponible = () => true, rango = false, alElegir = () => {} } = {}) {
  let actual = new Date(mes), sel = elegido, ini = null, fin = null;
  const pintar = () => {
    const primero = new Date(actual.getFullYear(), actual.getMonth(), 1);
    const desfase = (primero.getDay() + 6) % 7;
    const dias = new Date(actual.getFullYear(), actual.getMonth() + 1, 0).getDate();
    const celdas = [];
    for (let k = 0; k < desfase; k++) celdas.push("<span></span>");
    for (let d = 1; d <= dias; d++) {
      const f = new Date(actual.getFullYear(), actual.getMonth(), d);
      const ok = disponible(f) && f >= new Date(HOY.toDateString());
      const enRango = rango && ini && fin && f > ini && f < fin;
      const marcado = rango ? igual(f, ini) || igual(f, fin) : igual(f, sel);
      celdas.push(`<button type="button" class="cal__dia ${igual(f, HOY) ? "cal__dia--hoy" : ""} ${enRango ? "cal__dia--rango" : ""}" ${ok ? "" : "disabled"} aria-pressed="${!!marcado}" data-d="${d}" aria-label="${fechaLarga(f)}${ok ? "" : ", no disponible"}">${d}</button>`);
    }
    el.innerHTML = `<div class="cal">
      <div class="cal__cabeza"><button type="button" class="boton boton--texto boton--s boton--icono" data-mes="-1" aria-label="Mes anterior">‹</button>
        <b>${MESES[actual.getMonth()]} ${actual.getFullYear()}</b>
        <button type="button" class="boton boton--texto boton--s boton--icono" data-mes="1" aria-label="Mes siguiente">›</button></div>
      <div class="cal__semana">${DIAS.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="cal__dias">${celdas.join("")}</div></div>`;
  };
  el.addEventListener("click", (e) => {
    const m = e.target.closest("[data-mes]");
    if (m) { actual = new Date(actual.getFullYear(), actual.getMonth() + +m.dataset.mes, 1); pintar(); return; }
    const b = e.target.closest(".cal__dia:not(:disabled)");
    if (!b) return;
    const f = new Date(actual.getFullYear(), actual.getMonth(), +b.dataset.d);
    if (rango) { if (!ini || fin || f < ini) { ini = f; fin = null; } else fin = f; alElegir({ ini, fin }); }
    else { sel = f; alElegir(f); }
    pintar();
    el.querySelector(`[data-d="${f.getDate()}"]`)?.focus();
  });
  pintar();
}

/** Horas disponibles de un día (bloques de 30 min). */
export function horas(el, { fecha, ocupadas = [], alElegir = () => {} }) {
  const lista = [];
  for (let h = 9; h < 18; h++) for (const m of [0, 30]) if (h !== 13) lista.push(`${String(h).padStart(2, "0")}:${m ? "30" : "00"}`);
  // ocupación de ejemplo derivada del día (estable)
  const libres = lista.filter((x, k) => !ocupadas.includes(x) && (k + fecha.getDate()) % 4 !== 0);
  el.innerHTML = `<p class="rotulo">${fechaLarga(fecha)} · hora de Chile continental</p>
    <div class="horas" role="radiogroup" aria-label="Horas disponibles">${libres.map((x) => `<button type="button" class="hora" role="radio" aria-checked="false" data-h="${x}">${x}</button>`).join("")}</div>`;
  el.querySelectorAll(".hora").forEach((b) => b.addEventListener("click", () => {
    el.querySelectorAll(".hora").forEach((x) => x.setAttribute("aria-checked", x === b));
    alElegir(b.dataset.h);
  }));
}
