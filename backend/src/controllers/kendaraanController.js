const KendaraanModel = require("../model/kendaraanModel");

async function createKendaraan(req, res) {
    try {
        const id_admin = req.user.id; // dari JWT

        const data = {
            ...req.body,
            id_admin
        };

        const id = await KendaraanModel.create(data);

        return res.status(201).json({
            message: "Kendaraan berhasil dibuat",
            id_kendaraan: id
        });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
            message: "Gagal membuat Kendaraan"
        });
    }
}

async function getAllKendaraan(req, res) {
    try {
        const data = await KendaraanModel.findAll();

        return res.json(data);
    } catch (error) {
        return res.status(500).json({
            message: "Gagal mengambil data kendaraan"
        });
    }
}

async function getKendaraanById(req, res) {
    try {
        const data = await KendaraanModel.findById();

        if (!data) {
            return res.status(404).json({
                message: "Kendaraan tidak ditemukan"
            });
        }

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: "Gagal mengambil data Kendaraan"
        });
    }
}

async function updateKendaraan(req, res) {
  try {
    await KendaraanModel.update(req.params.id, req.body);

    return res.json({
      message: "Kendaraan berhasil diperbarui"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal update Kendaraan"
    });
  }
}

async function deleteKendaraan(req, res) {
  try {
    await KendaraanModel.remove(req.params.id);

    return res.json({
      message: "Kendaraan berhasil dihapus"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal hapus Kendaraan"
    });
  }
}

module.exports = {
    createKendaraan,
    getAllKendaraan,
    getKendaraanById,
    updateKendaraan,
    deleteKendaraan
}
