import {
  BackSide,
  BoxGeometry,
  BufferAttribute,
  Color,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type Texture,
  type WebGLRenderer,
} from 'three';

/** Entorno de reflexión, hecho a mano: la habitación a oscuras que rodea la mesa.
    Sin él, el cobre y el latón (metales puros) saldrían negros: un metal solo
    enseña lo que refleja. Son unas pocas manchas de luz dentro de una esfera oscura:
    - el resplandor cálido de la propia lámpara, arriba,
    - la pared del fondo, tibia, que es lo que espejan las piezas planas,
    - el rebote tostado de la mesa, abajo,
    - y una ventana lejana con luz fría de noche, que perfila los cantos.
    Es además la única luz ambiente de la escena: cada material decide cuánta
    recibe con su envMapIntensity (mucha los metales, casi nada el papel). */
export function buildEnvironment(renderer: WebGLRenderer): Texture {
  const scene = new Scene();

  const dome = new SphereGeometry(10, 32, 16);
  const pos = dome.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const top = new Color(0.05, 0.07, 0.052);
  const horizon = new Color(0.032, 0.05, 0.036);
  const bottom = new Color(0.03, 0.02, 0.012);
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    if (y >= 0) c.lerpColors(horizon, top, Math.pow(y, 0.6));
    else c.lerpColors(horizon, bottom, Math.pow(-y, 0.5));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  dome.setAttribute('color', new BufferAttribute(colors, 3));
  scene.add(new Mesh(dome, new MeshBasicMaterial({ vertexColors: true, side: BackSide })));

  const panel = (w: number, h: number, color: [number, number, number], position: [number, number, number]) => {
    const m = new Mesh(new BoxGeometry(w, h, 0.02), new MeshBasicMaterial({ color: new Color(...color) }));
    m.position.set(...position);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(0.8, 0.8, [18, 11.5, 6.2], [1.2, 5.2, -1.2]);
  panel(2.6, 2.6, [1.3, 0.85, 0.48], [-0.6, 5.6, 0.8]); // techo iluminado por el rebote de la mesa // la lámpara
  panel(4, 1.2, [1.1, 0.68, 0.36], [0.5, 2.2, 5.5]); // su rebote en la pared de detrás de la cámara
  panel(6, 2.6, [1.0, 0.72, 0.46], [0, 4.2, -4.6]); // pared del fondo: es lo que se refleja en todo lo que está tumbado
  panel(1.1, 3.6, [0.8, 1.35, 1.2], [-6.5, 2.4, -3.2]); // ventana, luz de noche

  const pmrem = new PMREMGenerator(renderer);
  const texture = pmrem.fromScene(scene, 0, 0.1, 100, { size: 128 }).texture;
  pmrem.dispose();
  scene.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });
  return texture;
}
