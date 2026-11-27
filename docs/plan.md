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

## Milestone "Depth 7: farm" (estimate 11 tasks)

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
| #300 | icon fix: sun (fixes #229; core gives way, sharp 12-ray caps apart; lead's diff, sweep 0 of 5040 on 3aa4988) | accepted (366; lead re-ran the sweep on the patch: 0 of 5040) |
| #301 | icon fix: moon (fixes #229; star inside the grid from the lead, horn slits by the contributor; sweep was 784 of 3528) | open |
| #302 | icon fix: wifi (off slash at size 18, four arcs; sweep was 84 of 14112) | accepted (374) |
| #305 | icon fix: undo and redo (radius gives way through largest(), open head legs grow below stroke 1.25; sweep was 162 and 168 of 3528) | accepted (372), both sweeps 0 of 3528; #308 closed as its duplicate |
| #309 | icon fix: clock (hands just past the lay-on threshold leave a sliver; sweep was 56 of 3528) | open (milestone Icons: sweep clean) |
| #310 | icon fix: tag (ring hole with string cuts slivers; sweep was 31 of 1008) | closed: duplicate of #306 (main already sweeps 0 of 1008; 388 rejected) |
| #318 | icon fix: plus (size.min 13 → 13.5; sweep was 21 of 37044, too little ink) | open (milestone Icons: sweep clean) |
| #319 | icon fix: check (double check closes up inside a frame, too little ink at size 17; sweep was 3225 of 74088) | merged (819c5ee) |
| #320 | icon fix: download (block arrow pointing up touches the walls of a deep tray; sweep was 3 of 7056) | in peer review (523, 17 Nov; lead reproduced the full sweep: 0 of 7056) |
| #321 | icon fix: pencil (gaps close at length 14 and for thick pencils at strong strokes; sweep was 991 of 24696) | in peer review (520, 17 Nov; lead reproduced the full sweep: 0 of 24696) |
| #572 | icon fix: star (solid tips reach 0.7 of the edge; a point too slim for a hollow, tip depth > 0.8 edge, draws the star solid; sweep was 226 of 7056; prototype in .claude/proto/star-fix.diff) | accepted 20 Nov (733, code identical to the prototype; FORMWERK_ONLY=star green on the patch; sweep 0 of 7056) |
| #573 | icon fix: arrow (a free arrow at stroke 1 grows until shaft plus arms ≥ 25 / stroke; sweep was 840 of 148176, all ink below 4 %; slice frame none, stroke 1: 0 of 8232; full sweep 0 of 148176; sheet unchanged; prototype in .claude/proto/arrow-fix.diff) | accepted 20 Nov (730, byte-identical to the prototype) |
| #574 | icon fix: folder (open flap: build inside `largest` over the width so sharp miters fit; lean always 3; sweep was 177 of 7056; full sweep 0 of 7056; sheet unchanged; prototype in .claude/proto/folder-fix.diff) | accepted 20 Nov (731, byte-identical to the prototype) |
| #575 | icon fix: user (people 2 head 3.25: back head ring closes on the front head; people 3 stroke 1: back bodies break into slivers; sweep was 264 of 5292; open-ended, no prototype) | accepted 20 Nov (737, cycle 178): back-head radius searched so the front gaps cut each ring cleanly; FORMWERK_ONLY=user green on the patch, sheet unchanged, lead full sweep 0 of 5292 |
| #576 | icon fix: flag (notch and pennant tips with a wave pinch a pocket off the hollow: 306 cases; pennant point at stroke 2.25 breaks: 3; one filled pennant gap; sweep 310 of 5292; open-ended, fade the wave towards the tips) | accepted 20 Nov (739, cycle 180): notch waves up to a stroke before its corner with straight prongs, pennant wave fades with (1 − t); wave 0 unchanged, only the swallowtail sheet row changed; lead full sweep on the patch 0 of 5292 |
| #577 | icon fix: mark (free symbols below the ink floor at small sizes and thin strokes, about 480 cases; sharp question mark's turned stem cap closes on the dot, 48 cases; sweep 573 of 7056 before the floor change 604b83a; open-ended) | accepted 20 Nov (740, cycle 180): free symbols grow from stroke lengths and pen until 10 % above the floor, inside ±10.9; sharp question stem ends vertically; sheet unchanged; lead full sweep on the patch 0 of 7056 |
| #578 | icon fix: warning (sharp triangle at stroke 2 and 2.25: the stem's square cap corners come within 0.8 of the slopes; one line, `oben` + hw · schraeg for sharp caps; sweep was 406 of 24696; lead prototype full sweep 0 of 24696, sheet unchanged; .claude/proto/warning-fix.diff) | accepted 20 Nov (741, cycle 181, byte-identical to the prototype; contributor full sweep 0 of 24696, sheet unchanged) |
| #579 | icon sweep and fix: gear (full sweep never finished in the lead sandbox; contributor runs it in stroke slices, fixes what fails in gear.ts, commits the full sweep output to docs/sweeps/gear.txt) | merged 21 Nov (cycle 196): 0 of 86436 without a change, docs/sweeps/gear.txt |
| #580 | icon sweep and fix: bell | closed 21 Nov (cycle 207): handed back 3 times on the sandbox time limit; replaced by #591–#596 |
| #591–#596 | icon sweep slices: bell at stroke 1, 1.25, 1.5, 1.75, 2, 2.25 (level A, three style slices each, docs/sweeps/bell/stroke-<s>.txt) | 1.25 and 2 accepted; 1, 1.5, 1.75, 2.25 in peer review (cycle 209). Failures only at corners sharp, width 17–18 |
| #597 | icon fix: bell, sharp corners at width 17–18 (outer ring, closing gap, thin ink) | open, cut 22 Nov (cycle 209) |
| #598–#603 | icon sweep after the fix: bell at each stroke, into docs/sweeps/bell/after-fix/ | blocked on #597 |
| #581 | icon sweep and fix: eye (same as #579; docs/sweeps/eye.txt) | open, cut 20 Nov (cycle 181) |
| #322 | icon fix: refresh (arrow heads close up at arrowSize 2.5 and strong strokes; sweep was 456 of 14112) | accepted 16 Nov (submission 455, outside contributor; full sweep 0 of 14112) |

