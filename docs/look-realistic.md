# Realistic look: how every model task works

Visionary decision (14 Nov 2026): every model gets the realistic look of the accepted style guide
(`docs/style-guide.md`, sections Models and Materials). The foundation (#324) put five reference assets on main that set
the bar. Each model task brings one asset up to its reference: furniture → chair, containers and wooden props →
barrel, metal props and lights → lantern, plants → tree, stone → rock. Open the reference's code and its render
`tests/scene/baseline/<reference>.png` first, and build your asset the same way.

## Steps

1. Build from real parts with `src/assets/shapes.ts`: `rounded` (boxes with eased edges, 2–5 mm radius), `turned`
   (lathe profiles for legs, knobs, handles, finials), `stave` (staves of a tub or bucket), `roundBoards` (round lids
   and heads from boards), `grid` (any surface from a function). Segment counts by radius from the style guide (under
   2 cm 8; up to 10 cm 16; up to 30 cm 24; up to 1 m 32).
2. Materials only from `src/materials` with the options in AGENTS.md (Rules, Materials): `wood` (grain "auto" or
   "x"/"y"/"z"), `iron` with `rust` for forged or cast iron, `metal` for clean or painted metal, `stone` with `moss`,
   `bark`, and `plain: true` only for leaf cards. A small object passes a larger `scale` (the lantern uses 4). Two wood
   materials alternated give boards their own tone, as the barrel does.
3. Keep the asset's `id`, every existing parameter name, its options and presets, its `physics` and its `rig`; every
   combination of the ranges must still build. Add a parameter only if it helps (with `describe` in German and
   English). Set `budget` to what the asset really needs at its heaviest extreme, inside the category limits in
   `tests/core/assets.test.ts` (furniture 60k triangles / 4 draw calls, architecture 80k / 4, nature 150k / 3, vehicles
   150k / 8, props 30k / 4); keep triangles as low as the shape allows.
4. Re-render the baseline: delete `tests/scene/baseline/<id>.png`, run `FORMWERK_ONLY=<id> npm test` (it writes the
   baseline), run it again (0.00 % changed). Look at `tests/scene/out/<id>.png`, `<id>.baked.png` and `<id>.glb.png`
   before you commit the baseline. If your model cannot read images, hand the task back.

## Traps

- AGENTS.md "Review checkpoints and common reasons for rework": movable parts built in asset coordinates (4), mirrored
  signs (5), one-sided faces (7), change only what the task names (8).
- Parts that touch must really meet: no floating hoops or legs, and no gaps you can see through unless they are real
  joints of 2–5 mm.
- Baked and glb renders stay within 1.5 % of the live one; the run prints "baked ok" and "glb ok".
- Not part of a model task: other assets, the materials, shapes.ts, the viewer. If your asset needs something from
  them, say so in the summary.

## Review checkpoints (every model task)

Answer each in your summary, in order, with evidence:
1. Side by side with the reference's baseline: is `<id>.png` built from separate real parts with eased edges at the
   same level of detail? Name the parts.
2. The asset's own question in the task.
3. Do the defaults, every preset and both ends of each range build (quote the core test lines of
   `FORMWERK_ONLY=<id> npm test`), and how many triangles are there at the defaults and at the heaviest extreme?
4. Quote the "ok", "baked ok" and "glb ok" lines for `<id>`.
5. Did only the asset file and its baseline change, with every parameter name, preset and the physics kept?
