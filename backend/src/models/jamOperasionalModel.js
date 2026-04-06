const {db} = require("../config/db");

async function create(data) {
    const {
        jam_buang_mulai,
        jam_buang_selesai,
        jam_ambil_mulai,
        jam_ambil_selesai
    } = data;

    const [result] = await db.query(
        `INSERT INTO jam_operasional (jam_buang_mulai, jam_buang_selesai, jam_ambil_mulai, jam_ambil_selesai)
        VALUES (?, ?, ?, ?)`,
        [jam_buang_mulai, jam_buang_selesai, jam_ambil_mulai, jam_ambil_selesai] 
    );
    return result.insertId;
}

async function findAll() {
    const [rows] = await db.query(
        "SELECT * FROM jam_operasional ORDER BY id_operasional DESC"
    );
    return rows;
}

async function update(id, data) {

    const {
        jam_buang_mulai,
        jam_buang_selesai,
        jam_ambil_mulai,
        jam_ambil_selesai
    } = data;

    await db.query(
        `UPDATE jam_operasional SET
        jam_buang_mulai = ?,
        jam_buang_selesai = ?,
        jam_ambil_mulai = ?,
        jam_ambil_selesai = ?
        WHERE id_operasional = ?`,
        [jam_buang_mulai, jam_buang_selesai, jam_ambil_mulai, jam_ambil_selesai, id]
    );
}

async function remove(id_operasional) {
    await db.query(
        "DELETE FROM jam_operasional WHERE id_operasional = ?",
        [id_operasional]
    );
}

module.exports = {
    create,
    findAll,
    update,
    remove
}
