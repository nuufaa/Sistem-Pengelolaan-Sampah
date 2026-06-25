const { db } = require("../config/db");
const tpsModel = require("./tpsModel");

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

  // Jika status selesai dan ada volume_sampah, hitung persentase & update status_tps
  if (data.status_angkut === 'selesai' && data.volume_sampah) {
    const tugas = await findById(id);
    if (tugas) {
      const [tpsRows] = await db.query(
        'SELECT kapasitas FROM tps WHERE id_tps = ?',
        [tugas.id_tps]
      );
      const kapasitas = tpsRows[0]?.kapasitas;
      if (kapasitas && kapasitas > 0) {
        const persentase = (data.volume_sampah / kapasitas) * 100;

        let status_tps = 'normal';
        if (persentase >= 80) status_tps = 'penuh';
        else if (persentase >= 50) status_tps = 'hampir_penuh';

        await tpsModel.updateStatusTPS(tugas.id_tps, status_tps);
      }
    }
  }
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT * FROM daftar_tugas WHERE id_daftar_tugas = ?",
    [id]
  );
  return rows[0];
}

async function addLogbook(data) {
  const { id_kendaraan, tasksSelected, id_petugas } = data;

  if (!tasksSelected || !tasksSelected.length) return;

  // Update secara langsung menggunakan ID Tugas yang unik
  await db.query(
    `UPDATE daftar_tugas
     SET 
       id_kendaraan = ?,
       tgl_terakhir_diambil = CURDATE()
     WHERE id_daftar_tugas IN (?)
     AND id_petugas = ?`,
    [id_kendaraan, tasksSelected, id_petugas]
  );
}

