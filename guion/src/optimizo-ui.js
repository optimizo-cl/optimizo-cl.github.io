/* Optimizo UI — entrada única del kit para construir el sitio, la app y los productos.
   CSS (en este orden): tokens/optimizo.css → estilos/base.css → movimiento.css → kit.css → kit-piezas.css → patrones.css → datos.css → producto.css
   Una vez por página: activarControles(); activarCampos(); y opcionalmente activarAtajoBuscador(). */

// Marca
export { isotipo, logo, LADO } from "./kit/marca.js?v=5bdbf1b";
export { carga, cargaMarca, progreso, moverProgreso, listo, cursorPunto } from "./kit/punto.js?v=5bdbf1b";
export { icono, cargarIconos, rellenarIconos } from "./kit/iconos.js?v=5bdbf1b";
export { colorDe, contraste } from "./kit/color.js?v=5bdbf1b";

// Kit
export { boton, botonIcono, trabajar, segmento, interruptor, casilla, radio, deslizador, activarControles } from "./kit/controles.js?v=5bdbf1b";
export { campo, validar, mostrarError, activarCampos, formatearRut, rutValido, formatearPesos, formatearTelefono } from "./kit/campos.js?v=5bdbf1b";
export { toast, banner, alerta, insignia, etiqueta, contador } from "./kit/avisos.js?v=5bdbf1b";
export { abrirMenu, abrirPopover, cerrarFlotante, abrirDialogo, confirmarDestructivo } from "./kit/popups.js?v=5bdbf1b";

// Escenas
export { aura } from "./kit/escenas/aura.js?v=5bdbf1b";
export { flujos, RED_QUILLAY } from "./kit/escenas/flujos.js?v=5bdbf1b";
export { bucle, movimientoReducido } from "./kit/escenas/vigia.js?v=5bdbf1b";

// Patrones
export { asistente, tarjetasOpcion } from "./patrones/asistente.js?v=5bdbf1b";
export { calendario, horas, fechaLarga } from "./patrones/fechas.js?v=5bdbf1b";
export { soltar } from "./patrones/soltar.js?v=5bdbf1b";
export { tabla } from "./patrones/tabla.js?v=5bdbf1b";
export { barras, linea, dona, heroe } from "./patrones/graficas.js?v=5bdbf1b";
export { abrirBuscador, activarAtajoBuscador, resultadosHTML } from "./patrones/buscador.js?v=5bdbf1b";

// Producto y piezas de marca
export { sello, PASOS_MADUREZ } from "./secciones/producto.js?v=5bdbf1b";
export { ESCALERA, escaleraHTML, moverPunto } from "./kit/escalera.js?v=5bdbf1b";
export { correo, firma } from "./kit/correos.js?v=5bdbf1b";
export { lienzoPieza, isotipoCanvas, granoCanvas, parrafo } from "./kit/piezas.js?v=5bdbf1b";
