/* Trama orbital: el fondo de Optimizo (reemplaza al aura). Miles de puntos en órbita alrededor de pozos invisibles
   —los procesos de la empresa—. Cada tanto uno se escapa por la tangente (la firma hecha fondo). Con «orden» las
   órbitas caóticas se acomodan en anillos concéntricos. El cursor aparta los puntos cercanos.
   Tres variantes: «trama» (puntos de imprenta en retícula girada), «orbitas» (partículas con estela) y
   «anillos» (bandas concéntricas hechas de grano). WebGL1, un solo dibujo por capa, se duerme fuera de pantalla. */
import { bucle, alCambiarPaleta, rgbDe, movimientoReducido } from "./vigia.js";

const COMUN = `
uniform vec2 res; uniform float t; uniform float orden; uniform vec2 raton; uniform float dpr; uniform float densidad; uniform float mascara;
uniform vec2 p0; uniform vec2 p1; uniform vec2 p2; uniform vec2 centro;
float asp(){ return res.x / res.y; }
vec2 aClip(vec2 u){ return vec2(u.x / asp(), u.y); }
float bordeTexto(vec2 u){ // el aire para el texto: a la izquierda en lienzos anchos, abajo en los altos
  float xn = (u.x / asp() + 1.) * .5, yn = (u.y + 1.) * .5;
  return mix(1., asp() >= 1. ? smoothstep(.12, .74, xn) : smoothstep(.3, .78, yn), mascara); }
vec2 apartar(vec2 u){ vec2 d = u - raton; float l = length(d); return u + (l > 0. ? d / l : vec2(0.)) * .085 * exp(-l * l / .028); }`;

/* Partículas: a = (radio, fase, velocidad, semilla) · b = (pozo, retraso de estela 0→1, fugaz) */
const V_PART = `precision highp float;
attribute vec4 a; attribute vec3 b;${COMUN}
uniform float tam; uniform float estela;
varying float vAlfa; varying float vTono;
vec2 pozo(float i){ return i < .5 ? p0 : i < 1.5 ? p1 : p2; }
vec2 orbita(float th, float r, float e, float giro, vec2 c){ float cg = cos(giro), sg = sin(giro); vec2 q = vec2(cos(th) * r, sin(th) * r * e); return c + vec2(q.x * cg - q.y * sg, q.x * sg + q.y * cg); }
void main(){
  float s = a.w, retraso = b.y;
  float r0 = a.x, e = .5 + .5 * fract(s * 7.13), giro = fract(s * 3.71) * 6.2832;
  float anillo = floor(fract(s * 5.37) * 8.) + 1.;
  float r1 = anillo * .12 + .03 * fract(s * 9.1);
  float k = smoothstep(0., 1., orden);
  float r = mix(r0, r1, k);
  float th = a.y + t * a.z * .22 / sqrt(r) - retraso * estela / sqrt(r);
  vec2 u = mix(orbita(th, r0, e, giro, pozo(b.x)), orbita(th, r1, 1., 0., centro), k);
  float alfa = 1.;
  if (b.z > .5) { // fugaz: sale por la tangente, se apaga y vuelve a nacer en su órbita
    float P = 7. + fract(s * 13.7) * 7.; float f = fract((t + s * 50.) / P);
    vec2 tg = normalize(mix(orbita(th + .01, r0, e, giro, pozo(b.x)), orbita(th + .01, r1, 1., 0., centro), k) - u);
    float fuga = smoothstep(.68, 1., f);
    u += tg * fuga * fuga * .95;
    alfa *= (1. - fuga) * smoothstep(0., .08, f);
  }
  u = apartar(u);
  vAlfa = alfa * pow(1. - retraso, 1.6) * bordeTexto(u) * (b.z > .5 ? 1. : .85);
  vTono = b.z > .5 ? 1. : fract(s * 11.3) * .8;
  gl_Position = vec4(aClip(u), 0., 1.);
  gl_PointSize = tam * dpr * (.55 + .9 * fract(s * 2.9)) * (1. - .55 * retraso) * (b.z > .5 ? 1.6 : 1.) * mix(.25, 1., densidad);
}`;
const F_PUNTO = `precision highp float;
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;
varying float vAlfa; varying float vTono;
void main(){
  float d = length(gl_PointCoord - .5);
  float m = smoothstep(.5, .36, d) * vAlfa;
  vec3 c = vTono < .33 ? mix(c0, c1, vTono / .33) : vTono < .8 ? mix(c1, c2, (vTono - .33) / .47) : c3;
  gl_FragColor = vec4(c * m, m);
}`;

