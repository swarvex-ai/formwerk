import { arc, circle, line, type Pt } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { inkRadius } from "../shared";

export const wifi = defineIcon({
  id: "wifi", category: "status",
  title: { de: "WLAN", en: "Wi-Fi" },
  description: {
    de: "Funkbögen über einem Punkt für die WLAN-Signalstärke, von einem bis vier Bögen, durchgestrichen für getrennt.",
    en: "Radio arcs above a dot for Wi-Fi signal strength, from one to four arcs, crossed out for disconnected.",
  },
  params: {
    bars: { type: "integer", min: 1, max: 4, default: 4, label: { de: "Bögen", en: "Arcs" },
      describe: { de: "Zahl der Funkbögen: 1 schwaches Signal, 2, 3, 4 volle Stärke; bei kräftigem Strich werden es automatisch weniger, damit die Bögen getrennt bleiben.", en: "Number of radio arcs: 1 weak signal, 2, 3, 4 full strength; with a heavy stroke fewer are drawn so the arcs stay apart." } },
    spread: { type: "number", min: 72, max: 90, step: 2, default: 74, label: { de: "Öffnungswinkel", en: "Spread" },
      describe: { de: "Öffnungswinkel der Bögen in Grad: 72 schmal, 74 üblich, 90 weit; ein großer oder kräftiger Fächer gibt im Winkel nach, damit die Enden im Raster bleiben.", en: "Opening angle of the arcs in degrees: 72 narrow, 74 usual, 90 wide; a large or heavy fan gives way in angle so the ends stay in the grid." } },
    size: { type: "number", min: 17.5, max: 21, step: 0.5, default: 17.5, label: { de: "Größe", en: "Size" },
      describe: { de: "Höhe des Fächers vom unteren Punkt bis zum oberen Bogenrand in Rasterpunkten (von 24): 17,5 kompakt, 19 üblich, 21 groß.", en: "Height of the fan from the bottom of the dot to the top arc edge in grid units (of 24): 17.5 compact, 19 usual, 21 large." } },
    off: { type: "boolean", default: false, label: { de: "Aus", en: "Off" },
      describe: { de: "Ein Schrägstrich durch den Fächer: kein WLAN, getrennt, Flugmodus.", en: "A slash across the fan: no Wi-Fi, disconnected, airplane mode." } },
  },
  presets: {
    full: { label: { de: "Volles Signal", en: "Full signal" }, values: { bars: 4, spread: 84 } },
    low: { label: { de: "Schwaches Signal", en: "Weak signal" }, values: { bars: 2 } },
    disconnected: { label: { de: "Getrennt", en: "Disconnected" }, values: { off: true } },
  },
  build(p, pen) {
    const hw = pen.width / 2, cap = inkRadius(pen);
    // The dot of the source: drawn from a small circle not wider than the pen, so it stays solid in every style
    const dotR = Math.min(0.6, hw);
    // The fan reaches to `size`, never over the live area; the arcs stand evenly between dot and outer arc
    const r = Math.min(p.size - hw - dotR, 21.5 - dotR - 2 * hw);
    const n = Math.max(1, Math.min(p.bars, Math.floor(r / (dotR + pen.width + 1))));
    // Wide fans get narrow tips: with a heavy stroke the ends reach further into the corners of the grid
    const s = Math.min(p.spread, (2 * Math.asin(Math.min(1, (12 - 1.4 - cap) / r)) * 180) / Math.PI);
    const c: Pt = [12, 12 + (r - dotR) / 2];
    const teile: Part[] = [];
    for (let i = 1; i <= n; i++) teile.push(stroke(arc(c, (r * i) / n, -s / 2, s / 2)));
    teile.push(area(circle(c, dotR)));
    if (p.off) {
      // A diagonal through the centre of the fan (the dot): it cuts every arc at a steep angle and joins dot and arcs
      // to one piece; a diagonal through the grid would graze the arcs' inner edges and a slash's erasing margin
      // would graze their lower tips — both break at 24 px
      const pad = 1.4 * hw, ra = 0.5, rb = Math.sin(Math.PI / 3);
      const t1 = Math.min((c[1] - 1.25 - pad) / rb, (10.75 - pad) / ra);
      const t2 = Math.min((22.75 - pad - c[1]) / rb, (10.75 - pad) / ra);
      teile.push(stroke(line([12 - ra * t1, c[1] - rb * t1], [12 + ra * t2, c[1] + rb * t2])));
    }
    return teile;
  },
});
