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
  // A score bar is full at half the board's total points, matching the player
  // board (see js/score.js).
  var FULL_BAR = D.rows.reduce(function (sum, r) {
    return sum + r.points * D.columns.length;
  }, 0) / 2;
  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var LAST_ROOM_KEY = 'wwtr-host-room-v1';
  var HOST_DARK_KEY = 'wwtr-host-dark-v1';

  var fb = null;          // { db, ref, push, onValue }
  var roomCode = null;
  var snap = null;        // latest state snapshot from the TV
  var mode = null;        // 'live' | 'browse'
  var previewQid = null;  // question peeked locally (disconnected/browse only)
  var pendingOpen = null; // optimistic open target while the TV confirms
  var lastRendered = '';

  // Disconnected-from-players mode: the host peeks privately without driving
  // the shared TV. While on, the board view is locally unlocked so any
  // question can be opened to read; card controls show but are inert.
  var disconnected = false;
  var localUnlock = false;

  // Which detail groups the host has expanded; survives re-renders so an
  // incoming snapshot does not fold the group they are reading. The
  // question and answer live under Board content, so it opens by default.
  var openGroups = { board: true, scoring: false, host: true };

  // Console's own dark preference, used when browsing (no TV to mirror).
  var localDark = false;
  try { localDark = localStorage.getItem(HOST_DARK_KEY) === '1'; } catch (e) { /* default light */ }

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

  function toggleControl(act, label, on, disabled) {
    return '<label class="c-toggle' + (disabled ? ' disabled' : '') + '">' +
      '<input type="checkbox" data-act="' + act + '"' + (on ? ' checked' : '') +
      (disabled ? ' disabled' : '') + '>' +
      '<span class="c-switch" aria-hidden="true"></span>' + label + '</label>';
  }

  function renderHeader() {
    el('room-label').textContent = mode === 'live' ? ('Room ' + roomCode) : 'Browsing';

    // All session toggles are grouped in the header. Dark mode is always
    // available; unlock and disconnect only mean something when connected.
    var toggles = '';
    if (mode === 'live') {
      toggles += toggleControl('t-disconnect', 'Disconnect from players', disconnected, false);
      toggles += toggleControl('t-override', 'Unlock all acts', viewUnlocked(), false);
    }
    toggles += toggleControl('t-dark', 'Dark mode', consoleDark(), false);
    el('c-toggles').innerHTML = toggles;
  }

  // Team point totals, shown on the board view (as on the player board), not
  // on the card, so a point change is seen only after the card is closed.
  function scoresHtml() {
    if (!(mode === 'live' && snap && snap.started)) return '';
    var t = snap.teams || ['Team 1', 'Team 2'];
    var s = snap.scores || [0, 0];
    function side(i, cls) {
      var w = Math.min(100, (s[i] / FULL_BAR) * 100);
      return '<div class="hs-team ' + cls + '">' +
        '<div class="hs-top"><span class="hs-name">' + esc(t[i]) + '</span>' +
        '<span class="hs-pts">' + s[i] + '</span></div>' +
        '<div class="hs-track"><div class="hs-fill" style="width:' + w + '%"></div></div></div>';
    }
    return '<div class="hg-scores">' + side(0, 'red') + side(1, 'blue') + '</div>';
  }

  // Fields are folded into the three source sections of the content schema
  // (Board content / Scoring / Host notes), one collapsible group each, the
  // same grouping the Markdown files use. Documentation fields (why it's
  // this level, build/reskin/other notes) never render in the game.
  function fieldHtml(key, label, body) {
    return '<div class="hfield" data-field="' + key + '">' +
      '<div class="hlabel">' + label + '</div>' + body + '</div>';
  }

  function groupHtml(key, label, cls, inner) {
    return '<details class="hgroup ' + cls + '" data-group="' + key + '"' +
      (openGroups[key] ? ' open' : '') + '>' +
      '<summary>' + label + '</summary>' +
      '<div class="hgroup-body">' + inner + '</div></details>';
  }

  /* ---------- console dark mode ----------
     Live: mirror the TV (snapshot.dark), toggling sends a command back.
     Browse: the console themes itself from a local preference. */

  function consoleDark() {
    if (mode === 'live' && snap && typeof snap.dark === 'boolean') return snap.dark;
    return localDark;
  }

  function applyConsoleDark() {
    document.body.classList.toggle('dark', consoleDark());
  }

  function toggleDark(on) {
    if (mode === 'live') {
      send({ t: 'dark', value: on });
    } else {
      localDark = on;
      try { localStorage.setItem(HOST_DARK_KEY, on ? '1' : '0'); } catch (e) { /* ignore */ }
    }
    document.body.classList.toggle('dark', on); // optimistic; render reconciles
  }

  function questionHtml(qid, opts) {
    var info = findQ(qid);
    var q = info.q;
    var cleaned = window.Charts ? Charts.cleanQuestion(info.colId, info.row, q.question) : q.question;
    var qBody = (window.Format && Format.question(qid, cleaned)) || paras(cleaned);
    var qVis = (window.Charts && Charts.visual(info.colId, info.row, 'question')) || '';
    var aVis = (window.Charts && Charts.visual(info.colId, info.row, 'answer')) || '';
    var aBody = ((window.Format && Format.answer(qid, q.answer)) || answerHtml(q.answer)) + aVis;

    // kind: 'live' (card open on the shared TV, active controls),
    //       'peek' (disconnected private view, controls shown but inert),
    //       'browse' (no TV at all).
    var kind = opts.kind;
    var h = '<div class="qdetail">';

    // Back sits at the top in every state; it is how the host returns to the
    // board view (closing the card on the TV when connected).
    h += '<div class="preview-bar"><button type="button" class="back" data-act="back">&larr; Back</button></div>';

    h += '<div class="qmeta">' +
      '<span class="col-chip" style="--dot:' + colColor(info.colId) + '">' + esc(info.col.name) + '</span>' +
      '<span class="rowpts">R' + info.row + '</span>' +
      '</div>';

    if (q.title) h += '<div class="qtitle">' + esc(q.title) + '</div>';

    if (kind === 'peek') {
      // Static, disabled timer readout: the host is not driving the clock.
      h += '<div class="timer-line"><span class="t">' + fmt(info.rowData.timeSeconds) +
        '</span><span class="tstate">timer</span>' +
        '<button type="button" class="tl-btn" disabled>Start</button></div>';
    } else if (kind === 'live') {
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

    // Board content: the question (as it reads on the TV) and the answer.
    var boardInner =
      fieldHtml('question', 'Question', '<div class="qcard"><div class="qtext">' + qBody + '</div>' + qVis + '</div>') +
      fieldHtml('answer', 'Answer', '<div class="afield">' + aBody + '</div>');
    h += groupHtml('board', 'Board content', 'hgroup--board', boardInner);

    // Scoring.
    var scoringInner =
      fieldHtml('gate', 'What earns the points', paras(q.scoringGate)) +
      fieldHtml('path', 'How they might get there', paras(q.path));
    h += groupHtml('scoring', 'Scoring', 'hgroup--scoring', scoringInner);

    // Host notes.
    var hostInner = fieldHtml('hints', 'Hints', hintsHtml(q.hints));
    if (q.hostNote) hostInner += fieldHtml('hostNote', 'Host note', paras(q.hostNote));
    if (q.takeaway) hostInner += fieldHtml('takeaway', 'Takeaway', paras(q.takeaway));
    h += groupHtml('host', 'Host notes', 'hgroup--host', hostInner);

    h += '</div>';
    return h;
  }

  // Whether the board view treats every act as open. Browse has no locks;
  // connected mirrors the TV override; disconnected uses the local toggle.
  function viewUnlocked() {
    if (mode === 'browse') return true;
    return disconnected ? localUnlock : !!(snap && snap.override);
  }

  // Board-view tile look. Retired always reads retired; otherwise open when
  // the view is unlocked or the row's act is the active band.
  function gridTileState(qid, row) {
    if (snap && snap.retired && snap.retired[qid]) return 'retired';
    if (viewUnlocked()) return 'active';
    return rowBand(row) === activeBandIndex() ? 'active' : 'locked';
  }

  // A single grid that mirrors the TV board's proportions (row-label column
  // plus four equal columns, column headers, act bands), so it reads the
  // same on a phone or a desktop rather than a squished phone column.
  function gridHtml() {
    var cols = D.columns.slice().sort(function (a, b) { return a.position - b.position; });
    var activeBand = activeBandIndex();

    var h = scoresHtml();

    h += '<div class="hgrid">';
    h += '<div class="hg-corner"></div>';
    cols.forEach(function (c) {
      h += '<div class="hg-colhead"><div class="hg-cname">' + esc(c.name) + '</div>' +
        '<div class="hg-cbar" style="background:' + colColor(c.id) + '"></div></div>';
    });
    D.rows.forEach(function (r) {
      var band = rowBand(r.row);
      if (bands[band][0] === r.row) {
        var locked = mode === 'live' && !viewUnlocked() && band !== activeBand;
        h += '<div class="hg-act' + (locked ? ' locked' : '') + '"><span class="rule"></span>' +
          esc(D.acts[band].label) + '<span class="rule"></span></div>';
      }
      h += '<div class="hg-rlabel"><span class="r">R' + r.row +
        '</span><span class="rp">' + r.points + ' pts</span></div>';
      cols.forEach(function (c) {
        var qid = c.id + ':' + r.row;
        h += '<button type="button" class="mini-tile ' + gridTileState(qid, r.row) +
          ' browsable" data-col="' + c.id + '" data-qid="' + qid + '">' + r.points + '</button>';
      });
    });
    h += '</div>';
    return h;
  }

  function controlsHtml() {
    if (mode !== 'live') return null;
    var t = snap && snap.teams ? snap.teams : ['Team 1', 'Team 2'];

    // Disconnected peek: points shown but inert, so the host understands
    // nothing they do here changes the shared board.
    if (disconnected && previewQid) {
      var pw = (snap && snap.winners && snap.winners[previewQid]) || [];
      return '<div class="cwrap">' +
        '<span class="cwrap-note">Disconnected</span>' +
        '<button type="button" class="ctrl wred' + (pw.indexOf(0) !== -1 ? ' on' : '') + '" disabled>' + esc(t[0]) + '</button>' +
        '<button type="button" class="ctrl wblue' + (pw.indexOf(1) !== -1 ? ' on' : '') + '" disabled>' + esc(t[1]) + '</button>' +
        '</div>';
    }

    if (!snap || !snap.open || disconnected) return null;
    var qid = snap.open.qid;
    var winners = (snap.winners && snap.winners[qid]) || [];
    var flipLabel = snap.open.face === 'answer' ? 'Question' : 'Answer';

    return '<div class="cwrap">' +
      '<button type="button" class="ctrl primary" data-act="flip">' + flipLabel + '</button>' +
      '<button type="button" class="ctrl wred' + (winners.indexOf(0) !== -1 ? ' on' : '') + '" data-act="winner" data-team="0">' + esc(t[0]) + '</button>' +
      '<button type="button" class="ctrl wblue' + (winners.indexOf(1) !== -1 ? ' on' : '') + '" data-act="winner" data-team="1">' + esc(t[1]) + '</button>' +
      '</div>';
  }

  function msg(big, small) {
    return '<div class="cmsg"><div class="big">' + big + '</div>' + small + '</div>';
  }

  // Start form: enter team names and start the game on the TV remotely, the
  // same capability as the board's landing page.
  function startFormHtml() {
    return '<div class="hstart">' +
      '<h2>Start a game</h2>' +
      '<p class="hstart-sub">Enter the team names and start the game on the TV.</p>' +
      '<label class="hstart-field red"><span>Team #1 Name</span>' +
      '<input id="host-team1" type="text" autocomplete="off" placeholder="Enter a team name"></label>' +
      '<label class="hstart-field blue"><span>Team #2 Name</span>' +
      '<input id="host-team2" type="text" autocomplete="off" placeholder="Enter a team name"></label>' +
      '<button type="button" class="hstart-btn" data-act="start-game">Start Game</button>' +
      '<button type="button" class="hstart-rules rules-open">How to play</button>' +
      '</div>';
  }

  function bodyHtml() {
    if (mode === 'browse') {
      return previewQid ? questionHtml(previewQid, { kind: 'browse' }) : gridHtml();
    }
    if (!snap) return msg('Waiting for the board', 'Open the game on the TV. This screen joins it automatically.');
    if (!snap.started) return startFormHtml();
    if (snap.finished) {
      var t = snap.teams, s = snap.scores || [0, 0];
      var line = s[0] === s[1] ? 'It is a tie!' :
        esc(t[s[0] > s[1] ? 0 : 1]) + ' wins';
      return msg('Game over · ' + line, esc(t[0]) + ' ' + s[0] + ' pts · ' + esc(t[1]) + ' ' + s[1] + ' pts');
    }
    // Disconnected: peek privately, nothing here touches the TV.
    if (disconnected) {
      return previewQid ? questionHtml(previewQid, { kind: 'peek' }) : gridHtml();
    }
    // Connected: mirror the TV. A just-tapped tile shows optimistically
    // until the snapshot confirms, to avoid a grid-then-card flash.
    if (snap.open) return questionHtml(snap.open.qid, { kind: 'live' });
    if (pendingOpen) return questionHtml(pendingOpen, { kind: 'live' });
    return gridHtml();
  }

  function render() {
    applyConsoleDark();
    renderHeader();
    var body = bodyHtml();
    var controls = controlsHtml();
    var stamp = JSON.stringify([body, controls, consoleDark()]);
    if (stamp === lastRendered) return;
    lastRendered = stamp;

    el('cbody').innerHTML = body;
    var bar = el('controls');
    bar.innerHTML = controls || '';
    bar.classList.toggle('show', Boolean(controls));

    // Remember which groups the host opens or closes.
    document.querySelectorAll('.hgroup').forEach(function (d) {
      d.addEventListener('toggle', function () { openGroups[d.dataset.group] = d.open; });
    });
  }

  /* ---------- interaction ---------- */

  function onBodyClick(e) {
    var start = e.target.closest('[data-act="start-game"]');
    if (start) {
      if (mode === 'live') {
        var t1 = document.getElementById('host-team1');
        var t2 = document.getElementById('host-team2');
        send({ t: 'start', teams: [t1 ? t1.value : '', t2 ? t2.value : ''] });
      }
      return;
    }

    var back = e.target.closest('[data-act="back"]');
    if (back) {
      if (mode === 'live' && !disconnected && snap && snap.open) {
        send({ t: 'close' }); // connected: close the card on the TV too
      } else {
        previewQid = null;
        render();
      }
      return;
    }

    // Timer controls (live connected card only; disabled otherwise).
    var tbtn = e.target.closest('[data-act="timer"], [data-act="timer-reset"]');
    if (tbtn) {
      if (mode === 'live' && !disconnected && snap && snap.open) {
        send({ t: tbtn.dataset.act === 'timer' ? 'timer' : 'timer-reset' });
      }
      return;
    }

    var tile = e.target.closest('.mini-tile');
    if (!tile) return;
    var qid = tile.dataset.qid;
    if (mode === 'live' && !disconnected) {
      // Connected: open on the shared TV directly (if the board allows it).
      if (gridTileState(qid, Number(qid.split(':')[1])) !== 'locked') {
        pendingOpen = qid;
        send({ t: 'open', qid: qid });
        render();
      }
    } else {
      // Disconnected or browse: peek privately, never touches the TV.
      previewQid = qid;
      render();
    }
  }

  function setDisconnected(on) {
    disconnected = on;
    previewQid = null;
    localUnlock = on; // disconnecting unlocks the private board view
    render();
  }

  function onControlsClick(e) {
    var btn = e.target.closest('[data-act]');
    if (!btn || disconnected || !snap || !snap.open) return;
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
        pendingOpen = null; // the snapshot is now the source of truth
        render();
      });
      fb.onValue(fb.ref(fb.db, '.info/connected'), function (s) {
        el('conn-dot').classList.toggle('on', s.val() === true);
      });
    }).catch(function () {
      el('join-note').textContent = 'Could not reach the sync service. Check the internet connection, or browse notes instead.';
    });
  }

  // All three session toggles live in the header now.
  function onHeaderChange(e) {
    var inp = e.target.closest('input[data-act]');
    if (!inp) return;
    if (inp.dataset.act === 't-dark') {
      toggleDark(inp.checked);
    } else if (inp.dataset.act === 't-disconnect') {
      setDisconnected(inp.checked);
    } else if (inp.dataset.act === 't-override') {
      if (disconnected) { localUnlock = inp.checked; render(); }
      else if (mode === 'live') { send({ t: 'override', value: inp.checked }); }
    }
  }

  function init() {
    el('cbody').addEventListener('click', onBodyClick);
    el('controls').addEventListener('click', onControlsClick);
    el('chead').addEventListener('change', onHeaderChange);
    el('browse-btn').addEventListener('click', startBrowse);
    applyConsoleDark();

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
