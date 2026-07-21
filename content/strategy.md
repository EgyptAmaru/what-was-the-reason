# Strategy column

**What this column is.** Strategy is reasoning about *other minds who are also reasoning about you*. The answer to a good Strategy question depends on what someone else will do, and that someone else is trying to figure out what you will do. 

*Note: Field schema, authoring rules, seam tests, and the difficulty ladder are in CLAUDE.md; player-experience and scoring notes are in README.*

---

## Row 1: Reading one person's incentive

| Board Content | The question: You want to go to an Ariana Grande concert in hopes of sitting next to your situationship, who is excited to go but will purchase mid-tier tickets because money is tight. If prices range from $100,000 to $1,000,000, what ticket price are you aiming for? The answer: Around the middle of the range, roughly $500,000 to $550,000. The reasoning: they will buy a mid-tier seat, so to sit next to them you aim for the same mid-tier price zone. The exact number matters less than landing in the middle for the right reason. |
| :---- | :---- |
| **Scoring** | **What earns the points:** Aiming for the mid-range and explaining why (that is where the situationship will be, given their money constraint). Any figure in the mid-tier zone with sound reasoning is full credit. **How they might get there**: Their incentive (excited but money-tight) leads to a mid-tier ticket; to sit beside them, aim for the same mid-tier price; that is roughly the middle of the range. |
| **Host Notes** | **Hints**: "What kind of ticket will your situationship actually buy, given their situation?" "If they are sitting in the mid-tier seats, where do you need to be to sit next to them?" |
| **Documentation** | **Why it's this level**: The gentlest strategic move. Figure out what one person will do from a single, obvious incentive, and act on it. No mutual reasoning yet (they are not thinking about what you will do). The math is light but real: their constraint (mid-tier, money is tight) maps to a price zone you reason toward. |

---

## Row 2: Two incentives: align or clash

| Board Content | The question: Kevin the ranger pulls up to a barbershop where two vehicles are parked illegally: Lyon's black Camaro (a 4-seater) and a taco truck. Kevin gets a $15 bonus for every ticket he writes, plus an extra $5 for large vehicles. He only has time to ticket one before his shift ends. Is Lyon likely to get ticketed? The answer: No, Lyon probably will not get ticketed. Kevin earns $20 for the taco truck ($15 plus the $5 large-vehicle bonus) versus $15 for the Camaro, so his incentive points him at the truck. Lyon is spared because a bigger target pulled Kevin away. |
| :---- | :---- |
| **Scoring** | **What earns the points:** Reading that Kevin's bonus is higher for the truck ($20 versus $15) and connecting that to Lyon's outcome (Kevin picks the truck, so Lyon is safe). **How they might get there**: Total each payoff: taco truck \= $15 \+ $5 \= $20; Camaro \= $15. Kevin's incentive (maximize bonus) sends him to the truck, so Lyon's Camaro is left alone. |
| **Host Notes** | **Hints**: "How much does Kevin earn for ticketing each vehicle?" "Which one is worth more to him, and what does that mean for the other car?" |
| **Documentation** | **Why it's this level**: One step up from Row 1\. Instead of reading a single incentive, reason about how Kevin's incentive plays out across two options, and whether that works for or against Lyon. Still shallow (nobody is anticipating anyone's reaction), but now the answer depends on comparing two payoffs, which is a notch more math. |

---

## Row 3: Anticipating one reaction

| Board Content | The question: Elyas has a 50%-off Panda Express coupon expiring today. Sheyla, the cashier, can accept or reject it, and she'll reject it if serving the order means cooking a fresh batch (she doesn't like extra work).  There are exactly 3 scoops of orange chicken left in the tray and emptying the tray forces her to cook more. At regular price, each scoop is $5 (tax included). If Elyas has $10, how many scoops should he get? The answer: 2 scoops. Ordering 3 empties the tray, which forces Sheyla to cook more, so she rejects the coupon, and 3 scoops at full price ($15) is over his $10 budget. Ordering 2 leaves the tray non-empty, so Sheyla honors the coupon (2 scoops at $2.50 \= $5). Reaching for the 3rd scoop is exactly what removes the discount. |
| :---- | :---- |
| **Scoring** | **What earns the points:** Landing on 2 and explaining the reaction chain: that ordering 3 triggers Sheyla's rejection, which backfires. Recognizing that the naive "grab all 3" is a trap is the sign they did the strategic work. **How they might get there**: Test the greedy move first: 3 scoops empties the tray, so Sheyla cooks a batch and rejects the coupon, so 3 scoops cost $15, unaffordable. Then test 2: tray not emptied, coupon honored, $5, affordable. The trap is that the coupon makes scoops look cheap enough to grab all 3, but grabbing the last one is what kills the coupon. Restraint wins. |
| **Host Notes** | **Hints**: "What happens if Elyas tries to take all 3 scoops? How does Sheyla react?" "If she rejects the coupon, can he still afford 3? Work out both cases." |
| **Documentation** | **Why it's this level**: The first genuinely strategic rung. Elyas's best move depends on how Sheyla will react to his order, one layer of "if I do this, she'll do that." Reasoning through her reaction is the puzzle, which is why teams discuss it here. The math is a step up: compute across two price scenarios (coupon versus no coupon) and a supply limit. |

