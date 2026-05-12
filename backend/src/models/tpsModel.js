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
        `SELECT id_tps, nama_tps, tps.id_dusun, alamat, dusun.nama_dusun, latitude, longitude, kapasitas, status_tps, foto_tps
        FROM tps JOIN dusun ON tps.id_dusun = dusun.id_dusun ORDER BY id_tps DESC`
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
            t.status_tps,
            t.kapasitas,
            COALESCE(dt_today.volume_sampah, 0) AS volume_sampah,
            jadwal.hari_pengambilan,
            jadwal.tgl_terakhir_diambil,
            -- Hitung status dinamis: jika lebih dari 24 jam sejak pengambilan terakhir, status = 'normal'
            CASE 
                WHEN dt_last.tgl_terakhir_diambil IS NULL THEN 'normal'
                WHEN TIMESTAMPDIFF(HOUR, dt_last.tgl_terakhir_diambil, NOW()) > 24 THEN 'normal'
                ELSE t.status_tps
            END AS status_tps_dinamis,
            -- Hitung volume dinamis: jika lebih dari 24 jam, volume = 0
            CASE 
                WHEN dt_last.tgl_terakhir_diambil IS NULL THEN 0
                WHEN TIMESTAMPDIFF(HOUR, dt_last.tgl_terakhir_diambil, NOW()) > 24 THEN 0
                ELSE COALESCE(dt_today.volume_sampah, 0)
            END AS volume_sampah_dinamis,
            -- Hitung persentase berdasarkan volume dinamis
            ROUND(
                CASE 
                    WHEN dt_last.tgl_terakhir_diambil IS NULL THEN 0
                    WHEN TIMESTAMPDIFF(HOUR, dt_last.tgl_terakhir_diambil, NOW()) > 24 THEN 0
                    ELSE COALESCE(dt_today.volume_sampah, 0)
                END / t.kapasitas * 100, 1
            ) AS persentase_sampah,
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
            SELECT id_tps, MAX(volume_sampah) as volume_sampah, MIN(status_angkut) as status_angkut
            FROM daftar_tugas
            WHERE DATE(tgl_terakhir_diambil) = CURDATE() 
               OR (tgl_pengambilan = CURDATE() AND status_angkut != 'selesai')
            GROUP BY id_tps
        ) dt_today ON t.id_tps = dt_today.id_tps

        LEFT JOIN (
            SELECT id_tps, MAX(tgl_terakhir_diambil) as tgl_terakhir_diambil
            FROM daftar_tugas
            WHERE status_angkut = 'selesai'
            GROUP BY id_tps
        ) dt_last ON t.id_tps = dt_last.id_tps

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
        SELECT id_tps, nama_tps, tps.id_dusun, alamat, dusun.nama_dusun,
        latitude, longitude, kapasitas, status_tps, foto_tps
        FROM tps
        JOIN dusun ON tps.id_dusun = dusun.id_dusun
    `;

    const params = [];

    if (statusList.length > 0) {
        query += ` WHERE status_tps IN (${statusList.map(() => '?').join(',')})`;
        params.push(...statusList);
    }

    query += ` ORDER BY id_tps DESC`;

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
        "SELECT id_tps, nama_tps, latitude, longitude, status_tps FROM tps"
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