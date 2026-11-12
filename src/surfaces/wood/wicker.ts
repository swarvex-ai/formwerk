import { abs, color, cos, float, floor, fract, max, min, mix, mod, select, sin } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, wrap1 } from "../noise";

export const wicker = defineSurface({
  id: "wicker", category: "wood",
  title: { de: "Weidengeflecht", en: "Wicker" },
  description: {
    de: "Geflochtene Weiden- oder Rattanstränge für Körbe, Reusen, Stühle und Sichtwände: im Leinengeflecht oder im Köper mit schrägen Linien. Eine Kachel ist 25 × 25 cm.",
    en: "Woven willow or rattan strands for baskets, fish traps, chairs and screens: plain weave or twill with diagonal lines. One tile is 25 × 25 cm.",
  },
  params: {
    strands: { type: "choice", options: ["4", "8", "12", "16"], default: "8", label: { de: "Stränge pro Kachel", en: "Strands per tile" },
      labels: { "4": { de: "4 grob", en: "4 coarse" }, "8": { de: "8 üblich", en: "8 usual" }, "12": { de: "12 fein", en: "12 fine" }, "16": { de: "16 sehr fein", en: "16 very fine" } },
      describe: { de: "Stränge in jeder Richtung auf einer Kachel: 4 grobe Weidenruten, 8 üblich, 16 feines Rattan.", en: "Strands in each direction on a tile: 4 coarse willow rods, 8 usual, 16 fine rattan." } },
    width: { type: "number", min: 0.5, max: 0.95, step: 0.05, default: 0.8, label: { de: "Strangbreite", en: "Strand width" },
      describe: { de: "Anteil des Rasters, den ein Strang deckt: 0,5 dünne Ruten mit breiten Lücken, 0,8 üblich, 0,95 dicht geflochten.", en: "Share of the grid a strand covers: 0.5 thin rods with wide gaps, 0.8 usual, 0.95 tightly woven." } },
    weave: { type: "choice", options: ["plain", "twill"], default: "plain", label: { de: "Bindung", en: "Weave" },
      labels: { plain: { de: "Leinengeflecht", en: "plain" }, twill: { de: "Köper", en: "twill" } },
      describe: { de: "Leinengeflecht: jeder Strang abwechselnd über und unter einem; Köper: zwei über, zwei unter, jede Reihe versetzt, das gibt schräge Linien.", en: "Plain: each strand alternately over and under one; twill: two over, two under, shifted each row, which gives diagonal lines." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Farbvielfalt", en: "Colour variation" },
      describe: { de: "Wie stark sich Stränge in Farbe und Dicke unterscheiden: 0 gleichmäßig, 0,4 natürlich, 1 deutlich unregelmäßig.", en: "How much strands differ in colour and thickness: 0 even, 0.4 natural, 1 clearly irregular." } },
    colour: { type: "color", default: "#b8925a", label: { de: "Strangfarbe", en: "Strand colour" },
      describe: { de: "Weide #b8925a, helles Rattan #d2b07a, dunkle Weide #8a6a3c.", en: "Willow #b8925a, pale rattan #d2b07a, dark willow #8a6a3c." } },
    gapColour: { type: "color", default: "#3b2a1a", label: { de: "Lückenfarbe", en: "Gap colour" },
      describe: { de: "Farbe der dunklen Lücken zwischen den Strängen.", en: "Colour of the dark gaps between the strands." } },
  },
  presets: {
    basket: { label: { de: "Korb", en: "Basket" }, values: { strands: "8", width: 0.8 } },
    rattan: { label: { de: "Rattan", en: "Rattan" }, values: { strands: "16", width: 0.9, colour: "#d2b07a" } },
    "willow-twill": { label: { de: "Weide im Köper", en: "Willow twill" }, values: { weave: "twill", strands: "12", colour: "#8a6a3c" } },
  },
  tile: 0.25, depth: 0.006,
  build(p, seed) {
    const n = Number(p.strands), half = p.width / 2, pi = Math.PI;
    const base = color(p.colour), gap = color(p.gapColour);
    return (q, res) => {
      const z = q.mul(n).toVar(), f = fract(z).toVar(), c = floor(z).toVar();
      const i = wrap1(c.x, n).toVar(), j = wrap1(c.y, n).toVar(), sum = i.add(j).toVar();
      // Plain: over one, under one. Twill: over two, under two, shifted by one every row.
      const phase = p.weave === "twill" ? mod(sum, float(4)) : mod(sum, float(2));
      const hTop = p.weave === "twill" ? phase.lessThan(float(2)) : phase.lessThan(float(1));
      // Each strand carries its own shade and thickness, slowly changing along its length
      const varyH = fbm(q, [n, 1], 128, 0.5, seed + 1).toVar();
      const varyV = fbm(q, [1, n], 128, 0.5, seed + 2).toVar();
      const bH = float(1).add(varyH.mul(p.variation * 0.5)).toVar();
      const bV = float(1).add(varyV.mul(p.variation * 0.5)).toVar();
      // Cross-section: a cosine bulge across the strand, zero in the gap
      const hwH = min(float(0.49), float(half).mul(float(1).add(varyH.mul(p.variation * 0.08)))).toVar();
      const hwV = min(float(0.49), float(half).mul(float(1).add(varyV.mul(p.variation * 0.08)))).toVar();
      const crossH = cos(min(abs(f.y.sub(0.5)).div(hwH), float(1)).mul(pi / 2)).toVar();
      const crossV = cos(min(abs(f.x.sub(0.5)).div(hwV), float(1)).mul(pi / 2)).toVar();
      // Along the strand: the crest in the middle of the cell, the under level at both ends, so the strand is
      // continuous under the next cell instead of sinking to the gap
      const sx = sin(f.x.mul(pi)).toVar(), sy = sin(f.y.mul(pi)).toVar();
      const eH = sx.mul(sx).toVar(), eV = sy.mul(sy).toVar();
      const underH = bH.mul(0.05).add(0.2).toVar(), peakH = min(float(1), bH.mul(0.45).add(0.55)).toVar();
      const underV = bV.mul(0.05).add(0.2).toVar(), peakV = min(float(1), bV.mul(0.45).add(0.55)).toVar();
      const hHoriz = crossH.mul(mix(underH, peakH, select(hTop, eH, float(0)))).toVar();
      const hVert = crossV.mul(mix(underV, peakV, select(hTop, float(0), eV))).toVar();
      const cover = max(crossH, crossV).toVar();
      const fine = fbm(q, [n * 8, n * 8], res, 0.6, seed + 3).toVar();
      const height = max(hHoriz, hVert).add(fine.mul(0.015).mul(cover)).clamp(0, 1).toVar();
      // The higher strand is seen; its edges are darker, the gaps take the gap colour
      const shadeH = bH.mul(0.5).add(0.5).toVar(), shadeV = bV.mul(0.5).add(0.5).toVar();
      const colH = base.mul(shadeH).mul(crossH.mul(0.28).add(0.72));
      const colV = base.mul(shadeV).mul(crossV.mul(0.28).add(0.72));
      const strand = select(hHoriz.greaterThan(hVert), colH, colV);
      const col = mix(gap.mul(fine.mul(0.12).add(0.92)), strand.mul(fine.mul(0.06).add(1)), cover);
      const roughness = mix(float(0.85), float(0.78).add(fine.mul(0.05)), cover);
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
