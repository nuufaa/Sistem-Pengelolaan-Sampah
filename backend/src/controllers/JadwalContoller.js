const JadwalModel = require("../model/jadwalModel");

async function createJadwal(req, res) {
  try {
    const id_admin = req.user.id; // dari JWT
    
    const data = {
      ...req.body,
      id_admin
    };
    
    const id = await JadwalModel.create(data);
    
    return res.status(201).json({
      message: "Jadwal berhasil dibuat",
      id_jadwal: id
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal membuat jadwal"
    });
  }
}

async function getAllJadwal(req, res) {
  try {

    const data = await JadwalModel.findAll();

    return res.json(data);

  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil jadwal"
    });
  }
}

async function updateJadwal(req, res) {
  try {

    await JadwalModel.update(req.params.id, req.body);

    return res.json({
      message: "Jadwal berhasil diperbarui"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal update jadwal"
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
