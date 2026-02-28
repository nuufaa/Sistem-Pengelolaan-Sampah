const petugasModel = require("../models/petugasModel");
const bcrypt = require('bcrypt')


async function createPetugas(req, res) {
  try {
    const id_admin = req.user.id
    const data = await petugasModel.create({
      ...req.body,
      id_admin
    })

    return res.status(201).json({
      message: "Petugas berhasil dibuat",
      id_petugas: data
    });

  } catch (error) {
    console.error();
    return res.status(500).json({
      message: "Gagal membuat petugas"
    });
  }
}

// petugasController.js
// async function createPetugas(req, res) {
//   try {
//     const { nama, no_telp, status_petugas } = req.body

//     if (!nama || !no_telp) {
//       return res.status(400).json({
//         message: 'Nama dan No HP wajib diisi'
//       })
//     }

//     const status =
//       status_petugas === 'aktif' ||
//       status_petugas === 1 ||
//       status_petugas === '1'
//         ? 1
//         : 0

//     const id = await petugasModel.create({
//       nama,
//       no_telp,
//       status_petugas: status
//     })

//     return res.status(201).json({
//       message: 'Petugas berhasil dibuat',
//       id_petugas: id
//     })
//   } catch (error) {
//     console.error('CREATE PETUGAS ERROR:', error)
//     return res.status(500).json({
//       message: error.message
//     })
//   }
// }

// petugasController.js
// async function createPetugas(req, res) {
//   try {
//     const { nama, no_telp, status_petugas } = req.body

//     // 🔥 VALIDASI WAJIB
//     if (!nama || !no_telp) {
//       return res.status(400).json({
//         message: 'Nama dan No HP wajib diisi'
//       })
//     }

//     const status =
//       status_petugas === 'aktif' ||
//       status_petugas === 1 ||
//       status_petugas === '1'
//         ? 1
//         : 0

//     const id = await petugasModel.create({
//       nama,
//       no_telp,
//       status_petugas: status
//     })

//     return res.status(201).json({
//       message: 'Petugas berhasil dibuat',
//       id_petugas: id
//     })
//   } catch (error) {
//     console.error('CREATE PETUGAS ERROR:', error)
//     return res.status(500).json({
//       message: error.message
//     })
//   }
// }

async function getAllPetugas(req, res) {
    try {
        const data = await petugasModel.findAll();

        return res.json(data);
    } catch (error) {
        return res.status(500).json({
            message: "Gagal mengambil data petugas"
        });
    }
}

async function getPetugasById(req, res) {
    try {
        const data = await petugasModel.findById();

        if (!data) {
            return res.status(404).json({
                message: "Petugas tidak ditemukan"
            });
        }

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: "Gagal mengambil data petugas"
        });
    }
}

// async function updatePetugas(req, res) {
//   try {
//     await petugasModel.update(req.params.id, req.body);

//     return res.json({
//       message: "Petugas berhasil diperbarui"
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: "Gagal update dusun"
//     });
//   }
// }

// async function updatePetugas(req, res) {
//   try {
//     const { nama, no_telp, status_petugas } = req.body
//     const id = req.params.id   // ✅ INI YANG BENAR

//     const status = Number(status_petugas)

//     await db.query(
//       `UPDATE petugas
//        SET nama = ?, no_telp = ?, status_petugas = ?
//        WHERE id_petugas = ?`,
//       [nama, no_telp, status, id]
//     )

//     res.json({ message: 'Petugas berhasil diupdate' })
//   } catch (err) {
//     console.error('UPDATE PETUGAS ERROR:', err)
//     res.status(500).json({ message: err.message })
//   }
// }

async function updatePetugas(req, res) {
  try {
    const { nama, no_telp, username, password, status_petugas } = req.body
    const id = req.params.id

    const status = Number(status_petugas)
    let hashedPassword = null
    
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10)
    } else{
      hashedPassword = null;
    }

    await petugasModel.update({
      id_petugas: id,
      nama,
      no_telp,
      username,
      password: hashedPassword ,
      status_petugas: status
    })

    res.json({ message: 'Petugas berhasil diupdate' })
  } catch (err) {
    console.error('UPDATE ERROR:', err)
    res.status(500).json({ message: err.message })
  }
}

async function deletePetugas(req, res) {
  try {
    await petugasModel.remove(req.params.id);

    return res.json({
      message: "Petugas berhasil dihapus"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal hapus petugas"
    });
  }
}

module.exports = {
    createPetugas,
    getAllPetugas,
    getPetugasById,
    updatePetugas,
    deletePetugas
}
