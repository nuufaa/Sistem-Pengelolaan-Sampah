const express = require("express");
const router = express.Router();

const jadwal = require("../controllers/JadwalContoller");
const auth = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/RoleMiddleware");

router.post("/", auth, role(["admin"]), jadwal.createJadwal);
router.get("/", auth, role(["admin"]), jadwal.getAllJadwal);
router.put("/:id", auth, role(["admin"]), jadwal.updateJadwal);
router.delete("/:id", auth, role(["admin"]), jadwal.deleteJadwal);

module.exports = router;
