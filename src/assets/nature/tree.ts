import { BufferGeometry, Color, CylinderGeometry, Float32BufferAttribute, Quaternion, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, turned } from "../shapes";

export const tree = defineAsset({
  id: "tree", category: "nature",
  title: { de: "Baum", en: "Tree" },
  description: { de: "Laub- oder Nadelbaum aus rekursiven Ästen; jeder Seed wächst anders.", en: "A broadleaf or conifer grown from recursive branches; every seed grows differently." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1, max: 16, step: 0.1, default: 6, unit: "m",
      describe: { de: "Gesamthöhe des Baums.", en: "Total height of the tree." } },
    trunk: { type: "number", label: { de: "Stammradius", en: "Trunk radius" }, min: 0.04, max: 0.6, step: 0.01, default: 0.18, unit: "m",
      describe: { de: "Radius des Stamms am Boden; auch der Radius des Kollisionszylinders.", en: "Radius of the trunk at the ground; also the radius of the collision cylinder." } },
    crown: { type: "choice", label: { de: "Krone", en: "Crown" }, options: ["round", "cone", "bare"], labels: { round: { de: "Laub", en: "broadleaf" }, cone: { de: "Nadelbaum", en: "conifer" }, bare: { de: "kahl", en: "bare" } }, default: "round",
      describe: { de: "Laubkrone, kegelförmiger Nadelbaum oder kahle Äste (Winter).", en: "Broadleaf crown, conical conifer, or bare branches (winter)." } },
    levels: { type: "integer", label: { de: "Astebenen", en: "Branch levels" }, min: 1, max: 5, default: 3,
      describe: { de: "Wie oft sich die Äste verzweigen; jede Ebene vervielfacht die Dreiecke.", en: "How often the branches fork; every level multiplies the triangles." } },
    branches: { type: "integer", label: { de: "Äste je Gabel", en: "Branches per fork" }, min: 2, max: 5, default: 3,
      describe: { de: "Äste je Verzweigung.", en: "Branches at each fork." } },
    spread: { type: "number", label: { de: "Spreizung", en: "Spread" }, min: 10, max: 70, step: 1, default: 35, unit: "°",
      describe: { de: "Winkel der Äste zu ihrem Mutterast: klein wirkt schlank, groß ausladend.", en: "Angle of the branches to their parent: small looks slender, large looks spreading." } },
    leafSize: { type: "number", label: { de: "Laubgröße", en: "Leaf size" }, min: 0.3, max: 2, step: 0.05, default: 1,
      describe: { de: "Größe der Laubbüschel oder Nadelkegel relativ zum Ast.", en: "Size of the leaf clusters or needle cones relative to the branch." } },
    barkColor: { type: "color", label: { de: "Rinde", en: "Bark" }, default: "#6b4a2f",
      describe: { de: "Farbe der Rinde.", en: "Colour of the bark." } },
    leafColor: { type: "color", label: { de: "Laub", en: "Leaves" }, default: "#3f7d3a",
      describe: { de: "Farbe von Laub oder Nadeln.", en: "Colour of the leaves or needles." } },
  },
  presets: {
    oak: { label: { de: "Eiche", en: "Oak" }, values: { height: 9, trunk: 0.35, levels: 4, spread: 45, leafSize: 1.2 } },
    fir: { label: { de: "Tanne", en: "Fir" }, values: { height: 10, trunk: 0.25, crown: "cone", leafColor: "#2f5d3a" } },
    winter: { label: { de: "Winterbaum", en: "Winter tree" }, values: { crown: "bare", levels: 4 } },
    sapling: { label: { de: "Setzling", en: "Sapling" }, values: { height: 1.5, trunk: 0.04, levels: 2 } },
  },
  // Kollision nur am Stamm: unter der Krone kann man hindurchgehen
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 140000, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed), blattZufall = rng(seed + 1);
    const rinde = material("bark", p.barkColor, 1 / Math.max(0.5, p.trunk * 5));
    // Leaves are many small cards in two shades (plain colours: thousands of cards would not fit a bake atlas)
    const ton = (k: number) => { const c = new Color(p.leafColor); c.multiplyScalar(k); return `#${c.getHexString()}`; };
    const laubHell = material("leaf", p.leafColor, 1, undefined, { plain: true }), laubDunkel = material("leaf", ton(0.74), 1, undefined, { plain: true });
    const t = new Parts();
    const oben = new Vector3(0, 1, 0);
    const blaetter: [Blattliste, Blattliste] = [new Blattliste(), new Blattliste()];
    if (p.crown === "cone") {
      t.add(rinde, turned([[p.trunk * 1.25, 0], [p.trunk, p.height * 0.04], [p.trunk * 0.4, p.height], [0.001, p.height]], 12));
      t.cylinder(p.trunk, p.height);
      // Tiers of drooping boughs: a ring of points around each cone, so the edge is ragged like real branch tips
      const stufen = p.levels * 2 + 2;
      for (let i = 0; i < stufen; i++) {
        const k = i / stufen, rad = p.height * 0.28 * (1 - k) * p.leafSize + 0.1, hh = ((p.height * 0.75) / stufen) * 1.8;
        const y = p.height * 0.22 + k * p.height * 0.75 + hh, zacken = 7 + Math.floor(r() * 5), dreh = r() * Math.PI * 2;
        const rand = (u: number) => rad * (0.78 + 0.22 * Math.abs(Math.sin((u * Math.PI * 2 * zacken) / 2 + dreh)));
        const flaeche = (u: number, v: number) => {
          const a = u * Math.PI * 2, rr = rand(u) * v;
          return new Vector3(Math.cos(a) * rr, y - v * hh - v * v * hh * 0.35, Math.sin(a) * rr);
        };
        const raus = (q: Vector3) => new Vector3(q.x, (rad * 0.8), q.z).normalize();
        const m = i % 2 ? laubDunkel : laubHell;
        t.add(m, grid(zacken * 6, 4, flaeche, raus));
        t.add(m, grid(zacken * 6, 4, flaeche, (q) => raus(q).negate()));
      }
      return t.group();
    }
    const stamm = p.height * 0.42;
    t.cylinder(p.trunk, stamm);
    // The trunk widens into roots at the ground
    t.add(rinde, turned([[p.trunk * 1.45, 0], [p.trunk * 1.12, stamm * 0.04], [p.trunk, stamm * 0.12], [p.trunk * 0.72, stamm]], ebeneSegmente(0)));
    // Leaves: at most 20 000 for the whole crown, shared by the clusters
    const cluster = p.crown === "round" ? Math.pow(p.branches, p.levels) : 0, jeCluster = cluster ? Math.floor(20000 / cluster) : 0;
    const ast = (start: Vector3, richtung: Vector3, laenge: number, radius: number, ebene: number) => {
      if (ebene > 0) {
        const g = new CylinderGeometry(radius * 0.72, radius, laenge, ebeneSegmente(ebene), 1, true);
        g.translate(0, laenge / 2, 0);
        g.applyQuaternion(new Quaternion().setFromUnitVectors(oben, richtung));
        g.translate(start.x, start.y, start.z);
        t.add(rinde, g);
      }
      const ende = start.clone().addScaledVector(richtung, laenge);
      if (ebene >= p.levels) {
        // Laub nie unter den Boden
        if (p.crown === "round") blattwolke(blaetter, ende, Math.min(laenge * 0.9 * p.leafSize, ende.y * 0.95), jeCluster, blattZufall);
        return;
      }
      for (let i = 0; i < p.branches; i++) {
        const um = (i / p.branches) * Math.PI * 2 + r() * 1.2, neig = (p.spread * (0.7 + r() * 0.6) * Math.PI) / 180;
        const neu = richtung.clone().applyAxisAngle(new Vector3(Math.cos(um), 0, Math.sin(um)), neig).normalize();
        if (neu.y < 0.15) { neu.y = 0.15; neu.normalize(); } // Äste wachsen nicht in den Boden
        ast(ende, neu, laenge * (0.62 + r() * 0.12), radius * 0.62, ebene + 1);
      }
    };
    ast(new Vector3(0, 0, 0), oben.clone(), stamm, p.trunk, 0);
    if (blaetter[0].anzahl) t.add(laubHell, blaetter[0].geometrie());
    if (blaetter[1].anzahl) t.add(laubDunkel, blaetter[1].geometrie());
    return t.group();
  },
});

