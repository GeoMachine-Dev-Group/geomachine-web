import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Curve,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  SpotLight,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type Texture,
} from 'three';
import { extrudeFlat, polygonShape, rod, shadows, slab } from './geo';
import { makeNoise, rng, smoothstep } from './noise';
import { blueprintTexture, brushedMaps, contactTexture, oakMaps, plainPaperTexture, scaleTexture } from './textures';

/* Los objetos de la mesa, modelados a mano. Unidades: metros (el pie de rey se
   dibuja en milímetros y se escala). Cada constructor devuelve un grupo apoyado
   en y = 0 y centrado en su origen; quién va dónde lo decide layout.ts. */

export interface Quality {
  /** Lado largo de la textura de madera. */
  wood: number;
  anisotropy: number;
  /** Lado del mapa de sombras. */
  shadow: number;
  dust: number;
}

const contactMaps: Partial<Record<'disc' | 'box', Texture>> = {};

/** Mancha de sombra de contacto de w × d metros (la forma ocupa el 62 % central). */
export function contact(shape: 'disc' | 'box', w: number, d: number, opacity: number): Mesh {
  const map = (contactMaps[shape] ??= contactTexture(shape));
  const geo = new PlaneGeometry(w / 0.62, d / 0.62);
  geo.rotateX(-Math.PI / 2);
  const mesh = new Mesh(geo, new MeshBasicMaterial({ map, transparent: true, opacity, depthWrite: false, toneMapped: false }));
  mesh.position.y = 0.0003;
  mesh.renderOrder = 1;
  return mesh;
}

export function buildMaterials(q: Quality) {
  const brushed = brushedMaps(256, q.anisotropy);
  const metal = (color: string, roughness: number, repeat: [number, number], normal = 0.35) => {
    const roughnessMap = brushed.roughnessMap.clone();
    const normalMap = brushed.normalMap.clone();
    for (const t of [roughnessMap, normalMap]) t.repeat.set(...repeat);
    return new MeshStandardMaterial({
      color,
      // Los metales viven de lo que reflejan: se les sube el entorno, que para
      // el resto de la escena va muy bajo.
      envMapIntensity: 2.4,
      metalness: 1,
      roughness,
      roughnessMap,
      normalMap,
      normalScale: new Vector2(normal, normal),
    });
  };
  return {
    oak: oakMaps(q.wood, q.wood / 4, q.anisotropy),
    copper: metal('#c07c4c', 0.5, [3, 3], 0.2),
    copperDark: metal('#8a5433', 0.8, [2, 2]),
    brass: metal('#d2ad62', 0.4, [1, 6], 0.2),
    brassDark: metal('#a8884a', 0.52, [2, 2], 0.25),
    steel: metal('#4a4d48', 0.55, [1, 8], 0.3),
    anodized: metal('#232c22', 0.86, [4, 1], 0.45),
    enamel: new MeshStandardMaterial({ color: '#f3e8d0', roughness: 0.45, envMapIntensity: 0.4, emissive: '#ff9d4d', emissiveIntensity: 1.5, side: DoubleSide }),
    bulb: new MeshBasicMaterial({ color: new Color(5.5, 3.9, 2.3) }),
    cord: new MeshStandardMaterial({ color: '#571c1c', roughness: 0.95, envMapIntensity: 0.5 }),
    wax: new MeshPhysicalMaterial({ color: '#7a1f20', roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new Color('#c0504a') }),
    darkWood: new MeshStandardMaterial({ color: '#7a4a26', roughness: 0.38, envMapIntensity: 1.2 }),
    keycap: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.74, envMapIntensity: 0.55 }),
  };
}
export type Materials = ReturnType<typeof buildMaterials>;

/* --- Mesa -------------------------------------------------------------------- */

/** Tablero de tablas de roble: cada tabla es una pieza, con su junta real, su
    tono y un tramo distinto de la misma veta. */