/* Trama de imprenta: g = posición en la retícula girada (espacio u). El tamaño del punto es el valor del campo. */
const V_TRAMA = `precision highp float;
attribute vec2 g;${COMUN}
uniform float paso;
varying float vAlfa; varying float vTono;
float onda(vec2 u, vec2 c, float fr, float vel, float giro){ vec2 d = u - c; float l = length(d); return (.5 + .5 * sin(l * fr - t * vel + atan(d.y, d.x) * giro)) * exp(-l * .9); }
void main(){
  vec2 u = g;
  float caos = onda(u, p0, 15., .55, 2.) + onda(u, p1, 19., .42, -3.) + onda(u, p2, 13., .5, 1.) * .8;
  float dc = length(u - centro);
  float anillos = (.5 + .5 * sin(dc * 24. - t * .45)) * exp(-dc * .7) * 1.4;
  float f = clamp(mix(caos, anillos, smoothstep(0., 1., orden)), 0., 1.);
  u = apartar(u);
  float borde = bordeTexto(u);
  vTono = f * .78; vAlfa = borde * (.5 + .5 * f);
  gl_Position = vec4(aClip(u), 0., 1.);
  gl_PointSize = paso * dpr * (.1 + .66 * pow(f, 1.5)) * borde * mix(.22, 1., densidad);
}`;

/* Anillos: bandas concéntricas cuantizadas; cada grano elige el nivel de arriba o el de abajo (como la marca). */
const V_PLANO = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const F_ANILLOS = `precision highp float;${COMUN}
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform float grano;
float h(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
vec3 rampa(float x){ return x < .4 ? mix(c0, c1, x / .4) : x < .75 ? mix(c1, c2, (x - .4) / .35) : mix(c2, c3, (x - .75) / .25); }
void main(){
  vec2 u = (gl_FragCoord.xy / res.y) * 2. - vec2(asp(), 1.);
  u = apartar(u);
  float dc = length(u - centro), ang = atan(u.y - centro.y, u.x - centro.x);
  float caos = .5 + .5 * sin(length(u - p0) * 9. - t * .3) * sin(length(u - p1) * 7. + t * .25);
  float banda = .5 + .5 * sin(dc * 16. - t * .35 + sin(ang * 3. + t * .2) * .35 * (1. - orden));
  float v = mix(caos, banda, .35 + .65 * orden) * exp(-dc * .45) * bordeTexto(u) * mix(.3, 1., densidad);
  float niveles = 7.; float q = clamp(v, 0., 1.) * niveles; float base = floor(q);
  float nivel = (base + step(h(floor(gl_FragCoord.xy / grano)), q - base)) / niveles;
  vec3 c = rampa(nivel);
  float alfa = smoothstep(0., .14, nivel);
  gl_FragColor = vec4(c * alfa, alfa);
}`;

const N_PART = 2600, N_FUGA = 56, ESTELA = 6;

