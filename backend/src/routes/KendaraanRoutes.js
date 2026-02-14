const express = require("express");
const router = express.Router()

const kendaraan = require("../controllers/kendaraanController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");

router.post("/", auth, isAdmin(["admin"]), kendaraan.createKendaraan);
router.get("/", isAdmin(["admin", "petugas"]), kendaraan.getAllKendaraan);
router.get("/:id", auth, isAdmin(["admin", "petugas"]), kendaraan.getKendaraanById);
router.put("/:id", auth, isAdmin(["admin"]), kendaraan.updateKendaraan);
router.delete("/:id", auth, isAdmin(["admin"]), kendaraan.deleteKendaraan);

module.exports = router;