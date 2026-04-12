const {db} = require("../config/db");

// Helper function untuk format tanggal lokal (YYYY-MM-DD) tanpa UTC conversion
function formatDateLocal(date) {
  if (typeof date === 'string') return date; // Jika sudah string, return as is
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function create(data) {
    // DEPRECATED: Gunakan sync() atau createForDate() untuk generate tugas
    // Method ini tetap ada untuk backward compatibility
    const { id_jadwal, id_petugas, id_tps, tgl_pengambilan } = data;
    const targetDate = tgl_pengambilan || formatDateLocal(new Date());

    try {
      const [rows] = await db.query(
        `SELECT id_daftar_tugas FROM daftar_tugas
         WHERE id_jadwal = ? AND tgl_pengambilan = ?`,
        [id_jadwal, targetDate]
      );

      if (rows.length === 0) {
        await db.query(
          `INSERT INTO daftar_tugas
          (id_jadwal, id_petugas, id_tps, tgl_pengambilan, status_angkut)
          VALUES (?, ?, ?, ?, 'belum_diangkut')`,
          [id_jadwal, id_petugas, id_tps, targetDate]
        );
      }
    } catch (error) {
      console.error("Error creating tugas:", error);
      throw error;
    }
  }

async function updateStatus(id, data) {
  const tglTerakhir =
    data.status_angkut === "selesai" ? new Date() : null;

  const [result] = await db.query(
    `UPDATE daftar_tugas SET
      tgl_terakhir_diambil = ?,
      id_kendaraan = ?,
      status_angkut = ?,
      volume_sampah = ?
    WHERE id_daftar_tugas = ?`,
    [
      tglTerakhir,
      data.id_kendaraan || null,
      data.status_angkut,
      data.volume_sampah || null,
      id
    ]
  );
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT * FROM daftar_tugas WHERE id_daftar_tugas = ?",
    [id]
  );
  return rows[0];
}

async function addLogbook(data) {
    const { id_kendaraan, tpsVisited } = data

    // IMPORTANT: Update HANYA untuk hari ini, jangan pengaruhi jadwal masa depan
    await db.query(
      `UPDATE daftar_tugas
       SET id_kendaraan = ?
       WHERE id_tps IN (${tpsVisited.map(() => '?').join(',')})
       AND tgl_pengambilan = CURDATE()`,
      [id_kendaraan, ...tpsVisited]
    );
}

// OPTIMIZED: Split query untuk mengurangi beban
// Query 1: Ambil daftar_tugas (fast, minimal JOINs)
// Query 2: Ambil detail kendaraan/petugas (lazy load)
async function getByPetugas(id_petugas) {
  try {
    // QUERY 1: Main query - ambil daftar_tugas dengan detail minimal
    // Strategy: Hanya JOIN tabel yang critical (tps, kendaraan, petugas)
    const [rows] = await db.query(
      `SELECT dt.id_daftar_tugas AS id,
              dt.id_jadwal,
              dt.id_tps,
              dt.id_petugas,
              dt.tgl_pengambilan,
              dt.id_kendaraan,
              dt.status_angkut,
              dt.volume_sampah,
              t.nama_tps,
              k.nomor_kendaraan,
              p.nama
       FROM daftar_tugas dt
       INNER JOIN tps t ON dt.id_tps = t.id_tps
       LEFT JOIN kendaraan k ON dt.id_kendaraan = k.id_kendaraan
       LEFT JOIN petugas p ON dt.id_petugas = p.id_petugas
       WHERE dt.id_petugas = ? 
         AND dt.status_angkut IN ('belum_diangkut', 'diangkut')
         AND dt.tgl_pengambilan = (
           SELECT MIN(tgl_pengambilan) 
           FROM daftar_tugas
           WHERE id_jadwal = dt.id_jadwal 
             AND status_angkut IN ('belum_diangkut', 'diangkut')
         )
       ORDER BY dt.tgl_pengambilan ASC
       LIMIT 100`,
      [id_petugas]
    );

    // QUERY 2: Lazy load jadwal + petugas info terpisah (hanya saat diperlukan di frontend)
    // Ini akan diminimalkan fetch count dengan caching
    if (rows.length > 0) {
      const jadwalIds = [...new Set(rows.map(r => r.id_jadwal))];
      
      const [jadwalDetails] = await db.query(
        `SELECT j.id_jadwal,
                GROUP_CONCAT(DISTINCT j.hari_pengambilan ORDER BY j.hari_pengambilan) AS hari_pengambilan,
                MAX(j.tgl_terakhir_diambil) AS tgl_terakhir_diambil
         FROM jadwal_pengambilan j
         WHERE j.id_jadwal IN (${jadwalIds.map(() => '?').join(',')})
         GROUP BY j.id_jadwal`,
        jadwalIds
      );

      // Merge jadwal info ke results
      const jadwalMap = {};
      jadwalDetails.forEach(jd => {
        jadwalMap[jd.id_jadwal] = jd;
      });

      rows.forEach(row => {
        const jadwal = jadwalMap[row.id_jadwal] || {};
        row.hari_pengambilan = jadwal.hari_pengambilan;
        row.tgl_terakhir_diambil = jadwal.tgl_terakhir_diambil;
      });
    }

    return rows;
  } catch (error) {
    console.error("Error in getByPetugas:", error);
    throw error;
  }
}

