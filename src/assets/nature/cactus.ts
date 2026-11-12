import { BufferGeometry, Float32BufferAttribute, IcosahedronGeometry, Quaternion, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

const TAU = Math.PI * 2, OBEN = new Vector3(0, 1, 0);

/** The circular arc that rounds a body of radius `r1` into a dome of height `kuppe` whose tip sits at `hoehe`. */
const kappenArc = (r1: number, hoehe: number, kuppe: number) => {
  const rho = (r1 * r1 + kuppe * kuppe) / (2 * kuppe);
  return { rho, ym: hoehe - rho };
};

/**
 * Ribbed body of revolution around its own y axis: `profil(u)` in metres from the floor to `hoehe - kuppe`, then the
 * dome to the tip (0 leaves the top open); the bottom closes flat on the floor. The rib crests reach exactly `profil`
 * and the grooves fall back by `amp`, so the widest point of the body is the profile itself and a collision cylinder
 * of that radius encloses it.
 */
function koerper(profil: (u: number) => number, hoehe: number, ribs: number, amp: number, stufen: number, kuppe: number): BufferGeometry {
  const um = Math.max(24, ribs * 4), pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const rippe = (phi: number) => 1 - amp * Math.pow(Math.abs(Math.sin((ribs * phi) / 2)), 0.75);
  const ring = (r: number, y: number) => {
    const start = pos.length / 3;
    for (let i = 0; i <= um; i++) {
      const phi = (i / um) * TAU, rr = r * rippe(phi);
      pos.push(rr * Math.cos(phi), y, rr * Math.sin(phi));
      uv.push(i / um, y / hoehe);
    }
    return start;
  };
  const rand: [number, number][] = [];
  for (let i = 0; i <= stufen; i++) rand.push([profil(i / stufen), (i / stufen) * (hoehe - kuppe)]);
  if (kuppe > 0) {
    const { rho, ym } = kappenArc(rand[rand.length - 1][0], hoehe, kuppe);
    for (let i = 1; i <= 6; i++) {
      const y = hoehe - kuppe + (kuppe * i) / 7;
      rand.push([Math.sqrt(Math.max(1e-8, rho * rho - (y - ym) * (y - ym))), y]);
    }
    rand.push([0, hoehe]);
  }
  const unten = ring(rand[0][0], 0);
  let vorher = unten;
  for (const [r, y] of rand.slice(1)) {
    if (r <= 1e-4) {
      const spitze = pos.length / 3;
      pos.push(0, y, 0); uv.push(0.5, 1);
      for (let i = 0; i < um; i++) idx.push(vorher + i, spitze, vorher + i + 1);
      break;
    }
    const jetzt = ring(r, y);
    for (let i = 0; i < um; i++) idx.push(vorher + i, jetzt + i + 1, vorher + i + 1, vorher + i, jetzt + i, jetzt + i + 1);
    vorher = jetzt;
  }
  const boden = pos.length / 3;
  pos.push(0, 0, 0); uv.push(0.5, 0);
  for (let i = 0; i < um; i++) idx.push(boden, unten + i + 1, unten + i);
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export const cactus = defineAsset({
  id: "cactus", category: "nature",
  title: { de: "Kaktus", en: "Cactus" },
  description: { de: "Säulen- oder Fasskaktus mit scharf geripptem Körper und seitlich abgehenden, aufwärts gebogenen Armen; jeder Seed setzt die Arme anders.", en: "A column or barrel cactus with a sharply ribbed body and arms that leave it sideways and bend back up; every seed sets the arms differently." },
  params: {
    form: { type: "choice", label: { de: "Wuchsform", en: "Growth form" }, options: ["column", "barrel"], labels: { column: { de: "Säule", en: "column" }, barrel: { de: "Fass", en: "barrel" } }, default: "column",
      describe: { de: "Säule mit aufwärts gebogenen Armen wie ein Saguaro, oder die kugelige Fassform ohne Arme.", en: "A column with upward-bent arms like a saguaro, or the ball-shaped barrel form without arms." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.2, max: 8, step: 0.05, default: 2.5, unit: "m",
      describe: { de: "Höhe über dem Boden: 0,4 m ein Jungtier im Topf, 2,5 m eine junge Saguaro-Säule, 8 m ein alter Kaktus; beim Fasskaktus die Höhe der Kugel.", en: "Height above the ground: 0.4 m a young plant in a pot, 2.5 m a young saguaro column, 8 m an old cactus; on a barrel cactus the height of the ball." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.05, max: 0.6, step: 0.01, default: 0.25, unit: "m",
      describe: { de: "Radius des Körpers an der breitesten Stelle über den Rippen: 0,06 m bei einem jungen Säulenkaktus, 0,25 m an einer Saguaro-Säule, 0,5 m an einem fetten Fasskaktus; auch der Radius des Kollisionszylinders.", en: "Radius of the body at its widest point over the rib crests: 0.06 m on a young column cactus, 0.25 m on a saguaro column, 0.5 m on a stout barrel cactus; also the radius of the collision cylinder." } },
    ribs: { type: "integer", label: { de: "Rippen", en: "Ribs" }, min: 6, max: 24, default: 12,
      describe: { de: "Zahl der scharfen Rippen im Querschnitt: 8 an einer schlanken Säule, 12 am Saguaro, 24 am tief gerillten Fasskaktus.", en: "Number of sharp ribs around the cross-section: 8 on a slim column, 12 on a saguaro, 24 on a deeply fluted barrel cactus." } },
    arms: { type: "integer", label: { de: "Arme", en: "Arms" }, min: 0, max: 6, default: 3,
      describe: { de: "Zahl der seitlich abgehenden und dann aufwärts gebogenen Arme (nur bei der Säule): 0 ohne Arme, 3 der klassische Saguaro, 6 ein stark verzweigter Kaktus.", en: "Number of arms that leave the trunk sideways and then bend upward (column only): 0 without arms, 3 the classic saguaro, 6 a strongly branched cactus." } },
    bodyColor: { type: "color", label: { de: "Körper", en: "Body" }, default: "#4f7d52",
      describe: { de: "Farbe des Körpers: Grau-Grün #4f7d52, Blau-Grün #5b8a6a, Dunkelgrün #3a6a3f.", en: "Colour of the body: grey-green #4f7d52, blue-green #5b8a6a, dark green #3a6a3f." } },
    flowerColor: { type: "color", label: { de: "Blüten", en: "Flowers" }, default: "#e8b23a",
      describe: { de: "Farbe der Blüten auf den Spitzen: Gelb #e8b23a, Weiß #f2ecd8, Rosa #e0788a.", en: "Colour of the flowers on the tips: yellow #e8b23a, white #f2ecd8, pink #e0788a." } },
  },
  presets: {
    saguaro: { label: { de: "Saguaro", en: "Saguaro" }, values: { height: 5.5, radius: 0.3, ribs: 12, arms: 3, bodyColor: "#5b8a6a", flowerColor: "#f2ecd8" } },
    barrel: { label: { de: "Fasskaktus", en: "Barrel cactus" }, values: { form: "barrel", height: 0.9, radius: 0.45, ribs: 18, bodyColor: "#4f7d52", flowerColor: "#e8b23a" } },
    "young-column": { label: { de: "Junge Säule", en: "Young column" }, values: { height: 0.7, radius: 0.08, ribs: 9, arms: 0 } },
  },
  // Kollision am Körper: Arme und Blüten ragen über den Zylinder hinaus, wie bei der Palme der Stamm
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 40000, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed), t = new Parts();
    // the body is solid pulp, not air-filled foliage
    const gruene = material("leaf", p.bodyColor, 1 / Math.max(0.5, p.radius * 2.2), 400), bluete = material("paint", p.flowerColor);
    const tonne = p.form === "barrel", amp = tonne ? 0.24 : 0.16;
    const welle = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * u);
    // the crests of the ribs carry the profile, so the body is never wider than p.radius
    const profil = tonne
      ? (u: number) => p.radius * (u < 0.42 ? 0.62 + 0.38 * welle(u / 0.42) : 1 - 0.48 * welle((u - 0.42) / 0.58))
      : (u: number) => p.radius * (1 - 0.14 * u);
    const kuppe = Math.max(0.015, Math.min(p.height * (tonne ? 0.3 : 0.26), p.radius * (tonne ? 0.9 : 1.1)));
    t.add(gruene, koerper(profil, p.height, p.ribs, amp, Math.max(8, Math.min(40, Math.round(8 + p.height * 4))), kuppe));
    const bluem = Math.min(0.05, Math.max(0.012, p.height * 0.02));
    const blume = (x: number, y: number, z: number, s: number) => t.add(bluete, new IcosahedronGeometry(s, 0).translate(x, y, z));
    // a crown of flowers around the shoulder of the tip
    const { rho, ym } = kappenArc(profil(1), p.height, kuppe), yBl = p.height - kuppe * 0.55;
    const rBl = Math.sqrt(Math.max(0, rho * rho - (yBl - ym) * (yBl - ym))) * 0.86;
    const kranz = Math.max(4, Math.min(8, Math.round(p.ribs / 2)));
    for (let i = 0; i < kranz; i++) {
      const phi = (i / kranz) * TAU + (r() - 0.5) * 0.3;
      blume(rBl * Math.cos(phi), yBl, rBl * Math.sin(phi), bluem);
    }
    // arms on the rib crests: a horizontal stub, a round elbow, an upright that ends in one flower
    const armRibs = Math.max(6, Math.round(p.ribs * 0.55));
    if (!tonne) for (let i = 0; i < p.arms; i++) {
      const crest = (i * Math.max(1, Math.floor(p.ribs / Math.max(1, p.arms))) + Math.floor(r() * 2)) % p.ribs;
      const dir = new Vector3(Math.cos((crest / p.ribs) * TAU), 0, Math.sin((crest / p.ribs) * TAU));
      const uA = 0.34 + 0.18 * r(), yA = p.height * uA, stammR = p.radius * (1 - 0.14 * uA);
      // elbow and stub keep their whole thickness above the floor, even on a short trunk
      const armR = Math.min(stammR * 0.42, yA * 0.45), stuetz = Math.max(p.height * 0.2, armR * 1.7);
      const ansatz = new Vector3().copy(dir).multiplyScalar(stammR * 0.35);
      const ellbogen = new Vector3().copy(ansatz).addScaledVector(dir, stuetz);
      const stub = koerper(() => armR, stuetz, armRibs, amp, 6, 0).applyQuaternion(new Quaternion().setFromUnitVectors(OBEN, dir));
      stub.translate(ansatz.x, yA, ansatz.z);
      t.add(gruene, stub);
      t.add(gruene, new IcosahedronGeometry(armR * 1.25, 1).translate(ellbogen.x, yA, ellbogen.z));
      const rise = p.height * (0.16 + 0.14 * r()), spitze = yA - 0.35 * armR + rise + 0.4 * armR;
      t.add(gruene, koerper((u: number) => armR * (1 - 0.1 * u), rise + 0.4 * armR, armRibs, amp, Math.max(6, Math.round(rise * 4)), armR * 0.85).translate(ellbogen.x, yA - 0.35 * armR, ellbogen.z));
      blume(ellbogen.x, spitze - armR * 0.25, ellbogen.z, bluem * 0.9);
    }
    t.cylinder(p.radius, p.height);
    return t.group();
  },
});
