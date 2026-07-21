# CLAUDE.md

Operational context for AI-assisted work on this repo (via Claude.ai or Claude Code). Read README.md first for what the game is and why. This file records the invariants to preserve, the v1 scope, and the build principles, so iterations stay consistent with the design.

## Invariants

These were settled deliberately over a long design process. Changing any of them changes the game, so flag it explicitly rather than drifting.

1. **Columns are reasoning moves.** The four are Estimation, Logic / Paradox, Data Literacy, Strategy. A column is a way of thinking, not a subject area. This is what makes the theme swappable.   
     
2. **Each row within a column is a distinct reasoning move.** Not the same move at a larger scale. A ladder holds when every rung is a new motion and sags when two rows repeat a move at different volume. When authoring or reviewing questions, check each row against this rule.

3. **The four seams.** Each column is a distinct reasoning move, and questions must stay on the correct side of the boundaries between them or the columns merge: Logic is you versus your own intuition, Strategy is you versus another agent's, Estimation bounds an unknown with no single answer, and Data Literacy interrogates a claim. See the seam table in the general authoring guidance for the tell that sorts each pair.  
     
4. **Moving down the board increases both social intensity and difficulty.** The three acts move from solo/safe (Act 1\) to team/collaborative (Act 2\) to simultaneous-reveal head-to-head (Act 3). Do not flatten this into "same format, harder questions."  
     
5. **Math is material, not subject.** No pure-math column, by design. Questions use math to serve a reasoning move; they are not math-for-its-own-sake.  
     
6. **Anti-fear is load-bearing.** Every mechanic should be checked against the primary goals (social bonding, dissolving the fear of being wrong). If a proposed change adds a competitive edge at the cost of making someone feel exposed, it works against the mission.  
     
7. **Scoring is binary on the gate, and math breaks ties (mostly).** A team either satisfies a question's criteria (the "gate") or it does not. Wherever possible, a team wins when the *reasoning* holds, even without the underlying computation. In Act 3, when both teams clear the gate, the team that *shows the math* beats the team that reasons only qualitatively. This incentivizes doing the math without punishing teams who cannot or will not. Some questions genuinely require the math to answer at all; there the math is part of the gate, not the tie-breaker.

## v1 scope

**Established Rules:**

- Two teams of roughly 3 to 4 players (about 8 total); scalable.  
- 4 columns x 6 rows, grouped into 3 acts of 2 rows.  
- Act-based mode escalation: Act 1 solo, Act 2 team discussion, Act 3 simultaneous reveal.  
- Clear-a-band-to-slide-down progression (full clear, not threshold).  
- Picks alternate between teams; rotate between members within a team.  
- Picker decoupled from answerer.  
- One spokesperson per team delivers a committed answer in Acts 2 and 3 (rotates per turn, independent of the picker). The team deliberates freely during the window; the spokesperson voices the final answer, which closes deliberation and is what gets scored. A wrong answer belongs to the team, not the speaker.  
- Wrong answer is offered to the other team as an optional steal (Acts 1-2) or resolved by simultaneous reveal (Act 3); no point subtraction. See the mechanics detail below.  
- Human host judges answers against a per-question range or rubric.  
- Points curve. Question difficulty is not linear but points are for v1 because it’s easier to explain; revisit after playtesting.

**Turn-and-pass mechanic**: 

- **Reveal-on-failure is universal.** In every act, a question that no team answers correctly is revealed by the host, then retired. This is not just tidy, it is required by the clear-the-band progression and it preserves the mission: even a question nobody gets still delivers its learning.

*Act 1 & 2*

- **Turns alternate**. The picking team answers first.  
- **A wrong answer is offered to the other team (an optional steal).** If the picking team misses, the other team may attempt that question or decline. The steal is a bonus attempt appended to the picking team's turn.  
- **A passed question always resolves in that same beat.** The other team either answers it correctly (they score) or misses/declines, in which case the host reveals the answer and the question is retired with no points to anyone.

