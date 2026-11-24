import { Float32BufferAttribute, Vector3, type BufferGeometry } from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

/** A box with chamfered edges (44 triangles), centred at x, y, z: cheaper than `rounded` for the many slats and rails. */
function chamfered(w: number, h: number, d: number, c: number, x: number, y: number, z: number): BufferGeometry {
  const pts: Vector3[] = [], a = w / 2, b = h / 2, e = d / 2;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
    pts.push(new Vector3(sx * a, sy * (b - c), sz * (e - c)), new Vector3(sx * (a - c), sy * b, sz * (e - c)), new Vector3(sx * (a - c), sy * (b - c), sz * e));
  const g = new ConvexGeometry(pts).translate(x, y, z);
  g.setAttribute("uv", new Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  return g;
}

export const breadRack = defineAsset({
  id: "bread-rack", category: "furniture",
  title: { de: "Brotregal", en: "Bread rack" },
  description: { de: "Offenes Holzgestell eines Bäckers mit Lattenböden, auf denen Brote von unten auskühlen.", en: "A baker's open wooden rack with slatted shelves on which loaves cool from below." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.6, max: 1.6, step: 0.01, default: 1.0, unit: "m",
      describe: { de: "Außenbreite entlang x: 1,0 m in der Backstube, 1,4 m für ein großes Ladenregal.", en: "Outer width along x: 1.0 m in a bakehouse, 1.4 m for a large shop rack." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.9, max: 2.0, step: 0.01, default: 1.6, unit: "m",
      describe: { de: "Höhe der Pfosten: 0,9 m unter einer Theke, 1,6 m frei stehend, 2,0 m bis unter die Decke.", en: "Height of the posts: 0.9 m under a counter, 1.6 m free-standing, 2.0 m up to the ceiling." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.3, max: 0.6, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Außentiefe entlang z: 0,3 m für Baguettes, 0,45 m für Laibe, 0,6 m für Backbleche.", en: "Outer depth along z: 0.3 m for baguettes, 0.45 m for loaves, 0.6 m for baking trays." } },
    shelves: { type: "integer", label: { de: "Böden", en: "Shelves" }, min: 3, max: 8, default: 5,
      describe: { de: "Anzahl der Lattenböden, gleichmäßig von 0,15 m über dem Boden bis 0,1 m unter den Pfostenköpfen; 5 bei 1,6 m Höhe.", en: "Number of slatted shelves, spaced evenly from 0.15 m above the floor to 0.1 m below the post tops; 5 at 1.6 m height." } },
    slats: { type: "integer", label: { de: "Latten", en: "Slats" }, min: 3, max: 8, default: 5,
      describe: { de: "Latten je Boden, gleichmäßig über die Tiefe verteilt; 5 bei 0,45 m Tiefe, mehr für kleine Brötchen.", en: "Slats per shelf, spaced evenly across the depth; 5 at 0.45 m depth, more for small rolls." } },
  },
  presets: {
    bakery: { label: { de: "Backstube", en: "Bakery" }, values: { shelves: 5 } },
    tall: { label: { de: "Hohes Regal", en: "Tall rack" }, values: { height: 2.0, shelves: 8, width: 1.4 } },
    counter: { label: { de: "Thekenregal", en: "Counter rack" }, values: { height: 0.9, shelves: 3, width: 1.2, depth: 0.5 } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 8000, drawCalls: 1 },
  build(p) {
    const holz = material("wood", "#b08a5a", 1, undefined, { grain: "part" });
    const t = new Parts();
    const w = p.width, h = p.height, d = p.depth, pf = 0.045, fase = 0.003;
    const px = w / 2 - pf / 2, pz = d / 2 - pf / 2;
    // Four posts at the corners, fibres upright
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(holz, grained(rounded(pf, h, pf, 0.006, sx * px, h / 2, sz * pz), "y"));
    // Top rails along x at the back and the front, between the post tops
    for (const sz of [-1, 1]) t.add(holz, grained(chamfered(w - 2 * pf, 0.04, 0.03, fase, 0, h - 0.02, sz * pz), "x"));
    // Shelves from 0.15 m above the floor to 0.1 m below the top; at least 0.065 m apart, fewer if the rack is too low
    const span = h - 0.25, n = Math.max(2, Math.min(p.shelves, Math.floor(span / 0.065) + 1));
    // Slats within the depth between the posts, narrowed so at least 1 cm stays between them
    const innen = d - 2 * pf - 0.004, k = p.slats, sb = Math.min(0.06, (innen - (k - 1) * 0.01) / k);
    for (let i = 0; i < n; i++) {
      const y = 0.15 + (i * span) / (n - 1);
      // Side rails along z between the posts, their top at the shelf height
      for (const sx of [-1, 1]) t.add(holz, grained(chamfered(0.02, 0.04, d - 2 * pf, fase, sx * px, y - 0.02, 0), "z"));
      // Slats along x lying on the rails, flush with the posts' outer faces
      for (let j = 0; j < k; j++) t.add(holz, grained(chamfered(w, 0.015, sb, fase, 0, y + 0.0075, -innen / 2 + sb / 2 + (j * (innen - sb)) / (k - 1)), "x"));
    }
    return t.group();
  },
});
