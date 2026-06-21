const {db} = require("../config/db");
const bcrypt = require('bcrypt')

async function create({nama, no_telp, username, password, status_petugas, id_admin, role}) {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const [result] = await db.query(
        'INSERT INTO petugas (nama, no_telp, username, password, status_petugas, id_admin, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nama, no_telp, username, hashedPassword, status_petugas, id_admin, role || 'petugas']
    )
    return result.insertId
}

async function findById(id_petugas) {
    const [rows] = await db.query(
        'SELECT id_petugas, nama, username, password, role FROM petugas WHERE id_petugas = ?',
        [id_petugas]
    )
    return rows[0] || null
}

async function findAll() {
    const [rows] = await db.query(
        "SELECT id_petugas, nama, no_telp, username, password, status_petugas, role FROM petugas ORDER BY id_petugas ASC"
    );
    return rows;
}

async function findPetugas(username) {
    const [rows] = await db.query(
        'SELECT id_petugas, nama, username, password, role FROM petugas WHERE username = ?',
        [username]
    )
    return rows[0] || null
}

async function update({ id_petugas, nama, no_telp, username, password, status_petugas, role }) {
  return db.query(
    `UPDATE petugas
        SET nama = ?, 
        no_telp = ?, 
        username = ?, 
        password = COALESCE(?, password),
        status_petugas = ?,
        role = ?
    WHERE id_petugas = ?`,
    [nama, no_telp, username, password, status_petugas, role, id_petugas]
  )
}

async function remove(id) {
    await db.query(
        "DELETE FROM petugas WHERE id_petugas = ?",
        [id]
    );
}

module.exports = {
    create,
    findById,
    findAll,
    findPetugas,
    update,
    remove
}
