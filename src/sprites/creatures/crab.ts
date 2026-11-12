import { CLEAR, Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const AUGE = ramp("#241c2e");

export const crab = defineSprite({
  id: "crab", category: "creatures",
  title: { de: "Krabbe", en: "Crab" },
  description: {
    de: "Eine Krabbe von vorn rechts, die seitwärts krabbelt und mit der Schere schnappt: Panzer, Scheren, Augen und Größe frei wählbar. 16 × 16 Pixel pro Bild, steht auf der untersten Zeile.",
    en: "A crab seen from the front right, scuttling sideways and snapping with its claw: shell, claws, eyes and size as you like. 16 × 16 pixels per frame, standing on the bottom row.",
  },
  params: {
    shellColour: { type: "color", default: "#6f7a44", label: { de: "Panzerfarbe", en: "Shell colour" },
      describe: { de: "Farbe des Panzers: Grünbraun #6f7a44 am Strand, Rot #c03a2e am Riff, Sand #c8a878 an der Küste.", en: "Colour of the shell: green-brown #6f7a44 on the beach, red #c03a2e at the reef, sand #c8a878 on the coast." } },
    clawColour: { type: "color", default: "#c05a35", label: { de: "Scherenfarbe", en: "Claw colour" },
      describe: { de: "Farbe der Scheren, meist kräftiger als der Panzer: Orange #e07820 bei der Winkerkrabbe, Tiefrot #a82828 bei der roten Krabbe.", en: "Colour of the claws, usually stronger than the shell: orange #e07820 for a fiddler crab, deep red #a82828 for a red crab." } },
    eyes: { type: "choice", options: ["stalks", "flat"], default: "stalks", label: { de: "Augen", en: "Eyes" },
      labels: { stalks: { de: "Stielaugen", en: "stalks" }, flat: { de: "flach", en: "flat" } },
      describe: { de: "Zwei Augen auf 2-Pixel-Stielen über dem Panzer, oder flach auf der oberen Panzerkante.", en: "Two eyes on 2-pixel stalks above the shell, or flat on the shell's upper edge." } },
    claws: { type: "choice", options: ["even", "one-big"], default: "even", label: { de: "Scheren", en: "Claws" },
      labels: { even: { de: "gleiche Scheren", en: "even claws" }, "one-big": { de: "eine große Schere", en: "one big claw" } },
      describe: { de: "Zwei gleich große Scheren, oder die vordere doppelt so groß wie die hintere, wie bei der Winkerkrabbe.", en: "Two claws of the same size, or the front claw twice as large as the back one, like a fiddler crab." } },
    size: { type: "choice", options: ["small", "large"], default: "large", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "klein", en: "small" }, large: { de: "groß", en: "large" } },
      describe: { de: "Breite des Panzers in Pixeln: 8 klein wie ein Jungtier, 12 groß wie eine ausgewachsene Strandkrabbe.", en: "Width of the shell in pixels: 8 small like a juvenile, 12 large like a full-grown shore crab." } },
  },
  presets: {
    shore: { label: { de: "Strandkrabbe", en: "Shore crab" }, values: { shellColour: "#5e7040", clawColour: "#b0603a", eyes: "stalks", claws: "even" } },
    red: { label: { de: "Rote Krabbe", en: "Red crab" }, values: { shellColour: "#c03a2e", clawColour: "#d8553a", claws: "even" } },
    fiddler: { label: { de: "Winkerkrabbe", en: "Fiddler crab" }, values: { shellColour: "#c8a878", clawColour: "#e07820", claws: "one-big" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "walk", frames: 4, fps: 8, loop: true }, { name: "pinch", frames: 3, fps: 6, loop: true }],
  grounded: true,
  build(p) {
    const k = ramp(p.shellColour), sch = ramp(p.clawColour);
    const gross = p.size === "large", gros = p.claws === "one-big";
    const sx0 = gross ? 2 : 4, sx1 = gross ? 13 : 11, oben = gross ? 7 : 8, unten = 11, boden = 14;
    // The far claw in deeper shades of the same ramp, so it reads as being behind
    const tief = (r: Ramp): Ramp => ({ deep: r.deep, dark: r.deep, base: r.dark, light: r.dark });
    // A claw: a small block with a notch cut into its right side; open shows the notch, closed does not
    const schere = (b: Pixels, x: number, y: number, s: number, r: Ramp, offen: boolean) => {
      b.part(x, y, s, s + 1, r, true);
      if (offen) for (const dy of s >= 4 ? [1, 2] : [Math.floor((s + 1) / 2)]) b.set(x + s - 1, y + dy, CLEAR);
    };
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H), bob = animation === "walk" && f % 2 === 1 ? 1 : 0;
      // Three pairs of legs: the far side (left) in a darker shade; walking, alternating pairs lift while the
      // planted ones sway out and in over the four frames
      const fuesse = [sx0 - 1, sx0 + 1, sx0 + 3, sx1 - 3, sx1 - 1, sx1 + 1];
      fuesse.forEach((fx, i) => {
        const hinten = i < 3, farbe = hinten ? k.dark : k.base, hebt = animation === "walk" && (i % 3 + f) % 2 === 1;
        const innen = fx < (sx0 + sx1) / 2 ? 1 : -1, pendel = animation === "walk" && !hebt ? [1, 0, -1, 0][f] * -innen : 0;
        const fussX = Math.min(14, Math.max(1, fx + (hebt ? innen : pendel))), fussY = boden - (hebt ? 1 : 0);
        b.set(Math.max(sx0, Math.min(sx1, fx)), unten + 1, farbe);
        b.set(Math.round((Math.max(sx0, Math.min(sx1, fx)) + fussX) / 2), fussY - 1, farbe);
        b.set(fussX, fussY, farbe);
      });
      // Wide flat shell, its underside shading the leg roots
      b.part(sx0, oben + bob, sx1 - sx0 + 1, unten - oben + 1, k, true);
      // Two claws at the front right: the far one in a darker shade; pinch raises the front claw and snaps it shut
      const offen = !((animation === "idle" || animation === "pinch") && f === 1);
      const hoch = animation === "pinch" && f < 2 ? -3 : 0;
      schere(b, sx1 - (gros ? 5 : 3), oben + bob, 2, tief(sch), gros ? false : offen);
      schere(b, Math.min(sx1, W - 1 - (gros ? 4 : 2)), oben + 1 + bob + hoch, gros ? 4 : 2, sch, offen);
      // Eyes in the middle of the shell front, on stalks or flat on its edge
      for (const x of [7, 9]) {
        if (p.eyes === "stalks") { b.set(x, oben - 1 + bob, k.dark); b.set(x, oben - 2 + bob, AUGE.base); }
        else b.set(x, oben + bob, AUGE.base);
      }
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
