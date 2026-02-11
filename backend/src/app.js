const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/authRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const tpsRoutes = require("./routes/TpsRoutes");
const dusunRoutes = require("./routes/DusunRoutes");
const jadwalRoutes = require("./routes/JadwalRoutes");

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/laporan', laporanRoutes)
app.use('/api/tps', tpsRoutes)
app.use("/uploads", express.static("uploads"))
app.use("/api/dusun", dusunRoutes)
app.use("/api/jadwal", jadwalRoutes)


app.get("/test", (req, res) => {
    res.json({ satus: 'oke'})
});

module.exports = app;