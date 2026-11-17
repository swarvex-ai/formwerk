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
2. Materials only from `src/materials` with the options in AGENTS.md (Rules, Materials): `wood` (grain "auto",
   "level" for horizontal slats, aprons and rails, "rings" for the cut face of a stump or log, or "x"/"y"/"z"), `iron` with `rust` for forged or cast iron, `metal` for clean or painted metal, `stone` with `moss`,
   `bark`, and `plain: true` only for leaf cards. A small object passes a larger `scale` (the lantern uses 4). Two wood
   materials alternated give boards their own tone, as the barrel does.
   **Materials per part.** Most sent-back attempts failed here, not on the shape. Give each part the material that
   matches how it is made, and check it in the render:

   | Part | Material line | Wrong (sent back) |
   |---|---|---|
   | boards, slats, rungs, aprons, rails lying level | `material("wood", c, 1, d, { grain: "level" })` | grain "auto" or "y": stripes run across the board |
   | legs, posts, staves, uprights | `material("wood", c)` (grain "auto") | |
   | cut face of a stump (pith on the y axis) | `material("wood", c, 1, d, { grain: "rings" })` | grain "y": straight stripes on the cut |
   | brass, pewter, painted or clean steel | `material("metal", c)` | `iron` with rust: brown blots on brass |
   | forged or cast iron on a small object | `material("iron", c, 5, d, { rust: 0.25 })` | scale 1–2, rust 0.45: big camouflage blots |
   | stone, clay, stoneware | `material("stone", c, …, { moss })` (moss 0 for clay) | |

   A colour parameter that offers brass or iron (its `describe` names both) stays `metal`.
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
- Joints between boards that open to the inside (lids, doors, panels you can see from behind) must not let light
  through: close them from behind with a lining or underlayer set 1–2 mm back, and let end pieces (gables) cover the
  board ends. Check with the movable part open and from the side (chest, cycle 83).
  Open vessels count too (bucket, tub, tankard): staves and floor boards with joints need a lining in the middle of
  the wall (two `grid` faces, front and back) and a disc under the floor, or you see the inside and the ground
  through every joint (bucket, cycle 88).
  A `turned` vessel (mug, cup, jug, pot) must stay open: after the lip, the profile turns down into an inner wall
  and a floor (`[rTop - wand, h], [r(wand) - wand, wand], [0.001, wand]`). If the profile closes back to the axis at the top, the vessel is
  solid and hides its contents. Check a view from above (tankard, cycle 92).
- No two parts share a face: where a board meets another (sides under a top, a back panel in its rebate, a bottom
  board against the back), end one at the face of the other or set it back a few mm. Two faces in the same plane
  flicker (z-fighting) and show both grains.
- `ExtrudeGeometry` with a bevel grows the outline by `bevelSize` and shrinks its holes: shrink the shape by the
  bevel first (or pass `bevelOffset: -bevelSize`), so the part keeps its size and meets its neighbours.
  The bevel also adds `bevelThickness` in front of and behind the extrusion: the part spans -bevelThickness to
  depth + bevelThickness, so extrude `depth - 2 * bevelThickness` (or bury one cap in the neighbouring part) to keep
  the finished size.
- Seats are built for a person: back slats, cushions and backrest boards go on the sitter's side of the posts
  (towards +z), never behind them. Check a side view: the posts show behind the slats (bench, cycle 90).
- Curved ends need enough segments (step 1) and smooth normals; flat-shaded extrusions read as panels.
- Show every preset you were asked about: render it (the gallery test page) and describe what it shows in the
  summary. "The lead rendered it" is not evidence.
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
   Quote `tests/scene/out/<id>.budget.txt` whole: the core test writes the measured triangles and draw calls at the
   defaults, at the heaviest of all tested cases and at every preset. An estimate ("≈") goes back.
4. Quote the "ok", "baked ok" and "glb ok" lines for `<id>`.
5. Did only the asset file and its baseline change, with every parameter name, preset and the physics kept?

## Rulings per task (they override the task text where they differ)

Settled by the lead after peer review. A reviewer checks against these lines, not against the older task text.

- **#359 candlestick:** brass is `metal` and wax is `paint`, so the default has nothing to bake: acceptance 5 ("baked
  ok", "glb ok") does not apply. Instead the summary shows one render of a dark holder colour (`iron`). The wick
  stands in the candle top: the candle foot sinks `tiefe` into the socket, so its top is at `rand - tiefe + kerze`.
- **#368 anvil:** the body is `material("iron", p.colour, 5, undefined, { rust: 0.15 })`, as the task says (cycle 88:
  the earlier "scale 8" here contradicted the task; a later attempt measured scale 5 as speckles, p50 4.2 mm). The horn must still arc down visibly along its length in the side view.
  Cycle 80, after submission 465 (side view rendered by the lead: the horn reads as a thin straight skewer). The horn
  is a cone, not a spike: its root is as tall as the table plus the waist top below it (top edge at the table top,
  bottom edge at about 0.62 h at the root), both radii taper linearly to the nose (exponent 1, not 0.55 or 0.68), and
  the top edge drops by at least 0.2 h from root to tip, so the arc shows in the side view. The nose may end below the
  face block bottom; it stays above 0.5 h, well clear of the foot plate.
- **#369 ladder:** the four draw calls do not allow two woods in the movable rear frame. The hinges belong to the
  fixed part (on the top cap, `metal`), and the whole rear frame (stiles and rungs) uses the stile wood
  `material("wood", "#a87444")` (grain "auto"). Aluminium: the rear frame is `metal`. That gives front {stile wood,
  level wood, metal} + rear {stile wood} = 4.
- **#372 bed:** no wood pokes through the blanket. Legs may rise a little above the rails (merged: 3.5 cm) as long as
  their top stays below the blanket hem; under a headboard or footboard the leg is its post with a cap. Changed in
  cycle 84 after submission 485, which kept the purpose of the older flush-leg ruling with legs 1 cm below the hem.
- **#374 wardrobe:** the doors are overlay doors that sit against the carcass front: the back face of each leaf
  lies at most 1 mm in front of the side and bottom front edges (no open slot around the doors). All reveals, between
  doors and to the carcass (top, bottom, sides), are 3–4 mm. With 4 doors the centre pair is one rigid part, so it
  keeps one handle as on main: on the right edge of its right leaf. Cycle 81, after submission 476 (peer review
  marco8154, points 4 and 5 left to the lead).
- **#363 chest:** the fittings are clean `metal` (no `rust`), every board has grain "level". The lid joints are closed
  from inside: arched boards run between full-arch gables with a lining 2 mm above their inner faces; the flat lid has
  an underlayer set in from every edge. Cycle 83, after submission 484.