// OPTIMIZED: Query yang lebih ringan untuk admin
async function getAll() {
  try {
    // Query 1: Main - hanya JOIN critical tables
    const [rows] = await db.query(
      `SELECT dt.id_daftar_tugas AS id,
              dt.id_jadwal,
              dt.id_tps,
              dt.id_petugas,
              dt.tgl_pengambilan,
              dt.id_kendaraan,
              dt.status_angkut,
              dt.volume_sampah,
              t.nama_tps,
              p.nama
       FROM daftar_tugas dt
       INNER JOIN tps t ON dt.id_tps = t.id_tps
       LEFT JOIN petugas p ON dt.id_petugas = p.id_petugas
       WHERE dt.status_angkut IN ('belum_diangkut', 'diangkut')
         AND dt.tgl_pengambilan = (
           SELECT MIN(tgl_pengambilan) 
           FROM daftar_tugas
           WHERE id_jadwal = dt.id_jadwal 
             AND status_angkut IN ('belum_diangkut', 'diangkut')
         )
       ORDER BY dt.tgl_pengambilan ASC
       LIMIT 1000`
    );

    // Query 2: Lazy load jadwal details
    if (rows.length > 0) {
      const jadwalIds = [...new Set(rows.map(r => r.id_jadwal))];
      
      const [jadwalDetails] = await db.query(
        `SELECT j.id_jadwal,
                GROUP_CONCAT(DISTINCT j.hari_pengambilan ORDER BY j.hari_pengambilan SEPARATOR ',') AS hari_pengambilan,
                MAX(j.tgl_terakhir_diambil) AS tgl_terakhir_diambil
         FROM jadwal_pengambilan j
         WHERE j.id_jadwal IN (${jadwalIds.map(() => '?').join(',')})
         GROUP BY j.id_jadwal`,
        jadwalIds
      );

      const jadwalMap = {};
      jadwalDetails.forEach(jd => {
        jadwalMap[jd.id_jadwal] = jd;
      });

      rows.forEach(row => {
        const jadwal = jadwalMap[row.id_jadwal] || {};
        row.hari_pengambilan = jadwal.hari_pengambilan;
        row.tgl_terakhir_diambil = jadwal.tgl_terakhir_diambil;
      });
    }

    return rows;
  } catch (error) {
    console.error("Error in getAll:", error);
    throw error;
  }
}

async function updatePetugasByTpsToday(id_tps, id_petugas, id_jadwal) {
  await db.query(
    `UPDATE daftar_tugas
     SET id_petugas = ?, id_jadwal = ?
     WHERE id_tps = ?
     AND tgl_pengambilan = CURDATE()`,
    [id_petugas, id_jadwal, id_tps]
  );
}

async function syncTugasByTps(id_tps) {
  try {

    // ambil jadwal terbaru untuk TPS ini
    const [jadwalRows] = await db.query(
      `SELECT j.id_jadwal, j.hari_pengambilan, j.id_petugas
       FROM jadwal_pengambilan j
       WHERE j.id_tps = ?`,
      [id_tps]
    );

    if (jadwalRows.length === 0) {
      // tidak ada jadwal, hapus semua tugas untuk TPS ini
      await db.query(
        `DELETE FROM daftar_tugas WHERE id_tps = ?`,
        [id_tps]
      );
      return;
    }

    // Ambil petugas dari jadwal (semuanya seharusnya sama untuk 1 TPS)
    const id_petugas = jadwalRows[0].id_petugas;

    // 1. Update tugas yang sudah ada dan belum selesai
    const [updateResult] = await db.query(
      `UPDATE daftar_tugas
       SET id_petugas = ?
       WHERE id_tps = ?
       AND status_angkut != 'selesai'`,
      [id_petugas, id_tps]
    );

    // 2. Generate tugas untuk semua hari dalam jadwal (sampai 7 hari ke depan)
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + i);
      
      // hitung hari dalam minggu (0 = Senin, 6 = Minggu)
      const dayOfWeek = (targetDate.getDay() + 6) % 7;
      
      // cari jadwal untuk hari ini
      const jadwalForDay = jadwalRows.find(j => j.hari_pengambilan == dayOfWeek);
      
      if (jadwalForDay) {
        // check apakah tugas sudah ada untuk tanggal ini
        const dateStr = formatDateLocal(targetDate);
        const [existing] = await db.query(
          `SELECT id_daftar_tugas FROM daftar_tugas
           WHERE id_tps = ? AND tgl_pengambilan = ?`,
          [id_tps, dateStr]
        );

        if (existing.length === 0) {
          // insert tugas baru
          await db.query(
            `INSERT INTO daftar_tugas 
            (id_jadwal, id_petugas, id_tps, tgl_pengambilan, status_angkut)
            VALUES (?, ?, ?, ?, 'belum_diangkut')`,
            [jadwalForDay.id_jadwal, id_petugas, id_tps, dateStr]
          );
        }
      }
    }

  } catch (error) {
    throw error;
  }
}

