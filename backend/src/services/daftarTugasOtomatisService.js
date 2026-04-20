const cron = require("node-cron");
const { db } = require("../config/db");
const jadwalModel = require("../models/jadwalModel");
const daftarTugasModel = require("../models/daftarTugasModel");
const tpsModel = require("../models/tpsModel");

// Helper function untuk format tanggal lokal (YYYY-MM-DD) tanpa UTC conversion
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate tugas untuk hari ini PLUS 14 hari ke depan (2 minggu)
// Smart: hanya simpan jadwal belum selesai, jadi tidak menumpuk
async function generateTugasHarian() {
  try {
    const today = new Date();
    const hariUntuk = 7; // Generate untuk 1 minggu ke depan

    // Loop untuk setiap hari
    for (let hitung = 0; hitung <= hariUntuk; hitung++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + hitung);

      // Hitung hari dalam seminggu (0=Senin, 6=Minggu)
      const hariIndex = (targetDate.getDay() + 6) % 7;

      // Ambil semua jadwal untuk hari ini
      const jadwalList = await jadwalModel.findByHari(hariIndex);

      // Untuk setiap jadwal yang cocok dengan hari ini
      for (const jadwal of jadwalList) {
        // Check apakah sudah ada record untuk tanggal + jadwal ini
        const dateStr = formatDateLocal(targetDate);
        const [existing] = await db.query(
          `SELECT id_daftar_tugas FROM daftar_tugas
           WHERE id_jadwal = ? AND tgl_pengambilan = ?`,
          [jadwal.id_jadwal, dateStr]
        );

        // Jika belum ada, buat baru
        if (existing.length === 0) {
          await db.query(
            `INSERT INTO daftar_tugas 
            (id_jadwal, id_petugas, id_tps, tgl_pengambilan, status_angkut)
            VALUES (?, ?, ?, ?, 'belum_diangkut')`,
            [jadwal.id_jadwal, jadwal.id_petugas, jadwal.id_tps, dateStr]
          );
        }
      }
    }

    // CLEANUP: Hapus records yang sudah selesai lebih dari 60 hari lalu (untuk hemat storage)
    const cleanupDate = new Date(today);
    cleanupDate.setDate(cleanupDate.getDate() - 60);
    const cleanupDateStr = formatDateLocal(cleanupDate);

    await db.query(
      `DELETE FROM daftar_tugas 
       WHERE status_angkut = 'selesai' 
       AND tgl_pengambilan < ?`,
      [cleanupDateStr]
    );

    console.log(`[${new Date().toISOString()}] Generate tugas ${hariUntuk}-hari selesai`);
  } catch (error) {
    console.error("Error generate tugas:", error);
  }
}

// Reset semua status_tps ke 'normal' setiap tengah malam (H+1)
async function resetStatusTPS() {
  try {
    await db.query(`UPDATE tps SET status_tps = 'normal'`);
    console.log(`[${new Date().toISOString()}] status_tps semua TPS direset ke 'normal'`);
  } catch (error) {
    console.error("Error reset status TPS:", error);
  }
}

function startScheduler() {
  // Generate tugas setiap hari tengah malam
  cron.schedule("0 0 * * *", generateTugasHarian);

  // Reset status_tps ke 'normal' setiap tengah malam (H+1)
  cron.schedule("0 0 * * *", resetStatusTPS);

  // Jalankan saat aplikasi start (catch-up)
  generateTugasHarian();
}

module.exports = {
  generateTugasHarian,
  resetStatusTPS,
  startScheduler
};
