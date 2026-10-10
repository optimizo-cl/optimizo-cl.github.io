/* Tabla de datos: ordenar, filtrar, seleccionar, paginar. En angosto cada fila pasa a ser una tarjeta (no se achica). */
import { icono, rellenarIconos } from "../kit/iconos.js";

/** columnas: [{ clave, titulo, alinear: "der", formato, ancho }] · filas: objetos */
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
  const pintar = () => {
    const todas = visibles(), paginas = Math.max(1, Math.ceil(todas.length / porPagina));
    pagina = Math.min(pagina, paginas - 1);
    const vista = todas.slice(pagina * porPagina, (pagina + 1) * porPagina);
    const todasSel = vista.length && vista.every((x) => sel.has(x));
    thead.innerHTML = `<tr><th class="tabla-datos__check"><input type="checkbox" aria-label="Seleccionar página" ${todasSel ? "checked" : ""}></th>${columnas.map((c) => `
      <th class="${c.alinear === "der" ? "der" : ""}" aria-sort="${orden.clave === c.clave ? (orden.dir > 0 ? "ascending" : "descending") : "none"}">
        <button type="button" data-ordenar="${c.clave}">${c.titulo}<span class="tabla-datos__flecha">${orden.clave === c.clave ? (orden.dir > 0 ? "↑" : "↓") : ""}</span></button></th>`).join("")}</tr>`;
    tbody.innerHTML = vista.length ? vista.map((x, i) => `<tr class="${sel.has(x) ? "sel" : ""}" data-i="${i}">
      <td class="tabla-datos__check"><input type="checkbox" aria-label="Seleccionar fila" ${sel.has(x) ? "checked" : ""}></td>
      ${columnas.map((c) => `<td class="${c.alinear === "der" ? "der" : ""}" data-titulo="${c.titulo}">${c.formato ? c.formato(x[c.clave], x) : x[c.clave]}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${columnas.length + 1}" class="tabla-datos__vacio">${vacio}</td></tr>`;
    el.querySelector(".tabla-datos__pie .rotulo").textContent = `${todas.length ? pagina * porPagina + 1 : 0}–${pagina * porPagina + vista.length} de ${todas.length}`;
    el.querySelector('[data-pag="-1"]').disabled = pagina === 0;
    el.querySelector('[data-pag="1"]').disabled = pagina >= paginas - 1;
    el.querySelector(".tabla-datos__sel").textContent = sel.size ? `${sel.size} seleccionada${sel.size > 1 ? "s" : ""}` : "";
    el.classList.toggle("tabla-datos--con-sel", sel.size > 0);
    tbody._vista = vista;
  };
  el.querySelector("input[type=search]").addEventListener("input", (e) => { filtro = e.target.value.trim().toLowerCase(); pagina = 0; pintar(); });
  el.addEventListener("click", (e) => {
    const o = e.target.closest("[data-ordenar]");
    if (o) { orden = orden.clave === o.dataset.ordenar ? { clave: o.dataset.ordenar, dir: -orden.dir } : { clave: o.dataset.ordenar, dir: 1 }; pintar(); el.querySelector(`[data-ordenar="${o.dataset.ordenar}"]`).focus(); return; }
    const p = e.target.closest("[data-pag]");
    if (p) { pagina += +p.dataset.pag; pintar(); }
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
