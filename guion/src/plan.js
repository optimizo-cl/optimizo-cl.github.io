/* Plan del guion visual v2: una sola fuente para el índice, la navegación lateral y las secciones.
   fase = ola del plan v2 (docs/PLAN-GUION-V2.md). El estado lo calcula main.js según lo construido. */
export const CAPITULOS = [
  { id: "identidad", n: "1", nombre: "Identidad", que: "El disco, la mordida y el punto que se escapa: concepto, logo, color, letra, material y escenas.", escena: "isotipo" },
  { id: "kit", n: "2", nombre: "Kit", que: "Piezas de cerámica que se hunden, responden y confirman con el punto.", escena: "ceramica" },
  { id: "formularios", n: "3", nombre: "Formularios", que: "Pedir datos como una conversación: mientras respondes, se dibuja tu empresa.", escena: "escritura" },
  { id: "datos", n: "4", nombre: "Datos y cimientos", que: "Números con trama, gráficas que se dibujan y la base de cualquier app.", escena: "trama" },
  { id: "producto", n: "5", nombre: "Producto y familia", que: "Lo que solo Optimizo tiene, y cómo conviven Medula y Bárbara bajo el sello.", escena: "familia" },
  { id: "web", n: "6", nombre: "Web y marca", que: "Donde la marca sale al mundo: sitio, redes, presentaciones, correos.", escena: "pieza" },
  { id: "manual", n: "7", nombre: "Manual", que: "Las reglas, la anatomía y las descargas: el brandbook vivo.", escena: "reticula" },
];

const s = (id, nombre, cap, fase, contiene) => ({ id, nombre, cap, fase, contiene });

