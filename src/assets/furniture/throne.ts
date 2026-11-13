import { ConeGeometry, SphereGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const throne = defineAsset({
  id: "throne", category: "furniture",
  title: { de: "Thron", en: "Throne" },
  description: { de: "Herrscherstuhl auf massivem Holzsockel mit hoher Lehne, Armlehnen, rotem Polster, vergoldeter Zierleiste und Kegelknäufen, optional auf steinernem Podium.", en: "A ruler's seat on a solid wooden base with a tall back, armrests, a red cushion, gilded trim and pointed finials, optionally on a stone dais." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.6, max: 1.2, step: 0.01, default: 0.8, unit: "m",
      describe: { de: "Außenbreite von Sitz und Lehne; ein Thron für eine Person ist etwa 0,8 m, ein Prunkthron bis 1,2 m.", en: "Outer width of seat and back; a single-seat throne is about 0.8 m, a state throne up to 1.2 m." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.5, max: 0.9, step: 0.01, default: 0.65, unit: "m",
      describe: { de: "Tiefe der Sitzfläche von vorn nach hinten; üblich sind 0,6–0,7 m.", en: "Depth of the seat from front to back; 0.6–0.7 m is typical." } },
    seatHeight: { type: "number", label: { de: "Sitzhöhe", en: "Seat height" }, min: 0.4, max: 0.6, step: 0.01, default: 0.48, unit: "m",
      describe: { de: "Höhe der Sitzfläche über dem Podium: 0,46 m wie an einem Stuhl, 0,6 m für einen erhöhten Thron.", en: "Height of the seat above the dais: 0.46 m like a chair, 0.6 m for a raised throne." } },
    backHeight: { type: "number", label: { de: "Lehnenhöhe", en: "Back height" }, min: 0.6, max: 1.8, step: 0.05, default: 1.1, unit: "m",
      describe: { de: "Höhe der Lehne über der Sitzfläche: 1,1 m wirkt würdevoll, 1,8 m ragt über Stehende hinaus.", en: "Height of the back above the seat: 1.1 m looks dignified, 1.8 m towers over standing guests." } },
    finials: { type: "integer", label: { de: "Kegelknäufe", en: "Finials" }, min: 0, max: 7, default: 3,
      describe: { de: "Anzahl vergoldeter Kegel auf dem Lehnenabschluss; bei ungerader Zahl ist der mittlere höher, 0 lässt sie ganz weg.", en: "Number of gilded cones on the crest; with an odd count the middle one is taller, 0 leaves them off." } },
    arms: { type: "boolean", label: { de: "Armlehnen", en: "Armrests" }, default: true,
      describe: { de: "Armlehnen mit vergoldeten Knäufen an der Vorderkante; ohne wird der Thron schmaler.", en: "Armrests with gilded knobs at the front edge; without them the throne reads narrower." } },
    cushion: { type: "boolean", label: { de: "Polster", en: "Cushion" }, default: true,
      describe: { de: "Polster auf Sitz und Lehne; ohne steht das blanke Holz da, etwa beim Häuptlingssitz.", en: "Upholstery on seat and back; without it the bare wood shows, like a chieftain's seat." } },
    dais: { type: "number", label: { de: "Podiumshöhe", en: "Dais height" }, min: 0, max: 0.3, step: 0.01, default: 0.12, unit: "m",
      describe: { de: "Höhe des steinernen Podiums unter dem Thron, 0 ohne; 0,12–0,25 m in Thronsaalen.", en: "Height of the stone platform under the throne, 0 for none; 0.12–0.25 m in throne halls." } },
    color: { type: "color", label: { de: "Holzfarbe", en: "Wood colour" }, default: "#5a3a24",
      describe: { de: "Grundfarbe des Holzes, klassisch dunkle Eiche.", en: "Base colour of the wood, classically dark oak." } },
    cushionColor: { type: "color", label: { de: "Polsterfarbe", en: "Cushion colour" }, default: "#8a1c24",
      describe: { de: "Farbe des Polsters, klassisch tiefes Rot; Bischofsthron eher violett.", en: "Colour of the cushion, classically a deep red; a bishop's throne more violet." } },
    trimColor: { type: "color", label: { de: "Zierfarbe", en: "Trim colour" }, default: "#c9a240",
      describe: { de: "Farbe der Metallteile: Gold für Prunk, Eisen für einen einfachen Thron.", en: "Colour of the metal parts: gold for state, iron for a plain throne." } },
  },
  presets: {
    "royal": { label: { de: "Königstron", en: "Royal throne" }, values: { backHeight: 1.5, finials: 5, dais: 0.25 } },
    "chieftain": { label: { de: "Häuptlingssitz", en: "Chieftain's seat" }, values: { cushion: false, finials: 0, dais: 0, color: "#6e5034", trimColor: "#6a6a6a" } },
    "bishop": { label: { de: "Bischofsthron", en: "Bishop's throne" }, values: { width: 0.7, backHeight: 1.6, finials: 1, cushionColor: "#5a2a6a" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 3000, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color);
    const kissen = material("paint", p.cushionColor);
    const gold = material("metal", p.trimColor);
    const stein = material("stone", "#8a857c", 1, 2400);
    const t = new Parts();
    const W = p.width, D = p.depth, H = p.backHeight, pf = 0.06;
    const y0 = p.dais > 0.005 ? p.dais : 0, ys = y0 + p.seatHeight, zb = -D / 2 + 0.04;
    if (y0 > 0) t.box(stein, W + 0.5, y0, D + 0.5, 0, y0 / 2, 0);
    t.box(holz, W, p.seatHeight - 0.06, D, 0, y0 + (p.seatHeight - 0.06) / 2, 0);
    t.box(holz, W + 0.04, 0.06, D + 0.04, 0, ys - 0.03, 0);
    t.box(gold, W + 0.05, 0.02, D + 0.05, 0, ys - 0.06, 0);
    t.box(holz, W, H, 0.08, 0, ys + H / 2, zb);
    for (const s of [-1, 1]) t.box(holz, pf, H, pf + 0.02, s * (W / 2 - pf / 2), ys + H / 2, zb);
    t.box(gold, W + 0.02, 0.04, 0.1, 0, ys + H - 0.02, zb);
    if (p.arms) for (const s of [-1, 1]) {
      t.box(holz, 0.08, 0.26, D - 0.08, s * (W / 2 - 0.04), ys + 0.13, 0.04);
      t.box(holz, 0.1, 0.04, D, s * (W / 2 - 0.04), ys + 0.28, 0.02);
      t.add(gold, new SphereGeometry(0.035, 10, 6).translate(s * (W / 2 - 0.04), ys + 0.32, D / 2 - 0.02));
    }
    if (p.cushion) {
      const ib = p.arms ? W - 0.18 : W - 0.04;
      t.box(kissen, ib, 0.07, D - 0.14, 0, ys + 0.035, 0.03);
      t.box(kissen, ib, H * 0.6, 0.04, 0, ys + 0.1 + H * 0.3, zb + 0.06);
    }
    for (let i = 0; i < p.finials; i++) {
      const x = p.finials === 1 ? 0 : -W / 2 + pf / 2 + (i * (W - pf)) / (p.finials - 1);
      const h = 0.1 + (i === (p.finials - 1) / 2 ? 0.06 : 0);
      t.add(gold, new ConeGeometry(0.035, h, 8).translate(x, ys + H + h / 2, zb));
    }
    return t.group();
  },
});
