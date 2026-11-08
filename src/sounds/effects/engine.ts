import { Biquad, buffer, LOOP_TAIL, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const engine = defineSound({
  id: "engine", category: "effects",
  title: { de: "Motor", en: "Engine" },
  description: {
    de: "Ein Verbrennungsmotor als nahtlose Schleife: Auto im Leerlauf, Motorrad, Lastwagen, Rennwagen oder Generator; Drehzahl und Zylinder wählbar.",
    en: "A combustion engine as a seamless loop: a car idling, a motorbike, a truck, a race car or a generator; choose revs and cylinders.",
  },
  params: {
    rpm: { type: "number", min: 500, max: 7000, step: 10, default: 900, label: { de: "Drehzahl (U/min)", en: "Revs (rpm)" },
      describe: { de: "Umdrehungen pro Minute: 800 im Leerlauf, 3000 bei Fahrt, 6500 am Limit.", en: "Revolutions per minute: 800 idling, 3000 cruising, 6500 at the limit." } },
    cylinders: { type: "integer", min: 1, max: 8, default: 4, label: { de: "Zylinder", en: "Cylinders" },
      describe: { de: "1 ein Rasenmäher oder Generator, 2 ein Motorrad, 4 ein Auto, 6 bis 8 ein Lastwagen oder Sportwagen.", en: "1 a lawnmower or generator, 2 a motorbike, 4 a car, 6 to 8 a truck or a sports car." } },
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß Motor und Auspuff klingen: 0,2 klein und knatternd, 0,5 ein Auto, 1 ein schwerer Diesel.", en: "How big engine and exhaust sound: 0.2 small and rattly, 0.5 a car, 1 a heavy diesel." } },
    roughness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Unruhe", en: "Roughness" },
      describe: { de: "Wie unregelmäßig er läuft: 0 glatt, 0,3 üblich, 0,8 ein alter Motor, der stottert.", en: "How unevenly it runs: 0 smooth, 0.3 usual, 0.8 an old engine that sputters." } },
    seconds: { type: "number", min: 1, max: 2, step: 0.5, default: 2, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 1 s klein, 2 s wiederholt sich unauffälliger.", en: "Length of the loop: 1 s is small, 2 s repeats less noticeably." } },
  },
  presets: {
    idle: { label: { de: "Leerlauf", en: "Idle" }, values: { rpm: 850, cylinders: 4, size: 0.5, roughness: 0.25 } },
    motorbike: { label: { de: "Motorrad", en: "Motorbike" }, values: { rpm: 3200, cylinders: 2, size: 0.3, roughness: 0.4 } },
    truck: { label: { de: "Lastwagen", en: "Truck" }, values: { rpm: 700, cylinders: 6, size: 1, roughness: 0.35 } },
    "race-car": { label: { de: "Rennwagen", en: "Race car" }, values: { rpm: 6500, cylinders: 8, size: 0.45, roughness: 0.1 } },
  },
  loop: true, maxSeconds: 2,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.seconds + LOOP_TAIL);
    // A four-stroke engine fires every cylinder once per two turns
    // (a whole number of firings per loop, so the loop folds onto the same rhythm)
    const zuenden = Math.max(1, Math.round((p.rpm / 60) * (p.cylinders / 2) * p.seconds)) / p.seconds, koerper = 900 - p.size * 750;
    const b1 = new Biquad("bandpass", koerper, 2.5), b2 = new Biquad("bandpass", koerper * 2.3, 3), lp = new LowPass(), brumm = new Osc("sine"), halb = new Osc("sine");
    const abklingen = Math.exp(-zuenden * 6 / RATE);
    // Firings fall between the loop's ends, never on the seam
    let phase = 0.5, puls = 0;
    for (let i = 0; i < s.length; i++) {
      phase += zuenden / RATE;
      if (phase >= 1) {
        phase -= 1;
        // Every firing a little different; now and then a weak one (a rough engine stumbles)
        puls = (1 + p.roughness * (r() - 0.5) * 0.9) * (r() < p.roughness * 0.06 ? 0.35 : 1);
      }
      const reiz = puls * (1 + white(r) * (0.3 + p.roughness * 0.3));
      puls *= abklingen;
      const y = b1.run(reiz) * 1.2 + b2.run(reiz) * 0.6 + brumm.next(zuenden) * puls * 0.5 + halb.next(zuenden / 2) * 0.08 * p.roughness;
      s[i] = lp.run(y, 1800 + (1 - p.size) * 3500);
    }
    return s;
  },
});
