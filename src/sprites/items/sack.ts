import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const STEMPEL = hex("#3b3350");

export const sack = defineSprite({
  id: "sack-sprite", category: "items",
  title: { de: "Sack", en: "Sack" },
  description: {
    de: "Ein Stoffsack als Pixel-Symbol für Inventare, Läden, Mühlen und Höfe: zugebunden, umgeschlagen oder offen mit sichtbarem Inhalt, mit einer kurzen Animation, in der er fällt, aufschlägt und sich setzt. 16 × 16 Pixel.",
    en: "A cloth sack as a pixel icon for inventories, shops, mills and farms: tied, folded or open with its contents showing, with a short animation in which it drops, lands and settles. 16 × 16 pixels.",
  },
  params: {
    height: { type: "integer", min: 7, max: 11, default: 9, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Sacks in Pixeln, vom Boden bis zum Hals: 7 ein halb leerer Sack, 9 üblich, 11 ein hoher, voller Sack.", en: "Height of the sack in pixels, from its base to the top of the neck: 7 a half-empty sack, 9 usual, 11 a tall full sack." } },
    tie: { type: "choice", options: ["tied", "folded", "open"], default: "tied", label: { de: "Verschluss", en: "Tie" },
      labels: { tied: { de: "zugebunden", en: "tied" }, folded: { de: "umgeschlagen", en: "folded" }, open: { de: "offen", en: "open" } },
      describe: { de: "Wie der Sack oben schließt: zugebunden mit einer Schnur um den gerafften Hals, flach umgeschlagen, oder offen mit umgerolltem Rand und sichtbarem Inhalt.", en: "How the sack closes at the top: tied with a cord around the gathered neck, folded flat over, or open with the mouth rolled down and the contents showing." } },
    cloth: { type: "color", default: "#c8b48a", label: { de: "Stoff", en: "Cloth" },
      describe: { de: "Farbe des Stoffs: Sackleinen #c8b48a, Leinen #e0d6c0, alte Jute #a08860.", en: "Colour of the cloth: burlap #c8b48a, linen #e0d6c0, old jute #a08860." } },
    content: { type: "color", default: "#e8dcc0", label: { de: "Inhalt", en: "Content" },
      describe: { de: "Was in einem offenen Sack zu sehen ist: Mehl #e8dcc0, Weizen #d8b060, Kartoffeln #a07848.", en: "What shows in an open sack: flour #e8dcc0, wheat #d8b060, potatoes #a07848." } },
    mark: { type: "boolean", default: false, label: { de: "Stempel", en: "Mark" },
      describe: { de: "Ein dunkles gestempeltes Zeichen (3 × 3 Pixel) vorn auf dem Sack, wie auf einem Mehlsack der Mühle.", en: "A dark stamped sign (3 × 3 pixels) on the front of the sack, like the mill's mark on a flour sack." } },
  },
  presets: {
    "flour-sack": { label: { de: "Mehlsack", en: "Flour sack" }, values: { cloth: "#e0d6c0", mark: true } },
    "grain-sack": { label: { de: "Getreidesack", en: "Grain sack" }, values: { cloth: "#c8b48a", tie: "open", content: "#d8b060" } },
    "potato-sack": { label: { de: "Kartoffelsack", en: "Potato sack" }, values: { cloth: "#a08860", height: 8, tie: "folded" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "drop", frames: 3, fps: 8, loop: false }],
  grounded: false,
  build(p) {
    const stoff = ramp(p.cloth), inhalt = ramp(p.content);
    // lift: the whole sack one pixel up; squash: the top one pixel lower and one pixel wider on each side; narrow: one pixel off the right
    const sack = (b: Pixels, lift: number, squash: number, narrow: number) => {
      const boden = 13 - lift, y0 = 14 - p.height + squash - lift;
      const kopf = p.tie === "tied" ? 2 : p.tie === "folded" ? 1 : 3, oben = y0 + kopf, n = boden - oben + 1;
      const obenHw = p.tie === "open" ? 4 : 3, untenHw = 5;
      // the body: narrow under the neck, slumping wider towards the base; the bottom row cuts its corners
      let links = 8, rechts = 7;
      for (let k = 0; k < n; k++) {
        const y = oben + k, t = n > 1 ? k / (n - 1) : 1;
        const hw = Math.round(obenHw + (untenHw - obenHw) * Math.sqrt(t)) + squash - (k === n - 1 ? 1 : 0);
        const l = 8 - hw, r = 7 + hw - narrow;
        if (k === n - 2) { links = l; rechts = r; }
        for (let x = l; x <= r; x++) {
          const licht = x === l || (k <= 1 && x < 7) || (k === 2 && x < 6);
          b.set(x, y, x === r || k === n - 1 ? stoff.dark : licht ? stoff.light : stoff.base);
        }
      }
      // a fold down the lower right of the body
      for (let y = oben + Math.ceil(n / 2); y < boden; y++) b.set(Math.min(10, rechts - 2), y, stoff.dark);
      if (p.mark) {
        const my = Math.min(Math.round((oben + boden - 1) / 2) - 1, boden - 3);
        for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (i !== 1 || j !== 1) b.set(Math.max(links + 1, 5) + i, my + j, STEMPEL);
      }
      if (p.tie === "tied") {
        // a tuft above the gathered neck, then the cord in a deep shade of the cloth
        b.rect(6, y0 - 1, 4, 1, stoff.base); b.set(6, y0 - 1, stoff.light); b.set(9, y0 - 1, stoff.dark);
        b.set(7, y0, stoff.light); b.set(8, y0, stoff.dark);
        b.rect(6, y0 + 1, 4, 1, stoff.deep); b.set(6, y0 + 1, stoff.dark);
      } else if (p.tie === "folded") {
        // the flap folded flat over the top, a shadow line under it
        const l = 7 - obenHw - squash, r = 8 + obenHw + squash - narrow;
        b.rect(l, y0, r - l + 1, 1, stoff.light); b.set(r, y0, stoff.base);
        b.rect(l + 2, y0 + 1, r - l - 3, 1, stoff.dark);
      } else {
        // the contents as a small mound, then the mouth rolled down, wider than the body under it
        b.rect(6, y0, 4, 1, inhalt.base); b.set(6, y0, inhalt.light); b.set(9, y0, inhalt.dark);
        b.rect(5 - squash, y0 + 1, 6 + 2 * squash - narrow, 1, inhalt.base); b.set(5 - squash, y0 + 1, inhalt.light); b.set(10 + squash - narrow, y0 + 1, inhalt.dark);
        const l = 8 - obenHw - 1 - squash, r = 7 + obenHw + 1 + squash - narrow;
        b.rect(l, y0 + 2, r - l + 1, 1, stoff.base); b.set(l, y0 + 2, stoff.light); b.set(r, y0 + 2, stoff.dark);
        b.rect(l + 2, y0 + 3, r - l - 3, 1, stoff.dark);
      }
    };
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      if (animation === "drop" && f === 0) sack(b, 1, 0, 1);
      else if (animation === "drop" && f === 1) sack(b, 0, 1, 0);
      else sack(b, 0, 0, 0);
      return b;
    };
  },
});
