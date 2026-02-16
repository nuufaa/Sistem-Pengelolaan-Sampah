const express = require("express");
const router = express.Router();

const laporan = require("../controllers/laporanController");
const validate = require("../middlewares/validateMiddleware");
const {auth, isAdmin} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post("/", upload.single("foto_tps"), laporan.createLaporan);
router.get("/", auth, isAdmin(["admin"]), laporan.getAllLaporan);
router.get("/:id", auth, isAdmin(["admin"]), laporan.getLaporanById);

module.exports = router;