export function buildDesk(m: Materials): Group {
  const g = new Group();
  const r = rng(3);
  const length = 3.6;
  const width = 0.36;
  const metresPerTile = 1.7; // lo que cubre la textura a lo largo de la veta
  const material = new MeshStandardMaterial({
    map: m.oak.map,
    normalMap: m.oak.normalMap,
    normalScale: new Vector2(0.55, 0.55),
    roughnessMap: m.oak.roughnessMap,
    roughness: 1,
    metalness: 0,
    vertexColors: true,
    // Casi sin reflejo del entorno: una mesa encerada espeja la pared del fondo
    // en toda su superficie y se come la penumbra.
    envMapIntensity: 0.06,
  });
  for (let i = 0; i < 7; i++) {
    const geo = new BoxGeometry(length, 0.04, width - 0.0011);
    const uv = geo.attributes.uv;
    const offset = r();
    const flip = r() > 0.5;
    for (let k = 0; k < uv.count; k++) {
      uv.setXY(k, (uv.getX(k) * length) / metresPerTile + offset, flip ? 1 - uv.getY(k) : uv.getY(k));
    }
    const tint = 0.92 + r() * 0.16;
    const warm = 0.96 + r() * 0.08;
    const colors = new Float32Array(geo.attributes.position.count * 3);
    for (let k = 0; k < colors.length; k += 3) colors.set([tint * warm, tint, tint / warm], k);
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    const plank = new Mesh(geo, material);
    plank.position.set((r() - 0.5) * 0.3, -0.02 - r() * 0.00025, -1.36 + width * (i + 0.5));
    plank.receiveShadow = true;
    g.add(plank);
  }
  return g;
}

/* --- Lámpara ----------------------------------------------------------------- */

class Helix extends Curve<Vector3> {
  constructor(private a: Vector3, private b: Vector3, private radius: number, private turns: number) {
    super();
  }
  override getPoint(t: number, target = new Vector3()): Vector3 {
    const axis = this.b.clone().sub(this.a);
    const n = axis.clone().normalize();
    const u = new Vector3(0, 0, 1);
    const v = new Vector3().crossVectors(n, u).normalize();
    const ang = t * this.turns * Math.PI * 2;
    return target
      .copy(this.a)
      .addScaledVector(axis, t)
      .addScaledVector(u, Math.cos(ang) * this.radius)
      .addScaledVector(v, Math.sin(ang) * this.radius);
  }
}

export interface Lamp {
  group: Group;
  head: Group;
  spot: SpotLight;
  /** Alcance horizontal y altura del eje de la cabeza, en el espacio de la lámpara. */
  reach: number;
  headHeight: number;
  /** Del eje de la cabeza a la boca de la pantalla, a lo largo del eje. */
  mouth: number;
  mouthRadius: number;
  /** Coloca la base, gira el brazo hacia `yaw` y apunta la pantalla a `target`. */
  pose(base: Vector3, yaw: number, target: Vector3): void;
}

/** Flexo de taller: base y pantalla de cobre, brazo doble de acero con muelle,
    articulaciones de latón y cable de tela granate. */
