import { Color, CylinderGeometry, RingGeometry } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { roundBoards, stave, turned } from "../shapes";

export const barrel = defineAsset({
  id: "barrel", category: "props",
  title: { de: "Fass", en: "Barrel" },
  description: { de: "Ein Holzfass mit bauchigen Dauben und Reifen oder eine glatte Metalltonne mit Sicken.", en: "A wooden barrel with bulging staves and hoops, or a plain metal drum with ribs." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.4, max: 1.4, step: 0.01, default: 0.9, unit: "m",
      describe: { de: "Höhe: 0,6 m ein Fässchen, 0,9 m ein Weinfass oder eine Ölfasstonne, 1,2 m eine Regentonne.", en: "Height: 0.6 m a keg, 0.9 m a wine barrel or an oil drum, 1.2 m a water butt." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.15, max: 0.5, step: 0.01, default: 0.3, unit: "m",
      describe: { de: "Radius an Boden und Deckel: 0,2 m klein, 0,3 m ein Weinfass, 0,45 m eine Regentonne.", en: "Radius at the bottom and the lid: 0.2 m small, 0.3 m a wine barrel, 0.45 m a water butt." } },
    bulge: { type: "number", label: { de: "Bauch", en: "Bulge" }, min: 0, max: 0.3, step: 0.01, default: 0.15,
      describe: { de: "Wie viel weiter das Fass in der Mitte ist: 0 gerade, 0,15 ein Weinfass, 0,3 sehr rund (Metalltonnen bleiben gerade).", en: "How much wider the barrel is in the middle: 0 straight, 0.15 a wine barrel, 0.3 very round (metal drums stay straight)." } },
    hoops: { type: "integer", label: { de: "Reifen", en: "Hoops" }, min: 2, max: 6, default: 4,
      describe: { de: "Zahl der Reifen um das Holzfass, bei der Metalltonne die Sicken.", en: "Number of hoops around the wooden barrel, the ribs on a metal drum." } },
    kind: { type: "choice", label: { de: "Art", en: "Kind" }, options: ["wood", "drum"], labels: { wood: { de: "Holzfass", en: "Wooden barrel" }, drum: { de: "Metalltonne", en: "Metal drum" } }, default: "wood",
      describe: { de: "Holzfass mit Maserung und Eisenreifen oder lackierte Metalltonne.", en: "A wooden barrel with grain and iron hoops, or a painted metal drum." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#9a6a3c",
      describe: { de: "Farbe des Holzes oder des Lacks.", en: "Colour of the wood or the paint." } },
    hoopColor: { type: "color", label: { de: "Reifen", en: "Hoops" }, default: "#3a3a3a",
      describe: { de: "Farbe der Reifen am Holzfass.", en: "Colour of the hoops on the wooden barrel." } },
  },
  presets: {
    "wine-barrel": { label: { de: "Weinfass", en: "Wine barrel" }, values: { height: 0.95, radius: 0.32, bulge: 0.18, hoops: 4 } },
    "oil-drum": { label: { de: "Ölfass", en: "Oil drum" }, values: { kind: "drum", height: 0.88, radius: 0.29, hoops: 2, color: "#a33a2a" } },
    "water-butt": { label: { de: "Regentonne", en: "Water butt" }, values: { height: 1.2, radius: 0.42, bulge: 0.08, hoops: 3, color: "#6f5a3e" } },
  },
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 20000, drawCalls: 4 },
  build(p, seed) {
    const zufall = rng(seed);
    const holz = p.kind === "wood", bauch = holz ? p.bulge : 0, h = p.height;
    const r = (y: number) => p.radius * (1 + bauch * Math.sin((Math.PI * y) / h));
    const t = new Parts();
    if (holz) {
      // Drawn solid, an empty barrel is mostly air: an effective density for its mass
      // Two tones of the same wood, one per stave at random: real barrels are built from staves of different trees
      const ton = (k: number) => { const c = new Color(p.color); c.multiplyScalar(k); return `#${c.getHexString()}`; };
      const dauben = material("wood", p.color, 1, 130), dauben2 = material("wood", ton(0.88), 1, 130), boden = material("wood", p.color, 1, 130, { grain: "x" }), reif = material("iron", p.hoopColor, 1, 180);
      // Staves about a hand wide at the belly, 2 mm apart: the joints read as dark lines
      const n = Math.max(10, Math.round((2 * Math.PI * r(h / 2)) / 0.095)), fuge = 0.0022, dicke = Math.max(0.014, p.radius * 0.07);
      for (let i = 0; i < n; i++) {
        const a0 = (2 * Math.PI * i) / n, a1 = (2 * Math.PI * (i + 1)) / n, halb = fuge / 2 / p.radius;
        t.add(zufall() < 0.45 ? dauben2 : dauben, stave(r, h, a0 + halb, a1 - halb, dicke, 14, 3));
      }
      // Heads sit a little below the stave ends (the chime), boards across x
      const kimme = Math.min(0.03, h * 0.035), kopfDicke = Math.max(0.014, dicke * 0.9);
      for (const y of [h - kimme, kimme + kopfDicke]) {
        const rr = r(y) - dicke + 0.001, bretter = Math.max(3, Math.round((2 * rr) / 0.12));
        t.add(boden, roundBoards(rr, bretter, 0.002, kopfDicke, 12).translate(0, y, 0));
      }
      // Iron hoops near the ends and over the belly: thin conical bands on the staves
      const breite = Math.min(0.045, h * 0.05), staerke = 0.004;
      for (let k = 0; k < p.hoops; k++) {
        const y = h * (0.08 + (0.84 * k) / (p.hoops - 1)), y0 = y - breite / 2, y1 = y + breite / 2;
        const ru = r(y0) + staerke, ro = r(y1) + staerke;
        t.add(reif, new CylinderGeometry(ro, ru, breite, 64, 1, true).translate(0, y, 0));
        t.add(reif, new RingGeometry(r(y1) - 0.0005, ro, 64, 1).rotateX(-Math.PI / 2).translate(0, y1, 0));
        t.add(reif, new RingGeometry(r(y0) - 0.0005, ru, 64, 1).rotateX(Math.PI / 2).translate(0, y0, 0));
      }
      // The bung on the stave that faces the viewer, at the belly
      const a = (2 * Math.PI * (Math.round((Math.atan2(0.8, 0.6) / (2 * Math.PI)) * n) + 0.5)) / n, rb = Math.min(0.02, p.radius * 0.07);
      t.add(dauben, new CylinderGeometry(rb, rb * 1.08, 0.012, 16).rotateZ(Math.PI / 2).rotateY(-a).translate(Math.cos(a) * (r(h / 2) - 0.002), h / 2, Math.sin(a) * (r(h / 2) - 0.002)));
    } else {
      const blech = material("metal", p.color, 1, 180);
      // A steel drum: rolled rims at both ends, rolling hoops pressed out of the wall, a lid with two bungs
      const R = p.radius, lippe = Math.min(0.012, h * 0.015);
      const profil: [number, number][] = [[0.001, 0.012], [R - 0.01, 0.012], [R - 0.01, 0.004], [R, 0], [R + lippe * 0.6, lippe], [R, lippe * 2]];
      const sicken = Math.max(1, p.hoops);
      for (let k = 1; k <= sicken; k++) {
        const y = (h * k) / (sicken + 1), b = Math.min(0.02, h * 0.025);
        profil.push([R, y - b], [R + 0.007, y - b * 0.3], [R + 0.007, y + b * 0.3], [R, y + b]);
      }
      profil.push([R, h - lippe * 2], [R + lippe * 0.6, h - lippe], [R, h], [R - 0.01, h - 0.004], [R - 0.01, h - 0.012], [0.001, h - 0.012]);
      t.add(blech, turned(profil, 48));
      for (const [x, rr] of [[R * 0.55, 0.026], [-R * 0.6, 0.014]] as const) t.add(blech, turned([[rr, 0], [rr, 0.012], [rr * 0.7, 0.016], [0.001, 0.016]], 20, x, h - 0.012, 0));
    }
    return t.cylinder(p.radius * (1 + bauch), h).group();
  },
});
