const express = require("express");
const router = express.Router()

const dashboard = require("../controllers/dashboardController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.get('/', auth, isAdmin(["admin"]), dashboard.getDashboard);
router.get('/petugas', auth, isAdmin(["petugas"]), dashboard.getDashboardPetugas);

module.exports = router;