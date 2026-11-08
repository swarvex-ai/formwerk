import { color, float, floor, fract, max, min, mix, sin, vec2, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, noise, ramp, wrap1 } from "../noise";

export const planks = defineSurface({
  id: "planks", category: "wood",
  title: { de: "Holzdielen", en: "Wooden planks" },
  description: {
    de: "Dielen aus Holz mit Maserung und Fugen, versetzt verlegt: vom Eichenparkett bis zum verwitterten Scheunenboden. Eine Kachel ist 1 × 1 m, jeder Seed legt andere Bretter.",
    en: "Wooden planks with grain and gaps, laid staggered: from oak flooring to a weathered barn floor. One tile is 1 × 1 m, every seed lays other boards.",
  },
  params: {
    rows: { type: "integer", min: 2, max: 12, default: 6, label: { de: "Dielen pro Meter", en: "Planks per metre" },
      describe: { de: "Wie viele Dielen nebeneinander auf einen Meter kommen: 4 breite Bohlen, 6 Dielen, 10 schmales Parkett.", en: "How many planks lie side by side in a metre: 4 wide boards, 6 planks, 10 narrow parquet." } },
    length: { type: "integer", min: 1, max: 4, default: 2, label: { de: "Stöße pro Meter", en: "Joints per metre" },
      describe: { de: "Wie oft eine Diele pro Meter endet: 1 lange Bretter, 2 Dielenboden, 4 kurzes Parkett.", en: "How often a plank ends per metre: 1 long boards, 2 floorboards, 4 short parquet." } },
    gap: { type: "number", min: 0, max: 0.12, step: 0.005, default: 0.02, label: { de: "Fuge", en: "Gap" },
      describe: { de: "Breite der Fuge im Verhältnis zur Diele: 0,01 dicht verlegt, 0,05 ein Schiffsdeck, 0,1 lose Bretter.", en: "Width of the gap against a plank: 0.01 tightly laid, 0.05 a ship deck, 0.1 loose boards." } },
    grain: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Maserung", en: "Grain" },
      describe: { de: "Wie deutlich die Maserung ist: 0 glatt lackiert, 0,6 Eiche, 1 kräftige Kiefer.", en: "How strong the grain is: 0 smooth varnish, 0.6 oak, 1 strong pine." } },
    wear: { type: "number", min: 0, max: 1, step: 0.05, default: 0.15, label: { de: "Verwitterung", en: "Wear" },
      describe: { de: "Wie alt und verwittert das Holz ist: 0 neu, 0,4 ein Gasthaus, 1 grau und rau wie eine alte Scheune.", en: "How old and weathered the wood is: 0 new, 0.4 a tavern, 1 grey and rough like an old barn." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Farbvielfalt", en: "Colour variation" },
      describe: { de: "Wie verschieden die Dielen gefärbt sind: 0 alle gleich, 1 deutlich hell und dunkel.", en: "How different the planks are in colour: 0 all alike, 1 clearly light and dark." } },
    color: { type: "color", default: "#9c6b3d", label: { de: "Holzfarbe", en: "Wood colour" },
      describe: { de: "Grundfarbe des Holzes: Honig für Eiche, Hell für Birke, Dunkelbraun für Nussbaum.", en: "Base colour of the wood: honey for oak, light for birch, dark brown for walnut." } },
  },
  presets: {
    "oak-floor": { label: { de: "Eichenboden", en: "Oak floor" }, values: { rows: 6, length: 2, color: "#a8763f", wear: 0.05, grain: 0.55 } },
    "ship-deck": { label: { de: "Schiffsdeck", en: "Ship deck" }, values: { rows: 8, length: 1, gap: 0.05, color: "#7a5434", wear: 0.35, grain: 0.7 } },
    barn: { label: { de: "Scheune", en: "Barn" }, values: { rows: 4, length: 1, gap: 0.06, color: "#8f7d68", wear: 0.85, grain: 0.9, variation: 0.7 } },
  },
  tile: 1, depth: 0.012,
  build(p, seed) {
    const rows = p.rows, len = p.length, holz = color(p.color), grau = vec3(0.32, 0.31, 0.29);
    return (q, res) => {
      const reihe = floor(q.y.mul(rows)).toVar(), y = fract(q.y.mul(rows)).toVar();
      // Every row starts at its own offset (staggered); a plank is one cell of the row
      const zeile = wrap1(reihe, rows).toVar(), versatz = cell(vec2(zeile, 0), seed);
      const xs = q.x.add(versatz.div(len)).mul(len).toVar();
      const spalte = wrap1(floor(xs), len), x = fract(xs).toVar();
      const id = cell(vec2(spalte, zeile), seed + 1).toVar();
      // Distance to the plank's edge in metres
      const kante = min(min(y, float(1).sub(y)).div(rows), min(x, float(1).sub(x)).div(len)).toVar();
      const fugeM = p.gap / rows / 2;
      const offen = ramp(kante, fugeM, fugeM + 0.002 + 0.006 * p.wear).toVar();
      // Grain: long lines along the plank, warped by noise; each plank cut from another part of the trunk
      const lauf = noise(vec2(q.x.mul(3), q.y.mul(rows * 2)), [3, rows * 2], seed + 2);
      const ringe = sin(y.add(id.mul(5)).mul(28).add(lauf.mul(6)).add(fbm(q, [2, rows], 128, 0.5, seed + 3, 3).mul(4))).mul(0.5).add(0.5).toVar();
      const fasern = fbm(q, [8, rows * 24], res, 0.6, seed + 4).toVar();
      const alt = ramp(fbm(q, [5, 5], 256, 0.5, seed + 5, 4).add(p.wear * 1.2), 0.5, 1.1).mul(p.wear).toVar();
      const height = offen.mul(id.mul(0.15).add(0.85)).sub(ringe.mul(0.05 * p.grain)).add(fasern.mul(0.03 + 0.05 * p.wear)).clamp(0, 1);
      const farbe = holz.mul(id.sub(0.5).mul(p.variation * 0.5).add(1)).mul(mix(float(1), ringe.mul(0.35).add(0.65), p.grain)).mul(fasern.mul(0.15).add(1));
      const col = mix(mix(farbe, grau.mul(fasern.mul(0.2).add(1)), alt), farbe.mul(0.25), float(1).sub(offen));
      const roughness = max(mix(float(0.5), float(0.9), alt), float(1).sub(offen).mul(0.95)).add(fasern.mul(0.05));
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
