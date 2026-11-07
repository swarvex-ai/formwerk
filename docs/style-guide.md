# Formwerk style guide

The catalogue should look like one set, whoever builds an asset.

- **Look:** clean, slightly stylised realism. Clear silhouettes, bevel-free boxes and low segment counts are fine;
  detail comes from proportions and materials, not from triangles.
- **Proportions:** real-world defaults (a chair seat at 0.46 m, a door at 2.0 m, a step rise of 0.17 m). Ranges cover
  what exists in reality, not more.
- **Colour:** muted, natural defaults; strong colours only as a parameter. Materials from `src/materials`.
- **Segments:** cylinders 8–16 around for furniture, 32 for turned or architectural parts; icosahedron detail 0–1 for
  foliage clusters.
- **Variation:** use the seed for natural things (trees, rocks, plants). Man-made things are exact and need no seed.
- **Names:** ids in kebab-case English (`server-rack`), parameters in camelCase English (`seatHeight`).
- **Budgets:** furniture up to 20,000 triangles, architecture 30,000, nature 150,000 at the extremes; most assets
  should stay far below at their defaults.
