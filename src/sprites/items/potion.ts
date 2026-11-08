import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const GLAS = ramp("#c9d6e3"), KORK = ramp("#a67c52"), WACHS = ramp("#b8323a"), GLANZ = hex("#ffffff");

export const potion = defineSprite({
  id: "potion", category: "items",
  title: { de: "Trank", en: "Potion" },
  description: {
    de: "Ein Trank als Pixel-Symbol für Inventar und Beute: Flaschenform, Farbe und Füllstand frei wählbar, mit Glanz, der über das Glas wandert. 16 × 16 Pixel.",
    en: "A potion as a pixel icon for inventories and loot: bottle shape, colour and fill level as you like, with a glint that moves across the glass. 16 × 16 pixels.",
  },
  params: {
    bottle: { type: "choice", options: ["round", "tall", "flask"], default: "round", label: { de: "Flasche", en: "Bottle" },
      labels: { round: { de: "rund", en: "round" }, tall: { de: "hoch", en: "tall" }, flask: { de: "Kolben", en: "flask" } },
      describe: { de: "Form der Flasche: rund für Heiltränke, hoch für Elixiere, Kolben für Alchemie.", en: "Shape of the bottle: round for healing, tall for elixirs, a flask for alchemy." } },
    liquid: { type: "color", default: "#d0405e", label: { de: "Inhalt", en: "Liquid" },
      describe: { de: "Farbe des Tranks: Rot für Leben, Blau für Mana, Grün für Gift.", en: "Colour of the potion: red for health, blue for mana, green for poison." } },
    fill: { type: "number", min: 0.2, max: 1, step: 0.05, default: 0.75, label: { de: "Füllstand", en: "Fill" },
      describe: { de: "Wie voll die Flasche ist: 1 voll, 0,5 halb, 0,2 fast leer.", en: "How full the bottle is: 1 full, 0.5 half, 0.2 almost empty." } },
    stopper: { type: "choice", options: ["cork", "wax", "none"], default: "cork", label: { de: "Verschluss", en: "Stopper" },
      labels: { cork: { de: "Korken", en: "cork" }, wax: { de: "Wachssiegel", en: "wax seal" }, none: { de: "offen", en: "open" } },
      describe: { de: "Verschluss: Korken, rotes Wachssiegel für seltene Tränke, oder offen.", en: "Stopper: a cork, a red wax seal for rare potions, or open." } },
  },
  presets: {
    health: { label: { de: "Heiltrank", en: "Health" }, values: { bottle: "round", liquid: "#d0405e", fill: 0.85 } },
    mana: { label: { de: "Mana", en: "Mana" }, values: { bottle: "tall", liquid: "#3f6fd8", fill: 0.8, stopper: "wax" } },
    poison: { label: { de: "Gift", en: "Poison" }, values: { bottle: "flask", liquid: "#6fbf3a", fill: 0.5 } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "shine", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const fluessig = ramp(p.liquid);
    // inside of the bottle per row: [left, right] (inclusive); rows outside are glass walls drawn around it
    const innen = new Map<number, [number, number]>();
    if (p.bottle === "round") for (let y = 6; y <= 13; y++) { const dy = y + 0.5 - 9.6, w = Math.sqrt(Math.max(0, 4.6 * 4.6 - dy * dy)); if (w > 0.8) innen.set(y, [Math.round(8 - w), Math.round(8 + w) - 1]); }
    else if (p.bottle === "tall") for (let y = 6; y <= 13; y++) innen.set(y, [5, 10]);
    else for (let y = 6; y <= 13; y++) { const w = 1 + Math.round((y - 6) * 0.62); innen.set(y, [8 - w, 7 + w]); }
    const oben = Math.min(...innen.keys()), unten = Math.max(...innen.keys());
    const pegel = Math.round(unten + 1 - (unten - oben + 1) * p.fill);
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      // neck and stopper
      b.part(7, oben - 3, 2, 3, GLAS);
      if (p.stopper === "cork") b.part(6, oben - 5, 4, 2, KORK);
      else if (p.stopper === "wax") { b.part(6, oben - 5, 4, 2, WACHS); b.set(9, oben - 3, WACHS.dark); }
      for (const [y, [l, r]] of innen) {
        for (let x = l; x <= r; x++) {
          const voll = y >= pegel, rand = x === l || x === r || y === unten;
          b.set(x, y, voll ? (y === pegel ? fluessig.light : rand ? fluessig.dark : fluessig.base) : rand ? GLAS.dark : GLAS.base);
        }
      }
      // the glint: still in idle, moving down the glass in the shine animation
      const g = animation === "shine" ? f : 0, zeile = oben + 1 + g, links = innen.get(zeile);
      if (links) { b.set(links[0] + 1, zeile, GLANZ); if (g < 3) b.set(links[0] + 1, zeile + 1, GLAS.light); }
      return b;
    };
  },
});
