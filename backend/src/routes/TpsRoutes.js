const express = require("express");
const router = express.Router();

const tpsController = require("../controllers/TpsController");
const auth = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/ValidateMiddleware");
const upload = require("../middlewares/UploadMiddleware")

router.post("/", auth, role(["admin"]), upload.single("foto_tps"), tpsController.createTps);
router.get("/", auth, role(["admin"]), tpsController.getAllTps);
router.get("/:id", auth, tpsController.getTpsById);
router.put("/:id", auth, role(["admin"]), upload.single("foto_tps"), tpsController.updateTps);
router.delete("/:id", auth, role(["admin"]), tpsController.deleteTps);

router.get("/map", auth, tpsController.getTpsMap);
router.get("/statistics", auth, tpsController.getTpsStatistics);

module.exports = router;
