# Plan

Goal (brief): breadth first, every kind of asset with contract, tests and examples; then depth from the swarm.
Requests from other swarvex projects go ahead of everything else.

## Phase 1: breadth (lead, done)

Contracts, tests and reference assets for models, surfaces, sprites, icons, sounds and voices are on main.
Registries merge by union (a26e99c), so parallel asset tasks only share one-line index hunks.

## Phase 2: depth, first swarm batch (level B, one task per asset or small icon set)

No milestone is set on these tasks yet; they were created before milestones were planned.

| Task | Asset | State |
|---|---|---|
| #125 | sofa | merged |
| #126 | wardrobe | merged |
| #127 | window (`windowModel`) | merged |
| #128 | bridge | merged |
| #136 | sprite: skeleton | merged |
| #130 | flower patch / grass tuft | merged |
| #131 | wheelbarrow | merged; fix #148 (wheel ahead of the tray) is submission 151, own account, waits for a peer review |
| #139 | icons: sliders, folder, calendar | accepted (submission 148) |
| #140 | icons: warning, info, wifi | merged |
| #141 | sound: door | replaced by #149 `door-swing`: rework is submission 158, own account, waits for a peer review |
| #142 | sound: coins / cash register | merged |
| #143 | sound: bird and cricket ambience | merged |
| #144 | model: palm tree | merged |
| #145 | model: torch | merged |
| #146 | surface: leather (category `wood`) | submission 147, own account, waits for a peer review |
| #147 | sprite: treasure chest | submission 150, own account, waits for a peer review |

Dependencies: none between these tasks; all build on the contracts on main. Critical path: none (breadth is done).

## Milestone "Depth 2: everyday kit" (estimate 14 tasks)

Created 2026-11-10, all level B, no dependencies between them, paths disjoint except the union-merged registries.

| Task | Asset | State |
|---|---|---|
| #156 | model: desk (drawer rig) | submission 167, own account, waits for a peer review |
| #157 | model: cactus | submission 169, own account, waits for a peer review |
| #158 | model: well (crank rig) | submission 170, own account, waits for a peer review |
| #159 | model: step ladder (fold rig) | submission 171, own account, waits for a peer review |
| #160 | surface: gravel | sent back by peer review (hctib-tech), in progress again |
| #161 | surface: rusted steel | submission 172 after a peer rework, waits for a peer review |
| #162 | sprite: wizard (cast animation) | sent back by peer review, in progress again |
| #163 | icons: pause, volume, refresh | submission 166, own account, waits for a peer review |
| #164 | sound: laser shot | sent back by peer review (end click at length 0.6), open |
| #165 | model: mushroom cluster | merged |
| #166 | sprite: rat | open |
| #167 | icons: upload, share, link | submission 184 (own account) sent back by the lead 2026-11-12: link still a blob, forward preset has no arrowhead |
| #168 | sound: stream (ambience loop) | merged |
| #169 | fix (A): skeleton weapon on the wrong side in the back view | submitted (178), waits for peer review |
| #170 | fix (A): pop sound ends on its edge fade (finding 6) | open |

## Milestone "Depth 3: camp and workshop" (estimate 13 tasks)

Cut 2026-11-12 on base c1fd682, all level B, no dependencies, paths disjoint except the union-merged registries.

| Task | Asset | State |
|---|---|---|
| #171 | model: campfire | submission 182 (own account) waits for peer review, five review points set |
| #177 | model: vase (replaces #172) | submission 189 (own account) waits for peer review |
| #173 | surface: bark | rework is submission 186 (own account), waits for peer review |
| #174 | sprite: frog (hop) | submission 185 (own account) waits for peer review |
| #175 | icons: copy, undo, redo | accepted 2026-11-12 (submission 193, outside) |
| #176 | sound: wood-break | submission 187 (own account) waits for peer review |
| #178 | fix (A): skeleton back-view walk lifts the leg on the weapon-arm side (finding 8) | waits for #169 |
| #179 | model: anvil (optional stump) | submission 191 (own account) waits for peer review, five review points set |
| #180 | model: workbench (vise) | submission 192 (own account) waits for peer review |
| #181 | sprite: snake (slither) | submission 198 (own account) waits for peer review |
| #182 | sound: saw | merged; describe fix by the lead in e96821b |

## Milestone "Depth 4: travel and camp" (estimate 11 tasks)

Cut 2026-11-12 on base 91a8fa4, all level B, no dependencies, paths disjoint except the union-merged registries.