export function buildLamp(m: Materials, shadowSize: number): Lamp {
  const group = new Group();
  const P0 = new Vector3(0, 0.062, 0);
  const P1 = new Vector3(-0.075, 0.262, 0);
  const P2 = new Vector3(0.44, 0.43, 0);

  // Base torneada, con el vástago.
  const base = shadows(
    new Mesh(
      new LatheGeometry(
        [
          [0, 0], [0.088, 0], [0.094, 0.003], [0.095, 0.011], [0.091, 0.018], [0.07, 0.024], [0.04, 0.028],
          [0.02, 0.033], [0.0135, 0.04], [0.0125, 0.062],
        ].map(([x, y]) => new Vector2(x, y)),
        64,
      ),
      m.copper,
    ),
  );
  group.add(base);
  group.add(contact('disc', 0.2, 0.2, 0.72));
  const sw = shadows(new Mesh(new CylinderGeometry(0.0065, 0.0075, 0.014, 20), m.brass));
  sw.position.set(0.05, 0.031, 0.036);
  group.add(sw);

  // Brazos: dos varillas paralelas por tramo.
  for (const z of [-0.011, 0.011]) {
    const off = new Vector3(0, 0, z);
    group.add(shadows(rod(P0.clone().add(off), P1.clone().add(off), 0.0036, m.steel)));
    group.add(shadows(rod(P1.clone().add(off), P2.clone().add(off), 0.0036, m.steel)));
  }
  // Articulaciones: eje de cobre y palomilla de latón.
  for (const p of [P0, P1, P2]) {
    const axle = shadows(new Mesh(new CylinderGeometry(0.0125, 0.0125, 0.034, 28), m.copperDark));
    axle.rotation.x = Math.PI / 2;
    axle.position.copy(p);
    group.add(axle);
    const nut = shadows(new Mesh(new CylinderGeometry(0.0075, 0.009, 0.012, 6), m.brass));
    nut.rotation.x = Math.PI / 2;
    nut.position.copy(p).add(new Vector3(0, 0, 0.022));
    group.add(nut);
  }
  // Muelle de compensación, del pie al primer tercio del brazo largo.
  const springA = P1.clone().lerp(P0, 0.15).add(new Vector3(0.012, 0, 0));
  const springB = P1.clone().lerp(P2, 0.3).add(new Vector3(0, -0.012, 0));
  group.add(shadows(new Mesh(new TubeGeometry(new Helix(springA, springB, 0.0052, 26), 420, 0.0011, 6), m.steel)));

  // Cable de tela: sale por detrás de la base y se pierde por el fondo de la mesa.
  const cord = new CatmullRomCurve3([
    new Vector3(-0.088, 0.008, 0), new Vector3(-0.14, 0.0045, 0.012), new Vector3(-0.24, 0.0045, -0.03),
    new Vector3(-0.33, 0.0045, 0.05), new Vector3(-0.5, 0.0045, 0.02), new Vector3(-0.9, 0.0045, -0.18), new Vector3(-1.6, 0.0045, -0.1),
  ]);
  group.add(shadows(new Mesh(new TubeGeometry(cord, 160, 0.0034, 8), m.cord)));

  // Cabeza: el eje -Y local es hacia donde alumbra.
  const head = new Group();
  head.position.copy(P2);
  group.add(head);
  const lathe = (pts: number[][], material: MeshStandardMaterial) => new Mesh(new LatheGeometry(pts.map(([x, y]) => new Vector2(x, y)), 72), material);
  const shadeOuter = m.copper.clone();
  shadeOuter.side = DoubleSide;
  const outer = lathe(
    [
      [0, -0.018], [0.01, -0.0185], [0.019, -0.022], [0.0235, -0.03], [0.0245, -0.04], [0.0245, -0.064], [0.03, -0.071],
      [0.046, -0.083], [0.066, -0.105], [0.082, -0.133], [0.091, -0.163], [0.0945, -0.174], [0.0965, -0.178], [0.095, -0.1815],
    ],
    shadeOuter,
  );
  head.add(outer);
  head.add(
    lathe(
      [[0.022, -0.066], [0.028, -0.073], [0.044, -0.085], [0.064, -0.107], [0.08, -0.135], [0.089, -0.165], [0.0925, -0.179], [0.095, -0.1815]],
      m.enamel,
    ),
  );
  const finial = new Mesh(new SphereGeometry(0.006, 16, 12), m.brass);
  finial.position.y = -0.014;
  head.add(finial);
  const band = new Mesh(new TorusGeometry(0.0252, 0.0022, 10, 48), m.brass);
  band.rotation.x = Math.PI / 2;
  band.position.y = -0.063;
  head.add(band);
  const bulb = new Mesh(new SphereGeometry(0.026, 24, 16), m.bulb);
  bulb.position.y = -0.122;
  head.add(bulb);

  const spot = new SpotLight('#ffb878', 1, 4, 1.4, 1, 2);
  spot.position.set(0, -0.128, 0);
  spot.target.position.set(0, -1, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(shadowSize, shadowSize);
  spot.shadow.focus = 0.7; // el mapa de sombras cubre solo el centro del cono, donde están los objetos
  spot.shadow.camera.near = 0.06;
  spot.shadow.camera.far = 2.4;
  spot.shadow.bias = -0.00025;
  spot.shadow.normalBias = 0.004;
  head.add(spot, spot.target);

  const DOWN = new Vector3(0, -1, 0);
  const aim = new Vector3();
  return {
    group,
    head,
    spot,
    reach: P2.x,
    headHeight: P2.y,
    mouth: 0.1815,
    mouthRadius: 0.095,
    pose(basePos, yaw, target) {
      group.position.copy(basePos);
      group.rotation.y = yaw;
      group.updateMatrixWorld(true);
      aim.copy(target);
      group.worldToLocal(aim).sub(P2).normalize();
      head.quaternion.setFromUnitVectors(DOWN, aim);
    },
  };
}

/* --- Pie de rey -------------------------------------------------------------- */

/** Pie de rey de latón, 150 mm, con las bocas abiertas unos 24 mm. Se dibuja en
    milímetros sobre el plano XY y luego se tumba. */
export function buildCaliper(m: Materials, anisotropy: number): Group {
  const outer = new Group();
  const g = new Group();
  g.scale.setScalar(0.001);
  g.rotation.x = -Math.PI / 2;
  outer.add(g);
  const T = 3; // grosor de la regla
  const S = 38; // posición de la corredera = apertura + 14

  const plate = (pts: Array<[number, number]>, thickness: number, material: MeshStandardMaterial, z = 0) => {
    const geo = extrudeFlat(polygonShape(pts), thickness, 0.35, 2);
    geo.rotateX(Math.PI / 2); // de vuelta a XY: el grupo entero se tumba al final
    const mesh = shadows(new Mesh(geo, material));
    mesh.position.z = z;
    g.add(mesh);
    return mesh;
  };

  // Regla con las dos bocas fijas (la grande abajo, la de interiores arriba).
  plate(
    [[0, -27], [5, -40], [14, -40], [14, 0], [232, 0], [235, 3], [235, 13], [232, 16], [16, 16], [16, 31], [13.6, 31], [9, 22], [0, 22]],
    T,
    m.brass,
  );
  // Corredera: abraza la regla, así que es más gruesa y sobresale por las dos caras.
  plate(
    [
      [S, -40], [S + 9, -40], [S + 19, -5], [S + 56, -5], [S + 58, -3], [S + 58, 19], [S + 56, 21], [S + 9.4, 21],
      [S + 9.4, 22], [S + 4.8, 31], [S + 2.4, 31], [S + 2.4, 21], [S, 21],
    ],
    T + 2.2,
    m.brassDark,
    -1.1,
  );
  // Varilla de profundidad.
  plate([[S + 56, 6], [246, 6], [246, 9.4], [S + 56, 9.4]], 1.2, m.steel, 0.9);

  // Escalas: la principal en la regla y el nonio en el bisel de la corredera.
  const strip = (len: number, wide: number, x: number, y: number, z: number, tex: Texture, base: MeshStandardMaterial) => {
    const mat = base.clone();
    mat.map = tex;
    mat.normalMap = null;
    const mesh = new Mesh(new PlaneGeometry(len, wide), mat);
    mesh.position.set(x + len / 2, y + wide / 2, z);
    mesh.receiveShadow = true;
    g.add(mesh);
  };
  strip(160, 7, S + 62, 0.6, T + 0.03, scaleTexture(anisotropy, 160), m.brass);
  strip(34, 5.2, S + 16, -4.4, T + 1.14, scaleTexture(anisotropy, 34, true), m.brass);

  // Rueda de avance y tornillo de freno, moleteados.
  const wheel = shadows(new Mesh(new CylinderGeometry(5, 5, T + 1.4, 22), m.steel));
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(S + 44, -6.6, T / 2);
  g.add(wheel);
  const screw = shadows(new Mesh(new CylinderGeometry(3.1, 3.1, 5.5, 14), m.steel));
  screw.position.set(S + 30, 23.6, T / 2);
  g.add(screw);

  // Centrado: el origen queda en mitad de la regla.
  g.position.set(-0.117, 0, 0);
  return outer;
}

/* --- Papeles ----------------------------------------------------------------- */

const paperMaterial = (map: Texture, tint = '#cfc6b2') =>
  new MeshStandardMaterial({ map, color: tint, roughness: 0.93, metalness: 0, side: DoubleSide, envMapIntensity: 0.45 });

/** Plano grande, desplegado después de haber estado doblado: los paneles quedan
    en acordeón (pliegues alternos monte/valle) y con un ligero caballete en el
    pliegue largo. Cada panel es plano, así que los pliegues salen a arista viva. */
export function buildBlueprint(anisotropy: number): Group {
  const g = new Group();
  const w = 0.42;
  const d = 0.297;
  const cols = 3;
  const rows = 2;
  const geo = new PlaneGeometry(w, d, cols, rows);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const cx = Math.round((pos.getX(i) / w + 0.5) * cols);
    const cz = Math.round((pos.getZ(i) / d + 0.5) * rows);
    const accordion = cx % 2 === 1 ? 0.009 : 0;
    const ridge = cz === 1 ? 0.005 : 0;
    // La esquina más cercana no llegó a asentarse: queda levantada.
    const corner = cx === cols && cz === rows ? 0.012 : 0;
    pos.setY(i, 0.0006 + accordion + ridge + corner);
  }
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  g.add(shadows(new Mesh(flat, paperMaterial(blueprintTexture(anisotropy, cols, rows)))));
  g.add(contact('box', w + 0.01, d + 0.01, 0.55));
  return g;
}

