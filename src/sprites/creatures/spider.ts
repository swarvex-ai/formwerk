import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 24, H = 24;

export const spider = defineSprite({
  id: "spider", category: "creatures",
  title: { de: "Spinne", en: "Spider" },
  description: {
    de: "Eine Spinne von der Seite, die krabbelt: Körper, Beinlänge und Farben frei, mit leuchtenden Augen. 24 × 24 Pixel.",
    en: "A spider from the side, crawling: body, leg length and colours as you like, with glowing eyes. 24 × 24 pixels.",
  },
  params: {
    size: { type: "integer", min: 3, max: 6, default: 5, label: { de: "Größe", en: "Size" },
      describe: { de: "Halbe Breite des Hinterleibs in Pixeln: 3 klein, 5 üblich, 6 eine Riesenspinne.", en: "Half the width of the abdomen in pixels: 3 small, 5 usual, 6 a giant spider." } },
    legs: { type: "integer", min: 3, max: 6, default: 5, label: { de: "Beine", en: "Legs" },
      describe: { de: "Höhe der Beine in Pixeln: 3 gedrungen, 5 üblich, 6 lang wie ein Weberknecht.", en: "Height of the legs in pixels: 3 squat, 5 usual, 6 long like a daddy longlegs." } },
    color: { type: "color", default: "#3a2f3a", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe der Spinne: Schwarz #3a2f3a, Braun #6b4a2f, Giftgrün #4a8a3e.", en: "Colour of the spider: black #3a2f3a, brown #6b4a2f, poison green #4a8a3e." } },
    eyes: { type: "color", default: "#e04040", label: { de: "Augen", en: "Eyes" },
      describe: { de: "Farbe der Augen.", en: "Colour of the eyes." } },
  },
  presets: {
    house: { label: { de: "Hausspinne", en: "House spider" }, values: { size: 3, legs: 4, color: "#6b4a2f", eyes: "#2a2020" } },
    giant: { label: { de: "Riesenspinne", en: "Giant spider" }, values: { size: 6, legs: 6, color: "#2a2230" } },
    poison: { label: { de: "Giftspinne", en: "Poison spider" }, values: { color: "#4a8a3e", eyes: "#f0c419" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "walk", frames: 4, fps: 10, loop: true }],
  grounded: true,
  build(p) {
    const k = ramp(p.color), auge = hex(p.eyes), boden = 22;
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H), s = p.size, koerper = boden - p.legs - 1, hop = animation === "walk" && f % 2 ? -1 : 0;
      // Four legs on the near side: up to a knee above the body, down to a foot on the ground; walking, pairs swap
      const fuesse = [-7, -3, 2, 6];
      fuesse.forEach((fx, i) => {
        const schritt = animation === "walk" ? ((i + f) % 2 ? 1 : -1) * (f % 2 ? 1 : 0) : 0, x0 = 12 + Math.round(fx * 0.35), knieX = 12 + Math.round(fx * 0.95), knieY = koerper - s - 1 + hop;
        const fussX = 12 + Math.round(fx * 1.25) + schritt, hebt = animation === "walk" && (i + f) % 2 === 1 && f % 2 === 1;
        for (let t = 0; t <= 4; t++) b.set(Math.round(x0 + ((knieX - x0) * t) / 4), Math.round(koerper + hop + ((knieY - koerper - hop) * t) / 4), k.dark);
        const fussY = boden - (hebt ? 1 : 0);
        for (let t = 0; t <= 6; t++) b.set(Math.round(knieX + ((fussX - knieX) * t) / 6), Math.round(knieY + ((fussY - knieY) * t) / 6), k.base);
      });
      // Abdomen behind, head in front, eyes at the front of the head
      b.ellipse(10, koerper + hop, s, s * 0.8, k);
      b.ellipse(10 + s + 1, koerper + 1 + hop, Math.max(2, s * 0.5), Math.max(1.5, s * 0.45), k);
      const ax = Math.round(10 + s + 1 + Math.max(2, s * 0.5) * 0.5);
      b.set(ax, koerper + hop, auge); b.set(ax - 1, koerper + hop, auge);
      b.set(9, Math.round(koerper - s * 0.5) + hop, k.light);
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
