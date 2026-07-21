# Board settings

Row and act settings for the board, per the data-driven design in CLAUDE.md. Every question inherits its row's settings. Edit values here, then run `npm run build` to regenerate the runtime data. Never edit data/questions.json by hand, it is generated from this folder.

Time values are placeholders, to be tuned in playtesting.

## Acts

| Act | Label | Mode |
| :-- | :---- | :--- |
| 1 | Act 1 · Solo Players | solo |
| 2 | Act 2 · Team Discussion \| Alternate | team-alternate |
| 3 | Act 3 · Team Discussion \| Simultaneous | team-simultaneous |

## Rows

| Row | Act | Points | Time |
| :-- | :-- | :----- | :--- |
| 1 | 1 | 100 | 2:00 |
| 2 | 1 | 200 | 2:00 |
| 3 | 2 | 300 | 3:00 |
| 4 | 2 | 400 | 3:00 |
| 5 | 3 | 500 | 4:00 |
| 6 | 3 | 600 | 4:00 |

## Columns

| Position | Column | Subheader | File |
| :------- | :----- | :-------- | :--- |
| 1 | Estimation | reason under uncertainty | estimation.md |
| 2 | Logic / Paradox | reason vs your own gut | logic-paradox.md |
| 3 | Strategy | reason about other minds | strategy.md |
| 4 | Data Literacy | interrogate a claim | data-literacy.md |
