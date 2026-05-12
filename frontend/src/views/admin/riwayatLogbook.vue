<template>
  <section class="content-section active">

    <!-- HEADER -->
    <div class="section-header">
      <div>
        <h2>Riwayat Logbook Kendaraan</h2>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="filter-bar">
      <div class="search-wrapper">
        <span class="material-icons search-icon">search</span>
        <input
          v-model="filter.search"
          type="text"
          placeholder="Cari kendaraan, petugas..."
          class="search-input"
        />
        <button v-if="filter.search" class="clear-btn" @click="filter.search = ''">
          <span>close</span>
        </button>
      </div>

      <div class="filter-group">
        <div class="date-field">
          <span class="date-label">Dari</span>
          <div class="date-input-wrapper">
            <span class="material-icons date-icon">calendar_today</span>
            <input v-model="filter.start_date" type="date" class="filter-date" @change="fetchLogbook" />
          </div>
        </div>

        <div class="date-field">
          <span class="date-label">Sampai</span>
          <div class="date-input-wrapper">
            <span class="material-icons date-icon">calendar_today</span>
            <input v-model="filter.end_date" type="date" class="filter-date" @change="fetchLogbook" />
          </div>
        </div>

        <select v-model="filter.id_petugas" class="filter-select" @change="fetchLogbook">
          <option value="">Semua Petugas</option>
          <option v-for="p in petugasList" :key="p.id_petugas" :value="p.id_petugas">
            {{ p.nama }}
          </option>
        </select>

        <select v-model="filter.hari" class="filter-select" @change="fetchLogbook">
          <option value="">Semua Hari</option>
          <option value="today">Hari Ini</option>
          <option value="yesterday">Kemarin</option>
          <option value="week">7 Hari Terakhir</option>
          <option value="month">Bulan Ini</option>
        </select>

        <button class="btn-reset" @click="resetFilter">
          <span class="material-icons">refresh</span>
          Reset
        </button>
      </div>
    </div>

    <p class="filter-result-info">Total {{ filteredLogbook.length }} data</p>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Memuat data riwayat logbook...</p>
    </div>

    <!-- TABLE DESKTOP -->
    <div v-else class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Kendaraan</th>
            <th>Nomor Polisi</th>
            <th>Petugas</th>
            <th>Jumlah TPS</th>
            <th>Total Volume</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredLogbook" :key="`${item.tanggal}-${item.id_kendaraan}`">
            <td>{{ index + 1 }}</td>
            <td>{{ formatDate(item.tanggal) }}</td>
            <td>{{ item.nomor_kendaraan }}</td>
            <td>{{ item.nomor_polisi }}</td>
            <td>{{ item.nama_petugas }}</td>
            <td>{{ item.jumlah_tps }} TPS</td>
            <td>{{ item.total_volume_sampah }} kg</td>
            <td>
              <div class="action-buttons">
                <button class="btn-action" @click="lihatDetail(item)" title="Lihat Detail">
                  <span class="material-icons">visibility</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredLogbook.length === 0">
            <td colspan="8" class="empty-state">Tidak ada data riwayat logbook</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARD LIST -->
    <div v-if="!loading" class="card-list mobile-only">
      <div
        v-for="item in filteredLogbook"
        :key="`mobile-${item.tanggal}-${item.id_kendaraan}`"
        class="data-card"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">{{ item.nomor_kendaraan }}</div>
            <div class="data-card-subtitle">{{ item.nomor_polisi }}</div>
          </div>
          <span class="status-badge aktif">{{ formatDate(item.tanggal) }}</span>
        </div>
        <div class="data-card-body">
          <div class="data-card-item">
            <span class="data-card-label">Petugas</span>
            <span class="data-card-value">{{ item.nama_petugas }}</span>
          </div>
          <div class="data-card-item">
            <span class="data-card-label">Jumlah TPS</span>
            <span class="data-card-value">{{ item.jumlah_tps }} TPS</span>
          </div>
          <div class="data-card-item">
            <span class="data-card-label">Total Volume</span>
            <span class="data-card-value">{{ item.total_volume_sampah }} kg</span>
          </div>
        </div>
        <div class="data-card-footer">
          <button class="btn-card-action" @click="lihatDetail(item)">
            <span class="material-icons">visibility</span>
            Lihat Detail
          </button>
        </div>
      </div>

      <div v-if="filteredLogbook.length === 0" class="data-card empty-state">
        Tidak ada data riwayat logbook
      </div>
    </div>

    <!-- MODAL DETAIL -->
    <div v-if="showDetail" class="modal show">
      <div class="modal-overlay" @click="showDetail = false"></div>
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Detail Logbook - {{ detailItem.nomor_kendaraan }}</h2>
          <button class="modal-close" @click="showDetail = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="detailLoading" class="loading-state">
            <div class="loader"></div>
            <p>Memuat detail...</p>
          </div>
          <div v-else>
            <div class="detail-info-grid">
              <div class="form-group">
                <label>Tanggal</label>
                <p class="detail-value">{{ formatDate(detailItem.tanggal) }}</p>
              </div>
              <div class="form-group">
                <label>Kendaraan</label>
                <p class="detail-value">{{ detailItem.nomor_kendaraan }} ({{ detailItem.nomor_polisi }})</p>
              </div>
              <div class="form-group">
                <label>Petugas</label>
                <p class="detail-value">{{ detailItem.nama_petugas }}</p>
              </div>
              <div class="form-group">
                <label>Total TPS</label>
                <p class="detail-value">{{ detailItem.jumlah_tps }} TPS</p>
              </div>
              <div class="form-group">
                <label>Total Volume</label>
                <p class="detail-value">{{ detailItem.total_volume_sampah }} kg</p>
              </div>
            </div>

            <h3 class="tps-list-title">Daftar TPS yang Dikunjungi</h3>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>TPS</th>
                    <th>Volume Sampah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(tps, idx) in detailTPSList" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>{{ tps.nama_tps }}</td>
                    <td>{{ tps.volume_sampah || 0 }} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const detailLoading = ref(false)
