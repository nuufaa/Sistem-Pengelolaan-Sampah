const {db} = require("../config/db");

// async function getPetugas(){
//     const [rows] = await db.query(
//         'SELECT id'
//     )
// }

async function create({username, password, nama, noTelp, statusPetugas}) {
    const [result] = await db.query(
        'INSERT INTO petugas (username, password, nama, noTelp, statusPetugas) VALUES (?, ?, ?, ?, ?)',
        [username, password, nama, noTelp, statusPetugas]
    )
    return result.insertId
    
}

async function findById(id_petugas) {
    const [rows] = await db.query(
        'SELECT * FROM petugas WHERE id_petugas = ?',
        [id_petugas]
    )
    return rows[0] || null
}

async function findAll() {
    const [rows] = await db.query(
        "SELECT * FROM petugas ORDER BY id_petugas ASC"
    );
    return rows;
}

async function update(id_petugas) {
    const [result] = await db.query(
        'UPDATE petugas SET username=?, password=?, nama=?, noTelp, statusPetugas',
        [username, pasword, nama, noTelp, statusPetugas, id_petugas]
    )
    return result.affectedRows > 0

}

module.exports = {
    create,
    findById,
    findAll,
    update
}
