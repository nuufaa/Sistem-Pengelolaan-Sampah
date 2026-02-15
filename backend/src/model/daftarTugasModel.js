const db = require("../config/db");

async function create(data) {
  await db.query(
    `INSERT INTO daftar_tugas
     (id_jadwal, id_petugas, id_tps, tgl_pengambilan)
     VALUES (?, ?, ?, CURDATE())`,
    [
      data.id_jadwal,
      data.id_petugas,
      data.id_tps
    ]
  );
}

async function updateStatus(id, data) {
  await db.query(
    `UPDATE daftar_tugas
     SET status_angkut = ?, volume_sampah = ?
     WHERE id_daftar_tugas = ?`,
    [
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

module.exports = {
  create,
  updateStatus,
  findById
};
