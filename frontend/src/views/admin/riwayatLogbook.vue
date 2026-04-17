<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Riwayat Logbook Kendaraan</h2>
      <p class="section-subtitle">History pengambilan sampah kendaraan</p>
    </div>

    <!-- FILTER -->
    <div class="filter-card">
      <div class="filter-header">
        <span class="material-icons">filter_list</span>
        <h3>Filter Data</h3>
      </div>

      <div class="filter-form">
        <div class="form-row">
          <div class="form-group">
            <label>Tanggal Mulai</label>
            <input v-model="filter.start_date" type="date" class="form-control" />
          </div>

          <div class="form-group">
            <label>Tanggal Akhir</label>
            <input v-model="filter.end_date" type="date" class="form-control" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Kendaraan</label>
            <select v-model="filter.id_kendaraan" class="form-control">
              <option value="">-- Semua Kendaraan --</option>
              <option v-for="k in kendaraanList" :key="k.id_kendaraan" :value="k.id_kendaraan">
                {{ k.nomor_kendaraan }} ({{ k.nomor_polisi }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Petugas</label>
            <select v-model="filter.id_petugas" class="form-control">
              <option value="">-- Semua Petugas --</option>
              <option v-for="p in petugasList" :key="p.id_petugas" :value="p.id_petugas">
                {{ p.nama }}
              </option>
            </select>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn-secondary" @click="resetFilter">Reset Filter</button>
          <button class="btn-primary" @click="fetchLogbook" :disabled="loading">
            <span class="material-icons">search</span>
            Cari
          </button>
        </div>
      </div>
    </div>

    <!-- SUMMARY -->
    <div v-if="logbookSummary.length > 0" class="summary-cards">
      <div class="summary-card">
        <div class="summary-icon">
          <span class="material-icons">local_shipping</span>
        </div>
        <div class="summary-info">
          <h3>{{ totalTripAhari }}</h3>
          <p>Total Trip Hari Ini</p>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">
          <span class="material-icons">delete</span>
        </div>
        <div class="summary-info">
          <h3>{{ totalTPS }}</h3>
          <p>Total TPS Dikunjungi</p>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">
          <span class="material-icons">scale</span>
        </div>
        <div class="summary-info">
          <h3>{{ totalVolume }} kg</h3>
          <p>Total Volume Sampah</p>
        </div>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-state">
      <p>Memuat data riwayat logbook...</p>
    </div>

    <!-- TABLE -->
    <div v-else class="table-container">
      <table class="logbook-table">
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
          <tr v-for="(item, index) in logbookSummary" :key="`${item.tanggal}-${item.id_kendaraan}`" class="data-row">
            <td data-label="No">{{ index + 1 }}</td>
            <td data-label="Tanggal" class="tanggal">{{ formatDate(item.tanggal) }}</td>
            <td data-label="Kendaraan">{{ item.nomor_kendaraan }}</td>
            <td data-label="Polisi">{{ item.nomor_polisi }}</td>
            <td data-label="Petugas" class="petugas">{{ item.nama_petugas }}</td>
            <td data-label="TPS">{{ item.jumlah_tps }} TPS</td>
            <td data-label="Volume">{{ item.total_volume_sampah }} kg</td>
            <td data-label="Aksi">
              <button class="btn-lihat" @click="lihatDetail(item)">
                <span class="material-icons">visibility</span>
              </button>
            </td>
          </tr>
          <tr v-if="logbookSummary.length === 0">
            <td colspan="8" class="no-data">
              Tidak ada data riwayat logbook
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DETAIL -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detail Logbook - {{ detailItem.nomor_kendaraan }}</h3>
          <button class="btn-close" @click="showDetail = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="detailLoading" class="loading-state">
            <p>Memuat detail...</p>
          </div>
          <div v-else>
            <!-- Detail Header -->
            <div class="detail-header">
              <div class="detail-item">
                <span class="label">Tanggal</span>
                <span class="value">{{ formatDate(detailItem.tanggal) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Kendaraan</span>
                <span class="value">{{ detailItem.nomor_kendaraan }} ({{ detailItem.nomor_polisi }})</span>
              </div>
              <div class="detail-item">
                <span class="label">Petugas</span>
                <span class="value">{{ detailItem.nama_petugas }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total TPS</span>
                <span class="value">{{ detailItem.jumlah_tps }} TPS</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Volume</span>
                <span class="value">{{ detailItem.total_volume_sampah }} kg</span>
              </div>
            </div>

            <!-- Detail Table -->
            <h4 class="tps-list-header">Daftar TPS yang Dikunjungi:</h4>
            <table class="detail-table">
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
const kendaraanList = ref([])
const petugasList = ref([])

const filter = reactive({
  start_date: '',
  end_date: '',
  id_kendaraan: '',
  id_petugas: ''
})

const detailItem = ref({})

async function fetchLogbook() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filter.start_date) params.append('start_date', filter.start_date)
    if (filter.end_date) params.append('end_date', filter.end_date)
    if (filter.id_kendaraan) params.append('id_kendaraan', filter.id_kendaraan)
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
    params.append('start_date', item.tanggal)
    params.append('end_date', item.tanggal)
    params.append('id_kendaraan', item.id_kendaraan)
    params.append('id_petugas', item.id_petugas)

    const res = await api.get(`/api/dashboard/logbook/history?${params.toString()}`)
    logbookDetail.value = res.data
  } catch (error) {
    console.error('Gagal mengambil detail logbook:', error)
    logbookDetail.value = []
  } finally {
    detailLoading.value = false
  }
}

async function fetchKendaraan() {
  try {
    const res = await api.get('/api/kendaraan')
    kendaraanList.value = res.data
  } catch (error) {
    console.error('Gagal mengambil kendaraan:', error)
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
  filter.start_date = ''
  filter.end_date = ''
  filter.id_kendaraan = ''
  filter.id_petugas = ''
  logbookSummary.value = []
}

function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const detailTPSList = computed(() => {
  return logbookDetail.value.filter(
    item => item.tanggal === detailItem.value.tanggal && item.id_kendaraan === detailItem.value.id_kendaraan
  )
})

const totalTripAhari = computed(() => logbookSummary.value.length)
const totalTPS = computed(() => logbookSummary.value.reduce((sum, item) => sum + item.jumlah_tps, 0))
const totalVolume = computed(() => logbookSummary.value.reduce((sum, item) => sum + item.total_volume_sampah, 0))

onMounted(() => {
  fetchKendaraan()
  fetchPetugas()
})
</script>

<style scoped>
.content-section {
  padding: 20px;
}

.section-header {
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.section-subtitle {
  color: #666;
  font-size: 14px;
}

/* Filter Card */
.filter-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  color: #2196f3;
  flex-shrink: 0;
}

.summary-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.summary-info p {
  font-size: 12px;
  color: #666;
  margin: 5px 0 0 0;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.logbook-table {
  width: 100%;
  border-collapse: collapse;
}

.logbook-table thead {
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

.logbook-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 13px;
  white-space: nowrap;
}

.logbook-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.logbook-table tbody tr {
  transition: background 0.2s;
}

.logbook-table tbody tr:hover {
  background: #fafafa;
}

.tanggal,
.petugas {
  font-weight: 500;
  color: #333;
}

.btn-lihat {
  background: none;
  border: none;
  cursor: pointer;
  color: #2196f3;
  padding: 5px;
  border-radius: 6px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.btn-lihat:hover {
  background: #e3f2fd;
}

.material-icons {
  font-size: 20px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px !important;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 10px;
  overflow: auto;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  gap: 15px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 5px;
  border-radius: 6px;
  transition: background 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.btn-close:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.detail-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item .label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 5px;
}

.detail-item .value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.tps-list-header {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 10px 0;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.detail-table thead {
  background: #f5f5f5;
}

.detail-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.detail-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
}

/* Responsive Mobile */
@media (max-width: 768px) {
  .content-section {
    padding: 15px;
  }

  .section-header h2 {
    font-size: 22px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  /* Table Mobile - Card View */
  .logbook-table {
    display: block;
  }

  .logbook-table thead {
    display: none;
  }

  .logbook-table tbody {
    display: block;
  }

  .logbook-table tbody tr {
    display: block;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 15px;
    overflow: hidden;
  }

  .logbook-table td {
    display: block;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
    position: relative;
    padding-left: 120px;
  }

  .logbook-table td:first-child {
    background: #f9f9f9;
    padding: 10px 12px;
    padding-left: 12px;
    font-weight: 600;
    border-bottom: 2px solid #e0e0e0;
  }

  .logbook-table td:last-child {
    border-bottom: none;
    display: flex;
    justify-content: center;
    padding-left: 12px;
  }

  .logbook-table td:before {
    content: attr(data-label);
    position: absolute;
    left: 12px;
    font-weight: 600;
    color: #666;
    font-size: 11px;
    text-transform: uppercase;
    width: 110px;
  }

  .logbook-table td:first-child:before,
  .logbook-table td:last-child:before {
    display: none;
  }

  /* Modal Mobile */
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
    justify-content: stretch;
    background: rgba(0, 0, 0, 0.4);
  }

  .modal-content {
    border-radius: 20px 20px 0 0;
    width: 100%;
    max-width: 100%;
    max-height: 85vh;
  }

  .modal-header {
    padding: 16px 15px;
    gap: 12px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .btn-close {
    width: 44px;
    height: 44px;
  }

  .modal-body {
    padding: 15px;
  }

  .detail-header {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px;
  }
}
</style>
