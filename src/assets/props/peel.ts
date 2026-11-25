import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { turned } from "../shapes";

type P2 = [number, number];

// A closed plate over a convex outline (x, z): flat underside at y = y0, top face rising to y0 + dicke(z); sharp edges.
const platte = (rand: P2[], y0: number, dicke: (z: number) => number): BufferGeometry => {
  const pos: number[] = [], uv: number[] = [];
  const cx = rand.reduce((s, q) => s + q[0], 0) / rand.length, cz = rand.reduce((s, q) => s + q[1], 0) / rand.length;
  const tri = (a: Vector3, b: Vector3, c: Vector3, hint: Vector3) => {
    if (new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).dot(hint) < 0) [b, c] = [c, b];
    for (const v of [a, b, c]) { pos.push(v.x, v.y, v.z); uv.push(v.x, v.z); }
  };
  const oben = (q: P2) => new Vector3(q[0], y0 + dicke(q[1]), q[1]), unten = (q: P2) => new Vector3(q[0], y0, q[1]);
  const mitte: P2 = [cx, cz];
  for (let i = 0; i < rand.length; i++) {
    const a = rand[i], b = rand[(i + 1) % rand.length];
    tri(oben(mitte), oben(a), oben(b), new Vector3(0, 1, 0));
    tri(unten(mitte), unten(a), unten(b), new Vector3(0, -1, 0));
    const aussen = new Vector3((a[0] + b[0]) / 2 - cx, 0, (a[1] + b[1]) / 2 - cz);
    tri(unten(a), unten(b), oben(b), aussen);
    tri(unten(a), oben(b), oben(a), aussen);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
};

