const {db} = require("../config/db");

async function create(data) {
  const {
    id_tps,
    hari_pengambilan,
    tgl_terakhir_diambil,
    id_petugas,
    id_admin,
  } = data;

  const [result] = await db.query(
    `INSERT INTO jadwal_pengambilan
     (id_tps, hari_pengambilan, tgl_terakhir_diambil, id_petugas, id_admin)
     VALUES (?, ?, ?, ?, ?)`,
    [id_tps, hari_pengambilan, tgl_terakhir_diambil, id_petugas, id_admin]
  );

  return result.insertId;
}

async function findAll() {
  const [rows] = await db.query(`
    SELECT jp.*, 
           p.nama_petugas,
           t.nama_tps
    FROM jadwal_pengambilan jp
    JOIN petugas p ON jp.id_petugas = p.id_petugas
    JOIN tps t ON jp.id_tps = t.id_tps
    ORDER BY jp.id_jadwal DESC
  `);

  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT * FROM jadwal_pengambilan WHERE id_jadwal = ?",
    [id]
  );

  return rows[0];
}

async function findByHari(hariIndex) {
  const [rows] = await db.query(
    `SELECT * FROM jadwal_pengambilan
     WHERE hari_pengambilan = ?`,
    [hariIndex]
  );

  return rows;
}

async function update(id, data) {
  const {
    id_petugas,
    id_tps,
    hari_pengambilan
  } = data;

  await db.query(
    `UPDATE jadwal_pengambilan
     SET id_petugas = ?, id_tps = ?, hari_pengambilan = ?
     WHERE id_jadwal = ?`,
    [id_petugas, id_tps, hari_pengambilan, id]
  );
}

async function updateTanggalTerakhir(id_jadwal) {
  await db.query(
    `UPDATE jadwal_pengambilan
     SET tgl_terakhir_diambil = CURDATE()
     WHERE id_jadwal = ?`,
    [id_jadwal]
  );
}

async function remove(id) {
  await db.query(
    "DELETE FROM jadwal_pengambilan WHERE id_jadwal = ?",
    [id]
  );
}

module.exports = {
  create,
  findAll,
  findById,
  findByHari,
  update,
  updateTanggalTerakhir,
  remove
};
