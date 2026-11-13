import { circle, line, onCircle, type Pt } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { CLEAR, EDGE, inkRadius } from "../shared";

export const sun = defineIcon({
  id: "sun", category: "status",
  title: { de: "Sonne", en: "Sun" },
  description: {
    de: "Eine Sonne für Wetter, Tag und Helligkeit oder den Hellmodus, mit wählbarem Kern und Strahlen.",
    en: "A sun for weather, daytime, brightness or light mode, with configurable core and rays.",
  },
  params: {
    core: { type: "number", min: 0.3, max: 0.5, step: 0.05, default: 0.4, label: { de: "Kern", en: "Core" },
      describe: { de: "Größe des Sonnenkerns als Anteil des Außenradius: 0,3 klein, 0,4 üblich, 0,5 groß.", en: "Size of the sun's core as a share of the outer radius: 0.3 small, 0.4 usual, 0.5 large." } },
    count: { type: "choice", options: ["8", "12"], default: "8", label: { de: "Strahlen", en: "Rays" },
      describe: { de: "Zahl der Sonnenstrahlen: 8 die übliche Sonne, 12 für kräftiges Strahlen.", en: "Number of sun rays: 8 the usual sun, 12 for bright shining." } },
    length: { type: "number", min: 0.3, max: 1, step: 0.05, default: 0.8, label: { de: "Länge", en: "Length" },
      describe: { de: "Länge der Strahlen: 0,3 kurz für Wettersymbole, 0,8 üblich, 1 reicht bis zum Rand.", en: "Length of the rays: 0.3 short for weather symbols, 0.8 usual, 1 reaches to the edge." } },
    pattern: { type: "choice", options: ["even", "alternate"], default: "even", label: { de: "Muster", en: "Pattern" },
      labels: { even: { de: "Gleich", en: "Even" }, alternate: { de: "Abwechselnd", en: "Alternate" } },
      describe: { de: "Länge der Strahlen: gleichmäßig oder abwechselnd lang und kurz.", en: "Length of rays: uniform or alternating long and short." } },
  },
  presets: {
    sun: { label: { de: "Sonne", en: "Sun" }, values: { core: 0.4 } },
    bright: { label: { de: "Hell", en: "Bright" }, values: { count: "12", pattern: "alternate" } },
    weather: { label: { de: "Wetter", en: "Weather" }, values: { core: 0.5, length: 0.3 } },
  },
  build(p, pen) {
    const c: Pt = [12, 12];
    const outer = 12 - EDGE - inkRadius(pen);
    const rc = p.core * outer;
    const parts: Part[] = [area(circle(c, rc))];
    const n = Number(p.count);
    const r1 = Math.max(rc + pen.width + CLEAR, (n * (pen.width + CLEAR)) / (2 * Math.PI));
    const r2Base = r1 + Math.max(2, p.length * (outer - r1));
    for (let i = 0; i < n; i++) {
      const g = (i * 360) / n;
      const r2 = p.pattern === "alternate" && i % 2 !== 0 ? r1 + 0.6 * (r2Base - r1) : r2Base;
      parts.push(stroke(line(onCircle(c, r1, g), onCircle(c, r2, g))));
    }
    return parts;
  },
});
