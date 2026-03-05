const daftarTugasModel = require("../models/daftarTugasModel");
const jadwalModel = require("../models/jadwalModel");

async function updateStatusTugas(id, data) {

  await daftarTugasModel.updateStatus(id, data);

  // Jika status selesai
  if (data.status_angkut === "Selesai") {

    const tugas = await daftarTugasModel.findById(id);

    await jadwalModel.updateTanggalTerakhir(tugas.id_jadwal);
  }
}

async function listTugas(id_petugas) {
  // if id_petugas is provided, filter by petugas; otherwise return all
  if (id_petugas) {
    return await daftarTugasModel.getByPetugas(id_petugas);
  }
  return await daftarTugasModel.getAll();
}

module.exports = {
  updateStatusTugas,
  listTugas
};
