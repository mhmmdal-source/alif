/* Nexus Tech — Admin Dashboard (frontend-only, data di localStorage).
   RBAC & login di sini hanya penghalang antarmuka; BUKAN keamanan sungguhan (lihat README). */
(function () {
  'use strict';
  var NT = window.NT, esc = NT.esc, $ = function (s, r) { return (r || document).querySelector(s); };
  var sess = NT.session();
  if (!sess) { location.replace('login.html'); return; }
  var db = function () { return NT.db(); };
  var isAdmin = function () { return sess.role === 'admin'; };
  var PAGE = 8;

  // ---------- util ----------
  function confirmBox(msg, cb) {
    var m = NT.modal('Konfirmasi', '<p>' + esc(msg) + '</p><div class="inline"><button class="btn btn-danger" id="y">Ya, lanjutkan</button><button class="btn btn-ghost" data-close>Batal</button></div>');
    m.querySelector('#y').addEventListener('click', function () { m.close(); cb(); });
  }
  function toList(v) { return String(v || '').split(/\n|,/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function readFile(file, max) {
    return new Promise(function (res, rej) {
      if (!/^image\/(png|jpeg|webp|svg\+xml|gif)$/.test(file.type)) return rej(new Error('Format harus PNG/JPG/WebP/SVG/GIF'));
      if (file.size > max) return rej(new Error('Ukuran maks ' + Math.round(max / 1024) + ' KB'));
      var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { rej(new Error('Gagal membaca file')); }; r.readAsDataURL(file);
    });
  }
  function pager(total, page, cb, el) {
    var pages = Math.max(1, Math.ceil(total / PAGE));
    el.innerHTML = '<span class="muted">Hal ' + page + '/' + pages + ' · ' + total + ' data</span><button class="btn btn-ghost btn-sm" ' + (page <= 1 ? 'disabled' : '') + ' data-pg="' + (page - 1) + '">‹</button><button class="btn btn-ghost btn-sm" ' + (page >= pages ? 'disabled' : '') + ' data-pg="' + (page + 1) + '">›</button>';
    el.onclick = function (e) { var b = e.target.closest('[data-pg]'); if (b && !b.disabled) cb(+b.dataset.pg); };
  }

  // ---------- skema entitas ----------
  var VIS = [['published', 'Dipublikasikan'], ['draft', 'Draft'], ['archived', 'Diarsipkan']];
  var catOpts = Object.keys(NT.CATS).map(function (k) { return [k, NT.CATS[k].label]; });
  var pcatOpts = Object.keys(NT.PCATS).map(function (k) { return [k, NT.PCATS[k]]; });
  var statusOpts = Object.keys(NT.STATUS).map(function (k) { return [k, NT.STATUS[k]]; });
  var projOpts = function () { return [['', '— tidak ada —']].concat(db().projects.map(function (p) { return [p.id, p.title]; })); };
  var ENT = {
    projects: {
      label: 'Proyek & Portfolio', icon: 'layers', cols: ['title', 'cat', 'status', 'visibility'], search: ['title', 'summary'], prefix: 'p',
      fields: [
        ['title', 'Nama proyek', 'text', { req: 1, max: 120 }], ['cat', 'Kategori', 'select', { opts: catOpts }], ['status', 'Status', 'select', { opts: statusOpts }],
        ['summary', 'Deskripsi singkat', 'textarea', { req: 1 }], ['goal', 'Tujuan', 'textarea'], ['benefit', 'Manfaat', 'textarea'], ['problem', 'Permasalahan', 'textarea'], ['scope', 'Ruang lingkup', 'textarea'],
        ['steps', 'Tahapan (satu per baris)', 'list'], ['tech', 'Teknologi (koma/baris)', 'list'], ['components', 'Komponen', 'list'], ['tools', 'Tools', 'list'],
        ['timeline', 'Timeline', 'text'], ['maintenance', 'Pemeliharaan', 'textarea'], ['techInfo', 'Informasi teknis', 'textarea'], ['results', 'Hasil', 'textarea'],
        ['cover', 'Foto sampul (maks 300 KB)', 'image'], ['gallery', 'Galeri/dokumentasi (maks 300 KB/foto)', 'gallery'], ['visibility', 'Visibilitas', 'select', { opts: VIS }], ['demo', 'Tandai sebagai DEMO', 'check']
      ],
      blank: function () { return { cat: 'web', status: 'planned', steps: [], tech: [], components: [], tools: [], gallery: [], links: [], visibility: 'draft', demo: false, cover: '', views: 0, createdAt: NT.now() }; },
      preview: function (r) { return 'index.html#/project-detail?id=' + encodeURIComponent(r.id); }
    },
    partners: {
      label: 'Mitra Bisnis', icon: 'handshake', cols: ['name', 'cat', 'country', 'visibility'], search: ['name', 'profile', 'country'], prefix: 'pt',
      fields: [
        ['name', 'Nama perusahaan', 'text', { req: 1 }], ['cat', 'Kategori', 'select', { opts: pcatOpts }], ['country', 'Negara', 'text'], ['location', 'Lokasi', 'text'],
        ['website', 'Website resmi (https://…)', 'url'], ['email', 'Email bisnis resmi', 'email'], ['profile', 'Profil', 'textarea', { req: 1 }], ['services', 'Layanan/bidang usaha', 'textarea'], ['expertise', 'Keahlian', 'text'], ['tech', 'Teknologi/produk', 'text'],
        ['collab', 'Bentuk kolaborasi', 'textarea'], ['joint', 'Proyek bersama', 'textarea'], ['period', 'Periode kemitraan', 'text'], ['status', 'Status kemitraan', 'select', { opts: [['demo', 'Placeholder/DEMO'], ['prospect', 'Calon mitra'], ['active', 'Aktif (terverifikasi)'], ['ended', 'Berakhir']] }],
        ['logo', 'Logo (aset resmi/berizin, maks 300 KB)', 'image'], ['visibility', 'Visibilitas', 'select', { opts: VIS }], ['demo', 'Tandai sebagai DEMO', 'check']
      ],
      blank: function () { return { cat: 'technology', status: 'prospect', visibility: 'draft', demo: false, logo: '', createdAt: NT.now() }; },
      preview: function (r) { return 'index.html#/partners?p=' + encodeURIComponent(r.id); }
    },
    milestones: {
      label: 'Company Journey', icon: 'clock', cols: ['order', 'date', 'title', 'visibility'], search: ['title', 'desc', 'date'], prefix: 'm', sortBy: 'order',
      fields: [
        ['date', 'Tahun/tanggal (fakta nyata)', 'text', { req: 1 }], ['title', 'Judul', 'text', { req: 1 }], ['desc', 'Deskripsi', 'textarea', { req: 1 }],
        ['cat', 'Kategori', 'select', { opts: [['company', 'Perusahaan'], ['team', 'Tim'], ['web', 'Web & Engineering'], ['wiring', 'Wiring & Jaringan'], ['iot', 'IoT'], ['robotics', 'Robotika'], ['future', 'Masa depan'], ['other', 'Lainnya']] }],
        ['order', 'Urutan (angka kecil tampil lebih dulu)', 'number'], ['projectIds', 'Proyek terkait', 'multi', { src: 'projects', label: 'title' }], ['partnerIds', 'Mitra terkait', 'multi', { src: 'partners', label: 'name' }],
        ['image', 'Foto (maks 300 KB)', 'image'], ['visibility', 'Visibilitas', 'select', { opts: VIS }], ['demo', 'Tandai sebagai DEMO', 'check']
      ],
      blank: function () { var o = db().milestones.reduce(function (a, m) { return Math.max(a, m.order || 0); }, 0); return { cat: 'company', order: o + 1, projectIds: [], partnerIds: [], image: '', visibility: 'draft', demo: false }; },
      preview: function (r) { return 'index.html#/company-journey?_a=' + encodeURIComponent(r.id); }
    },
    faqs: {
      label: 'FAQ', icon: 'info', cols: ['order', 'q', 'visibility'], search: ['q', 'a'], prefix: 'f', sortBy: 'order',
      fields: [['q', 'Pertanyaan', 'text', { req: 1 }], ['a', 'Jawaban', 'textarea', { req: 1 }], ['order', 'Urutan', 'number'], ['visibility', 'Visibilitas', 'select', { opts: VIS }]],
      blank: function () { return { order: db().faqs.length + 1, visibility: 'published' }; }, preview: function () { return 'index.html#/faq'; }
    },
    services: {
      label: 'Layanan', icon: 'wrench', cols: ['title', 'cat'], search: ['title', 'desc'], prefix: 's',
      fields: [['title', 'Judul', 'text', { req: 1 }], ['cat', 'Kategori', 'select', { opts: catOpts }], ['desc', 'Deskripsi', 'textarea', { req: 1 }], ['points', 'Poin layanan (satu per baris)', 'list']],
      blank: function () { return { cat: 'web', points: [] }; }, preview: function () { return 'index.html#/services'; }
    },
    wiring: {
      label: 'Jalur Wiring Cable', icon: 'cable', cols: ['name', 'cable', 'location', 'status', 'visibility'], search: ['name', 'cable', 'location', 'points'], prefix: 'w',
      fields: [['name', 'Nama jalur', 'text', { req: 1 }], ['cable', 'Jenis kabel', 'text'], ['location', 'Lokasi', 'text'], ['points', 'Titik koneksi', 'text'], ['status', 'Status', 'select', { opts: statusOpts }], ['projectId', 'Proyek terkait', 'select', { opts: projOpts }], ['notes', 'Catatan maintenance', 'textarea'], ['visibility', 'Visibilitas', 'select', { opts: VIS }], ['demo', 'Tandai sebagai DEMO', 'check']],
      blank: function () { return { status: 'planned', projectId: '', visibility: 'draft', demo: false }; }
    },
    devices: {
      label: 'Perangkat IoT', icon: 'chip', cols: ['name', 'mcu', 'func', 'status', 'visibility'], search: ['name', 'mcu', 'func', 'sensors'], prefix: 'd',
      fields: [['name', 'Nama perangkat', 'text', { req: 1 }], ['mcu', 'Mikrokontroler', 'text'], ['sensors', 'Sensor/komponen', 'text'], ['func', 'Fungsi', 'textarea'], ['status', 'Status', 'select', { opts: statusOpts }], ['projectId', 'Proyek terkait', 'select', { opts: projOpts }], ['notes', 'Catatan', 'textarea'], ['visibility', 'Visibilitas', 'select', { opts: VIS }], ['demo', 'Tandai sebagai DEMO', 'check']],
      blank: function () { return { status: 'planned', projectId: '', visibility: 'draft', demo: false }; }
    },
    robots: {
      label: 'Robot & Embedded', icon: 'robot', cols: ['name', 'type', 'stage', 'visibility'], search: ['name', 'type', 'components'], prefix: 'r',
      fields: [['name', 'Nama/kode robot', 'text', { req: 1 }], ['type', 'Jenis', 'text'], ['components', 'Komponen', 'textarea'], ['spec', 'Spesifikasi', 'textarea'], ['stage', 'Tahap pengembangan', 'select', { opts: [['Konsep', 'Konsep'], ['Prototipe', 'Prototipe'], ['Pengembangan', 'Pengembangan'], ['Pengujian', 'Pengujian'], ['Produksi', 'Produksi']] }], ['projectId', 'Proyek terkait', 'select', { opts: projOpts }], ['notes', 'Dokumentasi/catatan', 'textarea'], ['visibility', 'Visibilitas', 'select', { opts: VIS }], ['demo', 'Tandai sebagai DEMO', 'check']],
      blank: function () { return { stage: 'Konsep', projectId: '', visibility: 'draft', demo: false }; }
    },
    users: {
      label: 'Pengguna Admin', icon: 'users', cols: ['name', 'email', 'role', 'active'], search: ['name', 'email'], prefix: 'u', adminOnly: true, noDelete: false,
      fields: [['name', 'Nama', 'text', { req: 1 }], ['email', 'Email', 'email', { req: 1 }], ['role', 'Peran', 'select', { opts: [['admin', 'Admin (penuh)'], ['editor', 'Editor (konten)']] }], ['active', 'Aktif', 'check'], ['newpw', 'Password baru (kosongkan jika tidak diubah)', 'password']],
      blank: function () { return { role: 'editor', active: true }; }
    }
  };

  // ---------- form generik ----------
  function fieldHtml(f, v) {
    var k = f[0], l = f[1], t = f[2], o = f[3] || {}, id = 'f_' + k, lab = '<label for="' + id + '">' + esc(l) + (o.req ? ' *' : '') + '</label>';
    if (t === 'textarea') return '<div class="full">' + lab + '<textarea id="' + id + '">' + esc(v || '') + '</textarea></div>';
    if (t === 'list') return '<div class="full">' + lab + '<textarea id="' + id + '">' + esc((v || []).join('\n')) + '</textarea></div>';
    if (t === 'select') return '<div>' + lab + '<select id="' + id + '">' + (typeof o.opts === 'function' ? o.opts() : o.opts).map(function (x) { return '<option value="' + esc(x[0]) + '"' + (x[0] === v ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('') + '</select></div>';
    if (t === 'check') return '<div><label style="display:flex;gap:8px;align-items:center;margin-top:26px"><input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + ' style="width:auto"> ' + esc(l) + '</label></div>';
    if (t === 'multi') return '<div class="full">' + lab + '<select id="' + id + '" multiple size="5">' + db()[o.src].map(function (x) { return '<option value="' + esc(x.id) + '"' + ((v || []).indexOf(x.id) > -1 ? ' selected' : '') + '>' + esc(x[o.label]) + '</option>'; }).join('') + '</select></div>';
    if (t === 'image') return '<div class="full">' + lab + '<input type="file" id="' + id + '" accept="image/*"><div class="inline" style="margin-top:6px">' + (v ? '<img src="' + esc(v) + '" alt="Pratinjau" style="height:60px;border-radius:8px"><label style="margin:0;font-weight:400"><input type="checkbox" id="' + id + '_rm" style="width:auto"> hapus gambar</label>' : '') + '</div></div>';
    if (t === 'gallery') return '<div class="full">' + lab + '<input type="file" id="' + id + '" accept="image/*" multiple><div class="inline" style="margin-top:6px" id="' + id + '_cur">' + (v || []).map(function (g, i) { return '<label style="font-weight:400;margin:0"><img src="' + esc(g.src) + '" alt="" style="height:50px;border-radius:6px"><br><input type="checkbox" data-rm="' + i + '" style="width:auto"> hapus</label>'; }).join('') + '</div></div>';
    return '<div>' + lab + '<input id="' + id + '" type="' + (t === 'number' ? 'number' : t === 'password' ? 'password' : t === 'email' ? 'email' : t === 'url' ? 'url' : 'text') + '" value="' + esc(v == null ? '' : v) + '"' + (o.max ? ' maxlength="' + o.max + '"' : '') + (t === 'password' ? ' autocomplete="new-password"' : '') + '></div>';
  }
  async function collect(fields, m, rec) {
    var out = {}, err = '';
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i], k = f[0], t = f[2], o = f[3] || {}, el = m.querySelector('#f_' + k);
      if (t === 'check') out[k] = el.checked;
      else if (t === 'list') out[k] = toList(el.value);
      else if (t === 'multi') out[k] = Array.prototype.slice.call(el.selectedOptions).map(function (x) { return x.value; });
      else if (t === 'number') out[k] = +el.value || 0;
      else if (t === 'image') {
        out[k] = rec[k] || '';
        if (m.querySelector('#f_' + k + '_rm') && m.querySelector('#f_' + k + '_rm').checked) out[k] = '';
        if (el.files[0]) out[k] = await readFile(el.files[0], 300 * 1024);
      } else if (t === 'gallery') {
        var keep = (rec[k] || []).filter(function (g, idx) { var c = m.querySelector('[data-rm="' + idx + '"]'); return !(c && c.checked); });
        for (var j = 0; j < el.files.length; j++) keep.push({ src: await readFile(el.files[j], 300 * 1024), caption: el.files[j].name.replace(/\.[^.]+$/, '') });
        out[k] = keep;
      } else {
        var v = el.value.trim(); out[k] = v;
        if (o.req && !v) throw new Error('"' + f[1] + '" wajib diisi.');
        if (t === 'url' && v && !NT.safeUrl(v)) throw new Error('"' + f[1] + '" harus berupa URL http(s) valid.');
        if (t === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) throw new Error('"' + f[1] + '" bukan email valid.');
      }
    }
    return out;
  }

  // ---------- tampilan CRUD ----------
  function crud(key) {
    var E = ENT[key], st = { q: '', vis: 'all', page: 1 }, v = $('#view');
    v.innerHTML = '<div class="toolbar"><input class="grow" type="search" id="q" placeholder="Cari…" aria-label="Cari">' + (E.fields.some(function (f) { return f[0] === 'visibility'; }) ? '<select id="vf" aria-label="Filter status"><option value="all">Semua status</option>' + VIS.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + '</option>'; }).join('') + '</select>' : '') + '<button class="btn btn-primary" id="add">' + icon('plus') + ' Tambah</button></div><div class="tbl-wrap"><table class="tbl"><thead><tr id="th"></tr></thead><tbody id="tb"></tbody></table></div><div class="pager" id="pg"></div>';
    var labels = {}; E.fields.forEach(function (f) { labels[f[0]] = f[1]; }); labels.visibility = 'Visibilitas'; labels.order = 'Urut'; labels.active = 'Aktif'; labels.q = 'Pertanyaan';
    $('#th').innerHTML = E.cols.map(function (c) { return '<th>' + esc(labels[c] || c) + '</th>'; }).join('') + '<th>Aksi</th>';
    function show(r, c) {
      var val = r[c]; if (c === 'cat') val = (NT.CATS[val] || {}).label || NT.PCATS[val] || val; if (c === 'status') val = NT.STATUS[val] || val; if (c === 'active') val = val === false ? 'Tidak' : 'Ya';
      if (c === 'visibility') return '<span class="chip ' + (val === 'published' ? 'ok' : '') + '">' + esc(val) + '</span>' + (r.demo ? ' <span class="chip demo">DEMO</span>' : '');
      return esc(val == null ? '' : val);
    }
    function draw() {
      var rows = db()[key].filter(function (r) { return (st.vis === 'all' || r.visibility === st.vis) && (!st.q || E.search.some(function (s) { return String(r[s] || '').toLowerCase().indexOf(st.q) > -1; })); });
      if (E.sortBy) rows.sort(function (a, b) { return (a[E.sortBy] || 0) - (b[E.sortBy] || 0); });
      var slice = rows.slice((st.page - 1) * PAGE, st.page * PAGE);
      $('#tb').innerHTML = slice.length ? slice.map(function (r) {
        return '<tr>' + E.cols.map(function (c) { return '<td>' + show(r, c) + '</td>'; }).join('') + '<td><div class="row-actions">' +
          (E.preview ? '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' + esc(E.preview(r)) + '" aria-label="Preview">' + icon('eye') + '</a>' : '') +
          '<button class="btn btn-ghost btn-sm" data-e="' + esc(r.id) + '" aria-label="Edit">' + icon('edit') + '</button>' +
          (E.fields.some(function (f) { return f[0] === 'visibility'; }) ? '<button class="btn btn-ghost btn-sm" data-a="' + esc(r.id) + '" aria-label="Arsipkan">' + icon('archive') + '</button>' : '') +
          (key === 'users' && r.id === sess.id ? '' : '<button class="btn btn-ghost btn-sm" data-d="' + esc(r.id) + '" aria-label="Hapus">' + icon('trash') + '</button>') + '</div></td></tr>';
      }).join('') : '<tr><td colspan="' + (E.cols.length + 1) + '" class="muted">Tidak ada data.</td></tr>';
      pager(rows.length, st.page, function (p) { st.page = p; draw(); }, $('#pg'));
    }
    function form(rec, isNew) {
      var m = NT.modal((isNew ? 'Tambah ' : 'Edit ') + E.label, '<form id="ef" novalidate><div class="form-grid">' + E.fields.map(function (f) { return fieldHtml(f, rec[f[0]]); }).join('') + '</div><div class="err" id="eer" role="alert"></div><div class="inline" style="margin-top:12px"><button class="btn btn-primary" type="submit">Simpan</button><button class="btn btn-ghost" type="button" data-close>Batal</button></div></form>');
      m.querySelector('#ef').addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
          var out = await collect(E.fields, m, rec), pw = out.newpw; delete out.newpw;
          if (key === 'users') {
            var dup = db().users.some(function (u) { return u.email === out.email.toLowerCase() && u.id !== rec.id; }); if (dup) throw new Error('Email sudah dipakai.');
            out.email = out.email.toLowerCase();
            if (isNew && (!pw || pw.length < 10 || !/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw))) throw new Error('Password awal min. 10 karakter dengan huruf besar, kecil, dan angka.');
            if (pw) { if (pw.length < 10 || !/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) throw new Error('Password min. 10 karakter dengan huruf besar, kecil, dan angka.'); var h = await NT.hashPw(pw); out.salt = h.salt; out.hash = h.hash; }
            if (!isNew && rec.id === sess.id && (out.role !== 'admin' || out.active === false)) throw new Error('Anda tidak dapat menurunkan/menonaktifkan akun sendiri.');
            var admins = db().users.filter(function (u) { return u.id !== rec.id && u.role === 'admin' && u.active !== false; }).length + (out.role === 'admin' && out.active ? 1 : 0); if (!admins) throw new Error('Minimal harus ada satu admin aktif.');
          }
          if (isNew) { rec = Object.assign(rec, out); rec.id = NT.uid(E.prefix); db()[key].push(rec); } else Object.assign(rec, out);
          NT.log(key + (isNew ? '.create' : '.update'), rec.title || rec.name || rec.q || rec.email || rec.id);
          if (NT.save()) { NT.toast('Tersimpan.'); m.close(); draw(); renderSide(); } else throw new Error('Penyimpanan browser penuh. Hapus gambar besar lalu coba lagi.');
        } catch (er) { m.querySelector('#eer').textContent = er.message; }
      });
    }
    $('#q').addEventListener('input', function (e) { st.q = e.target.value.toLowerCase(); st.page = 1; draw(); });
    if ($('#vf')) $('#vf').addEventListener('change', function (e) { st.vis = e.target.value; st.page = 1; draw(); });
    $('#add').addEventListener('click', function () { form(E.blank(), true); });
    $('#tb').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var id = b.dataset.e || b.dataset.a || b.dataset.d, r = db()[key].filter(function (x) { return x.id === id; })[0]; if (!r) return;
      if (b.dataset.e) form(r, false);
      if (b.dataset.a) confirmBox('Arsipkan "' + (r.title || r.name || r.q) + '"? Data tetap tersimpan dan bisa dipulihkan.', function () { r.visibility = 'archived'; NT.log(key + '.archive', r.id); NT.save(); draw(); });
      if (b.dataset.d) confirmBox('Hapus permanen "' + (r.title || r.name || r.q || r.email) + '"? Tindakan ini tidak dapat dibatalkan.', function () { db()[key] = db()[key].filter(function (x) { return x.id !== id; }); NT.log(key + '.delete', id); NT.save(); draw(); renderSide(); });
    });
    draw();
  }

  // ---------- inbox (pesan, proposal, komentar) ----------
  function inbox(kind) {
    var v = $('#view'), list = db()[kind], STAT = { messages: ['new', 'read', 'done'], proposals: ['new', 'review', 'accepted', 'rejected'] };
    function draw() {
      var rows = db()[kind].slice();
      v.innerHTML = '<div class="toolbar"><input class="grow" type="search" id="q" placeholder="Cari…" aria-label="Cari"></div><div class="stack" id="lst"></div>';
      function paint() {
        var q = $('#q').value.toLowerCase(), r = rows.filter(function (x) { return !q || JSON.stringify(x).toLowerCase().indexOf(q) > -1; });
        $('#lst').innerHTML = r.length ? r.map(function (x) {
          if (kind === 'comments') return '<div class="panel"><div class="inline"><strong>' + esc(x.name) + '</strong><span class="muted">' + esc(NT.fmt(x.at)) + ' · ' + esc(x.key) + '</span>' + (x.reported ? '<span class="chip demo">dilaporkan spam</span>' : '') + '<span class="chip ' + (x.status === 'approved' ? 'ok' : '') + '">' + esc(x.status) + '</span></div><p>' + esc(x.text) + '</p><div class="row-actions"><button class="btn btn-ghost btn-sm" data-s="' + x.id + '" data-v="' + (x.status === 'approved' ? 'hidden' : 'approved') + '">' + (x.status === 'approved' ? 'Sembunyikan' : 'Setujui') + '</button><button class="btn btn-ghost btn-sm" data-d="' + x.id + '">' + icon('trash') + ' Hapus</button></div></div>';
          return '<div class="panel"><div class="inline"><strong>' + esc(x.name) + '</strong>' + (x.company ? '<span>' + esc(x.company) + '</span>' : '') + '<a href="mailto:' + esc(x.email) + '">' + esc(x.email) + '</a><span class="muted">' + esc(NT.fmt(x.at)) + '</span><span class="chip">' + esc(x.type || x.topic || '') + '</span></div><p style="white-space:pre-wrap">' + esc(x.text) + '</p><div class="inline"><select data-st="' + x.id + '" aria-label="Status">' + STAT[kind].map(function (s) { return '<option' + (s === x.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select><button class="btn btn-ghost btn-sm" data-d="' + x.id + '">' + icon('trash') + ' Hapus</button></div></div>';
        }).join('') : '<div class="empty">Belum ada data.</div>';
      }
      $('#q').addEventListener('input', paint); paint();
      $('#lst').addEventListener('change', function (e) { var s = e.target.dataset.st; if (s) { var r = list.filter(function (z) { return z.id === s; })[0]; r.status = e.target.value; NT.log(kind + '.status', s + '=' + r.status); NT.save(); renderSide(); } });
      $('#lst').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.s) { var c = list.filter(function (z) { return z.id === b.dataset.s; })[0]; c.status = b.dataset.v; c.reported = false; NT.log('comments.moderate', c.id + '=' + c.status); NT.save(); draw(); }
        if (b.dataset.d) confirmBox('Hapus data ini secara permanen?', function () { db()[kind] = db()[kind].filter(function (z) { return z.id !== b.dataset.d; }); NT.log(kind + '.delete', b.dataset.d); NT.save(); draw(); renderSide(); });
      });
    }
    draw();
  }

  // ---------- dashboard ----------
  function dashboard() {
    var d = db(), v = $('#view'), views = d.projects.reduce(function (a, p) { return a + (p.views || 0); }, 0), pub = function (a) { return a.filter(function (x) { return x.visibility === 'published'; }).length; };
    var newN = function (a) { return a.filter(function (x) { return x.status === 'new'; }).length; };
    var maxC = Math.max.apply(null, Object.keys(NT.CATS).map(function (k) { return d.projects.filter(function (p) { return p.cat === k; }).length; }).concat([1]));
    v.innerHTML = '<div class="kpis">' + [['Proyek terbit', pub(d.projects) + '/' + d.projects.length], ['Mitra terbit', pub(d.partners) + '/' + d.partners.length], ['Milestone terbit', pub(d.milestones) + '/' + d.milestones.length], ['Pesan baru', newN(d.messages)], ['Proposal baru', newN(d.proposals)], ['Komentar dilaporkan', d.comments.filter(function (c) { return c.reported; }).length], ['Total tayangan proyek', views]].map(function (k) { return '<div class="kpi"><span class="muted">' + k[0] + '</span><b>' + k[1] + '</b></div>'; }).join('') + '</div>' +
      '<div class="grid"><div class="panel"><h3>Proyek per kategori</h3><div class="stack">' + Object.keys(NT.CATS).map(function (k) { var n = d.projects.filter(function (p) { return p.cat === k; }).length; return '<div><div class="inline" style="justify-content:space-between"><span>' + esc(NT.CATS[k].label) + '</span><strong>' + n + '</strong></div><div class="bar" role="img" aria-label="' + n + ' proyek"><i style="width:' + Math.round(n / maxC * 100) + '%"></i></div></div>'; }).join('') + '</div></div>' +
      '<div class="panel"><h3>Tayangan terbanyak</h3>' + (views ? d.projects.slice().sort(function (a, b) { return (b.views || 0) - (a.views || 0); }).slice(0, 5).filter(function (p) { return p.views; }).map(function (p) { return '<p style="margin:0 0 6px">' + esc(p.title) + ' — <strong>' + p.views + '</strong></p>'; }).join('') : '<p class="muted">Belum ada tayangan di browser ini. Statistik hanya mencakup kunjungan pada browser ini.</p>') + '</div>' +
      '<div class="panel"><h3>Aktivitas terakhir</h3>' + (d.audit.slice(0, 6).map(function (a) { return '<p style="margin:0 0 6px;font-size:.88rem"><strong>' + esc(a.action) + '</strong> · ' + esc(a.user) + '<br><span class="muted">' + esc(NT.fmt(a.at)) + ' ' + esc(a.detail) + '</span></p>'; }).join('') || '<p class="muted">Belum ada.</p>') + '</div></div>' +
      '<div class="notice warn" style="margin-top:20px">Semua data tersimpan di browser ini (localStorage). Gunakan Pengaturan &gt; Backup secara rutin. Kebutuhan backend: lihat README.</div>';
  }
  function notifs() {
    var v = $('#view'), n = db().notifications;
    v.innerHTML = '<div class="toolbar"><button class="btn btn-ghost btn-sm" id="mk">Tandai semua dibaca</button><button class="btn btn-ghost btn-sm" id="cl">Kosongkan</button></div><div class="notif-list">' + (n.length ? n.map(function (x) { return '<div class="n" style="' + (x.read ? 'opacity:.6' : 'border-left:4px solid var(--cyan)') + '">' + esc(x.text) + '<br><small class="muted">' + esc(NT.fmt(x.at)) + '</small></div>'; }).join('') : '<p class="muted">Tidak ada notifikasi.</p>') + '</div>';
    $('#mk').onclick = function () { n.forEach(function (x) { x.read = true; }); NT.save(); notifs(); renderSide(); };
    $('#cl').onclick = function () { confirmBox('Kosongkan semua notifikasi?', function () { db().notifications = []; NT.save(); notifs(); renderSide(); }); };
  }
  function audit() {
    var v = $('#view'), st = { page: 1 };
    v.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Waktu</th><th>Pengguna</th><th>Aksi</th><th>Detail</th></tr></thead><tbody id="tb"></tbody></table></div><div class="pager" id="pg"></div>';
    (function draw() { var a = db().audit; $('#tb').innerHTML = a.slice((st.page - 1) * 12, st.page * 12).map(function (x) { return '<tr><td>' + esc(NT.fmt(x.at)) + '</td><td>' + esc(x.user) + '</td><td>' + esc(x.action) + '</td><td>' + esc(x.detail) + '</td></tr>'; }).join('') || '<tr><td colspan="4" class="muted">Kosong.</td></tr>'; var pages = Math.max(1, Math.ceil(a.length / 12)); $('#pg').innerHTML = '<span class="muted">Hal ' + st.page + '/' + pages + '</span><button class="btn btn-ghost btn-sm" ' + (st.page <= 1 ? 'disabled' : '') + ' id="pv">‹</button><button class="btn btn-ghost btn-sm" ' + (st.page >= pages ? 'disabled' : '') + ' id="nx">›</button>'; var p = $('#pv'), n = $('#nx'); p.onclick = function () { st.page--; draw(); }; n.onclick = function () { st.page++; draw(); }; })();
  }
  function company() {
    var c = db().company, F = [['name', 'Nama', 'text'], ['tagline', 'Tagline', 'text'], ['about', 'Tentang', 'textarea'], ['vision', 'Visi', 'textarea'], ['mission', 'Misi', 'textarea'], ['founded', 'Tahun berdiri (isi hanya fakta nyata)', 'text'], ['email', 'Email resmi', 'email'], ['phone', 'Telepon', 'text'], ['address', 'Alamat', 'textarea'], ['website', 'Website', 'url'], ['hours', 'Jam operasional', 'text'], ['seoTitle', 'SEO title', 'text'], ['seoDesc', 'SEO description', 'textarea']];
    $('#view').innerHTML = '<form id="cf" novalidate><div class="form-grid">' + F.map(function (f) { return fieldHtml(f, c[f[0]]); }).join('') + '</div><div class="err" id="er" role="alert"></div><button class="btn btn-primary" style="margin-top:12px">Simpan profil</button></form>';
    $('#cf').addEventListener('submit', async function (e) { e.preventDefault(); try { var o = await collect(F, $('#cf'), c); Object.assign(c, o); NT.log('company.update', ''); NT.save(); NT.toast('Profil tersimpan.'); } catch (er) { $('#er').textContent = er.message; } });
  }
  function settings() {
    var s = db().settings;
    $('#view').innerHTML = '<div class="stack" style="max-width:640px"><div class="panel stack"><h3>Umum</h3><label>Bahasa default situs<select id="sl">' + Object.keys(NT.LANGS).map(function (k) { return '<option value="' + k + '"' + (s.lang === k ? ' selected' : '') + '>' + NT.LANGS[k][0] + '</option>'; }).join('') + '</select></label><label>Tema<select id="st"><option value="auto">Otomatis</option><option value="light">Terang</option><option value="dark">Gelap</option></select></label><label style="display:flex;gap:8px;font-weight:400"><input type="checkbox" id="sc" style="width:auto"' + (s.commentsOn ? ' checked' : '') + '> Aktifkan komentar publik</label><button class="btn btn-primary" id="sv">Simpan</button></div>' +
      '<div class="panel stack"><h3>Backup & ekspor</h3><div class="inline"><button class="btn btn-ghost" id="ex">' + icon('download') + ' Unduh backup JSON</button><label class="btn btn-ghost" style="margin:0">' + icon('upload') + ' Pulihkan backup<input type="file" id="im" accept="application/json" hidden></label></div><p class="muted" style="margin:0;font-size:.85rem">Backup berisi seluruh data termasuk hash password pengguna. Simpan dengan aman.</p></div>' +
      '<div class="panel stack"><h3>Laporan CSV</h3><div class="inline"><button class="btn btn-ghost" data-csv="projects">Proyek</button><button class="btn btn-ghost" data-csv="partners">Mitra</button><button class="btn btn-ghost" data-csv="messages">Pesan</button><button class="btn btn-ghost" data-csv="proposals">Proposal</button></div></div>' +
      '<div class="panel stack"><h3>Zona berbahaya</h3><button class="btn btn-danger" id="rs">Reset ke data DEMO awal</button><p class="muted" style="margin:0;font-size:.85rem">Menghapus semua perubahan, termasuk akun admin. Unduh backup dulu.</p></div></div>';
    $('#st').value = s.theme;
    $('#sv').onclick = function () { s.lang = $('#sl').value; s.theme = $('#st').value; s.commentsOn = $('#sc').checked; NT.log('settings.update', ''); NT.save(); applyTheme(); NT.toast('Pengaturan tersimpan.'); };
    $('#ex').onclick = function () { dl('nexus-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(db(), null, 2), 'application/json'); NT.log('backup.export', ''); NT.save(); };
    $('#im').onchange = function (e) { var f = e.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { confirmBox('Timpa semua data saat ini dengan backup ini?', function () { try { NT.import(JSON.parse(r.result)); NT.toast('Backup dipulihkan. Silakan login kembali jika perlu.'); setTimeout(function () { location.reload(); }, 800); } catch (er) { NT.toast(er.message, true); } }); }; r.readAsText(f); };
    $('#view').querySelectorAll('[data-csv]').forEach(function (b) { b.onclick = function () { csv(b.dataset.csv); }; });
    $('#rs').onclick = function () { confirmBox('Reset SEMUA data ke DEMO awal? Anda akan keluar.', function () { NT.reset(); NT.endSession(); location.replace('login.html'); }); };
  }
  function dl(name, text, type) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); }
  function csv(key) {
    var rows = db()[key]; if (!rows.length) { NT.toast('Tidak ada data.', true); return; }
    var cols = Object.keys(rows[0]).filter(function (k) { return ['gallery', 'cover', 'logo', 'image', 'hash', 'salt'].indexOf(k) < 0; });
    var q = function (x) { x = Array.isArray(x) ? x.join('; ') : String(x == null ? '' : x); if (/^[=+\-@\t\r]/.test(x)) x = "'" + x; return '"' + x.replace(/"/g, '""') + '"'; }; // cegah formula injection
    dl(key + '.csv', cols.join(',') + '\n' + rows.map(function (r) { return cols.map(function (c) { return q(r[c]); }).join(','); }).join('\n'), 'text/csv'); NT.log('report.csv', key);
  }

  // ---------- kelengkapan & auto-isi ----------
  var AUTO = { projects: ['goal', 'benefit', 'problem', 'scope', 'steps', 'tech', 'components', 'tools', 'timeline', 'maintenance', 'techInfo', 'results'], partners: ['profile', 'services', 'expertise', 'collab'], milestones: ['desc'], wiring: ['notes'], devices: ['notes', 'func'], robots: ['spec', 'notes'] };
  var STEPS = { web: ['Analisis kebutuhan', 'Desain UI/UX', 'Pengembangan', 'Pengujian', 'Rilis & dokumentasi'], wiring: ['Survei lokasi', 'Perancangan jalur', 'Instalasi & terminasi', 'Pengujian', 'Dokumentasi'], iot: ['Analisis kebutuhan', 'Desain perangkat', 'Firmware & konektivitas', 'Dashboard', 'Uji lapangan'], robotics: ['Spesifikasi', 'Desain mekanik & elektronik', 'Firmware', 'Integrasi', 'Pengujian'] };
  var TAG = '[Auto-isi DEMO] ';
  function genField(key, r, f) {
    var name = r.title || r.name || 'entri ini', cat = r.cat || 'web';
    var G = {
      goal: TAG + 'Tujuan proyek "' + name + '" — isi dengan tujuan sebenarnya.', benefit: TAG + 'Manfaat proyek — isi dengan manfaat terukur yang sebenarnya.', problem: TAG + 'Permasalahan yang diselesaikan — isi dengan kondisi awal sebenarnya.',
      scope: TAG + 'Ruang lingkup: analisis, perancangan, implementasi, pengujian, dan serah terima.', steps: (STEPS[cat] || STEPS.web).slice(), tech: ['Belum ditentukan'], components: ['Belum ditentukan'], tools: ['Belum ditentukan'],
      timeline: TAG + 'Isi periode pengerjaan sebenarnya.', maintenance: TAG + 'Isi ketentuan pemeliharaan sebenarnya.', techInfo: TAG + 'Isi spesifikasi teknis sebenarnya.', results: TAG + 'Isi hasil sebenarnya.',
      profile: TAG + 'Profil perusahaan belum diverifikasi.', services: TAG + 'Layanan belum diverifikasi.', expertise: TAG + 'Keahlian belum diverifikasi.', collab: TAG + 'Belum ada kerja sama yang tercatat.',
      desc: TAG + 'Deskripsi milestone — isi dengan fakta sebenarnya.', notes: TAG + 'Catatan belum diisi.', func: TAG + 'Fungsi belum diisi.', spec: TAG + 'Spesifikasi belum diisi.'
    };
    return G[f];
  }
  var MANUAL = { company: ['founded', 'email', 'phone', 'address', 'website', 'hours'], partners: ['website', 'email', 'country', 'logo'] };
  function emptyFields(key, r) { return AUTO[key].filter(function (f) { return r[f] == null || r[f] === '' || (Array.isArray(r[f]) && !r[f].length); }); }
  function completeness() {
    var d = db(), v = $('#view'), total = 0, empt = 0, rows = '';
    Object.keys(AUTO).forEach(function (k) { var n = 0, e = 0; d[k].forEach(function (r) { n += AUTO[k].length; e += emptyFields(k, r).length; }); total += n; empt += e; rows += '<tr><td>' + esc(ENT[k].label) + '</td><td>' + d[k].length + '</td><td>' + (n - e) + '/' + n + '</td><td><div class="bar"><i style="width:' + (n ? Math.round((n - e) / n * 100) : 100) + '%"></i></div></td></tr>'; });
    var c = d.company, manual = [];
    MANUAL.company.forEach(function (f) { if (!c[f]) manual.push('Profil perusahaan: ' + f); });
    d.partners.forEach(function (p) { MANUAL.partners.forEach(function (f) { if (!p[f]) manual.push('Mitra "' + p.name + '": ' + f); }); });
    d.milestones.forEach(function (m) { if (!m.date || /isi tahun/i.test(m.date)) manual.push('Milestone "' + m.title + '": tanggal/tahun'); });
    var demoN = ['projects', 'partners', 'milestones', 'wiring', 'devices', 'robots'].reduce(function (a, k) { return a + d[k].filter(function (r) { return r.demo; }).length; }, 0);
    v.innerHTML = '<div class="kpis"><div class="kpi"><span class="muted">Kelengkapan field konten</span><b>' + (total ? Math.round((total - empt) / total * 100) : 100) + '%</b></div><div class="kpi"><span class="muted">Field kosong dapat di-auto-isi</span><b>' + empt + '</b></div><div class="kpi"><span class="muted">Entri berlabel DEMO</span><b>' + demoN + '</b></div><div class="kpi"><span class="muted">Data fakta wajib manual</span><b>' + manual.length + '</b></div></div>' +
      '<div class="panel stack"><h3>' + icon('spark') + ' Auto-isi</h3><p class="muted" style="margin:0">Mengisi field teks yang <strong>masih kosong</strong> dengan kerangka berawalan <code>[Auto-isi DEMO]</code> agar halaman publik tidak kosong. Tidak menimpa isi yang sudah ada dan <strong>tidak pernah</strong> mengisi data fakta (tahun, email, telepon, alamat, website, negara, logo).</p><div class="inline"><button class="btn btn-primary" id="af"' + (empt ? '' : ' disabled') + '>Isi otomatis ' + empt + ' field kosong</button></div></div>' +
      '<div class="tbl-wrap" style="margin-top:16px"><table class="tbl"><thead><tr><th>Data</th><th>Entri</th><th>Terisi</th><th>Progres</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="panel" style="margin-top:16px"><h3>' + icon('alert') + ' Wajib diisi manual (data fakta)</h3>' + (manual.length ? '<ul class="tick" style="max-height:300px;overflow:auto">' + manual.slice(0, 80).map(function (x) { return '<li>' + icon('alert') + esc(x) + '</li>'; }).join('') + (manual.length > 80 ? '<li class="muted">… dan ' + (manual.length - 80) + ' lainnya</li>' : '') + '</ul>' : '<p class="muted">Semua data fakta sudah terisi.</p>') + '</div>';
    $('#af').addEventListener('click', function () {
      confirmBox('Isi otomatis ' + empt + ' field kosong dengan teks kerangka berlabel DEMO?', function () {
        var n = 0; Object.keys(AUTO).forEach(function (k) { d[k].forEach(function (r) { emptyFields(k, r).forEach(function (f) { r[f] = genField(k, r, f); n++; }); }); });
        ['about', 'vision', 'mission'].forEach(function (f) { if (!c[f]) { c[f] = TAG + 'Isi dengan teks sebenarnya.'; n++; } });
        NT.log('autofill', n + ' field'); NT.notify('Auto-isi: ' + n + ' field diisi (berlabel DEMO)', 'info'); NT.save(); NT.toast(n + ' field terisi.'); completeness(); renderSide();
      });
    });
  }

  // ---------- navigasi ----------
  var VIEWS = [
    ['dashboard', 'Dashboard', 'dashboard', dashboard, 'Umum'], ['notifs', 'Notifikasi', 'bell', notifs],
    ['projects', ENT.projects.label, 'layers', function () { crud('projects'); }, 'Konten'], ['partners', ENT.partners.label, 'handshake', function () { crud('partners'); }], ['milestones', ENT.milestones.label, 'clock', function () { crud('milestones'); }], ['services', ENT.services.label, 'wrench', function () { crud('services'); }], ['faqs', 'FAQ', 'info', function () { crud('faqs'); }], ['company', 'Profil Perusahaan', 'settings', company],
    ['wiring', ENT.wiring.label, 'cable', function () { crud('wiring'); }, 'Engineering'], ['devices', ENT.devices.label, 'chip', function () { crud('devices'); }], ['robots', ENT.robots.label, 'robot', function () { crud('robots'); }],
    ['completeness', 'Kelengkapan & Auto-isi', 'check', completeness, 'Kualitas'],
    ['messages', 'Pesan Konsultasi', 'inbox', function () { inbox('messages'); }, 'Masuk'], ['proposals', 'Proposal Kerja Sama', 'mail', function () { inbox('proposals'); }], ['comments', 'Moderasi Komentar', 'comment', function () { inbox('comments'); }],
    ['users', 'Pengguna Admin', 'users', function () { crud('users'); }, 'Sistem', 1], ['audit', 'Audit Log', 'history', audit], ['settings', 'Pengaturan & Backup', 'settings', settings, null, 1]
  ];
  var cur = (location.hash || '#dashboard').slice(1);
  function badge(id) {
    var d = db(); var n = id === 'messages' ? d.messages.filter(function (x) { return x.status === 'new'; }).length : id === 'proposals' ? d.proposals.filter(function (x) { return x.status === 'new'; }).length : id === 'comments' ? d.comments.filter(function (x) { return x.reported; }).length : id === 'notifs' ? d.notifications.filter(function (x) { return !x.read; }).length : 0;
    return n ? ' <span class="badge-dot" style="position:static;margin-left:auto">' + n + '</span>' : '';
  }
  function renderSide() {
    var h = '<div class="brand"><img src="assets/icons/logo.svg" alt="" width="34" height="34"> Nexus Admin</div>', grp = '';
    VIEWS.forEach(function (x) {
      if (x[5] && !isAdmin()) return; if (x[4]) h += '<div class="grp">' + x[4] + '</div>';
      h += '<button class="nav-i" data-v="' + x[0] + '"' + (cur === x[0] ? ' aria-current="true"' : '') + '>' + icon(x[2]) + '<span>' + esc(x[1]) + '</span>' + badge(x[0]) + '</button>';
    });
    h += '<div style="margin-top:auto;padding:10px;font-size:.82rem">' + esc(sess.name) + ' · ' + esc(sess.role) + '</div><button class="nav-i" id="lo">' + icon('logout') + '<span>Keluar</span></button>';
    $('#side').innerHTML = h;
  }
  function go(id) {
    var x = VIEWS.filter(function (z) { return z[0] === id; })[0] || VIEWS[0]; if (x[5] && !isAdmin()) x = VIEWS[0];
    cur = x[0]; location.hash = cur; $('#title').textContent = x[1]; $('#view').innerHTML = ''; x[3](); renderSide(); $('#side').classList.remove('open'); window.scrollTo(0, 0);
  }
  function applyTheme() { var m = db().settings.theme, dk = m === 'dark' || (m === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.setAttribute('data-theme', dk ? 'dark' : 'light'); $('#themeBtn').innerHTML = icon(dk ? 'sun' : 'moon'); }
  $('#side').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.id === 'lo') { NT.log('logout', ''); NT.save(); NT.endSession(); location.replace('login.html'); } else if (b.dataset.v) go(b.dataset.v); });
  $('#menuBtn').addEventListener('click', function () { $('#side').classList.toggle('open'); });
  $('#themeBtn').addEventListener('click', function () { var s = db().settings; s.theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; NT.save(); applyTheme(); });
  // sesi kedaluwarsa → login
  setInterval(function () { if (!NT.session()) location.replace('login.html'); }, 30000);
  applyTheme(); go(cur);
})();
