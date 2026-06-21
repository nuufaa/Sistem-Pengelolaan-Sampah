const dashboardModel = require("../models/dashboardModel");
const laporanModel = require("../models/laporanModel");
const dusunModel = require("../models/dusunModel");
const tpsModel = require("../models/tpsModel");
const jadwalModel = require("../models/jadwalModel");
const kendaraanModel = require("../models/kendaraanModel");
const petugasModel = require("../models/petugasModel");
const jamOperasionalModel = require("../models/jamOperasionalModel");

async function getKadusDashboard(req, res) {
  try {
    const data = await dashboardModel.getDashboardData();
    return res.json({
      message: "Dashboard Kadus/Kades",
      data
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil dashboard"
    });
  }
}

async function getAllLaporan(req, res) {
  try {
    const data = await laporanModel.findAll();
    return res.json(data);
  } catch (error) {
    console.error("Kadus getAllLaporan error:", error);
    return res.status(500).json({
      message: "Gagal mengambil laporan"
    });
  }
}

async function getAllDusun(req, res) {
  try {
    const data = await dusunModel.findAll();
    return res.json(data);
  } catch (error) {
    console.error("Kadus getAllDusun error:", error);
    return res.status(500).json({
      message: "Gagal mengambil dusun"
    });
  }
}

async function getAllTPS(req, res) {
  try {
    const data = await tpsModel.findAll();
    return res.json(data);
  } catch (error) {
    console.error("Kadus getAllTPS error:", error);
    return res.status(500).json({
      message: "Gagal mengambil TPS"
    });
  }
}

async function getAllJadwal(req, res) {
  try {
    const data = await jadwalModel.findAll();
    return res.json(data);
  } catch (error) {
    console.error("Kadus getAllJadwal error:", error);
    return res.status(500).json({
      message: "Gagal mengambil jadwal"
    });
  }
}

async function getAllJamOperasional(req, res) {
  try {
    const data = await jamOperasionalModel.findAll();
    return res.json(data);
  } catch (error) {
    console.error("Kadus getAllJamOperasional error:", error);
    return res.status(500).json({
      message: "Gagal mengambil jam operasional"
    });
  }
}

async function getAllKendaraan(req, res) {
  try {
    const data = await kendaraanModel.findAll();
    return res.json(data);
  } catch (error) {
    console.error("Kadus getAllKendaraan error:", error);
    return res.status(500).json({
      message: "Gagal mengambil kendaraan"
    });
  }
}

async function getAllPetugas(req, res) {
  try {
    const data = await petugasModel.findAll();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil petugas"
    });
  }
}

module.exports = {
  getKadusDashboard,
  getAllLaporan,
  getAllDusun,
  getAllTPS,
  getAllJadwal,
  getAllJamOperasional,
  getAllKendaraan,
  getAllPetugas
};