Sweeps already clean (0 failures, 2026-11-14): anchor-icon, bulb, camera, chart, close, copy, link, pause, play, search, share, sliders, sun (after #300), trash, upload. Clean after a fix: undo and redo (#305), moon (#301), wifi (#302), plus, clock, check (#319), refresh (#322). In peer review: tag (#306, 375). Failing with a fix task: download (#320), pencil (#321), volume (#350, submission 405 in peer review since 15 Nov). Swept 20 Nov (cycle 174): home (0 of 10584), list (0 of 15876), heart (0 of 12348) clean; star 226 of 7056 → #572 (lead prototype, full sweep 0 of 7056); arrow 840 of 148176 → #573. Swept 20 Nov (cycle 175): calendar (0 of 7056) and cloud (0 of 2268) clean; folder 177 of 7056 → #574; mail 4 of 12348 (sharp, stroke 1.5, 45° fold arms: 1-pixel pinholes on the seam between segment band and miter join in the contract raster; fixed in the raster by the lead, 9364da6, icon sheets unchanged); user 264 of 5292 (people 2, head 3.25: gap closes, 168; people 3, stroke 1: ink breaks, 96) → #575. Swept 20 Nov (cycle 177): mail 0 of 12348 with the raster fix, pin 0 of 5292. Swept 20 Nov (cycle 179): info 0 of 24696 clean; flag 310 of 5292 → #576; mark 573 of 7056 → #577 (after the contract change 604b83a: the ink floor is 4 % × stroke / 1.25 below stroke 1.25, because a free minus at stroke 1 cannot reach 4 % inside the live area); warning 406 of 24696 (sharp triangle at stroke 2 and 2.25: the stem's square cap corners come within 0.8 of the slopes; → #578 with the lead prototype, full sweep 0 of 24696, sheet unchanged); lock 0 of 49392 clean. Not yet swept: gear (full sweep over 50 min, use slices), bell and eye (40 min without a result in cycle 177, use slices). Cycle 180: the lead sandbox has 4 CPUs (cpu.max), so parallel slices share them; bell per-stroke slices (8232 each) did not finish in 20 CPU-min each; eye per-stroke slices restarted but left no result. Cycle 181: gear, bell and eye go to the swarm as sweep-and-fix tasks #579–#581 (long jobs are tasks, LEAD.md section 7). Milestone "Icons: sweep clean" estimate 19. Cycle 207: bell (49392 combinations, ~4 h) split into six stroke-slice tasks #591–#596; estimate 25.

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
| #248 | model: coffin (box / tapered, lid rig) | merged (9ea7316) |
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
| #278 | model: tree stump (saw/axe/broken cut, root flares; scratch: 26/26, baked 0.12 %, glb 0.11 %) | merged (49e175f) |
| #279 | sprite: deer (idle, walk, graze; antlers none/spikes/crown, fawn spots; scratch: core tests pass, sheet reads) | done |
| #280 | sound: rustle (foliage swell, leaf grains, twig snaps; scratch: 25/25, max 1.32 s) | merged (b32d4fa) |
| #281 | model: fern (arching feathered fronds, brown crown; scratch on 44c4bea: 26/26, baked 0.13 %, glb 0.13 %) | merged (ded2b6e) |
| #282 | sound: woodpecker (drumming roll that slows and fades; scratch on 44c4bea: tests pass, 0.99 s at defaults) | merged (18b36ae) |

## Milestone "Depth 17: pond" (estimate 4 tasks)

Cut 2026-11-13 on base b32d4fa, level B, no dependencies, paths disjoint except the union-merged registries. No icon
or surface task. All three were built on main in a scratch worktree first, and each brief carries the full file.

| Task | Asset | State |
|---|---|---|
| #283 | sound: croak (pulsed frog calls; common frog, bullfrog, tree frog; scratch: tests pass, 1.6 s at defaults, longest 3.82 s of 3.9) | merged (20a55bd) |
| #284 | sprite: duck (idle, walk, swim; mallard, hen, duckling, farm duck; scratch: 26 tests green, sheet reads) | accepted (352), waits for merge |
| #285 | model: reeds (cattail, common reed, sedge; scratch: 26/26, 2 draw calls, 778 triangles, baked 0.10 %, glb 0.11 %) | accepted, waits for merge |

## Milestone "Depth 18: night" (estimate 2 tasks, done)

Cut 2026-11-14 on base 20a55bd, level B, no dependencies, paths disjoint except the union-merged registries. Both new
assets were built in a scratch worktree first, and each brief carries the full file.

| Task | Asset | State |
|---|---|---|
| #286 | sound: hoot (soft hollow owl hoots, the last long and quavering; tawny, eagle owl, lone; scratch: 25/25, 1.38 s at defaults, longest 3.27 s of 3.4) | accepted (354), waits for merge |
| #287 | sprite: moth (idle with folded wings, fly up/level/down/level; moth, luna, tiger, clothes moth; scratch: 26/26, sheet reads in every preset) | merged (b2ad1ad) |

## Milestone "Look: realistic" (estimate 66 tasks: foundation, 4 presentation, #323, about 60 other models one task each)

Visionary decision of 14 Nov 2026: the 3D look moves from blocky to realistic, or stylised-realistic where realism
costs too much. Formwerk is now a hybrid: the software role cards plus the game cards **art** (`roles/game/art.md`,
owns `docs/style-guide.md`, the gate for model, surface and sprite tasks) and **audio** (`roles/game/audio.md`, sounds
and voices). The lead plays both until the numbers call for area leads. New tasks for models and surfaces use
`role: art` from now on; sounds keep `audio`.

Order (each stage gates the next):
1. Scene render at 640 × 480: done by the lead (f181c42), all 95 model and surface baselines re-rendered.
2. Style guide: **accepted by the visionary on 14 Nov 2026** (models and surfaces; sprites stay pixel art, icons stay
   line icons). New triangle limits set in tests/core/assets.test.ts (b4d0e57): furniture 60k, architecture 80k,
   nature 150k, vehicles 150k, props 30k.
3. **Foundation #324** (visionary exception, 14 Nov 2026): Claude builds stage 1 light (the content of the closed
   #288), the shared materials wood, metal and stone with relief and roughness variation (plus the bake of those maps
   in src/core/export.ts) and five reference assets (barrel, chair, tree, rock, lantern) as ONE submission that the
   lead reviews. **Merged 14 Nov 2026** (1be2c0c + scarecrow baseline 5103a8e), #324 closed.
