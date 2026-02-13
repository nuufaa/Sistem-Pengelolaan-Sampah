const express = require("express");
const router = express.Router()

const dusun = require("../controllers/DusunController");
const { auth, isAdmin } = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/ValidateMiddleware");

router.post("/", auth, isAdmin(["admin"]), dusun.createDusun);
router.get("/", dusun.getAllDusun);
router.get("/:id", auth, dusun.getDusunById);
router.put("/:id", auth, isAdmin(["admin"]), dusun.updateDusun);
router.delete("/:id", auth, isAdmin(["admin"]), dusun.deleteDusun);

module.exports = router;