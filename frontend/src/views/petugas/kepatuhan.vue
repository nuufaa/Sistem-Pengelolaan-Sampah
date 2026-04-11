<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Kepatuhan Jadwal Pengambilan</h2>
    </div>

    <!-- SUMMARY -->
    <div class="kepatuhan-container">
      <div class="kepatuhan-summary">
        <div class="summary-item tepat">
          <span class="material-icons">check_circle</span>
          <div>
            <h3>{{ tepatCount }}</h3>
            <p>Tepat Waktu</p>
          </div>
        </div>

        <div class="summary-item terlambat">
          <span class="material-icons">warning</span>
          <div>
            <h3>{{ terlambatCount }}</h3>
            <p>Terlambat</p>
          </div>
        </div>
      </div>

      <!-- LIST -->
      <div class="kepatuhan-list">
        <div
          v-for="item in kepatuhanList"
          :key="item.id"
          class="kepatuhan-item"
        >
          <div class="kepatuhan-info">
            <h4>{{ item.nama_tps }}</h4>
            <p>
              Jadwal Hari {{ item.hari_pengambilan }} •
              Terakhir diambil: {{ item.tgl_terakhir_diambil }}
            </p>
          </div>

          <span
            class="kepatuhan-status"
            :class="item.onTime ? 'tepat' : 'terlambat'"
          >
            {{ item.statusText }}
          </span>
        </div>

        <p
          v-if="kepatuhanList.length === 0"
          class="no-logbook"
        >
          Tidak ada keterlambatan pengambilan
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const pengambilanData = ref([])

async function fetchDaftarTugas() {
  try {
    const res = await api.get('/api/daftar-tugas')
    pengambilanData.value = res.data
  } catch (error) {
    console.error("Gagal ambil kepatuhan", error)
  }
}

onMounted(fetchDaftarTugas)

const hariMap = {
  0: "Senin",
  1: "Selasa",
  2: "Rabu",
  3: "Kamis",
  4: "Jumat",
  5: "Sabtu",
  6: "Minggu"
}

function selisihHari(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)

  // Set jam, menit, detik, milidetik jadi 0 supaya cuma tanggal yang dibandingkan
  d1.setHours(0,0,0,0)
  d2.setHours(0,0,0,0)

  const diffTime = d2 - d1
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const kepatuhanList = computed(() => {
  return pengambilanData.value.map(item => {

    const lastDate = item.tgl_terakhir_diambil
      ? new Date(item.tgl_terakhir_diambil)
      : null

    const diffDays = lastDate
      ? selisihHari(item.tgl_pengambilan, item.tgl_terakhir_diambil)
      : null

    return {
      id: item.id,
      nama_tps: item.nama_tps,
      hari_pengambilan: hariMap[item.hari_pengambilan],
      tgl_terakhir_diambil: lastDate
        ? lastDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : "-",

      // onTime: diffDays <= 0,
      onTime: diffDays === null ? false : diffDays <= 0,

       statusText:
        diffDays === null
          ? "Belum Diambil"
          : diffDays <= 0
            ? "Tepat Waktu"
            : diffDays === 1
              ? "Terlambat 1 Hari"
              : `Terlambat ${diffDays} Hari`
    }
  })
})

const tepatCount = computed(() =>
  kepatuhanList.value.filter(item => item.onTime).length
)

const terlambatCount = computed(() =>
  kepatuhanList.value.filter(item => !item.onTime).length
)
</script>

<style scoped src="@/assets/styles/petugas.css"></style>
