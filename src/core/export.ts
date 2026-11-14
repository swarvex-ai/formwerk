// Export of a built asset as .glb, .usdz or .obj, made in the browser. With `bake`, procedural patterns (wood grain,
// rust, stone, bark, foliage) are rendered into textures (colour, normal map, roughness/metalness): unwrapUVs (three.js r187) lays out the surfaces in UV space,
// a bake material draws each mesh's own TSL colour there, and the exporters carry that texture. The bake always runs
// on its own short-lived WebGL 2 renderer, whatever the page uses: one path, the one the scene tests check.
import { CanvasTexture, DoubleSide, FloatType, Group, Mesh, NoColorSpace, OrthographicCamera, RenderTarget, Scene, SRGBColorSpace, type Material, type Object3D } from "three";
import { MeshBasicNodeMaterial, WebGPURenderer, type Node } from "three/webgpu";
import { cross, dFdx, dFdy, dot, float, Fn, max, normalize, normalLocal, positionLocal, select, uv, vec3, vec4 } from "three/tsl";
import { unwrapUVs } from "three/addons/utils/unwrapUVs.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { USDZExporter } from "three/addons/exporters/USDZExporter.js";
import { OBJExporter } from "three/addons/exporters/OBJExporter.js";
import { bakeNodes, exportInfo, exportMaterial, faceNormal } from "../materials";

export type BakeResult = { texture: CanvasTexture; normal: CanvasTexture; orm: CanvasTexture; canvas: HTMLCanvasElement; coverage: number };

// Normal map pass: the object-space normal of the material (with its relief), written in the tangent frame three.js
// builds from screen derivatives of position and uv when a mesh has no tangents (TangentUtils.js, "Normal Mapping
// Without Precomputed Tangents"). In the atlas the same derivatives give the same frame; a chart the atlas lays out
// mirrored turns the frame over, which the sign of the atlas triangle corrects.
const normalImAtlas = (n: Node<"vec3">, flat: boolean) => Fn(() => {
  const N = flat ? faceNormal() : normalize(normalLocal);
  const q0 = dFdx(positionLocal), q1 = dFdy(positionLocal), st0 = dFdx(uv()), st1 = dFdy(uv());
  const seite = select(dot(cross(q0, q1), N).greaterThanEqual(0), float(1), float(-1));
  const q1perp = cross(q1, N), q0perp = cross(N, q0);
  const T = q1perp.mul(st0.x).add(q0perp.mul(st1.x)).mul(seite), B = q1perp.mul(st0.y).add(q0perp.mul(st1.y)).mul(seite);
  const skala = max(dot(T, T), dot(B, B)).inverseSqrt();
  const t = T.mul(skala), b = B.mul(skala);
  // n = t·x + b·y + N·z: z along N, x and y from the 2 × 2 system in the tangent plane
  const z = dot(n, N), rest = n.sub(N.mul(z));
  const tt = dot(t, t), tb = dot(t, b), bb = dot(b, b), rt = dot(rest, t), rb = dot(rest, b);
  const det = tt.mul(bb).sub(tb.mul(tb)).max(1e-8);
  const x = rt.mul(bb).sub(rb.mul(tb)).div(det), y = rb.mul(tt).sub(rt.mul(tb)).div(det);
  return normalize(vec3(x, y, z)).mul(0.5).add(0.5);
})();

/**
 * Bakes every patterned mesh in `o` into one atlas: colour, a normal map with the relief and roughness/metalness
 * (glTF layout: green roughness, blue metalness). Changes the geometry of those meshes (new UVs), so call it on a
 * copy. Returns null if nothing has a pattern or the surfaces do not fit the atlas.
 */
