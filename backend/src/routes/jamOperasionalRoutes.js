const express = require("express");
const router = express.Router()

const jamOperasional = require("../controllers/jamOperasionalController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", auth, isAdmin(["admin"]), jamOperasional.createJamOperasional);
router.get("/", jamOperasional.getAllJamOperasional);
router.put("/:id", auth, isAdmin(["admin"]), jamOperasional.updateJamOperasional);
router.delete("/:id", auth, isAdmin(["admin"]), jamOperasional.deleteJamOperasional);

module.exports = router;