const showDetail = ref(false)

const logbookSummary = ref([])
const logbookDetail = ref([])
const petugasList = ref([])

const filter = reactive({
  search: '',
  start_date: '',
  end_date: '',
  id_petugas: '',
  hari: ''
})

const detailItem = ref({})

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// const todayVehicles = computed(() => {
//   const today = todayStr()
//   return logbookSummary.value.filter(item => item.tanggal === today)
// })

const filteredLogbook = computed(() => {
  const q = filter.search.toLowerCase()
  if (!q) return logbookSummary.value
  return logbookSummary.value.filter(item =>
    item.nomor_kendaraan?.toLowerCase().includes(q) ||
    item.nomor_polisi?.toLowerCase().includes(q) ||
    item.nama_petugas?.toLowerCase().includes(q)
  )
})

async function fetchLogbook() {
  loading.value = true
  try {
    const params = new URLSearchParams()

    if (filter.hari === 'today') {
      params.append('start_date', todayStr())
      params.append('end_date', todayStr())
    } else if (filter.hari === 'yesterday') {
      const y = new Date(); y.setDate(y.getDate() - 1)
      const ys = y.toISOString().split('T')[0]
      params.append('start_date', ys)
      params.append('end_date', ys)
    } else if (filter.hari === 'week') {
      const w = new Date(); w.setDate(w.getDate() - 7)
      params.append('start_date', w.toISOString().split('T')[0])
      params.append('end_date', todayStr())
    } else if (filter.hari === 'month') {
      const m = new Date()
      params.append('start_date', `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,'0')}-01`)
      params.append('end_date', todayStr())
    } else {
      if (filter.start_date) params.append('start_date', filter.start_date)
      if (filter.end_date) params.append('end_date', filter.end_date)
    }

    if (filter.id_petugas) params.append('id_petugas', filter.id_petugas)

    const res = await api.get(`/api/dashboard/logbook/summary?${params.toString()}`)
    logbookSummary.value = res.data
  } catch (error) {
    console.error('Gagal mengambil riwayat logbook:', error)
    logbookSummary.value = []
  } finally {
    loading.value = false
  }
}

async function lihatDetail(item) {
  detailItem.value = item
  showDetail.value = true
  detailLoading.value = true
  try {
    const params = new URLSearchParams()
    const tanggal = new Date(item.tanggal)
  tanggal.setDate(tanggal.getDate() + 1)  // kompensasi offset UTC
  const tanggalStr = tanggal.toISOString().split('T')[0]

    params.append('start_date', tanggalStr)
    params.append('end_date', tanggalStr)
    params.append('id_kendaraan', item.id_kendaraan)
    // params.append('id_petugas', item.id_petugas)

    const res = await api.get(`/api/dashboard/logbook/history?${params.toString()}`)
    logbookDetail.value = res.data
  } catch (error) {
    console.error('Gagal mengambil detail logbook:', error)
    logbookDetail.value = []
  } finally {
    detailLoading.value = false
  }
}

async function fetchPetugas() {
  try {
    const res = await api.get('/api/petugas')
    petugasList.value = res.data
  } catch (error) {
    console.error('Gagal mengambil petugas:', error)
  }
}

function resetFilter() {
  filter.search = ''
  filter.start_date = ''
  filter.end_date = ''
  filter.id_petugas = ''
  filter.hari = ''
  fetchLogbook()
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const detailTPSList = computed(() => {
    console.log('logbookDetail:', logbookDetail.value)
  console.log('detailItem:', detailItem.value)
  return logbookDetail.value.filter(
    item =>
      item.tanggal === detailItem.value.tanggal &&
      item.id_kendaraan === detailItem.value.id_kendaraan
  )
})

onMounted(() => {
  fetchPetugas()
  fetchLogbook()
})
</script>

<style scoped src="@/assets/styles/admin.css"></style>
<style scoped>
/* Hanya style tambahan yang belum ada di global CSS */

.section-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 4px;
}

/* Kendaraan Hari Ini */
.today-section {
  padding: 16px 20px;
  margin-bottom: 20px;
}

.today-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

/* .today-header .material-icons {
  color: var(--secondary);
  font-size: 20px;
} */

.today-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.today-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.today-cards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.today-card {
  flex: 1;
  min-width: 180px;
  cursor: pointer;
  padding: 14px;
}

.icon-blue {
  background: #E3F2FD;
  color: var(--status-aktif);
  width: 44px;
  height: 44px;
}

.today-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.today-petugas {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}
/* 
.today-petugas .material-icons {
  font-size: 14px;
} */

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: var(--text-secondary);
}

/* Empty state */
.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px !important;
}

/* Detail modal */
.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: 16px;
  margin-bottom: 20px;
}

.detail-info-grid .form-group {
  margin-bottom: 0;
}

.detail-info-grid label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-weight: 600;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 4px;
}

.tps-list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .today-cards {
    flex-direction: column;
  }

  .today-card {
    min-width: unset;
  }
}
</style>