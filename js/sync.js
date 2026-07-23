/* Host console sync, TV side. Additive layer: the board stays authoritative
   and fully playable standalone. When js/firebase-config.js holds a config,
   this module opens a room in Firebase Realtime Database, publishes the game
   state whenever it changes, and applies commands sent by the phone console
   (host.html) through the same public APIs the on-screen controls use. If
   the config is null or the SDK cannot load (no internet), every entry point
   here is a no-op and the game behaves exactly as before. */

window.Sync = (function () {
  'use strict';

  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var ROOM_KEY = 'wwtr-room-v1';

  var fb = null;        // { db, ref, set, remove, onChildAdded, onValue }
  var roomRef = null;
  var roomCode = null;
  var pending = null;   // debounce handle for notify()

  function roomCodeFor() {
    try {
      var saved = localStorage.getItem(ROOM_KEY);
      if (saved) return saved;
    } catch (e) { /* fall through to a fresh code */ }
    // No ambiguous characters (0/O, 1/I/L).
    var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    try { localStorage.setItem(ROOM_KEY, code); } catch (e) { /* ignore */ }
    return code;
  }

  /* ---------- snapshot out ---------- */

  function snapshot() {
    var open = Card.current();
    return {
      v: 1,
      at: Date.now(),
      teams: State.data.teams,
      started: State.data.started,
      finished: State.data.finished,
      override: State.data.override,
      winners: State.data.winners,
      revealed: State.data.revealed,
      retired: State.data.retired,
      scores: [Score.teamScore(0), Score.teamScore(1)],
      open: open.qid ? { qid: open.qid, face: open.face } : null,
      timer: open.qid ? open.timer : null
    };
  }

  // Debounced publish; safe to call from anywhere, any number of times.
  function notify() {
    if (!fb) return;
    if (pending) clearTimeout(pending);
    pending = setTimeout(function () {
      pending = null;
      fb.set(fb.ref(fb.db, 'rooms/' + roomCode + '/state'), snapshot())
        .catch(function () { /* offline: RTDB retries queued writes itself */ });
    }, 80);
  }

  /* ---------- commands in ---------- */

  function applyCommand(cmd) {
    if (!cmd || !cmd.t) return;
    if (!State.data.started || State.data.finished) return;
    var openQid = Card.current().qid;

    switch (cmd.t) {
      case 'open':
        if (!openQid && typeof cmd.qid === 'string' && Board.isOpenable(cmd.qid)) {
          Card.open(cmd.qid);
        }
        break;
      case 'close':
        if (openQid) Card.close();
        break;
      case 'flip':
        if (openQid) {
          if (cmd.face === 'answer') Card.flipToAnswer();
          else Card.flipToQuestion();
        }
        break;
      case 'winner':
        if (openQid && (cmd.team === 0 || cmd.team === 1)) Card.toggleWinner(cmd.team);
        break;
      case 'timer':
        if (openQid) Card.toggleTimer();
        break;
      case 'timer-reset':
        if (openQid) Card.resetTimer();
        break;
    }
  }

  /* ---------- footer chip + QR overlay ---------- */

  function hostUrl() {
    var base = location.href.split('?')[0].split('#')[0];
    base = base.replace(/index\.html$/, '');
    return base + 'host.html?room=' + roomCode;
  }

  function buildUi() {
    var foot = document.querySelector('.board-foot');
    if (!foot) return;

    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'quiet-btn host-chip';
    chip.innerHTML = 'Host console · <strong>' + roomCode + '</strong>';
    foot.insertBefore(chip, foot.firstChild);

    var overlay = document.createElement('div');
    overlay.className = 'host-overlay';
    overlay.innerHTML =
      '<div class="host-pop">' +
      '<div class="hp-title">Host console</div>' +
      '<div class="hp-code">' + roomCode + '</div>' +
      '<div class="hp-qr" id="hp-qr"></div>' +
      '<div class="hp-url">' + hostUrl().replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>' +
      '<div class="hp-hint">Scan with the host phone, or open the link and enter the code.</div>' +
      '</div>';
    document.body.appendChild(overlay);

    if (window.QRCode) {
      new QRCode(document.getElementById('hp-qr'), {
        text: hostUrl(), width: 168, height: 168,
        colorDark: '#33302B', colorLight: '#F3EDE0'
      });
    }

    chip.addEventListener('click', function () { overlay.classList.add('show'); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('show');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlay.classList.remove('show');
    });
  }

  /* ---------- boot ---------- */

  function start() {
    if (!window.FIREBASE_CONFIG) return;

    Promise.all([
      import(SDK + 'firebase-app.js'),
      import(SDK + 'firebase-database.js')
    ]).then(function (mods) {
      var appMod = mods[0], dbMod = mods[1];
      var app = appMod.initializeApp(window.FIREBASE_CONFIG);
      fb = {
        db: dbMod.getDatabase(app),
        ref: dbMod.ref,
        set: dbMod.set,
        remove: dbMod.remove,
        onChildAdded: dbMod.onChildAdded,
        onValue: dbMod.onValue
      };
      roomCode = roomCodeFor();
      roomRef = fb.ref(fb.db, 'rooms/' + roomCode);

      // Drop any commands left over from a previous session, then listen.
      fb.remove(fb.ref(fb.db, 'rooms/' + roomCode + '/cmd')).finally(function () {
        fb.onChildAdded(fb.ref(fb.db, 'rooms/' + roomCode + '/cmd'), function (snap) {
          var cmd = snap.val();
          fb.remove(snap.ref);
          try { applyCommand(cmd); } catch (e) { /* never let a bad command break the game */ }
        });
      });

      // Hook every persisted state change without touching call sites.
      var origSave = State.save;
      State.save = function () { origSave(); notify(); };

      buildUi();
      notify();
    }).catch(function () {
      // SDK unreachable (offline TV): play on standalone.
      fb = null;
    });
  }

  document.addEventListener('DOMContentLoaded', start);

  return { notify: notify };
})();
