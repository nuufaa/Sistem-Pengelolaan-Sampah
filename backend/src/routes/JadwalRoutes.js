const express = require("express");
const router = express.Router();

const jadwal = require("../controllers/JadwalContoller");
const {auth, isAdmin} = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/RoleMiddleware");

router.post("/", auth, isAdmin(["admin"]), jadwal.createJadwal);
router.get("/", auth, isAdmin(["admin"]), jadwal.getAllJadwal);
router.put("/:id", auth, isAdmin(["admin"]), jadwal.updateJadwal);
router.delete("/:id", auth, isAdmin(["admin"]), jadwal.deleteJadwal);

module.exports = router;
