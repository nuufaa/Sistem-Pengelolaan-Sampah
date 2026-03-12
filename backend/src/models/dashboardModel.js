const {db} = require("../config/db")

async function getTotalTPS() {
    const [rows] = await db.query(
        "SELECT COUNT(*) as total FROM tps"
    );
    return rows[0].total;
}

async function getTotalPetugas() {
    const [rows] = await db.query(
        "SELECT COUNT(*) as total FROM petugas"
    );
    return rows[0].total;
}

async function getTotalLaporanBulanIni() {
    const [rows] = await db.query(`
        SELECT COUNT(*) as total
        FROM lapor
        WHERE MONTH(tgl_laporan) = MONTH(CURRENT_DATE())
        AND YEAR(tgl_laporan) = YEAR(CURRENT_DATE())
        `)
    return rows[0].total
}

async function getTotalTPSPenuh() {
    const [rows] = await db.query(`
        SELECT COUNT(*) as total
        FROM tps
        WHERE status_tps = 'penuh'
        `)
    return rows[0].total;
}

async function getTotalTPSHampirPenuh() {
    const [rows] = await db.query(`
        SELECT COUNT(*) as total
        FROM tps
        WHERE status_tps = 'hampir_penuh'
        `)
    return rows[0].total;
}

async function getStatusTPS() {
    const [rows] = await db.query(`
        SELECT status_tps, COUNT(*) as total
        FROM tps
        GROUP BY status_tps
        `)
    return rows
}

async function getLaporan7Hari() {
    const [rows] = await db.query(`
        SELECT DATE(tgl_laporan) as tanggal, COUNT(*) as total
        FROM lapor
        WHERE tgl_laporan >= CURDATE() - INTERVAL 6 DAY
        GROUP BY DATE(tgl_laporan)
        ORDER BY tanggal ASC
        `)
    return rows
}

async function getTotalTugas(id_petugas) {
    const [rows] = await db.query(`
        SELECT COUNT(*  ) as total
        FROM daftar_tugas
        WHERE id_petugas = ?`,
        [id_petugas]
    );
    return rows[0].total;
}

async function getPendingTugas(id_petugas) {
    const [rows] = await db.query(
        `SELECT COUNT(*) as total
        FROM daftar_tugas
        WHERE id_petugas = ?
        AND status_angkut = 'belum_diangkut'`,
        [id_petugas]
    );
    return rows[0].total;
}

async function getDoneTugas(id_petugas) {
    const [rows] = await db.query(
        `SELECT COUNT(*) as total
        FROM daftar_tugas
        WHERE id_petugas = ?
        AND status_angkut = 'selesai'`,
        [id_petugas]
    );
    return rows[0].total;
}

async function getProgressTugas(id_petugas) {
    const [rows] = await db.query(
        `SELECT COUNT(*) as total
        FROM daftar_tugas
        WHERE id_petugas = ?
        AND status_angkut = 'diangkut'`,
        [id_petugas]
    );
    return rows[0].total
}

//statistik di home
async function getVolumeSampah() {
    
    const [rows] = await db.query(`
        SELECT
            t.nama_tps,
            COALESCE(SUM(dt.volume_sampah), 0) AS total_volume,
            t.kapasitas,
            DATE(dt.tgl_pengambilan) AS tanggal,
            ROUND(COALESCE(SUM(dt.volume_sampah), 0) / t.kapasitas * 100, 1) AS persentase
        FROM tps t
        LEFT JOIN daftar_tugas dt ON t.id_tps = dt.id_tps AND dt.status_angkut = 'selesai'
        GROUP BY DATE(dt.tgl_pengambilan), t.id_tps
        ORDER BY total_volume DESC
        `);
    return rows;
}

// async function getRankingTPS() {
    
