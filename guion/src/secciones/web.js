/* Capítulo 6 · Web y marca (fase 11): landing real, correos HTML, firma, redes, presentación, papelería, íconos, 404. */
import { marco, rejilla, ficha, ejemplo } from "../kit/guion.js?v=aa26df1";
import { segmento, boton } from "../kit/controles.js?v=aa26df1";
import { toast } from "../kit/avisos.js?v=aa26df1";
import { isotipo, logo } from "../kit/marca.js?v=aa26df1";
import { correo, firma } from "../kit/correos.js?v=aa26df1";
import { lienzoPieza, isotipoCanvas, granoCanvas, parrafo, LETRA } from "../kit/piezas.js?v=aa26df1";

const cuerpo = (el) => el.querySelector(".seccion__cuerpo");
const raiz = document.documentElement;
const urlAsset = (p) => new URL(`../../assets/${p}`, import.meta.url).href;
const consulta = () => `?paleta=${raiz.dataset.paleta}&tema=${raiz.dataset.tema}`;

export const web = {
  async landing(el) {
    cuerpo(el).innerHTML = `<div class="landing-vista">
        <div class="landing-vista__barra">${segmento(["Computador", "Celular"], { etiqueta: "Ancho", nombre: "ancho" })}<a class="boton boton--texto boton--s" href="web/landing.html${consulta()}" target="_blank" rel="noopener">Abrir completa ↗</a></div>
        <div class="landing-vista__marco"><iframe src="web/landing.html${consulta()}" title="Landing de Optimizo" loading="lazy"></iframe></div></div>
      ${ficha({ que: "Landing real (web/landing.html) armada solo con piezas del guion: isotipo 3D, flujos, aura, kit de formularios. Es la base del sitio.", reglas: ["Una sola llamada a la acción repetida: «Agendar diagnóstico».", "Cada sección responde una pregunta del cliente: qué pasa, cómo trabajan, qué hacen, prueba, cómo empiezo.", "Las cifras de ejemplo se marcan."] })}`;
    const marcoIf = el.querySelector(".landing-vista__marco");
    el.querySelector('[data-segmento="ancho"]').addEventListener("cambio", (e) => marcoIf.classList.toggle("landing-vista__marco--celular", e.detail === "Celular"));
  },

  async correos(el) {
    const tipos = [["bienvenida", "Bienvenida"], ["reunion", "Reunión agendada"], ["informe", "Informe listo"]];
    cuerpo(el).innerHTML = `${rejilla(tipos.map(([t, n]) => marco(n, `<iframe class="correo-vista" data-correo="${t}" title="Correo: ${n}"></iframe><div class="fila-botones">${boton("Copiar HTML", { variante: "secundario", tam: "s", attrs: `data-copiar="${t}"` })}</div>`)), 3)}
      ${ficha({ que: "Correos en HTML real: tablas, estilos en línea, 600 px de ancho. Se ven igual en Gmail, Outlook y Apple Mail.", reglas: ["Sin grano, sin degradados de fondo, sin fuentes web: el correo va plano.", "Un solo botón por correo.", "El preencabezado (texto gris de la bandeja) siempre escrito a mano.", "En producción el logo va como PNG alojado (el SVG no se ve en Outlook)."] })}`;
    const logoURL = urlAsset("logo/optimizo-logo.svg");
    el.querySelectorAll("[data-correo]").forEach((f) => (f.srcdoc = correo(f.dataset.correo, logoURL)));
    el.querySelectorAll("[data-copiar]").forEach((b) => b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(correo(b.dataset.copiar, logoURL)); toast("HTML copiado.", { tono: "exito" }); } catch { toast("No se pudo copiar. Ábrelo y copia el código.", { tono: "error" }); } }));
  },

  async "firma-correo"(el) {
    const datos = { logoURL: urlAsset("logo/optimizo-isotipo.svg") };
    cuerpo(el).innerHTML = `${rejilla([
      marco("Vista", `<div class="firma-vista" data-firma>${firma(datos)}</div>`),
      marco("Personalizar", `<form class="pila" data-firma-form><label class="campo"><span class="campo__etiqueta">Nombre</span><span class="campo__control"><input name="nombre" value="Camila Rojas"></span></label>
        <label class="campo"><span class="campo__etiqueta">Cargo</span><span class="campo__control"><input name="cargo" value="Directora de proyectos"></span></label>
        <label class="campo"><span class="campo__etiqueta">Teléfono</span><span class="campo__control"><input name="telefono" value="+56 9 1234 5678"></span></label>
        <div class="fila-botones">${boton("Copiar firma", { attrs: "data-copiar-firma" })}</div></form>`, { nota: "Copia y pega en Gmail (Configuración → Firma) o en Outlook." }),
    ])}`;
    const f = el.querySelector("[data-firma-form]"), vista = el.querySelector("[data-firma]");
    const leer = () => ({ ...datos, ...Object.fromEntries(new FormData(f)) });
    f.addEventListener("input", () => (vista.innerHTML = firma(leer())));
    el.querySelector("[data-copiar-firma]").addEventListener("click", async () => {
      try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([firma(leer())], { type: "text/html" }) })]); toast("Firma copiada. Pégala en tu correo.", { tono: "exito" }); }
      catch { toast("No se pudo copiar automáticamente: selecciona la vista y copia.", { tono: "alerta" }); }
    });
  },

  async redes(el) {
    cuerpo(el).innerHTML = `<div class="piezas-rejilla">
        <div data-pieza="carrusel1"></div><div data-pieza="carrusel2"></div><div data-pieza="carrusel3"></div>
        <div data-pieza="post"></div><div data-pieza="banner" class="piezas-rejilla__ancho"></div></div>
      <div class="nav-pie">${ejemplo()}<p class="chico">Dibujadas en canvas al tamaño real; cambian con la paleta. Fondo hueso con grano, una idea por lámina, el punto como hilo del carrusel.</p></div>`;
    const fondo = (ctx, w, h, t, oscuro = false) => { ctx.fillStyle = oscuro ? t("--navy") : t("--hueso"); ctx.fillRect(0, 0, w, h); granoCanvas(ctx, w, h, 0.05); };
    const pie = (ctx, w, h, t, n, oscuro = false) => {
      isotipoCanvas(ctx, 80, h - 130, 52, oscuro ? null : null);
      ctx.font = `700 30px ${LETRA}`; ctx.fillStyle = oscuro ? t("--hueso") : t("--navy"); ctx.fillText("optimizo", 148, h - 92);
      if (n) { ctx.font = `600 26px ${LETRA}`; ctx.fillStyle = oscuro ? "rgba(237,238,232,.7)" : t("--grafito"); ctx.textAlign = "right"; ctx.fillText(n, w - 80, h - 92); ctx.textAlign = "left"; }
    };
    const punto = (ctx, x, y, r, t) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = t("--acento"); ctx.fill(); };
    lienzoPieza(el.querySelector('[data-pieza="carrusel1"]'), { ancho: 1080, alto: 1350, nombre: "Carrusel 1 de 3", dibujar: (ctx, w, h, t) => {
      fondo(ctx, w, h, t); punto(ctx, 96, 150, 14, t);
      ctx.font = `600 30px ${LETRA}`; ctx.fillStyle = t("--acento-texto-claro"); ctx.fillText("DIAGNÓSTICO", 128, 161);
      parrafo(ctx, "Tu equipo trabaja mucho. El proceso, no tanto.", 80, 360, 900, 118, { tam: 108, color: t("--navy") });
      pie(ctx, w, h, t, "1 / 3");
    } });
    lienzoPieza(el.querySelector('[data-pieza="carrusel2"]'), { ancho: 1080, alto: 1350, nombre: "Carrusel 2 de 3", dibujar: (ctx, w, h, t) => {
      fondo(ctx, w, h, t);
      ctx.font = `600 34px ${LETRA}`; ctx.fillStyle = t("--grafito"); ctx.fillText("Horas por semana que se pierden", 80, 200);
      ctx.font = `700 320px ${LETRA}`; ctx.fillStyle = t("--navy"); if ("letterSpacing" in ctx) ctx.letterSpacing = "-14px"; ctx.fillText("31 h", 64, 560); if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      parrafo(ctx, "Cotizar a mano, seguir clientes por WhatsApp y cuadrar el inventario: ahí se va.", 80, 720, 880, 62, { tam: 50, peso: 500, color: t("--grafito"), tracking: -0.015 });
      punto(ctx, 80 + 14, 1000, 14, t); ctx.font = `500 28px ${LETRA}`; ctx.fillStyle = t("--grafito"); ctx.fillText("Diagnóstico de ejemplo · distribuidora de 38 personas", 124, 1010);
      pie(ctx, w, h, t, "2 / 3");
    } });
    lienzoPieza(el.querySelector('[data-pieza="carrusel3"]'), { ancho: 1080, alto: 1350, nombre: "Carrusel 3 de 3", dibujar: (ctx, w, h, t) => {
      fondo(ctx, w, h, t, true);
      isotipoCanvas(ctx, w - 520, 140, 420);
      parrafo(ctx, "Todo proceso tiene una salida.", 80, 760, 860, 112, { tam: 104, color: t("--hueso") });
      ctx.font = `600 36px ${LETRA}`; ctx.fillStyle = t("--acento-claro"); ctx.fillText("Agenda tu diagnóstico → optimizo.cl", 80, 1050);
      pie(ctx, w, h, t, "3 / 3", true);
    } });
    lienzoPieza(el.querySelector('[data-pieza="post"]'), { ancho: 1080, alto: 1080, nombre: "Post cuadrado", dibujar: (ctx, w, h, t) => {
      fondo(ctx, w, h, t); isotipoCanvas(ctx, 300, 180, 480);
      ctx.textAlign = "center"; parrafo(ctx, "No recomendamos.", w / 2, 800, 960, 92, { tam: 84, color: t("--navy") }); parrafo(ctx, "Implementamos.", w / 2, 892, 960, 92, { tam: 84, color: t("--acento-texto-claro") }); ctx.textAlign = "left";
    } });
    lienzoPieza(el.querySelector('[data-pieza="banner"]'), { ancho: 1584, alto: 396, nombre: "Portada de LinkedIn", dibujar: (ctx, w, h, t) => {
      fondo(ctx, w, h, t); isotipoCanvas(ctx, w - 360, 48, 300);
      // título en una línea: el ancho disponible manda el tamaño
      const usado = parrafo(ctx, "Todo proceso tiene una salida.", 470, 186, 700, 62, { tam: 56, color: t("--navy") });
      ctx.font = `500 28px ${LETRA}`; ctx.fillStyle = t("--grafito"); ctx.fillText("Partner de transformación digital", 470, 186 + usado);
    } });
  },

  async presentacion(el) {
    const lamina = (contenido, clase = "") => `<div class="lamina ${clase}"><div class="lamina__dentro">${contenido}</div></div>`;
    cuerpo(el).innerHTML = `<div class="laminas">
        ${lamina(`<div class="lamina__portada">${isotipo({ clase: "lamina__iso" })}<div><p class="ceja">Propuesta · octubre 2026</p><p class="lamina__titulo">Cotizar en minutos, no en días</p><p class="lamina__sub">Quillay Suministros Industriales</p></div></div>`, "lamina--portada")}
        ${lamina(`<p class="ceja">Lo que encontramos</p><p class="lamina__titulo lamina__titulo--m">31 horas por semana se van en 6 procesos</p><ul class="lista-punto lamina__lista"><li>Cotizaciones a mano · 12 h</li><li>Seguimiento en WhatsApp · 7 h</li><li>Inventario que no calza · 6 h</li></ul>`)}
        ${lamina(`<p class="ceja">El número</p><p class="lamina__heroe">31 h</p><p class="lamina__sub">recuperables por semana, sin contratar a nadie</p>`)}
        ${lamina(`<div class="lamina__cierre"><p class="lamina__titulo">Todo proceso tiene una salida.</p><p class="lamina__sub">camila@optimizo.cl · optimizo.cl</p></div>`, "lamina--oscura")}
      </div>
      ${ficha({ que: "Plantilla de presentación 16:9 en cuatro tipos de lámina: portada, contenido, número héroe y cierre.", reglas: ["Una idea por lámina; el título dice la conclusión, no el tema.", "Máximo 3 viñetas de una línea.", "Letra: Inter en las láminas (archivo fijo); Poppins solo en el logo.", "La lámina oscura solo para cierre."] })}`;
  },

  async papeleria(el) {
    cuerpo(el).innerHTML = `${rejilla([
      marco("Portada de propuesta (A4)", `<div class="a4"><div class="a4__arriba">${await logo({ clase: "a4__logo" })}<span class="rotulo">Propuesta comercial</span></div>
        <div class="a4__centro">${isotipo({ clase: "a4__iso" })}<p class="a4__titulo">Cotizar en minutos, no en días</p><p class="chico">Preparada para Quillay Suministros Industriales</p></div>
        <div class="a4__pie rotulo"><span>Octubre 2026</span><span>Confidencial</span></div></div>`, { nota: "Formato A4 vertical para PDF. Mucho aire; el isotipo como ancla visual." }),
      marco("Tarjeta digital (frente y dorso)", `<div class="tarjetas"><div class="tarjeta tarjeta--frente">${isotipo({ clase: "tarjeta__iso" })}</div>
        <div class="tarjeta tarjeta--dorso"><div><b>Camila Rojas</b><span>Directora de proyectos</span></div><div class="tarjeta__datos"><span>+56 9 1234 5678</span><span>camila@optimizo.cl</span><span>optimizo.cl</span></div><span class="tarjeta__logo">${await logo()}</span></div></div>`, { nota: "85 × 55 mm. Frente navy con el isotipo; dorso hueso con los datos." }),
    ])}`;
  },

  async "iconos-app"(el) {
    cuerpo(el).innerHTML = `<div class="piezas-rejilla piezas-rejilla--iconos"><div data-pieza="app"></div><div data-pieza="app-osc"></div><div data-pieza="og" class="piezas-rejilla__ancho"></div></div>
      ${marco("Favicon a tamaño real", `<div class="favicons">${[16, 32, 48].map((t) => `<span><img src="assets/logo/optimizo-isotipo.svg" width="${t}" height="${t}" alt=""><span class="mono">${t}</span></span>`).join("")}<span class="pestana"><img src="assets/logo/optimizo-isotipo.svg" width="16" height="16" alt="">Optimizo — Todo proceso…</span></div>`, { nota: "En 16 px el isotipo se lee igual: disco, agujero y punto. Por eso no se simplifica." })}`;
    const app = (oscuro) => (ctx, w, h, t) => {
      const r = 230; ctx.beginPath(); ctx.roundRect(0, 0, w, h, r); ctx.fillStyle = oscuro ? t("--navy") : t("--hueso"); ctx.fill();
      ctx.save(); ctx.clip(); granoCanvas(ctx, w, h, 0.04); ctx.restore();
      isotipoCanvas(ctx, w * 0.2, h * 0.2, w * 0.6);
    };
    lienzoPieza(el.querySelector('[data-pieza="app"]'), { ancho: 1024, alto: 1024, nombre: "Ícono de app claro", dibujar: app(false) });
    lienzoPieza(el.querySelector('[data-pieza="app-osc"]'), { ancho: 1024, alto: 1024, nombre: "Ícono de app oscuro", dibujar: app(true) });
    lienzoPieza(el.querySelector('[data-pieza="og"]'), { ancho: 1200, alto: 630, nombre: "Imagen al compartir", dibujar: (ctx, w, h, t) => {
      ctx.fillStyle = t("--hueso"); ctx.fillRect(0, 0, w, h); granoCanvas(ctx, w, h, 0.05);
      isotipoCanvas(ctx, 72, 72, 72); ctx.font = `700 40px ${LETRA}`; ctx.fillStyle = t("--navy"); ctx.fillText("optimizo", 162, 122);
      parrafo(ctx, "Todo proceso tiene una salida.", 72, 360, 760, 84, { tam: 76, color: t("--navy") });
      ctx.font = `500 28px ${LETRA}`; ctx.fillStyle = t("--grafito"); ctx.fillText("Partner de transformación digital", 72, 540);
      isotipoCanvas(ctx, w - 360, h - 300, 420);
    } });
  },

  async "error-404"(el) {
    cuerpo(el).innerHTML = `<div class="p404 mate">${isotipo({ clase: "p404__iso" })}<div class="p404__texto"><p class="ceja">Error 404</p><p class="titulo-1">Esta página encontró su salida.</p>
        <p class="bajada">El enlace ya no existe o cambió de lugar. Lo que buscas probablemente está en el inicio.</p>
        <div class="fila-botones">${boton("Volver al inicio", { ico: "house" })}${boton("Buscar", { variante: "texto", ico: "magnifying-glass" })}</div></div></div>`;
  },
};
