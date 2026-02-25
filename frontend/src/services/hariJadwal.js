export const hariJadwal = {
  Senin: 0,
  Selasa: 1,
  Rabu: 2,
  Kamis: 3,
  Jumat: 4,
  Sabtu: 5,
  Minggu: 6
}

export const daftarHari = Object.keys(hariJadwal)

export function toIndex(namaHari) {
  return hariJadwal[namaHari]
}

export function toString(index) {
  return daftarHari[index]
}
