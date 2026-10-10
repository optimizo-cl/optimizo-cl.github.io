/* Isotipo 3D v2: cerámica de verdad. Material físico con estudio de luz propio (cajas de luz → PMREM), relieve de
   grano real (mapa de normales generado del mismo grano de la marca), bisel suave sin facetas, el punto como canica
   achatada, sombra de contacto y canto con el esmalte acumulado. Se arrastra con inercia, el punto se tira y vuelve
   con resorte (sin rebote), doble clic = una vuelta. Tres materiales: esmalte mate, bizcocho y piedra pulida. */
import * as THREE from "../../../assets/vendor/three/three.module.min.js";
import { SVGLoader } from "../../../assets/vendor/three/SVGLoader.js";
import { bucle, alCambiarPaleta, rgbDe, movimientoReducido } from "./vigia.js";

const DISCO = "M 55.757812 5.390625 C 58.730469 10.496094 60.441406 16.425781 60.441406 22.753906 C 60.441406 41.851562 44.960938 57.332031 25.863281 57.332031 C 19.621094 57.332031 13.769531 55.667969 8.710938 52.773438 C 6.992188 58.804688 6.054688 65.167969 6.054688 71.753906 C 6.054688 109.945312 37.011719 140.90625 75.207031 140.90625 C 113.398438 140.90625 144.359375 109.945312 144.359375 71.753906 C 144.359375 33.5625 113.398438 2.601562 75.207031 2.601562 C 68.453125 2.601562 61.929688 3.585938 55.757812 5.390625 Z M 57.917969 71.753906 C 57.917969 62.207031 65.65625 54.464844 75.207031 54.464844 C 84.753906 54.464844 92.492188 62.207031 92.492188 71.753906 C 92.492188 81.300781 84.753906 89.042969 75.207031 89.042969 C 65.65625 89.042969 57.917969 81.300781 57.917969 71.753906 Z";
const C = { x: 75.207031, y: 71.753906 };
const NIDO = { x: 25.863281 - C.x, y: -(22.753906 - C.y) }; // y hacia arriba
const R_PUNTO = 17.289;
const PROF = 18;

export const MATERIALES = {
  esmalte: { nombre: "Esmalte mate", roughness: 0.44, sheen: 0.5, sheenRoughness: 0.75, clearcoat: 0.14, clearcoatRoughness: 0.45, normal: 0.32, mezcla: ["--hueso", 0], canto: 0.22 },
  bizcocho: { nombre: "Bizcocho", roughness: 0.96, sheen: 0.18, sheenRoughness: 1, clearcoat: 0, clearcoatRoughness: 1, normal: 0.95, mezcla: ["--hueso", 0.5], canto: 0.08 },
  piedra: { nombre: "Piedra pulida", roughness: 0.2, sheen: 0, sheenRoughness: 1, clearcoat: 0.75, clearcoatRoughness: 0.12, normal: 0.12, mezcla: ["--navy", 0.22], canto: 0.3 },
};

/** Grano que se repite sin costura: ruido de valor en varias octavas sobre una retícula envuelta → alturas → normales. */
function normalesDeGrano(tam = 256) {
  const h = new Float32Array(tam * tam), semilla = new Float32Array(64 * 64).map(() => Math.random());
  const valor = (x, y, per) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const g = (i, j) => semilla[(((j % per) + per) % per) * 64 + (((i % per) + per) % per)];
    return (g(xi, yi) * (1 - sx) + g(xi + 1, yi) * sx) * (1 - sy) + (g(xi, yi + 1) * (1 - sx) + g(xi + 1, yi + 1) * sx) * sy;
  };
  for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
    let v = 0, a = 0.5;
    for (const per of [8, 16, 32, 64]) { v += a * valor((x / tam) * per, (y / tam) * per, per); a *= 0.55; }
    v += (Math.random() - 0.5) * 0.18; // la mota fina del grano
    h[y * tam + x] = v;
  }
  const c = document.createElement("canvas"); c.width = c.height = tam;
  const ctx = c.getContext("2d"), img = ctx.createImageData(tam, tam), at = (x, y) => h[((y + tam) % tam) * tam + ((x + tam) % tam)];
  for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 3, dy = (at(x, y + 1) - at(x, y - 1)) * 3, l = Math.hypot(dx, dy, 1), i = (y * tam + x) * 4;
    img.data[i] = (-dx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (-dy / l * 0.5 + 0.5) * 255; img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.05, 0.05); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4;
  return t;
}

