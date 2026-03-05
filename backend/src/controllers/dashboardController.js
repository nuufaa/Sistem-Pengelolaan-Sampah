const dashboardModel = require("../models/dashboardModel")

async function getDashboard(req, res) {
    try {
        const totalTPS = await dashboardModel.getTotalTPS()
        const totalPetugas = await dashboardModel.getTotalPetugas()
        const totalLaporan = await dashboardModel.getTotalLaporanBulanIni()
        const totalTPSPenuh = await dashboardModel.getTotalTPSPenuh()
        const statusTPS = await dashboardModel.getStatusTPS()
        const laporan7Hari = await dashboardModel.getLaporan7Hari()

        res.json({
        totalTPS,
        totalPetugas,
        totalLaporan,
        totalTPSPenuh,
        statusTPS,
        laporan7Hari
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Terjadi kesalahan server" })   
    }
}

async function getDashboardPetugas(req, res) {
  try {
    // petugas ID comes from token payload (auth middleware)
    const id_petugas = req.user ? req.user.id : null;

    if (!id_petugas) {
      return res.status(401).json({ message: "Petugas tidak terautentikasi" });
    }

    const total = await dashboardModel.getTotalTugas(id_petugas);
    const pending = await dashboardModel.getPendingTugas(id_petugas);
    const done = await dashboardModel.getDoneTugas(id_petugas);
    const progress = await dashboardModel.getProgressTugas(id_petugas);

    res.json({
      total,
      pending,
      done,
      progress
    });

  } catch (error) {
    console.error('Error getDashboardPetugas:', error);
    res.status(500).json({
      message: "Gagal mengambil dashboard",
      error: error.message
    });
  }
}


module.exports = { getDashboard, getDashboardPetugas }