const db = require("../config/db");

// async function getPetugas(){
//     const [rows] = await db.query(
//         'SELECT id'
//     )
// }

async function findPetugas(username) {
    const [rows] = await db.query(
        'SELECT * FROM petugas WHERE username = ?',
        [username]
    )
    return rows[0] || null
    
}

async function addPetugas({username, password, nama, noTelp, statusPetugas}) {
    const [result] = await db.query(
        'INSERT INTO petugas (username, password, nama, noTelp, statusPetugas) VALUES (?, ?, ?, ?, ?)',
        [username, password, nama, noTelp, statusPetugas]
    )
    return result.insertId
    
}

async function updatePetugas(idPetugas) {
    const [result] = await db.query(
        'UPDATE petugas SET username=?, password=?, nama=?, noTelp, statusPetugas',
        [username, pasword, nama, noTelp, statusPetugas, idPetugas]
    )
    return result.affectedRows > 0

}

module.exports = {
    findPetugas,
    addPetugas,
    updatePetugas
}
