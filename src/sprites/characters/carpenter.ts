import { hex, Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 32;
const SCHUHE = ramp("#4a3428"), AUGE = hex("#201828"), STIFT = ramp("#e8c040");
const BRETT = hex("#b08850"), KANTE = hex("#8a6a40"), HOBEL = SCHUHE.base;

export const carpenter = defineSprite({
  id: "carpenter", category: "characters",
  title: { de: "Zimmermann", en: "Carpenter" },
  description: {
    de: "Ein Zimmermann in Hemd und Segeltuchschürze mit Tasche, Mütze und Bleistift hinter dem Ohr, der ein Brett auf Hüfthöhe hobelt: Statur, Mütze, Schürze, Bleistift, dazu Haut-, Haar-, Hemd-, Schürzen-, Mützen- und Hosenfarbe. 24 × 32 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A carpenter in a shirt and a canvas apron with a pocket, a cap and a pencil behind the ear, who planes a board at waist height: build, cap, apron, pencil, plus skin, hair, shirt, apron, cap and trouser colours. 24 × 32 pixels per frame, feet on the bottom row.",
  },
  params: {
    build: { type: "choice", options: ["slim", "stout"], default: "slim", label: { de: "Statur", en: "Build" },
      labels: { slim: { de: "schlank", en: "slim" }, stout: { de: "kräftig", en: "stout" } },
      describe: { de: "Schlank oder kräftig: ein kräftiger Körper ist zwei Pixel breiter, die Arme sitzen weiter außen.", en: "Slim or stout: a stout body is two pixels wider, the arms sit further out." } },
    cap: { type: "choice", options: ["cap", "none"], default: "cap", label: { de: "Mütze", en: "Cap" },
      labels: { cap: { de: "Schiebermütze", en: "flat cap" }, none: { de: "keine", en: "none" } },
      describe: { de: "Eine flache Stoffmütze, zwei Pixel hoch auf dem Kopf mit einem Schirm nach vorn in der Seitenansicht, oder bloßes Haar.", en: "A flat cloth cap, two pixels high on top of the head with a peak to the front in the side views, or bare hair." } },
    apron: { type: "boolean", default: true, label: { de: "Schürze", en: "Apron" },
      describe: { de: "Eine Segeltuchschürze von der Brust bis zu den Knien mit einer dunkleren Tasche am Bauch; von hinten nur die Schürzenbinde.", en: "A canvas apron from the chest to the knees with a darker pocket at the belly; from behind only its tie." } },
    pencil: { type: "boolean", default: true, label: { de: "Bleistift", en: "Pencil" },
      describe: { de: "Ein gelber Zimmermannsbleistift hinter dem Ohr, in der Seitenansicht über dem Ohr, in der Ansicht von vorn am Rand des Kopfes.", en: "A yellow carpenter's pencil behind the ear, above the ear in the side views, at the edge of the head in the down view." } },
    skin: { type: "color", default: "#c8906a", label: { de: "Haut", en: "Skin" },
      describe: { de: "Hautfarbe von Gesicht, Hals, Armen und Händen, von hell bis dunkel.", en: "Skin colour of face, neck, arms and hands, from light to dark." } },
    hairColour: { type: "color", default: "#6a4a2a", label: { de: "Haarfarbe", en: "Hair colour" },
      describe: { de: "Farbe der Haare, unter der Mütze nur am Hinterkopf zu sehen.", en: "Colour of the hair, under the cap only visible at the back of the head." } },
    shirt: { type: "color", default: "#8a9ab0", label: { de: "Hemd", en: "Shirt" },
      describe: { de: "Farbe von Hemd und Ärmeln.", en: "Colour of the shirt and sleeves." } },
    apronColour: { type: "color", default: "#c8b088", label: { de: "Schürzenfarbe", en: "Apron colour" },
      describe: { de: "Farbe der Segeltuchschürze, hell wie ungefärbtes Segeltuch oder dunkler wie geöltes.", en: "Colour of the canvas apron, light like undyed canvas or darker like oiled canvas." } },
    capColour: { type: "color", default: "#5a5048", label: { de: "Mützenfarbe", en: "Cap colour" },
      describe: { de: "Farbe der Stoffmütze.", en: "Colour of the cloth cap." } },
    trousers: { type: "color", default: "#4a4038", label: { de: "Hose", en: "Trousers" },
      describe: { de: "Farbe der Hose.", en: "Colour of the trousers." } },
  },
  presets: {
    carpenter: { label: { de: "Zimmermann", en: "Carpenter" }, values: { cap: "cap" } },
    joiner: { label: { de: "Tischler", en: "Joiner" }, values: { cap: "none", apronColour: "#7a6a50", build: "stout" } },
    apprentice: { label: { de: "Lehrling", en: "Apprentice" }, values: { apron: false, pencil: false, shirt: "#b0a080" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "plane", frames: 4, fps: 6, loop: true },
  ],
  grounded: true,
  build(p) {
    const haut = ramp(p.skin), haar = ramp(p.hairColour), hemd = ramp(p.shirt), schuerze = ramp(p.apronColour), hose = ramp(p.trousers), muetze = ramp(p.capColour);
    const stout = p.build === "stout";
    const k = stout ? 1 : 0;
    const tragenSchuerze = p.apron, mitMuetze = p.cap === "cap", mitStift = p.pencil;

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", hobeln = animation === "plane";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : hobeln ? 0 : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0, schwung = gehen ? [-1, 0, 1, 0][f] : 0;
      const vor = hobeln ? [0, 1, 2, 1][f] : 0, l = vor === 2 ? 1 : 0;
      const bein = (x: number, r: Ramp) => { b.part(x, 24, 3, 5, r); b.part(x, 29, 4, 2, SCHUHE); };
      bein(10 - schritt, { ...hose, base: hose.dark, light: hose.base });
      bein(11 + schritt, hose);
      b.part(9 - k + l, 16 + hub, 6 + 2 * k, 8, hemd);
      if (tragenSchuerze) b.part(10 - k + l, 16 + hub, 4 + 2 * k, 9, schuerze);
      b.part(9 + l, 6 + hub, 9, 10, haut, true);
      b.set(17 + l, 12 + hub, haut.base);
      b.set(15 + l, 11 + hub, AUGE);
      b.set(11 + l, 11 + hub, haut.dark);
      b.part(9 + l, 8 + hub, 1, 3, haar);
      if (mitMuetze) { b.rect(9 + l, 6 + hub, 9, 2, muetze.base); b.set(18 + l, 7 + hub, muetze.dark); }
      else b.rect(9 + l, 6 + hub, 9, 2, haar.base);
      if (mitStift) b.part(11 + l, 8 + hub, 1, 2, STIFT);
      if (hobeln) {
        b.rect(12 + l, 20, 10, 1, BRETT);
        b.part(11 + l, 16, 2, 3, hemd);
        if (vor > 0) b.rect(13 + l, 18, vor, 2, hemd.dark);
        b.part(13 + vor + l, 18, 1, 2, haut);
        b.rect(14 + vor + l, 18, 3, 2, HOBEL);
      } else {
        b.part(11 + schwung, 16 + hub, 2, 5, hemd); b.part(11 + schwung, 21 + hub, 2, 2, haut);
      }
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", hobeln = animation === "plane", hinten = d === "up";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : hobeln ? 0 : f === 1 ? 1 : 0;
      const links = gehen && f === 0 ? -1 : 0, rechts = gehen && f === 2 ? -1 : 0;
      const zug = hobeln && f === 2 ? 1 : 0;
      const arm = (x: number, vor: number) => { b.part(x, 16 + hub + vor, 2, 5, hemd); b.part(x, 21 + hub + vor, 2, 2, haut); };
      b.part(8, 24 + links, 4, 5, hose); b.part(12, 24 + rechts, 4, 5, hose);
      b.part(8, 29 + links, 4, 2, SCHUHE); b.part(12, 29 + rechts, 4, 2, SCHUHE);
      b.part(7 - k, 16 + hub, 10 + 2 * k, 8, hemd);
      if (tragenSchuerze && !hinten) { b.part(8 - k, 16 + hub, 8 + 2 * k, 9, schuerze); b.rect(10, 20 + hub, 3, 2, schuerze.dark); }
      b.part(7, 6 + hub, 10, 10, haut, true);
      if (!hinten) {
        b.rect(11, 13 + hub, 2, 1, haut.base);
        b.set(9, 11 + hub, AUGE); b.set(14, 11 + hub, AUGE);
      }
      if (mitMuetze) {
        if (hinten) b.rect(7, 8 + hub, 10, 2, haar.base);
        else { b.set(7, 8 + hub, haar.base); b.set(16, 8 + hub, haar.base); }
        b.rect(7, 6 + hub, 10, 2, muetze.base);
      } else if (hinten) { b.rect(8, 6 + hub, 8, 1, haar.base); b.rect(7, 7 + hub, 10, 3, haar.base); }
      else b.rect(7, 6 + hub, 10, 2, haar.base);
      if (mitStift && !hinten) b.part(17, 8 + hub, 1, 2, STIFT);
      if (hinten && tragenSchuerze) { b.rect(8 - k, 20 + hub, 8 + 2 * k, 1, schuerze.dark); b.part(11, 20 + hub, 2, 2, schuerze); }
      if (hobeln && !hinten) {
        b.rect(7, 20 + zug, 10, 1, BRETT); b.rect(7, 21 + zug, 10, 1, KANTE);
        b.part(5 - k, 16, 2, 3, hemd); b.part(17 + k, 16, 2, 3, hemd);
        b.rect(7 - k, 18 + zug, 2 + k, 2, hemd.dark); b.rect(14, 18 + zug, 3 + k, 2, hemd.dark);
        b.part(9, 18 + zug, 1, 2, haut); b.part(13, 18 + zug, 1, 2, haut);
        b.rect(10, 18 + zug, 3, 2, HOBEL);
      } else if (hobeln) {
        b.part(5 - k, 16, 2, 2, hemd); b.part(5 - k + zug, 18, 2, 2, hemd);
        b.part(17 + k, 16, 2, 2, hemd); b.part(17 + k - zug, 18, 2, 2, hemd);
      } else {
        arm(5 - k, gehen && f === 2 ? 1 : 0); arm(17 + k, gehen && f === 0 ? 1 : 0);
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
