/* Firebase project config for the host console sync (see README, "Host
   console"). With this left as null the game runs fully standalone: no
   network calls, no room code in the footer, host.html works in browse-only
   mode. Paste your project's config object to enable the phone console.

   Setup (about 5 minutes):
     1. console.firebase.google.com -> Add project (Analytics off is fine).
     2. Build -> Realtime Database -> Create database (locked mode).
     3. Rules tab -> publish exactly:

          { "rules": { "rooms": { "$code": { ".read": true, ".write": true } } } }

        Only the rooms branch is exposed; anyone who knows a room code can
        read and control that room. For a living-room party game that is an
        accepted trade-off: codes are short-lived and the data is game state.
     4. Project settings -> Your apps -> Web app (</>) -> register. Do not
        check "Also set up Firebase Hosting"; the site is hosted elsewhere.
     5. Copy the config object it shows into the assignment below, assigned
        to window.FIREBASE_CONFIG (the console names it "const
        firebaseConfig"; the name must be changed). Make sure it includes
        databaseURL; if it does not, add it from the Realtime Database page
        (the https://...firebasedatabase.app URL).

   These values identify the project but are not secrets; they are safe to
   commit in a public repo. Access is governed by the database rules.

   Expected alert: GitHub secret scanning flags the apiKey below as an
   exposed "Google API Key". That is a false positive for a Firebase web
   config: the key is a client identifier every visitor downloads by design,
   not a credential, and access control comes from the database rules above.
   Safe to close the alert as a false positive. Optional hardening: in
   Google Cloud console, restrict the key to Firebase APIs and to requests
   from the site's domain. Rotating it buys nothing; the replacement would
   be public the moment it ships. */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyA8J6PiM7rqpQgAYR1me0SHoX8jB80eyhI",
  authDomain: "what-was-the-reason.firebaseapp.com",
  databaseURL: "https://what-was-the-reason-default-rtdb.firebaseio.com",
  projectId: "what-was-the-reason",
  storageBucket: "what-was-the-reason.firebasestorage.app",
  messagingSenderId: "1050996551000",
  appId: "1:1050996551000:web:c097d3c2274be669cc092d",
  measurementId: "G-LELKPFSN1Y"
};
