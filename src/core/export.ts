// Export of a built asset as .glb, .usdz or .obj, made in the browser. With `bake`, procedural patterns (wood grain,
// stone, bark, foliage) are rendered into one texture: unwrapUVs (three.js r187) lays out the surfaces in UV space,
// a bake material draws each mesh's own TSL colour there, and the exporters carry that texture. The bake always runs
// on its own short-lived WebGL 2 renderer, whatever the page uses: one path, the one the scene tests check.
import { CanvasTexture, DoubleSide, FloatType, Group, Mesh, OrthographicCamera, RenderTarget, Scene, SRGBColorSpace, type Material, type Object3D } from "three";
import { MeshBasicNodeMaterial, WebGPURenderer } from "three/webgpu";
import { uv, vec4 } from "three/tsl";
import { unwrapUVs } from "three/addons/utils/unwrapUVs.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { USDZExporter } from "three/addons/exporters/USDZExporter.js";
import { OBJExporter } from "three/addons/exporters/OBJExporter.js";
import { exportInfo, exportMaterial } from "../materials";

export type BakeResult = { texture: CanvasTexture; canvas: HTMLCanvasElement; coverage: number };

const zuSrgb = (c: number) => {
  const x = Math.min(1, Math.max(0, c));
  return Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
};

/**
 * Bakes the procedural colour of every patterned mesh in `o` into one texture. Changes the geometry of those meshes
 * (new UVs), so call it on a copy. Returns null if nothing has a pattern or the surfaces do not fit the atlas.
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

  const ziel = new RenderTarget(resolution, resolution, { type: FloatType, depthBuffer: false });
  const szene = new Scene(), kamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  for (const m of meshes) {
    const orig = m.material as MeshBasicNodeMaterial;
    const mat = new MeshBasicNodeMaterial({ side: DoubleSide });
    mat.colorNode = orig.colorNode ?? null;
    if (!mat.colorNode) mat.color.copy((orig as unknown as { color: MeshBasicNodeMaterial["color"] }).color);
    // Jede Fläche wird an ihre Stelle im Atlas gezeichnet, gefärbt nach ihrer Lage im Asset
    mat.vertexNode = vec4(uv().mul(2).sub(1), 0, 1);
    // Nicht nach der Lage im Raum aussortieren: gezeichnet wird in den Atlas, nicht vor die Kamera
    const b = new Mesh(m.geometry, mat);
    b.frustumCulled = false;
    szene.add(b);
  }
  const renderer = new WebGPURenderer({ canvas: document.createElement("canvas"), forceWebGL: true, antialias: false });
  let daten: Float32Array;
  try {
    await renderer.init();
    renderer.setRenderTarget(ziel);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(szene, kamera);
    daten = (await renderer.readRenderTargetPixelsAsync(ziel, 0, 0, resolution, resolution)) as Float32Array;
  } finally {
    ziel.dispose();
    szene.traverse((x) => { const m = x as Mesh; if (m.isMesh) (m.material as Material).dispose(); });
    renderer.dispose();
  }

  // Ränder auffüllen, damit Filter und Mipmaps keine leeren Pixel in die Flächen ziehen
  const n = resolution, px = new Float32Array(daten);
  let belegt = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] > 0) belegt++;
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

  // In ein Bild schreiben, Zeile 0 oben (WebGL liest von unten nach oben)
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = n;
  const ctx = canvas.getContext("2d")!, bild = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) {
    const quelle = n - 1 - y;
    for (let x = 0; x < n; x++) {
      const i = (quelle * n + x) * 4, j = (y * n + x) * 4;
      bild.data[j] = zuSrgb(px[i]); bild.data[j + 1] = zuSrgb(px[i + 1]); bild.data[j + 2] = zuSrgb(px[i + 2]); bild.data[j + 3] = 255;
    }
  }
  ctx.putImageData(bild, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.userData.mimeType = "image/jpeg";
  return { texture, canvas, coverage: belegt / (n * n) };
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
    if (gebacken && info?.pattern) { neu.map = gebacken.texture; neu.color.set("#ffffff"); }
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
