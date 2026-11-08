import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const bomb = defineSprite({
  id: "bomb", category: "items",
  title: { de: "Bombe", en: "Bomb" },
  description: {
    de: "Eine runde Bombe mit Zündschnur als Pixel-Symbol; im Brennen-Loop sprüht der Funke. 16 × 16 Pixel.",
    en: "A round bomb with a fuse as a pixel icon; in the burning loop the spark sputters. 16 × 16 pixels.",
  },
  params: {
    size: { type: "integer", min: 4, max: 5, default: 5, label: { de: "Größe", en: "Size" },
      describe: { de: "Radius der Kugel in Pixeln: 4 klein, 5 groß.", en: "Radius of the ball in pixels: 4 small, 5 big." } },
    fuse: { type: "integer", min: 1, max: 4, default: 3, label: { de: "Zündschnur", en: "Fuse" },
      describe: { de: "Länge der Zündschnur: 1 kurz vor dem Knall, 4 noch Zeit.", en: "Length of the fuse: 1 about to blow, 4 still time." } },
    color: { type: "color", default: "#2e3440", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe der Kugel: Schwarz #2e3440, Rot #a83a3a für eine Spielzeugbombe.", en: "Colour of the ball: black #2e3440, red #a83a3a for a toy bomb." } },
    spark: { type: "color", default: "#ffb000", label: { de: "Funke", en: "Spark" },
      describe: { de: "Farbe des Funkens.", en: "Colour of the spark." } },
  },
  presets: {
    classic: { label: { de: "Klassisch", en: "Classic" }, values: { size: 5, fuse: 3 } },
    "short-fuse": { label: { de: "Gleich knallt's", en: "Short fuse" }, values: { fuse: 1, spark: "#ff5a2a" } },
    toy: { label: { de: "Spielzeug", en: "Toy" }, values: { size: 4, color: "#a83a3a", fuse: 2 } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "burn", frames: 4, fps: 12, loop: true }],
  grounded: false,
  build(p) {
    const k = ramp(p.color), kappe = ramp("#6b7078"), schnur = ramp("#c9a36b"), funke = ramp(p.spark), weiss = hex("#fff6d0");
    const r = p.size, cx = 6, cy = 14 - r;
    // The cap on the ball's upper right, the fuse curling up and to the right from it, the spark at its end
    const kx = cx + Math.round(0.7 * r) - 1, ky = cy - Math.round(0.7 * r) - 1;
    const schnurPunkte: [number, number][] = [[kx + 2, ky - 1], [kx + 3, ky - 1], [kx + 3, ky - 2], [kx + 4, ky - 2]].slice(0, p.fuse) as [number, number][];
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      b.ellipse(cx, cy + 0.5, r, r, k);
      b.set(cx - Math.round(r * 0.45), cy - Math.round(r * 0.45), k.light);
      b.set(cx - Math.round(r * 0.45) + 1, cy - Math.round(r * 0.45), k.light);
      b.part(kx, ky, 3, 2, kappe);
      schnurPunkte.forEach(([x, y], i) => b.set(x, y, i % 2 ? schnur.dark : schnur.base));
      const [x, y] = schnurPunkte[schnurPunkte.length - 1];
      // A dot at rest, sputtering when it burns
      const muster = animation === "burn" ? [[[0, -1], [1, 0], [-1, 0], [0, 1]], [[1, -1], [-1, -1], [1, 1]], [[0, -1], [1, 0]], [[-1, -1], [1, -1], [1, 1]]][f] : [];
      b.set(x, y, animation === "burn" && f % 2 ? weiss : funke.light);
      for (const [dx, dy] of muster) b.set(x + dx, y + dy, funke.base);
      return b;
    };
  },
});
