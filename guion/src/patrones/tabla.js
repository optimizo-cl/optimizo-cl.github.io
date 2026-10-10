/* Tabla de datos: ordenar, filtrar, seleccionar, paginar. En angosto cada fila pasa a ser una tarjeta (no se achica).
   v2: las filas entran en cascada; al ordenar se deslizan a su nuevo lugar (FLIP); las columnas «editable» se editan en línea. */
import { icono, rellenarIconos } from "../kit/iconos.js?v=19f4b98";

/** columnas: [{ clave, titulo, alinear: "der", formato, ancho, editable: { validar(v) → "" | error, leer(v) → valor } }] · filas: objetos */
export function tabla(el, { columnas, filas, porPagina = 8, buscarEn = [], vacio = "No hay resultados con ese filtro.", acciones = "" }) {
  let orden = { clave: null, dir: 1 }, pagina = 0, filtro = "", sel = new Set();
  el.classList.add("tabla-datos");
  el.innerHTML = `<div class="tabla-datos__barra">
      <label class="tabla-datos__buscar">${icono("magnifying-glass", { tam: 18 })}<input type="search" placeholder="Filtrar" aria-label="Filtrar filas"></label>
      <span class="tabla-datos__sel chico" aria-live="polite"></span>${acciones}</div>
    <div class="tabla-datos__marco"><table><thead></thead><tbody></tbody></table></div>
    <div class="tabla-datos__pie"><span class="rotulo"></span><div class="fila-botones">
      <button type="button" class="boton boton--texto boton--s" data-pag="-1">Anterior</button><button type="button" class="boton boton--texto boton--s" data-pag="1">Siguiente</button></div></div>`;
  const thead = el.querySelector("thead"), tbody = el.querySelector("tbody");
  const visibles = () => {
    let f = filas.filter((x) => !filtro || buscarEn.some((k) => String(x[k]).toLowerCase().includes(filtro)));
    if (orden.clave) f = f.slice().sort((a, b) => (a[orden.clave] > b[orden.clave] ? 1 : a[orden.clave] < b[orden.clave] ? -1 : 0) * orden.dir);
    return f;
  };
  const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let modo = "cascada"; // cómo entran las filas en el próximo pintado: cascada · flip · nada
  const pintar = () => {
    const antes = new Map(); if (modo === "flip" && !reducido()) tbody.querySelectorAll("tr[data-k]").forEach((tr) => antes.set(tr.dataset.k, tr.getBoundingClientRect().top));
    const todas = visibles(), paginas = Math.max(1, Math.ceil(todas.length / porPagina));
    pagina = Math.min(pagina, paginas - 1);
    const vista = todas.slice(pagina * porPagina, (pagina + 1) * porPagina);
    const todasSel = vista.length && vista.every((x) => sel.has(x));
    thead.innerHTML = `<tr><th class="tabla-datos__check"><label class="tabla-datos__chk"><input type="checkbox" aria-label="Seleccionar página" ${todasSel ? "checked" : ""}></label></th>${columnas.map((c) => `
      <th class="${c.alinear === "der" ? "der" : ""}" aria-sort="${orden.clave === c.clave ? (orden.dir > 0 ? "ascending" : "descending") : "none"}">
        <button type="button" data-ordenar="${c.clave}">${c.titulo}<span class="tabla-datos__flecha">${orden.clave === c.clave ? (orden.dir > 0 ? "↑" : "↓") : ""}</span></button></th>`).join("")}</tr>`;
    tbody.innerHTML = vista.length ? vista.map((x, i) => `<tr class="${sel.has(x) ? "sel" : ""} ${modo === "cascada" && !reducido() ? "fila-entra" : ""}" style="--i:${i}" data-i="${i}" data-k="${filas.indexOf(x)}">
      <td class="tabla-datos__check"><label class="tabla-datos__chk"><input type="checkbox" aria-label="Seleccionar fila" ${sel.has(x) ? "checked" : ""}></label></td>
      ${columnas.map((c) => `<td class="${c.alinear === "der" ? "der" : ""} ${c.editable ? "editable" : ""}" data-titulo="${c.titulo}" ${c.editable ? `data-editar="${c.clave}" tabindex="0" title="Doble clic o Enter para editar"` : ""}>${c.formato ? c.formato(x[c.clave], x) : x[c.clave]}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${columnas.length + 1}" class="tabla-datos__vacio">${vacio}</td></tr>`;
    el.querySelector(".tabla-datos__pie .rotulo").textContent = `${todas.length ? pagina * porPagina + 1 : 0}–${pagina * porPagina + vista.length} de ${todas.length}`;
    el.querySelector('[data-pag="-1"]').disabled = pagina === 0;
    el.querySelector('[data-pag="1"]').disabled = pagina >= paginas - 1;
    el.querySelector(".tabla-datos__sel").textContent = sel.size ? `${sel.size} seleccionada${sel.size > 1 ? "s" : ""}` : "";
    el.classList.toggle("tabla-datos--con-sel", sel.size > 0);
    tbody._vista = vista;
    // al ordenar, cada fila se desliza desde donde estaba
    if (antes.size) tbody.querySelectorAll("tr[data-k]").forEach((tr) => { const y0 = antes.get(tr.dataset.k); if (y0 == null) return; const dy = y0 - tr.getBoundingClientRect().top; if (Math.abs(dy) > 1) tr.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.16, 1, .3, 1)" }); });
    modo = "nada";
  };
  // edición en línea: doble clic o Enter; Enter guarda (si es válido), Esc cancela
  const editar = (td) => {
    if (td.querySelector("input")) return;
    const col = columnas.find((c) => c.clave === td.dataset.editar), fila = tbody._vista[+td.closest("tr").dataset.i];
    const original = td.innerHTML;
    td.classList.add("editando");
    td.innerHTML = `<span class="celda-edita"><input type="text" value="${String(fila[col.clave]).replace(/"/g, "&quot;")}" aria-label="${col.titulo}"><i class="celda-edita__punto" aria-hidden="true"></i></span><span class="celda-edita__error chico" role="alert" hidden></span>`;
    const i = td.querySelector("input"); i.focus(); i.select();
    const cerrar = (guardar) => {
      if (guardar) {
        const err = col.editable.validar?.(i.value) || "";
        if (err) { td.querySelector(".celda-edita__error").hidden = false; td.querySelector(".celda-edita__error").textContent = err; td.classList.add("con-error"); i.animate([{ transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "none" }], { duration: 260 }); return; }
        fila[col.clave] = col.editable.leer ? col.editable.leer(i.value) : i.value;
        td.classList.remove("editando", "con-error"); td.innerHTML = col.formato ? col.formato(fila[col.clave], fila) : fila[col.clave];
        td.classList.add("guardada"); setTimeout(() => td.classList.remove("guardada"), 1200);
      } else { td.classList.remove("editando", "con-error"); td.innerHTML = original; }
      td.focus();
    };
    i.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); cerrar(true); } if (e.key === "Escape") { e.preventDefault(); cerrar(false); } });
    i.addEventListener("blur", () => setTimeout(() => { if (td.contains(i) && document.activeElement !== i) cerrar(true); }, 0));
  };
  el.addEventListener("dblclick", (e) => { const td = e.target.closest("td[data-editar]"); if (td) editar(td); });
  el.addEventListener("keydown", (e) => { const td = e.target.closest?.("td[data-editar]"); if (td && e.target === td && e.key === "Enter") { e.preventDefault(); editar(td); } });
  el.querySelector("input[type=search]").addEventListener("input", (e) => { filtro = e.target.value.trim().toLowerCase(); pagina = 0; modo = "flip"; pintar(); });
  el.addEventListener("click", (e) => {
    const o = e.target.closest("[data-ordenar]");
    if (o) { orden = orden.clave === o.dataset.ordenar ? { clave: o.dataset.ordenar, dir: -orden.dir } : { clave: o.dataset.ordenar, dir: 1 }; modo = "flip"; pintar(); el.querySelector(`[data-ordenar="${o.dataset.ordenar}"]`).focus(); return; }
    const p = e.target.closest("[data-pag]");
    if (p) { pagina += +p.dataset.pag; modo = "cascada"; pintar(); }
  });
  el.addEventListener("change", (e) => {
    if (!e.target.matches("input[type=checkbox]")) return;
    const vista = tbody._vista;
    if (e.target.closest("thead")) vista.forEach((x) => (e.target.checked ? sel.add(x) : sel.delete(x)));
    else { const x = vista[+e.target.closest("tr").dataset.i]; e.target.checked ? sel.add(x) : sel.delete(x); }
    pintar();
  });
  pintar(); rellenarIconos();
  return { seleccion: () => [...sel], limpiar: () => { sel.clear(); pintar(); } };
}
