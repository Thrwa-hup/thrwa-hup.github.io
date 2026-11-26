/* نسخة لوحتك الحالية (thrwa-hup.github.io/admin.html): نفس منطق /assets/admin-ly.js، والأقسام داخل #p-lyc-<القسم>، وروابط الأهالي من LY_BASE. */
/* قسم الولاء في اللوحة: التقدير أولًا، الخصم لفئات محددة، كوبون أسرة ثروة، المطابقة بالجوال ثم الاسم، وإطلاق البرامج الجديدة */
(function () {
  "use strict";
  var E = TH.esc, I = TH.icon;
  var M = ADM.mods.ly = {};
  var S = LY.mergeSettings(null), FAMS = [], INTEREST = [], demoFams = [], loaded = false;
  var open = null, issuedNow = {}, stLimit = 150, chains = {}, prefillInterest = null, CTX = { founders: {} };

  // ---------- أمثلة (لين تضيف طلابك) ----------
  var DEMO = [
    ["أبو سعد (مثال)", "0550000001", "سعد", "m", "تواق", ["1447-ف2|رحلة 3", "1448-ف1|رحلة 1", "1448-ف1|رحلة 2"], ""],
    ["أبو سعد (مثال)", "0550000001", "فهد", "m", "بسام", ["1448-ف1|لقاء 1"], "6"],
    ["أبو يوسف (مثال)", "0550000005", "يوسف", "m", "ترحال", ["1447-ف2|كشتة", "1447-ف2|أبها", "1448-ف1|بينتبول", "1448-ف1|المجمعة", "1448-ف1|شقراء"], "11"],
    ["أم ريم (مثال)", "0550000002", "ريم", "f", "مناهل", ["1448-ف1|لقاء 1", "1448-ف1|لقاء 2"], ""],
    ["أبو خالد (مثال)", "0550000003", "خالد", "m", "تواق", ["1448-ف1|رحلة 1"], ""],
    ["أبو ناصر (مثال)", "0550000004", "ناصر", "m", "ترحال", ["1447-ف2|كشتة"], "11"]
  ];
  function rebuildDemo() {
    var L = [], taken = {};
    DEMO.forEach(function (d) {
      d[5].forEach(function (tc) {
        var p = tc.split("|"), r = LY.applyRegistration(L, { parentName: d[0], phone: d[1], childName: d[2], gender: d[3], program: d[4], term: p[0], cycle: p[1], grade: d[6] }, S, taken);
        if (r.fam) { L = L.filter(function (f) { return f.id !== r.fam.id; }); L.push(r.fam); }
      });
    });
    var saad = L.filter(function (f) { return f.phone === "966550000001"; })[0];
    if (saad) saad.refs = [{ id: "d1", famId: "x1", famName: "أبو بدر", childName: "بدر", term: S.currentTerm, date: LY.today() }];
    var kh = L.filter(function (f) { return f.phone === "966550000003"; })[0];
    if (kh) kh.flags = { wa: true };
    demoFams = L;
  }
  var isDemo = function () { return loaded && FAMS.length === 0; };
  function list() { return isDemo() ? demoFams : FAMS.map(function (x) { return x.fam; }); }
  function famById(id) { return list().filter(function (f) { return f.id === id; })[0]; }
  function taken() { return LY.takenCodes(list()); }

  // ---------- التحميل والحفظ ----------
  function load() {
    return TH.api("lyData").then(function (d) {
      S = LY.mergeSettings(d.settings);
      FAMS = d.families; INTEREST = d.interest || []; loaded = true;
      rebuildDemo(); M.render();
    }).catch(function (e) {
      if (e.status === 401) return ADM.login("المفتاح غير صحيح.");
      (pane(ADM.tab.ly) || document.createElement("div")).innerHTML = '<div class="note bad">' + I("alert") + "<div>تعذر تحميل بيانات الولاء: " + E(e.message) + "</div></div>";
    });
  }
  M.enter = function () { load(); };
  function entryOf(id) { return FAMS.filter(function (x) { return x.fam.id === id; })[0]; }
  function saveFam(f) {
    var en = entryOf(f.id);
    if (en) en.fam = f; else { en = { fam: f, updated: null }; FAMS.push(en); }
    refresh();
    var p = (chains[f.id] || Promise.resolve()).then(function () {
      return TH.api("lySaveFamily", { fam: en.fam, base: en.updated }).then(function (r) { en.updated = r.updated; return true; }, function (e) {
        if (e.code === "conflict" && e.current) { en.fam = e.current.fam; en.updated = e.current.updated; refresh(); }
        TH.toast(e.message, true); return false;
      });
    });
    chains[f.id] = p;
    return p;
  }
  function saveMany(fams, removeIds) {
    fams.forEach(function (f) { var en = entryOf(f.id); if (en) en.fam = f; else FAMS.push({ fam: f, updated: null }); });
    FAMS = FAMS.filter(function (x) { return (removeIds || []).indexOf(x.fam.id) < 0; });
    refresh();
    return TH.api("lySaveFamilies", { fams: fams, removeIds: removeIds || [] }).then(function (rows) {
      rows.forEach(function (r) { var en = entryOf(r.fam.id); if (en) en.updated = r.updated; }); return true;
    }, function (e) { TH.toast(e.message, true); return false; });
  }
  function saveSettings() {
    rebuildDemo(); refresh(true);
    return TH.api("lySaveSettings", { settings: S }).then(function () { TH.toast("انحفظت الإعدادات"); }, function (e) { TH.toast(e.message, true); });
  }
  function guardDemo() { if (isDemo()) { TH.toast("هذا مثال. أضف طلابك من «إضافة طالب» والأمثلة تختفي"); return true; } return false; }

  // ---------- أدوات العرض ----------
  function msPill(m) { return m ? '<span class="lvl l' + Math.min(4, 1 + Math.floor(S.milestones.indexOf(m) / 1.5)) + '" title="' + E(m.n + " مشاركات: " + (m.items || []).join(" · ")) + '">' + E(m.name) + "</span>" : '<span class="lvl l0">بدون مشاركة</span>'; }
  function waBtn(phone, msg, label) { return '<a class="btn sm wa" href="' + E(LY.waLink(phone, msg)) + '" target="_blank" rel="noopener">' + I("chat") + E(label || "واتساب") + "</a>"; }
  function discLabel(t) { return (LY.DISCOUNT_TYPES[t] && LY.DISCOUNT_TYPES[t].label) || LY.OLD_LABELS[t] || t; }
  function discValue(w) { return w.type === "free" ? "مجانًا" : (w.value || 0) + "%"; }
  function gradeName(g) { return ["", "أول ابتدائي", "ثاني ابتدائي", "ثالث ابتدائي", "رابع ابتدائي", "خامس ابتدائي", "سادس ابتدائي", "أول متوسط", "ثاني متوسط", "ثالث متوسط", "أول ثانوي", "ثاني ثانوي", "ثالث ثانوي"][g] || ""; }
  function partsTxt(n) { return n === 1 ? "مشاركة وحدة" : n === 2 ? "مشاركتين" : n <= 10 ? n + " مشاركات" : n + " مشاركة"; }
  function giftsTxt(n) { return n === 1 ? "هدية وحدة" : n === 2 ? "هديتين" : n <= 10 ? n + " هدايا" : n + " هدية"; }
  function options(arr, sel) { return arr.map(function (v) { var val = typeof v === "string" ? v : v.v, lab = typeof v === "string" ? v : v.l; return '<option value="' + E(val) + '"' + (String(val) === String(sel) ? " selected" : "") + ">" + E(lab) + "</option>"; }).join(""); }
  function gradeOptions(sel) { var h = '<option value="">—</option>'; for (var i = 1; i <= 12; i++) h += '<option value="' + i + '"' + (String(sel) === String(i) ? " selected" : "") + ">" + gradeName(i) + "</option>"; return h; }
  function pane(id) { return document.getElementById("p-lyc-" + id); }
  function allInfo() { CTX = LY.makeCtx ? LY.makeCtx(list(), S) : { founders: LY.foundersMap(list(), S) }; return list().map(function (f) { return { f: f, i: LY.familyInfo(f, S, CTX) }; }); }
  function students(A) { var out = []; A.forEach(function (x) { x.i.students.forEach(function (s) { out.push({ f: x.f, fi: x.i, s: s }); }); }); return out; }
  var newPrograms = function () { return S.programs.filter(function (p) { return p.status === "جديد"; }); };

  // ---------- الرسم ----------
  var TABS = function (c) {
    return [["today", "gift", "المطلوب اليوم", c.today], ["students", "users", "الطلاب", c.matches ? c.matches : 0], ["launch", "rocket", "الإطلاق"], ["interest", "list", "قائمة الاهتمام", c.interest],
      ["add", "user", "إضافة طالب"], ["guide", "star", "دليل الكوبونات"], ["settings", "gear", "الإعدادات"]];
  };
  var DATA = null;
  function compute() {
    var A = allInfo(), ST = students(A);
    DATA = {
      A: A, ST: ST,
      gifts: ST.filter(function (x) { return x.s.due.length; }),
      approvals: A.filter(function (x) { return x.i.pending && x.i.pending.approval; }),
      discs: A.filter(function (x) { return x.i.pending && !x.i.pending.approval; }),
      osra: A.filter(function (x) { return x.i.osra.change; }),
      reach: A.filter(function (x) { return x.i.reach.length; }),
      matches: isDemo() ? [] : LY.matchSuggestions(list()),
      newInterest: INTEREST.filter(function (x) { return x.status === "جديد"; }).length
    };
    DATA.todayCount = DATA.gifts.length + DATA.approvals.length + DATA.discs.length + DATA.osra.length + DATA.reach.length;
    return DATA;
  }
  M.render = function () {
    if (ADM.sec !== "ly" || !loaded) return;
    document.getElementById("runBox").innerHTML = '<div class="muted">الفصل الحالي: ' + E(S.currentTerm) + "<br>المرحلة بعدد المشاركات، والخصم لفئات محددة</div>";
    compute();
    ADM.tabs(TABS({ today: DATA.todayCount, matches: DATA.matches.length, interest: DATA.newInterest }));
    drawStats();
    renderPane(ADM.tab.ly);
  };
  function refresh(all) {
    if (ADM.sec !== "ly" || !loaded) return;
    compute();
    ADM.tabs(TABS({ today: DATA.todayCount, matches: DATA.matches.length, interest: DATA.newInterest }), true);
    drawStats();
    var t = ADM.tab.ly;
    var ae = document.activeElement, inPane = ae && pane(t) && pane(t).contains(ae) && /input|textarea|select/i.test(ae.tagName);
    if (all || !inPane || t === "today") renderPane(t);
    if (open) renderDrawer();
  }
  M.onTab = function (t) { if (loaded) renderPane(t); };
  function drawStats() {
    var loyal = DATA.ST.filter(function (x) { return x.s.parts >= 3; }).length, due = DATA.gifts.reduce(function (n, x) { return n + x.s.due.length; }, 0);
    var tiles = [{ n: DATA.ST.length, label: "طالب في البرنامج", go: function () { ADM.setTab("students"); } }, { n: loyal, label: "مستمر (3 مشاركات فأكثر)", cls: "tq", go: function () { ADM.setTab("students"); } },
      { n: due, label: "هدية تقدير مستحقة", cls: due ? "or" : "", go: function () { ADM.setTab("today"); } },
      { n: DATA.approvals.length + DATA.discs.length + DATA.osra.length, label: "خصم أو كوبون ينتظرك", cls: DATA.approvals.length ? "or" : "", go: function () { ADM.setTab("today"); } }];
    newPrograms().forEach(function (p) { var f = CTX.founders[p.name] || []; tiles.push({ n: f.length + "/" + S.foundersCap, label: "مؤسسو " + p.name, cls: "ok", go: function () { ADM.setTab("launch"); } }); });
    tiles.push({ n: INTEREST.length, label: "في قائمة الاهتمام", go: function () { ADM.setTab("interest"); } });
    ADM.stats(tiles);
  }
  function statusBar() {
    return isDemo() ? '<div class="status-bar"><span class="grow"><b>هذي أمثلة توضيحية وما انحفظت.</b> أضف أول طالب، أو الصق جدول التسجيلات، والأمثلة تختفي.</span><button class="btn sm primary" data-go="add">إضافة طالب</button></div>' : "";
  }
  function renderPane(t) {
    var el = pane(t); if (!el) return;
    if (t === "today") renderToday(el);
    if (t === "students") renderStudents(el);
    if (t === "launch") renderLaunch(el);
    if (t === "interest") renderInterest(el);
    if (t === "add") renderAdd(el);
    if (t === "settings") renderSettings(el);
    if (t === "guide") renderGuide(el);
    el.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { ADM.setTab(b.dataset.go); }; });
  }

  // ---------- المطلوب اليوم ----------
  function giftRow(x) {
    var s = x.s, f = x.f, top = s.reached;
    return '<div class="gift-row"><div class="gh"><span><b>' + E(s.child.name) + "</b> · " + E(f.name || "") + " · " + partsTxt(s.parts) + " " + msPill(top) + s.founder.map(function (fd) { return ' <span class="lvl fd">مؤسس ' + E(fd.program) + " #" + fd.n + "</span>"; }).join("") + "</span>" +
      '<span class="actions" style="margin:0">' + (top ? waBtn(f.phone, LY.milestoneMessage(f, s, top, S), "بشّر أهله") : "") + (s.founder[0] ? waBtn(f.phone, LY.founderMessage(f, s.child, s.founder[0], S), "بشارة المؤسس") : "") +
      '<button class="btn sm" data-act="giveall" data-f="' + E(f.id) + '" data-c="' + E(s.child.id) + '">' + I("check") + 'تم تسليم الكل</button><button class="btn sm ghost" data-act="open" data-f="' + E(f.id) + '" data-c="' + E(s.child.id) + '">فتح</button></span></div>' +
      '<div class="gchips">' + s.due.map(function (d) {
        var cls = d.founder ? " fnd" : d.text.indexOf("للأهل") === 0 ? " par" : "";
        return '<button class="gchip' + cls + '" title="أشّر إنها تسلّمت" data-act="give" data-f="' + E(f.id) + '" data-c="' + E(s.child.id) + '" data-k="' + E(d.key) + '">' + E(d.text) + "</button>";
      }).join("") + "</div></div>";
  }
  function discRow(x, approval) {
    var f = x.f, p = x.i.pending;
    return '<div class="pend"><div><div class="lbl">' + E(discLabel(p.type)) + " · " + E(discValue(p)) + '</div><div class="why">' + E((f.name || "") + " — " + p.why) + "</div></div>" +
      (approval ? '<span class="actions" style="margin:0"><button class="btn sm ghost" data-act="reject" data-f="' + E(f.id) + '">ما يحتاج</button><button class="btn sm primary" data-act="issue" data-f="' + E(f.id) + '">اعتماد وإصدار</button></span>'
        : '<button class="btn sm primary" data-act="issue" data-f="' + E(f.id) + '">إصدار</button>') + "</div>";
  }
  function issuedRow(f, rec) {
    var msg = LY.discountMessage(f, rec, S);
    return '<div class="pend"><div><div class="lbl">' + E(discLabel(rec.type)) + " · " + E(discValue(rec)) + ' <span class="code">' + E(rec.code) + '</span></div><div class="why">' + E(f.name || "") + " — صدر الكود. أرسله، وأضفه كقسيمة في المتجر.</div></div>" +
      '<span class="actions" style="margin:0">' + waBtn(f.phone, msg, "إرسال") + '<button class="btn sm ghost" data-copy="' + E(msg) + '">' + I("copy") + "نسخ</button></span></div>";
  }
  function osraRow(x) {
    var f = x.f, o = x.i.osra;
    var what = !o.code ? "كود جديد " + o.value + "% (أبناء في " + o.count + " برامج: " + o.programs.join("، ") + ")" : o.value ? "تغيّرت القيمة من " + o.applied + "% إلى " + o.value + "% (" + o.count + " برامج)" : "ما عاد لهم أبناء في برنامجين هذا الفصل: أوقف الكود في المتجر";
    return '<div class="pend"><div><div class="lbl">كوبون أسرة ثروة' + (o.code ? ' <span class="code">' + E(o.code) + "</span>" : "") + '</div><div class="why">' + E((f.name || "") + " — " + what) + "</div></div>" +
      '<span class="actions" style="margin:0">' + (o.value ? waBtn(f.phone, LY.osraMessage(LY.applyOsra(f, S, {}), S), "رسالة الأهل") : "") +
      '<button class="btn sm primary" data-act="osra" data-f="' + E(f.id) + '">' + (o.code ? "حدّثته في المتجر" : "إصدار الكود") + "</button></span></div>";
  }
  function renderToday(el) {
    var d = DATA, issued = Object.keys(issuedNow).map(function (id) { var f = famById(id); return f ? issuedRow(f, issuedNow[id]) : ""; }).join("");
    el.innerHTML = statusBar() +
      '<div class="block"><h3><span class="dot"></span>هدايا تقدير مستحقة</h3><p class="hint">طلاب وصلوا مرحلة جديدة، ومؤسسو البرامج الجديدة. جهّز الهدايا، واضغط الهدية اللي تسلّمت أو «تم تسليم الكل»، وبشّر أهله.</p>' +
      (d.gifts.length ? d.gifts.slice(0, 80).map(giftRow).join("") : '<div class="empty">ما فيه هدايا مستحقة الحين.</div>') + "</div>" +
      '<div class="block"><h3><span class="dot o"></span>تنتظر اعتمادك</h3><p class="hint">أسر ظهرت حاجتها. «اعتماد وإصدار» يطلّع كود «هدية منّا»، أو «ما يحتاج».</p>' + (d.approvals.length ? d.approvals.map(function (x) { return discRow(x, true); }).join("") : '<div class="empty">ما فيه طلبات تنتظر اعتمادك.</div>') + "</div>" +
      '<div class="block"><h3><span class="dot n"></span>خصومات مستحقة</h3><p class="hint">بند الرفقة (للي يجيب أقاربه وأصحابه) وبند الإخوان (أكثر من ابن في نفس البرنامج).</p>' + issued + (d.discs.length ? d.discs.map(function (x) { return discRow(x, false); }).join("") : issued ? "" : '<div class="empty">ما فيه خصومات مستحقة.</div>') + "</div>" +
      '<div class="block"><h3><span class="dot p"></span>كوبون «أسرة ثروة»</h3><p class="hint">كود ثابت لكل أسرة عندها أبناء في برامج مختلفة. قيمته ' + S.osra2 + "% لبرنامجين، و" + S.osra3 + "% لثلاثة، و" + S.osra4 + "% لأربعة فأكثر. لما تتغير القيمة، حدّث القسيمة في المتجر ثم اضغط «حدّثته».</p>" +
      (d.osra.length ? d.osra.map(osraRow).join("") : '<div class="empty">ما فيه كوبونات تحتاج تحديث.</div>') + "</div>" +
      '<div class="block"><h3><span class="dot g"></span>تواصل بدون خصم</h3><p class="hint">منقطعون (شاركوا الفصل الماضي أو الصيفي، وفاتهم برنامج هذا الفصل)، أو في آخر سنة من مرحلتهم، أو أهلهم ذكروا أبناء غير مسجلين.</p>' + (d.reach.length ? d.reach.map(function (x) {
        return x.i.reach.map(function (r) { return '<div class="pend"><div><div class="lbl">' + E(x.f.name || "") + '</div><div class="why">' + E(r.t) + '</div></div><span class="actions" style="margin:0">' + waBtn(x.f.phone, LY.reachMessage(x.f, r, S), "رسالة") + '<button class="btn sm ghost" data-act="reached" data-f="' + E(x.f.id) + '" data-k="' + E(r.key) + '">تم</button></span></div>'; }).join("");
      }).join("") : '<div class="empty">ما فيه أسر تحتاج تواصل.</div>') + "</div>";
    bindActs(el);
  }

  // ---------- الطلاب ----------
  function renderStudents(el) {
    var m = DATA.matches;
    el.innerHTML = statusBar() + (m.length ? '<div class="block"><h3><span class="dot o"></span>إخوة مسجلين في أسرتين (' + m.length + ')</h3><p class="hint">نفس اسم الأب والعائلة، ومعه دليل ثاني أكيد: جوال مشترك، أو نفس طلب التسجيل، أو اسم ولي الأمر، أو اسم الجد. الدمج يجمعهم تحت أسرة وحدة بالجوالين.</p>' + m.slice(0, 20).map(function (x, i) {
      var side = function (f) { return "<div><b>" + E(f.name || "—") + '</b><div class="small muted ltr" style="text-align:right">' + E(LY.famPhones(f).map(LY.displayPhone).join(" · ")) + '</div><div class="small">' + E((f.children || []).map(function (k) { return k.name; }).join("، ")) + "</div></div>"; };
      return '<div class="match">' + side(x.a) + '<div class="mid"><span class="small">' + E(x.why.join("، ")) + '</span><button class="btn sm primary" data-merge="' + i + '">' + I("merge") + 'دمج</button><button class="btn sm ghost" data-notsame="' + i + '">مو نفسها</button></div>' + side(x.b) + "</div>";
    }).join("") + "</div>" : "") +
      '<div class="toolbar"><div class="search" style="margin:0;flex:1">' + I("search") + '<input class="in" id="lq" placeholder="ابحث باسم الطالب أو ولي الأمر أو الجوال" aria-label="بحث"></div><select class="in" id="lf" style="width:auto"><option value="all">كل الطلاب</option><option value="due">عنده هدية مستحقة</option><option value="loyal">المستمرين (3+)</option><option value="founder">المؤسسون</option><option value="lapsed">المنقطعين</option></select><span class="muted small" id="lc"></span></div>' +
      '<div style="overflow:auto"><table class="t st" id="lt"></table></div><div id="lmore"></div>';
    var draw = function () {
      var q = LY.toLatinDigits(document.getElementById("lq").value.trim()).toLowerCase(), flt = document.getElementById("lf").value;
      var rows = DATA.ST.filter(function (x) {
        if (q && (x.s.child.name + " " + (x.f.name || "") + " " + LY.famPhones(x.f).map(LY.displayPhone).join(" ")).toLowerCase().indexOf(q) < 0) return false;
        if (flt === "due") return x.s.due.length > 0;
        if (flt === "loyal") return x.s.parts >= 3;
        if (flt === "founder") return x.s.founder.length > 0;
        if (flt === "lapsed") return x.s.lapsed;
        return true;
      }).sort(function (a, b) { return (b.s.due.length > 0) - (a.s.due.length > 0) || b.s.parts - a.s.parts; });
      document.getElementById("lc").textContent = rows.length + " من " + DATA.ST.length + " طالب";
      document.getElementById("lt").innerHTML = rows.length ? "<thead><tr><th>الطالب</th><th>المشاركات</th><th>مستواه</th><th>للمرحلة الجاية</th><th>مستحق</th><th></th></tr></thead><tbody>" + rows.slice(0, stLimit).map(function (x) {
        var s = x.s;
        return '<tr><td class="who"><b>' + E(s.child.name) + "</b><small>" + E(x.f.name || "") + " · " + E(LY.displayPhone(x.f.phone)) + "</small><small>" + (s.gradeLabel ? "الصف: " + E(s.gradeLabel) + " · " : "") + E(s.programs.join("، ")) + (s.lapsed ? ' · <span class="badge bad">منقطع' + (s.missed && s.missed.n ? " · فاته " + s.missed.n : "") + "</span>" : "") + s.founder.map(function (fd) { return ' <span class="lvl fd">مؤسس ' + E(fd.program) + " #" + fd.n + "</span>"; }).join("") + "</small></td>" +
          "<td><b>" + s.parts + "</b></td><td>" + msPill(s.reached) + "</td><td>" + (s.next ? '<div class="prog-mini"><div class="progress"><i style="width:' + s.progress + '%"></i></div><small>باقي ' + s.toNext + " لـ «" + E(s.next.name) + "»</small></div>" : '<span class="lvl l3">آخر مرحلة</span>') + "</td>" +
          "<td>" + (s.due.length ? '<span class="badge or">' + giftsTxt(s.due.length) + "</span>" : '<span class="muted">—</span>') + '</td><td><button class="btn sm" data-act="open" data-f="' + E(x.f.id) + '" data-c="' + E(s.child.id) + '">فتح</button></td></tr>';
      }).join("") + "</tbody>" : '<tr><td class="empty">ما فيه طلاب يطابقون البحث.</td></tr>';
      document.getElementById("lmore").innerHTML = rows.length > stLimit ? '<div class="actions"><button class="btn" id="lmoreB">عرض المزيد</button></div>' : "";
      var mb = document.getElementById("lmoreB"); if (mb) mb.onclick = function () { stLimit += 150; draw(); };
      bindActs(document.getElementById("lt"));
    };
    document.getElementById("lq").oninput = function () { stLimit = 150; draw(); };
    document.getElementById("lf").onchange = function () { stLimit = 150; draw(); };
    draw();
    el.querySelectorAll("[data-merge]").forEach(function (b) { b.onclick = function () {
      var x = m[+b.dataset.merge];
      ADM.confirm("دمج أسرة «" + (x.b.name || "") + "» داخل «" + (x.a.name || "") + "»؟ الأبناء والمشاركات والجوالات تصير تحت أسرة وحدة.", "دمج").then(function (ok) { if (ok) saveMany([LY.mergeFamilies(x.a, x.b)], [x.b.id]).then(function (o) { if (o) TH.toast("انضمّت الأسرتين"); }); });
    }; });
    el.querySelectorAll("[data-notsame]").forEach(function (b) { b.onclick = function () { var x = m[+b.dataset.notsame], a = LY.clone(x.a); a.notSame = (a.notSame || []).concat([x.b.id]); saveFam(a); }; });
    bindActs(el);
  }

  // ---------- الإطلاق ----------
  function renderLaunch(el) {
    var L = LY.launchInfo(list(), S, CTX);
    var link = (window.LY_BASE || location.origin) + "/interest.html";
    el.innerHTML = statusBar() + (L.length ? L.map(function (x) {
      var p = x.program, n = x.founders.length, intr = INTEREST.filter(function (i) { return i.program === p.name; });
      var seats = "";
      if (p.status === "جديد") { for (var i = 1; i <= S.foundersCap; i++) seats += '<i class="' + (i <= n ? "on" : "") + '">' + i + "</i>"; }
      var todo = x.targets.filter(function (t) { return !t.done; }).length;
      return '<div class="block"><h3>' + I(p.status === "جديد" ? "rocket" : "clock") + E(p.name) + ' <span class="badge ' + (p.status === "جديد" ? "or" : "navy") + '">' + E(p.status === "جديد" ? "يُطلق الآن" : "قادم") + "</span></h3>" +
        '<p class="hint">' + E(p.desc || "") + (p.status === "جديد" ? " · أول " + S.foundersCap + " مسجل «مؤسسون» بوسام ورقم ثابت واسمهم على جدار المؤسسين، بدون أي خصم." : " · قائمة الاهتمام مفتوحة، والأسر المستمرة لها أولوية لما يفتح التسجيل.") + "</p>" +
        '<div class="launch"><div>' +
        (p.status === "جديد" ? "<b>المؤسسون " + n + " من " + S.foundersCap + (x.seatsLeft ? " · باقي " + x.seatsLeft + " مقعد" : " · اكتملوا") + '</b><div class="seats">' + seats + '</div><div class="wall">' + (n ? x.founders.map(function (f) { return "<span><b>#" + f.n + "</b> " + E(f.name) + "</span>"; }).join("") : '<span class="muted">ما فيه مؤسسين للحين.</span>') + "</div>" : "") +
        '<div class="pend" style="margin-top:12px"><div><div class="lbl">قائمة الاهتمام: ' + intr.length + '</div><div class="why">رابط التسجيل المبكر للأهالي</div></div><span class="actions" style="margin:0"><button class="btn sm ghost" data-copy="' + E(link + "?p=" + encodeURIComponent(p.name)) + '">' + I("copy") + 'نسخ الرابط</button><button class="btn sm" data-go="interest">فتح القائمة</button></span></div>' +
        '<div class="hint">مسجلين هذا الفصل: ' + x.regsCur + " · أطفال سجلوا فيه: " + x.kids + "</div></div>" +
        '<div><b>ادعُهم قبل الإعلان العام (' + todo + ')</b><p class="hint" style="margin:2px 0 8px">بس الأكيد: أسر عندها ابن مسجّل عندنا، صفه الحالي يناسب البرنامج، وما سجّل فيه. المستمرة أولًا. التسجيل المبكر ' + S.earlyDays + " أيام قبل الإعلان.</p>" +
        (x.targets.length ? x.targets.slice(0, 60).map(function (t) {
          return '<div class="pend"' + (t.done ? ' style="opacity:.55"' : "") + '><div><div class="lbl">' + E(t.fam.name || (t.fam.children[0] || {}).name || "") + (t.loyal ? ' <span class="lvl l2">مستمرة</span>' : "") + '</div><div class="why">' + E(t.why.join("، ")) + (t.done ? " · دُعيت " + E(t.done) : "") + "</div></div>" +
            '<span class="actions" style="margin:0">' + waBtn(t.fam.phone, LY.launchMessage(t.fam, p, S, (t.kids || []).join(" و")) + (p.status === "قادم" ? "\nسجّل اهتمامك: " + link + "?p=" + encodeURIComponent(p.name) : ""), "دعوة") + (t.done ? "" : '<button class="btn sm ghost" data-act="invited" data-f="' + E(t.fam.id) + '" data-k="' + E(x.key) + '">تمت</button>') + "</span></div>";
        }).join("") : '<div class="empty">ما عندنا ابن مسجّل صفه يناسب ' + E(p.name) + ' وما سجّل فيه. الأسر اللي ما نعرف أعمار أبنائها ما نرشحها. أضف الصف الدراسي للطالب من بطاقته ويطلع هنا.</div>') + "</div></div></div>";
    }).join("") : '<div class="empty">' + I("rocket") + '<p>ما فيه برنامج جديد أو قادم. غيّر حالة البرنامج من «الإعدادات ← البرامج».</p></div>');
    bindActs(el);
  }

  // ---------- قائمة الاهتمام ----------
  function renderInterest(el) {
    var progs = {};
    INTEREST.forEach(function (x) { (progs[x.program] = progs[x.program] || []).push(x); });
    var keys = Object.keys(progs);
    el.innerHTML = '<div class="status-bar" style="background:var(--tq-soft)"><span class="grow">الأهالي يسجلون من <b class="ltr">' + E((window.LY_BASE || location.origin) + "/interest.html") + "</b>. الأسر المستمرة تطلع أول، ولما يفتح التسجيل أرسل لهم «مقعدك محفوظ».</span><button class=\"btn sm\" data-copy=\"" + E((window.LY_BASE || location.origin) + "/interest.html") + '">' + I("copy") + "نسخ الرابط</button></div>" +
      (keys.length ? keys.map(function (k) {
        var rows = progs[k].map(function (x) { var m = LY.interestMatch(x, list(), S, CTX); return { x: x, m: m }; })
          .sort(function (a, b) { return (b.m.loyal - a.m.loyal) || (!!b.m.fam - !!a.m.fam) || (a.x.created_at < b.x.created_at ? -1 : 1); });
        return '<div class="block"><h3>' + E(k) + ' <span class="badge">' + rows.length + '</span></h3><div style="overflow:auto"><table class="t"><thead><tr><th>#</th><th>الابن</th><th>ولي الأمر</th><th>الأسرة</th><th>الحالة</th><th></th></tr></thead><tbody>' +
          rows.map(function (r, i) {
            var x = r.x, tag = r.m.loyal ? '<span class="lvl l2">مستمرة · ' + r.m.parts + " مشاركات</span>" : r.m.fam ? '<span class="lvl">أسرة موجودة' + (r.m.by === "name" ? " (بالاسم)" : "") + "</span>" : '<span class="lvl l0">جديدة</span>';
            return "<tr><td>" + (i + 1) + "</td><td><b>" + E(x.child_name) + "</b>" + (x.grade ? '<div class="small muted">' + E(gradeName(+x.grade)) + "</div>" : "") + "</td><td>" + E(x.parent_name || "") + '<div class="small muted ltr" style="text-align:right">' + E(x.phone) + "</div>" + (x.ref_code ? '<div class="small">كود: ' + E(x.ref_code) + "</div>" : "") + "</td>" +
              "<td>" + tag + '</td><td><span class="badge ' + (x.status === "سُجّل" ? "ok" : x.status === "أُبلغ" ? "navy" : "gray") + '">' + E(x.status) + "</span></td>" +
              '<td><span class="actions" style="margin:0">' + waBtn(LY.normPhone(x.phone), LY.interestMessage(x, S), "مقعدك محفوظ") + '<button class="btn sm ghost" data-int="notify" data-id="' + E(x.id) + '">أُبلغ</button><button class="btn sm" data-int="reg" data-id="' + E(x.id) + '">سجّلته</button><button class="btn sm bad" data-int="del" data-id="' + E(x.id) + '" aria-label="حذف">' + I("trash") + "</button></span></td></tr>";
          }).join("") + "</tbody></table></div></div>";
      }).join("") : '<div class="empty">' + I("list") + "<p>ما فيه أحد في قائمة الاهتمام للحين. انسخ الرابط وأرسله في قروبات الأهالي.</p></div>");
    el.querySelectorAll("[data-int]").forEach(function (b) {
      b.onclick = function () {
        var x = INTEREST.filter(function (i) { return i.id === b.dataset.id; })[0]; if (!x) return;
        if (b.dataset.int === "notify") ADM.call(b, "lyInterestUpdate", { id: x.id, patch: { status: "أُبلغ", notified: true } }).then(function (r) { Object.assign(x, r); refresh(true); });
        if (b.dataset.int === "del") ADM.confirm("حذف " + x.child_name + " من قائمة الاهتمام؟", "حذف").then(function (ok) { if (ok) ADM.call(b, "lyInterestDelete", { id: x.id }).then(function () { INTEREST = INTEREST.filter(function (i) { return i.id !== x.id; }); refresh(true); }); });
        if (b.dataset.int === "reg") { prefillInterest = x; ADM.setTab("add"); }
      };
    });
    bindActs(el);
  }

  // ---------- الإجراءات ----------
  function bindActs(root) {
    root.querySelectorAll("[data-act]").forEach(function (el) { el.onclick = function (e) { onAction(el, e); }; });
    root.querySelectorAll("[data-copy]").forEach(function (b) { b.onclick = function () { TH.copy(b.dataset.copy); }; });
  }
  function onAction(el, e) {
    var act = el.getAttribute("data-act"), fid = el.getAttribute("data-f"), cid = el.getAttribute("data-c"), key = el.getAttribute("data-k");
    if (act === "open") { open = { f: fid, c: cid }; renderDrawer(true); return; }
    if (act === "close") { closeDrawer(); return; }
    if (guardDemo()) { if (el.tagName === "A") e.preventDefault(); return; }
    var f = famById(fid); if (!f) return;
    var c = LY.clone(f);
    var kid = function () { return c.children.filter(function (x) { return x.id === cid; })[0]; };
    if (act === "give" || act === "ungive") { var k = kid(); if (!k) return; k.given = k.given || {}; if (act === "give") k.given[key] = LY.today(); else delete k.given[key]; return saveFam(c); }
    if (act === "giveall") {
      var kg = kid(); if (!kg) return; kg.given = kg.given || {};
      LY.studentInfo(f, f.children.filter(function (x) { return x.id === cid; })[0], S, CTX).due.forEach(function (d) { kg.given[d.key] = LY.today(); });
      return saveFam(c).then(function (ok) { if (ok) TH.toast("تم: " + kg.name); });
    }
    if (act === "badge") { var kb = kid(); if (!kb) return; kb.badges = kb.badges || {}; if (kb.badges[key]) delete kb.badges[key]; else kb.badges[key] = LY.today(); return saveFam(c); }
    if (act === "reached" || act === "invited") { c.reach = c.reach || {}; c.reach[key] = LY.today(); return saveFam(c); }
    if (act === "reject") { c.needDecision = c.needDecision || {}; c.needDecision[S.currentTerm] = "no"; return saveFam(c).then(function () { TH.toast("انحفظ: ما يحتاج خصم هذا الفصل"); }); }
    if (act === "issue") {
      var p = LY.familyInfo(f, S, CTX).pending; if (!p) return TH.toast("ما عاد فيه خصم مستحق");
      var res = LY.issueDiscount(f, p, S, taken());
      issuedNow[f.id] = res.reward;
      return saveFam(res.fam).then(function (ok) { if (ok) TH.toast("صدر الكود " + res.reward.code); });
    }
    if (act === "osra") { var nf = LY.applyOsra(f, S, taken()); return saveFam(nf).then(function (ok) { if (ok) TH.toast("كوبون أسرة ثروة " + nf.osra.code + " = " + nf.osra.value + "%"); }); }
    if (act === "invite" && !f.refCodeSent) { c.refCodeSent = true; return saveFam(c); }
  }

  // ---------- بطاقة الطالب ----------
  function closeDrawer() { open = null; document.getElementById("drawerRoot").innerHTML = ""; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open && !document.getElementById("modalRoot").innerHTML) closeDrawer(); });
  function renderDrawer(fresh) {
    var root = document.getElementById("drawerRoot");
    var f = open && famById(open.f), child = f && f.children.filter(function (k) { return k.id === open.c; })[0];
    if (!child) return closeDrawer();
    var ae = document.activeElement;
    if (!fresh && ae && root.contains(ae) && (/textarea|select/i.test(ae.tagName) || (ae.tagName === "INPUT" && ae.type !== "checkbox"))) return;
    var scroll = !fresh && root.querySelector(".drawer") ? root.querySelector(".drawer").scrollTop : 0;
    var fi = LY.familyInfo(f, S, CTX), s = LY.studentInfo(f, child, S, CTX), demo = isDemo(), given = child.given || {}, badges = child.badges || {};
    var ms = S.milestones.slice().sort(function (a, b) { return a.n - b.n; });
    var h = '<div class="drawer-back" data-act="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="بطاقة الطالب"><header><h3>' + E(child.name) + "</h3>" + msPill(s.reached) + '<button class="btn sm ghost" data-act="close">إغلاق</button></header><div class="body">';
    if (demo) h += '<div class="status-bar" style="margin:0">طالب مثال. الأزرار معطلة لين تضيف طلابك.</div>';
    h += '<div class="member"><img class="wm" src="/assets/logo.svg" alt=""><div class="mrow"><div><small>عضو ثروة · ' + E(s.programs.join("، ")) + "</small><h3>" + E(child.name) + "</h3></div><span class=\"lvl l3\">" + E(s.reached ? s.reached.name : "—") + "</span></div>" +
      s.founder.map(function (fd) { return '<div style="margin-top:8px"><span class="lvl fd">مؤسس ' + E(fd.program) + " رقم " + fd.n + "</span></div>"; }).join("") +
      '<div style="margin-top:10px"><small>' + partsTxt(s.parts) + (s.next ? " · باقي " + s.toNext + " لمرحلة «" + E(s.next.name) + "»" : " · وصل آخر مرحلة") + '</small><div class="progress" style="margin-top:6px;background:rgba(255,255,255,.2)"><i style="width:' + s.progress + '%"></i></div></div></div>';
    h += '<section class="sec"><h4>مسار التقدير ' + (s.reached ? waBtn(f.phone, LY.milestoneMessage(f, s, s.reached, S), "بشّر أهله") : "") + "</h4>";
    var itemRow = function (key, text, on, cls) {
      var d = given[key];
      var btn = !on ? "" : d ? '<span class="actions" style="margin:0"><small class="muted">سُلّم ' + E(d) + '</small><button class="btn sm ghost" data-act="ungive" data-f="' + E(f.id) + '" data-c="' + E(child.id) + '" data-k="' + E(key) + '">تراجع</button></span>' : '<button class="btn sm" data-act="give" data-f="' + E(f.id) + '" data-c="' + E(child.id) + '" data-k="' + E(key) + '">تم التسليم</button>';
      return '<div class="item' + cls + (d ? " done" : "") + '"><span>' + E(text) + "</span>" + btn + "</div>";
    };
    s.founder.forEach(function (fd) { h += '<div class="ms on"><div class="mh"><b>مؤسس ' + E(fd.program) + " #" + fd.n + "</b></div>" + S.founderItems.map(function (it, i) { return itemRow("f-" + fd.program + "-" + i, it.replace(/\{البرنامج\}/g, fd.program), true, " fnd"); }).join("") + "</div>"; });
    ms.forEach(function (m) {
      var on = s.parts >= m.n;
      h += '<div class="ms' + (on ? " on" : "") + '"><div class="mh"><b>' + E(m.name) + '</b><span class="muted small">' + (on ? "مفتوحة" : "تنفتح عند " + partsTxt(m.n)) + "</span></div>" +
        m.items.map(function (it, i) { return itemRow(m.n + "-" + i, it, on, it.indexOf("للأهل") === 0 ? " par" : ""); }).join("") + "</div>";
    });
    h += '</section><section class="sec"><h4>الشارات</h4><div class="badges">' + S.badges.map(function (b) { return '<button aria-pressed="' + (badges[b] ? "true" : "false") + '" data-act="badge" data-f="' + E(f.id) + '" data-c="' + E(child.id) + '" data-k="' + E(b) + '">' + E(b) + "</button>"; }).join("") + "</div>";
    var got = Object.keys(badges);
    if (got.length) h += '<div class="actions">' + waBtn(f.phone, LY.badgeMessage(f, child, got[got.length - 1], S), "بشّر أهله بآخر شارة") + "</div>";
    h += '</section><section class="sec"><h4>المشاركات <span class="muted">' + s.parts + "</span></h4>" +
      (s.regs.length ? s.regs.slice().reverse().map(function (r) { return '<div class="relrow"><span>' + E(r.program) + " · " + E(r.term) + (r.cycle ? " · " + E(r.cycle) : "") + "</span>" + (demo ? "" : '<button class="btn sm ghost" data-delreg="' + E(r.id) + '">حذف</button>') + "</div>"; }).join("") : '<p class="muted">ما فيه مشاركات.</p>');
    if (!demo) h += '<div class="form" style="margin-top:10px"><div><label class="f">البرنامج</label><select class="in" id="dProg">' + options(S.programs.map(function (x) { return x.name; }), s.programs[0]) + '</select></div><div><label class="f">الفصل</label><select class="in" id="dTerm">' + options(S.terms, S.currentTerm) + '</select></div><div><label class="f">الرحلة أو الدورة</label><input class="in" id="dCycle"></div><div><button class="btn sm primary" id="dAdd">إضافة مشاركة</button></div></div>' +
      '<div class="form" style="margin-top:8px"><div><label class="f">الصف الدراسي</label><select class="in" id="dGrade">' + gradeOptions(child.grade) + "</select></div></div>";
    var sibs = f.children.filter(function (k) { return k.id !== child.id; }), o = fi.osra;
    h += '</section><section class="sec"><h4>الأسرة والخصم</h4><p style="margin:0"><b>' + E(f.name || "ولي الأمر") + '</b> · <span class="ltr" style="display:inline-block">' + E(LY.famPhones(f).map(LY.displayPhone).join(" · ")) + "</span></p>" +
      (sibs.length ? '<div class="badges" style="margin:8px 0">' + sibs.map(function (k) { return '<button data-act="open" data-f="' + E(f.id) + '" data-c="' + E(k.id) + '">' + E(k.name) + "</button>"; }).join("") + "</div>" : "") +
      '<div class="pend" style="margin-top:10px"><div><div class="lbl">كود الإحالة <span class="code">' + E(f.refCode || "") + '</span></div><div class="why">جاب ' + fi.refsTerm + " هذا الفصل من " + S.refCap + "</div></div>" +
      '<a class="btn sm wa" data-act="invite" data-f="' + E(f.id) + '" href="' + E(LY.waLink(f.phone, LY.fillTpl(S.tpl.invite, LY.msgVars(f, S, { "الطالب": child.name })))) + '" target="_blank" rel="noopener">' + (f.refCodeSent ? "أرسله مرة ثانية" : "أرسل كود الإحالة") + "</a></div>" +
      '<div class="pend"><div><div class="lbl">كوبون أسرة ثروة' + (o.code ? ' <span class="code">' + E(o.code) + "</span>" : "") + '</div><div class="why">' + (o.count >= 2 ? "أبناء في " + o.count + " برامج: " + E(o.programs.join("، ")) + " · القيمة " + o.value + "%" + (o.change ? " (تحتاج تحديث)" : "") : "يصير لهم لما يسجلون أبناء في برنامجين مختلفين") + "</div></div>" +
      (o.change && !demo ? '<button class="btn sm primary" data-act="osra" data-f="' + E(f.id) + '">' + (o.code ? "حدّثته في المتجر" : "إصدار الكود") + "</button>" : "") + "</div>";
    if (fi.pending) h += discRow({ f: f, i: fi }, fi.pending.approval);
    else h += '<p class="muted small" style="margin:6px 0">' + (fi.topIssued ? "صدر لها خصم " + fi.topIssued + "% هذا الفصل." : "ما تستحق خصم الحين. مكافأتها مسار التقدير.") + "</p>";
    if (issuedNow[f.id]) h += issuedRow(f, issuedNow[f.id]);
    h += '<div style="margin-top:10px"><b class="small">علامات الحاجة (تفتح طلب «هدية منّا» ينتظر اعتمادك)</b><div style="display:grid;gap:6px;margin-top:6px">' +
      LY.NEED_FLAGS.map(function (fl) { return '<label class="check"><input type="checkbox" data-flag="' + fl.k + '"' + ((f.flags || {})[fl.k] ? " checked" : "") + (demo ? " disabled" : "") + "> " + E(fl.t) + "</label>"; }).join("") + "</div></div>" +
      '<div class="form" style="margin-top:10px"><div><label class="f">عدد الأبناء من 9 إلى 18</label><input class="in" id="dKids" type="number" min="0" max="15" value="' + E(f.kidsCount || "") + '"' + (demo ? " disabled" : "") + "></div>" +
      '<div><label class="f">جوال ثاني للأسرة</label><input class="in ltr" id="dPhone2" placeholder="05XXXXXXXX"' + (demo ? " disabled" : "") + '></div><div><button class="btn sm" id="dAddPhone"' + (demo ? " disabled" : "") + ">إضافة الجوال</button></div></div>";
    var codes = (f.rewards || []).filter(function (w) { return w.type !== "new"; }).slice().reverse();
    if (codes.length) h += '<div style="overflow:auto;margin-top:10px"><table class="t"><thead><tr><th>الكود</th><th>البند</th><th>القيمة</th><th>الحالة</th></tr></thead><tbody>' + codes.map(function (w) {
      return '<tr><td><span class="code">' + E(w.code) + "</span></td><td>" + E(discLabel(w.type)) + "</td><td>" + E(discValue(w)) + '</td><td><select class="in" data-rstatus="' + E(w.id) + '"' + (demo ? " disabled" : "") + ">" + options(["مرسل", "مستخدم", "مُهدى", "ملغى"], w.status) + "</select></td></tr>";
    }).join("") + "</tbody></table></div>";
    h += "</section>" + (demo ? "" : '<div class="actions" style="margin:0"><button class="btn sm bad" id="dDel">' + I("trash") + "حذف الطالب</button></div>") + "</div></aside>";
    root.innerHTML = h;
    var dr = root.querySelector(".drawer"); dr.scrollTop = scroll;
    if (fresh) { var cl = dr.querySelector('header [data-act="close"]'); if (cl) cl.focus(); }
    bindActs(root);
    wireDrawer(f.id, child.id);
  }
  function wireDrawer(fid, cid) {
    var root = document.getElementById("drawerRoot");
    var cur = function () { return LY.clone(famById(fid)); };
    root.querySelectorAll("[data-flag]").forEach(function (cb) { cb.onchange = function () { var f = cur(); f.flags = f.flags || {}; f.flags[cb.dataset.flag] = cb.checked; saveFam(f); }; });
    root.querySelectorAll("[data-rstatus]").forEach(function (sel) { sel.onchange = function () { var f = cur(), w = (f.rewards || []).filter(function (x) { return x.id === sel.dataset.rstatus; })[0]; if (w) { w.status = sel.value; sel.blur(); saveFam(f); } }; });
    root.querySelectorAll("[data-delreg]").forEach(function (b) { b.onclick = function () { ADM.confirm("تحذف هذي المشاركة؟", "حذف").then(function (ok) { if (!ok) return; var f = cur(); f.regs = f.regs.filter(function (r) { return r.id !== b.dataset.delreg; }); saveFam(f); }); }; });
    var k = root.querySelector("#dKids"); if (k) k.onchange = function () { var f = cur(); f.kidsCount = +k.value || 0; k.blur(); saveFam(f); };
    var gr = root.querySelector("#dGrade"); if (gr) gr.onchange = function () { var f = cur(), c = f.children.filter(function (x) { return x.id === cid; })[0]; c.grade = gr.value; gr.blur(); saveFam(f); };
    var ap = root.querySelector("#dAddPhone"); if (ap) ap.onclick = function () {
      var ph = LY.normPhone(root.querySelector("#dPhone2").value);
      if (!/^9665\d{8}$/.test(ph)) return TH.toast("رقم الجوال غير صحيح", true);
      var other = LY.findFamily(list(), ph);
      if (other && other.id !== fid) return TH.toast("هذا الجوال مسجل لأسرة ثانية. استخدم «دمج» من تبويب الطلاب.", true);
      var f = cur(); if (LY.famPhones(f).indexOf(ph) < 0) f.phones = (f.phones || []).concat([ph]); saveFam(f).then(function () { TH.toast("انضاف الجوال"); });
    };
    var add = root.querySelector("#dAdd"); if (add) add.onclick = function () {
      var f = cur(), c = f.children.filter(function (x) { return x.id === cid; })[0];
      var res = LY.applyRegistration(list(), { phone: f.phone, childName: c.name, program: root.querySelector("#dProg").value, term: root.querySelector("#dTerm").value, cycle: root.querySelector("#dCycle").value }, S, taken());
      if (res.error) return TH.toast(res.error, true);
      if (document.activeElement) document.activeElement.blur();
      saveFam(res.fam).then(function (ok) { if (ok) TH.toast("انضافت المشاركة"); });
    };
    var del = root.querySelector("#dDel"); if (del) del.onclick = function () {
      var f0 = famById(fid), c0 = f0.children.filter(function (x) { return x.id === cid; })[0];
      ADM.confirm("تحذف " + c0.name + " وكل مشاركاته؟", "حذف").then(function (ok) {
        if (!ok) return;
        var f = cur(); f.children = f.children.filter(function (x) { return x.id !== cid; }); f.regs = f.regs.filter(function (r) { return r.childId !== cid; });
        closeDrawer();
        if (f.children.length) return saveFam(f).then(function () { TH.toast("انحذف الطالب"); });
        FAMS = FAMS.filter(function (x) { return x.fam.id !== fid; }); refresh(true);
        TH.api("lyDeleteFamily", { id: fid }).then(function () { TH.toast("انحذف الطالب"); }, function (e) { TH.toast(e.message, true); });
      });
    };
  }

  // ---------- إضافة طالب ----------
  function renderAdd(el) {
    var pv = prefillInterest || {};
    el.innerHTML = statusBar() + '<div class="block"><h3><span class="dot"></span>تسجيل طالب في برنامج</h3><p class="hint">النظام يتعرف على الأسرة بالجوال أولًا، ثم بالأسماء، ويحسب المرحلة والخصم تلقائيًا.</p>' +
      (pv.id ? '<div class="note tq" style="margin-bottom:10px">' + I("info") + "<div>من قائمة الاهتمام: " + E(pv.child_name) + " — " + E(pv.program) + "</div></div>" : "") +
      '<form id="regForm" class="form" autocomplete="off">' +
      '<div><label class="f" for="rPhone">جوال ولي الأمر *</label><input class="in ltr" id="rPhone" inputmode="numeric" value="' + E(pv.phone || "") + '" required></div>' +
      '<div><label class="f" for="rParent">اسم ولي الأمر</label><input class="in" id="rParent" value="' + E(pv.parent_name || "") + '"></div>' +
      '<div><label class="f" for="rChild">اسم الطالب *</label><input class="in" id="rChild" value="' + E(pv.child_name || "") + '" required></div>' +
      '<div><label class="f" for="rProgram">البرنامج *</label><select class="in" id="rProgram">' + options(S.programs.map(function (x) { return { v: x.name, l: x.name + (x.g === "f" ? " (بنات)" : "") + (x.status !== "قائم" ? " · " + x.status : "") }; }), pv.program || "") + "</select></div>" +
      '<div><label class="f" for="rTerm">الفصل *</label><select class="in" id="rTerm">' + options(S.terms, S.currentTerm) + "</select></div>" +
      '<div><label class="f" for="rCycle">الرحلة أو الدورة</label><input class="in" id="rCycle"></div>' +
      '<div><label class="f" for="rGrade">الصف</label><select class="in" id="rGrade">' + gradeOptions(pv.grade || "") + "</select></div>" +
      '<div><label class="f" for="rGender">الجنس</label><select class="in" id="rGender">' + options([{ v: "m", l: "ابن" }, { v: "f", l: "بنت" }], pv.gender || "m") + "</select></div>" +
      '<div><label class="f" for="rRef">كود إحالة (إن وجد)</label><input class="in ltr" id="rRef" value="' + E(pv.ref_code || "") + '"></div>' +
      '<div><label class="f" for="rKids">عدد الأبناء 9–18</label><input class="in" id="rKids" type="number" min="0" max="15"></div>' +
      '<div><label class="check"><input type="checkbox" id="rPrice"> اختار «السعر» كعائق</label></div>' +
      '<div><button class="btn primary" type="submit">' + I("check") + "حفظ التسجيل</button></div></form>" +
      '<div id="rMatch" style="margin-top:10px"></div><div id="rResult"></div></div>' +
      '<div class="block"><h3><span class="dot o"></span>استيراد جدول التسجيلات</h3><p class="hint">الصق من Excel أو Google Sheets بالترتيب: ولي الأمر، الجوال، الطالب، الجنس، البرنامج، الفصل، الدورة، الصف. الصف الأول ممكن يكون عناوين.</p>' +
      '<textarea class="in" id="impText" style="min-height:120px" placeholder="أبو سعد	0551234567	سعد	ذكر	تواق	1448-ف1	رحلة 1	8"></textarea><div class="actions"><button class="btn" id="impCheck">فحص</button><button class="btn primary" id="impGo" disabled>إضافة</button><span class="muted small" id="impInfo"></span></div><div id="impPrev"></div><div class="bar hidden" id="impBar"><i></i></div></div>';
    var phone = el.querySelector("#rPhone"), attach = { id: "" };
    var matchUI = function () {
      var ph = LY.normPhone(phone.value), f = ph.length >= 12 ? LY.findFamily(list(), ph) : null, box = el.querySelector("#rMatch");
      attach.id = "";
      if (f) { box.innerHTML = '<div class="note ok">' + I("check") + "<div>أسرة موجودة: <b>" + E(f.name || "") + "</b> · الأبناء: " + E(f.children.map(function (k) { return k.name; }).join("، ")) + "</div></div>"; if (!el.querySelector("#rParent").value) el.querySelector("#rParent").value = f.name || ""; return; }
      var cands = isDemo() ? [] : LY.nameCandidates(list(), el.querySelector("#rParent").value, el.querySelector("#rChild").value);
      if (cands.length && ph.length >= 12) {
        box.innerHTML = '<div class="note or">' + I("merge") + '<div><b>الجوال جديد، بس ممكن الأسرة موجودة بجوال ثاني:</b><div style="display:grid;gap:6px;margin-top:6px">' + cands.slice(0, 5).map(function (c) {
          return '<label class="check"><input type="radio" name="att" value="' + E(c.id) + '"> ' + E(c.name || "") + " · " + E(LY.displayPhone(c.phone)) + " · " + E(c.children.map(function (k) { return k.name; }).join("، ")) + "</label>";
        }).join("") + '<label class="check"><input type="radio" name="att" value="" checked> لا، أسرة جديدة</label></div></div></div>';
        box.querySelectorAll("input[name=att]").forEach(function (r) { r.onchange = function () { attach.id = r.value; }; });
      } else box.innerHTML = ph.length >= 12 ? '<div class="hint">أسرة جديدة.</div>' : "";
    };
    phone.oninput = matchUI; el.querySelector("#rChild").onblur = matchUI; el.querySelector("#rParent").onblur = matchUI;
    el.querySelector("#rProgram").onchange = function () { var g = LY.progGender(S, this.value); if (g) el.querySelector("#rGender").value = g; };
    if (pv.id) matchUI();
    el.querySelector("#regForm").onsubmit = function (e) {
      e.preventDefault();
      var input = { phone: phone.value, parentName: el.querySelector("#rParent").value.trim(), childName: el.querySelector("#rChild").value, gender: el.querySelector("#rGender").value, program: el.querySelector("#rProgram").value,
        term: el.querySelector("#rTerm").value, cycle: el.querySelector("#rCycle").value, grade: el.querySelector("#rGrade").value, refCode: el.querySelector("#rRef").value, kidsCount: el.querySelector("#rKids").value, price: el.querySelector("#rPrice").checked, attachTo: attach.id };
      var real = FAMS.map(function (x) { return x.fam; });
      var res = LY.applyRegistration(real, input, S, LY.takenCodes(real));
      if (res.error) { el.querySelector("#rResult").innerHTML = '<div class="note bad">' + I("alert") + "<div>" + E(res.error) + "</div></div>"; return; }
      var fams = [res.fam].concat(res.refFam ? [res.refFam] : []);
      saveMany(fams).then(function (ok) {
        if (!ok) return;
        var c = res.fam.children.filter(function (k) { return LY.normName(k.name) === LY.normName(input.childName); })[0];
        CTX = { founders: LY.foundersMap(list(), S) };
        var s = LY.studentInfo(res.fam, c, S, CTX);
        var h = '<div class="pend" style="margin-top:14px"><div><div class="lbl">انحفظ · ' + E(c.name) + " · " + partsTxt(s.parts) + " " + msPill(s.reached) + s.founder.map(function (fd) { return ' <span class="lvl fd">مؤسس ' + E(fd.program) + " #" + fd.n + "</span>"; }).join("") + "</div>";
        if (s.due.length) h += '<div class="why">عنده ' + giftsTxt(s.due.length) + " مستحقة في «المطلوب اليوم».</div>";
        res.notes.forEach(function (n) { h += '<div class="why">' + E(n) + "</div>"; });
        h += '</div><button class="btn sm" data-act="open" data-f="' + E(res.fam.id) + '" data-c="' + E(c.id) + '">فتح</button></div>';
        el.querySelector("#rResult").innerHTML = h; bindActs(el.querySelector("#rResult"));
        if (prefillInterest) { var it = prefillInterest; prefillInterest = null; TH.api("lyInterestUpdate", { id: it.id, patch: { status: "سُجّل", family_id: res.fam.id } }).then(function (r) { Object.assign(it, r); }); }
        ["#rChild", "#rCycle", "#rRef"].forEach(function (x) { el.querySelector(x).value = ""; }); el.querySelector("#rGrade").value = ""; el.querySelector("#rPrice").checked = false; el.querySelector("#rChild").focus();
      });
    };
    var parsed = [];
    el.querySelector("#impCheck").onclick = function () {
      parsed = []; var bad = 0, np = {};
      el.querySelector("#impText").value.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (l) {
        var c = (l.indexOf("\t") >= 0 ? l.split("\t") : l.split(/[,،]/)).map(function (x) { return x.trim(); });
        if (/جوال|phone/i.test(c[1] || "")) return;
        var ph = LY.normPhone(c[1]);
        if (!ph || ph.length < 11 || !c[2] || !c[4] || !c[5]) { bad++; return; }
        var g = /أنث|بنت|^f/i.test(c[3] || "") ? "f" : "m";
        if (!LY.progInfo(S, c[4])) np[c[4]] = g;
        if (S.terms.indexOf(c[5]) < 0) np["@" + c[5]] = 1;
        parsed.push({ parentName: c[0], phone: ph, childName: c[2], gender: g, program: c[4], term: c[5], cycle: c[6] || "", grade: LY.toLatinDigits(c[7] || "").replace(/\D/g, "") });
      });
      var phs = {}; parsed.forEach(function (p) { phs[p.phone] = 1; });
      var newP = Object.keys(np).filter(function (k) { return k[0] !== "@"; });
      el.querySelector("#impInfo").textContent = parsed.length + " مشاركة لـ " + Object.keys(phs).length + " أسرة" + (bad ? " · " + bad + " صف ناقص" : "");
      el.querySelector("#impPrev").innerHTML = newP.length ? '<p class="hint">برامج جديدة بتنضاف: ' + E(newP.join("، ")) + "</p>" : "";
      el.querySelector("#impGo").disabled = !parsed.length; el.querySelector("#impGo").dataset.np = JSON.stringify(np);
    };
    el.querySelector("#impGo").onclick = function () {
      if (!parsed.length) return;
      var np = JSON.parse(this.dataset.np || "{}"), changed = false, btn = this;
      Object.keys(np).forEach(function (k) {
        if (k[0] === "@") { if (S.terms.indexOf(k.slice(1)) < 0) { S.terms.push(k.slice(1)); changed = true; } }
        else if (!LY.progInfo(S, k)) { S.programs.push({ name: k, g: np[k], stage: "", status: "قائم", desc: "" }); changed = true; }
      });
      var work = FAMS.map(function (x) { return x.fam; }), tk = LY.takenCodes(work), touched = {}, added = 0, dup = 0;
      parsed.forEach(function (p) { var r = LY.applyRegistration(work, p, S, tk); if (r.error) { dup++; return; } work = work.filter(function (f) { return f.id !== r.fam.id; }); work.push(r.fam); touched[r.fam.id] = r.fam; added++; });
      ADM.busy(btn, true);
      (changed ? saveSettings() : Promise.resolve()).then(function () { return saveMany(Object.keys(touched).map(function (k) { return touched[k]; })); }).then(function () {
        ADM.busy(btn, false); parsed = []; el.querySelector("#impText").value = ""; el.querySelector("#impPrev").innerHTML = "";
        el.querySelector("#impInfo").textContent = "انضافت " + added + " مشاركة" + (dup ? " · " + dup + " مكررة" : ""); TH.toast("خلصت الإضافة");
      });
    };
  }

  // ---------- دليل الكوبونات: وش يسوى كل مسمّى (الأرقام من الإعدادات) ----------
  function renderGuide(el) {
    var P = function (n) { return '<b class="code">' + E(n) + "%</b>"; };
    var card = function (name, prefix, who, rows, how) {
      return '<div class="pend" style="display:block"><div class="lbl">' + E(name) + (prefix ? ' <span class="lvl l0 ltr">' + E(prefix) + "…</span>" : "") + '</div>' +
        '<div class="why" style="margin:4px 0 8px">' + who + "</div>" +
        '<div style="display:grid;gap:4px">' + rows.map(function (r) { return '<div style="display:flex;justify-content:space-between;gap:12px;border-top:1px dashed var(--line);padding-top:4px"><span>' + r[0] + "</span><span>" + r[1] + "</span></div>"; }).join("") + "</div>" +
        '<div class="why" style="margin-top:8px">' + how + "</div></div>";
    };
    var needs = LY.NEED_FLAGS.map(function (f) { return E(f.t); }).join("، أو ");
    var h = '<div class="block"><h3>' + I("star") + 'طريقة الكوبونات</h3><p class="hint">عندنا نوعين: <b>أكواد خصم</b> لها قيمة بالنسبة، تصدر لفئات محددة بس. و<b>مراحل تقدير</b> تنفتح بعدد المشاركات، وهي هدايا وتكريم بدون خصم. ' +
      'الأرقام هنا من «إعدادات الولاء»، وأي تعديل هناك يتغير هنا.</p></div>';
    h += '<div class="block"><h3>أكواد الخصم وقيمتها</h3>' +
      card("كوبون «أسرة ثروة»", "OSRA", "للأسرة اللي أبناءها مسجلين في برامج مختلفة (ابن في تواق وبنت في نيورا مثلًا).",
        [["أبناء في برنامجين", P(S.osra2)], ["في 3 برامج", P(S.osra3)], ["في 4 برامج فأكثر", P(S.osra4)]],
        "كود ثابت للأسرة، وتزيد قيمته لما يسجلون في برنامج زيادة. يطلع في «المطلوب اليوم» ← «إصدار الكود»، وتنشئه بنفس الرمز والنسبة في المتجر.") +
      card("بند الإخوان", "SIB", "لأكثر من أخ في <b>نفس البرنامج ونفس الفصل</b>.",
        [["أخوين", P(S.sib2)], ["3 إخوان فأكثر", P(S.sib3)]],
        "يطلع تلقائيًا في «المطلوب اليوم» لما يسجل الأخ الثاني، وصلاحيته هذا الفصل.") +
      card("بند الرفقة", "BONUS / FREE", "للطالب اللي جاب قريب أو صديق سجّل بكود الإحالة حق أسرته <b>هذا الفصل</b>.",
        [["جاب واحد", P(S.ref1)], ["جاب اثنين", P(S.ref2)], ["جاب " + S.refCap + " فأكثر", "<b>دورة مجانية</b>"], ["المسجّل الجديد نفسه", P(S.newPct)]],
        "كود الإحالة ترسله من بطاقة الأسرة ← «أرسل كود الإحالة». المكافأة تطلع تلقائيًا في «المطلوب اليوم».") +
      card("هدية منّا", "GIFT", "للأسرة اللي التكلفة سبب ترددها أو انقطاعها: " + needs + ".",
        [["قيمة الهدية", P(S.needPct)]],
        "علّم «علامة الحاجة» من بطاقة الطالب، فيطلع طلب «هدية منّا» في «المطلوب اليوم» ينتظر اعتمادك. لو رفضته ما يرجع يطلع لهم هذا الفصل.") +
      "</div>";
    h += '<div class="block"><h3>القواعد</h3><div style="display:grid;gap:6px">' +
      ['<b>خصم واحد للأسرة</b> في الفصل، والأعلى يكسب. ما ينصدر كود أقل من كود صدر لهم هذا الفصل، ولا أقل من كوبون أسرة ثروة.',
        "أقصى خصم " + P(S.maxPct) + "، ما عدا الدورة المجانية.",
        "أكواد الإخوان والرفقة وهدية منّا لهذا الفصل بس. كوبون أسرة ثروة ثابت ويتحدث.",
        "كل كود يصدر من اللوحة ينحفظ في بطاقة الطالب في جدول الأكواد: الكود، والبند، والقيمة، وحالته (مرسل، مستخدم، ملغى)."]
        .map(function (t) { return '<div class="pend"><div class="why" style="color:inherit">' + t + "</div></div>"; }).join("") + "</div></div>";
    h += '<div class="block"><h3>مراحل التقدير (هدايا بدون خصم)</h3><p class="hint">تنفتح بعدد مشاركات الطالب في كل البرامج. الهدية اللي تبدأ بـ «للأهل:» للأهل.</p>' +
      S.milestones.map(function (m, i) {
        return '<div class="pend" style="display:block"><div class="lbl">' + m.n + " " + (m.n === 1 ? "مشاركة" : m.n === 2 ? "مشاركتين" : m.n <= 10 ? "مشاركات" : "مشاركة") +
          " " + msPill(m) + "</div>" +
          '<div class="why" style="margin-top:4px">' + m.items.map(E).join(" · ") + "</div></div>";
      }).join("") +
      '<div class="pend" style="display:block"><div class="lbl">المؤسسون <span class="lvl fd">أول ' + S.foundersCap + " مسجل في برنامج جديد</span></div>" +
      '<div class="why" style="margin-top:4px">' + S.founderItems.map(function (x) { return E(x.replace(/\{البرنامج\}/g, "البرنامج")); }).join(" · ") + "</div></div></div>";
    h += '<div class="actions"><button class="btn" data-go="settings">' + I("gear") + "تعديل النسب والمراحل</button></div>";
    el.innerHTML = h;
  }

  // ---------- الإعدادات ----------
  var NUMS = [["ref1", "الرفقة: الأول %"], ["ref2", "الرفقة: الثاني %"], ["refCap", "إحالات المجانية"], ["newPct", "خصم المسجّل الجديد %"], ["sib2", "الإخوان (نفس البرنامج): الثاني %"], ["sib3", "الإخوان: الثالث فأكثر %"],
    ["osra2", "أسرة ثروة: برنامجين %"], ["osra3", "أسرة ثروة: 3 برامج %"], ["osra4", "أسرة ثروة: 4 فأكثر %"], ["needPct", "هدية منّا للمحتاج %"], ["maxPct", "أقصى خصم %"], ["foundersCap", "عدد المؤسسين"], ["earlyDays", "أيام التسجيل المبكر"]];
  var TPLS = [["milestone", "بشارة المرحلة"], ["badge", "بشارة الشارة"], ["founder", "بشارة المؤسس"], ["launch", "دعوة الإطلاق"], ["interest", "مقعدك محفوظ (قائمة الاهتمام)"], ["osra", "كوبون أسرة ثروة"],
    ["need", "هدية منّا"], ["ref", "الرفقة"], ["free", "المجانية"], ["sib", "الإخوان"], ["invite", "كود الإحالة"], ["lapsed", "المنقطع"], ["stage", "الانتقال للمرحلة الجاية"], ["kids", "الإخوان غير المسجلين"]];
  function renderSettings(el) {
    el.innerHTML = '<div class="block"><h3>الفصول</h3><div class="form"><div><label class="f">الفصل الحالي</label><select class="in" id="sCur">' + options(S.terms, S.currentTerm) + '</select></div><div><label class="f">الفصل السابق</label><select class="in" id="sPrev">' + options(S.terms, S.previousTerm) + '</select></div><div style="grid-column:span 2"><label class="f">كل الفصول (بفاصلة)</label><input class="in" id="sTerms" value="' + E(S.terms.join("، ")) + '"></div></div></div>' +
      '<div class="block"><h3>البرامج</h3><p class="hint">«جديد» = يُطلق الآن وله مؤسسون. «قادم» = قائمة اهتمام قبل فتح التسجيل.</p><div style="overflow:auto"><table class="t" id="sProgs"><thead><tr><th>البرنامج</th><th>الفئة</th><th>المرحلة</th><th>الحالة</th><th>الوصف</th><th></th></tr></thead><tbody>' +
      S.programs.map(function (p, i) {
        return '<tr><td><input class="in" data-pn value="' + E(p.name) + '" aria-label="اسم البرنامج"></td><td><select class="in" data-pg>' + options([{ v: "m", l: "بنين" }, { v: "f", l: "بنات" }], p.g) + '</select></td><td><select class="in" data-ps>' + options([{ v: "", l: "—" }, "ابتدائي", "متوسط", "ثانوي"], p.stage || "") +
          '</select></td><td><select class="in" data-pst>' + options(["قائم", "جديد", "قادم"], p.status) + '</select></td><td><input class="in" data-pd value="' + E(p.desc || "") + '"></td><td><button class="btn sm ghost" data-delprog="' + i + '" aria-label="حذف">' + I("trash") + "</button></td></tr>";
      }).join("") + '</tbody></table></div><div class="actions"><button class="btn sm" id="sAddProg">+ برنامج</button></div><label class="f">رابط التسجيل في المتجر (يُرسل لقائمة الاهتمام)</label><input class="in ltr" id="sReg" value="' + E(S.registerUrl || "") + '" placeholder="https://..."></div>' +
      '<div class="block"><h3>مسار التقدير</h3><p class="hint">كل مرحلة تنفتح بعدد مشاركات. اكتب الهدايا سطر لكل هدية، والهدية اللي تبدأ بـ «للأهل:» تظهر للأهل.</p><div id="sMs">' + S.milestones.map(function (m, i) {
        return '<div class="msrow"><div><label class="f">المشاركات</label><input class="in" type="number" min="1" data-mn value="' + E(m.n) + '"></div><div><label class="f">اسم المرحلة</label><input class="in" data-mname value="' + E(m.name) + '"></div><div><label class="f">الهدايا</label><textarea class="in" rows="3" style="min-height:80px" data-mitems>' + E(m.items.join("\n")) + '</textarea></div><button class="btn sm ghost" data-delms="' + i + '" aria-label="حذف">' + I("trash") + "</button></div>";
      }).join("") + '</div><div class="actions"><button class="btn sm" id="sAddMs">+ مرحلة</button></div>' +
      '<label class="f">هدايا المؤسسين (سطر لكل هدية، و{البرنامج} يتبدل باسمه)</label><textarea class="in" id="sFound" style="min-height:90px">' + E(S.founderItems.join("\n")) + "</textarea>" +
      '<label class="f">الشارات (بفاصلة)</label><input class="in" id="sBadges" value="' + E(S.badges.join("، ")) + '"></div>' +
      '<div class="block"><h3>الأرقام</h3><div class="form">' + NUMS.map(function (n) { return '<div><label class="f">' + E(n[1]) + '</label><input class="in" type="number" min="0" max="100" id="n-' + n[0] + '" value="' + E(S[n[0]]) + '"></div>'; }).join("") + "</div></div>" +
      '<div class="block"><details class="more"><summary>نصوص الرسائل</summary><div style="display:grid;gap:10px;margin-top:10px">' + TPLS.map(function (t) { return '<div><label class="f">' + E(t[1]) + '</label><textarea class="in" rows="4" style="min-height:90px" id="t-' + t[0] + '">' + E(S.tpl[t[0]]) + "</textarea></div>"; }).join("") + "</div></details></div>" +
      '<div class="actions"><button class="btn primary" id="sSave">' + I("check") + 'حفظ الإعدادات</button><button class="btn" id="sExport">' + I("copy") + "نسخ جدول الطلاب (CSV)</button></div>";
    var read = function () {
      var terms = el.querySelector("#sTerms").value.split(/[,،]/).map(function (t) { return t.trim(); }).filter(Boolean);
      if (terms.length) S.terms = terms;
      S.currentTerm = el.querySelector("#sCur").value || S.currentTerm; S.previousTerm = el.querySelector("#sPrev").value || S.previousTerm;
      S.programs = Array.prototype.map.call(el.querySelectorAll("#sProgs tbody tr"), function (tr) {
        return { name: tr.querySelector("[data-pn]").value.trim(), g: tr.querySelector("[data-pg]").value, stage: tr.querySelector("[data-ps]").value, status: tr.querySelector("[data-pst]").value, desc: tr.querySelector("[data-pd]").value.trim() };
      }).filter(function (p) { return p.name; });
      S.registerUrl = el.querySelector("#sReg").value.trim();
      S.milestones = Array.prototype.map.call(el.querySelectorAll("#sMs .msrow"), function (r) {
        return { n: Math.max(1, +r.querySelector("[data-mn]").value || 1), name: r.querySelector("[data-mname]").value.trim(), items: r.querySelector("[data-mitems]").value.split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean) };
      }).filter(function (m) { return m.name; });
      S.founderItems = el.querySelector("#sFound").value.split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean);
      S.badges = el.querySelector("#sBadges").value.split(/[,،]/).map(function (x) { return x.trim(); }).filter(Boolean);
      NUMS.forEach(function (n) { var v = +el.querySelector("#n-" + n[0]).value; if (!isNaN(v) && v >= 0) S[n[0]] = v; });
      if (S.refCap < 3) S.refCap = 3;
      TPLS.forEach(function (t) { var v = el.querySelector("#t-" + t[0]).value.trim(); if (v) S.tpl[t[0]] = v; });
    };
    el.querySelector("#sAddProg").onclick = function () { read(); S.programs.push({ name: "برنامج جديد", g: "m", stage: "", status: "قادم", desc: "" }); renderSettings(el); };
    el.querySelector("#sAddMs").onclick = function () { read(); var last = S.milestones[S.milestones.length - 1]; S.milestones.push({ n: (last ? last.n : 0) + 4, name: "مرحلة جديدة", items: [] }); renderSettings(el); };
    el.querySelectorAll("[data-delprog]").forEach(function (b) { b.onclick = function () { read(); S.programs.splice(+b.dataset.delprog, 1); renderSettings(el); }; });
    el.querySelectorAll("[data-delms]").forEach(function (b) { b.onclick = function () { read(); S.milestones.splice(+b.dataset.delms, 1); renderSettings(el); }; });
    el.querySelector("#sSave").onclick = function () { read(); saveSettings(); };
    el.querySelector("#sExport").onclick = function () {
      var rows = [["الطالب", "ولي الأمر", "الجوال", "البرامج", "المشاركات", "المرحلة", "مؤسس", "كوبون أسرة ثروة", "هدايا مستحقة"]];
      DATA.ST.forEach(function (x) { rows.push([x.s.child.name, x.f.name, LY.famPhones(x.f).map(LY.displayPhone).join(" / "), x.s.programs.join(" / "), x.s.parts, x.s.reached ? x.s.reached.name : "", x.s.founder.map(function (f) { return f.program + " #" + f.n; }).join(" / "), (x.f.osra && x.f.osra.code) || "", x.s.due.map(function (d) { return d.text; }).join(" / ")]); });
      TH.copy(rows.map(function (r) { return r.map(function (c) { c = String(c == null ? "" : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\n"), "نسخنا الجدول، الصقه في Excel");
    };
  }
})();
