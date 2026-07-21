# Estimation column

**What this column is.** Estimation is guessing a number you cannot look up by breaking it into smaller pieces you can reason about. Every question is built from a few steps you multiply or divide together, and questions get harder as more of those steps are left for the player to figure out.

*Note: Field schema, authoring rules, seam tests, and the difficulty ladder are in CLAUDE.md; player-experience and scoring notes are in README.*

---

## Row 1: Scaling a number you already know

| Board Content | The question: If you eat Brazilian food once a week, how many times is that in a year? The answer: About 52 times. A year is roughly 52 weeks, so once a week is about 52\. |
| :---- | :---- |
| **Scoring** | **What earns the points:** Any answer that shows how they got there. Landing near 52 with a method counts. A bare "52" with no explanation does not, the whole point of this row is showing a little reasoning. **How they might get there**: Two ways, both fine. Once a week times 52 weeks. Four weeks a month times 12 months is 48, then add 2 or 3 weeks because months run a little longer than four weeks. That small correction is a nice instinct to point out. |
| **Host Notes** | **Hints**: "How many weeks are in a year?" "If you're not sure, try weeks in a month times months in a year."  |
| **Documentation** | **Why it's this level**: The easiest kind of estimation. Take a number you already roughly know and scale it up, one or two steps of multiplication. It is the warm-up: the goal is to show that estimating is doable, not to stump anyone. |

---

## Row 2: Filling a space

| Board Content | The question: How many soccer balls fit in this room? The answer: Depends on the room, so there is no single number. For a rough sense: a soccer ball is about 22 cm across, so along a 4-meter wall you would fit about 18, and you multiply that in three directions (across, deep, and up). |
| :---- | :---- |
| **Scoring** | **What earns the points:** A sensible method, not a specific number. Bonus recognition if they remember that round balls leave gaps and knock the total down a bit. **How they might get there**:  Room volume divided by one ball's volume. Balls across, times balls deep, times layers stacked up. |
| **Host Notes** | **Hints**: "About how big is a soccer ball? About how big is this room?" "Try how many fit along the floor, then how many layers up to the ceiling." **Takeaway**: The gaps between round balls mean the real number is a bit lower than the tidy math.  |
| **Documentation** | **Why it's this level**:  Still easy and still solo, but a different kind of thinking. Instead of scaling a number, you picture how objects fill a space. The skill is turning messy real things into simple shapes: a ball into a cube, the room into an empty box. |

---

## Row 3: Guessing a share and building on it

| Board Content | The question: How many people in San Francisco go camping over a summer weekend? The answer: No single right number, it depends on the share you assume. Rough sketch: SF has about 800,000 to 900,000 people; if you guess a small slice, say 1 to 3 percent, go camping on a given summer weekend, that is very roughly 10,000 to 25,000 people. |
| :---- | :---- |
| **Scoring** | **What earns the points:** A sensible set of steps and a defensible guess for the camping share. Two teams can pick different percentages and both earn full points if they can make a case.  **How they might get there**: SF population times the guessed share who camp that weekend. The share is the hard part and the whole point of the discussion. |
| **Host Notes** | **Hints**: "Start with how many people live in SF." "What share of them do you think actually go camping on a summer weekend? There's no right answer, just make a case." |
| **Documentation** | **Why it's this level**: The first real jump. Now one number in the chain is something nobody knows, what share of people actually go camping, and the group has to guess it and argue about it. This is where estimating becomes building a little model, which is why teams start working together here. |

---

## Row 4: Splitting a total across what one unit handles

## 

| Board Content | The question: A Waymo needs to be towed about 4 times a year. How many tow trucks does the Bay Area need to keep its Waymo fleet moving? The answer: Depends on how many Waymos there are and how much a truck can do, so there is no fixed number. Sketch: a few thousand Waymos times 4 tows a year is tens of thousands of tows; one truck doing maybe 6 tows a day times about 250 workdays is roughly 1,500 a year; divide and you get a rough truck count. |
| :---- | :---- |
| **Scoring** | **What earns the points:** Building both estimates (total towing needed, and one truck's yearly capacity) and combining them by dividing. The division is the thing to look for. Their guess at fleet size does not need to be exact. **How they might get there**:  Total towing needed \= number of Waymos times 4 a year. One truck's capacity \= tows per day times workdays per year. Trucks needed \= total towing divided by one truck's capacity. |
| **Host Notes** | **Hints**: "First: how many total tows does the whole fleet need in a year?" "Now: how many tows can one truck do in a year? What do you do with those two numbers?" If they stall on how many Waymos there are, you can offer a rough number so they get to the division, which is where the real thinking is. |
| **Documentation** | **Why it's this level**: Harder because it needs two separate estimates that you combine by dividing. You work out the total amount of towing needed, and separately how much one truck can handle, then divide one by the other. That "divide the total by what one unit handles" move is the new skill. |

---

## Row 5: Landing in the right ballpark

## 

| Board Content | The question: How many trees are on Earth: millions, billions, trillions, or hundreds of trillions? The answer: About 3 trillion trees (the "trillions" bin). Most people guess far too low. |
| :---- | :---- |
| **Scoring** | **What earns the points:** Picking the right ballpark (trillions) with real reasoning behind it. A sound approach that lands one bin off can still win. Tie-breaker: correct bin AND reasoning. **How they might get there**: Land area, times the share that is forest, times trees per patch of forest. Land area is roughly knowable; the forest share and the trees-per-patch are wild guesses that carry most of the uncertainty. |
| **Host Notes** | **Hints**: "Roughly how much of the Earth's land is covered in forest?" "About how many trees in a patch of forest the size of a city block? And how many blocks of forest are there?" (very rough, just to get the multiplication going)  |
| **Documentation** | **Why it's this level**: Hard because almost every number in the chain is a guess, and the guesses multiply together, so small errors blow up fast. You cannot get a precise answer, the win is landing in the right ballpark. This is the row where you teach that "right size" is success, and being off by ten times is expected. |

---

## Row 6: A normal calculation with a gut-defying answer

## 

| Board Content | The question: A cloud holds about half a gram of water in every cubic meter of air. About how much weight does Storm move with a single, typical puffy cloud? The answer: About 500 tons. This is roughly a million pounds, about the weight of a couple hundred cars. A puffy cloud is very roughly a cube one kilometer on each side, which is a billion cubic meters; a billion times half a gram is 500 million grams, about 500 tons. |
| :---- | :---- |
| **Scoring** | **What earns the points:** Realizing the cloud is huge, multiplying its size by the water-per-cubic-meter they were given, and being appropriately shocked. Judge the reasoning, not the exact cloud size, half or double the size is fine. **How they might get there**: Cloud size (roughly a cube a kilometer on a side, which is a billion cubic meters) times half a gram per cubic meter is about 500 tons. |
| **Host Notes** | **Hints**: "How big is a puffy cloud, roughly? Guess its width, depth, and height." "A cloud a kilometer on each side, how many cubic meters is that?" (the answer, a billion, is where the jaw drops) |
| **Documentation** | **Why it's this level**: The finale. It is a normal estimation chain, but the answer fights your gut, a cloud feels weightless, and it turns out to weigh as much as a couple hundred cars. The surprise comes from realizing how enormous a cloud actually is. |

