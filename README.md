# What Was the Reason?

A social reasoning game played in teams. The current theme is math, but math is the *material*, not the subject. Underneath, the game is about critical thinking.

## Why the math theme?

Many people avoid math out of feeling incapable, the “I am not good at math” feeling. I attribute this largely to how math is taught (e.g., right-or-wrong test) and who it excludes (e.g. women, communities of color, people with varied cognitive styles). This has costs: people cut off career paths out of a sense of inadequacy, lose the curiosity to keep learning, and don’t interrogate claims across politics, healthcare, science, and other disciplines when numbers are involved. The latter is deeply important in an era of misinformation. 

This game is built to do two things at once:

1. **Bond people.** For groups who are new to each other, or who never talk about this kind of thing, the game is an excuse to think out loud together. Social connection is the primary goal.  
2. **Dissolve fear.** By making reasoning collaborative, low-stakes where it counts, and genuinely fun, the game is meant to reverse the reflex that makes people avoid math and critical thinking.

The design choices below are not neutral. Each one is chosen because it serves one or both of those goals. The anti-fear intent is built into the structure.

## How to play

**Setup.** Two teams of roughly 3 to 4 players each (about 8 people total). One host/moderator who runs the board and judges answers against per-question criteria.

**The board.** A grid: four columns and six rows. Each **column** is a mode of reasoning (see Architecture). Each **row** is a difficulty level, worth more points as you go down. A tile is a single question, chosen by its column (what kind of thinking) and its row (how hard).

**Three acts.** The six rows are grouped into three bands of two rows each. A band must be cleared before the next one opens, so difficulty rises for the whole room together. Each act runs on a different mode:

- **Act 1 (rows 1 to 2):** solo answers, generous time, no penalty. A safe warm-up where being wrong costs nothing and everyone gets a rep.   
    
  Teams alternate. Team A answers; if wrong, team B is *offered* the question (any B member may take it). If B attempts and misses, or B declines, the answer is revealed, no points, question retired. Then B's turn.

- **Act 2 (rows 3 to 4):** team discussion opens. This is where the bonding lives, because thinking out loud together is what turns a solo test into a shared puzzle.

  Same as Act 1, plus: team B stays quiet (no discussing their answer) during A's deliberation; if the steal is offered and B takes it, B gets half of A's discussion time and may use what they overheard. Attempt-and-miss or decline →  answer is revealed, no points, question retired. Then B's turn.

- **Act 3 (rows 5 to 6):** the heat kicks in. Both teams reason at the same time during one fixed window, commit an answer with their reasoning, and reveal at once. The stronger answer takes the points, where "stronger" depends on the column. 

  When both teams answer well, they both earn the points. However, if one team shows the math and the other one doesn’t, the former takes the points. 

**Turns.** Picks for acts 1 and 2 alternate between teams. Within a team, the pick rotates between members.

**Calculators.** Players can use calculators to do math, but nothing else. 

**One voice per answer (Acts 2 and 3).** When a team answers together, the team deliberates freely during the discussion window, but a single spokesperson delivers the committed answer, and that closes deliberation for that question. The spokesperson rotates per turn (independent of who picks), so the spotlight spreads.

**Wrong answers.** A wrong answer passes the question to the other team. It does not subtract points. 

**The host.** Because a human judges answers against a defined range or rubric, questions do not need a single machine-checkable answer.

**Scoring.** A team either satisfies a question's criteria or it does not. A team wins when its reasoning holds, even without the underlying math (where possible), so the game stays welcoming to people who would rather reason than calculate. 

**Answers:** Answers are provided after each team is given a chance so that the main takeaway per question lands. 

## Architecture

The four columns are **reasoning moves**, expressed as verbs rather than topics. This is the core idea of the game and the thing that makes the theme swappable.

| Column | The move | The adversary |
| :---- | :---- | :---- |
| **Estimation** | Reason under incomplete information: decompose, approximate, bound.  | The unknown |
| **Logic / Paradox** | Reason against misleading intuition | Your own gut |
| **Strategy** | Reason about other reasoning agents | Another mind |
| **Data Literacy** | Interrogate a claim: what is hidden, misleading, unsupported | The claim |

## The reusable skeleton

The whole design is one sentence: **four reasoning modes, a difficulty ladder that escalates social intensity, and themes that swap the content underneath.**

The frame travels. Estimation, Logic, Data Literacy, and Strategy all exist in philosophy, science, and general trivia, not just math. A future theme keeps the four columns and the act structure, and only refills the questions. 

## Decisions

