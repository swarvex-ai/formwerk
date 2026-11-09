import { circle, line, type Pt } from "../../core/vector";
import { defineIcon, type Part } from "../define";
import { framed } from "../shared";

export const info = defineIcon({
  id: "info", category: "status",
  title: { de: "Info", en: "Info" },
  description: {
    de: "Ein i im Kreis oder abgerundeten Quadrat für Hinweise, Hilfe und Details; der eigene, größere Rahmen neben dem allgemeinen `mark`.",
    en: "An i in a circle or rounded square for notes, help and details; the dedicated, larger frame beside the general `mark`.",
  },
  params: {
    shape: { type: "choice", options: ["circle", "square"], default: "circle", label: { de: "Form", en: "Shape" },
      labels: { circle: { de: "Kreis", en: "Circle" }, square: { de: "Quadrat", en: "Square" } },
      describe: { de: "Kreis für Hinweise und Hilfe, Quadrat als Knopf und Kasten in Werkzeugleisten.", en: "Circle for notes and help, square as a button or box in toolbars." } },
    size: { type: "number", min: 15, max: 21, step: 0.5, default: 19, label: { de: "Größe", en: "Size" },
      describe: { de: "Außenmaß von Kreis oder Quadrat in Rasterpunkten (von 24): 15 klein, 19 üblich, 21 groß; bei kräftigem Strich bleibt unten wie oben Raum für das i.", en: "Outer size of circle or square in grid units (of 24): 15 small, 19 usual, 21 large; with a heavy stroke the i still has room top and bottom." } },
    stem: { type: "number", min: 0.5, max: 1, step: 0.05, default: 0.85, label: { de: "Stiel", en: "Stem" },
      describe: { de: "Länge des i-Stiels im Verhältnis zum freien Raum: 0,6 zierlich, 0,85 üblich, 1 fast vom Punkt zum unteren Rand.", en: "Length of the i's stem relative to the free room: 0.6 dainty, 0.85 usual, 1 nearly from dot to bottom edge." } },
    spacing: { type: "number", min: 0.9, max: 1.7, step: 0.1, default: 1.2, label: { de: "Abstand", en: "Spacing" },
      describe: { de: "Luft zwischen Punkt und Stiel in Rasterpunkten: 0,9 eng, 1,2 üblich, 1,7 bleibt auch in kleiner Größe deutlich.", en: "Clear space between dot and stem in grid units: 0.9 tight, 1.2 usual, 1.7 stays clear even at small sizes." } },
  },
  presets: {
    about: { label: { de: "Über", en: "About" }, values: { shape: "circle", stem: 0.9 } },
    tooltip: { label: { de: "Kurzhilfe", en: "Tooltip" }, values: { shape: "square", spacing: 1.4 } },
    notice: { label: { de: "Hinweis", en: "Notice" }, values: { style: "filled" } },
  },
  build(p, pen) {
    const f = framed(p.shape, pen, p.size), hw = pen.width / 2, frei = f.room - hw;
    const dotR = Math.max(hw, 0.95), dotC: Pt = [12, 12 - frei + dotR], unten = 12 + frei;
    const raum = unten - (dotC[1] + dotR + p.spacing + hw);
    const teile: Part[] = [...f.parts];
    if (raum > 0.25) teile.push(f.mark(line([12, unten - Math.min(raum, Math.max(0.4, raum * p.stem))], [12, unten])));
    teile.push(f.mark(circle(dotC, dotR), true));
    return teile;
  },
});
