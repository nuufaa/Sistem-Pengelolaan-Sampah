const dashboardModel = require("../models/dashboardModel")

async function getDashboard(req, res) {
  try {
      // const totalTPS = await dashboardModel.getTotalTPS()
      // const totalPetugas = await dashboardModel.getTotalPetugas()
      // const totalLaporan = await dashboardModel.getTotalLaporanBulanIni()
      // const totalTPSPenuh = await dashboardModel.getTotalTPSPenuh()
      // const statusTPS = await dashboardModel.getStatusTPS()
      // const laporan7Hari = await dashboardModel.getLaporan7Hari()
      // const totalTPSHampirPenuh = await dashboardModel.getTotalTPSHampirPenuh()

    const [
      totalTPS,
      totalPetugas,
      totalLaporan,
      totalTPSPenuh,
      statusTPS,
      laporan7Hari,
      totalTPSHampirPenuh
    ] = await Promise.all([
      dashboardModel.getTotalTPS(),
      dashboardModel.getTotalPetugas(),
      dashboardModel.getTotalLaporanBulanIni(),
      dashboardModel.getTotalTPSPenuh(),
      dashboardModel.getStatusTPS(),
      dashboardModel.getLaporan7Hari(),
      dashboardModel.getTotalTPSHampirPenuh()
    ]);

    res.json({
      totalTPS,
      totalPetugas,
      totalLaporan,
      totalTPSPenuh,
      statusTPS,
      laporan7Hari,
      totalTPSHampirPenuh,
    })

  } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Terjadi kesalahan server" })   
  }
}

async function getDashboardMas(req, res) {
  try {
      // const totalTPS = await dashboardModel.getTotalTPS()
      // const totalTPSPenuh = await dashboardModel.getTotalTPSPenuh()
      // const totalTPSHampirPenuh = await dashboardModel.getTotalTPSHampirPenuh()
      // const volumeSampahHarian = await dashboardModel.getVolumeSampah()
      // const rankingTPS = await dashboardModel.getRankingTPS()
      // const timbulanPerKapita = await dashboardModel.getTimbulanPerKapita()

    const [
      totalTPS,
      totalTPSPenuh,
      totalTPSHampirPenuh,
      volumeSampahHarian,
      rankingTPS,
      timbulanPerKapita
    ] = await Promise.all([
      dashboardModel.getTotalTPS(),
      dashboardModel.getTotalTPSPenuh(),
      dashboardModel.getTotalTPSHampirPenuh(),
      dashboardModel.getVolumeSampah(),
      dashboardModel.getRankingTPS(),
      dashboardModel.getTimbulanPerKapita()
    ]);
      
    res.json({
      totalTPS,
      totalTPSPenuh,
      totalTPSHampirPenuh,
      volumeSampahHarian,
      rankingTPS,
      timbulanPerKapita
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
    const volumeSampahHarian = await dashboardModel.getVolumeSampah(id_petugas);

    res.json({
      total,
      pending,
      done,
      progress,
      volumeSampahHarian
    });

  } catch (error) {
    console.error('Error getDashboardPetugas:', error);
    res.status(500).json({
      message: "Gagal mengambil dashboard",
      error: error.message
    });
  }
}

async function getDashboardStat(req, res) {
    try {
        const volumeSampahHarian = await dashboardModel.getVolumeSampah()
        const rankingTPS = await dashboardModel.getRankingTPS()
        const timbulanPerKapita = await dashboardModel.getTimbulanPerKapita()

        res.json({
          volumeSampahHarian,
          rankingTPS,
          timbulanPerKapita
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Terjadi kesalahan server" })   
    }
}

module.exports = { getDashboard, getDashboardPetugas, getDashboardMas, getDashboardStat }