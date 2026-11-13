import { circle, line, rect, type Pt } from "../../core/vector";
import { area, defineIcon, gap, stroke, type Part } from "../define";
import { centre } from "../shared";

// Where the three nodes stand around the centre: one to the left, two to the right above and below
const RICHTUNG: Pt[] = [[-1, 0], [0.62, -0.78], [0.62, 0.78]];

export const share = defineIcon({
  id: "share", category: "actions",
  title: { de: "Teilen", en: "Share" },
  description: {
    de: "Drei Punkte, die zwei Linien verbinden, oder ein Kasten, aus dem ein Pfeil nach oben führt — zum Teilen und Weitergeben.",
    en: "Three dots joined by two lines, or a box with an arrow leading up out of it — for sharing and sending on.",
  },
  params: {
    // The contract already uses the name `style` for outline, duotone and filled, so this one carries the icon's name
    shareStyle: { type: "choice", options: ["nodes", "box"], default: "nodes", label: { de: "Darstellung", en: "Rendering" },
      labels: { nodes: { de: "Punkte", en: "Nodes" }, box: { de: "Kasten", en: "Box" } },
      describe: { de: "Drei verbundene Punkte als Netzwerk oder ein Kasten mit einem Pfeil, der aus ihm herausführt.", en: "Three joined dots as a network, or a box with an arrow leading out of it." } },
    spread: { type: "number", min: 7, max: 9, step: 0.5, default: 8, label: { de: "Abstand", en: "Spread" },
      describe: { de: "Wie weit die Punkte vom Mittelpunkt abstehen in Rasterpunkten: 7 gedrängt, 8 üblich, 9 weit; ohne Wirkung am Kasten.", en: "How far the dots stand from the centre in grid units: 7 tight, 8 usual, 9 wide; without effect on the box." } },
    nodeSize: { type: "number", min: 1.5, max: 2.25, step: 0.25, default: 2, label: { de: "Punktgröße", en: "Node size" },
      describe: { de: "Radius der Punkte in Rasterpunkten: 1,5 klein, 2 üblich, 2,25 kräftig; ohne Wirkung am Kasten.", en: "Radius of the dots in grid units: 1.5 small, 2 usual, 2.25 bold; without effect on the box." } },
  },
  presets: {
    network: { label: { de: "Netzwerk", en: "Network" }, values: { spread: 9, nodeSize: 2.25 } },
    "send-on": { label: { de: "Weiterleiten", en: "Send on" }, values: { shareStyle: "box" } },
  },
  build(p, pen) {
    if (p.shareStyle === "box") {
      // A box below the centre with an arrow leaving it upward; the gap clears the box's top edge around the shaft
      const spitze = 12 - 8, koerper = rect(12 - 5.5, 12 + 0.5, 11, 8, 1.5), schaft = line([12, 12 + 3], [12, spitze]);
      return [area(koerper), gap(schaft, 1, false), stroke(schaft),
        stroke(line([12 - 3.5, spitze + 3.5], [12, spitze], [12 + 3.5, spitze + 3.5]))];
    }
    const knoten = RICHTUNG.map(([x, y]): Pt => [12 + x * p.spread, 12 + y * p.spread]);
    const teile: Part[] = [];
    const r = Math.max(p.nodeSize, pen.width / 2 + 0.6);
    // Both lines run from the left node to the two right ones, standing clear of the dots at both ends
    const abstand = r + pen.width + 1;
    for (const z of [1, 2]) {
      const [a, b] = [knoten[0], knoten[z]], la = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const dx = (b[0] - a[0]) / la, dy = (b[1] - a[1]) / la;
      if (la - 2 * abstand > 0.9) teile.push(stroke(line([a[0] + dx * abstand, a[1] + dy * abstand], [b[0] - dx * abstand, b[1] - dy * abstand])));
    }
    for (const q of knoten) teile.push(area(circle(q, r)));
    return centre(teile, pen);
  },
});
