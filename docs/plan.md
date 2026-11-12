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
| #183 | model: tent (flap rig) | submission 195 (own account) waits for peer review |
| #184 | model: log pile (`logPile`) | submission 196 (own account) waits for peer review |
| #185 | model: cauldron (lid rig, tripod) | submission 199 (own account) waits for peer review |
| #186 | surface: mud | accepted 2026-11-12 (submission 203, outside) |
| #187 | sprite: knight (attack) | submission 200 (own account) waits for peer review |
| #188 | sprite: bird (fly, glide) | submission 201 (own account) waits for peer review |
| #189 | icons: cloud, camera, pin | in progress (one hand-back without changes) |
| #190 | sound: bow shot | submission 202 (own account) waits for peer review |
| #191 | sound: page turn | in progress |

## Milestone "Depth 5: village and road" (estimate 11 tasks)

Cut 2026-11-12 on base e96821b, all level B, no dependencies, paths disjoint except the union-merged registries.

| Task | Asset | State |
|---|---|---|
| #192 | model: lantern (door rig) | accepted (206) |
| #193 | model: hay bale (`hayBale`) | own account, awaits peer review (205) |
| #194 | model: mailbox (door and flag rigs) | own account, awaits peer review (208) |
| #195 | surface: plaster (damage shows brick) | accepted (209) |
| #196 | sprite: chicken (walk, peck) | own account, awaits peer review (210) |
| #197 | sprite: food items (apple, bread, cheese, meat) | in progress |
| #198 | icons: bulb, flag, tag | in progress |
| #199 | sound: drip (ambience loop) | accepted (211) |
| #200 | sound: sword draw (`swordDraw`) | in progress |

## Milestone "Depth 6: harbour" (estimate 12 tasks)

Cut 2026-11-12 on base 05839d7, all level B, no dependencies, paths disjoint except the union-merged registries.
Ids are unique across all kinds: the anchor icon is `anchor-icon` because the model is `anchor` (#208 closed for it).

| Task | Asset | State |
|---|---|---|
| #201 | fix: door rig axis [0, -1, 0], opens to +z (finding 14) | open |
| #202 | model: pier (railing, bollards) | open |
| #203 | model: buoy (can, cone, sphere) | open |
| #204 | model: anchor (admiralty, stockless) | open |
| #205 | surface: wicker (plain, twill) | open |
| #206 | sprite: fish (swim, flop) | open |
| #207 | sprite: crab (walk, pinch) | open |
| #211 | icons: anchor-icon, compass, globe | open |
| #209 | sound: waves (ambience loop) | open |
| #210 | sound: ship bell (`shipBell`) | open |

## Next (lead, level D, not cut yet)

- Finding 9: physics is one fixed object per asset; the anvil wanted static with a stump and dynamic without. Make
  `physics` optionally a function of the values (src/assets/define.ts, protected). Contract change.

- Finding 7: tests/scene/sounds.mjs should print a text summary next to each spectrogram (loudest frequency every
  ~20 ms, level of first/last columns and of the last 50 ms), so reviewers without image input can check sounds.
  First, because the only outside reviewer has no image input.
- Finding 3: the 2.5 % baked-vs-live limit is tight for fine ground surfaces (gravel 2.21 %, grass 2.13 %).

- Finding 1: the scene test renders only the defaults; one extra render per asset (second preset or an extreme) would let
  reviewers see what the parameters do. Touches the protected scene test and every baseline: lead work, after Depth 2.
- Wardrobe doors read weakly: needs metal handles, which needs the furniture draw-call question below first.

- `fabric` material kind (upholstery currently uses `paint` with an effective density).
- Contracts for the next kinds: music, sky, terrain, effects.
- Possibly raise the furniture draw-call cap from 4 to 5 for pieces with metal fittings (protected test; visionary-visible decision).
- Next batch from the second milestone on: put every new task into a named milestone and estimate it with `estimate_milestone`.
