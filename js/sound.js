/* Synthesized sound effects (Web Audio), so no audio files ship and it works
   offline. Two cues, both played on the shared screen (index.html):
     - timesUp():  a short alarm when a question timer hits zero
     - fanfare():  a celebratory flourish when the winner is announced
   Browsers block audio until a user gesture, so the context is primed on the
   first interaction with the page (and again whenever a cue plays). If the
   whole session is driven remotely and the TV never receives a gesture, the
   context stays suspended and cues are silently skipped. */

window.Sound = (function () {
  'use strict';

  var ctx = null;

  function ac() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* ignore */ } }
    return ctx;
  }

  // One shaped note.
  function tone(c, freq, startT, dur, peak, type) {
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(c.destination);
    g.gain.setValueAtTime(0.0001, startT);
    g.gain.exponentialRampToValueAtTime(peak, startT + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
    osc.start(startT);
    osc.stop(startT + dur + 0.03);
  }

  function timesUp() {
    var c = ac();
    if (!c) return;
    var t = c.currentTime;
    // Three insistent square-wave beeps: clearly an alarm, not a chime.
    for (var i = 0; i < 3; i++) {
      tone(c, 784, t + i * 0.22, 0.16, 0.16, 'square');
    }
  }

  function fanfare() {
    var c = ac();
    if (!c) return;
    var t = c.currentTime;
    // Ascending major arpeggio (C E G C) plus a held top note: celebratory.
    var notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach(function (f, i) {
      tone(c, f, t + i * 0.13, 0.35, 0.18, 'triangle');
    });
    tone(c, 1046.5, t + notes.length * 0.13, 0.6, 0.16, 'triangle');
    tone(c, 1567.98, t + notes.length * 0.13, 0.6, 0.10, 'triangle'); // shimmer
  }

  // Prime the audio context on the first user gesture so later cues can play.
  function prime() { ac(); }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, prime, { passive: true });
  });

  return { timesUp: timesUp, fanfare: fanfare, prime: prime };
})();
