const express = require("express");
const router = express.Router()

const dusun = require("../controllers/DusunController");
const { auth, isAdmin } = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/ValidateMiddleware");

router.post("/", auth, isAdmin, dusun.createDusun);
router.get("/", dusun.getAllDusun);
router.get("/:id", auth, dusun.getDusunById);
router.put("/:id", auth, isAdmin, dusun.updateDusun);
router.delete("/:id", auth, isAdmin, dusun.deleteDusun);

module.exports = router;