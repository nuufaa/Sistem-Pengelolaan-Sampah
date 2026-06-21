const express = require("express");
const router = express.Router()

const petugas = require("../controllers/petugasController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", auth, isAdmin(["admin"]), petugas.createPetugas);
router.get("/", auth, isAdmin(["admin", "kadus", "kades"]), petugas.getAllPetugas);
router.get("/:id", auth, petugas.getPetugasById);
router.put("/:id", auth, isAdmin(["admin"]), petugas.updatePetugas);
router.delete("/:id", auth, isAdmin(["admin"]), petugas.deletePetugas);

module.exports = router;
