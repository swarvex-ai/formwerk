import { circle, line, onCircle, rect, type Pt } from "../../core/vector";
import { area, defineIcon, detail, stroke, type Part } from "../define";
import { CLEAR, largest } from "../shared";

export const lock = defineIcon({
  id: "lock", category: "status",
  title: { de: "Schloss", en: "Lock" },
  description: {
    de: "Ein Vorhängeschloss für gesperrt, privat und sicher, offen für entsperrt, mit oder ohne Schlüsselloch.",
    en: "A padlock for locked, private and secure, open for unlocked, with or without a keyhole.",
  },
  params: {
    width: { type: "number", min: 12, max: 18, step: 0.5, default: 16, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Schlosskörpers in Rasterpunkten (von 24): 13 schmal, 16 üblich, 18 breit.", en: "Width of the body in grid units (of 24): 13 narrow, 16 usual, 18 wide." } },
    height: { type: "number", min: 8, max: 13, step: 0.5, default: 10, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Schlosskörpers: 8 flach, 10 üblich, 13 hoch; der Bügel kommt dazu.", en: "Height of the body: 8 flat, 10 usual, 13 tall; the shackle comes on top." } },
    shackle: { type: "number", min: 0.45, max: 0.75, step: 0.05, default: 0.62, label: { de: "Bügel", en: "Shackle" },
      describe: { de: "Breite des Bügels im Verhältnis zum Körper: 0,5 schmal wie ein Fahrradschloss, 0,62 üblich, 0,75 breit.", en: "Width of the shackle relative to the body: 0.5 narrow like a bike lock, 0.62 usual, 0.75 wide." } },
    open: { type: "boolean", default: false, label: { de: "Offen", en: "Open" },
      describe: { de: "Der Bügel ist angehoben und rechts frei: entsperrt.", en: "The shackle is lifted and free on the right: unlocked." } },
    keyhole: { type: "boolean", default: true, label: { de: "Schlüsselloch", en: "Keyhole" },
      describe: { de: "Ein Schlüsselloch im Körper; ohne wirkt das Schloss schlichter.", en: "A keyhole in the body; without it the lock looks plainer." } },
  },
  presets: {
    locked: { label: { de: "Gesperrt", en: "Locked" }, values: { open: false, keyhole: true } },
    unlocked: { label: { de: "Entsperrt", en: "Unlocked" }, values: { open: true } },
    private: { label: { de: "Privat", en: "Private" }, values: { keyhole: false, width: 14, style: "filled" } },
  },
  build(p, pen) {
    const hw = pen.width / 2, r = Math.max((p.shackle * p.width) / 2, (pen.width + CLEAR) / 2 + 0.25), bein = Math.max(1.5, r * 0.45);
    const schloss = (h: number): Part[] => {
      const heben = p.open ? pen.width + CLEAR + 0.25 : 0, oben = -bein - heben;
      // The shackle: left leg down to the body, the arc, the right leg down to the body or ending above it
      const bogen = Array.from({ length: 13 }, (_, i): Pt => onCircle([0, oben], r, 270 + i * 15));
      const buegel: Pt[] = [[-r, 0], ...bogen, [r, p.open ? -heben : 0]];
      const teile: Part[] = [area(rect(-p.width / 2, 0, p.width, h, 2.5)), stroke(line(...buegel))];
      // A keyhole in the middle, a dot with a short stem, where it has clear room
      const loch = Math.max(1, pen.width * 0.6), stiel = Math.min(2, h * 0.18), frei = h - pen.width - 2 * CLEAR;
      if (p.keyhole && frei >= 2 * loch + stiel) {
        const m: Pt = [0, h / 2 - stiel / 2];
        teile.push(detail(circle(m, loch), true));
        if (stiel >= 1) teile.push(detail(line(m, [0, m[1] + loch + stiel - hw])));
      }
      return teile;
    };
    return largest(6, p.height, pen, schloss);
  },
});
