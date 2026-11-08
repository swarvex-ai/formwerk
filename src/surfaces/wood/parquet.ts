import { color, float, floor, fract, min, mix, sin, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap } from "../noise";

export const parquet = defineSurface({
  id: "parquet", category: "wood",
  title: { de: "Parkett", en: "Parquet" },
  description: {
    de: "Parkett im Würfelmuster: Felder aus parallelen Stäben, im Wechsel quer und längs verlegt, mit Maserung und Fugen. Eine Kachel ist 1 × 1 m.",
    en: "Parquet in a basket weave: squares of parallel strips, alternately laid across and along, with grain and gaps. One tile is 1 × 1 m.",
  },
  params: {
    squares: { type: "integer", min: 2, max: 8, default: 4, label: { de: "Felder pro Meter", en: "Squares per metre" },
      describe: { de: "Felder nebeneinander auf einem Meter: 2 große (50 cm), 4 üblich (25 cm), 8 kleines Mosaikparkett.", en: "Squares side by side in a metre: 2 large (50 cm), 4 usual (25 cm), 8 small mosaic parquet." } },
    strips: { type: "integer", min: 2, max: 6, default: 4, label: { de: "Stäbe je Feld", en: "Strips per square" },
      describe: { de: "Stäbe in einem Feld: 2 breite, 4 üblich, 6 schmale.", en: "Strips in one square: 2 wide, 4 usual, 6 narrow." } },
    gap: { type: "number", min: 0, max: 0.003, step: 0.0002, default: 0.0008, unit: "m", label: { de: "Fuge", en: "Gap" },
      describe: { de: "Breite der Fugen: 0 dicht, 0,0008 m üblich, 0,003 m alt und geschrumpft.", en: "Width of the gaps: 0 tight, 0.0008 m usual, 0.003 m old and shrunk." } },
    grain: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Maserung", en: "Grain" },
      describe: { de: "Wie deutlich die Maserung ist: 0 glatt, 0,5 Eiche, 1 kräftig.", en: "How strong the grain is: 0 smooth, 0.5 oak, 1 strong." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Farbvielfalt", en: "Colour variation" },
      describe: { de: "Wie verschieden die Stäbe gefärbt sind: 0 alle gleich, 1 deutlich hell und dunkel.", en: "How different the strips are in colour: 0 all alike, 1 clearly light and dark." } },
    color: { type: "color", default: "#b07f4a", label: { de: "Holzfarbe", en: "Wood colour" },
      describe: { de: "Eiche #b07f4a, Buche #c99a6b, Nussbaum #6b4a33.", en: "Oak #b07f4a, beech #c99a6b, walnut #6b4a33." } },
  },
  presets: {
    oak: { label: { de: "Eiche", en: "Oak" }, values: { color: "#b07f4a" } },
    walnut: { label: { de: "Nussbaum", en: "Walnut" }, values: { color: "#6b4a33", grain: 0.7, variation: 0.3 } },
    mosaic: { label: { de: "Mosaik", en: "Mosaic" }, values: { squares: 8, strips: 4, color: "#c99a6b" } },
  },
  tile: 1, depth: 0.002,
  build(p, seed) {
    const holz = color(p.color), n = p.squares, k = p.strips;
    return (q, res) => {
      const z = q.mul(n).toVar(), feld = wrap(floor(z), vec2(n, n)).toVar(), f = fract(z).toVar();
      // Every other square turns its strips by 90 degrees
      const quer = fract(feld.x.add(feld.y).mul(0.5)).mul(2).toVar();
      const u = mix(f.x, f.y, quer), v = mix(f.y, f.x, quer);
      const stab = floor(v.mul(k)).toVar(), sv = fract(v.mul(k)).toVar();
      const id = cell(vec2(feld.x.mul(k).add(stab), feld.y.mul(7).add(quer)), seed).toVar();
      // Distance to the edge of the strip in metres: across the strip and at the ends of the square
      const kante = min(min(sv, float(1).sub(sv)).div(n * k), min(u, float(1).sub(u)).div(n)).toVar();
      const offen = ramp(kante, p.gap / 2, p.gap / 2 + 0.0008).toVar();
      const lauf = fbm(q, [n, n], 256, 0.5, seed + 1, 4);
      const ringe = sin(sv.add(id.mul(5)).mul(9).add(u.mul(2)).add(lauf.mul(5))).mul(0.5).add(0.5).toVar();
      const fasern = fbm(q, [n * 8, n * 8], res, 0.6, seed + 2).toVar();
      const farbe = holz.mul(id.sub(0.5).mul(p.variation * 0.5).add(1)).mul(mix(float(1), ringe.mul(0.3).add(0.7), p.grain)).mul(fasern.mul(0.1).add(1));
      const col = mix(farbe.mul(0.3), farbe, offen);
      const height = offen.mul(id.mul(0.1).add(0.88)).sub(ringe.mul(0.03 * p.grain)).add(fasern.mul(0.02)).clamp(0, 1);
      return { height, color: col, roughness: mix(float(0.9), float(0.42).add(fasern.mul(0.05)), offen), metalness: float(0) };
    };
  },
});
