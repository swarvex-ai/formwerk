// Catalogue facts for the model list: the size of an asset's own source file and what it is at its defaults
// (triangles, draw calls, material kinds, colours). Built once per asset and cached; nothing is rendered here.
import type { Material, Mesh } from "three";
import { make, measure, type AnyAsset } from "../assets/define";
import { defaults } from "../core/params";
import { exportInfo, type MaterialKind } from "../materials";
import { zahl } from "./shell";

export type Colour = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "brown" | "black" | "white" | "grey";
export type Fakten = { triangles: number; drawCalls: number; materials: MaterialKind[]; colours: Colour[] };

// Lazy raw sources of the asset files (one chunk per file, loaded on demand); the keys are the paths, the file name is the id.
const quellTexte = import.meta.glob("../assets/*/*.ts", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;
const nachId: Record<string, () => Promise<string>> = {};
for (const [pfad, laden] of Object.entries(quellTexte)) nachId[pfad.slice(pfad.lastIndexOf("/") + 1, pfad.length - 3)] = laden;
const byteCache = new Map<string, Promise<number>>();

/** UTF-8 bytes of the asset's own source file src/assets/<category>/<id>.ts (not the shared core). */
export function codeBytes(id: string): Promise<number> {
  let p = byteCache.get(id);
  if (!p) {
    const laden = nachId[id];
    p = laden ? laden().then((src) => new TextEncoder().encode(src).length) : Promise.resolve(0);
    byteCache.set(id, p);
  }
  return p;
}

/** "4.2 KB" (1 KB = 1024 bytes, one decimal, localised number). */
export function kb(bytes: number): string {
  return `${zahl(bytes / 1024, 1)} KB`;
}

/** The colour family of a hex colour by its HSL values; the first rule that matches decides. */
export function colourOf(hex: string): Colour {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    h = max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
  }
  if (l < 0.18) return "black";
  if (l > 0.85 && s < 0.15) return "white";
  if (s < 0.15) return "grey";
  if (h >= 15 && h < 45 && l < 0.45) return "brown";
  if (h < 15 || h >= 345) return "red";
  if (h < 40) return "orange";
  if (h < 65) return "yellow";
  if (h < 170) return "green";
  if (h < 260) return "blue";
  return "purple";
}

const cache = new Map<string, Fakten>();

/** Built once at defaults (seed 1), measured, then geometries and materials disposed; cached per id. */
export function factsAtDefaults(a: AnyAsset): Fakten {
  const bekannt = cache.get(a.id);
  if (bekannt) return bekannt;
  const objekt = make(a, defaults(a.params), 1);
  const m = measure(objekt);
  const materials: MaterialKind[] = [], farben: Colour[] = [];
  objekt.traverse((x) => {
    const mesh = x as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    for (const mat of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Material[]) {
      mat.dispose();
      const e = exportInfo(mat);
      if (!e) continue;
      if (!materials.includes(e.kind)) materials.push(e.kind);
      const farbe = colourOf(e.color);
      if (!farben.includes(farbe)) farben.push(farbe);
    }
  });
  const f: Fakten = { triangles: m.triangles, drawCalls: m.drawCalls, materials, colours: farben };
  cache.set(a.id, f);
  return f;
}
