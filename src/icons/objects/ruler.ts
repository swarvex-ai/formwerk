import { line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, type Part } from "../define";
import { CLEAR, fits, largest, turn } from "../shared";

export const ruler = defineIcon({
  id: "ruler", category: "objects",
  title: { de: "Lineal", en: "Ruler" },
  description: {
    de: "Ein gerades Lineal für Messen, Größe, Layout und Holzarbeit: ein langer Balken mit Strichen, die von einer Längskante hineinhängen, lang und kurz im Wechsel.",
    en: "A straight ruler for measure, size, layout and woodworking: a long bar with tick marks hanging into it from one long edge, long and short in turn.",
  },
  params: {
    tilt: { type: "number", min: 0, max: 45, step: 5, default: 45, unit: "°", label: { de: "Neigung", en: "Tilt" },
      describe: { de: "Winkel des Lineals in Grad: 0 waagerecht wie eine Maßstabsleiste, 45 diagonal wie das übliche Zeichen.", en: "Angle of the ruler in degrees: 0 level like a scale bar, 45 diagonal as the usual icon." } },
    ticks: { type: "integer", min: 3, max: 5, default: 4, label: { de: "Striche", en: "Ticks" },
      describe: { de: "Striche entlang der Kante: 3 grob, 4 üblich, 5 fein; bei kräftigen Strichen und mittlerer Neigung zeichnen 5 nur 4.", en: "Tick marks along the edge: 3 coarse, 4 usual, 5 fine; at strong strokes and middle tilts 5 may draw 4." } },
    width: { type: "number", min: 5.5, max: 8, step: 0.5, default: 7, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Balkens in Rasterpunkten: 5,5 schmal wie ein Stahlmaß, 7 üblich, 8 breit wie ein Schullineal.", en: "Width of the bar in grid units: 5.5 slim like a steel rule, 7 usual, 8 broad like a school ruler." } },
    pattern: { type: "choice", options: ["alternate", "even"], default: "alternate", label: { de: "Muster", en: "Pattern" },
      labels: { alternate: { de: "Abwechselnd", en: "Alternating" }, even: { de: "Gleich", en: "Even" } },
      describe: { de: "Lange und kurze Striche im Wechsel wie Zentimeter und halbe Zentimeter, oder alle lang.", en: "Long and short ticks in turn like centimetres and half centimetres, or all long." } },
  },
  presets: {
    scale: { label: { de: "Maßstab", en: "Scale bar" }, values: { tilt: 0, width: 6.5 } },
    fine: { label: { de: "Fein", en: "Fine" }, values: { ticks: 5, pattern: "even" } },
  },
  build(p, pen) {
    const W = p.width, lang = Math.min(0.55 * W, W - pen.width - CLEAR), kurz = Math.max(1.2, 0.55 * lang);
    // A small overshoot past the edge with round corners: without it the filled style keeps a hairline of ink
    // across each notch's outer end.
    const aus = pen.corners === "round" ? Math.max(0.45, pen.width / 4) : 0, abstand = pen.width + 1.1;
    const drehen = (pts: Pt[]) => turn(pts.map(([x, y]): Pt => [x + 12, y + 12]), -p.tilt);
    const bauen = (L: number, n: number): Part[] => {
      const teile: Part[] = [area(polygon(...drehen([[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]])))];
      for (let i = 1; i <= n; i++) {
        const x = -L / 2 + (i * L) / (n + 1), h = p.pattern === "even" || i % 2 === 1 ? lang : kurz;
        teile.push(detail(line(...drehen([[x, -W / 2 - aus], [x, -W / 2 + h]]))));
      }
      return teile;
    };
    let n = p.ticks;
    while (n > 3 && !fits(bauen((n + 1) * abstand, n), pen)) n--;
    return largest((n + 1) * abstand, 30, pen, (L) => bauen(L, n));
  },
});
