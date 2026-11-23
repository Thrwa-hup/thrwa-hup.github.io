/* محرك برنامج ولاء ثروة — يعمل في المتصفح (window.LY) وفي الاختبارات.
   المبدأ: نكسب ولاء الطالب المستمر بالتقدير بدون فلوس، والخصم لفئات محددة فقط. */
(function (root) {
  "use strict";

  var DEFAULT_SETTINGS = {
    currentTerm: "1448-ف1",
    previousTerm: "1447-ف2",
    terms: ["1447-ف1", "1447-ف2", "1447-صيفي", "1448-ف1", "1448-ف2", "1448-صيفي"],
    // status: قائم | جديد (يُطلق الآن: له مؤسسون) | قادم (قائمة اهتمام قبل فتح التسجيل)
    programs: [
      { name: "بسام", g: "m", stage: "ابتدائي", status: "جديد", desc: "للأشبال من 9 إلى 12 سنة" },
      { name: "تواق", g: "m", stage: "متوسط", status: "قائم", desc: "للأشبال من 12 إلى 15 سنة" },
      { name: "ترحال", g: "m", stage: "ثانوي", status: "قائم", desc: "للمرحلة الثانوية" },
      { name: "بناء", g: "m", stage: "ثانوي", status: "قادم", desc: "برنامج بنائي للمرحلة الثانوية" },
      { name: "مناهل", g: "f", stage: "ابتدائي", status: "قائم", desc: "للبنات في المرحلة الابتدائية" },
      { name: "عبق", g: "f", stage: "ابتدائي", status: "قائم", desc: "للبنات في المرحلة الابتدائية" },
      { name: "ثوى", g: "f", stage: "ابتدائي", status: "قائم", desc: "" },
      { name: "نيورا", g: "f", stage: "", status: "قائم", desc: "للفتيات: الذكاء الاصطناعي والبرمجة وتحليل البيانات" },
      { name: "مكث", g: "f", stage: "", status: "قائم", desc: "" }
    ],
    milestones: [
      { n: 1, name: "أهلًا بك", items: ["بطاقة «عضو ثروة» باسمه ورقم عضويته", "رسالة ترحيب من مشرفه باسمه", "للأهل: اتصال ترحيبي من المشرف"] },
      { n: 2, name: "رجع لنا", items: ["صورة تذكارية مطبوعة مع مجموعته ومشرفه", "ختم «رجع لنا» في جواز ثروة", "للأهل: تقرير قصير عن مشاركته"] },
      { n: 3, name: "المستمر", items: ["ألبوم صور خاص فيه معنا", "وسام «المستمر» يثبّته على حقيبته", "للأهل: أولوية التسجيل وضمان المقعد قبل الإعلان العام"] },
      { n: 5, name: "الركيزة", items: ["تيشيرت البرنامج باسمه ورقمه الثابت", "فيديو قصير لأبرز لحظاته معنا", "للأهل: دعوة ليوم الأسرة"] },
      { n: 8, name: "القائد", items: ["دور قيادي: قائد مجموعة أو مساعد مشرف", "رسالة مكتوبة بخط مشرفه", "للأهل: دعوة لمجلس أولياء الأمور"] },
      { n: 12, name: "ابن ثروة", items: ["كتاب «رحلتي مع ثروة» بصوره وإنجازاته", "تكريم في الحفل الختامي واسمه في لوحة الشرف", "للأهل: شهادة «شريك في التربية»"] }
    ],
    badges: ["الحضور الكامل", "المبادر", "الرفيق: جاب صاحبه", "القائد", "المساعد", "مصوّر الرحلة", "بطل الشهر", "سفير الإطلاق"],
    // الإطلاق: أول المسجلين في البرنامج الجديد «مؤسسون»
    foundersCap: 30,
    earlyDays: 3,
    founderItems: ["وسام «مؤسس {البرنامج}» برقمه الثابت", "اسمه على جدار المؤسسين", "أولوية دائمة في تسجيل {البرنامج}", "للأهل: شهادة «أسرة مؤسسة»"],
    registerUrl: "",
    // الخصم: لهذي الفئات فقط
    ref1: 10, ref2: 20, newPct: 10, refCap: 3,
    sib2: 15, sib3: 25,                // الإخوان في نفس البرنامج
    osra2: 15, osra3: 20, osra4: 25,   // كوبون «أسرة ثروة» الثابت: أبناء في برامج مختلفة
    needPct: 10,
    maxPct: 50,
    tpl: {
      milestone: "السلام عليكم، ولي أمر {الطالب} الكريم.\n{الطالب} وصل مرحلة «{المرحلة}» في ثروة بعد {العدد} مشاركات، وفخورين باستمراره معنا. جهّزنا له: {الهدايا}.\nشكرًا لثقتكم.\nجمعية ثروة الشبابية",
      badge: "السلام عليكم، ولي أمر {الطالب} الكريم.\nحصل {الطالب} على شارة «{الشارة}» في برنامج {البرنامج}. نبارك لكم ونفخر فيه.\nجمعية ثروة الشبابية",
      founder: "السلام عليكم، ولي أمر {الطالب} الكريم.\nمبروك! {الطالب} صار المؤسس رقم {الرقم} في برنامج {البرنامج}. ينتظره وسام المؤسس واسمه على جدار المؤسسين، وأولوية دائمة في التسجيل.\nجمعية ثروة الشبابية",
      launch: "السلام عليكم، ولي أمر {الطالب} الكريم.\nأطلقنا برنامج {البرنامج} {الوصف}. ولأنكم من أسرة ثروة، نفتح لكم التسجيل قبل الإعلان العام بـ {الأيام} أيام، وأول {المؤسسين} مسجل يصيرون «مؤسسين» بوسام ورقم ثابت واسمهم على جدار المؤسسين.\nجمعية ثروة الشبابية",
      interest: "السلام عليكم، {الاسم}.\nفتحنا تسجيل برنامج {البرنامج}، وأنتم من أول المسجلين في قائمة الاهتمام، فمقعدكم محفوظ قبل الإعلان العام.{الرابط}\nجمعية ثروة الشبابية",
      osra: "السلام عليكم، ولي أمر {الطالب} الكريم.\nشكرًا لثقتكم بتسجيل أبنائكم في {العدد} برامج من برامج ثروة. هذا كود «أسرة ثروة» الثابت لأسرتكم: {الكود}\nقيمته الآن {النسبة}%، وتزيد كل ما زادت برامج أبنائكم معنا.\nجمعية ثروة الشبابية",
      ref: "مبروك! {الطالب} جاب {العدد} من أقاربه وأصحابه لبرامج ثروة هذا الفصل. مكافأته كود خصم {النسبة}% على تسجيله الجاي: {الكود}\nجمعية ثروة الشبابية",
      free: "مبروك! {الطالب} جاب {العدد} من أقاربه وأصحابه لبرامج ثروة، ودورته الجاية علينا مجانًا. كود التسجيل المجاني: {الكود}\nجمعية ثروة الشبابية",
      sib: "السلام عليكم، ولي أمر {الطالب} الكريم.\nشكرًا لتسجيل {العدد} من أبنائكم في برنامج {البرنامج} هذا الفصل. هذا كود خصم الإخوان {النسبة}%: {الكود}\nجمعية ثروة الشبابية",
      need: "السلام عليكم، ولي أمر {الطالب} الكريم.\nيهمنا يكمّل {الطالب} معنا، وهذي هدية منّا: كود خصم {النسبة}% على تسجيله الجاي: {الكود}\nجمعية ثروة الشبابية",
      invite: "السلام عليكم، ولي أمر {الطالب} الكريم.\nهذا كود الإحالة الخاص بأسرتكم: {كود_الإحالة}\nأي قريب أو صديق يسجّل فيه ياخذ خصم {نسبة_الجديد}%، و{الطالب} ياخذ {إحالة1}% عن أول واحد، و{إحالة2}% عن الثاني، ومع الثالث تصير دورته الجاية مجانية.\nجمعية ثروة الشبابية",
      lapsed: "السلام عليكم، ولي أمر {الطالب} الكريم.\nافتقدنا {الطالب} هذا الفصل، ومجموعته تسأل عنه. مقعده محفوظ له قبل الإعلان العام، ونتشرف برجعته.\nجمعية ثروة الشبابية",
      stage: "السلام عليكم، ولي أمر {الطالب} الكريم.\n{الطالب} على وشك ينتقل للمرحلة الجاية، وبرنامج {البرنامج} ينتظره. حجزنا له مكان، وبيستقبله مشرف يعرفه.\nجمعية ثروة الشبابية",
      kids: "السلام عليكم، ولي أمر {الطالب} الكريم.\nسعيدين بوجود {الطالب} معنا. إذا عندكم إخوان له من عمر 9 إلى 18، برامج ثروة تناسبهم، ونرتّب لهم لقاء تجريبي.\nجمعية ثروة الشبابية"
    }
  };

  var DISCOUNT_TYPES = {
    ref: { label: "بند الرفقة", prefix: "BONUS", tpl: "ref" },
    free: { label: "بند الرفقة: دورة مجانية", prefix: "FREE", tpl: "free" },
    sib: { label: "بند الإخوان", prefix: "SIB", tpl: "sib" },
    need: { label: "هدية منّا (بعد الاعتماد)", prefix: "GIFT", tpl: "need" },
    osra: { label: "كوبون أسرة ثروة", prefix: "OSRA", tpl: "osra" },
    "new": { label: "خصم المسجّل الجديد", prefix: "", tpl: "" }
  };
  var OLD_LABELS = { gift: "بند الوفاء", fam: "الأسرة الشاملة", mix: "البنين والبنات", up: "الترقية", back: "العودة", stand: "الكود المستمر", amb: "السفير", camp: "حملة" };
  var TERM_DISCOUNTS = ["ref", "free", "sib", "need"];
  var NEED_FLAGS = [
    { k: "wa", t: "سأل في الواتساب عن خصم أو قال «غالي»" },
    { k: "price", t: "اختار «السعر» كعائق في التسجيل أو الاستبيان" },
    { k: "sup", t: "المشرف لاحظ إن الأهل مترددين بسبب التكلفة" }
  ];
  var NEXT_STAGE = { "ابتدائي": "متوسط", "متوسط": "ثانوي" };
  var LAST_GRADE = { "ابتدائي": 6, "متوسط": 9 };
  var GRADES = { "ابتدائي": [1, 6], "متوسط": [7, 9], "ثانوي": [10, 12] };
  var STAGE_ORDER = { "ابتدائي": 1, "متوسط": 2, "ثانوي": 3 };

  // ---------- أدوات ----------
  function toLatinDigits(s) {
    return String(s == null ? "" : s)
      .replace(/[٠-٩]/g, function (c) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(c)); })
      .replace(/[۰-۹]/g, function (c) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)); });
  }
  function normPhone(p) {
    var d = toLatinDigits(p).replace(/\D/g, "");
    if (d.indexOf("00966") === 0) d = d.slice(2);
    if (d.indexOf("966") === 0) return d;
    if (d.indexOf("05") === 0 && d.length === 10) return "966" + d.slice(1);
    if (d.indexOf("5") === 0 && d.length === 9) return "966" + d;
    return d;
  }
  function displayPhone(p) { return /^9665\d{8}$/.test(p) ? "0" + p.slice(3) : (p || ""); }
  // توحيد الأسماء للمطابقة: بدون تشكيل وتطويل، والهمزات والتاء المربوطة والألف المقصورة موحدة، وبدون «أبو/أم»
  function normName(s) {
    var t = String(s || "").replace(/\s+([\u064B-\u0652])/g, "$1").replace(/[ً-ٰٟـ]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
      .replace(/\(.*?\)/g, " ").replace(/[^ء-يa-zA-Z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    t = t.replace(/^(ابو|ام|والد|والده|ولي امر)\s+/, "");
    return t.split(" ").filter(function (w, i) { return !(i > 0 && /^(بن|بنت|ابن)$/.test(w)); })
      .map(function (w) { return w.replace(/^ال(?=.{3,})/, ""); }).join(" ");
  }
  // نفس الطالب داخل الأسرة: «عبدالله» = «عبدالله وليد البصيص»، و«ليان السيف» = «ليان عبدالله السيف»
  function sameKid(a, b) {
    var x = normName(a).split(" ").filter(Boolean), y = normName(b).split(" ").filter(Boolean);
    if (!x.length || !y.length || x[0] !== y[0]) return false;
    var s = x.length <= y.length ? x : y, l = x.length <= y.length ? y : x;
    return s.every(function (w) { return l.indexOf(w) >= 0; });
  }
  function progInfo(S, name) {
    for (var i = 0; i < S.programs.length; i++) if (S.programs[i].name === name) return S.programs[i];
    return null;
  }
  function progGender(S, name) { var p = progInfo(S, name); return p ? p.g : null; }
  function nextProgram(S, prog) {
    var p = progInfo(S, prog);
    if (!p || !NEXT_STAGE[p.stage]) return null;
    for (var i = 0; i < S.programs.length; i++) {
      var q = S.programs[i];
      if (q.g === p.g && q.stage === NEXT_STAGE[p.stage] && q.status !== "قادم") return q.name;
    }
    return null;
  }
  function mergeSettings(saved) {
    var S = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    if (!saved) return S;
    Object.keys(DEFAULT_SETTINGS).forEach(function (k) {
      if (k === "tpl") { if (saved.tpl) Object.keys(S.tpl).forEach(function (t) { if (saved.tpl[t]) S.tpl[t] = saved.tpl[t]; }); }
      else if (saved[k] !== undefined && saved[k] !== null) S[k] = saved[k];
    });
    S.programs = (S.programs || []).map(function (p) { return { name: p.name, g: p.g || "m", stage: p.stage || "", status: p.status || "قائم", desc: p.desc || "" }; });
    return S;
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function famPhones(fam) { return [fam.phone].concat(fam.phones || []).filter(Boolean); }
  function findFamily(list, phone) {
    var p = normPhone(phone);
    for (var i = 0; i < list.length; i++) if (famPhones(list[i]).indexOf(p) >= 0) return list[i];
    return null;
  }
  function fillTpl(tpl, vars) {
    return String(tpl || "").replace(/\{([^}]+)\}/g, function (m, k) { return vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m; });
  }

  // ---------- المؤسسون في البرامج الجديدة ----------
  // يرجع { برنامج: [{famId, childId, name, date, n}] } لأول foundersCap طالب في كل برنامج «جديد»
  function foundersMap(list, S) {
    var out = {};
    S.programs.filter(function (p) { return p.status === "جديد"; }).forEach(function (p) {
      var firsts = [];
      list.forEach(function (fam) {
        var seen = {};
        (fam.regs || []).forEach(function (r, idx) {
          if (r.program !== p.name || seen[r.childId]) return;
          seen[r.childId] = true;
          var kid = (fam.children || []).filter(function (k) { return k.id === r.childId; })[0];
          if (kid) firsts.push({ famId: fam.id, childId: kid.id, name: kid.name, date: r.date || "", at: r.at || "", idx: idx });
        });
      });
      firsts.sort(function (a, b) { return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (a.at < b.at ? -1 : a.at > b.at ? 1 : 0) || a.idx - b.idx; });
      out[p.name] = firsts.slice(0, S.foundersCap).map(function (f, i) { f.n = i + 1; return f; });
      out[p.name].total = firsts.length;
    });
    return out;
  }
  function founderOf(ctx, famId, childId) {
    var res = [];
    if (!ctx || !ctx.founders) return res;
    Object.keys(ctx.founders).forEach(function (prog) {
      ctx.founders[prog].forEach(function (f) { if (f.famId === famId && f.childId === childId) res.push({ program: prog, n: f.n }); });
    });
    return res;
  }

  // ---------- الطالب: مسار التقدير ----------
  function itemKey(m, i) { return m.n + "-" + i; }
  function studentInfo(fam, child, S, ctx) {
    var regs = (fam.regs || []).filter(function (r) { return r.childId === child.id; });
    var parts = regs.length;
    var ms = S.milestones.slice().sort(function (a, b) { return a.n - b.n; });
    var reached = null, next = null;
    ms.forEach(function (m) { if (parts >= m.n) reached = m; else if (!next) next = m; });
    var given = child.given || {};
    var due = [];
    // المستحق = هدايا المرحلة الحالية فقط، والمراحل السابقة تظهر في بطاقته
    if (reached) reached.items.forEach(function (it, i) { if (!given[itemKey(reached, i)]) due.push({ m: reached, i: i, key: itemKey(reached, i), text: it }); });
    var founder = founderOf(ctx, fam.id, child.id);
    founder.forEach(function (f) {
      S.founderItems.forEach(function (it, i) {
        var key = "f-" + f.program + "-" + i;
        if (!given[key]) due.push({ m: { n: 0, name: "مؤسس " + f.program + " #" + f.n }, i: i, key: key, text: it.replace(/\{البرنامج\}/g, f.program), founder: f });
      });
    });
    var prevN = reached ? reached.n : 0;
    var progress = next ? Math.round((parts - prevN) * 100 / (next.n - prevN)) : 100;
    var programs = {};
    regs.forEach(function (r) { programs[r.program] = true; });
    var inPrev = regs.some(function (r) { return r.term === S.previousTerm; });
    var inCur = regs.some(function (r) { return r.term === S.currentTerm; });
    var upgrade = null;
    var g = parseInt(child.grade, 10);
    if (g) Object.keys(programs).forEach(function (p) {
      var info = progInfo(S, p);
      if (info && LAST_GRADE[info.stage] === g && nextProgram(S, p) && !upgrade) upgrade = { from: p, to: nextProgram(S, p) };
    });
    return { child: child, regs: regs, parts: parts, reached: reached, next: next, toNext: next ? next.n - parts : 0,
      progress: progress, due: due, programs: Object.keys(programs), lapsed: inPrev && !inCur, inCur: inCur, upgrade: upgrade, founder: founder };
  }

  // ---------- كوبون أسرة ثروة ----------
  function osraValueFor(count, S) { return count >= 4 ? S.osra4 : count === 3 ? S.osra3 : count === 2 ? S.osra2 : 0; }
  function osraInfo(fam, S) {
    // عدد البرامج اللي فيها أبناء مختلفين: طالب واحد في برنامجين ما يحسب أسرة
    var progs = {}, kids = {};
    (fam.regs || []).forEach(function (r) { if (r.term === S.currentTerm) { progs[r.program] = true; kids[r.childId] = true; } });
    var list = Object.keys(progs), cnt = Math.min(list.length, Object.keys(kids).length), value = Math.min(osraValueFor(cnt, S), S.maxPct);
    var o = fam.osra || {};
    return { programs: list, count: cnt, value: value, code: o.code || "", applied: o.code ? (o.value || 0) : 0,
      change: (value > 0 && !o.code) || (!!o.code && (o.value || 0) !== value) };
  }

  // ---------- الأسرة ----------
  function familyInfo(fam, S, ctx) {
    var regs = fam.regs || [], refs = fam.refs || [], rewards = fam.rewards || [], kids = fam.children || [];
    var students = kids.map(function (k) { return studentInfo(fam, k, S, ctx); });
    var refsTerm = refs.filter(function (r) { return r.term === S.currentTerm; }).length;
    // الإخوان: في نفس البرنامج ونفس الفصل
    var byProg = {};
    regs.forEach(function (r) { if (r.term === S.currentTerm) { byProg[r.program] = byProg[r.program] || {}; byProg[r.program][r.childId] = true; } });
    var sibCount = 0, sibProg = "";
    Object.keys(byProg).forEach(function (p) { var n = Object.keys(byProg[p]).length; if (n > sibCount) { sibCount = n; sibProg = p; } });
    var flags = fam.flags || {};
    var needFlags = NEED_FLAGS.filter(function (f) { return flags[f.k]; });
    var decision = (fam.needDecision || {})[S.currentTerm] || "";
    var osra = osraInfo(fam, S);

    var auto = [];
    if (refsTerm >= S.refCap) auto.push({ type: "free", value: 100, count: refsTerm, why: "جاب " + refsTerm + " هذا الفصل" });
    else if (refsTerm === 2) auto.push({ type: "ref", value: S.ref2, count: 2, why: "جاب 2 هذا الفصل" });
    else if (refsTerm === 1) auto.push({ type: "ref", value: S.ref1, count: 1, why: "جاب 1 هذا الفصل" });
    if (sibCount >= 3) auto.push({ type: "sib", value: S.sib3, count: sibCount, program: sibProg, why: sibCount + " إخوان في " + sibProg + " هذا الفصل" });
    else if (sibCount === 2) auto.push({ type: "sib", value: S.sib2, count: 2, program: sibProg, why: "أخوين في " + sibProg + " هذا الفصل" });
    var needCand = needFlags.length && decision !== "no" ? { type: "need", value: S.needPct, why: needFlags.map(function (f) { return f.t; }).join("، "), approval: true } : null;

    var all = auto.concat(needCand ? [needCand] : []);
    all.forEach(function (c) { if (c.type !== "free") c.value = Math.min(c.value, S.maxPct); });
    var PRIO = ["free", "sib", "ref", "need"];
    all.sort(function (a, b) { return (b.value - a.value) || (PRIO.indexOf(a.type) - PRIO.indexOf(b.type)); });
    var issued = rewards.filter(function (w) { return w.term === S.currentTerm && TERM_DISCOUNTS.indexOf(w.type) >= 0 && w.status !== "ملغى"; });
    var topIssued = issued.reduce(function (m, w) { return Math.max(m, w.value || 0); }, 0);
    var best = all[0] || null;
    // خصم واحد والأعلى يكسب: ما نصدر كود أقل من المصدر أو من كوبون أسرة ثروة
    var pending = best && best.value > Math.max(topIssued, osra.value) ? best : null;

    var reach = [];
    var done = fam.reach || {};
    students.forEach(function (s) {
      if (s.lapsed) reach.push({ key: "lapsed-" + s.child.id + "-" + S.currentTerm, kind: "lapsed", child: s.child.name, t: s.child.name + " سجّل في " + S.previousTerm + " وما سجّل في " + S.currentTerm });
      if (s.upgrade) reach.push({ key: "stage-" + s.child.id + "-" + s.upgrade.to, kind: "stage", child: s.child.name, program: s.upgrade.to, t: s.child.name + " في آخر سنة من " + s.upgrade.from + "، وينتقل إلى " + s.upgrade.to });
    });
    var regKids = students.filter(function (s) { return s.parts > 0; }).length;
    if ((fam.kidsCount || 0) > regKids) reach.push({ key: "kids-" + (fam.kidsCount || 0), kind: "kids", t: "عندهم " + ((fam.kidsCount || 0) - regKids) + " من الأبناء بعمر البرامج غير مسجلين" });
    reach = reach.filter(function (r) { return !done[r.key]; });

    var loyal = students.some(function (s) { return s.parts >= 3; });
    return { students: students, refsTerm: refsTerm, refsTotal: refs.length, sibCount: sibCount, sibProg: sibProg, needFlags: needFlags, decision: decision,
      cands: all, pending: pending, topIssued: topIssued, reach: reach, osra: osra, loyal: loyal };
  }

  // ---------- الإطلاق: البرنامج الجديد والقادم ----------
  function launchInfo(list, S, ctx) {
    ctx = ctx || { founders: foundersMap(list, S) };
    return S.programs.filter(function (p) { return p.status === "جديد" || p.status === "قادم"; }).map(function (p) {
      var key = "launch-" + p.name, rng = GRADES[p.stage], targets = [], regsCur = 0, kidsIn = 0;
      list.forEach(function (fam) {
        var inProg = (fam.regs || []).filter(function (r) { return r.program === p.name; });
        regsCur += inProg.filter(function (r) { return r.term === S.currentTerm; }).length;
        var kidSet = {};
        inProg.forEach(function (r) { kidSet[r.childId] = true; });
        kidsIn += Object.keys(kidSet).length;
        if (inProg.length) return;
        var info = familyInfo(fam, S, ctx), why = [];
        (fam.children || []).forEach(function (k) {
          var g = parseInt(k.grade, 10), gender = k.gender || "m";
          if (gender === p.g && g && rng && g >= rng[0] && g <= rng[1]) why.push(k.name + " في الصف المناسب");
        });
        if (STAGE_ORDER[p.stage]) info.students.forEach(function (s) {
          if ((s.child.gender || "m") !== p.g) return;
          s.programs.forEach(function (pr) {
            var q = progInfo(S, pr);
            if (q && STAGE_ORDER[q.stage] > STAGE_ORDER[p.stage]) why.push("أخوه الأكبر " + s.child.name + " في " + pr + "، ممكن عندهم أصغر");
          });
        });
        if ((fam.kidsCount || 0) > info.students.filter(function (s) { return s.parts > 0; }).length) why.push("عندهم أبناء بعمر البرامج غير مسجلين");
        if (!why.length && !info.loyal) return;
        targets.push({ fam: fam, loyal: info.loyal, why: why.filter(function (w, i, a) { return a.indexOf(w) === i; }), done: (fam.reach || {})[key] || "" });
      });
      targets.sort(function (a, b) { return (!!a.done - !!b.done) || (b.loyal - a.loyal) || (b.why.length - a.why.length); });
      var founders = (ctx.founders || {})[p.name] || [];
      return { program: p, key: key, regsCur: regsCur, kids: kidsIn, founders: founders, seatsLeft: p.status === "جديد" ? Math.max(0, S.foundersCap - founders.length) : 0, targets: targets };
    });
  }
  function launchMessage(fam, p, S) {
    return fillTpl(S.tpl.launch, msgVars(fam, S, { "البرنامج": p.name, "الوصف": p.desc || "", "الأيام": S.earlyDays, "المؤسسين": S.foundersCap }));
  }
  function founderMessage(fam, child, f, S) {
    return fillTpl(S.tpl.founder, msgVars(fam, S, { "الطالب": child.name, "البرنامج": f.program, "الرقم": f.n }));
  }
  function interestMessage(item, S) {
    return fillTpl(S.tpl.interest, { "الاسم": item.parent_name || ("ولي أمر " + (item.child_name || "")), "البرنامج": item.program, "الرابط": S.registerUrl ? "\nرابط التسجيل: " + S.registerUrl : "" });
  }
  // أولوية من في قائمة الاهتمام: أسرة موجودة؟ مستمرة؟
  function interestMatch(item, list, S, ctx) {
    var fam = findFamily(list, item.phone);
    var by = "phone";
    if (!fam && item.parent_name) {
      var n = normName(item.parent_name);
      if (n.split(" ").length >= 2) fam = list.filter(function (f) { return normName(f.name) === n; })[0] || null;
      by = "name";
    }
    if (!fam) return { fam: null, loyal: false, parts: 0, by: "" };
    var info = familyInfo(fam, S, ctx);
    return { fam: fam, loyal: info.loyal, parts: info.students.reduce(function (m, s) { return Math.max(m, s.parts); }, 0), by: by };
  }

  // ---------- المطابقة بالجوال ثم بالأسماء ----------
  function surname(n) { var w = normName(n).split(" "); return w.length > 1 ? w[w.length - 1] : ""; }
  // الإخوة يشتركون في اسم الأب والعائلة: «سعد محمد العتيبي» و«نورة محمد العتيبي»
  function lineage(n) { var w = normName(n).split(" "); return w.length >= 3 ? w.slice(-2).join(" ") : ""; }
  // الكنية: «أم سعد» تعني أن عندهم ابن اسمه سعد
  function kunya(n) { var m = String(n || "").replace(/[أإآ]/g, "ا").trim().match(/^(ابو|ام)\s+(\S+)/); return m ? normName(m[2]) : ""; }
  function sameFamilyWhy(pa, kidsA, pb, kidsB) {
    var why = [];
    var na = normName(pa), nb = normName(pb);
    if (na && na === nb && na.split(" ").length >= 2) why.push("نفس اسم ولي الأمر");
    var sa = surname(pa), sb = surname(pb);
    kidsA.forEach(function (ka) {
      kidsB.forEach(function (kb) {
        var x = normName(ka), y = normName(kb);
        if (!x || !y) return;
        if (x === y && x.split(" ").length >= 2) why.push("نفس اسم الطالب: " + ka);
        else if (lineage(ka) && lineage(ka) === lineage(kb)) why.push("إخوة: نفس اسم الأب والعائلة (" + lineage(ka) + ")");
        else if (x.split(" ")[0] === y.split(" ")[0] && sa && sa === sb) why.push("نفس الطالب «" + x.split(" ")[0] + "» ونفس اسم العائلة");
      });
    });
    var famSur = function (kids, p) { return kids.map(surname).concat([surname(p)]).filter(Boolean); };
    var surA = famSur(kidsA, pa), surB = famSur(kidsB, pb);
    var shareSur = !surA.length || !surB.length || surA.some(function (x) { return surB.indexOf(x) >= 0; });
    [[pa, kidsB], [pb, kidsA]].forEach(function (pair) {
      var k = kunya(pair[0]);
      if (k && shareSur && pair[1].some(function (c) { return normName(c).split(" ")[0] === k; })) why.push("الكنية «" + pair[0] + "» تطابق ابنهم");
    });
    return why.filter(function (w, i, arr) { return arr.indexOf(w) === i; });
  }
  function matchSuggestions(list) {
    var out = [], dismissed = {};
    list.forEach(function (f) { (f.notSame || []).forEach(function (id) { dismissed[f.id + "|" + id] = dismissed[id + "|" + f.id] = true; }); });
    for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) {
      var a = list[i], b = list[j];
      if (dismissed[a.id + "|" + b.id]) continue;
      var kn = function (f) { return (f.children || []).map(function (k) { return k.name; }); };
      var why = sameFamilyWhy(a.name, kn(a), b.name, kn(b));
      if (why.length) out.push({ a: a, b: b, why: why });
    }
    return out;
  }
  function mergeFamilies(a, b) {
    var m = clone(a), y = clone(b);
    m.phones = famPhones(m).concat(famPhones(y)).filter(function (p, i, arr) { return arr.indexOf(p) === i && p !== m.phone; });
    if (!m.name && y.name) m.name = y.name;
    var idMap = {};
    (y.children || []).forEach(function (k) {
      var same = m.children.filter(function (c) { return normName(c.name) === normName(k.name); })[0] || m.children.filter(function (c) { return sameKid(c.name, k.name); })[0];
      if (same) {
        idMap[k.id] = same.id;
        Object.keys(k.given || {}).forEach(function (g) { same.given = same.given || {}; if (!same.given[g]) same.given[g] = k.given[g]; });
        Object.keys(k.badges || {}).forEach(function (g) { same.badges = same.badges || {}; if (!same.badges[g]) same.badges[g] = k.badges[g]; });
        if (!same.grade && k.grade) same.grade = k.grade;
      } else { idMap[k.id] = k.id; m.children.push(k); }
    });
    (y.regs || []).forEach(function (r) {
      r.childId = idMap[r.childId] || r.childId;
      var dup = m.regs.some(function (x) { return x.childId === r.childId && x.program === r.program && x.term === r.term && (x.cycle || "") === (r.cycle || ""); });
      if (!dup) m.regs.push(r);
    });
    ["refs", "rewards"].forEach(function (k) { m[k] = (m[k] || []).concat(y[k] || []); });
    ["reach", "needDecision", "flags"].forEach(function (k) { m[k] = Object.assign({}, y[k] || {}, m[k] || {}); });
    m.kidsCount = Math.max(m.kidsCount || 0, y.kidsCount || 0);
    if (!m.osra && y.osra) m.osra = y.osra;
    m.mergedFrom = (m.mergedFrom || []).concat([y.id]);
    m.notes = [m.notes, y.notes].filter(Boolean).join("\n");
    return m;
  }

  // ---------- الرسائل ----------
  function firstKidName(fam) { return fam.children && fam.children.length ? fam.children[0].name : (fam.name || ""); }
  function msgVars(fam, S, extra) {
    var v = { "الاسم": fam.name || "", "الطالب": firstKidName(fam), "كود_الإحالة": fam.refCode || "",
      "نسبة_الجديد": S.newPct, "إحالة1": S.ref1, "إحالة2": S.ref2, "الحد": S.refCap };
    Object.keys(extra || {}).forEach(function (k) { v[k] = extra[k]; });
    return v;
  }
  function milestoneMessage(fam, info, m, S) {
    return fillTpl(S.tpl.milestone, msgVars(fam, S, { "الطالب": info.child.name, "المرحلة": m.name, "العدد": info.parts,
      "الهدايا": m.items.filter(function (x) { return x.indexOf("للأهل") !== 0; }).join("، ") }));
  }
  function badgeMessage(fam, child, badge, S) {
    var r = (fam.regs || []).filter(function (x) { return x.childId === child.id; });
    return fillTpl(S.tpl.badge, msgVars(fam, S, { "الطالب": child.name, "الشارة": badge, "البرنامج": r.length ? r[r.length - 1].program : "ثروة" }));
  }
  function reachMessage(fam, r, S) {
    return fillTpl(S.tpl[r.kind], msgVars(fam, S, { "الطالب": r.child || firstKidName(fam), "البرنامج": r.program || "" }));
  }
  function discountMessage(fam, rec, S) {
    var t = DISCOUNT_TYPES[rec.type];
    if (!t || !t.tpl) return "";
    return fillTpl(S.tpl[t.tpl], msgVars(fam, S, { "الكود": rec.code, "النسبة": rec.value, "العدد": rec.count || "", "البرنامج": rec.program || "" }));
  }
  function osraMessage(fam, S) {
    var o = osraInfo(fam, S);
    return fillTpl(S.tpl.osra, msgVars(fam, S, { "الكود": (fam.osra || {}).code || "", "النسبة": o.value, "العدد": o.count }));
  }
  function waLink(phone, msg) { return "https://wa.me/" + phone + (msg ? "?text=" + encodeURIComponent(msg) : ""); }

  // ---------- الأكواد والتسجيل ----------
  var CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function genCode(prefix, taken) {
    for (var t = 0; t < 200; t++) {
      var s = "";
      for (var i = 0; i < 4; i++) s += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
      var code = (prefix ? prefix + "-" : "") + s;
      if (!taken || !taken[code]) { if (taken) taken[code] = true; return code; }
    }
    return (prefix ? prefix + "-" : "") + Date.now().toString(36).toUpperCase().slice(-6);
  }
  function takenCodes(list) {
    var t = {};
    list.forEach(function (f) { if (f.refCode) t[f.refCode] = true; if (f.osra && f.osra.code) t[f.osra.code] = true; (f.rewards || []).forEach(function (w) { if (w.code) t[w.code] = true; }); });
    return t;
  }
  function newFamily(name, phone) {
    return { id: uid(), name: name || "", phone: phone, phones: [], kidsCount: 0, flags: {}, notes: "", children: [], regs: [], refs: [], rewards: [],
      reach: {}, needDecision: {}, refCode: "", refCodeSent: false, createdAt: new Date().toISOString() };
  }
  // يربط التسجيل بالأسرة: بالجوال أولًا، ثم attachTo إذا اختار المستخدم أسرة مطابقة بالاسم
  function applyRegistration(fams, input, S, taken) {
    var notes = [];
    var phone = normPhone(input.phone);
    if (!phone || phone.length < 9) return { error: "رقم الجوال غير صحيح" };
    if (!input.childName || !input.program || !input.term) return { error: "اسم الطالب والبرنامج والفصل مطلوبة" };
    var existing = findFamily(fams, phone);
    if (!existing && input.attachTo) {
      existing = fams.filter(function (f) { return f.id === input.attachTo; })[0] || null;
      if (existing) notes.push("انربط الجوال " + displayPhone(phone) + " بأسرة " + (existing.name || firstKidName(existing)) + " كرقم ثاني.");
    }
    var fam = existing ? clone(existing) : newFamily(input.parentName, phone);
    if (existing && famPhones(fam).indexOf(phone) < 0) { fam.phones = (fam.phones || []).concat([phone]); }
    if (input.parentName && !fam.name) fam.name = input.parentName;
    if (input.kidsCount && +input.kidsCount > (fam.kidsCount || 0)) fam.kidsCount = +input.kidsCount;
    if (input.price) { fam.flags = fam.flags || {}; fam.flags.price = true; }
    var wasNew = !existing || (existing.regs || []).length === 0;
    var cname = String(input.childName).trim();
    var child = null;
    for (var c = 0; c < fam.children.length; c++) if (normName(fam.children[c].name) === normName(cname)) { child = fam.children[c]; break; }
    if (!child) for (var c2 = 0; c2 < fam.children.length; c2++) if (sameKid(fam.children[c2].name, cname)) { child = fam.children[c2]; break; }
    if (!child) { child = { id: uid(), name: cname, gender: input.gender || progGender(S, input.program) || "m", grade: input.grade || "", given: {}, badges: {} }; fam.children.push(child); }
    else {
      if (input.grade) child.grade = input.grade;
      if (normName(cname).split(" ").length > normName(child.name).split(" ").length) child.name = cname;
    }
    var cycle = String(input.cycle || "").trim();
    var dup = fam.regs.some(function (r) { return r.childId === child.id && r.program === input.program && r.term === input.term && (r.cycle || "") === cycle; });
    if (dup) return { error: "هذا التسجيل موجود من قبل", fam: fam };
    var code = String(input.refCode || "").trim().toUpperCase();
    fam.regs.push({ id: uid(), childId: child.id, program: input.program, term: input.term, cycle: cycle, date: input.date || today(), at: new Date().toISOString(), via: code });
    if (!fam.refCode) fam.refCode = genCode("THR", taken);
    var refFam = null;
    if (code) {
      var found = null;
      for (var j = 0; j < fams.length; j++) if ((fams[j].refCode || "").toUpperCase() === code) { found = fams[j]; break; }
      if (!found) notes.push("كود الإحالة " + code + " غير معروف، فما انحسبت إحالة.");
      else if (found.id === fam.id) notes.push("ما يصير الأسرة تحيل نفسها.");
      else if (!wasNew) notes.push("الأسرة مسجلة عندنا من قبل، فالإحالة ما تنحسب.");
      else if ((found.refs || []).some(function (r) { return r.famId === fam.id; })) notes.push("هذي الإحالة محسوبة من قبل.");
      else {
        refFam = clone(found);
        refFam.refs = refFam.refs || [];
        refFam.refs.push({ id: uid(), famId: fam.id, famName: fam.name, childName: cname, program: input.program, term: input.term, date: today() });
        fam.referredBy = refFam.id;
        fam.rewards.push({ id: uid(), type: "new", value: S.newPct, code: code, term: input.term, status: "مستخدم", date: today() });
        notes.push("انحسبت إحالة لأسرة " + (refFam.name || firstKidName(refFam)) + "، والمسجّل الجديد ياخذ خصم " + S.newPct + "%.");
      }
    }
    var o = osraInfo(fam, S);
    if (o.change && o.value) notes.push("الأسرة صار لها أبناء في " + o.count + " برامج: كوبون «أسرة ثروة» " + o.value + "% يظهر في «المطلوب اليوم».");
    return { fam: fam, refFam: refFam, isNewFamily: !existing, notes: notes };
  }
  // اقتراح أسر مطابقة بالاسم قبل إنشاء أسرة جديدة
  function nameCandidates(fams, parentName, childName) {
    return fams.filter(function (f) { return sameFamilyWhy(parentName, childName ? [childName] : [], f.name, (f.children || []).map(function (k) { return k.name; })).length > 0; });
  }
  function issueDiscount(fam, cand, S, taken) {
    var f = clone(fam);
    f.rewards = f.rewards || [];
    f.rewards.forEach(function (w) { if (w.term === S.currentTerm && TERM_DISCOUNTS.indexOf(w.type) >= 0 && w.status === "مرسل") w.status = "ملغى"; });
    var rec = { id: uid(), type: cand.type, value: cand.value, code: genCode(DISCOUNT_TYPES[cand.type].prefix, taken), term: S.currentTerm,
      status: "مرسل", date: today(), why: cand.why || "", count: cand.count || 0, program: cand.program || "" };
    f.rewards.push(rec);
    if (cand.type === "need") { f.needDecision = f.needDecision || {}; f.needDecision[S.currentTerm] = "yes"; }
    return { fam: f, reward: rec };
  }
  // يثبت قيمة كوبون أسرة ثروة بعد تحديثه في المتجر (الكود نفسه ما يتغير)
  function applyOsra(fam, S, taken) {
    var f = clone(fam), o = osraInfo(f, S);
    f.osra = f.osra || {};
    if (!f.osra.code) f.osra.code = genCode("OSRA", taken);
    f.osra.history = (f.osra.history || []).concat([{ value: o.value, term: S.currentTerm, date: today() }]);
    f.osra.value = o.value;
    f.osra.at = today();
    return f;
  }

  var LY = {
    DEFAULT_SETTINGS: DEFAULT_SETTINGS, DISCOUNT_TYPES: DISCOUNT_TYPES, OLD_LABELS: OLD_LABELS, NEED_FLAGS: NEED_FLAGS, GRADES: GRADES,
    toLatinDigits: toLatinDigits, normPhone: normPhone, displayPhone: displayPhone, normName: normName, sameKid: sameKid, progInfo: progInfo, progGender: progGender,
    nextProgram: nextProgram, mergeSettings: mergeSettings, today: today, uid: uid, clone: clone, famPhones: famPhones, findFamily: findFamily,
    foundersMap: foundersMap, studentInfo: studentInfo, osraInfo: osraInfo, familyInfo: familyInfo, launchInfo: launchInfo,
    matchSuggestions: matchSuggestions, mergeFamilies: mergeFamilies, nameCandidates: nameCandidates, interestMatch: interestMatch,
    fillTpl: fillTpl, msgVars: msgVars, milestoneMessage: milestoneMessage, badgeMessage: badgeMessage, reachMessage: reachMessage,
    discountMessage: discountMessage, osraMessage: osraMessage, launchMessage: launchMessage, founderMessage: founderMessage, interestMessage: interestMessage,
    waLink: waLink, genCode: genCode, takenCodes: takenCodes, applyRegistration: applyRegistration, issueDiscount: issueDiscount, applyOsra: applyOsra
  };
  root.LY = LY;
  if (typeof module !== "undefined" && module.exports) module.exports = LY;
})(typeof window !== "undefined" ? window : globalThis);
