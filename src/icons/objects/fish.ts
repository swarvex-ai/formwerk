import { arc, circle, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, dot, gap, hole, type Part } from "../define";
import { inkRadius, largest, solidTip } from "../shared";

// Distance from q to the closed outline through pts
function abstand(q: Pt, pts: readonly Pt[]): number {
  let d = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], ex = b[0] - a[0], ey = b[1] - a[1], l2 = ex * ex + ey * ey;
    const t = l2 ? Math.max(0, Math.min(1, ((q[0] - a[0]) * ex + (q[1] - a[1]) * ey) / l2)) : 0;
    d = Math.min(d, Math.hypot(q[0] - a[0] - ex * t, q[1] - a[1] - ey * t));
  }
  return d;
}

// Whether q lies inside the closed outline through pts
function drin(q: Pt, pts: readonly Pt[]): boolean {
  let ja = false;
  for (let i = 0, k = pts.length - 1; i < pts.length; k = i++) {
    const [xi, yi] = pts[i], [xk, yk] = pts[k];
    if (yi > q[1] !== yk > q[1] && q[0] < ((xk - xi) * (q[1] - yi)) / (yk - yi) + xi) ja = !ja;
  }
  return ja;
}

export const fish = defineIcon({
  id: "fish-icon", category: "objects",
  title: { de: "Fisch", en: "Fish" },
  description: {
    de: "Ein Fisch von der Seite, nach links schwimmend, mit Schwanz, Auge und Flossen: für Angeln, Fischgerichte, Märkte, Aquarien und Haustiere.",
    en: "A fish seen from the side, swimming left, with a tail, an eye and fins: for fishing, seafood, markets, aquariums and pets.",
  },
  params: {
    plump: { type: "number", min: 0.35, max: 0.6, step: 0.05, default: 0.45, label: { de: "Fülle", en: "Plump" },
      describe: { de: "Höhe des Körpers im Verhältnis zu seiner Länge: 0,35 schlank wie eine Forelle, 0,45 üblich, 0,6 rund wie ein Karpfen.", en: "Height of the body as a share of its length: 0.35 slim like a trout, 0.45 usual, 0.6 round like a carp." } },
    tail: { type: "choice", options: ["fork", "fan"], default: "fork", label: { de: "Schwanz", en: "Tail" },
      labels: { fork: { de: "Gegabelt", en: "Forked" }, fan: { de: "Fächer", en: "Fan" } },
      describe: { de: "Gegabelt mit zwei spitzen Lappen und einer Kerbe wie bei Forelle und Makrele, oder ein runder Fächer ohne Kerbe wie beim Goldfisch.", en: "Forked with two pointed lobes and a notch like a trout or mackerel, or a rounded fan without a notch like a goldfish." } },
    fins: { type: "boolean", default: true, label: { de: "Flossen", en: "Fins" },
      describe: { de: "Eine kleine dreieckige Flosse auf dem Rücken und eine am Bauch; ohne wirkt der Fisch schlichter.", en: "A small triangular fin on the back and one on the belly; without them the fish looks plainer." } },
    gill: { type: "boolean", default: true, label: { de: "Kiemen", en: "Gill" },
      describe: { de: "Eine gebogene Kiemenlinie hinter dem Auge; am schlanken Körper bei kräftigem Strich nur, wo sie Platz hat.", en: "A curved gill line behind the eye; on a slim body with a bold stroke only where it has room." } },
  },
  presets: {
    fish: { label: { de: "Fisch", en: "Fish" }, values: { tail: "fork" } },
    trout: { label: { de: "Forelle", en: "Trout" }, values: { plump: 0.35, gill: true } },
    carp: { label: { de: "Karpfen", en: "Carp" }, values: { plump: 0.6, tail: "fan" } },
    seafood: { label: { de: "Fischgericht", en: "Seafood" }, values: { fins: false, gill: false, style: "filled" } },
  },
  build(p, pen) {
    const w = pen.width, hw = w / 2, ink = inkRadius(pen), frei = 1.1;
    const fisch = (B: number): Part[] => {
      // Body: mouth at x = 0, tail root at x = B; half height a·t·(1 − t)^1.3 (widest at 0.43 of the length, a
      // point at the mouth) plus the narrow root
      const H = p.plump * B, rw = Math.max(0.12 * H, 0.3 * w), a = H / 2 / 0.207;
      const halb = (x: number) => { const t = x / B; return a * t * (1 - t) ** 1.3 + rw * t * t; };
      const n = 20, oben: Pt[] = [], unten: Pt[] = [];
      for (let i = 0; i <= n; i++) { const x = (B * i) / n; oben.push([x, -halb(x)]); }
      for (let i = n; i >= 1; i--) unten.push([oben[i][0], -oben[i][1]]);
      const koerper: Pt[] = [...oben, ...unten];
      // Distance to the inner edge of the outline's ink
      const innen = (q: Pt) => abstand(q, koerper) - hw;

      // Tail: joined inside the body before the root, its back edge forked or a fan
      const T = 0.3 * B, S = Math.max(0.36 * H + 0.4 * w, 0.2 * B), j = Math.min(0.15 * B, 1.5 + w), rj = 0.5 * halb(B - j);
      const xe = B + T, schwanz: Pt[] = [[B - j, -rj], [xe, -S]];
      if (p.tail === "fork") {
        // The notch keeps the middle of the tail open (room between root and notch) and is wide at its mouth
        schwanz.push([xe - Math.max(0, Math.min(0.45 * T, T - w - 1.6)), 0]);
      } else {
        const r = S / Math.sin((70 * Math.PI) / 180), c: Pt = [xe - r * Math.cos((70 * Math.PI) / 180), 0];
        for (let i = 1; i < 8; i++) { const g = ((-70 + (140 * i) / 8) * Math.PI) / 180; schwanz.push([c[0] + r * Math.cos(g), c[1] + r * Math.sin(g)]); }
      }
      schwanz.push([xe, S], [B - j, rj]);
      const teile: Part[] = [area(polygon(...schwanz))];
      // Open inside where there is room behind the root (its sharp tips solid), else solid ink
      let raum = 0;
      for (let x = B + hw; x < xe; x += 0.2) for (let y = -S; y <= S; y += 0.2)
        if (drin([x, y], schwanz) && !drin([x, y], koerper)) raum = Math.max(raum, Math.min(abstand([x, y], schwanz), abstand([x, y], koerper)) - hw);
      if (raum >= 0.9) {
        const m = schwanz.length;
        teile.push(dot(solidTip(schwanz[0], schwanz[1], schwanz[2], pen)), dot(solidTip(schwanz[m - 3], schwanz[m - 2], schwanz[m - 1], pen)));
      } else teile.push(dot(polygon(...schwanz)));

      // Fins: a solid triangle on the back and a smaller one on the belly, their base sunk into the body
      if (p.fins) {
        for (const s of [-1, 1]) {
          const x0 = B * (s < 0 ? 0.38 : 0.48), x1 = B * 0.7, tief = hw + 0.6, fh = (s < 0 ? 0.3 : 0.22) * H + 0.3 * w;
          const xs = x0 + 0.85 * (x1 - x0), fin = polygon([x0, s * (halb(x0) - tief)], [xs, s * (halb(xs) + fh)], [x1, s * (halb(x1) - tief)]);
          teile.push(area(fin), dot(fin));
        }
      }
      // Tail and fins end at the body outline
      teile.push(gap(polygon(...koerper), 0, true), area(polygon(...koerper)));

      const rMin = hw + 0.6, rWunsch = hw + Math.max(0.7, 0.11 * H);
      // Gill: the head in front of an arc bulging to the tail is solid ink with the eye cut out (the arc is its edge;
      // filled, a cut along the arc where it has room). Left out where the eye has no room in the head.
      if (p.gill) {
        const rg = Math.max(2.5, 1.1 * H), m: Pt = [0.4 * B - rg, 0], rb = rg + ink;
        let auge: { c: Pt; r: number } | null = null;
        for (let x = 0.15 * B; x <= 0.3 * B; x += 0.01 * B) {
          const c: Pt = [x, 0], oben = Math.min(abstand(c, koerper) + w - 1.0, rg - Math.hypot(c[0] - m[0], c[1]) - ink + hw - 1.0);
          if (oben >= rMin && (!auge || Math.min(oben, rWunsch) > auge.r)) auge = { c, r: Math.min(oben, rWunsch) };
        }
        if (auge) {
          // The edge runs along the arc and bends smoothly into the inner edge of the outline's ink (a curve tangent
          // to both): a corner of paper there breaks into specks at 24 px
          const rand = (x: number) => { const k = (halb(x + 0.01) - halb(x - 0.01)) / 0.02; return -(halb(x) - hw * Math.hypot(1, k)); };
          let G = 0;
          while (G < 150 && onCircle(m, rb, 90 - G)[1] > rand(onCircle(m, rb, 90 - G)[0])) G += 0.25;
          const rho = 1.2, G0 = Math.max(0, G - (rho * 180) / (Math.PI * rb)), th = ((90 - G0) * Math.PI) / 180;
          const p0 = onCircle(m, rb, 90 - G0), d: Pt = [-Math.cos(th), -Math.sin(th)];
          const x2 = onCircle(m, rb, 90 - G)[0] + rho, p2: Pt = [x2, rand(x2)], k2 = (rand(x2 + 0.01) - rand(x2 - 0.01)) / 0.02;
          // The control point where the arc's tangent meets the edge's tangent
          const s0 = (p2[1] - p0[1] - k2 * (p2[0] - p0[0])) / (d[1] - k2 * d[0]), p1: Pt = [p0[0] + d[0] * s0, p0[1] + d[1] * s0];
          const bogen = Array.from({ length: 9 }, (_, i): Pt => {
            const u = i / 8, v = 1 - u;
            return [v * v * p2[0] + 2 * u * v * p1[0] + u * u * p0[0], v * v * p2[1] + 2 * u * v * p1[1] + u * u * p0[1]];
          });
          const kante = Array.from({ length: 15 }, (_, i) => onCircle(m, rb, 90 - G0 + (2 * G0 * (i + 1)) / 16));
          const spiegel = (q: Pt): Pt => [q[0], -q[1]], ecke: Pt[] = [[x2, -halb(x2)], ...bogen];
          teile.push(dot(polygon(...oben.filter((q) => q[0] < x2), ...ecke, ...kante, ...ecke.map(spiegel).reverse(), ...unten.filter((q) => q[0] < x2))));
          teile.push(hole(circle(auge.c, auge.r)));
          const klar = (g: number) => [90 - g, 90 + g].every((d) => abstand(onCircle(m, rg, d), koerper) + hw - ink >= frei)
            && Array.from({ length: 9 }, (_, i) => onCircle(m, rg, 90 - g + (g * i) / 4)).every((q) => Math.hypot(q[0] - auge!.c[0], q[1]) - ink - (auge!.r - hw) >= frei);
          let g = 0;
          while (g < 89 && klar(g + 1)) g++;
          if (2 * rg * Math.sin((g * Math.PI) / 180) >= 1.2) teile.push(detail(arc(m, rg, 90 - g, 90 + g)));
          return teile;
        }
      }

      // Eye: free inside the head with clear room around its ring, or else as large as the head so its ring merges
      // with the outline above and below and fills the head in front of it (no sliver of paper left there)
      let auge: { c: Pt; r: number } | null = null;
      for (let x = 0.2 * B; x <= 0.36 * B && !auge; x += 0.02 * B)
        for (const y of [-0.1 * H, 0]) if (!auge && innen([x, y]) - hw - rWunsch >= frei) auge = { c: [x, y], r: rWunsch };
      const spitze = hw / Math.sin(Math.atan2(halb(0.01 * B), 0.01 * B));
      for (const rz of [rWunsch, rMin]) if (!auge) {
        for (let x = 0.5; x <= 0.45 * B; x += 0.05) {
          const d = abstand([x, 0], koerper);
          // Every inner edge point in front of the eye lies under its ring, and the ring overlaps the outline
          let vorn = Math.max(x - spitze, halb(x) - hw);
          for (let k = 0; k <= 12; k++) { const xx = spitze + ((x - spitze) * k) / 12; vorn = Math.max(vorn, Math.hypot(xx - x, Math.max(halb(xx) - hw, 0))); }
          const r = Math.max(rz, vorn - hw + 0.35);
          if (r <= d + 0.25 && (!auge || r < auge.r)) auge = { c: [x, 0], r };
        }
      }
      auge ??= { c: [0.25 * B, 0], r: Math.max(rMin, halb(0.25 * B)) };
      teile.push(hole(circle(auge.c, auge.r)));
      return teile;
    };
    return largest(8, 18, pen, fisch);
  },
});