| Task | Asset | State |
|---|---|---|
| #183 | model: tent (flap rig) | merged |
| #184 | model: log pile (`logPile`) | merged |
| #185 | model: cauldron (lid rig, tripod) | submission 199 (own account) waits for peer review |
| #186 | surface: mud | accepted 2026-11-12 (submission 203, outside) |
| #187 | sprite: knight (attack) | merged |
| #188 | sprite: bird (fly, glide) | merged |
| #189 | icons: cloud, camera, pin | merged |
| #190 | sound: bow shot | merged |
| #191 | sound: page turn | merged |

## Milestone "Depth 5: village and road" (estimate 11 tasks)

Cut 2026-11-12 on base e96821b, all level B, no dependencies, paths disjoint except the union-merged registries.

| Task | Asset | State |
|---|---|---|
| #192 | model: lantern (door rig) | accepted (206) |
| #193 | model: hay bale (`hayBale`) | merged |
| #194 | model: mailbox (door and flag rigs) | merged |
| #195 | surface: plaster (damage shows brick) | accepted (209) |
| #196 | sprite: chicken (walk, peck) | merged |
| #197 | sprite: food items (apple, bread, cheese, meat) | merged |
| #198 | icons: bulb, flag, tag | merged |
| #199 | sound: drip (ambience loop) | accepted (211) |
| #200 | sound: sword draw (`swordDraw`) | accepted (213) |

## Milestone "Depth 6: harbour" (estimate 14 tasks)

Cut 2026-11-12 on base 05839d7, all level B, no dependencies, paths disjoint except the union-merged registries.
Ids are unique across all kinds: the anchor icon is `anchor-icon` because the model is `anchor` (#208 closed for it).

| Task | Asset | State |
|---|---|---|
| #201 | fix: door rig axis [0, -1, 0], opens to +z (finding 14) | accepted (submission 214), merge pending; pose() root lookup fixed in ce143e1 (finding 15) |
| #202 | model: pier (railing, bollards) | merged |
| #203 | model: buoy (can, cone, sphere) | accepted 2026-11-12 (submission 219, outside) |
| #204 | model: anchor (admiralty, stockless) | merged |
| #205 | surface: wicker (plain, twill) | accepted 2026-11-12 (submission 223, outside) |
| #206 | sprite: fish (swim, flop) | merged |
| #207 | sprite: crab (walk, pinch) | merged |
| #211 | icons: anchor-icon, compass, globe | closed, replaced by #220 and #221 (four attempts) |
| #213 | icon: globe from a coordinate sketch | closed, replaced by #221 |
| #220 | icons: anchor-icon (compass taken out in review of 278) | accepted (295): ring as `area`, `arms` number in °, baseline committed |
| – | icon: compass, new design | my own design work first: the #220 sketch fails 3204 of 5760 combinations (ticks force L to its minimum, the hollow south half has no room); find a design that passes a full sweep, then cut it |
| #221 | icon: globe from a coordinate sketch (depends on #220) | closed 2026-11-13: the brief geometry fails legibility in 802 of 1296 combinations (306 sent back); the lead verifies a new geometry before recutting |
| #209 | sound: waves (ambience loop) | merged |
| #210 | sound: ship bell (`shipBell`) | merged |

## Milestone "Depth 7: farm" (estimate 10 tasks)

Cut 2026-11-13 on base c240293, all level B, no dependencies, paths disjoint except the union-merged registries.
The icon task has a coordinate sketch per shape from the start.

| Task | Asset | State |
|---|---|---|
| #224 | model: water trough (planks, stone, metal; water level) | rework submitted (269), in checks |
| #225 | model: scarecrow | open |
| #226 | surface: thatch | merged |
| #227 | sprite: pig (idle, walk, eat) | merged |
| #228 | sprite: farm tools (pitchfork, hoe, sickle, watering can) | sent back (263), reserved again |
| #229 | icons: sun, moon (sketched) | check failed (264), back from the pipeline report |
| #230 | sound: rooster crow (voice) | open |
| #231 | sound: hooves (loop, walk/trot/gallop) | 268 failed on the movement budget (finding 30, my cutting mistake); fixed in ff3babc |

## Milestone "Depth 8: tavern" (estimate 9 tasks)

Cut 2026-11-13 on base ff3babc, all level B, no dependencies, paths disjoint except the union-merged registries.
No icon task this round: icons rework at 67 % and #220/#221 are still open.

| Task | Asset | State |
|---|---|---|
| #232 | model: tankard (lid rig) | merged |
| #233 | model: candlestick (1/3/5 arms, lit) | merged |
| #234 | model: fireplace (architecture, arch opening) | merged |
| #235 | surface: hammered copper (metal) | done (283, peer-reviewed) |
| #236 | sprite: cat (idle, walk, sleep) | merged |
| #237 | sprite: drinks (mug, bottle, goblet, cup) | done (285, peer-reviewed) |
| #238 | sound: pour | accepted 2026-11-13 (submission 286, outside) |
| #256 | fix (A): tankard lid built at the floor (fixes #232; the lid and lever used hinge coordinates) | accepted |

## Milestone "Depth 9: study" (estimate 5 tasks)

Cut 2026-11-13, all level B, no dependencies, paths disjoint except the union-merged registries. No icon task (icons
rework at 68 %).

| Task | Asset | State |
|---|---|---|
| #239 | model: books (stack / row with a leaning book) | submitted (289, own account), review points set |
| #240 | surface: flagstone (stone) | accepted 2026-11-13 (submission 292, outside) |
| #241 | sound: writing (pencil, quill, chalk) | submitted (290, own account), review points set; capped at 2.5 s (finding 36 dismissed) |
| #242 | sprite: owl (front, idle/blink/look) | submitted (291, own account), review points set |

## Milestone "Depth 10: graveyard" (estimate 7 tasks)

Cut 2026-11-13 on base 58ed8ca, all level B, no dependencies, paths disjoint except the union-merged registries.
No icon task (icons rework at 70 %; the compass is my own design work first). #243 and #244 were closed within
minutes and replaced by #249 and #248 (my cutting slips: a sideways lean below the base, and a lid hinge that swung
into the body).