/** Radial segments by branch level: round trunks, thin twigs with few sides. */
const ebeneSegmente = (ebene: number) => [14, 9, 7, 6, 5, 5][Math.min(5, ebene)];

/** Leaf cards of one shade: positions, normals and uv, both faces. */
class Blattliste {
  pos: number[] = []; nor: number[] = []; uv: number[] = []; anzahl = 0;
  /** A leaf: a pointed card from `basis` along `achse`, `breite` across, lit like the outside of the crown (`licht`). */
  blatt(basis: Vector3, achse: Vector3, quer: Vector3, laenge: number, breite: number, licht: Vector3) {
    const spitze = basis.clone().addScaledVector(achse, laenge), mitte = basis.clone().addScaledVector(achse, laenge * 0.45);
    const l = mitte.clone().addScaledVector(quer, -breite / 2), r = mitte.clone().addScaledVector(quer, breite / 2);
    const vorn = [basis, l, spitze, basis, spitze, r], hinten = [basis, spitze, l, basis, r, spitze];
    const uvs = [[0.5, 0], [0, 0.45], [0.5, 1], [0.5, 0], [0.5, 1], [1, 0.45]];
    for (const seite of [vorn, hinten]) seite.forEach((q, i) => { this.pos.push(q.x, q.y, q.z); this.nor.push(licht.x, licht.y, licht.z); this.uv.push(uvs[i][0], uvs[i][1]); });
    this.anzahl++;
  }
  geometrie(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new Float32BufferAttribute(this.nor, 3));
    g.setAttribute("uv", new Float32BufferAttribute(this.uv, 2));
    return g;
  }
}

/** A cluster of leaves around `mitte`: most near the outside, each turned at random; their normals lean outwards, so
 *  the crown is lit as one soft volume and not as thousands of flickering cards. */
function blattwolke(listen: [Blattliste, Blattliste], mitte: Vector3, radius: number, anzahl: number, r: () => number) {
  if (radius <= 0.02 || anzahl <= 0) return;
  const n = Math.min(anzahl, Math.max(30, Math.round(420 * (radius / 0.8) ** 2)));
  const laenge = Math.max(0.05, radius * 0.24), breite = laenge * 0.55;
  for (let i = 0; i < n; i++) {
    const d = new Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
    if (d.lengthSq() < 1e-4) d.set(0, 1, 0);
    d.normalize();
    const abstand = radius * (0.5 + 0.5 * Math.sqrt(r()));
    const basis = mitte.clone().addScaledVector(d, abstand);
    basis.y = Math.max(basis.y, laenge);
    const achse = new Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).addScaledVector(d, 0.6).normalize();
    const quer = new Vector3().crossVectors(achse, d).normalize();
    if (quer.lengthSq() < 1e-6) quer.set(1, 0, 0);
    const licht = d.clone().multiplyScalar(0.75).add(new Vector3().crossVectors(achse, quer).multiplyScalar(0.25)).normalize();
    listen[r() < 0.55 ? 0 : 1].blatt(basis, achse, quer, laenge * (0.8 + r() * 0.4), breite * (0.8 + r() * 0.4), licht);
  }
}
