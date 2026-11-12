import { rect } from "../../core/vector";
import { area, defineIcon } from "../define";
import { CLEAR } from "../shared";

export const pause = defineIcon({
  id: "pause", category: "actions",
  title: { de: "Pause", en: "Pause" },
  description: {
    de: "Zwei senkrechte Balken für Pause, mit weichen oder eckigen Enden; als einzelnes Quadrat wird daraus Stopp.",
    en: "Two vertical bars for pause, with soft or square ends; as a single square it becomes stop.",
  },
  params: {
    gap: { type: "number", min: 2, max: 6, step: 0.5, default: 3.5, label: { de: "Abstand", en: "Gap" },
      describe: { de: "Freier Raum zwischen den Balken in Rasterpunkten (von 24): 2 eng, 3,5 üblich, 6 weit; bei kräftigem Strich nie enger als lesbar.", en: "Clear space between the bars in grid units (of 24): 2 tight, 3.5 usual, 6 wide; never narrower than legible with a heavy stroke." } },
    barWidth: { type: "number", min: 4.5, max: 7, step: 0.5, default: 6, label: { de: "Balkenbreite", en: "Bar width" },
      describe: { de: "Breite jedes Balkens samt Strich in Rasterpunkten: 4,5 schlank, 6 üblich, 7 breit; beim Stopp-Quadrat ohne Wirkung.", en: "Width of each bar including its stroke in grid units: 4.5 slim, 6 usual, 7 broad; no effect on the stop square." } },
    height: { type: "number", min: 10, max: 18, step: 0.5, default: 15, label: { de: "Höhe", en: "Height" },
      describe: { de: "Gesamthöhe des Zeichens in Rasterpunkten (von 24): 10 klein, 15 üblich, 18 groß; beim Stopp-Quadrat auch die Seitenlänge.", en: "Total height of the sign in grid units (of 24): 10 small, 15 usual, 18 big; also the side of the stop square." } },
    ends: { type: "choice", options: ["soft", "square"], default: "soft", label: { de: "Enden", en: "Ends" },
      labels: { soft: { de: "Weich", en: "Soft" }, square: { de: "Eckig", en: "Square" } },
      describe: { de: "Weich: stark gerundete Balkenenden (bei spitzen Ecken eckig); eckig: gerade abgeschnitten.", en: "Soft: strongly rounded bar ends (square with sharp corners); square: cut off straight." } },
    stop: { type: "boolean", default: false, label: { de: "Stopp", en: "Stop" },
      describe: { de: "Ein einzelnes Quadrat statt zwei Balken: das Stopp-Zeichen.", en: "A single square instead of two bars: the stop sign." } },
  },
  presets: {
    pause: { label: { de: "Pause", en: "Pause" }, values: { barWidth: 6.5, gap: 4 } },
    "slim-bars": { label: { de: "Schlanke Balken", en: "Slim bars" }, values: { barWidth: 4.5, gap: 4.5, height: 16 } },
    stop: { label: { de: "Stopp", en: "Stop" }, values: { stop: true, height: 13, ends: "square" } },
  },
  build(p, pen) {
    const h = p.height - pen.width, r = p.ends === "soft" ? 99 : 1;
    if (p.stop) return [area(rect(12 - h / 2, 12 - h / 2, h, h, p.ends === "soft" ? 2.5 : 1))];
    // Bars of the centre line: the ink adds the pen on each side; the gap between inks stays legible
    const b = Math.max(p.barWidth - pen.width, pen.width + 1), g = Math.max(p.gap, pen.width + CLEAR) + pen.width, w = 2 * b + g;
    const x0 = 12 - w / 2;
    return [area(rect(x0, 12 - h / 2, b, h, r)), area(rect(x0 + b + g, 12 - h / 2, b, h, r))];
  },
});