/** Estudio propio: una caja de luz grande cálida arriba a la izquierda, relleno frío a la derecha y un contraluz. */
function estudio(renderer) {
  const s = new THREE.Scene();
  const sala = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshBasicMaterial({ color: 0x8a8f8c, side: THREE.BackSide }));
  s.add(sala);
  const caja = (color, int, w, h, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(int), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); };
  caja(0xfff1e0, 5.5, 5, 3.4, [-3.6, 3.4, 3.2]);   // principal
  caja(0xe6eeff, 1.8, 3, 4, [4.6, 0.4, 2.4]);      // relleno
  caja(0xfff6ea, 3.2, 6, 0.8, [0.5, 1.2, -5.2]);   // contraluz que dibuja el canto
  caja(0xffffff, 1.2, 8, 2, [0, -3.6, 1]);         // rebote del piso
  caja(0xfffaf2, 1.6, 5, 3.2, [-2.2, 2.4, 5.6]);   // la caja detrás de la cámara: el brillo ancho y suave sobre la cara
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(s, 0.035).texture; pm.dispose();
  return env;
}

/** Normales suaves en una geometría sin índices (el bisel deja de verse facetado). */
function suavizar(geo) {
  const pos = geo.attributes.position, n = pos.count, acc = new Map(), clave = (i) => (Math.round(pos.getX(i) * 100) + 32768) * 4294967296 + (Math.round(pos.getY(i) * 100) + 32768) * 65536 + (Math.round(pos.getZ(i) * 100) + 32768);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), cb = new THREE.Vector3(), ab = new THREE.Vector3();
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    cb.subVectors(c, b).cross(ab.subVectors(a, b)); // ponderada por área
    for (let k = 0; k < 3; k++) { const key = clave(i + k), v = acc.get(key); v ? v.add(cb) : acc.set(key, cb.clone()); }
  }
  const nor = new Float32Array(n * 3), v = new THREE.Vector3();
  for (let i = 0; i < n; i++) { v.copy(acc.get(clave(i))).normalize(); nor.set([v.x, v.y, v.z], i * 3); }
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
}

/** Sombra de contacto: la silueta del isotipo, desenfocada, en una textura. */
function texturaSombra() {
  const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, 512, 512); // alphaMap lee el canal verde: blanco = sombra
  x.filter = "blur(18px)"; x.fillStyle = "#fff"; x.translate(256 - C.x * 2.4, 256 - C.y * 2.4); x.scale(2.4, 2.4);
  x.fill(new Path2D(DISCO), "evenodd");
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}

