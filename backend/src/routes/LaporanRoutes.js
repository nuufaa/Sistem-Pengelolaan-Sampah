const express = require("express");
const router = express.Router();

const laporan = require("../controllers/LaporanController");
const validate = require("../middlewares/ValidateMiddleware");
const {auth, isAdmin} = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/ValidateMiddleware");

router.post("/", laporan.createLaporan);
router.get("/", auth, isAdmin(["admin"]), laporan.getAllLaporan);
router.get("/:id", auth, isAdmin(["admin"]), laporan.getLaporanById);

module.exports = router;

