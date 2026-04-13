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

      <!-- RIWAYAT -->
      <div class="logbook-history">
        <h3>Riwayat Logbook</h3>

        <div v-if="historyLogbook.length" class="logbook-list">
          <div
            v-for="log in historyLogbook"
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
          Belum ada riwayat logbook
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
  
  // FIX: Parse ISO string as Date, then get LOCAL date components
  // Don't split on T because date part is always UTC
  const todayData = daftarTugas.value.filter(item => {
    if (!item.tgl_pengambilan) return false
    
    let itemDateStr
    if (item.tgl_pengambilan.includes('T')) {
      // Parse ISO string: 2026-04-11T16:00:00.000Z
      const date = new Date(item.tgl_pengambilan)
      const localYear = date.getFullYear()
      const localMonth = String(date.getMonth() + 1).padStart(2, '0')
      const localDay = String(date.getDate()).padStart(2, '0')
      itemDateStr = `${localYear}-${localMonth}-${localDay}`
    } else {
      itemDateStr = item.tgl_pengambilan
    }
    
    const isMatch = itemDateStr === todayString && item.id_kendaraan
    console.log(`[DEBUG]   item date: ${itemDateStr} (local), todayString: ${todayString}, kendaraan: ${item.nomor_kendaraan}, match: ${isMatch}`)
    return isMatch
  })

  console.log('[DEBUG] todayLogbook found:', todayData.length, 'items')

  if (!todayData.length) return []
  
  // FIX: Group by vehicle (id_kendaraan) - sama seperti historyLogbook
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
    const res = await api.get('/api/daftar-tugas')
    
    console.log('[DEBUG] fetchDaftarTugas Response:', res.data.length, 'items')
    res.data.forEach((item, idx) => {
      console.log(`  [${idx}] tgl: ${item.tgl_pengambilan}, kendaraan: ${item.nomor_kendaraan}, status: ${item.status_angkut}`)
    })
    
    daftarTugas.value = res.data
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