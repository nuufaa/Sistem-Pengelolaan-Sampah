const {db} = require("../config/db");

async function create(data) {
    const [rows] = await db.query(
      `SELECT id_daftar_tugas FROM daftar_tugas
      WHERE id_jadwal = ?
      AND tgl_pengambilan = CURDATE()`,
      [data.id_jadwal]
    );

  if (rows.length === 0) {
    await db.query(
      `INSERT IGNORE INTO daftar_tugas
      (id_jadwal, id_petugas, id_tps, tgl_pengambilan)
      VALUES (?, ?, ?, CURDATE())`,
      [
        data.id_jadwal,
        data.id_petugas,
        data.id_tps
      ]
    );
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

   await db.query(
    `UPDATE daftar_tugas
     SET id_kendaraan = ?
     WHERE id_tps IN (?)`,
    [id_kendaraan, tpsVisited]
  );
}

async function getByPetugas(id_petugas) {
  const [rows] = await db.query(
    `SELECT dt.id_daftar_tugas AS id,
            dt.id_jadwal,
            dt.id_tps,
            dt.id_petugas,
            dt.tgl_pengambilan,
            dt.id_kendaraan,
            k.nomor_kendaraan,
            dt.status_angkut,
            dt.volume_sampah,
            p.nama,
            t.nama_tps,
            GROUP_CONCAT(DISTINCT j.hari_pengambilan ORDER BY j.hari_pengambilan) AS hari_pengambilan,
            MAX(j.tgl_terakhir_diambil) AS tgl_terakhir_diambil
     FROM daftar_tugas dt
     LEFT JOIN tps t ON dt.id_tps = t.id_tps
     LEFT JOIN kendaraan k ON dt.id_kendaraan = k.id_kendaraan
     LEFT JOIN jadwal_pengambilan j ON dt.id_jadwal = j.id_jadwal
     LEFT JOIN jadwal_pengambilan j2 ON j.id_tps = j2.id_tps AND j.id_petugas = j2.id_petugas
     LEFT JOIN petugas p ON dt.id_petugas = p.id_petugas
     WHERE dt.id_petugas = ?
     GROUP BY dt.id_daftar_tugas, dt.id_jadwal, dt.id_tps, dt.id_petugas, dt.tgl_pengambilan, dt.id_kendaraan, dt.status_angkut, dt.volume_sampah, t.nama_tps
     ORDER BY dt.tgl_pengambilan DESC`,
    [id_petugas]
  );
  return rows;
}

async function getAll() {
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
            GROUP_CONCAT(DISTINCT j2.hari_pengambilan ORDER BY j2.hari_pengambilan SEPARATOR ',') AS hari_pengambilan,
            MAX(j.tgl_terakhir_diambil) AS tgl_terakhir_diambil
     FROM daftar_tugas dt
     LEFT JOIN tps t ON dt.id_tps = t.id_tps
     LEFT JOIN jadwal_pengambilan j ON dt.id_jadwal = j.id_jadwal
     LEFT JOIN jadwal_pengambilan j2 ON j.id_tps = j2.id_tps AND j.id_petugas = j2.id_petugas
     GROUP BY dt.id_daftar_tugas, dt.id_jadwal, dt.id_tps, dt.id_petugas, dt.tgl_pengambilan, dt.id_kendaraan, dt.status_angkut, dt.volume_sampah, t.nama_tps
     ORDER BY dt.tgl_pengambilan DESC`
  );
  return rows;
}

module.exports = {
  create,
  updateStatus,
  findById,
  getByPetugas,
  getAll,
  addLogbook
};
