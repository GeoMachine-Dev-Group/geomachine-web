import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Mesh,
  Points,
  ShaderMaterial,
} from 'three';
import { rng } from './noise';

/* El aire de la habitación: el haz de la lámpara y el polvo que flota dentro.
   Los dos viven en el espacio de la pantalla de la lámpara (eje -Y = dirección
   de la luz, origen en la boca), así que la siguen si se reorienta. */

const WARM = new Color('#ffb574');

/** Haz volumétrico barato: un cono hueco que se pinta sumando luz. Brilla más
    donde la superficie mira a cámara y se apaga en la silueta, que es lo que
    hace que se lea como volumen y no como cáscara. */
export function buildBeam(length: number, mouthRadius: number, spread: number) {
  const geo = new CylinderGeometry(mouthRadius * 0.96, mouthRadius + length * spread, length, 64, 1, true);
  geo.translate(0, -length / 2, 0);
  const material = new ShaderMaterial({
    uniforms: { uColor: { value: WARM }, uStrength: { value: 0.14 } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vAlong;
      varying float vHeight;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vHeight = (modelMatrix * vec4(position, 1.0)).y;
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        vAlong = 1.0 - uv.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vAlong;
      varying float vHeight;
      void main() {
        float facing = pow(abs(dot(normalize(vNormal), normalize(vView))), 2.4);
        float along = smoothstep(0.0, 0.05, vAlong) * pow(1.0 - vAlong, 2.6);
        // Se desvanece antes de tocar el tablero: si no, el corte del cono con
        // la mesa dibuja una elipse de borde duro.
        float lift = smoothstep(0.02, 0.22, vHeight);
        gl_FragColor = vec4(uColor * facing * along * lift * uStrength, 1.0);
        #include <colorspace_fragment>
      }`,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const mesh = new Mesh(geo, material);
  mesh.renderOrder = 2;
  return { mesh, material };
}

/** Motas de polvo: solo se ven mientras cruzan el haz. Todo el movimiento se
    calcula en el vertex shader a partir del tiempo, sin tocar búferes por frame. */
export function buildDust(count: number, length: number, mouthRadius: number, spread: number) {
  const r = rng(131);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const depth = length * (0.04 + 0.96 * Math.sqrt(r()));
    const radius = (mouthRadius + depth * spread) * 1.15 * Math.sqrt(r());
    const a = r() * Math.PI * 2;
    positions.set([Math.cos(a) * radius, -depth, Math.sin(a) * radius], i * 3);
    seeds.set([r(), r(), r(), r()], i * 4);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new BufferAttribute(seeds, 4));
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: WARM },
      uStrength: { value: 0.9 },
      /** Píxeles que ocupa 1 m a 1 m de distancia: lo fija el encuadre. */
      uFocal: { value: 1000 },
      uLength: { value: length },
      uMouth: { value: mouthRadius },
      uSpread: { value: spread },
    },
    vertexShader: /* glsl */ `
      attribute vec4 aSeed;
      uniform float uTime, uFocal, uLength, uMouth, uSpread;
      varying float vGlow;
      void main() {
        vec3 p = position;
        // Deriva: cada mota sube o baja muy despacio y se mece a su aire.
        float rate = (0.0025 + 0.006 * aSeed.x) * (aSeed.y > 0.35 ? 1.0 : -1.0);
        float depth = mod(-p.y + uTime * rate, uLength);
        p.y = -depth;
        p.x += sin(uTime * (0.09 + 0.17 * aSeed.z) + aSeed.w * 6.283) * 0.014;
        p.z += cos(uTime * (0.07 + 0.15 * aSeed.x) + aSeed.y * 6.283) * 0.014;
        float inside = smoothstep(1.04, 0.5, length(p.xz) / (uMouth + depth * uSpread));
        float falloff = 1.0 / (1.0 + 9.0 * depth * depth);
        float ends = smoothstep(0.0, 0.03, depth) * smoothstep(uLength, uLength * 0.8, depth);
        float twinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aSeed.z * 1.6) + aSeed.w * 40.0);
        vGlow = inside * falloff * ends * twinkle;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = max(1.0, uFocal * (0.0012 + 0.0022 * aSeed.y) / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      varying float vGlow;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float disc = smoothstep(0.5, 0.08, d);
        gl_FragColor = vec4(uColor * disc * vGlow * uStrength, 1.0);
        #include <colorspace_fragment>
      }`,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const points = new Points(geo, material);
  points.frustumCulled = false; // los vértices se mueven en el shader
  points.renderOrder = 3;
  return { points, material };
}
