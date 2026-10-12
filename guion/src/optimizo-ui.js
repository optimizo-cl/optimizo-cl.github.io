/* Optimizo UI — entrada única del kit para construir el sitio, la app y los productos.
   CSS (en este orden): tokens/optimizo.css → estilos/base.css → movimiento.css → kit.css → kit-piezas.css → patrones.css → datos.css → producto.css
   Una vez por página: activarControles(); activarCampos(); y opcionalmente activarAtajoBuscador(). */

// Marca
export { isotipo, logo, LADO } from "./kit/marca.js?v=e33c371";
export { carga, cargaMarca, progreso, moverProgreso, listo, cursorPunto } from "./kit/punto.js?v=e33c371";
export { icono, cargarIconos, rellenarIconos } from "./kit/iconos.js?v=e33c371";
export { colorDe, contraste } from "./kit/color.js?v=e33c371";

// Kit
export { boton, botonIcono, trabajar, segmento, interruptor, casilla, radio, deslizador, activarControles } from "./kit/controles.js?v=e33c371";
export { campo, validar, mostrarError, activarCampos, formatearRut, rutValido, formatearPesos, formatearTelefono } from "./kit/campos.js?v=e33c371";
export { toast, banner, alerta, insignia, etiqueta, contador } from "./kit/avisos.js?v=e33c371";
export { abrirMenu, abrirPopover, cerrarFlotante, abrirDialogo, confirmarDestructivo } from "./kit/popups.js?v=e33c371";

// Escenas
export { aura } from "./kit/escenas/aura.js?v=e33c371";
export { flujos, RED_QUILLAY } from "./kit/escenas/flujos.js?v=e33c371";
export { bucle, movimientoReducido } from "./kit/escenas/vigia.js?v=e33c371";

// Patrones
export { asistente, tarjetasOpcion } from "./patrones/asistente.js?v=e33c371";
export { calendario, horas, fechaLarga } from "./patrones/fechas.js?v=e33c371";
export { soltar } from "./patrones/soltar.js?v=e33c371";
export { tabla } from "./patrones/tabla.js?v=e33c371";
export { barras, linea, dona, heroe } from "./patrones/graficas.js?v=e33c371";
export { abrirBuscador, activarAtajoBuscador, resultadosHTML } from "./patrones/buscador.js?v=e33c371";

// Producto y piezas de marca
export { sello, PASOS_MADUREZ } from "./secciones/producto.js?v=e33c371";
export { ESCALERA, escaleraHTML, moverPunto } from "./kit/escalera.js?v=e33c371";
export { correo, firma } from "./kit/correos.js?v=e33c371";
export { lienzoPieza, isotipoCanvas, granoCanvas, parrafo } from "./kit/piezas.js?v=e33c371";
