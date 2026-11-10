import { circle, line, rect, type Pt } from "../../core/vector";
import { area, defineIcon, detail, gap, stroke, type Part } from "../define";
import { centre, CLEAR, EDGE } from "../shared";

export const calendar = defineIcon({
  id: "calendar", category: "objects",
  title: { de: "Kalender", en: "Calendar" },
  description: {
    de: "Ein Kalender für Termine und Daten: mit oder ohne Ringe, mit einem markierten Tag in einem freien Ring.",
    en: "A calendar for appointments and dates: with or without binder rings, with a marked day in a cleared ring.",
  },
  params: {
    width: { type: "number", min: 15, max: 21.5, step: 0.5, default: 19, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Kalenders in Rasterpunkten (von 24): 16 kompakt, 19 üblich, 21,5 randlos.", en: "Width of the calendar in grid units (of 24): 16 compact, 19 usual, 21.5 edge to edge." } },
    height: { type: "number", min: 15, max: 21.5, step: 0.5, default: 18, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Blattes ohne Ringe: 15 fast quadratisch, 18 üblich, 21,5 hoch wie ein Wandkalender.", en: "Height of the sheet without rings: 15 nearly square, 18 usual, 21.5 tall like a wall calendar." } },
    binders: { type: "boolean", default: true, label: { de: "Ringe", en: "Rings" },
      describe: { de: "Zwei Ringe oben, wie an einem Abreißkalender; ohne wirkt das Blatt wie ein digitaler Terminplan.", en: "Two rings at the top like a tear-off calendar; without it looks like a digital schedule." } },
    marked: { type: "boolean", default: true, label: { de: "Markierter Tag", en: "Marked day" },
      describe: { de: "Ein Tag ist mit einem Ring hervorgehoben und von den Linien freigestellt, etwa für heute oder einen Termin.", en: "One day is highlighted with a ring and cleared of the lines, for today or an appointment." } },
  },
  presets: {
    calendar: { label: { de: "Kalender", en: "Calendar" }, values: { binders: true, marked: false } },
    today: { label: { de: "Heute", en: "Today" }, values: { binders: true, marked: true } },
    planner: { label: { de: "Terminplan", en: "Planner" }, values: { width: 21, height: 16, binders: false, marked: true } },
  },
  build(p, pen) {
    const hw = pen.width / 2, w = Math.min(p.width, 24 - 2 * EDGE - pen.width);
    const ringH = p.binders ? Math.max(2.2, pen.width + 1) : 0;
    const h = Math.min(p.height, 24 - 2 * EDGE - pen.width - ringH);
    const links = -w / 2, rechts = w / 2, oben = 0, unten = h, teile: Part[] = [area(rect(links, oben, w, h, 3))];
    // The header line floats inside the sheet with a clear margin to the outline
    const rand = 2 * hw + CLEAR, kopf = Math.min(h * 0.4, Math.max(3.4, rand + 0.1));
    teile.push(detail(line([links + rand, kopf], [rechts - rand, kopf])));
    if (p.binders) {
      // Two U-shaped rings standing on the top edge
      const lh = Math.max(2.2, pen.width + 0.9), lw = Math.min(2, w * 0.12 + 0.6);
      for (const seite of [-1, 1]) {
        const x = seite * w * 0.24;
        teile.push(stroke(line([x - lw, oben], [x - lw, oben - lh], [x + lw, oben - lh], [x + lw, oben])));
      }
    }
    if (p.marked) {
      const r = Math.min(3.2, w * 0.14, (unten - kopf) * 0.22);
      const c: Pt = [0, kopf + (unten - kopf) * 0.55];
      teile.push(gap(circle(c, r), 1.25, true), area(circle(c, r)));
    }
    return centre(teile, pen);
  },
});
