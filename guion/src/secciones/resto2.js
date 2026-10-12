/* v2 de las secciones que quedaban con la composición repetida de la versión 1: contacto, validación, correos,
   firma, íconos de app, usos incorrectos, color y letra para producción, voz, imagen y aplicaciones. */
import { pieza, activarPiezas, codigo } from "../kit/presentar.js?v=5bdbf1b";
import { campo, validar } from "../kit/campos.js?v=5bdbf1b";
import { boton, trabajar } from "../kit/controles.js?v=5bdbf1b";
import { listo } from "../kit/punto.js?v=5bdbf1b";
import { toast, estado } from "../kit/avisos.js?v=5bdbf1b";
import { icono, rellenarIconos } from "../kit/iconos.js?v=5bdbf1b";
import { isotipo, logo } from "../kit/marca.js?v=5bdbf1b";
import { correo, firma } from "../kit/correos.js?v=5bdbf1b";
import { etapas, activarEtapas } from "../kit/etapas.js?v=5bdbf1b";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const raiz = document.documentElement;
const urlAsset = (p) => new URL(`../../assets/${p}`, import.meta.url).href;
const lista = (l, clase = "lista-punto") => `<ul class="${clase}">${l.map((x) => `<li>${x}</li>`).join("")}</ul>`;

const COLORES = {
  teal: [["Menta", "#91CEC4", "145 206 196", "30 0 5 19*"], ["Teal", "#59BDB1", "89 189 177", "53 0 6 26*"], ["Teal profundo", "#387E80", "56 126 128", "56 2 0 50*"]],
  naranjo: [["Durazno", "#FFB98A", "255 185 138", "0 27 46 0*"], ["Mandarina", "#FF6A13", "255 106 19", "0 58 93 0*"], ["Brasa", "#B8420A", "184 66 10", "0 64 95 28*"]],
  neutros: [["Navy", "#26405B", "38 64 91", "58 30 0 64"], ["Grafito", "#424E4E", "66 78 78", "15 0 0 69"], ["Hueso", "#EDEEE8", "237 238 232", "0 0 3 7"], ["Papel", "#F7F7F3", "247 247 243", "0 0 2 3*"], ["Tinta", "#14212F", "20 33 47", "57 30 0 82*"]],
};

