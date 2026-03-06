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
              Jadwal {{ item.hari_pengambilan }} hari sekali •
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
          Tidak ada keterlambatan pengambilan 🎉
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const pengambilanData = ref([])

// async function fetchKepatuhan() {
//   try {
//     const res = await api.get('/api/kepatuhan')
//     pengambilanData.value = res.data
//   } catch (error) {
//     console.error("Gagal ambil kepatuhan", error)
//   }
// }

async function fetchDaftarTugas() {
  try {
    const res = await api.get('/api/daftar-tugas')
    pengambilanData.value = res.data
  } catch (error) {
    console.error("Gagal ambil kepatuhan", error)
  }
}

onMounted(fetchDaftarTugas)

const kepatuhanList = computed(() => {
  return pengambilanData.value
    .map(item => {

      const last = new Date(item.tgl_terakhir_diambil)

      return {
        id: item.id,
        nama_tps: item.nama_tps,
        // desa: item.desa,
        hari_pengambilan: item.hari_pengambilan,
        tgl_terakhir_diambil: last.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        onTime: item.terlambatHari === 0,
        statusText:
          item.terlambatHari === 0
            ? "Tepat Waktu"
            : item.terlambatHari === 1
              ? "Terlambat 1 Hari"
              : `Terlambat ${item.terlambatHari} Hari`
      }

    })
    // .filter(item => !item.onTime)
})

const tepatCount = computed(
  () => pengambilanData.value.length - kepatuhanList.value.length
)

const terlambatCount = computed(
  () => kepatuhanList.value.length
)
</script>

<style scoped src="@/assets/styles/petugas.css"></style>
