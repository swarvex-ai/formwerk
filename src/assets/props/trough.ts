import { ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

// A stadium (rectangle with half-circle ends) in the xy plane, extruded along z; stood upright by rotateX below.
// Segments per half-circle from the style guide table (full circle 16 / 24 / 32 by radius); with `bevel` the solid
// grows by the bevel and its holes shrink, so shapes are drawn inside their finished size (docs/look-realistic.md)
function stadium(length: number, width: number, depth: number, hole?: { length: number; width: number }, bevel = 0) {
  const cs = width <= 0.2 ? 8 : width <= 0.6 ? 12 : 16;
  const outline = (s: Shape, l: number, w: number, ccw: boolean) => {
    const r = w / 2, a = Math.max(0.002, l / 2 - r);
    s.moveTo(-a, -r);
    if (ccw) { s.lineTo(a, -r); s.absarc(a, 0, r, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-a, r); s.absarc(-a, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false); }
    else { s.absarc(-a, 0, r, (3 * Math.PI) / 2, Math.PI / 2, true); s.lineTo(a, r); s.absarc(a, 0, r, Math.PI / 2, -Math.PI / 2, true); s.lineTo(-a, -r); }
  };
  const shape = new Shape();
  outline(shape, length, width, true);
  if (hole) { const h = new Shape(); outline(h, hole.length, hole.width, false); shape.holes.push(h); }
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: cs }).rotateX(-Math.PI / 2);
}

