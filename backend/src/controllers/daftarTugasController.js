const daftarTugasService = require("../services/daftarTugasService");

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

// GET /api/daftar-tugas
// optionally filter by petugas id from auth
async function listTugas(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const data = await daftarTugasService.listTugas(userId);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil daftar tugas" });
  }
}

module.exports = {
  updateStatus,
  listTugas
};
