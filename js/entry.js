// ============================================
//  entry.js
//  Logika form entry data kendaraan/peralatan
// ============================================

// Hitung usia pemakaian & sisa masa ekonomis otomatis
function hitungUsia() {
  const tglUL  = document.getElementById('f_tgl_ul').value;
  const tglULP = document.getElementById('f_tgl_ulp').value;
  const masaEkonomis = parseInt(document.getElementById('f_masa_ekonomis').value) || 0;

  const tglRef = tglUL || tglULP;
  if (!tglRef) return;

  const today  = new Date();
  const start  = new Date(tglRef);
  const usia   = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));

  document.getElementById('calc_usia').textContent = usia + ' hari';

  if (masaEkonomis > 0) {
    const sisa = masaEkonomis - usia;
    const pct  = (sisa / masaEkonomis) * 100;

    document.getElementById('calc_sisa').textContent = sisa + ' hari';

    let badgeClass, label;
    if (sisa <= 0) {
      badgeClass = 'badge-danger';
      label = '🔴 Habis / Perlu Penggantian';
    } else if (pct <= 20) {
      badgeClass = 'badge-warn';
      label = '🟡 Hampir Habis (< 20%)';
    } else {
      badgeClass = 'badge-ok';
      label = '🟢 Normal';
    }

    document.getElementById('calc_status').innerHTML =
      `<span class="status-badge ${badgeClass}">${label}</span>`;
  }
}

// Preview file yang diupload
function previewFiles(inputId, previewId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  preview.innerHTML = '';

  Array.from(input.files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.className = 'file-thumb';
        img.src = e.target.result;
        img.onclick = () => bukaFoto(e.target.result);
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      const div = document.createElement('div');
      div.style.cssText = 'padding:6px 10px;background:#EEF3FF;border-radius:8px;font-size:11px;color:var(--pln-blue);font-weight:600';
      div.textContent = '📄 ' + file.name;
      preview.appendChild(div);
    }
  });
}

// Buka modal foto
function bukaFoto(src) {
  document.getElementById('modalImg').src = src;
  document.getElementById('imgModal').classList.add('open');
}

function tutupFoto() {
  document.getElementById('imgModal').classList.remove('open');
}

// Simpan data entry
function simpanEntry() {
  const no           = document.getElementById('f_no').value.trim();
  const nama         = document.getElementById('f_nama').value.trim();
  const tglUL        = document.getElementById('f_tgl_ul').value;
  const tglULP       = document.getElementById('f_tgl_ulp').value;
  const ulp          = document.getElementById('f_ulp').value;
  const masaEkonomis = parseInt(document.getElementById('f_masa_ekonomis').value) || 0;

  if (!nama || !ulp || (!tglUL && !tglULP)) {
    tampilToast('⚠️ Lengkapi nama, ULP, dan tanggal diterima!');
    return;
  }

  const tglRef = tglUL || tglULP;
  const today  = new Date();
  const usia   = Math.max(0, Math.floor((today - new Date(tglRef)) / (1000 * 60 * 60 * 24)));
  const sisa   = masaEkonomis - usia;

  const baFiles   = [];
  const fotoFiles = [];

  // Proses file upload
  function prosesFile(inputId, arr, callback) {
    const input   = document.getElementById(inputId);
    let pending   = input.files.length;
    if (!pending) { callback(); return; }

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function (e) {
        arr.push({ name: file.name, data: e.target.result });
        if (--pending === 0) callback();
      };
      reader.readAsDataURL(file);
    });
  }

  prosesFile('file_ba', baFiles, function () {
    prosesFile('file_foto', fotoFiles, function () {
      const semua = getAllAssets();
      const noBaru = no || (semua.length + 1);

      const asetBaru = {
        id          : Date.now(),
        no          : noBaru,
        nama        : nama,
        tglUL       : tglUL,
        tglULP      : tglULP,
        ulp         : ulp,
        masaEkonomis: masaEkonomis,
        usia        : usia,
        sisa        : sisa,
        realisasi   : 0,
        baFiles     : baFiles,
        fotoFiles   : fotoFiles,
        tglEntry    : new Date().toLocaleDateString('id-ID')
      };

      addAsset(asetBaru);
      resetForm();
      tampilToast('✅ Data tersimpan! Isi realisasi di halaman Output.');
    });
  });
}

// Reset form setelah simpan
function resetForm() {
  ['f_no', 'f_nama', 'f_tgl_ul', 'f_tgl_ulp', 'f_masa_ekonomis'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f_ulp').value = '';
  document.getElementById('calc_usia').textContent   = '—';
  document.getElementById('calc_sisa').textContent   = '—';
  document.getElementById('calc_status').innerHTML   = '—';
  document.getElementById('prev_ba').innerHTML       = '';
  document.getElementById('prev_foto').innerHTML     = '';
  document.getElementById('file_ba').value           = '';
  document.getElementById('file_foto').value         = '';
}

// Tampil notifikasi toast
function tampilToast(pesan) {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
