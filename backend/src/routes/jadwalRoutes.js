const express = require("express");
const router = express.Router();

const jadwal = require("../controllers/jadwalContoller");
const {auth, isAdmin} = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const { validateCreateJadwal } = require("../middlewares/validateJadwalMiddleware");

router.post("/", auth, isAdmin(["admin"]), validateCreateJadwal, jadwal.createJadwal);
router.get("/", auth, isAdmin(["admin"]), jadwal.getAllJadwal);
router.put("/:id", auth, isAdmin(["admin"]), jadwal.updateJadwal);
router.delete("/:id", auth, isAdmin(["admin"]), jadwal.deleteJadwal);

module.exports = router;
