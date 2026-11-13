import { circle, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, dot, type Part } from "../define";
import { centre, CLEAR, EDGE, solidTip } from "../shared";

export const moon = defineIcon({
  id: "moon", category: "status",
  title: { de: "Mond", en: "Moon" },
  description: {
    de: "Eine Mondsichel für Nacht, Ruhe und den Dunkelmodus, mit Neigung, Phase und optionalem Stern.",
    en: "A crescent moon for night, quiet and dark mode, with tilt, phase and an optional star.",
  },
  params: {
    phase: { type: "number", min: 0.35, max: 0.8, step: 0.05, default: 0.5, label: { de: "Phase", en: "Phase" },
      describe: { de: "Dicke der Sichel als Anteil des Radius: 0,35 schlank, 0,5 üblich, 0,8 dick.", en: "Thickness of the crescent as a share of the radius: 0.35 slim, 0.5 usual, 0.8 thick." } },
    tilt: { type: "number", min: -45, max: 45, step: 5, default: -20, unit: "°", label: { de: "Neigung", en: "Tilt" },
      describe: { de: "Neigung der Hörner nach oben oder unten: -20° üblich, 0° waagrecht.", en: "Tilt of the horns up or down: -20° usual, 0° level." } },
    star: { type: "boolean", default: false, label: { de: "Stern", en: "Star" },
      describe: { de: "Ein kleiner Stern in der Öffnung der Sichel für eine Nachtstimmung.", en: "A small star in the crescent's opening for a night mood." } },
  },
  presets: {
    moon: { label: { de: "Mond", en: "Moon" }, values: { phase: 0.5 } },
    night: { label: { de: "Nacht", en: "Night" }, values: { star: true, phase: 0.4 } },
    "dark-mode": { label: { de: "Dunkelmodus", en: "Dark mode" }, values: { tilt: 0, phase: 0.6 } },
  },
  build(p, pen) {
    const hw = pen.width / 2;
    const c: Pt = [12, 12];
    const R = 12 - EDGE - hw;
    const t = Math.max(p.phase * R, 2 * pen.width + CLEAR + 1);
    const a = 90 + p.tilt;
    const c2 = onCircle(c, t, a);

    // Horns: h± = onCircle(onCircle(c, t/2, a), sqrt(R*R - t*t/4), a ± 90)
    const mid = onCircle(c, t / 2, a);
    const hDist = Math.sqrt(Math.max(0, R * R - (t * t) / 4));
    const hPlus = onCircle(mid, hDist, a + 90);
    const hMinus = onCircle(mid, hDist, a - 90);

    // Angles from c to horns:
    // angleFromCenter(c, pt): degrees clockwise from 12 o'clock
    const ang = (center: Pt, pt: Pt) => ((Math.atan2(pt[0] - center[0], -(pt[1] - center[1])) * 180) / Math.PI + 360) % 360;

    const outerPlus = ang(c, hPlus);
    const outerMinus = ang(c, hMinus);
    // Outer circle from hPlus to hMinus going the long way round (away from c2).
    // c2 is in direction a from c. The long way round means diff > 180 degrees or away from a.
    let outerDiff = outerMinus - outerPlus;
    while (outerDiff < 0) outerDiff += 360;
    // If outerDiff < 180, the long way is the other way (outerDiff - 360)
    const dOuter = outerDiff > 180 ? outerDiff : outerDiff - 360;

    const bitePlus = ang(c2, hPlus);
    const biteMinus = ang(c2, hMinus);
    // Bite circle from hMinus back to hPlus (the side facing c).
    // c is in direction a + 180 from c2. We want the short way round (facing c).
    let biteDiff = bitePlus - biteMinus;
    while (biteDiff > 180) biteDiff -= 360;
    while (biteDiff < -180) biteDiff += 360;

    const points: Pt[] = [];
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const g = outerPlus + (dOuter * i) / N;
      points.push(onCircle(c, R, g));
    }
    // points[0] is hPlus, points[N] is hMinus
    for (let i = 1; i <= N; i++) {
      const g = biteMinus + (biteDiff * i) / N;
      points.push(onCircle(c2, R, g));
    }
    // Now points has 2*N + 1 points, but last point is hPlus which is same as points[0]
    // A polygon in SVG / vector.ts is a closed loop: points[0] to points[points.length - 1].
    // If the last point is identical to first, pop it so we don't have a zero-length segment:
    if (Math.hypot(points[points.length - 1][0] - points[0][0], points[points.length - 1][1] - points[0][1]) < 1e-4) {
      points.pop();
    }

    // Horns tips:
    // Horn hMinus is at index N in points.
    // Horn hPlus is at index 0 in points.
    const m = points.length;
    const hornPlusIdx = 0;
    const hornMinusIdx = N;

    const prevPlus = points[(hornPlusIdx - 1 + m) % m];
    const tipPlus = points[hornPlusIdx];
    const nextPlus = points[(hornPlusIdx + 1) % m];

    const prevMinus = points[(hornMinusIdx - 1 + m) % m];
    const tipMinus = points[hornMinusIdx];
    const nextMinus = points[(hornMinusIdx + 1) % m];

    const crescentParts: Part[] = [
      area(polygon(...points)),
      dot(solidTip(prevPlus, tipPlus, nextPlus, pen)),
      dot(solidTip(prevMinus, tipMinus, nextMinus, pen)),
    ];

    // Then centre(parts, pen)
    // We compute the offset from centring:
    const centred = centre(crescentParts, pen);
    // Find translation offset
    const dx = centred[0].shape.kind === "line" ? centred[0].shape.points[0][0] - points[0][0] : 0;
    const dy = centred[0].shape.kind === "line" ? centred[0].shape.points[0][1] - points[0][1] : 0;

    if (p.star) {
      const qOrig = onCircle(c, t + 0.45 * R, a);
      const qCentred: Pt = [qOrig[0] + dx, qOrig[1] + dy];
      const starR = Math.max(0.9, hw);

      // Check distance to crescent: leave it out if it comes closer than hw + CLEAR to the crescent
      // The crescent outer surface has radius R from (c + [dx, dy]), inner surface has radius R from (c2 + [dx, dy])
      // Or we can check distance against the polygon segments and the solidTip shapes.
      let minDist = Infinity;
      const polyPts = centred[0].shape.kind === "line" ? centred[0].shape.points : [];
      for (let i = 0; i < polyPts.length; i++) {
        const p1 = polyPts[i], p2 = polyPts[(i + 1) % polyPts.length];
        const segDist = distToSegment(qCentred, p1, p2);
        if (segDist < minDist) minDist = segDist;
      }
      // Distance from star edge (or center - starR) to crescent edge (stroke/fill)
      // "leave it out if it comes closer than hw + CLEAR to the crescent"
      if (minDist - starR >= hw + CLEAR) {
        centred.push(dot(circle(qCentred, starR)));
      }
    }

    return centred;
  },
});

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
