/* Chart and table renderers for the visual questions.
   Each spec below is the executable form of that question's Build note in
   content/ — the values, axis floors, and structure come from there verbatim.
   The distortion on question-side charts is intentional and load-bearing
   (see CLAUDE.md, "Rendering visual questions"): a truncated axis stays
   truncated. Corrections belong on the answer side only. */

window.Charts = (function () {
  'use strict';

  // Chart palettes per theme. SVG colors are baked in at render time, and a
  // card is always (re)rendered after a theme change, so applyTheme() before
  // each build is enough. Table colors ride on the CSS variables instead,
  // so they adapt live.
  var PALETTES = {
    light: {
      MARK: '#b85f5f',
      INK: '#33302b',
      INK_SOFT: '#736c60',
      GRID: 'rgba(51,48,43,0.10)',
      AXIS: 'rgba(51,48,43,0.35)'
    },
    dark: {
      MARK: '#cf7a6a',
      INK: '#e7e1d3',
      INK_SOFT: '#a59d8e',
      GRID: 'rgba(231,225,211,0.12)',
      AXIS: 'rgba(231,225,211,0.40)'
    }
  };
  var MARK, INK, INK_SOFT, GRID, AXIS;

  function applyTheme() {
    var p = document.body && document.body.classList.contains('dark')
      ? PALETTES.dark : PALETTES.light;
    MARK = p.MARK; INK = p.INK; INK_SOFT = p.INK_SOFT; GRID = p.GRID; AXIS = p.AXIS;
  }

  /* ---------- shared helpers ---------- */

  function ensureStyles() {
    if (document.getElementById('charts-css')) return;
    var style = document.createElement('style');
    style.id = 'charts-css';
    style.textContent =
      '.qvisual{margin:14px auto;max-width:100%;overflow-x:auto;text-align:center}' +
      '.qvisual svg{max-width:100%;height:auto;font-family:inherit}' +
      '.qtable{border-collapse:collapse;margin:0 auto;font-variant-numeric:tabular-nums;text-align:left}' +
      '.qtable th{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;' +
      'color:var(--ink-soft,#736c60);padding:8px 18px;border-bottom:2px solid var(--ink,#33302b)}' +
      '.qtable td{font-size:0.98rem;padding:10px 18px;border-bottom:1px solid var(--hairline,rgba(51,48,43,0.16))}' +
      '.qtable tr:last-child td{border-bottom:none}' +
      '.qtable td:first-child{font-weight:700}';
    document.head.appendChild(style);
  }

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- line small-multiples (shared y scale) ---------- */

  function lineSmallMultiples(cfg) {
    var W = 660, H = 270;
    var mTop = 46, mBottom = 40, mLeft = 58, gap = 34;
    var panelW = (W - mLeft - gap - 12) / 2;
    var plotH = H - mTop - mBottom;
    var y = function (v) {
      return mTop + plotH * (1 - (v - cfg.yMin) / (cfg.yMax - cfg.yMin));
    };
    var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(cfg.title) + '">';
    s += '<text x="' + (W / 2) + '" y="20" text-anchor="middle" font-size="14" font-weight="600" fill="' + INK + '">' + esc(cfg.title) + '</text>';

    cfg.panels.forEach(function (panel, p) {
      var x0 = mLeft + p * (panelW + gap);
      var x = function (i) {
        return x0 + (panelW * (i + 0.5)) / panel.values.length;
      };
      s += '<text x="' + (x0 + panelW / 2) + '" y="' + (mTop - 8) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="' + INK + '">' + esc(panel.label) + '</text>';
      cfg.yTicks.forEach(function (t) {
        s += '<line x1="' + x0 + '" y1="' + y(t) + '" x2="' + (x0 + panelW) + '" y2="' + y(t) + '" stroke="' + GRID + '" stroke-width="1"/>';
        if (p === 0) {
          s += '<text x="' + (mLeft - 8) + '" y="' + (y(t) + 3.5) + '" text-anchor="end" font-size="11" fill="' + INK_SOFT + '">' + fmt(t) + '</text>';
        }
      });
      // reference line
      s += '<line x1="' + x0 + '" y1="' + y(cfg.refLine) + '" x2="' + (x0 + panelW) + '" y2="' + y(cfg.refLine) + '" stroke="' + INK_SOFT + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
      s += '<text x="' + (x0 + panelW - 2) + '" y="' + (y(cfg.refLine) - 5) + '" text-anchor="end" font-size="10.5" fill="' + INK_SOFT + '">' + esc(cfg.refLabel) + '</text>';
      // series
      var pts = panel.values.map(function (v, i) { return [x(i), y(v)]; });
      s += '<path d="M' + pts.map(function (pt) { return pt[0].toFixed(1) + ',' + pt[1].toFixed(1); }).join('L') + '" fill="none" stroke="' + MARK + '" stroke-width="2" stroke-linejoin="round"/>';
      pts.forEach(function (pt) {
        s += '<circle cx="' + pt[0].toFixed(1) + '" cy="' + pt[1].toFixed(1) + '" r="3.2" fill="' + MARK + '"/>';
      });
      // x axis
      s += '<line x1="' + x0 + '" y1="' + (mTop + plotH) + '" x2="' + (x0 + panelW) + '" y2="' + (mTop + plotH) + '" stroke="' + AXIS + '" stroke-width="1"/>';
      s += '<text x="' + (x0 + panelW / 2) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="11" fill="' + INK_SOFT + '">' + esc(cfg.xLabel) + '</text>';
    });
    s += '</svg>';
    return s;
  }

  /* ---------- bar chart with a configurable y floor ---------- */

  function barChart(cfg) {
    var W = 470, H = 310;
    var mTop = 48, mBottom = 58, mLeft = 64, mRight = 18;
    var plotW = W - mLeft - mRight;
    var plotH = H - mTop - mBottom;
    var y = function (v) {
      return mTop + plotH * (1 - (v - cfg.yMin) / (cfg.yMax - cfg.yMin));
    };
    var n = cfg.bars.length;
    var slot = plotW / n;
    var barW = Math.min(72, slot * 0.55);

    var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(cfg.title) + '">';
    s += '<text x="' + (mLeft + plotW / 2) + '" y="22" text-anchor="middle" font-size="14" font-weight="600" fill="' + INK + '">' + esc(cfg.title) + '</text>';
    cfg.yTicks.forEach(function (t) {
      s += '<line x1="' + mLeft + '" y1="' + y(t) + '" x2="' + (mLeft + plotW) + '" y2="' + y(t) + '" stroke="' + GRID + '" stroke-width="1"/>';
      s += '<text x="' + (mLeft - 8) + '" y="' + (y(t) + 3.5) + '" text-anchor="end" font-size="11" fill="' + INK_SOFT + '">' + esc(cfg.fmtTick(t)) + '</text>';
    });
    cfg.bars.forEach(function (bar, i) {
      var cx = mLeft + slot * (i + 0.5);
      var xL = cx - barW / 2;
      var top = y(bar.value);
      var base = mTop + plotH;
      var r = Math.min(4, Math.max(0, base - top));
      s += '<path d="M' + xL + ',' + base +
        ' L' + xL + ',' + (top + r) +
        ' Q' + xL + ',' + top + ' ' + (xL + r) + ',' + top +
        ' L' + (xL + barW - r) + ',' + top +
        ' Q' + (xL + barW) + ',' + top + ' ' + (xL + barW) + ',' + (top + r) +
        ' L' + (xL + barW) + ',' + base + ' Z" fill="' + MARK + '"/>';
      s += '<text x="' + cx + '" y="' + (top - 7) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + INK + '">' + fmt(bar.value) + '</text>';
      s += '<text x="' + cx + '" y="' + (base + 18) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + INK + '">' + esc(bar.label) + '</text>';
      s += '<text x="' + cx + '" y="' + (base + 33) + '" text-anchor="middle" font-size="10.5" fill="' + INK_SOFT + '">' + esc(bar.sub) + '</text>';
    });
    s += '<line x1="' + mLeft + '" y1="' + (mTop + plotH) + '" x2="' + (mLeft + plotW) + '" y2="' + (mTop + plotH) + '" stroke="' + AXIS + '" stroke-width="1"/>';
    s += '</svg>';
    return s;
  }

  /* ---------- table ---------- */

  function table(cfg) {
    var s = '<table class="qtable"><thead><tr>';
    cfg.columns.forEach(function (c) { s += '<th>' + esc(c) + '</th>'; });
    s += '</tr></thead><tbody>';
    cfg.rows.forEach(function (row) {
      s += '<tr>';
      row.forEach(function (cell) { s += '<td>' + esc(cell) + '</td>'; });
      s += '</tr>';
    });
    s += '</tbody></table>';
    return s;
  }

  /* ---------- the four visual specs ---------- */

  // data-literacy R1 Build note: two line charts, one identical y-axis
  // (independent scaling kills the contrast), dashed line at 800 on both.
  // Chart is honest, so the answer side shows the same chart.
  var rpmChart = function () {
    return lineSmallMultiples({
      title: 'Engine speed while parked (RPM)',
      panels: [
        { label: 'Car A', values: [790, 810, 795, 805, 800, 800, 810, 790] },
        { label: 'Car B', values: [500, 1150, 600, 1050, 450, 1200, 400, 1050] }
      ],
      yMin: 0,
      yMax: 1300,
      yTicks: [0, 400, 800, 1200],
      refLine: 800,
      refLabel: 'avg 800',
      xLabel: 'seconds'
    });
  };

  // data-literacy R4 Build note: same three bars on both charts.
  // Question side floor 2,250,000 (the truncation is the deception);
  // answer side floor 0, bars near-equal.
  var capitalBars = [
    { label: 'Amman', sub: 'Jordan', value: 2273000 },
    { label: 'Beirut', sub: 'Lebanon', value: 2402000 },
    { label: 'Damascus', sub: 'Syria', value: 2685000 }
  ];
  var capitalsTruncated = function () {
    return barChart({
      title: 'Population of Levantine Capitals',
      bars: capitalBars,
      yMin: 2250000,
      yMax: 2700000,
      yTicks: [2250000, 2400000, 2550000, 2700000],
      fmtTick: function (t) { return (t / 1000000).toFixed(2) + 'M'; }
    });
  };
  var capitalsHonest = function () {
    return barChart({
      title: 'Population of Levantine Capitals',
      bars: capitalBars,
      yMin: 0,
      yMax: 3000000,
      yTicks: [0, 1000000, 2000000, 3000000],
      fmtTick: function (t) { return t === 0 ? '0' : (t / 1000000) + 'M'; }
    });
  };

  // logic-paradox R5 Build note: table (Department, Men, Women; rows A and F),
  // figures preserved. No chart.
  var berkeleyTable = function () {
    return table({
      columns: ['Department', 'Men', 'Women'],
      rows: [
        ['A', '512 admitted of 825 (62%)', '89 admitted of 108 (82%)'],
        ['F', '22 admitted of 373 (6%)', '24 admitted of 341 (7%)']
      ]
    });
  };

  // logic-paradox R6 Build note: table (Voter, 1st, 2nd, 3rd; three rows),
  // exact rankings preserved — the cyclic order is load-bearing. No chart.
  var votersTable = function () {
    return table({
      columns: ['Voter', '1st', '2nd', '3rd'],
      rows: [
        ['Voter 1', 'Republican', 'Democrat', 'Democratic Socialist'],
        ['Voter 2', 'Democrat', 'Democratic Socialist', 'Republican'],
        ['Voter 3', 'Democratic Socialist', 'Republican', 'Democrat']
      ]
    });
  };

  var specs = {
    'data-literacy:1': {
      question: rpmChart,
      answer: rpmChart,
      strip: [/\[See Build Note for chart specs\]\s*/g]
    },
    'data-literacy:4': {
      question: capitalsTruncated,
      answer: capitalsHonest,
      strip: [/\[See Build Note for chart specs\]\s*/g]
    },
    'logic-paradox:5': {
      question: berkeleyTable,
      answer: berkeleyTable,
      strip: [/Department Men Women A 512 admitted of 825 \(62%\) 89 admitted of 108 \(82%\) F 22 admitted of 373 \(6%\) 24 admitted of 341 \(7%\)\s*/g]
    },
    'logic-paradox:6': {
      question: votersTable,
      answer: votersTable,
      strip: [/Voter 1st 2nd 3rd Voter 1 Republican Democrat Democratic Socialist Voter 2 Democrat Democratic Socialist Republican Voter 3 Democratic Socialist Republican Democrat\s*/g]
    }
  };

  /* ---------- public API ---------- */

  return {
    // side: 'question' | 'answer'. Returns an HTML string or null.
    visual: function (colId, row, side) {
      var spec = specs[colId + ':' + row];
      if (!spec || !spec[side]) return null;
      ensureStyles();
      applyTheme();
      return '<figure class="qvisual">' + spec[side]() + '</figure>';
    },
    // Removes flattened table text / build-note markers from the prompt,
    // since the rendered visual carries that content.
    cleanQuestion: function (colId, row, text) {
      var spec = specs[colId + ':' + row];
      if (!spec || !spec.strip) return text;
      return spec.strip.reduce(function (t, re) { return t.replace(re, ''); }, text)
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
  };
})();