// OPTIMIZED: Query untuk mendapatkan riwayat (history) yang selesai
// Reduced JOINs pada main query untuk performa
async function getCompletedByPetugas(id_petugas) {
  try {
    // Query 1: Main - minimal JOINs
    const [rows] = await db.query(
      `SELECT dt.id_daftar_tugas AS id,
              dt.id_jadwal,
              dt.id_tps,
              dt.id_petugas,
              dt.tgl_pengambilan,
              dt.id_kendaraan,
              dt.status_angkut,
              dt.volume_sampah,
              dt.tgl_terakhir_diambil,
              t.nama_tps,
              k.nomor_kendaraan
       FROM daftar_tugas dt
       INNER JOIN tps t ON dt.id_tps = t.id_tps
       LEFT JOIN kendaraan k ON dt.id_kendaraan = k.id_kendaraan
       WHERE dt.id_petugas = ? 
         AND dt.status_angkut = 'selesai'
       ORDER BY dt.tgl_pengambilan DESC
       LIMIT 50`,
      [id_petugas]
    );

    // Query 2: Lazy load jadwal details
    if (rows.length > 0) {
      const jadwalIds = [...new Set(rows.map(r => r.id_jadwal))];
      
      const [jadwalDetails] = await db.query(
        `SELECT DISTINCT j.id_jadwal,
                GROUP_CONCAT(j.hari_pengambilan ORDER BY j.hari_pengambilan) AS hari_pengambilan
         FROM jadwal_pengambilan j
         WHERE j.id_jadwal IN (${jadwalIds.map(() => '?').join(',')})
         GROUP BY j.id_jadwal`,
        jadwalIds
      );

      const jadwalMap = {};
      jadwalDetails.forEach(jd => {
        jadwalMap[jd.id_jadwal] = jd.hari_pengambilan;
      });

      rows.forEach(row => {
        row.hari_pengambilan = jadwalMap[row.id_jadwal] || null;
      });
    }

    return rows;
  } catch (error) {
    console.error("Error in getCompletedByPetugas:", error);
    throw error;
  }
}

// OPTIMIZED: Riwayat semua yang selesai - untuk admin
// Reduce JOINs untuk query efficiency
async function getAllCompleted() {
  try {
    // Query 1: Main - hanya JOIN critical tables
    const [rows] = await db.query(
      `SELECT dt.id_daftar_tugas AS id,
              dt.id_jadwal,
              dt.id_tps,
              dt.id_petugas,
              dt.tgl_pengambilan,
              dt.id_kendaraan,
              dt.status_angkut,
              dt.volume_sampah,
              dt.tgl_terakhir_diambil,
              t.nama_tps,
              p.nama AS nama_petugas
       FROM daftar_tugas dt
       INNER JOIN tps t ON dt.id_tps = t.id_tps
       INNER JOIN petugas p ON dt.id_petugas = p.id_petugas
       WHERE dt.status_angkut = 'selesai'
       ORDER BY dt.tgl_pengambilan DESC
       LIMIT 100`
    );

    // Query 2: Lazy load jadwal details
    if (rows.length > 0) {
      const jadwalIds = [...new Set(rows.map(r => r.id_jadwal))];
      
      const [jadwalDetails] = await db.query(
        `SELECT DISTINCT j.id_jadwal,
                GROUP_CONCAT(j.hari_pengambilan ORDER BY j.hari_pengambilan SEPARATOR ',') AS hari_pengambilan
                FROM jadwal_pengambilan j
         WHERE j.id_jadwal IN (${jadwalIds.map(() => '?').join(',')})\n         GROUP BY j.id_jadwal`,
        jadwalIds
      );

      const jadwalMap = {};
      jadwalDetails.forEach(jd => {
        jadwalMap[jd.id_jadwal] = jd.hari_pengambilan;
      });

      rows.forEach(row => {
        row.hari_pengambilan = jadwalMap[row.id_jadwal] || null;
      });
    }

    return rows;
  } catch (error) {
    console.error("Error in getAllCompleted:", error);
    throw error;
  }
}

module.exports = {
  create,
  updateStatus,
  findById,
  getByPetugas,
  getAll,
  addLogbook,
  updatePetugasByTpsToday,
  syncTugasByTps,
  getCompletedByPetugas,
  getAllCompleted
};