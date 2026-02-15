const daftarTugasModel = require("../model/daftarTugasModel");
const DaftarTugasService = require("../service/daftarTugasService");

async function updateStatus(req, res) {
  try {
    // const { id } = req.params;

    // await daftarTugasModel.updateStatus(id, req.body);
    await DaftarTugasService.updateStatusTugas(
      req.params.id,
      req.body
    );

    res.json({
      message: "Status berhasil diperbarui"
    });

  } catch (error) {
    res.status(500).json({
      message: "Gagal update tugas"
    });
  }
}

module.exports = {
  updateStatus
};
