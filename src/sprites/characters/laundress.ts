import { hex, Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 32;
const SCHUHE = ramp("#4a3428"), AUGE = hex("#201828"), HAUBE = ramp("#f2eee6");

export const laundress = defineSprite({
  id: "laundress", category: "characters",
  title: { de: "Wäscherin", en: "Laundress" },
  description: {
    de: "Eine Wäscherin im langen Kleid mit Schürze und Kopfbedeckung, die vor sich Wäsche auf dem Waschbrett schrubbt: Statur, Kopfbedeckung, Ärmel und Schürze, dazu Haut-, Haar-, Kleid-, Schürzen- und Tuchfarbe. 24 × 32 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A laundress in a long dress with an apron and a head covering who scrubs laundry on a washboard in front of her: build, head covering, sleeves and apron, plus skin, hair, dress, apron and covering colours. 24 × 32 pixels per frame, feet on the bottom row.",
  },
  params: {
    build: { type: "choice", options: ["slim", "stout"], default: "stout", label: { de: "Statur", en: "Build" },
      labels: { slim: { de: "schlank", en: "slim" }, stout: { de: "kräftig", en: "stout" } },
      describe: { de: "Schlank oder kräftig: ein kräftiger Körper ist zwei Pixel breiter, Rock und Arme sitzen weiter außen.", en: "Slim or stout: a stout body is two pixels wider, the skirt and arms sit further out." } },
    cover: { type: "choice", options: ["kerchief", "bonnet", "none"], default: "kerchief", label: { de: "Kopfbedeckung", en: "Head covering" },
      labels: { kerchief: { de: "Kopftuch", en: "kerchief" }, bonnet: { de: "Haube", en: "bonnet" }, none: { de: "keine", en: "none" } },
      describe: { de: "Ein am Hinterkopf geknotetes Kopftuch, das das Haar ganz verdeckt, eine weiße Haube mit einem Pixel Krempe um das Gesicht oder offenes Haar mit einem Dutt von 3 × 3 Pixeln am Hinterkopf.", en: "A headscarf tied at the back of the head that hides the hair, a white bonnet with a one-pixel brim around the face, or bare hair with a 3 × 3 pixel bun at the back of the head." } },
    sleeves: { type: "choice", options: ["rolled", "long"], default: "rolled", label: { de: "Ärmel", en: "Sleeves" },
      labels: { rolled: { de: "hochgekrempelt", en: "rolled" }, long: { de: "lang", en: "long" } },
      describe: { de: "Bis zum Ellbogen hochgekrempelt (nackte Unterarme, ein heller Pixel Umschlag am Ellbogen) oder lang bis zum Handgelenk.", en: "Rolled up to the elbow (bare forearms, a one-pixel light roll at the elbow) or long down to the wrist." } },
    apron: { type: "boolean", default: true, label: { de: "Schürze", en: "Apron" },
      describe: { de: "Eine Schürze vorn über dem Rock, von der Taille bis zwei Pixel über dem Saum; von hinten nur die Schürzenbinde.", en: "An apron over the front of the skirt, from the waist to two pixels above the hem; from behind only its tie." } },
    skin: { type: "color", default: "#c8906a", label: { de: "Haut", en: "Skin" },
      describe: { de: "Hautfarbe von Gesicht, Hals, Armen und Händen, von hell bis dunkel.", en: "Skin colour of face, neck, arms and hands, from light to dark." } },
    hairColour: { type: "color", default: "#5a3a24", label: { de: "Haarfarbe", en: "Hair colour" },
      describe: { de: "Farbe der Haare, sichtbar ohne Kopfbedeckung und unter der Haube.", en: "Colour of the hair, seen without a covering and under the bonnet." } },
    dress: { type: "color", default: "#4a5a78", label: { de: "Kleid", en: "Dress" },
      describe: { de: "Farbe des langen Kleides aus Leinen oder Wolle, Mieder, Ärmel und Rock.", en: "Colour of the long linen or wool dress: bodice, sleeves and skirt." } },
    apronColour: { type: "color", default: "#e4ddd0", label: { de: "Schürzenfarbe", en: "Apron colour" },
      describe: { de: "Farbe der Schürze, meist ungebleichte oder weiße Baumwolle.", en: "Colour of the apron, usually unbleached or white cotton." } },
    coverColour: { type: "color", default: "#a8483a", label: { de: "Tuchfarbe", en: "Covering colour" },
      describe: { de: "Farbe des Kopftuchs (die Haube bleibt weiß).", en: "Colour of the kerchief (the bonnet stays white)." } },
  },
  presets: {
    washerwoman: { label: { de: "Waschfrau", en: "Washerwoman" }, values: { cover: "kerchief" } },
    maid: { label: { de: "Magd", en: "Maid" }, values: { build: "slim", cover: "bonnet", sleeves: "long", dress: "#3a3a44" } },
    "farm-wife": { label: { de: "Bäuerin", en: "Farm wife" }, values: { cover: "none", dress: "#7a5a3a", apronColour: "#c8b48a" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "scrub", frames: 4, fps: 6, loop: true },
  ],
  grounded: true,
  build(p) {
    const haut = ramp(p.skin), haar = ramp(p.hairColour), kleid = ramp(p.dress), schuerze = ramp(p.apronColour), tuch = ramp(p.coverColour);
    const k = p.build === "stout" ? 1 : 0;
    const kopf = p.cover, gekrempelt = p.sleeves === "rolled", tragenSchuerze = p.apron;

    // The skirt: a trapezoid from the waist (row 17) to the hem (row 28), two pixels wider on each side at the hem;
    // the hem rows shift with the step. Returns the edges per row for the apron.
    const rock = (b: Pixels, x0: number, x1: number, saum: number) => {
      const kanten: [number, number][] = [];
      for (let y = 17; y <= 28; y++) {
        const weit = Math.min(2, Math.floor((y - 17) / 4)), s = y >= 25 ? saum : 0, l = x0 - weit + s, r = x1 + weit + s;
        for (let x = l; x <= r; x++) b.set(x, y, y === 28 || x === r ? kleid.dark : x === l ? kleid.light : kleid.base);
        kanten.push([l, r]);
      }
      return kanten;
    };
    const bodenSchuhe = (b: Pixels, a: number, c: number) => { b.part(a, 29, 4, 2, SCHUHE); b.part(c, 29, 4, 2, SCHUHE); };
    // A hanging arm: upper arm, roll or sleeve at the elbow, forearm, hand
    const arm = (b: Pixels, x: number, y: number) => {
      if (gekrempelt) { b.part(x, y, 2, 3, kleid); b.rect(x, y + 3, 2, 1, kleid.light); b.part(x, y + 4, 2, 3, haut); }
      else { b.part(x, y, 2, 5, kleid); b.part(x, y + 5, 2, 2, haut); }
    };

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", schrubbt = animation === "scrub";
      const bob = gehen ? (f % 2 === 1 ? -1 : 0) : schrubbt ? 0 : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0, schwung = gehen ? [-1, 0, 1, 0][f] : 0, v = schrubbt ? 1 : 0;
      bodenSchuhe(b, 10 - schritt, 11 + schritt);
      const kanten = rock(b, 9 - k, 14 + k, schwung);
      b.part(9 - k + v, 16 + bob, 6 + 2 * k, 3, kleid);
      if (tragenSchuerze) {
        kanten.slice(0, 10).forEach(([, r], j) => { b.set(r - 1, 17 + j, schuerze.base); b.set(r, 17 + j, schuerze.dark); });
        b.rect(9 - k + v, 17, 5 + 2 * k, 1, schuerze.light);
      }
      b.part(9 + v, 7 + bob, 9, 9, haut, true);
      b.set(17 + v, 12 + bob, haut.base);
      b.set(15 + v, 11 + bob, AUGE);
      if (kopf === "kerchief") {
        b.part(8 + v, 5 + bob, 10, 4, tuch, true); b.rect(8 + v, 9 + bob, 3, 4, tuch.base); b.rect(10 + v, 9 + bob, 1, 4, tuch.dark);
        b.rect(7 + v, 12 + bob, 1, 2, tuch.dark);
      } else if (kopf === "bonnet") {
        b.rect(11 + v, 9 + bob, 6, 1, haar.base);
        b.part(8 + v, 4 + bob, 10, 5, HAUBE, true); b.rect(8 + v, 9 + bob, 3, 5, HAUBE.base); b.rect(10 + v, 9 + bob, 1, 5, HAUBE.dark);
        b.rect(17 + v, 5 + bob, 1, 5, HAUBE.light);
      } else {
        b.part(9 + v, 7 + bob, 9, 2, haar); b.rect(9 + v, 9 + bob, 3, 3, haar.base);
        b.part(6 + v, 8 + bob, 3, 3, haar);
      }
      if (schrubbt) {
        // Forearm reaching forward at waist height, hand 2 × 2 in front of the body: high in frames 0–1, low in 2–3
        const y = f < 2 ? 18 : 20, ax = 11 + v;
        b.part(ax, 16, 2, y - 16, kleid); b.part(ax, y, 2, 2, kleid);
        b.rect(ax + 2, y, 1, 2, gekrempelt ? kleid.light : kleid.base);
        b.part(ax + 3, y, 3, 2, gekrempelt ? haut : kleid);
        b.part(ax + 6, y, 2, 2, haut);
      } else arm(b, 11 + schwung, 16 + bob);
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", schrubbt = animation === "scrub", hinten = d === "up";
      const bob = gehen ? (f % 2 === 1 ? -1 : 0) : schrubbt ? 0 : f === 1 ? 1 : 0;
      bodenSchuhe(b, 8, 12);
      const kanten = rock(b, 7 - k, 16 + k, gehen ? [-1, 0, 1, 0][f] : 0);
      b.part(7 - k, 16 + bob, 10 + 2 * k, 3, kleid);
      if (tragenSchuerze && !hinten) kanten.slice(0, 10).forEach(([l, r], j) => {
        for (let x = l + 2; x <= r - 2; x++) b.set(x, 17 + j, j === 9 || x === r - 2 ? schuerze.dark : j === 0 || x === l + 2 ? schuerze.light : schuerze.base);
      });
      if (tragenSchuerze && hinten) { b.rect(7 - k, 17, 10 + 2 * k, 1, schuerze.base); b.part(11, 17, 2, 2, schuerze); }
      b.part(7, 7 + bob, 10, 9, haut, true);
      if (!hinten) {
        b.rect(11, 13 + bob, 2, 1, haut.base);
        b.set(9, 11 + bob, AUGE); b.set(14, 11 + bob, AUGE);
      }
      if (kopf === "kerchief") {
        if (hinten) { b.part(6, 5 + bob, 12, 9, tuch, true); b.part(11, 13 + bob, 2, 2, { ...tuch, base: tuch.dark }); }
        else { b.part(6, 5 + bob, 12, 5, tuch, true); b.rect(6, 10 + bob, 1, 3, tuch.base); b.rect(17, 10 + bob, 1, 3, tuch.dark); }
      } else if (kopf === "bonnet") {
        if (hinten) b.part(6, 4 + bob, 12, 10, HAUBE, true);
        else {
          b.rect(8, 9 + bob, 8, 1, haar.base);
          b.part(6, 4 + bob, 12, 4, HAUBE, true); b.rect(6, 8 + bob, 12, 1, HAUBE.light);
          b.rect(6, 9 + bob, 1, 4, HAUBE.light); b.rect(17, 9 + bob, 1, 4, HAUBE.light);
        }
      } else if (hinten) {
        b.part(7, 7 + bob, 10, 6, haar, true);
        b.rect(10, 11 + bob, 3, 3, haar.dark); b.set(11, 12 + bob, haar.light);
      } else {
        b.part(10, 5 + bob, 3, 2, haar);
        b.part(7, 7 + bob, 10, 2, haar); b.rect(7, 9 + bob, 1, 2, haar.base); b.rect(16, 9 + bob, 1, 2, haar.dark);
      }
      if (schrubbt) {
        const y = f < 2 ? 19 : 21;
        b.part(5 - k, 16, 2, y - 16, kleid); b.part(17 + k, 16, 2, y - 16, kleid);
        if (hinten) {
          // Elbows stick out one pixel on both sides; the hands are hidden in front of her
          b.rect(4 - k, y - 2, 1, 2, kleid.dark); b.rect(19 + k, y - 2, 1, 2, kleid.dark);
        } else {
          // Forearms bent inwards, both hands in front of the apron at waist height
          const unter: Ramp = gekrempelt ? haut : kleid, rolle = gekrempelt ? kleid.light : kleid.base;
          b.part(5 - k, y, 2, 2, kleid); b.rect(7 - k, y, 1, 2, rolle); b.part(8 - k, y, 1 + k, 2, unter); b.part(9, y, 2, 2, haut);
          b.part(17 + k, y, 2, 2, kleid); b.rect(16 + k, y, 1, 2, rolle); b.part(15, y, 1 + k, 2, unter); b.part(13, y, 2, 2, haut);
        }
      } else {
        arm(b, 5 - k, 16 + bob + (gehen && f === 2 ? 1 : 0)); arm(b, 17 + k, 16 + bob + (gehen && f === 0 ? 1 : 0));
      }
      return b;
    };

    return (animation, d, f) => {
      if (d === "right") return seitlich(animation, f);
      if (d === "left") return seitlich(animation, f).mirrored();
      return frontal(animation, d, f);
    };
  },
});
