import { color, float, floor, fract, min, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap } from "../noise";

export const endGrain = defineSurface({
  id: "end-grain", category: "wood",
  title: { de: "Hirnholz", en: "End grain" },
  description: {
    de: "Hirnholzblöcke zu einem Raster verleimt, wie bei Hackblock, Schneidebrett oder Hirnholzboden: in jedem Block die Jahresringe eines quer geschnittenen Stamms. Eine Kachel ist 0,4 × 0,4 m.",
    en: "End-grain wood blocks glued into a grid, as on a butcher block, a chopping board or an end-grain floor: each block shows the growth rings of a log cut across. One tile is 0.4 × 0.4 m.",
  },
  params: {
    blocks: { type: "choice", options: ["4", "6", "8"], default: "6", label: { de: "Blöcke pro Kachel", en: "Blocks per tile" },
      describe: { de: "Blöcke nebeneinander auf einer Kachel: 4 große (10 cm), 6 üblich (6,7 cm), 8 kleine Blöcke (5 cm).", en: "Blocks side by side across a tile: 4 large (10 cm), 6 usual (6.7 cm), 8 small (5 cm)." } },
    rings: { type: "number", min: 3, max: 12, step: 0.5, default: 6, label: { de: "Jahresringe", en: "Rings" },
      describe: { de: "Jahresringe auf einer Blockbreite: 3 schnell gewachsen, 6 üblich, 12 eng und langsam gewachsen.", en: "Growth rings per block width: 3 fast grown, 6 usual, 12 tight and slow grown." } },
    warp: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Welligkeit", en: "Warp" },
      describe: { de: "Wie wellig die Ringe sind: 0 saubere Kreise, 0,4 üblich, 1 stark verzogen.", en: "How wobbly the rings are: 0 clean circles, 0.4 usual, 1 strongly distorted." } },
    joint: { type: "number", min: 0.02, max: 0.08, step: 0.005, default: 0.04, label: { de: "Leimfuge", en: "Glue line" },
      describe: { de: "Breite der Leimfuge als Anteil eines Blocks: 0,02 fein, 0,04 üblich, 0,08 breit.", en: "Width of the glue line as a fraction of a block: 0.02 fine, 0.04 usual, 0.08 wide." } },
    colour: { type: "color", default: "#b07a48", label: { de: "Holzfarbe", en: "Wood colour" },
      describe: { de: "Farbe des Frühholzes: Ahorn #c09060, Buche #b07a48, Nussbaum #6a4630.", en: "Colour of the earlywood: maple #c09060, beech #b07a48, walnut #6a4630." } },
    lateColour: { type: "color", default: "#7a4a2a", label: { de: "Spätholzfarbe", en: "Latewood colour" },
      describe: { de: "Farbe des dunklen Spätholzrings: Buche #7a4a2a, Nussbaum #3e2818.", en: "Colour of the darker latewood ring: beech #7a4a2a, walnut #3e2818." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Farbvielfalt", en: "Colour variation" },
      describe: { de: "Wie verschieden die Blöcke getönt sind: 0 alle gleich, 0,3 üblich, 1 deutlich hell und dunkel.", en: "How different the blocks are in tone: 0 all alike, 0.3 usual, 1 clearly light and dark." } },
  },
  presets: {
    "butcher-block": { label: { de: "Hackblock", en: "Butcher block" }, values: { blocks: "6", rings: 6 } },
    "chopping-board": { label: { de: "Schneidebrett", en: "Chopping board" }, values: { blocks: "4", rings: 9, colour: "#c09060" } },
    "walnut-floor": { label: { de: "Nussbaumboden", en: "Walnut floor" }, values: { blocks: "8", colour: "#6a4630", lateColour: "#3e2818", variation: 0.15 } },
  },
  tile: 0.4, depth: 0.003,
  build(p, seed) {
    const n = Number(p.blocks), early = color(p.colour), late = color(p.lateColour);
    return (q, res) => {
      const g = q.mul(n).toVar(), id = wrap(floor(g), vec2(n, n)).toVar(), f = fract(g).toVar();
      // Ring centre inside the block or a little outside it: some blocks show arcs
      const c = vec2(cell(id, seed), cell(id, seed + 1)).mul(1.6).sub(0.3);
      const d = f.sub(c).length().add(fbm(q, [n * 2, n * 2], res, 0.5, seed + 10).mul(0.15 * p.warp)).toVar();
      const w = fract(d.mul(p.rings)), lateMask = ramp(w, 0.65, 0.9).mul(float(1).sub(ramp(w, 0.9, 1))).toVar();
      const e = min(min(f.x, f.y), min(float(1).sub(f.x), float(1).sub(f.y)));
      const glue = float(1).sub(ramp(e, 0, p.joint)).toVar();
      const tone = cell(id, seed + 2).sub(0.5).mul(p.variation).add(1);
      const wood = mix(early, late, lateMask).mul(tone);
      const col = mix(wood, late.mul(0.6), glue);
      const pores = fbm(q, [n * 8, n * 8], res, 0.6, seed + 11, 3).mul(0.02);
      const height = mix(float(0.8).add(lateMask.mul(0.04)), float(0.6), glue).add(pores).clamp(0, 1);
      const roughness = mix(mix(float(0.7), float(0.8), lateMask), float(0.9), glue);
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