export const SECCIONES = [
  // 1 · Identidad
  s("portada", "Portada", "identidad", 2, "Héroe que se funde con el fondo."),
  s("concepto", "Concepto", "identidad", 1, "«Todo proceso tiene una salida», contado con el isotipo."),
  s("logo", "Logo", "identidad", 3, "Construcción animada, las «i» vivas, versiones y superficies."),
  s("color", "Color", "identidad", 1, "Pigmentos de esmalte, paletas A y B, proporción viva."),
  s("tipografia", "Tipografía", "identidad", 1, "Tipografía cinética, especímenes, escala y ritmo."),
  s("espacio", "Espacio", "identidad", 1, "El espacio se mide con el punto: los aires y la escala."),
  s("forma", "Forma y profundidad", "identidad", 1, "Radios, sombras como objetos bajo luz, capas."),
  s("material", "Material", "identidad", 1, "Banco de materiales: cerámica, papel, bizcocho."),
  s("firma", "La firma en movimiento", "identidad", 3, "Los dieciséis momentos del punto."),
  s("laboratorio", "Laboratorio del punto", "identidad", 3, "Arrastra el punto: vuelve a su órbita con resorte."),
  s("iconos", "Íconos", "identidad", 1, "Phosphor línea con micro-animación y retícula."),
  // 2 · Kit
  s("botones", "Botones", "kit", 4, "Cerámica que se hunde, flecha que se vuelve punto, éxito que aterriza."),
  s("eleccion", "Controles", "kit", 4, "Perilla, segmentado con punto, deslizador con trama."),
  s("campos", "Campos", "kit", 4, "Validación en vivo con el punto, formatos chilenos que se ordenan solos."),
  s("cargas", "Cargas y estados", "kit", 4, "Cargas hechas con el logo: el punto salta, el disco se llena; esqueletos de grano."),
  s("avisos", "Avisos", "kit", 4, "Papel que se desliza, pila con profundidad, banners con órbitas."),
  s("insignias", "Etiquetas y estados", "kit", 4, "El estado por forma (lleno, medio, vacío), fichas de cerámica."),
  s("menus", "Menús y popovers", "kit", 4, "Nacen del botón en círculo; papel con puntero de punto."),
  s("dialogos", "Diálogos", "kit", 4, "Nacen del punto de la marca al centro de la pantalla."),
  // 3 · Formularios
  s("diagnostico", "Diagnóstico", "formularios", 5, "Una pregunta por pantalla; tu empresa se dibuja mientras respondes."),
  s("cotizacion", "Cotizador", "formularios", 5, "La escalera se ilumina y estima horas recuperables."),
  s("agendar", "Agendar", "formularios", 5, "Disponibilidad como densidad de puntos y cinta de horas."),
  s("archivos", "Subir archivos", "formularios", 5, "El disco se llena con lo que sube; el punto aterriza cuando todo está listo."),
  s("encuesta", "Encuesta", "formularios", 5, "La nota llena el disco; el punto dice qué tan cerca estamos."),
  s("contacto", "Contacto", "formularios", 5, "El formulario corto, con la firma al enviar."),
  s("validacion", "Validación", "formularios", 5, "Cuándo validar y cómo decir qué hacer."),
  // 4 · Datos y cimientos
  s("graficas", "Gráficas", "datos", 6, "Se dibujan al entrar, trama como textura y segunda codificación, anotaciones."),
  s("tablas", "Tablas", "datos", 6, "Cascada, orden con transición, estado por forma, edición en línea."),
  s("fechas", "Fechas", "datos", 6, "Rango sobre una pista de puntos, formatos."),
  s("numeros", "Números", "datos", 6, "Pesos, variaciones, contadores con el punto."),
  s("vacios", "Vacíos y errores", "datos", 6, "Cada estado es una pose del isotipo; la acción la resuelve."),
  s("cimientos", "Cimientos de app", "datos", 6, "Retícula, barra lateral, migas y ⌘K: la base, no la maqueta."),
  // 5 · Producto y familia
  s("familia", "Familia de marcas", "producto", 7, "Optimizo madre, productos con su material, el punto que los une."),
  s("medula", "Medula · de Optimizo", "producto", 7, "Medula con su sistema real: cobalto, aurora punteada, su símbolo."),
  s("barbara", "Bárbara · de Optimizo", "producto", 7, "Su material real: noche, lima, Fraunces y su personaje."),
  s("mapa-procesos", "Mapa de procesos", "producto", 6, "Del caos al orden con el scroll, en Órbitas."),
  s("escalera", "Escalera de madurez", "producto", 6, "Sin CRM → departamentos, el punto sube."),
  s("implementacion", "Implementación", "producto", 7, "Cada etapa es un isotipo que se llena; el punto salta de nido en nido."),
  s("informe", "Informe de diagnóstico", "producto", 7, "Documento vivo con portada de cerámica y gráficas que se dibujan."),
  s("propuesta", "Propuesta", "producto", 7, "La propuesta como documento vivo."),
  // 6 · Web y marca
  s("landing", "Sitio", "web", 8, "Landing v2: héroe en fase, caos → orden, cotizador vivo."),
  s("video", "Video de marca", "web", 8, "Pieza de 20–30 s armada en el navegador, exportable a MP4."),
  s("redes", "Redes", "web", 8, "Piezas animadas y fijas, PNG y MP4."),
  s("presentacion", "Presentación", "web", 8, "Láminas con transiciones del punto."),
  s("correos", "Correos", "web", 8, "HTML real, logo PNG alojado."),
  s("firma-correo", "Firma de correo", "web", 8, "Copiable para Gmail y Outlook."),
  s("papeleria", "Papelería", "web", 8, "Tarjeta en 3D, carpeta, propuesta A4."),
  s("iconos-app", "Íconos de app", "web", 8, "Favicon, ícono de app, imagen al compartir."),
  s("error-404", "404", "web", 8, "El punto se perdió: devuélvelo."),
  // 7 · Manual
  s("manual-logo", "Construcción del logo", "manual", 9, "Retícula, resguardo y mínimos, con cotas animadas."),
  s("usos-incorrectos", "Usos incorrectos", "manual", 9, "Lo que nunca se hace con el logo."),
  s("manual-color", "Color para producción", "manual", 9, "HEX, RGB, CMYK, proporciones."),
  s("manual-tipo", "Tipografía para producción", "manual", 9, "Qué letra en cada soporte."),
  s("movimiento-spec", "Movimiento", "manual", 9, "Curvas y tiempos dibujados, reproducibles."),
  s("voz", "Voz y tono", "manual", 9, "Cómo habla Optimizo."),
  s("manual-imagen", "Imagen", "manual", 9, "Reglas de diagramas y texturas."),
  s("aplicaciones", "Aplicaciones", "manual", 9, "La marca puesta en sus soportes."),
  s("descargas", "Descargas", "manual", 9, "Logos, animaciones, manual y paquete."),
];

export const capituloDe = (id) => CAPITULOS.find((c) => c.id === SECCIONES.find((x) => x.id === id)?.cap);
export const seccionesDe = (cap) => SECCIONES.filter((x) => x.cap === cap);
export const numeroDe = (id) => { const sec = SECCIONES.find((x) => x.id === id); const cap = capituloDe(id); return cap ? `${cap.n}.${String(seccionesDe(cap.id).indexOf(sec) + 1).padStart(2, "0")}` : ""; };
