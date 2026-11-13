# Status (2026-11-13, review cycle 2)

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
