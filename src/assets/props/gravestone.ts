import { Box3, BufferGeometry, ExtrudeGeometry, Path, Shape, Vector3 } from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

export const gravestone = defineAsset({
  id: "gravestone", category: "props",
  title: { de: "Grabstein", en: "Gravestone" },
  description: { de: "Ein Grabstein aus Stein: Platte mit rundem Kopf und Tafel, Kreuz oder Obelisk, auf Wunsch auf einem Sockel und leicht nach hinten geneigt.", en: "A stone grave marker: a slab with a rounded top and a plaque, a cross or an obelisk, optionally on a plinth and leaning back a little." },
  params: {
    shape: { type: "choice", label: { de: "Form", en: "Shape" }, options: ["slab", "cross", "obelisk"], labels: { slab: { de: "Platte", en: "Slab" }, cross: { de: "Kreuz", en: "Cross" }, obelisk: { de: "Obelisk", en: "Obelisk" } }, default: "slab",
      describe: { de: "Form des Steins: Platte mit rundem Kopf, lateinisches Kreuz oder Obelisk mit Spitze.", en: "Shape of the stone: slab with a rounded top, Latin cross or obelisk with a pointed top." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.5, max: 1.6, step: 0.05, default: 0.9, unit: "m",
      describe: { de: "Höhe über dem Boden oder Sockel: 0,6 m ein einfacher Stein, 0,9 m eine Platte, 1,5 m ein Obelisk.", en: "Height above the ground or plinth: 0.6 m a simple stone, 0.9 m a slab, 1.5 m an obelisk." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.3, max: 0.8, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Breite des Steins; beim Kreuz die Armspannweite, beim Obelisken die untere Seite: 0,4 m schlicht, 0,5 m Platte, 0,8 m breites Kreuz.", en: "Width of the stone; the arm span of a cross, the bottom side of an obelisk: 0.4 m simple, 0.5 m slab, 0.8 m wide cross." } },
    thickness: { type: "number", label: { de: "Dicke", en: "Thickness" }, min: 0.06, max: 0.2, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Dicke von vorn nach hinten: 0,08 m dünne Platte, 0,12 m üblich, 0,2 m massiv. Der Obelisk ist quadratisch und ignoriert das.", en: "Thickness front to back: 0.08 m a thin slab, 0.12 m usual, 0.2 m massive. The obelisk is square and ignores it." } },
    plinth: { type: "boolean", label: { de: "Sockel", en: "Plinth" }, default: true,
      describe: { de: "Ein Steinblock von 0,12 m Höhe unter dem Stein; aus steht der Stein direkt im Boden.", en: "A stone block 0.12 m high under the marker; off, the marker stands directly in the ground." } },
    tilt: { type: "number", label: { de: "Neigung", en: "Tilt" }, min: 0, max: 12, step: 0.5, default: 0, unit: "°",
      describe: { de: "Neigung nach hinten (Kopf Richtung −z): 0° gerade, 6° ein alter Stein, 12° fast gekippt.", en: "Lean backwards (top towards −z): 0° upright, 6° an old stone, 12° nearly toppled." } },
    moss: { type: "number", label: { de: "Moos", en: "Moss" }, min: 0, max: 1, step: 0.05, default: 0.3,
      describe: { de: "Moos und Flechten auf Oberkante und Schultern des Steins: 0 sauber, 0,3 ein Stein im Schatten, 0,8 dicht bewachsen.", en: "Moss and lichen on the top and shoulders of the stone: 0 clean, 0.3 a stone in the shade, 0.8 thickly overgrown." } },
    colour: { type: "color", label: { de: "Steinfarbe", en: "Stone colour" }, default: "#8a8a84",
      describe: { de: "Farbe des Steins und des Sockels.", en: "Colour of the stone and the plinth." } },
    plaqueColour: { type: "color", label: { de: "Tafelfarbe", en: "Plaque colour" }, default: "#6e6e68",
      describe: { de: "Farbe der Tafel auf der Platte.", en: "Colour of the plaque on the slab." } },
  },
  presets: {
    "old-slab": { label: { de: "Alte Platte", en: "Old slab" }, values: { tilt: 6 } },
    cross: { label: { de: "Kreuz", en: "Cross" }, values: { shape: "cross", height: 1.1, width: 0.6 } },
    obelisk: { label: { de: "Obelisk", en: "Obelisk" }, values: { shape: "obelisk", height: 1.5, width: 0.35 } },
    simple: { label: { de: "Schlicht", en: "Simple" }, values: { plinth: false, height: 0.6, width: 0.4 } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 4000, drawCalls: 3 },
  build(p, seed) {
    const stein = material("stone", p.colour, 1, undefined, { moss: p.moss }), tafel = material("stone", p.plaqueColour), sockel = material("stone", p.colour), t = new Parts();
    const { height: h, width: w, thickness: d } = p, obelisk = p.shape === "obelisk";
    const y0 = p.plinth ? 0.12 : 0;
    // The plinth is its own block of two steps (no moss): a wide foot and a narrower top, edges eased by 4 mm
    if (p.plinth) {
      const pw = 1.3 * w, pd = obelisk ? 1.3 * w : 2.5 * d;
      t.add(sockel, rounded(pw * 1.08, 0.07, pd * 1.08, 0.004, 0, 0.035, 0, 3));
      t.add(sockel, rounded(pw, 0.055, pd, 0.004, 0, 0.0925, 0, 3));
    }
    // The marker around its own base centre at y = 0
    const body: BufferGeometry[] = [], plaque: BufferGeometry[] = [];
    // An extruded outline with eased edges from z0 to z1 (the bevel b lies inside that range)
    const slab = (s: Shape, z0: number, z1: number, b: number) => {
      const g = new ExtrudeGeometry(s, { depth: z1 - z0 - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 3, curveSegments: 24 });
      return toCreasedNormals(g.translate(0, 0, z0 + b), (40 * Math.PI) / 180);
    };
    const b = Math.min(0.006, d / 8);
    if (p.shape === "slab") {
      const hs = h - w / 2;
      const outline = (r: number) => {
        const s = new Shape();
        s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, hs); s.absarc(0, hs, r, 0, Math.PI, false); s.lineTo(-r, 0);
        return s;
      };
      // Body ends 5 mm behind the front face; the front frame (1.5 mm smaller, so the edge reads as worn) has the plaque field cut out
      const rec = 0.005, fz = 0.014;
      body.push(slab(outline(w / 2), -d / 2, d / 2 - rec, b));
      const frame = outline(w / 2 - 0.0015);
      const pw = 0.6 * w, ph = 0.35 * h, py = 0.55 * h;
      const hole = new Path();
      hole.moveTo(-pw / 2, py - ph / 2); hole.lineTo(-pw / 2, py + ph / 2); hole.lineTo(pw / 2, py + ph / 2); hole.lineTo(pw / 2, py - ph / 2); hole.lineTo(-pw / 2, py - ph / 2);
      frame.holes.push(hole);
      body.push(slab(frame, d / 2 - fz, d / 2, 0.003));
      plaque.push(rounded(pw - 0.004, ph - 0.004, 0.002, 0.0008, 0, py, d / 2 - rec + 0.0005, 1));
    } else if (p.shape === "cross") {
      const a = 0.15 * w, ay = 0.7 * h;
      const s = new Shape();
      const pts: [number, number][] = [[-a, 0], [a, 0], [a, ay - a], [w / 2, ay - a], [w / 2, ay + a], [a, ay + a], [a, h], [-a, h], [-a, ay + a], [-w / 2, ay + a], [-w / 2, ay - a], [-a, ay - a]];
      pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
      body.push(slab(s, -d / 2, d / 2, b));
    } else {
      // Shaft and tip from a rounded square (superellipse) section: the corners are eased, the tip is blunt
      const top = h * 0.88, n = 10, half = w / 2;
      const section = (y: number) => (y <= top ? half * (1 - 0.4 * (y / top)) : Math.max(0.006, 0.6 * half * (1 - (y - top) / (h - top))));
      const at = (u: number, y: number) => {
        const a = u * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a);
        const r = section(y) / Math.pow(Math.abs(c) ** n + Math.abs(s) ** n, 1 / n);
        return new Vector3(r * c, y, r * s);
      };
      const raus = (q: Vector3) => new Vector3(q.x, 0, q.z);
      const eased = (ya: number, yb: number) => grid(64, 1, (u, v) => at(u, ya + (yb - ya) * v), raus);
      body.push(eased(0, top), eased(top, h));
      body.push(grid(64, 1, (u, v) => at(u, 0).multiplyScalar(v).setY(0), () => new Vector3(0, -1, 0)));
    }
    const lean = ((rng(seed)() * 2 - 1) * 2 * Math.PI) / 180, tilt = (-p.tilt * Math.PI) / 180;
    const all = [...body, ...plaque];
    const bounds = new Box3();
    for (const g of all) { g.rotateX(tilt).rotateZ(lean); g.computeBoundingBox(); bounds.union(g.boundingBox!); }
    const dy = y0 - bounds.min.y;
    for (const g of all) g.translate(0, dy, 0);
    for (const g of body) t.add(stein, g);
    for (const g of plaque) t.add(tafel, g);
    return t.group();
  },
});
