import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 24, H = 24;

export const ghost = defineSprite({
  id: "ghost", category: "creatures",
  title: { de: "Geist", en: "Ghost" },
  description: {
    de: "Ein schwebender Geist mit wehendem Saum: niedlich oder gruselig, Größe und Farbe frei. 24 × 24 Pixel.",
    en: "A floating ghost with a waving hem: cute or spooky, size and colour as you like. 24 × 24 pixels.",
  },
  params: {
    size: { type: "integer", min: 12, max: 19, default: 17, label: { de: "Größe", en: "Size" },
      describe: { de: "Höhe in Pixeln: 12 klein, 17 üblich, 19 groß.", en: "Height in pixels: 12 small, 17 usual, 19 big." } },
    face: { type: "choice", options: ["cute", "spooky"], default: "cute", label: { de: "Gesicht", en: "Face" },
      labels: { cute: { de: "niedlich", en: "cute" }, spooky: { de: "gruselig", en: "spooky" } },
      describe: { de: "Niedlich mit Knopfaugen, gruselig mit hohlen Augen und offenem Mund.", en: "Cute with button eyes, spooky with hollow eyes and an open mouth." } },
    waves: { type: "integer", min: 2, max: 4, default: 3, label: { de: "Zipfel", en: "Waves" },
      describe: { de: "Zahl der Zipfel am Saum.", en: "Number of points along the hem." } },
    color: { type: "color", default: "#e8ecf5", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe des Geists: Weiß #e8ecf5, Grün #a8f0c0 für einen Sumpfgeist, Blau #a8c8ff.", en: "Colour of the ghost: white #e8ecf5, green #a8f0c0 for a bog spirit, blue #a8c8ff." } },
  },
  presets: {
    friendly: { label: { de: "Freundlich", en: "Friendly" }, values: { face: "cute", size: 15 } },
    spooky: { label: { de: "Gruselig", en: "Spooky" }, values: { face: "spooky", size: 19, waves: 4 } },
    "bog-spirit": { label: { de: "Sumpfgeist", en: "Bog spirit" }, values: { color: "#a8f0c0", face: "spooky", size: 16 } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "float", frames: 4, fps: 6, loop: true }],
  grounded: false,
  build(p) {
    const g = ramp(p.color), dunkel = hex("#1e1a2e"), h = p.size, r = Math.min(8, Math.round(h * 0.42));
    return (_a, _d, f) => {
      const b = new Pixels(W, H), dy = [0, -1, 0, 1][f], oben = Math.round((23 - h) / 2) + dy, saum = oben + h - 2;
      // Dome and body
      for (let y = oben; y <= saum; y++) {
        const ry = y - (oben + r), w = y < oben + r ? Math.sqrt(Math.max(0, r * r - ry * ry)) : r;
        for (let x = Math.round(12 - w); x < Math.round(12 + w); x++) b.set(x, y, x < 12 - w + 2 ? g.light : x >= 12 + w - 2 ? g.dark : g.base);
      }
      // The hem: points that sway from frame to frame
      const breite = (2 * r) / p.waves;
      for (let x = 12 - r; x < 12 + r; x++) {
        const phase = ((x - (12 - r) + f) % breite) / breite, tief = phase < 0.5 ? 2 : 1;
        for (let j = 1; j <= tief; j++) b.set(x, saum + j, j === tief ? g.dark : g.base);
      }
      const ay = oben + Math.round(r * 0.9);
      if (p.face === "cute") { b.rect(9, ay, 2, 2, dunkel); b.rect(13, ay, 2, 2, dunkel); b.set(9, ay, g.light); b.set(13, ay, g.light); }
      else { b.rect(9, ay - 1, 2, 3, dunkel); b.rect(13, ay - 1, 2, 3, dunkel); b.rect(11, ay + 3, 2, 2, dunkel); }
      return b;
    };
  },
});
