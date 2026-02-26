const petugasModel = require("../models/petugasModel");

async function createPetugas(req, res) {
    try {
        const id = await petugasModel.create(req.body);

        return res.status(201).json({
            message: "Petugas berhasil dibuat",
            id_petugas: id
        });

    } catch (error) {
        console.error(error);
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

async function updatePetugas(req, res) {
  try {
    await petugasModel.update(req.params.id, req.body);

    return res.json({
      message: "Petugas berhasil diperbarui"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal update dusun"
    });
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
