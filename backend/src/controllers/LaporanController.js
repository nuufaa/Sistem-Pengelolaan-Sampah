const LaporanModel = require("../model/LaporanModel");

async function createLaporan(req, res) {
    try {
        const id_laporan = await LaporanModel.addLaporan(req.body);

        return res.status(201).json({
            message: "Laporan berhasil dibuat",
            id_laporan: id_laporan
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal membuat laporan"
        });
    }
}

async function getAllLaporan(req, res) {
    try {
        const data = await LaporanModel.findAll();
        return res.json(data);
    } catch (error) {
        return res.status(500).json({
            message: "Gagal mengambil data"
        });
    }
}

async function getLaporanById(req, res) {
    try {
        const data = await LaporanModel.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                message: "Laporan tidak ditemukan"
            });
        }
        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports = {
    createLaporan,
    getAllLaporan,
    getLaporanById
}

// async function updateLaporan(req, res) {
//   try {
//     await LaporanModel.update(req.params.id, req.body);

//     return res.json({
//       message: "Laporan berhasil diperbarui"
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: "Gagal update"
//     });
//   }
// }

// async function deleteLaporan(req, res) {
//   try {
//     await LaporanModel.remove(req.params.id);

//     return res.json({
//       message: "Laporan berhasil dihapus"
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: "Gagal hapus"
//     });
//   }
// }