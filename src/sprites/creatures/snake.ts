import { Pixels, ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 16, H = 16, BODEN = 14;
const mod = (a: number, n: number) => ((a % n) + n) % n;

export const snake = defineSprite({
  id: "snake", category: "creatures",
  title: { de: "Schlange", en: "Snake" },
  description: {
    de: "Eine kleine Schlange, die züngelt und schlängelt: Länge, Kopfgröße, Farben und Zeichnung frei wählbar, in vier Richtungen. 16 × 16 Pixel pro Bild, der Körper liegt auf der untersten Zeile.",
    en: "A small snake that flicks its tongue and slithers: length, head, colours and pattern as you like, in four directions. 16 × 16 pixels per frame, the body lying on the bottom row.",
  },
  params: {
    length: { type: "choice", options: ["short", "long"], default: "short", label: { de: "Länge", en: "Length" },
      labels: { short: { de: "kurz", en: "short" }, long: { de: "lang", en: "long" } },
      describe: { de: "Wie weit der Körper hinter dem Kopf liegt: kurz eine handlange Schlange, lang füllt sie die Breite des Bildes.", en: "How far the body lies behind the head: short a hand-length snake, long it fills the width of the frame." } },
    bodyColour: { type: "color", default: "#5a8a3a", label: { de: "Rücken", en: "Body colour" },
      describe: { de: "Farbe des Rückens: Grün #5a8a3a wie die Ringelnatter, Rot #c9382e wie die Korallenschlange, Braun #7a5a3a wie die Viper.", en: "Colour of the back: green #5a8a3a like the grass snake, red #c9382e like the coral snake, brown #7a5a3a like the viper." } },
    bellyColour: { type: "color", default: "#d8cf9a", label: { de: "Bauch", en: "Belly colour" },
      describe: { de: "Farbe des Bauches und der Zeichnung: Hellgelb #d8cf9a bei der Ringelnatter, fast Schwarz #221d2b bei der Korallenschlange.", en: "Colour of the belly and of the pattern: pale yellow #d8cf9a on the grass snake, near black #221d2b on the coral snake." } },
    pattern: { type: "choice", options: ["plain", "bands", "diamonds"], default: "plain", label: { de: "Zeichnung", en: "Pattern" },
      labels: { plain: { de: "einfarbig", en: "plain" }, bands: { de: "Ringe", en: "bands" }, diamonds: { de: "Rauten", en: "diamonds" } },
      describe: { de: "Zeichnung des Rückens: einfarbig, helle Ringe alle drei Pixel oder Rauten entlang der Wirbellinie.", en: "Pattern of the back: plain, light bands every three pixels or diamonds along the spine." } },
    headSize: { type: "integer", min: 1, max: 3, default: 1, label: { de: "Kopfgröße", en: "Head size" },
      describe: { de: "Zusätzliche Breite des Kopfes über den Körper hinaus in Pixeln: 1 schlank wie die Ringelnatter, 3 breit wie die Kreuzotter.", en: "Extra width of the head beyond the body in pixels: 1 slim like the grass snake, 3 broad like the adder." } },
  },
  presets: {
    "grass-snake": { label: { de: "Ringelnatter", en: "Grass snake" }, values: { bodyColour: "#5a8a3a", bellyColour: "#d8cf9a", pattern: "plain" } },
    coral: { label: { de: "Korallenschlange", en: "Coral snake" }, values: { bodyColour: "#c9382e", bellyColour: "#221d2b", pattern: "bands" } },
    viper: { label: { de: "Viper", en: "Viper" }, values: { bodyColour: "#7a5a3a", bellyColour: "#2e2418", pattern: "diamonds", headSize: 3 } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [{ name: "idle", frames: 2, fps: 4, loop: true }, { name: "slither", frames: 4, fps: 8, loop: true }],
  grounded: true,
  build(p) {
    const k = ramp(p.bodyColour), ba = ramp(p.bellyColour), zunge = ramp("#b03040");
    const zuengelt = (animation: string, f: number) => f === 1 || (animation === "slither" && f % 2 === 1);

    // One frame seen from the right: an S-curve lying on the ground, the head raised at the front
    const seitlich = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H), phase = animation === "slither" ? 2 * f : 0;
      const xHeck = p.length === "long" ? 1 : 5, xNacken = 10, kopfW = 3 + p.headSize;
      const hebt: number[] = [];
      for (let x = xHeck; x <= xNacken; x++) {
        const t = (x - xHeck) / (xNacken - xHeck);
        hebt.push(Math.round(Math.min(1, t * 2.5) * Math.sin(((x + phase) * Math.PI) / 4)));
      }
      const tiefste = Math.min(0, ...hebt);
      for (let x = xHeck; x <= xNacken; x++) {
        const grund = BODEN - (hebt[x - xHeck] - tiefste);
        const dicke = 1 + Math.min(2, Math.floor(((x - xHeck) / (xNacken - xHeck)) * 5));
        for (let j = 0; j < dicke; j++) b.set(x, grund - j, j === dicke - 1 ? k.light : j === 0 && dicke >= 2 ? ba.base : k.base);
        if (p.pattern === "bands" && mod(x + phase, 3) === 0) for (let j = 0; j < dicke; j++) b.set(x, grund - j, ba.deep);
        if (p.pattern === "diamonds" && dicke >= 3 && mod(x + phase, 4) === 0) {
          b.set(x, grund - 1, ba.deep);
          b.set(x - 1, grund - 1, ba.deep); b.set(x + 1, grund - 1, ba.deep);
        }
      }
      // Neck into the raised head, the tongue flicking from the mouth
      for (let x = xNacken - 1; x <= xNacken; x++) {
        const grund = BODEN - (hebt[x - xHeck] - tiefste);
        for (let y = 10; y <= grund - 2; y++) if (!b.alpha(x, y)) b.set(x, y, k.base);
      }
      b.part(12 - kopfW + 1, 8, kopfW, 3, k, true);
      b.set(11, 9, k.deep);
      if (zuengelt(animation, f)) { b.set(13, 9, zunge.base); b.set(14, 8, zunge.light); b.set(14, 10, zunge.base); }
      return b;
    };

    // Down and up: the body coiled on the ground, the head on top of it (down) or the tail tip over it (up)
    const front = (animation: string, d: Direction, f: number): Pixels => {
      const b = new Pixels(W, H), slither = animation === "slither";
      const phase = slither ? 2 * f : 0, sway = slither ? [0, 1, 0, -1][f] : 0;
      const huelse = new Pixels(W, H);
      huelse.ellipse(7.5, BODEN, p.length === "long" ? 5.5 : 4.5, 4.5, k);
      for (let x = 1; x < 15; x++) for (let y = 9; y <= BODEN; y++) if (huelse.alpha(x, y)) b.set(x, y, huelse.get(x, y));
      if (p.pattern === "bands") for (let x = 1; x < 15; x++) if (mod(x + phase, 3) === 0) for (let y = 9; y <= BODEN; y++) if (b.alpha(x, y)) b.set(x, y, ba.deep);
      if (p.pattern === "diamonds") for (let x = 2; x < 14; x++) if (mod(x + phase, 4) === 0) for (const [dx, dy] of [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]]) {
        if (b.alpha(x + dx, 12 + dy)) b.set(x + dx, 12 + dy, ba.deep);
      }
      for (let x = 1; x < 15; x++) if (b.alpha(x, BODEN)) b.set(x, BODEN, ba.base);
      if (d === "down") {
        const hw = 3 + p.headSize, x0 = Math.round(7.5 - hw / 2) + sway;
        b.part(x0, 7, hw, 3, k, true);
        b.set(x0 + 1, 8, k.deep); b.set(x0 + hw - 2, 8, k.deep);
        if (zuengelt(animation, f)) {
          const zx = 7 + sway;
          b.set(zx, 10, zunge.base); b.set(zx + 1, 10, zunge.base); b.set(zx, 11, zunge.base); b.set(zx + 1, 11, zunge.light);
        }
      } else {
        // the tail tip lies over the coil; a dark pixel under it lifts it from the back
        const [tx, ty] = slither ? [[8, 10], [9, 10], [7, 10], [8, 9]][f] : [8 + f, 10];
        b.set(tx, ty, k.base); b.set(tx, ty + 1, k.dark);
      }
      return b;
    };

    return (animation, d, f) => {
      if (d === "right") return seitlich(animation, f);
      if (d === "left") return seitlich(animation, f).mirrored();
      return front(animation, d, f);
    };
  },
});
