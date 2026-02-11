const express = require("express");
const router = express.Router()

const dusun = require("../controllers/DusunController");
const auth = require("../middlewares/AuthMiddleware");
const role = require("../middlewares/ValidateMiddleware");

router.post("/", auth, role(["admin"]), dusun.createDusun);
router.get("/", dusun.getAllDusun);
router.get("/:id", auth, dusun.getDusunById);
router.put("/:id", auth, role(["admin"]), dusun.updateDusun);
router.delete("/:id", auth, role(["admin"]), dusun.deleteDusun);

module.exports = router;