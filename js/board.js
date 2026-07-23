/* Board rendering and band state. Bands are derived from the act grouping in
   board.md: a band activates when every question in the bands above it is
   retired, unless the locked-band override is on. */

window.Board = (function () {
  'use strict';

  var D = window.GAME_DATA;

  // Column colors are presentation, keyed by column id (CLAUDE.md fixes the
  // four v1 colors; an unknown id from a future re-theme falls back to gray).
  var COL_VAR = {
    'estimation': '--est',
    'logic-paradox': '--logic',
    'strategy': '--strat',
    'data-literacy': '--data'
  };

  var bands = (function () {
    var byAct = {};
    D.rows.forEach(function (r) {
      (byAct[r.act] = byAct[r.act] || []).push(r.row);
    });
    return D.acts.map(function (a) { return byAct[a.act] || []; });
  })();

  function qid(colId, row) { return colId + ':' + row; }

  function colColor(colId) {
    var v = COL_VAR[colId] || '--tile';
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }

  function bandComplete(bandIdx) {
    return bands[bandIdx].every(function (row) {
      return D.columns.every(function (col) {
        return State.data.retired[qid(col.id, row)];
      });
    });
  }

  // First band with an unretired question; -1 when the whole board is done.
  function activeBandIndex() {
    for (var i = 0; i < bands.length; i++) {
      if (!bandComplete(i)) return i;
    }
    return -1;
  }

  function rowBand(row) {
    for (var i = 0; i < bands.length; i++) {
      if (bands[i].indexOf(row) !== -1) return i;
    }
    return -1;
  }

  function rowIsActive(row) {
    if (State.data.override) return true;
    return rowBand(row) === activeBandIndex();
  }

  function build() {
    var grid = document.getElementById('grid');
    var cols = D.columns.slice().sort(function (a, b) { return a.position - b.position; });
    var html = '<div></div>';
    cols.forEach(function (col) {
      html += '<div class="col-head"><div class="cname">' + col.name + '</div>' +
        '<div class="csub">' + col.subheader + '</div>' +
        '<div class="cbar" style="background:' + colColor(col.id) + '"></div></div>';
    });
    D.rows.forEach(function (r) {
      var band = rowBand(r.row);
      if (bands[band][0] === r.row) {
        var act = D.acts[band];
        html += '<div class="act-row locked" data-band="' + band + '">' +
          '<div class="rule"></div><div class="act-label">' + act.label + '</div><div class="rule"></div></div>';
      }
      html += '<div class="row-label"><div class="r">R' + r.row + '</div>' +
        '<div class="rp">' + r.points + ' pts</div></div>';
      cols.forEach(function (col) {
        html += '<button type="button" class="tile" data-col="' + col.id + '" data-row="' + r.row +
          '" data-qid="' + qid(col.id, r.row) + '">' + r.points + '</button>';
      });
    });
    grid.innerHTML = html;

    grid.addEventListener('click', function (e) {
      var tile = e.target.closest('.tile');
      if (!tile) return;
      var isOpenable = tile.classList.contains('active') || tile.classList.contains('retired');
      if (isOpenable) Card.open(tile.dataset.qid);
    });
  }

  // Applies active/retired classes to match state. CSS transitions carry the
  // fade whenever the classes change.
  function sync() {
    document.querySelectorAll('#grid .tile').forEach(function (tile) {
      var id = tile.dataset.qid;
      var row = Number(tile.dataset.row);
      tile.classList.remove('active', 'retired');
      if (State.data.retired[id]) {
        tile.classList.add('retired');
      } else if (rowIsActive(row)) {
        tile.classList.add('active');
      }
    });
    document.querySelectorAll('#grid .act-row').forEach(function (el) {
      var band = Number(el.dataset.band);
      var isActive = State.data.override || band === activeBandIndex();
      el.classList.toggle('locked', !isActive);
    });
  }

  function retireTile(id) {
    var tile = document.querySelector('#grid .tile[data-qid="' + CSS.escape(id) + '"]');
    if (tile) {
      tile.classList.remove('active');
      tile.classList.add('retired');
    }
  }

  // Same openability rule the tile click handler enforces: active squares
  // open, retired squares re-open (to adjust winners), locked squares do not.
  function isOpenable(id) {
    var parts = id.split(':');
    var row = Number(parts[1]);
    var known = D.columns.some(function (c) { return c.id === parts[0]; }) &&
      D.rows.some(function (r) { return r.row === row; });
    if (!known) return false;
    return Boolean(State.data.retired[id]) || rowIsActive(row);
  }

  function allRetired() {
    return D.columns.every(function (col) {
      return D.rows.every(function (r) {
        return State.data.retired[qid(col.id, r.row)];
      });
    });
  }

  return {
    build: build,
    sync: sync,
    retireTile: retireTile,
    activeBandIndex: activeBandIndex,
    rowBand: rowBand,
    allRetired: allRetired,
    isOpenable: isOpenable,
    colColor: colColor
  };
})();
