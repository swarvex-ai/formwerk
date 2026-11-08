# Formwerk speech

Any line of English text spoken in the browser by [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (weights
Apache-2.0) through [kokoro-js](https://github.com/hexgrad/kokoro), in eight voices, finished like every Formwerk sound:
48 kHz mono, −1 dBFS, clean edges. The gallery's speech tab uses it.

```ts
import { load, speak } from "formwerk-speech";
await load((p) => console.log(p.file, p.loaded, p.total)); // only after the person agreed: ~92 MB from Hugging Face
const samples = await speak("Halt! Who goes there?", "am_fenrir", 0.95); // Float32Array, 48 kHz mono
```

- **Licence: GPL-3.0-or-later** (`LICENSE`). kokoro-js pulls in phonemizer, which contains eSpeak NG (GPL-3.0) for
  the pronunciation, so this package and every bundle that includes it (the gallery's speech tab) are GPL-3.0. The
  rest of Formwerk stays MIT and does not import it. What you speak with it is yours: the WAV files are CC0 like every
  Formwerk asset.
- **Downloads:** the model (`onnx-community/Kokoro-82M-v1.0-ONNX`, 8 bit, about 92 MB) and the voices come from
  Hugging Face, and only after the person agreed: Hugging Face then sees their IP address. The runtime
  (onnxruntime-web) is served by the gallery itself, nothing comes from a CDN. The browser keeps the model.
- **Voices:** Kokoro's own grade C+ and better, American and British English (`VOICES`). Kokoro speaks no German.
- **Weights:** Apache-2.0. Kokoro was trained on permissive and public-domain audio and, by its model card, on
  synthetic audio from closed speech services: a grey area the visionary accepted for English (2026-11-08).
- **Install size:** onnxruntime-node and sharp are replaced by empty stubs (`stubs/`, root `overrides`): the browser
  never loads them, and they would add about 225 MB of native binaries to every install.
- **Checks:** `tests/core/speech.test.ts` (upsampling and finish, in CI) and `npm run test:speech` on a machine with a
  GPU and network: every voice speaks test lines, Whisper writes back what it heard, and the word error rate, level,
  edges and speaking rate are checked; the lines land as WAV in `tests/speech/out/` for a person to listen.