// The rounded rectangle of a hewn block face (three fixes the winding of holes itself)
function rechteck(s: Shape, l: number, w: number, r: number) {
  const a = l / 2 - r, b = w / 2 - r, q = Math.PI / 2;
  s.moveTo(-a, -w / 2); s.lineTo(a, -w / 2); s.absarc(a, -b, r, -q, 0, false);
  s.lineTo(l / 2, b); s.absarc(a, b, r, 0, q, false);
  s.lineTo(-a, w / 2); s.absarc(-a, b, r, q, 2 * q, false);
  s.lineTo(-l / 2, -b); s.absarc(-a, -b, r, 2 * q, 3 * q, false);
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
  budget: { triangles: 12000, drawCalls: 4 },
  build(p) {
    const L = p.length, W = p.width, H = p.height, stein = p.build === "stone", metall = p.build === "metal";
    const w = stein ? Math.max(p.wall, 0.1) : p.wall;
    const th = p.legs === "trestle" ? 0.4 * H : 0, inner = H - th - w;
    // Boards, bottom planks and trestle crossbars lie level: grain along the board; legs stand: grain auto.
    // Shells are drawn solid with the walls' real volume; metal is sheet, so its effective density is low
    const breter = material("wood", p.colour, 1, 560, { grain: "level" });
    const t = new Parts();
    if (metall) {
      // A pressed tub: a floor plate and walls standing right on it (no slit at the foot), a rolled rim eased by a
      // bevel drawn into the shape, rounded ends at the segment count for the radius
      const blech = material("metal", p.colour, 1, 600);
      t.add(blech, stadium(L, W, w).translate(0, th, 0));
      t.add(blech, stadium(L, W, inner + 0.003, { length: L - 2 * w, width: W - 2 * w }).translate(0, th + w - 0.003, 0));
      const b = 0.005, rh = Math.min(0.03, inner * 0.4);
      t.add(blech, stadium(L + 0.03 - 2 * b, W + 0.03 - 2 * b, rh - b, { length: L - 2 * w + 2 * b, width: W - 2 * w + 2 * b }, b).translate(0, H - rh, 0));
    } else if (stein) {
      // One hewn block: a foot slab and a wall ring whose bevel is drawn inside the finished size, so the block keeps
      // exactly L x W, the basin exactly L-2w x W-2w and the rim and inner corners ease by 1-2 cm into the water
      const block = material("stone", p.colour, 1, undefined, { moss: 0.2 });
      const b = Math.max(0.01, Math.min(0.02, w * 0.2)), rA = 0.03, rI = Math.min(0.06, (W - 2 * w) * 0.4, w * 0.7);
      const fuss = new Shape(); rechteck(fuss, L, W, rA);
      t.add(block, new ExtrudeGeometry(fuss, { depth: w, bevelEnabled: false, curveSegments: 4 }).rotateX(-Math.PI / 2).translate(0, th, 0));
      const ring = new Shape(); rechteck(ring, L - 2 * b, W - 2 * b, Math.max(0.004, rA - b));
      const hohl = new Shape(); rechteck(hohl, L - 2 * w + 2 * b, W - 2 * w + 2 * b, rI + b);
      ring.holes.push(hohl);
      t.add(block, new ExtrudeGeometry(ring, { depth: inner - b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 2, curveSegments: 4 }).rotateX(-Math.PI / 2).translate(0, th + w, 0));
    } else {
      // The bottom of boards lying across the width, then side and end boards in courses of planks: every board a
      // separate rounded box with 3 mm eased edges and 2-3 mm joints, the end boards butting between the sides
      const f = 0.0025, n = Math.max(2, Math.round(W / 0.17)), bw = (W - (n - 1) * f) / n;
      for (let i = 0; i < n; i++) t.add(breter, rounded(L, w, bw, 0.003, 0, th + w / 2, -W / 2 + bw * (i + 0.5) + f * i));
      const m = Math.max(2, Math.round(inner / 0.17)), bh = inner / m;
      for (let i = 0; i < m; i++) {
        const y = th + w + bh * (i + 0.5);
        for (const s of [-1, 1]) {
          t.add(breter, rounded(L, bh - f, w, 0.003, 0, y, s * (W - w) / 2));
          t.add(breter, rounded(w, bh - f, W - 2 * w - 2 * f, 0.003, s * (L - w) / 2, y, 0));
        }
      }
      // Two dark iron bands around the boards, a quarter of the length from each end: both sides and the underside.
      // On trestles they move inward so they never touch a top beam, and they lie 2 mm into the wood
      const reif = material("iron", "#2b2d30", 5, 600, { rust: 0.25 });
      const x0 = Math.max(0.06, Math.min(0.15, L / 4 - 0.06)), bx = Math.min(L / 4, L / 2 - x0 - 0.0625);
      const yB = th - 0.005, yT = H - 0.018, d = 0.012;
      for (const s of [-1, 1]) {
        t.add(reif, rounded(0.035, yT - yB, d, 0.002, s * bx, (yB + yT) / 2, W / 2 + d / 2 - 0.002));
        t.add(reif, rounded(0.035, yT - yB, d, 0.002, s * bx, (yB + yT) / 2, -(W / 2 + d / 2 - 0.002)));
        t.add(reif, rounded(0.035, d, W + 0.004, 0.002, s * bx, th + d / 2 - 0.004, 0));
      }
    }
    if (p.water > 0) {
      // Weightless: the mass is that of the empty shell
      const wasser = material("plastic", "#3d6e86", 1, 0), hw = p.water * inner, e = 0.003;
      if (metall) t.add(wasser, stadium(L - 2 * w - e, W - 2 * w - e, hw).translate(0, th + w, 0));
      else t.box(wasser, L - 2 * w - e, hw, W - 2 * w - e, 0, th + w + hw / 2, 0);
    }
    if (th > 0) {
      // Two A-shaped trestles under the ends: square timbers with 3 mm chamfers, splayed legs, a cross bar and a
      // top beam whose top face is exactly the bottom of the trough, so the trough rests on it
      const beine = material("wood", p.colour, 1, 560), x0 = Math.max(0.06, Math.min(0.15, L / 4 - 0.06));
      const zt = W / 2 - 0.06, sp = 0.1, a = Math.atan(sp / th), len = Math.hypot(th, sp);
      for (const x of [-(L / 2 - x0), L / 2 - x0]) {
        t.add(breter, rounded(0.08, 0.055, W - 0.02, 0.003, x, th - 0.0275, 0));
        for (const s of [-1, 1]) t.add(beine, rounded(0.065, len, 0.065, 0.003).rotateX(-s * a).translate(x, th / 2 + 0.002, s * (zt + sp / 2)));
        t.add(breter, rounded(0.05, 0.05, 2 * zt + sp, 0.003, x, th * 0.35, 0));
      }
    }
    return t.group();
  },
});
