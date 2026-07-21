/* Point totals and the team progress bars. A bar is full at half the board's
   total points (a decisively winning score); width caps at 100%. */

window.Score = (function () {
  'use strict';

  var D = window.GAME_DATA;

  var totalBoardPoints = D.rows.reduce(function (sum, r) {
    return sum + r.points * D.columns.length;
  }, 0);
  var FULL_BAR = totalBoardPoints / 2;

  var pointsByRow = {};
  D.rows.forEach(function (r) { pointsByRow[r.row] = r.points; });

  var shown = [0, 0]; // what the number labels currently display

  function teamScore(team) {
    var s = 0;
    Object.keys(State.data.winners).forEach(function (qid) {
      if (State.data.winners[qid].indexOf(team) !== -1) {
        s += pointsByRow[Number(qid.split(':')[1])] || 0;
      }
    });
    return s;
  }

  function tickNumber(el, from, to, ms) {
    if (from === to) { el.textContent = String(to); return; }
    var start = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - start) / ms);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Glides bars and number labels to the current true totals.
  function updateBars(animate) {
    [0, 1].forEach(function (team) {
      var score = teamScore(team);
      var bar = document.getElementById(team === 0 ? 't1-bar' : 't2-bar');
      var pts = document.getElementById(team === 0 ? 't1-pts' : 't2-pts');
      var width = Math.min(100, (score / FULL_BAR) * 100) + '%';
      if (animate) {
        bar.style.width = width;
        tickNumber(pts, shown[team], score, 900);
      } else {
        bar.style.transition = 'none';
        bar.style.width = width;
        void bar.offsetWidth; // flush so the transition removal applies
        bar.style.transition = '';
        pts.textContent = String(score);
      }
      shown[team] = score;
    });
  }

  return { updateBars: updateBars, teamScore: teamScore };
})();
