import { BoxGeometry, type Material } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

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
  budget: { triangles: 5000, drawCalls: 2 },
  build(p) {
    const stein = p.deck === "stone";
    const m = material(stein ? "stone" : "wood", p.color, stein ? 0.5 : 1);
    const gel = material("wood", p.railings === "rope" ? "#8d7c58" : "#77593c");
    const t = new Parts();
    const L = p.length, B = p.width;
    // Der Bogen steigt zu den Enden mit 2 × Höhe / Länge an; die Kuppe begrenzt die Neigung auf etwa 18°
    const A = Math.min(p.archHeight, L / 6);
    const kurve = (x: number) => A * (1 - (4 * x * x) / (L * L));
    const neig = (x: number) => -Math.atan((4 * A * x) / (L * L));
    const d = stein ? 0.16 : 0.09;
    // Ein gerader Balken von (x0, y0) nach (x1, y1), `dick` in z, `hoch` in y
    const balken = (mat: Material, x0: number, y0: number, x1: number, y1: number, z: number, dick: number, hoch: number) => {
      t.add(mat, new BoxGeometry(Math.hypot(x1 - x0, y1 - y0), hoch, dick)
        .rotateZ(Math.atan2(y1 - y0, x1 - x0)).translate((x0 + x1) / 2, (y0 + y1) / 2, z));
    };
    const zug = (mat: Material, von: number, bis: number, felder: number, hoehe: (x: number) => number, z: number, dick: number, hoch: number) => {
      for (let i = 0; i < felder; i++) {
        const a = von + ((bis - von) * i) / felder, b = von + ((bis - von) * (i + 1)) / felder;
        balken(mat, a, hoehe(a), b, hoehe(b), z, dick, hoch);
      }
    };
    // Der Belag: jedes Brett liegt in der Neigung der Kurve, die äußeren enden genau auf dem Boden
    const felder = stein ? Math.max(6, Math.round(L / 0.45)) : Math.max(4, Math.round(L / 0.17)), schritt = L / felder;
    for (let i = 0; i < felder; i++) {
      const x = -L / 2 + (i + 0.5) * schritt;
      t.add(m, new BoxGeometry(stein ? schritt + 0.004 : Math.max(0.04, schritt - 0.03), d, B)
        .rotateZ(neig(x)).translate(x, kurve(x) + d / 2, 0));
    }
    const ende = kurve(L / 2 - 0.5) + 0.03;
    if (ende > 0.06) for (const sx of [-1, 1]) t.box(m, 0.5, ende, B + 0.16, sx * (L / 2 - 0.25), ende / 2, 0);
    for (let i = 0; i < p.piers; i++) {
      const x = -L / 2 + ((i + 1) * L) / (p.piers + 1), h = kurve(x) + 0.02;
      if (h > 0.08) t.post(m, stein ? 0.18 : 0.14, h, x, 0, 0, 8, stein);
    }
    if (p.railings !== "none") {
      const anzahl = Math.max(3, Math.round(L / 1.3) + 1), seil = p.railings === "rope";
      const xs = Array.from({ length: anzahl }, (_, i) => -L / 2 + 0.06 + (i * (L - 0.12)) / (anzahl - 1));
      for (const sx of [-1, 1]) {
        const z = sx * (B / 2 - (seil ? 0.05 : 0.07));
        for (const x of xs) {
          const y = kurve(x) + d;
          if (seil) t.post(gel, 0.045, 1.05, x, y, z, 8);
          else t.post(gel, 0.05, 1, x, y, z, 8, true);
        }
        if (!seil) {
          zug(gel, xs[0], xs[anzahl - 1], anzahl - 1, (x) => kurve(x) + d + 0.95, z, 0.05, 0.1);
          zug(gel, xs[0], xs[anzahl - 1], anzahl - 1, (x) => kurve(x) + d + 0.45, z, 0.05, 0.07);
        } else {
          for (const hoehe of [1.02, 0.62]) for (let i = 0; i < anzahl - 1; i++) {
            const a = xs[i], b = xs[i + 1], mitte = (a + b) / 2;
            const ya = kurve(a) + d + hoehe, yb = kurve(b) + d + hoehe, ym = (ya + yb) / 2 - 0.06 * (b - a);
            balken(gel, a, ya, mitte, ym, z, 0.035, 0.035);
            balken(gel, mitte, ym, b, yb, z, 0.035, 0.035);
          }
        }
      }
    }
    return t.group();
  },
});
