// Test mode for a surface (?test&surface=<id>[&values=<json>]): one tile on a plane, live (TSL) at its defaults, seed 1, WebGL 2 through
// SwiftShader. The scene test bakes its maps, checks that they tile and are deterministic, compares them with the
// reference image, and renders the plane again with the baked PNG maps: it has to look like the live material.
import { Mesh, MeshStandardMaterial, PlaneGeometry, type Material } from "three";
import { PMREMGenerator } from "three/webgpu";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { bakeSurface, createBaker, toCanvas, toTextures, type BakedMap } from "../surfaces/bake";
import { LIVE_RESOLUTION, makeSurface, MAPS, surfaceMaterial, type MadeSurface, type MapName } from "../surfaces/define";
import { SURFACES, surfaceById } from "../surfaces";
import { ENVIRONMENT } from "./stage";
import { createViewer } from "./viewer";

export type MapStats = { map: MapName; mean: number; min: number; max: number };

declare global {
  interface Window {
    __surface?: {
      maps(size: number): Promise<{ stats: MapStats[]; image: string; ms: number }>;
      deterministic(): Promise<boolean>;
      tiles(size: number): Promise<Record<MapName, number>>;
      baked(): Promise<{ ms: number }>;
      shader(): Promise<{ vertex: string; fragment: string }>;
    };
  }
}

const hell = (b: BakedMap, i: number) => (b.pixels[i] * 0.2126 + b.pixels[i + 1] * 0.7152 + b.pixels[i + 2] * 0.0722) / 255;

function statistik(b: BakedMap): MapStats {
  let sum = 0, lo = 1, hi = 0;
  for (let i = 0; i < b.pixels.length; i += 4) { const v = hell(b, i); sum += v; lo = Math.min(lo, v); hi = Math.max(hi, v); }
  return { map: b.map, mean: sum / (b.size * b.size), min: lo, max: hi };
}

/**
 * Share of pixels (0 to 1) where the map baked half a tile further on differs from the map rolled by half: a surface
 * that tiles repeats after exactly one tile, so both are the same picture up to rounding.
 */
async function kachelFehler(made: MadeSurface, map: MapName, size: number): Promise<number> {
  const baker = await createBaker();
  try {
    const a = await baker.bake(made, map, size), b = await baker.bake(made, map, size, [0.5, 0.5]), h = size / 2;
    let falsch = 0;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4, j = (((y + h) % size) * size + ((x + h) % size)) * 4;
      if (Math.max(Math.abs(a.pixels[i] - b.pixels[j]), Math.abs(a.pixels[i + 1] - b.pixels[j + 1]), Math.abs(a.pixels[i + 2] - b.pixels[j + 2])) > 8) falsch++;
    }
    return falsch / (size * size);
  } finally { baker.dispose(); }
}

export async function startSurfaceTest(params: URLSearchParams) {
  document.body.classList.add("test");
  const canvas = document.querySelector("canvas")!;
  const viewer = await createViewer(canvas, { forceWebGL: !params.has("webgpu"), antialias: false, background: "#16191d" });
  viewer.resize(canvas.clientWidth, canvas.clientHeight);
  viewer.setLook("plain");
  viewer.scene.environment = new PMREMGenerator(viewer.renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  viewer.scene.environmentIntensity = ENVIRONMENT;
  const surface = surfaceById(params.get("surface") ?? "") ?? SURFACES[0];
  // Values as JSON (?test&surface=cobblestone&values={"stones":6}) for checking one setting; the scene tests use defaults
  const made = makeSurface(surface, JSON.parse(params.get("values") ?? "{}"));
  const flaeche = new Mesh<PlaneGeometry, Material>(new PlaneGeometry(1, 1), surfaceMaterial(made));
  viewer.show(flaeche);
  viewer.frame();

  window.__surface = {
    maps: async (size) => {
      const start = performance.now();
      const maps = await bakeSurface(made, size, ["color", "normal", "roughness", "metalness", "height"]);
      const ms = Math.round(performance.now() - start);
      // Reference image: colour and normal on top, roughness and height below
      const bild = document.createElement("canvas");
      bild.width = bild.height = size * 2;
      const g = bild.getContext("2d")!;
      const zeichne = (name: MapName, x: number, y: number) => g.drawImage(toCanvas(maps.find((m) => m.map === name)!), x, y);
      zeichne("color", 0, 0); zeichne("normal", size, 0); zeichne("roughness", 0, size); zeichne("height", size, size);
      return { stats: maps.map(statistik), image: bild.toDataURL("image/png"), ms };
    },
    deterministic: async () => {
      const [a] = await bakeSurface(made, 128, ["color"]), [b] = await bakeSurface(made, 128, ["color"]);
      return a.pixels.every((v, i) => v === b.pixels[i]);
    },
    tiles: async (size) => {
      const out = {} as Record<MapName, number>;
      for (const map of MAPS) out[map] = await kachelFehler(made, map, size);
      return out;
    },
    shader: async () => {
      const s = await viewer.renderer.debug.getShaderAsync(viewer.scene, viewer.camera, flaeche);
      return { vertex: s.vertexShader ?? "", fragment: s.fragmentShader ?? "" };
    },
    baked: async () => {
      const start = performance.now();
      const t = toTextures(await bakeSurface(made, LIVE_RESOLUTION, ["color", "normal", "roughness", "metalness"]));
      flaeche.material = new MeshStandardMaterial({ map: t.color, normalMap: t.normal, roughnessMap: t.roughness, metalnessMap: t.metalness, roughness: 1, metalness: 1 });
      return { ms: Math.round(performance.now() - start) };
    },
  };
  window.__swarvex = { step: () => viewer.render(), tick: () => 0 };
  document.body.dataset.ready = "1";
}
