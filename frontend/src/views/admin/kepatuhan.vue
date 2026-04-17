<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Kepatuhan Jadwal Petugas</h2>
      <p class="section-subtitle">Monitoring kepatuhan pengambilan sampah tiap petugas</p>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="stats-cards" v-if="kepatuhanData.length > 0">
      <div class="stat-card">
        <div class="stat-icon" style="background:#E3F2FD">
          <span class="material-icons" style="color:#2196F3">badge</span>
        </div>
        <div class="stat-info">
          <h3>{{ kepatuhanData.length }}</h3>
          <p>Total Petugas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#E8F5E9">
          <span class="material-icons" style="color:#4CAF50">check_circle</span>
        </div>
        <div class="stat-info">
          <h3>{{ rataRataTepat.toFixed(1) }}%</h3>
          <p>Rata-rata Tepat Waktu</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#FFF3E0">
          <span class="material-icons" style="color:#FF9800">warning</span>
        </div>
        <div class="stat-info">
          <h3>{{ kepatuhanTerbaik.nama }}</h3>
          <p>Petugas Terbaik</p>
        </div>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-state">
      <p>Memuat data kepatuhan...</p>
    </div>

    <!-- TABLE -->
    <div v-else class="table-container">
      <table class="kepatuhan-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Petugas</th>
            <th>Total Pengambilan</th>
            <th>Tepat Waktu</th>
            <th>Terlambat</th>
            <th>Persentase Tepat</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in kepatuhanData" :key="item.id_petugas" class="data-row">
            <td data-label="No">{{ index + 1 }}</td>
            <td data-label="Nama Petugas" class="nama-petugas">{{ item.nama }}</td>
            <td data-label="Total">{{ item.total_selesai }}</td>
            <td data-label="Tepat" class="tepat-waktu">
              <span>{{ item.tepat_waktu }}</span>
            </td>
            <td data-label="Terlambat" class="terlambat">
              <span>{{ item.terlambat }}</span>
            </td>
            <td data-label="Persentase">
              <div class="persentase-container">
                <div class="persentase-bar">
                  <div
                    class="persentase-fill"
                    :class="item.persentase_tepat_waktu >= 80 ? 'good' : item.persentase_tepat_waktu >= 60 ? 'medium' : 'poor'"
                    :style="{ width: item.persentase_tepat_waktu + '%' }"
                  ></div>
                </div>
                <span class="persentase-text">{{ item.persentase_tepat_waktu || 0 }}%</span>
              </div>
            </td>
            <td data-label="Status">
              <span
                class="status-badge"
                :class="item.persentase_tepat_waktu >= 80 ? 'excellent' : item.persentase_tepat_waktu >= 60 ? 'good' : 'warning'"
              >
                {{
                  item.persentase_tepat_waktu >= 80
                    ? '⭐ Sangat Baik'
                    : item.persentase_tepat_waktu >= 60
                      ? '✓ Baik'
                      : '⚠ Perlu Perhatian'
                }}
              </span>
            </td>
            <td data-label="Aksi">
              <button class="btn-lihat" @click="lihatDetail(item.id_petugas, item.nama)">
                <span class="material-icons">visibility</span>
              </button>
            </td>
          </tr>
          <tr v-if="kepatuhanData.length === 0">
            <td colspan="8" class="no-data">
              Tidak ada data kepatuhan petugas
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DETAIL -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detail Kepatuhan - {{ detailPetugasNama }}</h3>
          <button class="btn-close" @click="showDetail = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="detailLoading" class="loading-state">
            <p>Memuat detail...</p>
          </div>
          <table v-else class="detail-table">
            <thead>
              <tr>
                <th>TPS</th>
                <th>Hari Jadwal</th>
                <th>Tanggal Jadwal</th>
                <th>Tanggal Pengambilan</th>
                <th>Status Kepatuhan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in detailKepatuhan" :key="detail.id_daftar_tugas" class="detail-row">
                <td data-label="TPS">{{ detail.nama_tps }}</td>
                <td data-label="Hari Jadwal">{{ detail.hari_pengambilan }}</td>
                <td data-label="Tanggal Jadwal">{{ formatDate(detail.tgl_pengambilan) }}</td>
                <td data-label="Tanggal Pengambilan">{{ detail.tgl_terakhir_diambil ? formatDate(detail.tgl_terakhir_diambil) : '-' }}</td>
                <td data-label="Status Kepatuhan">
                  <span
                    class="status-kepatuhan"
                    :class="detail.status_kepatuhan === 'Tepat Waktu' ? 'tepat' : 'terlambat'"
                  >
                    {{ detail.status_kepatuhan }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const kepatuhanData = ref([])
const detailKepatuhan = ref([])
const loading = ref(false)
const detailLoading = ref(false)
const showDetail = ref(false)
const detailPetugasId = ref(null)
const detailPetugasNama = ref('')

async function fetchKepatuhan() {
  loading.value = true
  try {
    const res = await api.get('/api/dashboard/kepatuhan/all')
    kepatuhanData.value = res.data
  } catch (error) {
    console.error('Gagal mengambil kepatuhan petugas:', error)
    kepatuhanData.value = []
  } finally {
    loading.value = false
  }
}

async function lihatDetail(id_petugas, nama) {
  detailPetugasId.value = id_petugas
  detailPetugasNama.value = nama
  showDetail.value = true
  detailLoading.value = true

  try {
    // Endpoint admin untuk detail kepatuhan dengan id_petugas
    const res = await api.get(`/api/dashboard/kepatuhan/detail/${id_petugas}`)
    detailKepatuhan.value = res.data
  } catch (error) {
    console.error('Gagal mengambil detail kepatuhan:', error)
    detailKepatuhan.value = []
  } finally {
    detailLoading.value = false
  }
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const rataRataTepat = computed(() => {
  if (kepatuhanData.value.length === 0) return 0
  const total = kepatuhanData.value.reduce((sum, item) => sum + (item.persentase_tepat_waktu || 0), 0)
  return total / kepatuhanData.value.length
})

const kepatuhanTerbaik = computed(() => {
  if (kepatuhanData.value.length === 0) return { nama: '-' }
  return kepatuhanData.value.reduce((prev, current) =>
    (current.persentase_tepat_waktu || 0) > (prev.persentase_tepat_waktu || 0) ? current : prev
  )
})

onMounted(() => {
  fetchKepatuhan()
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

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.stat-info p {
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

.kepatuhan-table {
  width: 100%;
  border-collapse: collapse;
}

.kepatuhan-table thead {
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

.kepatuhan-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 13px;
  white-space: nowrap;
}

.kepatuhan-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.kepatuhan-table tbody tr {
  transition: background 0.2s;
}

.kepatuhan-table tbody tr:hover {
  background: #fafafa;
}

.nama-petugas {
  font-weight: 500;
  color: #333;
}

.badge-tepat,
.badge-terlambat {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-tepat {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-terlambat {
  background: #ffebee;
  color: #c62828;
}

.persentase-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.persentase-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  min-width: 80px;
}

.persentase-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s, background 0.3s;
}

.persentase-fill.good {
  background: #4caf50;
}

.persentase-fill.medium {
  background: #ff9800;
}

.persentase-fill.poor {
  background: #f44336;
}

.persentase-text {
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.excellent {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.good {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.warning {
  background: #ffebee;
  color: #c62828;
}

.btn-lihat {
  background: none;
  border: none;
  cursor: pointer;
  color: #2196f3;
  padding: 5px;
  border-radius: 6px;
  transition: background 0.2s;
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

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
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
  white-space: nowrap;
}

.detail-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
}

.status-kepatuhan {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}

.status-kepatuhan.tepat {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-kepatuhan.terlambat {
  background: #ffebee;
  color: #c62828;
}

/* RESPONSIVE MOBILE */
@media (max-width: 768px) {
  .content-section {
    padding: 15px;
  }

  .section-header {
    margin-bottom: 20px;
  }

  .section-header h2 {
    font-size: 22px;
    margin-bottom: 3px;
  }

  .section-subtitle {
    font-size: 12px;
  }

  /* Stats Cards Mobile */
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 20px;
  }

  .stat-card {
    padding: 15px;
    gap: 12px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
  }

  .stat-info h3 {
    font-size: 20px;
  }

  .stat-info p {
    font-size: 11px;
  }

  /* Tabel Mobile - Convert to Card View */
  .table-container {
    overflow-x: visible;
    padding: 0;
  }

  .kepatuhan-table {
    display: block;
  }

  .kepatuhan-table thead {
    display: none;
  }

  .kepatuhan-table tbody {
    display: block;
  }

  .kepatuhan-table tbody tr {
    display: block;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 15px;
    overflow: hidden;
  }

  .kepatuhan-table tbody tr:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .kepatuhan-table td {
    display: block;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
    position: relative;
    padding-left: 120px;
  }

  .kepatuhan-table td:first-child {
    background: #f9f9f9;
    padding: 10px 12px;
    padding-left: 12px;
    font-weight: 600;
    border-bottom: 2px solid #e0e0e0;
  }

  .kepatuhan-table td:before {
    content: attr(data-label);
    position: absolute;
    left: 12px;
    font-weight: 600;
    color: #666;
    font-size: 11px;
    text-transform: uppercase;
    width: 110px;
  }

  .kepatuhan-table td:first-child:before,
  .kepatuhan-table td:last-child:before {
    display: none;
  }

  .kepatuhan-table td:last-child {
    border-bottom: none;
    padding: 10px 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .nama-petugas {
    font-size: 14px;
    font-weight: 600;
  }

  .persentase-container {
    gap: 8px;
  }

  .persentase-bar {
    min-width: 60px;
  }

  .persentase-text {
    min-width: 35px;
  }

  .btn-lihat {
    padding: 10px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 16px;
    touch-action: manipulation;
    -webkit-user-select: none;
    user-select: none;
  }

  .btn-lihat:active {
    background: #e3f2fd;
    transform: scale(0.95);
  }

  .btn-lihat .material-icons {
    font-size: 22px;
  }

  /* Tambahan untuk better mobile experience */
  .kepatuhan-table tbody tr {
    cursor: pointer;
  }

  .kepatuhan-table tbody tr:active {
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
  }

  @supports (padding: max(0px)) {
    body {
      padding-left: max(10px, env(safe-area-inset-left));
      padding-right: max(10px, env(safe-area-inset-right));
    }
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
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: none;
  }

  .modal-header {
    padding: 16px 15px;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;
  }

  .modal-header h3 {
    font-size: 16px;
    font-weight: 600;
    word-break: break-word;
    flex: 1;
    margin: 0;
    line-height: 1.3;
  }

  .btn-close {
    min-width: 44px;
    width: 44px;
    height: 44px;
    padding: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: manipulation;
  }

  .btn-close .material-icons {
    font-size: 22px;
  }

  .modal-body {
    padding: 15px;
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    min-height: 0;
  }

  .detail-table {
    font-size: 12px;
    border-collapse: collapse;
    width: 100%;
  }

  .detail-table thead {
    display: none;
  }

  .detail-table tbody {
    display: block;
  }

  .detail-table tbody tr {
    display: block;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
    padding: 0;
  }

  .detail-table tbody tr:last-child {
    margin-bottom: 0;
  }

  .detail-table th {
    padding: 10px 8px;
    font-size: 11px;
    display: none;
  }

  .detail-table td {
    display: block;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
    position: relative;
    padding-left: 120px;
    font-size: 13px;
  }

  .detail-table td:first-child {
    background: #f9f9f9;
    border-bottom: 2px solid #e0e0e0;
    padding: 12px;
    padding-left: 12px;
    font-weight: 600;
  }

  .detail-table td:last-child {
    border-bottom: none;
  }

  .detail-table td:before {
    content: attr(data-label);
    position: absolute;
    left: 12px;
    font-weight: 600;
    color: #666;
    font-size: 11px;
    text-transform: uppercase;
    width: 110px;
  }

  .detail-table td:first-child:before {
    display: none;
  }

  .status-kepatuhan {
    font-size: 12px;
    display: inline-block;
  }
}</style>

