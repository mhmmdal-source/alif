/* Nexus Tech — lapisan data bersama (publik + admin).
   PENTING: ini arsitektur frontend-only. Data disimpan di localStorage browser ini saja.
   Tidak ada server, database bersama, atau keamanan sungguhan. Lihat README. */
(function () {
  'use strict';
  var KEY = 'nexustech.db.v1';
  var NT = (window.NT = window.NT || {});

  NT.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  NT.uid = function (p) { return (p || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  NT.now = function () { return new Date().toISOString(); };
  NT.fmt = function (iso) { try { return new Date(iso).toLocaleString(); } catch (e) { return iso; } };
  NT.safeUrl = function (u) { try { var x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; } };
  NT.slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };

  NT.CATS = {
    web: { label: 'Web Development', icon: 'code', img: 'assets/images/cat-web.svg' },
    wiring: { label: 'Wiring Cable & Network', icon: 'cable', img: 'assets/images/cat-wiring.svg' },
    iot: { label: 'IoT & Automation', icon: 'chip', img: 'assets/images/cat-iot.svg' },
    robotics: { label: 'Robotics & Engineering', icon: 'robot', img: 'assets/images/cat-robotics.svg' }
  };
  NT.PCATS = {
    technology: 'Technology Partners',
    web: 'Web Development & Software',
    wiring: 'Wiring Cable & Network Infrastructure',
    iot: 'IoT & Automation',
    robotics: 'Robotics & Engineering',
    supplier: 'Suppliers & Business Partners'
  };
  NT.STATUS = { planned: 'Direncanakan', ongoing: 'Berjalan', done: 'Selesai', maintenance: 'Pemeliharaan' };

  var DEMO = ' (DEMO)';
  // [judul, ringkasan, tech, tujuan, masalah, komponen, tools, hasil(target contoh), infoTeknis]
  var PJ = {
    web: [
      ['Portal Layanan Pelanggan', 'Portal web responsif untuk pengajuan dan pelacakan tiket layanan.', ['HTML', 'CSS', 'JavaScript', 'REST API'], 'Memusatkan pengajuan dan pelacakan permintaan pelanggan dalam satu portal.', 'Permintaan tersebar di chat dan email sehingga sulit dilacak.', ['Form tiket', 'Halaman status', 'Notifikasi email', 'Panel admin'], ['VS Code', 'Git', 'Lighthouse'], 'Target contoh: waktu respons terlacak, tidak ada tiket terlewat.', 'Arsitektur klien–server, autentikasi sesi, basis data relasional.'],
      ['Dashboard Inventori', 'Dashboard stok dengan filter, grafik, dan ekspor laporan.', ['JavaScript', 'SVG Charts', 'Database'], 'Memberi gambaran stok real-time dan peringatan stok menipis.', 'Stok dicatat manual di spreadsheet yang sering tidak sinkron.', ['Tabel stok', 'Grafik tren', 'Modul ekspor', 'Peringatan ambang'], ['VS Code', 'Postman'], 'Target contoh: selisih stok berkurang, laporan bulanan otomatis.', 'Agregasi data di server, grafik SVG di klien, ekspor CSV.'],
      ['Website Company Profile Klien', 'Situs profil perusahaan dengan CMS ringan dan SEO.', ['HTML', 'CSS', 'CMS'], 'Membangun kehadiran daring profesional yang mudah diperbarui klien.', 'Klien tidak punya situs dan sulit memperbarui konten sendiri.', ['Template halaman', 'CMS ringan', 'Formulir kontak', 'Sitemap & metadata'], ['VS Code', 'Figma', 'Search Console'], 'Target contoh: situs dapat diedit mandiri, skor aksesibilitas tinggi.', 'Situs statis + CMS headless, optimasi gambar, metadata sosial.'],
      ['Aplikasi Reservasi Online', 'Sistem reservasi dengan kalender slot dan notifikasi.', ['JavaScript', 'API', 'Notifikasi'], 'Mengurangi bentrok jadwal dengan reservasi slot waktu daring.', 'Reservasi lewat telepon menyebabkan jadwal ganda.', ['Kalender slot', 'Validasi bentrok', 'Pengingat', 'Laporan harian'], ['VS Code', 'Git', 'Playwright'], 'Target contoh: tidak ada jadwal ganda, pengingat otomatis.', 'Penguncian slot atomik, zona waktu, antrean notifikasi.']
    ],
    wiring: [
      ['Penataan Kabel Ruang Server', 'Penataan, pelabelan, dan dokumentasi kabel rak server.', ['Cat6A', 'Patch Panel', 'Labeling'], 'Merapikan kabel agar aliran udara baik dan perbaikan cepat.', 'Kabel kusut tanpa label menyulitkan penelusuran gangguan.', ['Patch panel', 'Cable manager', 'Label kabel', 'Velcro tie'], ['Cable tester', 'Label printer', 'Tang crimping'], 'Target contoh: setiap kabel berlabel dan terdokumentasi.', 'Skema label sumber–tujuan, diagram rak, uji sertifikasi per link.'],
      ['Jaringan LAN Gedung Kantor', 'Perancangan dan instalasi LAN multi-lantai.', ['Cat6', 'Switch PoE', 'Fiber'], 'Menyediakan jaringan kabel yang stabil untuk seluruh lantai.', 'Jaringan lama sering putus dan kapasitasnya terbatas.', ['Rak lantai', 'Switch PoE', 'Jalur kabel', 'Titik akses'], ['Cable tester', 'Laser level', 'Toner probe'], 'Target contoh: seluruh titik lolos uji dan terdokumentasi.', 'Topologi bintang bertingkat, pemisahan VLAN, anggaran PoE.'],
      ['Pemeliharaan Kabel Berkala', 'Program inspeksi dan pengujian kabel terjadwal.', ['Cable Tester', 'Inspeksi', 'Laporan'], 'Mendeteksi degradasi kabel sebelum menyebabkan gangguan.', 'Gangguan baru ditangani setelah terjadi.', ['Jadwal inspeksi', 'Formulir uji', 'Log gangguan'], ['Cable tester', 'Kamera inspeksi'], 'Target contoh: laporan berkala dan riwayat perbaikan.', 'Checklist inspeksi, pencatatan hasil uji per titik.'],
      ['Backbone Fiber Optik Kampus', 'Penarikan dan terminasi fiber antargedung.', ['Fiber SM', 'Splicing', 'OTDR'], 'Menghubungkan antargedung dengan kapasitas tinggi.', 'Tembaga antargedung terbatas jarak dan rentan gangguan.', ['Kabel fiber', 'ODF', 'Pigtail', 'Closure'], ['Fusion splicer', 'OTDR', 'Power meter'], 'Target contoh: redaman dalam batas anggaran optik.', 'Anggaran redaman, hasil OTDR per core, rute dan kedalaman.']
    ],
    iot: [
      ['Monitoring Suhu Gudang', 'Sensor suhu & kelembapan dengan peringatan ambang.', ['ESP32', 'MQTT', 'Sensor DHT'], 'Menjaga kondisi penyimpanan dalam batas aman.', 'Suhu gudang tidak terpantau sehingga barang berisiko rusak.', ['ESP32', 'Sensor DHT22', 'Broker MQTT', 'Dashboard'], ['Arduino IDE', 'Mosquitto', 'Multimeter'], 'Target contoh: peringatan saat melewati ambang.', 'Publikasi MQTT berkala, retensi data, ambang dapat dikonfigurasi.'],
      ['Smart Lighting Ruang Kantor', 'Otomasi lampu berbasis jadwal dan sensor gerak.', ['Mikrokontroler', 'Relay', 'PIR'], 'Menghemat energi dengan pencahayaan otomatis.', 'Lampu sering menyala tanpa penghuni.', ['Mikrokontroler', 'Modul relay', 'Sensor PIR', 'Sensor cahaya'], ['Arduino IDE', 'Multimeter'], 'Target contoh: lampu menyala hanya saat dibutuhkan.', 'Logika jadwal + gerak, penundaan mati, mode manual.'],
      ['Irigasi Otomatis', 'Pengendali pompa berdasarkan kelembapan tanah.', ['ESP32', 'Sensor Tanah', 'Pompa'], 'Menyiram sesuai kebutuhan tanaman secara otomatis.', 'Penyiraman manual tidak konsisten dan boros air.', ['ESP32', 'Sensor tanah', 'Relay pompa', 'Catu daya'], ['Arduino IDE', 'Multimeter'], 'Target contoh: penyiraman berbasis ambang kelembapan.', 'Histeresis ambang, batas durasi pompa, kalibrasi sensor.'],
      ['Monitoring Energi Listrik', 'Pengukur konsumsi daya dengan dasbor.', ['Power Meter', 'MQTT', 'Dashboard'], 'Memantau konsumsi daya per area untuk efisiensi.', 'Konsumsi listrik tidak terpantau per area.', ['Power meter', 'Gateway', 'Dashboard', 'Penyimpanan data'], ['Modbus tool', 'Multimeter'], 'Target contoh: grafik konsumsi harian dan puncak beban.', 'Pembacaan Modbus, agregasi per jam, ekspor laporan.']
    ],
    robotics: [
      ['Robot Line Follower', 'Robot pengikut garis untuk edukasi kontrol dasar.', ['Arduino', 'Sensor IR', 'Motor DC'], 'Mengajarkan konsep sensor dan kontrol PID dasar.', 'Materi kontrol sulit dipahami tanpa praktik.', ['Arduino', 'Array sensor IR', 'Driver motor', 'Sasis'], ['Arduino IDE', 'Obeng', 'Multimeter'], 'Target contoh: robot mengikuti lintasan stabil.', 'Kontrol PID, kalibrasi sensor, profil kecepatan.'],
      ['Lengan Robot Pemindah Barang', 'Lengan servo untuk simulasi pick-and-place.', ['Servo', 'Embedded C', 'Inverse Kinematics'], 'Mendemonstrasikan pemindahan benda terprogram.', 'Pemindahan manual berulang dan tidak presisi.', ['Servo', 'Gripper', 'Mikrokontroler', 'Catu daya'], ['Arduino IDE', 'CAD'], 'Target contoh: pemindahan berulang konsisten.', 'Kinematika invers 3-DOF, batas sudut servo, kalibrasi.'],
      ['Robot Penghindar Rintangan', 'Robot beroda dengan sensor ultrasonik.', ['Ultrasonik', 'Mikrokontroler', 'PWM'], 'Menunjukkan navigasi otonom sederhana.', 'Robot dasar menabrak rintangan.', ['Sensor ultrasonik', 'Mikrokontroler', 'Driver motor', 'Baterai'], ['Arduino IDE', 'Multimeter'], 'Target contoh: robot menghindar tanpa menabrak.', 'Pembacaan jarak, mesin status, kontrol PWM.'],
      ['Modul Kontrol Embedded Industri', 'Papan kontrol embedded dengan antarmuka serial.', ['STM32', 'RS-485', 'PCB'], 'Menyediakan modul kontrol andal untuk mesin.', 'Pengendali lama sulit diperluas dan dirawat.', ['STM32', 'Transceiver RS-485', 'PCB', 'Konektor industri'], ['KiCad', 'STM32CubeIDE', 'Osiloskop'], 'Target contoh: modul berkomunikasi stabil di bus serial.', 'Firmware berbasis RTOS, protokol serial, proteksi ESD.']
    ]
  };
  var TPL = {
    web: { steps: ['Analisis kebutuhan', 'Desain UI/UX', 'Pengembangan', 'Pengujian', 'Rilis & dokumentasi'], scope: 'Analisis, desain antarmuka, pengembangan, pengujian, rilis, dan dokumentasi.', timeline: 'Contoh: 6–10 minggu (isi periode sebenarnya)', maintenance: 'Contoh: pembaruan keamanan dan perbaikan bug berkala.' },
    wiring: { steps: ['Survei lokasi', 'Perancangan jalur', 'Instalasi & terminasi', 'Pengujian & sertifikasi', 'Dokumentasi & serah terima'], scope: 'Survei, perancangan jalur, instalasi, terminasi, pengujian, dan dokumentasi.', timeline: 'Contoh: 2–6 minggu (isi periode sebenarnya)', maintenance: 'Contoh: inspeksi dan uji ulang berkala.' },
    iot: { steps: ['Analisis kebutuhan', 'Desain perangkat', 'Firmware & konektivitas', 'Dashboard', 'Uji lapangan'], scope: 'Perancangan perangkat, firmware, konektivitas, dasbor, dan uji lapangan.', timeline: 'Contoh: 4–8 minggu (isi periode sebenarnya)', maintenance: 'Contoh: pembaruan firmware dan kalibrasi sensor berkala.' },
    robotics: { steps: ['Spesifikasi', 'Desain mekanik & elektronik', 'Firmware', 'Integrasi', 'Pengujian & dokumentasi'], scope: 'Spesifikasi, desain mekanik-elektronik, firmware, integrasi, dan pengujian.', timeline: 'Contoh: 6–12 minggu (isi periode sebenarnya)', maintenance: 'Contoh: servis mekanik dan pembaruan firmware.' }
  };
  function seedProjects() {
    var out = [];
    Object.keys(PJ).forEach(function (cat) {
      PJ[cat].forEach(function (b, i) {
        var t = TPL[cat];
        out.push({
          id: 'p-' + cat + '-' + (i + 1), cat: cat, title: b[0] + DEMO, summary: b[1], goal: b[3], benefit: 'Contoh manfaat: efisiensi, keandalan, dan kemudahan pemeliharaan. Ganti dengan hasil terukur yang sebenarnya.',
          problem: b[4], scope: t.scope, steps: t.steps.slice(), tech: b[2], components: b[5], tools: b[6], status: ['done', 'ongoing', 'maintenance', 'planned'][i % 4],
          timeline: t.timeline, maintenance: t.maintenance, techInfo: b[8], results: b[7] + ' (bukan hasil proyek nyata)',
          cover: '', gallery: [], links: [], visibility: 'published', demo: true, createdAt: NT.now(), views: 0
        });
      });
    });
    return out;
  }
  var PNAMES = {
    technology: ['Alfa', 'Beta', 'Gamma', 'Delta'], web: ['Cakra', 'Dwipa', 'Eka', 'Fajar'], wiring: ['Garuda', 'Harsa', 'Indra', 'Jaya'],
    iot: ['Kirana', 'Lintang', 'Mega', 'Nusa'], robotics: ['Orion', 'Prima', 'Quanta', 'Raya'], supplier: ['Satya', 'Tirta', 'Utama', 'Vista']
  };
  var PDESC = {
    technology: ['Platform & infrastruktur teknologi', 'Cloud, keamanan, dan integrasi sistem'], web: ['Pengembangan perangkat lunak & web', 'Aplikasi web, API, dan UI/UX'], wiring: ['Kabel & infrastruktur jaringan', 'Kabel tembaga/fiber, rak, dan aksesori'],
    iot: ['IoT & otomasi', 'Sensor, gateway, dan platform data'], robotics: ['Robotika & rekayasa', 'Aktuator, kontroler, dan fabrikasi'], supplier: ['Pemasok komponen & perangkat', 'Komponen elektronik dan perlengkapan teknis']
  };
  function seedPartners() {
    var out = [];
    Object.keys(PNAMES).forEach(function (k) {
      PNAMES[k].forEach(function (n, i) {
        out.push({
          id: 'pt-' + k + '-' + (i + 1), name: 'Contoh ' + n + ' ' + NT.PCATS[k].split(' ')[0] + DEMO, cat: k, country: '', location: '', website: '', email: '',
          profile: 'Entri placeholder DEMO, bukan perusahaan nyata dan bukan mitra resmi. Ganti melalui Admin dengan data mitra yang sudah terverifikasi.',
          services: PDESC[k][0], expertise: PDESC[k][1], tech: '', collab: 'Contoh bentuk kolaborasi: ' + (k === 'supplier' ? 'pengadaan komponen' : 'proyek bersama dan pertukaran keahlian') + ' (belum ada kerja sama nyata).',
          joint: '', period: '', status: 'demo', visibility: 'published', demo: true, logo: '', createdAt: NT.now()
        });
      });
    });
    return out;
  }
  function seedMilestones() {
    var t = [
      ['Berdiri', 'Latar belakang dan tahun berdiri perusahaan.', 'company', [], []], ['Pembentukan tim', 'Tim inti dan layanan pertama.', 'team', [], []],
      ['Web Development & Engineering', 'Perkembangan layanan perangkat lunak.', 'web', ['p-web-1', 'p-web-2'], ['pt-web-1']],
      ['Ekspansi Wiring & Jaringan', 'Layanan kabel dan infrastruktur jaringan.', 'wiring', ['p-wiring-1', 'p-wiring-2'], ['pt-wiring-1']],
      ['Ekspansi IoT', 'Otomasi dan sistem pintar.', 'iot', ['p-iot-1', 'p-iot-2'], ['pt-iot-1']], ['Ekspansi Robotika', 'Embedded system dan engineering.', 'robotics', ['p-robotics-1', 'p-robotics-2'], ['pt-robotics-1']],
      ['Rencana ke depan', 'Inovasi dan target berikutnya.', 'future', [], []]
    ];
    return t.map(function (m, i) {
      return { id: 'm-' + (i + 1), date: 'Isi tahun (DEMO)', title: m[0], desc: m[1] + ' Placeholder DEMO — ganti dengan fakta perusahaan yang sebenarnya.', cat: m[2], projectIds: m[3], partnerIds: m[4], image: '', order: i + 1, visibility: 'published', demo: true };
    });
  }
  function seedEngineering() {
    var wires = [['Jalur Rak A → Switch Lantai 1', 'Cat6A', 'Ruang server', 'Titik R-A01 s/d R-A24'], ['Backbone Gedung 1 → Gedung 2', 'Fiber SM 12 core', 'Antargedung', 'ODF-1 ↔ ODF-2'], ['Jalur Lantai 2 Utara', 'Cat6', 'Lantai 2', 'Titik L2-N01 s/d L2-N16'], ['Jalur CCTV Parkir', 'Cat6 outdoor', 'Area parkir', 'Titik CCTV-01 s/d 08']];
    var devs = [['Node Suhu Gudang 01', 'ESP32 + DHT22', 'Mengukur suhu & kelembapan', 'p-iot-1'], ['Node Lampu Ruang 01', 'Mikrokontroler + relay + PIR', 'Mengontrol lampu otomatis', 'p-iot-2'], ['Node Irigasi 01', 'ESP32 + sensor tanah', 'Mengontrol pompa irigasi', 'p-iot-3'], ['Node Daya 01', 'Power meter + gateway', 'Memantau konsumsi daya', 'p-iot-4']];
    var robs = [['LF-01', 'Robot line follower', 'Arduino, sensor IR, motor DC', 'Prototipe', 'p-robotics-1'], ['ARM-01', 'Lengan robot 3-DOF', 'Servo, gripper, mikrokontroler', 'Pengembangan', 'p-robotics-2'], ['OA-01', 'Robot penghindar rintangan', 'Ultrasonik, driver motor', 'Prototipe', 'p-robotics-3'], ['CTRL-01', 'Modul kontrol embedded', 'STM32, RS-485, PCB', 'Pengujian', 'p-robotics-4']];
    return {
      wiring: wires.map(function (w, i) { return { id: 'w-' + (i + 1), name: w[0] + DEMO, cable: w[1], location: w[2], points: w[3], status: ['done', 'ongoing', 'maintenance', 'planned'][i], projectId: 'p-wiring-' + (i + 1), notes: 'Catatan maintenance contoh: isi tanggal uji dan temuan sebenarnya.', visibility: 'published', demo: true }; }),
      devices: devs.map(function (d, i) { return { id: 'd-' + (i + 1), name: d[0] + DEMO, mcu: d[1], func: d[2], sensors: d[1], status: ['done', 'ongoing', 'ongoing', 'planned'][i], projectId: d[3], notes: 'Catatan contoh.', visibility: 'published', demo: true }; }),
      robots: robs.map(function (r, i) { return { id: 'r-' + (i + 1), name: r[0] + DEMO, type: r[1], components: r[2], stage: r[3], spec: 'Spesifikasi contoh: isi dimensi, bobot, daya, dan kapabilitas sebenarnya.', projectId: r[4], notes: 'Dokumentasi pengembangan contoh.', visibility: 'published', demo: true }; })
    };
  }
  function seedFaqs() {
    return [
      ['Layanan apa saja yang ditawarkan Nexus Tech?', 'Web development & software, wiring cable & infrastruktur jaringan, IoT & otomasi, serta robotika & embedded engineering.'],
      ['Bagaimana cara memulai konsultasi?', 'Gunakan formulir di halaman Contact atau tanya Nexus AI untuk menyusun ringkasan kebutuhan proyek.'],
      ['Apakah konten proyek di situs ini nyata?', 'Entri berlabel DEMO adalah contoh format. Ganti dengan proyek nyata lewat Admin.'],
      ['Apakah tersedia pemeliharaan setelah proyek selesai?', 'Ketentuan pemeliharaan ditentukan per proyek dan dicantumkan pada detail proyek.'],
      ['Bagaimana cara mengajukan kerja sama?', 'Buka halaman Partners lalu klik Propose Collaboration, atau isi formulir proposal.'],
      ['Apakah Nexus AI memakai model AI sungguhan?', 'Versi ini memakai asisten berbasis aturan (tanpa server AI). Untuk model sungguhan diperlukan API di server.']
    ].map(function (f, i) { return { id: 'f-' + (i + 1), q: f[0], a: f[1], visibility: 'published', order: i + 1 }; });
  }
  function seedServices() {
    return [
      { id: 's-web', cat: 'web', title: 'Web Development & Software Engineering', desc: 'Perancangan dan pengembangan situs, aplikasi web, dasbor, dan integrasi sistem.', points: ['Analisis kebutuhan', 'UI/UX', 'Pengembangan & pengujian', 'Pemeliharaan'] },
      { id: 's-wiring', cat: 'wiring', title: 'Wiring Cable & Network Infrastructure', desc: 'Instalasi, penataan, pengujian, dan pemeliharaan kabel serta infrastruktur jaringan.', points: ['Survei lokasi', 'Instalasi & terminasi', 'Pengujian & dokumentasi', 'Maintenance berkala'] },
      { id: 's-iot', cat: 'iot', title: 'IoT, Automation & Smart Systems', desc: 'Sensor, mikrokontroler, konektivitas, dan otomasi untuk pemantauan serta kontrol.', points: ['Perancangan sensor', 'Konektivitas', 'Dasbor', 'Otomasi'] },
      { id: 's-robotics', cat: 'robotics', title: 'Robotics, Embedded & Engineering', desc: 'Pengembangan robot, sistem embedded, dan solusi rekayasa sesuai kebutuhan.', points: ['Prototipe', 'Firmware', 'Integrasi mekanik', 'Dokumentasi teknis'] }
    ];
  }
  function defaults() {
    return {
      v: 2,
      company: {
        name: 'Nexus Tech', tagline: 'Rekayasa perangkat lunak, jaringan, IoT, dan robotika yang terintegrasi.',
        about: 'Nexus Tech adalah perusahaan teknologi yang bergerak di web development, wiring cable & infrastruktur jaringan, IoT & otomasi, serta robotika & embedded system. (Teks profil dapat diedit di Admin > Profil.)',
        vision: 'Menjadi mitra rekayasa teknologi yang andal dan terpercaya. (Edit di Admin)',
        mission: 'Menghadirkan solusi yang aman, terdokumentasi, dan mudah dipelihara. (Edit di Admin)',
        founded: '', email: '', phone: '', address: '', website: '', hours: '',
        seoTitle: 'Nexus Tech — Web, Network, IoT & Robotics', seoDesc: 'Nexus Tech: web development, wiring cable & jaringan, IoT, dan robotika.'
      },
      services: seedServices(), projects: seedProjects(), partners: seedPartners(), milestones: seedMilestones(), faqs: seedFaqs(),
      comments: [], messages: [], proposals: [], audit: [], notifications: [], users: [], wiring: seedEngineering().wiring, devices: seedEngineering().devices, robots: seedEngineering().robots,
      settings: { lang: 'id', theme: 'auto', commentsOn: true }
    };
  }

  var db;
  function load() {
    try { var raw = localStorage.getItem(KEY); db = raw ? JSON.parse(raw) : null; } catch (e) { db = null; }
    if (!db || typeof db !== 'object') { db = defaults(); NT.storageOk = persist(); }
    var d = defaults(); // pertahankan data lama, hanya tambahkan kunci yang hilang
    Object.keys(d).forEach(function (k) { if (db[k] == null) db[k] = d[k]; });
    if ((db.v || 1) < 2) migrate(d);
    return db;
  }
  // Migrasi v1→v2: tambah entri seed yang belum ada dan isi bidang placeholder/kosong pada entri DEMO yang belum diubah. Data buatan pengguna tidak disentuh.
  NT.isPlaceholder = function (v) { return v == null || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'string' && /contoh|belum diisi/i.test(v) && v.length < 140); };
  function migrate(d) {
    ['projects', 'partners', 'milestones'].forEach(function (k) {
      d[k].forEach(function (seed) {
        var cur = db[k].filter(function (x) { return x.id === seed.id; })[0];
        if (!cur) { db[k].push(seed); return; }
        if (!cur.demo) return;
        Object.keys(seed).forEach(function (f) { if (['id', 'visibility', 'views', 'createdAt', 'demo', 'order', 'title'].indexOf(f) < 0 && NT.isPlaceholder(cur[f]) && !NT.isPlaceholder(seed[f])) cur[f] = seed[f]; });
        if (k === 'projects' && !/DEMO/.test(cur.title)) cur.title += ' (DEMO)';
        if (k === 'milestones') { if (!(cur.projectIds || []).length) cur.projectIds = seed.projectIds; if (!(cur.partnerIds || []).length) cur.partnerIds = seed.partnerIds; }
      });
    });
    db.v = 2; persist();
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch (e) { NT.toast && NT.toast('Gagal menyimpan: penyimpanan browser penuh atau diblokir.', true); return false; }
  }
  NT.db = function () { return db || load(); };
  try { if (window.BroadcastChannel) NT._bc = new BroadcastChannel('nexustech'); } catch (e) {}
  NT.save = function () { var ok = persist(); try { if (NT._bc) NT._bc.postMessage('changed'); } catch (e) {} return ok; };
  NT.reset = function () { db = defaults(); persist(); };
  NT.import = function (obj) { if (!obj || typeof obj !== 'object' || !obj.projects || !obj.company) throw new Error('Format backup tidak valid'); db = obj; persist(); };
  NT.log = function (action, detail) {
    var u = NT.session && NT.session();
    NT.db().audit.unshift({ id: NT.uid('a'), at: NT.now(), user: u ? u.name : 'publik', action: action, detail: detail || '' });
    NT.db().audit = NT.db().audit.slice(0, 500);
  };
  NT.notify = function (text, type) {
    NT.db().notifications.unshift({ id: NT.uid('n'), at: NT.now(), text: text, type: type || 'info', read: false });
    NT.db().notifications = NT.db().notifications.slice(0, 100);
  };
  NT.rate = function (key, ms) { // pembatasan laju sisi klien (hanya mencegah spam tidak sengaja)
    var k = 'nt.rate.' + key, last = +localStorage.getItem(k) || 0, n = Date.now();
    if (n - last < ms) return false;
    try { localStorage.setItem(k, String(n)); } catch (e) {}
    return true;
  };
  NT.toast = function (msg, isErr) {
    var box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    var t = document.createElement('div'); t.className = 'toast' + (isErr ? ' err' : ''); t.textContent = msg; box.appendChild(t);
    setTimeout(function () { t.remove(); }, 4200);
  };
  NT.published = function (list) { return list.filter(function (x) { return !x.visibility || x.visibility === 'published'; }); };
  NT.getProject = function (id) { return NT.db().projects.filter(function (p) { return p.id === id; })[0]; };
  NT.projectImg = function (p) { return p.cover || (NT.CATS[p.cat] || NT.CATS.web).img; };

  // ===== Auth (demo): PBKDF2 via WebCrypto, sesi di sessionStorage. BUKAN pengganti login server. =====
  var enc = new TextEncoder();
  function b64(buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
  function unb64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  NT.cryptoOk = !!(window.crypto && crypto.subtle);
  NT.hashPw = async function (pw, saltB64) {
    var salt = saltB64 ? unb64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
    var key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    var bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 150000, hash: 'SHA-256' }, key, 256);
    return { salt: b64(salt), hash: b64(bits) };
  };
  NT.session = function () {
    try { var s = JSON.parse(sessionStorage.getItem('nt.session')); if (s && s.exp > Date.now()) return s; } catch (e) {}
    return null;
  };
  NT.endSession = function () { sessionStorage.removeItem('nt.session'); };
  NT.startSession = function (u) { sessionStorage.setItem('nt.session', JSON.stringify({ id: u.id, name: u.name, role: u.role, exp: Date.now() + 30 * 60 * 1000 })); };
  NT.lockInfo = function () { try { var l = JSON.parse(localStorage.getItem('nt.lock')) || { n: 0, until: 0 }; return l; } catch (e) { return { n: 0, until: 0 }; } };
  NT.lockFail = function () { var l = NT.lockInfo(); l.n++; if (l.n >= 5) { l.until = Date.now() + 5 * 60 * 1000; l.n = 0; } localStorage.setItem('nt.lock', JSON.stringify(l)); };
  NT.lockClear = function () { localStorage.removeItem('nt.lock'); };

  load();
})();
