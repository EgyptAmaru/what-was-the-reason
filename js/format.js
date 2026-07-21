/* Per-question text presentation: paragraph breaks and bullet structure for
   long prompts and answers. Like charts.js, this is a presentation layer keyed
   by question slot; the words themselves stay in content/ untouched. Each rule
   degrades gracefully: if the content text changes and a marker is not found,
   the default single-block rendering is used. */

window.Format = (function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function rich(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  // Splits text into paragraphs at each marker (marker starts its paragraph).
  // Returns null if any marker is missing.
  function paragraphs(text, markers) {
    var cuts = [0];
    for (var i = 0; i < markers.length; i++) {
      var at = text.indexOf(markers[i]);
      if (at === -1) return null;
      cuts.push(at);
    }
    cuts.push(text.length);
    var out = '';
    for (var j = 0; j + 1 < cuts.length; j++) {
      var part = text.slice(cuts[j], cuts[j + 1]).trim();
      if (part) out += '<p>' + rich(part) + '</p>';
    }
    return out;
  }

  var questionRules = {
    // Intro, the three rounds as bullets, then the ask.
    'strategy:5': function (t) {
      var i1 = t.indexOf('Round 1:');
      var i2 = t.indexOf('Round 2:');
      var i3 = t.indexOf('Round 3:');
      var iOut = t.indexOf('Both want as much money');
      if (i1 === -1 || i2 === -1 || i3 === -1 || iOut === -1) return null;
      var bullet = function (label, body) {
        return '<li><strong>' + label + '</strong> ' + rich(body.trim()) + '</li>';
      };
      return '<p>' + rich(t.slice(0, i1).trim()) + '</p><ul>' +
        bullet('Round 1:', t.slice(i1 + 8, i2)) +
        bullet('Round 2:', t.slice(i2 + 8, i3)) +
        bullet('Round 3:', t.slice(i3 + 8, iOut)) +
        '</ul><p>' + rich(t.slice(iOut).trim()) + '</p>';
    },
    // Setup, then the deal as a numbered list, then the ask.
    'strategy:4': function (t) {
      var i1 = t.indexOf('If you stay silent');
      var i2 = t.indexOf('If you betray the other');
      var i3 = t.indexOf('If you both betray');
      var iOut = t.indexOf("They can't communicate");
      if (i1 === -1 || i2 === -1 || i3 === -1 || iOut === -1) return null;
      return '<p>' + rich(t.slice(0, i1).trim()) + '</p><ol>' +
        '<li>' + rich(t.slice(i1, i2).trim()) + '</li>' +
        '<li>' + rich(t.slice(i2, i3).trim()) + '</li>' +
        '<li>' + rich(t.slice(i3, iOut).trim()) + '</li>' +
        '</ol><p>' + rich(t.slice(iOut).trim()) + '</p>';
    },
    'strategy:3': function (t) {
      return paragraphs(t, ['There are exactly 3 scoops']);
    },
    'data-literacy:2': function (t) {
      return paragraphs(t, ['The Castro manager']);
    },
    'data-literacy:5': function (t) {
      return paragraphs(t, [
        "The city's then-mayor, Michael Bloomberg,",
        'The stops were high and crime was low.'
      ]);
    },
    'data-literacy:6': function (t) {
      return paragraphs(t, [
        'To find out, he tests 20 different songs, one at a time.',
        '19 of the songs show nothing.',
        'His calculations are all correct.'
      ]);
    }
  };

  var answerRules = {
    // Headline, "Reasoned backward:", then the three rounds as labeled bullets.
    'strategy:5': function (t) {
      var iRB = t.indexOf('Reasoned backward:');
      var iR3 = t.indexOf('Round 3 ($20,000');
      var iR2 = t.indexOf('Round 2 ($60,000');
      var iR1 = t.indexOf('Round 1 ($100,000');
      if (iRB === -1 || iR3 === -1 || iR2 === -1 || iR1 === -1) return null;
      var bullet = function (label, body) {
        return '<li><strong>' + label + '</strong>' + rich(body) + '</li>';
      };
      return '<span class="big-a">' + rich(t.slice(0, iRB).trim()) + '</span>' +
        '<p>Reasoned backward:</p><ul>' +
        bullet('Round 3', t.slice(iR3 + 7, iR2).replace(/\s+$/, '')) +
        bullet('Round 2', t.slice(iR2 + 7, iR1).replace(/\s+$/, '')) +
        bullet('Round 1', t.slice(iR1 + 7).replace(/\s+$/, '')) +
        '</ul>';
    },
    // Headline, the combined rates as labeled bullets, then the diagnosis.
    'logic-paradox:5': function (t) {
      var iMen = t.indexOf('Men: 512');
      var iWomen = t.indexOf('Women: 89');
      var iRest = t.indexOf('Department A admits');
      if (iMen === -1 || iWomen === -1 || iRest === -1) return null;
      return '<span class="big-a">Men, about 45% compared to 25% for women.</span><ul>' +
        '<li><strong>Men:</strong> ' + rich(t.slice(iMen + 5, iWomen).trim()) + '</li>' +
        '<li><strong>Women:</strong> ' + rich(t.slice(iWomen + 6, iRest).trim()) + '</li>' +
        '</ul><p>' + rich(t.slice(iRest).trim()) + '</p>';
    },
    // Headline, the three head-to-heads as bullets (winner bolded), then the
    // loop diagnosis and its kicker as separate paragraphs.
    'logic-paradox:6': function (t) {
      var iR = t.indexOf('Republican beats Democrat');
      var iD = t.indexOf('Democrat beats Democratic Socialist');
      var iDS = t.indexOf('Democratic Socialist beats Republican');
      var iRest = t.indexOf('The majority prefers');
      var iKick = t.indexOf('Every one of those');
      if (iR === -1 || iD === -1 || iDS === -1 || iRest === -1) return null;
      var bullet = function (winner, body) {
        return '<li><strong>' + winner + '</strong>' + rich(body) + '</li>';
      };
      var restEnd = iKick === -1 ? t.length : iKick;
      var out = '<span class="big-a">There is no winner.</span><ul>' +
        bullet('Republican', t.slice(iR + 10, iD).replace(/\s+$/, '')) +
        bullet('Democrat', t.slice(iD + 8, iDS).replace(/\s+$/, '')) +
        bullet('Democratic Socialist', t.slice(iDS + 20, iRest).replace(/\s+$/, '')) +
        '</ul><p>' + rich(t.slice(iRest, restEnd).trim()) + '</p>';
      if (iKick !== -1) out += '<p>' + rich(t.slice(iKick).trim()) + '</p>';
      return out;
    },
    // Headline "0 or ~22", then the two lines of reasoning as labeled bullets.
    'strategy:6': function (t) {
      var iPure = t.indexOf('Pure Logic:');
      var iReal = t.indexOf('Layered Realism:');
      if (iPure === -1 || iReal === -1) return null;
      var pure = t.slice(iPure + 11, iReal).replace(/~22\s*\|\s*$/, '').trim();
      var real = t.slice(iReal + 16).trim();
      return '<span class="big-a">0 or ~22.</span><ul>' +
        '<li><strong>Pure Logic:</strong> ' + rich(pure) + '</li>' +
        '<li><strong>Layered Realism:</strong> ' + rich(real) + '</li>' +
        '</ul>';
    },
    // Headline, then the two missing pieces as labeled bullets.
    'data-literacy:3': function (t) {
      var iDen = t.indexOf('No denominator.');
      var iOpp = t.indexOf('No opposing count.');
      if (iDen === -1 || iOpp === -1) return null;
      return '<span class="big-a">The label is meaningless without context that is missing.</span><ul>' +
        '<li><strong>No denominator.</strong> ' + rich(t.slice(iDen + 15, iOpp).trim()) + '</li>' +
        '<li><strong>No opposing count.</strong> ' + rich(t.slice(iOpp + 18).trim()) + '</li>' +
        '</ul>';
    },
    // Headline, a bridging line, then the two tests as labeled bullets.
    'data-literacy:5': function (t) {
      var head = 'Two things moving together does not establish that one caused the other.';
      var iHead = t.indexOf(head);
      var iComp = t.indexOf('A comparison group.');
      var iRem = t.indexOf('A removal test.');
      if (iHead === -1 || iComp === -1 || iRem === -1) return null;
      var bridge = t.slice(iHead + head.length, iComp).trim();
      return '<span class="big-a">' + rich(head) + '</span>' +
        '<p>' + rich(bridge) + '</p><ul>' +
        '<li><strong>A comparison group.</strong> ' + rich(t.slice(iComp + 19, iRem).trim()) + '</li>' +
        '<li><strong>A removal test.</strong> ' + rich(t.slice(iRem + 15).trim()) + '</li>' +
        '</ul>';
    }
  };

  return {
    question: function (qid, text) {
      return questionRules[qid] ? questionRules[qid](text) : null;
    },
    answer: function (qid, text) {
      return answerRules[qid] ? answerRules[qid](text) : null;
    }
  };
})();
