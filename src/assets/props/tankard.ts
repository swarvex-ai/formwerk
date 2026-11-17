import { CatmullRomCurve3, CircleGeometry, CylinderGeometry, TubeGeometry, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, stave, turned } from "../shapes";

export const tankard = defineAsset({
  id: "tankard", category: "props",
  title: { de: "Humpen", en: "Tankard" },
  description: { de: "Ein Trinkkrug für Tavernen und Wirtshäuser mit Henkel, aus Holz mit Bändern, Zinn oder Steingut, mit Bier gefüllt und auf Wunsch mit aufklappbarem Deckel (bewegliches Teil „lid“).", en: "A drinking mug for taverns and inns with a handle, of banded wood, pewter or stoneware, filled with beer and optionally with a hinged lid (movable part \"lid\")." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.1, max: 0.22, step: 0.005, default: 0.15, unit: "m",
      describe: { de: "Höhe des Bechers ohne Deckel: 0,11 m ein Becher, 0,15 m ein Humpen, 0,20 m ein Maßkrug.", en: "Height of the body without the lid: 0.11 m a cup, 0.15 m a tankard, 0.20 m a stein." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.035, max: 0.07, step: 0.005, default: 0.05, unit: "m",
      describe: { de: "Äußerer Radius am Boden: 0,045 m ein kleiner Becher, 0,05 m ein Humpen, 0,065 m ein großer Krug.", en: "Outer radius at the base: 0.045 m a small cup, 0.05 m a tankard, 0.065 m a big mug." } },
    taper: { type: "number", label: { de: "Verjüngung", en: "Taper" }, min: 0, max: 0.3, step: 0.01, default: 0.1,
      describe: { de: "Um wie viel der Rand schmaler als der Boden ist, als Anteil des Radius: 0 gerade, 0,1 ein Humpen, 0,3 stark kegelig.", en: "How much narrower the rim is than the base, as a fraction of the radius: 0 straight, 0.1 a tankard, 0.3 strongly conical." } },
    body: { type: "choice", label: { de: "Material", en: "Body" }, options: ["wood", "pewter", "clay"],
      labels: { wood: { de: "Holz", en: "Wood" }, pewter: { de: "Zinn", en: "Pewter" }, clay: { de: "Steingut", en: "Clay" } }, default: "wood",
      describe: { de: "Holz aus Dauben mit zwei Metallbändern, glattes Zinn oder bemaltes Steingut.", en: "Wood staves with two metal bands, smooth pewter or painted stoneware." } },
    lid: { type: "boolean", label: { de: "Deckel", en: "Lid" }, default: false,
      describe: { de: "Ein flacher Metalldeckel mit Daumenhebel, der am Henkel klappt.", en: "A flat metal lid with a thumb lever, hinged at the handle." } },
    fill: { type: "number", label: { de: "Füllung", en: "Fill" }, min: 0, max: 1, step: 0.01, default: 0.8,
      describe: { de: "Füllstand innen, von oben bei offenem Deckel zu sehen: 0 leer, 0,8 gut eingeschenkt, 1 randvoll.", en: "Liquid level inside, seen from above when the lid is open: 0 empty, 0.8 well poured, 1 brimful." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a5a32",
      describe: { de: "Farbe des Bechers: Holz #8a5a32, Zinn #9a9ea4, Steingut #b07a5a.", en: "Colour of the body: wood #8a5a32, pewter #9a9ea4, stoneware #b07a5a." } },
    drinkColour: { type: "color", label: { de: "Getränk", en: "Drink" }, default: "#c8902a",
      describe: { de: "Farbe des Getränks: Bier #c8902a, Wein #5a2a2a, Wasser #6a8caa.", en: "Colour of the drink: beer #c8902a, wine #5a2a2a, water #6a8caa." } },
  },
  presets: {
    "beer-mug": { label: { de: "Bierkrug", en: "Beer mug" }, values: { body: "wood", height: 0.15, taper: 0.1 } },
    "pewter-stein": { label: { de: "Zinnkrug", en: "Pewter stein" }, values: { body: "pewter", lid: true, height: 0.18, taper: 0.15, colour: "#9a9ea4" } },
    "clay-cup": { label: { de: "Tonbecher", en: "Clay cup" }, values: { body: "clay", height: 0.11, radius: 0.045, colour: "#b07a5a", drinkColour: "#5a2a2a" } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "rotate", axis: [0, 0, -1], min: 0, max: 100 } },
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 3000, drawCalls: 4 },
  build(p, seed) {
    const z = rng(seed), h = p.height, wand = 0.007, seg = 16, rTop = p.radius * (1 - p.taper);
    const r = (y: number) => p.radius + (rTop - p.radius) * (y / h);
    const r0 = p.radius, dicke = Math.max(0.012, p.radius * 0.18);
    const koerper = p.body === "wood" ? material("wood", p.colour, 4)
      : p.body === "clay" ? material("stone", p.colour, 4, undefined, { moss: 0 })
      : material("metal", p.colour);
    const metall = material("metal", p.body === "pewter" ? "#9a9ea4" : "#4a4a4a");
    const t = new Parts();

    if (p.body === "wood") {
      // Staves like the barrel: about a hand wide with 2 mm joints, wood grain upright (scale 4, the object is small).
      // One wood tone: two tones would cost the draw call the lid needs (props stay at four).
      const n = Math.max(10, Math.round((2 * Math.PI * r(h / 2)) / 0.09)), fuge = 0.0022;
      for (let i = 0; i < n; i++) {
        const a0 = (2 * Math.PI * i) / n, a1 = (2 * Math.PI * (i + 1)) / n, halb = fuge / 2 / p.radius;
        t.add(koerper, stave(r, h, a0 + halb, a1 - halb, dicke, 12, 3));
      }
      // A septum in the middle of the wall closes the joints from inside (an open vessel), two faces front and back
      const mitte = (u: number, v: number) => new Vector3((r(v * h) - dicke / 2) * Math.cos(2 * Math.PI * u), v * h, (r(v * h) - dicke / 2) * Math.sin(2 * Math.PI * u));
      const raus = (q: Vector3) => new Vector3(q.x, 0, q.z);
      t.add(koerper, grid(n, 1, mitte, raus));
      t.add(koerper, grid(n, 1, mitte, (q) => raus(q).negate()));
      // Floor under the staves
      t.add(koerper, new CylinderGeometry(r(wand) - dicke / 2, r0 - dicke / 2, wand, n).translate(0, wand / 2, 0));
      // Two hoops, a little off level
      for (const f of [0.2, 0.8]) {
        const y = h * f + (z() - 0.5) * 0.008, b = 0.012;
        t.add(metall, new CylinderGeometry(r(y + b / 2) + 0.002, r(y - b / 2) + 0.002, b, seg, 1, true).rotateX((z() - 0.5) * 0.04).rotateZ((z() - 0.5) * 0.04).translate(0, y, 0));
      }
    } else {
      // Pewter or clay: a turned body with a moulded foot ring and lip, open at the top so the drink shows
      const profil: [number, number][] = [[0.001, 0], [p.radius, 0]];
      if (p.body === "pewter") {
        const fu = 0.005;
        profil.push([p.radius, fu], [p.radius - 0.0015, fu + 0.004], [rTop, h], [rTop + 0.0035, h], [rTop - wand, h]);
      } else {
        profil.push([rTop, h], [rTop + 0.002, h], [rTop - wand, h]);
      }
      profil.push([r(wand) - wand, wand], [0.001, wand]);
      t.add(koerper, turned(profil, seg));
    }
    // The drink inside, below the rim; for wood it must stay inside the narrower stave cavity
    if (p.fill >= 0.02) {
      const y = wand + p.fill * (h - 2 * wand), innen = p.body === "wood" ? dicke : wand;
      t.add(material("paint", p.drinkColour), new CircleGeometry(r(y) - innen - 0.0005, seg).rotateX(-Math.PI / 2).translate(0, y, 0));
    }
    // Curved loop handle joined to the wall at both ends, on the +x side
    const yL = 0.28 * h, yU = h - 0.010, mitteY = (yL + yU) / 2, reach = 0.04, tube = 0.006;
    const kurve = new CatmullRomCurve3([
      new Vector3(r(yL), yL, 0),
      new Vector3(r(mitteY) + reach, mitteY, 0),
      new Vector3(r(yU), yU, 0),
    ]);
    t.add(koerper, new TubeGeometry(kurve, 12, tube, 6, false));
    if (p.lid) {
      const deckel = t.moving("lid", rTop, h, 0);
      deckel.add(metall, new CylinderGeometry(rTop + 0.006, rTop + 0.006, 0.005, seg).translate(0, h + 0.0025, 0));
      // Thumb lever above the hinge, tipped up on the handle side
      deckel.box(metall, 0.03, 0.01, 0.02, rTop + 0.012, h + 0.01, 0);
    }
    return t.cylinder(p.radius, h).group();
  },
});
