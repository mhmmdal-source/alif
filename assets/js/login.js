/* Login/penyiapan admin (demo, sisi klien). Password di-hash PBKDF2 (WebCrypto); tidak ada password bawaan. */
(function () {
  'use strict';
  var NT = window.NT, box = document.getElementById('box'), esc = NT.esc;
  if (NT.session()) { location.replace('admin.html'); return; }
  if (!NT.cryptoOk) { box.innerHTML = '<div class="notice warn">Browser/konteks ini tidak mendukung WebCrypto (butuh HTTPS atau localhost). Login tidak dapat digunakan.</div>'; return; }
  var users = NT.db().users, setup = users.length === 0;
  box.innerHTML = '<h1 style="font-size:1.5rem">' + (setup ? 'Buat akun admin pertama' : 'Masuk') + '</h1>' +
    '<form id="f" class="stack" novalidate>' + (setup ? '<div><label for="nm">Nama</label><input id="nm" maxlength="60" autocomplete="name"></div>' : '') +
    '<div><label for="em">Email</label><input id="em" type="email" autocomplete="username"></div>' +
    '<div><label for="pw">Password' + (setup ? ' (min. 10 karakter, huruf besar, kecil, angka)' : '') + '</label><input id="pw" type="password" autocomplete="' + (setup ? 'new-password' : 'current-password') + '"></div>' +
    '<div class="err" id="er" role="alert"></div><button class="btn btn-primary" type="submit">' + (setup ? 'Buat akun & masuk' : 'Masuk') + '</button></form>';
  var f = document.getElementById('f'), er = document.getElementById('er');
  f.addEventListener('submit', async function (e) {
    e.preventDefault(); er.textContent = '';
    var em = f.em.value.trim().toLowerCase(), pw = f.pw.value, lk = NT.lockInfo();
    if (lk.until > Date.now()) { er.textContent = 'Terlalu banyak percobaan. Coba lagi dalam ' + Math.ceil((lk.until - Date.now()) / 60000) + ' menit.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { er.textContent = 'Email tidak valid.'; return; }
    if (setup) {
      var nm = f.nm.value.trim();
      if (nm.length < 2) { er.textContent = 'Nama minimal 2 karakter.'; return; }
      if (pw.length < 10 || !/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) { er.textContent = 'Password min. 10 karakter dengan huruf besar, kecil, dan angka.'; return; }
      var h = await NT.hashPw(pw), u = { id: NT.uid('u'), name: nm, email: em, role: 'admin', salt: h.salt, hash: h.hash, active: true, createdAt: NT.now() };
      NT.db().users.push(u); NT.startSession(u); NT.log('user.setup', em); NT.save(); location.replace('admin.html'); return;
    }
    var u2 = NT.db().users.filter(function (x) { return x.email === em && x.active !== false; })[0];
    var ok = false;
    if (u2) { var h2 = await NT.hashPw(pw, u2.salt); ok = h2.hash === u2.hash; }
    else await NT.hashPw(pw); // waktu respons serupa
    if (!ok) { NT.lockFail(); er.textContent = 'Email atau password salah.'; return; }
    NT.lockClear(); NT.startSession(u2); NT.log('login', em); NT.save(); location.replace('admin.html');
  });
})();
