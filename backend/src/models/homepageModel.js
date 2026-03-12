const {db} = require("../config/db")

async function getDashboardStats () {
    
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS totalTPS,
        SUM(status_tps = 'penuh') AS totalTPSPenuh,
        SUM(status_tps = 'hampir_penuh') AS totalTPSHampirPenuh,
        SUM(status_tps = 'normal') AS totalTPSNormal
      FROM tps
    `);
    return rows[0];
}

async function getVolumeSampah() {
    
    const [rows] = await db.query(`
        SELECT
            t.nama_tps,
            COALESCE(SUM(dt.volume_sampah), 0) AS total_volume,
            t.kapasitas,
            ROUND(COALESCE(SUM(dt.volume_sampah), 0) / t.kapasitas * 100, 1) AS persentase
        FROM tps t
        LEFT JOIN daftar_tugas dt ON t.id_tps = dt.id_tps AND dt.status_angkut = 'selesai'
        GROUP BY t.id_tps
        ORDER BY total_volume DESC
        `);
    return rows;
}

// async function getTrenBulanan() {
    
//     const [rows] = await db.query(`
//         SELECT
//           DATE_FORMAT(tgl_pengambilan, '%Y-%m') AS bulan,
//           DATE_FORMAT(tgl_pengambilan, '%b %Y') AS label_bulan,
//           COALESCE(SUM(volume_sampah), 0) AS total_volume,
//           COUNT(*) AS jumlah_pengambilan
//         FROM daftar_tugas
//         WHERE tgl_pengambilan >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
//           AND status_angkut = 'selesai'
//         GROUP BY DATE_FORMAT(tgl_pengambilan, '%Y-%m')
//         ORDER BY bulan ASC
//       `);
//     return rows;
// }
    
async function getRankingTPS() {
    
    const [rows] = await db.query(`
      SELECT
        t.id_tps,
        t.nama_tps,
        t.status_tps,
        COUNT(dt.id_daftar_tugas) AS jumlah_pengambilan,
        COALESCE(SUM(dt.volume_sampah), 0) AS total_volume,
        d.nama_dusun
      FROM tps t
      LEFT JOIN daftar_tugas dt ON t.id_tps = dt.id_tps AND dt.status_angkut = 'selesai'
      LEFT JOIN dusun d ON t.id_dusun = d.id_dusun
      GROUP BY t.id_tps
      ORDER BY total_volume DESC
    `);
    return rows;
}

async function getTimbulanPerKapita() {
    
    const [rows] = await db.query(`
      SELECT
        d.nama_dusun,
        d.jumlah_kk,
        COALESCE(SUM(dt.volume_sampah), 0) AS total_volume,
        ROUND(
          COALESCE(SUM(dt.volume_sampah), 0) / NULLIF(d.jumlah_kk, 0),
          2
        ) AS timbulan_per_kk
      FROM dusun d
      LEFT JOIN tps t ON d.id_dusun = t.id_dusun
      LEFT JOIN daftar_tugas dt ON t.id_tps = dt.id_tps AND dt.status_angkut = 'selesai'
      GROUP BY d.id_dusun
      ORDER BY timbulan_per_kk DESC
    `);
    return rows;
}

module.exports = {
  getDashboardStats,
  getVolumeSampah,
  getTrenBulanan,
  getRankingTPS,
  getTimbulanPerKapita,
};