const daftarTugasService = require("../services/daftarTugasService");
const logbook = require("../models/daftarTugasModel");

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
    const { id_kendaraan, tpsVisited } = req.body

    if (!id_kendaraan || !tpsVisited || !tpsVisited.length) {
      return res.status(400).json({
        message: "TPS harus dipilih"
      })
    }
    await logbook.addLogbook(
      req.body
    )

    res.json({
      message: "Kendaraan berhasil diperbarui"
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Gagal update kendaraan"
    })
  }
}

// GET /api/daftar-tugas
// optionally filter by petugas id from auth
async function listTugas(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    console.log('Fetching tasks for userId:', userId);
    const data = await daftarTugasService.listTugas(userId);
    console.log('Tasks data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error in listTugas:', error);
    res.status(500).json({ message: "Gagal mengambil daftar tugas" });
  }
}

module.exports = {
  updateStatus,
  listTugas,
  updateLogbook
};
