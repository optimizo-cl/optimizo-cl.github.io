/* Optimizo UI — entrada única del kit para construir el sitio, la app y los productos.
   CSS (en este orden): tokens/optimizo.css → estilos/base.css → movimiento.css → kit.css → kit-piezas.css → patrones.css → datos.css → producto.css
   Una vez por página: activarControles(); activarCampos(); y opcionalmente activarAtajoBuscador(). */

// Marca
export { isotipo, logo, LADO } from "./kit/marca.js?v=798d3f5";
export { carga, cargaMarca, progreso, moverProgreso, listo, cursorPunto } from "./kit/punto.js?v=798d3f5";
export { icono, cargarIconos, rellenarIconos } from "./kit/iconos.js?v=798d3f5";
export { colorDe, contraste } from "./kit/color.js?v=798d3f5";

// Kit
export { boton, botonIcono, trabajar, segmento, interruptor, casilla, radio, deslizador, activarControles } from "./kit/controles.js?v=798d3f5";
export { campo, validar, mostrarError, activarCampos, formatearRut, rutValido, formatearPesos, formatearTelefono } from "./kit/campos.js?v=798d3f5";
export { toast, banner, alerta, insignia, etiqueta, contador } from "./kit/avisos.js?v=798d3f5";
export { abrirMenu, abrirPopover, cerrarFlotante, abrirDialogo, confirmarDestructivo } from "./kit/popups.js?v=798d3f5";

// Escenas
export { aura } from "./kit/escenas/aura.js?v=798d3f5";
export { flujos, RED_QUILLAY } from "./kit/escenas/flujos.js?v=798d3f5";
export { bucle, movimientoReducido } from "./kit/escenas/vigia.js?v=798d3f5";

// Patrones
export { asistente, tarjetasOpcion } from "./patrones/asistente.js?v=798d3f5";
export { calendario, horas, fechaLarga } from "./patrones/fechas.js?v=798d3f5";
export { soltar } from "./patrones/soltar.js?v=798d3f5";
export { tabla } from "./patrones/tabla.js?v=798d3f5";
export { barras, linea, dona, heroe } from "./patrones/graficas.js?v=798d3f5";
export { abrirBuscador, activarAtajoBuscador, resultadosHTML } from "./patrones/buscador.js?v=798d3f5";

// Producto y piezas de marca
export { sello, escaleraHTML, PASOS_MADUREZ } from "./secciones/producto.js?v=798d3f5";
export { correo, firma } from "./kit/correos.js?v=798d3f5";
export { lienzoPieza, isotipoCanvas, granoCanvas, parrafo } from "./kit/piezas.js?v=798d3f5";
