const express = require("express");
const router = express.Router();

const tpsController = require("../controllers/TpsController");
const { auth, isAdmin } = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/ValidateMiddleware");
const upload = require("../middlewares/UploadMiddleware")

router.post("/", auth, isAdmin, upload.single("foto_tps"), tpsController.createTps);
router.get("/", auth, isAdmin, tpsController.getAllTps);
router.get("/:id", auth, tpsController.getTpsById);
router.put("/:id", auth, isAdmin, upload.single("foto_tps"), tpsController.updateTps);
router.delete("/:id", auth, isAdmin, tpsController.deleteTps);

// router.get("/map", auth, tpsController.getTpsMap);
router.get("/statistics", tpsController.getTpsStatistics);

module.exports = router;
