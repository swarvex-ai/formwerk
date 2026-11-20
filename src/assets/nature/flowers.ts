import { BufferGeometry, Float32BufferAttribute, Vector3, type Material } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, turned } from "../shapes";

const SEGMENTE = 6;

// A grass blade or a leaf, folded along its midrib like a shallow V, that leans out, droops towards the tip and ends
// in a point. Both faces are built (formwerk materials render front faces only); each face has its own vertices.
function blade(t: Parts, m: Material, x: number, z: number, len: number, w: number, yaw: number, lean: number, droop: number) {
  const dx = Math.cos(yaw), dz = Math.sin(yaw), ds = len / SEGMENTE;
  const pos: number[] = [], uv: number[] = [];
  let cx = x, cy = 0, cz = z;
  for (let i = 0; i <= SEGMENTE; i++) {
    const s = i / SEGMENTE, half = i === SEGMENTE ? 0 : w * 0.5 * Math.pow(1 - s, 0.5);
    const q = yaw + Math.PI / 2 + 0.6 * s, px = Math.cos(q), pz = Math.sin(q);
    const a = lean + droop * s * s;
    const tx = dx * Math.sin(a), ty = Math.cos(a), tz = dz * Math.sin(a);
    // the fold: the midrib lies behind the edges, along the blade's normal (across × along)
    const nx = pz * ty, ny = px * tz - pz * tx, nz = -px * ty, kiel = half * 0.3;
    const y = Math.max(0.004, cy);
    pos.push(cx - px * half, y, cz - pz * half, cx - nx * kiel, Math.max(0.004, y - ny * kiel), cz - nz * kiel, cx + px * half, y, cz + pz * half);
    uv.push(0, s, 0.5, s, 1, s);
    cx += tx * ds; cz += tz * ds; cy += ty * ds;
  }
  const n = pos.length / 3, idx: number[] = [];
  for (let i = 0; i < SEGMENTE; i++) for (const k of [0, 1]) {
    const a = i * 3 + k, b = a + 1, c = a + 3, d = a + 4;
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

// A petal from the centre outwards: narrow at the base, widest past the middle, a rounded tip. It rises at `e0` and
// curls up by `curl` towards the tip; both faces are built, so it shows from below too.
function petal(t: Parts, m: Material, c: Vector3, angle: number, r0: number, len: number, w: number, e0: number, curl: number) {
  const ca = Math.cos(angle), sa = Math.sin(angle), px = -sa, pz = ca;
  const at = (u: number, v: number) => {
    // radial distance and height along the curled midline, summed in small steps
    let rho = r0, y = 0;
    for (let k = 0; k < 8; k++) { const e = e0 + curl * ((k + 0.5) / 8) * v; rho += Math.cos(e) * len * v / 8; y += Math.sin(e) * len * v / 8; }
    const half = w * Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * v)), 0.6) * (u * 2 - 1);
    // cupped across: the edges stand a little higher than the midrib
    const hoch = Math.abs(u * 2 - 1) * w * 0.25;
    return new Vector3(c.x + ca * rho + px * half, c.y + y + hoch, c.z + sa * rho + pz * half);
  };
  t.add(m, grid(2, 4, at, () => new Vector3(0, 1, 0)));
  t.add(m, grid(2, 4, at, () => new Vector3(0, -1, 0)));
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
  budget: { triangles: 40000, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed), t = new Parts(), R = p.radius, H = p.stemHeight, B = p.blossom;
    // Grass, stems and turf in one plain leaf green like the tree's leaves; the petals in the blossom colour, the
    // centre golden (brown in a yellow blossom)
    const gras = material("leaf", "#4a8a3e", 1, 200, { plain: true }), bluete = material("paint", p.color);
    const farbe = (() => { const h = parseInt(p.color.slice(1), 16), rr = h >> 16, gg = (h >> 8) & 255, bb = h & 255; return rr > 150 && gg > 120 && bb < 110 && rr - bb > 90 ? "#6b4520" : "#e0a91e"; })();
    const mitte = material("paint", farbe);
    // The turf: a low uneven mound, closed underneath
    const rand = (u: number) => R * (1 + 0.06 * Math.sin(u * Math.PI * 6 + 1) + 0.04 * Math.sin(u * Math.PI * 14 + 2));
    const hm = Math.min(0.03, 0.012 + R * 0.03);
    t.add(gras, grid(24, 3, (u, v) => {
      const a = u * Math.PI * 2, d = rand(u) * Math.sin((v * Math.PI) / 2);
      return new Vector3(Math.cos(a) * d, v === 1 ? 0 : hm * Math.cos((v * Math.PI) / 2), Math.sin(a) * d);
    }, (q) => new Vector3(q.x, q.y + 0.05, q.z)));
    t.add(gras, grid(24, 1, (u, v) => new Vector3(Math.cos(u * Math.PI * 2) * rand(u) * v, 0, Math.sin(u * Math.PI * 2) * rand(u) * v), () => new Vector3(0, -1, 0)));
    const streuen = () => { const a = r() * Math.PI * 2, d = R * 0.9 * Math.sqrt(r()); return [Math.cos(a) * d, Math.sin(a) * d] as const; };
    // A tulip (four petals) closes into a cup; other blossoms open flat and curl up a little at the tips
    const tulpe = p.petals <= 4, e0 = tulpe ? 1.05 : 0.12, curl = tulpe ? 0.25 : 0.35;
    for (let i = 0; i < p.count; i++) {
      const [x, z] = streuen(), h = H * (0.8 + 0.4 * r()), yaw = r() * Math.PI * 2, bend = 0.08 + 0.1 * r();
      // The stem: a thin round tube that tapers and bends a little to one side
      const rs = Math.max(0.0015, Math.min(0.004, B * 0.06 + H * 0.004));
      const mid = (v: number) => new Vector3(x + Math.cos(yaw) * bend * h * v * v, v * h, z + Math.sin(yaw) * bend * h * v * v);
      t.add(gras, grid(5, 5, (u, v) => { const c = mid(v), a = u * Math.PI * 2, rr = rs * (1 - 0.35 * v); return new Vector3(c.x + Math.cos(a) * rr, c.y, c.z + Math.sin(a) * rr); }, (q) => { const c = mid(0.5); return new Vector3(q.x - c.x, 0, q.z - c.z); }));
      // Two leaves at the foot of the stem
      for (let k = 0; k < 2; k++) blade(t, gras, x, z, h * (0.35 + 0.25 * r()), tulpe ? 0.02 : 0.01, r() * Math.PI * 2, 0.3 + 0.3 * r(), 0.6 + 0.6 * r());
      // The blossom: petals around a domed centre at the top of the stem
      const top = mid(1), c = B * (tulpe ? 0.14 : 0.2), len = B * (tulpe ? 0.55 : 0.42), w = B * (tulpe ? 0.32 : 0.6 / p.petals + 0.04);
      for (let k = 0; k < p.petals; k++) petal(t, bluete, top, (k / p.petals) * Math.PI * 2 + r() * 0.15, c * 0.6, len * (0.9 + 0.2 * r()), w, e0, curl);
      // (inside a tulip's cup the centre stays within the petal bases)
      const cm = tulpe ? c * 0.6 : c;
      t.add(mitte, turned([[0, 0], [cm, 0], [cm * 0.92, cm * 0.35], [cm * 0.6, cm * 0.6], [0, cm * 0.68]], 10, top.x, top.y - (tulpe ? 0 : cm * 0.1), top.z));
      // Grass blades around the flower
      for (let k = 0; k < 3; k++) {
        const [gx, gz] = streuen();
        blade(t, gras, gx, gz, H * (0.5 + 0.6 * r()), 0.005 + 0.004 * r(), r() * Math.PI * 2, 0.1 + 0.4 * r(), 0.4 + 0.8 * r());
      }
    }
    t.cylinder(R * 0.92, H * 1.2 + B);
    return t.group();
  },
});
