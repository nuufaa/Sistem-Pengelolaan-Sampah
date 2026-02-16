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
            <h4>{{ item.namaTPS }}</h4>
            <p>
              Desa {{ item.desa }} • Jadwal {{ item.interval }} hari sekali •
              Terakhir diambil: {{ item.terakhirDiambil }}
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
          Tidak ada keterlambatan pengambilan 🎉
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

/* =====================
   SOURCE DATA (DUMMY)
   nanti ganti dari API / Pinia
===================== */
const pengambilanData = [
  {
    id: 1,
    tps: { nama: 'TPS A1 - Pasar Utara', desa: 'Desa A' },
    interval: 3,
    lastPickup: '2026-01-13'
  },
  {
    id: 2,
    tps: { nama: 'TPS A2 - Masjid Besar', desa: 'Desa A' },
    interval: 2,
    lastPickup: '2026-01-10'
  },
  {
    id: 3,
    tps: { nama: 'TPS A3 - Sekolah Dasar', desa: 'Desa A' },
    interval: 4,
    lastPickup: '2026-01-05'
  }
]

/* =====================
   COMPUTED: KEPATUHAN
===================== */
const kepatuhanList = computed(() => {
  const today = new Date()

  return pengambilanData
    .map(item => {
      const last = new Date(item.lastPickup)
      const daysDiff = Math.floor(
        (today - last) / (1000 * 60 * 60 * 24)
      )

      const terlambat = Math.max(0, daysDiff - item.interval)
      const onTime = terlambat === 0

      return {
        id: item.id,
        namaTPS: item.tps.nama,
        desa: item.tps.desa,
        interval: item.interval,
        terakhirDiambil: last.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        onTime,
        statusText: onTime
          ? 'Tepat Waktu'
          : terlambat === 1
            ? 'Terlambat 1 Hari'
            : `Terlambat ${terlambat} Hari`
      }
    })
    .filter(item => !item.onTime)
    .sort((a, b) => {
      const getDay = s => parseInt(s.match(/\d+/))
      return getDay(b.statusText) - getDay(a.statusText)
    })
})

/* =====================
   SUMMARY
===================== */
const tepatCount = computed(
  () => pengambilanData.length - kepatuhanList.value.length
)

const terlambatCount = computed(
  () => kepatuhanList.value.length
)
</script>

<style scoped src="@/assets/styles/petugas.css"></style>
