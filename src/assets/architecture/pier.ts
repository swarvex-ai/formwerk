import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

// Poller in einem dunkleren Ton desselben Holzes
const dunkler = (hex: string, f: number) => `#${hex.slice(1).match(/../g)!.map((x) => Math.round(parseInt(x, 16) * f).toString(16).padStart(2, "0")).join("")}`;

export const pier = defineAsset({
  id: "pier", category: "architecture",
  title: { de: "Steg", en: "Pier" },
  description: { de: "Holzsteg auf eckigen Pfosten, nach vorn über das Wasser: zwei Längsträger unter Dielen mit Fugen, rechts oder beidseitig ein Geländer, am Kopf zwei Poller.", en: "A wooden jetty on square posts reaching out over the water: two stringers under planks with gaps, a railing on the right or both sides, two mooring bollards at the head." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 2, max: 12, step: 0.1, default: 6, unit: "m",
      describe: { de: "Länge des Stegs entlang z, vom Ufer bis zum Kopf: 4 m am Badesee, 6 m am Bootssteg, 12 m als Seebrücke.", en: "Length of the jetty along z, from shore to head: 4 m at a lake, 6 m at a boat dock, 12 m as a seaside pier." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 1, max: 3, step: 0.05, default: 1.6, unit: "m",
      describe: { de: "Breite der Dielen: 1 m am Badesteg, 1,6 m für zwei Personen, 3 m am Hafensteg.", en: "Width of the deck: 1 m at a bathing jetty, 1.6 m for two people, 3 m at a harbour pier." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 2, step: 0.05, default: 0.8, unit: "m",
      describe: { de: "Höhe der Dielenoberkante über dem Boden, also über der Wasseroberfläche: 0,3 m am Strand, 0,8 m am See, 1,5 m am Hafen.", en: "Height of the deck top above the floor, i.e. above the water surface: 0.3 m at the beach, 0.8 m at a lake, 1.5 m at a harbour." } },
    postSpacing: { type: "number", label: { de: "Pfostenabstand", en: "Post spacing" }, min: 1, max: 3, step: 0.1, default: 2, unit: "m",
      describe: { de: "Abstand der Pfostenpaare entlang z; der Steg wird in gleich große Felder geteilt, je ein Paar an beiden Enden: 1 m bei weichem Grund, 2 m üblich, 3 m bei festem.", en: "Distance between the pairs of posts along z; the jetty is split into equal bays with a pair at each end: 1 m on soft ground, 2 m usual, 3 m on solid." } },
    railing: { type: "choice", label: { de: "Geländer", en: "Railing" }, options: ["none", "one", "both"], labels: { none: { de: "keins", en: "none" }, one: { de: "rechts", en: "right" }, both: { de: "beidseitig", en: "both sides" } }, default: "none",
      describe: { de: "Einfaches Pfosten-Riegel-Geländer in 0,9 m Höhe über den Dielen: keins, nur auf der rechten Seite (+x) oder beidseitig.", en: "A simple post-and-rail railing 0.9 m above the deck: none, only on the right (+x) side, or on both sides." } },
    bollards: { type: "boolean", label: { de: "Poller", en: "Bollards" }, default: false,
      describe: { de: "Zwei runde Poller (0,3 m hoch, 0,12 m Radius) am vorderen Ende (+z) zum Festmachen von Booten.", en: "Two round mooring bollards (0.3 m tall, 0.12 m radius) at the far (+z) end for tying up boats." } },
    colour: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#8a6a4a",
      describe: { de: "Grundfarbe des Holzes; die Poller einen Ton dunkler.", en: "Base colour of the wood; the bollards one shade darker." } },
  },
  presets: {
    jetty: { label: { de: "Steg", en: "Jetty" }, values: { length: 6, width: 1.6, height: 0.8, postSpacing: 2 } },
    boardwalk: { label: { de: "Promenade", en: "Boardwalk" }, values: { length: 12, width: 2.5, height: 0.3, postSpacing: 3 } },
    harbour: { label: { de: "Hafensteg", en: "Harbour pier" }, values: { width: 3, height: 1.5, railing: "both", bollards: true, colour: "#6b5440" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 46656, drawCalls: 4 },
  build(p) {
    // Pfosten und Geländerpfosten stehen (Maserung "auto"); Längsträger, erste Dielenton, Handlauf und Mittelriegel liegen ("level")
    const m = material("wood", p.colour);
    const mr = material("wood", p.colour, 1, undefined, { grain: "level" });
    const m2 = material("wood", dunkler(p.colour, 0.9), 1, undefined, { grain: "level" });
    const mb = material("wood", dunkler(p.colour, 0.7));
    const t = new Parts();
    const L = p.length, B = p.width, h = p.height, px = B / 2 - 0.12;
    // Pfostenpaare: ein Paar je Feld, je eines genau an den Enden; sie tragen die Längsträger und ragen 1 cm in sie hinein
    const felder = Math.max(1, Math.round(L / p.postSpacing)), feld = L / felder;
    for (let i = 0; i <= felder; i++) for (const sx of [-1, 1]) t.add(m, rounded(0.18, h - 0.23, 0.18, 0.005, sx * px, (h - 0.23) / 2, -L / 2 + i * feld));
    // Längsträger unter den Dielen, 1 cm über dem Pfostenkopf
    for (const sx of [-1, 1]) t.add(mr, rounded(0.1, 0.2, L, 0.004, sx * px, h - 0.14, 0));
    // Dielen quer über x, 0,01 m Fuge, abwechselnd in zwei Tönen
    const n = Math.max(2, Math.round((L + 0.01) / 0.15)), schritt = (L + 0.01) / n;
    for (let i = 0; i < n; i++) t.add(i % 2 === 0 ? mr : m2, rounded(B, 0.04, schritt - 0.01, 0.003, 0, h - 0.02, -L / 2 + (i + 0.5) * schritt));
    const seiten = p.railing === "both" ? [-1, 1] : p.railing === "one" ? [1] : [];
    for (const sx of seiten) {
      const x = sx * (B / 2 - 0.07), stuetzen = Math.max(2, Math.round(L / 1.2) + 1), bahn = (L - 0.12) / (stuetzen - 1);
      for (let i = 0; i < stuetzen; i++) {
        const z = -L / 2 + 0.06 + i * bahn;
        // Geländerpfosten: 1 cm tief in den Dielen, endet 1 cm unter der Handlauf-Oberkante
        t.add(m, rounded(0.06, 0.9, 0.06, 0.003, x, h + 0.44, z));
      }
      // Handlauf: durchgängig über die Pfosten
      t.add(mr, rounded(0.05, 0.1, L, 0.003, x, h + 0.85, 0));
      // Ein Mittelriegel je Feld, von Pfostenflanke zu Pfostenflanke, 1 cm in jeden Pfosten
      for (let i = 0; i < stuetzen - 1; i++) {
        const z0 = -L / 2 + 0.06 + i * bahn;
        t.add(mr, rounded(0.05, 0.07, bahn - 0.04, 0.003, x, h + 0.45, z0 + bahn / 2));
      }
    }
    if (p.bollards) {
      // Gedrehter Poller: Fußring, Taille bei 0,75 des Radius, abgerundete geschlossene Kappe
      const profil: [number, number][] = [[0, 0], [0.115, 0], [0.12, 0.02], [0.115, 0.045], [0.09, 0.07], [0.09, 0.17], [0.105, 0.22], [0.12, 0.25], [0.12, 0.275], [0.105, 0.295], [0.06, 0.305], [0, 0.305]];
      for (const sx of [-1, 1]) t.add(mb, turned(profil, 24, sx * Math.max(0.25, B / 2 - 0.25), h - 0.005, L / 2 - 0.2));
    }
    return t.group();
  },
});
