import { rng } from "../../core/rng";
import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16, BODEN = 14;

export const snail = defineSprite({
  id: "snail", category: "creatures",
  title: { de: "Schnecke", en: "Snail" },
  description: {
    de: "Eine Gartenschnecke im Profil für Gärten, Wälder und Regenlevel: wackelt mit den Fühlern, kriecht und zieht sich in ihr Haus zurück. Farben, Hausgröße, Spirale und Flecken frei wählbar. 16 × 16 Pixel pro Bild, der Fuß auf der untersten Zeile.",
    en: "A garden snail in profile for gardens, forests and rainy levels: wiggles its eye stalks, crawls and withdraws into its shell. Colours, shell size, spiral and flecks as you like. 16 × 16 pixels per frame, the foot on the bottom row.",
  },
  params: {
    shellColour: { type: "color", default: "#a0643a", label: { de: "Hausfarbe", en: "Shell colour" },
      describe: { de: "Farbe des Schneckenhauses: Braun #a0643a wie die Weinbergschnecke, Dunkelbraun #5a3a2a im Wald, Rosa #e8a0c0.", en: "Colour of the shell: brown #a0643a like a garden snail, dark brown #5a3a2a in the forest, pink #e8a0c0." } },
    bodyColour: { type: "color", default: "#b8a888", label: { de: "Körperfarbe", en: "Body colour" },
      describe: { de: "Farbe von Fuß, Kopf und Fühlern: Graubeige #b8a888, Dunkelgrau #5a5048, Cremeweiß #e0d0b0.", en: "Colour of foot, head and eye stalks: grey-beige #b8a888, dark grey #5a5048, cream #e0d0b0." } },
    shellSize: { type: "integer", min: 5, max: 7, default: 6, label: { de: "Hausgröße", en: "Shell size" },
      describe: { de: "Durchmesser des Hauses in Pixeln: 5 klein wie bei einer Bänderschnecke, 6 üblich, 7 groß wie bei einer Weinbergschnecke.", en: "Diameter of the shell in pixels: 5 small like a banded snail, 6 usual, 7 big like a Roman snail." } },
    spiral: { type: "boolean", default: true, label: { de: "Spirale", en: "Spiral" },
      describe: { de: "Eine dunklere Spirale von 1 Pixel auf dem Haus, vom Rand bis zu einem Punkt in der Mitte; aus bleibt das Haus glatt.", en: "A darker spiral of 1 pixel on the shell, from the rim to a dot in the middle; off leaves the shell smooth." } },
  },
  presets: {
    "garden-snail": { label: { de: "Gartenschnecke", en: "Garden snail" }, values: { shellColour: "#a0643a", bodyColour: "#b8a888" } },
    "forest-snail": { label: { de: "Waldschnecke", en: "Forest snail" }, values: { shellColour: "#5a3a2a", bodyColour: "#5a5048" } },
    "candy-snail": { label: { de: "Zuckerschnecke", en: "Candy snail" }, values: { shellColour: "#e8a0c0", bodyColour: "#e0d0b0", spiral: false } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "crawl", frames: 4, fps: 6, loop: true },
    { name: "hide", frames: 3, fps: 4, loop: false },
  ],
  grounded: true,
  build(p, seed) {
    const k = ramp(p.bodyColour), h = ramp(p.shellColour), s = p.shellSize;
    const r = rng(seed);
    // Two lighter flecks, placed by the seed on the upper shell, away from the spiral
    const spirale = new Set<string>();
    const sp = (x: number, y: number) => spirale.add(`${x},${y}`);
    for (let x = 1; x <= s - 2; x++) sp(x, 1);
    for (let y = 1; y <= s - 3; y++) sp(s - 2, y);
    for (let x = 3; x <= s - 2; x++) sp(x, s - 3);
    sp(2, 2);
    const flecken: [number, number][] = [];
    for (let n = 0, versuche = 0; n < 1 + Math.floor(r() * 2) && versuche < 40; versuche++) {
      const x = 1 + Math.floor(r() * (s - 2)), y = 2 + Math.floor(r() * (s - 4));
      if (!spirale.has(`${x},${y}`) && !flecken.some(([fx, fy]) => Math.abs(fx - x) + Math.abs(fy - y) < 2)) { flecken.push([x, y]); n++; }
    }

    // The shell, a disc with its top-left at (x0, y0): light on top, deep at the bottom row
    const haus = (b: Pixels, x0: number, y0: number) => {
      const c = (s - 1) / 2;
      for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
        const dx = x - c, dy = y - c;
        if (dx * dx + dy * dy > (s / 2) * (s / 2) - 0.25 + (s % 2 ? 0.3 : 0)) continue;
        const t = y / (s - 1);
        b.set(x0 + x, y0 + y, y === s - 1 ? h.deep : t <= 0.25 ? h.light : t <= 0.6 ? h.base : h.dark);
      }
      if (p.spiral) for (const key of spirale) {
        const [x, y] = key.split(",").map(Number);
        if (b.alpha(x0 + x, y0 + y)) b.set(x0 + x, y0 + y, h.deep);
      }
      for (const [x, y] of flecken) if (b.alpha(x0 + x, y0 + y) && !(p.spiral && spirale.has(`${x},${y}`))) b.set(x0 + x, y0 + y, h.light);
    };

    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H), x0 = 6 - Math.floor(s / 2);
      const crawl = animation === "crawl", hide = animation === "hide";
      const reach = crawl && (f === 1 || f === 2) ? 1 : 0, glide = crawl && f >= 2 ? 1 : 0;
      const fuss = (xa: number, xe: number) => { b.rect(xa, 13, xe - xa + 1, 1, k.base); b.rect(xa, 14, xe - xa + 1, 1, k.dark); };
      if (hide && f === 2) {
        // only the shell, resting one row lower, one pixel of foot under it
        haus(b, x0, 13 - s + 1);
        b.set(6, BODEN, k.dark);
        return b;
      }
      fuss(2, hide && f === 1 ? 6 : 11 + reach);
      if (!(hide && f === 1)) {
        // head raised at the front, then two eye stalks with a dark eye on top
        const hx = 11 + reach;
        b.rect(hx, 11, 2, 2, k.base); b.set(hx, 11, k.light); b.set(hx + 1, 11, k.light); b.set(hx + 2, 11, k.base);
        if (!hide) {
          const lang = animation === "idle" && f === 1 ? 3 : 2;
          for (const sx of [hx + 1, hx + 2]) {
            b.rect(sx, 11 - lang, 1, lang, k.base);
            b.set(sx, 11 - lang, k.deep);
          }
        }
      }
      haus(b, x0 + glide, 12 - s + 1);
      return b;
    };

    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
