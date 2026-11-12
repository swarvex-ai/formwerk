import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const desk = defineAsset({
  id: "desk", category: "furniture",
  title: { de: "Schreibtisch", en: "Desk" },
  description: { de: "Schreibtisch mit Platte, Beinen oder Seitenwänden und einem Schubladenblock mit einer bis drei Schubladen auf einer Seite; die oberste lässt sich herausziehen.", en: "A desk with a top, legs or side panels and a drawer pedestal with one to three drawers on one side; the top one slides out." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.8, max: 2, step: 0.01, default: 1.2, unit: "m",
      describe: { de: "Breite der Platte: 1,2 m üblich, 0,8 m für kleine Räume, 2 m ein breiter Büroschreibtisch.", en: "Width of the top: 1.2 m usual, 0.8 m for a small room, 2 m a wide office desk." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.5, max: 0.9, step: 0.01, default: 0.65, unit: "m",
      describe: { de: "Tiefe der Platte von vorn nach hinten: 0,65 m üblich, 0,8 m für viel Arbeitsfläche.", en: "Depth of the top from front to back: 0.65 m usual, 0.8 m for a lot of working space." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.68, max: 0.8, step: 0.01, default: 0.74, unit: "m",
      describe: { de: "Höhe bis Oberkante Platte: 0,74 m für Sitzende, 0,8 m für große Personen.", en: "Height to the top surface: 0.74 m for seated work, 0.8 m for tall people." } },
    base: { type: "choice", label: { de: "Gestell", en: "Base" }, options: ["legs", "panels"], labels: { legs: { de: "vier Beine", en: "four legs" }, panels: { de: "Seitenwände", en: "side panels" } }, default: "panels",
      describe: { de: "Unterbau: vier eckige Beine oder zwei durchgehende Seitenwände; ein Schubladenblock ersetzt die Seite, auf der er steht.", en: "Support: four square legs or two full side panels; a drawer pedestal replaces the side it stands on." } },
    pedestal: { type: "choice", label: { de: "Schubladenblock", en: "Drawer pedestal" }, options: ["none", "left", "right"], labels: { none: { de: "keiner", en: "none" }, left: { de: "links", en: "left" }, right: { de: "rechts", en: "right" } }, default: "right",
      describe: { de: "Unterbau mit Schubladen links oder rechts, wie am Büroschreibtisch; keiner lässt Beinfreiheit nach beiden Seiten.", en: "A cabinet with drawers on the left or right, like an office desk; none leaves legroom on both sides." } },
    drawers: { type: "integer", label: { de: "Schubladen", en: "Drawers" }, min: 1, max: 3, default: 2,
      describe: { de: "Zahl der Schubladen übereinander im Block; nur die oberste bewegt sich (bewegliches Teil „drawer“).", en: "Number of drawers stacked in the pedestal; only the top one moves (movable part \"drawer\")." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a6a4a",
      describe: { de: "Farbe des Holzes von Platte und Gestell.", en: "Colour of the wood of the top and the base." } },
  },
  presets: {
    "office-desk": { label: { de: "Büroschreibtisch", en: "Office desk" }, values: { width: 1.6, depth: 0.8, base: "panels", pedestal: "right", drawers: 3, color: "#6b5b4b" } },
    "writing-desk": { label: { de: "Schreibtisch", en: "Writing desk" }, values: { width: 1.1, depth: 0.6, base: "legs", pedestal: "none", color: "#7a5a3f" } },
    "standing-desk": { label: { de: "Stehender Schreibtisch", en: "Standing desk" }, values: { height: 0.8, width: 1.4, depth: 0.7, base: "panels", pedestal: "none", color: "#9a8a72" } },
  },
  rig: { drawer: { label: { de: "Schublade", en: "Drawer" }, type: "slide", axis: [0, 0, 1], min: 0, max: 0.45 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 3000, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color), Metall = material("metal", "#b8bec6");
    const t = new Parts();
    const w = p.width, d = p.depth, tt = 0.04, ht = p.height - tt;
    t.box(holz, w, tt, d, 0, p.height - tt / 2, 0);
    const sx = p.pedestal === "none" ? 0 : p.pedestal === "left" ? -1 : 1;
    // Gestell: die Seite des Schubladenblocks bleibt frei
    if (p.base === "legs") {
      for (const s of sx === 0 ? [1, -1] : [-sx])
        for (const sz of [1, -1]) t.post(holz, 0.025, ht, s * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06), 10, true);
    } else {
      for (const s of [1, -1]) if (s !== sx) t.box(holz, 0.03, ht, d - 0.06, s * (w / 2 - 0.035), ht / 2, 0);
    }
    if (sx) {
      // Block mit zwei Seitenwänden, Boden und Rückwand; die Fronten sitzen vor der Vorderkante
      const pw = Math.min(0.45, Math.max(0.25, w * 0.36)), pd = d - 0.06, st = 0.015, spalt = 0.006;
      const px = sx * (w / 2 - 0.02 - pw / 2), zc = pd / 2 + 0.002;
      for (const s of [-1, 1]) t.box(holz, st, ht, pd, px + s * (pw / 2 - st / 2), ht / 2, 0);
      t.box(holz, pw, 0.015, pd, px, 0.0075, 0).box(holz, pw - 2 * st, ht - 0.015, 0.015, px, 0.015 + (ht - 0.015) / 2, -pd / 2 + 0.0075);
      const zoll = (ht - 0.015) / p.drawers, fh = zoll - spalt, fw = pw - 0.02, ft = 0.016;
      const yo = (i: number) => ht - zoll * (i + 0.5);
      const griff = (teil: Parts, y: number) => {
        const bw = Math.min(0.14, fw * 0.5);
        teil.box(Metall, bw, 0.01, 0.01, px, y, zc + ft / 2 + 0.012);
        for (const s of [-1, 1]) teil.box(Metall, 0.012, 0.012, 0.014, px + s * (bw / 2 - 0.006), y, zc + ft / 2 + 0.006);
      };
      // Oberste Schublade: Kasten mit 6 mm Luft zu den statischen Seitenwänden, läuft beim Ziehen über die Fronten darunter
      const y = yo(0), aussen = pw - 2 * st - 0.012, wand = 0.01, hoehe = fh - 0.01, tiefe = pd - st - 0.02, kz = zc - tiefe / 2;
      const s1 = t.moving("drawer", px, y, zc, { max: Math.round(0.8 * pd * 100) / 100 });
      s1.box(holz, fw, fh, ft, px, y, zc + ft / 2);
      for (const s of [-1, 1]) s1.box(holz, wand, hoehe, tiefe, px + s * (aussen / 2 - wand / 2), y - 0.003, kz);
      s1.box(holz, aussen - 2 * wand, wand, tiefe, px, y - hoehe / 2 + wand / 2 - 0.003, kz)
        .box(holz, aussen - 2 * wand, hoehe, wand, px, y - 0.003, kz - tiefe / 2 + wand / 2);
      griff(s1, y);
      for (let i = 1; i < p.drawers; i++) {
        t.box(holz, fw, fh, ft, px, yo(i), zc + ft / 2);
        griff(t, yo(i));
      }
    }
    return t.group();
  },
});
