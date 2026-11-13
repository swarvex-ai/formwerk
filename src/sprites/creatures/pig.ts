import { rng } from "../../core/rng";
import { Pixels, mixRGBA, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const pig = defineSprite({
  id: "pig", category: "creatures",
  title: { de: "Schwein", en: "Pig" },
  description: {
    de: "Ein Hausschwein im Profil mit Ringelschwanz, das steht, läuft und frisst: Ferkel, Schwein oder Keiler mit Hauern, gefleckt oder einfarbig. 16 × 16 Pixel.",
    en: "A farm pig in profile with a curly tail that stands, walks and eats: piglet, pig or boar with tusks, spotted or plain. 16 × 16 pixels.",
  },
  params: {
    bodyColour: { type: "color", default: "#e8a0a0", label: { de: "Körperfarbe", en: "Body colour" },
      describe: { de: "Farbe der Haut: Rosa #e8a0a0, Wildschwein Braun #6a5040.", en: "Colour of the skin: pink #e8a0a0, wild boar brown #6a5040." } },
    spotColour: { type: "color", default: "#6a4a3a", label: { de: "Fleckenfarbe", en: "Spot colour" },
      describe: { de: "Farbe der Flecken auf der Seite: Braun #6a4a3a, Schwarz #3a3030.", en: "Colour of the spots on the side: brown #6a4a3a, black #3a3030." } },
    spots: { type: "choice", options: ["none", "few", "many"], default: "none", label: { de: "Flecken", en: "Spots" },
      labels: { none: { de: "keine", en: "None" }, few: { de: "wenige", en: "Few" }, many: { de: "viele", en: "Many" } },
      describe: { de: "Anzahl der Flecken von 2 × 2 Pixeln: keine, 2 oder 5; ihre Plätze folgen dem Seed.", en: "Number of 2 × 2 pixel spots: none, 2 or 5; the seed places them." } },
    size: { type: "choice", options: ["piglet", "pig", "boar"], default: "pig", label: { de: "Größe", en: "Size" },
      labels: { piglet: { de: "Ferkel", en: "Piglet" }, pig: { de: "Schwein", en: "Pig" }, boar: { de: "Keiler", en: "Boar" } },
      describe: { de: "Körperlänge 7 Pixel beim Ferkel, 10 beim Schwein, 12 beim Keiler (mit Hauern und Rückenborsten).", en: "Body length 7 pixels for a piglet, 10 for a pig, 12 for a boar (with tusks and back bristles)." } },
    ears: { type: "choice", options: ["up", "floppy"], default: "floppy", label: { de: "Ohren", en: "Ears" },
      labels: { up: { de: "Aufrecht", en: "Up" }, floppy: { de: "Hängend", en: "Floppy" } },
      describe: { de: "Spitze, aufgestellte Ohren wie beim Wildschwein oder Schlappohren, die über den Kopf fallen.", en: "Pointed upright ears like a wild boar's or floppy ears that fall over the head." } },
  },
  presets: {
    pig: { label: { de: "Schwein", en: "Pig" }, values: { size: "pig", bodyColour: "#e8a0a0", spots: "none" } },
    spotted: { label: { de: "Geflecktes Schwein", en: "Spotted pig" }, values: { spots: "many", spotColour: "#4a3024" } },
    piglet: { label: { de: "Ferkel", en: "Piglet" }, values: { size: "piglet" } },
    boar: { label: { de: "Keiler", en: "Boar" }, values: { size: "boar", bodyColour: "#6a5040", ears: "up" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "eat", frames: 3, fps: 4, loop: false },
  ],
  grounded: true,
  build(p, seed) {
    const k = ramp(p.bodyColour), fleck = ramp(p.spotColour).base, tusk = ramp("#f4f0e0").base;
    const rüssel = ramp(mixRGBA(k.base, [150, 60, 80, 255], 0.4));
    const boden = 14, bx = 2;
    const L = { piglet: 7, pig: 10, boar: 12 }[p.size], bh = { piglet: 4, pig: 5, boar: 6 }[p.size];
    const ty = 13 - bh, hx = bx + L - 5, sx = bx + L - 2;
    // Spots: places fixed by the seed, 2 × 2 pixels inside the torso
    const r = rng(seed), n = { none: 0, few: 2, many: 5 }[p.spots];
    const nx = Math.max(1, L - 5), ny = bh - 3;
    const flecken = Array.from({ length: n }, () => [bx + 1 + Math.floor(r() * nx), ty + 1 + Math.floor(r() * ny)]);
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const bob = animation === "walk" && f % 2 ? 1 : 0;
      // Legs: front and back pair alternate; the lifted pair stops one pixel above the ground
      const hinten = p.size === "piglet" ? [bx, bx + 1] : [bx + 1, bx + 2], vorn = p.size === "piglet" ? [bx + 2, bx + 3] : [bx + L - 6, bx + L - 5];
      const hoch = animation === "walk" ? (f === 0 ? vorn : f === 2 ? hinten : []) : [];
      [...hinten, ...vorn].forEach((x) => {
        if (hoch.includes(x)) { b.set(x, boden - 1, k.deep); return; }
        b.set(x, boden - 1, k.dark); b.set(x, boden, k.deep);
      });
      // Torso, spots, bristles of the boar
      b.part(bx, ty + bob, L - 3, bh, k, true);
      flecken.forEach(([x, y]) => b.rect(x, y + bob, 2, 2, fleck));
      if (p.size === "boar") for (let x = bx + 1; x < bx + L - 4; x++) b.set(x, ty + bob, k.deep);
      // Head: raised, lowered or on the ground when eating
      let hy = ty + bob, sy = hy + 1, hh = 3, ear = 0;
      if (animation === "eat") {
        if (f === 0) { hy = ty - 1; sy = hy; } else { hy = Math.min(ty + 2, 11); hh = boden - hy; sy = boden - 1; }
        if (f === 2) ear = 1;
      }
      b.part(hx, hy, 3, hh, k, true);
      b.set(hx + 2, hy + 1, k.deep);
      const ey = hy - 1 + ear;
      if (p.ears === "up") { b.set(hx + 1, ey, k.base); b.set(hx + 1, ey - 1, k.dark); }
      else { b.set(hx + 1, ey, k.dark); b.set(hx + 1, ey + 1, k.deep); }
      // Snout 2 × 2 with nostril, tusks of the boar
      b.rect(sx, sy, 2, 2, rüssel.base);
      b.set(sx + 1, sy, rüssel.dark); b.set(sx, sy + 1, rüssel.dark);
      if (p.size === "boar") { b.set(sx + 1, sy - 1, tusk); b.set(sx + 1, sy - 2, tusk); }
      // Curly tail: flicks up one pixel on idle frame 2
      const ky = ty + 1 + bob - (animation === "idle" && f === 1 ? 1 : 0);
      b.set(bx - 1, ky, k.dark); b.set(bx - 1, ky + 1, k.base);
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
