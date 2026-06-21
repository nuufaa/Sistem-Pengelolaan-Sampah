const express = require("express");
const router = express.Router()

const kendaraan = require("../controllers/kendaraanController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", auth, isAdmin(["admin"]), kendaraan.createKendaraan);
router.get("/", auth, isAdmin(["admin", "petugas", "kadus", "kades"]), kendaraan.getAllKendaraan);
router.get("/:id", auth, isAdmin(["admin", "petugas", "kadus", "kades"]), kendaraan.getKendaraanById);
router.put("/:id", auth, isAdmin(["admin"]), kendaraan.updateKendaraan);
router.delete("/:id", auth, isAdmin(["admin"]), kendaraan.deleteKendaraan);

module.exports = router;
