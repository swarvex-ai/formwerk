import { Biquad, buffer, envelope, LOOP_TAIL, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const cartWheels = defineSound({
  id: "cart-wheels", category: "movement",
  title: { de: "Wagenräder", en: "Cart wheels" },
  description: {
    de: "Ein Karren oder Wagen rollt als nahtlose Schleife: das Rumpeln der Räder, der Knock bei jeder Fuge des Untergrunds, das Knarren der Achse und das Rasseln der Ladung – für Marktstraßen, Karawanen und die Mine, unter dem Hufschlag.",
    en: "A cart or wagon rolling as a seamless loop: the rumble of the wheels, the knock at every joint of the ground, the creak of the axle and the rattle of the load – for market roads, caravans and the mine cart, under the hooves.",
  },
  params: {
    rim: { type: "choice", options: ["wood", "iron"], default: "iron", label: { de: "Reifen", en: "Rim" },
      labels: { wood: { de: "Holz", en: "Wood" }, iron: { de: "Eisen", en: "Iron" } },
      describe: { de: "Ein Eisenreifen klingt und klackt heller auf Stein, ein Holzreifen dämpft den Schlag.", en: "An iron tyre rings and clacks brighter on stone, a wooden rim thuds." } },
    ground: { type: "choice", options: ["cobble", "dirt", "planks"], default: "cobble", label: { de: "Untergrund", en: "Ground" },
      labels: { cobble: { de: "Pflaster", en: "Cobble" }, dirt: { de: "Erde", en: "Dirt" }, planks: { de: "Dielen", en: "Planks" } },
      describe: { de: "Pflaster gibt dichte, unregelmäßige Knocks, Erde ein tiefes Rumpeln mit knirschendem Geröll und wenige Knocks, Dielen einen regelmäßigen Knock bei jeder Dielenfuge.", en: "Cobbles give dense irregular knocks, dirt a low rumble with crunching grit and few knocks, planks a regular knock at every board joint." } },
    speed: { type: "number", min: 0.5, max: 3, step: 0.1, default: 1.2, unit: "m/s", label: { de: "Geschwindigkeit", en: "Speed" },
      describe: { de: "Wie schnell der Wagen rollt: 1,2 m/s ist Gehgeschwindigkeit, 3 m/s ein trabtender Karren; die Knockrate steigt damit.", en: "How fast the cart rolls: 1.2 m/s is walking pace, 3 m/s a trotting cart; knocks per second scale with it." } },
    load: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Ladung", en: "Load" },
      describe: { de: "Wie schwer der Wagen beladen ist: 0 leer (leichter, mehr Rasseln lose Bretter), 1 schwer beladen (tieferes Rumpeln, lautere Knock, die Achse knarrt öfter).", en: "How heavily loaded: 0 empty (lighter, more rattle of loose boards), 1 heavily loaded (deeper rumble, louder knocks, axle creaks more often)." } },
    creak: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Achse knarzt", en: "Creak" },
      describe: { de: "Wie oft und wie laut die Achse knarrt: 0 eine gefettete Achse, 1 eine trockene, die bei jedem Radumlauf quietscht.", en: "How often and how loud the axle creaks: 0 a greased axle, 1 a dry one creaking at every wheel turn." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist kurz, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is short, 8 to 12 s repeat less noticeably." } },
    seed: { type: "number", min: 0, max: 99, step: 1, default: 0, label: { de: "Zufall", en: "Variation" },
      describe: { de: "Kleine zufällige Abweichungen im Takt und in der Lautstärke: andere Zahl, andere Fahrt.", en: "Small random offsets in timing and level: another number, another ride." } },
  },
  presets: {
    "market-cart": { label: { de: "Marktwagen", en: "Market cart" }, values: { rim: "iron", ground: "cobble" } },
    "farm-wagon-dirt": { label: { de: "Bauernwagen auf Erde", en: "Farm wagon on dirt" }, values: { rim: "wood", ground: "dirt", speed: 1, load: 0.8, creak: 0.5 } },
    bridge: { label: { de: "Brücke", en: "Bridge" }, values: { ground: "planks", speed: 1.5 } },
    "empty-rattle": { label: { de: "Leer klappert", en: "Empty rattle" }, values: { load: 0, speed: 2.2 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed * 100 + p.seed + 1);
    const sp = p.speed, w = p.load, c = p.creak;
    const s = buffer(p.seconds + LOOP_TAIL);
    // metres between two knocks for this ground
    const g0 = p.ground === "cobble" ? 0.16 : p.ground === "planks" ? 0.30 : 0.6;
    const knocks = Math.max(1, Math.round(p.seconds * sp / g0));
    // One knock; knocks near the loop end run past it into the tail, foldLoop blends them into the start
    const knock = (at: number, level: number) => {
      const noise = new Biquad(p.ground === "dirt" ? "lowpass" : "bandpass", 1, 0.7);
      const ring = new Biquad("bandpass", 1, 12);
      const cf = p.rim === "iron" ? (p.ground === "cobble" ? 3200 : p.ground === "dirt" ? 1500 : 2600) : (p.ground === "cobble" ? 550 : p.ground === "dirt" ? 330 : 480);
      noise.set(cf, 1); ring.set(cf * 1.5 + 500 * r(), 12);
      const decay = (p.ground === "cobble" ? 0.05 : p.ground === "dirt" ? 0.14 : 0.09) * (1 + 0.5 * w);
      const thump = 160 - 110 * w, tlen = 0.05 + 0.05 * w;
      const o = new Osc("sine");
      const len = Math.round(0.35 * RATE);
      for (let i = 0; i < len; i++) {
        const t = i / RATE, x = white(r);
        let v = noise.run(x) * envelope(t, 0.0002, decay) * (p.ground === "dirt" ? 0.5 : p.ground === "planks" ? 1.1 : 1.0);
        if (p.rim === "iron") v += ring.run(x) * envelope(t, 0.0002, 0.04) * 1.5;
        v += o.next(thump * (1 - 0.4 * Math.min(1, t / tlen))) * envelope(t, 0.002, tlen / 2) * 0.5;
        if (at + i < s.length) s[at + i] += v * level;
      }
    };
    const rattle = (at: number, level: number) => {
      const hp = new Biquad("highpass", 2600, 1);
      const len = Math.round(0.12 * RATE);
      for (let i = 0; i < len; i++) {
        const t = i / RATE;
        if (at + i < s.length) s[at + i] += hp.run(white(r)) * envelope(t, 0.0002, 0.03) * level * (1 - w) * 1.6;
      }
    };
    const axle = (at: number, level: number) => {
      const f0 = 450 + 450 * r(), o = new Osc("saw");
      const len = Math.round(0.3 * RATE);
      for (let i = 0; i < len; i++) {
        const t = i / RATE, f = f0 * (1 - 0.5 * Math.min(1, t / 0.3));
        if (at + i < s.length) s[at + i] += o.next(f) * envelope(t, 0.005, 0.1) * level * 0.45;
      }
    };
    // Low rumble under everything: noise below about 300 Hz, louder on dirt and with a heavy load.
    // Filled over the whole buffer (loop + tail) so the tail is the genuine continuation of the loop.
    const rumbleLp = new LowPass();
    const rumbleBase = p.ground === "dirt" ? 3.0 : p.ground === "planks" ? 0.14 : 0.15;
    for (let i = 0; i < s.length; i++) {
      const x = white(r);
      s[i] += rumbleLp.run(x, 260) * rumbleBase * (0.5 + w) * 1.6;
    }
    // The wheels knock, the axle creaks and the load rattles; speed stretches the gap in seconds.
    // Knock tails may run past the loop end into the tail; foldLoop blends them into the start.
    let t = 0.05;
    for (let k = 0; k < knocks && t < p.seconds; k++) {
      const at = Math.round(t * RATE);
      const level = 0.7 + 0.6 * w + (r() - 0.5) * 0.3;
      knock(at, level);
      if (r() < c * (0.4 + 0.8 * w)) axle(at, level * 0.7);
      if (p.ground === "planks" || r() < (1 - w) * 0.5) rattle(at, level * 0.5);
      const gap = p.ground === "dirt" ? 0.6 + 0.9 * r() : p.ground === "cobble" ? g0 * (0.75 + 0.5 * r()) : g0 * (0.9 + 0.2 * r());
      t += gap / sp;
    }
    return s;
  },
});
