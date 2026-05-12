const express = require("express");
const router = express.Router();

const laporan = require("../controllers/laporanController");
const upload = require("../middlewares/uploadMiddleware");

router.post("/", upload.single("foto_tps"), laporan.createLaporan);
router.get("/", laporan.getAllLaporan);
router.get("/:id", laporan.getLaporanById);

module.exports = router;

