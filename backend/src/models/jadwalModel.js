const { db } = require("../config/db");
const { toString } = require('../utils/hariJadwal');

async function getUsedHariByTPS(id_tps) {
  const [rows] = await db.query(
    `SELECT DISTINCT hari_pengambilan FROM jadwal_pengambilan 
     WHERE id_tps = ? AND is_active = 1
     ORDER BY hari_pengambilan`,
    [id_tps]
  );
  return rows.map(r => r.hari_pengambilan);
}

async function create(data) {
  const { id_tps, id_petugas, hari_pengambilan, id_admin } = data;

  // VALIDASI ARRAY
  if (!Array.isArray(hari_pengambilan) || hari_pengambilan.length === 0) {
    throw new Error("Hari tidak valid");
  }

  // bersihkan duplikat sebelum validasi/insert
  const hariUnique = [...new Set(hari_pengambilan)];

  for (const hari of hariUnique) {
    if (!Number.isInteger(hari) || hari < 0 || hari > 6) {
      throw new Error("Hari tidak valid");
    }
  }

  // CHECK untuk duplikasi hari pada TPS yang sama
  const existingHari = await getUsedHariByTPS(id_tps);
  const duplicateHari = hariUnique.filter(hari => existingHari.includes(hari));

  if (duplicateHari.length > 0) {
    const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const conflictingDays = duplicateHari.map(h => daftarHari[h]).join(', ');
    throw new Error(`TPS ini sudah memiliki jadwal pada hari: ${conflictingDays}`);
  }

  // INSERT MULTIPLE ROW
  for (const hari of hariUnique) {
    await db.query(
      `INSERT INTO jadwal_pengambilan 
       (id_tps, id_petugas, hari_pengambilan, id_admin, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [id_tps, id_petugas, hari, id_admin]
    );
  }

  return true;
}

async function findAll() {
  const [rows] = await db.query(`
    SELECT 
      GROUP_CONCAT(j.id_jadwal ORDER BY j.id_jadwal SEPARATOR ',') AS id_jadwal,
      j.id_tps,
      j.id_petugas,
      t.nama_tps,
      p.nama,
      GROUP_CONCAT(j.hari_pengambilan ORDER BY j.hari_pengambilan SEPARATOR ',') AS hari_pengambilan,
      MAX(j.tgl_terakhir_diambil) as tgl_terakhir_diambil
    FROM jadwal_pengambilan j
    JOIN tps t ON j.id_tps = t.id_tps
    JOIN petugas p ON j.id_petugas = p.id_petugas
    WHERE j.is_active = 1
    GROUP BY j.id_tps, j.id_petugas;
  `);

  const daftarHari = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu"
  ];

  rows.forEach(row => {

    // id_jadwal jadi array number
    row.id_jadwal = row.id_jadwal
      ? row.id_jadwal.split(',').map(Number)
      : [];

    if (!row.hari_pengambilan) {
      row.hari_pengambilan = [];
      row.hari_label = "";
      return;
    }

    const hariArray = String(row.hari_pengambilan)
      .split(',')
      .map(h => Number(h.trim()));

    row.hari_pengambilan = hariArray;
    row.hari_label = hariArray
      .map(h => daftarHari[h])
      .join(', ');
  });

  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT * FROM jadwal_pengambilan WHERE id_jadwal = ? AND is_active = 1",
    [id]
  );

  return rows[0];
}

async function findByHari(hariIndex) {
  const [rows] = await db.query(
    `SELECT * FROM jadwal_pengambilan
     WHERE hari_pengambilan = ? AND is_active = 1`,
    [hariIndex]
  );

  return rows;
}

async function update(db, id_tps, id_petugas, hari_pengambilan = [], id_admin) {
  // reuse imported db from top of file
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // bersihkan duplikat
    const hariUnique = [...new Set(hari_pengambilan)];

    // ambil jadwal lama untuk TPS ini (yang masih aktif)
    const [jadwalLama] = await conn.query(
      `SELECT id_jadwal, hari_pengambilan FROM jadwal_pengambilan WHERE id_tps = ? AND is_active = 1`,
      [id_tps]
    );

    // tentukan hari yang perlu dihapus (yang ada di lama tapi tidak di baru)
    const hariLama = jadwalLama.map(j => j.hari_pengambilan);
    const hariHapus = hariLama.filter(h => !hariUnique.includes(h));

    // CHECK untuk duplikasi hari pada TPS yang sama
    // Hanya check hari yang BARU (tidak ada di hariLama)
    const hariBaru = hariUnique.filter(h => !hariLama.includes(h));
    if (hariBaru.length > 0) {
      // Cek apakah ada hari baru yang sudah ada di schedule lain untuk TPS ini
      // (ini seharusnya tidak terjadi karena update hanya untuk satu TPS,
      // tapi sebagai safety check)
      const duplicateHari = hariBaru.filter(h => hariLama.includes(h));
      if (duplicateHari.length > 0) {
        const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        const conflictingDays = duplicateHari.map(h => daftarHari[h]).join(', ');
        throw new Error(`TPS ini sudah memiliki jadwal pada hari: ${conflictingDays}`);
      }
    }

    // 1. Nonaktifkan (Soft Delete) jadwal untuk hari yang sudah tidak dipilih
    if (hariHapus.length > 0) {
      const placeholders = hariHapus.map(() => '?').join(', ');
      await conn.query(
        `UPDATE jadwal_pengambilan SET is_active = 0 
         WHERE id_tps = ? AND hari_pengambilan IN (${placeholders}) AND is_active = 1`,
        [id_tps, ...hariHapus]
      );
    }

    // 2. update jadwal yang sudah ada (yang masih aktif)
    if (jadwalLama.length > hariHapus.length) {
      await conn.query(
        `UPDATE jadwal_pengambilan SET id_petugas = ?, id_admin = ? WHERE id_tps = ? AND is_active = 1`,
        [id_petugas, id_admin, id_tps]
      );
    }

    // 3. insert jadwal baru untuk hari yang belum ada
    if (hariBaru.length > 0) {
      for (const hari of hariBaru) {
        await conn.query(
          `INSERT INTO jadwal_pengambilan (id_tps, id_petugas, hari_pengambilan, id_admin, is_active) 
           VALUES (?, ?, ?, ?, 1)`,
          [id_tps, id_petugas, hari, id_admin]
        );
      }
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}


async function updateTanggalTerakhir(id_jadwal) {
  await db.query(
    `UPDATE jadwal_pengambilan
     SET tgl_terakhir_diambil = CURDATE()
     WHERE id_jadwal = ?`,
    [id_jadwal]
  );
}

async function remove(id) {
  const ids = id.split(",");
  // hanya set is_active = 0 agar riwayat tugas tidak hilang
  await db.query(
    "UPDATE jadwal_pengambilan SET is_active = 0 WHERE id_jadwal IN (?)",
    [ids]
  );
}

module.exports = {
  create,
  findAll,
  findById,
  findByHari,
  getUsedHariByTPS,
  update,
  updateTanggalTerakhir,
  remove
};