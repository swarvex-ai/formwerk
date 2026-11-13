import { BoxGeometry, ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// A stadium (rectangle with half-circle ends) in the xy plane, extruded along z; stood upright by rotateX below
function stadium(length: number, width: number, depth: number, hole?: { length: number; width: number }) {
  const outline = (s: Shape | import("three").Path, l: number, w: number, ccw: boolean) => {
    const r = w / 2, a = l / 2 - r;
    s.moveTo(-a, -r);
    if (ccw) { s.lineTo(a, -r); s.absarc(a, 0, r, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-a, r); s.absarc(-a, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false); }
    else { s.absarc(-a, 0, r, (3 * Math.PI) / 2, Math.PI / 2, true); s.lineTo(a, r); s.absarc(a, 0, r, Math.PI / 2, -Math.PI / 2, true); s.lineTo(-a, -r); }
  };
  const shape = new Shape();
  outline(shape, length, width, true);
  if (hole) { const h = new Shape(); outline(h, hole.length, hole.width, false); shape.holes.push(h); }
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 11 }).rotateX(-Math.PI / 2);
}

export const trough = defineAsset({
  id: "trough", category: "props",
  title: { de: "Wassertrog", en: "Water trough" },
  description: { de: "Ein langer offener Wassertrog für Hof, Stall oder Dorfplatz: aus Brettern mit zwei Eisenbändern, aus einem Steinblock oder als Metallwanne mit runden Enden, auf Wunsch auf Holzböcken und mit Wasser gefüllt.", en: "A long open water trough for a farmyard, a stable or a village square: made of planks with two iron bands, a block of stone or a metal tub with rounded ends, optionally on wooden trestles and filled with water." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.8, max: 3, step: 0.01, default: 1.6, unit: "m",
      describe: { de: "Länge entlang x: 0,9 m ein Futtertrog, 1,6 m am Hof, 2,5 m für eine ganze Herde.", en: "Length along x: 0.9 m a feed tub, 1.6 m in a farmyard, 2.5 m for a whole herd." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.4, max: 1, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Breite entlang z: 0,5 m schmal, 0,6 m üblich, 0,8 m ein Steinbecken.", en: "Width along z: 0.5 m narrow, 0.6 m usual, 0.8 m a stone basin." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 0.9, step: 0.01, default: 0.55, unit: "m",
      describe: { de: "Höhe vom Boden bis zum Rand: 0,35 m ein flacher Futtertrog, 0,55 m üblich, 0,85 m auf Böcken.", en: "Height from the floor to the rim: 0.35 m a low feed tub, 0.55 m usual, 0.85 m on trestles." } },
    wall: { type: "number", label: { de: "Wandstärke", en: "Wall" }, min: 0.03, max: 0.12, step: 0.005, default: 0.05, unit: "m",
      describe: { de: "Dicke von Wänden und Boden: 0,03 m dünnes Blech, 0,05 m Bretter, 0,1 m Stein (Stein ist mindestens 0,1 m dick).", en: "Thickness of walls and floor: 0.03 m thin sheet, 0.05 m planks, 0.1 m stone (stone is at least 0.1 m thick)." } },
    build: { type: "choice", label: { de: "Bauart", en: "Build" }, options: ["planks", "stone", "metal"], labels: { planks: { de: "Bretter", en: "Planks" }, stone: { de: "Stein", en: "Stone" }, metal: { de: "Metall", en: "Metal" } }, default: "planks",
      describe: { de: "Bretter mit zwei dunklen Eisenbändern, ein massiver Steinblock oder eine Metallwanne mit runden Enden.", en: "Planks with two dark iron bands, a solid block of stone or a metal tub with rounded ends." } },
    legs: { type: "choice", label: { de: "Beine", en: "Legs" }, options: ["none", "trestle"], labels: { none: { de: "Keine", en: "None" }, trestle: { de: "Holzböcke", en: "Trestles" } }, default: "none",
      describe: { de: "Keine: der Trog steht auf dem Boden; Holzböcke: zwei A-förmige Böcke unter den Enden, der Rand bleibt auf der Höhe.", en: "None: the trough stands on the floor; trestles: two A-shaped wooden trestles under the ends, the rim stays at the height." } },
    water: { type: "number", label: { de: "Wasser", en: "Water" }, min: 0, max: 1, step: 0.01, default: 0.7,
      describe: { de: "Wasserstand als Anteil der inneren Tiefe: 0 leer, 0,4 knapp gefüllt, 0,7 üblich, 1 randvoll.", en: "Water level as a share of the inner depth: 0 empty, 0.4 low, 0.7 usual, 1 full to the brim." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#7a5a3a",
      describe: { de: "Farbe des Trogs (Holz, Stein oder Metall).", en: "Colour of the trough (wood, stone or metal)." } },
  },
  presets: {
    farm: { label: { de: "Hoftrog", en: "Farm trough" }, values: { build: "planks" } },
    "stone-basin": { label: { de: "Steinbecken", en: "Stone basin" }, values: { build: "stone", length: 2.2, width: 0.8, height: 0.6, colour: "#8a8a82" } },
    "feed-tub": { label: { de: "Futterwanne", en: "Feed tub" }, values: { build: "metal", length: 0.9, width: 0.5, height: 0.35, water: 0.4, colour: "#6a7076" } },
    raised: { label: { de: "Auf Böcken", en: "Raised" }, values: { legs: "trestle", height: 0.85 } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 1500, drawCalls: 3 },
  build(p) {
    const L = p.length, W = p.width, H = p.height, stein = p.build === "stone", metall = p.build === "metal";
    const w = stein ? Math.max(p.wall, 0.1) : p.wall;
    const th = p.legs === "trestle" ? 0.4 * H : 0, inner = H - th - w;
    // Shells are drawn solid with the walls' real volume; metal is sheet, so its effective density is low
    const body = material(stein ? "stone" : metall ? "metal" : "wood", p.colour, 1, stein ? undefined : metall ? 600 : 560);
    const t = new Parts();
    const hole = { length: L - 2 * w, width: W - 2 * w };
    if (metall) {
      t.add(body, stadium(L, W, w).translate(0, th, 0));
      t.add(body, stadium(L, W, inner, hole).translate(0, th + w, 0));
    } else {
      t.box(body, L, w, W, 0, th + w / 2, 0);
      const n = stein ? 1 : Math.ceil(inner / 0.2), g = stein ? 0 : 0.004, bh = inner / n;
      for (let i = 0; i < n; i++) {
        const y = th + w + bh * (i + 0.5);
        for (const s of [-1, 1]) {
          t.box(body, L, bh - g, w, 0, y, s * (W - w) / 2);
          t.box(body, w, bh - g, W - 2 * w, s * (L - w) / 2, y, 0);
        }
      }
      if (!stein) {
        // Two dark bands round the outside, a quarter of the length from each end: both sides and the underside
        const band = material("metal", "#2b2d30", 1, 600), d = 0.014, bw = 0.04, bH = H - th;
        for (const x of [-L / 4, L / 4]) {
          t.box(band, bw, bH, d, x, th + bH / 2, W / 2 + d / 2);
          t.box(band, bw, bH, d, x, th + bH / 2, -W / 2 - d / 2);
          t.box(band, bw, d, W + 2 * d, x, th - d / 2 + 0.001, 0);
        }
      }
    }
    if (p.water > 0) {
      // Weightless: the mass is that of the empty shell
      const wasser = material("plastic", "#3d6e86", 1, 0), hw = p.water * inner, e = 0.003;
      if (metall) t.add(wasser, stadium(L - 2 * w - e, W - 2 * w - e, hw).translate(0, th + w, 0));
      else t.box(wasser, L - 2 * w - e, hw, W - 2 * w - e, 0, th + w + hw / 2, 0);
    }
    if (th > 0) {
      // Two A-shaped trestles under the ends: splayed legs, a cross bar and a top beam
      const holz = p.build === "planks" ? body : material("wood", p.colour, 1, 560), x0 = Math.min(0.15, L / 4), zt = W / 2 - 0.06, sp = 0.1, a = Math.atan(sp / th), len = Math.hypot(th, sp);
      for (const x of [-(L / 2 - x0), L / 2 - x0]) {
        t.box(holz, 0.07, 0.05, W - 0.04, x, th - 0.025, 0);
        for (const s of [-1, 1]) t.add(holz, new BoxGeometry(0.06, len, 0.05).rotateX(-s * a).translate(x, th / 2, s * (zt + sp / 2)));
        t.box(holz, 0.05, 0.04, 2 * zt + sp, x, th * 0.35, 0);
      }
    }
    return t.group();
  },
});
