/* Optimizo UI — entrada única del kit para construir el sitio, la app y los productos.
   CSS (en este orden): tokens/optimizo.css → estilos/base.css → movimiento.css → kit.css → kit-piezas.css → patrones.css → datos.css → producto.css
   Una vez por página: activarControles(); activarCampos(); y opcionalmente activarAtajoBuscador(). */

// Marca
export { isotipo, logo, LADO } from "./kit/marca.js?v=aa26df1";
export { carga, cargaMarca, progreso, moverProgreso, listo, cursorPunto } from "./kit/punto.js?v=aa26df1";
export { icono, cargarIconos, rellenarIconos } from "./kit/iconos.js?v=aa26df1";
export { colorDe, contraste } from "./kit/color.js?v=aa26df1";

// Kit
export { boton, botonIcono, trabajar, segmento, interruptor, casilla, radio, deslizador, activarControles } from "./kit/controles.js?v=aa26df1";
export { campo, validar, mostrarError, activarCampos, formatearRut, rutValido, formatearPesos, formatearTelefono } from "./kit/campos.js?v=aa26df1";
export { toast, banner, alerta, insignia, etiqueta, contador } from "./kit/avisos.js?v=aa26df1";
export { abrirMenu, abrirPopover, cerrarFlotante, abrirDialogo, confirmarDestructivo } from "./kit/popups.js?v=aa26df1";

// Escenas
export { aura } from "./kit/escenas/aura.js?v=aa26df1";
export { flujos, RED_QUILLAY } from "./kit/escenas/flujos.js?v=aa26df1";
export { bucle, movimientoReducido } from "./kit/escenas/vigia.js?v=aa26df1";

// Patrones
export { asistente, tarjetasOpcion } from "./patrones/asistente.js?v=aa26df1";
export { calendario, horas, fechaLarga } from "./patrones/fechas.js?v=aa26df1";
export { soltar } from "./patrones/soltar.js?v=aa26df1";
export { tabla } from "./patrones/tabla.js?v=aa26df1";
export { barras, linea, dona, heroe } from "./patrones/graficas.js?v=aa26df1";
export { abrirBuscador, activarAtajoBuscador, resultadosHTML } from "./patrones/buscador.js?v=aa26df1";

// Producto y piezas de marca
export { sello, escaleraHTML, PASOS_MADUREZ } from "./secciones/producto.js?v=aa26df1";
export { correo, firma } from "./kit/correos.js?v=aa26df1";
export { lienzoPieza, isotipoCanvas, granoCanvas, parrafo } from "./kit/piezas.js?v=aa26df1";
