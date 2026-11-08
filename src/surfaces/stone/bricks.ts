import { color, float, floor, fract, min, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap1 } from "../noise";

export const bricks = defineSurface({
  id: "bricks", category: "stone",
  title: { de: "Ziegelmauer", en: "Brick wall" },
  description: {
    de: "Mauerwerk aus Ziegeln mit Mörtelfugen, im Läuferverband versetzt oder gestapelt: vom roten Backstein bis zum hellen Klinker, auf Wunsch verrußt. Eine Kachel ist 1 × 1 m.",
    en: "Brickwork with mortar joints, in running bond or stacked: from red brick to pale clinker, sooty if you like. One tile is 1 × 1 m.",
  },
  params: {
    courses: { type: "integer", min: 6, max: 18, default: 14, label: { de: "Lagen pro Meter", en: "Courses per metre" },
      describe: { de: "Ziegelreihen auf einen Meter Höhe (gerade Zahl, sonst eine mehr): 8 große Blöcke, 14 normale Ziegel, 18 flache Klinker.", en: "Rows of bricks per metre of height (even, otherwise one more): 8 big blocks, 14 standard bricks, 18 flat clinkers." } },
    length: { type: "integer", min: 2, max: 6, default: 4, label: { de: "Ziegel pro Meter", en: "Bricks per metre" },
      describe: { de: "Ziegel nebeneinander auf einem Meter: 4 normale Ziegel (25 cm), 2 lange Blöcke, 6 kurze Steine.", en: "Bricks side by side in a metre: 4 standard bricks (25 cm), 2 long blocks, 6 short stones." } },
    mortar: { type: "number", min: 0.004, max: 0.025, step: 0.001, default: 0.011, unit: "m", label: { de: "Fuge", en: "Joint" },
      describe: { de: "Breite der Mörtelfuge: 0,006 m eng, 0,011 m üblich, 0,02 m grob.", en: "Width of the mortar joint: 0.006 m tight, 0.011 m usual, 0.02 m rough." } },
    bond: { type: "choice", options: ["running", "stack"], default: "running", label: { de: "Verband", en: "Bond" },
      labels: { running: { de: "Läuferverband", en: "running bond" }, stack: { de: "gestapelt", en: "stack bond" } },
      describe: { de: "Läuferverband mit halb versetzten Reihen wie an den meisten Häusern, oder Fugen in einer Linie.", en: "Running bond with rows offset by half a brick like most houses, or joints in line." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Farbvielfalt", en: "Colour variation" },
      describe: { de: "Wie verschieden die Ziegel gefärbt sind: 0 alle gleich, 1 deutlich hell und dunkel.", en: "How different the bricks are in colour: 0 all alike, 1 clearly light and dark." } },
    soot: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Ruß", en: "Soot" },
      describe: { de: "Dunkle Flecken von Ruß und Alter: 0 sauber, 0,4 eine alte Fabrik, 1 ein Kamin.", en: "Dark patches of soot and age: 0 clean, 0.4 an old factory, 1 a chimney." } },
    color: { type: "color", default: "#9c4a32", label: { de: "Ziegelfarbe", en: "Brick colour" },
      describe: { de: "Rot #9c4a32, Klinker #6e3b2c, Gelb #c9a46a, Grau #8a8a86.", en: "Red #9c4a32, clinker #6e3b2c, yellow #c9a46a, grey #8a8a86." } },
    mortarColor: { type: "color", default: "#bfb6a6", label: { de: "Mörtel", en: "Mortar" },
      describe: { de: "Farbe des Mörtels.", en: "Colour of the mortar." } },
  },
  presets: {
    "red-brick": { label: { de: "Backstein", en: "Red brick" }, values: { color: "#9c4a32" } },
    clinker: { label: { de: "Klinker", en: "Clinker" }, values: { courses: 16, color: "#6e3b2c", mortarColor: "#5a554e", variation: 0.7 } },
    "old-factory": { label: { de: "Alte Fabrik", en: "Old factory" }, values: { soot: 0.5, variation: 0.8, mortar: 0.015 } },
  },
  tile: 1, depth: 0.008,
  build(p, seed) {
    const rows = p.courses + (p.courses % 2), len = p.length, ziegel = color(p.color), moertel = color(p.mortarColor);
    return (q, res) => {
      const reihe = floor(q.y.mul(rows)).toVar(), y = fract(q.y.mul(rows)).toVar(), zeile = wrap1(reihe, rows).toVar();
      // Running bond: every other course shifted by half a brick
      const versatz = p.bond === "running" ? fract(zeile.mul(0.5)) : float(0);
      const xs = q.x.mul(len).add(versatz).toVar(), x = fract(xs).toVar(), id = cell(vec2(wrap1(floor(xs), len), zeile), seed).toVar();
      const kante = min(min(y, float(1).sub(y)).div(rows), min(x, float(1).sub(x)).div(len)).toVar();
      // The brick's arris is rounded: the edge fades over a few millimetres (also keeps thin joints from flickering)
      const stein = ramp(kante, p.mortar / 2 - 0.002, p.mortar / 2 + 0.009).toVar();
      const fein = fbm(q, [16, 16], res, 0.6, seed + 1).toVar(), poren = fbm(q, [96, 96], res, 0.7, seed + 2).toVar();
      const russ = p.soot > 0 ? ramp(fbm(q, [3, 3], 128, 0.55, seed + 3, 4).add(id.mul(0.3)), 0.6 - p.soot * 0.9, 1 - p.soot * 0.5).mul(p.soot) : float(0);
      const height = stein.mul(id.mul(0.15).add(0.8)).add(fein.mul(0.05)).add(poren.mul(0.03)).clamp(0, 1);
      const farbe = ziegel.mul(id.sub(0.5).mul(p.variation * 0.6).add(1)).mul(fein.mul(0.18).add(poren.mul(0.1)).add(1));
      const col = mix(mix(moertel.mul(poren.mul(0.15).add(0.9)), farbe, stein), farbe.mul(0.25), russ);
      return { height, color: col, roughness: mix(float(0.95), poren.mul(0.08).add(0.8), stein), metalness: float(0) };
    };
  },
});
