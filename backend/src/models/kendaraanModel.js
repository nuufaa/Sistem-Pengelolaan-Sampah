const {db} = require("../config/db");

async function create(data) {
    const {
        nomor_kendaraan, 
        nomor_polisi, 
        kapasitas_angkut, 
        status_kendaraan,
        id_admin
    } = data;

    const [result] = await db.query(
        `INSERT INTO kendaraan
        (nomor_kendaraan, nomor_polisi, kapasitas_angkut, status_kendaraan, id_admin)
        VALUES (?, ?, ?, ?, ?)`,
        [nomor_kendaraan, nomor_polisi, kapasitas_angkut, status_kendaraan, id_admin]
    );
    return result.insertId;
}

async function findById(id_kendaran) {
    const [rows] = await db.query(
        "SELECT * FROM kendaraan WHERE id_kendaraan =?", [id_kendaraan]
    );
    return rows[0];
}


async function findAll() {
    const [rows] = await db.query(
        "SELECT * FROM kendaraan ORDER BY id_kendaraan ASC"
    );
    return rows;
}

async function update(id, data) {
    const {
        nomor_kendaraan,
        nomor_polisi,
        kapasitas_angkut,
        status_kendaraan
    } = data;

    await db.query(
        `UPDATE tps SET nomor_kendaraan = ?, nomor_polisi = ?, kapasitas_angkut = ?, status_kendaraan = ?,
        WHERE id_kendaraan = ?`,
        [nomor_kendaraan, nomor_polisi, kapasitas_angkut, status_kendaraan, id]
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
        "DELETE FROM kendaraan WHERE id_kendaraan = ?",
        [id]
    );
}

module.exports = {
    create,
    findById,
    findAll,
    update,
    remove
}
