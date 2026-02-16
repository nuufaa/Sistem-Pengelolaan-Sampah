const express = require("express");
const router = express.Router();

const daftarTugasController = require("../controllers/daftarTugasController");
const { generateTugasHarian } = require("../services/daftarTugasOtomatisService");

router.put("/:id/status", daftarTugasController.updateStatus);
router.post("/generate", async (req, res) => {
  try {
    await generateTugasHarian();
    res.json({ message: "Generate tugas berhasil" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Gagal generate tugas" });
  }
});

module.exports = router;
