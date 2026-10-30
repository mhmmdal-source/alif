/* Nexus AI — asisten BERBASIS ATURAN (rule-based), bukan model AI sungguhan.
   Untuk model sungguhan dibutuhkan endpoint server yang menyimpan API key (lihat README).
   Konfigurasi opsional: window.NT_AI_ENDPOINT = 'https://domain-anda/api/chat' (server Anda sendiri). */
(function () {
  'use strict';
  var NT = window.NT, $ = NT.$;
  var G = { // sapaan & teks UI dalam 9 bahasa
    id: ['Halo! Saya Nexus AI. Saya bisa menjelaskan layanan, mencari proyek, menjawab FAQ, dan membantu menyusun kebutuhan proyek Anda.', 'Ketik pertanyaan…', 'Kirim', 'Layanan', 'Cari proyek', 'Susun kebutuhan', 'Konsultasi'],
    en: ['Hello! I am Nexus AI. I can explain our services, find projects, answer FAQs and help outline your project needs.', 'Type your question…', 'Send', 'Services', 'Find projects', 'Outline needs', 'Consult'],
    ja: ['こんにちは！Nexus AIです。サービスの説明、実績検索、FAQ回答、要件整理をお手伝いします。', '質問を入力…', '送信', 'サービス', '実績を探す', '要件整理', '相談'],
    ko: ['안녕하세요! Nexus AI입니다. 서비스 안내, 프로젝트 검색, FAQ 답변, 요구사항 정리를 도와드립니다.', '질문을 입력…', '보내기', '서비스', '프로젝트 찾기', '요구사항 정리', '상담'],
    zh: ['您好！我是 Nexus AI，可介绍服务、查找项目、回答常见问题并帮助梳理项目需求。', '请输入问题…', '发送', '服务', '查找项目', '梳理需求', '咨询'],
    ar: ['مرحباً! أنا Nexus AI. يمكنني شرح الخدمات والبحث عن المشاريع والإجابة عن الأسئلة ومساعدتك في تحديد احتياجات مشروعك.', 'اكتب سؤالك…', 'إرسال', 'الخدمات', 'ابحث عن مشاريع', 'تحديد الاحتياجات', 'استشارة'],
    de: ['Hallo! Ich bin Nexus AI. Ich erkläre Leistungen, finde Projekte, beantworte FAQs und helfe, Ihren Projektbedarf zu skizzieren.', 'Frage eingeben…', 'Senden', 'Leistungen', 'Projekte finden', 'Bedarf skizzieren', 'Beratung'],
    fr: ['Bonjour ! Je suis Nexus AI. Je présente nos services, trouve des projets, réponds aux FAQ et aide à cadrer votre besoin.', 'Saisissez votre question…', 'Envoyer', 'Services', 'Trouver des projets', 'Cadrer le besoin', 'Consultation'],
    es: ['¡Hola! Soy Nexus AI. Explico servicios, busco proyectos, respondo preguntas frecuentes y ayudo a definir tu proyecto.', 'Escribe tu pregunta…', 'Enviar', 'Servicios', 'Buscar proyectos', 'Definir necesidades', 'Consulta']
  };
  var NOTE = { ja: '（詳細回答は英語です）', ko: '(자세한 답변은 영어로 제공됩니다)', zh: '（详细回答为英文）', ar: '(الإجابات التفصيلية متوفرة بالإنجليزية)', de: '(Detailantworten auf Englisch)', fr: '(Réponses détaillées en anglais)', es: '(Respuestas detalladas en inglés)' };
  var R = {
    id: {
      services: 'Bidang kami: (1) Web Development & Software, (2) Wiring Cable, Maintenance & Network Infrastructure, (3) IoT, Automation & Smart Systems, (4) Robotics, Embedded & Engineering. Lihat halaman Layanan untuk detail.',
      web: 'Web Development: analisis kebutuhan, UI/UX, pengembangan, pengujian, dan pemeliharaan situs/aplikasi/dasbor.', wiring: 'Wiring & Jaringan: survei, instalasi, terminasi, pengujian, dokumentasi, dan pemeliharaan berkala kabel & jaringan.',
      iot: 'IoT & Otomasi: sensor, mikrokontroler, konektivitas, dasbor pemantauan, dan otomasi kontrol.', robotics: 'Robotika & Embedded: prototipe robot, firmware, integrasi mekanik-elektronik, dan dokumentasi teknis.',
      partner: 'Halaman Mitra memuat calon mitra. Saat ini entri berlabel DEMO bukan mitra resmi. Gunakan "Propose Collaboration" untuk mengajukan kerja sama.',
      consult: 'Untuk konsultasi, isi formulir di halaman Kontak. Saya bisa menyusun ringkasan kebutuhan lebih dulu — ketik "susun kebutuhan".',
      fallback: 'Saya belum paham pertanyaan itu. Coba: "layanan", "proyek IoT", "mitra", "konsultasi", atau "susun kebutuhan". Asisten ini berbasis aturan, bukan model AI penuh.',
      noproj: 'Tidak ada proyek yang cocok. Coba kata kunci lain (mis. sensor, jaringan, robot).', proj: 'Proyek yang relevan:', q1: 'Kategori mana? (web / wiring / iot / robotics)', q2: 'Apa tujuan utama proyek Anda?', q3: 'Perkiraan skala/lokasi/tenggat? (boleh singkat)', done: 'Ringkasan kebutuhan siap. Klik tombol di bawah untuk mengisi formulir konsultasi otomatis.', go: 'Lanjut ke formulir konsultasi', canc: 'Alur dibatalkan.'
    },
    en: {
      services: 'Our areas: (1) Web Development & Software, (2) Wiring Cable, Maintenance & Network Infrastructure, (3) IoT, Automation & Smart Systems, (4) Robotics, Embedded & Engineering. See the Services page.',
      web: 'Web Development: requirements analysis, UI/UX, development, testing and maintenance of sites, apps and dashboards.', wiring: 'Wiring & Network: survey, installation, termination, testing, documentation and scheduled maintenance.',
      iot: 'IoT & Automation: sensors, microcontrollers, connectivity, monitoring dashboards and control automation.', robotics: 'Robotics & Embedded: robot prototypes, firmware, mechanical-electronic integration and technical documentation.',
      partner: 'The Partners page lists prospective partners. Entries labelled DEMO are not real partners. Use "Propose Collaboration" to propose a partnership.',
      consult: 'For a consultation, use the form on the Contact page. I can outline your needs first — type "outline needs".',
      fallback: 'I did not understand that. Try: "services", "IoT projects", "partners", "consultation" or "outline needs". This assistant is rule-based, not a full AI model.',
      noproj: 'No matching projects. Try other keywords (e.g. sensor, network, robot).', proj: 'Relevant projects:', q1: 'Which category? (web / wiring / iot / robotics)', q2: 'What is the main goal of your project?', q3: 'Rough scale / location / deadline? (brief is fine)', done: 'Your needs summary is ready. Click below to prefill the consultation form.', go: 'Continue to consultation form', canc: 'Flow cancelled.'
    }
  };
  var state = { flow: null, data: {}, last: '' };
  function L() { return NT.lang(); }
  function RR() { return R[L()] || R.en; }
  function g() { return G[L()] || G.en; }

  function add(who, html, raw) {
    var log = $('#aiLog'), d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight;
    if (who === 'bot') state.last = raw != null ? raw : d.textContent;
  }
  function find(q) {
    var w = q.toLowerCase().split(/\s+/).filter(function (x) { return x.length > 2; });
    return NT.published(NT.db().projects).map(function (p) { var k = (p.title + ' ' + p.summary + ' ' + p.tech.join(' ') + ' ' + p.cat).toLowerCase(); return { p: p, s: w.filter(function (x) { return k.indexOf(x) > -1; }).length }; }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4).map(function (x) { return x.p; });
  }
  function reply(q) {
    var r = RR(), s = q.toLowerCase(), note = NOTE[L()] ? '\n' + NOTE[L()] : '';
    if (state.flow) return flow(q);
    if (/susun|outline|kebutuhan|needs|requirement/.test(s)) { state.flow = 1; state.data = {}; return { t: r.q1 }; }
    if (/layanan|service|leistung|服务|サービス|서비스|خدم/.test(s)) return { t: r.services + note };
    if (/web|website|situs|software/.test(s)) return { t: r.web + note };
    if (/wiring|kabel|cable|jaringan|network|lan|fiber/.test(s)) return { t: r.wiring + note };
    if (/iot|sensor|otomasi|automation|smart/.test(s) && !/proyek|project/.test(s)) return { t: r.iot + note };
    if (/robot|embedded|engineering/.test(s) && !/proyek|project/.test(s)) return { t: r.robotics + note };
    if (/mitra|partner|kolaborasi|collab/.test(s)) return { t: r.partner + note, link: ['partners.html', 'Partners'] };
    if (/konsul|consult|kontak|contact|hubungi|harga|price|quote/.test(s)) return { t: r.consult + note, link: ['contact.html', 'Contact'] };
    if (/faq|tanya|question/.test(s)) { var f = NT.published(NT.db().faqs).filter(function (x) { return s.split(/\s+/).some(function (w) { return w.length > 3 && (x.q + x.a).toLowerCase().indexOf(w) > -1; }); })[0]; if (f) return { t: f.q + '\n' + f.a }; }
    if (/proyek|project|portofolio|portfolio|cari|find|search/.test(s) || /sensor|robot|iot|jaringan|network|web/.test(s)) {
      var hit = find(s); return hit.length ? { t: r.proj + note, projs: hit } : { t: r.noproj };
    }
    var h = find(s); if (h.length) return { t: r.proj, projs: h };
    return { t: r.fallback };
  }
  function flow(q) {
    var r = RR(), s = q.toLowerCase();
    if (/batal|cancel/.test(s)) { state.flow = null; return { t: r.canc }; }
    if (state.flow === 1) { var c = ['web', 'wiring', 'iot', 'robotics'].filter(function (k) { return s.indexOf(k) > -1; })[0]; if (!c) return { t: r.q1 }; state.data.cat = c; state.flow = 2; return { t: r.q2 }; }
    if (state.flow === 2) { state.data.goal = q.slice(0, 300); state.flow = 3; return { t: r.q3 }; }
    state.data.scale = q.slice(0, 200); state.flow = null;
    var msg = 'Kategori: ' + NT.CATS[state.data.cat].label + '\nTujuan: ' + state.data.goal + '\nSkala/lokasi/tenggat: ' + state.data.scale;
    try { sessionStorage.setItem('nt.prefill', JSON.stringify({ topic: state.data.cat, message: msg })); } catch (e) {}
    return { t: r.done + '\n\n' + msg, link: ['contact.html', r.go] };
  }
  function ask(q) {
    q = q.trim(); if (!q) return; add('me', NT.esc(q));
    var endpoint = window.NT_AI_ENDPOINT;
    if (endpoint) { // opsional: server Anda sendiri; tanpa API key di browser
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q, lang: L() }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { add('bot', NT.esc(j.reply || '')); })
        .catch(function () { add('bot', NT.esc('Server AI tidak dapat dihubungi. Beralih ke mode aturan.')); out(reply(q)); });
      return;
    }
    out(reply(q));
  }
  function out(o) {
    var h = NT.esc(o.t).replace(/\n/g, '<br>');
    if (o.projs) h += '<br>' + o.projs.map(function (p) { return '<a href="project-detail.html?id=' + encodeURIComponent(p.id) + '">• ' + NT.esc(p.title) + '</a>'; }).join('<br>');
    if (o.link) h += '<br><a class="btn btn-primary btn-sm" href="' + o.link[0] + '">' + NT.esc(o.link[1]) + '</a>';
    add('bot', h, o.t);
    if ($('#aiAuto') && $('#aiAuto').checked) speak(o.t);
  }

  // ---------- suara ----------
  function voices() { return window.speechSynthesis ? speechSynthesis.getVoices().filter(function (v) { return v.lang.toLowerCase().indexOf(NT.LANGS[L()][1].slice(0, 2).toLowerCase()) === 0; }) : []; }
  function fillVoices() { var s = $('#aiVoice'); if (!s) return; var v = voices(); s.innerHTML = v.length ? v.map(function (x, i) { return '<option value="' + i + '">' + NT.esc(x.name) + '</option>'; }).join('') : '<option>Suara bahasa ini tidak tersedia</option>'; }
  function speak(text) {
    if (!window.speechSynthesis) { NT.toast('Text-to-speech tidak didukung browser ini.', true); return; }
    speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text), v = voices()[+($('#aiVoice').value) || 0];
    u.lang = NT.LANGS[L()][1]; if (v) u.voice = v; u.rate = +$('#aiRate').value; u.volume = +$('#aiVol').value; speechSynthesis.speak(u);
  }
  function listen() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { NT.toast('Input suara tidak didukung browser ini. Gunakan Chrome/Edge atau ketik.', true); return; }
    var r = new SR(); r.lang = NT.LANGS[L()][1]; r.interimResults = false;
    r.onresult = function (e) { ask(e.results[0][0].transcript); }; r.onerror = function (e) { NT.toast('Input suara gagal: ' + e.error, true); };
    try { r.start(); NT.toast('Mendengarkan…'); } catch (e) { NT.toast('Mikrofon tidak dapat dimulai.', true); }
  }

  window.NT_AI = {
    mount: function () {
      var t = g(), box = document.createElement('div');
      box.innerHTML = '<button class="ai-fab" id="aiFab" aria-expanded="false" aria-controls="aiPanel">' + icon('spark') + '<span>' + NT.esc(NT.t('ai')) + '</span></button>' +
        '<section class="ai-panel" id="aiPanel" aria-label="Nexus AI"><div class="ai-head">' + icon('spark') + '<strong>Nexus AI</strong><button class="icon-btn" id="aiClose" aria-label="Tutup" style="background:transparent;color:#fff;border-color:#1d3a78">' + icon('close') + '</button></div>' +
        '<div class="ai-voice"><select id="aiVoice" aria-label="Suara"></select><label class="sr-only" for="aiRate">Kecepatan</label><input id="aiRate" type="range" min="0.6" max="1.6" step="0.1" value="1" title="Kecepatan"><label class="sr-only" for="aiVol">Volume</label><input id="aiVol" type="range" min="0" max="1" step="0.1" value="1" title="Volume">' +
        '<button class="btn btn-ghost btn-sm" id="aiSpeak" type="button">' + icon('speaker') + '</button><button class="btn btn-ghost btn-sm" id="aiStop" type="button" aria-label="Berhenti">' + icon('stop') + '</button><label style="display:flex;gap:4px;align-items:center;margin:0;font-weight:400"><input type="checkbox" id="aiAuto"> auto</label></div>' +
        '<div class="ai-log" id="aiLog" aria-live="polite"></div><div class="quick" id="aiQuick"></div>' +
        '<form class="ai-form" id="aiForm"><input id="aiIn" placeholder="' + NT.esc(t[1]) + '" aria-label="' + NT.esc(t[1]) + '" autocomplete="off"><button class="icon-btn" type="button" id="aiMic" aria-label="Input suara">' + icon('mic') + '</button><button class="btn btn-primary btn-sm" type="submit">' + NT.esc(t[2]) + '</button></form>' +
        '<p class="muted" style="font-size:.72rem;margin:0;padding:0 12px 8px">Asisten berbasis aturan — bukan model AI penuh. Pilih bahasa di header.</p></section>';
      document.body.appendChild(box);
      var panel = $('#aiPanel'), fab = $('#aiFab');
      $('#aiQuick').innerHTML = [t[3], t[4], t[5], t[6]].map(function (x, i) { return '<button class="pill" type="button" data-q="' + ['services', 'project', 'needs', 'consult'][i] + '">' + NT.esc(x) + '</button>'; }).join('');
      var greeted = false;
      function toggle(o) { panel.classList.toggle('open', o); fab.setAttribute('aria-expanded', o); if (o && !greeted) { greeted = true; add('bot', NT.esc(t[0]), t[0]); fillVoices(); if (window.speechSynthesis) speechSynthesis.onvoiceschanged = fillVoices; } if (o) $('#aiIn').focus(); }
      fab.addEventListener('click', function () { toggle(!panel.classList.contains('open')); });
      $('#aiClose').addEventListener('click', function () { toggle(false); fab.focus(); });
      $('#aiForm').addEventListener('submit', function (e) { e.preventDefault(); var i = $('#aiIn'); ask(i.value); i.value = ''; });
      $('#aiQuick').addEventListener('click', function (e) { var b = e.target.closest('[data-q]'); if (b) ask({ services: 'services layanan', project: 'cari proyek project', needs: 'outline needs susun kebutuhan', consult: 'consult konsultasi' }[b.dataset.q]); });
      $('#aiSpeak').addEventListener('click', function () { speak(state.last || t[0]); });
      $('#aiStop').addEventListener('click', function () { if (window.speechSynthesis) speechSynthesis.cancel(); });
      $('#aiMic').addEventListener('click', listen);
      if (!window.speechSynthesis) { $('#aiSpeak').disabled = true; $('#aiVoice').innerHTML = '<option>TTS tidak didukung</option>'; }
    }
  };
})();
