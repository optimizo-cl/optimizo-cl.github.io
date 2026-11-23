'use strict';

const escenario = document.querySelector('.escenario');
const diapositivas = [...escenario.querySelectorAll('[data-diapositiva]')];
const dialogo = document.querySelector('[data-dialogo]');
const temario = document.querySelector('[data-temario]');
const anterior = document.querySelector('[data-anterior]');
const siguiente = document.querySelector('[data-siguiente]');
const etiquetaSiguiente = document.querySelector('[data-etiqueta-siguiente]');
const contador = document.querySelector('[data-contador]');
const tema = document.querySelector('[data-tema]');
const progreso = document.querySelector('[data-progreso]');
const pantalla = document.querySelector('[data-pantalla]');
const pantallaTexto = document.querySelector('[data-pantalla-texto]');
const destinos = [...document.querySelectorAll('[data-destino]')];
const enlacesTemario = [...dialogo.querySelectorAll('[data-destino]')];
const indices = new Map(diapositivas.map((diapositiva, indice) => [diapositiva.id, indice]));
let posicion = -1;

function mostrar(indice, { historial = false, enfocar = false } = {}) {
  const diapositiva = diapositivas[indice];
  if (!diapositiva || indice === posicion) return;
  escenario.dataset.direccion = posicion < indice ? 'adelante' : 'atras';
  posicion = indice;

  diapositivas.forEach((elemento, i) => { elemento.hidden = i !== indice; });
  anterior.disabled = indice === 0;
  etiquetaSiguiente.textContent = indice === 0 ? 'Comenzar' : indice === diapositivas.length - 1 ? 'Volver al inicio' : 'Siguiente';
  contador.textContent = indice + 1 + ' de ' + diapositivas.length;
  tema.textContent = diapositiva.dataset.titulo;
  progreso.value = indice + 1;
  enlacesTemario.forEach((enlace) => {
    if (enlace.dataset.destino === diapositiva.id) enlace.setAttribute('aria-current', 'step');
    else enlace.removeAttribute('aria-current');
  });

  if (historial) window.history.pushState(null, '', '#' + diapositiva.id);
  if (enfocar) {
    diapositiva.querySelector('h1, h2').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

const ir = (indice) => mostrar(indice, { historial: true, enfocar: true });
const indiceDelEnlace = () => indices.get(window.location.hash.slice(1)) ?? 0;

function leerEnlace() {
  if (dialogo.open) dialogo.close();
  mostrar(indiceDelEnlace(), { enfocar: true });
}

progreso.max = diapositivas.length;
mostrar(indiceDelEnlace());
document.querySelector('[data-acciones]').hidden = false;
document.querySelector('[data-controles]').hidden = false;
window.addEventListener('popstate', leerEnlace);
window.addEventListener('hashchange', leerEnlace);

document.querySelector('.saltar').addEventListener('click', (evento) => {
  evento.preventDefault();
  diapositivas[posicion].querySelector('h1, h2').focus();
});

anterior.addEventListener('click', () => ir(posicion - 1));
siguiente.addEventListener('click', () => ir(posicion === diapositivas.length - 1 ? 0 : posicion + 1));

if (typeof dialogo.showModal === 'function') {
  temario.addEventListener('click', () => dialogo.showModal());
  document.querySelector('[data-cerrar]').addEventListener('click', () => dialogo.close());
} else {
  temario.hidden = true;
}

destinos.forEach((enlace) => {
  enlace.addEventListener('click', (evento) => {
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    evento.preventDefault();
    if (dialogo.open) dialogo.close();
    ir(indices.get(enlace.dataset.destino));
  });
});

const tienePantalla = document.fullscreenEnabled && typeof document.documentElement.requestFullscreen === 'function';
if (tienePantalla) {
  pantalla.hidden = false;
  pantalla.addEventListener('click', alternarPantalla);
  document.addEventListener('fullscreenchange', () => {
    const activa = !!document.fullscreenElement;
    pantalla.setAttribute('aria-pressed', String(activa));
    pantallaTexto.textContent = activa ? 'Salir de pantalla completa' : 'Pantalla completa';
  });
}

function alternarPantalla() {
  if (!tienePantalla) return;
  const cambio = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  cambio.catch(() => { pantallaTexto.textContent = 'Pantalla completa no disponible'; });
}

const navegacion = {
  ArrowRight: () => posicion + 1,
  ArrowLeft: () => posicion - 1,
};

document.addEventListener('keydown', (evento) => {
  if (dialogo.open || evento.defaultPrevented || evento.ctrlKey || evento.metaKey || evento.altKey) return;
  const objetivo = evento.target instanceof Element ? evento.target : null;
  if (objetivo?.closest('input, select, textarea, [contenteditable], [data-selector]')) return;
  if (Object.hasOwn(navegacion, evento.key)) {
    evento.preventDefault();
    ir(navegacion[evento.key]());
  } else if (evento.key.toLowerCase() === 'f' && objetivo?.closest('.presentacion') && tienePantalla && !evento.repeat) {
    evento.preventDefault();
    alternarPantalla();
  }
});

let gesto = null;
escenario.addEventListener('pointerdown', (evento) => {
  if (evento.pointerType !== 'touch' || !evento.isPrimary || evento.target.closest('button, a, input, summary')) return;
  gesto = { id: evento.pointerId, x: evento.clientX, y: evento.clientY };
});
escenario.addEventListener('pointercancel', () => { gesto = null; });
escenario.addEventListener('pointerup', (evento) => {
  if (!gesto || gesto.id !== evento.pointerId) return;
  const x = evento.clientX - gesto.x;
  const y = evento.clientY - gesto.y;
  gesto = null;
  if (Math.abs(x) >= 55 && Math.abs(x) > Math.abs(y) * 1.45) ir(posicion + (x < 0 ? 1 : -1));
});

const simulacion = document.querySelector('[data-simulacion]');
const opciones = [...simulacion.querySelectorAll('[data-estado]')];
const resultados = [...simulacion.querySelectorAll('[data-resultado]')];
const estadoVivo = simulacion.querySelector('[data-estado-vivo]');
const mensajes = {
  disponible: 'Internet disponible. Funciones locales y servicios autorizados conectados.',
  interrumpida: 'Internet interrumpido. Servicios externos pausados. Las funciones locales pueden continuar.',
};

function simular(estado, anunciar = true) {
  opciones.forEach((opcion) => opcion.setAttribute('aria-pressed', String(opcion.dataset.estado === estado)));
  resultados.forEach((resultado) => {
    const activo = resultado.dataset.resultado === estado;
    resultado.hidden = !activo;
    resultado.classList.toggle('resultado--entrante', activo && anunciar);
  });
  if (anunciar) estadoVivo.textContent = mensajes[estado];
}

simular('disponible', false);
simulacion.querySelector('[data-selector]').hidden = false;
opciones.forEach((opcion) => opcion.addEventListener('click', () => {
  if (opcion.getAttribute('aria-pressed') !== 'true') simular(opcion.dataset.estado);
}));

for (const escena of document.querySelectorAll('[data-animacion]')) {
  const repetir = escena.querySelector('[data-repetir]');
  escena.classList.add('animacion--activa');
  repetir.hidden = false;
  repetir.addEventListener('click', () => {
    escena.classList.remove('animacion--activa');
    // Leer el ancho aplica el cambio antes de reiniciar las animaciones.
    void escena.offsetWidth;
    escena.classList.add('animacion--activa');
  });
}
