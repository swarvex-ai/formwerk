import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const gem = defineSprite({
  id: "gem", category: "items",
  title: { de: "Edelstein", en: "Gem" },
  description: {
    de: "Ein geschliffener Edelstein als Pixel-Symbol mit funkelndem Glanz: Brillant, rund, oval oder Smaragdschliff, in jeder Farbe. 16 × 16 Pixel.",
    en: "A cut gem as a pixel icon with a twinkling glint: brilliant, round, oval or emerald cut, in any colour. 16 × 16 pixels.",
  },
  params: {
    cut: { type: "choice", options: ["brilliant", "round", "oval", "emerald"], default: "brilliant", label: { de: "Schliff", en: "Cut" },
      labels: { brilliant: { de: "Brillant", en: "brilliant" }, round: { de: "rund", en: "round" }, oval: { de: "oval", en: "oval" }, emerald: { de: "Smaragd", en: "emerald" } },
      describe: { de: "Brillant mit Krone und Spitze, runder oder ovaler Cabochon, rechteckiger Smaragdschliff.", en: "A brilliant with crown and point, a round or oval cabochon, a rectangular emerald cut." } },
    color: { type: "color", default: "#e0405e", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Rubin #e0405e, Saphir #3f78e0, Smaragd #2fb36a, Amethyst #9a5ad8, Topas #f0b429.", en: "Ruby #e0405e, sapphire #3f78e0, emerald #2fb36a, amethyst #9a5ad8, topaz #f0b429." } },
    size: { type: "integer", min: 4, max: 6, default: 5, label: { de: "Größe", en: "Size" },
      describe: { de: "Halbe Breite in Pixeln: 4 ein kleiner Stein, 6 ein großer.", en: "Half the width in pixels: 4 a small stone, 6 a big one." } },
  },
  presets: {
    ruby: { label: { de: "Rubin", en: "Ruby" }, values: { cut: "brilliant", color: "#e0405e" } },
    sapphire: { label: { de: "Saphir", en: "Sapphire" }, values: { cut: "oval", color: "#3f78e0" } },
    emerald: { label: { de: "Smaragd", en: "Emerald" }, values: { cut: "emerald", color: "#2fb36a", size: 4 } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "shine", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const c = ramp(p.color), weiss = hex("#ffffff"), s = p.size;
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      if (p.cut === "brilliant") {
        // Crown: a trapezoid with a light table; pavilion: a triangle down to the point, light left and dark right
        const oben = 8 - Math.ceil(s * 0.8), guertel = oben + Math.ceil(s * 0.6);
        for (let y = oben; y <= guertel; y++) { const w = Math.round(s * 0.55 + (s - s * 0.55) * ((y - oben) / Math.max(1, guertel - oben))); for (let x = 8 - w; x < 8 + w; x++) b.set(x, y, y === oben ? c.light : x < 8 - w + 2 ? c.light : x >= 8 + w - 2 ? c.dark : c.base); }
        const spitze = Math.min(14, guertel + s + 1);
        for (let y = guertel + 1; y <= spitze; y++) { const w = Math.max(1, Math.round(s * (1 - (y - guertel) / (spitze - guertel + 1)))); for (let x = 8 - w; x < 8 + w; x++) b.set(x, y, x < 8 ? c.base : c.dark); }
        for (let x = 8 - s; x < 8 + s; x++) b.set(x, guertel, c.light);
      } else if (p.cut === "emerald") {
        const hw = s, hh = Math.max(3, s - 1);
        for (let y = 8 - hh; y < 8 + hh; y++) for (let x = 8 - hw; x < 8 + hw; x++) {
          const ecke = (x - (8 - hw) + (y - (8 - hh)) < 2) || ((8 + hw - 1 - x) + (y - (8 - hh)) < 2) || (x - (8 - hw) + (8 + hh - 1 - y) < 2) || ((8 + hw - 1 - x) + (8 + hh - 1 - y) < 2);
          if (ecke) continue;
          const innen = x > 8 - hw + 1 && x < 8 + hw - 2 && y > 8 - hh + 1 && y < 8 + hh - 2;
          b.set(x, y, innen ? c.base : y < 8 || x < 8 - hw + 1 ? c.light : c.dark);
        }
      } else {
        const rx = p.cut === "oval" ? Math.max(3, s - 1) : s, ry = p.cut === "oval" ? s + 1 : s;
        b.ellipse(8, 8, rx, Math.min(6.5, ry), c);
        b.set(8 - Math.round(rx * 0.4), 8 - Math.round(ry * 0.45), c.light);
      }
      // The glint: a little star that flares up and fades in the shine animation
      const g = animation === "shine" ? [0, 1, 2, 1][f] : 0, gx = 8 - Math.round(s * 0.4), gy = 8 - Math.round(s * 0.5);
      if (g >= 1) b.set(gx, gy, weiss);
      if (g >= 2) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) b.set(gx + dx, gy + dy, c.light);
      if (animation !== "shine") b.set(gx, gy, c.light);
      return b;
    };
  },
});
