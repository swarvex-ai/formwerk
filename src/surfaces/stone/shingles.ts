import { abs, color, float, floor, fract, max, min, mix, sqrt, vec2, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap1 } from "../noise";

export const shingles = defineSurface({
  id: "shingles", category: "stone",
  title: { de: "Dachschindeln", en: "Roof shingles" },
  description: {
    de: "Übereinandergedeckte Reihen aus Schiefer, Ton oder Holz, jede Reihe um eine halbe Schindel versetzt: von grauem Schiefer über rote Rundbogen bis zur Holzschindel, auf Wunsch bemoost. Eine Kachel ist 1 × 1 m.",
    en: "Overlapping roof courses of slate, clay or wood, every row offset by half a shingle: from grey slate to red scalloped tile to wooden shake, mossy if you like. One tile is 1 × 1 m.",
  },
  params: {
    rows: { type: "integer", min: 4, max: 14, default: 8, label: { de: "Reihen pro Meter", en: "Rows per metre" },
      describe: { de: "Dachreihen übereinander auf einen Meter Höhe (gerade Zahl, sonst eine mehr): 6 große Schiefer, 8 übliche Deckungen, 14 kleine Biberschwänze.", en: "Roof courses up a metre of height (even, otherwise one more): 6 large slates, 8 usual coverings, 14 small beaver-tails." } },
    tabs: { type: "integer", min: 2, max: 9, default: 5, label: { de: "Schindeln pro Reihe", en: "Shingles per row" },
      describe: { de: "Schindeln nebeneinander in einer Reihe: 2 breite Platten (50 cm), 5 übliche Schiefer (20 cm), 9 schmale Halbschindeln.", en: "Shingles side by side in a course: 2 wide slabs (50 cm), 5 usual slates (20 cm), 9 narrow half-slates." } },
    shape: { type: "choice", options: ["square", "rounded", "pointed"], default: "rounded", label: { de: "Form", en: "Shape" },
      labels: { square: { de: "rechteckig", en: "square" }, rounded: { de: "Rundbogen", en: "rounded" }, pointed: { de: "spitz", en: "pointed" } },
      describe: { de: "Geschnittene Unterkante der Schindeln: rechteckig wie Naturschiefer, Rundbogen wie Biberschwanz, spitz wie Gotikschiefer.", en: "Cut bottom edge of the shingles: square like natural slate, scalloped like beaver-tail, pointed like Gothic slate." } },
    shade: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Überlappungsschatten", en: "Overlap shading" },
      describe: { de: "Wie tief die Kante der nächsten Reihe Schatten auf die darunter wirft: 0 flach, 0,6 eine normale Dachdeckung, 1 tiefe Falten.", en: "How deeply the edge of the row above shadows the shingles below: 0 flat, 0.6 a normal roof, 1 deep folds." } },
    moss: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Moos", en: "Moss" },
      describe: { de: "Moos in den Fugen und an den Kanten: 0 sauber, 0,4 ein schattiges Norddach, 1 ein lang unberührtes Dach.", en: "Moss in the joints and on the edges: 0 clean, 0.4 a shady north roof, 1 a long undisturbed roof." } },
    color: { type: "color", default: "#5b626b", label: { de: "Schindelfarbe", en: "Shingle colour" },
      describe: { de: "Schiefergrau #5b626b, Terrakotta #b0522e, Holz #6e5a42.", en: "Slate grey #5b626b, terracotta #b0522e, wood #6e5a42." } },
  },
  presets: {
    "slate-roof": { label: { de: "Schieferdach", en: "Slate roof" }, values: { shape: "square", tabs: 4, color: "#565d66", shade: 0.55 } },
    terracotta: { label: { de: "Terrakotta", en: "Terracotta" }, values: { shape: "rounded", rows: 9, color: "#b0522e", shade: 0.7 } },
    "wooden-shake": { label: { de: "Holzschindel", en: "Wooden shake" }, values: { shape: "pointed", tabs: 3, rows: 6, color: "#6e5a42", shade: 0.8, moss: 0.3 } },
  },
  tile: 1, depth: 0.02,
  build(p, seed) {
    const reihen = p.rows + (p.rows % 2), n = p.tabs, schiefer = color(p.color);
    // How far the cut bottom edge reaches up into the row: a rounded arc sinks deepest in the middle,
    // a pointed one along straight lines, a square one stays a thin shadow line under the edge
    const tiefe = p.shape === "square" ? 0.03 : p.shape === "rounded" ? 0.5 : 0.45;
    return (q, res) => {
      const reihe = floor(q.y.mul(reihen)).toVar(), fy = fract(q.y.mul(reihen)).toVar();
      // Running bond: every other course shifted by half a shingle (rows even, so the shift keeps alternating)
      const zeile = wrap1(reihe, reihen).toVar(), versatz = fract(zeile.mul(0.5));
      const xs = q.x.mul(n).add(versatz).toVar(), u = fract(xs).toVar();
      const id = cell(vec2(wrap1(floor(xs), n), zeile), seed).toVar();
      const b = u.mul(2).sub(1);
      const kant = p.shape === "rounded" ? float(tiefe).mul(float(1).sub(sqrt(max(float(0), float(1).sub(b.mul(b))))))
        : p.shape === "pointed" ? float(tiefe).mul(abs(b)) : float(tiefe);
      const w = 0.004 * reihen;
      // Above the cut edge the shingle lies in front of the course below (the step of the overlap)
      const stufe = ramp(fy, kant.sub(w), kant.add(w)).toVar();
      const rille = ramp(float(1).sub(fy), 0, 0.07);
      const fugen = ramp(min(u, float(1).sub(u)).div(n), 0.002, 0.006);
      const fein = fbm(q, [16, 16], res, 0.6, seed + 1).toVar();
      const poren = fbm(q, [96, 96], res, 0.7, seed + 2).toVar();
      const level = id.mul(0.12).add(id.mul(7.13).fract().mul(0.08)).add(0.75);
      const height = level.mul(stufe.mul(0.15).add(0.75)).mul(float(1).sub(rille.mul(0.22)))
        .mul(fugen).add(float(0.08).mul(float(1).sub(fugen)))
        .add(fein.mul(0.05).mul(stufe)).add(poren.mul(0.02)).clamp(0, 1);
      // The thin edge of the overlapping course catches the light, then the shadow it throws
      const kante = min(stufe, float(1).sub(ramp(fy, kant.add(w), kant.add(w * 4))));
      const schatten = ramp(fy, float(1).sub(p.shade * 0.55), 1).mul(p.shade);
      const farbe = schiefer.mul(id.sub(0.5).mul(0.3).add(1)).mul(fein.mul(0.15).add(poren.mul(0.08)).add(1));
      let col = farbe.mul(kante.mul(0.15).add(1)).mul(float(1).sub(schatten.mul(0.6)));
      col = mix(col.mul(0.45), col, stufe);
      col = mix(col.mul(0.25), col, fugen);
      const spalt = max(float(1).sub(stufe), float(1).sub(fugen)).toVar();
      const moosMaske = p.moss > 0 ? ramp(fbm(q, [6, 6], 256, 0.5, seed + 50, 4).add(spalt.mul(0.7)), 1 - p.moss * 0.9, 1.4 - p.moss * 0.5).mul(p.moss) : float(0);
      col = mix(col, vec3(0.08, 0.14, 0.04).mul(fein.mul(0.4).add(1)), moosMaske);
      const roughness = mix(float(0.74).add(poren.mul(0.1)), float(0.95), max(spalt, moosMaske));
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
