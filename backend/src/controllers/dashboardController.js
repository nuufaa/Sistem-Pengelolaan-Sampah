const dashboardModel = require("../models/dashboardModel")

const dashboardCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 menit dalam milidetik

async function getDashboard(req, res) {
  try {
    const { month, year } = req.query;
    const cacheKey = `dashboard_main_${month}_${year}`;
    if (dashboardCache[cacheKey] && Date.now() - dashboardCache[cacheKey].timestamp < CACHE_TTL) {
      return res.json(dashboardCache[cacheKey].data);
    }

    const [
      totalTPS,
      totalPetugas,
      totalLaporan,
      totalTPSPenuh,
      statusTPS,
      laporan7Hari,
      laporanBulanIni,
      totalTPSHampirPenuh
    ] = await Promise.all([
      dashboardModel.getTotalTPS(),
      dashboardModel.getTotalPetugas(),
      dashboardModel.getTotalLaporanBulanIni(),
      dashboardModel.getTotalTPSPenuh(),
      dashboardModel.getStatusTPS(),
      dashboardModel.getLaporan7Hari(),
      dashboardModel.getLaporanBulanIni(month, year),
      dashboardModel.getTotalTPSHampirPenuh()
    ]);

    const responseData = {
      totalTPS,
      totalPetugas,
      totalLaporan,
      totalTPSPenuh,
      statusTPS,
      laporan7Hari,
      laporanBulanIni,
      totalTPSHampirPenuh,
    }

    dashboardCache[cacheKey] = { data: responseData, timestamp: Date.now() };
    res.json(responseData);

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Terjadi kesalahan server" })
  }
}

async function getDashboardMas(req, res) {
  try {
    const { month, year, start_date, end_date } = req.query;
    const filter = { month, year, start_date, end_date };

    const cacheKey = `dashboard_mas_${JSON.stringify(filter)}`;
    if (dashboardCache[cacheKey] && Date.now() - dashboardCache[cacheKey].timestamp < CACHE_TTL) {
      return res.json(dashboardCache[cacheKey].data);
    }

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
      dashboardModel.getRankingTPS(filter),
      dashboardModel.getTimbulanPerKapita(filter)
    ]);

    const responseData = {
      totalTPS,
      totalTPSPenuh,
      totalTPSHampirPenuh,
      volumeSampahHarian,
      rankingTPS,
      timbulanPerKapita
    }

    dashboardCache[cacheKey] = { data: responseData, timestamp: Date.now() };
    res.json(responseData);

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
    const { month, year, start_date, end_date } = req.query;
    const filter = { month, year, start_date, end_date };

    const volumeSampahHarian = await dashboardModel.getVolumeSampah()
    const rankingTPS = await dashboardModel.getRankingTPS(filter)
    const timbulanPerKapita = await dashboardModel.getTimbulanPerKapita(filter)

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

// Kepatuhan semua petugas - untuk admin dashboard
async function getKepatuhanAllPetugas(req, res) {
  try {
    const kepatuhan = await dashboardModel.getKepatuhanAllPetugas();
    res.json(kepatuhan);
  } catch (error) {
    console.error("Error getKepatuhanAllPetugas:", error);
    res.status(500).json({ message: "Gagal mengambil data kepatuhan petugas" });
  }
}

// Detail kepatuhan satu petugas - untuk dashboard petugas
async function getDetailKepatuhanPetugas(req, res) {
  try {
    const id_petugas = req.user ? req.user.id : null;

    if (!id_petugas) {
      return res.status(401).json({ message: "Petugas tidak terautentikasi" });
    }

    const detail = await dashboardModel.getDetailKepatuhanPetugas(id_petugas);
    res.json(detail);
  } catch (error) {
    console.error("Error getDetailKepatuhanPetugas:", error);
    res.status(500).json({ message: "Gagal mengambil detail kepatuhan" });
  }
}

// Detail kepatuhan satu petugas - untuk admin (dengan parameter id_petugas)
async function getDetailKepatuhanPetugasAdmin(req, res) {
  try {
    const { id_petugas } = req.params;

    if (!id_petugas) {
      return res.status(400).json({ message: "ID Petugas tidak ditemukan" });
    }

    const detail = await dashboardModel.getDetailKepatuhanPetugas(id_petugas);
    res.json(detail);
  } catch (error) {
    console.error("Error getDetailKepatuhanPetugasAdmin:", error);
    res.status(500).json({ message: "Gagal mengambil detail kepatuhan" });
  }
}

// Riwayat Logbook - untuk admin dashboard
async function getLogbookHistory(req, res) {
  try {
    const { start_date, end_date, id_petugas, id_kendaraan } = req.query;

    const filter = {};
    if (start_date) filter.start_date = start_date;
    if (end_date) filter.end_date = end_date;
    if (id_petugas) filter.id_petugas = id_petugas;
    if (id_kendaraan) filter.id_kendaraan = id_kendaraan;

    const logbook = await dashboardModel.getLogbookHistory(filter);
    res.json(logbook);
  } catch (error) {
    console.error("Error getLogbookHistory:", error);
    res.status(500).json({ message: "Gagal mengambil riwayat logbook" });
  }
}

// Logbook - untuk admin dashboard
async function getLogbookSummary(req, res) {
  try {
    const { start_date, end_date } = req.query;

    const filter = {};
    if (start_date) filter.start_date = start_date;
    if (end_date) filter.end_date = end_date;

    const summary = await dashboardModel.getLogbookSummary(filter);
    res.json(summary);
  } catch (error) {
    console.error("Error getLogbookSummary:", error);
    res.status(500).json({ message: "Gagal mengambil ringkasan logbook" });
  }
}

module.exports = { getDashboard, getDashboardPetugas, getDashboardMas, getDashboardStat, getKepatuhanAllPetugas, getDetailKepatuhanPetugas, getDetailKepatuhanPetugasAdmin, getLogbookHistory, getLogbookSummary }