* **Content separated from machinery, as a data model**: Question content lives in human-edited Markdown, the single source of truth; the runtime JSON is a generated build artifact, never edited by hand; a build step is the transformation layer between them. Board settings (points and time per row, act structure) are a separate configuration file feeding the same pipeline, so re-theming the game or re-tuning its rules is a content edit, never a code change.  
* **Schema parsed by labels, not position**: The build reads question fields by their inline labels wherever they sit in a file, and fails loudly, naming the file and row, when a label breaks. The structure tolerates hand-editing without silently dropping content, which is what makes a human-maintained source of truth trustworthy.  
* **Measurement by rubric: a binary gate, a human judge, and a deterministic tiebreaker**: A team either clears a question's stated criteria or it does not; a host judges against the per-question rubric, which is what lets reasoning-first questions be scored at all; no partial credit; Act 3 ties break on shown math, rewarding the calculation without requiring it. One committed answer per team, from a rotating spokesperson, keeps the unit of scoring unambiguous. The binary rule was re-derived once when partial-credit language quietly drifted back into the scoring text.  
* **Real-world claims verified before shipping**: Every factual takeaway was checked before entering the game, and one confident, well-shaped claim was caught being backwards and cut. Charged data is held at the calibrated line, "the claim is unsupported," never "the opposite is proven," because a game about interrogating claims cannot afford to commit the errors it teaches against.  
* **Data Literacy as applied statistics**: The column runs base-rate neglect, Simpson's paradox, correlation versus causation, and the multiple-comparisons problem on correct numbers with honest conclusions, so the statistics are right rather than merely illustrative. The corrected charts on answer sides are rendered from the same data as the deceptive ones; only the presentation changes, which is the lesson.  
* **Anti-fear as the test every mechanic must pass**: The buzzer was cut because racing to answer rewards fast mental arithmetic, exactly the player the game refuses to privilege; wrong answers cost a turn, not points, so being wrong is never punished in front of the room; the columns are curated so the adversary points away from the player wherever possible; board squares show only a point value, so a fearful player cannot pre-judge a question and steer away; and a team's answer belongs to the team, not the spokesperson who voices it. Every one of these traces to the same user emotional state, math anxiety, rather than to aesthetics or convention.  
* **Designed for the real viewing context**: One shared screen, host and players together, legible from across a room on a TV. The muted palette, large tile labels, and player-clean cards (host material stays on the host's phone or a printout) follow from how the game is actually played, not from how it looks in a mockup. An optional dark mode darkens the board for dim rooms or bright screens; question cards stay light in either theme so charts and tables remain legible.

The way the game unfolds lives, nonetheless, is based on how it's hosted. The host needs to frame it as "your brain is supposed to get this wrong, that's the point," so that reveals land as "we all fell for it" rather than "you got it wrong."

## Host console (optional second screen)

The board on the TV stays player-clean: cards never show hints, host notes, or takeaways. Those live on `host.html`, a phone-sized companion page for the host. It is optional; the game is fully playable from the TV alone, with the host reading notes from a printout or the content files instead.

With sync enabled, the host pairs the phone by tapping "Host console" in the TV footer and scanning the QR code (or typing the 4-letter room code). The phone then becomes two things at once:

- **A context-aware notes screen.** Whatever question is open on the TV, the phone shows that question's hints, host note, answer, scoring gate, expected reasoning paths, and takeaway.
- **A remote control.** Open and close cards, flip to the answer, select winners, and run the timer, all without walking to the TV.

The TV remains authoritative. If the connection hiccups, the game plays on unaffected and the phone falls back to browse mode, a hand-navigated notes reader that also works with no sync configured at all.

Sync runs through a small Firebase Realtime Database project. Setup steps and the database rules live in `js/firebase-config.js`; the game detects the config and enables pairing automatically.

## Status

- **Theme:** Math (v1).  
- **Players:** Two teams of roughly 3 to 4 (about 8 total).  
- **Architecture:** Settled (columns, rows, acts, turn structure, host role, the Act 3 reveal mechanic, and the one-spokesperson-per-answer rule).  
- **Content:** All four columns complete (24 questions), with host notes. Estimation in `content/estimation.md`; Strategy in `content/strategy.md`; Logic / Paradox in `content/logic-paradox.md`; Data Literacy in `content/data-literacy.md`. The web build is complete; the next phase is playtesting.  
- **Host console:** Built and verified end to end. An optional second screen (`host.html`) gives the host context-aware notes and remote control of the board over Firebase sync, with a no-connection browse mode as fallback. Deployment (GitHub Pages) is the remaining step.  
- **Deferred to a later version:** solo-answer wager (a scoring multiplier for going alone), formal partial-credit scoring, and a confidence-wager finale (teams secretly bet points on their own accuracy for Row 6). All three were kept out of v1 to keep the rules teachable in about two minutes. See CLAUDE.md for the full v1 scope, open levers (like the points curve), and parked question ideas.