// Query 1: Ambil daftar_tugas (fast, minimal JOINs)
// Query 2: Ambil detail kendaraan/petugas (lazy load)
async function getByPetugas(id_petugas) {
  try {
    const [rows] = await db.query(
      `SELECT dt.id_daftar_tugas AS id,
              dt.id_jadwal,
              dt.id_tps,
              dt.id_petugas,
              dt.tgl_pengambilan,
              dt.tgl_terakhir_diambil,
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
          AND (dt.status_angkut IN ('belum_diangkut', 'diangkut') 
              OR (dt.status_angkut = 'selesai' AND DATE(dt.tgl_pengambilan) = CURDATE()))
          AND dt.id_jadwal IN (SELECT id_jadwal FROM jadwal_pengambilan WHERE is_active = 1)
        ORDER BY dt.tgl_pengambilan ASC
       LIMIT 100`,
      [id_petugas]
    );

    if (rows.length > 0) {
      const validJadwalIds = [...new Set(rows.map(r => r.id_jadwal).filter(id => id !== null))];
      if (validJadwalIds.length > 0) {
        const [jadwalDetails] = await db.query(
          `SELECT id_jadwal, 
              GROUP_CONCAT(DISTINCT hari_pengambilan ORDER BY hari_pengambilan SEPARATOR ',') AS hari_pengambilan
           FROM jadwal_pengambilan 
           WHERE id_jadwal IN (?)
           GROUP BY id_jadwal`,
          [validJadwalIds]
        );

        const jadwalMap = {};
        jadwalDetails.forEach(jd => {
          jadwalMap[jd.id_jadwal] = jd;
        });

        const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        rows.forEach(row => {
          if (row.id_jadwal && jadwalMap[row.id_jadwal]) {
            const hariStr = jadwalMap[row.id_jadwal].hari_pengambilan;
            const hariArray = String(hariStr).split(',').map(Number);
            row.hari_pengambilan = hariArray.map(h => daftarHari[h]).join(', ');
          } else {
            row.hari_pengambilan = row.id_jadwal ? "Jadwal Aktif" : "Jadwal Dihapus";
          }
        });
      } else {
        rows.forEach(row => row.hari_pengambilan = "Jadwal Dihapus");
      }
    }
    return rows;
  } catch (error) {
    console.error("Error in getByPetugas:", error);
    throw error;
  }
}

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
          p.nama,
          k.nomor_kendaraan
      FROM daftar_tugas dt
      INNER JOIN tps t ON dt.id_tps = t.id_tps
      LEFT JOIN petugas p ON dt.id_petugas = p.id_petugas
      LEFT JOIN kendaraan k ON dt.id_kendaraan = k.id_kendaraan
      WHERE (dt.status_angkut IN ('belum_diangkut', 'diangkut')
              OR (dt.status_angkut = 'selesai' AND DATE(dt.tgl_pengambilan) = CURDATE()))
        AND dt.id_jadwal IN (SELECT id_jadwal FROM jadwal_pengambilan WHERE is_active = 1)
      ORDER BY dt.tgl_pengambilan ASC
      LIMIT 1000`
    );

    if (rows.length > 0) {
      const validJadwalIds = [...new Set(rows.map(r => r.id_jadwal).filter(id => id !== null))];
      if (validJadwalIds.length > 0) {
        const [jadwalDetails] = await db.query(
          `SELECT id_jadwal,
              GROUP_CONCAT(DISTINCT hari_pengambilan ORDER BY hari_pengambilan SEPARATOR ',') AS hari_pengambilan
            FROM jadwal_pengambilan
            WHERE id_jadwal IN (?)
            GROUP BY id_jadwal`,
          [validJadwalIds]
        );

        const jadwalMap = {};
        jadwalDetails.forEach(jd => {
          jadwalMap[jd.id_jadwal] = jd;
        });

        const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        rows.forEach(row => {
          if (row.id_jadwal && jadwalMap[row.id_jadwal]) {
            const hariStr = jadwalMap[row.id_jadwal].hari_pengambilan;
            const hariArray = String(hariStr).split(',').map(Number);
            row.hari_pengambilan = hariArray.map(h => daftarHari[h]).join(', ');
          } else {
            row.hari_pengambilan = row.id_jadwal ? "Jadwal Aktif" : "Jadwal Dihapus";
          }
        });
      } else {
        rows.forEach(row => row.hari_pengambilan = "Jadwal Dihapus");
      }
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
    // 1. Ambil semua jadwal AKTIF untuk TPS ini
    const [activeSchedules] = await db.query(
      `SELECT id_jadwal, hari_pengambilan, id_petugas
        FROM jadwal_pengambilan 
        WHERE id_tps = ? AND is_active = 1`,
      [id_tps]
    );

    const scheduleMap = {};
    activeSchedules.forEach(s => {
      scheduleMap[s.hari_pengambilan] = s;
    });

    // 2. Ambil semua tugas BELUM SELESAI untuk TPS ini
    const [tasks] = await db.query(
      `SELECT id_daftar_tugas, tgl_pengambilan 
        FROM daftar_tugas 
        WHERE id_tps = ? AND status_angkut != 'selesai'`,
      [id_tps]
    );

    // 3. Sinkronisasi tugas yang ada
    for (const task of tasks) {
      const date = new Date(task.tgl_pengambilan);
      // Format hari: 0=Senin, ..., 6=Minggu
      const dayOfWeek = (date.getDay() + 6) % 7;
      
      const currentSchedule = scheduleMap[dayOfWeek];
      
      if (currentSchedule) {
        // HARI MASIH ADA: Pastikan ID Jadwal dan Petugas sinkron dengan yang terbaru
        await db.query(
          "UPDATE daftar_tugas SET id_jadwal = ?, id_petugas = ? WHERE id_daftar_tugas = ?",
          [currentSchedule.id_jadwal, currentSchedule.id_petugas, task.id_daftar_tugas]
        );
      } else {
        // HARI SUDAH DIHAPUS: Hapus tugas ini karena jadwalnya sudah tidak ada
        await db.query(
          "DELETE FROM daftar_tugas WHERE id_daftar_tugas = ?",
          [task.id_daftar_tugas]
        );
      }
    }

    // Jika tidak ada jadwal aktif sama sekali, berhenti di sini (tugas sudah didelete di loop atas)
    if (activeSchedules.length === 0) return;

    const id_petugas = activeSchedules[0].id_petugas;

    // 2. Generate tugas untuk semua hari dalam jadwal (sampai 7 hari ke depan)
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + i);

      // hitung hari dalam minggu (0 = Senin, 6 = Minggu)
      const dayOfWeek = (targetDate.getDay() + 6) % 7;

      // cari jadwal untuk hari ini
      const jadwalForDay = activeSchedules.find(j => j.hari_pengambilan == dayOfWeek);

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

// Query untuk mendapatkan riwayat (history) yang selesai
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
              k.nomor_kendaraan,
              p.nama
      FROM daftar_tugas dt
        INNER JOIN tps t ON dt.id_tps = t.id_tps
        LEFT JOIN kendaraan k ON dt.id_kendaraan = k.id_kendaraan
        LEFT JOIN petugas p ON dt.id_petugas = p.id_petugas
      WHERE dt.id_petugas = ? 
        AND dt.status_angkut = 'selesai'
      ORDER BY dt.tgl_terakhir_diambil DESC
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

// Riwayat semua yang selesai - untuk admin
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
              k.nomor_kendaraan,
              p.nama AS nama
      FROM daftar_tugas dt
        INNER JOIN tps t ON dt.id_tps = t.id_tps
        LEFT JOIN kendaraan k ON dt.id_kendaraan = k.id_kendaraan
        INNER JOIN petugas p ON dt.id_petugas = p.id_petugas
      WHERE dt.status_angkut = 'selesai'
        ER BY dt.tgl_terakhir_diambil DESC
      LIMIT 100`
    );

    // Query 2: Lazy load jadwal details
    if (rows.length > 0) {
      const jadwalIds = [...new Set(rows.map(r => r.id_jadwal))];

      const [jadwalDetails] = await db.query(
        `SELECT DISTINCT j.id_jadwal,
              GROUP_CONCAT(j.hari_pengambilan ORDER BY j.hari_pengambilan SEPARATOR ',') AS hari_pengambilan
              FROM jadwal_pengambilan j
        WHERE j.id_jadwal IN (${jadwalIds.map(() => '?').join(',')})\n         
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