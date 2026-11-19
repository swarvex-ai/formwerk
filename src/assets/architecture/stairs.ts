import { CapsuleGeometry, ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

export const stairs = defineAsset({
  id: "stairs", category: "architecture",
  title: { de: "Treppe", en: "Stairs" },
  description: { de: "Gerade Treppe, massiv oder offen, mit Geländer links, rechts oder beidseitig. Sie steigt nach hinten (−z) an.", en: "A straight staircase, solid or open, with a railing on the left, right or both sides. It rises towards the back (−z)." },
  params: {
    steps: { type: "integer", label: { de: "Stufen", en: "Steps" }, min: 2, max: 24, default: 12,
      describe: { de: "Anzahl der Stufen; die Gesamthöhe ist Stufen × Stufenhöhe.", en: "Number of steps; the total height is steps × rise." } },
    rise: { type: "number", label: { de: "Stufenhöhe", en: "Rise" }, min: 0.12, max: 0.22, step: 0.005, default: 0.17, unit: "m",
      describe: { de: "Höhe einer Stufe: 0,17 m ist bequem, steile Kellertreppen haben 0,2 m.", en: "Height of one step: 0.17 m is comfortable, steep cellar stairs have 0.2 m." } },
    tread: { type: "number", label: { de: "Auftritt", en: "Tread" }, min: 0.2, max: 0.4, step: 0.005, default: 0.28, unit: "m",
      describe: { de: "Tiefe einer Stufe; Faustregel: 2 × Stufenhöhe + Auftritt ≈ 0,63 m.", en: "Depth of one step; rule of thumb: 2 × rise + tread ≈ 0.63 m." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.6, max: 3, step: 0.05, default: 1, unit: "m",
      describe: { de: "Laufbreite der Treppe.", en: "Width of the flight." } },
    style: { type: "choice", label: { de: "Bauart", en: "Style" }, options: ["solid", "open"], labels: { solid: { de: "massiv", en: "solid" }, open: { de: "offen mit Wangen", en: "open with stringers" } }, default: "solid",
      describe: { de: "Massiv bis zum Boden oder offene Stufen zwischen zwei Wangen.", en: "Solid down to the floor, or open treads between two stringers." } },
    railing: { type: "choice", label: { de: "Geländer", en: "Railing" }, options: ["none", "left", "right", "both"], labels: { none: { de: "keins", en: "none" }, left: { de: "links", en: "left" }, right: { de: "rechts", en: "right" }, both: { de: "beidseitig", en: "both" } }, default: "right",
      describe: { de: "Seiten mit Geländer, gesehen beim Hinaufgehen.", en: "Sides with a railing, as seen walking up." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["stone", "wood", "metal"], labels: { stone: { de: "Stein", en: "Stone" }, wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } }, default: "stone",
      describe: { de: "Material der Stufen und Wangen; das Geländer ist immer aus Metall.", en: "Material of the treads and stringers; the railing is always metal." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#9a958c",
      describe: { de: "Grundfarbe der Stufen.", en: "Base colour of the treads." } },
  },
  presets: {
    "cellar-stairs": { label: { de: "Kellertreppe", en: "Cellar stairs" }, values: { rise: 0.2, tread: 0.24, width: 0.8, style: "open", railing: "left", material: "wood", color: "#9c7a54" } },
    "garden-steps": { label: { de: "Gartenstufen", en: "Garden steps" }, values: { steps: 3, rise: 0.15, tread: 0.35, width: 1.5, railing: "none" } },
    "grand-stairs": { label: { de: "Freitreppe", en: "Grand stairs" }, values: { steps: 16, rise: 0.15, tread: 0.32, width: 2.5, railing: "both", color: "#cfc8bb" } },
  },
  // Die konvexe Hülle ist eine Rampe: so laufen Figuren in Spielen die Treppe hinauf
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 9000, drawCalls: 3 },
  build(p) {
    // Stone and metal: one material for treads and body; wood: level grain on the treads, upright ("auto") on the
    // stringers and the body; the railing is always painted steel
    const korpus = material(p.material, p.color), stufe = p.material === "wood" ? material("wood", p.color, 1, undefined, { grain: "level" }) : korpus;
    const gel = material("metal", "#3a3d42");
    const t = new Parts();
    const n = p.steps, w = p.width, R = p.rise, T = p.tread, lang = n * T, hoch = n * R;
    const a = Math.atan2(hoch, lang), lw = Math.hypot(lang, hoch);
    // A side profile [z, y] extruded across x0..x1, its edges eased by b inside the finished size (docs/look-realistic.md)
    const profil = (pts: [number, number][], x0: number, x1: number, b: number) => {
      const s = new Shape();
      pts.forEach(([z, y], k) => (k ? s.lineTo(z, y) : s.moveTo(z, y)));
      return new ExtrudeGeometry(s, { depth: x1 - x0 - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 2 })
        .rotateY(-Math.PI / 2).translate(x1 - b, 0, 0);
    };
    if (p.style === "solid") {
      // One stepped body 2 cm below each tread top, its risers 2 cm behind the nosing and 1 cm in from the sides
      const ns = 0.02, pts: [number, number][] = [[lang / 2 - ns, 0]];
      for (let i = 0; i < n; i++) {
        const z = lang / 2 - i * T - ns, y = (i + 1) * R - ns;
        pts.push([z, y], [i < n - 1 ? z - T : -lang / 2, y]);
      }
      pts.push([-lang / 2, 0]);
      t.add(korpus, profil(pts, -w / 2 + 0.01, w / 2 - 0.01, 0.01));
      // Tread slabs: the front overhangs the riser by 2 cm, the back stops 2 mm before the next riser (or the back)
      for (let i = 0; i < n; i++) {
        const vorn = lang / 2 - i * T, hinten = i < n - 1 ? lang / 2 - (i + 1) * T - ns + 0.002 : -lang / 2 + 0.002;
        t.add(stufe, rounded(w, 0.02, vorn - hinten, 0.005, 0, (i + 1) * R - 0.01, (vorn + hinten) / 2));
      }
    } else {
      // Treads 4 cm thick, their ends 1 cm into the stringers
      for (let i = 0; i < n; i++) t.add(stufe, rounded(w - 0.06, 0.04, T, 0.003, 0, (i + 1) * R - 0.02, lang / 2 - (i + 0.5) * T));
      // Stringers: boards 25 cm deep across the slope with the treads in the middle, cut level on the floor and
      // vertical 3 mm behind the last tread; the foot is cut plumb 2 cm before the first nosing, so the flight keeps its
      // footprint
      const H = 0.25 / Math.cos(a), m = (H - R - 0.04) / 2, ende = -lang / 2 - 0.003;
      const oben = (z: number) => R + ((lang / 2 - z) * R) / T + m, boden = (off: number) => lang / 2 + ((R + off) * T) / R;
      const vorn = lang / 2 + 0.02;
      const pts: [number, number][] = [[boden(m - H), 0], [vorn, 0], [vorn, oben(vorn)], [ende, oben(ende)], [ende, oben(ende) - H]];
      for (const sx of [-1, 1]) t.add(korpus, profil(pts, sx * (w / 2 - 0.02) - 0.02, sx * (w / 2 - 0.02) + 0.02, 0.003));
    }
    const seiten = p.railing === "both" ? [-1, 1] : p.railing === "left" ? [-1] : p.railing === "right" ? [1] : [];
    const rr = 0.025, rb = 0.015;
    for (const sx of seiten) {
      // Open: 5 mm clear of the stringer
      const x = sx * (w / 2 - (p.style === "open" ? 0.06 : 0.05));
      for (let i = 0; i < n; i += Math.max(1, Math.round(n / 6))) {
        // The rail axis is 0.9 m above this tread; the post is set 5 mm into the tread and reaches 1 cm into the rail
        // where the rail's underside is highest over it
        const y = (i + 1) * R, top = y + 0.9 - rr / Math.cos(a) + rb * Math.tan(a) + 0.01;
        t.post(gel, rb, top - y + 0.005, x, y - 0.005, lang / 2 - (i + 0.5) * T, 8);
      }
      // Round handrail along the slope with rounded ends, as long as the flight
      t.add(gel, new CapsuleGeometry(rr, lw - 2 * rr, 4, 16).rotateX(a - Math.PI / 2).translate(x, hoch / 2 + 0.9 + R / 2, 0));
    }
    return t.group();
  },
});
