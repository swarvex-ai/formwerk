import { CylinderGeometry, Matrix4, type Material } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

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
  budget: { triangles: 13000, drawCalls: 4 },
  build(p) {
    const alu = p.material === "aluminium";
    // Holz: Holme mit stehender Maserung, Stufen und Deckel liegend; der ganze Hintersatz aus Holmholz, damit er ein
    // Draw Call bleibt. Aluminium: ein Metall für Profile und Scharniere, Gummifüße
    const metall = material("metal", alu ? "#b9bec4" : "#8e9399");
    const holm = alu ? metall : material("wood", "#a87444");
    const latte = alu ? metall : material("wood", "#a87444", 1, undefined, { grain: "level" });
    const gummi = material("plastic", "#2b2b2b");
    const t = new Parts();
    const H = p.height, n = p.steps, rad = Math.PI / 180;
    // Der Vordersatz lehnt stärker nach vorn als der Hintersatz nach hinten (70 % / 35 % der Spreizung),
    // damit der gefaltete Hintersatz am Ende des Klappbereichs über dem Boden bleibt
    const tf = Math.tan(0.7 * p.spread * rad), tr = Math.tan(0.35 * p.spread * rad);
    const railW = alu ? 0.026 : 0.032, railD = alu ? 0.09 : 0.095, braceW = alu ? 0.024 : 0.03, braceD = alu ? 0.045 : 0.055;
    const ecke = alu ? 0.005 : 0.003, fuss = alu ? 0.035 : 0;
    const railC = p.width / 2 - railW / 2, braceC = p.width / 2 + 0.01 + braceW / 2, capX = braceC + braceW / 2 + 0.004;
    // Deckel oben (Oberkante H), darunter enden die Holme; das Scharnier sitzt hinter den Vorderholmen unter dem Deckel
    const capT = 0.03, y0 = H - capT, yP = y0 - 0.025, yR = y0 - 0.004, zP = -railD / 2 - 0.012 - braceD / 2;
    // Mittellinien der Holme; die Füße liegen symmetrisch um z = 0
    const Z0 = -(y0 * tf + zP - yP * tr) / 2;
    const zF = (y: number) => Z0 + (y0 - y) * tf, zR = (y: number) => Z0 + zP - (yP - y) * tr;
    // Ein schräger Holm mit waagrechten Enden (Fuß flach am Boden, Kopf im Deckel), Mitte entlang z(y)
    const holmTeil = (ziel: Parts, m: Material, w: number, d: number, r: number, x: number, yu: number, yo: number, z: (y: number) => number) => {
      const h = yo - yu, k = (z(yo) - z(yu)) / h;
      ziel.add(m, rounded(w, h, d, r, 0, h / 2, 0, 2).applyMatrix4(new Matrix4().set(1, 0, 0, 0, 0, 1, 0, 0, 0, k, 1, 0, 0, 0, 0, 1)).translate(x, yu, z(yu)));
    };
    // Ein liegendes Brett (Holz) oder geriffeltes Profil (Aluminium) mit Oberkante y, von z0 bis z1
    const brett = (m: Material, w: number, y: number, z0: number, z1: number, dicke: number) => {
      const d = z1 - z0, zc = (z0 + z1) / 2;
      if (!alu) { t.add(m, rounded(w, dicke, d, 0.003, 0, y - dicke / 2, zc)); return; }
      // Grundplatte und Rippen mit 5 mm breiten, 4 mm tiefen Rillen dazwischen
      t.add(m, rounded(w, dicke - 0.004, d, 0.003, 0, y - 0.004 - (dicke - 0.004) / 2 + 0.002, zc));
      const k = Math.max(3, Math.round(d / 0.03)), b = (d - (k - 1) * 0.005) / k;
      for (let i = 0; i < k; i++) t.add(m, rounded(w, 0.006, b, 0.002, 0, y - 0.003, z0 + b / 2 + i * (b + 0.005), 1));
    };
    for (const sx of [-1, 1]) {
      holmTeil(t, holm, railW, railD, ecke, sx * railC, fuss, y0 + 0.002, zF);
      if (alu) holmTeil(t, gummi, railW + 0.006, railD + 0.006, 0.004, sx * railC, 0, fuss + 0.005, zF);
    }
    // Stufen: in die Holme eingelassen (Enden bis zur Holmmitte), schmaler als die Holme tief sind
    const tritt = alu ? 0.022 : 0.024, td = railD - 0.015;
    for (let i = 1; i < n; i++) {
      const y = (H * i) / n, z = zF(y - tritt / 2);
      brett(latte, 2 * railC, y, z - td / 2, z + td / 2, tritt);
    }
    const zHinten = zR(yR) - braceD / 2 - 0.01, zVorn = zF(y0) + railD / 2 + 0.015;
    if (p.platform) {
      // Breite Plattform aus drei Brettern mit U-förmigem Schutzgeländer, vorn offen zum Aufsteigen
      const zv = zHinten + 0.34;
      if (alu) brett(latte, 2 * capX, H, zHinten, zv, capT);
      else for (let i = 0; i < 3; i++) {
        const b = (0.34 - 0.008) / 3, z0 = zHinten + i * (b + 0.004);
        brett(latte, 2 * capX, H, z0, z0 + b, capT);
      }
      const ph = 0.66, px = capX - 0.025, zb = zHinten + 0.03, zf = zv - 0.08, pw = 0.035;
      for (const sx of [-1, 1]) {
        for (const z of [zb, zf]) t.add(holm, rounded(pw, ph - 0.01, pw, ecke, sx * px, H - 0.005 + (ph - 0.01) / 2, z, 2));
        t.add(latte, rounded(pw, 0.035, zf - zb + pw, ecke, sx * px, H + ph - 0.0175, (zb + zf) / 2, 2));
      }
      t.add(latte, rounded(2 * px - pw + 0.004, 0.03, 0.03, ecke, 0, H + ph - 0.0175, zb, 2));
    } else brett(latte, 2 * capX, H, zHinten, zVorn, capT);
    // Scharniere am Deckel: Blech an der Stirnseite und der Bolzen, um den der Hintersatz klappt
    for (const sx of [-1, 1]) {
      const yu = yP - 0.02, yo = H - 0.004;
      t.add(metall, rounded(0.003, yo - yu, 0.05, 0.001, sx * (capX + 0.002), (yu + yo) / 2, zR(yP), 1));
      t.add(metall, new CylinderGeometry(0.007, 0.007, 0.012, 12).rotateZ(Math.PI / 2).translate(sx * (capX - 0.001), yP, zR(yP)));
    }
    // Hintersatz: steht offen, beweglich um die Scharnierbolzen; Sprossen rund, in den Holmen
    const hinten = t.moving("fold", 0, yP, zR(yP), { max: p.spread });
    for (const sx of [-1, 1]) {
      holmTeil(hinten, holm, braceW, braceD, ecke, sx * braceC, fuss, yR, zR);
      if (alu) holmTeil(hinten, gummi, braceW + 0.006, braceD + 0.006, 0.004, sx * braceC, 0, fuss + 0.005, zR);
    }
    const ru = Math.min(0.15, yP * 0.25), ro = yP - 0.12, rr = alu ? 0.012 : 0.014;
    for (let i = 0; i < n; i++) {
      const y = ru + ((ro - ru) * i) / (n - 1);
      hinten.add(holm, new CylinderGeometry(rr, rr, 2 * braceC, 12).rotateZ(Math.PI / 2).translate(0, y, zR(y)));
    }
    return t.group();
  },
});
