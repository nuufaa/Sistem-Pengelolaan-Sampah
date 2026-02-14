const {db} = require("../config/db");

    async function addLaporan(data) {
        const {
            id_tps, 
            nama_pelapor, 
            foto_tps, 
            deskripsi, 
            kondisi_tps
        } = data;

        const [result] = await db.query(
            `INSERT INTO lapor
            (id_tps, nama_pelapor, foto_tps, deskripsi, kondisi_tps)
            VALUES (?, ?, ?, ?, ?)`,
            [id_tps, nama_pelapor, foto_tps, deskripsi, kondisi_tps]
        );
        return result.insertId;
    }

async function findAll() {
    const [rows] = await db.query(
        'SELECT * FROM lapor ORDER BY tgl_lapor DESC'
    );
    return result.rows;
}

async function findById(id_laporan) {
    const [rows] = await db.query(
        'SELECT * FROM lapor WHERE id_laporan = ?', [id_laporan]
    );
    return rows[0]
}


module.exports = { 
    addLaporan,
    findAll,
    findById
}