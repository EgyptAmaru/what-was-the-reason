/* Host console logic (host.html). Two modes:

   Live: joins the room the TV publishes (see js/sync.js), renders the host
   material for whichever question is open, and sends control commands back
   (open/close/flip, winner selection, timer). The TV stays authoritative;
   this screen never computes game outcomes, it renders the TV's snapshot.

   Browse: no connection. The same mini board and note views, navigated
   locally. This is the fallback when there is no config, no internet, or
   the connection hiccups mid-game.

   Host material (hints, host notes, takeaways) is deliberately rendered
   here and never on the TV: the shared screen stays player-clean. */

window.Host = (function () {
  'use strict';

  var D = window.GAME_DATA;
  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var LAST_ROOM_KEY = 'wwtr-host-room-v1';

  var fb = null;          // { db, ref, push, onValue }
  var roomCode = null;
  var snap = null;        // latest state snapshot from the TV
  var mode = null;        // 'live' | 'browse'
  var previewQid = null;  // locally viewed question (does not touch the TV)
  var previewOn = false;  // grid taps preview locally instead of opening on TV
  var lastRendered = '';

  // Which detail sections the host has open; survives re-renders so an
  // incoming snapshot does not fold the section they are reading.
  var openSecs = { hints: true };

  /* ---------- text helpers ---------- */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function rich(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  function paras(s) {
    return '<p>' + rich(s) + '</p>';
  }

  // Hints are authored as quoted sentences; render them as escalating steps.
  function hintsHtml(s) {
    var out = [];
    var re = /"([^"]+)"/g, m;
    while ((m = re.exec(s)) !== null) out.push(m[1]);
    if (out.length < 2) return paras(s);
    return '<ol>' + out.map(function (h) { return '<li>' + rich(h) + '</li>'; }).join('') + '</ol>';
  }

  // Same first-sentence-as-headline treatment the TV card uses.
  function answerHtml(raw) {
    var text = raw.replace(/\s\.\s/g, ' ');
    var cut = text.indexOf('. ');
    var head = cut > 0 ? text.slice(0, cut + 1) : text;
    var rest = cut > 0 ? text.slice(cut + 1).replace(/^[.\s]+/, '') : '';
    return '<span class="big-a">' + rich(head) + '</span>' + (rest ? paras(rest) : '');
  }

  /* ---------- data lookups (mirrors card.js/board.js) ---------- */

  function findQ(qid) {
    var parts = qid.split(':');
    var row = Number(parts[1]);
    return {
      colId: parts[0],
      row: row,
      col: D.columns.filter(function (c) { return c.id === parts[0]; })[0],
      rowData: D.rows.filter(function (r) { return r.row === row; })[0],
      q: D.questions[parts[0]].filter(function (q) { return q.row === row; })[0]
    };
  }

  var COL_VAR = {
    'estimation': '--est',
    'logic-paradox': '--logic',
    'strategy': '--strat',
    'data-literacy': '--data'
  };

  function colColor(colId) {
    var v = COL_VAR[colId] || '--tile';
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }

  var bands = (function () {
    var byAct = {};
    D.rows.forEach(function (r) { (byAct[r.act] = byAct[r.act] || []).push(r.row); });
    return D.acts.map(function (a) { return byAct[a.act] || []; });
  })();

  function retiredMap() { return (snap && snap.retired) || {}; }

  function activeBandIndex() {
    var retired = retiredMap();
    for (var i = 0; i < bands.length; i++) {
      var done = bands[i].every(function (row) {
        return D.columns.every(function (c) { return retired[c.id + ':' + row]; });
      });
      if (!done) return i;
    }
    return -1;
  }

  function rowBand(row) {
    for (var i = 0; i < bands.length; i++) {
      if (bands[i].indexOf(row) !== -1) return i;
    }
    return -1;
  }

  function tileState(qid, row) {
    if (retiredMap()[qid]) return 'retired';
    var active = (snap && snap.override) || rowBand(row) === activeBandIndex();
    return active ? 'active' : 'locked';
  }

  /* ---------- commands out ---------- */

  function send(cmd) {
    if (!fb || !roomCode) return;
    cmd.ts = Date.now();
    fb.push(fb.ref(fb.db, 'rooms/' + roomCode + '/cmd'), cmd)
      .catch(function () { /* offline: the phone falls back to browsing */ });
  }

  /* ---------- timer (computed locally from the snapshot) ---------- */

  function timerNow() {
    if (!snap || !snap.timer) return null;
    var t = snap.timer;
    if (!t.running) return { remaining: t.remaining, running: false, total: t.total };
    var elapsed = Math.floor((Date.now() - t.at) / 1000);
    return { remaining: Math.max(0, t.remaining - elapsed), running: true, total: t.total };
  }

  function fmt(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // Ticks only the timer text so open sections are not disturbed.
  setInterval(function () {
    var t = timerNow();
    if (!t || !t.running) return;
    var el = document.querySelector('.timer-line .t');
    if (el) {
      el.textContent = fmt(t.remaining);
      el.classList.toggle('done', t.remaining === 0);
    }
    var btn = document.getElementById('ctrl-timer');
    if (btn && t.remaining === 0) btn.textContent = 'Time';
  }, 500);

  /* ---------- rendering ---------- */

  function el(id) { return document.getElementById(id); }

  function renderHeader() {
    el('room-label').textContent = mode === 'live' ? ('Room ' + roomCode) : 'Browsing';
    var scores = el('c-scores');
    if (mode === 'live' && snap && snap.started) {
      var t = snap.teams || ['Team 1', 'Team 2'];
      var s = snap.scores || [0, 0];
      scores.innerHTML =
        '<span class="cs red">' + esc(t[0]) + ' <span class="n">' + s[0] + '</span></span>' +
        '<span class="cs blue">' + esc(t[1]) + ' <span class="n">' + s[1] + '</span></span>';
    } else {
      scores.innerHTML = '';
    }
  }

  // Sections are tagged by which source section of the content schema they
  // come from (Board Content / Scoring / Host Notes), so the host can see at
  // a glance what kind of material each is. Documentation fields (why it's
  // this level, build/reskin/other notes) never render in the game.
  var GROUPS = {
    board: { label: 'Board content', cls: 'hsec--board' },
    scoring: { label: 'Scoring', cls: 'hsec--scoring' },
    host: { label: 'Host notes', cls: 'hsec--host' }
  };

  function sectionHtml(key, label, body, group) {
    var g = GROUPS[group];
    return '<details class="hsec ' + g.cls + '" data-sec="' + key + '"' + (openSecs[key] ? ' open' : '') + '>' +
      '<summary>' + label + '<span class="sec-tag">' + g.label + '</span></summary>' +
      '<div class="hsec-body">' + body + '</div></details>';
  }

  function questionHtml(qid, opts) {
    var info = findQ(qid);
    var q = info.q;
    var cleaned = window.Charts ? Charts.cleanQuestion(info.colId, info.row, q.question) : q.question;
    var qBody = (window.Format && Format.question(qid, cleaned)) || paras(cleaned);
    var qVis = (window.Charts && Charts.visual(info.colId, info.row, 'question')) || '';
    var aVis = (window.Charts && Charts.visual(info.colId, info.row, 'answer')) || '';
    var aBody = ((window.Format && Format.answer(qid, q.answer)) || answerHtml(q.answer)) + aVis;

    var h = '';

    if (opts.preview) {
      h += '<div class="preview-bar"><button type="button" class="back" data-act="back">&larr; Back</button>' +
        '<span>Preview · not shown on the TV</span></div>';
    }

    h += '<div class="qmeta">' +
      '<span class="col-chip" style="--dot:' + colColor(info.colId) + '">' + esc(info.col.name) + '</span>' +
      '<span class="rowpts">R' + info.row + ' · ' + info.rowData.points + ' pts · ' + info.rowData.time + '</span>';
    if (opts.live && snap && snap.open) {
      h += '<span class="facetag' + (snap.open.face === 'answer' ? ' answer' : '') + '">TV: ' +
        (snap.open.face === 'answer' ? 'Answer' : 'Question') + '</span>';
    }
    h += '</div>';

    if (q.title) h += '<div class="qtitle">' + esc(q.title) + '</div>';

    if (opts.live) {
      var t = timerNow();
      if (t) {
        var state = t.running ? 'running' : (t.remaining === t.total ? 'ready' : (t.remaining === 0 ? 'time' : 'paused'));
        var timerLabel = t.running ? 'Pause' : (t.remaining === t.total ? 'Start' : (t.remaining === 0 ? 'Time' : 'Resume'));
        h += '<div class="timer-line"><span class="t' + (t.remaining === 0 ? ' done' : '') + '">' +
          fmt(t.remaining) + '</span><span class="tstate">' + state + '</span>' +
          '<button type="button" class="tl-btn" id="ctrl-timer" data-act="timer">' + timerLabel + '</button>' +
          '<button type="button" class="tl-btn quiet" data-act="timer-reset" aria-label="Reset timer">&#8634;</button>' +
          '</div>';
      }
    }

    h += '<div class="qcard"><div class="qtext">' + qBody + '</div>' + qVis + '</div>';

    h += sectionHtml('hints', 'Hints', hintsHtml(q.hints), 'host');
    if (q.hostNote) h += sectionHtml('hostNote', 'Host note', paras(q.hostNote), 'host');
    if (q.takeaway) h += sectionHtml('takeaway', 'Takeaway', paras(q.takeaway), 'host');
    h += sectionHtml('answer', 'Answer', aBody, 'board');
    h += sectionHtml('gate', 'What earns the points', paras(q.scoringGate), 'scoring');
    h += sectionHtml('path', 'How they might get there', paras(q.path), 'scoring');

    return h;
  }

  function gridHtml() {
    var live = mode === 'live';
    var cols = D.columns.slice().sort(function (a, b) { return a.position - b.position; });
    var h = '<div class="grid-head"><span class="grid-title">' +
      (live ? 'Tap a square to open it on the TV' : 'Tap a square to read its notes') + '</span>';
    if (live) {
      h += '<button type="button" class="preview-toggle' + (previewOn ? ' on' : '') + '" data-act="preview-toggle">Preview</button>';
    }
    h += '</div>';

    h += '<div class="col-key">' + cols.map(function (c) {
      return '<span class="ck" style="--kc:' + colColor(c.id) + '">' + esc(c.name) + '</span>';
    }).join('') + '</div>';

    var activeBand = activeBandIndex();
    D.rows.forEach(function (r) {
      var band = rowBand(r.row);
      if (bands[band][0] === r.row) {
        var locked = live && !(snap && snap.override) && band !== activeBand;
        h += '<div class="mini-act' + (locked ? ' locked' : '') + '"><div class="rule"></div>' +
          esc(D.acts[band].label) + '<div class="rule"></div></div>';
      }
      h += '<div class="mini-row"><div class="mini-rlabel"><span class="r">R' + r.row +
        '</span><span class="rp">' + r.points + ' pts</span></div>';
      cols.forEach(function (c) {
        var qid = c.id + ':' + r.row;
        var state = live ? tileState(qid, r.row) : 'active';
        var browsable = !live || previewOn || state !== 'locked';
        h += '<button type="button" class="mini-tile ' + state +
          (browsable ? ' browsable' : '') +
          '" data-col="' + c.id + '" data-qid="' + qid + '">' + r.points + '</button>';
      });
      h += '</div>';
    });
    return h;
  }

  function controlsHtml() {
    if (mode !== 'live' || !snap || !snap.open || previewQid) return null;
    var qid = snap.open.qid;
    var t = snap.teams || ['Team 1', 'Team 2'];
    var winners = (snap.winners && snap.winners[qid]) || [];
    var flipLabel = snap.open.face === 'answer' ? 'Question' : 'Answer';

    return '<div class="cwrap">' +
      '<button type="button" class="ctrl primary" data-act="flip">' + flipLabel + '</button>' +
      '<button type="button" class="ctrl wred' + (winners.indexOf(0) !== -1 ? ' on' : '') + '" data-act="winner" data-team="0">' + esc(t[0]) + '</button>' +
      '<button type="button" class="ctrl wblue' + (winners.indexOf(1) !== -1 ? ' on' : '') + '" data-act="winner" data-team="1">' + esc(t[1]) + '</button>' +
      '<button type="button" class="ctrl quiet" data-act="close" aria-label="Close card">&#10005;</button>' +
      '</div>';
  }

  function msg(big, small) {
    return '<div class="cmsg"><div class="big">' + big + '</div>' + small + '</div>';
  }

  function bodyHtml() {
    if (previewQid) return questionHtml(previewQid, { preview: true });
    if (mode === 'browse') return gridHtml();
    if (!snap) return msg('Waiting for the board', 'Open the game on the TV. This screen joins it automatically.');
    if (!snap.started) return msg('Waiting for team names', 'Enter the teams on the TV to begin.');
    if (snap.finished) {
      var t = snap.teams, s = snap.scores || [0, 0];
      var line = s[0] === s[1] ? 'It is a tie!' :
        esc(t[s[0] > s[1] ? 0 : 1]) + ' wins';
      return msg('Game over · ' + line, esc(t[0]) + ' ' + s[0] + ' pts · ' + esc(t[1]) + ' ' + s[1] + ' pts');
    }
    if (snap.open) return questionHtml(snap.open.qid, { live: true });
    return gridHtml();
  }

  function render() {
    renderHeader();
    var body = bodyHtml();
    var controls = controlsHtml();
    var stamp = JSON.stringify([body, controls]);
    if (stamp === lastRendered) return;
    lastRendered = stamp;

    el('cbody').innerHTML = body;
    var bar = el('controls');
    bar.innerHTML = controls || '';
    bar.classList.toggle('show', Boolean(controls));

    // Remember which sections the host opens or closes.
    document.querySelectorAll('.hsec').forEach(function (d) {
      d.addEventListener('toggle', function () { openSecs[d.dataset.sec] = d.open; });
    });
  }

  /* ---------- interaction ---------- */

  function onBodyClick(e) {
    var back = e.target.closest('[data-act="back"]');
    if (back) { previewQid = null; render(); return; }

    var pt = e.target.closest('[data-act="preview-toggle"]');
    if (pt) { previewOn = !previewOn; render(); return; }

    // Timer controls sit beside the readout in the live question view.
    var tbtn = e.target.closest('[data-act="timer"], [data-act="timer-reset"]');
    if (tbtn) {
      if (mode === 'live' && snap && snap.open && !previewQid) {
        send({ t: tbtn.dataset.act === 'timer' ? 'timer' : 'timer-reset' });
      }
      return;
    }

    var tile = e.target.closest('.mini-tile');
    if (!tile) return;
    var qid = tile.dataset.qid;
    if (mode === 'browse' || previewOn) {
      previewQid = qid;
      render();
    } else if (mode === 'live') {
      var state = tileState(qid, Number(qid.split(':')[1]));
      if (state !== 'locked') send({ t: 'open', qid: qid });
    }
  }

  function onControlsClick(e) {
    var btn = e.target.closest('[data-act]');
    if (!btn || !snap || !snap.open) return;
    switch (btn.dataset.act) {
      case 'flip':
        send({ t: 'flip', face: snap.open.face === 'answer' ? 'question' : 'answer' });
        break;
      case 'winner':
        send({ t: 'winner', team: Number(btn.dataset.team) });
        break;
      case 'close':
        send({ t: 'close' });
        break;
    }
  }

  /* ---------- boot: join / browse ---------- */

  function showConsole() {
    el('join').classList.remove('active');
    el('console').classList.add('active');
    render();
  }

  function startBrowse() {
    mode = 'browse';
    showConsole();
  }

  function connect(code) {
    roomCode = code.toUpperCase().trim();
    if (!/^[A-Z0-9]{4}$/.test(roomCode)) {
      el('join-note').textContent = 'Codes are 4 letters, shown on the TV footer.';
      return;
    }
    el('join-note').textContent = 'Connecting…';

    Promise.all([
      import(SDK + 'firebase-app.js'),
      import(SDK + 'firebase-database.js')
    ]).then(function (mods) {
      var app = mods[0].initializeApp(window.FIREBASE_CONFIG);
      fb = {
        db: mods[1].getDatabase(app),
        ref: mods[1].ref,
        push: mods[1].push,
        onValue: mods[1].onValue
      };
      try { localStorage.setItem(LAST_ROOM_KEY, roomCode); } catch (err) { /* ignore */ }
      mode = 'live';
      showConsole();

      fb.onValue(fb.ref(fb.db, 'rooms/' + roomCode + '/state'), function (s) {
        snap = s.val();
        render();
      });
      fb.onValue(fb.ref(fb.db, '.info/connected'), function (s) {
        el('conn-dot').classList.toggle('on', s.val() === true);
      });
    }).catch(function () {
      el('join-note').textContent = 'Could not reach the sync service. Check the internet connection, or browse notes instead.';
    });
  }

  function init() {
    el('cbody').addEventListener('click', onBodyClick);
    el('controls').addEventListener('click', onControlsClick);
    el('browse-btn').addEventListener('click', startBrowse);

    var input = el('room-input');
    var params = new URLSearchParams(location.search);
    var fromUrl = params.get('room');
    try { input.value = fromUrl || localStorage.getItem(LAST_ROOM_KEY) || ''; } catch (e) { input.value = fromUrl || ''; }

    if (!window.FIREBASE_CONFIG) {
      el('join-note').textContent = 'Sync is not configured (see js/firebase-config.js). Browse mode still works.';
      input.disabled = true;
      document.querySelector('.join-btn').disabled = true;
    } else if (fromUrl) {
      connect(fromUrl);
    }

    el('join-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.FIREBASE_CONFIG) connect(input.value);
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return {};
})();
