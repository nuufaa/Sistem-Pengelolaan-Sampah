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
const completedData = ref([])

async function fetchDaftarTugas() {
  try {
    const [incompleteRes, completedRes] = await Promise.all([
      api.get('/api/daftar-tugas'),
      api.get('/api/daftar-tugas/history/completed')
    ])

    pengambilanData.value = incompleteRes.data || []
    completedData.value = completedRes.data || []
  } catch (error) {
    console.error("Gagal ambil kepatuhan", error)
    pengambilanData.value = []
    completedData.value = []
  }
}

onMounted(fetchDaftarTugas)

const hariLabel = (hariStr) => {
  if (!hariStr) return '-'
  if (/[a-zA-Z]/.test(hariStr)) return hariStr
  
  const labels = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
  return hariStr.split(',').map(h => {
    const idx = parseInt(h.trim())
    return labels[idx] || h
  }).join(', ')
}

function normalizeDate(date) {
  if (!date) return new Date()
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(0, 0, 0, 0)
  d.setSeconds(0, 0, 0, 0)
  d.setMilliseconds(0)
  return d
}

function selisihHari(date1, date2) {
  const d1 = normalizeDate(date1)
  const d2 = normalizeDate(date2)

  const diffTime = d2 - d1
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const kepatuhanList = computed(() => {
  const today = normalizeDate(new Date())
  const allTasks = [...pengambilanData.value, ...completedData.value]

  return allTasks
    .map(item => {
      // Abaikan jika jadwal tidak valid (dihapus atau tidak aktif)
      if (!item.id_jadwal || 
          item.hari_pengambilan === "Jadwal Dihapus" || 
          item.hari_pengambilan === "Jadwal Aktif") {
        return null
      }

      const scheduledDate = normalizeDate(item.tgl_pengambilan)
      const completedDate = item.tgl_terakhir_diambil
        ? normalizeDate(item.tgl_terakhir_diambil)
        : null

      const isCompleted = item.status_angkut === 'selesai'
      let onTime = false
      let statusText = ''
      let show = false

      if (isCompleted && completedDate) {
        const diffDays = selisihHari(scheduledDate, completedDate)
        onTime = diffDays <= 0
        show = true
        statusText = onTime
          ? 'Tepat Waktu'
          : diffDays === 1
            ? 'Terlambat 1 Hari'
            : `Terlambat ${diffDays} Hari`
      } else {
        const diffDays = selisihHari(scheduledDate, today)
        if (diffDays > 0) {
          onTime = false
          show = true
          statusText = diffDays === 1
            ? 'Terlambat 1 Hari'
            : `Terlambat ${diffDays} Hari`
        }
      }

      if (!show) {
        return null
      }

      return {
        id: item.id,
        nama_tps: item.nama_tps,
        hari_pengambilan: hariLabel(item.hari_pengambilan),
        tgl_terakhir_diambil: completedDate
          ? completedDate.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          : '-',
        onTime,
        statusText
      }
    })
    .filter(item => item !== null)
})

const tepatCount = computed(() =>
  kepatuhanList.value.filter(item => item.onTime).length
)

const terlambatCount = computed(() =>
  kepatuhanList.value.filter(item => !item.onTime).length
)
</script>

<style scoped src="@/assets/styles/petugas.css"></style>
