import { BufferGeometry, CylinderGeometry, Float32BufferAttribute, Quaternion, Vector3, type Material } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

const SEGMENTE = 6;

// A long leaf blade as a strip of SEGMENTE pieces that leans out from the clump and droops towards the tip. The strip
// is duplicated with reversed winding (formwerk materials render front faces only, so a one-sided strip vanishes
// from half the viewpoints); the copy has its own vertices, so each side gets its own normal.
function blade(t: Parts, m: Material, x: number, z: number, len: number, w: number, yaw: number, lean: number, droop: number, twist: number) {
  const dx = Math.cos(yaw), dz = Math.sin(yaw), ds = len / SEGMENTE;
  const pos: number[] = [], uv: number[] = [];
  let cx = x, cy = 0, cz = z;
  for (let i = 0; i <= SEGMENTE; i++) {
    // the blade twists along its length, so from no side does it show only its edge
    const s = i / SEGMENTE, half = w * 0.5 * Math.max(0.08, Math.pow(1 - s, 0.6));
    const q = yaw + Math.PI / 2 + twist * (0.4 + s), px = Math.cos(q), pz = Math.sin(q);
    // clamp just above the floor: a blade drooping past the horizontal must not reach into the ground
    const y = Math.max(0.005, cy);
    pos.push(cx - px * half, y, cz - pz * half, cx + px * half, y, cz + pz * half);
    uv.push(0, s, 1, s);
    // the angle from vertical grows along the blade: lean at the base, droop towards the tip
    const a = lean + droop * s * s * 1.5;
    cx += dx * Math.sin(a) * ds; cz += dz * Math.sin(a) * ds; cy += Math.cos(a) * ds;
  }
  const n = pos.length / 3, idx: number[] = [];
  for (let i = 0; i < SEGMENTE; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, d, a, d, c);
    idx.push(n + a, n + d, n + b, n + a, n + c, n + d);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute([...pos, ...pos], 3));
  g.setAttribute("uv", new Float32BufferAttribute([...uv, ...uv], 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  t.add(m, g);
}

// A cylinder from one point along a direction (three.js cylinders stand on y and are centred).
function along(g: BufferGeometry, from: Vector3, dir: Vector3, len: number): BufferGeometry {
  g.translate(0, len / 2, 0);
  g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir));
  return g.translate(from.x, from.y, from.z);
}

