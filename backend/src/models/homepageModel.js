const {db} = require("../config/db")

async function getDashboardStats () {
    
  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS totalTPS,
      SUM(CASE WHEN t.kapasitas > 0 AND ROUND(COALESCE(dt_today.vol, 0) / t.kapasitas * 100, 1) >= 80 THEN 1 ELSE 0 END) AS totalTPSPenuh,
      SUM(CASE WHEN t.kapasitas > 0 AND ROUND(COALESCE(dt_today.vol, 0) / t.kapasitas * 100, 1) >= 50 AND ROUND(COALESCE(dt_today.vol, 0) / t.kapasitas * 100, 1) < 80 THEN 1 ELSE 0 END) AS totalTPSHampirPenuh,
      SUM(CASE WHEN t.kapasitas = 0 OR ROUND(COALESCE(dt_today.vol, 0) / t.kapasitas * 100, 1) < 50 THEN 1 ELSE 0 END) AS totalTPSNormal
    FROM tps t
    LEFT JOIN (
      SELECT id_tps, MAX(volume_sampah) AS vol
      FROM daftar_tugas
      WHERE DATE(tgl_terakhir_diambil) = CURDATE()
          OR (tgl_pengambilan = CURDATE() AND status_angkut != 'selesai')
      GROUP BY id_tps
    ) dt_today ON t.id_tps = dt_today.id_tps
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
    
async function getRankingTPS() {
    
  const [rows] = await db.query(`
    SELECT
      t.id_tps,
      t.nama_tps,
      CASE 
        WHEN ROUND(COALESCE(dt_today.volume_sampah, 0) / t.kapasitas * 100, 1) >= 80 THEN 'penuh'
        WHEN ROUND(COALESCE(dt_today.volume_sampah, 0) / t.kapasitas * 100, 1) >= 50 THEN 'hampir_penuh'
        ELSE 'normal'
      END AS status_tps,
      COUNT(dt.id_daftar_tugas) AS jumlah_pengambilan,
      COALESCE(SUM(dt.volume_sampah), 0) AS total_volume,
      d.nama_dusun
    FROM tps t
    LEFT JOIN daftar_tugas dt ON t.id_tps = dt.id_tps AND dt.status_angkut = 'selesai'
    LEFT JOIN (
      SELECT id_tps, MAX(volume_sampah) as volume_sampah
      FROM daftar_tugas
      WHERE DATE(tgl_terakhir_diambil) = CURDATE() 
          OR (tgl_pengambilan = CURDATE() AND status_angkut != 'selesai')
      GROUP BY id_tps
    ) dt_today ON t.id_tps = dt_today.id_tps
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
  getRankingTPS,
  getTimbulanPerKapita
};