export function trama(lienzo, opciones = {}) {
  const gl = lienzo.getContext("webgl", { antialias: false, premultipliedAlpha: true, alpha: true, powerPreference: "low-power" });
  if (!gl) { lienzo.classList.add("sin-webgl"); return { poner() {}, parar() {} }; }
  const o = { variante: "trama", orden: 0, densidad: 1, mascara: 0, centro: [0.45, 0], tam: 3.2, paso: 11, fps: 40, ...opciones };

  const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
  const prog = (v, f) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); return p; };
  const P = { part: prog(V_PART, F_PUNTO), trama: prog(V_TRAMA, F_PUNTO), anillos: prog(V_PLANO, F_ANILLOS) };
  const U = {}; const loc = (p, n) => ((U[p] ||= {})[n] ??= gl.getUniformLocation(P[p], n));

  // partículas: las primeras N_FUGA son las que se escapan (así la trama y los anillos dibujan solo esas)
  const datosPart = new Float32Array(N_PART * ESTELA * 7);
  for (let i = 0, j = 0; i < N_PART; i++) {
    const s = Math.random(), fugaz = i < N_FUGA ? 1 : 0;
    const radio = 0.08 + Math.pow(Math.random(), 0.8) * 0.85, fase = Math.random() * 6.2832, vel = (0.5 + Math.random() * 0.8) * (Math.random() < 0.12 ? -1 : 1);
    const pozo = Math.floor(Math.random() * 3);
    for (let k = 0; k < ESTELA; k++) datosPart.set([radio, fase, vel, s, pozo, k / ESTELA, fugaz], j++ * 7);
  }
  const bPart = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bPart); gl.bufferData(gl.ARRAY_BUFFER, datosPart, gl.STATIC_DRAW);
  const bPlano = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bPlano); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const bTrama = gl.createBuffer(); let nTrama = 0;

  let w = 1, h = 1, dpr = 1;
  const reticula = () => { // retícula girada 15° que cubre la diagonal, en unidades u (alto = 2)
    const pasoU = (o.paso / h) * 2 * dpr, asp = w / h, R = Math.hypot(asp, 1) + 0.1, a = (15 * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const n = Math.ceil((2 * R) / pasoU), pts = [];
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
      const x = -R + i * pasoU, y = -R + j * pasoU, X = x * ca - y * sa, Y = x * sa + y * ca;
      if (Math.abs(X) <= asp + 0.05 && Math.abs(Y) <= 1.05) pts.push(X, Y);
    }
    nTrama = pts.length / 2; gl.bindBuffer(gl.ARRAY_BUFFER, bTrama); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pts), gl.STATIC_DRAW);
  };
  const ajustar = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const nw = Math.max(1, Math.round(lienzo.clientWidth * dpr)), nh = Math.max(1, Math.round(lienzo.clientHeight * dpr));
    if (nw === w && nh === h) return;
    w = lienzo.width = nw; h = lienzo.height = nh; gl.viewport(0, 0, w, h); reticula();
  };

  let colores = [];
  const leerColores = () => {
    const oscuro = document.documentElement.dataset.tema === "oscuro";
    colores = (oscuro ? ["--navy", "--acento-profundo", "--acento-claro", "--acento"] : ["--acento-claro", "--acento", "--acento-profundo", "--navy"]).map(rgbDe);
    if (o.variante === "anillos") colores = (oscuro ? ["--navy-profundo", "--navy", "--acento-profundo", "--acento"] : ["--hueso", "--acento-claro", "--acento", "--acento-profundo"]).map(rgbDe);
  };

  // cursor con resorte crítico (llega sin rebotar)
  const raton = { x: 9, y: 9, tx: 9, ty: 9, vx: 0, vy: 0 };
  const mover = (e) => { const r = lienzo.getBoundingClientRect(); raton.tx = ((e.clientX - r.left) / r.height) * 2 - r.width / r.height; raton.ty = 1 - ((e.clientY - r.top) / r.height) * 2; if (raton.x === 9) { raton.x = raton.tx; raton.y = raton.ty; } };
  const salir = () => { raton.tx = raton.ty = 9; };
  addEventListener("pointermove", mover, { passive: true }); document.addEventListener("pointerleave", salir);

  const pozos = (t) => { const a = w / h; return [[-0.35 * a + Math.sin(t * 0.05) * 0.1, 0.25], [0.3 * a, -0.35 + Math.cos(t * 0.04) * 0.08], [0.55 * a, 0.45]]; };
  const comunes = (p, t) => {
    gl.uniform2f(loc(p, "res"), w, h); gl.uniform1f(loc(p, "t"), t); gl.uniform1f(loc(p, "orden"), o.orden); gl.uniform1f(loc(p, "dpr"), dpr);
    gl.uniform1f(loc(p, "densidad"), o.densidad); gl.uniform1f(loc(p, "mascara"), o.mascara);
    gl.uniform2f(loc(p, "raton"), raton.x, raton.y);
    const pz = pozos(t); ["p0", "p1", "p2"].forEach((n, i) => gl.uniform2f(loc(p, n), ...pz[i]));
    gl.uniform2f(loc(p, "centro"), o.centro[0] * (w / h), o.centro[1]);
    ["c0", "c1", "c2", "c3"].forEach((n, i) => { const l = loc(p, n); if (l) gl.uniform3fv(l, colores[i]); });
  };
  const atributo = (p, nombre, tam, paso, desplaz) => { const l = gl.getAttribLocation(P[p], nombre); if (l < 0) return; gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, tam, gl.FLOAT, false, paso, desplaz); };
  const quitarAtributos = () => { for (let i = 0; i < 4; i++) gl.disableVertexAttribArray(i); };

  const particulas = (t, cuantas) => {
    gl.useProgram(P.part); quitarAtributos(); gl.bindBuffer(gl.ARRAY_BUFFER, bPart);
    atributo("part", "a", 4, 28, 0); atributo("part", "b", 3, 28, 16);
    comunes("part", t); gl.uniform1f(loc("part", "tam"), o.tam); gl.uniform1f(loc("part", "estela"), o.variante === "orbitas" ? 0.09 : 0.16);
    gl.drawArrays(gl.POINTS, 0, cuantas * ESTELA);
  };
  let tiempo = 30;
  const dibujar = (t) => {
    tiempo = t;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    if (o.variante === "trama") {
      gl.useProgram(P.trama); quitarAtributos(); gl.bindBuffer(gl.ARRAY_BUFFER, bTrama); atributo("trama", "g", 2, 8, 0);
      comunes("trama", t); gl.uniform1f(loc("trama", "paso"), o.paso); gl.drawArrays(gl.POINTS, 0, nTrama);
      particulas(t, N_FUGA);
    } else if (o.variante === "anillos") {
      gl.useProgram(P.anillos); quitarAtributos(); gl.bindBuffer(gl.ARRAY_BUFFER, bPlano); atributo("anillos", "p", 2, 8, 0);
      comunes("anillos", t); gl.uniform1f(loc("anillos", "grano"), 1.6 * dpr); gl.drawArrays(gl.TRIANGLES, 0, 3);
      particulas(t, N_FUGA);
    } else particulas(t, N_PART);
  };

  leerColores(); ajustar();
  const ro = new ResizeObserver(() => { ajustar(); dibujar(tiempo); }); ro.observe(lienzo);
  const quitarPaleta = alCambiarPaleta(() => { leerColores(); dibujar(tiempo); });
  const b = bucle(lienzo, (t, dt) => {
    // resorte crítico, ω = 9
    const om = 9, k = Math.min(dt, 0.05);
    for (const [p, v, tg] of [["x", "vx", "tx"], ["y", "vy", "ty"]]) { const a = om * om * (raton[tg] - raton[p]) - 2 * om * raton[v]; raton[v] += a * k; raton[p] += raton[v] * k; }
    dibujar(30 + t);
  }, { fps: o.fps });

  return {
    poner(c) { Object.assign(o, c); if ("variante" in c) leerColores(); if ("paso" in c) { w = 0; ajustar(); } dibujar(tiempo); },
    get opciones() { return { ...o }; },
    parar() { b.parar(); ro.disconnect(); quitarPaleta(); removeEventListener("pointermove", mover); document.removeEventListener("pointerleave", salir); gl.getExtension("WEBGL_lose_context")?.loseContext(); },
    reducido: movimientoReducido(),
  };
}
