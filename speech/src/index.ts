// Speech in English from any line of text, in the browser: Kokoro-82M (weights Apache-2.0) through kokoro-js and
// transformers.js, on onnxruntime-web. The model (about 92 MB) and the voices come from Hugging Face, and only after the
// person asks for it (load()); the runtime is served by the page itself, nothing comes from a CDN. The result is
// finished like every Formwerk sound: 48 kHz mono, DC out, edges faded, −1 dBFS.
//
// Licence: this package is GPL-3.0-or-later, because kokoro-js pulls in phonemizer, which contains eSpeak NG (GPL-3.0)
// for the pronunciation. The rest of Formwerk stays MIT; the spoken WAV files are yours (CC0 like every Formwerk asset).
import { Biquad, centre, fadeEdges, normalize, RATE, removeDC, type Samples } from "../../src/core/audio";

export const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
/** What the browser downloads from Hugging Face on the first load: the model in 8 bit and one voice per use. */
export const DOWNLOAD_MB = 92;
export const MAX_CHARACTERS = 300;

/** The voices worth using (Kokoro's own grades C+ and better), American and British English. */
export const VOICES = {
  af_heart: { de: "Amerikanisch, weiblich, warm (Heart)", en: "American, female, warm (Heart)" },
  af_bella: { de: "Amerikanisch, weiblich, lebhaft (Bella)", en: "American, female, lively (Bella)" },
  af_nicole: { de: "Amerikanisch, weiblich, leise (Nicole)", en: "American, female, soft (Nicole)" },
  am_michael: { de: "Amerikanisch, männlich (Michael)", en: "American, male (Michael)" },
  am_fenrir: { de: "Amerikanisch, männlich, tief (Fenrir)", en: "American, male, deep (Fenrir)" },
  am_puck: { de: "Amerikanisch, männlich, hell (Puck)", en: "American, male, bright (Puck)" },
  bf_emma: { de: "Britisch, weiblich (Emma)", en: "British, female (Emma)" },
  bm_george: { de: "Britisch, männlich (George)", en: "British, male (George)" },
} as const;
export type Voice = keyof typeof VOICES;

export type Progress = { file: string; loaded: number; total: number };
type Tts = { generate(text: string, o: { voice: Voice; speed: number }): Promise<{ audio: Float32Array; sampling_rate: number }> };
let geladen: Promise<Tts> | null = null;

/**
 * Loads the model once (the browser keeps it in its cache). Call it only after the person agreed to the download from
 * Hugging Face. `progress` reports the files as they arrive.
 */
export function load(progress?: (p: Progress) => void): Promise<Tts> {
  geladen ??= (async () => {
    const [{ KokoroTTS }, { env }] = await Promise.all([import("kokoro-js"), import("@huggingface/transformers")]);
    // The runtime from this page, not from a CDN; only the model and voices come from Hugging Face. The build copies
    // both files (Vite: new URL(…, import.meta.url)); onnxruntime-web's exports do not list them.
    const mjs = new URL("../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs", import.meta.url).href;
    const wasm = new URL("../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm", import.meta.url).href;
    const onnx = env.backends.onnx as { wasm?: { wasmPaths?: unknown } };
    onnx.wasm = { ...onnx.wasm, wasmPaths: { mjs, wasm } };
    env.allowLocalModels = false;
    return (await KokoroTTS.from_pretrained(MODEL, {
      dtype: "q8", device: "wasm",
      progress_callback: (p: { status: string; file?: string; loaded?: number; total?: number }) => {
        if (p.status === "progress" && p.file) progress?.({ file: p.file, loaded: p.loaded ?? 0, total: p.total ?? 0 });
      },
    })) as unknown as Tts;
  })();
  geladen.catch(() => { geladen = null; });
  return geladen;
}

/** Twice the rate with a windowed-sinc half-band filter: Kokoro speaks at 24 kHz, Formwerk sounds are 48 kHz. */
export function upsample2(x: Float32Array): Samples {
  const TAPS = 24, out = new Float32Array(x.length * 2) as Samples;
  const kern = Array.from({ length: 2 * TAPS }, (_, k) => {
    const t = k - TAPS + 0.5, w = 0.42 + 0.5 * Math.cos((Math.PI * t) / TAPS) + 0.08 * Math.cos((2 * Math.PI * t) / TAPS);
    return (Math.sin(Math.PI * t) / (Math.PI * t)) * w;
  });
  for (let i = 0; i < x.length; i++) {
    out[2 * i] = x[i];
    let s = 0;
    for (let k = 0; k < 2 * TAPS; k++) { const j = i + k - TAPS + 1; if (j >= 0 && j < x.length) s += x[j] * kern[k]; }
    out[2 * i + 1] = s;
  }
  return out;
}

/** Silence before and after the voice cut to `rand` seconds, so a line in a game starts when it is triggered. */
export function trim(s: Samples, rand = 0.03): Samples {
  let spitze = 0;
  for (const x of s) spitze = Math.max(spitze, Math.abs(x));
  const schwelle = spitze * 0.004; // −48 dB under the peak
  let a = 0, e = s.length - 1;
  while (a < e && Math.abs(s[a]) < schwelle) a++;
  while (e > a && Math.abs(s[e]) < schwelle) e--;
  const m = Math.round(rand * RATE);
  return s.slice(Math.max(0, a - m), Math.min(s.length, e + m + 1)) as Samples;
}

/**
 * Kokoro's output as a finished Formwerk sound: 48 kHz mono, rumble below 60 Hz filtered out (a voice has nothing
 * there), silence trimmed, −1 dBFS, clean edges.
 */
export function finish(audio: Float32Array, rate: number): Samples {
  if (rate !== RATE / 2 && rate !== RATE) throw new Error(`unexpected sample rate ${rate}`);
  const s = rate === RATE ? (Float32Array.from(audio) as Samples) : upsample2(audio);
  const hp = new Biquad("highpass", 60, 0.707);
  for (let i = 0; i < s.length; i++) s[i] = hp.run(s[i]);
  return normalize(centre(fadeEdges(removeDC(trim(s)), 0.004, 0.02)));
}

/** Speaks one line (at most MAX_CHARACTERS) in a voice at a speed (0.7 to 1.3). Loads the model on first use. */
export async function speak(text: string, voice: Voice = "af_heart", speed = 1): Promise<Samples> {
  const zeile = text.trim().slice(0, MAX_CHARACTERS);
  if (!zeile) throw new Error("nothing to say");
  const tts = await load();
  const r = await tts.generate(zeile, { voice, speed: Math.min(1.3, Math.max(0.7, speed)) });
  return finish(r.audio, r.sampling_rate);
}
