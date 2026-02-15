const hariJadwal = {
  Senin: 0,
  Selasa: 1,
  Rabu: 2,
  Kamis: 3,
  Jumat: 4,
  Sabtu: 5,
  Minggu: 6
};

const daftarHari = Object.keys(hariJadwal);

function toIndex(namaHari) {
  return hariJadwal[namaHari];
}

function toString(index) {
  return daftarHari[index];
}

module.exports = {
  toIndex,
  toString,
  daftarHari
};
