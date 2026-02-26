const { daftarHari } = require("../utils/hariJadwal");

function validateCreateJadwal(req, res, next) {
  const { id_tps, hari_pengambilan, id_petugas } = req.body;

  // cek null / undefined saja
  if (
    id_tps == null ||
    id_petugas == null ||
    hari_pengambilan == null
  ) {
    return res.status(400).json({
      message: "Semua field wajib diisi"
    });
  }

  // pastikan angka 0–6
  if (
    typeof hari_pengambilan !== "number" ||
    hari_pengambilan < 0 ||
    hari_pengambilan > 6
  ) {
    return res.status(400).json({
      message: "Hari tidak valid"
    });
  }

  next();
}

module.exports = {
  validateCreateJadwal
};
