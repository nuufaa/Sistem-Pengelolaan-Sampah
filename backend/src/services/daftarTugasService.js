const daftarTugasModel = require("../models/daftarTugasModel");
const jadwalModel = require("../models/jadwalModel");

async function updateStatusTugas(id, data) {

  // selalu update status tugas
  await daftarTugasModel.updateStatus(id, data);

  // jika status selesai baru update jadwal
  if (data.status_angkut === "selesai") {

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
