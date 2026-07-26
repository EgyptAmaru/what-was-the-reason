/* Shared "How to play" overlay, used by both the board (index.html) and the
   host console (host.html). The rules markup lives here in one place so the
   two pages cannot drift; any element with class "rules-open" opens it (click
   delegation, so dynamically rendered triggers like the console start form
   work too). Keep the copy in sync with README's "How to play" section: the
   overlay says what, the README may also say why. */

window.Rules = (function () {
  'use strict';

  var HTML =
    '<div class="rules-overlay" id="rules-overlay">' +
    '<div class="rules-pop">' +
    '<button class="rules-close-x" type="button" id="rules-close" aria-label="Close">✕</button>' +
    '<h2>How to play</h2>' +
    '<div class="rules-body">' +
    '<p class="rules-lede">A social reasoning game. The theme is math, but every question is really about thinking clearly. The goal is to think out loud together, learn how each other reasons, and see how math lives in the everyday world.</p>' +

    '<h3>Who plays</h3>' +
    '<p><strong>Teams and host.</strong> Two teams and one host. Teams of 3 to 4 work best, but any size plays the same. The host runs the board, keeps time, and judges answers.</p>' +
    '<p><strong>Calculators.</strong> Allowed for arithmetic. Nothing else, including internet searches.</p>' +
    '<p><strong>Length.</strong> A full game is 24 questions and runs about 60 to 90 minutes, depending on pace.</p>' +

    '<h3>The board</h3>' +
    '<p><strong>Layout.</strong> Four columns, six rows. Columns are ways of reasoning; rows are difficulty, worth more points further down.</p>' +
    '<ul>' +
    '<li><strong>Estimation.</strong> Bound an unknown number by breaking it into pieces you can reason about.</li>' +
    '<li><strong>Logic / Paradox.</strong> Get past a gut answer that feels right but is wrong.</li>' +
    '<li><strong>Strategy.</strong> Reason about what another person, who is also reasoning about you, will do.</li>' +
    '<li><strong>Data Literacy.</strong> Interrogate a claim for what is misleading, hidden, or unsupported.</li>' +
    '</ul>' +
    '<p><strong>Three acts.</strong> Rows unlock two at a time: clear both rows of an act to open the next.</p>' +
    '<ul>' +
    '<li><strong>Act 1 · Rows 1–2 · Solo · 2 min.</strong> Each player answers on their own; everyone else stays quiet. Teams alternate questions.</li>' +
    '<li><strong>Act 2 · Rows 3–4 · Team discussion · 3 min.</strong> The picking team talks it out while the other team stays silent.</li>' +
    '<li><strong>Act 3 · Rows 5–6 · Simultaneous · 4 min.</strong> Both teams work the same question at once, commit an answer with reasoning, and reveal together.</li>' +
    '</ul>' +
    '<p><strong>Taking turns.</strong> Picks alternate between teams and rotate through teammates. In Act 1, whoever picks also answers. In acts 2 and 3, the team discusses and a rotating spokesperson, not necessarily the picker, delivers the final answer.</p>' +
    '<p><strong>Wrong answers.</strong> In acts 1 and 2, a miss offers the question to the other team as an optional steal; in Act 1 a volunteer from that team takes it, the team\'s choice. If both teams miss (or in act 3 both reveal a wrong answer), no one scores those points, the host reveals the answer, and the question is retired.</p>' +
    '<p><strong>Scoring.</strong> Sound reasoning can win even without finishing the math. In act 3, both teams score if both reason well; when it is close, showing the math is the tiebreaker.</p>' +

    '<h3>The host</h3>' +
    '<p><strong>Running the game.</strong> The host judges answers against each question\'s criteria and may offer hints at their discretion.</p>' +
    '<p><strong>Host console (optional).</strong> On a second device, the host can see hints, notes, and answers for the open question and control the board. It is optional; the game runs fully from the main screen. To pair, tap "Host console" and scan the code.</p>' +
    '</div></div></div>';

  function init() {
    if (!document.getElementById('rules-overlay')) {
      var wrap = document.createElement('div');
      wrap.innerHTML = HTML;
      document.body.appendChild(wrap.firstChild);
    }
    var overlay = document.getElementById('rules-overlay');

    document.addEventListener('click', function (e) {
      if (e.target.closest('.rules-open')) { overlay.classList.add('show'); return; }
      if (e.target === overlay || e.target.closest('#rules-close')) overlay.classList.remove('show');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlay.classList.remove('show');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  return {};
})();
