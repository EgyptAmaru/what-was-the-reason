/* Boot and orchestration: screen transitions, the timed choreography after a
   card closes (retire fade, point glide, band advance, game end), the
   locked-band override, and restart. Timing per CLAUDE.md "Board State":
     - initial band activation: 1.5s after landing on the board
     - retire fade: 1s after the card closes (only if the answer was revealed)
     - point bar/text glide: 1.5s after the card closes
     - next band activation: after the retire fade has signaled (2s)
     - game end screen: 3s after the final retirement */

window.Main = (function () {
  'use strict';

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.toggle('active', s.id === id);
    });
  }

  function setTeamLabels() {
    document.getElementById('t1-name').textContent = State.data.teams[0];
    document.getElementById('t2-name').textContent = State.data.teams[1];
  }

  /* ---------- post-close choreography ---------- */

  function afterClose(id) {
    var willRetire = State.data.revealed[id] && !State.data.retired[id];

    setTimeout(function () { Score.updateBars(true); }, 1500);

    if (!willRetire) {
      // Adjustment-only visit (or closed without revealing): bars may still
      // glide, but nothing retires.
      return;
    }

    setTimeout(function () {
      State.data.retired[id] = true;
      State.save();
      Board.retireTile(id);

      if (Board.allRetired()) {
        State.data.finished = true;
        State.save();
        setTimeout(showEnd, 3000);
      } else {
        // If that retirement completed a band, the next band fades in a beat
        // after the retire fade so the two transitions read separately.
        setTimeout(function () { Board.sync(); }, 1000);
      }
    }, 1000);
  }

  /* ---------- game end ---------- */

  function showEnd() {
    var s0 = Score.teamScore(0);
    var s1 = Score.teamScore(1);
    var title = document.getElementById('end-title');
    var eyebrow = document.getElementById('end-eyebrow');
    title.classList.remove('red', 'blue');
    if (s0 === s1) {
      eyebrow.textContent = 'Final score';
      title.textContent = 'It’s a tie!';
    } else {
      eyebrow.textContent = 'And the winner is';
      var winner = s0 > s1 ? 0 : 1;
      title.textContent = State.data.teams[winner];
      title.classList.add(winner === 0 ? 'red' : 'blue');
    }
    document.getElementById('end-summary').innerHTML =
      '<div class="srow red"><span class="sname">' + escapeHtml(State.data.teams[0]) + '</span>' +
      '<span class="spts">' + s0 + ' pts</span></div>' +
      '<div class="srow blue"><span class="sname">' + escapeHtml(State.data.teams[1]) + '</span>' +
      '<span class="spts">' + s1 + ' pts</span></div>';
    showScreen('end-screen');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- boot paths ---------- */

  function startBoard(freshGame) {
    setTeamLabels();
    Board.build();
    Score.updateBars(false);
    document.getElementById('override-toggle').checked = State.data.override;
    showScreen('board-screen');
    // Board renders all-gray first; bands fade to color after the delay.
    setTimeout(function () { Board.sync(); }, freshGame ? 1500 : 400);
  }

  function restart() {
    if (!confirm('Restart the game? All points and progress will be cleared.')) return;
    State.clear();
    location.reload();
  }

  /* ---------- dark mode ----------
     A display preference, not game state: it lives under its own key so
     "Restart game" (which clears game state) leaves it alone. */

  var DARK_KEY = 'wwtr-dark-v1';

  function applyDark(on) {
    document.body.classList.toggle('dark', on);
  }

  function initDarkMode() {
    var on = false;
    try { on = localStorage.getItem(DARK_KEY) === '1'; } catch (e) { /* default light */ }
    applyDark(on);
    var toggle = document.getElementById('dark-toggle');
    toggle.checked = on;
    toggle.addEventListener('change', function (e) {
      applyDark(e.target.checked);
      try { localStorage.setItem(DARK_KEY, e.target.checked ? '1' : '0'); } catch (err) { /* ignore */ }
    });
  }

  function init() {
    Card.init();
    initDarkMode();

    document.getElementById('team-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var t1 = document.getElementById('team1').value.trim() || 'Team 1';
      var t2 = document.getElementById('team2').value.trim() || 'Team 2';
      State.data.teams = [t1, t2];
      State.data.started = true;
      State.save();
      startBoard(true);
    });

    document.getElementById('override-toggle').addEventListener('change', function (e) {
      State.data.override = e.target.checked;
      State.save();
      Board.sync();
    });

    document.getElementById('restart-btn').addEventListener('click', restart);
    document.getElementById('play-again').addEventListener('click', function () {
      State.clear();
      location.reload();
    });

    if (State.data.finished) {
      setTeamLabels();
      showEnd();
    } else if (State.data.started) {
      startBoard(false);
    } else {
      showScreen('landing');
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { showScreen: showScreen, afterClose: afterClose };
})();
