import { line, rect } from "../../core/vector";
import { area, defineIcon, detail, type Part } from "../define";
import { CLEAR, EDGE, largest } from "../shared";

export const mail = defineIcon({
  id: "mail", category: "objects",
  title: { de: "Brief", en: "Mail" },
  description: {
    de: "Ein Briefumschlag für E-Mail, Nachrichten und Kontakt, quer oder fast quadratisch, mit flacher oder tiefer Lasche.",
    en: "An envelope for email, messages and contact, wide or nearly square, with a shallow or deep flap.",
  },
  params: {
    width: { type: "number", min: 16, max: 21.5, step: 0.5, default: 20, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Umschlags in Rasterpunkten (von 24): 17 kompakt, 20 üblich, 21,5 randlos.", en: "Width of the envelope in grid units (of 24): 17 compact, 20 usual, 21.5 edge to edge." } },
    height: { type: "number", min: 12, max: 18, step: 0.5, default: 15, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Umschlags: 12 wie ein langer Brief, 15 üblich, 18 fast quadratisch wie eine Karte.", en: "Height of the envelope: 12 like a long letter, 15 usual, 18 nearly square like a card." } },
    flap: { type: "number", min: 0.35, max: 0.7, step: 0.05, default: 0.5, label: { de: "Lasche", en: "Flap" },
      describe: { de: "Wie tief die Lasche hinunter reicht, im Verhältnis zur Höhe: 0,35 flach, 0,5 üblich, 0,7 tief.", en: "How far down the flap reaches, relative to the height: 0.35 shallow, 0.5 usual, 0.7 deep." } },
  },
  presets: {
    email: { label: { de: "E-Mail", en: "Email" }, values: { width: 20, height: 15 } },
    letter: { label: { de: "Langer Brief", en: "Long letter" }, values: { width: 21, height: 12.5, flap: 0.45 } },
    unread: { label: { de: "Ungelesen", en: "Unread" }, values: { badge: true, style: "filled" } },
  },
  build(p, pen) {
    const hw = pen.width / 2, w = Math.min(p.width, 24 - 2 * EDGE - pen.width);
    const umschlag = (h: number): Part[] => {
      // The fold floats inside the outline with clear room at its ends
      const rand = hw + CLEAR + hw * Math.SQRT2, y0 = -h / 2 + rand, tiefe = -h / 2 + h * p.flap;
      return [area(rect(-w / 2, -h / 2, w, h, 2)), detail(line([-w / 2 + rand, y0], [0, tiefe], [w / 2 - rand, y0]))];
    };
    return largest(9, p.height, pen, umschlag);
  },
});
