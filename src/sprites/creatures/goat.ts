import { rng } from "../../core/rng";
import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const goat = defineSprite({
  id: "goat", category: "creatures",
  title: { de: "Ziege", en: "Goat" },
  description: {
    de: "Eine Hausziege im Profil mit dünnen Beinen und Stummelschwanz, die steht, läuft und grast: Zicklein, Ziege oder Bock mit langen Hörnern und Bart, einfarbig, gescheckt oder mit Sattel. 16 × 16 Pixel.",
    en: "A domestic goat in profile with thin legs and a short upturned tail that stands, walks and grazes: kid, goat or billy with long horns and a beard, plain, patched or with a saddle. 16 × 16 pixels.",
  },
  params: {
    size: { type: "choice", options: ["kid", "goat", "billy"], default: "goat", label: { de: "Größe", en: "Size" },
      labels: { kid: { de: "Zicklein", en: "Kid" }, goat: { de: "Ziege", en: "Goat" }, billy: { de: "Bock", en: "Billy" } },
      describe: { de: "Körperlänge 6 Pixel beim Zicklein (ohne Hörner und Bart), 9 bei der Ziege, 11 beim Bock (mit Bart unter dem Kinn).", en: "Body length 6 pixels for a kid (no horns, no beard), 9 for a goat, 11 for a billy (with a beard under the chin)." } },
    horns: { type: "choice", options: ["none", "short", "long"], default: "short", label: { de: "Hörner", en: "Horns" },
      labels: { none: { de: "keine", en: "None" }, short: { de: "kurz", en: "Short" }, long: { de: "lang", en: "Long" } },
      describe: { de: "Keine Hörner, kurze Hörner wie bei der Ziege oder lange, nach hinten gebogene wie beim Bock; das Zicklein bleibt immer ohne.", en: "No horns, short horns as on a goat or long ones curving back as on a billy; the kid always stays without." } },
    coat: { type: "choice", options: ["plain", "patched", "saddle"], default: "plain", label: { de: "Fell", en: "Coat" },
      labels: { plain: { de: "Einfarbig", en: "Plain" }, patched: { de: "Gescheckt", en: "Patched" }, saddle: { de: "Sattel", en: "Saddle" } },
      describe: { de: "Einfarbig, 2 bis 3 Flecken in der Fleckenfarbe (ihre Plätze folgen dem Seed) oder ein Band in der Fleckenfarbe über dem Rücken.", en: "One colour, 2 to 3 patches in the patch colour (the seed places them) or a band in the patch colour over the back." } },
    bodyColour: { type: "color", default: "#e8e2d4", label: { de: "Körperfarbe", en: "Body colour" },
      describe: { de: "Farbe des Fells: Weiß #e8e2d4, Braun #8a5a36, Schwarz #3a3430.", en: "Colour of the coat: white #e8e2d4, brown #8a5a36, black #3a3430." } },
    patchColour: { type: "color", default: "#6a4a30", label: { de: "Fleckenfarbe", en: "Patch colour" },
      describe: { de: "Farbe der Flecken oder des Sattels: Braun #6a4a30, Schwarz #3a3430.", en: "Colour of the patches or the saddle: brown #6a4a30, black #3a3430." } },
  },
  presets: {
    "white-goat": { label: { de: "Weiße Ziege", en: "White goat" }, values: { size: "goat", bodyColour: "#e8e2d4" } },
    kid: { label: { de: "Zicklein", en: "Kid" }, values: { size: "kid" } },
    billy: { label: { de: "Bock", en: "Billy" }, values: { size: "billy", horns: "long", bodyColour: "#8a7a66" } },
    patched: { label: { de: "Gescheckte Ziege", en: "Patched goat" }, values: { coat: "patched", bodyColour: "#e8e2d4", patchColour: "#3a3430" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "graze", frames: 3, fps: 4, loop: false },
  ],
  grounded: true,
  build(p, seed) {
    const k = ramp(p.bodyColour), fleck = ramp(p.patchColour), horn = ramp("#a89878");
    const boden = 14;
    const L = { kid: 6, goat: 9, billy: 11 }[p.size], bh = { kid: 3, goat: 3, billy: 4 }[p.size];
    const bx = { kid: 3, goat: 2, billy: 1 }[p.size], ty = p.size === "kid" ? 8 : 7, e = bx + L - 1;
    const hörner = p.size === "kid" ? "none" : p.horns;
    // Patches: places fixed by the seed, 2 × 2 pixels inside the torso
    const r = rng(seed), n = p.coat === "patched" ? 2 + Math.floor(r() * 2) : 0;
    const flecken = Array.from({ length: n }, () => [bx + 1 + Math.floor(r() * (L - 3)), ty + Math.floor(r() * (bh - 1))]);
    // Narrow head: light top row with the eye, muzzle row with a dark nose, the ear sticking out behind; horns and beard on it
    const kopf = (b: Pixels, hx: number, hy: number) => {
      b.rect(hx, hy, 3, 1, k.light);
      b.rect(hx, hy + 1, 3, 1, k.base);
      b.set(hx + 1, hy, k.deep);
      b.set(hx + 3, hy + 1, k.deep);
      b.set(hx - 1, hy, k.dark); b.set(hx - 2, hy, k.deep);
      if (hörner === "short") { b.set(hx, hy - 1, horn.base); b.set(hx - 1, hy - 2, horn.light); }
      if (hörner === "long") { b.set(hx, hy - 1, horn.base); b.set(hx - 1, hy - 2, horn.light); b.set(hx - 2, hy - 2, horn.base); b.set(hx - 3, hy - 1, horn.dark); }
      if (p.size === "billy") for (const y of [hy + 2, hy + 3]) if (y <= boden) b.set(hx + 2, y, k.dark);
    };
    // Neck as a 2-pixel staircase from (x0, y0) to (x1, y1), each row joined to the one above
    const hals = (b: Pixels, x0: number, y0: number, x1: number, y1: number) => {
      let vor = x0 - 1;
      for (let y = y0; y <= y1; y++) {
        const x = Math.round(x0 + ((x1 - x0) * (y - y0)) / Math.max(1, y1 - y0));
        for (let i = Math.min(x, vor + 1); i <= x + 1; i++) b.set(i, y, i === x + 1 && y > y0 ? k.dark : k.base);
        vor = x;
      }
    };
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const bob = animation === "walk" && f % 2 ? 1 : 0, oben = ty + bob;
      // Thin legs in pairs, near leg base and far leg dark; front and back pair alternate, the lifted pair stops one pixel above the ground
      const hinten = p.size === "kid" ? [bx, bx + 1] : [bx + 1, bx + 2], vorn = p.size === "kid" ? [bx + L - 2, bx + L - 1] : [bx + L - 3, bx + L - 2];
      const hoch = animation === "walk" ? (f === 0 ? vorn : f === 2 ? hinten : []) : [];
      for (const [x, fern] of [[hinten[0], true], [hinten[1], false], [vorn[0], true], [vorn[1], false]] as const) {
        const fuss = hoch.includes(x) ? boden - 1 : boden;
        b.rect(x, oben + bh, 1, fuss - oben - bh, fern ? k.dark : k.base);
        b.set(x, fuss, k.deep);
      }
      // Slim torso, patches or saddle
      b.part(bx, oben, L, bh, k, true);
      flecken.forEach(([x, y]) => b.rect(x, y + bob, 2, 2, fleck.base));
      if (p.coat === "saddle") { b.rect(bx + 2, oben, L - 4, 1, fleck.light); b.rect(bx + 2, oben + 1, L - 4, 1, fleck.base); }
      // Short upturned tail: the tip flicks up on idle frame 2
      const flick = animation === "idle" && f === 1 ? 1 : 0;
      if (p.size === "kid") b.set(bx, oben - 1 - flick, k.dark);
      else { b.set(bx + 1, oben - 1, k.base); b.set(bx, oben - 2 - flick, k.dark); }
      if (animation === "graze") {
        // Neck slanting forward and down from the shoulder; the muzzle reaches the ground in the last frame
        const hy = [ty - 1, Math.min(ty + 4, 11), boden - 1][f], hx = f === 0 ? Math.min(e + 1, 11) : 11;
        if (f === 0) b.rect(e - 1, ty - 1, 2, 2, k.base);
        else hals(b, e - 1, ty, hx + 1, hy - 1);
        kopf(b, hx, hy);
        return b;
      }
      // Neck rising from the shoulder, the head high above the back
      const hy = oben - 4;
      b.rect(e - 1, hy + 2, 2, oben - hy - 1, k.base);
      b.set(e - 1, hy + 2, k.light);
      kopf(b, e, hy);
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
