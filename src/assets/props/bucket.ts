import { CircleGeometry, CylinderGeometry, LatheGeometry, TorusGeometry, Vector2 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const bucket = defineAsset({
  id: "bucket", category: "props",
  title: { de: "Eimer", en: "Bucket" },
  description: {
    de: "Ein Eimer für Brunnen, Küchen, Ställe und Höfe, aus Holz mit Metallbändern oder als Metalleimer, mit umklappbarem Tragebügel (bewegliches Teil „handle“).",
    en: "A bucket for wells, kitchens, stables and farms, of banded wood or metal, with a swinging carry handle (movable part \"handle\").",
  },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.2, max: 0.4, step: 0.01, default: 0.3, unit: "m",
      describe: { de: "Höhe des Eimers ohne Bügel: 0,22 m ein kleiner Pail, 0,3 m ein Hofeimer, 0,38 m ein großer Brunneneimer.", en: "Height of the bucket without the handle: 0.22 m a small pail, 0.3 m a farm bucket, 0.38 m a large well bucket." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.1, max: 0.2, step: 0.005, default: 0.15, unit: "m",
      describe: { de: "Äußerer Radius am oberen Rand: 0,11 m ein Melkeimer, 0,15 m ein Hofeimer, 0,18 m ein Brunnenkübel.", en: "Outer radius at the rim: 0.11 m a milk pail, 0.15 m a farm bucket, 0.18 m a well bucket." } },
    taper: { type: "number", label: { de: "Verjüngung", en: "Taper" }, min: 0, max: 0.25, step: 0.01, default: 0.15,
      describe: { de: "Um wie viel der Boden schmaler als der Rand ist, als Anteil des Radius: 0 zylindrisch, 0,15 ein klassischer Eimer.", en: "How much narrower the floor is than the rim, as a fraction of the radius: 0 straight, 0.15 a typical bucket." } },
    body: { type: "choice", label: { de: "Material", en: "Body" }, options: ["wood", "metal"],
      labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } }, default: "wood",
      describe: { de: "Holz mit zwei geschmiedeten Bändern oder ein glatter Metalleimer.", en: "Wood with two forged bands or a smooth metal pail." } },
    fill: { type: "number", label: { de: "Füllung", en: "Fill" }, min: 0, max: 1, step: 0.01, default: 0.5,
      describe: { de: "Wasserstand innen: 0 leer, 0,5 halbvoll, 1 randvoll.", en: "Liquid level inside: 0 empty, 0.5 half full, 1 brimful." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a5a32",
      describe: { de: "Farbe des Eimers: Holz #8a5a32, Zink oder Blech #9a9ea4.", en: "Colour of the body: wood #8a5a32, galvanised metal #9a9ea4." } },
    liquidColour: { type: "color", label: { de: "Flüssigkeit", en: "Liquid colour" }, default: "#5a7a8c",
      describe: { de: "Farbe der Flüssigkeit: Wasser #5a7a8c, Milch #f2efe6.", en: "Colour of the liquid: water #5a7a8c, milk #f2efe6." } },
  },
  presets: {
    "well-bucket": { label: { de: "Brunneneimer", en: "Well bucket" }, values: { body: "wood", height: 0.32, taper: 0.15 } },
    "pail": { label: { de: "Wassereimer", en: "Pail" }, values: { body: "metal", height: 0.26, taper: 0.1, colour: "#9a9ea4" } },
    "milk-pail": { label: { de: "Milcheimer", en: "Milk pail" }, values: { body: "metal", fill: 0.8, colour: "#9a9ea4", liquidColour: "#f2efe6" } },
  },
  rig: { handle: { label: { de: "Bügel", en: "Handle" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 90 } },
  physics: { body: "dynamic", collider: "cylinder" },
  budget: { triangles: 900, drawCalls: 4 },
  build(p, seed) {
    const z = rng(seed), h = p.height, wall = 0.01, floor = 0.012, seg = 16;
    const rBottom = p.radius * (1 - p.taper);
    const r = (y: number) => rBottom + (p.radius - rBottom) * (y / h);

    const koerper = material(p.body === "wood" ? "wood" : "metal", p.colour);
    const metall = material("metal", p.body === "metal" ? p.colour : "#4a4a4a");

    const profil = [
      new Vector2(0, 0),
      new Vector2(rBottom, 0),
      new Vector2(p.radius, h),
      new Vector2(p.radius - wall, h),
      new Vector2(r(floor) - wall, floor),
      new Vector2(0, floor),
    ];
    const t = new Parts().add(koerper, new LatheGeometry(profil, seg).rotateY(z() * Math.PI));

    if (p.body === "wood") {
      for (const f of [0.2, 0.75]) {
        const y = h * f + (z() - 0.5) * 0.008, b = 0.016;
        t.add(metall, new CylinderGeometry(r(y + b / 2) + 0.002, r(y - b / 2) + 0.002, b, seg, 1, true)
          .rotateX((z() - 0.5) * 0.03).rotateZ((z() - 0.5) * 0.03).translate(0, y, 0));
      }
    } else {
      // Slightly thicker rim band for metal pail
      const b = 0.012;
      t.add(metall, new CylinderGeometry(p.radius + 0.002, r(h - b) + 0.002, b, seg, 1, true).translate(0, h - b / 2, 0));
    }

    if (p.fill >= 0.02) {
      const y = floor + p.fill * (h - floor - 0.01);
      t.add(material("paint", p.liquidColour), new CircleGeometry(r(y) - wall - 0.0005, seg).rotateX(-Math.PI / 2).translate(0, y, 0));
    }

    // Metal box on the body at each ear (x = ±(radius + 0.002), y = h - 0.02) as plain parts, not moving
    for (const seite of [-1, 1]) {
      t.box(metall, 0.012, 0.025, 0.012, seite * (p.radius + 0.002), h - 0.02, 0);
    }

    // Handle: half ring
    const R = p.radius + 0.006;
    const henkel = t.moving("handle", 0, h - 0.02, 0);
    henkel.add(metall, new TorusGeometry(R, 0.004, 6, 12, Math.PI).translate(0, h - 0.02, 0));

    return t.cylinder(p.radius, h).group();
  },
});
