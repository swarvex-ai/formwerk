import { line, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, stroke, type Part } from "../define";
import { fits, largest } from "../shared";

const RAYS = { none: [0, 0], short: [2.5, 2], long: [2.5, 3] } as const;

export const bulb = defineIcon({
  id: "bulb", category: "objects",
  title: { de: "Glühbirne", en: "Light bulb" },
  description: {
    de: "Eine Glühbirne für Idee, Tipp und Licht: runder Glaskolben auf einem schmaleren Schraubsockel, auf Wunsch mit Strahlen.",
    en: "A light bulb for idea, tip and light: a round glass on a narrower screw base, with rays if wanted.",
  },
  params: {
    glass: { type: "number", min: 4.5, max: 7, step: 0.5, default: 6, label: { de: "Glaskolben", en: "Glass" },
      describe: { de: "Radius des runden Glaskolbens in Rasterpunkten (von 24): 5 klein, 6 üblich, 7 groß; mit langen Strahlen wird er bei Bedarf kleiner.", en: "Radius of the round glass in grid units (of 24): 5 small, 6 usual, 7 large; with long rays it shrinks if it must." } },
    base: { type: "integer", min: 2, max: 3, default: 2, label: { de: "Gewinde", en: "Thread" },
      describe: { de: "Anzahl der waagerechten Linien auf dem Sockel: 2 schlicht, 3 wie ein Schraubgewinde (mit langen Strahlen und kräftigem Strich fällt bei Platzmangel eine Linie weg).", en: "Number of horizontal lines on the base: 2 plain, 3 like a screw thread (with long rays and a bold stroke one line drops when there is no room)." } },
    rays: { type: "choice", options: ["none", "short", "long"], default: "none", label: { de: "Strahlen", en: "Rays" },
      labels: { none: { de: "Keine", en: "None" }, short: { de: "Kurz", en: "Short" }, long: { de: "Lang", en: "Long" } },
      describe: { de: "Strahlen um den Kolben für eine Idee oder eine brennende Lampe: keine, kurze oder lange.", en: "Rays around the glass for an idea or a lit lamp: none, short or long." } },
  },
  presets: {
    idea: { label: { de: "Idee", en: "Idea" }, values: { rays: "short", glass: 5.5 } },
    lamp: { label: { de: "Lampe an", en: "Lamp on" }, values: { rays: "long", base: 3, glass: 5, style: "filled" } },
  },
  build(p, pen) {
    const [, laenge] = RAYS[p.rays as keyof typeof RAYS], s = pen.width + 1.25;
    // In a filled icon the lines are cut out: they stop at the inner edge of the outline, else they would cut it
    const ende = p.style === "filled" ? pen.width : 0;
    const birne = (n: number) => (g: number): Part[] => {
      // Glass centre at the origin; the glass runs down to a neck, the base is a box with lines across
      const hb = Math.max(2.5, g * 0.5), hals = g * 0.766, unten = hals + g * 0.35, boden = unten + n * s;
      const bogen = Array.from({ length: 15 }, (_, i): Pt => onCircle([0, 0], g, -140 + i * (280 / 14)));
      const teile: Part[] = [area(polygon(...bogen, [hb, unten], [hb, boden], [-hb, boden], [-hb, unten]))];
      for (let k = 1; k < n; k++) teile.push(detail(line([-hb + ende, unten + k * s], [hb - ende, unten + k * s])));
      if (laenge > 0) {
        const von = g + Math.max(2.5, pen.width + 1.25);
        for (const a of [-90, -45, 0, 45, 90]) teile.push(stroke(line(onCircle([0, 0], von, a), onCircle([0, 0], von + laenge, a))));
      }
      return teile;
    };
    // Long rays with a thread of three lines on a bold pen leave no room on the grid: then the thread loses a line
    let n = p.base;
    while (n > 2 && !fits(largest(3, p.glass, pen, birne(n)), pen)) n--;
    return largest(3, p.glass, pen, birne(n));
  },
});
