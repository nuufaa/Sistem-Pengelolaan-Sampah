const {db} = require("../config/db");
const { toString } = require('../utils/hariJadwal');

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

  // INSERT MULTIPLE ROW
  for (const hari of hariUnique) {
    await db.query(
      `INSERT INTO jadwal_pengambilan 
       (id_tps, id_petugas, hari_pengambilan, id_admin)
       VALUES (?, ?, ?, ?)`,
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

    row.hari_pengambilan = hariArray; // untuk edit (checkbox)
    row.hari_label = hariArray       // untuk display tabel
      .map(h => daftarHari[h])
      .join(', ');
  });

  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT * FROM jadwal_pengambilan WHERE id_jadwal = ?",
    [id]
  );

  return rows[0];
}

async function findByHari(hariIndex) {
  const [rows] = await db.query(
    `SELECT * FROM jadwal_pengambilan
     WHERE hari_pengambilan = ?`,
    [hariIndex]
  );

  return rows;
}

// async function update(id, data) {
//   const {
//     id_petugas,
//     id_tps,
//     hari_pengambilan
//   } = data;

//   await db.query(
//     `UPDATE jadwal_pengambilan
//     SET 
//       hari_pengambilan = ?,
//       id_tps = COALESCE(?, id_tps),
//       id_petugas = COALESCE(?, id_petugas),
//       tgl_terakhir_diambil = COALESCE(?, tgl_terakhir_diambil)
//     WHERE id_jadwal = ?`,
//     [hari_pengambilan, id_tps, id_petugas, data.tgl_terakhir_diambil, id]
//   );
// }

// jadwalModel.js
// mulai transaction
// async function update(db, id_tps, id_petugas, hari_pengambilan = []) {
//   await db.beginTransaction();
//   try {
//     // HAPUS jadwal lama
//     await db.query(
//       `DELETE FROM jadwal_pengambilan WHERE id_tps = ? AND id_petugas = ?`,
//       [id_tps, id_petugas]
//     );
//     console.log('DELETE jadwal', id_tps, id_petugas);

//     // INSERT jadwal baru jika ada
//     if (hari_pengambilan.length > 0) {
//       const values = hari_pengambilan.map(hari => [id_tps, id_petugas, hari]);
//       const placeholders = values.map(() => `(?, ?, ?)`).join(', ');

//       await db.query(
//         `INSERT INTO jadwal_pengambilan (id_tps, id_petugas, hari_pengambilan) VALUES ${placeholders}`,
//         values.flat()
//       );
//     }

//     await db.commit();
//     return { success: true };
//   } catch (err) {
//     await db.rollback();
//     throw err;
//   }
// }

async function update(db, id_tps, id_petugas, hari_pengambilan = [], id_admin) {
  // reuse imported db from top of file
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // hapus jadwal lama
    await conn.query(
      `DELETE FROM jadwal_pengambilan WHERE id_tps = ?`,
      [id_tps]
    );

    // bersihkan duplikat
    const hariUnique = [...new Set(hari_pengambilan)];

    // insert baru
    if (hariUnique.length > 0) {
      const values = hariUnique.map(hari => [id_tps, id_petugas, hari, id_admin]);
      const placeholders = values.map(() => `(?, ?, ?, ?)`).join(', ');

      await conn.query(
        `INSERT INTO jadwal_pengambilan (id_tps, id_petugas, hari_pengambilan, id_admin) VALUES ${placeholders}`,
        values.flat()
      );
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}
// async function update(db, id_tps, id_petugas, hari_pengambilan = [], id_admin) {
//   // reuse imported db from top of file
//   const conn = await db.getConnection();
//   try {
//     await conn.beginTransaction();
//     // hapus jadwal lama
//     await conn.query(
//       `DELETE FROM jadwal_pengambilan WHERE id_tps = ? AND id_petugas = ?`,
//       [id_tps, id_petugas]
//     );

//     // bersihkan duplikat
//     const hariUnique = [...new Set(hari_pengambilan)];

//     // insert baru
//     if (hariUnique.length > 0) {
//       const values = hariUnique.map(hari => [id_tps, id_petugas, hari, id_admin]);
//       const placeholders = values.map(() => `(?, ?, ?, ?)`).join(', ');

//       await conn.query(
//         `INSERT INTO jadwal_pengambilan (id_tps, id_petugas, hari_pengambilan, id_admin) VALUES ${placeholders}`,
//         values.flat()
//       );
//     }

//     await conn.commit();
//     return { success: true };
//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   }
// }

async function updateTanggalTerakhir(id_jadwal) {
  await db.query(
    `UPDATE jadwal_pengambilan
     SET tgl_terakhir_diambil = CURDATE()
     WHERE id_jadwal = ?`,
    [id_jadwal]
  );
}

async function remove(id) {
  await db.query(
    "DELETE FROM jadwal_pengambilan WHERE id_jadwal = ?",
    [id]
  );
}

module.exports = {
  create,
  findAll,
  findById,
  findByHari,
  update,
  updateTanggalTerakhir,
  remove
};
