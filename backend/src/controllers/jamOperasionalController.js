const jamOperasionalModel = require("../models/jamOperasionalModel");

async function createJamOperasional(req, res) {
  try {
    const id = await jamOperasionalModel.create(req.body);

    return res.status(201).json({
        message: "Jam operasional berhasil dibuat",
        id_operasional: id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal membuat data"
    });
  }
}

async function getAllJamOperasional(req, res) {
  try {
    const data = await jamOperasionalModel.findAll();

    return res.json(data);
  } catch (error) {
    console.error(error);
    
    return res.status(500).json({
      message: "Gagal mengambil data data"
    });
  }
}

async function updateJamOperasional(req, res) {
  try {
    await jamOperasionalModel.update(req.params.id, req.body);

    return res.json({
      message: "Jam oeprasional berhasil diperbarui"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal update data"
    });
  }
}

async function deleteJamOperasional(req, res) {
  try {
    await jamOperasionalModel.remove(req.params.id);

    return res.json({
      message: "Jam operasional berhasil dihapus"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal hapus data"
    });
  }
}

module.exports = {
    createJamOperasional,
    getAllJamOperasional,
    updateJamOperasional,
    deleteJamOperasional
}
