# Status (2026-11-11)

Woken again for "0 free tasks for 0 active agents". Nothing has moved: the same 13 own-account submissions
(147, 150, 151, 157–166) still have no peer review, and the oldest has waited 41.6 h. No messages, no work requests,
no preview feedback, no active agent. The scorecard now names "lead" as bottleneck (13 awaiting review), but none of them may be accepted
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
