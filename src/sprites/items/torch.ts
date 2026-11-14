import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const HOLZ = ramp("#7a5232"), TUCH = ramp("#a08262"), EISEN = ramp("#5b6068"), GLUT = hex("#fff6d0");

export const torch = defineSprite({
  id: "torch-sprite", category: "items",
  title: { de: "Fackel", en: "Torch" },
  description: {
    de: "Eine brennende Fackel als Pixel-Symbol für Inventar, Wände und Dungeons: Stiel, Kopf und Flamme frei wählbar, die Flamme flackert im Idle-Loop. 16 × 16 Pixel.",
    en: "A burning torch as a pixel icon for inventories, walls and dungeons: handle, head and flame as you like, the flame flickers in the idle loop. 16 × 16 pixels.",
  },
  params: {
    handle: { type: "integer", min: 3, max: 6, default: 5, label: { de: "Stiel", en: "Handle" },
      describe: { de: "Länge des Holzstiels in Pixeln: 3 ein kurzer Kienspan, 5 üblich, 6 eine lange Fackel (die Flamme bleibt dann höchstens 5 Pixel hoch).", en: "Length of the wooden handle in pixels: 3 a short pine stick, 5 usual, 6 a long torch (the flame then stays at most 5 pixels tall)." } },
    flame: { type: "integer", min: 1, max: 3, default: 2, label: { de: "Flamme", en: "Flame" },
      describe: { de: "Größe der Flamme: 1 eine kleine Glut (4 Pixel hoch, 3 breit), 2 üblich, 3 ein loderndes Feuer (6 Pixel hoch, 5 breit).", en: "Size of the flame: 1 a small glow (4 pixels tall, 3 wide), 2 usual, 3 a roaring fire (6 pixels tall, 5 wide)." } },
    head: { type: "choice", options: ["wrap", "cage"], default: "wrap", label: { de: "Kopf", en: "Head" },
      labels: { wrap: { de: "umwickelt", en: "wrapped" }, cage: { de: "Eisenkorb", en: "iron cage" } },
      describe: { de: "Was brennt: umwickelt mit pechgetränktem Tuch, oder ein Eisenkorb mit glühender Kohle für Wandhalter.", en: "What burns: a wrap of pitch-soaked cloth, or an iron cage with glowing coal for wall brackets." } },
    colour: { type: "color", default: "#ff8a1e", label: { de: "Feuer", en: "Fire" },
      describe: { de: "Farbe der Flamme: Orange #ff8a1e für Feuer, Blau #3f8cff für Magie, Grün #4fd35a für Gift oder Geister.", en: "Colour of the flame: orange #ff8a1e for fire, blue #3f8cff for magic, green #4fd35a for poison or ghosts." } },
  },
  presets: {
    torch: { label: { de: "Fackel", en: "Torch" }, values: { handle: 5, flame: 2, head: "wrap" } },
    sconce: { label: { de: "Wandfackel", en: "Sconce" }, values: { handle: 3, flame: 3, head: "cage" } },
    magic: { label: { de: "Magische Fackel", en: "Magic torch" }, values: { flame: 3, colour: "#3f8cff" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const feuer = ramp(p.colour), kopf = 12 - p.handle, hoch = Math.min(3 + p.flame, kopf - 1), breit = 1 + p.flame * 0.5;
    return (_a, _d, f) => {
      const b = new Pixels(W, H);
      // the handle, then the head on top of it
      b.part(7, kopf + 3, 2, p.handle, HOLZ);
      if (p.head === "wrap") { b.part(6, kopf, 4, 3, TUCH); b.rect(6, kopf + 1, 4, 1, TUCH.dark); }
      else {
        b.rect(6, kopf + 1, 4, 2, feuer.dark); b.set(7, kopf + 1, feuer.light);
        for (const x of [6, 9]) b.rect(x, kopf, 1, 3, EISEN.base);
        b.rect(6, kopf + 2, 4, 1, EISEN.dark); b.rect(5, kopf, 1, 1, EISEN.light); b.rect(10, kopf, 1, 1, EISEN.light);
      }
      // the flame: rows from the head up, narrowing to the tip; every frame sways the upper rows and lifts the tip
      const spitze = hoch - (f % 2), wellen = [0, 0.7, 0, -0.7];
      for (let k = 0; k < spitze; k++) {
        const y = kopf - 1 - k, u = k / spitze, w = breit * (1 - u ** 1.15) + 0.5, mitte = 8 + wellen[(f + k) % 4] * u;
        for (let x = 1; x < W - 1; x++) {
          const d = Math.abs(x + 0.5 - mitte) / w;
          if (d >= 1) continue;
          b.set(x, y, d < 0.35 && u < 0.4 ? GLUT : d < 0.6 && u < 0.8 ? feuer.light : d < 0.85 ? feuer.base : feuer.dark);
        }
      }
      // a spark above the tip in every other frame, where there is room
      const funke = kopf - 1 - spitze - 1;
      if (f % 2 === 1 && funke >= 1) b.set(f === 1 ? 7 : 9, funke, feuer.light);
      return b;
    };
  },
});
