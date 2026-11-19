import { Box3, CylinderGeometry, ExtrudeGeometry, Shape, TorusGeometry, Vector3 } from "three";
import { grid, rounded, turned } from "../shapes";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// A flat plate lying in the anchor's plane (the x-z plane): the outline is drawn in x and y, the plate gets its
// thickness along y and sits centred on y = 0, so one lift rests it on the floor like every other part. The bevel
// eases every edge; it is offset inwards and the depth shortened, so outline and thickness stay those given.
const platte = (dicke: number, umriss: number[][], fase: number) => {
  const s = new Shape();
  umriss.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return new ExtrudeGeometry(s, { depth: dicke - 2 * fase, bevelEnabled: true, bevelThickness: fase, bevelSize: fase, bevelOffset: -fase, bevelSegments: 2 })
    .rotateX(-Math.PI / 2).translate(0, fase - dicke / 2, 0);
};

export const anchor = defineAsset({
  id: "anchor", category: "props",
  title: { de: "Anker", en: "Anchor" },
  description: { de: "Ein Schiffanker, der flach auf dem Boden liegt: Schaft mit Schäkelring, zwei Arme mit Flunken, bei der Bauform Admiralty zusätzlich ein Stock quer über dem Schaft.", en: "A ship's anchor lying flat on the ground: a shank with a ring, two arms with flukes and, in the admiralty style, a stock across the shank." },
  params: {
    length: { type: "number", label: { de: "Schaftlänge", en: "Shank length" }, min: 0.4, max: 3, step: 0.05, default: 1.2, unit: "m",
      describe: { de: "Länge des Schafts, woran sich alle anderen Maße halten: 0,5 m Beibootanker, 1,2 m Yachtanker, 3 m großer Schiffanker.", en: "Length of the shank, which everything else follows: 0.5 m a boat anchor, 1.2 m a yacht anchor, 3 m a large ship anchor." } },
    style: { type: "choice", label: { de: "Bauform", en: "Style" }, options: ["admiralty", "stockless"], labels: { admiralty: { de: "Admiralität", en: "Admiralty" }, stockless: { de: "Stocklos", en: "Stockless" } }, default: "admiralty",
      describe: { de: "Admiralitätsanker mit gekrümmten Armen, dreieckigen Flunken und einem Stock quer über dem Schaft, stockloser Anker ohne Stock mit zwei breiten Flunken an einem Block am unteren Ende.", en: "Admiralty anchor with curved arms, flat triangular flukes and a stock across the shank, stockless anchor without a stock and two broad flukes on a block at the bottom." } },
    spread: { type: "number", label: { de: "Armspreizung", en: "Arm spread" }, min: 60, max: 140, step: 5, default: 100, unit: "°",
      describe: { de: "Winkel zwischen den beiden Armen: 60° schmal entlang des Schafts nach hinten, 100° klassischer Anker, 140° weit geöffnet.", en: "Angle between the two arms: 60° drawn far back along the shank, 100° a classic anchor, 140° opened wide." } },
    ring: { type: "boolean", label: { de: "Ring", en: "Ring" }, default: true,
      describe: { de: "Ring am oberen Ende des Schafts, worin die Kette hängt; aus endet der Schaft in einem schlichten Augblock.", en: "Ring at the top end of the shank for the chain; off the shank ends in a plain eye block." } },
    color: { type: "color", label: { de: "Eisen", en: "Iron" }, default: "#3a3d40",
      describe: { de: "Farbe des Eisens: #3a3d40 rohes Eisen, #6c7177 verzinkt, #2b2118 alt, mit Rost braun gestrichen.", en: "Colour of the iron: #3a3d40 bare iron, #6c7177 galvanised, #2b2118 old and painted brown over the rust." } },
  },
  presets: {
    admiralty: { label: { de: "Admiralität", en: "Admiralty" }, values: { style: "admiralty" } },
    stockless: { label: { de: "Stocklos", en: "Stockless" }, values: { style: "stockless", spread: 70 } },
    boat: { label: { de: "Beiboot", en: "Boat" }, values: { length: 0.5, color: "#6c7177" } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 2800, drawCalls: 1 },
  build(p) {
    const eisen = material("iron", p.color, 2, undefined, { rust: 0.3 }), t = new Parts(), L = p.length, adm = p.style === "admiralty", grad = Math.PI / 180;
    // The anchor lies in the x-z plane: shank along z with the ring end at -z, crown at z = 0, arms spreading in x.
    // It rests on its thickest part, so everything else is lifted by exactly that half thickness.
    const rs = 0.046 * L, kragen = (adm ? 0.052 : 0.05) * L, stock = 0.058 * L, block = 0.052 * L, fase = 0.006 * L;
    const heben = adm ? stock : block;
    const quer = (r: number, laenge: number, z: number) => t.add(eisen, new CylinderGeometry(r, r, laenge, 16).rotateZ(-Math.PI / 2).translate(0, heben, z));
    const laengs = (r0: number, r1: number, laenge: number, z: number) => t.add(eisen, new CylinderGeometry(r1, r0, laenge, 16).rotateX(Math.PI / 2).translate(0, heben, z));
    // Shank with the eye block where the ring hangs
    laengs(rs * 0.9, rs * (adm ? 1.12 : 1.06), L, -L / 2);
    laengs(kragen, kragen, 0.09 * L, -L + 0.045 * L);
    if (p.ring) {
      const r = 0.1 * L, rohre = 0.022 * L;
      t.add(eisen, new TorusGeometry(r, rohre, 10, 32).rotateX(Math.PI / 2).translate(0, heben, -L - r + rohre * 1.2));
    }
    if (adm) {
      // The stock lies across the shank below the ring: turned, tapering to 0.7 × at both ends, each closed by a ball
      // of 1.2 × the end radius (a sphere arc from the tip round to the neck), then lathed about y and laid along x
      const h = 0.26 * L, endR = 0.7 * stock, ballR = 1.2 * endR, yc = h - ballR, hals = Math.PI - Math.asin(endR / ballR);
      const kugel: [number, number][] = [];
      for (let i = 0; i <= 8; i++) { const th = (hals * i) / 8; kugel.push([ballR * Math.sin(th), -yc - ballR * Math.cos(th)]); }
      const profil: [number, number][] = [...kugel, [stock, 0], ...kugel.map(([r, y]): [number, number] => [r, -y]).reverse()];
      t.add(eisen, turned(profil, 16).rotateZ(-Math.PI / 2).translate(0, heben, -0.87 * L));
      quer(0.05 * L, 0.15 * L, 0);
      // Every arm is one tapered tube swept along a 70° arc from the crown; its end lies spread/2 off the shank, towards
      // the ring. Three more rows close the tip in a quarter sphere that sinks into the fluke.
      const anfang = (145 - p.spread / 2) * grad, bogen = 70 * grad, ende = anfang + bogen, S = 4 * 0.115 * L, R = S / bogen;
      const r0 = 0.038 * L, r1 = 0.026 * L, xe = R * (Math.cos(anfang) - Math.cos(ende)), ze = R * (Math.sin(ende) - Math.sin(anfang));
      for (const s of [1, -1]) {
        const arm = (u: number, v: number) => {
          const k = u * 27, w = Math.min(k, 24) / 24, a = anfang + bogen * w, kappe = (Math.max(0, k - 24) / 3) * (Math.PI / 2);
          const r = (r0 + (r1 - r0) * w) * Math.cos(kappe), vor = r1 * Math.sin(kappe), phi = v * 2 * Math.PI - Math.PI / 2;
          // Centre on the arc, pushed on along the tangent in the cap; the circle around it in the up/side frame
          const x = R * (Math.cos(anfang) - Math.cos(a)) + Math.sin(a) * vor + Math.cos(a) * r * Math.cos(phi);
          const z = R * (Math.sin(a) - Math.sin(anfang)) + Math.cos(a) * vor - Math.sin(a) * r * Math.cos(phi);
          return new Vector3(s * x, heben + r * Math.sin(phi), z);
        };
        const mitte = (q: Vector3) => q.clone().sub(arm(0.5, 0.5).add(arm(0.5, 0)).multiplyScalar(0.5));
        t.add(eisen, grid(27, 12, arm, mitte));
        // The flat triangular fluke points on along the crescent
        const flankenhalb = 0.105 * L;
        t.add(eisen, platte(0.048 * L, [[0, -flankenhalb], [0.2 * L, 0], [0, flankenhalb]], fase).rotateY(s * ende - Math.PI / 2).translate(s * xe, heben, ze));
      }
    } else {
      // The hinge block at the foot of the shank and the two broad flukes folded back along it
      t.add(eisen, rounded(0.28 * L, 2 * block, 0.14 * L, 0.01 * L, 0, heben, 0.03 * L));
      quer(0.048 * L, 0.3 * L, -0.01 * L);
      const klappen = (180 - p.spread / 2) * grad, schaufel = [[0, -0.05 * L], [0.3 * L, -0.11 * L], [0.3 * L, 0.11 * L], [0, 0.05 * L]];
      for (const s of [1, -1]) t.add(eisen, platte(0.06 * L, schaufel, fase).rotateY(s * klappen - Math.PI / 2).translate(s * 0.115 * L, heben, 0.03 * L));
    }
    const anker = t.group();
    const b = new Box3().setFromObject(anker);
    anker.position.z = -(b.min.z + b.max.z) / 2;
    return anker;
  },
});
