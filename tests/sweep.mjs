// FORMWERK_SWEEP=<icon id>: the icon tests/core/sweep.test.ts draws in every combination of its parameters.
import { mkdirSync, writeFileSync } from "node:fs";

/** The id to sweep, or "" when none is set. */
export const sweepId = (process.env.FORMWERK_SWEEP ?? "").trim();
/** Writes the sweep's result to tests/scene/out/sweep-<id>.txt. */
export function report(id, text) {
  mkdirSync("tests/scene/out", { recursive: true });
  writeFileSync(`tests/scene/out/sweep-${id}.txt`, text);
}
