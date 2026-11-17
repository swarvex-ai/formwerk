import { Color, CylinderGeometry, Vector3, type BufferGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

export const bench = defineAsset({
  id: "bench", category: "props",
  title: { de: "Bank", en: "Bench" },
  description: { de: "Eine Sitzbank aus Latten: Parkbank mit Lehne, Gartenbank mit Armlehnen oder schlichte Bank ohne Lehne.", en: "A slatted bench: a park bench with a backrest, a garden bench with armrests or a plain bench without a back." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.8, max: 2.5, step: 0.05, default: 1.6, unit: "m",
      describe: { de: "Länge: 1,2 m für zwei, 1,6 m für drei, 2,4 m für eine lange Reihe.", en: "Length: 1.2 m for two, 1.6 m for three, 2.4 m for a long row." } },
    slats: { type: "integer", label: { de: "Sitzlatten", en: "Seat slats" }, min: 2, max: 6, default: 4,
      describe: { de: "Zahl der Latten der Sitzfläche: 2 grob, 4 üblich, 6 fein.", en: "Number of slats in the seat: 2 coarse, 4 usual, 6 fine." } },
    backrest: { type: "boolean", label: { de: "Lehne", en: "Backrest" }, default: true,
      describe: { de: "Eine leicht geneigte Rückenlehne aus zwei Latten.", en: "A slightly tilted backrest of two slats." } },
    armrests: { type: "boolean", label: { de: "Armlehnen", en: "Armrests" }, default: false,
      describe: { de: "Armlehnen an beiden Enden.", en: "Armrests at both ends." } },
    frame: { type: "choice", label: { de: "Gestell", en: "Frame" }, options: ["metal", "wood"], labels: { metal: { de: "Metall", en: "Metal" }, wood: { de: "Holz", en: "Wood" } }, default: "metal",
      describe: { de: "Gestell aus Metall wie im Park oder aus Holz wie im Garten.", en: "A metal frame like in a park or a wooden one like in a garden." } },
    color: { type: "color", label: { de: "Latten", en: "Slats" }, default: "#a87444",
      describe: { de: "Farbe der Latten.", en: "Colour of the slats." } },
    frameColor: { type: "color", label: { de: "Gestellfarbe", en: "Frame colour" }, default: "#2f3236",
      describe: { de: "Farbe des Gestells.", en: "Colour of the frame." } },
  },
  presets: {
    park: { label: { de: "Parkbank", en: "Park bench" }, values: { backrest: true, frame: "metal", slats: 4 } },
    garden: { label: { de: "Gartenbank", en: "Garden bench" }, values: { length: 1.3, backrest: true, armrests: true, frame: "wood", frameColor: "#7a5534", color: "#9a6a3e" } },
    plain: { label: { de: "Schlichte Bank", en: "Plain bench" }, values: { backrest: false, slats: 3, frame: "wood", frameColor: "#8a6440" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 9000, drawCalls: 4 },
  build(p) {
    // Slats in two tones of the same wood, alternated board by board; the grain lies along every slat
    const ton = (k: number) => { const c = new Color(p.color); c.multiplyScalar(k); return `#${c.getHexString()}`; };
    const latten = [material("wood", p.color, 1, undefined, { grain: "level" }), material("wood", ton(0.88), 1, undefined, { grain: "level" })];
    const metall = p.frame === "metal", guss = material("metal", p.frameColor), t = new Parts();
    const L = p.length, sitz = 0.45, tief = 0.42, dick = 0.03, spalt = 0.01, kipp = 0.21, oben = sitz - dick, armY = sitz + 0.22;
    const lb = (tief - spalt * (p.slats - 1)) / p.slats;
    // Side frames at both ends (and one in the middle of a long bench)
    const xs = L > 1.9 ? [-(L / 2 - 0.12), 0, L / 2 - 0.12] : [-(L / 2 - 0.12), L / 2 - 0.12];
    // The back post stands just behind the seat and leans back by 12°; s is its thickness front to back
    const s = metall ? 0.04 : 0.056, zp = -tief / 2 - (metall ? s : 0.06) / 2 - 0.002;
    const postH = p.backrest ? 0.5 : p.armrests ? armY - oben + 0.03 : 0;
    const zPost = (y: number) => zp - (y - oben) * Math.tan(kipp);
    const bolzen = (x: number, y: number, z: number) => new CylinderGeometry(0.006, 0.007, 0.004, 8).translate(x, y + 0.001, z);
    for (let i = 0; i < p.slats; i++) {
      const z = -tief / 2 + lb / 2 + i * (lb + spalt);
      t.add(latten[i % 2], rounded(L, dick, lb, 0.003, 0, sitz - dick / 2, z));
      // Screwed onto every cast side frame: a round bolt head on top
      if (metall) for (const x of xs) t.add(guss, bolzen(x, sitz, z));
    }
    if (metall) {
      // A cast bar along a path of [z, y] points: w wide in that plane, th thick along x, its edges rounded by 4 mm
      const bar = (x: number, pfad: [number, number][], w: number, th: number) => {
        const rr = 0.004, ring: [number, number][] = [[w / 2, 0]];
        for (const [ca, cb, a0] of [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]]) for (let k = 0; k <= 2; k++) {
          const a = ((a0 + k * 45) * Math.PI) / 180;
          ring.push([ca * (w / 2 - rr) + rr * Math.cos(a), cb * (th / 2 - rr) + rr * Math.sin(a)]);
        }
        const n = pfad.length - 1, nr = ring.length;
        const lerp = (arr: number[][], u: number, rund: boolean) => {
          const m = rund ? arr.length : arr.length - 1, f = Math.min(Math.max(u, 0), 1) * m, i = Math.min(Math.floor(f), m - 1), k = f - i;
          const a = arr[i], b = arr[(i + 1) % arr.length];
          return a.map((v, j) => v + (b[j] - v) * k);
        };
        const mitte = (v: number) => { const [z, y] = lerp(pfad, v, false); return new Vector3(x, y, z); };
        const tangente = (v: number) => mitte(Math.min(1, v + 0.5 / n)).sub(mitte(Math.max(0, v - 0.5 / n))).normalize();
        const punkt = (u: number, v: number) => {
          const c = mitte(v), tg = tangente(v), [a, b] = lerp(ring, u, true);
          return c.add(new Vector3(0, -tg.z, tg.y).multiplyScalar(a)).add(new Vector3(b, 0, 0));
        };
        t.add(guss, grid(nr, n, punkt, (q) => q.clone().sub(mitte(0.5))));
        for (const v of [0, 1]) t.add(guss, grid(nr, 1, (u, k) => mitte(v).lerp(punkt(u, v), k), () => tangente(v).multiplyScalar(v ? 1 : -1)));
      };
      // A quadratic curve from a to c pulled towards b, as n + 1 points
      const bogen = (a: number[], b: number[], c: number[], n: number): [number, number][] => Array.from({ length: n + 1 }, (_, i) => {
        const u = i / n, k0 = (1 - u) * (1 - u), k1 = 2 * u * (1 - u), k2 = u * u;
        return [k0 * a[0] + k1 * b[0] + k2 * c[0], k0 * a[1] + k1 * b[1] + k2 * c[1]];
      });
      const sk = Math.sin(kipp), ck = Math.cos(kipp);
      for (const x of xs) {
        // Front leg curving forward to its foot; rear leg curving back to its foot and running on into the leaning post
        const vorne = bogen([0.24, 0], [0.15, 0.18], [0.17, oben - 0.02], 12);
        const hinten = bogen([zp - 0.06, 0], [zp + sk * 0.2, oben - ck * 0.2], [zp, oben], 12);
        if (postH > 0) for (let i = 1; i <= 8; i++) hinten.push([zp - (sk * postH * i) / 8, oben + (ck * postH * i) / 8]);
        bar(x, vorne, 0.045, 0.035);
        bar(x, hinten, s, 0.035);
        // Bearer under the slats, from the front into the rear leg
        bar(x, [[tief / 2 - 0.005, oben - 0.022], [zp, oben - 0.022]], 0.042, 0.03);
        // A low brace between the legs, sagging a little
        bar(x, bogen(vorne[3], [0, 0.11], hinten[3], 8), 0.03, 0.025);
        if (p.armrests && x !== 0) {
          // Armrest: a support curving up from the front of the bearer, then the rest itself back into the post
          bar(x, bogen([0.17, oben - 0.03], [0.24, sitz + 0.08], [0.2, armY], 10), 0.035, 0.03);
          bar(x, bogen([0.25, armY - 0.01], [0, armY + 0.025], [zPost(armY), armY], 10), 0.035, 0.055);
        }
      }
    } else {
      // Wood frame: square legs with a 3 mm chamfer, a bearer and a low stretcher in every side frame
      const bein = material("wood", p.frameColor), riegel = material("wood", p.frameColor, 1, undefined, { grain: "level" });
      const zv = tief / 2 - 0.045, d = 0.06;
      for (const x of xs) {
        const arme = p.armrests && x !== 0, hv = arme ? armY - 0.001 : oben - 0.001;
        t.add(bein, rounded(d, hv, d, 0.003, x, hv / 2, zv, 1));
        t.add(bein, rounded(d, oben, d, 0.003, x, oben / 2, zp, 1));
        // The post, a little slimmer than the leg it stands in, so no faces lie in one plane
        if (postH > 0) t.add(bein, rounded(s, postH + 0.04, s, 0.003, 0, (postH + 0.04) / 2 - 0.04, 0, 1).rotateX(-kipp).translate(x, oben, zp));
        t.add(riegel, rounded(0.036, 0.07, zv - zp, 0.003, x, oben - 0.036, (zv + zp) / 2));
        t.add(riegel, rounded(0.036, 0.05, zv - zp, 0.003, x, 0.12, (zv + zp) / 2));
        if (arme) {
          // Armrest board on the front leg, butting against the back post
          const zb = zPost(armY + dick / 2) + s / 2 / Math.cos(kipp) + 0.001, zf = tief / 2 + 0.03;
          t.add(riegel, rounded(0.08, dick, zf - zb, 0.003, x, armY + dick / 2, (zf + zb) / 2));
        }
      }
      // Rails under the seat along the front and the back, between the legs
      const lr = 2 * xs[xs.length - 1] - d + 0.01;
      for (const z of [zv - d / 2 + 0.012, zp + d / 2 - 0.012]) t.add(riegel, rounded(lr, 0.07, 0.022, 0.003, 0, oben - 0.036, z));
    }
    if (p.backrest) [[0.17, 0.09], [0.36, 0.09]].forEach(([hoehe, b], i) => {
      // Back slats screwed onto the sitter's side of the posts (the front), leaning with them
      const vor = s / 2 + dick / 2 + 0.001;
      const teile: [BufferGeometry, number][] = [[rounded(L, b, dick, 0.003, 0, hoehe, vor), (i + 1) % 2]];
      if (metall) for (const x of xs) teile.push([bolzen(x, 0, 0).rotateX(Math.PI / 2).translate(0, hoehe, vor + dick / 2), -1]);
      for (const [g, k] of teile) t.add(k < 0 ? guss : latten[k], g.rotateX(-kipp).translate(0, oben, zp));
    });
    return t.group();
  },
});
