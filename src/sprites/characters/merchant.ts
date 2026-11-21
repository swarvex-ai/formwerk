import { hex, Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 32;
const SCHUHE = ramp("#4a3428"), AUGE = hex("#201828");

export const merchant = defineSprite({
  id: "merchant", category: "characters",
  title: { de: "Markthändler", en: "Merchant" },
  description: {
    de: "Ein Marktträger als Pixelsprite, der hinter seinem Stand ruft: Statur, Hut, Bart, Schürze und Geldbeutel, dazu Haut-, Haar-, Mantel-, Schürzen- und Hosenfarbe. 24 × 32 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A market trader as a pixel sprite who calls out behind his stall: build, hat, beard, apron and coin purse, plus skin, hair, coat, apron and trouser colours. 24 × 32 pixels per frame, feet on the bottom row.",
  },
  params: {
    build: { type: "choice", options: ["slim", "stout"], default: "stout", label: { de: "Statur", en: "Build" },
      labels: { slim: { de: "schlank", en: "slim" }, stout: { de: "kräftig", en: "stout" } },
      describe: { de: "Schlank oder kräftig: ein kräftiger Körper ist zwei Pixel breiter, die Arme sitzen weiter außen.", en: "Slim or stout: a stout body is two pixels wider, the arms sit further out." } },
    hat: { type: "choice", options: ["none", "cap", "brimmed"], default: "brimmed", label: { de: "Hut", en: "Hat" },
      labels: { none: { de: "keiner", en: "none" }, cap: { de: "Mütze", en: "cap" }, brimmed: { de: "Krempenhut", en: "brimmed" } },
      describe: { de: "Kein Hut, eine Mütze in der Hosenfarbe oder ein Krempenhut, der zwei Pixel über den Kopf hinausragt.", en: "No hat, a cap in the trouser colour, or a brimmed hat that sticks out two pixels beyond the head on each side." } },
    beard: { type: "choice", options: ["none", "short", "full"], default: "short", label: { de: "Bart", en: "Beard" },
      labels: { none: { de: "keiner", en: "none" }, short: { de: "kurz", en: "short" }, full: { de: "voll", en: "full" } },
      describe: { de: "Kein Bart, ein kurzer Bart am Kinn oder ein voller Bart an Wangen und Kinn bis zum Kragen, in der Haarfarbe.", en: "No beard, a short beard on the chin only, or a full beard on cheeks and chin down to the collar, in the hair colour." } },
    apron: { type: "boolean", default: true, label: { de: "Schürze", en: "Apron" },
      describe: { de: "Eine Schürze über der Vorderseite des Körpers, von der Brust bis knapp über die Füße.", en: "An apron over the front of the body, from the chest to just above the feet." } },
    purse: { type: "boolean", default: true, label: { de: "Geldbeutel", en: "Purse" },
      describe: { de: "Ein drei mal drei Pixel großer Geldbeutel am Gürtel auf der rechten Hüfte, goldbraun.", en: "A three by three pixel coin purse on the belt at the right hip, gold-brown." } },
    skin: { type: "color", default: "#e0ac83", label: { de: "Haut", en: "Skin" },
      describe: { de: "Hautfarbe, von hell bis dunkel.", en: "Skin colour, from light to dark." } },
    hairColour: { type: "color", default: "#4a3020", label: { de: "Haarfarbe", en: "Hair colour" },
      describe: { de: "Farbe von Bart und Haaren.", en: "Colour of the beard and hair." } },
    coat: { type: "color", default: "#7a3a2a", label: { de: "Mantel", en: "Coat" },
      describe: { de: "Farbe von Mantel und Ärmeln (und dem Hut).", en: "Colour of the coat and sleeves (and the hat)." } },
    apronColour: { type: "color", default: "#d8ccb0", label: { de: "Schürzenfarbe", en: "Apron colour" },
      describe: { de: "Farbe der Schürze.", en: "Colour of the apron." } },
    trousers: { type: "color", default: "#4b4f6b", label: { de: "Hose", en: "Trousers" },
      describe: { de: "Farbe der Hose.", en: "Colour of the trousers." } },
  },
  presets: {
    trader: { label: { de: "Händler", en: "Trader" }, values: { build: "stout", hat: "brimmed", beard: "short", apron: true, purse: true } },
    "spice-seller": { label: { de: "Gewürzhändler", en: "Spice seller" }, values: { build: "slim", hat: "cap", beard: "full", coat: "#3a5a7a" } },
    baker: { label: { de: "Bäcker", en: "Baker" }, values: { hat: "none", beard: "none", apronColour: "#f0ece0", coat: "#c8b890" } },
    fishmonger: { label: { de: "Fischhändler", en: "Fishmonger" }, values: { apronColour: "#5a6a6a", purse: false } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "walk", frames: 4, fps: 8, loop: true }, { name: "call", frames: 3, fps: 4, loop: false }],
  grounded: true,
  build(p) {
    const haut = ramp(p.skin), haar = ramp(p.hairColour), rock = ramp(p.coat), schuerze = ramp(p.apronColour), hose = ramp(p.trousers);
    const stout = p.build === "stout";
    const k = stout ? 1 : 0;
    const hat = p.hat, bart = p.beard, tragenSchuerze = p.apron, tragenGeldbeutel = p.purse;
    const geld = ramp("#a07a2a");
    const huelle = rock;

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0, schwung = gehen ? [-1, 0, 1, 0][f] : 0;
      const bein = (x: number, r: Ramp) => { b.part(x, 24, 3, 5, r); b.part(x, 29, 4, 2, SCHUHE); };
      bein(10 - schritt, { ...hose, base: hose.dark, light: hose.base });
      bein(11 + schritt, hose);
      b.part(9 - k, 16 + hub, 6 + 2 * k, 8, rock);
      if (tragenSchuerze) b.part(10 - k, 16 + hub, 4 + 2 * k, 12, schuerze);
      b.part(9, 6 + hub, 9, 10, haut, true);
      b.set(17, 12 + hub, haut.base);
      b.set(15, 11 + hub, AUGE);
      if (hat === "cap") b.part(9, 5 + hub, 9, 3, huelle, true);
      else if (hat === "brimmed") { b.part(9, 4 + hub, 9, 4, huelle); b.rect(7, 8 + hub, 13, 2, huelle.dark); }
      if (bart === "short") b.part(17, 15 + hub, 1, 1, haar);
      else if (bart === "full") { b.part(16, 14 + hub, 1, 2, haar); b.part(17, 15 + hub, 1, 2, haar); }
      if (animation === "call" && f === 1) { b.part(11 + schwung, 11 + hub, 2, 4, rock); b.part(11 + schwung, 15 + hub, 2, 2, haut); }
      else { b.part(11 + schwung, 16 + hub, 2, 5, rock); b.part(11 + schwung, 21 + hub, 2, 2, haut); }
      if (tragenGeldbeutel) b.part(15 + k, 24, 3, 3, geld);
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", hinten = d === "up";
      const hub = gehen ? (f % 2 === 1 ? -1 : 0) : f === 1 ? 1 : 0;
      const links = gehen && f === 0 ? -1 : 0, rechts = gehen && f === 2 ? -1 : 0;
      b.part(8, 24 + links, 4, 5, hose); b.part(12, 24 + rechts, 4, 5, hose);
      b.part(8, 29 + links, 4, 2, SCHUHE); b.part(12, 29 + rechts, 4, 2, SCHUHE);
      b.part(7 - k, 16 + hub, 10 + 2 * k, 8, rock);
      if (tragenSchuerze && !hinten) b.part(8 - k, 16 + hub, 8 + 2 * k, 12, schuerze);
      if (tragenGeldbeutel && !hinten) b.part(4, 23 + hub, 3, 3, geld);
      const arm = (x: number, vor: number) => { b.part(x, 16 + hub + vor, 2, 5, rock); b.part(x, 21 + hub + vor, 2, 2, haut); };
      const armUp = (x: number) => { b.part(x, 11 + hub, 2, 4, rock); b.part(x, 15 + hub, 2, 2, haut); };
      if (animation === "call" && f === 1) {
        if (hinten) { armUp(17 + k); arm(5 - k, 0); }
        else { armUp(5 - k); arm(17 + k, 0); }
      } else {
        arm(5 - k, gehen && f === 2 ? 1 : 0); arm(17 + k, gehen && f === 0 ? 1 : 0);
      }
      b.part(7, 6 + hub, 10, 10, haut, true);
      if (!hinten) {
        b.rect(11, 13 + hub, 2, 1, haut.base);
        b.set(9, 11 + hub, AUGE); b.set(14, 11 + hub, AUGE);
        if (animation === "call" && f === 1) b.set(12, 14 + hub, AUGE);
      }
      if (hat === "cap") {
        if (hinten) b.part(6, 5 + hub, 12, 4, huelle, true);
        else { b.part(6, 5 + hub, 12, 3, huelle, true); b.rect(7, 8 + hub, 10, 1, huelle.dark); }
      } else if (hat === "brimmed") {
        if (hinten) b.part(6, 5 + hub, 12, 4, huelle, true);
        else { b.part(6, 5 + hub, 12, 4, huelle); b.rect(5, 8 + hub, 14, 2, huelle.dark); }
      }
      if (!hinten) {
        if (bart === "short") b.part(11, 15 + hub, 2, 1, haar);
        else if (bart === "full") { b.part(10, 14 + hub, 1, 2, haar); b.part(13, 14 + hub, 1, 2, haar); b.part(11, 15 + hub, 2, 2, haar); }
      } else {
        if (hat === "none") b.part(7, 6 + hub, 10, 4, haar, true);
        if (tragenSchuerze) b.part(11, 15 + hub, 2, 2, schuerze);
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
