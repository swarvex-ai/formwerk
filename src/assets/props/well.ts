import { CircleGeometry, CylinderGeometry, LatheGeometry, RingGeometry, Shape, ShapeGeometry, TorusGeometry, Vector2, Vector3, type Material } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rng } from "../../core/rng";
import { grid, rounded, turned } from "../shapes";

export const well = defineAsset({
  id: "well", category: "props",
  title: { de: "Brunnen", en: "Well" },
  description: { de: "Ein Dorfbrunnen mit runder Steinmauer, zwei Pfosten, kleinem Dach und Kurbel mit Eimer am Seil; die Kurbel ist das bewegliche Teil „crank“, bei gesetzten Steinen legt der Seed die Fugen fest.", en: "A village well with a round stone wall, two posts, a small roof and a crank with a bucket on a rope; the crank is the movable part \"crank\", and with set stones the seed sets the joints." },
  params: {
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.4, max: 1.2, step: 0.01, default: 0.7, unit: "m",
      describe: { de: "Äußerer Radius der Steinmauer: 0,5 m ein kleiner Ziehbrunnen, 0,7 m üblich, 1,1 m ein großer Dorfbrunnen.", en: "Outer radius of the stone wall: 0.5 m a small draw well, 0.7 m usual, 1.1 m a large village well." } },
    wallHeight: { type: "number", label: { de: "Mauerhöhe", en: "Wall height" }, min: 0.5, max: 1.1, step: 0.01, default: 0.8, unit: "m",
      describe: { de: "Höhe der Steinmauer über dem Boden: 0,5 m ein niedriger Ring, 0,8 m üblich, 1,1 m hoch gemauert.", en: "Height of the stone wall above the ground: 0.5 m a low ring, 0.8 m usual, 1.1 m high masonry." } },
    roof: { type: "choice", label: { de: "Dach", en: "Roof" }, options: ["none", "gable", "cone"], labels: { none: { de: "Keins", en: "None" }, gable: { de: "Satteldach", en: "Gable" }, cone: { de: "Kegeldach", en: "Cone" } }, default: "gable",
      describe: { de: "Keins für den offenen Ring, Sattel- oder Kegeldach auf den Pfosten, der First über der Welle.", en: "None for the open ring, a gable or a cone roof on the posts with the ridge above the axle." } },
    roofHeight: { type: "number", label: { de: "Dachhöhe", en: "Roof height" }, min: 0.3, max: 1.2, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe des Dachs über den Pfosten: 0,3 m flach, 0,45 m üblich, 1,2 m steil mit hohem First.", en: "Height of the roof above the posts: 0.3 m low, 0.45 m usual, 1.2 m steep with a high ridge." } },
    stones: { type: "choice", label: { de: "Mauerwerk", en: "Masonry" }, options: ["smooth", "blocks"], labels: { smooth: { de: "Glatt", en: "Smooth" }, blocks: { de: "Quader", en: "Blocks" } }, default: "blocks",
      describe: { de: "Glatte Rundwand oder gesetzte Steine in Schichten, deren Fugen und Sprünge vom Seed kommen.", en: "A smooth round wall or set stones in courses, whose joints and jumps come from the seed." } },
  },
  presets: {
    "village-well": { label: { de: "Dorfbrunnen", en: "Village well" }, values: { roof: "gable", stones: "blocks", roofHeight: 0.55 } },
    "stone-ring": { label: { de: "Steinring", en: "Stone ring" }, values: { roof: "none", stones: "blocks", wallHeight: 0.6 } },
    "covered-well": { label: { de: "Überdachter Brunnen", en: "Covered well" }, values: { roof: "cone", roofHeight: 0.8 } },
  },
  rig: { crank: { label: { de: "Kurbel", en: "Crank" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 360 } },
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 27000, drawCalls: 4 },
  build(p, seed) {
    // The wall is drawn as two stone shells, so its mass comes from the shells only: an effective density for mortared rubble
    const stein = material("stone", "#8f8a80", 0.7, 620, { moss: 0.15 }), holz = material("wood", "#7a5836", 1, 340),
      metall = material("metal", "#5c564e", 1, 500);
    const t = new Parts();
    const R = p.radius, h = p.wallHeight, dicke = Math.min(0.1 + R * 0.1, 0.22), innen = R - dicke;
    const kap = 0.08, mauerH = h - kap, tief = 0.012, wuerfeln = rng(seed);
    // One set stone between the angles a0, a1 and the heights y0, y1: its face bulges, its eased edges fall back by
    // tief + spiel into the joint (r0); sign 1 faces out, -1 faces the shaft. Neighbours share the joint line, so no gap
    const kn = (n: number[]) => (u: number) => { const k = u * (n.length - 1), i = Math.min(n.length - 2, Math.floor(k)); return n[i] + (n[i + 1] - n[i]) * (k - i); };
    const quaderStein = (r0: number, sign: number, a0: number, a1: number, y0: number, y1: number, fein: boolean) => {
      const L = (a1 - a0) * r0, H = y1 - y0, e = Math.min(0.022, L / 4, H / 4), spiel = wuerfeln() * 0.006, buckel = 0.004 + wuerfeln() * 0.008;
      const teil = (l: number) => (fein ? [0, (0.35 * e) / l, e / l, 0.5, 1 - e / l, 1 - (0.35 * e) / l, 1] : [0, e / l, 0.5, 1 - e / l, 1]);
      const U = kn(teil(L)), V = kn(teil(H)), g = (d: number) => (d >= e ? 1 : Math.sqrt(1 - (1 - d / e) ** 2));
      return grid(fein ? 6 : 4, fein ? 6 : 4, (u, v) => {
        const uu = U(u), vv = V(v), a = a0 + (a1 - a0) * uu;
        const r = r0 + sign * ((tief + spiel) * g(Math.min(uu, 1 - uu) * L) * g(Math.min(vv, 1 - vv) * H) + buckel * Math.sin(Math.PI * uu) * Math.sin(Math.PI * vv));
        return new Vector3(r * Math.cos(a), y0 + H * vv, r * Math.sin(a));
      }, (q) => new Vector3(q.x, 0, q.z).normalize().multiplyScalar(sign));
    };
    // Courses of set stones, each course a little higher or lower and staggered by half a stone, joints from the seed
    const mauer = (r0: number, sign: number, fein: boolean) => {
      const NB = Math.max(6, Math.round((2 * Math.PI * r0) / 0.27)), schichten = Math.max(3, Math.min(9, Math.round(mauerH / 0.17)));
      const hoehen = Array.from({ length: schichten + 1 }, (_, s) => (mauerH * (s + (s > 0 && s < schichten ? (wuerfeln() - 0.5) * 0.3 : 0))) / schichten);
      for (let s = 0; s < schichten; s++) {
        const fugen = Array.from({ length: NB }, (_, k) => ((k + (s % 2) * 0.5 + (wuerfeln() - 0.5) * 0.4) * 2 * Math.PI) / NB);
        for (let k = 0; k < NB; k++) t.add(stein, quaderStein(r0, sign, fugen[k], k < NB - 1 ? fugen[k + 1] : fugen[0] + 2 * Math.PI, hoehen[s], hoehen[s + 1], fein));
      }
    };
    if (p.stones === "blocks") {
      mauer(R - tief, 1, true); mauer(innen + tief, -1, false);
      // Hidden in the wall between the stone faces: two shells that carry the wall's mass, as the smooth wall does
      t.add(stein, new CylinderGeometry(R - 0.02, R - 0.02, mauerH, 32, 1, true).translate(0, mauerH / 2, 0));
      t.add(stein, new CylinderGeometry(innen + 0.03, innen + 0.03, mauerH, 32, 1, true).scale(-1, 1, 1).translate(0, mauerH / 2, 0));
    }
    else {
      // Rendered: a smooth round wall outside and inside
      t.add(stein, new CylinderGeometry(R, R, mauerH, 48, 1, true).translate(0, mauerH / 2, 0));
      t.add(stein, new CylinderGeometry(innen, innen, mauerH, 48, 1, true).scale(-1, 1, 1).translate(0, mauerH / 2, 0));
    }
    // The wall's top under the cap (seen through the cap joints) and the dark water down the shaft
    t.add(stein, new RingGeometry(innen, R, 48).rotateX(-Math.PI / 2).translate(0, mauerH - 0.002, 0));
    t.add(metall, new CircleGeometry(innen + 0.014, 32).rotateX(-Math.PI / 2).translate(0, 0.01, 0));
    // A block swept about y between phi and phi + laenge from its closed [r, y] profile, both ends closed by the profile
    const sektor = (m: Material, profil: Vector2[], phi: number, laenge: number, teile: number) => {
      const ende = (spiegel: number) => new ShapeGeometry(new Shape(profil.slice(0, -1).map((q) => new Vector2(spiegel * q.x, q.y))), 1);
      t.add(m, new LatheGeometry(profil, teile, phi, laenge));
      t.add(m, ende(1).rotateY(-Math.PI / 2).rotateY(phi));
      t.add(m, ende(-1).rotateY(Math.PI / 2).rotateY(phi + laenge));
    };
    // Cap stones: a ring of eased blocks overhanging inside and out, 6 mm joints, ends closed by their profile
    const kIn = innen - 0.03, kOut = R + 0.04, kr = 0.014, profil: Vector2[] = [];
    for (const [cx, cy, w0] of [[kOut - kr, mauerH + kr, -90], [kOut - kr, h - kr, 0], [kIn + kr, h - kr, 90], [kIn + kr, mauerH + kr, 180]])
      for (const w of [0, 45, 90]) profil.push(new Vector2(cx + kr * Math.cos(((w0 + w) * Math.PI) / 180), cy + kr * Math.sin(((w0 + w) * Math.PI) / 180)));
    profil.push(profil[0].clone());
    const K = Math.max(6, Math.round((Math.PI * (kIn + kOut)) / 0.45)), spalt = 0.006 / ((kIn + kOut) / 2);
    for (let k = 0; k < K; k++) sektor(stein, profil, (2 * Math.PI * k) / K + spalt / 2, (2 * Math.PI) / K - spalt, 6);
    t.cylinder(R, h);
    if (p.roof !== "none") {
      // Square posts beside the wall on the floor, the roof on beams across their tops, the axle through both posts
      const pfosten = R + 0.1, dachY = h + 0.5, welle = h + 0.3, yT = dachY + 0.08, rh = p.roofHeight;
      for (const s of [-1, 1]) t.add(holz, rounded(0.1, dachY, 0.1, 0.003, s * pfosten, dachY / 2, 0, 1));
      if (p.roof === "gable") {
        // Tie beams on the posts, king posts carrying the ridge beam, lapped boards from the ridge down to the eaves
        const W = R + 0.15, Wt = W - 0.12, Lx = 2 * (pfosten + 0.2), alpha = Math.atan2(rh, Wt), th = 0.022;
        const Ls = W / Math.cos(alpha), n = Math.max(3, Math.ceil(Ls / 0.13)), step = Ls / n, bw = step + 0.03, beta = alpha - Math.atan2(th, bw);
        const firstY = yT + rh, balkenY = firstY - 0.035 * Math.tan(alpha) - 0.035;
        for (const s of [-1, 1]) {
          t.add(holz, rounded(0.1, 0.08, 2 * Wt, 0.003, s * pfosten, dachY + 0.04, 0, 1));
          t.add(holz, rounded(0.08, balkenY - 0.035 - yT, 0.08, 0.003, s * pfosten, (balkenY - 0.035 + yT) / 2, 0, 1));
          for (let i = 0; i <= n; i++) {
            // Board i from the ridge: its upper edge on the roof plane, its lower edge resting on the next board; i = n is the ridge cap
            const kappe = i === n, a = kappe ? 0 : i * step, b = kappe ? 0.1 : bw, off = kappe ? 1.5 * th : th, tilt = kappe ? alpha : beta;
            const zc = (a + b / 2) * Math.cos(alpha) + off * Math.sin(alpha), yc = firstY - (a + b / 2) * Math.sin(alpha) + off * Math.cos(alpha);
            t.add(holz, rounded(Lx, th, b, 0.003, 0, 0, 0, 1).rotateX(s * tilt).translate(0, yc, s * zc));
          }
        }
        t.add(holz, rounded(Lx - 0.04, 0.07, 0.07, 0.003, 0, balkenY, 0, 1));
      } else {
        // A beam across the post tops, the cone resting on its ends: boards from the eaves to the apex with 4 mm joints,
        // an underlayer 1 mm below closes them, a turned finial covers the board tips
        t.add(holz, rounded(2 * pfosten + 0.1, 0.08, 0.1, 0.003, 0, dachY + 0.04, 0, 1));
        const Rb = pfosten + 0.2, k = rh / Rb, yA = yT + k * (pfosten + 0.05), unter = (r: number) => yA - k * r, th = 0.03, rIn = 0.04;
        t.add(holz, new LatheGeometry([new Vector2(0.001, yA - 0.004), new Vector2(Rb - 0.01, unter(Rb - 0.01) - 0.004), new Vector2(Rb - 0.01, unter(Rb - 0.01) - 0.001), new Vector2(0.001, yA - 0.001)], 48));
        const brett = [new Vector2(rIn, unter(rIn)), new Vector2(Rb, unter(Rb)), new Vector2(Rb, unter(Rb) + th), new Vector2(rIn, unter(rIn) + th), new Vector2(rIn, unter(rIn))];
        const B = Math.max(12, Math.round((2 * Math.PI * Rb) / 0.16)), fuge = 0.004 / Rb;
        for (let b = 0; b < B; b++) sektor(holz, brett, (2 * Math.PI * b) / B + fuge / 2, (2 * Math.PI) / B - fuge, 2);
        const fuss = unter(0.09) + th - 0.01, hb = 0.02 + 0.06 * k;
        t.add(holz, turned([[0.001, 0], [0.09, 0], [0.09, hb], [0.05, hb + 0.03], [0.035, hb + 0.06], [0.05, hb + 0.09], [0.03, hb + 0.13], [0.001, hb + 0.14]], 16, 0, fuss, 0));
      }
      // Rope wound on the drum (round, so it stays put while the drum turns) and hanging straight down to the bucket
      const rc = 0.076, eimerR = Math.min(0.14, innen - rc - 0.04), eimerH = 0.24, eimerY = Math.max(0.06, h - 0.5), bugel = eimerR + 0.01, bugelY = eimerY + eimerH - 0.02;
      const wickel: [number, number][] = [];
      for (let i = 0; i <= 22; i++) wickel.push([i % 2 ? 0.082 : 0.074, -0.11 + 0.01 * i]);
      t.add(metall, turned(wickel, 16).rotateZ(-Math.PI / 2).translate(0, welle, 0));
      t.post(metall, 0.008, welle - bugelY - bugel, 0, bugelY + bugel, rc, 8);
      // Bucket: a tapered open tub with a rolled rim, inner wall and floor, the bail over it
      t.add(metall, turned([[0.001, 0], [eimerR * 0.8, 0], [eimerR, eimerH - 0.012], [eimerR + 0.006, eimerH - 0.01], [eimerR + 0.006, eimerH], [eimerR - 0.004, eimerH], [eimerR * 0.8 - 0.004, 0.008], [0.001, 0.008]], 24, 0, eimerY, rc));
      t.add(metall, new TorusGeometry(bugel, 0.005, 6, 16, Math.PI).translate(0, bugelY, rc));
      // Crank: axle with a collar, winding drum with flanges, arm and turned handle turn together about the axle
      const kurbel = t.moving("crank", 0, welle, 0), x0 = -(pfosten + 0.08), x1 = pfosten + 0.115;
      kurbel.add(holz, turned([[0.05, 0], [0.05, 0.02], [0.035, 0.02], [0.035, x1 - x0]], 16).rotateZ(-Math.PI / 2).translate(x0, welle, 0));
      kurbel.add(holz, turned([[0.001, -0.14], [0.1, -0.14], [0.1, -0.12], [0.07, -0.115], [0.07, 0.115], [0.1, 0.12], [0.1, 0.14], [0.001, 0.14]], 24).rotateZ(-Math.PI / 2).translate(0, welle, 0));
      kurbel.add(holz, rounded(0.045, 0.2, 0.05, 0.004, pfosten + 0.09, welle + 0.07, 0, 1));
      kurbel.add(holz, turned([[0.012, 0], [0.012, 0.03], [0.018, 0.035], [0.022, 0.08], [0.018, 0.13], [0.01, 0.14], [0.001, 0.142]], 12).rotateZ(-Math.PI / 2).translate(pfosten + 0.09, welle + 0.14, 0));
    }
    return t.group();
  },
});