4. **Families (cutting now):** cut the other asset families, one task per asset, each measured against the matching
   reference asset (furniture → chair, containers and props → barrel or lantern, plants → tree, stones and terrain
   → rock). No stage 2/3 tasks for the five reference families themselves. Every task text carries a "Review
   checkpoints" section (lever H). Shared steps, traps and checkpoints: `docs/look-realistic.md`. First batch
   #354–#362: table, crate, chest, bucket, cauldron, candlestick, stump, bush, gravestone (#356 chest recut as #363
   with the corrected hinge rule). Coffin: #364. Second batch #365–#370: bench, shelf, tankard, anvil, ladder, trough. Third batch #372–#375: bed, desk, wardrobe, workbench (#371 workbench closed, replaced by #375). Fourth batch #478–#481: throne, well, mailbox, lamp post (signpost waits for the per-part grain axis too: its boards turn by `spread`, so "level" grain runs diagonally). Log pile waits: grain "rings" centres on the y axis, so lying logs need a per-part axis first. Next batches as these land
   (keep supply above active agents): the remaining ~51 models, a few per family, each its own file and baseline.
5. Presentation (visionary decision of 14 Nov 2026, from a look at how 3DGarden presents models; its ideas only, never
   its code or models): AO and a firm key light, the scan reveal as Formwerk's signature, a wireframe toggle with the
   asset's weight, and a catalogue overview. Gallery only. The scene tests keep the stage 1 look, so no baseline
   changes (ruling: AO in the tests only later, if it renders deterministically under SwiftShader). #351 → #352 →
   #353 share viewer.ts, models.ts and scan.ts, so they run in sequence.

Speed (visionary, levers C and H, 14 Nov 2026): #323 done (b4d0e57): a one-asset `npm test` renders only that
asset's files (13 s instead of about 75 s), the scene test stops a hanging asset after FORMWERK_TIMEOUT (240 s). AGENTS.md
has a "Review checkpoints and common reasons for rework" section from rework_patterns; refresh it weekly.

