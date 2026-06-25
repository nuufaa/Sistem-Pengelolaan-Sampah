const TpsModel = require("../models/tpsModel");

async function createTps(req, res) {
  try {
    const data = {
      ...req.body,
      foto_tps: req.file ? req.file.filename : null
    };

    const id = await TpsModel.create(data);

    return res.status(201).json({
      message: "TPS berhasil dibuat",
      id_tps: id
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal membuat TPS"
    });
  }
}

async function getAllTps(req, res) {
  try {
    const data = await TpsModel.findAll();

    return res.json(data);
  } catch (error) {
    console.error("ERROR TPS:", error)
    return res.status(500).json({
      message: "Gagal mengambil data TPS"
    });
  }
}

async function getAllTpsJadwal(req, res) {
  try {
    const data = await TpsModel.findAllJadwal();

    return res.json(data);
  } catch (error) {

    console.error("ERROR TPS:", error)
    return res.status(500).json({
      message: "Gagal mengambil data jadwal TPS"
    });
  }
}

async function getStatusTPS(req, res) {
  try {
    const ALLOWED_STATUS = ['normal', 'hampir_penuh', 'penuh'];
    const { status } = req.query;
    
    let statusList = [];
    if (status) {
      statusList = status
        .split(',')
        .filter(s => ALLOWED_STATUS.includes(s.trim()));
    }

    if (status) {
      statusList = status.split(',');
    }

    const data = await TpsModel.findStatusTPS(statusList);

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getTpsById(req, res) {
  try {
    const data = await TpsModel.findById();

    if (!data) {
      return res.status(404).json({
        message: "TPS tidak ditemukan"
      });
    }

    return res.json(data);

  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data TPS"
    });
  }
}

async function updateTps(req, res) {
  try {
    const tpsLama = await TpsModel.findById(req.params.id);

    if (!tpsLama) {
      return res.status(404).json({
        message: "TPS tidak ditemukan"
      });
    }

    const foto = req.file
      ? req.file.filename
      : tpsLama.foto_tps; 

    const data = {
      ...req.body,
      foto_tps: foto
    };

    await TpsModel.update(req.params.id, data);

    return res.json({
      message: "TPS berhasil diperbarui"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal update TPS"
    });
  }
}

async function deleteTps(req, res) {
  try {
    await TpsModel.remove(req.params.id);

    return res.json({
      message: "TPS berhasil dihapus"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal hapus TPS"
    });
  }
}

async function getTpsMap(req, res) {
  try {
    const data = await TpsModel.findForMap();

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil data map"
    });
  }
}

async function getTpsStatistics(req, res) {
  try {
    const data = await TpsModel.getStatistics();
    
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil statistik"
    });
  }
}

module.exports = {
    createTps,
    getAllTps,
    getAllTpsJadwal,
    getTpsById,
    updateTps,
    deleteTps,
    getTpsMap,
    getTpsStatistics,
    getStatusTPS
}
