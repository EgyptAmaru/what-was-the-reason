/* Game state and persistence. State survives an accidental refresh via
   localStorage; "Restart game" clears it. */

window.State = (function () {
  'use strict';

  var KEY = 'wwtr-state-v1';

  var data = {
    started: false,
    finished: false,
    teams: ['', ''],
    winners: {},   // qid -> array of team indices (0, 1); may hold both
    revealed: {},  // qid -> true once the Answer side has been shown
    retired: {},   // qid -> true once retired from the board
    override: false
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) Object.assign(data, JSON.parse(raw));
    } catch (e) { /* corrupt or unavailable storage: start fresh */ }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable: play on without persistence */ }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  load();
  return { data: data, save: save, clear: clear };
})();