---

## Row 4: Finding the stable point

| Board Content | The question: Froy and Ernesto are thrown in jail and interrogated separately. Each is offered the same deal.  If you stay silent and so does the other, you each get 2 weeks. If you betray the other while they stay silent, you get just 1 week and they get 4\. If you both betray each other, you each get 3 weeks. They can't communicate. If they act out of self-interest, what will each do? The answer: Both betray, each getting 3 weeks. From either person's view, betraying beats staying silent no matter what the other does: if the other stays silent, betraying gets you 1 week instead of 2; if the other betrays, betraying gets you 3 instead of 4\.  |
| :---- | :---- |
| **Scoring** | **What earns the points:** Concluding both betray and showing why: that betraying is the better move for each person regardless of what the other picks. The reasoning (checking both cases) is the scoring gate. **How they might get there**: Reason from one person's side, checking both of the other's choices. For Froy: if Ernesto is silent, betray (1 versus 2 weeks); if Ernesto betrays, betray (3 versus 4). Betraying wins either way, and the same holds for Ernesto, so both betray and land at 3 weeks each. Stable because switching to silence alone only makes it worse. |
| **Host Notes** | **Hints**: "Put yourself in Froy's shoes. If Ernesto stays silent, what is Froy's best move? Now, if Ernesto betrays, what is Froy's best move?" "If the same logic applies to both of them, where do they end up?" **Takeaway**: They would both be better off staying silent, 2 weeks each, but acting in self-interest cannot get them there. This is the classic Prisoner's Dilemma. |
| **Documentation** | **Why it's this level**: Now both sides reason about each other at once, and the answer is where they settle: the pair of choices where neither would change his move given the other's. A step past Row 3's one-directional anticipation. The math carries the weight, since the specific sentences are what make betrayal the individually smart move. |

---

## Row 5: Backward reasoning across rounds

