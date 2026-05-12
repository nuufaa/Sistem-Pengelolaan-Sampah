const express = require("express");
const router = express.Router();

const tpsController = require("../controllers/tpsController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");
const role = require("../middlewares/validateMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post("/", auth, isAdmin(["admin"]), upload.single("foto_tps"), tpsController.createTps);
router.get("/", tpsController.getAllTps);
router.get("/info", tpsController.getAllTpsJadwal);
router.get("/status", tpsController.getStatusTPS);
router.get("/:id", auth, tpsController.getTpsById);
router.put("/:id", auth, isAdmin(["admin"]), upload.single("foto_tps"), tpsController.updateTps);
router.delete("/:id", auth, isAdmin(["admin"]), tpsController.deleteTps);


module.exports = router;
