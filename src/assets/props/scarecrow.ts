import { ConeGeometry, Mesh, Quaternion, SphereGeometry, TorusGeometry, Vector3, type Material } from "three";
import { rng } from "../../core/rng";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

const rad = (deg: number) => (deg * Math.PI) / 180;

// A thin straw stalk: a four-sided cone standing with its base at `base`, its tip along `dir`.
function stroehalm(t: Parts, m: Material, base: Vector3, dir: Vector3, len: number): void {
  const g = new ConeGeometry(0.013, len, 4);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize()));
  g.translate(base.x, base.y, base.z);
  t.add(m, g);
}

export const scarecrow = defineAsset({
  id: "scarecrow", category: "props",
  title: { de: "Vogelscheuche", en: "Scarecrow" },
  description: { de: "Eine Strohpuppe auf Holzpfosten und Querbalken: ein Sackkopf, ein Stoffmantel mit Ärmeln entlang des geneigten Balkens und Strohbüscheln an Hals und Handgelenken, mit Stroh- oder spitzem Hut.", en: "A straw figure on a wooden post and crossbar: a sack head, a cloth coat whose sleeves run along the drooping crossbar, and straw tufts at the neck and wrists, with a straw or pointed hat." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1.4, max: 2.4, step: 0.05, default: 1.9, unit: "m",
      describe: { de: "Höhe bis zum Scheitel oder Hut: 1,4 m eine kleine Gartenvogelscheuche, 1,9 m üblich, 2,4 m eine hohe Vogelscheuche auf dem Feld.", en: "Height to the top of the head or hat: 1.4 m a small garden scarecrow, 1.9 m usual, 2.4 m a tall scarecrow in the field." } },
    span: { type: "number", label: { de: "Armspanne", en: "Arm span" }, min: 0.9, max: 1.8, step: 0.05, default: 1.3, unit: "m",
      describe: { de: "Armspanne von Hand zu Hand: 1,0 m eine kindliche Vogelscheuche, 1,3 m üblich, 1,8 m eine weitarmige.", en: "Arm span from hand to hand: 1.0 m a childlike scarecrow, 1.3 m usual, 1.8 m a wide-armed one." } },
    droop: { type: "number", label: { de: "Überhang", en: "Droop" }, min: 0, max: 30, step: 1, default: 10, unit: "°",
      describe: { de: "Wie weit die Arme von der Waagerechten herabhängen: 0° gerade ausgestreckt, 10° locker herabhängend, 30° schlaff.", en: "How far the arms hang down from horizontal: 0° stretched out straight, 10° a relaxed droop, 30° hanging limply." } },
    lean: { type: "number", label: { de: "Schieflage", en: "Lean" }, min: 0, max: 12, step: 1, default: 0, unit: "°",
      describe: { de: "Wie weit die ganze Figur zur Seite kippt, als sei der Pfosten geschoben: 0° gerade, 8° deutliche Schieflage, 12° kaum noch stehend.", en: "How far the whole figure tilts to the side, as if the post were pushed: 0° upright, 8° a noticeable lean, 12° barely still standing." } },
    hat: { type: "choice", label: { de: "Hut", en: "Hat" }, options: ["none", "straw", "pointed"], labels: { none: { de: "Ohne", en: "None" }, straw: { de: "Stroh", en: "Straw" }, pointed: { de: "Spitz", en: "Pointed" } }, default: "straw",
      describe: { de: "Die Kopfbedeckung: ohne ein nackter Sackkopf, Stroh ein breiter flacher Rand mit niedriger Krone, spitz ein Kegel wie ein Hexenhut.", en: "The headgear: none a bare sack head, straw a wide flat brim with a low crown, pointed a cone like a witch hat." } },
    coat: { type: "choice", label: { de: "Mantel", en: "Coat" }, options: ["shirt", "long"], labels: { shirt: { de: "Hemd", en: "Shirt" }, long: { de: "Lang", en: "Long" } }, default: "shirt",
      describe: { de: "Die Länge des Stoffmantels: Hemd nur bis zur Taille, lang bis 0,35 m über den Boden.", en: "The length of the cloth coat: shirt only to the waist, long down to 0.35 m above the ground." } },
    clothColour: { type: "color", label: { de: "Stoff", en: "Cloth" }, default: "#6a7a4a",
      describe: { de: "Farbe von Mantel und Ärmeln: #6a7a4a olivgrünes Tuch, #7a4a3a verwittertes Braun, #3a3a40 verblasstes Schwarz.", en: "Colour of the coat and sleeves: #6a7a4a olive canvas, #7a4a3a worn brown, #3a3a40 faded black." } },
    strawColour: { type: "color", label: { de: "Stroh", en: "Straw" }, default: "#d8b860",
      describe: { de: "Farbe des Strohs an Sackkopf, Büscheln und Hut: #d8b860 goldgelbes Stroh, #b89a52 trockenes Heu.", en: "Colour of the straw on the sack head, tufts and hat: #d8b860 golden straw, #b89a52 dry hay." } },
  },
  presets: {
    field: { label: { de: "Feld", en: "Field" }, values: { height: 1.9, span: 1.3, droop: 10, hat: "straw", coat: "shirt", clothColour: "#6a7a4a" } },
    garden: { label: { de: "Garten", en: "Garden" }, values: { height: 1.5, span: 1, hat: "none", coat: "shirt", clothColour: "#7a4a3a" } },
    spooky: { label: { de: "Gruselig", en: "Spooky" }, values: { hat: "pointed", coat: "long", droop: 25, lean: 8, clothColour: "#3a3a40" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 3244, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed);
    const holz = material("wood", "#6b4a2e", 1, undefined, { grain: "part" }), stoff = material("paint", p.clothColour), stroh = material("leaf", p.strawColour);
    const t = new Parts();
    const h = p.height, schulter = 0.8 * h, neckY = schulter + 0.1;
    const kopfR = 0.145, flach = 0.85, kopfY = neckY + kopfR * 0.7 + 0.04;
    const kopfX = (r() - 0.5) * 0.02, dreh = (r() - 0.5) * 0.5;
    const droop = rad(p.droop), half = p.span / 2;

    // 1. post (square with eased edges, foot on the floor, grain upright) and the two crossbar arms out to the hands
    t.add(holz, rounded(0.08, neckY, 0.08, 0.008, 0, neckY / 2, 0));
    const mittig = new Vector3(0, schulter, 0);
    const hand = (s: number) => new Vector3(s * half, schulter - half * Math.tan(droop), 0);

    // 3. coat body around the post, from the shoulders to the waist (shirt) or near the floor (long)
    const oben = schulter + 0.05, unten = p.coat === "long" ? 0.35 : h * 0.5;
    // turned, then soft folds that grow towards the hem; the body is flatter front to back, the collar round
    const rU = p.coat === "long" ? 0.26 : 0.2, yTop = oben - 0.07;
    const mantel = turned([[0, unten + 0.02], [rU - 0.012, unten], [rU, unten + 0.012], [0.17, oben - 0.07], [0.12, oben - 0.01], [0.065, oben + 0.03], [0, oben + 0.03]], 32);
    const pos = mantel.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const w = Math.atan2(z, x), k = Math.min(1, Math.max(0, (yTop - y) / (yTop - unten)));
      const f = 1 + 0.07 * k * Math.sin(7 * w + 1);
      const fz = 0.72 + 0.28 * Math.min(1, Math.max(0, (y - yTop) / 0.1));
      pos.setXYZ(i, x * f, y, z * f * fz);
    }
    mantel.computeVertexNormals();
    t.add(stoff, mantel);

    for (const s of [-1, 1]) {
      const E = hand(s);
      // the crossbar (wood) out to the hand and the sleeve (cloth) over it, coaxial so the wood never pokes through the cloth
      const len = E.clone().sub(mittig).length(), mittel = mittig.clone().add(E).multiplyScalar(0.5);
      const winkel = Math.atan2(E.y - mittig.y, E.x - mittig.x);
      t.add(holz, grained(rounded(len, 0.05, 0.05, 0.006), "x").rotateZ(winkel).translate(mittel.x, mittel.y, mittel.z));
      // turned sleeve along the bar: the cuff flares slightly at 0.82 of the arm, its end recessed 4 cm
      const dir = E.clone().sub(mittig).normalize(), c = 0.82 * len - 0.1, ansatz = mittig.clone().addScaledVector(dir, 0.1);
      t.add(stoff, turned([[0, 0], [0.058, 0], [0.052, c / 2], [0.064, c], [0.05, c], [0, c - 0.04]], 16)
        .applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir)).translate(ansatz.x, ansatz.y, ansatz.z));
      // 3-5 straw tufts at the wrist, poking out of the cuff along the arm
      const cuff = mittig.clone().lerp(E, 0.82), richt = new Vector3(s * Math.cos(droop), -Math.sin(droop), 0);
      const anzahl = 3 + Math.floor(r() * 3);
      for (let k = 0; k < anzahl; k++) {
        const d = richt.clone(); d.x += (r() - 0.5) * 0.7; d.y += (r() - 0.5) * 0.7; d.z += (r() - 0.5) * 0.7;
        stroehalm(t, stroh, cuff.clone().addScaledVector(richt, 0.02), d, 0.08 + r() * 0.05);
      }
    }

    // 2. head: a slightly flattened sack on the post, a little turned and off-centre
    t.add(stroh, new SphereGeometry(kopfR, 24, 16).rotateY(dreh).scale(1, flach, 1).translate(kopfX, kopfY, 0));
    // the gathered sack neck under the head, tied with twine
    const yK = kopfY - kopfR * flach * 0.6;
    t.add(stroh, turned([[0, neckY - 0.03], [0.08, neckY - 0.03], [0.055, neckY + 0.01], [0.05, yK], [0, yK]], 16, kopfX, 0, 0));
    t.add(stroh, new TorusGeometry(0.056, 0.008, 6, 20).rotateX(Math.PI / 2).translate(kopfX, neckY + 0.015, 0));
    // straw tufts poking up around the neck
    const hals = 3 + Math.floor(r() * 3);
    for (let k = 0; k < hals; k++) {
      const w = r() * Math.PI * 2;
      stroehalm(t, stroh, new Vector3(kopfX + Math.cos(w) * 0.05, neckY + 0.03, Math.sin(w) * 0.05), new Vector3(Math.cos(w) * 0.7, 1, Math.sin(w) * 0.7), 0.07 + r() * 0.05);
    }

    // 4. hat on top of the head (in the straw colour)
    const hutY = kopfY + kopfR * flach * 0.55;
    if (p.hat === "straw") {
      // a drooping brim and a low crown in one closed profile
      t.add(stroh, turned([[0, hutY], [0.24, hutY - 0.012], [0.27, hutY - 0.022], [0.272, hutY - 0.008], [0.13, hutY + 0.012], [0.12, hutY + 0.09], [0.1, hutY + 0.105], [0, hutY + 0.108]], 32, kopfX, 0, 0));
    } else if (p.hat === "pointed") {
      t.add(stroh, turned([[0, hutY], [0.2, hutY - 0.01], [0.222, hutY - 0.004], [0.2, hutY + 0.012], [0.15, hutY + 0.03], [0.06, hutY + 0.2], [0, hutY + 0.3]], 32, kopfX, 0, 0));
    }

    const g = t.group();
    if (p.lean) for (const mesh of g.children) (mesh as Mesh).geometry.rotateZ(rad(p.lean)); // the whole figure tilts, the foot stays on the floor
    return g;
  },
});
