import { CLEAR, hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const METALL = { gold: "#e8b631", silver: "#c9ced6", copper: "#c87533" } as const;

export const coin = defineSprite({
  id: "coin", category: "items",
  title: { de: "Münze", en: "Coin" },
  description: {
    de: "Eine Münze als Pixel-Symbol, die sich dreht: Gold, Silber oder Kupfer, mit Stern, Loch oder glatt. 16 × 16 Pixel.",
    en: "A coin as a pixel icon that spins: gold, silver or copper, with a star, a hole or plain. 16 × 16 pixels.",
  },
  params: {
    metal: { type: "choice", options: ["gold", "silver", "copper"], default: "gold", label: { de: "Metall", en: "Metal" },
      labels: { gold: { de: "Gold", en: "gold" }, silver: { de: "Silber", en: "silver" }, copper: { de: "Kupfer", en: "copper" } },
      describe: { de: "Gold für viel Wert, Silber und Kupfer für Kleingeld.", en: "Gold for high value, silver and copper for small change." } },
    size: { type: "integer", min: 4, max: 6, default: 5, label: { de: "Größe", en: "Size" },
      describe: { de: "Radius in Pixeln: 4 eine kleine Münze, 6 eine große.", en: "Radius in pixels: 4 a small coin, 6 a big one." } },
    mark: { type: "choice", options: ["star", "hole", "plain"], default: "star", label: { de: "Prägung", en: "Mark" },
      labels: { star: { de: "Stern", en: "star" }, hole: { de: "Loch", en: "hole" }, plain: { de: "glatt", en: "plain" } },
      describe: { de: "Ein geprägter Stern, ein Loch in der Mitte wie bei alten Münzen, oder glatt.", en: "A stamped star, a hole in the middle like old coins, or plain." } },
  },
  presets: {
    gold: { label: { de: "Goldmünze", en: "Gold coin" }, values: { metal: "gold", mark: "star" } },
    silver: { label: { de: "Silbermünze", en: "Silver coin" }, values: { metal: "silver", size: 4 } },
    "old-coin": { label: { de: "Alte Münze", en: "Old coin" }, values: { metal: "copper", mark: "hole", size: 6 } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "spin", frames: 6, fps: 10, loop: true }],
  grounded: false,
  build(p) {
    const m = ramp(METALL[p.metal as keyof typeof METALL]), glanz = hex("#fff8e0"), r = p.size;
    return (animation, _d, f) => {
      const b = new Pixels(W, H), breite = animation === "spin" ? Math.abs(Math.cos((Math.PI * f) / 6)) : 1;
      if (breite < 0.2) { b.rect(7, 8 - r, 2, 2 * r, m.dark); b.rect(7, 8 - r + 1, 1, 2 * r - 2, m.base); return b; }
      // Rim and face: the face one pixel in, a little lighter
      const rx = Math.max(1, r * breite);
      b.ellipse(8, 8, rx, r, { ...m, light: m.base, base: m.dark });
      if (rx > 2) b.ellipse(8, 8, rx - 1, r - 1, m);
      if (breite > 0.6) {
        // The stamp: a small embossed star, narrower while the coin turns
        if (p.mark === "star") {
          if (breite > 0.9) { b.rect(7, 6, 2, 4, m.light); b.rect(6, 7, 4, 2, m.light); b.set(7, 7, glanz); }
          else b.rect(7, 6, 1, 4, m.light);
        }
        if (p.mark === "hole") b.rect(7, 7, 2, 2, CLEAR);
      }
      if (breite > 0.6 && p.mark !== "hole") b.set(Math.round(8 - rx * 0.5), 8 - r + 2, glanz);
      return b;
    };
  },
});
