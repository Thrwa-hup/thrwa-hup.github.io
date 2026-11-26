/* جسر الولاء داخل لوحة التحكم الحالية (admin.html)
   - يضيف مجموعة «الولاء» في القائمة الجانبية بنفس شكل اللوحة، وأقسامها داخل #panes.
   - ما يعدّل كود اللوحة: يلف render و setTab فقط، ويحفظ أقسام الولاء بين التحديثات.
   - البيانات من خادم المنصة على Vercel + Supabase، بنفس مفتاح اللوحة (KEY من الرابط). */
(function () {
  "use strict";
  if (typeof window.render !== "function" || typeof window.setTab !== "function") return;
  var BASE = (window.LY_BASE = window.LY_BASE || "https://tharwa-platform-sage.vercel.app");
  var E = TH.esc;

  // ---------- أيقونات ناقصة في مجموعة اللوحة ----------
  var EXTRA = {
    gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 7.5 4 9 8 12 8zm0 0s1.5-5 4.5-4S15 8 12 8z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 13l2 2m3-11c3-1 6-1 6-1s0 3-1 6l-6 6-5-5z"/><circle cx="15" cy="9" r="1.5"/>',
    merge: '<path d="M6 3v6a6 6 0 0 0 6 6h6M6 21v-6M15 12l3 3-3 3"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  var baseIcon = TH.icon;
  TH.icon = function (name, cls) {
    var s = baseIcon(name, cls);
    if (EXTRA[name] && /aria-hidden="true"><\/svg>$/.test(s)) return s.replace(/<\/svg>$/, EXTRA[name] + "</svg>");
    return s;
  };
  var I = TH.icon;

  // ---------- الاتصال بالخادم الجديد ----------
  TH.api = function (fn, args) {
    return fetch(BASE + "/api", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": window.KEY || "" },
      body: JSON.stringify({ fn: fn, args: args || {} })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (o) {
        if (res.ok && o.ok) return o.data;
        var err = new Error(o.error || ("تعذر الاتصال بخادم الولاء (" + res.status + ")."));
        err.status = res.status; err.code = o.code || ""; err.current = o.current;
        throw err;
      });
    }, function () { throw new Error("تعذر الاتصال بخادم الولاء. تأكد من الإنترنت وحاول مرة أخرى."); });
  };

  // ---------- أقسام الولاء ----------
  var SUBS = [
    ["today", "gift", "المطلوب اليوم"],
    ["students", "users", "الطلاب"],
    ["launch", "rocket", "الإطلاق"],
    ["interest", "list", "قائمة الاهتمام"],
    ["add", "user", "إضافة طالب"],
    ["guide", "star", "دليل الكوبونات"],
    ["settings", "gear", "إعدادات الولاء"]
  ];
  var COUNTS = {};
  SUBS.forEach(function (x) { window.TAB_NAMES["ly-" + x[0]] = x[0] === "today" ? "الولاء — المطلوب اليوم" : "الولاء — " + x[2]; });

  // واجهة ADM اللي يحتاجها قسم الولاء، بعناصر اللوحة نفسها
  var ADM = (window.ADM = { mods: {}, sec: "", tab: { ly: "today" } });
  ADM.setTab = function (t) { window.setTab("ly-" + t); };
  ADM.tabs = function (list) {
    COUNTS = {};
    (list || []).forEach(function (x) { COUNTS[x[0]] = x[3] || 0; });
    paintCounts();
  };
  ADM.stats = function (tiles) {
    var html = (tiles || []).map(function (t, i) {
      return '<div class="stat ' + E(t.cls || "") + '" data-st="' + i + '"><b>' + E(t.n) + "</b><span>" + E(t.label) + "</span></div>";
    }).join("");
    document.querySelectorAll(".ly-stats").forEach(function (box) {
      box.innerHTML = html;
      box.querySelectorAll("[data-st]").forEach(function (el) { el.onclick = function () { var t = tiles[+el.dataset.st]; if (t && t.go) t.go(); }; });
    });
  };
  ADM.busy = function (btn, on) { window.busy(btn, on); };
  ADM.call = function (btn, fn, args) {
    ADM.busy(btn, true);
    return TH.api(fn, args).then(function (r) { ADM.busy(btn, false); return r; }, function (e) { ADM.busy(btn, false); TH.toast(e.message, true); throw e; });
  };
  ADM.confirm = function (msg, okLabel) {
    return new Promise(function (res) {
      var m = document.createElement("div");
      m.className = "modal";
      m.innerHTML = '<div class="mbox" style="max-width:420px"><p style="margin:0 0 16px;font-size:15px">' + E(msg) + "</p>" +
        '<div class="actions" style="margin:0"><button class="btn primary" data-ok>' + E(okLabel || "تأكيد") + '</button><button class="btn ghost" data-no>إلغاء</button></div></div>';
      document.body.appendChild(m);
      m.onclick = function (e) {
        var ok = e.target.closest("[data-ok]"), no = e.target.closest("[data-no]");
        if (ok || no || e.target === m) { m.remove(); res(!!ok); }
      };
    });
  };
  ADM.login = function (msg) { TH.toast(msg || "مفتاح اللوحة غير صحيح.", true); };

  // عناصر يكتب فيها قسم الولاء (النافذة الجانبية للطالب)
  function ensureRoots() {
    [["runBox", "hidden"], ["drawerRoot", "ly-scope"], ["modalRoot", "ly-scope"]].forEach(function (x) {
      if (!document.getElementById(x[0])) { var d = document.createElement("div"); d.id = x[0]; d.className = x[1]; document.body.appendChild(d); }
    });
  }

  // ---------- القائمة الجانبية ----------
  function navHtml() {
    return '<div class="sgrp" data-ly="1">الولاء</div>' + SUBS.map(function (x) {
      var c = COUNTS[x[0]];
      return '<button data-t="ly-' + x[0] + '" data-ly="1" class="' + (window.TAB === "ly-" + x[0] ? "on" : "") + '">' + I(x[1]) + "<span>" + E(x[2]) + "</span>" +
        (c ? '<span class="cnt">' + c + "</span>" : "") + "</button>";
    }).join("");
  }
  function injectNav() {
    var tabs = document.getElementById("tabs");
    if (!tabs || tabs.querySelector("[data-ly]")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = navHtml();
    var anchor = tabs.querySelector('button[data-t="settings"]');
    // «الروابط والإعدادات» آخر زر في القائمة: نحط الولاء قبله
    while (wrap.firstChild) tabs.insertBefore(wrap.firstChild, anchor || null);
    tabs.querySelectorAll("[data-ly]").forEach(function (b) {
      if (b.tagName === "BUTTON") b.onclick = function () { window.setTab(b.dataset.t); window.sideOpen(false); };
    });
  }
  function paintCounts() {
    document.querySelectorAll('#tabs button[data-ly]').forEach(function (b) {
      var id = b.dataset.t.slice(3), c = COUNTS[id], el = b.querySelector(".cnt");
      if (c && !el) { el = document.createElement("span"); el.className = "cnt"; b.appendChild(el); }
      if (el) { if (c) el.textContent = c; else el.remove(); }
    });
  }

  // ---------- الأقسام (تنحفظ بين تحديثات اللوحة عشان ما يضيع شي تكتبه) ----------
  var kept = null;
  function panesHtml() {
    return SUBS.map(function (x) {
      return '<section class="pane ly-pane ly-scope" id="p-ly-' + x[0] + '"><div class="stats ly-stats"></div><div id="p-lyc-' + x[0] + '"></div></section>';
    }).join("");
  }
  function injectPanes() {
    var panes = document.getElementById("panes");
    if (!panes) return;
    if (kept && kept.length) kept.forEach(function (p) { panes.appendChild(p); });
    else if (!panes.querySelector(".ly-pane")) panes.insertAdjacentHTML("beforeend", panesHtml());
    kept = null;
  }

  // ---------- لف دوال اللوحة ----------
  var origRender = window.render, origSetTab = window.setTab, entered = false;
  window.render = function () {
    kept = Array.prototype.slice.call(document.querySelectorAll("#panes > .ly-pane"));
    kept.forEach(function (p) { p.remove(); });
    try { return origRender.apply(this, arguments); }
    finally {
      try {
        injectNav(); injectPanes(); paintCounts();
        if (/^ly-/.test(window.TAB)) document.querySelectorAll(".pane").forEach(function (p) { p.classList.toggle("on", p.id === "p-" + window.TAB); });
      } catch (e) { console.error("ly-bridge", e); }
    }
  };
  window.setTab = function (t) {
    var out = origSetTab.apply(this, arguments);
    try {
      var isLy = /^ly-/.test(t);
      ADM.sec = isLy ? "ly" : "";
      if (isLy && ADM.mods.ly && document.getElementById("p-lyc-" + t.slice(3))) {
        ADM.tab.ly = t.slice(3);
        ensureRoots();
        if (!entered) { entered = true; ADM.mods.ly.enter(); } else ADM.mods.ly.render();
      }
    } catch (e) { console.error("ly-bridge", e); }
    return out;
  };

  // إذا اللوحة رسمت قبل ما يوصل الجسر
  try { if (document.getElementById("tabs") && document.getElementById("tabs").children.length) { injectNav(); injectPanes(); } }
  catch (e) { console.error("ly-bridge", e); }
})();
