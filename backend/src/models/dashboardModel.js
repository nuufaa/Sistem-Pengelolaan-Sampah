const {db} = require("../config/db")

async function getTotalTPS() {
    const [rows] = await db.query(
        "SELECT COUNT(*) as total FROM tps"
    );
    return rows[0].total;
}

async function getTotalPetugas() {
    const [rows] = await db.query(
        "SELECT COUNT(*) as total FROM petugas"
    );
    return rows[0].total;
}

async function getTotalLaporanBulanIni() {
    const [rows] = await db.query(`
        SELECT COUNT(*) as total
        FROM lapor
        WHERE MONTH(tgl_laporan) = MONTH(CURRENT_DATE())
        AND YEAR(tgl_laporan) = YEAR(CURRENT_DATE())
        `)
    return rows[0].total
}

async function getTotalTPSPenuh() {
    const [rows] = await db.query(`
        SELECT COUNT(*) as total
        FROM tps
        WHERE status_tps = 'penuh'
        `)
    return rows[0].total;
}

async function getStatusTPS() {
    const [rows] = await db.query(`
        SELECT status_tps, COUNT(*) as total
        FROM tps
        GROUP BY status_tps
        `)
    return rows
}

async function getLaporan7Hari() {
    const [rows] = await db.query(`
        SELECT DATE(tgl_laporan) as tanggal, COUNT(*) as total
        FROM lapor
        WHERE tgl_laporan >= CURDATE() - INTERVAL 6 DAY
        GROUP BY DATE(tgl_laporan)
        ORDER BY tanggal ASC
        `)
    return rows
}

// async function getInfoPetugas(id_petugas) {
//     const [rows] = await db.query(
//         `SELECT p.nama`
//     )
// }

async function getTotalTugas(id_petugas) {
    const [rows] = await db.query(`
        SELECT COUNT(*  ) as total
        FROM daftar_tugas
        WHERE id_petugas = ?`,
        [id_petugas]
    );
    return rows[0].total;
}

async function getPendingTugas(id_petugas) {
    const [rows] = await db.query(
        `SELECT COUNT(*) as total
        FROM daftar_tugas
        WHERE id_petugas = ?
        AND status_angkut = 'belum_diangkut'`,
        [id_petugas]
    );
    return rows[0].total;
}

async function getDoneTugas(id_petugas) {
    const [rows] = await db.query(
        `SELECT COUNT(*) as total
        FROM daftar_tugas
        WHERE id_petugas = ?
        AND status_angkut = 'selesai'`,
        [id_petugas]
    );
    return rows[0].total;
}

async function getProgressTugas(id_petugas) {
    const [rows] = await db.query(
        `SELECT COUNT(*) as total
        FROM daftar_tugas
        WHERE id_petugas = ?
        AND status_angkut = 'diangkut'`,
        [id_petugas]
    );
    return rows[0].total
}

module.exports = {
    getTotalTPS,
    getTotalPetugas,
    getTotalLaporanBulanIni,
    getTotalTPSPenuh,
    getStatusTPS,
    getLaporan7Hari,
    getTotalTugas,
    getPendingTugas,
    getDoneTugas,
    getProgressTugas
}