const { daftarHari } = require("../utils/hariJadwal");

function validateCreateJadwal(req, res, next) {
  const { id_tps, id_petugas, hari_pengambilan } = req.body;

  if (!id_tps || !id_petugas) {
    return res.status(400).json({
      message: "TPS dan Petugas wajib diisi"
    });
  }

  if (!Array.isArray(hari_pengambilan) || hari_pengambilan.length === 0) {
    return res.status(400).json({
      message: "Minimal pilih satu hari"
    });
  }

  const isValid = hari_pengambilan.every(
    h => Number.isInteger(h) && h >= 0 && h <= 6
  );

  if (!isValid) {
    return res.status(400).json({
      message: "Hari tidak valid"
    });
  }

  next();
}

module.exports = { validateCreateJadwal };