import type { BufferGeometry, Material } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

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
  budget: { triangles: 16000, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color, 1, undefined, { grain: "part" });
    const kissen = material("paint", p.cushionColor);
    const gold = material("metal", p.trimColor);
    const stein = material("stone", "#8a857c", 1, 2400);
    const t = new Parts();
    const W = p.width, D = p.depth, H = p.backHeight, pt = 0.07, st = 0.04, za = 0.08, hc = 0.1, hb = 0.08;
    const y0 = p.dais > 0.005 ? p.dais : 0, ys = y0 + p.seatHeight, zp = -D / 2 + pt / 2, xp = W / 2 - pt / 2;
    // Dais: a stone block with eased edges
    if (y0 > 0) t.add(stein, rounded(W + 0.5, y0, D + 0.5, 0.015, 0, y0 / 2, 0, 2));
    // Base: four corner posts; the back ones run on up as the posts of the back frame
    for (const s of [-1, 1]) {
      t.add(holz, rounded(pt, ys - st + 0.002 - y0, pt, 0.004, s * xp, (y0 + ys - st + 0.002) / 2, D / 2 - pt / 2, 2));
      t.add(holz, rounded(pt, ys + H - hc + 0.01 - y0, pt, 0.004, s * xp, (y0 + ys + H - hc + 0.01) / 2, zp, 2));
    }
    // Each face of the base: apron under the seat, bottom rail, a panel 9 mm behind the posts in grooves of the frame
    // with a raised field, and the gilded band on the apron. Built for the front (outer face at z = o), then turned
    const hp = ys - st - za - (y0 + 0.08);
    const seite = (L: number, o: number, rot: number) => {
      const ax = Math.abs(Math.sin(rot)) > 0.5 ? "z" : "x";
      const z = (d: number, dicke: number) => o - d - dicke / 2;
      const teile: [Material, BufferGeometry][] = [
        [holz, grained(rounded(L + 0.012, za, 0.025, 0.003, 0, ys - st + 0.002 - za / 2, z(0.004, 0.025), 2), ax)],
        [holz, grained(rounded(L + 0.012, 0.08, 0.025, 0.003, 0, y0 + 0.04, z(0.004, 0.025), 2), ax)],
        [holz, grained(rounded(L + 0.012, hp + 0.012, 0.016, 0.003, 0, y0 + 0.08 + hp / 2, z(0.009, 0.016), 2), ax)],
        [holz, rounded(L - 0.08, hp - 0.08, 0.012, 0.004, 0, y0 + 0.08 + hp / 2, z(0.005, 0.012), 2)],
        [gold, rounded(L, 0.014, 0.006, 0.002, 0, ys - st + 0.002 - za / 2, z(-0.0005, 0.006), 2)],
      ];
      for (const [m, g] of teile) t.add(m, g.rotateY(rot));
    };
    seite(W - 2 * pt, D / 2, 0);
    seite(W - 2 * pt, D / 2, Math.PI);
    seite(D - 2 * pt, W / 2, Math.PI / 2);
    seite(D - 2 * pt, W / 2, -Math.PI / 2);
    // Seat board with an eased front edge, overhanging the base at the front and the sides
    t.add(holz, rounded(W + 0.02, st, D + 0.01, 0.012, 0, ys - st / 2, 0.015, 3));
    // Back frame: bottom rail on the seat, crest rail over the posts, a panel lapped 8 mm into posts and rails with a
    // raised field on both faces, and the gilded band on the front of the crest
    const Lp = W - 2 * pt + 0.016, hpan = H - hc - hb + 0.016, ypan = ys + hb - 0.008 + hpan / 2;
    t.add(holz, grained(rounded(W - 2 * pt + 0.012, hb, 0.04, 0.004, 0, ys + hb / 2, zp, 2), "x"));
    t.add(holz, grained(rounded(W + 0.02, hc, 0.06, 0.005, 0, ys + H - hc / 2, zp, 2), "x"));
    t.add(holz, grained(rounded(Lp, hpan, 0.018, 0.003, 0, ypan, zp, 2), "x"));
    for (const s of [-1, 1]) t.add(holz, rounded(Lp - 0.12, hpan - 0.12, 0.014, 0.004, 0, ypan, zp + s * 0.009, 2));
    t.add(gold, rounded(W, 0.016, 0.006, 0.002, 0, ys + H - hc / 2, zp + 0.0315, 2));
    if (p.arms) for (const s of [-1, 1]) {
      // Turned arm post on the seat over the front corner post, carrying a rail that runs into the back post
      const ha = 0.245, x = s * xp, zf = D / 2 - pt / 2, z0 = zp + pt / 2 - 0.005, z1 = D / 2 + 0.02;
      t.add(holz, turned([[0.0001, 0], [0.028, 0], [0.028, 0.03], [0.02, 0.045], [0.017, 0.11], [0.026, 0.13], [0.026, 0.145],
        [0.018, 0.16], [0.02, 0.22], [0.026, 0.23], [0.026, ha], [0.0001, ha]], 16, x, ys, zf));
      t.add(holz, grained(rounded(0.06, 0.04, z1 - z0, 0.005, x, ys + 0.26, (z0 + z1) / 2, 2), "z"));
      t.add(gold, turned([[0.0001, -0.003], [0.016, -0.003], [0.022, 0.01], [0.024, 0.02], [0.016, 0.032], [0.0001, 0.036]], 16, x, ys + 0.28, zf));
    }
    if (p.cushion) {
      // Soft cushions: on the seat between the posts, and against the back panel resting on the seat cushion
      const cw = W - 2 * pt - 0.01, zc = zp + pt / 2 + 0.002, zv = D / 2 - 0.005, hk = H * 0.42;
      t.add(kissen, rounded(cw, 0.075, zv - zc, 0.025, 0, ys + 0.0375, (zc + zv) / 2, 3));
      t.add(kissen, rounded(cw, hk, 0.08, 0.025, 0, ys + 0.075 + hk / 2, zp + 0.058, 3));
    }
    // Finials: a turned knob and point standing on the crest rail; with an odd count the middle one is taller
    for (let i = 0; i < p.finials; i++) {
      const x = p.finials === 1 ? 0 : -W / 2 + 0.03 + (i * (W - 0.06)) / (p.finials - 1);
      const h = i === (p.finials - 1) / 2 ? 0.2 : 0.14, prof: [number, number][] = [[0.0001, -0.004], [0.027, -0.004], [0.027, 0.012], [0.013, 0.022]];
      for (let k = 0; k <= 6; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 6; prof.push([0.012 + 0.018 * Math.cos(a), 0.052 + 0.028 * Math.sin(a)]); }
      prof.push([0.014, 0.084], [0.0001, h]);
      t.add(gold, turned(prof, 16, x, ys + H, zp));
    }
    return t.group();
  },
});