/** Plano doblado en cuatro, cerrado: un taco de capas ligeramente descuadradas. */
export function buildFoldedPlan(anisotropy: number): Group {
  const g = new Group();
  const r = rng(51);
  const mat = paperMaterial(plainPaperTexture(anisotropy, 41, '#e2d7bd', true));
  const edge = paperMaterial(plainPaperTexture(anisotropy, 43, '#d6c9ab'));
  for (let i = 0; i < 4; i++) {
    const layer = shadows(new Mesh(new BoxGeometry(0.262 - i * 0.0012, 0.0007, 0.186 - r() * 0.003), i === 3 ? mat : edge));
    layer.position.set((r() - 0.5) * 0.004, 0.0005 + i * 0.00105, (r() - 0.5) * 0.004);
    layer.rotation.y = (r() - 0.5) * 0.018;
    g.add(layer);
  }
  g.add(contact('box', 0.268, 0.192, 0.6));
  return g;
}

/** Carta doblada en tres, con la solapa cerrada por el sello. */
export function buildLetter(m: Materials, anisotropy: number): Group {
  const g = new Group();
  const paper = paperMaterial(plainPaperTexture(anisotropy, 61, '#ece3cd'));
  const body = shadows(new Mesh(new BoxGeometry(0.216, 0.0014, 0.104), paper));
  body.position.y = 0.0008;
  g.add(body);
  // Solapa: baja desde el borde del fondo y se levanta un poco hacia su canto libre.
  const flapGeo = new PlaneGeometry(0.216, 0.066, 1, 1);
  flapGeo.rotateX(-Math.PI / 2);
  flapGeo.translate(0, 0, 0.033);
  const flap = shadows(new Mesh(flapGeo, paper));
  flap.position.set(0, 0.0017, -0.052);
  flap.rotation.x = -0.022;
  g.add(flap);
  const seal = buildSeal(m);
  seal.position.set(0.012, 0.0027, 0.013);
  seal.rotation.y = 0.5;
  g.add(seal);
  g.add(contact('box', 0.22, 0.108, 0.55));
  return g;
}

