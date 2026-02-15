const express = require("express");
const router = express.Router();

const daftarTugasController = require("../controllers/daftarTugasController");

router.put("/:id/status", daftarTugasController.updateStatus);

module.exports = router;
