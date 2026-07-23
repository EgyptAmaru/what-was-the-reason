/* The expanded question card: flip between Question and Answer faces,
   winner selection (one, both, or neither team), and the host-run timer. */

window.Card = (function () {
  'use strict';

  var D = window.GAME_DATA;
  var currentQid = null;
  var timer = { remaining: 0, total: 0, running: false, handle: null };

  // Tells the host-console sync layer (if active) that card UI state moved
  // in a way State.save does not capture: open/flip/close and the timer.
  function ping() {
    if (window.Sync) Sync.notify();
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Minimal inline Markdown: **bold** and *italic* only.
  function rich(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  function findQuestion(id) {
    var parts = id.split(':');
    var row = Number(parts[1]);
    return {
      colId: parts[0],
      row: row,
      col: D.columns.filter(function (c) { return c.id === parts[0]; })[0],
      rowData: D.rows.filter(function (r) { return r.row === row; })[0],
      q: D.questions[parts[0]].filter(function (q) { return q.row === row; })[0]
    };
  }

  /* ---------- timer ---------- */

  function fmt(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function renderTimer() {
    var chip = document.getElementById('timer-chip');
    var reset = document.getElementById('timer-reset');
    var label = timer.running ? 'pause' : (timer.remaining === timer.total ? 'start' : (timer.remaining === 0 ? 'time' : 'resume'));
    chip.classList.toggle('done', timer.remaining === 0 && timer.total > 0 && !timer.running);
    chip.innerHTML = '<span class="go">' + label + '</span> ' + fmt(timer.remaining);
    reset.classList.toggle('show', timer.remaining !== timer.total);
  }

  function stopTimer() {
    if (timer.handle) { clearInterval(timer.handle); timer.handle = null; }
    timer.running = false;
  }

  function toggleTimer() {
    if (timer.remaining === 0) return;
    if (timer.running) {
      stopTimer();
    } else {
      timer.running = true;
      timer.handle = setInterval(function () {
        timer.remaining -= 1;
        if (timer.remaining <= 0) {
          timer.remaining = 0;
          stopTimer();
          ping();
        }
        renderTimer();
      }, 1000);
    }
    renderTimer();
    ping();
  }

  function resetTimer() {
    stopTimer();
    timer.remaining = timer.total;
    renderTimer();
    ping();
  }

  /* ---------- winner chips ---------- */

  function syncChips() {
    var winners = State.data.winners[currentQid] || [];
    document.querySelectorAll('#card-screen .wchip').forEach(function (chip) {
      chip.classList.toggle('on', winners.indexOf(Number(chip.dataset.winner)) !== -1);
    });
  }

  function toggleWinner(team) {
    var winners = (State.data.winners[currentQid] || []).slice();
    var at = winners.indexOf(team);
    if (at === -1) winners.push(team); else winners.splice(at, 1);
    if (winners.length) State.data.winners[currentQid] = winners.sort();
    else delete State.data.winners[currentQid];
    State.save();
    syncChips();
  }

  /* ---------- open / close / flip ---------- */

  function lengthClass(text, longAt, xlongAt) {
    if (xlongAt && text.length > xlongAt) return ' xlong';
    if (text.length > longAt) return ' long';
    return '';
  }

  function answerHtml(raw) {
    // Every answer leads with its first sentence as a headline; long
    // headlines render a step smaller.
    var text = raw.replace(/\s\.\s/g, ' ');
    var cut = text.indexOf('. ');
    var head = cut > 0 ? text.slice(0, cut + 1) : text;
    var rest = cut > 0 ? text.slice(cut + 1).replace(/^[.\s]+/, '') : '';
    var cls = head.length > 90 ? 'big-a small' : 'big-a';
    return '<span class="' + cls + '">' + rich(head) + '</span>' + rich(rest);
  }

  function open(id) {
    currentQid = id;
    var info = findQuestion(id);
    var color = Board.colColor(info.colId);

    ['front-chip', 'back-chip'].forEach(function (elId) {
      var chip = document.getElementById(elId);
      chip.textContent = info.col.name;
      chip.style.setProperty('--dot', color);
    });
    document.querySelectorAll('#card-screen .face').forEach(function (face) {
      face.dataset.col = info.colId;
    });

    var qRaw = window.Charts ? Charts.cleanQuestion(info.colId, info.row, info.q.question) : info.q.question;
    var qEl = document.getElementById('q-text');
    qEl.className = 'qtext' + lengthClass(qRaw, 380, 750);
    qEl.innerHTML = (window.Format && Format.question(id, qRaw)) || rich(qRaw);
    document.getElementById('q-visual').innerHTML =
      (window.Charts && Charts.visual(info.colId, info.row, 'question')) || '';

    var aEl = document.getElementById('a-text');
    aEl.className = 'atext' + lengthClass(info.q.answer, 700);
    aEl.innerHTML = (window.Format && Format.answer(id, info.q.answer)) || answerHtml(info.q.answer);
    document.getElementById('a-visual').innerHTML =
      (window.Charts && Charts.visual(info.colId, info.row, 'answer')) || '';

    document.querySelectorAll('#card-screen .wchip').forEach(function (chip) {
      chip.textContent = State.data.teams[Number(chip.dataset.winner)];
    });
    syncChips();

    timer.total = info.rowData.timeSeconds;
    timer.remaining = timer.total;
    stopTimer();
    renderTimer();

    document.getElementById('flip-inner').classList.remove('flipped');
    Main.showScreen('card-screen');
    ping();
  }

  function flipToAnswer() {
    document.getElementById('flip-inner').classList.add('flipped');
    if (!State.data.revealed[currentQid]) {
      State.data.revealed[currentQid] = true;
      State.save();
    }
    ping();
  }

  function flipToQuestion() {
    document.getElementById('flip-inner').classList.remove('flipped');
    ping();
  }

  function close() {
    stopTimer();
    var id = currentQid;
    currentQid = null;
    Main.showScreen('board-screen');
    Main.afterClose(id);
    ping();
  }

  // Read-only view of the card for the sync layer's state snapshot. The
  // timer carries a timestamp so a remote screen can tick locally.
  function current() {
    return {
      qid: currentQid,
      face: document.getElementById('flip-inner').classList.contains('flipped') ? 'answer' : 'question',
      timer: {
        total: timer.total,
        remaining: timer.remaining,
        running: timer.running,
        at: Date.now()
      }
    };
  }

  /* ---------- wiring ---------- */

  function init() {
    document.getElementById('to-answer').addEventListener('click', flipToAnswer);
    document.getElementById('to-question').addEventListener('click', flipToQuestion);
    document.getElementById('timer-chip').addEventListener('click', toggleTimer);
    document.getElementById('timer-reset').addEventListener('click', resetTimer);
    document.querySelectorAll('#card-screen [data-close]').forEach(function (btn) {
      btn.addEventListener('click', close);
    });
    document.querySelectorAll('#card-screen .wchip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        toggleWinner(Number(chip.dataset.winner));
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && currentQid !== null) close();
    });
  }

  return {
    open: open,
    init: init,
    close: close,
    flipToAnswer: flipToAnswer,
    flipToQuestion: flipToQuestion,
    toggleTimer: toggleTimer,
    resetTimer: resetTimer,
    toggleWinner: toggleWinner,
    current: current
  };
})();
