# Status (2026-11-14, cycle 55: plus fix to peer review, chest recut, coffin family task)

Woken for 1 open message, my own approval request 31 (decided by the visionary in cycle 44; it stays open in the tool until they record it, info 37 asked them to). 1 agent active, 17 tasks free, so supply is enough.

Done this cycle:
- 389 (#318 plus fix, own account): checked green. The patch is exactly what the task asked for (size.min 13 → 13.5, both describe texts, build untouched, only plus.ts). The summary quotes the full sweep line `plus: 0 of 37044 combinations fail`, and the sheet is pixel-identical, so leaving the baseline uncommitted is right. Set five review points for outside peer review.
- 387 (#248 coffin) merged (9ea7316). Cut its family task #364 (realistic look against the barrel: boards meeting at the corners, handles on brackets, lid built in asset coordinates).
- #356 (chest family task) still said to build the lid "relative to the hinge", against the corrected checkpoint 4. Closed it and recut it as #363 with the right rule. The other open family tasks don't mention a hinge.
- 385 (#351 AO) is checking again; 388 (#310 tag fix, own account) was submitted and is not checked yet.

Next: review 388 and 385 when they are checked (for 385, read the peer reviews against its five points). 384's resubmission (Shuffle row at 1440 px, material list from `MATERIALS`), 386's resubmission (both clock hands at 2:00, 10:00, 1:00, 4:30), #354–#364 as they arrive.

Earlier (2026-11-14, cycle 54: woken for approval 31 only)

Woken for 1 open message, my own approval request 31 (decided by the visionary in cycle 44; it stays open in the tool until they record it, info 37 asked them to). Nothing waited for my decision: 385 (#351 AO) and 387 (#248 coffin), both own-account, still wait for outside peer review with their review points. 1 agent active, 17 tasks free, 2 checking, so supply is enough.

Next: as cycle 53 below (384's resubmission: Shuffle row at 1440 px and the material list from `MATERIALS`; 386's resubmission with both clock hands at 2:00, 10:00, 1:00, 4:30; #354–#362 and the icon fixes as they arrive; a coffin family task once 387 merges).

Earlier (2026-11-14, cycle 53: gallery overview 384 back for two small fixes)

Woken for 384 (#315 gallery overview) and approval 31 (decided in cycle 44; it stays open in the tool until the visionary records it). 1 agent active, 17 tasks free, so supply is enough.

Done this cycle:
- 384 (#315, outside contributor): green. I built it and drove the models tab in headless Chromium at 1440 and 360 px. Every functional criterion holds: chair 5,356 △ (same as the stage line) and 8.6 KB (8,813 bytes); Tavern shows exactly its 7 models, Metal + Brown narrows that to Tankard; the count line matches, and the reset button appears and works; the triangle and code orders are ascending; ↻ reshuffles; By category brings the five sections back; filters persist across picks; colourOf is right on all six colours; raw sources are separate chunks; no baseline changed. Sent it back for two small things: (1) the ↻ and reset buttons inherit `.liste button { width: 100% }`, so at 1440 px with Shuffle the Order select shrinks to a bare chevron; (2) the material options are a hand-written list, and should come from `MATERIALS`.
- 385 (#351 AO) and 387 (#248 coffin), both own-account, still wait for outside peer review with their review points.

Next: when 384 comes back, check the Shuffle row at 1440 px and the material list. Then 386's resubmission (both clock hands at 2:00, 10:00, 1:00, 4:30), #354–#362 and the icon fixes as they arrive. Once 387 merges, a family task for the coffin against the barrel reference.

Earlier (2026-11-14, cycle 52: coffin attempt to peer review, hinge rule fixed)

Woken for 1 open message, my own approval request 31 (decided by the visionary in cycle 44; it stays open in the tool until they record it). 1 agent active, 16 tasks free, so supply is enough. Nothing waited for my decision.

Done this cycle:
- 387 (#248 coffin, own account, new attempt): checked green. Reproduced FORMWERK_ONLY=coffin: ok, 3 draw calls, 112 triangles, baked 0.10 %, glb 0.10 %; the patch touches only the four allowed paths. I looked at out/coffin.png: a six-sided dark wooden coffin, closed lid, three brass bars on the visible side. The bars stand 3 cm out without brackets, as #248 asks. Set five review points (look, lid at 0 and 100, cross, mirrored handles, scope) and left it to outside peer review.
- Finding 57 (from 387) was right: `Parts.group()` subtracts the pivot, so parts inside `t.moving()` are built in asset coordinates (chest.ts puts the lid at y = h). AGENTS.md checkpoint 4 said the opposite. Fixed checkpoint 4 and the "Movable parts" rule, and the pointer in docs/look-realistic.md; dismissed the finding as handled.
- 385 (#351 AO, own account) still waits for outside peer review with its review points; 384 (#315) still checking.

Next: review 384 against #315's seven criteria when it is checked (see cycle 50). Then 386's resubmission (both clock hands at 2:00, 10:00, 1:00, 4:30), #354–#362 and the icon fixes as they arrive. Once 387 merges, a family task for the coffin against the barrel reference.

Earlier (2026-11-14, cycle 51: clock fix back, AO look to peer review)

Woken for 386 (#307 clock) and approval 31 (decided in cycle 44; it stays open in the tool until the visionary records it). 1 agent active, 16 tasks free, so supply is enough.

Done this cycle:
- 386 (#307 clock, outside contributor): green, sweep 0 of 3528, sheet unchanged, but sent back. The patch only widens the angle below which the hour hand is laid onto the minute hand (CLEAR 1.25 → 2.25 in `eng`). At the default stroke the threshold goes from 46° to 71°, at stroke 2.25 from 52° to 90°, so 2:00 and 10:00 now show one hand and read the wrong time. The sweep passes only because merged hands leave no wedge. The rework asks to keep `eng` and close the wedge in the drawing instead (a filled centre dot of radius (pen.width + 0.8) / (2·sin(θ/2)), or hands that end at that radius), and to check that both hands show at 2:00 and 10:00 (stroke 2) and at 1:00 and 4:30 (stroke 2.25).
- 385 (#351 gallery AO, own account): checked green, every baseline unchanged (the scene tests stay on "studio"). Set five review points for outside peer review: contact shadows without a halo, a firmer shadow, studio baselines untouched, look switching with ?webgl, scope and stage line.
- 384 (#315 gallery overview) is checking again after the pipeline fix of cycle 50.

Next: review 384 against #315's seven criteria when it is checked (see cycle 50). Then 386's resubmission (check both hands at the four times above), #354–#362 and the icon fixes as they arrive.

Earlier (2026-11-14, cycle 50: pipeline time limit for gallery changes)

Woken for 1 open message, my own approval request 31; the visionary decided it in cycle 44, and info message 37 asked them to record it. 2 agents active, 16 tasks free, so supply is enough. Nothing waited for review.

Done this cycle:
- 384 (#315 gallery overview) failed its check with "test (1h0m0s) … exit status 255": a gallery-only change ran the full suite and hit the pipeline's 1 h limit. The cause is not the patch. Fixed scripts/pipeline-test.mjs (537df26): gallery screens that the test mode never loads (src/gallery/** except test, test-surface, test-speech, stage, viewer; plus index.html) now render a sample of scenes (barrel, chair, tree, rock, lantern, planks), with types, core, catalogue and build as before. Checked the routing with a stub npm on six cases (viewer, test, test-surface and main.ts still run the full suite). The real sample run on main is green and takes 82 s.
- Ruling: a sample of six scenes is enough for gallery screens, because a broken page or canvas changes every render. Cost if wrong: a gallery regression shows only in the full suite on GitHub after the merge.

Next: when 384 (or its resubmission) is checked, review it against #315's seven criteria in the preview (chair triangles and bytes, Tavern collection, Metal + Brown, the sorted orders, colourOf quotes, separate raw chunks). Then as cycle 47 below (#354–#362 and #351 as they arrive; a family task for the coffin after 383 merges).

Earlier (2026-11-14, cycle 49: coffin rework in, approval 31 still open)

Woken for 1 open message, my own approval request 31; the visionary decided it in cycle 44 (see below) and it stays open in the tool until they record it. 2 agents active, 17 tasks free, so supply is enough; #351 shows progress.

Done this cycle:
- 383 (#248 coffin rework, own account) checked green: 3 draw calls, 256 triangles, baked 0.09 %, glb 0.10 %; the patch touches only the four allowed paths. I looked at coffin.png, .baked and .glb: a six-sided wooden coffin with lid and three bar handles per side, same in all three. Being own-account, I set five review points (lid swing, head wider than foot, cross and mirrored handles, scope, baked/glb) and left it to outside peer review.
- Ruling: the coffin is built in the old plain construction (no bevels or planks), but it meets #248 as written; its realistic upgrade comes as a family task against the barrel reference after it merges. Cost if wrong: one more family task.

Next: as cycle 47 below (review #354–#362 and #351 as they arrive), plus a family task for the coffin once 383 merges.

Earlier (2026-11-14, cycle 48: woken for approval 31 only)

Woken for 1 open message, which is my own approval request 31. The visionary decided it in cycle 44; it stays open in the tool until they record it under "My account". Nothing waited for review, 0 agents active, 20 tasks free (#351, #354–#362 and the icon fixes), so supply is enough. The bottleneck is contributors.

Done this cycle:
- Sent the visionary an info message (37) asking them to record approval 31, so the lead service stops waking for it.

Next: as cycle 47 below.

Earlier (2026-11-14, cycle 47: foundation merged, family tasks out)

Woken to review the foundation #324 (Claude, visionary exception) on branch claude/foundation (1be2c0c, one commit on c10068f). Nothing waited on the platform. 0 agents active; the bottleneck is contributors.

Done this cycle:
- Reviewed #324: read the viewer, materials, export and shapes diff, then ran the full `npm test` on the branch. 657 core tests passed (moon included, so #301 is fixed on main). All 66 models ok, every patterned model "baked ok" and "glb ok" (references: baked 0.11–0.32 %, glb 0.22–0.36 %), and no surface, maps, sprite, icon or sound baseline changed. One failure: scarecrow at 92.58 %. #225 reached main after the branch re-rendered its 65 baselines, so its baseline was still the plain look. I looked at its studio render and committed it (5103a8e; FORMWERK_ONLY=scarecrow green, 0.00 %). I looked at barrel, chair, tree, rock, lantern, barrel.glb, tent and workbench: real parts, studio shadow and backdrop, glb same as live. Merged by fast-forward; main = 5103a8e.
- Deviations from the task text, accepted on merit: PCFShadowMap with radius 6 (r187 dropped PCFSoftShadowMap); a shadow-only floor and a backdrop instead of a fogged ground; `setLook("studio" | "plain")` instead of `opts.look`; AGENTS.md documents the material options and shapes.ts (asked for in the brief).
- Closed #324 (complete_own_task only takes level D). #325–#327 waited for #324 to be "merged", which a closed task never is, so I recut them: #351 (AO as look "gallery" on setLook; paths viewer.ts and models.ts), #352 (scan, after #351 and #315), #353 (wireframe, after #352). Closed #325–#327 as replaced.
- Ruling: shared rules for every family task live in docs/look-realistic.md (steps, traps, five review checkpoints). Each task names only its asset, its reference and checkpoint 2. Why: nine copies of one page cost every agent tokens, and one file can be fixed in one place. Cost if wrong: one doc to fold back into the tasks.
- Cut the first family batch, #354–#362 (level B, role art, milestone "Look: realistic"): table → chair; crate, chest, bucket → barrel; cauldron, candlestick → lantern; stump, bush → tree; gravestone → rock. Each touches only its asset file and its baseline, so all nine run in parallel.
- Sent the visionary an info message (36) with the result.

Next: review #354–#362 and #351 as they arrive. For each one, look at out/<id>.png next to the reference and check the baked/glb lines and that only the asset file and its baseline changed. Cut the next family batch while supply stays above the active agents. Watch 375 (#306 tag) and 297 (#248 coffin) in peer review. Keep sweeping the unswept icons.

Earlier (2026-11-14, cycle 46: icon sweeps)

Woken for 1 open message, which is my own approval request 31; the visionary decided it in cycle 44, and it stays open in the tool until they record it under "My account". Nothing waited for my review: 297 (#248 coffin, own account) waits for an outside peer review (about 24 h, the bottleneck), 375 (#306 tag, own account) was still checking. 0 agents active, 10 tasks free.

Done this cycle:
- Swept search (0 of 37044) and trash (0 of 14112): both clean.
- Volume: 129 of 10080 fail, all with sharp corners, waves 0 included, so the speaker body is the cause. I printed waves 0, speakerSize 16, stroke 2.25 at 96 px: the inner hole runs into a thin wedge at the acute corners where the cone meets the mouth, and at 24 px the wedge closes. Cut #350 (level B, role icons, with slice commands). Milestone estimate 18 → 19.
- Note: background commands here stop after 10 min unless given a longer timeout; run full sweeps with a timeout of about 55 min.

Next: review #324 (foundation) when it is checked, as cycle 44 says below. Watch 375 and 297 in peer review. Keep sweeping the unswept icons (docs/plan.md).

Earlier (2026-11-14, cycle 45: wifi fix accepted)

Woken for 374 (#302 wifi) and 1 open message, which is my own approval request 31. The visionary already decided it in cycle 44; it stays open in the tool until it is recorded under "My account". 0 agents active, 9 tasks free, so supply is enough. Peer review is still the bottleneck: 297 (#248 coffin, own account) has waited 24 h.

Done this cycle:
- 374 (#302 wifi, outside contributor): a one-line root-cause fix that spaces the arcs evenly from the dot to the outer arc. On cdc2fce with the patch: icons.test.ts 4/4, the full sweep reports "wifi: 0 of 14112 combinations fail" (6 min), and the sheet has the same pixels as the committed baseline. I looked at the sheet: it still reads as a fan, and the off row as a fan with a slash. Accepted.
- 375 (#306 tag, own account) arrived and was still checking. Its summary reports a sweep of 0 of 1008. I set five review points (sweep, rows 1/2/4 unchanged, the string clears the edge, no change without a string, scope).
- Finding 46 (a gap's cap grazing a stroke leaves a sliver): added one sentence to AGENTS.md, "Adding an icon" step 1, then dismissed it. Finding 47 (the string moves the edge half a unit) dismissed as too small for a describe.

Next: review #324 (foundation) when it is checked, as cycle 44 says below. Watch 375 and 297 in peer review. Keep sweeping the unswept icons (docs/plan.md).

Earlier (2026-11-14, cycle 44: visionary decisions on the look and on speed)

Woken for the visionary's decisions (neVs, 14 Nov 2026) on my message 31 and more. 2 agents active. 297 (#248 coffin) and 371 (#225 scarecrow), own account, still wait for an outside peer review (about 24 h; peer review is the bottleneck).

Done this cycle:
- Style guide accepted: docs/style-guide.md says "Accepted 2026-11-14"; sprites stay pixel art and icons stay line icons (written into both sections). New triangle limits in tests/core/assets.test.ts: furniture 60k, architecture 80k, nature 150k, vehicles 150k, props 30k.
- Foundation (visionary exception): #324, level C, role art: stage 1 viewer (the content of #288), wood/metal/stone with relief and roughness variation plus their bake in src/core/export.ts, and five reference assets (barrel, chair, tree, rock, lantern), as one submission for Claude that I review. #288 was not reserved, so I closed it. The presentation chain waited for #288, so I recut it: #325 (GTAO, was #312) after #324, #326 (scan, was #316) after #325 and #315, #327 (wireframe, was #317) after #326. Milestone estimate 24 → 66.
- Lever C, #323 (own, b4d0e57, completed): with FORMWERK_ONLY, catalog.mjs and catalog.test.ts render only the chosen assets' sound, sprite and icon files. A one-asset `npm test` takes 13 s instead of about 75 s; without FORMWERK_ONLY, all 202 catalogue and asset tests still pass. tests/scene/run.mjs stops an asset after FORMWERK_TIMEOUT (default 240 s) with "FAIL time limit: <id> took longer than …".
- Lever H: AGENTS.md now has "Review checkpoints and common reasons for rework" (ten rules from rework_patterns: summary answers the criteria, look at every committed image, exact names and types, moving parts relative to the hinge, mirrored signs, own random stream, one-sided faces, scope, rebase, FORMWERK_ONLY green). #325–#327 and #324 end with a "Review checkpoints" section. Every new task does from now on.
- Closed #309 as a duplicate of #307 (clock).
- 373 (#301 moon, own account): checked green. The sheet reads as a crescent in every cell, and the night row keeps its star. The full moon sweep on the patch reports 0 of 3528 (17 min). An outside peer review accepted it during the cycle, so my review points came too late.
- Ruling: no stage 2/3 tasks for the five reference families. The other families are cut only after #324 is merged, each measured against its reference asset (furniture → chair, containers → barrel or lantern, plants → tree, stones → rock).
- Message 31 stays open in the tool until the visionary records the approval under "My account"; the decision itself is in this status and the guide.

Next: review #324 when it is checked (re-run the full scene test on the patch, look at all five reference renders and the baked/glb lines, check that no sprite, icon, sound or maps baseline changed). Then cut the other model families against the references. Review 373's sweep result and the icon fixes as they arrive.

Earlier (2026-11-14, cycle 43: pipeline fixes, icon sweeps)

Woken for 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered. Nothing waited for my review: 372 (#305 undo/redo) was still in the check, 371 (#225 scarecrow, own account) was checking, 297 (#248 coffin, own account) waits for an outside peer review (about 23 h; the scorecard names peer review as the bottleneck). 2 agents active, 9 tasks free before this cycle.

Done this cycle:
- Finding 44 (e53ae6d): scripts/pipeline-test.mjs now recognises an asset file by its `define<Kind>({ id: "…" })` call instead of an existing baseline. A brand-new asset now runs only its own tests, and ids that differ from the file name (chest-sprite, torch-sprite) are tested under the right id. A file without a define call (src/sounds/voice/shared.ts) or a deleted file still runs the full suite. Checked with a stub npm on five cases.
- Finding 42 (68425df): tests/scene/run.mjs fails any frame with a luminance range under 20 as a blank frame (lost WebGL device) and never writes it as a baseline. The lowest range among the 282 committed baselines is 55.7 (mailbox). The chair and mud scene runs stay at 0.00 %. The first push was rejected with "fatal error in commit_refs_rules" (GitHub side), and the retry a few minutes later went through.
- Dismissed findings 41 and 43 (sun/moon, covered by #300 and #301), 42 and 44 (done).
- Sweeps: download 3 of 7056 (block arrow pointing up, tray 6, length 9, stroke 2.25, sharp corners: I rendered it, and the head's barbs touch the wall tops), pencil 991 of 24696 (length 14 everywhere, thick pencils at strong strokes), refresh 456 of 14112 (arrow heads close into rings at arrowSize 2.5). Cut #320, #321 and #322 (level B, role icons, with slice commands). Milestone estimate 12 → 18. Link is clean: 0 of 6300 (about 33 min here).
- 372 (#305 undo/redo) was checked late in the cycle. On 1f53d19 with the patch: undo 0 of 3528 and redo 0 of 3528 in the full sweep, icons.test.ts 7/7, both sheets same pixels. Accepted. Closed #308 as its duplicate.
- 373 (#301 moon, own account) arrived and was still checking at the end of the cycle.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Next: review 373 (#301 moon: re-run the full moon sweep on the patch and set review points, since it is own-account) and the rework of #315 when they are checked (for icon fixes, re-run the sweep on the patch). Keep sweeping the unswept icons listed in docs/plan.md.

Earlier (2026-11-14, cycle 42: overview review)


Woken for 370 (#315 catalogue overview) and 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered. 2 agents active, 9 tasks free, so supply is enough.

Done this cycle:
- 370 (#315): built it on 8bd2cda and drove it in Chromium. Every acceptance step passes: chair 308 △ · 5.6 KB (same as the stage line), Tavern 7, then Metal 4, then Brown 2; Purple gives the reset button; triangles ascending; sections restored; raw sources as lazy chunks; colourOf correct. Sent it back (rework) for two flaws. (1) The loader keeps the first render closure: click a model while the numbers load and the list stays on the old model. (2) The shuffle key only rotates ids of equal length. Fix: a module-level redraw and Fisher–Yates.
- 371 (#225 scarecrow, own account, new attempt after 262): the sleeves now cover the crossbar and both hands droop. The baseline matches the studio look. I set five review points; it waits for an outside peer review.
- Dismissed finding 45 (moon icon), which #301 covers.
- Signal: role icons has a rework rate of 62 % and 18 reservations without a result. The sweep tasks (#301, #302, #308–#310, #318, #319) are the cause, and a sweep-clean criterion is strict on purpose. If they keep coming back, cut slices per failing group, as #319 does.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Next: review the rework of #315 (re-run /tmp/scr-style Chromium check: early click on Table, two ↻ orders), #318 and #319 (re-run the sweep on the patch). Keep sweeping unswept icons as listed in cycle 41.

Earlier (2026-11-14, cycle 41: icon sweeps)

Woken for 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered. 297 (coffin, own-account) has waited about 22 h for an outside peer review. 2 agents active, 10 tasks free, so supply is enough.

Done this cycle:
- Swept close (0 of 37044), pause (0 of 42336), plus (21 of 37044) and check (3225 of 74088, the full sweep takes 21 min here).
- Plus: size 13, ratio 0.7, no frame, stroke 1, round corners gives 4.0 % ink, just under the floor. Raising size.min to 13.5 clears that slice (0 of 21). Cut #318.
- Check: 3162 failures are a double check inside a circle or square frame (frameSize ≤ 19, stroke ≥ 1.25). Both checks shrink but the offset d stays fixed, so the gaps close. 63 failures are too little ink at size 17, stroke 1. Cut #319 with slice commands for both groups.
- Both tasks are level B, role icons, milestone "Icons: sweep clean" (estimate 12, 8 planned).
- 368 (#303 card sprite) and 369 (#304 card-shuffle sound) arrived during the sweeps, both from an outside contributor. Both files match the briefs (only rewrapped), and the registrations sit where the briefs say. On origin/main with both patches: core 28 passed, card sheet same pixels, card-shuffle 1.151 s at 0.00 % changed. I looked at the enlarged sheet and accepted both. I could not listen to card-shuffle in this sandbox; the visionary may want to listen in the preview. Depth 20 is complete apart from reworks.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Next: review #318 and #319 (re-run the sweep on the patch). Keep sweeping the unswept icons a few per cycle; still to do: download, link, pencil, refresh, search, trash, volume, arrow, home, list, user, calendar, cloud, folder, gear, mail, pin, bell, eye, flag, heart, info, lock, mark, star, warning. Run them in parallel with `timeout 3000`, because some take more than 15 min. Otherwise as in cycle 40 below.

Earlier (2026-11-14, cycle 40: gallery presentation tasks)

Woken for the visionary's decision on presentation (14 Nov 2026): AO and a firm key light, the scan reveal, a wireframe toggle with the asset's weight, and a catalogue overview, all for the art role. No submissions wait for me. 297 (coffin) is from my own account and still waits for an outside peer review. Approval request 31 (realistic style guide) is still open.

Done this cycle:
- Cut four gallery tasks in milestone "Look: realistic" (estimate 20 → 24): #315 overview (free now), #312 GTAO and key light (after #288), #316 scan (after #312 and #315), #317 wireframe (after #316). The first cut (#311, #313, #314) had one garbled criterion, so I closed it and recut it.
- Ruling: the presentation stays in the gallery (`look: "gallery"`). The test pages keep the stage 1 studio look, so none of these tasks changes a baseline. AO in the scene tests comes only later, as its own task, if it is deterministic under SwiftShader. Cost if wrong: one re-render task.
- Ruling: #315 and #288 both touch models.ts, in different functions. I accept the overlap (see plan).
- Signal: #288 is on the critical path for every presentation and stage 2/3 task, and it has been handed back 3 times (once the time limit, twice Chromium exit 255). If it comes back once more, I will do the re-render in this sandbox myself and submit it with review points.

Next: review #315 as soon as it comes in. Use the preview to check the list, filters and colour results. Then continue as in cycle 39 below.

Earlier (2026-11-14, cycle 39: sweep slices)

Woken for 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered. No submissions wait for me. 297 (coffin), own-account, still waits for an outside peer review (about 21 h; review points set earlier). 1 agent active, 11 tasks free, so supply is enough and I cut nothing new.

Done this cycle:
- #302 (wifi) was handed back with "sandbox: time limit reached"; its brief predicted a 60-min sweep. Here the full wifi sweep took 5 min (84 of 14112 still fail). I committed FORMWERK_SWEEP_FIX (3c039ab): `FORMWERK_SWEEP_FIX='{"bars":4,"size":18,"off":true}'` holds parameters at those values. The wifi failing slice (252 combinations) takes 8 s and reports all 84 failures. AGENTS.md step 4 for icons names it. #302 and the other open icon tasks pick it up from AGENTS.md.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Next: as in cycle 38 below. If #302 is handed back again for time, close it and recut it with the slice command in the brief.

Earlier (2026-11-14, cycle 38: icon sweep results, fix tasks #308–#310)

Woken for 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered. No submissions wait for me; 262 (scarecrow) and 297 (coffin), own-account, still wait for an outside peer review (about 25 h). 2 agents active, 6 tasks free before this cycle.

Done this cycle:
- Rebased my plan commit (#300 accepted, #303 card sprite, #304 card-shuffle) onto origin/main and pushed it.
- Read the sweeps of 14 icons run earlier today (tests/scene/out/sweep-*.txt). Clean (0): anchor-icon, bulb, camera, chart, copy, play, share, sliders, sun, upload. Failing: undo 162 and redo 168 of 3528 (sharp filled head on the outer ring at radius 7.25–7.5, a few open heads with too little ink), clock 56 of 3528 (hands just past the lay-on threshold, hour 8 minute 35/40 and two others), tag 31 of 1008 (ring hole with string).
- Cut #308 (undo and redo, one task: both use curveParts in undo.ts), #309 (clock) and #310 (tag), level B, role icons, milestone "Icons: sweep clean" (estimate 12). Each must quote its sweep line at 0.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Next: review #288, #301, #302, #303, #304, #308, #309, #310 when they are checked (for icon fixes, re-run the sweep on the patch). Sweep the remaining 31 icons a few per cycle and cut a fix task per failing icon. Once the guide is approved and #288 is merged: my own budget-limit task, then the barrel stage 2 and 3 tasks; the rig hinge check, findings 31, 32, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks; each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 37: icon sweep, sun/moon/wifi fix tasks)

Woken for 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered, and because 0 tasks were free for 1 active agent (#288, the viewer stage 1). No work requests.

Done this cycle:
- 363 (#297 bones), 364 (#298 die) and 365 (#299 dice-roll), all own-account: each file matches its brief, and the registrations sit where the briefs say. On 115b21b with all three patches: core 30/30, bones 0.486 s and dice-roll 0.53 s at 0.00 % changed, die same pixels. Set five review points on each. During the cycle, all five own-account sound and sprite submissions (lock-turn, pot, bones, die, dice-roll) got their outside peer review and were merged. Depth 19 and Depth 20 are done.
- Main's full suite is red on the sun and moon icons (finding 40, reported by every contributor). The suite draws only 10 random cases per icon, so I committed a sweep (3aa4988): `FORMWERK_SWEEP=<id> npx vitest run tests/core/sweep.test.ts` applies the icon checks to every combination (number parameters at seven values, every stroke, corner and style), writes tests/scene/out/sweep-<id>.txt, and is skipped otherwise. AGENTS.md step 4 for icons names it.
- Sweep results: sun 80 failures (rays past the outer radius at core 0.5, square caps of 12 sharp rays too close). I fixed it in scratch, and it now fails 0 of 5040; on the sheet only the weather row changes. Moon fails 784 of 3528: slits at the horn tips (solidTip cap) and the star on the ring. My star fix removes the ring hits, and the horns need a redesign. Wifi fails 84 of 14112, all at bars 4, size 18, off, stroke ≥ 2.
- Cut in Depth 7 (estimate now 11), all level B, role icons: #300 sun (my diff, fixes #229), #301 moon (my star fix plus the horns, the sweep must report 0, fixes #229), #302 wifi (the sweep must report 0). Dismissed findings 33, 34 and 40 as covered.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Risk: the full suite stays red until both #300 and #301 are merged; contributors will keep naming it. Other icons may hide failing regions too. Sweep them one by one (globe, wifi and moon were all broken this way); a full sweep of an icon takes 5 to 60 min.

Next: review #288, #300, #301 and #302 when they are checked (for #300 and #301 check the quoted sweep line and look at the sheets). Then sweep the other 45 icons a few per cycle and cut a fix task per failing icon. Then as in cycle 33 below: once the guide is approved and #288 is merged, my own budget-limit task, then the barrel stage 2 and 3 tasks; the rig hinge check, findings 31, 32, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review; 262 (scarecrow) and 297 (coffin) still wait for one, now about 24 h. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 36: own-account checks during the look change)

Woken for 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered. No work requests. 2 tasks free (#298 die, #299 dice-roll) for 2 active agents (#288 the viewer stage 1, #297 bones), so supply is enough and I cut nothing new.

Done this cycle:
- 361 (#295 lock-turn) and 362 (#296 pot), both own-account, finished their checks. Both files match the briefs line by line. 362 no longer applies directly after spikes merged, but a 3-way apply is clean (registrations after lever, spikes kept). On 5f289ce with both patches: core 28/28, test:sound lock-turn 0.87 s, peak −1 dBFS, 0.00 % changed; test:sprite pot same pixels. Set five review points on each; they now wait for an outside peer review, like 262 (scarecrow) and 297 (coffin), which have waited about 23 h.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Risk (unchanged): 262 and 297 carry 320 × 240 baselines; re-render only the baseline on current main when the merge train fails them, and again after #288. #297 bones and #299 dice-roll add lines to src/sounds/index.ts and lib.ts, as does 361; a merge-train return only needs a rebase of the registration lines.

Next: review #288, #297, #298 and #299 when they are checked. Then as in cycle 33 below: once the guide is approved and #288 is merged, my own budget-limit task, then the barrel stage 2 and 3 tasks; the sun/moon fix task (fixes #229), the icon test grid, the globe sweep, the rig hinge check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 35: review and backlog during the look change)

Woken for 360 (#294 portcullis, outside contributor), for 1 open message (my own approval request 31 to the visionary, the realistic style guide, still unanswered) and because 0 tasks were free for 2 active agents (#288 the viewer stage 1, and #296 pot; #297 bones was the one free task). No work requests. 361 (#295 lock-turn, own-account) is still in its check; its sandbox log shows the known sun/moon icon failures (finding 40) from a bare full core run, not from lock-turn. 262 (scarecrow) and 297 (coffin), both own-account, have waited about 23 h for an outside peer review.

Done this cycle:
- 360 (#294 portcullis): accepted. portcullis.ts matches the brief line for line, registrations after woodpecker. On 2b30097 with the patch: core 25/25, test:sound 0.00 % changed, 2.045 s, the slam at 900 ms is the loudest moment.
- Cut milestone "Depth 20: game table" (estimate 3): #298 sprite die and #299 sound dice-roll, both level B, outside the 3D baselines. Built both in scratch on 2b30097 first, and each brief carries the full file. Die: core 26/26; enlarged, every preset, size and corner style reads as a die, and the roll tips forward in quarter turns onto the chosen face. My first draft drew squeezed pips on the tilted frames, which merged into bars, so tilted faces are blank now. Dice-roll: 25/25; defaults 0.53 s of clacks at centroid 3–4.5 kHz over a 230 Hz wooden knock. My first draft ended in 0.4 s of silence (buffer from a formula, now from the last bounce), let the knock drown the clack, and put the cup rattle 20 dB under the throw.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Risk (unchanged): 262 and 297 carry 320 × 240 baselines. When the merge train fails them, re-render only the baseline on current main, and after #288 merges, re-render again. #295, #297 and #299 all add lines to src/sounds/index.ts and lib.ts; #299 registers after knock to stay apart.

Next: review #288, #295, #296, #297, #298 and #299 when they are checked. Then as in cycle 33 below: once the guide is approved and #288 is merged, my own budget-limit task, then the barrel stage 2 and 3 tasks; the sun/moon fix task (fixes #229), the icon test grid, the globe sweep, the rig hinge check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 34: waiting during the look change)

Woken for 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered. No work requests. 360 (#294 portcullis) is still in its check. 262 (scarecrow) and 297 (coffin), both own-account, have waited about 22 h for an outside peer review. 2 tasks are free (#296 pot, #297 bones) for 2 active agents (#288, #295), so supply is enough and I cut nothing new.

Ruling (unchanged): no new model or surface tasks until #288 is merged.

Next: unchanged from cycle 33 below: review #288, #294, #295, #296 and #297 when they are checked, then the guide follow-ups and the backlog.

Earlier (2026-11-14, cycle 33: review and backlog during the look change)

Woken for 359 (#293 spikes), for 1 open message (my own approval request 31 to the visionary, the realistic style guide, still unanswered) and because 0 tasks were free for 2 active agents (on #288 the viewer stage 1, and #294 portcullis; #295 lock-turn was the one free task). No work requests. 262 (scarecrow) and 297 (coffin), both own-account, have now waited about 22 h for an outside peer review.

Done this cycle:
- 359 (#293 spikes): accepted. spikes.ts matches the brief line for line, registrations after torch with lever kept. On 0b5fc84 with the patch: core 26/26, test:sprite same pixels as the committed sheet.
- Cut #296 sprite pot and #297 sound bones in Depth 19 (estimate now 10), both level B and outside the 3D baselines. Built both in scratch on 0b5fc84 first, and each brief carries the full file. Pot: core 26/26; enlarged, the sheet reads as a pot in every preset (jar, amphora, green cooking pot) and at both extremes, and smash reads as wobble, crack, shards flying, shards on the floor. My first draft let the ellipse poke one pixel below the floor and drew a band that made the pot look like two stacked parts; belly 6 pushed the wobble frame onto the outline ring, so belly stops at 5. Bones: 25/25; defaults 0.49 s, three bursts of dry clacks at 1.1–1.3 kHz; collapse 0.94 s with a 117 Hz thump first; charm 0.31 s around 2 kHz; longest case 1.04 s of 1.5.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Risk (unchanged): 262 and 297 carry 320 × 240 baselines. When the merge train fails them, re-render only the baseline on current main, and after #288 merges, re-render again. New: #294, #295 and #297 all add lines to src/sounds/index.ts and lib.ts; if the merge train sends one back, it only needs a rebase of the registration lines.

Next: review #288, #294, #295, #296 and #297 when they are checked. For #288, look at the renders and check the full suite, the baked and glb diffs, and that the sprite, icon and sound baselines are unchanged. Once the guide is approved and #288 is merged: my own budget-limit task, then the barrel stage 2 and 3 tasks, built in scratch first. Backlog: the sun/moon fix task (fixes #229; rebuild it in scratch), then dismiss findings 33, 34 and 40. Also the icon test grid, the globe geometry sweep, the rig hinge contract check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 32: review and backlog during the look change)

Woken for 1 open message (my own approval request 31 to the visionary, the realistic style guide, still unanswered) and because 0 tasks were free for 2 active agents (on #288 the viewer stage 1, and #293 spikes; #294 portcullis was the one free task). No work requests. 358 (#292 stone-slide) arrived but was still in its check, ; its check finished later in the cycle. 262 (scarecrow) and 297 (coffin), both own-account, have now waited about 22 h for an outside peer review.

Done this cycle:
- 358 (#292 stone-slide): checked ahead. stone-slide.ts matches the brief line for line, and the registrations sit after creak. On a7a5a0f with the patch: core 25/25, test:sound 0.00 % changed, 1.18 s at peak −1 dBFS; the quoted timeline shows the grind at 234–445 Hz, then the 70 Hz thump at 0.9 s. Accepted at the end of the cycle.
- Cut #295 sound lock-turn in Depth 19 (estimate now 8), level B, outside the 3D baselines. Built in scratch on a7a5a0f first, and the brief carries the full file. The id `lock` failed the catalogue test because the icon `lock` has it, so it is `lock-turn` (export `lockTurn`). My first draft let the bolt drown the pin clicks (−8 dB against −31 to −47 dB) and ring as a plain 281 Hz sine for 0.5 s. Now the defaults run 0.87 s: a key scrape around 4 kHz, three clicks at 260/340/420 ms (−16 to −18 dB), and the bolt at 520 ms (−10 dB) as a clack into a short thump. Longest case 1.37 s of 2.2.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Risk (unchanged): 262 and 297 carry 320 × 240 baselines. When the merge train fails them, re-render only the baseline on current main, and after #288 merges, re-render again.

Next: review #288, #293, #294 and #295 when they are checked. For #288, look at the renders and check the full suite, the baked and glb diffs, and that the sprite, icon and sound baselines are unchanged. Once the guide is approved and #288 is merged: my own budget-limit task, then the barrel stage 2 and 3 tasks, built in scratch first. Backlog: the sun/moon fix task (fixes #229; rebuild it in scratch), then dismiss findings 33, 34 and 40. Also the icon test grid, the globe geometry sweep, the rig hinge contract check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 31: review and backlog during the look change)

Woken for 357 (#291 lever, outside contributor), for 1 open message (my own approval request 31 to the visionary, the realistic style guide, still unanswered) and because 0 tasks were free for 2 active agents (on #288 the viewer stage 1, and #292 stone-slide). No work requests. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin), both own-account, have waited about 21 h for an outside reviewer.

Done this cycle:
- 357 (#291 lever): accepted. lever.ts matches the brief line for line. On fcc3481 the core tests pass 26/26, and `test:sprite` gives the same pixels as the reference.
- Cut #293 sprite spikes and #294 sound portcullis in Depth 19 (estimate now 7), both level B and outside the 3D baselines. I built both in scratch on fcc3481 first, and each brief carries the full file. Spikes: core 26/26. My first draft read as a fence of bars, because the contract outline closes the 2-pixel gaps between spikes. With tapered cones and every other spike two pixels lower, it reads as a jagged spike row in every preset and at both extremes. Portcullis: 25/25. The defaults run 2.05 s: ratchet clicks around 890 Hz that speed up, then the slam at 0.9 s (a 94 Hz boom with a bright clang). The first draft was all boom, centroid 140 Hz, with the clicks 20 dB under it, so I raised the clicks and added the clang partials. The longest case is 3.46 s of maxSeconds 3.5.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Risk (unchanged): 262 and 297 carry 320 × 240 baselines. When the merge train fails them, re-render only the baseline on current main, and after #288 merges, re-render again.

Next: review #288, #292, #293 and #294 when they are checked. For #288, look at the renders and check the full suite, the baked and glb diffs, and that the sprite, icon and sound baselines are unchanged. Once the guide is approved and #288 is merged: my own budget-limit task, then the barrel stage 2 and 3 tasks, built in scratch first. Backlog: the sun/moon fix task (fixes #229; rebuild it in scratch), then dismiss findings 33, 34 and 40. Also the icon test grid, the globe geometry sweep, the rig hinge contract check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 30: backlog during the look change)

Woken because 0 tasks were free for 1 active agent (on #288, the viewer stage 1) and for 1 open message, which is my own approval request 31 to the visionary (the realistic style guide), still unanswered. No new submissions and no work requests. Torch sprite (#289) and chain (#290) are accepted and waiting for merge; hoot is merged. Only 262 (scarecrow) and 297 (coffin) wait, both own-account, now about 20 h for an outside peer review.

Done this cycle:
- Cut #291 sprite lever and #292 sound stone-slide in Depth 19 (estimate now 5), both level B and outside the 3D baselines, so they don't collide with #288. Built both in scratch on 410ffb7 first, and each brief carries the full file. Lever: core 26/26; enlarged, the sheet reads as a lever on a plate that swings from left to right in every preset (wall, floor with a black grip, gold switch) and at throw 60 / length 7. Stone-slide: 25/25; the defaults run 1.18 s as a low grind at 250–450 Hz with grit over it and a 70 Hz thump at 0.9 s. A tail of 0.25 + 0.08 s broke the 1.5 s cap (1.53 s), so the brief uses 0.22 + 0.06.
- Ruling (unchanged): no new model or surface tasks until #288 is merged.

Risk (unchanged): 262 and 297 carry 320 × 240 baselines. When the merge train fails them, re-render only the baseline on current main, and after #288 merges, re-render again.

Next: review #288, #291 and #292 when they are checked. For #288, look at the renders and check the full suite, the baked and glb diffs, and that the sprite, icon and sound baselines are unchanged. Once the guide is approved and #288 is merged: my own budget-limit task, then the barrel stage 2 and 3 tasks, built in scratch first. Backlog: the sun/moon fix task (fixes #229; rebuild it in scratch), then dismiss findings 33, 34 and 40. Also the icon test grid, the globe geometry sweep, the rig hinge contract check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 29: backlog during the look change)

Woken because 0 tasks were free for 1 active agent. That agent holds #288 (the viewer stage 1). The open message is my own approval request to the visionary (31, the realistic style guide), still unanswered. There were no work requests and no new submissions. Only 262 (scarecrow) and 297 (coffin) wait, both own-account, now about 19 h for an outside peer review.

Done this cycle:
- Cut milestone "Depth 19: dungeon" (estimate 3) with only kinds that have no 3D baseline: #289 sprite torch-sprite and #290 sound chain, both level B. While #288 re-renders every model and surface baseline, a new model or surface would collide with it and need a second render, so it waits.
- Built both in scratch on a16c837 first, and each brief carries the full file. Torch: the sprite tests pass, and enlarged the sheet reads as a torch with a pointed, swaying flame in every preset (torch, sconce with an iron cage, blue magic). Chain: the sound tests pass. The defaults run 0.58 s as two bursts of clinks around 2 kHz, keys 0.43 s, shackles 1.06 s, anchor 1.07 s with a thud. The longest case is 1.27 s, inside the 1.5 s movement cap.
- Ruling: no new model or surface tasks until #288 is merged. Why: they would carry old-light baselines and need re-rendering. Cost if wrong: a few hours of idle model contributors.

Risk (unchanged): 262 and 297 carry 320 × 240 baselines. When the merge train fails them, re-render only the baseline on current main, and after #288 merges, re-render again.

Next: review #288, #289 and #290 when they are checked. For #288, look at the renders and check the full suite, the baked and glb diffs, and that the sprite, icon and sound baselines are unchanged. Once the guide is approved and #288 is merged: my own budget-limit task, then the barrel stage 2 and 3 tasks, built in scratch first. Backlog: the sun/moon fix task (fixes #229; rebuild it in scratch, since the cycle 27 scratch is gone), then dismiss findings 33, 34 and 40. Also the icon test grid, the globe geometry sweep, the rig hinge contract check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, cycle 28: realistic look)

Woken for the visionary's decision of 14 Nov: the look moves to realistic, and Formwerk becomes a hybrid project (software cards plus the art and audio game cards). There were no messages and no work requests. 354 (#286 hoot) is accepted, and moth (#287) is merged, so Depth 18 is done. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) have waited about 19 h for an outside reviewer.

Done this cycle:
- The scene test now renders at 640 × 480 instead of 320 × 240 (`tests/scene/run.mjs`, f181c42). I re-rendered all 65 model and 30 surface baselines with the unchanged viewer. A second run shows 0.00 % change, and the baked and glb diffs stay under 0.7 %.
- As art director, I rewrote the Models and Surfaces sections of `docs/style-guide.md` and marked them "Proposed" (a6ede40). The rewrite covers construction from separate parts, bevels, segments by size, lathe profiles, PBR wear, references with adopt / don't adopt, and proposed budgets. I asked the visionary for approval (message 31). Sprites stay pixel art and icons stay line icons.
- Stage 1 is #288 (level B, role art, lease 300 min). I built the viewer in scratch first: ACES, PCFSoft shadows, RoomEnvironment, a #d9dbdd studio background, and a ground with fog all render headless. The barrel and chair show soft shadows. The task also re-renders all model and surface baselines.
- 354 (#286 hoot): accepted. It matches the brief, core tests pass 25/25, and the spectrogram is 0.00 % changed.

Risk: 262 (scarecrow) and 297 (coffin) carry 320 × 240 baselines. If they merge, the merge train will fail them on image size and send them back. Their baselines then need a re-render on current main, and once more after #288. When they come back, update only the baseline (on the brief's code) and resubmit.

Next: review #288 when it is checked. Look at the renders and check the full suite, the baked and glb diffs, and that the sprite, icon and sound baselines are unchanged. Once the guide is approved and #288 is merged, do my own budget-limit task, then the barrel stage 2 (materials) and stage 3 (geometry) tasks, built in scratch first. From the earlier backlog: cut the sun/moon fix task (fixes #229) after the sweep at strokes 1.25–2, then dismiss findings 33, 34 and 40. Also still open: the icon test grid, the globe geometry sweep, the rig hinge contract check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-14, review and backlog cycle 27)

Woken for 352 (#284 duck, outside contributor) and because 0 tasks were free for 0 active agents. No messages, no work requests. Depth 17 is complete: croak is merged, and reeds and duck are accepted and waiting for merge. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) have waited about 18 h for an outside reviewer.

Done this cycle:
- 352 (#284 duck): accepted. duck.ts matches the brief line for line. On 20a55bd the core tests pass 26/26, and `test:sprite` gives the same pixels as the reference.
- Finding 40 (sun and moon fail the outer ring check): this is not random. `rng(42)` is seeded, and both icons fail deterministically on main, and already did at their own commit 712a860. The pipeline only tests changed assets, so nobody saw it. Main's full `tests/core/icons.test.ts` is red: sun at core 0.5 / stroke 2.25 (the minimum ray length of 2 pushes past `outer`), and moon with the star (placed at t + 0.45·R, beyond the rim). Behind that, the moon outline failed legibility in 19 of 64 cases at the default tilt, sharp corners included (findings 33/34: the paper slit tapers to nothing at the horns).
- Built the fix in scratch on 20a55bd. Sun: the core is clamped so 2-unit rays fit, r1 gets + hw for the square caps, and r2 is capped at `outer`. The sweep: 0 of 10800. Moon: the horns are filled solid wherever the crescent is thinner than max(3, stroke + CLEAR), which replaces solidTip, and the star sits on the chord between the horns, checked against the grid. icons.test.ts passes 139/139. The moon sweep at strokes 1 and 2.25 gives 0 of 1120 (phase step 0.05, tilt step 15, star, corners, outline/filled).
- Cut milestone "Depth 18: night": #286 sound hoot and #287 sprite moth, both level B, each built in scratch first (hoot 25/25; moth 26/26, and the sheet reads in every preset).

Next: cut the sun/moon fix task (fixes #229) once the sweep at strokes 1.25–2 is clean, then dismiss findings 33, 34 and 40 as covered by it; review #286/#287 when they are checked. Still open: the icon test grid (ruling from cycle 18), the globe geometry sweep, the rig hinge contract check, findings 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 26)

Woken for 349 (#281 fern, outside contributor) and because 0 tasks were free for 0 active agents. No messages, no work requests. Depth 16 is complete: stump, rustle, woodpecker and fern are merged, deer is done. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) have waited about 17 h for an outside reviewer.

Done this cycle:
- 349 (#281 fern): accepted, now merged (ded2b6e). The code follows the brief line for line. On main after stump and rustle the patch applies 3-way and the core tests pass 26/26. The pipeline shows 2 draw calls and 446 triangles, baked and glb both 0.13 %.
- Cut milestone "Depth 17: pond" (estimate 4): #283 sound croak, #284 sprite duck, #285 model reeds, all level B. I built each in a scratch worktree on b32d4fa first, and each brief carries the full verified file. Croak: tests pass, 1.6 s at the defaults, the longest case 3.82 s of maxSeconds 3.9 (voice limit 4 s). Duck: 26 tests green, and the sheet reads in every preset. Reeds: 26/26, 2 draw calls, 778 triangles (1984 at the maximum), baked 0.10 %, glb 0.11 %.
- Risk seen while building reeds: a bare `npx vitest run tests/core` without FORMWERK_ONLY can fail on random sun and moon icon cases. This belongs to the icon test grid work below. Check it before the next icon task.

Next: review #283–#285 when they are checked; the icon test grid (ruling from cycle 18, my own level D work, now also the sun/moon random failures), the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 25)

Woken for 346 (#278 stump, outside contributor) and because 0 tasks were free for 0 active agents. No messages, no work requests. Deer (#279) is done. 347 (#280 rustle, own account) is in the checks. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) have waited about 16 h for an outside reviewer.

Done this cycle:
- 346 (#278 stump): accepted. The code follows the brief line by line (applyQuaternion in place of a rotate call is equivalent). The pipeline is green: 26/26, live 0.00 %, baked 0.12 %, glb 0.11 %. The baseline shows a bark trunk with a pale sawn top and four root flares.
- Cut #281 model fern and #282 sound woodpecker, both level B in Depth 16. The Depth 16 estimate is now 6. I built both in scratch on 44c4bea first. Fern: 26/26, baked 0.13 %, glb 0.13 %, and it reads as arching feathered fronds. Woodpecker: the sound tests pass; at the defaults there are 14 taps at about 900 Hz over 0.99 s, the gaps widen and the taps soften. The longest case is about 3.3 s, inside maxSeconds 3.5.

Next: set review points on 347 once it is checked; review #281 and #282 when they are checked; the icon test grid (ruling from cycle 18, my own level D work), the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 24)

Woken for 344 (#147 chest sprite, a second outside attempt) and because 0 tasks were free for 0 active agents. No messages, no work requests. Gravel (#271), ashlar, battlement and scroll are merged; #277 banner is accepted and waiting for merge, so Depth 15 is done. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) have waited about 15 h for an outside reviewer.

Done this cycle:
- 344 (#147 chest sprite): rejected as a duplicate. 338 had already been accepted and merged as b326636, but the task was offered again. The patch adds chest.ts and the baseline as new files that already exist, so it no longer applies. Then I closed #147. Watch for other merged tasks that come back into the pool. If it happens again, tell the platform.
- Cut milestone "Depth 16: forest" (estimate 5): #278 model stump, #279 sprite deer, #280 sound rustle, all level B. I built each on main in scratch first. Stump: 26/26, baked 0.12 %. Deer: core tests pass, and the sheet reads (the graze head sits one column clear of the forelegs). Rustle: 25/25. The movement cap is 1.5 s, so duration is at most 1.2 s. The wolf's fox preset already covers a fox, so I chose a deer instead.

Next: review #278–#280 when they are checked; set review points on own-account submissions once checked; the icon test grid (ruling from cycle 18, my own level D work), the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 23)

Woken for 338 (#147 chest sprite rework, outside contributor). 1 agent is active, on #271 gravel. 1 task is free (#277 banner). No messages, no work requests. #274 ashlar passed peer review and is accepted. 340 (#276 scroll, own account) is still in the checks. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) have waited about 14.5 h for an outside reviewer.

Done this cycle:
- 338 (#147 chest sprite): accepted. The lid gap from the first attempt is closed. In every `open` frame the inside of the lid joins the body (frame 2: rows 5–7, frame 3: rows 4–7), at gold none, few and full alike. On current main the sprite core tests pass 109/109, and `test:sprite` gives the same pixels as the reference. Enlarged, the sheet reads as a chest whose lid swings up over glinting gold.
- #271 gravel: the new attempt failed the check again, at 2.64 %, as expected. The task is still in progress, so I cannot close it. The plan from cycle 22 stands. If it comes in green some other way, check that it changes nothing outside its paths. If it is checked red or handed back, close #271 and recut it with `depth: 0.009` (measured bake 2.28 %).

Next: gravel (above); set review points on 340 once it is checked; review #277 banner when it is checked; the icon test grid (ruling from cycle 18, my own level D work), the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 22)

Woken for 341 (#275 battlement, outside contributor). 1 agent is active and was on #271 gravel, which it reserved again under the old brief. 0 tasks were free. No messages, no work requests. Own-account submissions are still in the checks: 339 (#274 ashlar) and 340 (#276 scroll). The chest rework (338, #147, outside) is in the checks too. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) have waited about 14 h for an outside reviewer.

Done this cycle:
- 341 (#275 battlement): accepted. The build follows the brief step for step. On 7533640 the core tests pass 26/26, with 1 draw call and 72 triangles. The bake differs by 0.02 % and the glb by 0.03 %. The render shows merlons along the front top edge above the corbel course.
- Cut #277 model banner (props, Depth 15, level B). I built it in scratch first: 26/26 tests pass, the bake and glb differ by 0.00 %, and it reads as a red swallowtail banner with a gold lozenge. The Depth 15 estimate is now 10.
- #271 gravel is back in progress under the old brief, so it could not be closed. When it comes in, it will fail the bake again at about 2.64 %. Send it back with this reason: "set `depth: 0.009` in gravel.ts as well (the normal slope is depth / tile, so tile 0.25 makes the relief 4× steeper); measured bake 2.28 %". If it is handed back instead, close #271 and recut it with the depth line.

Next: gravel (above); set review points on 339/340 once checked; review 338 (chest rework) and #277 when checked; the icon test grid (ruling from cycle 18, my own level D work), the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 21)

Woken for 335 (#273 crown, outside contributor) and because 0 tasks were free for 2 active agents. No messages, no work requests. Cauldron (336) is merged. #268 pickaxe and #274 ashlar are submitted and in the checks. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) are own-account submissions that have waited about 14 h for an outside reviewer.

Done this cycle:
- 335 (#273 crown): accepted. The code follows the brief line by line. Sprite tests 106/106, and `test:sprite` gives the same pixels as the reference. The sheet reads as a crown.
- 337 (#271 gravel, own account): the check fails the bake at 2.64 % (allowed 2.5 %). The patch follows my brief, so the fault is in the brief. Normal slope = depth / tile (src/surfaces/define.ts:51), so tile 0.25 with depth 0.035 makes the relief 4× steeper, and 3.5 cm of relief on 2 cm stones is not real gravel anyway. Measured: with `depth: 0.009` the bake is 2.28 %, and main itself is at 2.26 % (gravel is close to the limit even on main). Math.floor instead (12 cells) gives 2.35 % but does not fix the slope. A rework was refused while the task is still in the checks. Next cycle: if #271 is back in the pool, close it and recut with `depth: 0.009` added, or send 337 back with that reason once it is checked.
- Cut #275 model battlement (architecture) and #276 sprite scroll (items), both level B in Depth 15, both built in scratch first (battlement 26/26, baked 0.02 %, glb 0.03 %; scroll sprite tests pass, sheet reads). Depth 15 estimate is now 9.

Next: gravel (above); review #268, #274, #275, #276 when checked; the icon test grid (ruling from cycle 18, my own level D work), the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9. Gravel sits at 2.26 % of 2.5 % on main: a future ruling may lower its cell clamp.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 20)

Woken for 334 (#147 chest sprite, outside contributor) and because 0 tasks were free for 1 active agent. No messages, no work requests. 335 (#273 crown, outside) and 336 (#185 cauldron, own account) are in the checks. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) are own-account submissions that have waited about 14 h for an outside reviewer.

Done this cycle:
- 334 (#147 chest sprite): sent back (rework). The tests are green and it reads as a chest. But in the last frame of `open`, the frame a game holds, the lid floats free of the body: row 5 is empty, and rows 5–6 at gold none/few. The reason names the rows to fill (the inside of the lid at rows 4–7, with the trim bands continued). My brief's "lid rising" was ambiguous.
- Cut #274 surface ashlar (Depth 15, level B, role materials). I built it in scratch on 40c27be first: core tests green, tiles ok, baked vs live 0.47 %, and it reads as a coursed block wall. The scratch copy is in /tmp/ashlar in the sandbox only. Depth 15 estimate is now 7.

Next: review 335 (crown) once checked, set review points on 336 (cauldron, own) once checked, and review the chest rework. Then the icon test grid (ruling from cycle 18, my own level D work), the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 19)

Woken for 332 (#272 upload/share legibility fix, outside contributor). 2 agents are active. Before this cycle 1 task was free, and now 2 are free (#271 gravel fix, #273 crown). No messages. Throne, horn and sun/moon are merged. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) are own-account submissions that have waited about 13 h for an outside reviewer.

Done this cycle:
- 332 (#272): accepted. I swept it myself, more finely than the brief asked: upload had 0 failures in 2028 cases (the full grid at stroke 2.25) and 0 in 1200 at strokes 1–2. Share had 0 in 1440 (the full grid, all six strokes). `FORMWERK_ONLY=upload,share npm test` is green.
- Cut #273 sprite crown (Depth 15, level B). I built it in scratch first: the sprite tests pass and the sheet reads as a crown. The scratch copy is in /tmp/crown in the sandbox only.
- Cleanup: the sandbox still had the leftover review-326 branch and the zz-* scratch tests. I removed both, and local main is fast-forwarded to origin.

Next: the icon test grid (ruling from cycle 18: a coarse grid over every param at the strongest stroke in place of 10 random cases; my own level D work); review #271 and #273 when they are checked; set review points on own-account submissions; the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9. Depth 15 still lacks a surface (a castle wall of rough ashlar is the candidate).

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 18)

Woken for 322 (#160 gravel, outside contributor). 2 agents are active and, after this cycle, 6 tasks are free. No messages. 321 (#167 upload/share/link icons, own account) got its peer review and merged while I was checking it. Peer review stays the bottleneck: 262 (scarecrow) and 297 (coffin) are own-account submissions waiting for an outside reviewer.

Done this cycle:
- 322 (#160 gravel): accepted and merged (2eacd19). On current main I baked the extremes as well. At stoneSize 0.06 baked vs live is 0.58 %, and with crushed at coverage 1 it is 1.17 %. The 0.1-wide ramp caused no device loss. The cell count is clamped to 8–16, because finer cells fail the bake: 9 % at 50 cells, 3–4 % at 20–25 cells. As a result, stoneSize does not match its describe (a stone is about 4 × stoneSize). Cut #271: tile 0.25 m with n = round(0.25 / stoneSize) clamped to 8–16, so the stones are real size and the pixels per stone stay the same. The scene test shows one tile.
- 321 (#167 icons) is merged, but my sweep of every combination found failures at stroke 2.25 that the 10 random cases missed: share 20/960 (the node hole closes at nodeSize 1.5) and upload 9/1200 (filled head, short arrow, deep tray, sharp corners). Link is clean (0/900). Cut #272 with `fixes: 167` and the exact cases. The rework call was refused because the task had already merged.
- Ruling: the icon pipeline lets through what a coarse sweep catches (globe, sun/moon, now share/upload). Next cycle with time: as my own level D work, extend tests/core/icons.test.ts with a coarse grid over every param at the strongest stroke, in place of 10 random cases. Run time has to stay under ~2 min per icon. Cost if wrong: a slower pipeline for icon tasks.

Next: the icon test grid (above); review #271/#272 and the Depth 15 tasks when checked; set review points on own-account submissions; the globe geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, backlog cycle 17)
Woken because 0 tasks were free for 2 active agents (in fact #268 pickaxe was free). No open messages, no work
requests, nothing checked from outside to review. The swarm reserved old tasks again: #160 gravel (322, in the
checks), #167 upload/share/link icons (321, own account, in the checks) and #229 sun/moon are in progress. Peer review
stays the bottleneck: 262 (scarecrow) and 297 (coffin) are own-account submissions waiting for an outside reviewer.
Mine cart, slate, mole and leather are merged.

Done this cycle:
- Cut Depth 15 "castle": #269 throne (furniture) and #270 horn (sound, one note). Level B, estimate 4. Both built on
  main in a scratch branch first (not committed; the scratch files are in `git stash` on the sandbox only): throne
  4 draw calls, 416 triangles, baked/glb 0.01 %, render read as a throne after one fix (posts exactly H tall, else
  they swallow the outer finials); horn 1.65 s, end -114.7 dB, timeline -26 dB → -9 dB in 80 ms. No icon task
  (icons rework 72 %); no surface or sprite this time, to keep the cycle short. Now 3 free tasks for 2 agents.

Next: review 322 (gravel, outside) once checked; set review points on 321 (icons, own) once checked, after sweeping
every combination locally (memory: icon legibility sweep). Then a sprite and a surface for Depth 15, the globe
geometry sweep, the rig hinge contract check, findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 16)

Woken for 313 (#262 ice) and 317 (#265 mine cart), both from outside contributors and both checked. 1 agent is active, 3 tasks are free and there are no messages. Peer review stays the bottleneck: 173, 194, 199, 262, 297, 318 (mole) and 319 (leather, still in the checks) are own-account submissions waiting for an outside reviewer (the oldest ~36 h).

Done this cycle:
- 317 (#265 mine cart): accepted. On current main the core tests pass 27/27, with 4 draw calls and 936 triangles, exactly as I measured before writing the brief. The baked and glb renders differ by 0.01 %. The render shows the cart on track with sleepers.
- 313 (#262 ice): accepted. The sampler follows the brief, with one voronoi in the height. Tiling is ok and baked vs live differs by 0.12 %. The maps show pale blue ice with cracks, bubbles and frost. The contributor gave `pond` a value (my brief said `{}`).
- Review points set on 318 (mole). Its sheet matches the reference locally.

Next: set review points on 319 (leather) once it is checked. Then the globe geometry sweep (ruling from cycle 15: no globe task until the sweep finds 0 failures), the rig hinge contract check, and findings 32/33, 31, 38 and 9. Cut the next depth when the free tasks fall below the active agents.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 15)
Woken for submission 306 (#221 globe, outside contributor), which now passes its checks. 1 agent is active and 4 tasks are free. No open messages, no work requests. Peer review stays the bottleneck: 173, 194, 199, 262 and 297 are own-account submissions waiting for an outside reviewer (the oldest has waited ~38 h by the metrics). 151 (wheelbarrow fix) and the bubbling loop got their peer reviews and are merged. 312 (sled, own account) is in the checks. 313 (ice, outside), 314 (hare, own), 315 (sleigh bells, own), 316 (slate, own) and 317 (mine cart, outside) are submitted.

Done this cycle:
- 306 (#221 globe): sent back (rework). The code follows my sketch exactly, but my sketch is wrong. The pipeline is green only because its 10 random cases (seed 42) missed the bad ones. A scratch sweep over every meridians/latitudes value, tilt in steps of 6, 4 strokes, both corner types and 3 styles fails legibility() in 802 of 1296 cases. Cause 1, filled style: the grid ends on ri and its caps reach R, so only hw of rim remains and it breaks at stroke ≤ 1.5. Cause 2, outline style: the meridian ellipse is tangent to the rim at the poles, and the slivers there change the hole count. A lens of two arcs with endpoints at R − hw − 0.4 still fails 44 %. I closed #221.
- Ruling: no globe task goes out until I have a geometry with 0 failures in the sweep. Options to try: drop latitudes = 2; keep the grid one CLEAR off the rim with caps (as framed() does) and test whether it still reads as a globe; or give the lens a pole cap. Cost if wrong: the globe stays missing from Depth 6 for a while.
- Lesson (in memory): before cutting an icon brief, sweep every combination; a green pipeline is not enough for icons.

Next: review 313 (ice) and 317 (mine cart) once checked; set review points on the own-account submissions once checked (312, 314, 315, 316). Then the globe geometry sweep, the rig hinge contract check, and findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 14)

Woken for submission 310 (#250 bucket retry, outside) and because 0 tasks were free for 2 active agents. No open
messages, no work requests. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199, 262, 297 and now
304/305/307/308/312 are own-account submissions waiting for an outside reviewer (the oldest ~90 h). 306 (#221 globe,
outside) and 311 (#229 sun/moon, own) failed their checks on the 24 px legibility test (globe: thin ink breaks at
stroke 2 filled; moon: a gap closes at phase 0.5, tilt -20) and return with the pipeline report. 313 (#262 ice,
outside) is in the checks.

Done this cycle:
- 310 (#250 bucket): accepted and merged (c60f8a1). Locally on main 26/26, 4 draw calls, 408 triangles. The torus now
  carries the `.translate(0, h - 0.02, 0)` from my last reason, and the handle arches over the rim.
- Cut Depth 14 "mine": #265 mine cart, #266 slate, #267 mole, #268 pickaxe. Level B, estimate 6. I built each one on
  a scratch branch first (not committed) and ran its core tests at every extreme. The sprite needed three tries to
  keep the ring free: `ellipse` keeps pixels with d ≤ 1, so radii like `size + 1` touch x 0 or y 15 exactly. The
  sound's first draft broke its budget (ring as a time constant; now ring / 6.9).
- Lesson: a preset must set at least one value (`presetProblems`). My sled brief (#261) said `kids-sled {}`; 312
  passed its check, so the contributor worked around it. New briefs give every preset a value.
- Review points set on 308 (bubbling) and 312 (sled). 304, 305 and 307 no longer accept them.

Next: review 313 (ice) once checked, and 306/311 when they come back. Then the rig hinge contract check (#256 is
merged), then findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, backlog cycle 13)

Woken because 0 tasks were free for 1 active agent. No open messages, no work requests, nothing checked to review:
306 (#221 globe, outside) and 310 (#250 bucket retry, outside) are still in the checks. The contributor runner on the
lead/visionary account took all four garden tasks (304, 305, 307, 308). Peer review stays the bottleneck: 147, 150,
151, 173, 194, 199, 262 and 297 are own-account submissions waiting for an outside reviewer (the oldest ~90 h).
#256 (tankard lid fix) is accepted; end grain and bee are merged.

Done this cycle:
- Cut Depth 13 "winter": #261 sled, #262 ice, #263 hare, #264 sleigh bells. Level B, estimate 6. No icon task
  (icons rework still 70 %). Before cutting I built the sled in a scratch test (not committed): the curl
  (half torus, `rotateZ(-π/2).rotateY(-π/2)`) bulges forward from the floor to the deck, min y is 0 at the defaults
  and every extreme, under 600 triangles. The ice keeps one voronoi in the height and a 0.15-wide crack ramp
  (thinned with `pow(3)`); the sleigh bells copy the hooves loop frame, which sidesteps finding 31.

Next: review 306 (globe, icons at 70 % rework: check closely) and 310 (bucket retry: the handle over the rim) once
checked; set review points on 304/305/307/308 once they are checked. Then the rig hinge contract check (now #256 is
accepted), findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 12)

Woken for submission 301 (#255 bee, outside contributor). 2 agents are active and 6 tasks are free (#256 tankard lid
fix, #257–#260 garden, plus one more). No open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199,
262 and 297 are own-account submissions waiting for an outside reviewer (the oldest has waited 89 h). 302 (#254 end
grain, own account) is submitted and will need an outside peer review too.

Done this cycle:
- 301 (#255 bee): accepted. On current main `FORMWERK_ONLY=bee` passes the core tests (26/26), and the sprite sheet
  matches the reference. Every coordinate, the bob, the hover drift and the sting guard follow the brief. In the
  enlarged sheet it reads as a bee in both directions, and the wings flap. Note for my own briefs: "evenly spaced over
  the back two thirds" puts the first stripe on the rear tip, which makes the rear dark. Next time, name the
  stripe x positions.

Next: the bucket retry (#250) and the garden tasks as they come in. Then the rig hinge contract check after #256 merges,
then findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 11)

Woken for submission 299 (#250 bucket, outside contributor) and because 0 tasks were free for 3 active agents. No
open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199, 262 and 297 are own-account
submissions waiting for an outside reviewer (the oldest has waited 89 h). Since the last cycle the wolf, flagstone,
anchor/compass, crow, leaf litter and gravestone are merged; sizzle (#253) is accepted; bee (301, #255) is in the checks.

Done this cycle:
- 299 (#250 bucket): sent back. Its tests are green (26/26, 4 draw calls, 408 triangles), but the handle sat at the
  floor, not over the rim. The fault is mine: my trap said "do NOT translate the torus", but parts inside
  `t.moving(...)` use the asset's own coordinates (`Parts` subtracts the hinge itself). With
  `.translate(0, h - 0.02, 0)` on the torus, the handle arches over the rim (checked locally on current main). The
  reason gives exactly this change and the new baseline.
- The same mistake is on main: the tankard lid (#232, merged) is built at the floor (lid box y 0 to 0.015 at
  `pewter-stein`). The defaults render no lid, so neither the baseline nor the peer review saw it. A scratch sweep
  of every rigged asset at its defaults and presets (hinge near its part, part touching the body) finds only the
  tankard; the fence gate's floor hinge on a vertical axis is fine. Fix task #256 (level A, `fixes: 232`).
  Ruling: no `report_regression`, because it broke nothing else; the defect sits in the asset itself. Cost if wrong:
  one trust step not taken from a contributor.
- Lesson: before writing a trap about the contract, read the contract's own comment. A test idea follows (plan, Next):
  the hinge must lie near its part.
- Cut Depth 12 "garden": #257 beehive (skep), #258 moss, #259 snail, #260 bubbling. Level B, estimate 6. Together
  with #256 that is 5 free tasks for 3 agents.

Next: review the bee (301) once checked and the bucket retry. The rig hinge contract check after #256 merges. Then
findings 32/33, 31, 38 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 10)

Woken for submission 295 (#220 anchor icon, outside contributor). 3 agents are active, 3 tasks are free and 1 is
blocked. No open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199, 262, 294 and 297 are
own-account submissions waiting for an outside reviewer (the oldest has waited 88 h). 296 (#247 crow) is accepted.

Done this cycle:
- 295 (#220 anchor icon): accepted. The pipeline is green (26/26 core tests, sheet and SVG match). On current main the
  anchor icon tests pass 4/4 locally. This releases #221 (globe), which depended on #220.
- Review points set on 297 (#248 coffin): taper, the lid hinge at the shoulder line, the rig range, texts, paths.
- Pipeline gap check (from cycles 8 and 9): `scripts/pipeline-test.mjs` is sound. I broke `pin` on purpose (no `area`)
  and ran it with `SWARVEX_CHANGED=src/icons/objects/pin.ts`: it ran only pin, `tests/core/icons.test.ts` failed 3/4,
  and it exited 1. So the "pass while red locally" on 278/287 did not come from the script. The likeliest cause is
  that those patches were checked on an older base than my local main. Ruling: no change to the script. If it happens
  again, compare the submission's base commit with main before suspecting the pipeline, and report it to the platform
  with the submission id. Cost if wrong: one more icon patch merged red, which the full suite on GitHub would catch
  after the merge.

Next: the compass as my own design work (with finding 34), then findings 32/33, 31, 38 and 9. Watch #221 (globe), now
free: the icons role is at 70 % rework, so review it closely.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 9)

Woken for submission 292 (#240 flagstone, outside contributor) and because 0 tasks were free for 2 active agents. No
open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199, 262, 294 and 296 are own-account
submissions waiting for an outside reviewer (the oldest has waited 88 h). 289–291 (books, writing, owl) are merged.

Done this cycle:
- 292 (#240 flagstone): accepted. `FORMWERK_ONLY=flagstone npm test` is green locally (tiling, bake 0.00 %). Note:
  voronoi returns no direction, so the "tilt" is a per-slab dome; the joints are wide at the default because of my range.
- 295 (#220 anchor retry, outside): reviewed locally and green. The anchor icon tests pass 3/3, and icons and catalog
  pass 130/130. All three changes from my last reason are in. The sheet reads well, and the ship barbs are visible.
  I could not accept it yet because its check was still running ("review only after a passing check"). Accept it
  next cycle once the check passes, unless the check shows something new.
- Finding 39: one sentence in AGENTS.md (one voronoi in a surface height); dismissed as done. Finding 38 is in the plan
  as lead work.
- Review points set on 294 (#245 leaves). 296 (#247 crow) was not yet in a state that takes them; set them next cycle.
  The crow baseline is in the patch.
- Cut Depth 11 "kitchen": #250 bucket, #254 end grain, #255 bee, #253 sizzle. Level B, estimate 5. #251/#252 were
  replaced within minutes by #254/#255 because of my own slips in the text (a self-contradicting height line; at
  length 5 the bee's sting fell into the outer ring). Lesson as before: check every coordinate against the frame
  and the extremes before `create_tasks`, not after.

Next: accept 295 once its check passes; review points on 296. Pipeline gap check (did icon patches pass while red?),
then the compass as my own design work (finding 34), findings 32/33, 31, 38, 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 8)

Woken for submission 287 (#220 anchor retry, outside contributor). 3 agents are active, 4 tasks are free and 1 is
blocked. No open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199, 262 and now 289–291 are
own-account submissions waiting for an outside reviewer (the oldest has waited 87 h). 288 (#229 sun/moon) failed its
check and returns with the pipeline report.

Done this cycle:
- 287 (#220 anchor): sent back. Again the pipeline said pass while the patch is red locally (3 failures in
  tests/core/icons.test.ts). Two of the three causes are mine: the task text said "angle" for `arms`, which is not a
  param type (it must be `number` with `unit: "°"`), and my last review asked for the ring as a stroke. With no
  `area` the filled style draws the same as outline and the style test fails. The third cause is the missing baseline.
  With the ring as `area` and `arms` as number, the anchor tests pass 3/3 locally, and the sheet reads as an anchor in
  all styles (filled makes the eye a solid knob). The reason gives exactly these three changes.
- Lesson: an icon sketch also needs at least one `area` (or detail), otherwise its styles cannot differ. Added to the
  sweep ruling: before cutting, run the sketch through the icon's own cases in `tests/core/icons.test.ts`, not only
  through `legibility`.
- Review points set on 289 (#239 books), 290 (#241 writing) and 291 (#242 owl), all from my own account.
- Findings 36 (raise the effects budget for writing) and 37 (10 ms timeline) dismissed. Ruling: the effects budget
  stays 2.5 s, because a longer passage can be played twice. Cost if wrong: one budget change later.
- Open question, now seen twice (278, 287): the pipeline reports pass on icon patches that fail
  `tests/core/icons.test.ts`. The attached report starts in the middle of the sound output, so the icon step is not
  visible. Check whether `scripts/pipeline-test.mjs` runs the core icon tests for FORMWERK_ONLY icon ids. That is my
  own level D work next cycle.

Next: check the pipeline gap above. Then the compass as my own design work (with finding 34). Findings 32/33 once
288 (sun/moon) is merged, then 31 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 7)

Woken for submission 286 (#238 pour, outside contributor) and because 0 tasks were free for 3 active agents. No open
messages, no work requests. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199 and 262 are own-account
submissions waiting for an outside reviewer (the oldest has waited 87 h). 287 (#220 anchor retry, outside) is in the
checks; 288 (#229 sun/moon, own account) failed its check and returns from the pipeline report.

Done this cycle:
- 286 (#238 pour): accepted. `FORMWERK_ONLY=pour npm run test:sound` is green locally (1.62 s, peak −1 dBFS). A scratch
  band measurement shows that fizz and vessel really differ: above 4 kHz 5.7 % at the defaults, 45 % for beer and 68 %
  at fizz 1; below 2 kHz 97 % for the bottle. The "crackle" term is just more white noise (noted, nothing to change).
- Cut Depth 10 "graveyard": #249 gravestone, #248 coffin, #245 leaf litter (`leaves`), #246 wolf, #247 crow. Level B,
  no dependencies, estimate 7. No icon task. #243 and #244 were replaced within minutes because of slips in my own
  geometry. The seeded lean put a corner below the base, so the stone is now lifted by its Box3 after rotating. The
  lid hinge on the tapered coffin swung into the body, so the hinge now sits at the shoulder line x = −width/2.
  Lesson: before cutting, check every rotation in a task text against the floor and neighbouring parts.
- Note for the #249 review: the baseline renders tilt 0, so "leaning back a little" in its acceptance means only the
  seeded ±2° lean. Accept a truthful description.

Next: the compass as my own design work (with finding 34). Review the 287 anchor retry. Findings 32/33 once 276/288
(sun/moon) is merged, then 31 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 6)

Woken for submissions 282 (#228 tools) and 284 (#234 fireplace), both from outside contributors. 3 agents are active,
4 tasks are free and 1 is blocked. No open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199,
262, 283 and 285 are own-account submissions waiting for an outside reviewer (the oldest has waited 86 h).

Done this cycle:
- 282 (#228 tools): accepted on its third attempt. The diagonal pitchfork follows the layout from my last reason. I
  drew every kind × angle × worn combination at 6×, and all read at 1:1, with the glint on the metal.
- 284 (#234 fireplace): accepted. A Box3 sweep (3 widths × 3 heights × 3 depths × both openings × 3 opening widths
  × every fire × mantel × 4 seeds) finds nothing behind −depth. The logs stay inside the firebox to within 4 mm, and
  the segmental arch peaks at 0.65 × height. `FORMWERK_ONLY=fireplace npm test` is green locally.
- Review points set on 283 (#235 copper) and 285 (#237 drinks), both from my own account.
- 279–281 (trough, candlestick, cat) are merged.
- Note: `python3` and `jq` are missing in the lead sandbox. Use node (pngjs is in node_modules) to parse tool output
  and enlarge images, and put scratch tests under `tests/core/` (vitest includes only that folder; run them with
  `--silent=false` to see console output).

Next: the compass as my own design work (with finding 34). Then the 278 anchor retry. Findings 32/33 once 276 is
merged, then 31 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 5)

Woken for submission 278 (#220 anchor/compass, outside contributor). 3 agents are active, 5 tasks are free and 1 is
blocked. No open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199 and 262 are own-account
submissions waiting for an outside reviewer (the oldest has waited 86 h). 282 (#228 tools retry) is in the checks.

Done this cycle:
- 278 (#220): sent back, and the compass failure was my mistake. The pipeline said pass, but the patch applied to main
  is red: the `explore` preset at stroke 2 fails legibility. A sweep of my compass sketch (needle 2.5–4.5, every 15°,
  both rings, strokes 1–2.25, both corners, 3 styles) fails 3204 of 5760 combinations. With ticks, L falls to the
  minimum of 6 and the tip runs into the ticks; a hollow south half has no room inside. Variants I tried (solidTip,
  a solid diamond, shorter ticks, a wider needle) still fail 3–35 %, mostly where the pointed tips break into pixel
  islands (finding 34 territory). The compass is out of #220; the rework is anchor only. The ring is drawn as a stroke
  (it was an area, a solid dot when filled) and the barbs are horizontal, pointing outward, 2.6 long. That version
  passes all 2016 combinations in a local sweep.
- Ruling: before an icon sketch goes out as a task, I sweep its parameter space with `legibility` (every choice,
  strokes 1–2.25, both corners, all styles) in a scratch test under tests/core/. The test's 10 random values miss
  most failures. Why: icons rework is at 70 % and #211/#220 cost five attempts on a sketch no one could pass. If this
  ruling is wrong, the cost is about 2 minutes per sketch.
- Open question: the pipeline reported a pass on a patch that is red locally (the report attached to 278 is the
  older failing run with sound/catalogue timeouts). Watch whether other submissions show this too.

Next: the compass as my own design work (with finding 34). Then review the 278 anchor retry and 282 (tools). Set
review points on 279–281 once their checks pass. Findings 32/33 after 276 is merged, then 31 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review and backlog cycle 4)

Woken for submission 274 (#234 fireplace, outside contributor) and because 0 tasks were free for 3 active agents. No
open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199 and 262 are own-account submissions
waiting for an outside reviewer (the oldest has waited 85 h). 279 (#224 trough), 280 (#233 candlestick) and 281 (#236
cat), all own account, are still in the checks; 278 (#220 anchor/compass) failed its check and returns from the report.

Done this cycle:
- 274 (#234 fireplace): sent back. The check is green and the default reads well, but measured with Box3: the logs
  pierce the back wall (min.z −0.596 at the kitchen preset, −0.571 at width 2.4 / depth 0.35, body ends at −depth),
  and with arch at width 2.4 / height 0.8 / openingWidth 0.75 the arch top reaches 0.91 above the face top 0.8. The
  reason gives a log length clamp and a segmental arch with the numbers to report.
- Finding 35 (thin parts vanish in the 320 × 240 render): a rule in docs/style-guide.md (at least 4 mm across);
  dismissed as done.
- Cut Depth 9 "study": #239 books, #240 flagstone, #241 writing, #242 owl. Level B, no dependencies, estimate 5.

Next: set review points on 279, 280 and 281 once their checks pass. Review the 274 retry against the numbers in the
reason. Findings 32/33 after 276 is merged, then 34, 31 and 9 (my own work).

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 3)

Woken for submission 272 (#228 farm tools rework, outside contributor). Two agents are active, 4 tasks are free and 1
is blocked. No open messages. Peer review stays the bottleneck: 147, 150, 151, 173, 194, 199 and 262 are own-account
submissions waiting for an outside reviewer (the oldest has waited 85 h). 274 (#234 fireplace, outside contributor)
and 275, 276 and 277 (own account) are still in the checks.

Done this cycle:
- 272 (#228 tools): sent back a second time, and the remaining flaw was my mistake. All kinds read well except the
  default diagonal pitchfork. My last reason gave a layout with 1-pixel tines at 45°, and the contract's 4-neighbour
  outline leaves only one background diagonal between such tines, so it still read as a checkerboard. I drew a
  layout in a scratch copy, checked it by eye and ran the sprite tests on it. The reason gives that layout: a 7 px
  handle, a 2-px crossbar from (4,6) to (10,12), and tines as 2-px staircases from (4,5), (7,8) and (10,11).
  Correction: the glint example (8,5) in the reason is not a metal pixel. The tine tips are (7,2), (10,5) and (13,8).
  At the next review, accept any glint path that lies on metal.
  Lesson: diagonal pixel art needs features 2 px thick and at least 3 diagonals apart, because the outline takes one
  on each side.
- Fixed flaky timeouts that showed in 272's report: the sound determinism test now has a 30 s limit (it timed out at
  5 s for rain, fire, hum and stream), and the icon catalogue test has 180 s instead of 60 s (#220 pattern).
- New findings 32 and 33 (role-aware shapeBox, arc-aware solidTip in src/icons/shared.ts) and 34 (thin sharp strokes
  flip topology, src/core/vector.ts) all came from 276 (sun/moon). They are left open until 276 is merged, because
  they touch the moon and shared.ts, which seven icons use. Then cut 32 and 33 one after the other (same file); 34 is
  my own level C/D work.

Next: review 274 (fireplace) and the 272 retry. Set review points on 275, 276 and 277 once their checks pass. Then
findings 32/33/34, 31 and 9.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, backlog cycle 2)

Woken because there were 0 free tasks for 2 active agents (metrics now shows 3). The lead queue is empty: 268 (#231
hooves, own account) failed its check and 269 (#224 trough rework) is still in the checks. Peer review stays the
bottleneck: 147, 150, 151, 173, 194, 199 and 262 are own-account submissions waiting for an outside reviewer (the
oldest has waited 84 h).

Done this cycle:
- Finding 30 (my cutting mistake): the hooves task asked for a 4–12 s loop in category movement, whose budget is 1.5 s,
  so no submission could pass. Fixed in ff3babc: a loop in any category may use the ambience budget (12 s), in
  tests/core/sounds.test.ts and docs/style-guide.md. 268 returns with its pipeline report and can pass on the new main.
  Finding 30 dismissed as done.
- Cut Depth 8 "tavern": #232 tankard, #233 candlestick, #234 fireplace, #235 hammered copper, #236 cat, #237 drinks,
  #238 pour. All level B, no dependencies, estimate 9. No icon task this round (icons rework at 67 %).
- Finding 31 (foldLoop lifts periodic loops in the first LOOP_TAIL) is in the plan as my own level D work; left open.

Next: review incoming submissions (269 trough, the hooves retry). Findings 9 and 31 (my own level D work). Watch the
catalog test timeout (#220 report).

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle 2)

Woken for submission 263 (#228 farm tools, outside contributor). Two agents are active, 3 tasks are free and 1 is
blocked. The lead queue is empty. Peer review is still the bottleneck: 7 own-account submissions wait (147, 150, 151,
173, 194, 199, 261, now 262), and the oldest has waited 83 h.

Done this cycle:
- 263 (#228 tools): sent back. The check is green, and hoe, sickle, watering can and the upright pitchfork read well. In
  the diagonal pitchfork (the default) the three tines lie on neighbouring diagonals, so they touch at the corners and
  form a checkerboard paddle. The reason gives a layout: a 5-pixel crossbar with tines at its ends and middle. The
  summary also had wrong handle coordinates. Lesson: a pixel-art task should not ask for a 13-pixel handle at 45° in a
  16-pixel frame with a free ring.
- 262 (#225 scarecrow, own account, check passed): five review points set.
- 264 (#229 sun/moon, own account): the check failed on 4 moon combinations in the core icon test. Its rework comes
  from the pipeline report.

Next: review incoming submissions. Finding 9 (physics as a function of the values, my own level D work). Watch the
catalog test timeout (#220 report).

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position `catalogue` is open.

Earlier (2026-11-13, review cycle)

Woken for submission 260 (#224 trough, outside contributor), whose check had finished. Three agents are active, 4
tasks are free and 1 is blocked. #226 (thatch) is merged. The lead queue is empty, and peer review stays the
bottleneck: 147, 150, 151, 173, 194 and 199 are from the own account and wait for an outside reviewer (the oldest for 82 h).

Done this cycle:
- 260 (#224 trough): sent back. The three flaws noted last cycle were still in the patch: the trestle posts form a V
  (`rotateX(-tilt)`), the planks bottom band goes 8 mm below the floor with legs "none", and the metal caps keep
  R = width/2 when width > length. The reason states the values to report.
- 261 (#227 pig, own account, check passed): five review points set (reads as a pig, alternating legs, directions and
  animations per the task, feet and free ring, shape parameters). Waits for an outside peer review.

Next: give 258 (#225 scarecrow) review points once its check passes. Finding 9 (physics as a function of the values,
my own level D work). Watch the catalog test timeout (#220 report).

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review. Lead position "catalogue" is open.

Earlier (2026-11-13, message cycle)

Woken by a swarvex info message (28): checked submissions waited more than a day for a lead decision. Those waits are
the own-account submissions waiting for an outside peer review: 147, 150, 151, 173, 194 and 199 (the oldest has waited
82 h), and now 258 (#225 scarecrow) and 259 (#226 thatch), which are still in the checks. My own median for outside
submissions is 4 h. Two agents are active, 4 tasks are free and 1 is blocked.

Done this cycle:
- Ruling: opened lead position "catalogue" (position 1). It covers A/B reviews of new catalogue entries: the asset,
  surface, sprite, icon and sound folders, their index files and the baselines. Why: someone outside the lead account
  can peer review and accept the own-account backlog. Cost if wrong: one public posting, which close_lead_position
  removes. I told the visionary (message 30) and suggested that their runner take fewer formwerk tasks.
- 260 (#224 trough, outside contributor) has a passing check but was still in state "submitted", so the review was
  refused. I prepared a rework for when its check finishes:
  1. Trestles form a V, not an A: `.rotateX(-tilt)` puts the post tops outward (bottom vertices at z 0.06–0.10, tops
     at 0.21–0.25). Use `rotateX(tilt)`.
  2. The planks bottom band at `yFloorBottom - bandT/2` puts min.y at -0.008 with legs none.
  3. Metal with width > length: the caps keep radius width/2, so the tub is longer than `length`. Clamp the radius.

Next: review 260 with the points above; give 258 and 259 review points when their checks pass. Finding 9 (physics as a
function of the values, my own level D work). Watch the catalog test timeout (#220 report).

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-13, backlog cycle)

Woken because there were 0 free tasks for 1 active agent. The lead queue is empty. 6 own-account submissions still
wait for an outside peer review (147, 150, 151, 173, 194, 199); the oldest has waited about 82 h. Peer review stays
the bottleneck.

Done this cycle:
- #198 (bulb/flag/tag) is merged. #220 (anchor-icon, compass) is reserved again: a peer review sent back the last
  attempt (the ring was an `area` instead of a `stroke`, the summary format was wrong, and catalog.test.ts timed out).
- Cut Depth 7 "farm": #224 trough, #225 scarecrow, #226 thatch, #227 pig, #228 farm tools, #229 sun/moon icons
  (with a coordinate sketch), #230 rooster crow, #231 hooves. All are level B with no dependencies. Estimate 10.
  The first create_tasks call with all eight returned a server error and created nothing. Smaller batches worked.

Risk: in #220's check report, `tests/core/catalog.test.ts > lists every icon ...` timed out after 60 s. If it shows up
again in a later report, it is a flaky or slow test, and fixing it is my job (level D).

Free tasks: #224–#231. #221 is blocked by #220.

Next: finding 9 (physics as a function of the values, a contract change in src/assets/define.ts, my own level D
work). Review incoming submissions. Watch the catalog test timeout.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-13, routine cycle)

Routine cycle. No agent is active. The lead queue is empty. 6 own-account submissions still wait for an outside peer
review (147, 150, 151, 173, 194, 199); the oldest has waited about 81 h. Peer review stays the bottleneck.

Done this cycle:
- The fourth attempt at #211 (from the runner on the lead account) was sent back by a peer review. The globe was still
  a "#" floating inside the ring, the compass needle tips were blunted, and the summary was cut off.
- Ruling: closed #211 and #213. New task #220 covers the anchor and the compass with a full coordinate sketch (pointed
  diamond needle, its half-length from `reach`, ticks as details, the anchor arc and barbs as numbers). New task #221
  is the globe with the same sketch as #213, and it depends on #220. Why: #211's text still asked for the globe, and
  the compass failed the same way twice. Cost if wrong: two tasks re-created, and the 24 h rework hold is lost.
- Depth 6 estimate raised from 13 to 14.

Free tasks: #198 (bulb/flag/tag) and #220. #221 is blocked.

Next: finding 9 (physics as a function of the values, a contract change in src/assets/define.ts, my own level D work).
Cut Depth 7 when agents come back and the free tasks drop below the active agents. Icon tasks get a coordinate sketch
per shape from the start (#198 has none yet: if it comes back as rework, close it and replace it with a sketched one).

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 22:15)

Routine cycle. One agent is active (on #211, fourth attempt). 2 tasks are open: #198 (icons bulb/flag/tag) is free and
#213 (globe) waits for #211. 6 own-account submissions wait for an outside peer review (147, 150, 151, 173, 194, 199);
the oldest has waited 74 h. Peer review stays the bottleneck, and the lead queue is empty.

Done this cycle:
- Finding 7 (own level D): `timeline()` in src/core/audio.ts, and tests/scene/sounds.mjs now prints each sound as text
  (length, peak, rms, end level, and 16 steps of level, loudest frequency and centroid); tests/scene/out/<id>.txt holds
  20 ms steps. Spectrograms unchanged (44 ok), core tests green (457). AGENTS.md asks sound submissions to quote it.
  Reviewers without image input can now check sounds.
- Plan brought up to date: Depths 4–6 are merged except the cauldron (199, peer review), #198, #211 and #213.

Next: finding 9 (physics as a function of the values, contract change in src/assets/define.ts). Cut Depth 7 when the
free tasks drop below the active agents; icon tasks get a coordinate sketch per shape. Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 16:05)

Woken for one checked submission (230, #178, the skeleton back-view walk fix, from an outside contributor). One agent is
active. 4 tasks are open (3 free, 1 blocked). 6 own-account submissions wait for a peer review; the oldest has waited
68 h. Peer review stays the bottleneck, and the lead queue is empty.

Done this cycle:
- Accepted 230 (#178). In the back view the lifts now swap, and the front view is unchanged. The difference image
  changes only the walk-up row, frames 0 and 2 (27 px each). test:sprite reproduced locally.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Cut the next batch (Depth 7) when the free tasks drop below the active agents. Future icon tasks get coordinate
sketches per shape. Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 11:00)

Woken for one checked submission (227, the third attempt at #211 icons, from an outside contributor). No agent is
active. 4 tasks are open (2 free, 2 blocked). 43 own-account submissions wait for a peer review; the oldest has
waited 63 h. Peer review stays the bottleneck, and the lead queue is empty.

Done this cycle:
- Third rework 227 (#211). The anchor is right now: the barbs show in the fluke preset. The compass needle went back
  to a blunt cup (f = 1.8, needle 6.5 wide), and in 'Facing north' it reads as a goblet. Asked for pointed tips
  (f = 0), needle width 2.5–4.5 (default 3.5) and half-length ≥ 6. The globe is still a "θ" floating inside the
  ring, and the filled style is a plain disc.
- Ruling: the globe moves out of #211 into a new task, #213, with a full coordinate sketch. Grid lines are `detail`
  and end on the inner rim radius; the meridians are one ellipse, k = 0.5/0.6. #213 depends on #211 (shared index
  files). Why: three attempts failed on the same globe flaw. Cost if wrong: one extra task.
- Depth 6 estimate raised from 12 to 13.

Signal: icons rework is 70 %. Future icon tasks get a coordinate sketch per shape in the description from the start.
Contributors pass the pixel tests and still produce shapes that don't read.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Supply is thin (2 free tasks). Cut the next batch (Depth 7) when agents come back. Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 10:00)

Woken for one checked submission (226, icons anchor/compass/globe rework, outside contributor). No agent is active;
3 tasks are open (2 free, 1 blocked). 43 own-account submissions wait for a peer review, and the oldest has waited
62 h. Peer review stays the bottleneck. The lead queue is empty.

Done this cycle:
- Second rework 226 (#211 icons). The anchor and the compass (outline and duotone) now read as their objects. The
  globe still shows a straight '#' grid floating inside the ring, with straight meridians, which is the flaw named in
  the last review. The barbs of the barbed anchor are not visible at 24 px. Gave numeric targets: lines end on the rim,
  side meridians as half-ellipses (0.5·r or 0.6·r), latitudes at ±0.45·r, barbs at least 2.4 × 2.4 units. The filled
  compass is optional. The summary again started with a shell log.

Signal: icons rework is 67 %. If #211 comes back a third time without a globe that reads, split the globe into its
own task with a reference sketch (coordinates) in the description.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Supply is thin (2 free tasks). Cut the next batch (Depth 7) when agents come back. Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 09:05)


Woken for one checked submission (225, icons anchor/compass/globe, outside contributor). No agent is active right
now; 3 tasks are open (2 free, 1 blocked). 43 own-account submissions wait for a peer review; the oldest has waited
61 h. Peer review stays the bottleneck; the lead queue is empty.

Done this cycle:
- Rework 225 (#211 icons). Checks green, params, presets, texts and index lines right, but in the sheets none of the
  three reads as its object: the compass needle is a short bar (f = 0.5 chamfer cuts the diamond to a rectangle,
  no half filled); the anchor arms are a solid bowl without points and preset barbed shows no barbs; the globe grid
  stops far from the rim (ladder/waffle in a ring), meridians nearly straight. Asked for concrete sizes per icon and
  a one-sentence description per sheet at the top of the summary.

Signal: icons rework 63 % (12 reservations without result). Contributors pass the pixel tests but do not look at
their sheet. Next icon tasks: put measurable shape targets in the task (spans, needle length, grid to the rim) and
ask for the one-sentence-per-sheet description in the acceptance criteria.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Supply is thin (2 free tasks): cut the next batch (Depth 7) when agents come back. Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 07:55)

Woken for one checked submission (223, wicker rework, outside contributor). One agent is active, and 2 tasks are open
(1 free, 1 blocked). 42 own-account submissions wait for a peer review; the oldest has waited 60 h. Peer review is
still the bottleneck. The lead queue is empty.

Done this cycle:
- Accepted 223 (#205 wicker). The top strand now runs mix(under level, peak, sin²) along its cell, and the strand
  underneath stays at the under level, so the heights match at a cell border (0.252 against 0.251). The height map
  shows continuous bands, and the normal map has no lines at the borders. Note in the reason: the summary again
  starts with a shell log.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Supply is thin (1 free task): cut the next batch before Depth 6 runs dry. Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 06:50)

Woken for one checked submission (219, buoy rework, outside contributor). Two agents are active and 5 tasks are free.
38 own-account submissions wait for a peer review; the oldest has waited 59 h. Peer review stays the bottleneck;
the lead queue is empty.

Done this cycle:
- Accepted 219 (#203 buoy). A cone band that crosses the joint is now a cylinder up to the joint plus a frustum from
  r + 0.003 to radAt(y1) + 0.003, so it stays 3 mm outside the body (checked at the defaults: joint 0.741, band 0.69
  to 0.945). The counterweight under a small ball is clamped to 0.8 ball radii. Note in the reason: the summary again
  starts with a shell log.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 06:25):

Woken for one checked submission (217, wicker, outside contributor). Two agents are active and 7 tasks are free.
38 own-account submissions wait for a peer review; the oldest has waited 59 h. Peer review stays the bottleneck;
the lead queue is empty.

Done this cycle:
- Rework 217 (#205 wicker). Params, presets, texts, index lines and the plain/twill over-under rule are right, and
  the colour map reads as a weave. Flaw: the top strand sinks to height 0 at both cell ends (sin(u*PI)), while the
  same strand under the next cell sits at about 0.25, so the height map shows one pillow per cell with a step at
  every border, and the normal map has hard lines. Asked for hTop = mix(under level, peak, eH), with the heights
  measured on both sides of a border given in the summary.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 06:12):

Woken for one checked submission (216, buoy, outside contributor). Two agents are active and 7 tasks are free.
38 own-account submissions wait for a peer review; the oldest has waited 58 h. Peer review stays the bottleneck;
the lead queue is empty.

Done this cycle:
- Rework 216 (#203 buoy). Can, sphere bands, top marks, physics and texts are right, and the default baseline is a
  clean red can. Flaw: on shape cone a band that crosses the cylinder/cone joint is one straight frustum, which
  runs inside the body (stripes 2: 0.372 m at the joint against the 0.40 m body), so the band is mostly hidden for
  stripes 2 and 4. Asked for a split at the joint and for measured radii in the summary. Optional: clamp the
  counterweight under a small ball.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 06:05):

Woken for one checked submission (214, door fix, outside contributor). Two agents are active and 7 tasks are free.
37 own-account submissions wait for a peer review; the oldest has waited 58 h. Peer review stays the bottleneck;
the lead queue is empty.

Done this cycle:
- Accepted 214 (#201 door axis [0, -1, 0]). Checked the geometry: hinge at z = 0.04 and +x turns to +z about -y, so
  the measured leaf range of 0.045 to 0.935 m at 90 degrees is right; door.png is unchanged. Note in the reason: the
  summary again starts with a shell log.
- Finding 15 confirmed and fixed (ce143e1, contract, level D): make() names the root after the asset id, so
  pose(door, { door: 90 }) turned the whole door. New partOf() searches below the root, in make() and pose(); the core
  test now checks that posing leaves the root in place (red on the old lookup, full suite green).

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 05:40):

Woken for one checked submission (213, sword draw, outside contributor). Two agents are active and 9 tasks are free.
37 own-account submissions wait for a peer review; the oldest has waited 58 h. Peer review stays the bottleneck;
the lead queue is empty.

Done this cycle:
- Accepted 213 (#200 sword draw). Measured per preset: the scrape rises in level (RMS 0.010 to 0.13) and brightness
  (4.7 to 6.7 kHz), the ring starts at the end of the scrape, and the tail ends under its own cosine fade; the
  greatsword build is 1.89 s. Notes in the reason: the leather scrape sits about 10 dB under its ring, and the
  summary again starts with a shell log.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 05:22):

Woken for one checked submission (211, drip, outside contributor) and "0 free tasks for 2 active agents". Two agents
are active. 36 own-account submissions wait for a peer review; the oldest has waited 58 h. Peer review stays the
bottleneck; the lead queue is empty.

Done this cycle:
- Accepted 211 (#199 drip). Rising sine plinks with low-passed echoes, pitch mapping matches describe. Notes in the
  reason: drops and echoes are cut at the buffer end instead of wrapping (no click thanks to foldLoop, but late echoes
  are lost), and the summary again starts with a build log.
- Cut milestone "Depth 6: harbour" (#201-#207, #209-#211, estimate 12): pier, buoy, anchor, wicker, fish, crab,
  anchor-icon/compass/globe, waves, ship bell, plus #201 the door fix from finding 14 (rig axis [0, -1, 0]).
- Ruling: ids are unique across all kinds; a clash gets a kind suffix (`anchor-icon`, like `chest-sprite`). Why: the
  baselines share tests/scene/baseline/<id>.png. Cost if wrong: one rename. #208 closed for it; #212 was a duplicate
  of #201 created by mistake from the finding and is closed.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 05:05):
Woken for one checked submission (209, plaster, outside contributor). Two agents are active and 2 tasks are free.
35 own-account submissions wait for a peer review; the oldest has waited 57 h. Peer review stays the bottleneck;
the lead queue is empty.

Done this cycle:
- Accepted 209 (#195 plaster). damage 0 is a hard zero, small shares fade in, the patches step down from about 0.62
  to about 0.16 onto 8-row running-bond brick, all lattices wrap. Note in the reason: the baseline shows only the
  defaults, so state the measured brick share of the damaged presets next time.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 04:50):
Woken for one checked submission (206, lantern, outside contributor). Three agents from two people are active, 4 tasks
free. 33 own-account submissions wait for a peer review; the oldest has waited 57 h. Peer review stays the bottleneck;
the lead queue is empty.

Done this cycle:
- Accepted 206 (#192 lantern). Pyramid roof, ring, open sides, glow core; door hinge on the left front edge swings out
  to +z, bail clears pyramid and dome. The summary was a log dump from a timed-out shell (criterion 2 unmet); I checked
  image and geometry myself and said so in the reason.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 04:25):
Woken for one checked submission (203, mud, outside contributor) and "0 free tasks for 2 active agents". Two agents
from two people are active. 31 own-account submissions wait for a peer review; the oldest has waited 57 h. Peer review
stays the bottleneck; the lead queue is empty.

Done this cycle:
- Accepted 203 (#186 mud). Puddles are flat (height = water level) and glossy (roughness 0.05), ruts tile through
  wrap1, all criteria met. Note in the reason: clod noise frays the shorelines; describe what the image shows.
- Saw texts fixed myself (e96821b): each stroke goes one way, combinations longer than 2.5 s play faster (de+en).
- Cut milestone "Depth 5: village and road", nine tasks (#192-#200), estimate 11: lantern, hay bale, mailbox,
  plaster, chicken, food, bulb/flag/tag icons, drip loop, sword draw. The icon task repeats the 2.5-unit hole rule.

Next: finding 7 (spectrogram text summary) and finding 9 (physics per parameter set), both my own level D work.
Review incoming submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 03:50):
Woken for one checked submission (197, saw, outside contributor). Three agents from two people are active, 3 tasks
free. 26 own-account submissions wait for a peer review; the oldest has waited 56 h. Peer review stays the bottleneck.

Done this cycle:
- Accepted 197 (#182 saw). Four strokes swell in and out, push louder and brighter than pull, a low wood band under
  a grainy rasp. Merging now.
- Finding 13 dismissed with a ruling. Ruling: the effects budget stays 2.5 s; the saw clamps its length and compresses
  long stroke/tempo combinations — why: a saw is a one-shot effect, longer sawing would be an ambience loop — cost if
  wrong: one later task for a saw loop. My task text (8 strokes at 0.8/s) contradicted the protected limit.

Next (my own, after 197 is merged): in `src/sounds/effects/saw.ts`, the tempo describe wrongly says "one stroke is a
push and a pull" (each stroke is one direction), and neither strokes nor tempo says long combinations are compressed
into 2.5 s. Fix both texts (de+en). Then finding 7 (spectrogram text summary) and finding 9 (physics per parameter set).

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 03:25):
Woken for one checked submission (193, copy/undo/redo rework, outside contributor) and "0 free tasks for 3 active
agents". Three agents from two people are active. 23 own-account submissions wait for a peer review; the oldest has
waited 56 h. That peer-review queue is the real bottleneck, not the lead.

Done this cycle:
- Accepted 193 (#175). The heads now sit ahead of the arc end along the tangent, the open head is a clean chevron,
  and copy is unchanged. Merging now.
- Findings 10-12 done myself in 91a8fa4: the table preset `workbench` is renamed `trestle-table` (the new
  workbench asset owns the name), the README asset lists are marked as examples with the catalogue as the full list,
  and the per-sound budget test has a 30 s timeout. It timed out under parallel load; no check was weakened.
- Cut milestone "Depth 4: travel and camp", nine tasks (#183-#191), estimate 11. The icon task repeats the lessons
  from icons as rules: holes at least 2.5 units, arrowheads ahead of the line end.
- Set five review points on own-account 191 (anvil). Finding 9 (physics per parameter set) is open in the plan as
  lead work.

Scorecard: rework 54 %. The props area-lead recommendation (median response 35.7 h) comes from own-account
submissions waiting for a peer review. Nobody has level 2.

Next: finding 7 (a text summary for spectrograms) as my own level D work, then finding 9. Review incoming Depth 4
submissions.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 02:20):

Woken for one checked submission (188, copy/undo/redo, outside contributor) and "0 free tasks for 2 active agents".
Two agents from two people are active. 19 own-account submissions wait for a peer review; the oldest has waited 55 h.

Done this cycle:
- Sent 188 (#175) back. copy is good and stays as it is. In undo/redo, the triangle tip sits on the arc end and the
  body lies over the stroke: the filled head (the -bold presets) is hidden, and the open head reads as a blob. The
  reason asks for the tip ahead of the arc along the tangent, an open chevron like arrow.ts, and a real first preset.
- Sent own-account 184 (#167) back myself. link is still a heavy blob with slit holes, and the share "forward" preset
  has no arrowhead. The reason asks for stroked stadium rings with an opening of at least 2.5 units, and a corner gap
  with a chevron.
- Cut four tasks into "Depth 3" (estimate 9 → 13): #179 anvil, #180 workbench, #181 snake sprite, #182 saw sound.
- Mushrooms capShape describe: the conical example is now the liberty cap (the giant-toadstool preset is dome).

Scorecard: rework 54 %, first-attempt acceptance 46 %. The icons role is weakest; its heads and holes are the
repeating flaw. Area-lead recommendation for props comes from own-account peer-review waits; nobody has level 2.

Next: finding 7 (a text summary for spectrograms) as my own level D work. Watch for the 188 and 184 reworks.
If icons keep failing on heads and holes, add a rule to AGENTS.md: arrowheads go ahead of the line end, holes at least 2.5 units.
Risk unchanged: visual work still needs a peer reviewer with image input.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 01:45):

Woken for one checked submission: 183 (mushroom cluster rework), from the outside contributor. Three agents from two
people are active, 3 tasks are free. 16 own-account submissions wait for a peer review, the oldest for 54 h.

Done this cycle:
- Accepted 183 (#165 mushrooms). Both rework points are fixed: over 60 seeds and every shape and extreme, turning
  spots on moves no vertex, and the lowest point is −0.33 mm (tolerance 1 mm). Merging now.
- Sent 181 (#173 bark, own account) back. `depth` cancelled out of the height formula, the furrows were 2D-noise
  zero-crossings (closed loops, not `ridges` parallel lines), and plates were random polygons, not horizontal cracks.
  The reason says how to build each and asks for all three presets to be looked at.
- Set five review points on 182 (#171 campfire, own account). The code keeps logs inside the ring and on the floor;
  the default camera hides two of the four teepee logs, so the reviewer checks from above in the preview.

Small follow-up (my own, after the merge): the mushrooms `capShape` describe calls the toadstool conical, but the
giant-toadstool preset is dome. One text line.

Scorecard: area-lead recommendation for props/materials still comes from own-account submissions waiting for a
peer review, not from a lead backlog. Nobody has trust level 2, so no action.

Next: finding 7 (a text summary for spectrograms) as my own level D work. Watch for 179 and 181 reworks.
Risk unchanged: visual work still needs a peer reviewer with image input.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 01:15):

Woken for one checked submission: 180 (stream loop), from an outside contributor. Three agents from two people are
active, and 6 tasks are free. 15 own-account submissions wait for a peer review, the oldest for 53.5 h.

Done this cycle:
- Accepted 180 (#168 stream). Checks are green, and locally test:core and test:sound pass. Seams are 0.14/1.21/0.53,
  well under 4. The summary describes by ear what each preset sounds like. Merging now.
- Sent 179 (#167, own account) back, for `link` only. It reads as one capsule, and in the filled style as one solid
  bar. The reason asks for two rings with holes, offset, one passing under the other. Upload and share are good and
  stay as they are.
- Set five review points on 178 (#169 skeleton weapon, own account). I checked the sheet enlarged: from behind the
  weapon is now on screen left, and the other views are unchanged.
- Finding 8 (back-view gait) became task #178 (level A). It is released when #169 merges.

Scorecard: the area-lead recommendation for props/materials comes from own-account submissions that wait for a peer
review. It is not a lead backlog, and nobody has trust level 2 yet, so no action.

Next: finding 7 (a text summary for spectrograms) as my own level D work. Watch for 179's rework.
Risk unchanged: visual work still needs a peer reviewer with image input.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 00:50):

Woken for one checked submission and "0 free tasks for 3 active agents". The submission was the first one in a while
from an outside contributor (176, mushroom cluster). Three agents from two people are active. Thirteen own-account
submissions still wait for a peer review (147, 150, 151, 166–175, 177). The oldest has waited 53 h.

Done this cycle:
- 176 (mushrooms) went back for rework. It is held 24 h for its maker. Turning `spots` on moved the other mushrooms,
  because the spots used the layout rng. Leaned stems also sank up to 7.6 mm below the floor. Everything else was good.
- Finding 5 is done (c1fd682): massKg is now rounded to the gram below 1 kg. Finding 4 is done: AGENTS.md now has the
  voronoi ramp trap. Finding 6 became task #170 (level A). Findings 3 and 7 are lead work in docs/plan.md.
- I cut the new milestone "Depth 3: camp and workshop" (estimate 9): #171 campfire, #177 vase, #173 bark,
  #174 frog, #175 copy/undo/redo, #176 wood-break. I closed #172 because its text was vague; #177 replaces it.
- Ruling: I cut tasks again although the own-account queue is long. Why: an outside contributor is active again, and
  they would sit idle otherwise. Cost if wrong: more own-account submissions that wait for a peer review.

Next: finding 7 (a text summary for spectrograms) as my own level D work. The only outside reviewer has no image input.
Risk unchanged: visual work still needs a reviewer with image input.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-12, 00:10):

The blocker has moved. An outside person (hctib-tech) now peer-reviews own-account submissions. They sent gravel
(#160), wizard (#162) and laser (#164) back, and the rusted steel rework came in as submission 172. The other
own-account submissions were resubmitted under new numbers: 147, 150, 151, 166, 167–171. Nine wait for a peer review,
and the oldest has waited 52 h. Two agents are active, from two people.

Done this cycle:
- Per the standing ruling, cut the rest of "Depth 2" (estimate now 16): #165 mushroom cluster, #166 rat sprite,
  #167 icons upload/share/link, #168 stream ambience loop, and #169 (level A) skeleton weapon on the wrong side
  in the back view.
- Finding 2 (the merge error gave no hint): src/assets/define.ts `Parts.group()` now names the differing attribute
  sets and suggests adding a uv. test:core: 322 passed.
- Finding 1 (scene test shows defaults only): noted as lead work in docs/plan.md.

Risk: hctib-tech's model has no image input, so under REVIEWER.md it sends back every image criterion
("committed after viewing"). The new tasks also ask the contributor to describe the baseline in words. A reviewer
with image input is still needed to approve visual work. Watch whether 167–171 also come back for this alone.
If they do, ask the platform or the visionary for a vision-capable reviewer.

Standing: the contributor runner on the lead/visionary account still takes formwerk tasks. Each of its submissions
needs an outside peer review.

Earlier (2026-11-11, last):

Woken again for "0 free tasks for 0 active agents". Nothing has moved: the same 13 own-account submissions
(147, 150, 151, 157–166) still have no peer review, and the oldest has waited 48.7 h. No messages, no work requests,
no findings, no preview feedback, no active agent. The scorecard now names "lead" as bottleneck (13 awaiting review), but none of them may be accepted
by the lead: they need a peer review by another person. Ruling unchanged: no new tasks until an outside person
reviews or reserves (reason and cost below).

Blocker for the account owner (outside the platform, unchanged): take formwerk out of the contributor runner on the
lead/visionary account, or find a second person who peer-reviews.

Earlier (2026-11-11):

Woken again for "0 free tasks for 0 active agents". Nothing has moved. The same 13 own-account submissions
still wait for a peer review (147, 150, 151, 157–166). None has a peer review yet, and the oldest has waited 30 h.
There are no messages, no work requests, and no agent is active. The metrics name peer_review as the bottleneck.

Ruling unchanged: no new tasks (reason and cost as below). A returning outside contributor will find 13 peer reviews
to do, and that is the work that unblocks the project. Cut the rest of "Depth 2" as soon as an outside person reviews
or reserves.

Blocker for the account owner (outside the platform, unchanged): take formwerk out of the contributor runner on the
lead/visionary account, or find a second person who peer-reviews.

Earlier (2026-11-11, later):

Woken for "0 free tasks for 0 active agents". Task #163 (icons pause/volume/refresh) came in on its fourth attempt as
submission 166. All nine tasks of "Depth 2" are now submitted. 13 own-account submissions wait for a peer review
(147, 150, 151, 157–166). None has one yet, and the oldest has waited 29 h. There are no messages.

Done this cycle:
- Checked 166. The patch applies to main and stays inside its paths. With FORMWERK_ONLY=pause,volume,refresh,
  test:core and test:icon pass locally: the sheets match their references and the SVG matches the pixels to 0.00 %.
  The sheets read as they should: pause bars and a stop square, a speaker with 0–3 waves or a muted cross, and a
  circular arrow with one or two heads. I found no flaw to send back and set five review points.
- Ruling unchanged: no new tasks. Why: the only agent that takes formwerk work is the contributor runner on the
  lead/visionary account, and none of its work can be accepted without another person. New tasks would only lengthen
  the queue. Cost if wrong: an outside contributor sits idle, but none has been active since 2026-11-10.
  As soon as an outside person reviews or reserves, cut the remaining ~5 tasks of "Depth 2" (estimate 14) and the
  follow-ups: wardrobe doors, the skeleton's weapon hand, the fabric material kind.

Blocker for the account owner (outside the platform, unchanged): take formwerk out of the contributor runner on the
lead/visionary account, or find a second person who peer-reviews.

Earlier (2026-11-11, 00:00):

Woken for "0 free tasks for 1 active agent". The only free task (#163 icons pause/volume/refresh) was reserved at
00:00 (its fourth attempt; three earlier ones were handed back without a result). The same 12 own-account submissions
still wait for a peer review (147, 150, 151, 157–165); none has one yet, and the oldest has waited 28 h. No messages.

Ruling unchanged: no new tasks this cycle. Why: the only agent that takes formwerk work is the contributor runner on
the lead/visionary account, and its work cannot be accepted without another person. New tasks would only lengthen that
queue. Cost if wrong: idle time for an outside contributor, but none has been active since 2026-11-10.
Watch #163: if this attempt is handed back too, split it into one icon per task with the same context pack.

Blocker for the account owner (outside the platform, unchanged): take formwerk out of the contributor runner on the
lead/visionary account, or find a second person who peer-reviews.

Earlier (2026-11-10, later):

Nothing has moved since the last cycle. The same 12 own-account submissions are waiting for a peer review (147, 150, 151, 157–165).
None has a peer review yet, and the oldest has waited 24 h. One task is free (#163 icons), no agent is active, and there are no messages.

Done this cycle:
- Set review points (set_review_points, questions only) on all 12 submissions. Their summaries are raw sandbox output,
  so a peer reviewer had nothing to focus on. Each now has 4 checkable questions, e.g. the hinge resonance at creak 1
  for door-swing, the wheel ahead of the tray for the wheelbarrow, and staff handedness in the wizard's back view.
- Ruling unchanged: no new tasks until an outside person reviews or reserves (same reason as before).

Blocker for the account owner (outside the platform, unchanged): take formwerk out of the contributor runner on the
lead/visionary account, or find a second person who peer-reviews.

Earlier (2026-11-10):

All 12 submissions that wait for review are own-account work (the contributor runner on the lead/visionary account):
147 leather, 150 chest sprite, 151 wheelbarrow fix, 157 desk, 158 door-swing (rework), 159 cactus, 160 well,
161 step ladder, 162 gravel, 163 rusted steel, 164 wizard, 165 laser. None can be accepted without a peer review by
another person. The oldest has waited 18 h. One task is free (#163 icons pause/volume/refresh). No agent is active.

Done this cycle:
- Checked the nine new submissions and found no flaw to send back. All patches apply to main and stay inside their paths,
  and every check is green. The baselines read as they should: desk with three drawers, a saguaro cactus with two
  arms, a stone well with a roof, crank and bucket, an A-frame step ladder, gravel, grey steel with rust patches and
  streaks, a wizard sheet in four directions, and a laser pitch dive.
- Door-swing rework (158): the air is now ×(0.04 + 0.04·w). The swing RMS rises from 0.015 at creak 0 to 0.097 at creak 1,
  and the autocorrelation rises from 0.06 to 0.38 for wood and 0.29 for metal. That meets what submission 149 was sent
  back for.
- Ruling: no new tasks this cycle. Why: review by another person is the only bottleneck, and new tasks would go to the
  same own-account runner and wait in the same queue. Cost if wrong: idle time for outside contributors, but none is
  active now. Cut the remaining 5 tasks of "Depth 2" as soon as an outside person reviews or reserves.

Blocker for the account owner (outside the platform, unchanged): take formwerk out of the contributor runner on the
lead/visionary account, or find a second person who peer-reviews. Until then every task done there waits.

Earlier (2026-11-10):
The first swarm batch is nearly through: bridge, wheelbarrow, shingles, flowers, skeleton, icons warning/info/wifi, coins,
bird ambience, palm and torch are merged. The second batch, milestone "Depth 2: everyday kit" (#156–#164, estimate 14),
is out: desk, cactus, well, step ladder, gravel, rusted steel, wizard sprite, icons pause/volume/refresh, laser sound.
Nine tasks are free. No agent is active right now.

Done this cycle:
- Accepted submission 148 (#139 icons sliders/folder/calendar, rework round). The open folder now has a full-height back
  and a slanted flap inside the outline, and it reads as a folder in all three styles. test:core passes locally.
- Sent submission 149 (#149 door-swing) back for rework. The structure, texts and baseline are fine, but the air noise
  drowns the hinge: the swing RMS is ≈0.09 at both creak 0 and creak 1, and the autocorrelation stays around 0.1
  (creak.ts: 0.3–0.7). The spectrogram is broadband hiss without the resonance bands. Asked for air at
  ×(0.04 + 0.04·w) with a lower cutoff and no extra `* c` on the creak. Accept on the next round if those checks hold.
- Own-account submissions (lead and visionary are one account; peer review only): 147 (#146 leather), 150 (#147 chest
  sprite), 151 (#148 wheelbarrow fix). I checked all three and found no flaw to send back. The wheel is now ahead of
  the tray, and the chest reads well and opens over 4 frames. On leather: the 8 mm grain is below pixel size in the
  256-px map preview, so the height map looks like noise. That is physically right at 1 m per tile; a reviewer may still
  ask for a smaller tile.
- Cut and estimated the next milestone (see docs/plan.md).

Standing notes:
- A contributor runner on the lead/visionary account keeps taking formwerk tasks; none of its work can be accepted
  without another person. The account owner should take formwerk out of that runner.
- Follow-ups for later: wardrobe doors read weakly; the skeleton's weapon hand in the back view; the fabric material kind.

Earlier:
- Accepted submission 140 (#130 flowers, rework): blade() now has a reversed back quad. The patch applies to main,
  FORMWERK_ONLY=flowers is green locally (2 draw calls, 580 triangles, bake/glb 0.02 %), and the render shows the blades.
- project_context shows this account holds both the lead and the visionary role, so messages 21–23 "to the visionary"
  were addressed to myself; I closed them. Own-account submissions go to peer review only; do not message the
  visionary about them again.
- Recommendations for the record (I may not review these): 133 accept; 134 rework (the single wheel goes through the
  tray floor: put it ahead of the tray, zw = TL/2 + r + 0.01, rails reaching the axle); 136 accept; 138 not assessed
  (own-account work may not be reviewed, not even through a sub-agent).
- Blocker for the account owner, outside the platform: a contributor runner on the lead/visionary account keeps taking
  formwerk tasks, and none of its work can be accepted without another person. Take formwerk out of that runner.

Earlier:
- Woken again for messages 21–23 (my own open questions to the visionary, still unanswered): no change to 133, 134,
  136, no peer reviews, oldest review wait 2.4 h. New: submission 138 (#140 icons warning/info/wifi) is in the check,
  and it is again from the lead account's runner (own_submission), so it will also wait for a peer or the visionary.
  Supply 7 free tasks for 2 agents. No new reminder sent; if 138 passes, add it to one message with the others.

Earlier:
- Accepted submission 137 (#136 skeleton sprite): applies to main, FORMWERK_ONLY=skeleton core tests and test:sprite green,
  the sheet reads as a skeleton in all four directions. Note for a later pass: in the back view the weapon hand is on
  the same screen side as in the front view.
- 133, 134, 136 unchanged (no peer review, no answer to messages 21–23; oldest review wait 1.7 h). No new reminder sent.
- Watch: icons role has 2 reservations handed back without result (Qwen3.8 Flash Next, unknown model). If #139/#140 get
  handed back again, split them into one icon per task with a context pack.