export const resto2 = {
  /* ── Contacto: la carta y su sobre ── */
  async contacto(el) {
    const vivo = `<div class="contacto2">
      <form class="contacto2__carta papel" novalidate data-contacto>
        <div class="contacto2__cabeza">${isotipo({ clase: "contacto2__iso" })}<div><b>Escríbenos</b><span class="chico">Respondemos en menos de un día hábil.</span></div></div>
        ${campo("Nombre", { requerido: true })}${campo("Correo de trabajo", { tipo: "correo", requerido: true })}${campo("¿En qué te podemos ayudar?", { tipo: "area", max: 500, requerido: true, marcador: "Cuéntanos en dos líneas" })}
        ${boton("Enviar mensaje", { tipo: "submit", variante: "acento", icoFin: "arrow-right" }).replace('class="boton', 'class="boton boton--punto')}</form>
      <ol class="contacto2__por-que">${[["Tres campos", "Lo demás se pregunta en la conversación."], ["Una promesa", "Junto al botón: cuándo respondemos."], ["Sin captcha visible", "El spam se filtra en el servidor."], ["La confirmación se queda", "El formulario se vuelve la confirmación; no es un aviso que desaparece."]].map(([t, d], i) => `<li><span class="contacto2__n">0${i + 1}</span><b>${t}</b><span class="chico">${d}</span></li>`).join("")}</ol></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el);
    const f = el.querySelector("[data-contacto]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const malos = [...f.querySelectorAll("[data-tipo]")].filter((c) => !validar(c));
      if (malos.length) return malos[0].focus();
      await trabajar(f.querySelector("button[type=submit]"), () => espera(1100), { cargando: "Enviando…", listo: "Enviado" });
      f.classList.add("contacto2__carta--enviada");
      f.innerHTML = `<div class="asistente__fin">${listo({ texto: "Mensaje enviado", tam: 64 })}<p class="chico">Te respondemos en menos de un día hábil.</p></div>`;
    });
  },

  /* ── Validación: el error explicado en capas ── */
  async validacion(el) {
    const vivo = `<div class="validacion2">
      <form class="validacion2__form papel" novalidate data-val><div class="resumen-errores" hidden role="alert" tabindex="-1"></div>
        ${campo("Empresa", { requerido: true })}${campo("RUT", { tipo: "rut", requerido: true, valor: "76.354.771-0" })}${campo("Correo", { tipo: "correo", requerido: true, valor: "camila@quillay" })}
        ${boton("Enviar", { tipo: "submit" })}<p class="chico">Presiona Enviar: aparece un resumen arriba y el foco va al primer error.</p></form>
      <div class="validacion2__linea">${[["Al escribir", "Nada. Se deja escribir tranquilo.", "vacio", "neutro"], ["Al salir del campo", "Se valida y, si falta algo, se dice cómo arreglarlo.", "medio", "alerta"], ["Al corregir", "El error se va en el momento.", "lleno", "exito"], ["Al enviar", "Resumen con enlaces a cada error y foco en el primero.", "medio", "error"]].map(([t, d, f, tono]) => `<div class="validacion2__paso">${estado(t, { forma: f, tono })}<span class="chico">${d}</span></div>`).join("")}</div>
      <div class="validacion2__frases">${[["Campo inválido.", "El RUT no calza con su dígito verificador. Revisa el número."], ["Error 422.", "No pudimos guardar. Revisa tu conexión e intenta de nuevo; lo escrito sigue acá."]].map(([no, si]) => `<div class="frase-par"><p class="frase-par__no"><s>${no}</s></p><p class="frase-par__si">${si}</p></div>`).join("")}</div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el);
    const f = el.querySelector("[data-val]"), res = f.querySelector(".resumen-errores");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const malos = [...f.querySelectorAll("[data-tipo]")].filter((c) => !validar(c));
      if (!malos.length) { res.hidden = true; toast("Todo bien: enviado.", { tono: "exito" }); return; }
      res.hidden = false;
      res.innerHTML = `${icono("warning-circle", { tam: 20 })}<div><b>Revisa ${malos.length} ${malos.length === 1 ? "dato" : "datos"} antes de enviar</b><ul>${malos.map((m) => `<li><a href="#${m.id}">${f.querySelector(`label[for="${m.id}"]`).childNodes[0].textContent.trim()}</a></li>`).join("")}</ul></div>`;
      rellenarIconos();
      res.querySelectorAll("a").forEach((a) => a.addEventListener("click", (ev) => { ev.preventDefault(); document.getElementById(a.hash.slice(1)).focus(); }));
      malos[0].focus();
    });
  },

  /* ── Correos: una bandeja de entrada de verdad ── */
  async correos(el) {
    const tipos = [["bienvenida", "Bienvenida a Optimizo", "Tu diagnóstico empieza el lunes. Esto es lo que viene."], ["reunion", "Reunión agendada", "Lunes 14 de septiembre, 10:30 h · videollamada"], ["informe", "Tu informe está listo", "Encontramos 31 horas por semana. Te contamos dónde."]];
    const logoPNG = urlAsset(`descargas/png/${raiz.dataset.paleta === "naranjo" ? "naranjo" : "teal"}/optimizo-logo-2400.png`);
    const vivo = `<div class="bandeja papel">
      <div class="bandeja__lista" role="tablist" aria-label="Correos">${tipos.map(([k, a, p], i) => `<button type="button" role="tab" class="bandeja__item" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" data-k="${k}"><span class="bandeja__de">${isotipo({ clase: "bandeja__iso", titulo: "" }).replace('role="img" aria-label=""', 'aria-hidden="true"')}<b>Optimizo</b><span class="rotulo">09:${12 + i * 7}</span></span><b class="bandeja__asunto">${a}</b><span class="chico bandeja__pre">${p}</span></button>`).join("")}</div>
      <div class="bandeja__lectura"><iframe class="bandeja__correo" title="Correo" data-iframe></iframe><div class="fila-botones">${boton("Copiar HTML", { variante: "secundario", tam: "s", attrs: "data-copiar" })}<span class="rotulo">Tablas, estilos en línea, 600 px · logo en PNG alojado</span></div></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: `<div class="rejilla-2">${lista(["Sin grano, sin degradados de fondo, sin fuentes web: el correo va plano.", "Un solo botón por correo.", "El preencabezado (el gris de la bandeja) siempre escrito a mano.", "El logo va como PNG alojado: Outlook no muestra SVG."])}${codigo('html = correo("reunion", "https://optimizo.cl/marca/optimizo-logo.png");')}</div>` });
    activarPiezas(el);
    const ifr = el.querySelector("[data-iframe]"), items = [...el.querySelectorAll(".bandeja__item")];
    let actual = "bienvenida";
    const ver = (b) => { items.forEach((x) => { x.setAttribute("aria-selected", x === b); x.tabIndex = x === b ? 0 : -1; }); actual = b.dataset.k; ifr.srcdoc = correo(actual, logoPNG); };
    items.forEach((b, i) => { b.addEventListener("click", () => ver(b)); b.addEventListener("keydown", (e) => { const d = { ArrowDown: 1, ArrowUp: -1 }[e.key]; if (d) { e.preventDefault(); const s = items[(i + d + items.length) % items.length]; s.focus(); ver(s); } }); });
    ver(items[0]);
    el.querySelector("[data-copiar]").addEventListener("click", async () => { try { await navigator.clipboard.writeText(correo(actual, logoPNG)); toast("HTML copiado.", { tono: "exito" }); } catch { toast("No se pudo copiar. Ábrelo y copia el código.", { tono: "error" }); } });
  },

  /* ── Firma: se escribe y aparece al pie de un correo ── */
  async "firma-correo"(el) {
    const datos = { logoURL: urlAsset(`descargas/png/${raiz.dataset.paleta === "naranjo" ? "naranjo" : "teal"}/optimizo-isotipo-1024.png`) };
    const vivo = `<div class="firma2">
      <form class="firma2__form" data-firma-form>${campo("Nombre", { nombre: "nombre", valor: "Martina Fuentes" })}${campo("Cargo", { nombre: "cargo", valor: "Directora de proyectos" })}${campo("Teléfono", { nombre: "telefono", tipo: "telefono", valor: "9 1234 5678" })}${boton("Copiar firma", { attrs: "data-copiar-firma", variante: "acento" })}<p class="chico">Pégala en Gmail (Configuración → Firma) o en Outlook.</p></form>
      <div class="firma2__correo papel"><div class="firma2__cab"><span class="rotulo">Para</span> jorge@quillay.cl<br><span class="rotulo">Asunto</span> Propuesta para cotizar en minutos</div>
        <p>Hola Jorge:</p><p>Te dejo la propuesta que conversamos. La primera etapa toma cinco semanas y en la primera ya ves el embudo con tus clientes.</p><p>Quedo atenta,</p>
        <div class="firma2__firma" data-firma>${firma(datos)}</div></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el);
    const f = el.querySelector("[data-firma-form]"), vista = el.querySelector("[data-firma]");
    const leer = () => { const d = Object.fromEntries(new FormData(f)); return { ...datos, ...d, telefono: d.telefono ? "+56 " + d.telefono : "" }; };
    f.addEventListener("input", () => (vista.innerHTML = firma(leer())));
    el.querySelector("[data-copiar-firma]").addEventListener("click", async (e) => {
      e.preventDefault();
      try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([firma(leer())], { type: "text/html" }) })]); toast("Firma copiada. Pégala en tu correo.", { tono: "exito" }); }
      catch { toast("No se pudo copiar automáticamente: selecciona la firma y cópiala.", { tono: "alerta" }); }
    });
  },

  /* ── Usos incorrectos: un solo logo al que se le aplica el error ── */
  async "usos-incorrectos"(el) {
    const errores = [["deformar", "Deformar", "Estirar o aplastar."], ["rotar", "Rotar", "Siempre horizontal."], ["color", "Colores fuera de la paleta", "Solo los colores de la marca."], ["sombra", "Sombras o efectos", "Ni sombras duras ni brillos."], ["contraste", "Fondo sin contraste", "Sobre oscuro va la versión clara."], ["punto", "Mover el punto", "El punto vive en su nido."], ["letra", "Cambiar la letra", "El logotipo nunca se escribe."], ["forma", "Encerrar en una forma", "El logo no va dentro de círculos ni cajas."]];
    const vivo = `<div class="incorrectos2" data-inc>
      <div class="incorrectos2__escena"><div class="incorrectos2__logo" data-logo-i></div><span class="incorrectos2__x" aria-hidden="true">${icono("x", { tam: 28 })}</span><p class="incorrectos2__estado" aria-live="polite" data-inc-t>Así se usa: desde el archivo, sin tocarlo.</p></div>
      <div class="incorrectos2__lista" role="radiogroup" aria-label="Errores">${errores.map(([k, t, d], i) => `<button type="button" role="radio" aria-checked="false" tabindex="${i ? -1 : 0}" class="incorrecto2" data-error="${k}"><b>${t}</b><span class="chico">${d}</span></button>`).join("")}</div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo, uso: `<p class="chico">El logo se usa siempre desde los archivos de Descargas. Nunca se redibuja ni se escribe con una fuente.</p>` });
    activarPiezas(el); await rellenarIconos();
    const caja = el.querySelector("[data-inc]"), botones = [...caja.querySelectorAll(".incorrecto2")], t = caja.querySelector("[data-inc-t]");
    caja.querySelector("[data-logo-i]").innerHTML = `${await logo()}<span class="incorrectos2__falso"><span class="incorrectos2__falso-iso">${isotipo({ titulo: "" })}</span><b>optimizo</b></span>`;
    const elegir = (b) => {
      const si = b.getAttribute("aria-checked") !== "true";
      botones.forEach((x) => { x.setAttribute("aria-checked", x === b && si); x.tabIndex = x === b ? 0 : -1; });
      caja.dataset.error = si ? b.dataset.error : "";
      t.textContent = si ? `No: ${b.querySelector("b").textContent.toLowerCase()}.` : "Así se usa: desde el archivo, sin tocarlo.";
    };
    botones.forEach((b, i) => { b.addEventListener("click", () => elegir(b)); b.addEventListener("keydown", (e) => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); const s = botones[(i + d + botones.length) % botones.length]; s.focus(); elegir(s); } }); });
  },

  /* ── Color para producción: fichas de imprenta que se copian ── */
  async "manual-color"(el) {
    const ficha = ([n, hex, rgb, cmyk]) => `<button type="button" class="ficha-color" data-copiar="${hex}" aria-label="${n} ${hex}: copiar"><i style="background:${hex}"></i><b>${n}</b><span class="mono">${hex}</span><span class="mono">RGB ${rgb}</span><span class="mono">CMYK ${cmyk}</span></button>`;
    const vivo = `<div class="color2">
      <div class="color2__grupo"><p class="titulo-3">Paleta A · Teal</p><div class="color2__fichas">${COLORES.teal.map(ficha).join("")}</div></div>
      <div class="color2__grupo"><p class="titulo-3">Paleta B · Mandarina</p><div class="color2__fichas">${COLORES.naranjo.map(ficha).join("")}</div></div>
      <div class="color2__grupo color2__grupo--ancho"><p class="titulo-3">Neutros · las dos paletas</p><div class="color2__fichas">${COLORES.neutros.map(ficha).join("")}</div></div>
      <div class="color2__grupo color2__grupo--ancho"><p class="titulo-3">Proporción</p><div class="proporcion2"><i style="flex:56;background:var(--hueso)"><span>Hueso 56 %</span></i><i style="flex:24;background:var(--papel)"><span>Papel 24 %</span></i><i style="flex:12;background:var(--navy);color:var(--hueso)"><span>Navy 12 %</span></i><i style="flex:4;background:var(--grafito)"></i><i style="flex:4;background:var(--acento)"></i></div>
        <p class="chico">Haz clic en una ficha para copiar su HEX. * CMYK referencial (conversión, no medido): antes de imprimir, pedir prueba de color.</p></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el);
    el.querySelectorAll("[data-copiar]").forEach((b) => b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(b.dataset.copiar); toast(`${b.dataset.copiar} copiado.`, { tono: "exito" }); } catch { toast(b.dataset.copiar); } }));
  },

  /* ── Tipografía para producción: cada soporte escrito con su letra ── */
  async "manual-tipo"(el) {
    const filas = [["Logo", "Poppins ExtraBold en trazos", "Nunca se escribe: se usa el archivo.", "logo"], ["Sitio y app", "SF del sistema · Inter de respaldo", '-apple-system, "SF Pro Text", "Inter"', "sistema"], ["PDF, presentaciones, Figma", "Inter", "Archivo fijo: se ve igual en cualquier equipo.", "inter"], ["Correo (HTML)", "Fuente del sistema", "-apple-system, Segoe UI, Helvetica, Arial", "correo"], ["Medula", "Geist", "Su propia letra, apretada.", "geist"], ["Bárbara", "Fraunces + Inter", "Titulares con serifa, interfaz en Inter.", "fraunces"]];
    const vivo = `<div class="tipo2">${filas.map(([s, l, d, k]) => `<div class="tipo2__fila"><div class="tipo2__soporte"><b>${s}</b><span class="chico">${l}</span><span class="mono">${d}</span></div><div class="tipo2__muestra tipo2__muestra--${k}">${k === "logo" ? "" : "Todo proceso tiene una salida."}</div></div>`).join("")}
      <div class="tipo2__reglas"><div><b>Licencias</b><span class="chico">Poppins, Inter, Geist y Fraunces: OFL, uso comercial libre. SF Pro la pone el sistema de Apple: no se distribuye.</span></div><div><b>Pesos</b><span class="chico">400 cuerpo · 500 interfaz · 600 énfasis · 650–700 títulos. Nada bajo 400 ni sobre 700 en texto.</span></div></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el);
    el.querySelector(".tipo2__muestra--logo").innerHTML = await logo();
  },

  /* ── Voz: un traductor de frases genéricas a la voz de Optimizo ── */
  async voz(el) {
    const pares = [["Automatizamos todos tus procesos con IA.", "Dejamos funcionando tus cotizaciones en un CRM: de 2,5 días a minutos."], ["Soluciones disruptivas de transformación digital.", "Entramos, entendemos cómo trabajas y lo dejamos funcionando."], ["Error: campo inválido.", "El RUT no calza con su dígito verificador. Revisa el número."], ["¡¡Revoluciona tu empresa hoy!!", "Treinta minutos para entender dónde se traba tu operación."]];
    const vivo = `<div class="voz2" data-voz>
      <div class="voz2__traductor"><div class="voz2__lado voz2__lado--no"><span class="rotulo">Genérico</span><div class="voz2__opciones" role="radiogroup" aria-label="Frase genérica">${pares.map(([no], i) => `<button type="button" role="radio" aria-checked="${i === 0}" tabindex="${i ? -1 : 0}" data-i="${i}">${no}</button>`).join("")}</div></div>
        <span class="voz2__flecha" aria-hidden="true">${icono("arrow-right", { tam: 24 })}</span>
        <div class="voz2__lado voz2__lado--si ceramica"><span class="rotulo">Optimizo</span><p class="voz2__frase" aria-live="polite" data-si>${pares[0][1]}</p></div></div>
      <div class="voz2__rasgos">${[["Como una consultora que sabe", "Calma, concreta, sin apuro."], ["De tú", "Español de Chile, sin modismos."], ["Con números", "Horas, días, pesos: cuando los hay."], ["Resultados, no tecnología", "Cotizar más rápido, no «IA»."]].map(([t, d]) => `<div><b>${t}</b><span class="chico">${d}</span></div>`).join("")}</div>
      <div class="voz2__palabras"><div><span class="rotulo">Sí</span><p>${["implementar", "dejar funcionando", "proceso", "equipo", "medir", "ordenar", "salida", "acompañar"].map((w) => `<span class="palabra palabra--si">${w}</span>`).join("")}</p></div><div><span class="rotulo">No</span><p>${["disruptivo", "revolucionar", "sinergia", "automatizar todo", "IA como promesa", "solución integral"].map((w) => `<span class="palabra palabra--no">${w}</span>`).join("")}</p></div></div></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el); await rellenarIconos();
    const ops = [...el.querySelectorAll(".voz2__opciones button")], si = el.querySelector("[data-si]");
    const elegir = (b) => { ops.forEach((x) => { x.setAttribute("aria-checked", x === b); x.tabIndex = x === b ? 0 : -1; }); si.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.16,1,.3,1)" }); si.textContent = pares[+b.dataset.i][1]; };
    ops.forEach((b, i) => { b.addEventListener("click", () => elegir(b)); b.addEventListener("keydown", (e) => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); const s = ops[(i + d + ops.length) % ops.length]; s.focus(); elegir(s); } }); });
  },

  /* ── Imagen: lo que sí (un proceso dibujado con la marca) frente a lo que no ── */
  async "manual-imagen"(el) {
    const vivo = `<div class="imagen2">
      <figure class="imagen2__si"><div class="imagen2__etapas">${etapas(["Pedido", "Cotización", "Envío", "Venta"], { actual: 1, avance: 0.5, compacto: true, etiqueta: "Ejemplo: un proceso por etapas" })}</div><figcaption><span class="insignia insignia--exito"><i></i>Sí</span>${lista(["Procesos como etapas: isotipos que se llenan y el punto que avanza.", "Interfaces reales del producto.", "El isotipo y el punto como protagonistas.", "Números grandes y datos con trama."])}</figcaption></figure>
      <figure class="imagen2__no"><div class="imagen2__collage" aria-hidden="true">${["robot", "brain", "lightning", "users-three"].map((i) => `<span>${icono(i, { tam: 40 })}</span>`).join("")}</div><figcaption><span class="insignia insignia--error"><i></i>No</span>${lista(["Fotos de stock de personas en reunión.", "Robots, cerebros brillantes, circuitos, neón.", "Ilustraciones 3D tipo plastilina.", "Partículas o efectos sin función."], "lista-punto lista-no")}</figcaption></figure></div>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el); await rellenarIconos();
    activarEtapas(el);
  },

  /* ── Aplicaciones: la marca en sus soportes, en cerámica ── */
  async aplicaciones(el) {
    const apps = [["#landing", "Sitio web", "web", `${isotipo({ titulo: "" })}<b>Todo proceso tiene una salida.</b>`], ["#cimientos", "App y paneles", "app", "<i></i><i></i><i></i>"], ["#correos", "Correos", "correo", `${isotipo({ titulo: "" })}<i></i><i></i><i class="corta"></i>`], ["#redes", "Redes", "redes", "<b>31 h</b>"], ["#presentacion", "Presentaciones", "lamina", "<b>Cotizar en minutos</b>"], ["#papeleria", "Papelería", "tarjeta", isotipo({ titulo: "" })], ["#familia", "Productos con sello", "sello", `<img src="assets/productos/medula-marca-blanca.svg" alt="">`], ["#video", "Video", "video", `${isotipo({ titulo: "" })}`]];
    const vivo = `<div class="aplicaciones2">${apps.map(([h, n, k, v], i) => `<a class="aplicacion2 ceramica" href="${h}" style="--i:${i}"><span class="aplicacion__vista aplicacion__vista--${k}">${v.replaceAll('role="img" aria-label=""', 'aria-hidden="true"')}</span><span class="aplicacion2__nombre">${n}${icono("arrow-right", { tam: 16 })}</span></a>`).join("")}</div><p class="chico">Cada aplicación lleva a su sección del guion, donde está funcionando.</p>`;
    cuerpo(el).innerHTML = pieza({ vivo });
    activarPiezas(el); await rellenarIconos();
  },
};

/* Íconos de app: se reusa la versión 1 dentro de la pieza (con su ícono a tamaño real). */
export const iconosApp2 = (v1) => async (el) => {
  await v1(el);
  const c = cuerpo(el), nodos = [...c.childNodes]; // se mueven los nodos (no el HTML): los lienzos ya están dibujados
  c.innerHTML = pieza({ vivo: `<div class="iconos-app2"></div>`, uso: `<div class="rejilla-2">${lista(["En 16 px el isotipo se lee igual: no hay versión simplificada.", "El ícono de app lleva el isotipo al 60 % sobre hueso o navy, con grano.", "La imagen al compartir (1200 × 630) siempre con la frase."])}</div>` });
  c.querySelector(".iconos-app2").append(...nodos);
  activarPiezas(el);
};
