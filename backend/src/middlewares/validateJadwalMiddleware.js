const { daftarHari } = require("../utils/hariJadwal");

function validateCreateJadwal(req, res, next) {
  const { id_tps, hari_pengambilan, id_petugas } = req.body;

  if (!id_tps || !id_petugas || !hari_pengambilan) {
    return res.status(400).json({
      message: "Semua field wajib diisi"
    });
  }

  if (!daftarHari.includes(hari_pengambilan)) {
    return res.status(400).json({
      message: "Hari tidak valid"
    });
  }

  next();
}

module.exports = {
  validateCreateJadwal
};
