const {db} = require("../config/db");
const { toString } = require('../utils/hariJadwal');

async function create(data) {
  const {
    id_tps,
    hari_pengambilan,
    id_petugas,
    id_admin
  } = data;
  console.log("DATA MASUK MODEL:", data);

  const [result] = await db.query(
    `INSERT INTO jadwal_pengambilan
     (id_tps, hari_pengambilan, id_petugas, id_admin)
     VALUES (?, ?, ?, ?)`,
    [id_tps, hari_pengambilan, id_petugas, id_admin]
  );

  return result.insertId;
}

async function findAll() {
  const [rows] = await db.query(`
    SELECT 
      t.id_tps,
      t.nama_tps,
      p.nama,
      GROUP_CONCAT(j.hari_pengambilan SEPARATOR ', ') AS hari_pengambilan,
      MAX(j.tgl_terakhir_diambil) as tgl_terakhir_diambil
    FROM jadwal_pengambilan j
    JOIN tps t ON j.id_tps = t.id_tps
    JOIN petugas p ON j.id_petugas = p.id_petugas
    GROUP BY t.id_tps, p.nama;
  `);

  rows.forEach(row => {
    if (row.hari_pengambilan === null) {
      row.hari_pengambilan = null;
      return;
    }

    const hariArray = String(row.hari_pengambilan).split(',');

    row.hari_pengambilan = hariArray
      .map(h => toString(Number(h.trim())))
      .filter(Boolean)
      .join(', ');
  });

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
    SET 
      hari_pengambilan = ?,
      id_tps = COALESCE(?, id_tps),
      id_petugas = COALESCE(?, id_petugas),
      tgl_terakhir_diambil = COALESCE(?, tgl_terakhir_diambil)
    WHERE id_jadwal = ?`,
    [hari_pengambilan, id_tps, id_petugas, data.tgl_terakhir_diambil, id]
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
