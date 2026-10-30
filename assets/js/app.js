/* Nexus Tech — shell bersama: header, footer, tema, bahasa, pencarian, notifikasi, berbagi, komentar */
(function () {
  'use strict';
  var NT = window.NT, $ = function (s, r) { return (r || document).querySelector(s); };
  NT.$ = $;
  NT.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- i18n (UI inti; konten proyek tetap bahasa Indonesia) ----------
  var LANGS = { id: ['Indonesia', 'id-ID'], en: ['English', 'en-US'], ja: ['日本語', 'ja-JP'], ko: ['한국어', 'ko-KR'], zh: ['中文', 'zh-CN'], ar: ['العربية', 'ar-SA'], de: ['Deutsch', 'de-DE'], fr: ['Français', 'fr-FR'], es: ['Español', 'es-ES'] };
  NT.LANGS = LANGS;
  var T = {
    id: { home: 'Beranda', about: 'Tentang', services: 'Layanan', portfolio: 'Portofolio', partners: 'Mitra', journey: 'Perjalanan', faq: 'FAQ', contact: 'Kontak', search: 'Cari', notif: 'Notifikasi', ai: 'Tanya Nexus AI', theme: 'Ganti tema', menu: 'Menu' },
    en: { home: 'Home', about: 'About', services: 'Services', portfolio: 'Portfolio', partners: 'Partners', journey: 'Journey', faq: 'FAQ', contact: 'Contact', search: 'Search', notif: 'Notifications', ai: 'Ask Nexus AI', theme: 'Toggle theme', menu: 'Menu' },
    ja: { home: 'ホーム', about: '会社概要', services: 'サービス', portfolio: '実績', partners: 'パートナー', journey: '沿革', faq: 'よくある質問', contact: 'お問い合わせ', search: '検索', notif: '通知', ai: 'Nexus AIに質問', theme: 'テーマ切替', menu: 'メニュー' },
    ko: { home: '홈', about: '소개', services: '서비스', portfolio: '포트폴리오', partners: '파트너', journey: '연혁', faq: '자주 묻는 질문', contact: '문의', search: '검색', notif: '알림', ai: 'Nexus AI에게 질문', theme: '테마 전환', menu: '메뉴' },
    zh: { home: '首页', about: '关于', services: '服务', portfolio: '作品集', partners: '合作伙伴', journey: '发展历程', faq: '常见问题', contact: '联系', search: '搜索', notif: '通知', ai: '咨询 Nexus AI', theme: '切换主题', menu: '菜单' },
    ar: { home: 'الرئيسية', about: 'من نحن', services: 'الخدمات', portfolio: 'الأعمال', partners: 'الشركاء', journey: 'مسيرتنا', faq: 'الأسئلة الشائعة', contact: 'اتصل بنا', search: 'بحث', notif: 'الإشعارات', ai: 'اسأل Nexus AI', theme: 'تبديل السمة', menu: 'القائمة' },
    de: { home: 'Start', about: 'Über uns', services: 'Leistungen', portfolio: 'Portfolio', partners: 'Partner', journey: 'Werdegang', faq: 'FAQ', contact: 'Kontakt', search: 'Suche', notif: 'Benachrichtigungen', ai: 'Nexus AI fragen', theme: 'Design wechseln', menu: 'Menü' },
    fr: { home: 'Accueil', about: 'À propos', services: 'Services', portfolio: 'Portfolio', partners: 'Partenaires', journey: 'Parcours', faq: 'FAQ', contact: 'Contact', search: 'Rechercher', notif: 'Notifications', ai: 'Demander à Nexus AI', theme: 'Changer de thème', menu: 'Menu' },
    es: { home: 'Inicio', about: 'Nosotros', services: 'Servicios', portfolio: 'Portafolio', partners: 'Socios', journey: 'Trayectoria', faq: 'FAQ', contact: 'Contacto', search: 'Buscar', notif: 'Notificaciones', ai: 'Preguntar a Nexus AI', theme: 'Cambiar tema', menu: 'Menú' }
  };
  NT.lang = function () { var l = NT.db().settings.lang; return LANGS[l] ? l : 'id'; };
  NT.t = function (k) { return (T[NT.lang()] || T.id)[k] || T.id[k] || k; };
  NT.setLang = function (l) {
    if (!LANGS[l]) return;
    NT.db().settings.lang = l; NT.save();
    document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  };

  // ---------- tema ----------
  function applyTheme() {
    var m = NT.db().settings.theme, dark = m === 'dark' || (m === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
  NT.toggleTheme = function () {
    var cur = document.documentElement.getAttribute('data-theme');
    NT.db().settings.theme = cur === 'dark' ? 'light' : 'dark'; NT.save(); applyTheme(); renderThemeBtn();
  };
  function renderThemeBtn() { var b = $('#themeBtn'); if (b) b.innerHTML = icon(document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon'); }
  applyTheme();

  // ---------- notifikasi publik (milik pengunjung, di browser ini) ----------
  NT.pubNotify = function (text) {
    var k = 'nt.pubnotif', a = []; try { a = JSON.parse(localStorage.getItem(k)) || []; } catch (e) {}
    a.unshift({ at: NT.now(), text: text, read: false }); localStorage.setItem(k, JSON.stringify(a.slice(0, 30))); NT.toast(text); updateBell();
  };
  function pubNotifs() { try { return JSON.parse(localStorage.getItem('nt.pubnotif')) || []; } catch (e) { return []; } }
  function updateBell() { var n = pubNotifs().filter(function (x) { return !x.read; }).length, b = $('#bellBadge'); if (b) { b.textContent = n; b.hidden = !n; } }

  // ---------- header & footer ----------
  var NAV = [['index.html', 'home'], ['about.html', 'about'], ['services.html', 'services'], ['portfolio.html', 'portfolio'], ['partners.html', 'partners'], ['company-journey.html', 'journey'], ['faq.html', 'faq'], ['contact.html', 'contact']];
  function header() {
    var opts = Object.keys(LANGS).map(function (k) { return '<option value="' + k + '"' + (k === NT.lang() ? ' selected' : '') + '>' + LANGS[k][0] + '</option>'; }).join('');
    $('#site-header').outerHTML =
      '<a class="skip" href="#main">Lewati ke konten</a><header class="site-header"><div class="container nav">' +
      '<a class="brand" href="index.html" aria-label="Nexus Tech — beranda"><img src="assets/icons/logo.svg" alt="" width="36" height="36"><span>Nexus<span class="grad-text">Tech</span></span></a>' +
      '<nav class="nav-links" id="navLinks" aria-label="Utama">' + NAV.map(function (n) { return '<a href="' + n[0] + '"' + '' + '>' + NT.esc(NT.t(n[1])) + '</a>'; }).join('') + '</nav>' +
      '<div class="nav-tools">' +
      '<select class="lang-select" id="langSel" aria-label="Bahasa / Language">' + opts + '</select>' +
      '<button class="icon-btn" id="searchBtn" aria-label="' + NT.esc(NT.t('search')) + '">' + icon('search') + '</button>' +
      '<button class="icon-btn" id="bellBtn" aria-label="' + NT.esc(NT.t('notif')) + '">' + icon('bell') + '<span class="badge-dot" id="bellBadge" hidden>0</span></button>' +
      '<button class="icon-btn" id="themeBtn" aria-label="' + NT.esc(NT.t('theme')) + '"></button>' +
      '<button class="icon-btn menu-btn" id="menuBtn" aria-label="' + NT.esc(NT.t('menu')) + '" aria-expanded="false" aria-controls="navLinks">' + icon('menu') + '</button>' +
      '</div></div></header>';
  }
  function footer() {
    var c = NT.db().company;
    var f = $('#site-footer'); if (!f) return;
    f.outerHTML = '<footer class="site-footer"><div class="container"><div class="foot-grid">' +
      '<div><div class="brand" style="color:#fff"><img src="assets/icons/logo.svg" alt="" width="34" height="34"> Nexus Tech</div><p style="margin-top:12px">' + NT.esc(c.tagline) + '</p></div>' +
      '<div><h3>Layanan</h3><ul><li><a href="portfolio.html?cat=web">Web Development</a></li><li><a href="portfolio.html?cat=wiring">Wiring & Jaringan</a></li><li><a href="portfolio.html?cat=iot">IoT & Otomasi</a></li><li><a href="portfolio.html?cat=robotics">Robotika</a></li></ul></div>' +
      '<div><h3>Perusahaan</h3><ul><li><a href="about.html">Tentang</a></li><li><a href="company-journey.html">Perjalanan</a></li><li><a href="partners.html">Mitra</a></li><li><a href="faq.html">FAQ</a></li></ul></div>' +
      '<div><h3>Kontak</h3><ul><li><a href="contact.html">Formulir kontak</a></li>' + (c.email ? '<li>' + NT.esc(c.email) + '</li>' : '') + (c.address ? '<li>' + NT.esc(c.address) + '</li>' : '') + '<li><a href="login.html">Admin</a></li></ul></div>' +
      '</div><div class="copy">© <span id="yr"></span> Nexus Tech. Konten berlabel DEMO adalah contoh, bukan proyek/mitra nyata.</div></div></footer>';
    $('#yr').textContent = new Date().getFullYear();
  }

  // ---------- modal util ----------
  NT.modal = function (title, html, wide) {
    var back = document.createElement('div'); back.className = 'modal-back open';
    back.innerHTML = '<div class="modal ' + (wide || '') + '" role="dialog" aria-modal="true" aria-label="' + NT.esc(title) + '"><div class="modal-head"><h2>' + NT.esc(title) + '</h2><button class="icon-btn" aria-label="Tutup" data-close>' + icon('close') + '</button></div><div class="modal-body">' + html + '</div></div>';
    var prev = document.activeElement;
    function close() { back.remove(); document.removeEventListener('keydown', esc); if (prev && prev.focus) prev.focus(); }
    function esc(e) { if (e.key === 'Escape') close(); }
    back.addEventListener('click', function (e) { if (e.target === back || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', esc); document.body.appendChild(back);
    var f = back.querySelector('input,button,select,textarea'); if (f) f.focus();
    back.close = close; return back;
  };

  // ---------- pencarian global ----------
  function searchIndex() {
    var d = NT.db(), r = [];
    NT.published(d.projects).forEach(function (p) { r.push({ t: p.title, s: NT.CATS[p.cat].label + ' · ' + p.summary, u: 'project-detail.html?id=' + encodeURIComponent(p.id), i: 'layers', k: [p.title, p.summary, p.tech.join(' '), p.cat].join(' ') }); });
    NT.published(d.partners).forEach(function (p) { r.push({ t: p.name, s: 'Mitra · ' + NT.PCATS[p.cat], u: 'partners.html?p=' + encodeURIComponent(p.id), i: 'handshake', k: [p.name, p.profile, p.services, p.country].join(' ') }); });
    NT.published(d.milestones).forEach(function (m) { r.push({ t: m.title, s: 'Perjalanan · ' + m.date, u: 'company-journey.html#' + m.id, i: 'clock', k: [m.title, m.desc, m.date].join(' ') }); });
    NT.published(d.faqs).forEach(function (f) { r.push({ t: f.q, s: 'FAQ', u: 'faq.html#' + f.id, i: 'info', k: f.q + ' ' + f.a }); });
    d.services.forEach(function (s) { r.push({ t: s.title, s: 'Layanan', u: 'services.html#' + s.id, i: 'wrench', k: s.title + ' ' + s.desc }); });
    return r;
  }
  function openSearch() {
    var m = NT.modal(NT.t('search'), '<input type="search" id="gq" placeholder="Proyek, mitra, layanan, FAQ…" aria-label="Kata kunci" style="width:100%;padding:14px"><div class="results" id="gres" aria-live="polite"></div>');
    var idx = searchIndex(), q = m.querySelector('#gq'), res = m.querySelector('#gres');
    function run() {
      var v = q.value.trim().toLowerCase(); if (v.length < 2) { res.innerHTML = '<p class="muted">Ketik minimal 2 huruf.</p>'; return; }
      var hit = idx.filter(function (x) { return x.k.toLowerCase().indexOf(v) > -1; }).slice(0, 25);
      res.innerHTML = hit.length ? hit.map(function (x) { return '<a class="result" href="' + x.u + '">' + icon(x.i) + '<span><strong>' + NT.esc(x.t) + '</strong><br><small class="muted">' + NT.esc(x.s.slice(0, 110)) + '</small></span></a>'; }).join('') : '<p class="muted">Tidak ada hasil.</p>';
    }
    q.addEventListener('input', run); run();
  }
  function openBell() {
    var a = pubNotifs(), html = a.length ? '<div class="notif-list">' + a.map(function (n) { return '<div class="n">' + NT.esc(n.text) + '<br><small class="muted">' + NT.esc(NT.fmt(n.at)) + '</small></div>'; }).join('') + '</div>' : '<p class="muted">Belum ada notifikasi. Notifikasi muncul saat Anda mengirim formulir atau komentar di browser ini.</p>';
    NT.modal(NT.t('notif'), html);
    localStorage.setItem('nt.pubnotif', JSON.stringify(a.map(function (n) { n.read = true; return n; }))); updateBell();
  }

  // ---------- berbagi ----------
  NT.share = function (url, title) {
    var full = new URL(NT.toRoute(url) || url, location.href).href;
    if (navigator.share) { navigator.share({ title: title, url: full }).catch(function () {}); return; }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(full).then(function () { NT.toast('Tautan disalin'); }, function () { prompt('Salin tautan:', full); });
    else prompt('Salin tautan:', full);
  };

  // ---------- komentar (lokal di browser ini; BUKAN real-time/tidak dibagikan antar pengunjung) ----------
  NT.comments = function (el, key) {
    var d = NT.db();
    el.innerHTML = '<h3>' + icon('comment') + ' Komentar</h3><div class="notice warn">Komentar disimpan <strong>di browser ini saja</strong> (belum real-time dan belum dibagikan ke pengunjung lain). Komentar publik lintas pengguna butuh backend + WebSocket — lihat README.</div>' +
      (d.settings.commentsOn ? '<form id="cf" class="stack" style="margin-top:14px" novalidate><div class="form-grid"><div><label for="cn">Nama tampilan</label><input id="cn" maxlength="40" autocomplete="nickname" required></div><div class="full"><label for="ct">Komentar</label><textarea id="ct" maxlength="500" required></textarea></div></div><div class="err" id="ce" role="alert"></div><button class="btn btn-primary btn-sm" type="submit">' + icon('send') + ' Kirim</button></form>' : '<p class="muted">Komentar dinonaktifkan.</p>') +
      '<div class="comments" id="clist"></div>';
    function list() {
      var all = NT.db().comments.filter(function (c) { return c.key === key && c.status === 'approved'; }), roots = all.filter(function (c) { return !c.parent; });
      $('#clist', el).innerHTML = roots.length ? roots.map(function (c) {
        var reps = all.filter(function (r) { return r.parent === c.id; });
        return '<div class="comment"><div class="meta"><strong>' + NT.esc(c.name) + '</strong><span>' + NT.esc(NT.fmt(c.at)) + '</span><button class="linklike" data-reply="' + c.id + '">Balas</button><button class="linklike" data-spam="' + c.id + '">' + icon('flag') + ' Laporkan spam</button></div><p style="margin:6px 0 0">' + NT.esc(c.text) + '</p>' +
          (reps.length ? '<div class="replies">' + reps.map(function (r) { return '<div><div class="meta"><strong>' + NT.esc(r.name) + '</strong><span>' + NT.esc(NT.fmt(r.at)) + '</span></div><p style="margin:4px 0 0">' + NT.esc(r.text) + '</p></div>'; }).join('') + '</div>' : '') + '</div>';
      }).join('') : '<p class="muted">Belum ada komentar.</p>';
    }
    function add(parent, name, text) {
      name = name.trim(); text = text.trim();
      if (name.length < 2 || text.length < 2) return 'Nama dan komentar minimal 2 karakter.';
      if (/https?:\/\/\S+/i.test(text) && (text.match(/https?:\/\//gi) || []).length > 2) return 'Terlalu banyak tautan.';
      if (!NT.rate('comment', 15000)) return 'Tunggu beberapa detik sebelum mengirim lagi.';
      NT.db().comments.push({ id: NT.uid('c'), key: key, parent: parent || null, name: name, text: text, at: NT.now(), status: 'approved', reported: false });
      NT.notify('Komentar baru dari ' + name, 'comment'); NT.log('comment.add', key); NT.save(); list(); return '';
    }
    var f = $('#cf', el);
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); var err = add(null, $('#cn', el).value, $('#ct', el).value); $('#ce', el).textContent = err; if (!err) { $('#ct', el).value = ''; NT.pubNotify('Komentar terkirim.'); } });
    el.addEventListener('click', function (e) {
      var r = e.target.closest('[data-reply]'), s = e.target.closest('[data-spam]');
      if (r) {
        var m = NT.modal('Balas komentar', '<form class="stack" novalidate><div><label for="rn">Nama</label><input id="rn" maxlength="40"></div><div><label for="rt">Balasan</label><textarea id="rt" maxlength="500"></textarea></div><div class="err" role="alert"></div><button class="btn btn-primary" type="submit">Kirim balasan</button></form>');
        m.querySelector('form').addEventListener('submit', function (ev) { ev.preventDefault(); var err = add(r.dataset.reply, m.querySelector('#rn').value, m.querySelector('#rt').value); if (err) m.querySelector('.err').textContent = err; else m.close(); });
      }
      if (s) { var c = NT.db().comments.filter(function (x) { return x.id === s.dataset.spam; })[0]; if (c) { c.reported = true; NT.notify('Komentar dilaporkan spam: ' + c.name, 'spam'); NT.save(); NT.toast('Laporan diterima. Terima kasih.'); } }
    });
    list();
  };

  // ---------- init ----------
  NT.pages = {};

  // ---------- router hash (situs satu halaman: index.html#/halaman?param=nilai&_a=anchor) ----------
  var PAGES = 'index|about|services|portfolio|project-detail|partners|company-journey|contact|faq';
  var LEGACY = new RegExp('^(' + PAGES + ')\\.html(?:\\?([^#]*))?(?:#(.*))?$');
  NT.toRoute = function (href) {
    var m = LEGACY.exec(href || ''); if (!m) return null;
    var page = m[1] === 'index' ? 'home' : m[1], q = m[2] || '', a = m[3] || '';
    return '#/' + page + (q || a ? '?' + q + (a ? (q ? '&' : '') + '_a=' + encodeURIComponent(a) : '') : '');
  };
  NT.route = function () {
    var h = location.hash.replace(/^#\/?/, ''), i = h.indexOf('?'), page = (i < 0 ? h : h.slice(0, i)) || 'home', q = i < 0 ? '' : h.slice(i + 1);
    if (!NT.pages[page]) page = 'home';
    return { page: page, params: new URLSearchParams(q) };
  };
  NT.param = function (k) { return NT.route().params.get(k); };
  NT.anchor = function () { return NT.route().params.get('_a') || ''; };
  NT.fixLinks = function (root) {
    NT.$$('a[href]', root).forEach(function (a) { var r = NT.toRoute(a.getAttribute('href')); if (r) a.setAttribute('href', r); });
  };
  var TITLES = { home: 'Nexus Tech — Web, Network, IoT & Robotics', about: 'Tentang', services: 'Layanan', portfolio: 'Portofolio', partners: 'Mitra', 'company-journey': 'Perjalanan', contact: 'Kontak', faq: 'FAQ', 'project-detail': 'Detail Proyek' };
  function route() {
    var r = NT.route(); document.body.dataset.page = r.page;
    NT.$$('.modal-back').forEach(function (m) { m.remove(); });
    var nl = $('#navLinks'); if (nl) nl.classList.remove('open'); var mb = $('#menuBtn'); if (mb) mb.setAttribute('aria-expanded', 'false');
    NT.$$('#navLinks a').forEach(function (a) { var cur = r.page === 'project-detail' ? '#/portfolio' : '#/' + r.page; if (a.getAttribute('href') === cur || (r.page === 'home' && a.getAttribute('href') === '#/home')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.title = r.page === 'home' ? TITLES.home : (TITLES[r.page] || '') + ' — Nexus Tech';
    var meta = $('meta[name="description"]'); if (meta) meta.content = r.page === 'home' ? NT.db().company.seoDesc : NT.db().company.name + ' — ' + (TITLES[r.page] || '');
    NT.pages[r.page](); NT.fixLinks(document);
    if (!NT.anchor()) window.scrollTo(0, 0);
  }
  function init() {
    document.documentElement.lang = NT.lang(); document.documentElement.dir = NT.lang() === 'ar' ? 'rtl' : 'ltr';
    new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.tagName === 'A') { var r = NT.toRoute(n.getAttribute('href')); if (r) n.setAttribute('href', r); } else NT.fixLinks(n); } }); }); }).observe(document.body, { childList: true, subtree: true });
    header(); footer(); renderThemeBtn(); updateBell(); NT.fixLinks(document);
    document.addEventListener('click', function (e) { var a = e.target.closest('a.skip'); if (a) { e.preventDefault(); var m = $('#main'); m.setAttribute('tabindex', '-1'); m.focus(); } });
    $('#themeBtn').addEventListener('click', NT.toggleTheme);
    $('#searchBtn').addEventListener('click', openSearch);
    $('#bellBtn').addEventListener('click', openBell);
    $('#langSel').addEventListener('change', function (e) { NT.setLang(e.target.value); location.reload(); });
    var mb = $('#menuBtn'), nl = $('#navLinks');
    mb.addEventListener('click', function () { var o = nl.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); } });
    route(); window.addEventListener('hashchange', route);
    if (window.NT_AI) NT_AI.mount();
    // Tab lain di browser yang sama mengubah data: muat ulang (memakai objek channel yang sama dengan pengirim agar tidak menerima pesan sendiri)
    if (NT._bc) NT._bc.onmessage = function () { if (!document.querySelector('.modal-back.open') && !document.querySelector('form :focus')) location.reload(); };
  }
  NT.init = init;
})();