*Act 2 only*

- **The non-picking team stays quiet during the picking team's deliberation**. No discussing their own answer aloud, though the host can be lenient about a table of excited people. If the steal is then offered and taken, the stealing team gets half of the picking team's discussion time and may use what they overheard. This deliberately rewards active listening to another team's reasoning, which is on-mission.

*Act 3*  
Both teams reason during one shared fixed window, privately commit an answer *with reasoning*, and reveal at once. Rulings the host applies:

- *Reasoning gates the win.* A team must have a defensible chain to be eligible. The tiebreaker among sound-reasoning teams depends on the column.  
- *Both equally sound*: Both teams take full points. Do not force a false separation when both reasoned well.  
- *Both wrong, or neither has a chain*: Nobody scores.  
- *Simultaneous commit protects shared-room questions.* Because both teams lock their answer before either is spoken, one team explaining first does not leak to the other. This is what lets a question be reasoned about openly in a shared room without the first speaker giving it away.

**Deferred (do not build into v1):**  
The reason all 3 of the elements below were cut: the ruleset must stay explainable in about two minutes. A game that *sounds* complicated re-triggers the exact intimidation the game exists to dissolve. Guard this. Before adding any mechanic, ask whether it survives the two-minute-explanation test.

- **Solo-answer wager:** letting a team choose to answer solo for a point multiplier instead of as a team for base points. Cut because it is a whole scoring sub-system, and the act structure already delivers solo moments. Second-session richness.  
- **Formal partial-credit scoring:** cut because it is a mid-game judgment call that slows momentum and invites disputes. The host still naturally rewards good reasoning through where the acceptance bar is set; it just is not a number on the board.  
- **Confidence-wager finale:** on Row 6, each team secretly bets some of its points on landing in the right range, then reveals. Thematically strong (calibrated confidence *is* the estimation skill) and a natural climax, but it is another rule. Considered and deliberately deferred when the Act 3 reveal mechanic was chosen; a candidate for a v2 finale flourish, layered onto Row 6 only.

## Build Principles

**Keep the game's content separate from the game's machinery***.* The machinery is generic: it knows how to run any board (show a question, run the timer, take answers, award points, advance to the next act). It should not have any specific question, point value, or rule written into it. All of those live as separate, editable data that the machinery reads.

**Concretely**: each **row** carries its own settings as data. Each **question** carries its own content as data. A question inherits its row's settings by default but can override any of them when it needs special handling. The **column** is only a label naming the reasoning move; no rules hang off it.

**Why this matters**: because the rules and content are data sitting outside the machinery, "re-theme the game" and "adjust the rules" become the same easy edit. That is the whole point of the reusable skeleton: the machinery is the skeleton, and you can swap in entirely different questions (or rule tweaks) without rebuilding it. Keep content and logic separated.

**Board-level attributes:**

* **Tone** (fun / neutral / serious)  
* **Column** (the reasoning move: Estimation / Logic-Paradox / Strategy / Data Literacy)  
* **Row / act** (position and the act it belongs to)

**Row-level defaults (inherited by every question in that row, per the data-driven design):**

* **Points** (100 / 200 / 300 / 400 / 500 / 600 by row)  
* **Time** (generous in Act 1, tighter descending)  
* **Mode** (solo → team discussion → simultaneous reveal, by act)  
* **Wrong-answer behavior** (optional steal in Acts 1–2; simultaneous reveal \+ both-wrong-retires in Act 3; reveal-on-failure universal)

**Per-question fields (the content schema):**

