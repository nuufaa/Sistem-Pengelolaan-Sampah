const db = require("../config/db");

async function addLaporan(id_tps, nama_pelapor, foto_laporan, deskripsi, kondisi_tps) {
    const [result] = await db.query(
        `INSERT INTO laporan 
        (id_tps, nama_pelapor, foto_laporan, deskripsi, kondisi_tps)
        VALUES (?, ?, ?, ?, ?)`,
        [id_tps, nama_pelapor, foto_laporan, deskripsi, kondisi_tps]
    )
    return result.insertId;
}

async function findAll() {
    const [rows] = await db.query(
        'SELECT * FROM laporan ORDER BY tgl_lapor DESC'
    )
    return result.rows;
}

async function findById(id_laporan) {
    const [rows] = await db.query(
        'SELECT * FROM laporan WHERE id_laporan = ?', [id_laporan]
    )
    return rows[0]
}


module.exports = { 
    addLaporan,
    findAll,
    findById
}