const JadwalModel = require("../models/jadwalModel");

async function createJadwalHari(data) {
  
  return await JadwalModel.create(data);

}

module.exports = {
  createJadwalHari
};
