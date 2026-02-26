const {db} = require("../config/db");

async function create({nama, no_telp, status_petugas}) {
    const [result] = await db.query(
        'INSERT INTO petugas (nama, no_telp, status_petugas) VALUES (?, ?, ?)',
        [nama, no_telp, status_petugas]
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

async function update({ id_petugas, nama, no_telp, status_petugas }) {
  return db.query(
    `UPDATE petugas
     SET nama = ?, no_telp = ?, status_petugas = ?
     WHERE id_petugas = ?`,
    [nama, no_telp, status_petugas, id_petugas]
  )
}


module.exports = {
    create,
    findById,
    findAll,
    update
}
