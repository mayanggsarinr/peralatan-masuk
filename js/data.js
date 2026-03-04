// ============================================
//  data.js
//  Tampilkan tabel data aset, filter & pencarian
// ============================================

let filterStatus = 'semua';
let filterUlp    = 'semua';

// Inisialisasi halaman data
document.addEventListener('DOMContentLoaded', function () {
  requireLogin();
  tampilData();
  bangunFilterUlp();
});

// Tentukan status aset berdasarkan sisa masa ekonomis
function getStatusAset(aset) {
  if (aset.sisa <= 0) return 'kritis';
  const persen = aset.masaEkonomis > 0 ? (aset.sisa / aset.masaEkonomis) * 100 : 100;
  return persen <= 20 ? 'hampir' : 'normal';
}

// Sorot kata yang dicari
function sorotKata(teks, kata) {
  if (!kata) return teks;
  const regex = new RegExp(`(${kata.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return String(teks).replace(regex, '<span class="highlight">$1</span>');
}

// Bangun filter chip per ULP
function bangunFilterUlp() {
  const assets   = getAllAssets();
  const ulpUnik  = [...new Set(assets.map(a => a.ulp).filter(Boolean))].sort();
  const container = document.getElementById('ulpFilters');

  container.innerHTML = `<button class="filter-chip ${filterUlp === 'semua' ? 'active' : ''}" onclick="setFilterUlp('semua', this)">Semua ULP</button>`;

  ulpUnik.forEach(ulp => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip' + (filterUlp === ulp ? ' active' : '');
    btn.textContent = '📍 ' + ulp;
    btn.onclick = function () { setFilterUlp(ulp, this); };
    container.appendChild(btn);
  });
}

// Set filter status
function setFilterStatus(status, el) {
  filterStatus = status;
  document.querySelectorAll('#filterStatus .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  tampilData();
}

// Set filter ULP
function setFilterUlp(ulp, el) {
  filterUlp = ulp;
  document.querySelectorAll('#ulpFilters .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  tampilData();
}

// Hapus kata pencarian
function hapusCari() {
  document.getElementById('inputCari').value = '';
  document.getElementById('btnHapusCari').style.display = 'none';
  tampilData();
}

// Tampilkan data ke tabel
function tampilData() {
  const kata    = document.getElementById('inputCari').value.trim().toLowerCase();
  const assets  = getAllAssets();
  const btnHapus = document.getElementById('btnHapusCari');

  btnHapus.style.display = kata ? 'flex' : 'none';
  bangunFilterUlp();

  // Filter data
  const hasil = assets.filter(aset => {
    const cocokkCari   = !kata || aset.nama.toLowerCase().includes(kata) || (aset.ulp || '').toLowerCase().includes(kata);
    const cocokStatus  = filterStatus === 'semua' || getStatusAset(aset) === filterStatus;
    const cocokUlp     = filterUlp === 'semua' || aset.ulp === filterUlp;
    return cocokkCari && cocokStatus && cocokUlp;
  });

  // Info hasil pencarian
  const infoEl = document.getElementById('infoHasil');
  if (kata || filterStatus !== 'semua' || filterUlp !== 'semua') {
    infoEl.textContent = `Menampilkan ${hasil.length} dari ${assets.length} aset`;
  } else {
    infoEl.textContent = '';
  }

  document.getElementById('jumlahAset').textContent = assets.length + ' aset';

  renderBarisTabel(hasil, kata);
}

// Render baris tabel
function renderBarisTabel(list, kata) {
  const tbody = document.getElementById('tabelBody');

  if (getAllAssets().length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="10">
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">Belum ada data</div>
          <div class="empty-sub">Tambahkan melalui halaman Entry Data</div>
        </div>
      </td></tr>`;
    return;
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="10">
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">Data tidak ditemukan</div>
          <div class="empty-sub">Coba kata kunci atau filter lain</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((aset, i) => {
    const persen = aset.masaEkonomis > 0 ? (aset.sisa / aset.masaEkonomis) * 100 : 100;

    let badge;
    if (aset.sisa <= 0) {
      badge = '<span class="status-badge badge-danger">Habis</span>';
    } else if (persen <= 20) {
      badge = '<span class="status-badge badge-warn">Hampir</span>';
    } else {
      badge = '<span class="status-badge badge-ok">Normal</span>';
    }

    const warnaSisa = aset.sisa <= 0
      ? 'var(--danger)'
      : persen <= 20
        ? 'var(--warning)'
        : 'var(--success)';

    const fotoHtml = aset.fotoFiles && aset.fotoFiles.length
      ? `<img src="${aset.fotoFiles[0].data}"
              style="width:36px;height:36px;border-radius:6px;object-fit:cover;cursor:pointer;border:2px solid var(--border)"
              onclick="bukaFoto('${aset.fotoFiles[0].data}')">`
      : '—';

    return `
      <tr>
        <td class="mono">${i + 1}</td>
        <td style="font-weight:700;min-width:120px">${sorotKata(aset.nama, kata)}</td>
        <td><span class="chip">${sorotKata(aset.ulp, kata)}</span></td>
        <td class="mono">${aset.tglUL || '—'}</td>
        <td class="mono">${aset.tglULP || '—'}</td>
        <td class="mono">${aset.usia}</td>
        <td class="mono">${aset.masaEkonomis}</td>
        <td class="mono" style="color:${warnaSisa};font-weight:700">${aset.sisa}</td>
        <td>${badge}</td>
        <td>${fotoHtml}</td>
      </tr>`;
  }).join('');
}

// Buka foto fullscreen
function bukaFoto(src) {
  document.getElementById('modalImg').src = src;
  document.getElementById('imgModal').classList.add('open');
}

function tutupFoto() {
  document.getElementById('imgModal').classList.remove('open');
}

// Toast notifikasi
function tampilToast(pesan) {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