//     const [rows] = await db.query(`
//               SELECT
//       t.id_tps,
//       t.nama_tps,
//       d.nama_dusun,
//       SUM(dt.volume_sampah) AS total_volume,
//       t.kapasitas,
//       ROUND(SUM(dt.volume_sampah)/t.kapasitas*100,1) AS persentase
//       FROM tps t
//       LEFT JOIN daftar_tugas dt
//       ON t.id_tps = dt.id_tps
//       AND dt.status_angkut='selesai'
//       LEFT JOIN dusun d
//       ON t.id_dusun = d.id_dusun
//       GROUP BY t.id_tps
//       ORDER BY persentase ASC
//       LIMIT 10
//     `);
//     return rows;
// }
// async function getRankingTPS() {
    
//     const [rows] = await db.query(`
//       SELECT
//         t.id_tps,
//         t.nama_tps,
//         t.status_tps,
//         t.kapasitas,
//         COUNT(dt.id_daftar_tugas) AS jumlah_pengambilan,
//         COALESCE(SUM(dt.volume_sampah), 0) AS total_volume,
//         d.nama_dusun
//       FROM tps t
//       LEFT JOIN daftar_tugas dt ON t.id_tps = dt.id_tps AND dt.status_angkut = 'selesai'
//       LEFT JOIN dusun d ON t.id_dusun = d.id_dusun
//       GROUP BY t.id_tps
//       ORDER BY total_volume ASC
//     `);
//     return rows;
// }

async function getRankingTPS() {

  const [rows] = await db.query(`
    SELECT
      t.id_tps,
      t.nama_tps,
      d.nama_dusun,
      t.kapasitas,
      COALESCE(SUM(dt.volume_sampah),0) AS total_volume,

      ROUND(
        COALESCE(SUM(dt.volume_sampah),0) / t.kapasitas * 100
      ,1) AS score

    FROM tps t
    LEFT JOIN daftar_tugas dt
      ON t.id_tps = dt.id_tps
      AND dt.status_angkut='selesai'
    LEFT JOIN dusun d
      ON t.id_dusun = d.id_dusun

    GROUP BY t.id_tps

    ORDER BY score ASC
    LIMIT 5
  `)

  return rows
}

// async function getTimbulanPerKapita() {
    
//     const [rows] = await db.query(`
//       SELECT
//         d.nama_dusun,
//         d.jumlah_kk,
//         COALESCE(SUM(dt.volume_sampah), 0) AS total_volume,
//         ROUND(
//           COALESCE(SUM(dt.volume_sampah), 0) / NULLIF(d.jumlah_kk, 0),
//           2
//         ) AS timbulan_per_kk
//       FROM dusun d
//       LEFT JOIN tps t ON d.id_dusun = t.id_dusun
//       LEFT JOIN daftar_tugas dt ON t.id_tps = dt.id_tps AND dt.status_angkut = 'selesai'
//       GROUP BY d.id_dusun
//       ORDER BY timbulan_per_kk DESC
//     `);
//     return rows;
// }

async function getTimbulanPerKapita() {
    
  const [rows] = await db.query(`
    SELECT
      d.nama_dusun,
      d.jumlah_kk,

      COALESCE(SUM(dt.volume_sampah),0) AS total_volume,

      ROUND(
        COALESCE(SUM(dt.volume_sampah),0) 
        / NULLIF(d.jumlah_kk,0) 
        / 7,
        2
      ) AS timbulan_kg_per_kk_per_hari

    FROM dusun d

    LEFT JOIN tps t 
      ON d.id_dusun = t.id_dusun

    LEFT JOIN daftar_tugas dt
      ON t.id_tps = dt.id_tps
      AND dt.status_angkut='selesai'
      AND dt.tgl_pengambilan >= CURDATE() - INTERVAL 7 DAY

    GROUP BY d.id_dusun

    ORDER BY timbulan_kg_per_kk_per_hari DESC
  `)

  return rows
}

module.exports = {
    getTotalTPS,
    getTotalPetugas,
    getTotalLaporanBulanIni,
    getTotalTPSPenuh,
    getStatusTPS,
    getLaporan7Hari,
    getTotalTugas,
    getPendingTugas,
    getDoneTugas,
    getProgressTugas,
    getTotalTPSHampirPenuh,
    getVolumeSampah,
    getRankingTPS,
    getTimbulanPerKapita,
}