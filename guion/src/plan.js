/* Plan del guion visual de Optimizo: una sola fuente para el índice, el dock y las secciones.
   estado: "listo" | "en-curso" | "por-hacer" · fase = fase del plan (docs/PLAN-GUION-VISUAL.md) */
export const CAPITULOS = [
  { id: "identidad", n: "1", nombre: "Identidad", que: "Concepto, logo, color, letra, forma, material, escenas y la firma." },
  { id: "kit", n: "2", nombre: "Kit", que: "Las piezas que usa todo, cada una con su ficha de uso." },
  { id: "formularios", n: "3", nombre: "Formularios", que: "Pedir datos sin fricción: diagnóstico, agenda, cotización, archivos." },
  { id: "patrones", n: "4", nombre: "Patrones", que: "Navegar, leer datos y decidir." },
  { id: "producto", n: "5", nombre: "Producto Optimizo", que: "Las piezas que solo Optimizo tiene." },
  { id: "web", n: "6", nombre: "Web y marca", que: "Donde la marca sale al mundo." },
  { id: "manual", n: "7", nombre: "Manual de marca", que: "El brandbook: reglas, usos y descargas." },
];

const s = (id, nombre, cap, fase, contiene, estado = "por-hacer") => ({ id, nombre, cap, fase, contiene, estado });

