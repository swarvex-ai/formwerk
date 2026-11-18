import { CylinderGeometry, ExtrudeGeometry, Shape, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

export const mailbox = defineAsset({
  id: "mailbox", category: "props",
  title: { de: "Briefkasten", en: "Mailbox" },
  description: { de: "Ein Briefkasten auf einem Pfosten an der Straße oder am Tor: ein ländlicher Kasten mit gewölbtem Dach oder ein aufrechter Kasten mit Einwurfschlitz, mit Klappe und Signalflagge (bewegliche Teile „door“ und „flag“).", en: "A letterbox on a post by a road or a gate: a rural box with a rounded roof or an upright box with a slot, with a folding lid and a signal flag (movable parts \"door\" and \"flag\")." },
  params: {
    style: { type: "choice", label: { de: "Bauform", en: "Style" }, options: ["rural", "box"], labels: { rural: { de: "Ländlich", en: "Rural" }, box: { de: "Kasten", en: "Box" } }, default: "rural",
      describe: { de: "Ländlich: ein langer Kasten mit gewölbtem Dach auf einem Pfosten. Kasten: ein aufrechter Kasten mit Einwurfschlitz oben.", en: "Rural: a long box with a rounded roof on a post. Box: an upright box with a mail slot in the top." } },
    postHeight: { type: "number", label: { de: "Pfostenhöhe", en: "Post height" }, min: 0, max: 1.4, step: 0.05, default: 1, unit: "m",
      describe: { de: "Höhe des Pfostens vom Boden bis zum Kastenboden: 0 steht der Kasten auf dem Boden, 1 m an der Straße, 1,2 m am Tor.", en: "Height of the post from the floor to the bottom of the box: 0 the box stands on the ground, 1 m by a road, 1.2 m at a gate." } },
    size: { type: "number", label: { de: "Größe", en: "Size" }, min: 0.3, max: 0.7, step: 0.01, default: 0.48, unit: "m",
      describe: { de: "Größe des Kastens: beim ländlichen Kasten seine Länge entlang des Pfostens (0,48 m), beim aufrechten Kasten seine Höhe (0,55 m).", en: "Size of the box: its length along the post for a rural box (0.48 m), its height for an upright box (0.55 m)." } },
    colour: { type: "color", label: { de: "Kasten", en: "Box" }, default: "#2f4f7a",
      describe: { de: "Farbe des lackierten Kastens.", en: "Colour of the painted box." } },
    flagColour: { type: "color", label: { de: "Flagge", en: "Flag" }, default: "#c8372d",
      describe: { de: "Farbe der Signalflagge an der rechten Seite.", en: "Colour of the signal flag on the right side." } },
  },
  presets: {
    rural: { label: { de: "Ländlich", en: "Rural" }, values: { style: "rural" } },
    city: { label: { de: "Stadt", en: "City" }, values: { style: "box", size: 0.55, postHeight: 0.8, colour: "#c8372d" } },
    "wall-box": { label: { de: "Wandkasten", en: "Wall box" }, values: { style: "box", postHeight: 0, size: 0.35, colour: "#d9a300" } },
  },
  rig: {
    door: { label: { de: "Klappe", en: "Lid" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 100 },
    flag: { label: { de: "Flagge", en: "Flag" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 90 },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 6000, drawCalls: 4 },
  build(p) {
    const t = new Parts();
    const holz = material("wood", "#6b5038"), metall = material("metal", p.colour, 1, 300), lack = material("paint", p.flagColour);
    const y0 = p.postHeight;
    const rural = p.style === "rural";
    const w = rural ? 0.28 : Math.max(0.2, p.size * 0.52); // width (x)
    const bh = rural ? 0.2 : p.size;                        // box height; for the rural box the straight walls under the roof
    const dp = rural ? p.size : Math.max(0.13, p.size * 0.38); // depth (z): rural length, box depth
    const frontZ = dp / 2, gap = 0.001, td = rural ? 0.0015 : 0.003, hingeZ = frontZ + gap + td;

    // Post (square timber, 3 mm chamfer) and the bracket on it: a flat plate under the box, two ears bent down the post
    const pw = 0.08, pt = 0.003, ph = y0 - pt;
    if (ph > 0.005) {
      t.add(holz, rounded(pw, ph, pw, 0.003, 0, ph / 2, 0, 1));
      const bl = Math.min(0.22, dp * 0.7), et = 0.003, el = Math.min(0.06, ph - 0.01);
      t.add(metall, rounded(pw + 2 * et, pt, bl, 0.001, 0, y0 - pt / 2, 0, 1));
      if (el > 0.02) for (const s of [-1, 1]) {
        t.add(metall, rounded(et, el, 0.06, 0.001, s * (pw / 2 + et / 2), ph - el / 2, 0, 1));
        for (const z of [-0.018, 0.018]) t.add(metall, new CylinderGeometry(0.0045, 0.0045, 0.002, 8).rotateZ(Math.PI / 2).translate(s * (pw / 2 + et + 0.001), ph - el * 0.55, z));
      }
    } else if (y0 > 0) t.add(holz, rounded(pw, y0, pw, 0.003, 0, y0 / 2, 0, 1));

    // The largest angle (up to 100°) at which the given door points [up, forward from the hinge] stay above the floor
    const maxDoor = (pts: [number, number][]) => {
      for (let a = 100; a > 0; a--) if (pts.every(([dy, dz]) => y0 + dy * Math.cos((a * Math.PI) / 180) - dz * Math.sin((a * Math.PI) / 180) >= 0)) return a;
      return 0;
    };
    if (rural) {
      // One bent sheet: floor, rounded corners, sides and the round roof as one profile with outward normals
      const rc = 0.008, R = w / 2, thk = 0.0015, rb = 0.0025;
      type Q = { x: number; y: number; nx: number; ny: number };
      const pr: Q[] = [];
      const P = (x: number, y: number, nx: number, ny: number) => pr.push({ x, y, nx, ny });
      P(0, 0, 0, -1); P(w / 2 - rc, 0, 0, -1);
      for (let k = 1; k <= 4; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 8; P(w / 2 - rc + rc * Math.cos(a), rc + rc * Math.sin(a), Math.cos(a), Math.sin(a)); }
      const s0 = pr.length - 1;
      for (let k = 0; k <= 24; k++) { const a = (k * Math.PI) / 24; P(R * Math.cos(a), bh + R * Math.sin(a), Math.cos(a), Math.sin(a)); }
      P(-w / 2, rc, -1, 0);
      const s1 = pr.length - 1;
      for (let k = 1; k <= 4; k++) { const a = Math.PI + (k * Math.PI) / 8; P(-w / 2 + rc + rc * Math.cos(a), rc + rc * Math.sin(a), Math.cos(a), Math.sin(a)); }
      P(0, 0, 0, -1);
      // A point on the profile at u (0 to 1), offset by e along its normal, and the normal there
      const at = (pts: Q[], u: number, e: number) => {
        const f = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), k = f - i, a = pts[i], b = pts[i + 1];
        const nx = a.nx + (b.nx - a.nx) * k, ny = a.ny + (b.ny - a.ny) * k;
        return { x: a.x + (b.x - a.x) * k + nx * e, y: y0 + a.y + (b.y - a.y) * k + ny * e, n: new Vector3(nx, ny, 0).normalize() };
      };
      // One face of the sheet along the profile from z0 to z1, facing out (1) or in (-1)
      const sheet = (into: Parts, pts: Q[], e: number, z0: number, z1: number, side: number) =>
        into.add(metall, grid(pts.length - 1, 1, (u, v) => { const q = at(pts, u, e); return new Vector3(q.x, q.y, z0 + (z1 - z0) * v); }, () => at(pts, 0.5, 0).n.multiplyScalar(side)));
      sheet(t, pr, 0, -dp / 2 + rb, dp / 2 - rb, 1);
      sheet(t, pr, -thk, -dp / 2 + rb, dp / 2 - rb, -1);
      // Rolled edge at the front and the rear seam: a bead rolled inwards, flush with the outside of the sheet
      for (const zc of [dp / 2 - rb, -dp / 2 + rb]) t.add(metall, grid(pr.length - 1, 8, (u, v) => {
        const q = at(pr, u, -rb), a = 2 * Math.PI * v;
        return new Vector3(q.x + q.n.x * rb * Math.cos(a), q.y + q.n.y * rb * Math.cos(a), zc + rb * Math.sin(a));
      }, () => at(pr, 0.5, 0).n.negate()));
      // Rear wall: a flat sheet set into the rear seam
      const flach = (pts: [number, number][]) => { const s = new Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) s.lineTo(x, y); s.closePath(); return s; };
      t.add(metall, new ExtrudeGeometry(flach(pr.slice(0, -1).map((q) => [q.x - q.nx * 0.0005, q.y - q.ny * 0.0005])), { depth: thk, bevelEnabled: false, curveSegments: 1 }).translate(0, y0, -dp / 2 + 0.0005));
      // Lid: a flat front over the whole profile, a lip that reaches back over the rolled edge and a latch tab on top
      const tl = 0.0015, eL = 0.001 + tl, run = pr.slice(s0, s1 + 1), top = bh + R + eL;
      const umriss: [number, number][] = [...run.map((q): [number, number] => [q.x + q.nx * eL, q.y + q.ny * eL]), [-(w / 2 + eL), 0], [w / 2 + eL, 0]];
      const lid = t.moving("door", 0, y0, hingeZ, { max: maxDoor([[top + 0.02, 0.012], [top, 0]]) });
      lid.add(metall, new ExtrudeGeometry(flach(umriss), { depth: td, bevelEnabled: false, curveSegments: 1 }).translate(0, y0, frontZ + gap));
      sheet(lid, run, eL, frontZ - 0.012, frontZ + gap + td / 2, 1);
      sheet(lid, run, 0.001, frontZ - 0.012, frontZ + gap + td / 2, -1);
      lid.add(metall, rounded(0.036, 0.024, 0.0025, 0.001, 0, 0.012, 0, 1).rotateX(0.3).translate(0, y0 + top - 0.005, hingeZ + 0.001));
    } else {
      // Upright box from rounded sheet panels: back, sides, floor and a top with a real slot in a raised frame
      const th = 0.004, r = 0.003, sx = w * 0.33, sz = 0.02, bar = 0.013, xo = sx - bar / 2, zo = sz - bar / 2, top = y0 + bh - th / 2;
      t.add(metall, rounded(w, bh, th, r, 0, y0 + bh / 2, -dp / 2 + th / 2));
      for (const s of [-1, 1]) t.add(metall, rounded(th, bh, dp - th, r, s * (w / 2 - th / 2), y0 + bh / 2, th / 2));
      t.add(metall, rounded(w - 2 * th, th, dp - th, r, 0, y0 + th / 2, th / 2));
      t.add(metall, rounded(w - 2 * th, th, dp / 2 - zo, r, 0, top, (dp / 2 + zo) / 2));
      t.add(metall, rounded(w - 2 * th, th, dp / 2 - th - zo, r, 0, top, (-dp / 2 + th - zo) / 2));
      for (const s of [-1, 1]) t.add(metall, rounded(w / 2 - th - xo, th, 2 * zo, r, (s * (w / 2 - th + xo)) / 2, top, 0));
      for (const s of [-1, 1]) {
        t.add(metall, rounded(sx * 2 + bar, 0.008, bar, r, 0, y0 + bh + 0.004, s * sz));
        t.add(metall, rounded(bar, 0.008, sz * 2 - bar, r, s * sx, y0 + bh + 0.004, 0));
      }
      // Door over the whole front with a small pull near its top
      const hy = bh - Math.min(0.06, bh * 0.15);
      const lid = t.moving("door", 0, y0, hingeZ, { max: maxDoor([[bh, 0], [hy + 0.005, 0.024]]) });
      lid.add(metall, rounded(w, bh, td, r, 0, y0 + bh / 2, frontZ + gap + td / 2));
      for (const s of [-1, 1]) lid.add(metall, rounded(0.008, 0.008, 0.016, r, s * 0.025, y0 + hy, hingeZ + 0.008));
      lid.add(metall, rounded(0.07, 0.01, 0.008, r, 0, y0 + hy, hingeZ + 0.02));
    }

    // Flag: a flat arm with a rounded plate, folded back along the box (0) and swinging up (90) about a pin on the +x side
    const arm = Math.min(0.14, dp * 0.7), flX = w / 2, flY = y0 + bh * (rural ? 0.85 : 0.55), flZ = frontZ - 0.03;
    const flag = t.moving("flag", flX, flY, flZ);
    flag.add(lack, new CylinderGeometry(0.004, 0.004, 0.016, 8).rotateZ(Math.PI / 2).translate(flX + 0.007, flY, flZ));
    flag.add(lack, new CylinderGeometry(0.0065, 0.0065, 0.003, 12).rotateZ(Math.PI / 2).translate(flX + 0.0125, flY, flZ));
    flag.add(lack, rounded(0.004, 0.022, arm + 0.011, 0.0015, flX + 0.008, flY, flZ - arm / 2 + 0.0055, 1));
    const fw = Math.min(0.085, arm * 0.75), fh = 0.07, fr = 0.014, s = new Shape();
    s.moveTo(-fw / 2 + fr, -fh / 2); s.lineTo(fw / 2 - fr, -fh / 2); s.absarc(fw / 2 - fr, -fh / 2 + fr, fr, -Math.PI / 2, 0, false);
    s.lineTo(fw / 2, fh / 2 - fr); s.absarc(fw / 2 - fr, fh / 2 - fr, fr, 0, Math.PI / 2, false);
    s.lineTo(-fw / 2 + fr, fh / 2); s.absarc(-fw / 2 + fr, fh / 2 - fr, fr, Math.PI / 2, Math.PI, false);
    s.lineTo(-fw / 2, -fh / 2 + fr); s.absarc(-fw / 2 + fr, -fh / 2 + fr, fr, Math.PI, Math.PI * 1.5, false);
    flag.add(lack, new ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: false, curveSegments: 4 }).rotateY(Math.PI / 2).translate(flX + 0.006, flY, flZ - arm + fw / 2));

    return t.group();
  },
});
