import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const sword = defineSprite({
  id: "sword", category: "items",
  title: { de: "Schwert", en: "Sword" },
  description: {
    de: "Ein Schwert als Pixel-Symbol, schräg von links unten nach rechts oben: Klingenlänge, Parierstange und Farben frei, mit einem Glanz, der die Klinge entlangläuft. 16 × 16 Pixel.",
    en: "A sword as a pixel icon, diagonal from bottom left to top right: blade length, crossguard and colours as you like, with a glint running along the blade. 16 × 16 pixels.",
  },
  params: {
    blade: { type: "integer", min: 4, max: 8, default: 7, label: { de: "Klinge", en: "Blade" },
      describe: { de: "Länge der Klinge in Pixeln diagonal: 4 ein Dolch, 7 ein Schwert, 8 ein Langschwert.", en: "Length of the blade in diagonal pixels: 4 a dagger, 7 a sword, 8 a longsword." } },
    guard: { type: "integer", min: 1, max: 3, default: 2, label: { de: "Parierstange", en: "Crossguard" },
      describe: { de: "Wie weit die Parierstange zu jeder Seite reicht: 1 knapp, 3 breit.", en: "How far the crossguard reaches to each side: 1 short, 3 wide." } },
    color: { type: "color", default: "#cfd6dd", label: { de: "Klinge", en: "Blade" },
      describe: { de: "Stahl #cfd6dd, Bronze #c88a4a, magisch #7ad0ff.", en: "Steel #cfd6dd, bronze #c88a4a, magic #7ad0ff." } },
    grip: { type: "color", default: "#7a4a2a", label: { de: "Griff", en: "Grip" },
      describe: { de: "Farbe von Griff und Parierstange.", en: "Colour of the grip and the crossguard." } },
  },
  presets: {
    sword: { label: { de: "Schwert", en: "Sword" }, values: { blade: 7, guard: 2 } },
    dagger: { label: { de: "Dolch", en: "Dagger" }, values: { blade: 4, guard: 1 } },
    "magic-sword": { label: { de: "Zauberschwert", en: "Magic sword" }, values: { blade: 8, guard: 3, color: "#7ad0ff", grip: "#5a3a8a" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "shine", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const k = ramp(p.color), g = ramp(p.grip), weiss = hex("#ffffff");
    // Along the diagonal: step d is the pixel (x0 + d, y0 − d); the guard crosses it at right angles
    const laenge = 4 + p.blade, x0 = Math.round((15 - laenge) / 2), y0 = 15 - x0;
    return (animation, _d, f) => {
      const b = new Pixels(W, H), at = (d: number): [number, number] => [x0 + d, y0 - d];
      b.set(...at(0), g.light);
      for (const d of [1, 2]) { const [x, y] = at(d); b.set(x, y, g.base); b.set(x + 1, y, g.dark); }
      const [gx, gy] = at(3);
      for (let i = -p.guard; i <= p.guard; i++) b.set(gx + i, gy + i, i < 0 ? g.light : g.base);
      for (let d = 4; d < laenge; d++) { const [x, y] = at(d); b.set(x, y, k.light); b.set(x + 1, y, k.dark); if (d < laenge - 1) b.set(x + 1, y - 1, k.base); }
      if (animation === "shine") { const [x, y] = at(4 + Math.round(((p.blade - 2) * f) / 3)); b.set(x, y, weiss); }
      return b;
    };
  },
});
