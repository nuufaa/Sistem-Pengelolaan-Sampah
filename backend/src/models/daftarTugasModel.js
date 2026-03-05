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
  await db.query(
    `UPDATE daftar_tugas
     SET id_kendaraan = ?, status_angkut = ?, volume_sampah = ?
     WHERE id_daftar_tugas = ?`,
    [
      data.id_kendaraan || null,
      data.status_angkut,
      data.volume_sampah,
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

async function getByPetugas(id_petugas) {
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
            j.hari_pengambilan,
            j.tgl_terakhir_diambil
     FROM daftar_tugas dt
     LEFT JOIN tps t ON dt.id_tps = t.id_tps
     LEFT JOIN jadwal_pengambilan j ON dt.id_jadwal = j.id_jadwal
     WHERE dt.id_petugas = ?
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
            j.hari_pengambilan,
            j.tgl_terakhir_diambil
     FROM daftar_tugas dt
     LEFT JOIN tps t ON dt.id_tps = t.id_tps
     LEFT JOIN jadwal_pengambilan j ON dt.id_jadwal = j.id_jadwal
     ORDER BY dt.tgl_pengambilan DESC`
  );
  return rows;
}

module.exports = {
  create,
  updateStatus,
  findById,
  getByPetugas,
  getAll
};
