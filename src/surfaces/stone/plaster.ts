import { color, float, floor, fract, min, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap1 } from "../noise";

export const plaster = defineSurface({
  id: "plaster", category: "stone",
  title: { de: "Putz", en: "Plaster" },
  description: {
    de: "Verputzte Wand aus Kalkputz oder Stuck mit Kellenwurf, feinem Korn und Stellen, an denen der Putz abgefallen ist und Ziegel zum Vorschein kommen: vom frischen Weißanstrich bis zur Ruine. Eine Kachel ist 1 × 1 m.",
    en: "Rendered wall of lime plaster or stucco with trowel swirls, a fine grain and patches where the plaster has fallen off to reveal bricks: from a fresh whitewash to a ruin. One tile is 1 × 1 m.",
  },
  params: {
    roughness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Rauheit", en: "Roughness" },
      describe: { de: "Korn der Oberfläche: 0 glatter Kalkanstrich, 0,3 üblicher Putz, 1 grob geworfener Putz.", en: "Grain of the surface: 0 smooth lime wash, 0.3 usual plaster, 1 coarse thrown-on render." } },
    trowel: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Kelle", en: "Trowel" },
      describe: { de: "Breite, weiche Schwünge der Kelle: 0 glatt abgezogen, 0,4 üblich, 1 unruhig von Hand verrieben.", en: "Broad, soft trowel swirls: 0 smoothed flat, 0.4 usual, 1 restless hand-rubbed." } },
    damage: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Schaden", en: "Damage" },
      describe: { de: "Anteil der Kachel, an dem der Putz fehlt und Ziegel sichtbar sind: 0 kein Schaden, 0,3 ein altes Haus, 0,7 eine Ruine.", en: "Share of the tile where plaster is missing and brick shows: 0 none, 0.3 an old house, 0.7 a ruin." } },
    brickColour: { type: "color", default: "#8a4b36", label: { de: "Ziegelfarbe", en: "Brick colour" },
      describe: { de: "Farbe der Ziegel unter dem Putz: rot #8a4b36, gelb #b98a52, grau #8a8580.", en: "Colour of the bricks under the plaster: red #8a4b36, yellow #b98a52, grey #8a8580." } },
    colour: { type: "color", default: "#e6dcc8", label: { de: "Putzfarbe", en: "Plaster colour" },
      describe: { de: "Farbe des Putzes: weiß #f2efe8, kalkig #e6dcc8, altgrau #b9b2a2.", en: "Colour of the plaster: white #f2efe8, lime #e6dcc8, old grey #b9b2a2." } },
  },
  presets: {
    whitewash: { label: { de: "Weißanstrich", en: "Whitewash" }, values: { roughness: 0.3, trowel: 0.4, damage: 0 } },
    "old-house": { label: { de: "Altes Haus", en: "Old house" }, values: { damage: 0.3, colour: "#d8c7a3" } },
    ruin: { label: { de: "Ruine", en: "Ruin" }, values: { damage: 0.7, roughness: 0.7, colour: "#b9b2a2" } },
  },
  tile: 1, depth: 0.015,
  build(p, seed) {
    const putz = color(p.colour), ziegel = color(p.brickColour);
    const moertel = mix(ziegel, putz, float(0.45)).mul(0.8);
    // The damage threshold walks through the noise with the share; the gate keeps tiny shares faint and 0 free of bricks.
    const g = Math.min(1, p.damage / 0.05);
    const gate = g * g * (3 - 2 * g);
    return (q, res) => {
      const fein = fbm(q, [128, 128], res, 0.7, seed + 1).toVar();
      const wolke = fbm(q, [6, 6], 256, 0.55, seed + 2, 4).toVar();
      const wirbel = fbm(q, [4, 4], 256, 0.5, seed + 3, 4).toVar();
      // Trowel: a low-frequency fbm smeared along x by a slow warp
      const kelle = fbm(q.add(vec2(wirbel.mul(0.06), float(0))), [5, 3], 256, 0.5, seed + 4, 4).toVar();
      // Damage: one low-frequency fbm, thresholded by a 0.06-wide ramp moved by the share
      const raus = p.damage > 0
        ? ramp(fbm(q, [4, 4], 256, 0.55, seed + 5, 4), 0.42 - p.damage * 0.95, 0.48 - p.damage * 0.95).mul(gate)
        : float(0);
      // Running-bond bricks under the plaster: 8 courses and 4 bricks per tile
      const rows = 8, len = 4;
      const reihe = floor(q.y.mul(rows)).toVar(), y = fract(q.y.mul(rows)).toVar(), zeile = wrap1(reihe, rows).toVar();
      const versatz = fract(zeile.mul(0.5));
      const xs = q.x.mul(len).add(versatz).toVar(), x = fract(xs).toVar();
      const id = cell(vec2(wrap1(floor(xs), len), zeile), seed).toVar();
      const kante = min(min(y, float(1).sub(y)).mul(1 / rows), min(x, float(1).sub(x)).mul(1 / len)).toVar();
      const stein = ramp(kante, 0.003, 0.01).toVar();
      const ziegelFarbe = ziegel.mul(id.sub(0.5).mul(0.5).add(0.82)).mul(fein.mul(0.12).add(1));
      const brickCol = mix(moertel, ziegelFarbe, stein);
      const brickHeight = stein.mul(0.12).add(0.06);
      // Plaster relief: fine grain follows roughness, broad swirls follow trowel; the patch drops by a fixed step
      const putzHeight = float(0.62)
        .add(fein.mul(p.roughness * 0.3))
        .add(kelle.mul(p.trowel * 0.14))
        .add(wolke.mul(0.03));
      const height = mix(putzHeight, float(0.1).add(brickHeight), raus).clamp(0, 1);
      const putzFarbe = putz.mul(fein.mul(0.06).add(kelle.mul(p.trowel * 0.05)).add(wolke.mul(0.04)).add(1));
      const col = mix(putzFarbe, brickCol, raus);
      const rough = mix(float(0.62).add(p.roughness * 0.28).add(fein.mul(0.04)), float(0.9), raus);
      return { height, color: col, roughness: min(rough, float(0.97)), metalness: float(0) };
    };
  },
});
