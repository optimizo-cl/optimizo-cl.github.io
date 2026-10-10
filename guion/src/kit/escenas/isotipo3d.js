/* Isotipo 3D: el disco y el punto como objetos de cerámica mate con grano. El punto sale de su nido,
   da una vuelta lenta en órbita y vuelve (la firma en 3D). Geometría exacta del PDF. Un solo contexto WebGL. */
import * as THREE from "../../../assets/vendor/three/three.module.min.js";
import { SVGLoader } from "../../../assets/vendor/three/SVGLoader.js";
import { bucle, alCambiarPaleta, rgbDe } from "./vigia.js";

const DISCO = "M 55.757812 5.390625 C 58.730469 10.496094 60.441406 16.425781 60.441406 22.753906 C 60.441406 41.851562 44.960938 57.332031 25.863281 57.332031 C 19.621094 57.332031 13.769531 55.667969 8.710938 52.773438 C 6.992188 58.804688 6.054688 65.167969 6.054688 71.753906 C 6.054688 109.945312 37.011719 140.90625 75.207031 140.90625 C 113.398438 140.90625 144.359375 109.945312 144.359375 71.753906 C 144.359375 33.5625 113.398438 2.601562 75.207031 2.601562 C 68.453125 2.601562 61.929688 3.585938 55.757812 5.390625 Z M 57.917969 71.753906 C 57.917969 62.207031 65.65625 54.464844 75.207031 54.464844 C 84.753906 54.464844 92.492188 62.207031 92.492188 71.753906 C 92.492188 81.300781 84.753906 89.042969 75.207031 89.042969 C 65.65625 89.042969 57.917969 81.300781 57.917969 71.753906 Z";
const C = { x: 75.207031, y: 71.753906 };
const NIDO = { x: 25.863281 - C.x, y: -(22.753906 - C.y) }; // y hacia arriba
const R_PUNTO = 17.289;

/** Textura de grano (mismo grano para relieve y rugosidad). */
function texturaGrano(tam = 256) {
  const c = document.createElement("canvas"); c.width = c.height = tam;
  const x = c.getContext("2d"); const img = x.createImageData(tam, tam);
  for (let i = 0; i < img.data.length; i += 4) { const v = 150 + Math.random() * 105; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.09, 0.09); t.colorSpace = THREE.NoColorSpace;
  return t;
}

/** Pinta un degradado horizontal en los vértices (como el isotipo plano). */
function pintar(geo, a, b, x0, x1) {
  const pos = geo.attributes.position; const col = new Float32Array(pos.count * 3);
  const ca = new THREE.Color().setRGB(...a, THREE.SRGBColorSpace), cb = new THREE.Color().setRGB(...b, THREE.SRGBColorSpace), m = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { m.copy(ca).lerp(cb, THREE.MathUtils.clamp((pos.getX(i) - x0) / (x1 - x0), 0, 1)); col.set([m.r, m.g, m.b], i * 3); }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
}

export function isotipo3d(lienzo) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true, powerPreference: "low-power" }); }
  catch { lienzo.classList.add("sin-webgl"); return { parar() {} }; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(28, 1, 1, 2000); camara.position.set(0, 0, 430);

  escena.add(new THREE.HemisphereLight(0xffffff, 0x9aa3a3, 1.6));
  const clave = new THREE.DirectionalLight(0xfff4e8, 2.2); clave.position.set(-160, 220, 260); escena.add(clave);
  const relleno = new THREE.DirectionalLight(0xe8f0ff, 0.6); relleno.position.set(220, -120, 160); escena.add(relleno);

  const grano = texturaGrano();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0, roughnessMap: grano, bumpMap: grano, bumpScale: 0.6 });

  // Disco desde el trazado del PDF (agujero y mordida incluidos)
  const datos = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${DISCO}"/></svg>`);
  const formas = datos.paths.flatMap((p) => SVGLoader.createShapes(p));
  const extrusion = { depth: 16, bevelEnabled: true, bevelThickness: 4, bevelSize: 2.6, bevelSegments: 8, curveSegments: 96 };
  const geoDisco = new THREE.ExtrudeGeometry(formas, extrusion);
  geoDisco.translate(-C.x, -C.y, -8); geoDisco.scale(1, -1, 1); geoDisco.computeVertexNormals();
  const geoPunto = new THREE.ExtrudeGeometry(new THREE.Shape().absarc(0, 0, R_PUNTO, 0, Math.PI * 2, false), { ...extrusion, curveSegments: 64 });
  geoPunto.translate(0, 0, -8);

  const disco = new THREE.Mesh(geoDisco, material);
  const punto = new THREE.Mesh(geoPunto, material.clone());
  const grupo = new THREE.Group(); grupo.add(disco); grupo.add(punto); escena.add(grupo);

  const colorear = () => {
    const a = rgbDe("--deg-a"), b = rgbDe("--deg-b");
    pintar(geoDisco, a, b, -69.2, 69.2); pintar(geoPunto, a, b, -R_PUNTO, R_PUNTO);
    geoDisco.attributes.color.needsUpdate = geoPunto.attributes.color.needsUpdate = true;
  };
  colorear();

  const ajustar = () => {
    const w = lienzo.clientWidth, h = lienzo.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(w, h, false);
    camara.aspect = w / h; camara.updateProjectionMatrix();
  };
  ajustar(); const ro = new ResizeObserver(ajustar); ro.observe(lienzo);

  // Firma en 3D: ciclo de 14 s · 3 s en el nido · 2,5 s sale · vuelta en órbita · 2,5 s vuelve
  const anguloNido = Math.atan2(NIDO.y, NIDO.x), radioNido = Math.hypot(NIDO.x, NIDO.y);
  const suave = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10));
  const cuadro = (t) => {
    grupo.rotation.y = Math.sin(t * 0.21) * 0.42;
    grupo.rotation.x = -0.1 + Math.sin(t * 0.16) * 0.07;
    const c = t % 14;
    const k = c < 3 ? 0 : c < 5.5 ? suave((c - 3) / 2.5) : c < 11.5 ? 1 : c < 14 ? 1 - suave((c - 11.5) / 2.5) : 0;
    const vuelta = c < 4 ? 0 : c > 12.5 ? 1 : suave((c - 4) / 8.5);
    const ang = anguloNido + vuelta * Math.PI * 2;
    const radio = radioNido + 44 * k;
    // posición polar alrededor del centro del disco; en órbita se adelanta en z para pasar por delante
    punto.position.set(Math.cos(ang) * radio, Math.sin(ang) * radio, 34 * k * Math.sin(vuelta * Math.PI));
    punto.rotation.y = -grupo.rotation.y * 0.5 * k;
    renderer.render(escena, camara);
  };
  const quitar = alCambiarPaleta(() => { colorear(); renderer.render(escena, camara); });
  const b = bucle(lienzo, cuadro, { fps: 60 });
  return { parar() { b.parar(); ro.disconnect(); quitar(); renderer.dispose(); renderer.forceContextLoss(); } };
}
