import { line, type Pt } from "../../core/vector";
import { defineIcon } from "../define";
import { CLEAR, FRAME, FRAME_SIZE, framed, inkRadius } from "../shared";

export const check = defineIcon({
  id: "check", category: "actions",
  title: { de: "Haken", en: "Check" },
  description: {
    de: "Ein Haken für Bestätigen, Erledigt und Ausgewählt, auch doppelt wie bei gelesenen Nachrichten, frei oder in Kreis und Quadrat.",
    en: "A check mark for confirm, done and selected, also double like read messages, free or in a circle or square.",
  },
  params: {
    size: { type: "number", min: 17, max: 21, step: 0.5, default: 18, label: { de: "Größe", en: "Size" },
      describe: { de: "Breite des Hakens in Rasterpunkten (von 24): 17 zurückhaltend, 18 üblich, 21 groß; im Rahmen wird er so weit kleiner, wie es nötig ist.", en: "Width of the check in grid units (of 24): 17 discreet, 18 usual, 21 big; inside a frame it shrinks as far as needed." } },
    arm: { type: "number", min: 0.3, max: 0.7, step: 0.05, default: 0.45, label: { de: "Kurzer Schenkel", en: "Short arm" },
      describe: { de: "Länge des kurzen Schenkels im Verhältnis zum langen: 0,35 schwungvoll, 0,45 üblich, 0,7 fast gleich lang wie ein V.", en: "Length of the short arm relative to the long one: 0.35 sweeping, 0.45 usual, 0.7 nearly even like a V." } },
    double: { type: "boolean", default: false, label: { de: "Doppelt", en: "Double" },
      describe: { de: "Zwei Haken hintereinander, etwa für gelesen oder zugestellt.", en: "Two checks one after the other, for read or delivered." } },
    frame: FRAME,
    frameSize: FRAME_SIZE,
  },
  presets: {
    done: { label: { de: "Erledigt (frei)", en: "Done (free)" }, values: { frame: "none" } },
    confirmed: { label: { de: "Bestätigt", en: "Confirmed" }, values: { frame: "circle", style: "filled" } },
    read: { label: { de: "Gelesen", en: "Read" }, values: { frame: "none", double: true, arm: 0.5 } },
    checkbox: { label: { de: "Kästchen", en: "Checkbox" }, values: { frame: "square", frameSize: 19 } },
  },
  build(p, pen) {
    const f = framed(p.frame, pen, p.frameSize), s = Math.SQRT1_2, ink = inkRadius(pen);
    // Knee at the origin, the arms at 45°: the short one up to the left, the long one up to the right
    const lang = (p.size * Math.SQRT2) / (1 + p.arm), kurz = lang * p.arm;
    // The second check sits a fixed distance to the right, so the two stay apart when they shrink into a frame
    const d = p.double ? Math.SQRT2 * (pen.width + CLEAR) : 0;
    const punkte = (k: number): Pt[] => {
      const roh: Pt[] = [[-kurz * s * k, -kurz * s * k], [0, 0], [lang * s * k, -lang * s * k]];
      const cx = (roh[0][0] + roh[2][0] + d) / 2, cy = roh[2][1] / 2;
      return roh.map(([x, y]): Pt => [x - cx, y - cy]);
    };
    // Both checks with their ink inside the frame's room
    const passt = (k: number) => {
      const a = punkte(k), alle = [...a, ...a.map(([x, y]): Pt => [x + d, y])];
      return Math.max(...alle.map(([x, y]) => (f.kind === "circle" ? Math.hypot(x, y) : Math.max(Math.abs(x), Math.abs(y))))) + ink <= f.room;
    };
    // Inside a frame a check looks best a little smaller than the other signs
    let k = f.scale * (f.kind === "none" ? 1 : 0.75);
    if (!passt(k)) {
      let lo = 0.1, hi = k;
      for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (passt(m)) lo = m; else hi = m; }
      k = lo;
    }
    const a = punkte(k), at = (q: Pt): Pt => [12 + q[0], 12 + q[1]];
    const teile = [...f.parts, f.mark(line(...a.map(at)))];
    if (p.double) {
      // Its short arm stops where it meets the first one's long arm
      const knie = at([a[1][0] + d, a[1][1]]), u = Math.min(d / 2, kurz * s * k);
      teile.push(f.mark(line([knie[0] - u, knie[1] - u], knie, at([a[2][0] + d, a[2][1]]))));
    }
    return teile;
  },
});