/** Sello de lacre: un goterón aplastado, con el cerco que deja el cuño al hundirse
    y un rosetón geométrico en relieve (sin emblema). */
export function buildSeal(m: Materials): Mesh {
  const { noise } = makeNoise(77);
  const R = 0.023;
  const rings = 44;
  const segs = 132;
  const positions = new Float32Array((rings + 1) * segs * 3);
  const index: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const rho = i / rings;
    for (let j = 0; j < segs; j++) {
      const th = (j / segs) * Math.PI * 2;
      // Contorno irregular: el lacre se escurre más por unos lados que por otros.
      const wobble = 1 + 0.085 * (noise(Math.cos(th) * 1.6 + 5, Math.sin(th) * 1.6 + 5) - 0.5) * 2 + 0.03 * Math.sin(th * 3 + 1);
      const rad = rho * R * (1 + (wobble - 1) * smoothstep(0.55, 1, rho));
      const star = 0.2 + 0.13 * Math.pow(Math.abs(Math.cos(th * 4)), 1.6);
      const emboss =
        0.00042 * smoothstep(star, star - 0.045, rho) + // rosetón de ocho puntas
        0.0004 * smoothstep(0.065, 0, Math.abs(rho - 0.47)) + // anillo
        0.00022 * smoothstep(0.03, 0, Math.abs(rho - 0.56)); // filete
      const plateau = 0.0021 + emboss;
      const rim = 0.0021 + 0.0019 * smoothstep(0.6, 0.76, rho); // el cerco que levanta el cuño
      const fall = Math.sqrt(Math.max(0, 1 - Math.pow(smoothstep(0.74, 1, rho), 2.2)));
      const lump = (noise(Math.cos(th) * 3 + 9, Math.sin(th) * 3 + rho * 2) - 0.5) * 0.0005 * smoothstep(0.6, 0.85, rho);
      const y = (rho < 0.6 ? plateau : rim + lump) * fall;
      positions.set([Math.cos(th) * rad, y, Math.sin(th) * rad], (i * segs + j) * 3);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * segs + j;
      const b = i * segs + ((j + 1) % segs);
      const c = (i + 1) * segs + j;
      const d = (i + 1) * segs + ((j + 1) % segs);
      index.push(a, b, c, b, d, c);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return shadows(new Mesh(geo, m.wax));
}

/** Cuño de sellar, de pie: cabeza de latón y mango torneado de madera oscura. */
export function buildStamp(m: Materials): Group {
  const g = new Group();
  const lathe = (pts: number[][], mat: MeshStandardMaterial) =>
    shadows(new Mesh(new LatheGeometry(pts.map(([x, y]) => new Vector2(x, y)), 40), mat));
  g.add(lathe([[0, 0], [0.0122, 0], [0.013, 0.0008], [0.013, 0.009], [0.0118, 0.0105], [0.0078, 0.0125], [0.0064, 0.0165], [0.0064, 0.021]], m.brass));
  g.add(
    lathe(
      [
        [0.0064, 0.021], [0.0086, 0.0225], [0.0092, 0.026], [0.0078, 0.03], [0.0098, 0.037], [0.0136, 0.047], [0.0148, 0.057],
        [0.0138, 0.066], [0.0102, 0.0735], [0.005, 0.0775], [0, 0.0782],
      ],
      m.darkWood,
    ),
  );
  g.add(contact('disc', 0.036, 0.036, 0.8));
  return g;
}

/* --- Teclado ----------------------------------------------------------------- */

/** Teclado mecánico compacto (65 %), apagado y sin leyendas: caja de aluminio
    anodizado, teclas crema y verde botella, Esc granate, Intro cobre y un dial
    de latón en la esquina. */
export function buildKeyboard(m: Materials): Group {
  const g = new Group();
  const U = 0.01905;
  const rows: Array<Array<number | [number, string]>> = [
    [[1, 'esc'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2, 'mod'], [1, 'knob']],
    [[1.5, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [1.5, 'mod'], [1, 'mod']],
    [[1.75, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2.25, 'enter'], [1, 'mod']],
    [[2.25, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [1.75, 'mod'], [1, 'mod'], [1, 'mod']],
    [[1.25, 'mod'], [1.25, 'mod'], [1.25, 'mod'], 6.25, [1.25, 'mod'], [1.25, 'mod'], [0.5, 'gap'], [1, 'mod'], [1, 'mod'], [1, 'mod']],
  ];
  const W = 16 * U;
  const D = 5 * U;
  const caseW = W + 0.016;
  const caseD = D + 0.016;
  const tilt = 0.105;

  const body = new Group();
  body.rotation.x = tilt;
  body.position.y = Math.sin(tilt) * (caseD / 2) + 0.0015;
  g.add(body);

  const shell = shadows(new Mesh(slab(caseW, caseD, 0.019, 0.007, 0.0022, 3), m.anodized));
  body.add(shell);
  g.add(contact('box', caseW + 0.012, caseD + 0.012, 0.75));
  // Placa hundida donde asientan los interruptores.
  const plate = new Mesh(new BoxGeometry(W + 0.002, 0.002, D + 0.002), new MeshStandardMaterial({ color: '#0b0e0a', roughness: 0.9, envMapIntensity: 0.3 }));
  plate.position.y = 0.0185;
  body.add(plate);

  const colors: Record<string, Color> = {
    alpha: new Color('#cdc3aa'),
    mod: new Color('#35483b'),
    esc: new Color('#7a2222'),
    enter: new Color('#b0713f'),
  };
  // Una geometría por ancho de tecla, instanciada.
  const byWidth = new Map<number, Array<{ x: number; z: number; color: Color }>>();
  const jitter = rng(91);
  rows.forEach((row, ri) => {
    let x = -W / 2;
    const z = -D / 2 + U * (ri + 0.5);
    for (const key of row) {
      const [units, kind] = Array.isArray(key) ? key : [key, 'alpha'];
      const cx = x + (units * U) / 2;
      x += units * U;
      if (kind === 'gap') continue;
      if (kind === 'knob') {
        const knob = shadows(new Mesh(new CylinderGeometry(0.0078, 0.0082, 0.011, 28), m.brass));
        knob.position.set(cx, 0.0185 + 0.0065, z);
        body.add(knob);
        continue;
      }
      // Cada tecla cambia un pelo de tono: son tandas de tinte distintas.
      const color = colors[kind].clone().multiplyScalar(0.94 + jitter() * 0.12);
      (byWidth.get(units) ?? byWidth.set(units, []).get(units)!).push({ x: cx, z, color });
    }
  });
  const dummy = new Object3D();
  const matrix = new Matrix4();
  for (const [units, keys] of byWidth) {
    const geo = slab(units * U - 0.0011, U - 0.0011, 0.0092, 0.0019, 0.0021, 3);
    const mesh = new InstancedMesh(geo, m.keycap, keys.length);
    keys.forEach((k, i) => {
      dummy.position.set(k.x, 0.0195, k.z);
      dummy.updateMatrix();
      matrix.copy(dummy.matrix);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, k.color);
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    body.add(mesh);
  }
  return g;
}
