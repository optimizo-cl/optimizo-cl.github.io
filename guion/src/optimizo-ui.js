/* Optimizo UI — entrada única del kit para construir el sitio, la app y los productos.
   CSS (en este orden): tokens/optimizo.css → estilos/base.css → movimiento.css → kit.css → kit-piezas.css → patrones.css → datos.css → producto.css
   Una vez por página: activarControles(); activarCampos(); y opcionalmente activarAtajoBuscador(). */

// Marca
export { isotipo, logo, LADO } from "./kit/marca.js";
export { carga, cargaMarca, progreso, moverProgreso, listo, cursorPunto } from "./kit/punto.js";
export { icono, cargarIconos, rellenarIconos } from "./kit/iconos.js";
export { colorDe, contraste } from "./kit/color.js";

// Kit
export { boton, botonIcono, trabajar, segmento, interruptor, casilla, radio, deslizador, activarControles } from "./kit/controles.js";
export { campo, validar, mostrarError, activarCampos, formatearRut, rutValido, formatearPesos, formatearTelefono } from "./kit/campos.js";
export { toast, banner, alerta, insignia, etiqueta, contador } from "./kit/avisos.js";
export { abrirMenu, abrirPopover, cerrarFlotante, abrirDialogo, confirmarDestructivo } from "./kit/popups.js";

// Escenas (la 3D se importa aparte para no cargar three.js si no se usa: ./kit/escenas/isotipo3d.js)
export { aura } from "./kit/escenas/aura.js";
export { flujos, RED_QUILLAY } from "./kit/escenas/flujos.js";
export { bucle, movimientoReducido } from "./kit/escenas/vigia.js";

// Patrones
export { asistente, tarjetasOpcion } from "./patrones/asistente.js";
export { calendario, horas, fechaLarga } from "./patrones/fechas.js";
export { soltar } from "./patrones/soltar.js";
export { tabla } from "./patrones/tabla.js";
export { barras, linea, dona, heroe } from "./patrones/graficas.js";
export { abrirBuscador, activarAtajoBuscador, resultadosHTML } from "./patrones/buscador.js";

// Producto y piezas de marca
export { sello, escaleraHTML, PASOS_MADUREZ } from "./secciones/producto.js";
export { correo, firma } from "./kit/correos.js";
export { lienzoPieza, isotipoCanvas, granoCanvas, parrafo } from "./kit/piezas.js";