export const reeds = defineAsset({
  id: "reeds", category: "nature",
  title: { de: "Schilf", en: "Reeds" },
  description: { de: "Ein Horst aus Schilf, Rohrkolben oder Seggen für Teich- und Flussufer: lange Halme, die sich nach außen neigen und an der Spitze überhängen, auf Wunsch mit braunen Kolben.", en: "A clump of reeds, cattails or sedge for pond and river banks: long blades that lean outward and droop at the tip, with brown cattail heads if you like." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.6, max: 2.5, step: 0.05, default: 1.5, unit: "m",
      describe: { de: "Höhe der Halme: 0,6 m eine Segge, 1,5 m ein Rohrkolben, 2,5 m hohes Schilfrohr.", en: "Height of the blades: 0.6 m a sedge, 1.5 m a cattail, 2.5 m tall common reed." } },
    stems: { type: "integer", label: { de: "Halme", en: "Blades" }, min: 5, max: 60, default: 22,
      describe: { de: "Zahl der Blätter und Halme: 6 ein lockerer Trieb, 22 ein Horst, 60 ein dichter Seggenbult.", en: "Number of leaves and blades: 6 a loose shoot, 22 a clump, 60 a dense sedge tussock." } },
    spread: { type: "number", label: { de: "Spreizung", en: "Spread" }, min: 0, max: 35, step: 1, default: 14, unit: "°",
      describe: { de: "Neigung der Halme nach außen: 0° kerzengerade, 14° ein üblicher Horst, 35° weit ausladend wie eine Segge.", en: "Outward lean of the blades: 0° bolt upright, 14° a usual clump, 35° fanned wide like a sedge." } },
    bend: { type: "number", label: { de: "Überhang", en: "Droop" }, min: 0, max: 1, step: 0.05, default: 0.35,
      describe: { de: "Wie weit die Spitzen überhängen: 0 steif wie Schilfrohr, 0,35 leicht gebogen, 1 bis zum Boden wie Seggengras.", en: "How far the tips droop: 0 stiff like common reed, 0.35 gently curved, 1 down to the ground like sedge grass." } },
    width: { type: "number", label: { de: "Blattbreite", en: "Blade width" }, min: 0.004, max: 0.03, step: 0.001, default: 0.018, unit: "m",
      describe: { de: "Breite der Blätter am Grund: 0,008 m Seggengras, 0,014 m Schilfrohr, 0,02 m Rohrkolben.", en: "Width of the leaves at the base: 0.008 m sedge, 0.014 m common reed, 0.02 m cattail." } },
    radius: { type: "number", label: { de: "Horstradius", en: "Clump radius" }, min: 0.05, max: 0.6, step: 0.01, default: 0.18, unit: "m",
      describe: { de: "Radius des Wurzelhorsts: 0,06 m ein einzelner Trieb, 0,18 m ein Horst, 0,5 m ein Schilfgürtel.", en: "Radius of the root clump: 0.06 m a single shoot, 0.18 m a clump, 0.5 m a stand of reeds." } },
    heads: { type: "integer", label: { de: "Kolben", en: "Heads" }, min: 0, max: 12, default: 5,
      describe: { de: "Zahl der Stängel mit braunem Kolben: 0 Schilf oder Segge, 5 ein Rohrkolbenhorst, 12 in voller Frucht.", en: "Number of stalks with a brown cattail head: 0 reed or sedge, 5 a cattail clump, 12 in full fruit." } },
    leafColor: { type: "color", label: { de: "Blätter", en: "Leaves" }, default: "#5d8a3c",
      describe: { de: "Farbe der Halme: Sommergrün #5d8a3c, Graugrün #7a9468, Herbstgelb #b8a25a.", en: "Colour of the blades: summer green #5d8a3c, grey-green #7a9468, autumn straw #b8a25a." } },
    headColor: { type: "color", label: { de: "Kolben und Wurzeln", en: "Heads and roots" }, default: "#6b4426",
      describe: { de: "Farbe der Kolben und des Wurzelhorsts: Dunkelbraun #6b4426, Rostbraun #7a4a28.", en: "Colour of the heads and the root clump: dark brown #6b4426, rust brown #7a4a28." } },
  },
  presets: {
    cattail: { label: { de: "Rohrkolben", en: "Cattail" }, values: { height: 1.6, stems: 20, spread: 12, bend: 0.4, width: 0.02, heads: 6 } },
    reed: { label: { de: "Schilfrohr", en: "Common reed" }, values: { height: 2.4, stems: 30, spread: 8, bend: 0.1, width: 0.014, radius: 0.24, heads: 0, leafColor: "#7a9468" } },
    sedge: { label: { de: "Segge", en: "Sedge" }, values: { height: 0.65, stems: 60, spread: 30, bend: 0.8, width: 0.008, radius: 0.12, heads: 0, leafColor: "#6f8f45" } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 4000, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed), blatt = material("leaf", p.leafColor, 1, 200), kolben = material("bark", p.headColor, 3, 300), t = new Parts();
    const H = p.height, R = p.radius, lean = (p.spread * Math.PI) / 180;
    // The root clump: a low mound of brown roots and old stems; it holds the blades together and gives the mass
    // estimate something solid
    t.add(kolben, new CylinderGeometry(R * 0.55, R * 0.8, 0.04, 10).translate(0, 0.02, 0));
    const fuss = () => { const a = r() * Math.PI * 2, d = R * 0.7 * Math.sqrt(r()); return [Math.cos(a) * d, Math.sin(a) * d, a] as const; };
    for (let i = 0; i < p.stems; i++) {
      // each blade leans away from the centre, a little scattered, so the clump opens like a fan
      const [x, z, a] = fuss(), yaw = a + (r() - 0.5) * 1.2;
      blade(t, blatt, x, z, H * (0.6 + 0.4 * r()), p.width * (0.7 + 0.6 * r()), yaw, lean * (0.3 + 0.9 * r()), p.bend * (0.6 + 0.8 * r()), (r() - 0.5) * 2);
    }
    // Cattail stalks stand stiff and nearly straight: a thin round stalk, the brown head below the top and a spike above
    for (let i = 0; i < p.heads; i++) {
      const [x, z, a] = fuss(), h = H * (0.85 + 0.2 * r()), th = lean * 0.4 * r();
      const dir = new Vector3(Math.cos(a) * Math.sin(th), Math.cos(th), Math.sin(a) * Math.sin(th));
      const kr = Math.max(0.01, Math.min(0.026, 0.016 * H)), kl = Math.min(0.3, 0.12 * H), unten = h * 0.86 - kl;
      const basis = new Vector3(x, 0, z), kopf = basis.clone().addScaledVector(dir, unten);
      t.add(blatt, along(new CylinderGeometry(kr * 0.25, kr * 0.4, h, 5, 1, true), basis, dir, h));
      t.add(kolben, along(new CylinderGeometry(kr * 0.85, kr, kl, 8), kopf, dir, kl));
    }
    return t.group();
  },
});
