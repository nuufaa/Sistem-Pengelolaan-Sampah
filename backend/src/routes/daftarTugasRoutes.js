const express = require("express");
const router = express.Router();

const daftarTugasController = require("../controllers/daftarTugasController");
const { generateTugasHarian } = require("../services/daftarTugasOtomatisService");

const { auth } = require("../middlewares/authMiddleware");

// list tasks - petugas must be authenticated
router.get("/", auth, daftarTugasController.listTugas);

// list completed/history tasks
router.get("/history/completed", auth, daftarTugasController.listCompleted);

// update status (could be petugas or admin)
router.put("/:id/status", auth, daftarTugasController.updateStatus);
router.put("/logbook", auth, daftarTugasController.updateLogbook);

// generate endpoint does not require auth for now (could be protected later)
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