| Task | What | State |
|---|---|---|
| #324 | foundation: stage 1 viewer, materials with relief, bake of the new maps, five reference assets | merged (5103a8e) |
| #315 | gallery: catalogue overview in the models list (triangles, code KB, filters, shuffle); produces `facts.ts`, `collections.ts` | merged (97df66a) |
| #351 | gallery: GTAO and a firm key light as look "gallery" (setLook); replaces #325 | accepted 16 Nov (503, after reworks 457 and 487) |
| #352 | gallery: scan reveal; replaces #326 | 687 back in rework (cycle 150): ms vs s in tick, plane normals inverted, LineLoop; 735 (my account) back in rework (cycle 178): works in the browser (geometries 7 → 7 after 20 changes, reduced motion skips), but the rim is still a LineLoop, which r187 refuses: use Line with a closing point |
| #353 | gallery: wireframe toggle with the asset's weight; replaces #327 | after #352 |
| #354–#362 | realistic look: table, crate, chest, bucket, cauldron, candlestick, stump, bush, gravestone | table, crate, cauldron, stump, bush merged; gravestone in peer review (527, 17 Nov); bucket closed after four rounds (601 rejected, 18 Nov) and recut as #482 wooden body (accepted, 604, 18 Nov) → #484 metal body, ears, bail and floor seams (replaces #483; accepted, 619, 18 Nov) → #504 wall lining for the stave joints (finding 126); candlestick accepted on the fifth attempt (605, 18 Nov) → #485 arm cups closed from below and drip pans; chest (#363) accepted (486, 16 Nov) |
| #364 | realistic look: coffin | merged (0a91ade) |
| #365–#370 | realistic look: bench, shelf, tankard, anvil, ladder, trough (each task names the material per part) | shelf and trough merged; bench, tankard and anvil sent back again by peer review (16 Nov: heaviest extreme not measured, lid, anvil floats above the stump); bench (557) sent back 17 Nov with a one-line tested fix (back slats behind the posts), accepted 17 Nov (560); tankard (563) sent back 17 Nov with a tested recipe (solid pewter/clay profiles, stave joints without lining, no floor), accepted 17 Nov (564); anvil accepted 17 Nov (566); ladder accepted 16 Nov (482); rulings in docs/look-realistic.md |
| #372–#375 | realistic look: bed, desk, wardrobe, workbench (materials per part fitted to the 4 draw calls) | desk and workbench merged; bed accepted (485, 16 Nov, outside contributor); wardrobe sent back again (476, 16 Nov: reveals 8 mm, floating doors, centre-pair handles, extreme estimated; 565, 17 Nov: 3-door layout broken, panel slots, floating pull, upright knob, tested diff in the review) and accepted (568, 17 Nov, outside contributor); ruling for #374 in docs/look-realistic.md |
| #478–#481 | realistic look: throne (chair), well (rock and barrel), mailbox (lantern), lamp post (lantern); cut 18 Nov, materials per part fitted to each draw-call budget | #478, #480 and #481 accepted 18 Nov (#481 → #500 arm minimum per style); #479 open |
| #501–#503 | realistic look: vase (barrel; open with foot ring, rolled lip, strap handles), books (chair; rounded boards, curved spine, no shared faces), column (rock; entasis, flute stops, Attic base, capitals); cut 18 Nov | all three accepted (629, 630, 646; 18–19 Nov) |
| #521–#522 | realistic look: stairs (rock and chair; one stepped body with nosing slabs, stringers flat on the floor, round handrail, 3 draw calls), window (chair; rounded members, no z-fighting at bar crossings, glass in grooves, rosette and lever); cut 19 Nov | open |
| #526–#527 | realistic look: fence (chair; capped posts, rails per bay into the posts, pointed pickets, gate brace and hinges, 5 draw calls), door (chair; stiles and rails, raised panels, glass in beads, door stop, rosette and lever, 6 draw calls); cut 19 Nov (#524, #525 closed: first cut with contradicting numbers) | #526 merged (4 draw calls; architecture limit raised to 6 afterwards), #527 open |
| #531–#532 | realistic look: torch (lantern; open turned iron bowl, tapered shaft, turned foot, rounded bracket with torus ring, teardrop flames, 4 draw calls), pier (chair; rounded posts into the stringers, two plank tones, railing posts in the planks, rails per bay, turned bollards, 4 draw calls); cut 19 Nov | open |
| #533, #535–#537 | materials: grain "part" + `grained()` (lead, level D); grain per part: wardrobe, throne, fence | #533 merged; #535 accepted (673), #536 accepted (677, after the rotateY trap), #537 accepted (678, brace grained before rotateZ); 19 Nov |
| #540–#541 | grain per part: well (axle, drum, handle along x; beams along x or z; finding 132), realistic look: buoy (lantern; turned closed bodies, rusted ballast tail, lifting eye, 4 draw calls); cut 19 Nov | #540 accepted 19 Nov (cycle 144); #541 accepted (689, cycle 150) |
| #543–#544 | realistic look: hay bale (barrel; rounded square bale, closed turned round bale, twine on the surface all round, 2 draw calls), mushrooms (tree; turned stems with a swollen foot, 32-segment caps, gill skirt under each cap, 3 draw calls); cut 19 Nov (cycle 149) | #543 accepted (692, cycle 150); #544 back in rework (691: my brief put the gills inside the cap and the foot on a point) |
| #545–#546 | realistic look: market stall (chair; rounded posts, board counter with lining, sagging DoubleSide cloth strips, valance tongues, 3 draw calls), tent (lantern; sagging grid panels, ridge seam, turned poles, 3 draw calls); cut 19 Nov (cycle 150) | #545 merged (cycle 151), #546 open |
| #547, #549 | realistic look: banner (chair; turned pole and spike, folded grid cloth with a sleeve, emblem on the folds, 4 draw calls), battlement (rock; plinth, evenly spaced stepped corbels, copings, sills, one stone with moss, 1 draw call; #548 closed for overlapping corbels); cut 19 Nov (cycle 151) | #547 merged (cycle 153), #549 accepted (697, cycle 154) |
| #550 | realistic look: fireplace (rock; U-shaped beveled front, rounded boxes, turned logs in bark, 4 draw calls); cut 19 Nov (cycle 152) | open |
| #551–#552 | realistic look: scarecrow (barrel; eased post, grained crossbar, turned coat with folds, turned sleeves, sack neck with tie, turned hats, 3 draw calls), bridge (chair; planks on extruded curved stringers, stone abutments, cap beams on posts, rounded rails, tube ropes, 4 draw calls); both prototyped by the lead; cut 19 Nov (cycle 154); bridge accepted cycle 155, scarecrow accepted cycle 157 | done |
| #553 | realistic look: server rack (lantern; recessed plinth on turned feet, eased walls, 19-inch rails and devices, eased door frame, 4 draw calls); prototyped by the lead; cut 19 Nov (cycle 155) | open |
| #554–#555 | realistic look: sled (chair; one swept flat-bar runner per side with rear upturn and front curl bolted under the rail, eased rails, posts and slats in one wood with grain "part", 2 draw calls), cart (chair; boarded bed and walls, iron tyre on a felloe, 12 turned spokes, banded turned hub, 2 draw calls); both prototyped by the lead with the full build in the brief; cut 19 Nov (cycle 158) | #554 accepted cycle 159 (707); #555 accepted cycle 160 (708) |
| #557–#558 | realistic look: wheelbarrow (lantern and chair; pressed sheet pan with rolled rim or a box of eased boards, splayed tube rails with rubber grips, tube legs on foot plates, tyre on a pressed rim, 4 draw calls), cactus (tree; arms as one ribbed tube round an elbow, spine pairs on the crests, cup flowers, rounder barrel, 3 draw calls); both prototyped by the lead with the full build in the brief; cut 19 Nov (cycle 159) | #557 accepted cycle 161 (709); #558 accepted cycle 161 (710) |
| #559–#560 | realistic look: signpost (chair; round turned post and cap so boards lie flush at any angle, bevelled boards with two nails, grain per board, 2 draw calls), mine cart (chair and lantern; flat-bottom rails on sleepers, flanged dished wheels on bearing blocks, boarded or sheet tub with straps, angle irons and rivets, heaped rock surface with lumps, 4 draw calls); both prototyped by the lead with the full build in the brief; cut 19 Nov (cycle 160) | open |
| #561–#562 | realistic look: boat (chair and lantern; clinker strakes with 18 mm laps fading at the stem, transom board, round gunwale rails and transom capping rail, keel rising into the stem post, ribs, floorboards, risers, thwarts fitted to the hull, bronze rowlocks, turned oars, 4 draw calls), palm (tree; one smooth ringed trunk tube with a flared foot and a closed crown shaft, fronds with a rachis tube and folded leaflets in two plain shades, 3 draw calls); both prototyped by the lead with the full build in the brief; cut 19 Nov (cycle 161) | boat accepted (713, cycle 164); palm accepted (716, cycle 166) |
| #563–#564, #566 | realistic look: reeds (tree; folded pointed blades in two plain shades, turned cattail stalks, closed heads and spikes, uneven root mound, 3 draw calls), fern; #566 the rock lumps without `toNonIndexed()` (finding 143); cut 19 Nov (cycles 162–163) | reeds accepted (717, cycle 167); fern accepted (719, cycle 168); #566 open |
| #567–#568 | realistic look: tank (mine cart and lantern; cast links with grousers on the convex hull of sprocket, idler and tyred road wheels, bevelled hull with sponsons, chamfered turret, turned gun with fume extractor and bored muzzle brake, cupola with vision blocks, 5 draw calls), flowers (tree; folded grass and leaves, round stems, double-sided petals that cup for tulips, golden centre dome, turf mound, 3 draw calls, nothing to bake); both prototyped by the lead with the full build in the brief; cut 19 Nov (cycle 167) | open |
| #569 | realistic look: car (mine cart and lantern; filleted side profile with wheel arches cut in, extruded with a 7 cm bevel, dark wheel wells, lofted greenhouse with tumblehome and panes on it so the pillars stay in paint, open pickup bed above the arches, door seams, handles, mirrors, grille, lights, plates, five-spoke rims, 6 draw calls, nothing to bake); prototyped by the lead with the full build in the brief; cut 20 Nov (cycle 169), accepted 20 Nov (cycle 171) | done |
| #570 | realistic look: log pile (tree and stump; bark with grain "part" so furrows run along each log, cut ends with round rings about an off-centre pith from `grained(…, "x", [x, y, z])`, logs not quite round with a slight taper, end discs on the tube outline, 2 draw calls, baked 0.73 %); needs the per-part pith (lead, 2df350c); prototyped by the lead with the full build in the brief; cut 20 Nov (cycle 172) | accepted 20 Nov (726, cycle 173) |
| #571 | realistic look: campfire (rock, stump and log pile; broken field stones with fracture faces and creased normals, a low ash mound with an uneven edge, bark logs with grain "part" whose ends are charred, burnt down and rounded, with a ragged char edge and rings on the end caps, teepee logs crossing at the top, 4 draw calls, baked 0.65 %); prototyped by the lead with the whole file in the brief; cut 20 Nov (cycle 173) | accepted 20 Nov (727, cycle 174) |
| #539, #542 | beehive entrance: #539 bent the plate around the coil (rejected 679, the brief was wrong: still a slab from the side, triangle fan from the front); #542 cuts a gap into the lowest coil instead (open torus, straw caps, dark strip behind; prototyped by the lead); 19 Nov | #539 closed, #542 open |

