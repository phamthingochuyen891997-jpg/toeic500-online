/* TOEIC Online 500+ · Ms. Ngọc Huyền
   Dùng chung cho trang lộ trình và Mini Test:
   - T5.*: đọc/ghi tiến độ học viên trên Firebase (t500_progress, t500_config)
   - ?thi=1 trên trang Mini Test: chế độ thi thật (ẩn đáp án tới khi nộp, bấm giờ, lưu điểm) */
(function () {
  var CFG = { apiKey: "AIzaSyACo9wh9u1VZdBKh3cNVfdO7L3qZ_aOIsI", authDomain: "my-english-workspace-cf8d7.firebaseapp.com", projectId: "my-english-workspace-cf8d7", storageBucket: "my-english-workspace-cf8d7.firebasestorage.app", messagingSenderId: "989721870907", appId: "1:989721870907:web:e25d3c69a8e682d399d21e" };
  var G = "https://www.gstatic.com/firebasejs/10.12.2/";
  var fbp = null;
  function fb() {
    if (fbp) return fbp;
    fbp = (async function () {
      var mods = await Promise.all([import(G + "firebase-app.js"), import(G + "firebase-auth.js"), import(G + "firebase-firestore.js")]);
      var A = mods[0], U = mods[1], F = mods[2];
      var app = A.getApps().length ? A.getApp() : A.initializeApp(CFG);
      var auth = U.getAuth(app);
      await auth.authStateReady();
      var u = auth.currentUser;
      if (!u || !u.email) throw new Error("noauth");
      return { db: F.getFirestore(app), F: F, u: u, email: u.email.toLowerCase() };
    })();
    fbp.catch(function () { fbp = null; });
    return fbp;
  }
  window.T5 = {
    fb: fb,
    loadProgress: async function () { var c = await fb(); var s = await c.F.getDoc(c.F.doc(c.db, "t500_progress", c.email)); return s.exists() ? s.data() : null; },
    saveProgress: async function (patch) { var c = await fb(); patch.email = c.email; patch.updatedAt = c.F.serverTimestamp(); await c.F.setDoc(c.F.doc(c.db, "t500_progress", c.email), patch, { merge: true }); },
    config: async function () { var c = await fb(); var s = await c.F.getDoc(c.F.doc(c.db, "t500_config", "class")); return s.exists() ? s.data() : null; }
  };

  /* ---------------- Chế độ thi thật ---------------- */
  var qs = new URLSearchParams(location.search);
  if (!qs.has("thi")) return;
  var FILE = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var MINS = { r1: 25, r2: 38, r3: 38, r4: 38, "p7-full": 54 }[FILE] || ({ p5: 12, p6: 10, p7: 20 }[FILE.slice(0, 2)]) || 30;

  /* bài thi dùng bộ nhớ tạm: không lẫn với đáp án đã làm ở chế độ luyện tập */
  var mem = {}, SP = Storage.prototype, oG = SP.getItem, oS = SP.setItem, oR = SP.removeItem;
  var pass = function (k) { return /^(t500|firebase)/.test(k); };
  SP.getItem = function (k) { if (this === window.localStorage && !pass(k)) return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; return oG.call(this, k); };
  SP.setItem = function (k, v) { if (this === window.localStorage && !pass(k)) { mem[k] = String(v); return; } return oS.call(this, k, v); };
  SP.removeItem = function (k) { if (this === window.localStorage && !pass(k)) { delete mem[k]; return; } return oR.call(this, k); };

  var css = "body.t5thi .feedback,body.t5thi .exp,body.t5thi .actions,body.t5thi #score,body.t5thi #byPart,body.t5thi .switch,body.t5thi #tbar,body.t5thi .tbar,body.t5thi .ptools,body.t5thi .vi,body.t5thi .filters{display:none!important}" +
    "body.t5thi .opt.right,body.t5thi .opt.wrong,body.t5thi .opt.key{background:var(--surface,#fff)!important;border-color:var(--line,#f2cfdc)!important;outline:0!important}" +
    "body.t5thi .opt.right b,body.t5thi .opt.wrong b{background:var(--surface-2,#fff0f5)!important;color:inherit!important}" +
    "body.t5thi .opt.mine{background:#FFE3EE!important;border-color:#C41F63!important}body.t5thi .opt.mine b{background:#C41F63!important;color:#fff!important}" +
    "#t5bar{position:fixed;left:50%;transform:translateX(-50%);bottom:40px;z-index:99998;display:flex;align-items:center;gap:10px;background:#3A0F22;color:#fff;border-radius:999px;padding:8px 8px 8px 16px;font:600 14px/1.2 system-ui,sans-serif;box-shadow:0 10px 30px rgba(58,15,34,.35);white-space:nowrap}" +
    "#t5bar b{font-variant-numeric:tabular-nums;font-size:16px}#t5bar.low b{color:#FFB3CF}#t5bar button{font:700 14px system-ui,sans-serif;border:0;border-radius:999px;padding:9px 16px;background:#fff;color:#C41F63;cursor:pointer;min-height:40px}" +
    "#t5ov{position:fixed;inset:0;z-index:99999;background:rgba(58,15,34,.55);display:grid;place-items:center;padding:16px}" +
    "#t5ov .bx{width:min(440px,100%);background:#fff;color:#36141F;border-radius:20px;padding:24px;font:15px/1.55 system-ui,sans-serif;text-align:center}" +
    "#t5ov h2{font:700 22px Georgia,serif;margin:0 0 8px;color:#C41F63}#t5ov p{margin:0 0 12px;color:#85596B}#t5ov .big{font:700 44px Georgia,serif;color:#C41F63;margin:6px 0}" +
    "#t5ov button,#t5ov a.b{display:inline-block;font:700 15px system-ui,sans-serif;border:0;border-radius:999px;padding:12px 22px;background:#C41F63;color:#fff;cursor:pointer;margin:4px;text-decoration:none;min-height:44px}#t5ov .g{background:#fff;color:#C41F63;border:2px solid #C41F63}";

  var started = 0, ended = false, left = MINS * 60, timer = null, sure = false;
  function A() { try { return typeof answers === "object" && answers ? answers : {}; } catch (e) { return {}; } }
  function QS() { try { return Array.isArray(Q) ? Q : []; } catch (e) { return []; } }
  function total() { var q = QS(); return q.length || (document.querySelectorAll(".q").length) || 0; }
  function pickText(n) {
    var a = A(), q = QS().find(function (x) { return String(x.n) === String(n); });
    if (!q || a[n] === undefined) return null;
    return q.opts["ABCD".indexOf(a[n])];
  }
  function setText(el, t) { if (el.textContent !== t) el.textContent = t; }
  function mark() {
    var a = A();
    document.querySelectorAll(".opt[data-n][data-l]").forEach(function (b) { var on = a[b.dataset.n] === b.dataset.l; if (b.classList.contains("mine") !== on) b.classList.toggle("mine", on); });
    if (ended) return;
    /* câu Part 5 và chỗ trống trong đoạn văn: hiện lựa chọn của em, không hiện đáp án */
    document.querySelectorAll("[data-hlkey] .blank").forEach(function (bl) {
      var n = (bl.closest("[data-hlkey]").dataset.hlkey || "").replace(/^q/, ""); var t = pickText(n);
      if (t !== null) setText(bl, t);
    });
    document.querySelectorAll("button.gap[data-goto]").forEach(function (g) {
      var n = g.dataset.goto, t = pickText(n), sm = g.querySelector("small");
      if (t === null) return;
      var want = n + " " + t; if (g.textContent.replace(/\s+/g, " ").trim() !== want) g.innerHTML = "<small>" + n + "</small> " + String(t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
    });
  }
  function fmt(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function bar() {
    var el = document.getElementById("t5bar"); if (!el) return;
    var d = Object.keys(A()).length;
    el.querySelector("b").textContent = fmt(left);
    el.querySelector("span").textContent = "Đã làm " + d + "/" + total();
    el.classList.toggle("low", left <= 120);
  }
  function overlay(html) {
    var o = document.getElementById("t5ov"); if (!o) { o = document.createElement("div"); o.id = "t5ov"; document.body.appendChild(o); }
    o.innerHTML = '<div class="bx">' + html + "</div>"; o.style.display = "grid"; return o;
  }
  function closeOv() { var o = document.getElementById("t5ov"); if (o) o.style.display = "none"; }
  function title() { var h = document.querySelector("h1"); return (h ? h.textContent : document.title).replace(/·\s*Chữa bài.*$/i, "").trim(); }

  async function submit(auto) {
    if (ended) return;
    var a = A(), q = QS(), n = total(), d = Object.keys(a).length;
    if (!auto && d < n && !sure) { sure = true; var btn = document.querySelector("#t5bar button"); btn.textContent = "Còn " + (n - d) + " câu – bấm lần nữa để nộp"; setTimeout(function () { sure = false; if (!ended) btn.textContent = "Nộp bài"; }, 4000); return; }
    ended = true; clearInterval(timer);
    var ok = q.filter(function (x) { return a[x.n] === x.ans; }).length;
    var secs = Math.min(MINS * 60, Math.round((Date.now() - started) / 1000));
    document.body.classList.remove("t5thi");
    try { if (typeof renderAll === "function") renderAll(); } catch (e) {}
    var b = document.getElementById("t5bar"); if (b) b.remove();
    var pct = n ? Math.round(ok / n * 100) : 0;
    var o = overlay("<h2>" + (auto ? "Hết giờ – đã nộp bài" : "Đã nộp bài") + "</h2><p>" + title() + "</p><div class='big'>" + ok + "/" + n + "</div><p>Đúng " + pct + "% · làm trong " + fmt(secs) + " · bỏ trống " + (n - d) + " câu</p><p id='t5sv'>Đang lưu kết quả cho cô…</p><button id='t5rv'>Xem đáp án & giải thích</button><a class='b g' href='../index.html'>← Lộ trình</a>");
    o.querySelector("#t5rv").onclick = closeOv;
    try {
      var ex = {}; ex[FILE] = { title: title(), correct: ok, total: n, done: d, secs: secs, at: Date.now() };
      await window.T5.saveProgress({ exams: ex });
      o.querySelector("#t5sv").textContent = "Đã lưu vào hồ sơ – cô xem được kết quả này.";
    } catch (e) {
      o.querySelector("#t5sv").textContent = "Chưa lưu được lên hồ sơ. Em chụp màn hình gửi cô qua Zalo nhé.";
    }
  }
  function start() {
    if (started) return; started = Date.now(); closeOv();
    timer = setInterval(function () { left = MINS * 60 - Math.round((Date.now() - started) / 1000); bar(); if (left <= 0) submit(true); }, 1000);
    bar();
  }
  function boot() {
    if (!document.body || !document.querySelector(".opt,.q,main")) { setTimeout(boot, 150); return; }
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    document.body.classList.add("t5thi");
    var b = document.createElement("div"); b.id = "t5bar"; b.innerHTML = "⏱ <b>" + fmt(left) + "</b><span></span><button type='button'>Nộp bài</button>";
    document.body.appendChild(b); b.querySelector("button").onclick = function () { submit(false); };
    var raf = 0;
    new MutationObserver(function (ms) {
      if (ms.every(function (m) { return m.target.closest && m.target.closest("#t5bar,#t5ov"); })) return;
      if (raf) return; raf = requestAnimationFrame(function () { raf = 0; mark(); bar(); });
    }).observe(document.body, { childList: true, subtree: true });
    mark(); bar();
    var o = overlay("<h2>Chế độ thi thật</h2><p>" + title() + "</p><div class='big'>" + MINS + " phút</div><p>" + total() + " câu · mỗi câu chọn một lần. Đáp án, dịch và giải thích chỉ hiện sau khi em nộp bài. Hết giờ bài tự nộp, kết quả được lưu cho cô.</p><button id='t5go'>Bắt đầu làm bài</button><a class='b g' href='?'>Làm ở chế độ luyện tập</a>");
    o.querySelector("#t5go").onclick = start;
  }
  boot();
})();
