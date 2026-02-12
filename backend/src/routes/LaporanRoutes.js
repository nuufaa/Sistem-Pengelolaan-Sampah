const express = require("express");
const router = express.Router();

const laporan = require("../controllers/LaporanController");
const validate = require("../middlewares/ValidateMiddleware");
const auth = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/ValidateMiddleware");

router.post("/", laporan.createLaporan);
router.get("/", auth, role(["admin"]), laporan.getAllLaporan);
router.get("/:id", auth, role(["admin"]), laporan.getLaporanById);

module.exports = router;

