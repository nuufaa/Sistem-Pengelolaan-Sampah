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
          <label>TPS yang Dikunjungi</label>
          <div class="checkbox-group">
            <label
              v-for="tps in tpsList"
              :key="tps.id_tps"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="tps.id_tps"
                v-model="form.tpsVisited"
              />
              {{ tps.nama_tps }}
            </label>
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
            <div v-for="vehicle in todayLogbook" :key="vehicle.id_kendaraan" class="today-vehicle-card">
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
  tpsVisited: []
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

const todayLogbook = computed(() => {
  if (!daftarTugas.value.length) {
    console.log('[DEBUG] todayLogbook: no data')
    return []
  }

  const todayString = getTodayDateString()
  console.log('[DEBUG] todayLogbook filtering for:', todayString)
  
  const todayData = daftarTugas.value.filter(item => {
    // Hanya tampilkan yang KENDARAANNYA SUDAH DIPILIH (aktif)
    if (!item.id_kendaraan) return false
    
    // Jika sudah selesai (biasanya masuk riwayat), pastikan selesainya hari ini
    // agar riwayat hari-hari sebelumnya tidak muncul di "Kendaraan Hari Ini"
    if (item.tgl_terakhir_diambil) {
      let completedDateStr
      if (item.tgl_terakhir_diambil.includes('T')) {
        const date = new Date(item.tgl_terakhir_diambil)
        const localYear = date.getFullYear()
        const localMonth = String(date.getMonth() + 1).padStart(2, '0')
        const localDay = String(date.getDate()).padStart(2, '0')
        completedDateStr = `${localYear}-${localMonth}-${localDay}`
      } else {
        completedDateStr = item.tgl_terakhir_diambil
      }
      return completedDateStr === todayString
    }
    
    // Jika KENDARAAN SUDAH DIPILIH dan BELUM SELESAI, selalu tampilkan
    // (meskipun tgl_pengambilan / jadwalnya bukan hari ini)
    return true
  })

  console.log('[DEBUG] todayLogbook found:', todayData.length, 'items')

  if (!todayData.length) return []
  
  // Group by vehicle (id_kendaraan)
  const grouped = {}
  todayData.forEach(item => {
    const vehicleId = item.id_kendaraan
    
    if (!grouped[vehicleId]) {
      grouped[vehicleId] = {
        id_kendaraan: vehicleId,
        nomor_kendaraan: item.nomor_kendaraan,
        nama: item.nama,
        tpsVisited: []
      }
    }
    
    grouped[vehicleId].tpsVisited.push(item.nama_tps)
  })
  
  return Object.values(grouped)
})

const historyLogbook = computed(() => {
  if (!daftarTugas.value.length) return []

  const grouped = {}
  const todayStr = getTodayDateString() // tambahkan ini

  daftarTugas.value.forEach(item => {
    // ONLY include items that have tgl_terakhir_diambil (completed tasks)
    if (!item.tgl_terakhir_diambil) return

    // FIX: Parse ISO string as Date object, then get LOCAL date components
    let tglStr
    if (item.tgl_terakhir_diambil && item.tgl_terakhir_diambil.includes('T')) {
      const date = new Date(item.tgl_terakhir_diambil)
      const localYear = date.getFullYear()
      const localMonth = String(date.getMonth() + 1).padStart(2, '0')
      const localDay = String(date.getDate()).padStart(2, '0')
      tglStr = `${localYear}-${localMonth}-${localDay}`
    } else {
      tglStr = item.tgl_terakhir_diambil
    }

    if (tglStr === todayStr) return // tambahkan ini — skip data hari ini
    const key = tglStr + "-" + item.id_kendaraan

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        tanggal: tglStr,  // Simpan dalam format YYYY-MM-DD (local date dari tgl_terakhir_diambil)
        kendaraan: item.nomor_kendaraan,
        tpsVisited: [],
        nama: item.nama
      }
    }

    grouped[key].tpsVisited.push(item.nama_tps)
  })

  // FIX: Sort menggunakan string comparison (lebih akurat untuk YYYY-MM-DD)
  return Object.values(grouped).sort((a, b) => {
    return b.tanggal.localeCompare(a.tanggal)
  })
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
  
  if (!form.tpsVisited.length) {
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
      tpsVisited: form.tpsVisited
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
  form.tpsVisited = []
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

onMounted(() => {
  fetchKendaraan()
  fetchTPS()
  fetchDaftarTugas()
})

</script>

<style scoped src="@/assets/styles/petugas.css"></style>

<style scoped>
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
</style>