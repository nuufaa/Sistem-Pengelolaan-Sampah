const daftarTugasModel = require("../model/daftarTugasModel");
const jadwalModel = require("../model/jadwalModel");

async function updateStatusTugas(id, data) {

  await daftarTugasModel.updateStatus(id, data);

  // Jika status selesai
  if (data.status_angkut === "Selesai") {

    const tugas = await daftarTugasModel.findById(id);

    await jadwalModel.updateTanggalTerakhir(tugas.id_jadwal);
  }
}

module.exports = {
  updateStatusTugas
};
