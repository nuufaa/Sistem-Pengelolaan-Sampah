const petugasModel = require("../models/petugasModel");
const bcrypt = require('bcrypt')

async function createPetugas(req, res) {
  try {
    const id_admin = req.user.id
    const { role = 'petugas' } = req.body;
    const data = await petugasModel.create({
      ...req.body,
      role,
      id_admin
    })

    return res.status(201).json({
      message: "Petugas berhasil dibuat",
      id_petugas: data
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal membuat petugas"
    });
  }
}

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
    const data = await petugasModel.findById(req.user.id);

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

async function updatePetugas(req, res) {
  try {
    const { nama, no_telp, username, password, status_petugas, role } = req.body
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
      status_petugas: status,
      role: role || 'petugas'
    })

    res.json({ message: 'Petugas berhasil diupdate' })
  } catch (err) {
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
