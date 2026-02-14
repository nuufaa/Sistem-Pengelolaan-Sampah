const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/AuthRoutes");
const laporanRoutes = require("./routes/LaporanRoutes");
const tpsRoutes = require("./routes/TpsRoutes");
const dusunRoutes = require("./routes/DusunRoutes");
const jadwalRoutes = require("./routes/JadwalRoutes");
const kendaraanRoutes = require("./routes/KendaraanRoutes");

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/lapor', laporanRoutes)
app.use('/api/tps', tpsRoutes)
app.use("/uploads", express.static("uploads"))
app.use("/api/dusun", dusunRoutes)
app.use("/api/jadwal", jadwalRoutes)
app.use("/api/kendaraan", kendaraanRoutes)


app.get("/test", (req, res) => {
    res.json({ satus: 'oke'})
});

module.exports = app;