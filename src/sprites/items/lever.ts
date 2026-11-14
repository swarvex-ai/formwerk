import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const EISEN = ramp("#5b6068"), STEIN = ramp("#7c7a74"), HOLZ = ramp("#7a5232"), GLANZ = hex("#ffffff");

export const lever = defineSprite({
  id: "lever", category: "items",
  title: { de: "Hebel", en: "Lever" },
  description: {
    de: "Ein Wandhebel als Pixel-Symbol für Dungeons, Rätsel und Fallen: Sockel, Stange und Griff frei wählbar, mit einer Animation, in der er von links nach rechts umgelegt wird. 16 × 16 Pixel.",
    en: "A wall lever as a pixel icon for dungeons, puzzles and traps: base, rod and grip as you like, with an animation that throws it from left to right. 16 × 16 pixels.",
  },
  params: {
    length: { type: "integer", min: 4, max: 7, default: 6, label: { de: "Stange", en: "Rod" },
      describe: { de: "Länge der Stange in Pixeln, vom Drehpunkt bis zum Griff: 4 ein kurzer Schalter, 6 üblich, 7 ein langer Hebel.", en: "Length of the rod in pixels, from the pivot to the grip: 4 a short switch, 6 usual, 7 a long lever." } },
    throw: { type: "integer", min: 20, max: 60, default: 45, unit: "°", label: { de: "Ausschlag", en: "Throw" },
      describe: { de: "Wie weit der Hebel zu jeder Seite kippt, gemessen von senkrecht: 20° ein knapper Schalter, 45° üblich, 60° fast waagrecht.", en: "How far the lever tilts to each side, measured from upright: 20° a short switch, 45° usual, 60° nearly level." } },
    base: { type: "choice", options: ["plate", "block"], default: "plate", label: { de: "Sockel", en: "Base" },
      labels: { plate: { de: "Eisenplatte", en: "iron plate" }, block: { de: "Steinblock", en: "stone block" } },
      describe: { de: "Woran der Hebel sitzt: eine flache Eisenplatte an der Wand oder ein Steinblock am Boden.", en: "What the lever sits on: a flat iron plate on a wall, or a stone block on the floor." } },
    grip: { type: "color", default: "#b8312f", label: { de: "Griff", en: "Grip" },
      describe: { de: "Farbe des Griffs: Rot #b8312f für Gefahr, Gold #f0c419 für einen Schatz, Schwarz #30303a schlicht.", en: "Colour of the grip: red #b8312f for danger, gold #f0c419 for treasure, black #30303a plain." } },
  },
  presets: {
    wall: { label: { de: "Wandhebel", en: "Wall lever" }, values: { base: "plate", length: 6 } },
    floor: { label: { de: "Bodenhebel", en: "Floor lever" }, values: { base: "block", length: 7, throw: 35, grip: "#30303a" } },
    switch: { label: { de: "Schalter", en: "Switch" }, values: { length: 4, throw: 25, grip: "#f0c419" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "pull", frames: 4, fps: 8, loop: false }],
  grounded: false,
  build(p) {
    const griff = ramp(p.grip), px = 8, py = p.base === "block" ? 11 : 10;
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      // The base the lever turns on
      if (p.base === "plate") { b.part(4, py - 1, 8, 4, EISEN, true); b.set(5, py + 1, EISEN.dark); b.set(10, py + 1, EISEN.dark); }
      else b.part(3, py - 1, 10, 4, STEIN);
      // The rod from the pivot, at its angle: left at rest, swinging over to the right while pulled
      const t = animation === "pull" ? f / 3 : 0, winkel = ((-1 + 2 * t) * p.throw * Math.PI) / 180;
      const dx = Math.sin(winkel), dy = -Math.cos(winkel);
      for (let k = 0; k <= p.length * 2; k++) {
        const s = k / 2;
        b.set(px + dx * s - 0.5, py + dy * s, k % 4 < 2 ? HOLZ.base : HOLZ.dark);
      }
      // The grip on the end, with a glint, and the pivot pin on top
      const gx = Math.round(px + dx * p.length), gy = Math.round(py + dy * p.length);
      b.rect(gx - 1, gy - 1, 2, 2, griff.base); b.set(gx - 1, gy - 1, griff.light); b.set(gx, gy, griff.dark);
      if (animation === "pull" && f === 3) b.set(gx - 1, gy - 1, GLANZ);
      b.rect(px - 1, py, 2, 1, EISEN.light);
      return b;
    };
  },
});
