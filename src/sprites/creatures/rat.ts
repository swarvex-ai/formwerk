import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16, G = 14;

export const rat = defineSprite({
  id: "rat", category: "creatures",
  title: { de: "Ratte", en: "Rat" },
  description: {
    de: "Eine kleine Kerkerratte in vier Richtungen, die huscht: Größe, Schwanz, Statur und Farben frei. 16 × 16 Pixel.",
    en: "A small dungeon rat in four directions, scurrying: size, tail, build and colours as you like. 16 × 16 pixels.",
  },
  params: {
    size: { type: "choice", options: ["small", "large"], default: "small", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "Klein", en: "Small" }, large: { de: "Groß", en: "Large" } },
      describe: { de: "Größe der Ratte: klein wie eine Hausratte, groß füllt die ganze Breite des Bildes (Riesenratte).", en: "Size of the rat: small like a house rat, large fills the whole width of the frame (giant rat)." } },
    tailLength: { type: "integer", min: 2, max: 8, default: 5, label: { de: "Schwanzlänge", en: "Tail length" },
      describe: { de: "Länge des Schwanzes in Pixeln: 2 Stummel, 5 üblich, 8 lang und dünn.", en: "Length of the tail in pixels: 2 a stub, 5 usual, 8 long and thin." } },
    fur: { type: "color", default: "#7a6a58", label: { de: "Fell", en: "Fur" },
      describe: { de: "Farbe des Fells: Graubraun #7a6a58, Weiß #f0ece4, Schwarz #3a3430.", en: "Colour of the fur: grey-brown #7a6a58, white #f0ece4, black #3a3430." } },
    eyeColor: { type: "color", default: "#1a1418", label: { de: "Augenfarbe", en: "Eye colour" },
      describe: { de: "Farbe der Augen: Schwarz üblich, Rot #d02030 bei Albinos, Gelb unheimlich.", en: "Colour of the eyes: black usual, red #d02030 for albinos, yellow eerie." } },
    build: { type: "choice", options: ["lean", "fat"], default: "lean", label: { de: "Statur", en: "Build" },
      labels: { lean: { de: "Schlank", en: "Lean" }, fat: { de: "Fett", en: "Fat" } },
      describe: { de: "Körperbau: schlank wie eine Straßenratte oder fett und rund wie eine satte Kanalratte.", en: "Build of the body: lean like a street rat or fat and round like a well-fed sewer rat." } },
  },
  presets: {
    "sewer-rat": { label: { de: "Kanalratte", en: "Sewer rat" }, values: { fur: "#7a6a58", eyeColor: "#1a1418" } },
    "white-rat": { label: { de: "Weiße Ratte", en: "White rat" }, values: { fur: "#f0ece4", eyeColor: "#d02030", tailLength: 4 } },
    "giant-rat": { label: { de: "Riesenratte", en: "Giant rat" }, values: { size: "large", build: "fat", fur: "#3a3430", eyeColor: "#e0b020" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "walk", frames: 4, fps: 8, loop: true }],
  grounded: true,
  build(p) {
    const k = ramp(p.fur), rosa = ramp("#d49a98"), auge = hex(p.eyeColor), gross = p.size === "large", fett = p.build === "fat";
    const schwanz = (b: Pixels, x: number, y: number, dx: number, f: number, walk: boolean) => {
      // Tail from (x, y) leftwards (dx -1) or rightwards; at the frame edge it curls up; the tip sways
      for (let i = 0; i < p.tailLength; i++) {
        let tx = x + dx * i, ty = y;
        if (tx < 1 || tx > W - 2) { tx = Math.max(1, Math.min(W - 2, tx)); ty = y - (i - Math.abs(tx - x)); }
        const wippe = i >= p.tailLength - 2 ? (walk ? [0, -1, 0, 1][f] : f ? -1 : 0) : 0;
        b.set(tx, ty + wippe, i % 2 ? rosa.dark : rosa.base);
      }
    };
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H), walk = animation === "walk";
      const cx = gross ? 7.5 : 8, rx = gross ? 4.5 : 3.5, ry = fett ? 2.8 : 2, cy = G - 3;
      const vorn = [-1, 0, 1, 0][f], hinten = -vorn;
      // Legs: front pair and hind pair swing against each other
      const bein = (x: number, s: number) => { b.set(x + (walk ? s : 0), G, k.dark); b.set(x + (walk ? s : 0), G - 1, k.dark); };
      bein(Math.round(cx + rx - 2), vorn); bein(Math.round(cx - rx + 1), hinten);
      schwanz(b, Math.round(cx - rx), cy + 1, -1, f, walk);
      b.ellipse(cx, cy, rx, ry, k);
      // Head with snout, ear and eye
      const hx = cx + rx - 0.5;
      b.ellipse(hx, cy + 0.5, 2.2, 1.8, k);
      b.set(Math.round(hx + 2), cy + 1, rosa.base);
      b.set(Math.round(hx - 0.5), cy - 2, rosa.base); b.set(Math.round(hx - 1.5), cy - 2, k.light);
      b.set(Math.round(hx + 1), cy, auge);
      if (animation === "idle" && f) b.set(Math.min(14, Math.round(hx + 3)), cy + 2, k.light);
      return b;
    };
    const vorne = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H), walk = animation === "walk";
      const br = gross ? 5 : 4, kr = gross ? 3.5 : 3;
      b.ellipse(8, 11.5, br + (fett ? 1 : 0) - 1, fett ? 2.6 : 2.2, k);
      // Paws: one steps up while the other stays down
      const links = walk ? [0, 1, 0, 0][f] : 0, rechtsF = walk ? [0, 0, 0, 1][f] : 0;
      b.rect(5, G - 1 - links, 2, 2 + links, k.dark); b.rect(9, G - 1 - rechtsF, 2, 2 + rechtsF, k.dark);
      b.ellipse(8, 8.5, kr, 2.6, k);
      b.ellipse(8 - kr + 0.5, 5.5, 1.6, 1.6, k); b.ellipse(8 + kr - 0.5, 5.5, 1.6, 1.6, k);
      b.set(Math.round(8 - kr + 0.5), 5, rosa.base); b.set(Math.round(7.5 + kr - 0.5), 5, rosa.base);
      b.set(6, 8, auge); b.set(9, 8, auge);
      b.set(7, 10, rosa.light); b.set(8, 10, rosa.light);
      if (animation === "idle" && f) { b.set(8 - kr - 1, 10, k.light); b.set(7 + kr + 1, 10, k.light); }
      else { b.set(8 - kr - 1, 9, k.light); b.set(7 + kr + 1, 9, k.light); }
      return b;
    };
    const hinten = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H), walk = animation === "walk";
      const br = gross ? 5 : 4;
      const links = walk ? [0, 1, 0, 0][f] : 0, rechtsF = walk ? [0, 0, 0, 1][f] : 0;
      b.rect(5, G - 1 - links, 2, 2 + links, k.dark); b.rect(9, G - 1 - rechtsF, 2, 2 + rechtsF, k.dark);
      b.ellipse(8, 10, br + (fett ? 1 : 0) - 1, fett ? 3.2 : 2.8, k);
      b.ellipse(8, 6, gross ? 3 : 2.5, 2, k);
      b.ellipse(8 - (gross ? 2.5 : 2), 4.5, 1.5, 1.5, k); b.ellipse(8 + (gross ? 2.5 : 2), 4.5, 1.5, 1.5, k);
      // Tail hangs from the rump and lies on the ground, sweeping to alternating sides
      const seite = (walk ? f % 2 : f) ? -1 : 1;
      for (let i = 0; i < p.tailLength; i++) {
        b.set(8 + (i ? seite * (i - 1) : 0), i ? G : 13, i % 2 ? rosa.dark : rosa.base);
      }
      return b;
    };
    return (animation, d, f) => d === "right" ? rechts(animation, f) : d === "left" ? rechts(animation, f).mirrored() : d === "down" ? vorne(animation, f) : hinten(animation, f);
  },
});
