import { CylinderGeometry, LatheGeometry, Vector2 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

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
  budget: { triangles: 2000, drawCalls: 2 },
  build(p) {
    const holz = p.kind === "wood", bauch = holz ? p.bulge : 0, h = p.height;
    // Drawn solid, an empty barrel is mostly air: an effective density for its mass
    const koerper = material(holz ? "wood" : "metal", p.color, 1, holz ? 130 : 180), reif = material("metal", holz ? p.hoopColor : p.color, 1, 180);
    const r = (y: number) => p.radius * (1 + bauch * Math.sin((Math.PI * y) / h));
    const profil = [new Vector2(0, 0), ...Array.from({ length: 13 }, (_, i) => new Vector2(r((h * i) / 12), (h * i) / 12)), new Vector2(0, h)];
    const t = new Parts().add(koerper, new LatheGeometry(profil, 20));
    // Hoops near the ends and spread over the belly, just outside the staves
    for (let k = 0; k < p.hoops; k++) {
      const y = h * (0.07 + (0.86 * k) / (p.hoops - 1)), rr = r(y) + 0.008, b = holz ? 0.035 : 0.02;
      t.add(reif, new CylinderGeometry(rr, rr, b, 20, 1, true).translate(0, y, 0));
    }
    return t.cylinder(p.radius * (1 + bauch), h).group();
  },
});
