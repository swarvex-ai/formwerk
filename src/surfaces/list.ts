// The ids of the surfaces without three.js, so the gallery shell knows which tab a link opens before it loads three.js
// (tests/core/surfaces.test.ts checks that this matches src/surfaces/index.ts).
export const SURFACE_IDS = [
  "cobblestone",
  "bricks",
  "tiles",
  "shingles",
  "concrete",
  "plaster",
  "marble",
  "planks",
  "parquet",
  "wicker",
  "metal-plate",
  "corrugated",
  "rust",
  "grass",
  "sand",
  "dirt",
  "snow",
  "mud",
] as const;
