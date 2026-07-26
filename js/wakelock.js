/* Keep the shared screen awake during play. The TV often receives no input
   when the host drives everything from the phone console, so its browser or
   OS would dim and sleep. The Screen Wake Lock API asks the system to keep
   the display on while this page is visible.

   Limits worth knowing: the API needs HTTPS (GitHub Pages is fine), the lock
   is dropped automatically when the tab is hidden and re-acquired when it
   returns, and some browsers only grant it after a user gesture. Smart-TV
   built-in browsers may not support it at all; there the TV's own screen
   timeout / screensaver setting is the fallback. Everything here is a no-op
   when the API is absent, so it never breaks the game. */

(function () {
  'use strict';

  if (!('wakeLock' in navigator)) return;

  var lock = null;

  function acquire() {
    if (lock || document.visibilityState !== 'visible') return;
    navigator.wakeLock.request('screen').then(function (l) {
      lock = l;
      // The system can release it on its own (e.g. tab hidden); clear our ref.
      lock.addEventListener('release', function () { lock = null; });
    }).catch(function () {
      // Denied (needs a gesture, or unsupported context): a later gesture or
      // a visibility change will try again.
    });
  }

  // Re-acquire whenever the page becomes visible again.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') acquire();
  });

  // Try immediately (works in browsers that allow it without a gesture), and
  // again on the first interaction with the TV for those that require one.
  acquire();
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, acquire, { passive: true });
  });
})();
