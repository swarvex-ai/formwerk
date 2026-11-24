import { Biquad, buffer, envelope, grains, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const flop = defineSound({
  id: "flop", category: "movement",
  title: { de: "Zappelnder Fisch", en: "Fish flop" },
  description: {
    de: "Ein gefangener Fisch klatscht auf Planken oder Kaisteine: ein paar nasse Schläge, jeder leiser, dazwischen manchmal ein kurzes Schwanzzappeln. Für Angelspiele, Häfen, Märkte und Küchen.",
    en: "A caught fish slapping on planks or quay stones: a few wet slaps, each quieter, sometimes a quick tail flutter between them. For fishing games, harbours, markets and kitchens.",
  },
  params: {
    flops: { type: "integer", min: 1, max: 5, default: 3, label: { de: "Schläge", en: "Flops" },
      describe: { de: "Wie oft der Fisch aufschlägt: 1 einmal, 3 üblich, 5 ein Fisch, der lange zappelt.", en: "How many slaps: 1 a single one, 3 usual, 5 a fish that keeps flopping." } },
    size: { type: "number", min: 0.5, max: 1.5, step: 0.05, default: 1, label: { de: "Größe", en: "Size" },
      describe: { de: "Größe des Fischs: 0,5 eine Sardine (kurze, leichte Schläge), 1 eine Forelle, 1,5 ein großer Karpfen (schwerer, tiefer, weiter auseinander).", en: "Size of the fish: 0.5 a sardine (short light slaps), 1 a trout, 1.5 a big carp (heavier, lower slaps spaced further apart)." } },
    wetness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Nässe", en: "Wetness" },
      describe: { de: "Wie nass: 0 ein trockener Plumps, 0,6 frisch aus dem Wasser, 1 ein Klatschen mit nassem Knistern danach.", en: "How wet: 0 a dry thud, 0.6 fresh out of the water, 1 a smack with a spray of wet crackle after it." } },
    surface: { type: "choice", options: ["wood", "stone"], default: "wood", label: { de: "Boden", en: "Surface" },
      labels: { wood: { de: "Holz", en: "Wood" }, stone: { de: "Stein", en: "Stone" } },
      describe: { de: "Worauf er fällt: Holz klopft hohl um 180–250 Hz unter jedem Schlag (Steg, Boot), Stein klatscht härter und heller (Kaimauer).", en: "What it lands on: wood knocks hollow around 180–250 Hz under each slap (jetty, boat), stone slaps harder and brighter (quay)." } },
    flutter: { type: "boolean", default: true, label: { de: "Zappeln", en: "Flutter" },
      describe: { de: "Ein kurzes Schwanzzappeln (5–8 kleine Tipper in 0,1 s) zwischen den Schlägen; bei einem einzigen Schlag keins.", en: "A quick tail flutter (5–8 tiny taps in 0.1 s) between the slaps; none with a single slap." } },
  },
  presets: {
    trout: { label: { de: "Forelle", en: "Trout" }, values: { flops: 3 } },
    sardine: { label: { de: "Sardine", en: "Sardine" }, values: { size: 0.5, flops: 4, flutter: true } },
    carp: { label: { de: "Karpfen", en: "Carp" }, values: { size: 1.5, flops: 2, wetness: 0.8 } },
    quay: { label: { de: "Auf der Kaimauer", en: "On the quay" }, values: { surface: "stone", wetness: 0.3 } },
  },
  loop: false, maxSeconds: 1.5,
  build(p, seed) {
    const r = rng(seed), gap = 0.18 + 0.08 * p.size, lang = 0.04 + 0.03 * (p.size - 0.5), stone = p.surface === "stone";
    const spray = 0.06 + 0.06 * p.wetness;
    // The slap times first (jitter ±20 ms), so the buffer ends after the last slap and its spray
    const starts = Array.from({ length: p.flops }, (_, k) => 0.02 + k * gap + (r() * 2 - 1) * 0.02);
    const s = buffer(Math.min(1.5, starts[p.flops - 1] + 0.01 + spray + 0.05));
    starts.forEach((at, k) => {
      const amp = 10 ** (-3 * k / 20), a = Math.round(at * RATE), tau = lang / 5, v = 0.9 + 0.2 * r();
      // The wet slap: band-passed noise with a sharp attack, brighter on stone, a duller thud when dry
      const bp = new Biquad("bandpass", ((stone ? 2400 : 1500) / p.size) * v, 0.7), lp = new LowPass(), body = new Osc("sine");
      const knock = new Osc("sine"), knockHz = (250 - 70 * (p.size - 0.5)) * (0.95 + 0.05 * r());
      for (let i = 0; i < lang * 1.6 * RATE && a + i < s.length; i++) {
        const t = i / RATE, n = white(r);
        s[a + i] += amp * (
          bp.run(n) * envelope(t, 0.0008, tau) * (0.6 + 0.9 * p.wetness) * (stone ? 1.4 : 1)
          + lp.run(n, 400) * envelope(t, 0.001, tau * 1.2) * (2.5 - 1.5 * p.wetness)
          + body.next((90 / p.size) * v) * envelope(t, 0.002, tau * 1.3) * 0.5 * p.size);
        // The hollow plank under it (wood only)
        if (!stone) s[a + i] += amp * knock.next(knockHz) * envelope(t, 0.002, lang / 3) * 0.6;
      }
      // Spray: fine wet crackle above about 3 kHz after the slap
      if (p.wetness > 0) {
        const g = buffer(spray + 0.03), hp = new Biquad("highpass", 3000);
        grains(g, r, { start: 0, seconds: spray, count: Math.round(10 + 50 * p.wetness), hz: 5500, q: 1.1, gain: 1.2 * p.wetness, grain: 0.0008, shape: "front" });
        const b = a + Math.round(0.01 * RATE);
        for (let i = 0; i < g.length && b + i < s.length; i++) s[b + i] += hp.run(g[i]) * amp;
      }
    });
    // Tail flutter between the slaps, from its own stream, so switching it off leaves the slaps as they are
    if (p.flutter) {
      const r2 = rng(seed + 1);
      for (let k = 0; k + 1 < p.flops; k++) {
        const amp = 10 ** (-3 * k / 20) * 0.25, from = starts[k] + lang + 0.015, taps = 5 + Math.floor(r2() * 4);
        const hz = 1800 / p.size;
        for (let j = 0; j < taps; j++) {
          const a = Math.round((from + (j / taps) * 0.1 + r2() * 0.006) * RATE), bp = new Biquad("bandpass", hz * (0.85 + 0.3 * r2()), 1);
          const tap = amp * (0.7 + 0.3 * r2()) * (1 - 0.4 * (j / taps));
          for (let i = 0; i < 0.01 * RATE && a + i < s.length; i++) s[a + i] += bp.run(white(r2)) * envelope(i / RATE, 0.0005, 0.002) * tap;
        }
      }
    }
    return s;
  },
});
