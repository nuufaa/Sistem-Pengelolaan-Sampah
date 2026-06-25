const JadwalModel = require("../models/jadwalModel");
const jadwalService = require("../services/jadwalService");
const { db } = require("../config/db");
const daftarTugasModel = require("../models/daftarTugasModel")

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
  const id_tps = req.params.id || req.params.id_tps || req.body.id_tps;
    const {
      id_petugas,
      hari_pengambilan,
      jam_buang_mulai,
      jam_buang_selesai,
      jam_pengambilan_mulai,
      jam_pengambilan_selesai
    } = req.body;

  const id_admin = req.user.id;

  if (!id_tps || !id_petugas) {
    return res.status(400).json({ error: "id_tps dan id_petugas wajib diisi" });
  }

  try {
    // Cek petugas lama untuk menentukan apakah perlu sync
    const [jadwalLama] = await db.query(
      `SELECT DISTINCT id_petugas FROM jadwal_pengambilan WHERE id_tps = ? LIMIT 1`,
      [id_tps]
    );

    const id_petugas_lama = jadwalLama.length > 0 ? jadwalLama[0].id_petugas : null;
    const petugasChanged = id_petugas_lama !== id_petugas;

    await JadwalModel.update(
      db,
      id_tps,
      id_petugas,
      hari_pengambilan || [],
      id_admin,
      jam_buang_mulai,
      jam_buang_selesai,
      jam_pengambilan_mulai,
      jam_pengambilan_selesai
    );

    await daftarTugasModel.syncTugasByTps(id_tps);

    return res.status(200).json({
      message: "Jadwal berhasil diperbarui" + (petugasChanged ? " dan daftar tugas ter-update" : ""),
      data: { id_tps, id_petugas, petugasChanged }
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Gagal update jadwal",
      error: error.message
    });
  }
}

async function deleteJadwal(req, res) {
  try {
    const ids = req.params.id.split(",");
    
    // Ambil daftar id_tps yang terpengaruh sebelum jadwal dinonaktifkan
    const [tpsRows] = await db.query(
      "SELECT DISTINCT id_tps FROM jadwal_pengambilan WHERE id_jadwal IN (?)",
      [ids]
    );

    await JadwalModel.remove(req.params.id);

    // Sync daftar tugas untuk setiap TPS yang jadwalnya dihapus
    if (tpsRows.length > 0) {
      for (const row of tpsRows) {
        await daftarTugasModel.syncTugasByTps(row.id_tps);
      }
    }

    return res.json({
      message: "Jadwal berhasil dihapus dan daftar tugas diperbarui"
    });

  } catch (error) {
    console.error('[deleteJadwal] Error:', error);
    return res.status(500).json({
      message: "Gagal hapus jadwal"
    });
  }
}

async function getUsedDaysByTPS(req, res) {
  try {
    const { id_tps } = req.params;

    if (!id_tps) {
      return res.status(400).json({ error: "id_tps wajib diisi" });
    }

    const usedDays = await JadwalModel.getUsedHariByTPS(id_tps);

    return res.json({
      id_tps: id_tps,
      usedDays: usedDays
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal mengambil hari yang digunakan",
      error: error.message
    });
  }
}

module.exports = {
  createJadwal,
  getAllJadwal,
  updateJadwal,
  deleteJadwal,
  getUsedDaysByTPS
};
