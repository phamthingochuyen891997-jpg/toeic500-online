/* Lấp Gốc TOEIC · Ms. Ngọc Huyền
   Đồng bộ tiến độ học viên lên Firebase (lg_progress) và nhận biết tài khoản giáo viên. */
(function () {
  var CFG = { apiKey: "AIzaSyACo9wh9u1VZdBKh3cNVfdO7L3qZ_aOIsI", authDomain: "my-english-workspace-cf8d7.firebaseapp.com", projectId: "my-english-workspace-cf8d7", storageBucket: "my-english-workspace-cf8d7.firebasestorage.app", messagingSenderId: "989721870907", appId: "1:989721870907:web:e25d3c69a8e682d399d21e" };
  var G = "https://www.gstatic.com/firebasejs/10.12.2/";
  var fbp = null;
  function fb() {
    if (fbp) return fbp;
    fbp = (async function () {
      var m = await Promise.all([import(G + "firebase-app.js"), import(G + "firebase-auth.js"), import(G + "firebase-firestore.js")]);
      var A = m[0], U = m[1], F = m[2];
      var app = A.getApps().length ? A.getApp() : A.initializeApp(CFG);
      var auth = U.getAuth(app); await auth.authStateReady();
      var u = auth.currentUser; if (!u || !u.email) throw new Error("noauth");
      return { db: F.getFirestore(app), F: F, u: u, email: u.email.toLowerCase() };
    })();
    fbp.catch(function () { fbp = null; });
    return fbp;
  }
  function summary(S) {
    var done = S.done || {}, cps = 0;
    for (var i = 0; i < 32; i++) { if ([0, 1, 2, 3].every(function (k) { return done[i + "-" + k]; })) cps++; }
    var acc = (S.acc || []).length ? (S.acc.reduce(function (a, b) { return a + b; }, 0) / S.acc.length) : null;
    var days = S.days || [], set = {}, n = 0, d = new Date();
    days.forEach(function (x) { set[x] = 1; });
    var ymd = function (t) { return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0"); };
    if (!set[ymd(d)]) d.setDate(d.getDate() - 1);
    while (set[ymd(d)]) { n++; d.setDate(d.getDate() - 1); }
    var stars = 0; Object.keys(S.best || {}).forEach(function (k) { stars += S.best[k] >= 1 ? 3 : S.best[k] >= 0.9 ? 2 : S.best[k] >= 0.6 ? 1 : 0; });
    return { stations: Object.keys(done).length, checkpoints: cps, exp: S.exp || 0, streak: n, acc: acc, wrong: Object.keys(S.wrong || {}).length, lastDay: days[days.length - 1] || "", place: S.place ? (S.place.c + "/" + S.place.t + " · " + S.place.level) : "" };
  }
  var timer = null, pending = null;
  async function flush() {
    if (!pending) return; var S = pending; pending = null;
    try { var c = await fb(); await c.F.setDoc(c.F.doc(c.db, "lg_progress", c.email), { S: S, sum: summary(S), email: c.email, name: S.name || "", updatedAt: c.F.serverTimestamp() }); } catch (e) { }
  }
  window.LG = {
    load: async function () { try { var c = await fb(); var s = await c.F.getDoc(c.F.doc(c.db, "lg_progress", c.email)); return s.exists() ? s.data() : null; } catch (e) { return null; } },
    queue: function (S) { pending = JSON.parse(JSON.stringify(S)); clearTimeout(timer); timer = setTimeout(flush, 1500); },
    teacher: async function () { try { var c = await fb(); var s = await c.F.getDoc(c.F.doc(c.db, "users", c.u.uid)); return s.exists() && s.data().role === "teacher"; } catch (e) { return false; } }
  };
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(); });
})();
