const express = require("express");
const router = express.Router()

const dashboard = require("../controllers/dashboardController");
const dashboardPetugas = require("../controllers/dashboardController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.get('/', auth, isAdmin(["admin"]), dashboard.getDashboard);
router.get('/petugas', auth, isAdmin(["petugas"]), dashboardPetugas.getDashboardPetugas);

module.exports = router;