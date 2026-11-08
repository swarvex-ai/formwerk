import { circle, line, onCircle, type Pt } from "../../core/vector";
import { area, defineIcon, detail, type Part } from "../define";
import { CLEAR, EDGE } from "../shared";

export const clock = defineIcon({
  id: "clock", category: "status",
  title: { de: "Uhr", en: "Clock" },
  description: {
    de: "Ein Zifferblatt mit Stunden- und Minutenzeiger auf jeder Uhrzeit, für Zeit, Verlauf, Warten und Termine.",
    en: "A clock face with hour and minute hands at any time, for time, history, waiting and appointments.",
  },
  params: {
    hour: { type: "integer", min: 1, max: 12, default: 10, label: { de: "Stunde", en: "Hour" },
      describe: { de: "Stunde, auf die der kurze Zeiger zeigt: 10 nach 10 ist das übliche Uhr-Symbol, 3 für ein waagrechtes L.", en: "Hour the short hand points to: ten past ten is the usual clock symbol, 3 for a horizontal L." } },
    minute: { type: "integer", min: 0, max: 55, step: 5, default: 10, label: { de: "Minute", en: "Minute" },
      describe: { de: "Minute, auf die der lange Zeiger zeigt, in Schritten von 5: 10 üblich, 0 für volle Stunden.", en: "Minute the long hand points to, in steps of 5: 10 usual, 0 for full hours." } },
    ticks: { type: "boolean", default: true, label: { de: "Striche", en: "Ticks" },
      describe: { de: "Punkte bei 12, 3, 6 und 9 Uhr; ohne wirkt das Zifferblatt ruhiger.", en: "Dots at 12, 3, 6 and 9 o'clock; without them the face looks calmer." } },
  },
  presets: {
    time: { label: { de: "Uhrzeit", en: "Time" }, values: { hour: 10, minute: 10 } },
    history: { label: { de: "Verlauf", en: "History" }, values: { hour: 9, minute: 0, ticks: false } },
    "due-soon": { label: { de: "Bald fällig", en: "Due soon" }, values: { hour: 11, minute: 55, badge: true } },
  },
  build(p, pen) {
    const hw = pen.width / 2, r = 12 - EDGE - hw, c: Pt = [12, 12];
    const teile: Part[] = [area(circle(c, r))];
    // Hands close together would trap a sliver between them: then the short one lies on the long one
    const lang = Math.min(r * 0.68, r - pen.width - CLEAR - 0.25), kurz = r * 0.46, wm = p.minute * 6, ws = (p.hour % 12) * 30 + p.minute * 0.5;
    const zwischen = Math.abs(((ws - wm + 540) % 360) - 180), eng = (Math.asin(Math.min(1, (pen.width + CLEAR) / kurz)) * 180) / Math.PI;
    const zeiger = [onCircle(c, kurz, zwischen < eng ? wm : ws), c, onCircle(c, lang, wm)];
    // Ticks as dots inside the rim at 12, 3, 6 and 9; a hand that comes close covers one
    const punkt = Math.max(0.7, hw * 0.9), lage = r - hw - CLEAR - punkt;
    if (p.ticks) for (const g of [0, 90, 180, 270]) {
      const q = onCircle(c, lage, g);
      if (Math.min(abstand(q, zeiger[0], c), abstand(q, c, zeiger[2])) >= punkt + hw + CLEAR) teile.push(detail(circle(q, punkt), true));
    }
    teile.push(detail(line(...zeiger)));
    return teile;
  },
});

/** Distance of a point from the segment a–b. */
function abstand(q: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
}
