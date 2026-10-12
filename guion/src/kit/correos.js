/* Correos HTML reales: tablas + estilos en línea + 600 px (lo único que Gmail y Outlook pintan igual).
   Sin grano ni degradados de fondo: el correo va plano. El logo va como imagen (en producción, PNG alojado). */
const tok = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const LETRA = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function marco({ preencabezado, contenido, logoURL }) {
  const navy = tok("--navy"), hueso = tok("--hueso"), grafito = tok("--grafito");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"><title>Optimizo</title></head>
<body style="margin:0;padding:0;background:${hueso};">
<div style="display:none;max-height:0;overflow:hidden;">${preencabezado}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${hueso};"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
<tr><td style="padding:0 8px 24px;"><img src="${logoURL}" width="132" alt="Optimizo" style="display:block;border:0;height:auto;"></td></tr>
<tr><td style="background:#ffffff;border-radius:16px;padding:40px 40px 36px;font-family:${LETRA};color:${navy};">${contenido}</td></tr>
<tr><td style="padding:24px 8px;font-family:${LETRA};font-size:12px;line-height:18px;color:${grafito};">Optimizo · Partner de transformación digital<br>Recibes este correo porque trabajas con nosotros. <a href="#" style="color:${grafito};">Preferencias de correo</a></td></tr>
</table></td></tr></table></body></html>`;
}
const titulo = (t) => `<h1 style="margin:0 0 16px;font-size:26px;line-height:32px;font-weight:700;letter-spacing:-0.5px;">${t}</h1>`;
const parrafo = (t) => `<p style="margin:0 0 16px;font-size:16px;line-height:25px;color:${tok("--grafito")};">${t}</p>`;
const boton = (t) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:${tok("--navy")};border-radius:12px;"><a href="#" style="display:inline-block;padding:14px 24px;font-family:${LETRA};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${t}</a></td></tr></table>`;
const dato = (k, v) => `<tr><td style="padding:10px 0;border-bottom:1px solid #E4E6DE;font-size:14px;color:${tok("--grafito")};">${k}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #E4E6DE;font-size:14px;font-weight:600;">${v}</td></tr>`;

export function correo(tipo, logoURL) {
  const acento = tok("--acento-texto-claro");
  if (tipo === "bienvenida") return marco({ logoURL, preencabezado: "Tu diagnóstico empieza el lunes. Esto es lo que viene.", contenido:
    `${titulo("Hola Camila, empecemos")}${parrafo("Gracias por confiar en Optimizo. El lunes 14 de septiembre partimos con el diagnóstico de Quillay: conversaremos con tu equipo y mediremos dónde se va el tiempo.")}${parrafo("Para la primera reunión solo necesitamos 45 minutos y a quien lleva las cotizaciones.")}${boton("Ver el plan del diagnóstico")}<p style="margin:0;font-size:14px;line-height:22px;color:${acento};font-weight:600;">— El equipo de Optimizo</p>` });
  if (tipo === "reunion") return marco({ logoURL, preencabezado: "Lunes 14 de septiembre, 10:30 h por videollamada.", contenido:
    `${titulo("Reunión agendada")}${parrafo("Te esperamos para la primera conversación del diagnóstico.")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${dato("Día", "Lunes 14 de septiembre")}${dato("Hora", "10:30 h (Chile continental)")}${dato("Duración", "45 minutos")}${dato("Dónde", "Videollamada")}</table>${boton("Agregar a mi calendario")}${parrafo('¿No puedes? <a href="#" style="color:' + acento + ';">Cambia la hora</a> con un clic.')}` });
  return marco({ logoURL, preencabezado: "31 horas por semana que se pueden recuperar.", contenido:
    `<p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1px;color:${acento};text-transform:uppercase;">Informe listo</p>${titulo("Tu diagnóstico está listo")}${parrafo("Encontramos dónde se va el tiempo en Quillay. El resumen:")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#F6F6F1;border-radius:12px;"><tr><td style="padding:20px 24px;"><p style="margin:0;font-size:13px;color:${tok("--grafito")};">Horas recuperables por semana</p><p style="margin:4px 0 0;font-size:40px;line-height:44px;font-weight:700;letter-spacing:-1px;">31 h</p></td></tr></table>${boton("Ver el informe completo")}` });
}

/** Firma de correo (tabla simple, se pega en Gmail/Outlook). */
export function firma({ nombre = "Martina Fuentes", cargo = "Directora de proyectos", telefono = "+56 9 1234 5678", logoURL }) {
  const navy = tok("--navy"), grafito = tok("--grafito"), acento = tok("--acento-texto-claro");
  return `<table cellpadding="0" cellspacing="0" style="font-family:${LETRA};color:${navy};"><tr>
<td style="padding-right:16px;border-right:2px solid ${tok("--acento")};vertical-align:top;"><img src="${logoURL}" width="40" height="40" alt="Optimizo" style="display:block;"></td>
<td style="padding-left:16px;vertical-align:top;"><p style="margin:0;font-size:15px;font-weight:700;">${nombre}</p><p style="margin:2px 0 8px;font-size:13px;color:${grafito};">${cargo} · Optimizo</p>
<p style="margin:0;font-size:13px;line-height:20px;color:${grafito};">${telefono} · <a href="#" style="color:${acento};text-decoration:underline;">optimizo.cl</a></p></td></tr></table>`;
}
