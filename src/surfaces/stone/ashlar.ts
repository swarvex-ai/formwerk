import { color, float, floor, fract, min, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap1 } from "../noise";

export const ashlar = defineSurface({
  id: "ashlar", category: "stone",
  title: { de: "Quadermauer", en: "Ashlar wall" },
  description: {
    de: "Mauerwerk aus behauenen Werksteinen (Quadern) im versetzten Verband, mit glatter oder bossierter Face und Verwitterung: von der Burg über das Rathaus bis zur Ruine. Eine Kachel ist 2 × 2 m.",
    en: "Masonry of dressed stone blocks (ashlars) in running bond, with smooth or bossed faces and weathering: from castle to town hall to ruin. One tile is 2 × 2 m.",
  },
  params: {
    courses: { type: "integer", min: 3, max: 8, default: 5, label: { de: "Lagen", en: "Courses" },
      describe: { de: "Steinreihen auf zwei Meter Höhe: 3 große Quader (67 cm), 5 übliche Werksteine (40 cm), 8 kleine (25 cm).", en: "Rows of blocks on two metres of height: 3 big ashlars (67 cm), 5 usual dressed stones (40 cm), 8 small (25 cm)." } },
    blocks: { type: "integer", min: 2, max: 6, default: 3, label: { de: "Steine nebeneinander", en: "Blocks side by side" },
      describe: { de: "Quader nebeneinander auf zwei Meter Breite: 2 lange Steine (1 m), 3 übliche (67 cm), 6 kurze (33 cm).", en: "Blocks side by side on two metres of width: 2 long stones (1 m), 3 usual (67 cm), 6 short (33 cm)." } },
    joint: { type: "number", min: 0.006, max: 0.03, step: 0.001, default: 0.014, unit: "m", label: { de: "Fuge", en: "Joint" },
      describe: { de: "Breite der Mörtelfuge: 0,006 m eng gefügt am Rathaus, 0,014 m üblich, 0,026 m grob an der Ruine.", en: "Width of the mortar joint: 0.006 m tight at the town hall, 0.014 m usual, 0.026 m rough at the ruin." } },
    face: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Face", en: "Face" },
      describe: { de: "Wie die Steinseite behauen ist: 0 glatt geschliffen, 0,6 leicht erhaben mit flachem Rand, 1 raue Bossen mit breitem flachem Rand.", en: "How the stone face is dressed: 0 smooth ground, 0.6 slightly raised with a flat margin, 1 rough boss with a wide flat margin." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Farbvielfalt", en: "Colour variation" },
      describe: { de: "Wie verschieden die Quader gefärbt sind: 0 alle gleich, 1 deutlich hell und dunkel.", en: "How different the blocks are in colour: 0 all alike, 1 clearly light and dark." } },
    weathering: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Verwitterung", en: "Weathering" },
      describe: { de: "Dunkle Flecken von Regen und Alter: 0 neu, 0,4 eine alte Mauer, 0,9 die Ruine.", en: "Dark patches of rain and age: 0 new, 0.4 an old wall, 0.9 the ruin." } },
    color: { type: "color", default: "#9a948a", label: { de: "Steinfarbe", en: "Stone colour" },
      describe: { de: "Grauer Kalkstein #9a948a, Sandstein #b89a72, dunkler Bruchstein #6e6c6a.", en: "Grey limestone #9a948a, sandstone #b89a72, dark stone #6e6c6a." } },
    mortarColor: { type: "color", default: "#7a7468", label: { de: "Mörtel", en: "Mortar" },
      describe: { de: "Farbe des Mörtels.", en: "Colour of the mortar." } },
  },
  presets: {
    castle: { label: { de: "Burg", en: "Castle" }, values: { face: 0.7, weathering: 0.4 } },
    "town-hall": { label: { de: "Rathaus", en: "Town hall" }, values: { courses: 6, blocks: 4, joint: 0.006, face: 0, weathering: 0.1, color: "#b89a72", mortarColor: "#a8987c" } },
    ruin: { label: { de: "Ruine", en: "Ruin" }, values: { joint: 0.026, face: 1, weathering: 0.9, variation: 0.7, color: "#6e6c6a" } },
  },
  tile: 2, depth: 0.03,
  build(p, seed) {
    const quader = color(p.color), moertel = color(p.mortarColor);
    const { courses, blocks, joint, face, variation, weathering } = p;
    return (q, res) => {
      const reihe = floor(q.y.mul(courses)).toVar(), y = fract(q.y.mul(courses)).toVar(), zeile = wrap1(reihe, courses).toVar();
      // Every course gets its own shift, so the vertical joints never line up
      const versatz = cell(vec2(zeile, float(-7)), seed).mul(0.6).add(0.2).toVar();
      const xs = q.x.mul(blocks).add(versatz).toVar(), x = fract(xs).toVar(), id = cell(vec2(wrap1(floor(xs), blocks), zeile), seed).toVar();
      // Distance to the block edge in metres
      const kante = min(min(y, float(1).sub(y)).mul(2 / courses), min(x, float(1).sub(x)).mul(2 / blocks)).toVar();
      const fein = fbm(q, [8, 8], res, 0.6, seed + 1).toVar(), poren = fbm(q, [64, 64], res, 0.7, seed + 2).toVar();
      // Stone vs mortar: the arris wanders a little with the grain, so joints are not cut straight
      const stein = ramp(kante.add(fein.sub(0.5).mul(0.01 * face)), joint / 2 - 0.002, joint / 2 + 0.01).toVar();
      // The boss: the middle of the face stands up, the margin round the edge stays flat
      const boss = ramp(kante, joint / 2, joint / 2 + 0.06 + 0.04 * face).mul(face).toVar();
      const height = stein.mul(float(0.6).add(id.mul(0.06)).add(boss.mul(float(0.2).add(fein.mul(0.25))))).add(poren.mul(0.03)).clamp(0, 1);
      const farbe = quader.mul(id.sub(0.5).mul(variation * 0.5).add(1)).mul(fein.mul(0.2).add(poren.mul(0.12)).add(0.92));
      const grund = mix(moertel.mul(poren.mul(0.15).add(0.9)), farbe, stein);
      const dunkel = weathering > 0 ? ramp(fbm(q, [4, 4], 128, 0.55, seed + 3, 4).add(id.mul(0.2)), 0.65 - weathering * 0.6, 1.05 - weathering * 0.4).mul(weathering * 0.6) : float(0);
      const col = mix(grund, grund.mul(0.35), dunkel);
      return { height, color: col, roughness: mix(float(0.95), float(0.65 + 0.15 * face).add(poren.mul(0.1)), stein), metalness: float(0) };
    };
  },
});
