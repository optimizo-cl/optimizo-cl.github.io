/* Aura con grano: un campo fluido y lento de la paleta donde el grano ES el degradado.
   El color se cuantiza en pocos niveles y cada píxel elige entre el nivel de abajo y el de arriba según
   un umbral fijo por grano: el degradado está hecho de grano, no tiene ruido encima. WebGL1, ½ costo, 30 fps. */
import { bucle, alCambiarPaleta, rgbDe, movimientoReducido } from "./vigia.js";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const FRAG = `precision highp float;
uniform vec2 res; uniform float t; uniform float grano; uniform float niveles;
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;
float h(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 q){ vec2 i = floor(q), f = fract(q); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 q){ float v = 0., a = .5; for(int i = 0; i < 5; i++){ v += a*ruido(q); q = q*2.02 + 3.1; a *= .5; } return v; }
vec3 rampa(float x){
  x = clamp(x, 0., 1.);
  if (x < .34) return mix(c0, c1, x/.34);
  if (x < .7) return mix(c1, c2, (x-.34)/.36);
  return mix(c2, c3, (x-.7)/.3);
}
void main(){
  vec2 uv = gl_FragCoord.xy / res.y;
  vec2 w = vec2(fbm(uv*1.3 + vec2(t*.018, -t*.011)), fbm(uv*1.3 + vec2(5.2 - t*.014, 1.3 + t*.009)));
  float v = fbm(uv*1.1 + w*1.6 + vec2(t*.006, 0.));
  v = smoothstep(.22, .82, v) * .92 + (gl_FragCoord.x / res.x) * .12;   // leve deriva horizontal hacia el acento
  float q = v * niveles; float base = floor(q);
  float umbral = h(floor(gl_FragCoord.xy / grano));                     // umbral fijo por grano
  float nivel = (base + step(umbral, q - base)) / niveles;
  gl_FragColor = vec4(rampa(nivel), 1.);
}`;

export function aura(lienzo, { grano = 1.5, niveles = 9 } = {}) {
  const gl = lienzo.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
  if (!gl) { lienzo.classList.add("aura--sin-webgl"); return { parar() {} }; }
  const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(pr, n);
  const U = { res: u("res"), t: u("t"), grano: u("grano"), niveles: u("niveles"), c0: u("c0"), c1: u("c1"), c2: u("c2"), c3: u("c3") };

  const colores = () => {
    const oscuro = document.documentElement.dataset.tema === "oscuro";
    // claro: hueso → acento claro → acento → profundo · oscuro: navy profundo → navy → profundo → acento
    const sec = oscuro ? ["--navy-profundo", "--navy", "--acento-profundo", "--acento"] : ["--hueso", "--acento-claro", "--acento", "--acento-profundo"];
    [U.c0, U.c1, U.c2, U.c3].forEach((loc, i) => gl.uniform3fv(loc, rgbDe(sec[i])));
  };
  const ajustar = () => {
    const dpr = 1; // resolución normal también en retina: el grano mide lo mismo y el costo cae a ¼
    const w = Math.round(lienzo.clientWidth * dpr), h = Math.round(lienzo.clientHeight * dpr);
    if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(U.res, w, h); gl.uniform1f(U.grano, grano * dpr); gl.uniform1f(U.niveles, niveles);
  };
  let ctrl = { grano, niveles };
  colores(); ajustar();
  const ro = new ResizeObserver(ajustar); ro.observe(lienzo);
  const quitar = alCambiarPaleta(() => { colores(); dibujar(tiempo); });
  let tiempo = 8;
  const dibujar = (t) => { gl.uniform1f(U.t, t); gl.drawArrays(gl.TRIANGLES, 0, 3); };
  const b = bucle(lienzo, (t) => { tiempo = 8 + t; dibujar(tiempo); }, { fps: 30 });
  return {
    poner(cambios) { Object.assign(ctrl, cambios); grano = ctrl.grano; niveles = ctrl.niveles; ajustar(); dibujar(tiempo); },
    parar() { b.parar(); ro.disconnect(); quitar(); },
    reducido: movimientoReducido(),
  };
}