1. **The question** — the prompt as read to players. *(universal)*  
2. **Why it's this level** — the design rationale: what reasoning move this row demands and why it's harder than the one above. Author/host-facing, not read aloud. *(universal)*  
3. **The answer** — the correct answer plus the reasoning that reaches it. *(universal)*  
4. **What earns the points** — the scoring gate, stated as binary (clears it or doesn't), plus the tie-breaker where it applies (shown math wins; for Estimation, closest / right order-of-magnitude bin). *(universal)*  
5. **Hints** — the escalating nudges a host offers if a team stalls, usually two. *(universal)*  
6. **How they might get there** — the expected reasoning path(s) to the answer, for the host to recognize and guide toward. *(universal)*  
7. **Takeaway** — a fact or consequence delivered after scoring, where one does real teaching work. Many questions have none. *(conditional)*  
8. **Host note** — situational guidance: an honest-line caution (stop-and-frisk), a teaching-moment prompt (Jerusalem), a "if someone challenges X" rebuttal (Condorcet's Voter 3), a framing note (guess-⅔ is hypothetical, not run live). *(conditional)*  
9. **Build note** — production/rendering instructions, chiefly for visual questions (render both the deceptive and corrected chart; this question needs a display). *(conditional)*  
10. **Authoring / reskin note** — what structure must survive if the question is re-themed (the fragile skeletons: bat-and-ball's round-number-in-off-total, Simpson's lopsided groups, Condorcet's exact rotation). Author-facing, tied to the reskin rule in CLAUDE.md. *(conditional)*  
11. **Other notes:** Any additional notes.

## Web Build

**Mapping:** 

- **Column file directory.** Authored question content lives in `content/` (one file per column, e.g. `content/estimation.md`). This is the human-readable source of truth; Each column's squares are populated from its own file in `content/`:  
  - estimation.md → Estimation  
  - logic-paradox.md → Logic / Paradox  
  - strategy.md → Strategy  
  - data-literacy.md → Data Literacy  
  - board.md → board settings, not a column: per-row points and time, act labels and modes, and the column list (positions, subheaders, file mapping). Questions inherit their row's settings from here. The time values are placeholders to tune in playtesting.  
- **Column file organization.** Within each file, the six questions map to rows 1–6 in order. The content schema is organized into the following sections for human readability:  
1. Board Content  
2. Scoring  
3. Host Notes  
4. Documentation  
     
   The schema is the flat field list in the “Per-question fields**”** above, and the build parses fields by their bold inline labels regardless of which table cell they sit in.

**Visual Design**: 

- The visual design should be clean but still warm to dissolve math anxiety, never like a quiz or exam.   
- The visual plan should be described before building.  
- Use the frontend-design guidance to show design direction before implementing.

**Rendering visual questions.** Some questions need charts or tables built to the exact values in their **Build note** — treat it as spec. The distortion in a chart (a truncated axis, a wild variance) is the point; build it misleading as specified, don't "fix" it to look normal. Distortion questions show the deceptive chart on the question side and the corrected one on the answer side. Tables render as tables, structure preserved.

**Landing Page:** 2 centered text input boxes labeled “Team \#1 Name” and “Team \#2 Name”. A button under these fields labeled “Start Game”. When clicked the page transitions smoothly into the view of the full board.

**The Board**: 

- **Point Status**:  
- *Upper left corner*: Team 1’s name \+ a horizontal progress bar (of reddish color) that grows as the team accrues points. The point sum should be printed next to the bar.  
- *Upper right corner*: Team 2’s name \+ a horizontal progress bar (of blueish color) that grows as the team accrues points. The point sum should be printed next to the bar.  
- *Visual design:* The point bars should have a size that can visibly show growth without it being too prominent on the board view.  
- **Column order** (from left to right): (1) Estimation, (2) Logic / Paradox, (3) Strategy, (4) Data Literacy.   
- **Board Squares**: Round edges; Labeled by the points the question is worth, large and centered font. All squares should start with a \#d9d9d9 color and a medium-gray point label (clearly readable against the gray square, but softer than black so locked rows do not draw the eye). When a row activates, its squares' point labels switch to the board background (cream) color, a knockout effect against the column color. Retired squares return to \#d9d9d9 at full opacity (no faded state) with the label removed, so a locked square (gray, medium-gray label) and a retired square (gray, no label) stay visually distinct. Squares start off as unclickable; retired squares remain clickable so their card can be re-opened to adjust winners. 

**Board State**:

- **Initializing the Board**: When first arriving at the board from the landing page, all squares are labeled and with the same color, but after a 3 second delay, the squares on the first 2 rows do a fade transition into color (see color by columns below) to signal that the first band is active. It is at this point that the squares on the first 2 rows become clickable.  
- **Retiring Questions**: When a card’s “Answer” button is clicked (see details below), the game should register that the square corresponding to the card should return to a \#d9d9d9 color and its point label removed. The transition is executed as a fade animation and 1 second after the card is closed only, from the full board view, to signal to players that the question is retired.  
- **Advancing Bands**: When the last question in a band is retired, the next 2 rows transition to color, similar to how the first 2 rows behaved upon landing on the page except the transition delay is 1 second after returning to a full view of the board. It is at this point that the squares on the next 2 rows become clickable.  
- **Locked-Band Override**: There should be a toggle from the board view page that allows a user to unlock all bands simultaneously. This is an optional play mode that suspends the band system. Default is off. If toggled off and then back on, the earliest band that doesn’t have all questions answered becomes active and any higher level bands are locked.  
- **Tracking Points**:   
  - *Registering Points*: When a winner(s) is selected from a question card (see details below), the point bar(s) grows in proportion to the points gained. This should be a glide animation to signal point growth. Both text and bar updates should trigger 1.5 seconds after the card is closed. Whichever winner is selected before the card is closed is what the system registers.   
  - *Adjusting Points*: If the card is re-opened after its been closed and the winners are adjusted, the points should add/subtract accordingly, with a glide animation happening in the correct direction. As before, the updates happen after a 1.5 second delay after the card is closed.   
- **Game End**: When the last question on the last band is retired, after a 3 second delay, the board disappears and a screen prominently announces the winner. A summary of points should also be included, with the team name and number of points gained per team. 

**Row Elements**: 

- **Band Grouping**: Rows should be grouped by band by adding a label and some spacing between each pair of rows belonging to the same band. Labels should be:  
  - Act 1 · Solo Players  
  - Act 2 · Team Discussion | Alternate  
  - Act 3 · Team Discussion | Simultaneous  
- **Row Labeling:** Rows should be labeled on the left of the board. Format: “R\#”, where “\#” is the row number. A subheader should indicate row points “\#\#\# pts”, where “\#\#\#” is the amount of points each question on that row is worth. 

**Columns Elements**

1. **Estimation**: Label: “Estimation”**;** Subheader: “reason under uncertainty”; Color of squares: \#c8a96e  
2. **Logic / Paradox**: Label: “Logic / Paradox”; Subheader: “reason vs your own gut”; Color of squares: \#9999dd  
3. **Strategy**: Label: “Strategy”**;** Subheader: “reason about other minds”; Color of squares: \#6b9e78  
4. **Data Literacy:** Label: “Data Literacy”; Subheader: “interrogate a claim”; Color of squares: \#b87070

**Board Squares:** When tapped/clicked, it expands into a centered card and the board disappears.The question language then appears. 

- **Closing a Square**: In the upper left: an “x” to return to collapse the square and return to the board.   
- **Awarding Points:** In the lower left: An section with a “Winner” header and options to select team A and/or team B. The selection is three-way: one team (that team scores), both teams (both score the points), or neither. If neither is selected and the answer was revealed, the question still retires on close with no points awarded.  
- **Revealing the Answer:** In the lower right: An “Answer” button that does a flip animation to flip the card and reveal the answer.  
- **Timer:** Each card shows a countdown chip seeded from its row's time in board.md. It is host-run: the host starts, pauses, and resets it. At zero it signals visually but never locks answers or advances anything; the host rules.  
- **Card contents:** Cards are player-clean. The front face shows the question (plus its visual) and the back face shows the answer (plus the corrected visual where one exists). Takeaways and everything in the Host Notes section (hints, host notes) are not rendered; the host reads them from another screen, like a phone or a printout of the content files. A v2 may add a discreet host drawer to the card UI. 

**Additional Build Notes:** 

- HTML, CSS, and JavaScript should all be cleanly separated.  
- The question source of truth stays in human-readable Markdown that I edit directly; generate the runtime data structure from it in the build — I should never have to edit JSON or YAML by hand.  
- The local folder is the source of truth; push it *to* an empty GitHub repo (don't initialize the repo with files on GitHub's side, to avoid a first-push conflict). Claude Code can handle the Git setup and add a .gitignore so build artifacts stay out.  
- Repo: [https://github.com/EgyptAmaru/what-was-the-reason.git](https://github.com/EgyptAmaru/what-was-the-reason.git)  
- Include in .gitignore: PROCESS.md (exact case; .gitignore matching is case-sensitive on case-sensitive filesystems).  
- **Presentation layer coupling (js/format.js and js/charts.js).** Question content lives in Markdown, but per-question presentation lives in JavaScript keyed to question IDs. js/charts.js holds the chart and table specs from the Build notes, plus strip patterns that remove flattened table text from question prose. js/format.js holds paragraph and bullet formatting matched to exact phrases in specific questions (for example "Reasoned backward:" or "The Castro manager"). Rewording or re-theming a question breaks these rules silently: format rules fall back to plain single-block rendering with no error, and a changed question in Logic R5 or R6 would leave the flattened table text visible on the card. This partly breaks the re-theme-by-editing-Markdown-only principle; a re-theme must also review charts.js and format.js.

## Authoring Guidance

| Row · Act · Pts | Estimation | Strategy | Logic / Paradox | Data Literacy |
| ----- | ----- | ----- | ----- | ----- |
| **R1** · Act 1 · 100 | Scale a number you already know (one step from a known quantity) | Read one person's incentive (one direction) | Obvious answer is wrong; fix is slowing down one beat | Display visibly contradicts the data (read the chart, not the words) |
| **R2** · Act 1 · 200 | Fill a space (decompose a volume/area by parts) | Weigh two incentives that align or clash (static) | Answer feels complete but skips a case; fix is enumeration | Two true numbers compared unfairly (the correcting number is shown) |
| **R3** · Act 2 · 300 | Estimate a share, then build on it | Anticipate one reaction to your move (one layer of recursion) | Gut mis-estimates a **magnitude** (a count or probability) | A needed number is **withheld** — notice it's missing |
| **R4** · Act 2 · 400 | Split a total across what one unit handles (division, two chains) | Find the stable point where neither side wants to deviate | Gut refuses to believe a reveal **updates** the odds | A needed baseline is **absent** from a chart — notice it |
| **R5** · Act 3 · 500 | Land in the right ballpark on a wide unknown (order of magnitude) | Reason backward across rounds (or signal under hidden info) | Parts contradict the whole; gut is certain that's **impossible** | Data is real and fair, but the **causal conclusion doesn't follow** |
| **R6** · Act 3 · 600 | A clean calculation whose answer defies your gut *(finale)* | Sound reasoning by many agents drives everyone somewhere worse or absurd *(finale)* | A **law of reasoning itself** breaks — transitivity, collective preference *(finale)* | Every fact is true; the finding is an **artifact of the search** *(finale)* |

**The 4 Seams**

| Seam | Column A | Column B | The test that tells them apart |
| ----- | ----- | ----- | ----- |
| **Logic ↔ Strategy** | Logic: you vs. your own intuition | Strategy: you vs. another agent's intuition | The coin test: replace the other party with a coin or a fixed rule. If the puzzle collapses (its point was anticipating a *reasoning* agent), it's Strategy. If it survives unchanged, it's Logic. Self-reference is a Logic trap, not Strategy. |
| **Estimation ↔ Logic** | Estimation: bound an unknown; no single right answer | Logic: one provably correct answer your gut rejects | Is the answer a defensible range (Estimation) or a single truth (Logic)? If a wide-but-reasonable answer is acceptable, it's Estimation. |
| **Data Literacy ↔ Logic** | Data Literacy: interrogate someone's *claim* | Logic: reason to a surprising truth, no claimant | Is there a claimant asserting a conclusion? If yes, and the answer is a *diagnosis* ("this hides X," "this doesn't follow"), it's Data Literacy. Logic answers are *facts*; Data Literacy answers are *diagnoses*. |
| **Strategy ↔ (optimization)** | Strategy: a chooser whose choice depends on someone's incentive | Optimization: computing against a *fixed* situation, nobody reacting | Same coin test, active form: if it's solvable against a static board/timeline/total with no one responding, it's optimization (belongs nearer Estimation or Logic), not Strategy. |

**Run the trap.** Before locking any question, actually run it as a player and confirm the trap catches them. An early Row 2 draft put the clock change exactly at the *end* of the shift, so it caught nobody and the answer was simply the naive one. 

**A spec that yields exactly one candidate is a broken spec***.* When only one question shape fits a row, and it is adjacent to the row above, suspect the criteria rather than hunting harder.

**Watch for criteria that fight each other.** The Logic’s row 6 spec asked for a paradox that "stays startling after you understand it" **and** a "single provable answer." Proofs exist to dissolve surprise, so those pull against each other. The fix was to reframe the finale as *the column's move at its deepest*, where what breaks is a belief about how reasoning works rather than a belief about a number.

**Recall is poison, everywhere.** A question must hand over facts (the size and direction of a clock change, a base rate, a water density) rather than require players to know them. Recall is not reasoning. What counts as "known" varies by person, so do not assume your own anchors are universal.

**The reskin rule.** Famous problems have a *skeleton* that must survive reskinning, and it breaks silently. Example: Bat-and-ball needs a round "more than" number inside a total *just above* it, so the naive subtraction is tempting and the true answer is a surprising half of a small leftover. 

**The math ramp is per-column.** Not every column is uniformly mathematical. Strategy's math is *light at the top and heavy at the bottom*, because shallow strategic reasoning needs little arithmetic while deep strategic reasoning is inherently numerical. This is fine and even natural. The rule is only that every row has numbers doing *load-bearing* work (strip-test: remove the numbers, does it die?), not that every row be equally heavy. Expect to apply this to Data Literacy too; do not force uniform math weight onto a column whose difficulty is carried by something else.

**Verify every factual claim in a takeaway before it ships.** Takeaways are where real-world claims enter the game, and an unverified one is exactly the failure the game teaches against. 

## Authoring Guidance | Estimation column

**The core rule.** A question must have a *chain*: the two or three things a player combines (multiply, divide) to reach the answer. Difficulty climbs by how much of that chain the player must build unaided. If you cannot name the things being combined, it is not a reasoning question, it is recall.

**Traps** (each fails for a nameable reason):

1. *Recall trap.* No chain, just a known fact to remember. Fails at any difficulty.  
2. *Fiction trap.* No real quantity underneath, so no chain to reason toward.  
3. *Un-chainable-real trap.* Real, but no reason-toward-able path, so it collapses to trivia.

**The pre-supply rule, stated carefully.** You may hand the team the one input nobody can reason toward, *only* when doing so leaves the actual reasoning move intact. Test before gifting: after handing it over, is there still a chain left to build?

**One-sentence version.** A good reasoning question needs a real answer reached by a chain of reason-toward-able steps, and difficulty climbs by how much of that chain the player must build unaided.

## Authoring Guidance | Strategy column

**Format is a difficulty *texture*, not a difficulty *level*.** Closed-ended formats (binary true/false, multiple choice) lower the burden of *producing* an answer without changing the *reasoning depth* required. Useful as an Act 1 softener when a quantitative early row would otherwise start too hard. Two cautions: (1) it cannot replace a difficulty rung, only soften the landing of one; (2) with a closed format the "explain why" requirement becomes non-negotiable, or a player can be right by luck with no reasoning, which defeats the mission. Use it only when the open version is genuinely too hard; drop it when the question already sits at the right ease.

**The self-reference / meta trap.** A question that is *about its own situation* ("you win this game, so now, in this game...") creates a logical loop and is usually unsolvable, because the thing being valued is the valuation itself. Repeatedly, attempts to make Strategy questions about *this game* failed for this reason. 

**The optimization-vs-strategy line (the coin test).** Strategy requires a *chooser whose choice depends on someone's incentive*. If a question can be solved by computing against a *fixed* situation (a timeline, a total, a static board) with nobody reacting, it is optimization. 

## Authoring Guidance | Logic / Paradox column

**Rejected for this column, and why:** self-reference and infinite regress (no provable answer, no math, and it produces *confusion* rather than a seductive wrong answer, so it is philosophy rather than a trap); the Nim-style coin game (it dissolves completely once you learn the pattern, so it fails the finale test and has no home in rows 1-5).

## Authoring Guidance | Data Literacy column

**Every question needs a claimant.** The column's move is interrogating an *assertion*, and the answer is a *diagnosis* of that assertion, not a bare fact. Without someone asserting a conclusion, the question drifts into Logic.

**The presence-vs-absence difficulty dial.** The same trap sits at different difficulties depending on whether the correcting number is *shown* or *withheld*. A misleading comparison with the denominator printed is Act 1 (spot it); the same comparison with the denominator missing is Act 2 (notice it is gone).

**The three-tier arc for this column:** presentation lies (Act 1, the display or wording deceives, everything is on the page) → something is absent (Act 2, a needed number or baseline is missing) → the inference or origin is corrupt (Act 3, the data is real and fair but the conclusion does not follow, or the finding is an artifact of how it was produced).

**Visual questions need real charts, and answer sides should show the corrected chart.** A truncated-axis question cannot be narrated; the chart *is* the question. Render both the deceptive version (front) and the honest version (answer side). Seeing the corrected chart is more convincing than any description. 

**The finale structure: make every fact true.** The p-hacking finale works because nothing in it is false, so the player cannot win by fact-checking, only by interrogating the *process* by which the finding was produced. That is the deepest move in the column and the right capstone: the whole column trained "find the flaw," and the finale removes the flaw from the visible facts.

**On charged subjects.** The most on-mission examples are real and politically weighted (stop-and-frisk, health scares), because that is where misinformation actually operates. Keep the claimant's version strong rather than a strawman, make the reasoning the scoring gate, hold the honest line ("the claim is unsupported," never "the opposite is proven"), and lean on transferability (the same error drives bad diet and advertising claims) to keep a mixed room focused on reasoning rather than politics.

## Parked question ideas (good, but not for their original slot)

- **Buy-a-turn / meta-game** (offer the other team points to skip their turn): a decent *Row 3* idea (anticipate one reaction) *if* the value of a turn is made concrete, and if it is framed to avoid self-reference. Not a Row 5, and not about *this* game's live state.  
- **Nim-style coin game** (take 1 to 3 from a pile, last coin wins): parked out of Strategy because its "forced-win pattern" is structural rather than incentive-driven, then pressure-tested against Logic and rejected there too (it dissolves completely once you learn to leave a multiple of four, so it is a pattern to discover, not a paradox). No home in the math theme; hold for a future theme.  
- **Kidney stone study** (Charig et al., 1986): an alternate Simpson's paradox case, if the Berkeley one is ever needed elsewhere. Treatment A beats B on small stones and on large stones, but B wins overall.  
- **Dollar-auction and escalation trap** (sunk-cost spirals where rational bidding overshoots the prize): strong *paradox* material. The guess-2/3 game took the Strategy Row 6 slot, so these are held as alternate finale / paradox questions.

## Conventions

- Prose in documentation and any player-facing copy: no em dashes.  
- Content status lives in README.md. Update it there when columns are authored.

