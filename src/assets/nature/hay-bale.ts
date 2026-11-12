import { BoxGeometry, CylinderGeometry, TorusGeometry, type BufferGeometry, type Material } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const hayBale = defineAsset({
  id: "hay-bale", category: "nature",
  title: { de: "Heuballen", en: "Hay bale" },
  description: { de: "Rechteckiger oder runder Ballen aus Heu oder Stroh mit Twineschnüren, einzeln, nebeneinander oder als Pyramide gestapelt; jeder Seed legt die Ballen ein wenig schief.", en: "A square or round bale of hay or straw with twine bands, on its own, side by side or stacked as a pyramid; every seed lays the bales a little crooked." },
  params: {
    shape: { type: "choice", label: { de: "Form", en: "Shape" }, options: ["square", "round"], labels: { square: { de: "Rechteckig", en: "Square" }, round: { de: "Rund", en: "Round" } }, default: "square",
      describe: { de: "Rechteckig als Quader, rund als Zylinder, der mit der Achse in x auf dem Boden liegt.", en: "Square as a block, round as a cylinder lying on its side with its axis along x." } },
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.6, max: 1.8, step: 0.01, default: 0.9, unit: "m",
      describe: { de: "Länge in x: 0,9 m am rechteckigen Strohballen, 1,2–1,4 m am Rundballen.", en: "Length along x: 0.9 m on a square straw bale, 1.2–1.4 m on a round one." } },
    size: { type: "number", label: { de: "Kantenmaß", en: "Size" }, min: 0.3, max: 1.6, step: 0.01, default: 0.4, unit: "m",
      describe: { de: "Höhe und Tiefe eines rechteckigen Ballens oder Durchmesser eines runden: 0,4 m am Strohballen, 1,2–1,5 m am Rundballen.", en: "Height and depth of a square bale, or the diameter of a round one: 0.4 m on a straw bale, 1.2–1.5 m on a round bale." } },
    twine: { type: "integer", label: { de: "Schnüre", en: "Twine" }, min: 0, max: 3, default: 2,
      describe: { de: "Schnüre um den Ballen, gleichmäßig über die Länge verteilt: 0 keine, 2 am Strohballen, 3 am großen Ballen.", en: "Bands of twine around the bale, evenly spaced along its length: 0 none, 2 on a straw bale, 3 on a large bale." } },
    stack: { type: "integer", label: { de: "Stapel", en: "Stack" }, min: 1, max: 3, default: 1,
      describe: { de: "1 ein Ballen, 2 zwei nebeneinander in z, 3 zwei unten und einer obendrauf; runde Ballen stehen immer einzeln.", en: "1 one bale, 2 side by side along z, 3 two below and one on top; round bales always stand alone." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#d6b65a",
      describe: { de: "Farbe des Heus: strohgelb #d6b65a, helles Stroh #e2cf8a, altes Heu #a8955a.", en: "Colour of the hay: straw yellow #d6b65a, light straw #e2cf8a, old hay #a8955a." } },
  },
  presets: {
    field: { label: { de: "Feld", en: "Field" }, values: { shape: "square", colour: "#d6b65a" } },
    "round-bale": { label: { de: "Rundballen", en: "Round bale" }, values: { shape: "round", length: 1.2, size: 1.4 } },
    stack: { label: { de: "Stapel", en: "Stack" }, values: { stack: 3 } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 2200, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed), rund = p.shape === "round", L = p.length, S = p.size;
    // Drawn solid although a bale is loose hay: an effective density for its mass
    const heu = material("leaf", p.colour, 2 / S, 150), schnur = material("paint", "#7a5c3a");
    const t = new Parts(), spalt = 0.02, d = 0.008, b = 0.02;
    const plätze: [number, number][] = rund || p.stack === 1 ? [[0, 0]]
      : p.stack === 2 ? [[0, -(S + spalt) / 2], [0, (S + spalt) / 2]]
      : [[0, -(S + spalt) / 2], [0, (S + spalt) / 2], [S, 0]];
    const einstand = Math.min(0.08, L * 0.15);
    const xen = Array.from({ length: p.twine }, (_, i) => (p.twine === 1 ? 0 : (i / (p.twine - 1) - 0.5) * 2 * (L / 2 - einstand)));
    for (const [y0, z0] of plätze) {
      // Every bale lies a little crooked; long thin ones less, so stacked bales do not cross
      const dreh = rund ? 0 : (r() - 0.5) * (Math.PI / 45) * Math.min(1, S / L);
      const leg = (g: BufferGeometry, x: number, y: number, z: number, m: Material) => t.add(m, g.rotateY(dreh).translate(x, y0 + y, z0 + z));
      leg(rund ? new CylinderGeometry(S / 2, S / 2, L, 24).rotateZ(Math.PI / 2) : new BoxGeometry(L, S, S), 0, S / 2, 0, heu);
      for (const x of xen) {
        if (rund) leg(new TorusGeometry(S / 2, d / 2, 6, 24).rotateY(Math.PI / 2), x, S / 2, 0, schnur);
        else {
          for (const sz of [-1, 1]) leg(new BoxGeometry(b, S, d), x, S / 2, sz * (S / 2), schnur);
          leg(new BoxGeometry(b, d, S + 2 * d), x, S, 0, schnur);
        }
      }
    }
    return t.group();
  },
});
