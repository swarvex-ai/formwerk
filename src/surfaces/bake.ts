// The bake: renders the maps of a surface into images of any size (512 to 8192 pixels across a tile), tile by tile on
// a short-lived WebGL 2 renderer (one path, the one the scene tests check), as 8-bit RGBA with row 0 at the top of
// the texture. Colour is stored as sRGB, the other maps linear; the normal map follows the OpenGL convention.
import { CanvasTexture, FloatType, LinearSRGBColorSpace, Mesh, MeshStandardMaterial, OrthographicCamera, PlaneGeometry, RenderTarget, RepeatWrapping, Scene, SRGBColorSpace } from "three";
import { MeshBasicNodeMaterial, WebGPURenderer } from "three/webgpu";
import { positionGeometry, uniform, uv, vec2, vec4 } from "three/tsl";
import { zipSync } from "three/addons/libs/fflate.module.js";
import { MAPS, mapNode, type BakedTextures, type MadeSurface, type MapName } from "./define";

export type BakedMap = { map: MapName; size: number; pixels: Uint8ClampedArray<ArrayBuffer> };
export const SIZES = [512, 1024, 2048, 4096, 8192] as const;
// Pieces of at most 512 × 512 pixels per draw: a heavy surface stays far below the GPU watchdog, also in software
// rendering and on small GPUs
const KACHEL = 512;

const zuSrgb = (c: number) => {
  const x = Math.min(1, Math.max(0, c));
  return Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
};
const linear = (c: number) => Math.round(255 * Math.min(1, Math.max(0, c)));

export type Baker = Awaited<ReturnType<typeof createBaker>>;

/** A baker keeps one renderer (one WebGL context) for many maps; call dispose() when done. */
export async function createBaker() {
  const renderer = new WebGPURenderer({ canvas: document.createElement("canvas"), forceWebGL: true, antialias: false });
  await renderer.init();
  const versatz = uniform(vec2(0, 0)), anteil = uniform(1);
  const material = new MeshBasicNodeMaterial();
  material.vertexNode = vec4(positionGeometry.xy, 0, 1);
  const flaeche = new Mesh(new PlaneGeometry(2, 2), material);
  flaeche.frustumCulled = false;
  const szene = new Scene().add(flaeche), kamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    /** One map of `m` at `size` pixels across the tile; `offset` shifts the window (in tiles, for the tiling test). */
    async bake(m: MadeSurface, map: MapName, size: number, offset: readonly [number, number] = [0, 0]): Promise<BakedMap> {
      const kachel = Math.min(size, KACHEL), n = size / kachel;
      // The point on the tile: this piece's offset plus its share of the tile
      const p = versatz.add(uv().mul(anteil));
      material.colorNode = vec4(mapNode(m, map, p, size), 1);
      material.needsUpdate = true;
      anteil.value = kachel / size;
      const ziel = new RenderTarget(kachel, kachel, { type: FloatType, depthBuffer: false });
      const pixels = new Uint8ClampedArray(size * size * 4);
      const kodieren = map === "color" ? zuSrgb : linear;
      try {
        for (let ty = 0; ty < n; ty++) for (let tx = 0; tx < n; tx++) {
          versatz.value.set(tx / n + offset[0], ty / n + offset[1]);
          renderer.setRenderTarget(ziel);
          renderer.render(szene, kamera);
          const daten = (await renderer.readRenderTargetPixelsAsync(ziel, 0, 0, kachel, kachel)) as Float32Array;
          // WebGL reads bottom up; the image has row 0 at the top (v = 1)
          for (let r = 0; r < kachel; r++) {
            const zeile = size - 1 - (ty * kachel + r);
            for (let x = 0; x < kachel; x++) {
              const i = (r * kachel + x) * 4, j = (zeile * size + tx * kachel + x) * 4;
              pixels[j] = kodieren(daten[i]); pixels[j + 1] = kodieren(daten[i + 1]); pixels[j + 2] = kodieren(daten[i + 2]); pixels[j + 3] = 255;
            }
          }
        }
      } finally {
        renderer.setRenderTarget(null);
        ziel.dispose();
      }
      return { map, size, pixels };
    },
    dispose() { material.dispose(); flaeche.geometry.dispose(); renderer.dispose(); },
  };
}

/** All maps (or some) of a surface at one size. */
export async function bakeSurface(m: MadeSurface, size = 1024, maps: MapName[] = MAPS): Promise<BakedMap[]> {
  const baker = await createBaker();
  try {
    const out: BakedMap[] = [];
    for (const map of maps) out.push(await baker.bake(m, map, size));
    return out;
  } finally { baker.dispose(); }
}

/** A baked map in a canvas (for a texture or a PNG). */
export function toCanvas(b: BakedMap): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = b.size;
  c.getContext("2d")!.putImageData(new ImageData(b.pixels, b.size, b.size), 0, 0);
  return c;
}

/** A baked map as a PNG file. */
export const toPNG = (b: BakedMap): Promise<Blob> =>
  new Promise((ok, fehler) => toCanvas(b).toBlob((blob) => (blob ? ok(blob) : fehler(new Error("PNG encoding failed"))), "image/png"));

/** Baked maps as textures for a MeshStandardMaterial (map, normalMap, roughnessMap, metalnessMap). */
export function toTextures(maps: BakedMap[]): BakedTextures {
  const out: BakedTextures = {};
  for (const b of maps) {
    const t = new CanvasTexture(toCanvas(b));
    t.colorSpace = b.map === "color" ? SRGBColorSpace : LinearSRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    out[b.map] = t;
  }
  return out;
}

/**
 * A plain MeshStandardMaterial with baked maps: cheap to render, for scenes with many or large surfaces (the live TSL
 * material computes the whole surface for every pixel, every frame). `repeat` as for surfaceMaterial().
 */
export async function bakedMaterial(m: MadeSurface, size = 1024, repeat: number | readonly [number, number] = 1, baker?: Baker): Promise<MeshStandardMaterial> {
  const eigener = baker ?? (await createBaker()), maps: BakedMap[] = [];
  try { for (const map of ["color", "normal", "roughness", "metalness"] as const) maps.push(await eigener.bake(m, map, size)); }
  finally { if (!baker) eigener.dispose(); }
  const t = toTextures(maps), [ru, rv] = typeof repeat === "number" ? [repeat, repeat] : repeat;
  for (const x of Object.values(t)) x.repeat.set(ru, rv);
  return new MeshStandardMaterial({ map: t.color, normalMap: t.normal, roughnessMap: t.roughness, metalnessMap: t.metalness, roughness: 1, metalness: 1 });
}

/** The PNG files of a surface in one .zip: <id>_<map>.png, one map after the other (an 8192 map is 256 MB in memory). */
export async function toZip(m: MadeSurface, size: number, maps: MapName[] = MAPS, fortschritt?: (map: MapName) => void, baker?: Baker): Promise<Uint8Array<ArrayBuffer>> {
  const eigener = baker ?? (await createBaker()), dateien: Record<string, Uint8Array> = {};
  try {
    for (const map of maps) {
      fortschritt?.(map);
      const png = await toPNG(await eigener.bake(m, map, size));
      dateien[`${m.surface.id}_${map}.png`] = new Uint8Array(await png.arrayBuffer());
    }
  } finally { if (!baker) eigener.dispose(); }
  return zipSync(dateien, { level: 0 }) as Uint8Array<ArrayBuffer>;
}
