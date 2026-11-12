import { hex, Pixels, ramp, type Ramp, type RGBA } from "../../core/pixels";
import { defineSprite, type Direction } from "../define";

const W = 24, H = 24, BODEN = 22;

export const skeleton = defineSprite({
  id: "skeleton", category: "creatures",
  title: { de: "Skelett", en: "Skeleton" },
  description: {
    de: "Ein wandelndes Skelett mit leuchtenden Augen: Knochenfarbe, Schädelform, Bewaffnung und Statur frei, in vier Richtungen mit Stehen und Laufen. 24 × 24 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A walking skeleton with glowing eyes: bone colour, skull style, weapon and build as you like, in four directions with idle and walk. 24 × 24 pixels per frame, feet on the bottom row.",
  },
  params: {
    bone: { type: "color", default: "#e8e2cc", label: { de: "Knochen", en: "Bone" },
      describe: { de: "Farbe der Knochen: Elfenbein #e8e2cc, altes Grau #b8b0a0, verbrannt #6a5a4a.", en: "Colour of the bones: ivory #e8e2cc, old grey #b8b0a0, charred #6a5a4a." } },
    weapon: { type: "choice", options: ["none", "sword", "bow"], default: "sword", label: { de: "Waffe", en: "Weapon" },
      labels: { none: { de: "keine", en: "none" }, sword: { de: "Schwert", en: "sword" }, bow: { de: "Bogen", en: "bow" } },
      describe: { de: "Waffe in der rechten Hand: keine, ein Schwert oder ein Bogen.", en: "Weapon in the right hand: none, a sword or a bow." } },
    skull: { type: "choice", options: ["plain", "horned", "crowned"], default: "plain", label: { de: "Schädel", en: "Skull" },
      labels: { plain: { de: "schlicht", en: "plain" }, horned: { de: "gehörnt", en: "horned" }, crowned: { de: "gekrönt", en: "crowned" } },
      describe: { de: "Schädelform: schlicht, mit zwei Hörnern oder mit goldener Krone.", en: "Skull style: plain, with two horns, or with a golden crown." } },
    eyeGlow: { type: "color", default: "#7fe8ff", label: { de: "Augenglühen", en: "Eye glow" },
      describe: { de: "Farbe des Glühens in den Augenhöhlen: Blau #7fe8ff, Grün #8affa0, Rot #ff5a3a.", en: "Colour of the glow in the eye sockets: blue #7fe8ff, green #8affa0, red #ff5a3a." } },
    build: { type: "choice", options: ["slim", "broad"], default: "slim", label: { de: "Statur", en: "Build" },
      labels: { slim: { de: "schlank", en: "slim" }, broad: { de: "breit", en: "broad" } },
      describe: { de: "Schlanker oder breiter Knochenbau: breit ist zwei Pixel mehr an Schultern und Rippen.", en: "Slim or broad bone frame: broad is two pixels wider at the shoulders and ribs." } },
  },
  presets: {
    warrior: { label: { de: "Krieger", en: "Warrior" }, values: { weapon: "sword", skull: "horned", build: "broad", eyeGlow: "#ff6a3a" } },
    archer: { label: { de: "Bogenschütze", en: "Archer" }, values: { weapon: "bow", skull: "plain", build: "slim", eyeGlow: "#8affa0", bone: "#d8d0b0" } },
    bare: { label: { de: "Bloß", en: "Bare" }, values: { weapon: "none", skull: "plain", build: "slim", eyeGlow: "#a8d8ff" } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "walk", frames: 4, fps: 8, loop: true }],
  grounded: true,
  build(p) {
    const k = ramp(p.bone), auge = hex(p.eyeGlow);
    const stahl = ramp("#c2cbd8"), griff = ramp("#6b4a2c"), krone = ramp("#c8a03a"), sehne = hex("#e8e2d0");
    const breit = p.build === "broad" ? 1 : 0;

    const waffe = (b: Pixels, handX: number, handY: number, rich = 1) => {
      const punkt = (dx: number, y: number, c: RGBA) => b.set(handX + rich * dx, y, c);
      const flaeche = (dx: number, y: number, w: number, h: number, c: RGBA) => b.rect(handX + (rich === 1 ? dx : -dx - w + 1), y, w, h, c);
      if (p.weapon === "sword") {
        punkt(1, Math.max(1, handY - 11), stahl.light);
        for (let y = Math.max(1, handY - 10); y <= handY - 2; y++) { punkt(1, y, stahl.light); punkt(2, y, stahl.base); }
        flaeche(0, handY - 1, 4, 1, griff.dark);
        flaeche(1, handY, 2, 2, griff.base);
      } else if (p.weapon === "bow") {
        for (let y = handY - 6; y <= handY + 2; y++) punkt(2, y, sehne);
        for (let t = 0; t <= 8; t++) {
          const y = handY - 6 + t, dx = Math.round(2 * Math.sin((Math.PI * t) / 8));
          punkt(2 + dx, y, griff.base);
          if (dx > 0) punkt(1 + dx, y, griff.dark);
        }
        punkt(4, handY, griff.light);
      }
    };

    const kronen = (b: Pixels, hw: number, oben: number) => {
      b.rect(12 - hw + 1, oben - 1, 2 * hw - 2, 1, krone.base);
      for (const x of [12 - hw + 2, 12, 12 + hw - 2]) { b.set(x, oben - 2, krone.light); b.set(x, oben - 1, krone.light); }
    };

    // One frame facing right; left is its mirror image
    const seitlich = (animation: string, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk";
      const hub = gehen ? (f % 2 === 1 ? 0 : 1) : f === 1 ? 1 : 0;
      const schritt = gehen ? [2, 0, -2, 0][f] : 0;
      const top = p.skull === "crowned" ? 3 : 2, oben = top + hub;
      const brust = oben + 7, handY = brust + 5;
      const skw = 7 + breit, x0 = 9, handX = x0 + skw;
      // legs: the far one darker and behind, the near one steps forward
      const bein = (x: number, r: Ramp, vor: number) => {
        b.part(x + vor, 17, 2, 6, r);
        b.rect(x + vor - 1, BODEN, 4, 1, r.base);
      };
      bein(10, { ...k, base: k.dark, light: k.base }, -schritt);
      bein(12, k, schritt);
      // spine, ribs and pelvis
      b.rect(11, brust, 2, 16 - brust + 1, k.base);
      for (let i = 0; i < 3; i++) b.rect(x0 - 1, brust + i * 2, skw - 1, 1, k.dark);
      b.rect(10, 16, 4, 1, k.base);
      // near arm reaching forward to the weapon
      b.rect(12, brust, 2, 4, k.base);
      b.rect(13, brust + 3, handX - 13 + 1, 2, k.base);
      b.set(handX, handY, k.light);
      waffe(b, handX, handY);
      // skull, socket and jaw
      b.part(x0, oben, skw, 6, k, true);
      b.rect(x0 + skw - 1, oben + 4, 3, 2, k.base);
      b.rect(x0 + skw - 3, oben + 2, 2, 2, k.deep);
      b.set(x0 + skw - 2, oben + 3, auge);
      b.set(x0 + skw + 1, oben + 2, k.dark);
      b.rect(x0 + skw - 2, oben + 5, 3, 1, k.dark);
      b.rect(12, oben + 6, 2, 1, k.base);
      if (p.skull === "crowned") {
        b.rect(x0 + 1, oben - 1, skw - 2, 1, krone.base);
        for (const x of [x0 + 1, x0 + 4, x0 + skw - 2]) { b.set(x, oben - 2, krone.light); b.set(x, oben - 1, krone.light); }
      } else if (p.skull === "horned") {
        b.set(x0 + 2, oben, k.base); b.set(x0 + 1, oben - 1, k.dark);
        b.set(x0 + skw - 2, oben, k.base); b.set(x0 + skw - 1, oben - 1, k.dark);
      }
      return b;
    };

    const frontal = (animation: string, d: Direction, f: number) => {
      const b = new Pixels(W, H), gehen = animation === "walk", hinten = d === "up";
      const hub = gehen ? (f % 2 === 1 ? 0 : 1) : f === 1 ? 1 : 0;
      const top = p.skull === "crowned" ? 3 : 2, oben = top + hub;
      const hw = 4 + breit, brust = oben + 7, legW = 2 + breit;
      // walking towards or away: one leg lifted while the arm on the other side swings
      const links = gehen && (hinten ? f === 2 : f === 0) ? -1 : 0;
      const rechts = gehen && (hinten ? f === 0 : f === 2) ? -1 : 0;
      const bein = (x: number, lift: number) => {
        b.part(x, 17 + lift, legW, 6, k);
        b.rect(x - 1, BODEN + lift, legW + 2, 1, k.base);
      };
      bein(9 - breit, links); bein(13, rechts);
      b.rect(9 - breit, 16, 4 + 2 * breit, 1, k.base);
      // spine and ribs
      b.rect(11, brust, 2, 16 - brust + 1, k.base);
      for (let i = 0; i < 3; i++) {
        const y = brust + i * 2;
        b.rect(12 - hw + 1, y, 2 * hw - 2, 1, k.base);
        b.set(12 - hw + 1, y, k.dark); b.set(12 + hw - 2, y, k.dark);
      }
      // arms: from the front the weapon arm is on screen right, from behind on the left; the swing stays on its side
      const leerArm = gehen && f === 2 ? 1 : 0, waffenArm = gehen && f === 0 ? 1 : 0;
      if (hinten) {
        b.part(12 - hw - 2, brust + waffenArm, 2, 6, k);
        const handX = 12 - hw - 2, handY = brust + waffenArm + 5;
        b.set(handX, handY, k.light);
        waffe(b, handX, handY, -1);
        b.part(12 + hw, brust + leerArm, 2, 6, k);
        b.set(12 + hw, brust + 5 + leerArm, k.light);
      } else {
        b.part(12 - hw - 2, brust + leerArm, 2, 6, k);
        b.set(11 - hw, brust + 5 + leerArm, k.light);
        b.part(12 + hw, brust + waffenArm, 2, 6, k);
        const handX = 12 + hw + 1, handY = brust + waffenArm + 5;
        b.set(handX, handY, k.light);
        waffe(b, handX, handY);
      }
      // skull: sockets and glow in front, a seam from behind
      b.part(12 - hw, oben, 2 * hw, 6, k, true);
      b.rect(11 - breit, oben + 6, 4 + 2 * breit, 1, k.base);
      if (hinten) b.rect(11, oben + 1, 2, 4, k.dark);
      else {
        const socket = (cx: number) => { b.rect(cx, oben + 2, 2, 2, k.deep); b.set(cx, oben + 3, auge); };
        socket(12 - hw + 1); socket(12 + hw - 3);
        b.rect(11, oben + 4, 2, 1, k.dark);
      }
      if (p.skull === "crowned") kronen(b, hw, oben);
      else if (p.skull === "horned") {
        b.set(12 - hw, oben + 1, k.base); b.set(12 - hw - 1, oben, k.light); b.set(12 - hw - 2, oben - 1, k.light);
        b.set(12 + hw - 1, oben + 1, k.base); b.set(12 + hw, oben, k.light); b.set(12 + hw + 1, oben - 1, k.light);
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
