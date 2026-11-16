import { BufferGeometry, Color, CylinderGeometry, Float32BufferAttribute, IcosahedronGeometry, Quaternion, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const bush = defineAsset({
  id: "bush", category: "nature",
  title: { de: "Busch", en: "Bush" },
  description: { de: "Ein Busch aus Laubballen, von einem kleinen Strauch bis zur Hecke, auf Wunsch blühend; jeder Seed wächst anders.", en: "A bush of leaf clusters, from a small shrub to a hedge, flowering if you like; every seed grows differently." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.4, max: 3, step: 0.05, default: 1.2, unit: "m",
      describe: { de: "Breite: 0,5 m ein kleiner Strauch, 1,2 m ein Busch, 3 m ein Stück Hecke.", en: "Width: 0.5 m a small shrub, 1.2 m a bush, 3 m a piece of hedge." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 2, step: 0.05, default: 0.9, unit: "m",
      describe: { de: "Höhe: 0,4 m bodennah, 0,9 m kniehoch bis hüfthoch, 1,8 m mannshoch.", en: "Height: 0.4 m low, 0.9 m knee to hip high, 1.8 m as tall as a person." } },
    clusters: { type: "integer", label: { de: "Laubballen", en: "Clusters" }, min: 3, max: 24, default: 10,
      describe: { de: "Zahl der Laubballen: 4 locker, 10 üblich, 24 dicht wie eine Hecke.", en: "Number of leaf clusters: 4 loose, 10 usual, 24 dense like a hedge." } },
    flowers: { type: "number", label: { de: "Blüten", en: "Flowers" }, min: 0, max: 1, step: 0.05, default: 0,
      describe: { de: "Wie viele Blüten: 0 keine, 0,4 einige, 1 in voller Blüte.", en: "How many flowers: 0 none, 0.4 some, 1 in full bloom." } },
    leafColor: { type: "color", label: { de: "Laub", en: "Leaves" }, default: "#3f7d3a",
      describe: { de: "Farbe des Laubs.", en: "Colour of the leaves." } },
    flowerColor: { type: "color", label: { de: "Blüten", en: "Flowers" }, default: "#e05a8a",
      describe: { de: "Farbe der Blüten: Rosa #e05a8a, Weiß #f4f1e8, Gelb #f0c419.", en: "Colour of the flowers: pink #e05a8a, white #f4f1e8, yellow #f0c419." } },
  },
  presets: {
    shrub: { label: { de: "Strauch", en: "Shrub" }, values: { width: 0.7, height: 0.6, clusters: 6 } },
    hedge: { label: { de: "Hecke", en: "Hedge" }, values: { width: 3, height: 1.4, clusters: 24, leafColor: "#2f6a35" } },
    flowering: { label: { de: "Blühend", en: "Flowering" }, values: { flowers: 0.7, leafColor: "#4a8a3e" } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 80000, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed), lr = rng(seed + 2), fr = rng(seed + 1);
    const rinde = material("bark", "#5e4630", 4), bluete = material("paint", p.flowerColor), t = new Parts();
    // Leaves are many small cards in two shades (plain colours: thousands of cards would not fit a bake atlas);
    // flowers are a fourth material, one too many for the draw-call limit, so with flowers the leaves keep one shade
    const c = new Color(p.leafColor).multiplyScalar(0.74);
    const hell = material("leaf", p.leafColor, 1, undefined, { plain: true });
    const dunkel = p.flowers > 0 ? hell : material("leaf", `#${c.getHexString()}`, 1, undefined, { plain: true });
    const listen: [Blattliste, Blattliste] = [new Blattliste(), new Blattliste()];
    const W = p.width, H = p.height, basis = Math.min(W * 0.5, H) * 0.42;
    // A clipped hedge: many clusters on a long plan; its leaves fill a box with flat faces
    const hecke = p.clusters >= 16 && W >= 1.8, tiefe = hecke ? 0.8 : Math.min(W, H * 1.5);
    const ballen: [number, number, number, number][] = [];
    for (let i = 0; i < p.clusters; i++) {
      const rad = basis * (0.7 + 0.5 * r()), x = i ? (r() - 0.5) * (W - 2 * rad) : 0, z = i ? (r() - 0.5) * Math.max(0, tiefe - 2 * rad) : 0;
      const boden = rad * 0.8, oben = Math.max(boden, H - rad);
      const y = i ? boden + r() * (oben - boden) * (hecke ? 1 : 1 - (2 * Math.abs(x)) / Math.max(W, 0.01)) : boden;
      ballen.push([x, y, z, rad]);
    }
    // Woody stems: from the ground they fork into twigs that reach into every cluster
    const stiel = (start: Vector3, ende: Vector3, r0: number, r1: number, seg: number) => {
      const d = ende.clone().sub(start), len = d.length();
      if (len < 1e-3) return;
      const g = new CylinderGeometry(r1, r0, len, seg, 1, true);
      g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.normalize()));
      g.translate((start.x + ende.x) / 2, (start.y + ende.y) / 2, (start.z + ende.z) / 2);
      g.computeBoundingBox();
      if (start.y <= 0 && g.boundingBox!.min.y < 0) g.translate(0, -g.boundingBox!.min.y, 0);
      t.add(rinde, g);
    };
    const sr = 0.011 + 0.01 * H;
    for (const [x, y, z, rad] of ballen) {
      const fuss = new Vector3(x * 0.3, 0, z * 0.3), mitte = new Vector3(x, y, z);
      const gabel = fuss.clone().lerp(mitte, 0.5).add(new Vector3((r() - 0.5) * 0.06, 0, (r() - 0.5) * 0.06));
      stiel(fuss, gabel, sr, sr * 0.75, 7);
      const zweige = 3 + Math.floor(r() * 2);
      for (let k = 0; k < zweige; k++) {
        const um = (k / zweige) * Math.PI * 2 + r(), rr = rad * (0.55 + 0.25 * r());
        const spitze = mitte.clone().add(new Vector3(Math.cos(um) * rr, rad * (0.15 + 0.5 * r()), Math.sin(um) * rr));
        spitze.y = Math.min(spitze.y, H - 0.02);
        const knick = gabel.clone().lerp(spitze, 0.55);
        stiel(gabel, knick, sr * 0.6, sr * 0.45, 5);
        for (let j = 0; j < 2; j++) {
          const ende = spitze.clone().add(new Vector3((r() - 0.5) * rad * 0.5, (r() - 0.3) * rad * 0.3, (r() - 0.5) * rad * 0.5));
          ende.y = Math.max(0.03, Math.min(ende.y, H - 0.02));
          stiel(knick, ende, sr * 0.4, sr * 0.2, 5);
        }
      }
    }
    // Leaves: shared out over the clusters (a hedge: over the faces of its box)
    const gesamt = Math.min(hecke ? 12000 : 16000, Math.round(ballen.reduce((s, b) => s + Math.max(100, Math.min(700, 280 * (b[3] / 0.3) ** 2)), 0)));
    const laenge = hecke ? 0.09 : Math.max(0.05, Math.min(0.14, basis * 0.42)), breite = laenge * 0.55, unten = hecke ? 0.12 * H : 0;
    for (let i = 0; i < gesamt; i++) {
      let b: Vector3, d: Vector3;
      if (hecke) {
        // a point in the box, pushed onto one of its faces (no underside) a little inside
        const f = lr() * (2 * H * (W + tiefe) + W * tiefe), tief = 0.01 + 0.07 * lr();
        b = new Vector3((lr() - 0.5) * W, unten + lr() * (H - unten), (lr() - 0.5) * tiefe);
        if (f < H * W * 2) { b.z = Math.sign(lr() - 0.5) * (tiefe / 2 - tief); d = new Vector3(0, 0, Math.sign(b.z)); }
        else if (f < 2 * H * (W + tiefe)) { b.x = Math.sign(lr() - 0.5) * (W / 2 - tief); d = new Vector3(Math.sign(b.x), 0, 0); }
        else { b.y = H - tief; d = new Vector3(0, 1, 0); }
        d.add(new Vector3(lr() - 0.5, lr() - 0.5, lr() - 0.5).multiplyScalar(0.5)).normalize();
      } else {
        const [x, y, z, rad] = ballen[Math.min(ballen.length - 1, Math.floor(lr() * ballen.length))];
        d = new Vector3(lr() * 2 - 1, lr() * 2 - 1, lr() * 2 - 1);
        if (d.lengthSq() < 1e-4) d.set(0, 1, 0);
        d.normalize();
        b = new Vector3(x, y, z).addScaledVector(d, rad * (0.5 + 0.5 * Math.sqrt(lr())));
        b.y = Math.max(b.y, laenge);
      }
      const achse = new Vector3(lr() * 2 - 1, lr() * 2 - 1, lr() * 2 - 1).addScaledVector(d, hecke ? 0.8 : 0.6).normalize();
      let l = laenge * (0.8 + lr() * 0.4);
      if (hecke) {
        // clip: the tip stays inside the box
        const tip = b.clone().addScaledVector(achse, l);
        tip.set(Math.max(-W / 2, Math.min(W / 2, tip.x)), Math.max(0.02, Math.min(H, tip.y)), Math.max(-tiefe / 2, Math.min(tiefe / 2, tip.z)));
        achse.copy(tip).sub(b);
        l = Math.max(laenge * 0.4, achse.length());
        achse.normalize();
      }
      if (b.y + achse.y * l < 0.01) achse.y = Math.abs(achse.y);
      const quer = new Vector3().crossVectors(achse, d).normalize();
      if (quer.lengthSq() < 1e-6) quer.set(1, 0, 0);
      const licht = d.clone().multiplyScalar(0.75).add(new Vector3().crossVectors(achse, quer).multiplyScalar(0.25)).normalize();
      listen[lr() < 0.55 ? 0 : 1].blatt(b, achse, quer, l, breite * (0.8 + lr() * 0.4), licht);
    }
    if (listen[0].anzahl) t.add(hell, listen[0].geometrie());
    if (listen[1].anzahl) t.add(dunkel, listen[1].geometrie());
    // Flowers sit small on the outside of the leaves
    const n = Math.round(p.flowers * p.clusters * 7);
    for (let k = 0; k < n; k++) {
      const u = fr() * Math.PI * 2, v = fr() * Math.PI * 0.45, s = 0.025 + 0.02 * fr();
      let q: Vector3;
      if (hecke) q = new Vector3((fr() - 0.5) * W, H + 0.01, (fr() - 0.5) * tiefe);
      else {
        const [x, y, z, rad] = ballen[Math.floor(fr() * ballen.length)];
        q = new Vector3(x + rad * Math.sin(v) * Math.cos(u), y + rad * Math.cos(v), z + rad * Math.sin(v) * Math.sin(u));
      }
      t.add(bluete, new IcosahedronGeometry(s, 0).translate(q.x, q.y, q.z));
    }
    return t.group();
  },
});

/** Leaf cards of one shade: positions, normals and uv, both faces. */
class Blattliste {
  pos: number[] = []; nor: number[] = []; uv: number[] = []; anzahl = 0;
  /** A leaf: a pointed card from `basis` along `achse`, `breite` across, lit like the outside of the bush (`licht`). */
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