export const peel = defineAsset({
  id: "peel", category: "props",
  title: { de: "Brotschieber", en: "Baker's peel" },
  description: { de: "Der hölzerne Brotschieber der Bäckerei: ein flaches Blatt, vorn zur scharfen Kante abgeflacht, und ein langer runder Stiel mit Knauf. Er liegt flach, das Blatt zeigt nach +z; für Backstuben, Pizzaöfen, Küchen und Bauernhäuser.", en: "The baker's wooden oven shovel: a flat blade thinning to a sharp front edge and a long round handle with a knob. It lies flat, the blade towards +z; for bakeries, pizza ovens, kitchens and farm houses." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1, max: 3, step: 0.05, default: 1.8, unit: "m",
      describe: { de: "Gesamtlänge vom Stielende bis zur Vorderkante des Blatts: 1,0 m ein Pizzaschieber, 1,8 m ein Bäckerschieber, 3 m für einen tiefen Holzofen.", en: "Overall length from the handle end to the front edge of the blade: 1.0 m a pizza peel, 1.8 m a bakery peel, 3 m for a deep wood-fired oven." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.22, max: 0.5, step: 0.01, default: 0.34, unit: "m",
      describe: { de: "Breite des Blatts: 0,25 m für einzelne Laibe, 0,4 m für Pizzen und Bleche.", en: "Width of the blade: 0.25 m for single loaves, 0.4 m for pizzas and trays." } },
    blade: { type: "number", label: { de: "Blattlänge", en: "Blade length" }, min: 0.25, max: 0.55, step: 0.01, default: 0.38, unit: "m",
      describe: { de: "Länge des Blatts entlang z: 0,32 m kurz, 0,38 m üblich, 0,5 m für lange Brote; der Rest ist der Stiel. Beim runden Blatt die Länge des Halses hinter der Scheibe.", en: "Length of the blade along z: 0.32 m short, 0.38 m usual, 0.5 m for long loaves; the rest is the handle. With a round blade the length of the neck behind the disc." } },
    shape: { type: "choice", label: { de: "Form", en: "Shape" }, options: ["square", "round"], labels: { square: { de: "Eckig", en: "Square" }, round: { de: "Rund", en: "Round" } }, default: "square",
      describe: { de: "Rechteckiges Blatt mit abgerundeten vorderen Ecken (Brot) oder rundes Blatt, eine Scheibe mit dem Durchmesser der Breite (Pizza).", en: "A rectangular blade with rounded front corners (bread) or a round blade, a disc of the diameter of the width (pizza)." } },
  },
  presets: {
    bakery: { label: { de: "Bäckerei", en: "Bakery" }, values: { length: 1.8 } },
    pizza: { label: { de: "Pizza", en: "Pizza" }, values: { length: 1.1, width: 0.36, shape: "round", blade: 0.42 } },
    oven: { label: { de: "Holzofen", en: "Wood oven" }, values: { length: 2.8, width: 0.28, blade: 0.32 } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 2500, drawCalls: 1 },
  build(p) {
    const holz = material("wood", "#b98a55", 1, undefined, { grain: "part" });
    const t = new Parts();
    const L = p.length, W = p.width, B = p.blade, rund = p.shape === "round";
    const rH = 0.017, rK = 0.02, hy = rK, dHinten = 0.012, dVorn = 0.004, hoehe = hy - dHinten / 2;
    const zf = L / 2, zEnde = -L / 2;
    // Blatt: Rückkante zBlatt, Vorderkante zf; das runde Blatt ist eine Scheibe vom Durchmesser W, hinten bei der Sehne gekappt
    const R = W / 2, halbSehne = 0.45 * R, hinterMitte = Math.sqrt(R * R - halbSehne * halbSehne);
    const zMitte = zf - R, zBlatt = rund ? zMitte - hinterMitte : zf - B;
    // Hals: verjüngt sich vom Blatt auf die Stielbreite; er passt sich an, damit der Stiel mindestens 0.3 m lang bleibt
    const halsBreit = rund ? halbSehne : W / 2, rest = zBlatt - zEnde;
    const hals = Math.max(0.02, Math.min(rund ? B : 0.08, rest - 0.3));
    const zHals = zBlatt - hals;
    const dicke = (z: number) => dHinten + (dVorn - dHinten) * Math.min(1, Math.max(0, (z - zBlatt) / (zf - zBlatt)));
    const rand: P2[] = [];
    if (rund) {
      // Von der linken Sehnenecke über die Front zur rechten; f zählt von +z
      const n = 28, fc = Math.acos(-hinterMitte / R);
      for (let i = 0; i <= n; i++) {
        const f = -fc + (2 * fc * i) / n;
        rand.push([R * Math.sin(f), zMitte + R * Math.cos(f)]);
      }
    } else {
      const r = 0.25 * W, k = 6, zr = zf - r;
      rand.push([-W / 2, zBlatt], [W / 2, zBlatt]);
      for (let i = 0; i <= k; i++) { const a = (Math.PI / 2) * (i / k); rand.push([W / 2 - r + r * Math.cos(a), zr + r * Math.sin(a)]); }
      for (let i = 0; i <= k; i++) { const a = Math.PI / 2 + (Math.PI / 2) * (i / k); rand.push([-W / 2 + r + r * Math.cos(a), zr + r * Math.sin(a)]); }
    }
    t.add(holz, grained(platte(rand, hoehe, dicke), "z"));
    t.add(holz, grained(platte([[-rH, zHals], [rH, zHals], [halsBreit, zBlatt], [-halsBreit, zBlatt]], hoehe, () => dHinten), "z"));
    // Stiel: gedrehtes Profil mit dem Knauf am Ende, liegend entlang z
    const hl = zHals + 0.01 - zEnde;
    const profil: [number, number][] = [[0.0001, 0], [0.012, 0], [0.018, 0.006], [rK, 0.02], [0.0185, 0.04], [rH, 0.06], [rH, hl], [0.0001, hl]];
    t.add(holz, grained(turned(profil, 16).rotateX(Math.PI / 2).translate(0, hy, zEnde), "z"));
    return t.group();
  },
});
