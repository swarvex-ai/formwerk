import { line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { largest } from "../shared";

export const flag = defineIcon({
  id: "flag", category: "status",
  title: { de: "Fahne", en: "Flag" },
  description: {
    de: "Eine Fahne an einer senkrechten Stange für Markierung, Ziel und Meldung; das Tuch rechts der Stange, glatt oder wehend.",
    en: "A flag on a vertical pole for marker, goal and report; the cloth to the right of the pole, flat or waving.",
  },
  params: {
    wave: { type: "number", min: 0, max: 2, step: 0.25, default: 0, label: { de: "Welle", en: "Wave" },
      describe: { de: "Ausschlag der Welle im Tuch in Rasterpunkten: 0 ein glattes Rechteck, 1 sanft, 2 deutlich wehend.", en: "Swing of the wave in the cloth in grid units: 0 a flat rectangle, 1 gentle, 2 clearly waving." } },
    length: { type: "number", min: 6, max: 14, step: 0.5, default: 11, label: { de: "Länge", en: "Length" },
      describe: { de: "Wie weit das Tuch nach rechts reicht, in Rasterpunkten: 8 kurz, 11 üblich, 14 lang.", en: "How far the cloth reaches to the right, in grid units: 8 short, 11 usual, 14 long." } },
    tail: { type: "choice", options: ["straight", "notch", "pennant"], default: "straight", label: { de: "Ende", en: "Tail" },
      labels: { straight: { de: "Gerade", en: "Straight" }, notch: { de: "Kerbe", en: "Notch" }, pennant: { de: "Wimpel", en: "Pennant" } },
      describe: { de: "Das freie Ende des Tuchs: gerade, mit Kerbe wie ein Schwalbenschwanz oder als spitzer Wimpel.", en: "The free end of the cloth: straight, with a swallowtail notch or a pointed pennant." } },
  },
  presets: {
    waving: { label: { de: "Wehend", en: "Waving" }, values: { wave: 1.5, length: 12 } },
    pennant: { label: { de: "Wimpel", en: "Pennant" }, values: { tail: "pennant", length: 12, style: "filled" } },
    swallow: { label: { de: "Schwalbenschwanz", en: "Swallowtail" }, values: { tail: "notch", wave: 1 } },
  },
  build(p, pen) {
    const hoehe = 9, stange = 15.5;
    const fahne = (l: number): Part[] => {
      const N = 10, ts = Array.from({ length: N + 1 }, (_, i) => i / N), schlag = (t: number) => p.wave * Math.sin(2 * Math.PI * t);
      const spitz = p.tail === "pennant";
      const oben = ts.map((t): Pt => [l * t, schlag(t) + (spitz ? (hoehe / 2) * t : 0)]);
      const unten = ts.map((t): Pt => [l * t, hoehe + schlag(t) - (spitz ? (hoehe / 2) * t : 0)]).reverse();
      const rand: Pt[] = [...oben];
      if (p.tail === "notch") rand.push([l - Math.min(4, Math.max(2.5, l * 0.25)), hoehe / 2]);
      if (!spitz) rand.push(...unten); else rand.push(...unten.slice(1));
      return [stroke(line([0, 0], [0, stange])), area(polygon(...rand))];
    };
    return largest(6, p.length, pen, fahne);
  },
});
