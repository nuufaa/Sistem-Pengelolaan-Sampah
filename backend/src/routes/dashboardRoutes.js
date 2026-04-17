const express = require("express");
const router = express.Router()

const dashboard = require("../controllers/dashboardController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.get('/admin', auth, isAdmin(["admin"]), dashboard.getDashboard);
router.get('/', dashboard.getDashboardMas);
router.get('/', dashboard.getDashboardStat);
router.get('/petugas', auth, isAdmin(["petugas"]), dashboard.getDashboardPetugas);
router.get('/kepatuhan/all', auth, isAdmin(["admin"]), dashboard.getKepatuhanAllPetugas);
router.get('/kepatuhan/detail/:id_petugas', auth, isAdmin(["admin"]), dashboard.getDetailKepatuhanPetugasAdmin);
router.get('/kepatuhan/detail', auth, isAdmin(["petugas"]), dashboard.getDetailKepatuhanPetugas);
router.get('/logbook/history', auth, isAdmin(["admin"]), dashboard.getLogbookHistory);
router.get('/logbook/summary', auth, isAdmin(["admin"]), dashboard.getLogbookSummary);

module.exports = router;