export const SECCIONES = [
  // 1 · Identidad
  s("portada", "Portada", "identidad", 6, "La firma: el punto que se escapa del disco y vuelve.", "en-curso"),
  s("concepto", "Concepto", "identidad", 2, "«Todo proceso tiene una salida» y cómo lo cuenta el isotipo.", "listo"),
  s("logo", "Logo", "identidad", 1, "Logo en Poppins, versiones, sobre fondos, en un color.", "listo"),
  s("color", "Color", "identidad", 4, "Paletas A · Teal y B · Mandarina, neutros, semánticos y contrastes medidos.", "listo"),
  s("tipografia", "Tipografía", "identidad", 4, "SF del sistema / Inter: escala, pesos, tracking, números."),
  s("espacio", "Espacio y retícula", "identidad", 4, "Base 4, márgenes, columnas, ritmo vertical."),
  s("forma", "Forma y profundidad", "identidad", 4, "Radios medios, sombras, capas."),
  s("material", "Material", "identidad", 5, "Mate con grano: el grano es la superficie (papel, cerámica)."),
  s("aura", "Aura con grano", "identidad", 5, "Degradado fluido de la paleta donde el grano es el degradado."),
  s("isotipo-3d", "Isotipo 3D", "identidad", 5, "El isotipo como objeto de cerámica mate; el punto orbita."),
  s("flujos", "Flujos y nodos", "identidad", 5, "Diagramas vivos: el punto recorre los sistemas de la empresa."),
  s("firma", "La firma en movimiento", "identidad", 6, "Los siete momentos del punto: portada, carga, progreso, listo, guía, bullet, cursor."),
  s("carga", "La carga", "identidad", 6, "El punto orbitando como indicador de espera."),
  s("iconos", "Íconos", "identidad", 7, "Phosphor línea: tamaños, trazo, alineación con texto."),
  // 2 · Kit
  s("botones", "Botones", "kit", 7, "Primario, acento, secundario, texto, ícono; cargando y listo."),
  s("eleccion", "Elección", "kit", 7, "Segmentado, interruptor, casillas, radios, deslizador."),
  s("campos", "Campos", "kit", 7, "Texto, área, selector, RUT, correo, teléfono, moneda, con estados."),
  s("estados", "Carga y estados", "kit", 7, "Esqueleto, progreso, vacío, error, sin conexión."),
  s("avisos", "Avisos", "kit", 7, "Toast con deshacer, banner, alerta, error de campo."),
  s("insignias", "Insignias y etiquetas", "kit", 7, "Estados de procesos, etiquetas, contadores."),
  s("menus", "Menús y popovers", "kit", 7, "Menú que nace del botón, popover, tooltip."),
  s("dialogos", "Diálogos y hojas", "kit", 7, "Modal, hoja lateral, confirmación destructiva."),
  // 3 · Formularios
  s("diagnostico", "Diagnóstico en pasos", "formularios", 8, "Levantamiento de procesos de una empresa, paso a paso."),
  s("agendar", "Agendar reunión", "formularios", 8, "Elegir día y hora, datos mínimos, confirmación."),
  s("contacto", "Contacto", "formularios", 8, "El formulario corto del sitio."),
  s("cotizacion", "Cotización", "formularios", 8, "Pedir una propuesta: qué necesitas, tamaño, plazos."),
  s("archivos", "Subir archivos", "formularios", 8, "Soltar planillas y documentos, progreso, errores."),
  s("validacion", "Validación y errores", "formularios", 8, "Cuándo validar, cómo decir qué hacer."),
  s("encuesta", "Encuesta y NPS", "formularios", 8, "Satisfacción de implementación, escala, comentarios."),
  // 4 · Patrones
  s("nav-app", "Navegación de app", "patrones", 9, "Barra lateral, migas, buscador ⌘K."),
  s("nav-sitio", "Navegación del sitio", "patrones", 9, "Barra que se pliega, menú de servicios."),
  s("nav-celular", "Navegación en celular", "patrones", 9, "Barra inferior, menú a pantalla completa, hojas."),
  s("paneles", "Paneles", "patrones", 9, "Tarjetas de resumen, detalle lateral."),
  s("tablas", "Tablas", "patrones", 9, "Orden, filtros, selección, paginación, versión celular."),
  s("fechas", "Fechas", "patrones", 9, "Calendario, rangos, horas."),
  s("graficas", "Gráficas", "patrones", 9, "Barras, líneas, donas con paleta validada."),
  s("numeros", "Números y finanzas", "patrones", 9, "Pesos chilenos, porcentajes, variaciones, tabulares."),
  s("vacios", "Vacíos y errores", "patrones", 9, "Pantallas vacías que invitan; errores que dicen qué hacer."),
  s("busqueda", "Búsqueda", "patrones", 9, "Buscar en la memoria de la empresa, resultados con contexto."),
  // 5 · Producto
  s("mapa-procesos", "Mapa de procesos", "producto", 10, "Los procesos de Quillay: del caos al orden."),
  s("escalera", "Escalera de madurez", "producto", 10, "Sin CRM → CRM → Medula → agentes → departamentos."),
  s("flujo-conecta", "El flujo que conecta", "producto", 10, "CRM → Medula → agentes; el punto enciende cada paso."),
  s("implementacion", "Panel de implementación", "producto", 10, "Avance por etapa, responsables, próximos hitos."),
  s("informe", "Informe de diagnóstico", "producto", 10, "Hallazgos, horas perdidas, oportunidades priorizadas."),
  s("propuesta", "Propuesta y cotización", "producto", 10, "La propuesta comercial como documento vivo."),
  s("sellos", "Sello «de Optimizo»", "producto", 10, "Medula y Bárbara con su identidad + el sello."),
  // 6 · Web y marca
  s("landing", "Landing", "web", 11, "Scroll narrativo: todo proceso tiene una salida."),
  s("correos", "Correos", "web", 11, "Bienvenida, confirmación de reunión, informe listo (HTML real)."),
  s("firma-correo", "Firma de correo", "web", 11, "Firma para Gmail y Outlook."),
  s("redes", "Redes", "web", 11, "Carrusel y posts de LinkedIn e Instagram a tamaño real."),
  s("presentacion", "Presentación comercial", "web", 11, "Plantilla de diapositivas."),
  s("papeleria", "Papelería", "web", 11, "Propuesta en PDF, tarjeta digital."),
  s("iconos-app", "Íconos de app y para compartir", "web", 11, "Favicon, ícono de app, imagen al compartir."),
  s("error-404", "404", "web", 11, "La página perdida: el punto se fue."),
  // 7 · Manual
  s("manual-logo", "Construcción del logo", "manual", 12, "Retícula, área de resguardo, tamaños mínimos."),
  s("usos-incorrectos", "Usos incorrectos", "manual", 12, "Lo que nunca se hace con el logo."),
  s("manual-color", "Color para producción", "manual", 12, "HEX, RGB, CMYK de referencia, proporciones de uso."),
  s("manual-tipo", "Tipografía para producción", "manual", 12, "Qué letra en cada soporte (web, PDF, Docs, correo)."),
  s("voz", "Voz y tono", "manual", 12, "Cómo habla Optimizo; palabras sí y no."),
  s("manual-imagen", "Imagen abstracta", "manual", 12, "Reglas de diagramas e ilustración."),
  s("aplicaciones", "Aplicaciones", "manual", 12, "La marca puesta en sus soportes."),
  s("descargas", "Descargas", "manual", 12, "Paquete de logos (SVG, PNG, PDF), paletas y manual en PDF."),
];

export const capituloDe = (id) => CAPITULOS.find((c) => c.id === SECCIONES.find((x) => x.id === id)?.cap);
export const seccionesDe = (cap) => SECCIONES.filter((x) => x.cap === cap);
