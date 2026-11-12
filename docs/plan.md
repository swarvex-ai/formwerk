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
| #165 | model: mushroom cluster | submission 176 (outside contributor) sent back 2026-11-12: spots moved the layout, leaned stems below the floor |
| #166 | sprite: rat | open |
| #167 | icons: upload, share, link | rework (link only; upload and share good) |
| #168 | sound: stream (ambience loop) | accepted (outside contributor), merging |
| #169 | fix (A): skeleton weapon on the wrong side in the back view | submitted (178), waits for peer review |
| #170 | fix (A): pop sound ends on its edge fade (finding 6) | open |

## Milestone "Depth 3: camp and workshop" (estimate 9 tasks)

Cut 2026-11-12 on base c1fd682, all level B, no dependencies, paths disjoint except the union-merged registries.

| Task | Asset | State |
|---|---|---|
| #171 | model: campfire | open |
| #177 | model: vase (replaces #172) | open |
| #173 | surface: bark | open |
| #174 | sprite: frog (hop) | open |
| #175 | icons: copy, undo, redo | open |
| #176 | sound: wood-break | open |
| #178 | fix (A): skeleton back-view walk lifts the leg on the weapon-arm side (finding 8) | waits for #169 |

## Next (lead, level D, not cut yet)

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
