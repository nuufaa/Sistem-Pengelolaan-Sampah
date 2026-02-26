const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/authRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const tpsRoutes = require("./routes/tpsRoutes");
const dusunRoutes = require("./routes/dusunRoutes");
const jadwalRoutes = require("./routes/jadwalRoutes");
const kendaraanRoutes = require("./routes/kendaraanRoutes");
const daftarTugasRoutes = require("./routes/daftarTugasRoutes");
const petugasRoutes = require("./routes/petugasRoutes");
const { startScheduler } = require("./services/daftarTugasOtomatisService");

// app.use(cors());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/lapor', laporanRoutes)
app.use('/api/tps', tpsRoutes)
app.use("/uploads", express.static("uploads"))
app.use("/api/dusun", dusunRoutes)
app.use("/api/jadwal", jadwalRoutes)
app.use("/api/kendaraan", kendaraanRoutes)
app.use("/api/daftar-tugas", daftarTugasRoutes);
app.use("/api/petugas", petugasRoutes);

startScheduler();

app.get("/test", (req, res) => {
    res.json({ satus: 'oke'})
});

module.exports = app;