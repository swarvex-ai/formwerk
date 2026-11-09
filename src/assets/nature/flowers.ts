import { BufferGeometry, CircleGeometry, CylinderGeometry, Float32BufferAttribute, type Material } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// A strip of grass or a leaf: four corners, duplicated for the back face (formwerk materials render front faces
// only, so a one-sided quad vanishes from half the viewpoints). Eight vertices give each side its own normal.
function blade(t: Parts, m: Material, x: number, z: number, h: number, w: number, yaw: number, lean: number) {
  const c = Math.cos(yaw), s = Math.sin(yaw), px = -s, pz = c;
  const tx = x + c * lean * h, tz = z + s * lean * h, wt = w * 0.25;
  const ecken = [
    [x - px * w, 0, z - pz * w],
    [x + px * w, 0, z + pz * w],
    [tx + px * wt, h, tz + pz * wt],
    [tx - px * wt, h, tz - pz * wt],
  ];
  const pos: number[] = [], uv: number[] = [0, 0, 1, 0, 1, 1, 0, 1];
  for (const q of ecken) pos.push(q[0], q[1], q[2]);
  for (const q of ecken) pos.push(q[0], q[1], q[2]);
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute([...uv, ...uv], 2));
  g.setIndex([0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7]);
  g.computeVertexNormals();
  t.add(m, g);
}

// A petal as a small quad in the flower plane, cupped a little: the outer edge rises, so the face turns up and
// outward and shows from above. Petals stay one-sided like the top of a real blossom.
function petal(t: Parts, m: Material, cx: number, cy: number, cz: number, angle: number, len: number, half: number, lift: number) {
  const c = Math.cos(angle), s = Math.sin(angle), px = -s, pz = c, fn = half * 0.35;
  const fx = cx + c * len, fz = cz + s * len, fy = cy + lift;
  const ecken = [
    [cx - px * fn, cy, cz - pz * fn],
    [cx + px * fn, cy, cz + pz * fn],
    [fx + px * half, fy, fz + pz * half],
    [fx - px * half, fy, fz - pz * half],
  ];
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(ecken.flat(), 3));
  g.setAttribute("uv", new Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  t.add(m, g);
}

export const flowers = defineAsset({
  id: "flowers", category: "nature",
  title: { de: "Blumenwiese", en: "Flower patch" },
  description: { de: "Ein Büschel Gräser mit Blüten, im Kreis gestreut; Anzahl, Wuchs und Seed machen aus jedem Aufruf eine andere Wiese.", en: "A tuft of grass with blossoms scattered in a circle; count, growth and seed make every call a different patch." },
  params: {
    count: { type: "integer", label: { de: "Blüten", en: "Flowers" }, min: 3, max: 40, default: 14,
      describe: { de: "Zahl der Blüten: 3 ein Büschel, 14 ein kleiner Fleck, 40 eine dichte Wiese.", en: "Number of flowers: 3 a tuft, 14 a small patch, 40 a dense meadow." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.1, max: 1, step: 0.01, default: 0.35, unit: "m",
      describe: { de: "Streuradius: 0,1 m ein Handbüschel, 0,35 m ein Blumenfleck, 1 m ein Beet.", en: "Scatter radius: 0.1 m a handful, 0.35 m a flower patch, 1 m a bed." } },
    stemHeight: { type: "number", label: { de: "Stängelhöhe", en: "Stem height" }, min: 0.04, max: 0.9, step: 0.01, default: 0.22, unit: "m",
      describe: { de: "Höhe der Stängel: 0,05 m bodennah, 0,2 m rasenhoch, 0,8 m hoch wie eine Wiese vor der Mahd.", en: "Stem height: 0.05 m low, 0.2 m lawn height, 0.8 m tall like a meadow before mowing." } },
    blossom: { type: "number", label: { de: "Blütengröße", en: "Blossom size" }, min: 0.01, max: 0.12, step: 0.005, default: 0.04, unit: "m",
      describe: { de: "Durchmesser der Blüte: 0,015 m ein Gänseblümchen, 0,04 m eine Margerite, 0,1 m eine große Blüte.", en: "Blossom diameter: 0.015 m a daisy, 0.04 m an oxeye, 0.1 m a large bloom." } },
    petals: { type: "integer", label: { de: "Blütenblätter", en: "Petals" }, min: 4, max: 8, default: 6,
      describe: { de: "Zahl der Blütenblätter: 4 wie eine Tulpe, 6 üblich, 8 wie ein Gänseblümchen.", en: "Number of petals: 4 like a tulip, 6 usual, 8 like a daisy." } },
    color: { type: "color", label: { de: "Blütenfarbe", en: "Blossom colour" }, default: "#f4f1e8",
      describe: { de: "Farbe der Blüten: Weiß #f4f1e8, Gelb #f0c419, Rot #d8415a, Violett #8a6ad0.", en: "Blossom colour: white #f4f1e8, yellow #f0c419, red #d8415a, violet #8a6ad0." } },
  },
  presets: {
    daisies: { label: { de: "Gänseblümchen", en: "Daisies" }, values: { count: 16, radius: 0.4, stemHeight: 0.15, blossom: 0.03, petals: 8, color: "#f4f1e8" } },
    tulips: { label: { de: "Tulpen", en: "Tulips" }, values: { count: 9, radius: 0.28, stemHeight: 0.34, blossom: 0.05, petals: 4, color: "#d8415a" } },
    meadow: { label: { de: "Blumenwiese", en: "Wildflower meadow" }, values: { count: 38, radius: 0.95, stemHeight: 0.3, blossom: 0.03, petals: 5, color: "#f0c419" } },
  },
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 6000, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed), gras = material("leaf", "#4a8a3e", 1, 200), bluete = material("paint", p.color), t = new Parts();
    const R = p.radius, H = p.stemHeight, B = p.blossom;
    // A flat turf disc holds the tuft together and gives the mass estimate something solid
    t.add(gras, new CylinderGeometry(R * 0.92, R, 0.02, 12).translate(0, 0.01, 0));
    const streuen = () => { const a = r() * Math.PI * 2, d = R * Math.sqrt(r()); return [Math.cos(a) * d, Math.sin(a) * d] as const; };
    for (let i = 0; i < p.count; i++) {
      const [x, z] = streuen(), h = H * (0.8 + 0.4 * r()), yaw = r() * Math.PI * 2;
      // Stem and two leaves: the blades now show from both sides
      blade(t, gras, x, z, h, 0.004, yaw, 0.1 + 0.2 * r());
      for (let k = 0; k < 2; k++) blade(t, gras, x, z, h * (0.35 + 0.25 * r()), 0.008, r() * Math.PI * 2, 0.35 + 0.35 * r());
      // Blossom: petals around a small centre, at the top of the stem
      const y = h, len = B * 0.5, half = B * 0.24;
      for (let k = 0; k < p.petals; k++) petal(t, bluete, x, y, z, (k / p.petals) * Math.PI * 2 + r() * 0.15, len * (0.85 + 0.3 * r()), half, B * 0.16);
      t.add(bluete, new CircleGeometry(B * 0.2, 6).rotateX(-Math.PI / 2).translate(x, y + 0.002, z));
      // Grass blades around the flower
      for (let k = 0; k < 2; k++) {
        const [gx, gz] = streuen();
        blade(t, gras, gx, gz, H * (0.5 + 0.6 * r()), 0.006 + 0.006 * r(), r() * Math.PI * 2, 0.15 + 0.5 * r());
      }
    }
    t.cylinder(R * 0.92, H * 1.2 + B);
    return t.group();
  },
});
