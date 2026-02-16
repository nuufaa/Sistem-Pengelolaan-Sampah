const {db} = require("../config/db");

async function create(data) {
    const {
        nama_tps,
        alamat,
        id_dusun,
        latitude,
        longitude,
        kapasitas,
        status_tps,
        foto_tps
    } = data;

    const [result] = await db.query(
        `INSERT INTO tps
        (nama_tps, alamat, id_dusun, latitude, longitude, kapasitas, status_tps, foto_tps)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nama_tps, alamat, id_dusun, latitude, longitude, kapasitas, status_tps, foto_tps]
    );
    return result.insertId;
}

async function findById(id_tps) {
    const [rows] = await db.query(
        "SELECT * FROM tps WHERE id_tps =?", [id_tps]
    );
    return rows[0];
}


async function findAll() {
    const [rows] = await db.query(
        "SELECT * FROM tps ORDER BY id_tps DESC"
    );
    return rows;
}

async function update(id, data) {
    const {
        nama_tps,
        alamat,
        id_dusun,
        latitude,
        longitude,
        kapasitas,
        status_tps,
        foto_tps
    } = data;

    await db.query(
        `UPDATE tps SET
        nama_tps = ?,
        alamat = ?,
        id_dusun = ?,
        latitude = ?,
        longitude = ?,
        kapasitas = ?,
        status_tps = ?,
        foto_tps = ?
        WHERE id_tps = ?`,
        [nama_tps, alamat, id_dusun, latitude, longitude, kapasitas, status_tps, foto_tps, id]
    );
}

// async function findAll(status) {
//   let query = "SELECT * FROM tps";
//   const params = [];

//   if (status) {
//     query += " WHERE status_tps = ?";
//     params.push(status);
//   }

//   query += " ORDER BY id_tps DESC";

//   const [rows] = await db.query(query, params);
//   return rows;
// }

async function remove(id) {
    await db.query(
        "DELETE FROM tps WHERE id_tps = ?",
        [id]
    );
}

async function findForMap() {
  const [rows] = await db.query(
    "SELECT id_tps, nama_tps, latitude, longitude, status_tps FROM tps"
  );
  return rows;
}

async function getStatistics() {
  const [rows] = await db.query(`
    SELECT status_tps, COUNT(*) as total
    FROM tps
    GROUP BY status_tps
  `);

  return rows;
}

module.exports = {
    create,
    findAll,
    findById,
    update,
    remove,
    findForMap,
    getStatistics
}