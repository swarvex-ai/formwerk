import { Color } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

export const workbench = defineAsset({
  id: "workbench", category: "furniture",
  title: { de: "Werkbank", en: "Workbench" },
  description: { de: "Feste Werkbank aus Holz mit vier Beinen, Zargen, unterer Ablage und Schraubstock vorn links.", en: "A sturdy wooden workbench with four legs, stretchers, a lower shelf and a metal vise at the front left corner." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 1, max: 2.4, step: 0.01, default: 1.6, unit: "m",
      describe: { de: "Breite der Bankplatte: 1,2 m im Schuppen, 1,6 m in der Heimwerkstatt, 2,2 m für die Tischlerei.", en: "Width of the bench top: 1.2 m in a shed, 1.6 m in a home workshop, 2.2 m for carpentry." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.5, max: 0.9, step: 0.01, default: 0.65, unit: "m",
      describe: { de: "Tiefe der Platte: 0,5 m an der Wand, 0,65 m üblich, 0,85 m für Maschinenarbeit.", en: "Depth of the top: 0.5 m along a wall, 0.65 m usual, 0.85 m for machine work." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.75, max: 1, step: 0.01, default: 0.9, unit: "m",
      describe: { de: "Höhe bis Oberkante Platte: 0,85 m für feine Arbeit, 0,9 m üblich, 1 m für schweres Hobeln.", en: "Height to the top surface: 0.85 m for fine work, 0.9 m usual, 1 m for heavy planing." } },
    topThickness: { type: "number", label: { de: "Plattenstärke", en: "Top thickness" }, min: 0.03, max: 0.08, step: 0.005, default: 0.05, unit: "m",
      describe: { de: "Stärke der Platte: 0,03 m eine leichte Bank, 0,05 m üblich, 0,08 m eine schwere Tischlerplatte.", en: "Thickness of the top: 0.03 m a light bench, 0.05 m usual, 0.08 m a heavy carpenter's top." } },
    shelf: { type: "boolean", label: { de: "Ablage", en: "Shelf" }, default: true,
      describe: { de: "Untere Ablage zwischen den Beinen auf 0,15 m; ohne sie bleibt der Boden frei.", en: "A lower shelf board between the legs at 0.15 m; without it the floor stays clear." } },
    vise: { type: "choice", label: { de: "Schraubstock", en: "Vise" }, options: ["none", "front"], labels: { none: { de: "ohne", en: "none" }, front: { de: "vorn links", en: "front left" } }, default: "front",
      describe: { de: "Metall-Schraubstock an der Vorderkante links; ohne bleibt die Platte ganz frei.", en: "A metal vise at the front left corner; without it the top stays completely free." } },
    colour: { type: "color", label: { de: "Holzfarbe", en: "Wood colour" }, default: "#a0743f",
      describe: { de: "Grundfarbe von Platte, Beinen und Ablage.", en: "Base colour of the top, the legs and the shelf." } },
  },
  presets: {
    carpenter: { label: { de: "Tischlerbank", en: "Carpenter's bench" }, values: { width: 1.6, height: 0.9, vise: "front" } },
    garden: { label: { de: "Gartenwerkbank", en: "Garden bench" }, values: { width: 1.2, depth: 0.55, height: 0.85, vise: "none" } },
    heavy: { label: { de: "Schwere Werkbank", en: "Heavy duty bench" }, values: { width: 2.2, depth: 0.85, topThickness: 0.08 } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 7000, drawCalls: 4 },
  build(p) {
    // Two tones of the same wood for the strips of the top, alternating like the staves of the barrel
    const dunkler = new Color(p.colour).multiplyScalar(0.82);
    const holz = material("wood", p.colour, 1, undefined, { grain: "level" }), holz2 = material("wood", `#${dunkler.getHexString()}`, 1, undefined, { grain: "level" });
    const beine = material("wood", p.colour), eisen = material("iron", "#6a7078", 5, undefined, { rust: 0.25 });
    const t = new Parts();
    const bein = 0.07, einzug = 0.05, zarge = 0.05, hohe = p.height - p.topThickness;
    const bx = p.width / 2 - einzug - bein / 2, bz = p.depth / 2 - einzug - bein / 2;
    // Platte aus 5 bis 8 verleimten Streifen über die ganze Breite, 1 mm Fuge dazwischen
    const n = Math.min(8, Math.max(5, Math.round(p.depth / 0.11))), fuge = 0.001, sb = (p.depth - (n - 1) * fuge) / n;
    for (let i = 0; i < n; i++) t.add(i % 2 ? holz2 : holz, rounded(p.width, p.topThickness, sb, 0.0025, 0, p.height - p.topThickness / 2, -p.depth / 2 + sb / 2 + i * (sb + fuge)));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(beine, rounded(bein, hohe, bein, 0.003, sx * bx, hohe / 2, sz * bz));
    // Zargen von 0,1 bis 0,15 m: die beiden seitlichen zwischen den Beinen, die hintere als Auflage der Ablage
    for (const sx of [-1, 1]) t.add(holz, rounded(zarge, zarge, 2 * bz, 0.003, sx * bx, 0.125, 0));
    t.add(holz, rounded(2 * bx, zarge, zarge, 0.003, 0, 0.125, -bz));
    if (p.shelf) {
      // Ablage aus 3 bis 5 Brettern mit 3 mm Abstand: hinten an der hinteren Zarge, vorn mit den Beinen bündig
      const hinten = bz - zarge / 2, tiefe = bz + hinten, k = Math.min(5, Math.max(3, Math.round(tiefe / 0.13))), spalt = 0.003, bb = (tiefe - (k - 1) * spalt) / k;
      for (let i = 0; i < k; i++) t.add(holz, rounded(2 * bx - zarge, 0.025, bb, 0.003, 0, 0.1625, -hinten + bb / 2 + i * (bb + spalt)));
    }
    if (p.vise === "front") {
      // Backenblech vor der Platte, Oberkante bündig; Spindel durch die Backe, davor der Knebel mit runden Knöpfen.
      // Bleibt über dem Boden und vor den Beinen, egal wie hoch und breit die Bank ist.
      const x = -p.width / 2 + 0.14, y = p.height - 0.05, z = p.depth / 2 + 0.025;
      t.add(eisen, rounded(0.18, 0.1, 0.05, 0.004, x, y, z));
      // Spindel aus der Backe nach vorn, vorn eine Nabe, durch die der Knebel geht
      t.add(eisen, turned([[0.001, 0], [0.012, 0], [0.012, 0.11], [0.02, 0.112], [0.02, 0.14], [0.016, 0.15], [0.001, 0.15]], 12).rotateX(Math.PI / 2).translate(x, y, z - 0.025));
      const kn = 0.011, l = 0.14;
      t.add(eisen, turned([[0.001, 0], [kn * 0.7, kn * 0.3], [kn, kn], [kn * 0.7, kn * 1.7], [0.006, kn * 2], [0.006, l - kn * 2], [kn * 0.7, l - kn * 1.7], [kn, l - kn],
        [kn * 0.7, l - kn * 0.3], [0.001, l]], 8, 0, -l / 2, 0).rotateZ(Math.PI / 2).translate(x, y, z + 0.11));
    }
    return t.group();
  },
});
