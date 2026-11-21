import { buffer, LowPass, mixInto, RATE, semitones } from "../../core/audio";
import { rng } from "../../core/rng";
import { voice, type VoiceKey } from "../../core/voice";
import { defineSound } from "../define";

export const whinny = defineSound({
  id: "whinny", category: "voice",
  title: { de: "Wiehern", en: "Horse whinny" },
  description: {
    de: "Ein Pferd wiehert: ein helles, steigendes Quietschen am Anfang, dann sinkt die Tonhöhe in einem schnellen, zitternden Tremolo, und am Ende kommt ein leises, atemhaftes Wiehern oder – auf Wunsch – ein kurzes Schnauben. Für Ställe, Straßen und Rittersszenen; zusammen mit dem Hufgeräusch.",
    en: "A horse whinnying: a bright rising squeal at the start, then the pitch falls in a fast, shuddering tremolo, and at the end a soft breathy nicker or, on request, a short snort. For stables, roads and knight scenes; goes with the hooves.",
  },
  params: {
    size: { type: "choice", options: ["pony", "horse", "draught"], default: "horse", label: { de: "Größe", en: "Size" },
      labels: { pony: { de: "Pony", en: "Pony" }, horse: { de: "Pferd", en: "Horse" }, draught: { de: "Kaltblut", en: "Draught horse" } },
      describe: { de: "Wie groß das Pferd ist: ein Pony wiehert höher und kürzer, ein Pferd ist der Mittelpunkt, ein Kaltblut tiefer und rauer.", en: "How big the horse is: a pony whinnies higher and shorter, a horse is the middle, a draught horse lower and rougher." } },
    length: { type: "number", min: 0.8, max: 2.6, step: 0.05, default: 1.6, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange das Wiehern dauert, ohne Echo: 0,8 s ein kurzes Rufen, 1,6 s ein gewöhnliches Wiehern, 2,6 s ein langes, aufgeregtes Rufen.", en: "How long the whinny lasts, without echo: 0.8 s a short call, 1.6 s an ordinary whinny, 2.6 s a long, alarmed call." } },
    pitch: { type: "number", min: -6, max: 6, step: 1, default: 0, label: { de: "Tonhöhe (Halbtöne)", en: "Pitch (semitones)" },
      describe: { de: "Höher oder tiefer als üblich für die Größe, in Halbtönen: +4 ein kleines Pferd, −5 ein schweres Kaltblut.", en: "Higher or lower than usual for the size, in semitones: +4 a small horse, −5 a heavy draught horse." } },
    excitement: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Aufregung", en: "Excitement" },
      describe: { de: "Wie aufgeregt das Pferd ist: 0 ein ruhiger Gruß (leiser, langsamer, mehr Wiehern am Ende), 1 ein alarmierter Ruf (lauter, höher, schneller und rauer).", en: "How excited the horse is: 0 a calm greeting (softer, slower, more nicker at the end), 1 an alarmed call (louder, higher, faster and rougher)." } },
    snort: { type: "boolean", default: false, label: { de: "Schnaufen", en: "Snort" },
      describe: { de: "Ob am Ende statt des leisen Wieherns ein kurzes Schnaufen durch die Nase kommt.", en: "Whether a short snort through the nose comes at the end instead of the soft nicker." } },
    distance: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Entfernung", en: "Distance" },
      describe: { de: "Wie weit das Pferd weg ist (nicht leiser, aber dumpfer mit Echo): 0 im Stall, 0,5 auf der Weide, 0,8 über die Straße.", en: "How far away the horse is (not quieter, but duller with an echo): 0 in the stable, 0.5 in the pasture, 0.8 across the road." } },
  },
  presets: {
    greeting: { label: { de: "Gruß", en: "Greeting" }, values: { excitement: 0.2, length: 1.2 } },
    call: { label: { de: "Ruf", en: "Call" }, values: { pitch: 0, length: 1.6 } },
    alarm: { label: { de: "Alarm", en: "Alarm" }, values: { excitement: 0.95, length: 2.2 } },
    pony: { label: { de: "Pony", en: "Pony" }, values: { size: "pony" } },
    "draught-snort": { label: { de: "Kaltblut mit Schnaufen", en: "Draught horse with snort" }, values: { size: "draught", snort: true } },
    "far-pasture": { label: { de: "Weite Weide", en: "Far pasture" }, values: { distance: 0.8 } },
  },
  loop: false, maxSeconds: 3.2,
  build(p, seed) {
    const r = rng(seed), L = p.length, ex = p.excitement, d = p.distance, snort = p.snort
    const sizeSemi = p.size === "pony" ? 4 : p.size === "draught" ? -5 : 0
    const peak = semitones(900, p.pitch + sizeSemi + 2 * ex) // riding horse about 900 Hz, higher when alarmed
    const onset = 0.17 * L
    const bodyEnd = onset + 0.60 * L
    const low = peak / 3
    const keys: VoiceKey[] = [
      { t: 0, f0: peak * 0.55, mouth: "ae", voice: 0.05, breath: 0.12 },
      { t: 0.08 * L, f0: peak * 0.97, mouth: "ae", voice: 0.85, breath: 0.07 },
      { t: onset, f0: peak, mouth: "ae", voice: 1, breath: 0.04 },
      { t: bodyEnd, f0: low, mouth: "a", voice: 0.7, breath: 0.35 },
    ]
    if (snort) {
      const s0 = bodyEnd + 0.10, s1 = Math.min(L, s0 + 0.14)
      keys.push({ t: s0, f0: low, mouth: "schwa", voice: 0, breath: 0.25, hiss: 0.9, hissHz: 4000 })
      keys.push({ t: s1, f0: low, mouth: "schwa", voice: 0, breath: 0.1, hiss: 0 })
      keys.push({ t: s1 + 0.03, f0: low, mouth: "schwa", voice: 0, breath: 0 })
    } else {
      keys.push({ t: L * 0.88, f0: semitones(200, p.pitch + sizeSemi) * 0.9, mouth: "schwa", voice: 0.5, breath: 0.5 + 0.3 * (1 - ex) })
      keys.push({ t: L, f0: low * 0.85, mouth: "u", voice: 0, breath: 0.25 })
      keys.push({ t: L + 0.05, f0: low * 0.85, mouth: "u", voice: 0, breath: 0 })
    }
    const dry = voice(keys, r, {
      size: p.size === "pony" ? 0.7 : p.size === "draught" ? 1.3 : 1,
      open: 0.7 - 0.2 * ex,
      jitter: 0.01 + 0.04 * ex,
      shimmer: 0.03 + 0.08 * ex,
      sub: 0.15 + 0.35 * ex,
      growl: 0.2 * ex,
      vibrato: 0,
      drive: 0.6 + 2.5 * ex,
    })
    // Tremolo on one continuous voice: a running phase so the heard rate is the rate,
    // about 11 Hz at the start of the body falling to about 5.5 Hz at its end,
    // deeper towards the end and with more excitement.
    let phase = 0
    for (let i = 0; i < dry.length; i++) {
      const t = i / RATE
      if (t > onset && t < bodyEnd) {
        const u = (t - onset) / (bodyEnd - onset)
        const rate = 11.5 - 6 * u
        const depth = 0.35 + 0.5 * ex * u
        phase += 2 * Math.PI * rate / RATE
        dry[i] *= 1 - depth / 2 * (1 - Math.cos(phase))
      }
    }
    if (d === 0) return dry
    // Far away: air takes the highs (to about 2 kHz) and a soft echo comes back 0.15 to 0.3 s later
    const delay = Math.round((0.15 + 0.15 * d) * RATE), out = buffer(dry.length / RATE + 0.35 + 0.05)
    const cut = 18000 * (2000 / 18000) ** d, lp = [new LowPass(), new LowPass()], lpEcho = new LowPass()
    mixInto(out, dry)
    const wet = new Float32Array(out.length)
    for (let i = 0; i < out.length; i++) {
      let y = i < dry.length ? dry[i] : 0
      for (const f of lp) y = f.run(y, cut)
      out[i] = y
      if (i >= delay) wet[i] = lpEcho.run(out[i - delay], cut * 0.6) * 0.4 * d
    }
    for (let i = delay; i < out.length; i++) out[i] += wet[i]
    return out
  },
});
