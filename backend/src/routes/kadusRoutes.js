const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const kadusController = require("../controllers/kadusController");

// Route khusus kadus dan kades untuk melihat semua data (hanya GET, read-only)
router.get("/dashboard", auth, role(["kadus", "kades"]), kadusController.getKadusDashboard);
router.get("/laporan", auth, role(["kadus", "kades"]), kadusController.getAllLaporan);
router.get("/dusun", auth, role(["kadus", "kades"]), kadusController.getAllDusun);
router.get("/tps", auth, role(["kadus", "kades"]), kadusController.getAllTPS);
router.get("/jadwal", auth, role(["kadus", "kades"]), kadusController.getAllJadwal);
router.get("/jam-operasional", auth, role(["kadus", "kades"]), kadusController.getAllJamOperasional);
router.get("/kendaraan", auth, role(["kadus", "kades"]), kadusController.getAllKendaraan);
router.get("/petugas", auth, role(["kadus", "kades"]), kadusController.getAllPetugas);

module.exports = router;