| Task | Asset | State |
|---|---|---|
| #249 | model: gravestone (slab / cross / obelisk, plinth, tilt) | merged |
| #248 | model: coffin (box / tapered, lid rig) | submitted (297, own account); review points set |
| #245 | surface: leaf litter (`leaves`, ground) | merged (294, peer-reviewed) |
| #246 | sprite: wolf (idle, walk, howl) | merged |
| #247 | sound: crow (voice, caws) | merged (296) |

## Milestone "Depth 11: kitchen" (estimate 5 tasks)

Cut 2026-11-13, all level B, no dependencies, paths disjoint except the union-merged registries. No icon task (icons
rework at 73 %; #220 anchor is green and waits only for its check). #251 and #252 were closed within minutes and
replaced by #254 and #255 (a self-contradicting height line, and a bee geometry that put the sting into the outer ring).

| Task | Asset | State |
|---|---|---|
| #250 | model: bucket (wood / metal pail, handle rig) | merged (retry 310 accepted) |
| #254 | surface: end grain (butcher block, no voronoi) | merged |
| #255 | sprite: bee (fly, hover) | merged |
| #253 | sound: sizzle (frying loop) | accepted |

## Milestone "Depth 12: garden" (estimate 6 tasks)

Cut 2026-11-13, all level B, no dependencies, paths disjoint except the union-merged registries. No icon task.

| Task | Asset | State |
|---|---|---|
| #257 | model: beehive (straw skep, stand) | submitted (304, own account) |
| #258 | surface: moss (ground, fbm only) | submitted (305, own account) |
| #259 | sprite: snail (idle, crawl, hide) | submitted (307, own account) |
| #260 | sound: bubbling (boiling loop) | submitted (308, own account) |

## Milestone "Depth 13: winter" (estimate 6 tasks)

Cut 2026-11-13 on base 0f80ae2, all level B, no dependencies, paths disjoint except the union-merged registries.
No icon task. The sled geometry was prototyped in a scratch test first (min y 0 at every extreme, < 600 triangles).

| Task | Asset | State |
|---|---|---|
| #261 | model: sled (runners with front curls, slats, backrest) | submitted (312, own account); review points set |
| #262 | surface: ice (cracks from one voronoi, bubbles, frost) | submitted (313, outside) |
| #263 | sprite: hare (idle, hop, alert) | in progress |
| #264 | sound: sleigh bells (loop, hooves loop frame) | in progress |

## Milestone "Depth 14: mine" (estimate 6 tasks)

Cut 2026-11-13 on base c60f8a1, all level B, no dependencies, paths disjoint except the union-merged registries.
No icon task. Every one of the four was built on main in a scratch branch first and passed its core tests at every
extreme and preset (cart 936 triangles / 4 draw calls; slate bakes at 0.00 %; mole 26/26; pickaxe 25/25, < 1.6 s).

| Task | Asset | State |
|---|---|---|
| #265 | model: mine cart (tub, flanged wheels, optional track, load) | merged |
| #266 | surface: slate (strata with ledges, one voronoi for blocks, rust) | merged |
| #267 | sprite: mole (idle, walk, dig into a mound) | merged |
| #268 | sound: pickaxe (tink, bite, crumbs) | open |

## Milestone "Depth 15: castle" (estimate 10 tasks)

Cut 2026-11-13 on base 16d8ccb, level B, no dependencies, paths disjoint except the union-merged registries. No icon
task. Both were built on main in a scratch branch first (throne: 4 draw calls, 416 triangles, baked/glb 0.01 %; horn:
1.65 s, end -114.7 dB, core tests green at every extreme and preset).

| Task | Asset | State |
|---|---|---|
| #269 | model: throne (tall back, arms, cushion, finials, dais) | merged |
| #270 | sound: horn (war horn, hunting horn, conch; one note) | merged |
| #271 | fix: gravel stones at real size (tile 0.25 m, 8–16 cells) | merged (f792358) |
| #272 | fix: upload and share legible in every combination | merged (332) |
| #273 | sprite: crown (points, band with stones, glint) | merged |
| #274 | surface: ashlar (dressed blocks, rock face; scratch-built on 40c27be, baked 0.47 %) | merged |
| #275 | model: battlement (wall, walk, merlons, corbel course; scratch: 26/26, baked 0.02 %) | merged |
| #276 | sprite: scroll (rolls, text lines, seal, unrolls; scratch: sprite tests pass) | merged |
| #277 | model: banner (pole, crossbar, cloth with straight/point/swallowtail end, lozenge, cross foot; scratch: 26/26, baked 0.00 %) | accepted, waiting for merge |

## Milestone "Depth 16: forest" (estimate 6 tasks)

Cut 2026-11-13 on base f792358, level B, no dependencies, paths disjoint except the union-merged registries. No icon
task. All three were built on main in a scratch branch first.

| Task | Asset | State |
|---|---|---|
| #278 | model: tree stump (saw/axe/broken cut, root flares; scratch: 26/26, baked 0.12 %, glb 0.11 %) | 346 accepted 2026-11-13 |
| #279 | sprite: deer (idle, walk, graze; antlers none/spikes/crown, fawn spots; scratch: core tests pass, sheet reads) | done |
| #280 | sound: rustle (foliage swell, leaf grains, twig snaps; scratch: 25/25, max 1.32 s) | submission 347 (own account), in the checks |
| #281 | model: fern (arching feathered fronds, brown crown; scratch on 44c4bea: 26/26, baked 0.13 %, glb 0.13 %) | open |
| #282 | sound: woodpecker (drumming roll that slows and fades; scratch on 44c4bea: tests pass, 0.99 s at defaults) | open |

## Next (lead, level D, not cut yet)

- Contract check for movable parts: the hinge lies within 5 cm of its part's bounding box, measured across the
  rotation axis (the fence gate hinges at the floor on a vertical axis). It would have caught the tankard lid (#256)
  and the bucket handle (299). A scratch sweep of every rigged asset on 2026-11-13 found only the tankard. Add it to
  tests/core/assets.test.ts after #256 is merged.


- Finding 31: foldLoop (src/core/audio.ts) lifts periodic loops by up to +3 dB in their first LOOP_TAIL, so the first
  beat of hooves or heartbeat stands out. An equal-power or level-compensating fold. Changes every loop baseline.

- Finding 9: physics is one fixed object per asset; the anvil wanted static with a stump and dynamic without. Make
  `physics` optionally a function of the values (src/assets/define.ts, protected). Contract change.

- Finding 7: done 2026-11-12 (`timeline()` in src/core/audio.ts, printed by tests/scene/sounds.mjs).
- Finding 38: two voronoi calls in a surface height lose the WebGL device in the bake (normalOf samples the height
  five times). Options: a cheaper edge-distance block in noise.ts, or derive the normal from the baked height map.
  Until then AGENTS.md says one voronoi in the height (finding 39, done).
- Finding 3: the 2.5 % baked-vs-live limit is tight for fine ground surfaces (gravel 2.21 %, grass 2.13 %).

- Finding 1: the scene test renders only the defaults; one extra render per asset (second preset or an extreme) would let
  reviewers see what the parameters do. Touches the protected scene test and every baseline: lead work, after Depth 2.
- Wardrobe doors read weakly: needs metal handles, which needs the furniture draw-call question below first.

- `fabric` material kind (upholstery currently uses `paint` with an effective density).
- Contracts for the next kinds: music, sky, terrain, effects.
- Possibly raise the furniture draw-call cap from 4 to 5 for pieces with metal fittings (protected test; visionary-visible decision).
- Next batch from the second milestone on: put every new task into a named milestone and estimate it with `estimate_milestone`.
