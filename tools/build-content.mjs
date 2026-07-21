#!/usr/bin/env node
// Generates data/questions.json from the Markdown in content/.
// content/ is the human-edited source of truth; the JSON is a build artifact.
// Fields are parsed by their inline labels regardless of which table cell
// they sit in (see CLAUDE.md, "Web Build" > "Column file organization").

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentDir = path.join(root, 'content');
const outFile = path.join(root, 'data', 'questions.json');

const errors = [];
const warnings = [];

// Google-Docs-exported Markdown escapes punctuation (\+, \~, \#, ...). Undo it.
function unescapeMd(s) {
  return s
    .replace(/\\([^A-Za-z0-9\s])/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// Split a table row on pipes that are not escaped as \|
function splitCells(inner) {
  return inner.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim());
}

function isSeparatorCell(c) {
  return /^:?-{2,}:?$/.test(c);
}

/* ---------------- board.md ---------------- */

function parseBoardTables(text) {
  const sections = {};
  let current = null;
  for (const line of text.split('\n')) {
    const h = line.match(/^## (.+)$/);
    if (h) {
      current = h[1].trim();
      sections[current] = [];
      continue;
    }
    if (!current) continue;
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const cells = splitCells(t.replace(/^\|/, '').replace(/\|\s*$/, ''));
    if (cells.every(isSeparatorCell)) continue;
    sections[current].push(cells);
  }
  const tables = {};
  for (const [name, rows] of Object.entries(sections)) {
    if (rows.length < 2) continue;
    const header = rows[0].map((c) => c.toLowerCase());
    tables[name] = rows.slice(1).map((cells) => {
      const obj = {};
      header.forEach((key, i) => (obj[key] = cells[i] ?? ''));
      return obj;
    });
  }
  return tables;
}

function timeToSeconds(t, where) {
  const m = t.match(/^(\d+):([0-5]\d)$/);
  if (!m) {
    errors.push(`${where}: time "${t}" is not in m:ss format`);
    return 0;
  }
  return Number(m[1]) * 60 + Number(m[2]);
}

function parseBoard() {
  const file = path.join(contentDir, 'board.md');
  if (!existsSync(file)) {
    errors.push('content/board.md is missing');
    return null;
  }
  const tables = parseBoardTables(readFileSync(file, 'utf8'));
  for (const need of ['Acts', 'Rows', 'Columns']) {
    if (!tables[need]) errors.push(`content/board.md: missing "## ${need}" table`);
  }
  if (errors.length) return null;

  const acts = tables.Acts.map((r) => ({
    act: Number(r.act),
    label: r.label,
    mode: r.mode,
  }));
  const rows = tables.Rows.map((r) => ({
    row: Number(r.row),
    act: Number(r.act),
    points: Number(r.points),
    time: r.time,
    timeSeconds: timeToSeconds(r.time, `board.md Rows, row ${r.row}`),
  }));
  const columns = tables.Columns.map((r) => ({
    position: Number(r.position),
    id: r.file.replace(/\.md$/, ''),
    name: r.column,
    subheader: r.subheader,
    file: r.file,
  }));

  if (acts.length !== 3) errors.push(`board.md: expected 3 acts, found ${acts.length}`);
  if (rows.length !== 6) errors.push(`board.md: expected 6 rows, found ${rows.length}`);
  if (columns.length !== 4) errors.push(`board.md: expected 4 columns, found ${columns.length}`);
  for (const r of rows) {
    if (!acts.some((a) => a.act === r.act))
      errors.push(`board.md: row ${r.row} references act ${r.act}, which is not defined`);
    if (!Number.isFinite(r.points) || r.points <= 0)
      errors.push(`board.md: row ${r.row} has invalid points "${r.points}"`);
  }
  return { acts, rows, columns };
}

/* ---------------- question files ---------------- */

const FIELD_DEFS = [
  ['question', 'The question'],
  ['answer', 'The answer'],
  ['scoringGate', 'What earns the points'],
  ['path', 'How they might get there'],
  ['hints', 'Hints'],
  ['takeaway', 'Takeaways?'],
  ['hostNote', 'Host [Nn]otes?'],
  ['whyThisLevel', "Why it[’']s this level"],
  ['buildNote', 'Build notes?'],
  ['reskinNote', 'Authoring / reskin note|Reskin notes?|Authoring notes?'],
  ['otherNotes', 'Other notes'],
];

const labelRe = new RegExp(
  '\\*{0,2}(' + FIELD_DEFS.map(([, p]) => p).join('|') + ')[\\*:\\s]{1,6}',
  'g'
);

function keyForLabel(label) {
  for (const [key, pattern] of FIELD_DEFS) {
    if (new RegExp('^(?:' + pattern + ')$').test(label)) return key;
  }
  return null;
}

const UNIVERSAL = ['question', 'answer', 'scoringGate', 'path', 'hints', 'whyThisLevel'];
const SECTION_LABELS = ['Board Content', 'Scoring', 'Host Notes', 'Documentation'];

function parseQuestionFile(fileName) {
  const file = path.join(contentDir, fileName);
  if (!existsSync(file)) {
    errors.push(`content/${fileName} is missing (referenced by board.md Columns)`);
    return [];
  }
  const lines = readFileSync(file, 'utf8').split('\n');
  const sections = [];
  let cur = null;

  lines.forEach((line, i) => {
    const h = line.match(/^## Row (\d+)\s*:?\s*(.*)$/);
    if (h) {
      cur = { row: Number(h[1]), title: h[2].trim(), line: i + 1, cells: [] };
      sections.push(cur);
      return;
    }
    if (!cur) return;
    const t = line.trim();
    if (!t.startsWith('|')) return;
    const inner = t.replace(/^\|/, '').replace(/\|\s*$/, '');
    const cut = inner.indexOf('|');
    if (cut === -1) return;
    const label = inner.slice(0, cut).replace(/\*/g, '').trim();
    if (isSeparatorCell(label) || label === '') return;
    if (!SECTION_LABELS.includes(label)) {
      warnings.push(
        `content/${fileName}:${i + 1}: unrecognized section cell "${label}" (expected one of ${SECTION_LABELS.join(', ')}); its content is still parsed`
      );
    }
    // Keep everything after the first pipe verbatim: cell text may itself
    // contain pipes (e.g. strategy.md Row 6), so no further splitting.
    cur.cells.push({ content: inner.slice(cut + 1), line: i + 1 });
  });

  const questions = sections.map((sec) => {
    const full = sec.cells.map((c) => c.content).join('\n');
    const tokens = [];
    labelRe.lastIndex = 0;
    for (const m of full.matchAll(labelRe)) {
      if (!m[0].includes(':')) continue; // bold phrase, not a field label
      tokens.push({ key: keyForLabel(m[1]), start: m.index, end: m.index + m[0].length });
    }
    const fields = {};
    tokens.forEach((tok, idx) => {
      const value = unescapeMd(full.slice(tok.end, tokens[idx + 1]?.start ?? full.length));
      if (!tok.key) return;
      fields[tok.key] = fields[tok.key] ? fields[tok.key] + '\n\n' + value : value;
    });
    const preamble = unescapeMd(full.slice(0, tokens[0]?.start ?? 0));
    if (preamble.length > 5) {
      warnings.push(
        `content/${fileName}: Row ${sec.row} has text before its first field label (ignored): "${preamble.slice(0, 60)}..."`
      );
    }
    for (const key of UNIVERSAL) {
      if (!fields[key]) {
        errors.push(
          `content/${fileName}: Row ${sec.row} (line ${sec.line}) is missing universal field "${key}"`
        );
      }
    }
    return { row: sec.row, title: sec.title, ...fields };
  });

  const rowNums = questions.map((q) => q.row).join(',');
  if (rowNums !== '1,2,3,4,5,6') {
    errors.push(`content/${fileName}: expected Rows 1-6 in order, found [${rowNums}]`);
  }
  return questions;
}

/* ---------------- main ---------------- */

const board = parseBoard();
const questions = {};
if (board) {
  for (const col of board.columns) {
    questions[col.id] = parseQuestionFile(col.file);
  }
}

// The four visual questions per the Build notes in content/
const expectedVisuals = [
  ['data-literacy', 1],
  ['data-literacy', 4],
  ['logic-paradox', 5],
  ['logic-paradox', 6],
];
for (const [colId, row] of expectedVisuals) {
  const q = questions[colId]?.find((q) => q.row === row);
  if (q && !q.buildNote) {
    warnings.push(`content/${colId}.md Row ${row}: expected a Build note (visual question), none found`);
  }
}

if (warnings.length) {
  console.warn('Warnings:');
  for (const w of warnings) console.warn('  ! ' + w);
}
if (errors.length) {
  console.error('Build FAILED:');
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}

const out = {
  '//': 'GENERATED from content/*.md by tools/build-content.mjs. Do not edit; edit the Markdown in content/ and run: npm run build',
  generatedAt: new Date().toISOString(),
  acts: board.acts,
  rows: board.rows,
  columns: board.columns,
  questions,
};

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
// Script-tag twin of the JSON so the game also works over file:// (no fetch).
writeFileSync(
  outFile.replace(/\.json$/, '.js'),
  '// GENERATED — see data/questions.json. Edit content/*.md and run: npm run build\n' +
    'window.GAME_DATA = ' +
    JSON.stringify(out) +
    ';\n'
);

// Summary
console.log('Parsed content → data/questions.json\n');
const optional = ['takeaway', 'hostNote', 'buildNote', 'reskinNote', 'otherNotes'];
for (const col of board.columns) {
  console.log(col.name);
  for (const q of questions[col.id]) {
    const extras = optional.filter((k) => q[k]).join(', ') || '-';
    console.log(`  R${q.row} ✓ ${q.title || '(untitled)'}  [extras: ${extras}]`);
  }
}
console.log(
  `\n${board.columns.length} columns × 6 rows, ` +
    `${Object.values(questions).flat().length} questions total.`
);
