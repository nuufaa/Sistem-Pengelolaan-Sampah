const JadwalModel = require("../model/jadwalModel");
const { toIndex } = require("../utils/hariJadwal");

async function createJadwalHari(data) {
  const hariIndex = toIndex(data.hari_pengambilan);

  return await JadwalModel.create({
    ...data,
    hari_pengambilan: hariIndex
  });
}

module.exports = {
  createJadwalHari
};