| Board Content | The question: Bianca and Adore are splitting a $100,000 prize. They alternate making offers over at most 3 rounds, and the money shrinks each round they don't agree, per Drag Race rules: Round 1: $100,000 on the table. Bianca proposes a split. Adore accepts (done) or rejects. Round 2: If rejected, only $60,000 is left. Adore proposes a split. Bianca accepts or rejects. Round 3: If rejected again, only $20,000 is left. Bianca proposes a final split. Adore accepts, or rejects, and if she rejects, they both get $0. Both want as much money as possible. What should Bianca offer in Round 1? The answer: Bianca offers Adore about $41,000 and keeps about $59,000, and Adore accepts immediately. Reasoned backward: Round 3 ($20,000, Bianca offers): if Adore rejects, she gets $0, so she accepts anything above $0. Bianca keeps almost all of it, Adore gets a token amount. Round 2 ($60,000, Adore offers): Adore knows Bianca would get about $20,000 by pushing to Round 3, so Adore offers Bianca just enough to beat that (about $20,000) and keeps about $40,000. Round 1 ($100,000, Bianca offers): Bianca knows Adore would get about $40,000 by pushing to Round 2, so Bianca offers Adore just over $40,000 (about $41,000) and keeps about $59,000. Adore accepts, since $41,000 now beats the $40,000 she would get by rejecting.  |
| :---- | :---- |
| **Scoring** | **What earns the points:** Recognizing that you solve it backward (last round first) and landing on "Bianca offers roughly $40,000 to $41,000 and keeps the rest, accepted in Round 1." The exact dollar is not required; the backward logic is the scoring gate. "Split it 50/50" or "haggle all three rounds" without the backward reasoning does not count. **How they might get there**: Work backward. Round 3: Adore takes anything over $0, so Bianca keeps nearly all of the $20,000. Round 2: Adore offers Bianca just more than that to avoid Round 3, keeping about $40,000. Round 1: Bianca offers Adore just more than that to avoid Round 2, keeping about $59,000, accepted on the spot. The counterintuitive result: it ends immediately, and moving first is an advantage. |
| **Host Notes** | **Hints**: "Do not start at Round 1\. Start at Round 3\. If they get there, what happens, and who has the power?" "Once you know the Round 3 outcome, what would each person settle for in Round 2? Then work back to Round 1." |
| **Documentation** | **Why it's this level**: The hardest strategic reasoning short of the finale. You cannot figure out the first offer without first working out the last round, then the middle, then the start, reasoning backward from the end. It stacks a sequence on top of Row 4's mutual reasoning. The math carries real weight: the shrinking pot is what determines every offer. |

---

## Row 6: The counterintuitive result

| Board Content | The question: Imagine 8 people each secretly write down a number from 0 to 100\. Whoever guesses closest to two-thirds of the average of all the guesses wins. What number should a smart player write, and why? The answer: 0 or \~22: 0 | Pure Logic: If everyone reasons perfectly, the number spirals down. Two-thirds of 50 is about 33, but everyone thinks that, so about 22, then about 15, down to 0, the only number no one would want to change. \~22  | Layered Realism: In a real group, not everyone reasons all the way down, so the average lands above 0 and the winning guess is usually about 20 to 25\. Recognizing "it spirals toward 0, but real people will not all reason that deep, so I aim a bit above 0" models both the logic and the actual opponents, which is the sharpest play. |
| :---- | :---- |
| **Scoring** | **What earns the points:** Credit any answer that explains the downward spiral. **Tiebreak**: if both teams explain the spiral, the team that also layers in the realism (that real people will not all reason to 0, so the smart guess is about 22, not 0\) wins. **How they might get there**: Start naive (average about 50, guess about 33), realize everyone reasons that too (about 22), and again (about 15), seeing it spiral toward 0\. Pure-logic endpoint: 0\. The great-not-just-good insight: real people will not all reach 0, so aim a bit above, about 22\. The paradox: perfect reasoning says 0, but the winner is whoever best guessed how deep everyone else would actually reason. |
| **Host Notes** | **Hints**: "If everyone guessed randomly, the average would be about 50, so what is two-thirds of that? Now, will everyone else think the same thing?" "Each time you assume everyone reasons one step further, where does the number go? Does it ever stop? And in a real room, does everyone actually reason that far?" |
| **Documentation** | **Why it's this level**: The finale, and the deepest strategic reasoning in the column. Not "what is the clever move" but "how many layers deep does everyone reason, knowing everyone else is reasoning too?" Each layer of "but they'll think that, so I should" pushes the answer downward with no bottom. The surprise: flawless reasoning points everyone toward 0, yet 0 almost never wins, because real people do not all reason that far. It is the deepest expression of the whole column's skill: reasoning about other minds reasoning about you. |

.