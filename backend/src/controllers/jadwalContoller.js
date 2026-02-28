const JadwalModel = require("../models/jadwalModel");
const jadwalService = require("../services/jadwalService");
const {db} = require("../config/db"); 

async function createJadwal(req, res) {
  try {
    const id_admin = req.user.id;

    const id = await jadwalService.createJadwalHari({
      ...req.body,
      id_admin
    });

    res.status(201).json({
      message: "Jadwal berhasil dibuat",
      id_jadwal: id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal membuat jadwal",
      error: error.message
    });
  }
}

async function getAllJadwal(req, res) {
  try {

    const data = await JadwalModel.findAll();

    return res.json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal mengambil jadwal"
    });
  }
}

async function updateJadwal(req, res) {
  // prefer id_tps from params if route used it
  const id_tps = req.params.id || req.params.id_tps || req.body.id_tps;
  const { id_petugas, hari_pengambilan } = req.body;
  const id_admin = req.user.id;

  if (!id_tps || !id_petugas) {
    return res.status(400).json({ error: "id_tps dan id_petugas wajib diisi" });
  }

  try {
    // call the model helper; hari_pengambilan may be undefined
    console.log('Body:', req.body);
    await JadwalModel.update(db, id_tps, id_petugas, hari_pengambilan || [], id_admin);

    return res.status(200).json({ message: "Jadwal berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal update jadwal",
      error: error.message
    });
  }
}

async function deleteJadwal(req, res) {
  try {

    await JadwalModel.remove(req.params.id);

    return res.json({
      message: "Jadwal berhasil dihapus"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal hapus jadwal"
    });
  }
}

module.exports = {
  createJadwal,
  getAllJadwal,
  updateJadwal,
  deleteJadwal
};
