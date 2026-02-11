const db = require("../config/db");

async function create(data) {
    const {
        nama_dusun,
        jumlah_kk
    } = data;

    const [result] = await db.query(
        `INSERT INTO dusun (nama_dusun, jumlah)
        VALUES (?, ?)`,
        [nama_dusun, jumlah_kk] 
    );
    return result.insertId;
}

async function findById(id_dusun) {
    const [rows] = await db.query(
        "SELECT * FROM dusun WHERE id_dusun =?", [id_dusun]
    );
    return rows[0];
}

async function findAll() {
    const [rows] = await db.query(
        "SELECT * FROM dusun ORDER BY id_dusun DESC"
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
        `UPDATE dusun SET
        nama_dusun = ?,
        jumlah_kk = ?`,
        [nama_dusun, jumlah_kk, id]
    );
}

async function remove(id_dusun) {
    await db.query(
        "DELETE FROM dusun WHERE id_dusun = ?",
        [id_dusun]
    );
}

module.exports = {
    create,
    findAll,
    findById,
    update,
    remove
}
