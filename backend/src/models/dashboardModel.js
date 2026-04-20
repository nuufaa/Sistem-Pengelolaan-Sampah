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
  return rows[0].total
}

async function getTotalTPSHampirPenuh() {
  const [rows] = await db.query(`
    SELECT COUNT(*) as total
      FROM tps
      WHERE status_tps = 'hampir_penuh'
  `)
  return rows[0].total
}

async function getStatusTPS() {
  const [rows] = await db.query(`
    SELECT status_tps, COUNT(*) AS total
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
    SELECT COUNT(*) as total
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
      AND status_angkut = 'belum_diangkut'
      AND YEARWEEK(tgl_pengambilan, 1) = YEARWEEK(CURDATE(), 1)`,
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

//dipakai untuk total tugas minggu ini
async function getProgressTugas(id_petugas) {
  const [rows] = await db.query(
    `SELECT COUNT(*) as total
      FROM daftar_tugas
      WHERE id_petugas = ?
      AND YEARWEEK(tgl_pengambilan, 1) = YEARWEEK(CURDATE(), 1)`,
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
      DATE(COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan)) AS tanggal,
      ROUND(COALESCE(SUM(dt.volume_sampah), 0) / t.kapasitas * 100, 1) AS persentase
    FROM tps t
    LEFT JOIN daftar_tugas dt 
      ON t.id_tps = dt.id_tps 
      AND dt.status_angkut = 'selesai'
      AND dt.tgl_terakhir_diambil >= CURDATE() - INTERVAL 6 DAY
          
      GROUP BY tanggal, t.id_tps
      ORDER BY tanggal ASC;
    `);
  return rows;
}

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
    HAVING COALESCE(SUM(dt.volume_sampah),0) > 0
    
    ORDER BY score ASC
    LIMIT 5
  `)

  return rows
}

async function getTimbulanPerKapita() {
    
  const [rows] = await db.query(`
    SELECT
      d.nama_dusun,
      d.jumlah_kk,

      COALESCE(SUM(dt.volume_sampah), 0) AS total_volume,

      CAST(ROUND(
        COALESCE(SUM(dt.volume_sampah), 0)
        / NULLIF(d.jumlah_kk, 0)
        / 7,
        2
      ) AS DOUBLE) AS timbulan_kg_per_kk_per_hari

    FROM dusun d

    LEFT JOIN tps t 
      ON d.id_dusun = t.id_dusun

    LEFT JOIN (
      SELECT id_tps, volume_sampah
      FROM daftar_tugas
      WHERE status_angkut = 'selesai'
          AND tgl_terakhir_diambil >= CURDATE() - INTERVAL 7 DAY
      ) dt
    ON t.id_tps = dt.id_tps

      GROUP BY d.id_dusun

      ORDER BY timbulan_kg_per_kk_per_hari DESC;
    `)

  return rows
}

// Kepatuhan Petugas - untuk admin dashboard
async function getKepatuhanAllPetugas() {
  const [rows] = await db.query(`
    SELECT
      p.id_petugas,
      p.nama,
      COUNT(CASE WHEN dt.status_angkut = 'selesai' THEN 1 END) AS total_selesai,
      COUNT(CASE 
        WHEN dt.status_angkut = 'selesai' 
        AND DATE(dt.tgl_terakhir_diambil) <= DATE(dt.tgl_pengambilan)
        THEN 1 
      END) AS tepat_waktu,
      COUNT(CASE 
        WHEN dt.status_angkut = 'selesai' 
        AND DATE(dt.tgl_terakhir_diambil) > DATE(dt.tgl_pengambilan)
        THEN 1 
      END) AS terlambat,
      ROUND(
        COUNT(CASE 
          WHEN dt.status_angkut = 'selesai' 
          AND DATE(dt.tgl_terakhir_diambil) <= DATE(dt.tgl_pengambilan)
          THEN 1 
        END) / NULLIF(COUNT(CASE WHEN dt.status_angkut = 'selesai' THEN 1 END), 0) * 100,
        1
      ) AS persentase_tepat_waktu
    FROM petugas p
    LEFT JOIN daftar_tugas dt ON p.id_petugas = dt.id_petugas
    GROUP BY p.id_petugas, p.nama
    ORDER BY persentase_tepat_waktu DESC, p.nama ASC
  `)
  return rows
}

// Detail kepatuhan untuk satu petugas - untuk dashboard petugas
async function getDetailKepatuhanPetugas(id_petugas) {
  const [rows] = await db.query(`
    SELECT
      dt.id_daftar_tugas,
      t.nama_tps,
      j.hari_pengambilan,
      dt.tgl_pengambilan,
      dt.tgl_terakhir_diambil,
      dt.status_angkut,
      CASE 
        WHEN dt.status_angkut = 'selesai' THEN
          CASE 
            WHEN DATE(dt.tgl_terakhir_diambil) <= DATE(dt.tgl_pengambilan) THEN 'Tepat Waktu'
            WHEN DATEDIFF(DATE(dt.tgl_terakhir_diambil), DATE(dt.tgl_pengambilan)) = 1 THEN 'Terlambat 1 Hari'
            ELSE CONCAT('Terlambat ', DATEDIFF(DATE(dt.tgl_terakhir_diambil), DATE(dt.tgl_pengambilan)), ' Hari')
          END
        ELSE 'Belum Selesai'
      END AS status_kepatuhan
    FROM daftar_tugas dt
    INNER JOIN tps t ON dt.id_tps = t.id_tps
    LEFT JOIN jadwal_pengambilan j ON dt.id_jadwal = j.id_jadwal
    WHERE dt.id_petugas = ?
    AND dt.status_angkut = 'selesai'
    ORDER BY dt.tgl_pengambilan DESC
    LIMIT 50
  `, [id_petugas])
  return rows
}

// Riwayat Logbook Kendaraan - untuk admin dashboard
async function getLogbookHistory(filter = {}) {
  const { start_date, end_date, id_petugas, id_kendaraan } = filter

  let query = `
    SELECT
      dt.id_daftar_tugas,
      DATE(COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan)) AS tanggal,
      k.id_kendaraan,
      k.nomor_kendaraan,
      k.nomor_polisi,
      p.id_petugas,
      p.nama AS nama_petugas,
      t.id_tps,
      t.nama_tps,
      dt.volume_sampah,
      dt.status_angkut
    FROM daftar_tugas dt
    LEFT JOIN kendaraan k ON dt.id_kendaraan = k.id_kendaraan
    LEFT JOIN petugas p ON dt.id_petugas = p.id_petugas
    LEFT JOIN tps t ON dt.id_tps = t.id_tps
    WHERE dt.status_angkut = 'selesai'
  `

  const params = []

  if (start_date) {
    query += ` AND DATE(COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan)) >= ?`
    params.push(start_date)
  }

  if (end_date) {
    query += ` AND DATE(COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan)) <= ?`
    params.push(end_date)
  }

  if (id_petugas) {
    query += ` AND dt.id_petugas = ?`
    params.push(id_petugas)
  }

  if (id_kendaraan) {
    query += ` AND dt.id_kendaraan = ?`
    params.push(id_kendaraan)
  }

  query += ` ORDER BY COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan) DESC, k.nomor_kendaraan ASC`

  const [rows] = await db.query(query, params)
  return rows
}

// Summary Logbook - Group by Kendaraan & Tanggal
async function getLogbookSummary(filter = {}) {
  const { start_date, end_date } = filter

  let query = `
    SELECT
      DATE(COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan)) AS tanggal,
      k.id_kendaraan,
      k.nomor_kendaraan,
      k.nomor_polisi,
      p.id_petugas,
      GROUP_CONCAT(DISTINCT p.nama SEPARATOR ', ') AS nama_petugas,
      COUNT(*) AS jumlah_tps,
      COALESCE(SUM(dt.volume_sampah), 0) AS total_volume_sampah
    FROM daftar_tugas dt
    LEFT JOIN kendaraan k ON dt.id_kendaraan = k.id_kendaraan
    LEFT JOIN petugas p ON dt.id_petugas = p.id_petugas
    WHERE dt.status_angkut = 'selesai'
  `

  const params = []

  if (start_date) {
    query += ` AND DATE(COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan)) >= ?`
    params.push(start_date)
  }

  if (end_date) {
    query += ` AND DATE(COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan)) <= ?`
    params.push(end_date)
  }

  query += `
    GROUP BY DATE(COALESCE(dt.tgl_terakhir_diambil, dt.tgl_pengambilan)), k.id_kendaraan, p.id_petugas
    ORDER BY tanggal DESC, nomor_kendaraan ASC
  `

  const [rows] = await db.query(query, params)
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
    getKepatuhanAllPetugas,
    getDetailKepatuhanPetugas,
    getLogbookHistory,
    getLogbookSummary
}