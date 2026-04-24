<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Logbook Kendaraan</h2>
      <!-- <div class="header-date">{{ todayLabel }}</div> -->
    </div>

    <!-- FORM TAMBAH LOGBOOK -->
    <div class="logbook-form-card">
      <div class="form-card-header">
        <span class="material-icons">add_circle</span>
        <h3>Tambah Logbook Baru</h3>
      </div>

      <form class="logbook-form" @submit.prevent="submitLogbook">
        <div class="form-row">
          <div class="form-group">
            <label>Pilih Kendaraan</label>
            <select v-model="form.id_kendaraan" class="form-control" required>
              <option value="">-- Pilih Kendaraan --</option>
              <option
                v-for="k in kendaraanList"
                :key="k.nomor_kendaraan"
                :value="k.id_kendaraan"
              >
                {{ k.nomor_kendaraan }} ({{ k.nomor_polisi }})
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>TPS yang Dikunjungi (Belum Diambil)</label>
          <div v-if="pendingTasks.length" class="checkbox-group">
            <label
              v-for="task in pendingTasks"
              :key="task.id"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="task.id"
                v-model="form.tasksSelected"
              />
              <span class="tps-name">{{ task.nama_tps }}</span>
              <span class="task-date">({{ formatDateShort(task.tgl_pengambilan) }})</span>
            </label>
          </div>
          <div v-else class="no-tasks-info">
            Semua tugas Anda sudah memiliki logbook.
          </div>
        </div>

        <div class="form-footer">
          <button type="button" class="btn-secondary" @click="resetForm">
            Reset
          </button>

          <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? "Menyimpan..." : "Simpan Logbook" }}
        </button>
        </div>
      </form>
    </div>

    <!-- KENDARAAN HARI INI -->
    <div class="logbook-container">
      <div class="logbook-card">
        <div class="logbook-header">
          <span class="material-icons">local_shipping</span>
          <h3>Kendaraan Hari Ini</h3>
        </div>

        <div class="logbook-body">
          <!-- KENDARAAN HARI INI - Tampilkan semua kendaraan yang digunakan hari ini -->
          <template v-if="todayLogbook.length > 0">
            <div 
              v-for="vehicle in todayLogbook" 
              :key="vehicle.id_kendaraan + (vehicle.tgl_terakhir_diambil || 'active')" 
              class="today-vehicle-card"
            >
              <div class="logbook-info-item">
                <span class="label">Kendaraan</span>
                <span class="value">{{ vehicle.nomor_kendaraan }}</span>
              </div>
              <div class="logbook-info-item">
                <span class="label">Petugas</span>
                <span class="value">{{ vehicle.nama }}</span>
              </div>
              <div class="logbook-info-item">
                <span class="label">Jumlah TPS</span>
                <span class="value">{{ vehicle.tpsVisited.length }} TPS</span>
              </div>
              <div class="logbook-info-item">
                <span class="label">Tanggal</span>
                <span class="value">{{ formatDate(vehicle.tgl_terakhir_diambil || getTodayDateString()) }}</span>
              </div>
              <div class="logbook-info-item">
                <span class="label">TPS</span>
                <span class="value">
                  {{ vehicle.tpsVisited.join(', ') }}
                </span>
              </div>
            </div>
          </template>

          <div v-else class="no-logbook">
            Belum ada aktivitas hari ini
          </div>
        </div>
      </div>

      <div class="logbook-history">
        <div class="history-header">
          <h3>Riwayat Logbook</h3>
          <div class="search-box">
            <span class="material-icons">search</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari kendaraan, petugas, atau TPS..." 
              class="form-control-search"
            />
          </div>
        </div>

        <div v-if="filteredHistoryLogbook.length" class="logbook-list">
          <div
            v-for="log in filteredHistoryLogbook"
            :key="log.id"
            class="logbook-item"
          >
            <div class="logbook-item-header">
              <h4>{{ log.kendaraan }}</h4>
              <span class="logbook-item-date">{{ formatDate(log.tanggal) }}</span>
            </div>

            <div class="logbook-item-body">
              <div class="logbook-item-row">
                <span class="label">Petugas</span>
                <span class="value">{{ log.nama }}</span>
              </div>
              <div class="logbook-item-row">
                <span class="label">Jumlah TPS</span>
                <span class="value">{{ log.tpsVisited.length }} TPS</span>
              </div>
              <div class="logbook-item-row">
                <span class="label">TPS</span>
                <span class="value">{{ log.tpsVisited.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-logbook">
          {{ searchQuery ? 'Pencarian tidak ditemukan' : 'Belum ada riwayat logbook' }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'

const kendaraanList = ref([])
const tpsList = ref([])
const daftarTugas = ref([])
const loading = ref(false)

const form = reactive({
  id_kendaraan: '',
  tasksSelected: []
})

const searchQuery = ref('')

// FIX: Helper function untuk get hari ini dalam format YYYY-MM-DD
function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`
  
  console.log('[DEBUG] getTodayDateString():', todayStr, 'Raw Date:', today)
  
  return todayStr
}

// Helper untuk mendapatkan string YYYY-MM-DD lokal dari input tanggal
function getLocalDateString(dateInput) {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return '' // Invalid date
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayLogbook = computed(() => {
  if (!daftarTugas.value.length) return []

  const todayString = getTodayDateString()
  const todayData = daftarTugas.value.filter(item => {
    const taskDate = getLocalDateString(item.tgl_pengambilan)
    const finishDate = getLocalDateString(item.tgl_terakhir_diambil)

    // Tampilkan di 'Hari Ini' jika:
    // 1. Jadwalnya Hari Ini (Meskipun belum ada kendaraan)
    // 2. Baru saja diselesaikan Hari Ini
    // 3. Sedang aktif dikerjakan (ada kendaraan tapi belum selesai)
    return (taskDate === todayString) || 
           (finishDate === todayString) || 
           (item.id_kendaraan && item.status_angkut !== 'selesai')
  })

  const grouped = {}
  todayData.forEach(item => {
    const dateKey = item.tgl_terakhir_diambil 
      ? getLocalDateString(item.tgl_terakhir_diambil)
      : 'active'
    
    const vehicleId = item.id_kendaraan || 'unassigned'
    const groupKey = `${vehicleId}-${dateKey}`
    
    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        id_kendaraan: vehicleId,
        nomor_kendaraan: item.nomor_kendaraan || 'Belum Ada Kendaraan',
        nama: item.nama || '-',
        tgl_terakhir_diambil: item.tgl_terakhir_diambil,
        tpsVisited: []
      }
    }
    
    if (!grouped[groupKey].tpsVisited.includes(item.nama_tps)) {
      grouped[groupKey].tpsVisited.push(item.nama_tps)
    }
  })
  
  return Object.values(grouped).sort((a, b) => {
    if (a.id_kendaraan === 'unassigned') return -1
    if (b.id_kendaraan === 'unassigned') return 1
    return 0
  })
})

const historyLogbook = computed(() => {
  if (!daftarTugas.value.length) return []

  const todayStr = getTodayDateString()
  const grouped = {}

  daftarTugas.value.forEach(item => {
    // Abaikan jika belum ada kendaraannya (belum masuk logbook)
    if (!item.id_kendaraan) return

    const taskDate = item.tgl_pengambilan?.substring(0, 10)
    const finishDate = item.tgl_terakhir_diambil?.substring(0, 10)

    // Masuk Riwayat jika: 
    // - SUDAH selesai (dan selesainya bukan hari ini)
    // - BELUM selesai (tapi jadwalnya sudah lewat/kemarin)
    const isPastTask = taskDate < todayStr
    const isPastFinish = finishDate && finishDate !== todayStr
    
    if (isPastTask || isPastFinish) {
      const tglStr = finishDate || taskDate
      const key = `${tglStr}-${item.id_kendaraan}`

      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          tanggal: tglStr,
          kendaraan: item.nomor_kendaraan,
          tpsVisited: [],
          nama: item.nama
        }
      }

      if (!grouped[key].tpsVisited.includes(item.nama_tps)) {
        grouped[key].tpsVisited.push(item.nama_tps)
      }
    }
  })

  return Object.values(grouped).sort((a, b) => b.tanggal.localeCompare(a.tanggal))
})

const filteredHistoryLogbook = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return historyLogbook.value

  return historyLogbook.value.filter(log => {
    const dateFormatted = formatDate(log.tanggal).toLowerCase()
    const vehicleMatch = log.kendaraan.toLowerCase().includes(query)
    const officerMatch = log.nama.toLowerCase().includes(query)
    const tpsMatch = log.tpsVisited.some(tps => tps.toLowerCase().includes(query))
    const dateMatch = dateFormatted.includes(query)
    
    return vehicleMatch || officerMatch || tpsMatch || dateMatch
  })
})


const pendingTasks = computed(() => {
  return daftarTugas.value
    .filter(item => item.status_angkut !== 'selesai')
    .map(item => ({
      id: item.id, // ini id_daftar_tugas
      id_tps: item.id_tps,
      nama_tps: item.nama_tps,
      tgl_pengambilan: item.tgl_pengambilan
    }))
})

async function fetchKendaraan() {
  const res = await api.get('/api/kendaraan')
  kendaraanList.value = res.data
}

async function fetchTPS() {
  const res = await api.get('/api/tps')
  tpsList.value = res.data
}

async function fetchDaftarTugas() {
  try {
    const [resActive, resHistory] = await Promise.all([
      api.get('/api/daftar-tugas'),
      api.get('/api/daftar-tugas/history/completed')
    ])
    
    // Gabungkan data yang masih aktif dan yang sudah selesai
    // agar todayLogbook dan historyLogbook punya data yang lengkap
    daftarTugas.value = [...resActive.data, ...resHistory.data]
    
    console.log('[DEBUG] fetchDaftarTugas: Loaded', resActive.data.length, 'active and', resHistory.data.length, 'completed tasks.')
  } catch (error) {
    console.error('[ERROR] fetchDaftarTugas:', error)
  }
}

async function submitLogbook() {
  
  if (!form.id_kendaraan) {
    alert("Pilih kendaraan terlebih dahulu")
    return
  }
  
  if (!form.tasksSelected.length) {
    alert("Pilih minimal satu TPS")
    return
  }
  
  loading.value = true
  
  try {
    console.log('[DEBUG] submitLogbook: sending request')
    console.log('[DEBUG]   id_kendaraan:', form.id_kendaraan)
    console.log('[DEBUG]   tpsVisited:', form.tpsVisited)
    
    await api.put('/api/daftar-tugas/logbook', {
      id_kendaraan: form.id_kendaraan,
      tasksSelected: form.tasksSelected
    })

    console.log('[DEBUG] submitLogbook: request success')
    alert("Logbook berhasil disimpan")
    resetForm()
    
    // FIX: Tunggu lebih lama untuk ensure database fully updated
    console.log('[DEBUG] submitLogbook: waiting 1 second before refresh...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('[DEBUG] submitLogbook: fetching data...')
    await fetchDaftarTugas()
    console.log('[DEBUG] submitLogbook: complete')

  } catch (error) {
    console.error("[ERROR] submitLogbook:", error)
    alert(error.response?.data?.message || "Gagal menyimpan logbook")
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.id_kendaraan = ""
  form.tasksSelected = []
}

function formatDate(date) {
  if (!date) return '-'

  // FIX: Handle both ISO format and plain YYYY-MM-DD strings
  let dateStr = date
  
  // Jika ada T (ISO format), extract date part. But it's UTC date, not local
  if (date.includes('T')) {
    // For ISO strings, we need to parse to local date
    const d = new Date(date)
    const localYear = d.getFullYear()
    const localMonth = String(d.getMonth() + 1).padStart(2, '0')
    const localDay = String(d.getDate()).padStart(2, '0')
    dateStr = `${localYear}-${localMonth}-${localDay}`
  }
  
  // Now dateStr is in YYYY-MM-DD format (local date)
  // Convert to Date object for formatting
  const [year, month, day] = dateStr.split('-')
  const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC' // Explicit timezone untuk format yang consistent
  })
}

function formatDateShort(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  })
}

onMounted(() => {
  fetchKendaraan()
  fetchTPS()
  fetchDaftarTugas()
})

</script>

<style scoped src="@/assets/styles/petugas.css"></style>

<style scoped>
.task-date {
  font-size: 0.8rem;
  color: #757575;
  margin-left: 4px;
}

.no-tasks-info {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.history-header h3 {
  margin: 0 !important;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box .material-icons {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
  font-size: 20px;
}

.form-control-search {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-control-search:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

@media (max-width: 600px) {
  .history-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .search-box {
    max-width: none;
  }
}

.font-bold {
  font-weight: 700;
}
</style>