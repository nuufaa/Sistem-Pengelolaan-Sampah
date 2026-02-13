const DusunModel = require("../model/DusunModel");

async function createDusun(req, res) {
    
    try {
        const id = await DusunModel.create(req.body);

        return res.status(201).json({
            message: "Dusun berhasil dibuat",
            id_dusun: id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal membuat Dusun"
        });
    }
}

async function getAllDusun(req, res) {
    try {
        const data = await DusunModel.findAll();

        return res.json(data);
    } catch (error) {
        return res.status(500).json({
            message: "Gagal mengambil data Dusun"
        });
    }
}

async function getDusunById(req, res) {
    try {
        const data = await DusunModel.findById();

        if (!data) {
            return res.status(404).json({
                message: "Dusun tidak ditemukan"
            });
        }

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: "Gagal mengambil data Dusun"
        });
    }
}

async function updateDusun(req, res) {
  try {
    await DusunModel.update(req.params.id, req.body);

    return res.json({
      message: "Dusun berhasil diperbarui"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal update dusun"
    });
  }
}

async function deleteDusun(req, res) {
  try {
    await DusunModel.remove(req.params.id);

    return res.json({
      message: "Dusun berhasil dihapus"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal hapus dusun"
    });
  }
}

module.exports = {
    createDusun,
    getAllDusun,
    getDusunById,
    updateDusun,
    deleteDusun
}