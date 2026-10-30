/* Nexus Tech — render halaman publik. Semua data dibaca dari NT.db() sehingga perubahan di Admin langsung tampil. */
(function () {
  'use strict';
  var NT = window.NT, $ = NT.$, esc = NT.esc, P = NT.pages;
  var app = function () { return $('#app'); };
  var qs = { get: function (k) { return NT.param(k); } };
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function chips(p) {
    return '<div class="chip-row"><span class="chip">' + icon(NT.CATS[p.cat].icon) + esc(NT.CATS[p.cat].label) + '</span><span class="chip ok">' + esc(NT.STATUS[p.status] || p.status) + '</span>' + (p.demo ? '<span class="chip demo">DEMO</span>' : '') + '</div>';
  }
  function projectCard(p) {
    return '<article class="card"><a class="card-link" href="project-detail.html?id=' + encodeURIComponent(p.id) + '" aria-label="Buka detail ' + esc(p.title) + '"><img class="card-media" src="' + esc(NT.projectImg(p)) + '" alt="" loading="lazy"><div class="card-body">' + chips(p) + '<h3>' + esc(p.title) + '</h3><p class="muted" style="margin:0">' + esc(p.summary) + '</p><span style="margin-top:auto;color:var(--blue);font-weight:700">Lihat detail ' + icon('arrow') + '</span></div></a></article>';
  }
  function head(eyebrow, title, sub) { return '<div class="section-head"><span class="eyebrow">' + esc(eyebrow) + '</span><h2>' + esc(title) + '</h2>' + (sub ? '<p class="muted">' + esc(sub) + '</p>' : '') + '</div>'; }
  function pageHero(title, sub) { return '<section class="hero" style="padding:56px 0 40px"><div class="container"><h1>' + esc(title) + '</h1><p class="lead muted">' + esc(sub) + '</p></div></section>'; }
  function process() {
    return '<div class="steps">' + [['Konsultasi', 'Memahami masalah dan sasaran.'], ['Perancangan', 'Arsitektur, diagram, dan estimasi.'], ['Implementasi', 'Pengerjaan bertahap dengan checkpoint.'], ['Pengujian', 'Uji fungsi, keamanan, dan lapangan.'], ['Serah terima', 'Dokumentasi dan pelatihan.'], ['Pemeliharaan', 'Dukungan dan perawatan berkala.']].map(function (s) { return '<div class="step"><h3>' + s[0] + '</h3><p class="muted" style="margin:0">' + s[1] + '</p></div>'; }).join('') + '</div>';
  }
  function empty(msg) { return '<div class="empty">' + icon('info') + ' ' + esc(msg) + '</div>'; }

  // ===== HOME =====
  P.home = function () {
    var d = NT.db(), c = d.company, pj = NT.published(d.projects), pt = NT.published(d.partners), ms = NT.published(d.milestones);
    var demoN = pj.filter(function (x) { return x.demo; }).length;
    app().innerHTML =
      '<section class="hero"><div class="container hero-grid"><div><span class="eyebrow">' + icon('spark') + ' Web · Network · IoT · Robotics</span><h1>Rekayasa teknologi <span class="grad-text">terintegrasi</span> untuk bisnis Anda</h1><p class="lead">' + esc(c.tagline) + '</p><div class="hero-actions"><a class="btn btn-primary" href="portfolio.html">Lihat portofolio ' + icon('arrow') + '</a><a class="btn btn-ghost" href="contact.html">Konsultasi</a></div>' +
      '<div class="stats"><div class="stat"><b>' + pj.length + '</b><span class="muted">Entri proyek' + (demoN ? ' (' + demoN + ' DEMO)' : '') + '</span></div><div class="stat"><b>4</b><span class="muted">Bidang layanan</span></div><div class="stat"><b>' + pt.length + '</b><span class="muted">Entri mitra</span></div><div class="stat"><b>' + ms.length + '</b><span class="muted">Milestone</span></div></div></div>' +
      '<img class="hero-art" src="assets/images/hero.svg" alt="Ilustrasi jaringan teknologi yang menghubungkan layanan Nexus Tech" width="560" height="480"></div></section>' +
      '<section><div class="container">' + head('Layanan', 'Empat bidang, satu ekosistem', 'Dari perangkat lunak hingga perangkat keras di lapangan.') +
      '<div class="grid">' + d.services.map(function (s) { return '<article class="card svc" id="' + esc(s.id) + '"><div class="ico">' + icon(NT.CATS[s.cat].icon) + '</div><h3>' + esc(s.title) + '</h3><p class="muted">' + esc(s.desc) + '</p><a href="portfolio.html?cat=' + s.cat + '">Lihat proyek ' + icon('arrow') + '</a></article>'; }).join('') + '</div></div></section>' +
      '<section style="background:var(--surface-2)"><div class="container">' + head('Portofolio', 'Proyek pilihan', 'Entri berlabel DEMO adalah contoh format, bukan hasil kerja nyata.') + '<div class="grid">' + pj.slice(0, 4).map(projectCard).join('') + '</div><p style="margin-top:20px"><a class="btn btn-ghost" href="portfolio.html">Semua proyek</a></p></div></section>' +
      '<section><div class="container">' + head('Proses kerja', 'Alur yang jelas dan terdokumentasi') + process() + '</div></section>' +
      '<section><div class="container"><div class="panel" style="text-align:center">' + head('Mulai', 'Punya kebutuhan proyek?', 'Isi formulir konsultasi atau tanyakan Nexus AI untuk menyusun ringkasan kebutuhan.') + '<a class="btn btn-primary" href="contact.html">Hubungi kami</a></div></div></section>';
  };

  // ===== ABOUT =====
  P.about = function () {
    var c = NT.db().company;
    app().innerHTML = pageHero('Tentang ' + c.name, c.tagline) +
      '<section><div class="container"><div class="detail-hero"><div class="panel"><h3>' + icon('info') + ' Profil</h3><p>' + esc(c.about) + '</p>' + (c.founded ? '<p><strong>Berdiri:</strong> ' + esc(c.founded) + '</p>' : '<p class="muted">Tahun berdiri belum diisi (Admin &gt; Profil).</p>') + '</div><img src="assets/images/journey.svg" alt="Ilustrasi perjalanan perusahaan" style="border-radius:16px"></div>' +
      '<div class="grid" style="margin-top:20px"><div class="panel"><h3>' + icon('target') + ' Visi</h3><p>' + esc(c.vision) + '</p></div><div class="panel"><h3>' + icon('flag') + ' Misi</h3><p>' + esc(c.mission) + '</p></div></div></div></section>' +
      '<section style="background:var(--surface-2)"><div class="container">' + head('Keunggulan', 'Cara kami bekerja') + '<div class="grid">' + [['shield', 'Aman & terdokumentasi', 'Setiap pekerjaan dicatat dan dapat ditelusuri.'], ['layers', 'Lintas disiplin', 'Software, jaringan, IoT, dan robotika dalam satu tim.'], ['wrench', 'Mudah dipelihara', 'Struktur rapi dan panduan pemeliharaan.'], ['users', 'Kolaboratif', 'Terbuka untuk kemitraan yang terverifikasi.']].map(function (x) { return '<div class="panel"><h3>' + icon(x[0]) + ' ' + x[1] + '</h3><p class="muted" style="margin:0">' + x[2] + '</p></div>'; }).join('') + '</div></div></section>' +
      '<section><div class="container">' + head('Proses', 'Dari konsultasi hingga pemeliharaan') + process() + '<p style="margin-top:28px"><a class="btn btn-ghost" href="company-journey.html">Lihat perjalanan perusahaan</a></p></div></section>';
  };

  // ===== SERVICES =====
  P.services = function () {
    app().innerHTML = pageHero('Layanan', 'Empat bidang utama Nexus Tech.') + '<section><div class="container"><div class="stack">' +
      NT.db().services.map(function (s) { return '<article class="panel" id="' + esc(s.id) + '"><h3>' + icon(NT.CATS[s.cat].icon) + ' ' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p><ul class="tick">' + s.points.map(function (x) { return '<li>' + icon('check') + esc(x) + '</li>'; }).join('') + '</ul><p style="margin-top:14px"><a class="btn btn-ghost btn-sm" href="portfolio.html?cat=' + s.cat + '">Proyek terkait ' + icon('arrow') + '</a></p></article>'; }).join('') + '</div>' +
      '<div style="margin-top:40px">' + head('Proses kerja', 'Tahapan standar') + process() + '</div></div></section>';
    if (NT.anchor()) { var t = document.getElementById(NT.anchor()); t && t.scrollIntoView(); }
  };

  // ===== PORTFOLIO =====
  P.portfolio = function () {
    var all = NT.published(NT.db().projects), st = { q: qs.get('q') || '', cat: qs.get('cat') || 'all', status: 'all', sort: 'new' };
    app().innerHTML = pageHero('Portofolio', 'Studi kasus per bidang. Entri berlabel DEMO adalah contoh format.') +
      '<section><div class="container"><div class="toolbar"><input class="grow" type="search" id="q" placeholder="Cari proyek, teknologi…" aria-label="Cari proyek" value="' + esc(st.q) + '"><select id="fs" aria-label="Status"><option value="all">Semua status</option>' + Object.keys(NT.STATUS).map(function (k) { return '<option value="' + k + '">' + NT.STATUS[k] + '</option>'; }).join('') + '</select><select id="so" aria-label="Urutkan"><option value="new">Terbaru</option><option value="az">A–Z</option><option value="za">Z–A</option></select></div>' +
      '<div class="pills" id="pills" style="margin-bottom:22px"></div><p class="muted" id="cnt" aria-live="polite"></p><div class="grid" id="grid"></div></div></section>';
    function draw() {
      $('#pills').innerHTML = [['all', 'Semua']].concat(Object.keys(NT.CATS).map(function (k) { return [k, NT.CATS[k].label]; })).map(function (x) { return '<button class="pill" type="button" data-c="' + x[0] + '" aria-pressed="' + (st.cat === x[0]) + '">' + esc(x[1]) + '</button>'; }).join('');
      var v = st.q.trim().toLowerCase(), r = all.filter(function (p) { return (st.cat === 'all' || p.cat === st.cat) && (st.status === 'all' || p.status === st.status) && (!v || (p.title + ' ' + p.summary + ' ' + p.tech.join(' ')).toLowerCase().indexOf(v) > -1); });
      r.sort(function (a, b) { return st.sort === 'az' ? a.title.localeCompare(b.title) : st.sort === 'za' ? b.title.localeCompare(a.title) : (b.createdAt || '').localeCompare(a.createdAt || ''); });
      $('#cnt').textContent = r.length + ' proyek ditemukan';
      $('#grid').innerHTML = r.length ? r.map(projectCard).join('') : '<div style="grid-column:1/-1">' + empty('Tidak ada proyek yang cocok dengan filter.') + '</div>';
    }
    $('#q').addEventListener('input', function (e) { st.q = e.target.value; draw(); });
    $('#fs').addEventListener('change', function (e) { st.status = e.target.value; draw(); });
    $('#so').addEventListener('change', function (e) { st.sort = e.target.value; draw(); });
    $('#pills').addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) { st.cat = b.dataset.c; draw(); } });
    draw();
  };

  // ===== PROJECT DETAIL =====
  function flowSvg(steps) {
    var w = 150, g = 26, H = 90, W = steps.length * (w + g) + g, x = g;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="fd" style="width:100%;height:auto"><title id="fd">Diagram tahapan pengerjaan</title><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4 0 8z" fill="#06b6d4"/></marker></defs>';
    steps.forEach(function (t, i) {
      s += '<rect x="' + x + '" y="20" width="' + w + '" height="50" rx="12" fill="none" stroke="#06b6d4" stroke-width="2"/><text x="' + (x + w / 2) + '" y="50" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">' + (i + 1) + '. ' + esc(t.length > 17 ? t.slice(0, 16) + '…' : t) + '</text>';
      if (i < steps.length - 1) s += '<path d="M' + (x + w) + ' 45h' + (g - 4) + '" stroke="#06b6d4" stroke-width="2" marker-end="url(#ar)"/>';
      x += w + g;
    });
    return s + '</svg>';
  }
  function archSvg(p) {
    var cols = [['Komponen', p.components], ['Teknologi', p.tech], ['Tools', p.tools]].map(function (c) { return [c[0], (c[1] || []).slice(0, 4)]; }), W = 720, colW = 190, gap = 45, rowH = 40, H = 40 + 4 * rowH + 20;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="ad" style="width:100%;height:auto;color:var(--text)"><title id="ad">Diagram arsitektur proyek (dibuat otomatis dari data)</title><defs><marker id="ar2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4 0 8z" fill="#06b6d4"/></marker></defs>';
    cols.forEach(function (c, i) {
      var x = 10 + i * (colW + gap);
      s += '<text x="' + (x + colW / 2) + '" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#06b6d4">' + c[0] + '</text>';
      c[1].forEach(function (t, j) { var y = 34 + j * rowH; s += '<rect x="' + x + '" y="' + y + '" width="' + colW + '" height="32" rx="9" fill="none" stroke="#1d6ef2" stroke-width="1.6"/><text x="' + (x + colW / 2) + '" y="' + (y + 21) + '" text-anchor="middle" font-size="12" fill="currentColor">' + esc(String(t).length > 24 ? String(t).slice(0, 23) + '…' : t) + '</text>'; });
      if (i < 2) s += '<path d="M' + (x + colW + 4) + ' ' + (H / 2) + 'h' + (gap - 12) + '" stroke="#06b6d4" stroke-width="2" marker-end="url(#ar2)"/>';
    });
    return s + '</svg>';
  }
  function techData(p) {
    var d = NT.db(), pub = function (a) { return a.filter(function (x) { return x.projectId === p.id && (x.visibility === 'published' || NT.session()); }); }, h = '';
    pub(d.wiring || []).forEach(function (x) { h += '<div class="panel"><h3>' + icon('cable') + ' ' + esc(x.name) + '</h3><dl class="dl"><dt>Kabel</dt><dd>' + esc(x.cable) + '</dd><dt>Lokasi</dt><dd>' + esc(x.location) + '</dd><dt>Titik</dt><dd>' + esc(x.points) + '</dd><dt>Status</dt><dd>' + esc(NT.STATUS[x.status] || x.status) + '</dd><dt>Maintenance</dt><dd>' + esc(x.notes) + '</dd></dl></div>'; });
    pub(d.devices || []).forEach(function (x) { h += '<div class="panel"><h3>' + icon('chip') + ' ' + esc(x.name) + '</h3><dl class="dl"><dt>Mikrokontroler</dt><dd>' + esc(x.mcu) + '</dd><dt>Fungsi</dt><dd>' + esc(x.func) + '</dd><dt>Status</dt><dd>' + esc(NT.STATUS[x.status] || x.status) + '</dd></dl></div>'; });
    pub(d.robots || []).forEach(function (x) { h += '<div class="panel"><h3>' + icon('robot') + ' ' + esc(x.name) + '</h3><dl class="dl"><dt>Jenis</dt><dd>' + esc(x.type) + '</dd><dt>Komponen</dt><dd>' + esc(x.components) + '</dd><dt>Tahap</dt><dd>' + esc(x.stage) + '</dd><dt>Spesifikasi</dt><dd>' + esc(x.spec) + '</dd></dl></div>'; });
    return h ? '<div style="margin-top:20px"><h3>' + icon('settings') + ' Data teknis terkait</h3><div class="grid">' + h + '</div></div>' : '';
  }
  P['project-detail'] = function () {
    var p = NT.getProject(qs.get('id')), sess = NT.session();
    if (!p || (p.visibility !== 'published' && !sess)) { app().innerHTML = '<section><div class="container">' + empty('Proyek tidak ditemukan atau belum dipublikasikan.') + '<p style="text-align:center"><a class="btn btn-primary" href="portfolio.html">Kembali ke portofolio</a></p></div></section>'; document.title = 'Proyek tidak ditemukan — Nexus Tech'; return; }
    document.title = p.title + ' — Nexus Tech'; var m = $('meta[name="description"]'); if (m) m.content = p.summary;
    var ss = sessionStorage; if (!ss.getItem('v.' + p.id)) { ss.setItem('v.' + p.id, '1'); p.views = (p.views || 0) + 1; NT.save(); }
    var list = function (a) { return a && a.length ? '<ul class="tick">' + a.map(function (x) { return '<li>' + icon('check') + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="muted">—</p>'; };
    var rel = NT.published(NT.db().projects).filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 3);
    var ms = NT.db().milestones.filter(function (x) { return (x.projectIds || []).indexOf(p.id) > -1 && x.visibility === 'published'; });
    app().innerHTML = '<section><div class="container"><nav class="crumbs" aria-label="Breadcrumb"><a href="portfolio.html">Portofolio</a> / ' + esc(NT.CATS[p.cat].label) + ' / ' + esc(p.title) + '</nav>' +
      (p.visibility !== 'published' ? '<div class="notice warn" style="margin-bottom:14px">PREVIEW ADMIN — proyek ini berstatus <strong>' + esc(p.visibility) + '</strong> dan tidak tampil bagi pengunjung.</div>' : '') +
      '<div class="detail-hero"><div><h1 style="font-size:clamp(1.7rem,4vw,2.6rem)">' + esc(p.title) + '</h1>' + chips(p) + '<p style="margin-top:14px">' + esc(p.summary) + '</p><div class="hero-actions"><button class="btn btn-primary btn-sm" id="shr">' + icon('share') + ' Bagikan tautan</button><a class="btn btn-ghost btn-sm" href="contact.html">Konsultasi proyek serupa</a></div></div><img src="' + esc(NT.projectImg(p)) + '" alt="Ilustrasi proyek ' + esc(p.title) + '" style="border-radius:16px;width:100%;aspect-ratio:16/10;object-fit:cover"></div>' +
      '<div class="grid" style="margin-top:24px"><div class="panel"><h3>' + icon('target') + ' Tujuan</h3><p>' + esc(p.goal) + '</p></div><div class="panel"><h3>' + icon('check') + ' Manfaat</h3><p>' + esc(p.benefit) + '</p></div><div class="panel"><h3>' + icon('alert') + ' Permasalahan</h3><p>' + esc(p.problem) + '</p></div><div class="panel"><h3>' + icon('layers') + ' Ruang lingkup</h3><p>' + esc(p.scope) + '</p></div></div>' +
      '<div class="panel" style="margin-top:20px"><h3>' + icon('flow') + ' Tahapan pengerjaan</h3>' + flowSvg(p.steps) + '</div>' +
      '<div class="grid" style="margin-top:20px"><div class="panel"><h3>' + icon('code') + ' Teknologi</h3><div class="chip-row">' + p.tech.map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('') + '</div></div><div class="panel"><h3>' + icon('chip') + ' Komponen</h3>' + list(p.components) + '</div><div class="panel"><h3>' + icon('wrench') + ' Tools</h3>' + list(p.tools) + '</div></div>' +
      '<div class="panel" style="margin-top:20px"><h3>' + icon('info') + ' Informasi proyek</h3><dl class="dl"><dt>Status</dt><dd>' + esc(NT.STATUS[p.status]) + '</dd><dt>Timeline</dt><dd>' + esc(p.timeline) + '</dd><dt>Pemeliharaan</dt><dd>' + esc(p.maintenance) + '</dd><dt>Info teknis</dt><dd>' + esc(p.techInfo) + '</dd><dt>Hasil</dt><dd>' + esc(p.results) + '</dd></dl></div>' +
      '<div class="panel" style="margin-top:20px"><h3>' + icon('layers') + ' Diagram arsitektur</h3>' + archSvg(p) + '<p class="muted" style="font-size:.82rem;margin:6px 0 0">Dibuat otomatis dari data komponen, teknologi, dan tools proyek.</p></div>' + techData(p) +
      '<div class="panel" style="margin-top:20px"><h3>' + icon('image') + ' Galeri & dokumentasi</h3>' + ((p.gallery || []).length ? '<div class="gallery">' + p.gallery.map(function (g) { return '<figure><img src="' + esc(g.src) + '" alt="' + esc(g.caption || p.title) + '" loading="lazy"><figcaption>' + esc(g.caption || '') + '</figcaption></figure>'; }).join('') + '</div>' : '<p class="muted">Foto dan dokumentasi belum diunggah. Admin dapat menambahkannya di Admin &gt; Proyek.</p>') + '</div>' +
      (ms.length ? '<div class="panel" style="margin-top:20px"><h3>' + icon('clock') + ' Milestone terkait</h3>' + ms.map(function (x) { return '<p><a href="company-journey.html#' + x.id + '">' + esc(x.date + ' — ' + x.title) + '</a></p>'; }).join('') + '</div>' : '') +
      (rel.length ? '<div style="margin-top:40px">' + head('Terkait', 'Proyek serupa') + '<div class="grid">' + rel.map(projectCard).join('') + '</div></div>' : '') +
      '<div class="panel" style="margin-top:32px" id="cm"></div></div></section>';
    $('#shr').addEventListener('click', function () { NT.share('project-detail.html?id=' + encodeURIComponent(p.id), p.title); });
    NT.comments($('#cm'), 'project:' + p.id);
  };

  // ===== PARTNERS =====
  function partnerForm(partner) {
    var m = NT.modal('Propose Collaboration' + (partner ? ' — ' + partner.name : ''), '<form class="stack" novalidate id="pf"><div class="form-grid"><div><label for="pn">Nama</label><input id="pn" maxlength="80" autocomplete="name"></div><div><label for="pc">Nama perusahaan</label><input id="pc" maxlength="100" autocomplete="organization"></div><div class="full"><label for="pe">Email</label><input id="pe" type="email" maxlength="120" autocomplete="email"></div><div class="full"><label for="pk">Jenis kerja sama</label><select id="pk"><option value="">Pilih…</option><option>Kemitraan teknologi</option><option>Proyek bersama</option><option>Pemasok / supplier</option><option>Reseller / distribusi</option><option>Lainnya</option></select></div><div class="full"><label for="pd">Deskripsi proposal</label><textarea id="pd" maxlength="1500"></textarea></div><div class="full" style="position:absolute;left:-9999px" aria-hidden="true"><label>Jangan diisi<input id="hp" tabindex="-1" autocomplete="off"></label></div><div class="full"><label style="display:flex;gap:8px;font-weight:400"><input type="checkbox" id="pp" style="width:auto"> Saya menyetujui data ini disimpan untuk keperluan tindak lanjut kerja sama.</label></div></div><div class="err" role="alert" id="pe2"></div><button class="btn btn-primary" type="submit">' + icon('send') + ' Kirim proposal</button><p class="muted" style="font-size:.82rem;margin:0">Proposal disimpan di browser ini dan tampil di dashboard admin pada browser yang sama. Pengiriman ke server/email butuh backend (lihat README).</p></form>');
    m.querySelector('#pf').addEventListener('submit', function (e) {
      e.preventDefault(); var v = function (i) { return m.querySelector(i).value.trim(); }, err = '';
      if (v('#hp')) return;
      if (v('#pn').length < 2) err = 'Nama minimal 2 karakter.'; else if (v('#pc').length < 2) err = 'Nama perusahaan wajib diisi.'; else if (!EMAIL.test(v('#pe'))) err = 'Email tidak valid.'; else if (!v('#pk')) err = 'Pilih jenis kerja sama.'; else if (v('#pd').length < 20) err = 'Deskripsi minimal 20 karakter.'; else if (!m.querySelector('#pp').checked) err = 'Persetujuan privasi diperlukan.'; else if (!NT.rate('proposal', 20000)) err = 'Tunggu sebentar sebelum mengirim lagi.';
      m.querySelector('#pe2').textContent = err; if (err) return;
      NT.db().proposals.unshift({ id: NT.uid('pr'), at: NT.now(), name: v('#pn'), company: v('#pc'), email: v('#pe'), type: v('#pk'), text: v('#pd'), partnerId: partner ? partner.id : '', status: 'new' });
      NT.notify('Proposal kerja sama baru dari ' + v('#pc'), 'proposal'); NT.log('proposal.new', v('#pc')); NT.save(); m.close(); NT.pubNotify('Proposal terkirim dan tersimpan di browser ini.');
    });
  }
  function partnerModal(p) {
    var site = NT.safeUrl(p.website), mail = EMAIL.test(p.email || '') ? 'mailto:' + p.email : site;
    var row = function (k, v) { return v ? '<dt>' + k + '</dt><dd>' + esc(v) + '</dd>' : ''; };
    var m = NT.modal(p.name, '<div class="inline" style="margin-bottom:14px"><img src="' + esc(p.logo || 'assets/images/partner-placeholder.svg') + '" alt="Logo ' + esc(p.name) + '" width="72" height="72" style="border-radius:14px;object-fit:contain;background:#fff"><div class="chip-row"><span class="chip">' + esc(NT.PCATS[p.cat]) + '</span>' + (p.demo ? '<span class="chip demo">DEMO — bukan mitra nyata</span>' : '') + '<span class="chip">' + esc(p.status === 'demo' ? 'Placeholder' : p.status) + '</span></div></div>' +
      '<p>' + esc(p.profile) + '</p><dl class="dl">' + row('Negara', p.country) + row('Lokasi', p.location) + row('Layanan', p.services) + row('Keahlian', p.expertise) + row('Teknologi/Produk', p.tech) + row('Bentuk kolaborasi', p.collab) + row('Proyek bersama', p.joint) + row('Periode', p.period) + '</dl>' +
      (!p.country && !p.services && !p.collab ? '<p class="muted">Detail belum diisi. Admin dapat melengkapinya setelah mitra terverifikasi.</p>' : '') +
      '<div class="hero-actions"><a class="btn btn-primary btn-sm" ' + (site ? 'href="' + esc(site) + '" target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true" title="Website resmi belum tersedia"') + '>' + icon('external') + ' Visit Website</a><a class="btn btn-ghost btn-sm" ' + (mail ? 'href="' + esc(mail) + '"' + (mail.indexOf('http') === 0 ? ' target="_blank" rel="noopener noreferrer"' : '') : 'aria-disabled="true" title="Kontak resmi belum tersedia"') + '>' + icon('mail') + ' Contact Company</a><button class="btn btn-ghost btn-sm" id="pp1">' + icon('handshake') + ' Propose Collaboration</button><button class="btn btn-ghost btn-sm" id="pp2">' + icon('share') + ' Bagikan profil</button></div>');
    m.querySelectorAll('a[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
    m.querySelector('#pp1').addEventListener('click', function () { m.close(); partnerForm(p); });
    m.querySelector('#pp2').addEventListener('click', function () { NT.share('partners.html?p=' + encodeURIComponent(p.id), p.name); });
  }
  P.partners = function () {
    var all = NT.published(NT.db().partners), st = { q: '', cat: 'all', country: 'all', sort: 'az' };
    var countries = Array.from(new Set(all.map(function (x) { return x.country; }).filter(Boolean))).sort();
    app().innerHTML = pageHero('Our Partners', 'Daftar calon dan mitra bisnis. Entri berlabel DEMO bukan mitra resmi; tidak ada kemitraan yang diklaim tanpa bukti.') +
      '<section><div class="container"><div class="toolbar"><input class="grow" type="search" id="q" placeholder="Cari mitra…" aria-label="Cari mitra"><select id="fc" aria-label="Negara"><option value="all">Semua negara</option>' + countries.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select><select id="so" aria-label="Urutkan"><option value="az">Nama A–Z</option><option value="za">Nama Z–A</option><option value="new">Terbaru</option></select><button class="btn btn-primary btn-sm" id="gen">' + icon('handshake') + ' Propose Collaboration</button></div><div class="pills" id="pills" style="margin-bottom:22px"></div><p class="muted" id="cnt" aria-live="polite"></p><div id="out"></div></div></section>';
    function draw() {
      $('#pills').innerHTML = [['all', 'Semua']].concat(Object.keys(NT.PCATS).map(function (k) { return [k, NT.PCATS[k]]; })).map(function (x) { return '<button class="pill" type="button" data-c="' + x[0] + '" aria-pressed="' + (st.cat === x[0]) + '">' + esc(x[1]) + '</button>'; }).join('');
      var v = st.q.toLowerCase(), r = all.filter(function (p) { return (st.cat === 'all' || p.cat === st.cat) && (st.country === 'all' || p.country === st.country) && (!v || (p.name + ' ' + p.profile + ' ' + p.services + ' ' + p.expertise).toLowerCase().indexOf(v) > -1); });
      r.sort(function (a, b) { return st.sort === 'za' ? b.name.localeCompare(a.name) : st.sort === 'new' ? (b.createdAt || '').localeCompare(a.createdAt || '') : a.name.localeCompare(b.name); });
      $('#cnt').textContent = r.length + ' mitra';
      var groups = Object.keys(NT.PCATS).filter(function (k) { return st.cat === 'all' || st.cat === k; });
      $('#out').innerHTML = r.length ? groups.map(function (k) {
        var g = r.filter(function (p) { return p.cat === k; }); if (!g.length) return '';
        return '<h3 style="margin-top:24px">' + esc(NT.PCATS[k]) + '</h3><div class="grid">' + g.map(function (p) { return '<article class="card"><button class="card-link" data-p="' + esc(p.id) + '" aria-label="Detail ' + esc(p.name) + '"><div class="card-body"><div class="inline"><img src="' + esc(p.logo || 'assets/images/partner-placeholder.svg') + '" alt="" width="56" height="56" style="border-radius:12px;object-fit:contain"><h3 style="margin:0">' + esc(p.name) + '</h3></div><div class="chip-row">' + (p.demo ? '<span class="chip demo">DEMO</span>' : '') + (p.country ? '<span class="chip">' + esc(p.country) + '</span>' : '') + '</div><p class="muted" style="margin:0">' + esc(p.profile.slice(0, 120)) + '</p><span style="color:var(--blue);font-weight:700;margin-top:auto">Detail ' + icon('arrow') + '</span></div></button></article>'; }).join('') + '</div>';
      }).join('') : empty('Belum ada mitra yang cocok. Admin dapat menambahkan mitra terverifikasi.');
    }
    $('#q').addEventListener('input', function (e) { st.q = e.target.value; draw(); });
    $('#fc').addEventListener('change', function (e) { st.country = e.target.value; draw(); });
    $('#so').addEventListener('change', function (e) { st.sort = e.target.value; draw(); });
    $('#pills').addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) { st.cat = b.dataset.c; draw(); } });
    $('#out').addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (b) partnerModal(all.filter(function (x) { return x.id === b.dataset.p; })[0]); });
    $('#gen').addEventListener('click', function () { partnerForm(null); });
    draw();
    var pid = qs.get('p'); if (pid) { var pp = all.filter(function (x) { return x.id === pid; })[0]; if (pp) partnerModal(pp); }
  };

  // ===== JOURNEY =====
  P['company-journey'] = function () {
    var all = NT.published(NT.db().milestones).sort(function (a, b) { return a.order - b.order; }), cat = 'all';
    var cats = { company: 'Perusahaan', team: 'Tim', web: 'Web & Engineering', wiring: 'Wiring & Jaringan', iot: 'IoT', robotics: 'Robotika', future: 'Masa depan', other: 'Lainnya' };
    app().innerHTML = pageHero('Our Journey', 'Perjalanan Nexus Tech dari awal berdiri hingga rencana ke depan. Milestone berlabel DEMO adalah placeholder yang diganti Admin dengan fakta sebenarnya.') + '<section><div class="container"><div class="pills" id="pills"></div><ol class="timeline" id="tl" style="margin-top:26px"></ol></div></section>';
    function draw() {
      $('#pills').innerHTML = [['all', 'Semua']].concat(Object.keys(cats).filter(function (k) { return all.some(function (m) { return m.cat === k; }); }).map(function (k) { return [k, cats[k]]; })).map(function (x) { return '<button class="pill" data-c="' + x[0] + '" aria-pressed="' + (cat === x[0]) + '">' + esc(x[1]) + '</button>'; }).join('');
      var r = all.filter(function (m) { return cat === 'all' || m.cat === cat; });
      $('#tl').innerHTML = r.length ? r.map(function (m) {
        var pj = (m.projectIds || []).map(NT.getProject).filter(Boolean), pt = (m.partnerIds || []).map(function (id) { return NT.db().partners.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean);
        return '<li class="tl-item" id="' + esc(m.id) + '"><span class="tl-dot">' + icon('clock') + '</span><div class="tl-card">' + (m.image ? '<img src="' + esc(m.image) + '" alt="' + esc(m.title) + '" loading="lazy">' : '') + '<div class="tl-date">' + esc(m.date) + '</div><h3>' + esc(m.title) + '</h3><div class="chip-row" style="margin-bottom:8px"><span class="chip">' + esc(cats[m.cat] || m.cat) + '</span>' + (m.demo ? '<span class="chip demo">DEMO</span>' : '') + '</div><p>' + esc(m.desc) + '</p>' + (pj.length ? '<p style="margin:0"><strong>Proyek:</strong> ' + pj.map(function (p) { return '<a href="project-detail.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.title) + '</a>'; }).join(', ') + '</p>' : '') + (pt.length ? '<p style="margin:0"><strong>Mitra:</strong> ' + pt.map(function (p) { return '<a href="partners.html?p=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a>'; }).join(', ') + '</p>' : '') + '</div></li>';
      }).join('') : '<li>' + empty('Belum ada milestone.') + '</li>';
      if (NT.anchor()) { var t = document.getElementById(NT.anchor()); t && t.scrollIntoView({ block: 'center' }); }
    }
    $('#pills').addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) { cat = b.dataset.c; draw(); } });
    draw();
  };

  // ===== CONTACT =====
  P.contact = function () {
    var c = NT.db().company, pre = {}; try { pre = JSON.parse(sessionStorage.getItem('nt.prefill')) || {}; } catch (e) {}
    var info = [['mail', c.email], ['phone', c.phone], ['map', c.address], ['clock', c.hours]].filter(function (x) { return x[1]; });
    app().innerHTML = pageHero('Kontak & Konsultasi', 'Ceritakan kebutuhan Anda. Pesan tersimpan di dashboard admin pada browser ini.') +
      '<section><div class="container"><div class="detail-hero"><form class="panel stack" id="cf" novalidate><div class="form-grid"><div><label for="n">Nama</label><input id="n" maxlength="80" autocomplete="name"></div><div><label for="e">Email</label><input id="e" type="email" maxlength="120" autocomplete="email"></div><div><label for="ph">Telepon (opsional)</label><input id="ph" maxlength="30" autocomplete="tel"></div><div><label for="tp">Topik</label><select id="tp"><option value="">Pilih…</option>' + Object.keys(NT.CATS).map(function (k) { return '<option value="' + k + '"' + (pre.topic === k ? ' selected' : '') + '>' + NT.CATS[k].label + '</option>'; }).join('') + '<option value="other">Lainnya</option></select></div><div class="full"><label for="m">Pesan</label><textarea id="m" maxlength="2000">' + esc(pre.message || '') + '</textarea></div><div style="position:absolute;left:-9999px" aria-hidden="true"><input id="hp" tabindex="-1" autocomplete="off"></div><div class="full"><label style="display:flex;gap:8px;font-weight:400"><input type="checkbox" id="pv" style="width:auto"> Saya menyetujui data ini disimpan untuk menanggapi permintaan saya.</label></div></div><div class="err" role="alert" id="er"></div><button class="btn btn-primary" type="submit">' + icon('send') + ' Kirim</button><div id="ok"></div></form>' +
      '<div class="stack"><div class="panel"><h3>' + icon('info') + ' Informasi kontak</h3>' + (info.length ? info.map(function (x) { return '<p>' + icon(x[0]) + ' ' + esc(x[1]) + '</p>'; }).join('') : '<p class="muted">Kontak resmi belum dikonfigurasi (Admin &gt; Profil). Tidak ada alamat/nomor yang diasumsikan.</p>') + '</div><div class="notice warn">Tanpa backend, formulir ini menyimpan pesan hanya di browser. Agar pesan sampai ke tim secara nyata, hubungkan ke server/email (lihat README).</div></div></div></div></section>';
    $('#cf').addEventListener('submit', function (e) {
      e.preventDefault(); var v = function (i) { return $(i).value.trim(); }, err = '';
      if (v('#hp')) return;
      if (v('#n').length < 2) err = 'Nama minimal 2 karakter.'; else if (!EMAIL.test(v('#e'))) err = 'Email tidak valid.'; else if (!v('#tp')) err = 'Pilih topik.'; else if (v('#m').length < 10) err = 'Pesan minimal 10 karakter.'; else if (!$('#pv').checked) err = 'Persetujuan privasi diperlukan.'; else if (!NT.rate('contact', 20000)) err = 'Tunggu sebentar sebelum mengirim lagi.';
      $('#er').textContent = err; if (err) return;
      NT.db().messages.unshift({ id: NT.uid('msg'), at: NT.now(), name: v('#n'), email: v('#e'), phone: v('#ph'), topic: v('#tp'), text: v('#m'), status: 'new' });
      NT.notify('Pesan konsultasi baru dari ' + v('#n'), 'message'); NT.log('message.new', v('#n')); NT.save(); sessionStorage.removeItem('nt.prefill');
      NT.pubNotify('Pesan tersimpan di browser ini.');
      $('#ok').innerHTML = '<div class="notice">Terima kasih. Pesan tersimpan.' + (EMAIL.test(c.email) ? ' <a href="mailto:' + esc(c.email) + '?subject=' + encodeURIComponent('Konsultasi: ' + v('#tp')) + '&body=' + encodeURIComponent(v('#m')) + '">Kirim juga lewat email</a>.' : '') + '</div>'; $('#cf').reset();
    });
  };

  // ===== FAQ =====
  P.faq = function () {
    var all = NT.published(NT.db().faqs).sort(function (a, b) { return a.order - b.order; });
    app().innerHTML = pageHero('FAQ', 'Pertanyaan yang sering diajukan.') + '<section><div class="container" style="max-width:820px"><div class="toolbar"><input class="grow" type="search" id="q" placeholder="Cari pertanyaan…" aria-label="Cari FAQ"></div><div id="fl"></div></div></section>';
    function draw() {
      var v = $('#q').value.toLowerCase(), r = all.filter(function (f) { return !v || (f.q + f.a).toLowerCase().indexOf(v) > -1; });
      $('#fl').innerHTML = r.length ? r.map(function (f) { return '<details class="faq" id="' + esc(f.id) + '"><summary>' + esc(f.q) + icon('chevron') + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('') : empty('Tidak ada pertanyaan yang cocok.');
      if (NT.anchor()) { var t = document.getElementById(NT.anchor()); if (t) { t.open = true; t.scrollIntoView(); } }
    }
    $('#q').addEventListener('input', draw); draw();
  };

  P.home = P.home; document.addEventListener('DOMContentLoaded', NT.init);
})();