export async function bake(o: Object3D, resolution = 1024): Promise<BakeResult | null> {
  o.updateMatrixWorld(true);
  const meshes: Mesh[] = [];
  o.traverse((x) => { const m = x as Mesh; if (m.isMesh && exportInfo(m.material as Material)?.pattern) meshes.push(m); });
  if (!meshes.length) return null;

  // Stellvertreter mit der Weltlage der Meshes, damit nur gemusterte Flächen Platz im Atlas bekommen
  const sammlung = new Group();
  const vertreter = meshes.map((m) => {
    const v = new Mesh(m.geometry, m.material);
    v.matrixAutoUpdate = false;
    v.matrix.copy(m.matrixWorld);
    sammlung.add(v);
    return v;
  });
  if (!unwrapUVs(sammlung, { attribute: "uv", resolution, padding: 4 })) return null;
  meshes.forEach((m, i) => { m.geometry = vertreter[i].geometry; });

  // Ein Durchgang je Karte: jede Fläche wird an ihre Stelle im Atlas gezeichnet, gefärbt nach ihrer Lage im Asset
  const durchgang = (wert: (orig: Material, flat: boolean) => Node<"vec3">) => {
    const szene = new Scene();
    for (const m of meshes) {
      const orig = m.material as Material, flat = Boolean((orig as { flatShading?: boolean }).flatShading);
      const mat = new MeshBasicNodeMaterial({ side: DoubleSide });
      mat.colorNode = wert(orig, flat);
      mat.vertexNode = vec4(uv().mul(2).sub(1), 0, 1);
      // Nicht nach der Lage im Raum aussortieren: gezeichnet wird in den Atlas, nicht vor die Kamera
      const b = new Mesh(m.geometry, mat);
      b.frustumCulled = false;
      szene.add(b);
    }
    return szene;
  };
  const farbe = (orig: Material) => {
    const k = bakeNodes(orig);
    if (k) return k.color;
    const n = orig as MeshBasicNodeMaterial;
    return (n.colorNode as Node<"vec3"> | null) ?? vec3(n.color.r, n.color.g, n.color.b);
  };
  const normale = (orig: Material, flat: boolean) => normalImAtlas(bakeNodes(orig)?.normal(flat) ?? (flat ? faceNormal() : normalize(normalLocal)), flat);
  const orm = (orig: Material) => {
    const k = bakeNodes(orig), e = exportInfo(orig)!;
    return k ? vec3(1, k.roughness, k.metalness) : vec3(1, e.roughness, e.metalness);
  };
  const szenen = [durchgang(farbe), durchgang(normale), durchgang(orm)];
  const ziel = new RenderTarget(resolution, resolution, { type: FloatType, depthBuffer: false });
  const kamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new WebGPURenderer({ canvas: document.createElement("canvas"), forceWebGL: true, antialias: false });
  const daten: Float32Array[] = [];
  try {
    await renderer.init();
    renderer.setRenderTarget(ziel);
    renderer.setClearColor(0x000000, 0);
    for (const szene of szenen) {
      renderer.clear();
      renderer.render(szene, kamera);
      daten.push(new Float32Array((await renderer.readRenderTargetPixelsAsync(ziel, 0, 0, resolution, resolution)) as Float32Array));
    }
  } finally {
    ziel.dispose();
    for (const szene of szenen) szene.traverse((x) => { const m = x as Mesh; if (m.isMesh) (m.material as Material).dispose(); });
    renderer.dispose();
  }
  const n = resolution;
  let belegt = 0;
  for (let i = 3; i < daten[0].length; i += 4) if (daten[0][i] > 0) belegt++;
  const [farbBild, normalBild, ormBild] = daten.map((px, k) => bild(auffuellen(px, n), n, k === 0 ? zuSrgb : linear));
  const texture = new CanvasTexture(farbBild);
  texture.colorSpace = SRGBColorSpace;
  texture.userData.mimeType = "image/jpeg";
  // Normalen und Rauheit verlustfrei: JPEG-Artefakte würden das Relief verbiegen
  const normal = new CanvasTexture(normalBild), ormTextur = new CanvasTexture(ormBild);
  normal.colorSpace = ormTextur.colorSpace = NoColorSpace;
  return { texture, normal, orm: ormTextur, canvas: farbBild, coverage: belegt / (n * n) };
}

const zuSrgb = (c: number) => {
  const x = Math.min(1, Math.max(0, c));
  return Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
};
const linear = (c: number) => Math.round(255 * Math.min(1, Math.max(0, c)));

// Ränder auffüllen, damit Filter und Mipmaps keine leeren Pixel in die Flächen ziehen
function auffuellen(daten: Float32Array, n: number): Float32Array {
  const px = new Float32Array(daten);
  for (let runde = 0; runde < 8; runde++) {
    const vorRunde = new Float32Array(px);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      if (vorRunde[i + 3] > 0) continue;
      let r = 0, g = 0, b = 0, k = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
        const j = (yy * n + xx) * 4;
        if (vorRunde[j + 3] > 0) { r += vorRunde[j]; g += vorRunde[j + 1]; b += vorRunde[j + 2]; k++; }
      }
      if (k) { px[i] = r / k; px[i + 1] = g / k; px[i + 2] = b / k; px[i + 3] = 1; }
    }
  }
  return px;
}

// In ein Bild schreiben, Zeile 0 oben (WebGL liest von unten nach oben)
function bild(px: Float32Array, n: number, kodieren: (c: number) => number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = n;
  const ctx = canvas.getContext("2d")!, b = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) {
    const quelle = n - 1 - y;
    for (let x = 0; x < n; x++) {
      const i = (quelle * n + x) * 4, j = (y * n + x) * 4;
      b.data[j] = kodieren(px[i]); b.data[j + 1] = kodieren(px[i + 1]); b.data[j + 2] = kodieren(px[i + 2]); b.data[j + 3] = 255;
    }
  }
  ctx.putImageData(b, 0, 0);
  return canvas;
}

/** A copy of `o` with plain PBR materials for the exporters; with `bake`, patterned surfaces get the baked texture. */
export type ExportOptions = { bake?: boolean; resolution?: number };
export async function exportCopy(o: Object3D, opts: ExportOptions = {}): Promise<Object3D> {
  const kopie = o.clone(true);
  const gebacken = opts.bake ? await bake(kopie, opts.resolution) : null;
  kopie.traverse((x) => {
    const m = x as Mesh;
    if (!m.isMesh) return;
    const info = exportInfo(m.material as Material), neu = exportMaterial(m.material as Material);
    neu.name = info?.kind ?? "material";
    if (gebacken && info?.pattern) {
      neu.map = gebacken.texture; neu.color.set("#ffffff");
      neu.normalMap = gebacken.normal;
      neu.roughnessMap = neu.metalnessMap = gebacken.orm; neu.roughness = 1; neu.metalness = 1;
    }
    m.material = neu;
  });
  return kopie;
}

export async function toGLB(o: Object3D, opts: ExportOptions = {}): Promise<ArrayBuffer> {
  return (await new GLTFExporter().parseAsync(await exportCopy(o, opts), { binary: true })) as ArrayBuffer;
}
export async function toUSDZ(o: Object3D, opts: ExportOptions = {}): Promise<Uint8Array> {
  return new USDZExporter().parseAsync(await exportCopy(o, opts));
}
/** Geometry only (OBJ has no PBR materials); material names stay as `usemtl` groups. */
export async function toOBJ(o: Object3D): Promise<string> {
  return new OBJExporter().parse(await exportCopy(o));
}
