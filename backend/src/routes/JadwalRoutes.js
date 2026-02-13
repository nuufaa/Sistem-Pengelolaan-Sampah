const express = require("express");
const router = express.Router();

const jadwal = require("../controllers/JadwalContoller");
const {auth, isAdmin} = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/RoleMiddleware");

router.post("/", auth, isAdmin, jadwal.createJadwal);
router.get("/", auth, isAdmin, jadwal.getAllJadwal);
router.put("/:id", auth, isAdmin, jadwal.updateJadwal);
router.delete("/:id", auth, isAdmin, jadwal.deleteJadwal);

module.exports = router;
