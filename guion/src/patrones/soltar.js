/* Zona para soltar archivos: arrastrar o elegir, progreso por archivo, errores que dicen qué hacer. (Demostración: no sube nada.) */
import { icono, rellenarIconos } from "../kit/iconos.js?v=5bdbf1b";

const TIPOS = { xlsx: "Planilla", xls: "Planilla", csv: "Planilla", pdf: "PDF", docx: "Documento", doc: "Documento", png: "Imagen", jpg: "Imagen", jpeg: "Imagen" };
const peso = (b) => (b > 1e6 ? (b / 1e6).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1e3)) + " KB");

export function soltar(el, { maxMB = 25, aceptar = Object.keys(TIPOS) } = {}) {
  el.innerHTML = `<label class="soltar">
      <input type="file" multiple accept="${aceptar.map((x) => "." + x).join(",")}">
      <span class="soltar__ico">${icono("upload-simple", { tam: 26 })}</span>
      <b>Arrastra tus archivos o <u>elígelos</u></b>
      <span class="chico">Planillas, PDF o documentos · hasta ${maxMB} MB cada uno</span>
    </label>
    <ul class="archivos" aria-live="polite"></ul>`;
  rellenarIconos();
  const zona = el.querySelector(".soltar"), lista = el.querySelector(".archivos"), input = el.querySelector("input");
  const agregar = (archivos) => [...archivos].forEach((f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    let error = "";
    if (!aceptar.includes(ext)) error = `Este tipo de archivo (.${ext}) no se puede leer. Súbelo en Excel, CSV o PDF.`;
    else if (f.size > maxMB * 1e6) error = `Pesa ${peso(f.size)}; el máximo es ${maxMB} MB. Divídelo o comprímelo.`;
    const li = document.createElement("li");
    li.className = `archivo ${error ? "archivo--error" : ""}`;
    li.innerHTML = `<span class="archivo__ico">${icono(error ? "warning-circle" : ext === "pdf" ? "file-pdf" : ["xlsx", "xls", "csv"].includes(ext) ? "file-xls" : "file-text", { tam: 22 })}</span>
      <span class="archivo__datos"><b>${f.name}</b><span class="chico">${error || `${TIPOS[ext] || "Archivo"} · ${peso(f.size)}`}</span>
      ${error ? "" : '<span class="barra"><i style="--v:0%"></i></span>'}</span>
      <button type="button" class="boton boton--texto boton--s boton--icono" aria-label="Quitar ${f.name}">${icono("x", { tam: 16 })}</button>`;
    lista.appendChild(li); rellenarIconos();
    li.querySelector("button").addEventListener("click", () => li.remove());
    if (error) return;
    // progreso simulado (demostración)
    let v = 0; const barra = li.querySelector(".barra i");
    const t = setInterval(() => {
      v = Math.min(100, v + 9 + Math.random() * 16); barra.style.setProperty("--v", v + "%");
      if (v >= 100) { clearInterval(t); li.classList.add("archivo--listo"); li.querySelector(".chico").textContent = `${TIPOS[ext]} · ${peso(f.size)} · subido`; }
    }, 260);
  });
  input.addEventListener("change", () => { agregar(input.files); input.value = ""; });
  ["dragenter", "dragover"].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add("soltar--encima"); }));
  ["dragleave", "drop"].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.remove("soltar--encima"); }));
  zona.addEventListener("drop", (e) => agregar(e.dataTransfer.files));
  return { agregar };
}
