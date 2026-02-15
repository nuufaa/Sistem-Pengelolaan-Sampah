const cron = require("node-cron");
const db = require("../config/db");
const jadwalModel = require("../model/jadwalModel");
const daftarTugasModel = require("../model/daftarTugasModel");

async function generateTugasHarian() {

  const [result] = await db.query(
    "SELECT WEEKDAY(CURDATE()) as hariIndex"
  );

  const hariIndex = result[0].hariIndex;

  const jadwalList = await jadwalModel.findByHari(hariIndex);

  for (const jadwal of jadwalList) {

    await daftarTugasModel.create({
      id_jadwal: jadwal.id_jadwal,
      id_petugas: jadwal.id_petugas,
      id_tps: jadwal.id_tps
    });

  }

  console.log("Generate tugas selesai");
}

function startScheduler() {
  cron.schedule("0 0 * * *", generateTugasHarian);
}

module.exports = {
  startScheduler
};