(#325–#327 closed: #324 was merged outside the platform, so their dependency never resolved; recut as #351–#353.
#288, #312, #316 and #317 are closed: replaced by #324–#327. #311, #313, #314 were the first cut of the presentation
tasks and are closed too.)

## Milestone "Depth 19: dungeon" (estimate 10 tasks, done)

Cut 2026-11-14 on base a16c837 while #288 re-renders every model and surface baseline: only kinds without a 3D
baseline (sprites, sounds, icons), so nothing collides with #288 or needs a second re-render. Level B, no
dependencies, paths disjoint except the union-merged registries. Both built in a scratch worktree first, and each brief
carries the full file.

| Task | Asset | State |
|---|---|---|
| #289 | sprite: torch-sprite (16 × 16 item, flickering flame; torch, sconce, magic; scratch: sprite tests green, sheet reads in every preset) | merged |
| #290 | sound: chain (shake, drag, drop; keys, shackles, anchor; scratch: tests green, 0.58 s at defaults, longest 1.27 s of 1.5) | merged |
| #291 | sprite: lever (16 × 16 item, pull animation; wall, floor, switch; scratch on 410ffb7: core 26/26, sheet reads in every preset and at throw 60 / length 7) | merged |
| #292 | sound: stone-slide (grind, grit, judder, thump; secret door, tomb lid, block; scratch on 410ffb7: 25/25, 1.18 s at defaults, longest inside 1.5 s) | merged |
| #293 | sprite: spikes (16 × 16 floor trap, spring animation; dungeon, rusty, crypt; scratch on fcc3481: core 26/26, every other spike two pixels lower so the outline does not turn the row into bars) | merged |
| #294 | sound: portcullis (ratchet clicks, rumble, slam or pawl clunk; castle gate, winch, cell grate; scratch on fcc3481: 25/25, 2.05 s at defaults, longest 3.46 s of maxSeconds 3.5) | merged |
| #295 | sound: lock-turn (key in, pin clicks, bolt; door, padlock, cell door; scratch on a7a5a0f: 25/25, 0.87 s at defaults, longest 1.37 s of 2.2; id not `lock`, the icon has it) | merged |
| #296 | sprite: pot (16 × 16 clay pot, smash animation; jar, amphora, cooking pot; scratch on 0b5fc84: core 26/26, sheet reads in every preset and at both extremes; belly capped at 5 so the wobble frame stays off the outline ring) | merged |
| #297 | sound: bones (rattle in three bursts or collapse with a thump; walk, collapse, charm; scratch on 0b5fc84: 25/25, 0.49 s at defaults around 1.1–1.3 kHz, longest 1.04 s of 1.5) | merged |

## Milestone "Depth 20: game table" (estimate 5 tasks)

