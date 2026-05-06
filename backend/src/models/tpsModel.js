const { db } = require("../config/db");
const { toString } = require('../utils/hariJadwal');

async function create(data) {
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

    const [result] = await db.query(
        `INSERT INTO tps
        (nama_tps, alamat, id_dusun, latitude, longitude, kapasitas, status_tps, foto_tps)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nama_tps, alamat, id_dusun, latitude, longitude, kapasitas, status_tps, foto_tps]
    );
    return result.insertId;
}

async function findById(id_tps) {
    const [rows] = await db.query(
        "SELECT * FROM tps WHERE id_tps =?", [id_tps]
    );
    return rows[0];
}


async function findAll() {
    const [rows] = await db.query(
        `SELECT 
            t.id_tps, t.nama_tps, t.id_dusun, t.alamat, dusun.nama_dusun, 
            t.latitude, t.longitude, t.kapasitas, t.foto_tps,
            CASE 
                WHEN t.kapasitas > 0 AND ROUND(COALESCE(dt_today.volume_sampah, 0) / t.kapasitas * 100, 1) >= 80 THEN 'penuh'
                WHEN t.kapasitas > 0 AND ROUND(COALESCE(dt_today.volume_sampah, 0) / t.kapasitas * 100, 1) >= 50 THEN 'hampir_penuh'
                ELSE 'normal'
            END AS status_tps
        FROM tps t
        JOIN dusun ON t.id_dusun = dusun.id_dusun 
        LEFT JOIN (
            SELECT id_tps, MAX(volume_sampah) as volume_sampah
            FROM daftar_tugas
            WHERE DATE(tgl_terakhir_diambil) = CURDATE() 
               OR (tgl_pengambilan = CURDATE() AND status_angkut != 'selesai')
            GROUP BY id_tps
        ) dt_today ON t.id_tps = dt_today.id_tps
        ORDER BY t.id_tps DESC`
    );
    return rows;
}

async function findAllJadwal() {
    const [rows] = await db.query(
        `SELECT
            t.id_tps,
            t.nama_tps,
            t.alamat,
            t.latitude,
            t.longitude,
            t.kapasitas,
            COALESCE(dt_today.volume_sampah, 0) AS volume_sampah,
            jadwal.hari_pengambilan,
            jadwal.tgl_terakhir_diambil,
            ROUND(COALESCE(dt_today.volume_sampah, 0) / t.kapasitas * 100, 1) AS persentase_sampah,
            CASE 
                WHEN ROUND(COALESCE(dt_today.volume_sampah, 0) / t.kapasitas * 100, 1) >= 80 THEN 'penuh'
                WHEN ROUND(COALESCE(dt_today.volume_sampah, 0) / t.kapasitas * 100, 1) >= 50 THEN 'hampir_penuh'
                ELSE 'normal'
            END AS status_tps,
            COALESCE(dt_today.status_angkut, 'belum_diangkut') AS status_angkut

        FROM tps t
        
        LEFT JOIN (
            SELECT 
                id_tps,
                GROUP_CONCAT(hari_pengambilan SEPARATOR ', ') AS hari_pengambilan,
                MAX(tgl_terakhir_diambil) AS tgl_terakhir_diambil
            FROM jadwal_pengambilan
            WHERE is_active = 1
            GROUP BY id_tps
        ) jadwal ON t.id_tps = jadwal.id_tps

        LEFT JOIN (
            SELECT id_tps, MAX(volume_sampah) as volume_sampah, MAX(status_angkut) as status_angkut
            FROM daftar_tugas
            WHERE DATE(tgl_terakhir_diambil) = CURDATE() 
               OR (tgl_pengambilan = CURDATE() AND status_angkut != 'selesai')
            GROUP BY id_tps
        ) dt_today ON t.id_tps = dt_today.id_tps

        ORDER BY t.id_tps DESC
    `);

    rows.forEach(row => {
        if (row.hari_pengambilan) {
            row.hari_pengambilan = row.hari_pengambilan
                .split(',')
                .map(h => toString(parseInt(h.trim())))
                .join(', ');
        }
    });

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
        `UPDATE tps SET
        nama_tps = ?,
        alamat = ?,
        id_dusun = ?,
        latitude = ?,
        longitude = ?,
        kapasitas = ?,
        status_tps = ?,
        foto_tps = ?
        WHERE id_tps = ?`,
        [nama_tps, alamat, id_dusun, latitude, longitude, kapasitas, status_tps, foto_tps, id]
    );
}

async function findStatusTPS(statusList = []) {
    let query = `
        SELECT t.id_tps, t.nama_tps, t.id_dusun, t.alamat, dusun.nama_dusun,
        t.latitude, t.longitude, t.kapasitas, t.foto_tps,
        CASE 
            WHEN t.kapasitas > 0 AND ROUND(COALESCE(dt_today.vol, 0) / t.kapasitas * 100, 1) >= 80 THEN 'penuh'
            WHEN t.kapasitas > 0 AND ROUND(COALESCE(dt_today.vol, 0) / t.kapasitas * 100, 1) >= 50 THEN 'hampir_penuh'
            ELSE 'normal'
        END AS status_tps
        FROM tps t
        JOIN dusun ON t.id_dusun = dusun.id_dusun
        LEFT JOIN (
            SELECT id_tps, MAX(volume_sampah) AS vol
            FROM daftar_tugas
            WHERE DATE(tgl_terakhir_diambil) = CURDATE()
               OR (tgl_pengambilan = CURDATE() AND status_angkut != 'selesai')
            GROUP BY id_tps
        ) dt_today ON t.id_tps = dt_today.id_tps
    `;

    const params = [];

    if (statusList.length > 0) {
        const placeholders = statusList.map(() => '?').join(',');
        query += ` HAVING status_tps IN (${placeholders})`;
        params.push(...statusList);
    }

    query += ` ORDER BY t.id_tps DESC`;

    const [rows] = await db.query(query, params);
    return rows;
}

async function updateStatusTPS(id_tps, status_tps) {
    await db.query(
        `UPDATE tps SET status_tps = ? WHERE id_tps = ?`,
        [status_tps, id_tps]
    );
}

async function remove(id) {
    await db.query(
        "DELETE FROM tps WHERE id_tps = ?",
        [id]
    );
}

async function findForMap() {
    const [rows] = await db.query(
        `SELECT t.id_tps, t.nama_tps, t.latitude, t.longitude,
        CASE 
            WHEN t.kapasitas > 0 AND ROUND(COALESCE(dt_today.vol, 0) / t.kapasitas * 100, 1) >= 80 THEN 'penuh'
            WHEN t.kapasitas > 0 AND ROUND(COALESCE(dt_today.vol, 0) / t.kapasitas * 100, 1) >= 50 THEN 'hampir_penuh'
            ELSE 'normal'
        END AS status_tps
        FROM tps t
        LEFT JOIN (
            SELECT id_tps, MAX(volume_sampah) AS vol
            FROM daftar_tugas
            WHERE DATE(tgl_terakhir_diambil) = CURDATE()
               OR (tgl_pengambilan = CURDATE() AND status_angkut != 'selesai')
            GROUP BY id_tps
        ) dt_today ON t.id_tps = dt_today.id_tps`
    );
    return rows;
}

async function getStatistics() {
    const [rows] = await db.query(`
    SELECT status_tps, COUNT(*) as total
    FROM tps
    GROUP BY status_tps
  `);

    return rows;
}

async function updateStatusTPS(id_tps, status_tps) {
    await db.query(
        `UPDATE tps SET status_tps = ? WHERE id_tps = ?`,
        [status_tps, id_tps]
    );
}

module.exports = {
    create,
    findAll,
    findAllJadwal,
    findById,
    update,
    updateStatusTPS,
    remove,
    findForMap,
    getStatistics,
    findStatusTPS
}