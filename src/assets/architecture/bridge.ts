import { ExtrudeGeometry, QuadraticBezierCurve3, Shape, TubeGeometry, Vector3 } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

export const bridge = defineAsset({
  id: "bridge", category: "architecture",
  title: { de: "Brücke", en: "Bridge" },
  description: { de: "Fußgängerbrücke längs über x: flach oder Buckel, Belag aus Querplanken oder Steinplatte, Geländer aus Holz oder als Seil, dazu Widerlager und Pfeiler. Beide Enden berühren den Boden.", en: "A footbridge along x: flat or humped, a deck of transverse planks or a stone slab, a wooden or rope railing, with abutments and piers. Both ends touch the floor." },
  params: {
    length: { type: "number", label: { de: "Spannweite", en: "Span" }, min: 3, max: 20, step: 0.1, default: 8, unit: "m",
      describe: { de: "Länge über alles zwischen den beiden Enden: 4 m über einen Graben, 8 m über einen Weg, 20 m über einen Bachlauf.", en: "Overall length between the two ends: 4 m over a ditch, 8 m over a path, 20 m over a stream." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 1, max: 4, step: 0.05, default: 2.2, unit: "m",
      describe: { de: "Breite des Belags zwischen den Geländern: 1,2 m für einen Fußweg, 2 m für zwei Personen, 3,5 m für Radfahrer und Karren.", en: "Width of the deck between the railings: 1.2 m for a footpath, 2 m for two people, 3.5 m for cyclists and carts." } },
    archHeight: { type: "number", label: { de: "Bogenhöhe", en: "Arch height" }, min: 0, max: 2, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Wie viel höher der Belag in der Mitte als an den Enden liegt: 0 flach, 0,5 m sanft, 2 m Buckel; die Neigung bleibt unter etwa 18°, damit Figuren hinaufkommen.", en: "How much higher the deck is in the middle than at the ends: 0 flat, 0.5 m gentle, 2 m humpback; the slope stays under about 18° so characters can walk up." } },
    deck: { type: "choice", label: { de: "Belag", en: "Deck" }, options: ["planks", "stone"], labels: { planks: { de: "Querplanken", en: "Planks" }, stone: { de: "Steinplatte", en: "Stone slab" } }, default: "planks",
      describe: { de: "Querplanken mit Fugen oder eine durchgehende Platte; das Material wechselt mit.", en: "Transverse planks with gaps or a continuous slab; the material changes with it." } },
    railings: { type: "choice", label: { de: "Geländer", en: "Railing" }, options: ["none", "rope", "wood"], labels: { none: { de: "keins", en: "none" }, rope: { de: "Seil", en: "Rope" }, wood: { de: "Holz", en: "Wood" } }, default: "wood",
      describe: { de: "Geländer beidseitig in etwa 1 m Höhe: keins, ein durchhängendes Seil zwischen Pfosten oder ein Holzgeländer mit zwei Riegeln.", en: "A railing on both sides about 1 m high: none, a sagging rope between posts, or a wooden railing with two rails." } },
    piers: { type: "integer", label: { de: "Pfeiler", en: "Piers" }, min: 0, max: 4, default: 2,
      describe: { de: "Zahl der senkrechten Stützen zwischen den Enden; sie reichen vom Boden bis unter den Belag und entfallen, wo die Brücke aufliegt.", en: "Number of vertical supports between the ends; they reach from the floor up to the deck and drop away where the bridge rests on the ground." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a6a48",
      describe: { de: "Grundfarbe des Belags.", en: "Base colour of the deck." } },
  },
  presets: {
    "plank-footbridge": { label: { de: "Plankensteg", en: "Plank footbridge" }, values: { length: 5, width: 1.4, archHeight: 0.5, deck: "planks", railings: "wood", piers: 1, color: "#8a6a48" } },
    "stone-arch": { label: { de: "Steinbogen", en: "Stone arch" }, values: { length: 9, width: 2.6, archHeight: 1.6, deck: "stone", railings: "none", piers: 0, color: "#a09a8e" } },
    "rope-bridge": { label: { de: "Seilbrücke", en: "Rope bridge" }, values: { length: 12, width: 1.2, archHeight: 0.25, deck: "planks", railings: "rope", piers: 0, color: "#7a5c3e" } },
  },
  // Die konvexe Hülle wirkt als Rampe: Figuren laufen den Bogen hinauf, statt daran hängen zu bleiben
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 35608, drawCalls: 4 },
  build(p) {
    const stein = p.deck === "stone";
    const m = stein ? material("stone", p.color, 0.5, undefined, { moss: 0.1 }) : material("wood", p.color, 1, undefined, { grain: "part" });
    const holz = material("wood", p.railings === "rope" ? "#8d7c58" : "#77593c", 1, undefined, { grain: "part" });
    const fels = stein ? m : material("stone", "#8a857c", 1, undefined, { moss: 0.2 });
    const t = new Parts();
    const L = p.length, B = p.width;
    // Der Bogen steigt zu den Enden mit 2 × Höhe / Länge an; die Kuppe begrenzt die Neigung auf etwa 18°
    const A = Math.min(p.archHeight, L / 6);
    const kurve = (x: number) => A * (1 - (4 * x * x) / (L * L));
    const neig = (x: number) => -Math.atan((4 * A * x) / (L * L));
    const d = stein ? 0.16 : 0.09;
    // Der Belag: jedes Brett liegt in der Neigung der Kurve, die äußeren enden genau auf dem Boden
    const felder = stein ? Math.max(6, Math.round(L / 0.45)) : Math.max(4, Math.round(L / 0.17)), schritt = L / felder;
    for (let i = 0; i < felder; i++) {
      const x = -L / 2 + (i + 0.5) * schritt;
      const g = stein ? rounded(schritt - 0.006, d, B, 0.015) : grained(rounded(Math.max(0.04, schritt - 0.03), d, B, 0.008, 0, 0, 0, 1), "z");
      t.add(m, g.rotateZ(neig(x)).translate(x, kurve(x) + d / 2, 0));
    }
    // Zwei gebogene Längsträger 2 mm unter den Planken; ihre Enden stecken in den Widerlagern
    const zS = B / 2 - 0.2;
    if (!stein && A >= 0.2) {
      const b = 0.008, n = Math.max(16, Math.round(L / 0.25)), x0 = -(L / 2 - 0.3), x1 = L / 2 - 0.3;
      const form = new Shape();
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n, y = Math.max(0.02 + 2 * b + 0.001, kurve(x) - 0.002 - b);
        if (i === 0) form.moveTo(x, y); else form.lineTo(x, y);
      }
      for (let i = n; i >= 0; i--) {
        const x = x0 + ((x1 - x0) * i) / n;
        form.lineTo(x, Math.max(0.001 + b, kurve(x) - 0.14 + b));
      }
      for (const sz of [-1, 1]) {
        t.add(holz, grained(new ExtrudeGeometry(form, { depth: 0.12 - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 1, curveSegments: 1 })
          .translate(0, 0, sz * zS - (0.12 - 2 * b) / 2), "x"));
      }
    }
    const ende = kurve(L / 2 - 0.5) + 0.03;
    if (ende > 0.06) for (const sx of [-1, 1]) t.add(fels, rounded(0.5, ende, B + 0.16, 0.02, sx * (L / 2 - 0.25), ende / 2, 0));
    for (let i = 0; i < p.piers; i++) {
      const x = -L / 2 + ((i + 1) * L) / (p.piers + 1);
      if (stein) {
        const h = kurve(x) + 0.02;
        if (h > 0.08) t.add(m, rounded(0.36, h, Math.min(0.6, B * 0.5), 0.02, x, h / 2, 0));
        continue;
      }
      // Ein Querholm direkt unter den Trägern auf zwei Pfosten
      const unter = kurve(x) - 0.14;
      if (unter - 0.12 < 0.06) continue;
      t.add(holz, grained(rounded(0.14, 0.12, 2 * zS + 0.2, 0.01, x, unter - 0.06 - 0.001, 0), "z"));
      for (const sz of [-1, 1]) t.add(holz, rounded(0.14, unter - 0.12, 0.14, 0.01, x, (unter - 0.12) / 2 + 0.002, sz * zS));
    }
    if (p.railings !== "none") {
      const anzahl = Math.max(3, Math.round(L / 1.3) + 1), seil = p.railings === "rope";
      const xs = Array.from({ length: anzahl }, (_, i) => -L / 2 + 0.06 + (i * (L - 0.12)) / (anzahl - 1));
      const tau = material("paint", "#8d7c58");
      for (const sx of [-1, 1]) {
        const z = sx * (B / 2 - (seil ? 0.05 : 0.07));
        // Die Pfosten stehen 1 cm tief im Belag
        for (const x of xs) {
          const y = kurve(x) + d - 0.01;
          if (seil) t.add(holz, turned([[0, 0], [0.045, 0], [0.045, 1.04], [0.035, 1.06], [0, 1.065]], 12, x, y, z));
          else t.add(holz, rounded(0.1, 1.01, 0.1, 0.01, x, y + 0.505, z));
        }
        for (let i = 0; i < anzahl - 1; i++) {
          const a = xs[i], b = xs[i + 1], mitte = (a + b) / 2;
          if (!seil) {
            // Zwei Riegel von Pfostenmitte zu Pfostenmitte: die Enden treffen sich im Pfosten
            for (const [hoehe, hoch] of [[0.95, 0.1], [0.45, 0.07]]) {
              const ya = kurve(a) + d + hoehe, yb = kurve(b) + d + hoehe;
              t.add(holz, grained(rounded(Math.hypot(b - a, yb - ya), hoch, 0.05, 0.008, 0, 0, 0, 1), "x")
                .rotateZ(Math.atan2(yb - ya, b - a)).translate(mitte, (ya + yb) / 2, z));
            }
          } else {
            // Ein Seil je Feld, das in der Mitte durch den Durchhang ym läuft
            for (const hoehe of [1.02, 0.62]) {
              const ya = kurve(a) + d + hoehe, yb = kurve(b) + d + hoehe, ym = (ya + yb) / 2 - 0.06 * (b - a);
              const bogen = new QuadraticBezierCurve3(new Vector3(a, ya, z), new Vector3(mitte, 2 * ym - (ya + yb) / 2, z), new Vector3(b, yb, z));
              t.add(tau, new TubeGeometry(bogen, 16, 0.018, 8, false));
            }
          }
        }
      }
    }
    return t.group();
  },
});
