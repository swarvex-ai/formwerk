import { CircleGeometry, CylinderGeometry, LatheGeometry, TorusGeometry, Vector2 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

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
  budget: { triangles: 800, drawCalls: 4 },
  build(p, seed) {
    const z = rng(seed), h = p.height, wand = 0.007, seg = 14, rTop = p.radius * (1 - p.taper);
    const koerper = material(p.body === "wood" ? "wood" : p.body === "clay" ? "stone" : "metal", p.colour);
    const metall = material("metal", p.body === "pewter" ? "#9a9ea4" : "#4a4a4a");
    // Outer radius at height y
    const r = (y: number) => p.radius + (rTop - p.radius) * (y / h);
    const profil = [new Vector2(0, 0), new Vector2(p.radius, 0), new Vector2(rTop, h), new Vector2(rTop - wand, h), new Vector2(r(wand) - wand, wand), new Vector2(0, wand)];
    const t = new Parts().add(koerper, new LatheGeometry(profil, seg).rotateY(z() * Math.PI));
    if (p.body === "wood") {
      // Two bands, each a little off level and height
      for (const f of [0.2, 0.8]) {
        const y = h * f + (z() - 0.5) * 0.008, b = 0.012;
        t.add(metall, new CylinderGeometry(r(y + b / 2) + 0.002, r(y - b / 2) + 0.002, b, seg, 1, true).rotateX((z() - 0.5) * 0.04).rotateZ((z() - 0.5) * 0.04).translate(0, y, 0));
      }
    }
    if (p.fill >= 0.02) {
      const y = wand + p.fill * (h - 2 * wand);
      t.add(material("paint", p.drinkColour), new CircleGeometry(r(y) - wand - 0.0005, seg).rotateX(-Math.PI / 2).translate(0, y, 0));
    }
    // Half-ring handle on +x from 25 % to 85 % of the height, set into the wall
    const hr = 0.3 * h, reach = 0.04;
    t.add(koerper, new TorusGeometry(hr, 0.007, 6, 10, Math.PI).rotateZ(-Math.PI / 2).scale(reach / hr, 1, 1).translate(r(0.55 * h) - 0.012, 0.55 * h, 0));
    if (p.lid) {
      const deckel = t.moving("lid", rTop, h, 0);
      deckel.add(metall, new CylinderGeometry(rTop + 0.006, rTop + 0.006, 0.005, seg).translate(0, h + 0.0025, 0));
      // Thumb lever above the hinge, tipped up on the handle side
      deckel.box(metall, 0.03, 0.01, 0.02, rTop + 0.012, h + 0.01, 0);
    }
    return t.cylinder(p.radius, h).group();
  },
});