Cut 2026-11-14 on base 2b30097, same rule as Depth 19 (no 3D baselines while #288 runs). Dice are on the kit list in
AGENTS.md. Level B, no dependencies; dice-roll registers after knock, away from the impact sounds after woodpecker.

| Task | Asset | State |
|---|---|---|
| #298 | sprite: die (16 × 16 item, roll animation of quarter turns ending on the chosen face; classic, casino, small black; scratch on 2b30097: core 26/26, sheet reads in every preset and size; tilted frames blank because squeezed pips merge into bars) | merged |
| #299 | sound: dice-roll (cup rattle, clacks with a surface knock, shrinking bounces; board game, dice cup, felt tray; scratch on 2b30097: 25/25, 0.53 s at defaults, centroid 3–4.5 kHz, longest 1.58 s of 2.5) | merged |
| #303 | sprite: card (16 × 16 item, suit, rank A–K, size 12–14, back colour; flip from the lattice back through the edge to the face; ace of spades, king of hearts red back, old seven of diamonds; scratch on 225bc5e: core 26/26, sheet reads in every preset, suit and both sizes; size stops at 12, glyphs blank while squeezed) | accepted (368) |
| #304 | sound: card-shuffle (riffle with flicks, bridge flutter and a tap, or dealing; riffle, deal, new deck; scratch on 225bc5e: 25/25, 1.15 s at defaults, flick centroid 5–6 kHz, longest 2.07 s of 2.5) | accepted (369) |

## Milestone "Depth 21: market" (estimate 6 tasks)

Cut in cycle 182 for low supply (0 free tasks for 3 active agents). Open-ended briefs (no lead prototype): each names the
file to copy, exact parameter and preset names, and review checkpoints. The four tasks touch different registries, so
they run in parallel; the merchant waits for the goat (same sprite registries).

| Task | Asset | State |
|---|---|---|
| #582 | sprite: goat (16 × 16, idle, walk, graze; kid, goat, billy; plain, patched, saddle) | open |
| #583 | sound: cart-wheels (loop; wood or iron rim on cobble, dirt, planks; speed, load, creak) | open |
| #584 | model: scales (balance on a post, two pans on chains or cords, tilt; props, ≤ 4 draw calls) | open |
| #586 | sprite: merchant (24 × 32 like the villager, idle, walk, call; hat, beard, apron, purse; after #582) | waits for #582 |

#585 is closed: it said 16 × 16, the villager is 24 × 32; replaced by #586. All four are merged (cycle 195).

## Milestone "Depth 22: stable" (estimate 5 tasks)

Cut in cycle 196 for low supply (1 free task for 1 active agent). Briefs written the same way as Depth 21. No two tasks share a registry,
except that straw and the hitching post both add lines to src/index.ts, at separate places (after grass and after fence).

| Task | Asset | State |
|---|---|---|
| #587 | sprite: horse (24 × 24 like the bat, idle, walk, graze; pony, horse, draught; blaze, socks, saddle) | open |
| #588 | sound: whinny (voice; squeal falling in pulses to a nicker or snort; size, excitement, distance) | open |
| #589 | surface: straw (ground; crossing strands over a floor; coverage, strand length, trampled) | open |
| #590 | model: hitching-post (architecture; rail on two posts, iron rings; sawn or round, ≤ 6 draw calls) | open |

## Milestone "Depth 23: smithy" (estimate 10 tasks)

Cut in cycle 225 for low supply (0 free tasks for 1 active agent). Briefs written the same way as Depth 21 and 22. No two
open tasks share a registry: the quench waits for the bellows (same sound registries).

| Task | Asset | State |
|---|---|---|
| #616 | model: grindstone (props; stone wheel on an iron axle with a crank as rig `wheel`, trestle or posts frame, optional trough; 3 draw calls) | open |
| #617 | sprite: blacksmith (24 × 32 like the merchant, idle, walk, hammer; leather apron, bare forearms, beard) | open |
| #618 | sound: bellows (ambience one-shot; strokes of breathy air with a leather creak and a wooden knock) | merged; the lead moves it to src/sounds/ambience/ after #623 merges |
| #619 | sound: quench (effects) | closed: effects one-shots are capped at 2.5 s; replaced by #623 |
| #623 | sound: quench (ambience one-shot like thunder; hiss falling into bubbling and a fading sizzle; after #618) | accepted (cycle 253) |
| #620 | surface: cinders (ground; clinker lumps in ash with iron-scale flecks; one voronoi in the height) | accepted (cycle 233) |
| #621 | icon: hammer (objects; claw or sledge, tilt, handle length; full sweep at 0) | accepted (cycle 238) |
| #622 | model: forge (architecture; stone hearth, coal recess with glow, back stack, stone or iron hood; ≤ 3 draw calls) | accepted (cycle 232) |
| #627 | model fix: forge coals as dark lumps on the glowing bed (4 draw calls; after #622) | accepted (cycle 234) |

Cycle 227 added #620–#622 for low supply (0 free tasks for 2 active agents). Registries: cinders and forge both add to
src/index.ts, at separate places (after straw, after fireplace); the grindstone rework adds after scales.

Cycle 231: finding 167 showed the bellows brief broke the effects cap (2.5 s); ruling: bellows and quench are ambience
one-shots. After #618 merges, the lead moves src/sounds/effects/bellows.ts to src/sounds/ambience/ (own level D).

## Milestone "Depth 24: mill" (estimate 9 tasks)

Cut in cycle 231 for low supply (0 free tasks for 2 active agents). Registries do not collide with open Depth 23 work:
sack after coffin, dog after wolf, basket after mail (hammer goes after tag).

| Task | Asset | State |
|---|---|---|
| #624 | model: sack (props; grid body, fill/slump, neck tied/folded/open, lumps; ≤ 3 draw calls, dynamic hull) | open |
| #625 | sprite: dog (16 × 16 like the wolf; idle with wagging tail, walk, bark; floppy or pricked ears, collar) | accepted (cycle 234) |
| #626 | icon: basket (objects; tapered body, slats "0"/"2"/"3", arch or ear handles; full sweep at 0) | open |
| #628 | model: water wheel (architecture; rims, paddles, spokes "4"/"6"/"8", axle on posts or piers, rig `wheel`; ≤ 5 draw calls; registered after pier) | accepted (cycle 234) |
| #629 | sound: millstone (ambience loop; speed in turns/s, whole turns per loop; grind, rumble, gear knock; registered after stream) | accepted (cycle 234) |
| #630 | model fix: water wheel paddles 0.12 · diameter deep, sticking out past rims moved in to diameter/2 − d/2 (after #628) | waits for #628 merge |
| #631 | sound: grain pour (effects ≤ 2.5 s; flour/wheat/beans into sack/pail/floor; registered after pour) | open |
| #632 | sprite: sack-sprite (items, 16 × 16 like pot; tied/folded/open, drop animation; registered after pot) | accepted (cycle 235) |

## Milestone "Depth 25: bakery" (estimate 13 tasks)

Cut in cycle 235 for low supply (0 free tasks for 4 active agents). No sprite task: the sprite registries are the current
conflict hotspot. Registries do not collide with open work: bread oven after forge, cob after plaster, kneading after
saw, bread icon after bulb.

| Task | Asset | State |
|---|---|---|
| #633 | model: bread oven (architecture; plinth, turned dome, arched mouth ring, glow mouth, chimney; ≤ 2 draw calls) | open |
| #634 | surface: cob (stone; swells, straw stalks from cells, one voronoi for cracks) | open |
| #635 | sound: kneading (effects ≤ 2.5 s; strokes, tempo, wetness, slap) | accepted (cycle 237) |
| #636 | icon: bread (objects; loaf area, cuts "0"/"2"/"3", slice; full sweep at 0) | open |
| #637 | model: dough trough (props; flared sides, legs, rig `lid`; after trough) | submitted (879, own person: review points set, peer review) |
| #638 | sound: rolling pin (effects ≤ 2.5 s; after writing) | submitted (853, own person: peer review) |
| #639 | model: peel (props; flat bevelled blade square/round, neck, turned handle; 1 draw call, lying flat; after ladder) | open (cycle 237) |
| #640 | sound: bread tear (impact ≤ 2 s; crust crackle, pull, crumbs on rng(seed + 1); after wood-break) | open (cycle 237) |
| #641 | icon: cup (objects; tapered body, handle none/loop/ear, steam "0"–"3"; full sweep at 0; after camera) | open (cycle 237) |
| #642 | sprite: baker (characters, 24 × 32 like the blacksmith; hat toque/cap/none, apron, flour; idle, walk, knead; after blacksmith) | open (cycle 238) |
| #643 | model: bread rack (furniture; four posts, slatted shelves, 1 draw call, static box; after shelf) | open (cycle 238) |
| #644 | sound: sift (effects ≤ 2 s; strokes, tempo, fineness, rim taps on rng(seed + 1); after coins) | open (cycle 238) |

## Milestone "Depth 26: orchard" (estimate 4 tasks)

Cut in cycle 242 for low supply (2 free tasks for 3 active agents). No sprite task (sprite registries are the conflict
hotspot). Registries do not collide with open work: swing after bench, apple bite after glass, leaf icon after tag.

| Task | Asset | State |
|---|---|---|
| #645 | model: swing (props; two splayed A-frames, beam, seat(s) on ropes, rig `seat` about x; 3 draw calls; after bench) | open |
| #646 | sound: apple bite (impact ≤ 2 s; crunch, juice hiss, chewing on rng(seed + 1); after glass) | open |
| #647 | icon: leaf (objects; breadth, tilt, bend 0–0.25 (replaces veins, cycle 272), stem; full sweep at 0; after tag) | closed, replaced by #716 (cycle 284) |
| #716 | icon: leaf (replaces #647 with the bend spec written out; midrib inside the blade in every style; full sweep at 0; after tag) | open |

## Milestone "Depth 27: fishing" (estimate 5 tasks)

Cut in cycle 250 for low supply (1 free task for 2 active agents). Kinds that avoid the model and sprite registry
hotspots; fresh anchors: reel after horn, flop after splash, fish icon after folder.

| Task | Asset | State |
|---|---|---|
| #648 | sound: reel (effects ≤ 2.5 s; mode run/wind, duration, speed, size; after horn) | open |
| #651 | sound: fish flop (movement ≤ 1.5 s; flops, size, wetness, surface wood/stone, flutter on rng(seed + 1); after splash; replaces #649, cut with a dependency by mistake) | open |
| #650 | icon: fish (objects; plump, tail fork/fan, fins, gill, eye hole; full sweep at 0; after folder) | open |

## Milestone "Depth 28: laundry" (estimate 7 tasks)

Cut in cycle 257 for low supply (0 free tasks for 2 active agents). Fresh registry anchors away from the queued dough
trough (after trough) and peel (after ladder): washboard after bucket, scrub after saw, shirt icon after basket.

| Task | Asset | State |
|---|---|---|
| #668 | model: washboard (props; wooden frame with feet, rippled zinc or wooden board via grid(), 2 draw calls, dynamic box; after bucket) | submitted 905, review points set (cycle 258) |
| #669 | sound: scrub (effects ≤ 2.5 s; strokes, tempo, board zinc/wood, wetness, drips on rng(seed + 1); after saw) | merged (6549483); probe on main (cycle 260): drips 0–3 dB above the median stroke window → fix #676 |
| #670 | icon: shirt (objects; sleeves short/long, width, neck round/v/collar, placket, pocket; full sweep at 0; after basket) | in progress |
| #671 | model: washtub (props; bucket wood branch scaled up, ear staves with a hand hole, hoops 1–3, ≤ 12000 tris, 3 draw calls; after barrel) | merged (232156e) |
| #672 | sprite: laundress (characters; like baker, skirt instead of legs, cover kerchief/bonnet/none, sleeves, animation scrub; after baker) | resubmitted 915 (head leans whole), review points set (cycle 260) |
| #676 | fix: scrub drips amp 0.1 → 0.02 (≥ 10 dB below the median stroke window; `fixes: 669`) | merged (25451f9); spacing tidied in a lead commit (cycle 266) |

## Milestone "Depth 29: spinning" (estimate 4 tasks)

Cut in cycle 259 for low supply (1 free task for 3 active agents). No sprite task (laundress is in the sprite
registries). Fresh anchors: spinning wheel after anvil, spinning after millstone, scissors after copy.

| Task | Asset | State |
|---|---|---|
| #673 | model: spinning wheel (props; grindstone frame + cart spoked wheel, bench slope, treadle, flyer; rig `wheel`; ≤ 3 draw calls, ≤ 12000 tris; after anvil) | merged (d2b98f0, peer review); checked on main in cycle 266: renders front, side, top, flyer, castle, hand wheel, wheel at 90°; FORMWERK_ONLY green, 5500 tris, 2 draw calls |
| #674 | sound: spinning (ambience loop; speed, whirr, treadle knock once per turn, yarn hiss; ≤ 12 dB loudest over median; after millstone) | merged (736355b); spectrogram 0.00 % on main (cycle 266) |
| #675 | icon: scissors (actions; open 25–60°, handles round/oval, blade, tilt; full sweep at 0; after copy) | open |

## Milestone "Depth 30: apothecary" (estimate 14 tasks)

Cut in cycle 271 for low supply (0 free tasks for 1 active agent). Fresh anchors away from the queued laundress
(after baker) and leaf (after tag): mortar after vase, grind after sift, flask after cup, herbalist after wizard.

| Task | Asset | State |
|---|---|---|
| #687 | model: mortar (props; turned bowl bowl/beaker, pestle leaning/lying/none, stone/wood/brass, 1 draw call, ≤ 6000 tris, cylinder collider; after vase) | peer review (1010) |
| #688 | sound: grind (effects ≤ 2.5 s; strokes, tempo, mortar stone/wood, grit crunches on rng(seed + 1), pressure; after sift) | peer review (1022) |
| #689 | icon: flask (objects; body round/conical, fill, neck, bubbles "0"/"2"/"3"; full sweep at 0; after cup) | peer review (1013) |
| #690 | sprite: herbalist (characters; like wizard, hood up/down, satchel, herbs, animation grind; after wizard) | peer review (1016) |
| #692 | sound: cork (effects ≤ 1.2 s; squeak twist s, then pop at bottle Hz, tightness, squeak; after grain-pour) | accepted (1017) |
| #698 | sprite: herbs (items 16×16; kind sprig/root/mushroom/flower, bundle, size, dried, colour; idle + sway; after pot) | accepted (1040) |
| #699 | sound: stir (effects ≤ 2.5 s; circles, tempo, vessel cup/pot, taps on rng(seed + 1) 8–14 dB above swirl, liquid; after magic) | accepted (1032) |
| #709 | icon: pill (objects; shape capsule/tablet, length, angle, split; full sweep at 0; after bulb) | accepted (1041) |
| #710 | sound: fizz (effects ≤ 2.5 s; seconds, fizz rate, size 8 kHz → 2.5 kHz, drop plop on rng(seed + 1); after cork) | accepted (1042) |
| #711 | model: drying-rack (props; A-frames, width/height/depth, rails 1–4, bunches 0–8 of two-sided leaf cards, dried, ≤ 2 draw calls, ≤ 8000 tris; after peel) | accepted (1044) |
| #712 | sound: drawer (movement ≤ 1.5 s; open/shut, travel, size small/large, contents rattle on rng(seed + 1), stiff; open stop ≥ 6 dB below shut knock; after door-swing) | accepted (1046) |
| #713 | sprite: candle (items 16×16; height, girth taper/pillar, holder none/dish/chamberstick, drips, lit (snuffed: smoke wisp), wax, fire; after torch) | accepted (1048) |
| #714 | sound: blow-out (effects ≤ 2.5 s; breath, strength 600 → 2500 Hz, flutter 8–14 Hz, candles 1–3, ember on rng(seed + 1); after fizz) | rework (1051: ember overruns the end, flutter is a grid-aligned gate) |
| #715 | model: jar (props; albarello/round, height, radius, neck, knob button/ball/none, band (2nd material), lid slides up, ≤ 3 draw calls, ≤ 6000 tris, cylinder collider; after tankard) | accepted (1049) |

## Milestone "Depth 31: carpentry" (estimate 8 tasks)

Cut in cycle 286 for low supply. Anchors clear of the queued patches: sawhorse after drying-rack, planing after saw
(sift and fizz are 7 lines away), carpenter after villager (not blacksmith: it is 3 lines from wizard, where the
queued herbalist inserts). A ruler icon follows once I have prototyped its ticks at stroke 2 (memory: icon acute joints, sweep).

| Task | Asset | State |
|---|---|---|
| #720 | model: sawhorse (props; beam square/plank, splay 8–25°, braces, 1 draw call, ≤ 3000 tris, box collider; after drying-rack; replaces #717) | submitted (1058) |
| #718 | sound: planing (effects ≤ 2.5 s; strokes 1–4, length, wood soft/hard centroid gap ≥ 800 Hz, chatter clicks on rng(seed + 1) as max step ≥ 2×; after saw) | rework (1055: hard gate, click peaks, typo; 1056: unfinished, debug logs, `s[at + i]` with at in seconds, no baseline) |
| #719 | sprite: carpenter (characters 24×32 like blacksmith; cap, apron, pencil, animation plane; after villager) | submitted (1057) |
| #722 | sound: sanding (effects ≤ 2.5 s; strokes 1–8, tempo, grit coarse/medium/fine centroid gap ≥ 1500 Hz, pressure, blow on rng(seed + 1); after writing) | accepted (1064) |
| #723 | model: toolbox (props; open tote, peaked/square ends, dowel at max(handle, sides + 0.08), divider, 1 draw call, ≤ 2500 tris; after tent) | accepted (cycle 297) |
| #721 | sound: nailing (impact ≤ 4 s; blows 1–8, ring rises ≥ 15 % blow 1→3, flush last blow ≥ 10 dB less above 1.5 kHz, tap ≥ 6 dB quieter; after knock) | accepted (1066) |
| #724 | icon: ruler (objects; tilt, ticks 3–5 dropping to 4 where 5 do not fit, width, pattern alternate/even; full sweep 0 of 9072; after hammer) | accepted (1067) |

## Milestone "Depth 32: weaving" (estimate 6 tasks)

Cut in cycle 299 when supply dropped to 1 (0 active agents). Sounds first (no geometry prototype needed); the yarn
icon, weaver sprite and yarn basket model follow once I have prototyped them. Anchors: loom after scrub (9 lines from
sift, where the queued grind inserts), knitting after sanding.

| Task | Asset | State |
|---|---|---|
| #725 | sound: loom (ambience loop ≤ 12 s; pick = treadle 0, shuttle 0.25, beater 0.6 × tempo; beat/shuttle/treadle; whole picks per loop; after scrub) | accepted (1068) |
| #726 | sound: knitting (effects ≤ 2.5 s; stitches 1–12, pace 2–6 Hz, needles metal/bamboo centroid gap ≥ 1500 Hz, yarn pull; after sanding) | open |
| #727 | sprite: weaver (characters 24×32 like laundress; cover, apron, loom, yarn; animation weave: frame loom, shuttle left/middle/right/middle; after carpenter, 5 lines from the queued herbalist insert) | open |

## Next (lead, level D, not cut yet)

- Log pile and campfire logs: the per-part pith (`grained(g, "x", [x, y, z])`, attribute `pith`) and bark with grain
  "part" are done (2df350c, cycle 172); log pile (#570) and campfire (#571) both accepted (cycles 173–174). Bark scale on thin lying
  logs: keep it near 1.5 (0.21 / diameter), finer furrows push the bake above 1 %.

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
