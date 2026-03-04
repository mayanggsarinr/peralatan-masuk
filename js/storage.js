// ============================================
//  storage.js
//  Fungsi simpan & ambil data dari localStorage
// ============================================

const STORAGE_KEY = 'pln_assets';

function getAllAssets() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveAssets(assets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

function addAsset(asset) {
  const assets = getAllAssets();
  assets.push(asset);
  saveAssets(assets);
}

function updateAsset(id, updatedData) {
  const assets = getAllAssets();
  const index = assets.findIndex(a => a.id === id);
  if (index !== -1) {
    assets[index] = { ...assets[index], ...updatedData };
    saveAssets(assets);
  }
}

function deleteAsset(id) {
  const assets = getAllAssets().filter(a => a.id !== id);
  saveAssets(assets);
}

function getAssetById(id) {
  return getAllAssets().find(a => a.id === id);
}
