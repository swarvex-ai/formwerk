import { Box3, CylinderGeometry, ExtrudeGeometry, Shape, TorusGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// A flat plate lying in the anchor's plane (the x-z plane): the outline is drawn in x and y, the plate gets its
// thickness along y and sits centred on y = 0, so one lift rests it on the floor like every other part.
const platte = (dicke: number, umriss: number[][]) => {
  const s = new Shape();
  umriss.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return new ExtrudeGeometry(s, { depth: dicke, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -dicke / 2, 0);
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
  budget: { triangles: 900, drawCalls: 1 },
  build(p) {
    const eisen = material("metal", p.color), t = new Parts(), L = p.length, adm = p.style === "admiralty", grad = Math.PI / 180;
    // The anchor lies in the x-z plane: shank along z with the ring end at -z, crown at z = 0, arms spreading in x.
    // It rests on its thickest part, so everything else is lifted by exactly that half thickness.
    const rs = 0.046 * L, kragen = (adm ? 0.052 : 0.05) * L, stock = 0.058 * L, block = 0.052 * L;
    const heben = adm ? stock : block;
    const steg = (r0: number, r1: number, x0: number, z0: number, x1: number, z1: number) => {
      const laenge = Math.hypot(x1 - x0, z1 - z0);
      t.add(eisen, new CylinderGeometry(r1, r0, laenge, 8).rotateX(Math.PI / 2).rotateY(Math.atan2(x1 - x0, z1 - z0)).translate((x0 + x1) / 2, heben, (z0 + z1) / 2));
    };
    const quer = (r: number, laenge: number, z: number) => t.add(eisen, new CylinderGeometry(r, r, laenge, 12).rotateZ(-Math.PI / 2).translate(0, heben, z));
    const laengs = (r0: number, r1: number, laenge: number, z: number) => t.add(eisen, new CylinderGeometry(r1, r0, laenge, 10).rotateX(Math.PI / 2).translate(0, heben, z));
    // Shank with the eye block where the ring hangs
    laengs(rs * 0.9, rs * (adm ? 1.12 : 1.06), L, -L / 2);
    laengs(kragen, kragen, 0.09 * L, -L + 0.045 * L);
    if (p.ring) {
      const r = 0.1 * L, rohre = 0.022 * L;
      t.add(eisen, new TorusGeometry(r, rohre, 6, 18).rotateX(Math.PI / 2).translate(0, heben, -L - r + rohre * 1.2));
    }
    if (adm) {
      // The stock lies across the shank below the ring, the crown bar joins the two arms
      quer(stock, 0.52 * L, -0.87 * L);
      quer(0.05 * L, 0.15 * L, 0);
      // Every arm runs as an arc of four short cylinders; its end lies spread/2 off the shank, towards the ring
      const anfang = (145 - p.spread / 2) * grad, bogen = 70 * grad, ende = anfang + bogen;
      for (const s of [1, -1]) {
        let x = 0, z = 0;
        for (let i = 0; i < 4; i++) {
          const a = anfang + (bogen * i) / 3, nx = x + Math.sin(a) * 0.115 * L, nz = z + Math.cos(a) * 0.115 * L;
          steg((0.038 - 0.003 * i) * L, (0.038 - 0.003 * (i + 1)) * L, s * x, z, s * nx, nz);
          x = nx; z = nz;
        }
        // The flat triangular fluke points on along the crescent
        const flankenhalb = 0.105 * L;
        t.add(eisen, platte(0.048 * L, [[0, -flankenhalb], [0.2 * L, 0], [0, flankenhalb]]).rotateY(s * ende - Math.PI / 2).translate(s * x, heben, z));
      }
    } else {
      // The hinge block at the foot of the shank and the two broad flukes folded back along it
      t.box(eisen, 0.28 * L, 2 * block, 0.14 * L, 0, heben, 0.03 * L);
      quer(0.048 * L, 0.3 * L, -0.01 * L);
      const klappen = (180 - p.spread / 2) * grad, schaufel = [[0, -0.05 * L], [0.3 * L, -0.11 * L], [0.3 * L, 0.11 * L], [0, 0.05 * L]];
      for (const s of [1, -1]) t.add(eisen, platte(0.06 * L, schaufel).rotateY(s * klappen - Math.PI / 2).translate(s * 0.115 * L, heben, 0.03 * L));
    }
    const anker = t.group();
    const b = new Box3().setFromObject(anker);
    anker.position.z = -(b.min.z + b.max.z) / 2;
    return anker;
  },
});