export function isotipo3d(lienzo, { material: inicial = "esmalte", interactivo = true } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch { lienzo.classList.add("sin-webgl"); return { parar() {}, material() {}, fase() {} }; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; // conserva el color de marca (AgX lo lava)
  renderer.toneMappingExposure = 1.0;
  const escena = new THREE.Scene();
  escena.environment = estudio(renderer);
  escena.environmentIntensity = 0.62;
  const camara = new THREE.PerspectiveCamera(24, 1, 1, 3000); camara.position.set(0, 0, 600);

  // una luz cercana: su caída dibuja un degradado sobre la cara plana (como una caja de luz real en estudio)
  const cercana = new THREE.PointLight(0xfff0dc, 900, 0, 1.15); cercana.position.set(-150, 170, 210); escena.add(cercana);
  const clave = new THREE.DirectionalLight(0xfff0dc, 0.35); clave.position.set(-200, 260, 300); escena.add(clave);
  const contraluz = new THREE.DirectionalLight(0xffffff, 0.9); contraluz.position.set(140, 60, -300); escena.add(contraluz);

  const relieve = normalesDeGrano();
  const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 0, normalMap: relieve, sheenColor: new THREE.Color(0xffffff) });
  const matPunto = mat.clone();
  matPunto.normalMap = relieve.clone(); matPunto.normalMap.repeat.set(4, 2); matPunto.normalMap.needsUpdate = true; // la esfera tiene UV de 0 a 1

  // Disco: el trazado del PDF, extruido con un bisel redondo de muchos segmentos
  const formas = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${DISCO}"/></svg>`).paths.flatMap((p) => SVGLoader.createShapes(p));
  const geoDisco = new THREE.ExtrudeGeometry(formas, { depth: PROF, bevelEnabled: true, bevelThickness: 5.5, bevelSize: 3.4, bevelSegments: 10, curveSegments: 64 });
  geoDisco.translate(-C.x, -C.y, -PROF / 2); geoDisco.rotateX(Math.PI); // girar (no espejar) conserva el sentido de las caras
  suavizar(geoDisco);
  // el punto: una canica de cerámica achatada
  const geoPunto = new THREE.SphereGeometry(R_PUNTO, 96, 64); geoPunto.scale(1, 1, 0.62);

  const disco = new THREE.Mesh(geoDisco, mat), punto = new THREE.Mesh(geoPunto, matPunto);
  const grupo = new THREE.Group(); grupo.add(disco, punto); escena.add(grupo);

  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(330, 330), new THREE.MeshBasicMaterial({ color: 0x0b1a2a, alphaMap: texturaSombra(), transparent: true, opacity: 0.32, depthWrite: false }));
  sombra.position.set(14, -22, -90); escena.add(sombra);

  let actual = MATERIALES[inicial] || MATERIALES.esmalte;
  const colorear = () => {
    const a = rgbDe("--deg-a"), b = rgbDe("--deg-b"), [vm, km] = actual.mezcla, m = rgbDe(vm), prof = rgbDe("--acento-profundo");
    const mez = (c) => c.map((x, i) => x + (m[i] - x) * km);
    const ca = new THREE.Color().setRGB(...mez(a), THREE.SRGBColorSpace), cb = new THREE.Color().setRGB(...mez(b), THREE.SRGBColorSpace), cp = new THREE.Color().setRGB(...prof, THREE.SRGBColorSpace);
    for (const [geo, x0, x1] of [[geoDisco, -69.2, 69.2], [geoPunto, -R_PUNTO, R_PUNTO]]) {
      const pos = geo.attributes.position, nor = geo.attributes.normal, col = new Float32Array(pos.count * 3), c = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        c.copy(ca).lerp(cb, THREE.MathUtils.clamp((pos.getX(i) - x0) / (x1 - x0), 0, 1));
        c.lerp(cp, (1 - Math.abs(nor.getZ(i))) * actual.canto); // el esmalte se acumula en los cantos
        col.set([c.r, c.g, c.b], i * 3);
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    }
  };
  const aplicar = () => {
    for (const m of [mat, matPunto]) { Object.assign(m, { roughness: actual.roughness, sheen: actual.sheen, sheenRoughness: actual.sheenRoughness, clearcoat: actual.clearcoat, clearcoatRoughness: actual.clearcoatRoughness }); m.normalScale.setScalar(actual.normal); m.needsUpdate = true; }
    colorear();
  };
  aplicar();

  const ajustar = () => {
    const w = lienzo.clientWidth, h = lienzo.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(w, h, false);
    camara.aspect = w / h; camara.position.z = 600 * Math.max(1, 0.9 / (w / h)); camara.updateProjectionMatrix();
  };
  ajustar(); const ro = new ResizeObserver(ajustar); ro.observe(lienzo);

  // ── estado ──
  const anguloNido = Math.atan2(NIDO.y, NIDO.x), radioNido = Math.hypot(NIDO.x, NIDO.y);
  const suave = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10));
  const giro = { x: -0.08, y: 0, vx: 0, vy: 0, arrastrando: false };
  const pt = { x: NIDO.x, y: NIDO.y, z: 0, vx: 0, vy: 0, vz: 0, tirando: false, tx: 0, ty: 0 };
  let fase = 0, vueltaExtra = -1, reloj = 0, quieto = 0;

  // ── interacción ──
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  const aNdc = (e) => { const r = lienzo.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
  let ultimo = null;
  const abajo = (e) => {
    aNdc(e); ray.setFromCamera(ndc, camara);
    if (ray.intersectObject(punto).length) { pt.tirando = true; lienzo.style.cursor = "grabbing"; }
    else { giro.arrastrando = true; lienzo.style.cursor = "grabbing"; }
    ultimo = { x: e.clientX, y: e.clientY, t: performance.now() }; lienzo.setPointerCapture(e.pointerId); quieto = 0;
  };
  const mover = (e) => {
    if (pt.tirando) {
      aNdc(e); ray.setFromCamera(ndc, camara);
      grupo.updateMatrixWorld(); plano.normal.set(0, 0, 1).applyQuaternion(grupo.quaternion); plano.constant = 0;
      if (ray.ray.intersectPlane(plano, hit)) { grupo.worldToLocal(hit); pt.tx = hit.x; pt.ty = hit.y; }
    } else if (giro.arrastrando && ultimo) {
      const ahora = performance.now(), dt = Math.max(8, ahora - ultimo.t) / 1000, dx = e.clientX - ultimo.x, dy = e.clientY - ultimo.y;
      giro.y += dx * 0.009; giro.x += dy * 0.006; giro.vy = (dx * 0.009) / dt; giro.vx = (dy * 0.006) / dt;
      ultimo = { x: e.clientX, y: e.clientY, t: ahora };
    }
  };
  const arriba = () => { pt.tirando = false; giro.arrastrando = false; lienzo.style.cursor = "grab"; ultimo = null; };
  const doble = () => { vueltaExtra = 0; };
  if (interactivo) {
    lienzo.style.cursor = "grab"; lienzo.style.touchAction = "pan-y";
    lienzo.addEventListener("pointerdown", abajo); lienzo.addEventListener("pointermove", mover); lienzo.addEventListener("pointerup", arriba); lienzo.addEventListener("pointercancel", arriba); lienzo.addEventListener("dblclick", doble);
  }

  // ── cuadro ──
  const cuadro = (t, dt) => {
    reloj += dt; quieto += dt;
    // giro: inercia que se apaga y un resorte muy blando hacia el vaivén de reposo
    if (!giro.arrastrando) {
      giro.y += giro.vy * dt; giro.x += giro.vx * dt; const f = Math.exp(-dt * 2.6); giro.vy *= f; giro.vx *= f;
      const reposoY = Math.sin(reloj * 0.21) * 0.38, reposoX = -0.1 + Math.sin(reloj * 0.16) * 0.06;
      const k = 1 - Math.exp(-dt * 0.9); giro.y += (reposoY - giro.y) * k; giro.x += (reposoX - giro.x) * k;
    }
    const plano3d = suave(fase); // el héroe se aplana al bajar
    grupo.rotation.set(giro.x * (1 - plano3d), giro.y * (1 - plano3d), 0);
    grupo.scale.setScalar(1 - 0.18 * plano3d);
    sombra.material.opacity = 0.32 * (1 - plano3d);

    // firma: ciclo de 14 s (nido → sale → vuelta por delante → vuelve); doble clic agrega una vuelta completa
    const c = reloj % 14;
    const kSal = c < 3 ? 0 : c < 5.5 ? suave((c - 3) / 2.5) : c < 11.5 ? 1 : c < 14 ? 1 - suave((c - 11.5) / 2.5) : 0;
    let vuelta = c < 4 ? 0 : c > 12.5 ? 1 : suave((c - 4) / 8.5);
    let kExtra = 0;
    if (vueltaExtra >= 0) { vueltaExtra += dt / 3.2; kExtra = Math.sin(Math.min(1, vueltaExtra) * Math.PI); vuelta += suave(Math.min(1, vueltaExtra)); if (vueltaExtra >= 1) vueltaExtra = -1; }
    const kk = Math.max(kSal, kExtra) * (1 - plano3d);
    const ang = anguloNido + vuelta * Math.PI * 2, radio = radioNido + 46 * kk;
    const meta = { x: Math.cos(ang) * radio, y: Math.sin(ang) * radio, z: 36 * kk * Math.sin(vuelta * Math.PI) };
    if (pt.tirando) { meta.x = pt.tx; meta.y = pt.ty; meta.z = 26; }
    // resorte crítico (llega sin rebotar)
    const om = pt.tirando ? 16 : 7, h = Math.min(dt, 0.04);
    for (const [p, v] of [["x", "vx"], ["y", "vy"], ["z", "vz"]]) { const ac = om * om * (meta[p] - pt[p]) - 2 * om * pt[v]; pt[v] += ac * h; pt[p] += pt[v] * h; }
    if (dt === 0) { pt.x = meta.x; pt.y = meta.y; pt.z = meta.z; }
    punto.position.set(pt.x, pt.y, pt.z);
    punto.rotation.y = -grupo.rotation.y * 0.5;
    renderer.render(escena, camara);
  };
  const quitarPaleta = alCambiarPaleta(() => { colorear(); renderer.render(escena, camara); });
  const b = bucle(lienzo, cuadro, { fps: 60 });

  return {
    material(nombre) { actual = MATERIALES[nombre] || actual; aplicar(); renderer.render(escena, camara); },
    /** 0 = objeto en 3D · 1 = plano de frente (para el héroe que se funde al bajar). */
    fase(p) { fase = Math.max(0, Math.min(1, p)); if (movimientoReducido()) cuadro(0, 0); },
    vuelta() { vueltaExtra = 0; },
    parar() {
      b.parar(); ro.disconnect(); quitarPaleta();
      lienzo.removeEventListener("pointerdown", abajo); lienzo.removeEventListener("pointermove", mover); lienzo.removeEventListener("pointerup", arriba); lienzo.removeEventListener("dblclick", doble);
      renderer.dispose(); renderer.forceContextLoss();
    },
  };
}
