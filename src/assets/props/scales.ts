import { CylinderGeometry, Quaternion, Vector3 } from "three";
import { rounded, turned } from "../shapes";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// Eine Waage für Marktstände, Läden, Apotheken und Gerichtssäle: ein gedrehter Pfosten auf einem Fuß,
// ein waagerechter Balken an seiner Spitze, und an jedem Ende eine flache Pfanne, die an drei dünnen
// Stangen vom Balkenende herab hängt. Die Pfannen hängen senkrecht unter ihren Balkenenden, die
// Aufhängung bildet einen Kegel, die Stangen selbst laufen schräg vom Pfosten weg zum Pfannenrand.
export const scales = defineAsset({
  id: "scales", category: "props",
  title: { de: "Handelswaage", en: "Market scales" },
  description: {
    de: "Eine Waage für Marktstände, Läden, Apotheken und Gerichtssäle: ein gedrehter Pfosten auf einem Fuß, ein waagerechter Balken an seiner Spitze, und an jedem Ende eine flache Pfanne, die an drei dünnen Stangen vom Balkenende herab hängt. Die Pfannen hängen senkrecht unter ihren Balkenenden, die Aufhängung bildet einen Kegel über jeder Pfanne, und keine Stange zeigt zum Pfosten hin.",
    en: "A scale for market stalls, shops, apothecaries and courtrooms: a turned post on a foot, a level beam at its top, and a shallow pan hanging from each end on three thin rods from the beam end. The pans hang plumb under their beam ends, the hangers form a cone over each pan, and no rod points toward the post."
  },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.25, max: 0.8, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe vom Boden bis zur Oberkante des Pfostens: 0,3 m eine kleine Ladentischwaage, 0,45 m eine Ladenwaage, 0,7 m ein großer Kaufmannstisch.", en: "Height from the floor to the top of the post: 0.3 m a small counter scale, 0.45 m a shop scale, 0.7 m a large merchant's scale." } },
    span: { type: "number", label: { de: "Spannweite", en: "Span" }, min: 0.2, max: 0.7, step: 0.01, default: 0.36, unit: "m",
      describe: { de: "Länge des Balkens von Pfanne zu Pfanne: 0,2 m eine kleine Apothekerwaage, 0,36 m eine Ladenwaage, 0,7 m eine große Kaufmannswaage.", en: "Beam length from pan to pan: 0.2 m a small apothecary scale, 0.36 m a shop scale, 0.7 m a large merchant's scale." } },
    panSize: { type: "number", label: { de: "Pfannendurchmesser", en: "Pan diameter" }, min: 0.08, max: 0.25, step: 0.005, default: 0.13, unit: "m",
      describe: { de: "Durchmesser einer Pfanne (wird verkleinert, damit die Pfannen einander und den Pfosten nicht berühren): 0,08 m eine kleine Apothekerpfanne, 0,13 m eine Ladenpfanne, 0,25 m eine große Handelswaage.", en: "Pan diameter (clamped so the pans never touch each other or the post): 0.08 m a small apothecary pan, 0.13 m a shop pan, 0.25 m a large merchant's scale." } },
    tilt: { type: "number", label: { de: "Neigung", en: "Tilt" }, min: -15, max: 15, step: 1, default: 0, unit: "°",
      describe: { de: "Kippung des Balkens in Grad: 0 waagerecht, 12° stark zur Seite geneigt.", en: "Beam tilt in degrees: 0 level, 12° strongly tipped to one side." } },
    hangers: { type: "choice", label: { de: "Aufhängung", en: "Hangers" }, options: ["chains", "cords"], labels: { chains: { de: "Ketten", en: "Chains" }, cords: { de: "Schnüre", en: "Cords" } }, default: "chains",
      describe: { de: "Wie jede Pfanne hängt: drei dünne Metallstangen vom Balkenende zum Pfannenrand, oder noch dünnere Schnüre aus lackiertem Metall.", en: "How each pan hangs: three thin metal rods from the beam end to the pan rim, or thinner cords of painted metal." } },
    metal: { type: "color", label: { de: "Metall", en: "Metal" }, default: "#b08a3a",
      describe: { de: "Farbe des Metalls: #b08a3a Messing, #4a4a4a Eisen, #a85a32 Kupfer.", en: "Colour of the metal: #b08a3a brass, #4a4a4a iron, #a85a32 copper." } },
    base: { type: "choice", label: { de: "Fuß", en: "Base" }, options: ["wood", "metal"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } }, default: "wood",
      describe: { de: "Der Standfuß: eine Holzplatte oder ein runder Metallfuß.", en: "The foot: a wooden plinth or a round metal foot." } },
  },
  presets: {
    "brass-shop": { label: { de: "Messing-Ladenwaage", en: "Brass shop scale" }, values: { height: 0.45, span: 0.36, panSize: 0.13, tilt: 0, hangers: "chains", metal: "#b08a3a", base: "wood" } },
    "merchant": { label: { de: "Kaufmannswaage", en: "Merchant's scale" }, values: { height: 0.7, span: 0.6, panSize: 0.22, metal: "#4a4a4a", base: "wood" } },
    "apothecary": { label: { de: "Apothekerwaage", en: "Apothecary scale" }, values: { height: 0.3, span: 0.24, panSize: 0.09, base: "metal", hangers: "cords" } },
    "tipped": { label: { de: "Gekippt", en: "Tipped" }, values: { tilt: 12 } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 4800, drawCalls: 4 },
  build(p) {
    const h = p.height, span = p.span;
    const panSize = Math.min(p.panSize, span / 2 - 0.02);
    const R = panSize / 2;
    const winkel = (p.tilt * Math.PI) / 180, cos = Math.cos(winkel), sin = Math.sin(winkel);
    const tiefstesEnde = h - span / 2 * Math.abs(sin);
    const fall = Math.max(0.06, Math.min(0.8 * panSize, tiefstesEnde - 0.06));
    const tiefe = Math.max(0.015, Math.min(0.04, panSize * 0.3));
    const stab = Math.max(12, Math.min(24, Math.round(R * 180)));
    const fuessH = Math.min(0.05, h * 0.1);
    const fuessR = Math.min(0.3, Math.max(0.14, span * 0.5));
    const postR = 0.017, fussR = 0.024, postH = h - fuessH;
    const fuessSeg = Math.max(6, Math.min(8, Math.round(fuessR * 25)));
    const metall = material("metal", p.metal, 4);
    const schnur = material("paint", "#5d4a37", 1, undefined, { plain: true });
    const hangMat = p.hangers === "chains" ? metall : schnur;
    const rodR = p.hangers === "chains" ? 0.004 : 0.003;
    const t = new Parts();
    const holz = material("wood", "#9a7e54");
    if (p.base === "wood") t.add(holz, rounded(fuessR * 2, fuessH, fuessR * 2, 0.005, 0, fuessH / 2, 0, fuessSeg));
    else t.add(metall, rounded(fuessR * 2, fuessH, fuessR * 2, 0.004, 0, fuessH / 2, 0, fuessSeg));
    // Gedrehter Pfosten: breiter Fuß, schöner Mittel, Kopf unter dem Balken
    t.add(metall, turned([
      [0.0006, 0], [fussR, 0], [fussR * 0.9, postH * 0.25], [postR, postH * 0.9], [postR, postH], [0.0006, postH + 0.004]
    ], 12, 0, fuessH, 0));
    // Der Balken ruht auf der Pfeilerspitze und kippt um sie herum
    const balken = rounded(span, 0.02, 0.01, 0.001, 0, 0, 0);
    balken.rotateZ(winkel).translate(0, h, 0);
    t.add(metall, balken);
    // Kleiner Knopf am Balkenende, wo die Stangen zusammenlaufen
    const knob: [number, number][] = [[0.001, -0.005], [0.008, -0.002], [0.008, 0.002], [0.001, 0.005]];
    const hoch = new Vector3(0, 1, 0), q = new Quaternion();
    const profil: [number, number][] = [[0.0006, -tiefe], [R, 0], [R - 0.002, 0], [0.0006, -tiefe + 0.001]];
    for (const seite of [-1, 1]) {
      const endX = seite * span / 2 * cos, endY = h + seite * span / 2 * sin;
      const px = endX, py = endY - 0.005;
      const rimY = py - fall;
      // Die Pfanne liegt waagerecht und senkrecht unter ihrem Balkenende
      t.add(metall, turned(profil, stab, px, rimY, 0));
      // Knopf, an dem die Stangen des einen Endes zusammenlaufen
      t.add(metall, turned(knob, 16, px, py, 0));
      // Drei Stangen vom Knopf zum Pfannenrand: einer nach hinten, zwei nach vorne links und rechts
      const oben = new Vector3(px, py, 0);
      for (const a of [Math.PI / 2, 7 * Math.PI / 6, 11 * Math.PI / 6]) {
        const ziel = new Vector3(px + R * Math.cos(a), rimY, R * Math.sin(a));
        const richtung = new Vector3().subVectors(ziel, oben).normalize();
        const stange = new CylinderGeometry(rodR, rodR, oben.distanceTo(ziel), 6);
        stange.applyQuaternion(q.setFromUnitVectors(hoch, richtung));
        stange.translate((px + ziel.x) / 2, (py + rimY) / 2, ziel.z / 2);
        t.add(hangMat, stange);
      }
    }
    return t.group();
  },
});
