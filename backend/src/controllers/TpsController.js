const TpsModel = require("../model/tpsModel");

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
        return res.status(500).json({
            message: "Gagal mengambil data TPS"
        });
    }
}

// async function getAllTps(req, res) {
//   try {
//     const { status } = req.query;

//     const data = await TpsModel.findAll(status);

//     return res.json(data);

//   } catch (error) {
//     return res.status(500).json({
//       message: "Gagal mengambil data TPS"
//     });
//   }
// }

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
    await TpsModel.update(req.params.id, req.body);

    return res.json({
      message: "TPS berhasil diperbarui"
    });

  } catch (error) {
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
    getTpsById,
    updateTps,
    deleteTps,
    getTpsMap,
    getTpsStatistics
}
