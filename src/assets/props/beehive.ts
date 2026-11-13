import { CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const beehive = defineAsset({
  id: "beehive", category: "props",
  title: { de: "Bienenkorb", en: "Beehive" },
  description: { de: "Ein traditioneller Strohkorb (Bienenkorb) aus gewickelten Strohringen, auf einem Holzständer mit Brett und Pfosten oder direkt auf dem Boden, für Gärten, Höfe und Dörfer.", en: "A traditional straw skep, a dome of coiled straw rings, on a wooden stand with a board and post or on the ground, for gardens, farms and villages." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 0.6, step: 0.01, default: 0.42, unit: "m",
      describe: { de: "Höhe der Strohringe vom Fuß bis zur Spitze ohne Ständer: 0,36 m ein niedriger Korb, 0,42 m ein Gartenkorb, 0,58 m ein hoher Korb.", en: "Height of the coils from base to top without the stand: 0.36 m a low skep, 0.42 m a garden skep, 0.58 m a tall skep." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.15, max: 0.3, step: 0.005, default: 0.22, unit: "m",
      describe: { de: "Äußerer Radius des untersten Rings: 0,2 m ein schlanker Korb, 0,22 m üblich, 0,28 m ein breiter Korb.", en: "Outer radius of the lowest coil: 0.2 m a slim skep, 0.22 m usual, 0.28 m a broad skep." } },
    coils: { type: "integer", label: { de: "Ringe", en: "Coils" }, min: 8, max: 16, default: 11,
      describe: { de: "Anzahl der übereinander gestapelten Strohringe: 8 grob, 11 üblich, 15 für einen hohen Korb.", en: "Number of straw rings stacked to the top: 8 coarse, 11 usual, 15 for a tall skep." } },
    stand: { type: "number", label: { de: "Ständer", en: "Stand" }, min: 0, max: 0.8, step: 0.05, default: 0.45, unit: "m",
      describe: { de: "Höhe des Holzständers (Brett auf einem Pfosten): 0 stellt den Korb auf den Boden, 0,45 m ein Gartenständer, 0,8 m ein hoher Ständer.", en: "Height of the wooden stand (a round board on one post): 0 sets the skep on the ground, 0.45 m a garden stand, 0.8 m a tall stand." } },
    entrance: { type: "number", label: { de: "Flugloch", en: "Entrance" }, min: 0.04, max: 0.12, step: 0.01, default: 0.07, unit: "m",
      describe: { de: "Breite des dunklen Fluglochs vorn: 0,05 m eng, 0,07 m üblich, 0,1 m weit.", en: "Width of the dark entrance hole at the front: 0.05 m narrow, 0.07 m usual, 0.1 m wide." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#c8a050",
      describe: { de: "Farbe des Strohs: frisch #c8a050, gealtert #a08040, hell #d8bc70.", en: "Colour of the straw: fresh #c8a050, aged #a08040, pale #d8bc70." } },
    standColour: { type: "color", label: { de: "Ständerfarbe", en: "Stand colour" }, default: "#6a4a30",
      describe: { de: "Farbe des Holzständers: dunkel #6a4a30, hell #9a7a50, grau verwittert #7a7468.", en: "Colour of the wooden stand: dark #6a4a30, light #9a7a50, weathered grey #7a7468." } },
  },
  presets: {
    "garden-skep": { label: { de: "Gartenkorb", en: "Garden skep" }, values: { height: 0.42, stand: 0.45 } },
    "ground-skep": { label: { de: "Bodenkorb", en: "Ground skep" }, values: { stand: 0, height: 0.36 } },
    "tall-skep": { label: { de: "Hoher Korb", en: "Tall skep" }, values: { height: 0.58, radius: 0.2, coils: 15 } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 5000, drawCalls: 3 },
  build(p, seed) {
    const z = rng(seed), n = p.coils, base = p.stand;
    const straw = material("wood", p.colour), wood = material("wood", p.standColour);
    const c = p.height / (2 * n) * 1.2;
    const t = new Parts();
    let R = 0, y = 0, R0 = 0;
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n;
      R = p.radius * Math.sqrt(1 - Math.pow(f, 2.2)) * (1 + (z() - 0.5) * 0.03);
      if (i === 0) R0 = R;
      y = base + c + i * (p.height - 2 * c) / (n - 1);
      t.add(straw, new TorusGeometry(R, c, 6, 20).rotateX(Math.PI / 2).rotateY(z() * Math.PI * 2).translate(0, y, 0));
    }
    t.add(straw, new SphereGeometry(R + c, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, y, 0));
    t.box(material("paint", "#1a140c"), p.entrance, 0.035, 0.03, 0, base + c * 1.2, R0 + c * 0.4);
    if (p.stand > 0) {
      t.add(wood, new CylinderGeometry(p.radius + 0.04, p.radius + 0.04, 0.03, 20).translate(0, p.stand - 0.015, 0));
      t.post(wood, 0.04, p.stand - 0.03, 0, 0, 0);
    }
    return t.group();
  },
});
