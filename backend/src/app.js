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
const { startScheduler } = require("./service/JadwalTugasService");

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/lapor', laporanRoutes)
app.use('/api/tps', tpsRoutes)
app.use("/uploads", express.static("uploads"))
app.use("/api/dusun", dusunRoutes)
app.use("/api/jadwal", jadwalRoutes)
app.use("/api/kendaraan", kendaraanRoutes)
app.use("/api/daftar-tugas", daftarTugasRoutes);

startScheduler();

app.get("/test", (req, res) => {
    res.json({ satus: 'oke'})
});

module.exports = app;