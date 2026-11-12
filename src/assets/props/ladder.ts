import { BoxGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const ladder = defineAsset({
  id: "ladder", category: "props",
  title: { de: "Stehleiter", en: "Step ladder" },
  description: { de: "Freistehende Bockleiter: vorn Stufen, hinten ein weiterer Rahmen mit Sprossen, oben optional eine Plattform mit Schutzgeländer. Der hintere Rahmen klappt nach vorn zusammen (bewegliches Teil „fold“).", en: "A free-standing A-frame ladder: steps in front, a second frame with rungs behind, optionally a top platform with a guard rail. The rear frame folds forward (movable part \"fold\")." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.6, max: 3, step: 0.05, default: 1.5, unit: "m",
      describe: { de: "Höhe der obersten Stufe bzw. Plattform: 0,7 m für den Küchentritt, 1,5 m für die Stehleiter, über 2 m für Arbeiten an der Decke.", en: "Height of the top step or platform: 0.7 m for a kitchen step, 1.5 m for a stepladder, over 2 m for work at the ceiling." } },
    steps: { type: "integer", label: { de: "Stufen", en: "Steps" }, min: 2, max: 10, default: 5,
      describe: { de: "Anzahl der Stufen vorne (der hintere Rahmen bekommt ebenso viele Sprossen): 2 der Küchentritt, 6 die Hausleiter, 10 die Werkstattleiter.", en: "Number of front steps (the rear frame gets the same number of rungs): 2 the kitchen step, 6 the household ladder, 10 the workshop ladder." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.35, max: 0.7, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Breite über die Holme: 0,35 m schmal, 0,45 m üblich, 0,6 m eine breite Werkstattleiter.", en: "Width over the side rails: 0.35 m narrow, 0.45 m usual, 0.6 m a wide workshop ladder." } },
    spread: { type: "number", label: { de: "Spreizung", en: "Spread" }, min: 15, max: 35, step: 1, default: 24, unit: "°",
      describe: { de: "Winkel zwischen Vorder- und Hintersatz im Stand: 15° klein auf dem Boden, 24° stabil, 35° breitbeinig; die Leiter kippt bei größerer Spreizung weniger leicht.", en: "Angle between the front and the rear frame when standing: 15° a small footprint, 24° steady, 35° wide stance." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "aluminium"], labels: { wood: { de: "Holz", en: "Wood" }, aluminium: { de: "Aluminium", en: "Aluminium" } }, default: "wood",
      describe: { de: "Klassische Leiter aus Holz oder leichte aus Aluminiumprofil, wie im Baumarkt.", en: "A classic wooden ladder or a light one of aluminium profile, as in the DIY store." } },
    platform: { type: "boolean", label: { de: "Plattform", en: "Platform" }, default: false,
      describe: { de: "Oben eine breite Plattform mit Schutzgeländer statt einer Einzelstufe, wie bei der Arbeitsleiter.", en: "A wide top platform with a guard rail instead of a single top step, as on a work ladder." } },
  },
  presets: {
    "kitchen-step": { label: { de: "Küchentritt", en: "Kitchen step" }, values: { height: 0.7, steps: 2, material: "aluminium" } },
    "painters-ladder": { label: { de: "Malerleiter", en: "Painter's ladder" }, values: { material: "wood", steps: 6 } },
    "work-platform": { label: { de: "Arbeitsplattform", en: "Work platform" }, values: { platform: true } },
  },
  // 0 steht offen, positiver Wert klappt den hinteren Rahmen nach vorn zum Vordersatz; die Reichweite endet bei der Spreizung
  rig: { fold: { label: { de: "Hintersatz", en: "Rear frame" }, type: "rotate", axis: [-1, 0, 0], min: 0, max: 35 } },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 1200, drawCalls: 3 },
  build(p) {
    const alu = p.material === "aluminium";
    const m = material(alu ? "metal" : "wood", alu ? "#b9bec4" : "#a87444");
    const t = new Parts();
    const H = p.height, n = p.steps, rad = Math.PI / 180;
    // Der Vordersatz lehnt stärker nach vorn als der Hintersatz nach hinten (70 % / 30 % der Spreizung),
    // damit der gefaltete Hintersatz am Ende des Klappbereichs über dem Boden bleibt
    const af = 0.7 * p.spread * rad, ar = 0.35 * p.spread * rad;
    const railW = alu ? 0.04 : 0.05, railD = 0.045, braceW = alu ? 0.028 : 0.035, braceD = 0.025;
    const railC = p.width / 2 - railW / 2;
    const braceC = p.width / 2 + 0.01 + braceW / 2;
    const Hh = H + 0.03;
    // Die Holme laufen oben in den Scharnierpunkt (0, Hh, zS); die unteren Kanten der Füße berühren genau den Boden
    const Lf = (Hh - (railD / 2) * Math.sin(af)) / Math.cos(af);
    const Lr = (Hh - (braceD / 2) * Math.sin(ar)) / Math.cos(ar);
    const zS = (Lr * Math.sin(ar) - Lf * Math.sin(af)) / 2;
    const zRail = (y: number) => zS + (Hh - y) * Math.tan(af);
    // Vordersatz: zwei Holme, oben am Scharnier
    for (const sx of [-1, 1]) t.add(m, new BoxGeometry(railW, Lf, railD).translate(0, -Lf / 2, 0).rotateX(-af).translate(sx * railC, Hh, zS));
    // Stufen: die oberste bei H, die übrigen gleichmäßig darunter
    const stufe = (y: number) => t.box(m, p.width, 0.022, 0.11, 0, y - 0.011, zRail(y) + 0.03);
    for (let i = 1; i < n; i++) stufe((H * i) / n);
    if (p.platform) {
      // Breite Plattform mit U-förmigem Schutzgeländer, vorn offen zum Aufsteigen
      const zp = zRail(H) - 0.05;
      t.box(m, 2 * railC + railW + 0.02, 0.03, 0.34, 0, H - 0.015, zp);
      const ph = 0.66, zb = zp - 0.14;
      for (const sx of [-1, 1]) {
        t.box(m, 0.035, ph, 0.035, sx * railC, H + ph / 2, zb);
        t.box(m, 0.035, ph - 0.03, 0.035, sx * railC, (Hh + H + ph) / 2, zS);
      }
      t.box(m, 2 * railC + 0.055, 0.03, 0.035, 0, H + ph - 0.0175, zb);
      for (const sx of [-1, 1]) t.box(m, 0.03, 0.03, Math.abs(zb - zS), sx * railC, H + ph - 0.0175, (zb + zS) / 2);
    } else stufe(H);
    // Hintersatz: beweglich um den Scharnierpunkt, Sprossen wie vorne Stufen
    const hinten = t.moving("fold", 0, Hh, zS, { max: p.spread });
    for (const sx of [-1, 1]) hinten.add(m, new BoxGeometry(braceW, Lr, braceD).translate(0, -Lr / 2, 0).rotateX(ar).translate(sx * braceC, Hh, zS));
    for (let i = 1; i <= n; i++) {
      const s = Lr - (0.08 + ((i - 1) * (Lr - 0.24)) / (n - 1));
      hinten.box(m, 2 * braceC + braceW, 0.024, 0.026, 0, Hh - s * Math.cos(ar), zS - s * Math.sin(ar));
    }
    return t.group();
  },
});
