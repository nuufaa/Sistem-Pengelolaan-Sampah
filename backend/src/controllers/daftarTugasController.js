const daftarTugasService = require("../services/daftarTugasService");
const daftarTugasModel = require("../models/daftarTugasModel");

async function updateStatus(req, res) {
  try {
    await daftarTugasService.updateStatusTugas(
      req.params.id,
      req.body
    );

    res.json({
      message: "Status berhasil diperbarui"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal update tugas"
    });
  }
}

async function updateLogbook(req, res) {
  try {
    const { id_kendaraan, tasksSelected } = req.body
    const id_petugas = req.user.id

    if (!id_kendaraan || !tasksSelected || !tasksSelected.length) {
      return res.status(400).json({
        message: "TPS harus dipilih"
      })
    }
    
    await daftarTugasModel.addLogbook({
      id_kendaraan,
      tasksSelected,
      id_petugas
    })

    res.json({
      message: "Logbook berhasil disimpan"
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Gagal update kendaraan"
    })
  }
}

// GET /api/daftar-tugas
async function listTugas(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const data = await daftarTugasService.listTugas(userId);
    res.json(data);
  } catch (error) {
    console.error('Error in listTugas:', error);
    res.status(500).json({ message: "Gagal mengambil daftar tugas" });
  }
}

// GET /api/daftar-tugas/history - Riwayat yang selesai
async function listCompleted(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    let data;

    if (userId) {
      // Petugas melihat riwayat mereka sendiri
      data = await daftarTugasModel.getCompletedByPetugas(userId);
    } else {
      // Admin melihat semua riwayat
      data = await daftarTugasModel.getAllCompleted();
    }

    res.json(data);
  } catch (error) {
    console.error('Error in listCompleted:', error);
    res.status(500).json({ message: "Gagal mengambil riwayat pengambilan" });
  }
}

module.exports = {
  updateStatus,
  listTugas,
  updateLogbook,
  listCompleted
};
