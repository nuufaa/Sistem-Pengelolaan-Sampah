<template>
  <div class="modal" v-if="isModalOpen" :class="{ show: isModalOpen }">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content timbulan-modal">

      <!-- HEADER -->
      <div class="modal-header">
        <div class="timbulan-header-left">
          <span class="material-icons">people_alt</span>
          <div>
            <h2>Timbulan Per Kapita</h2>
          </div>
        </div>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- BODY -->
      <div class="modal-body">
        
        <!-- FILTERS & SUMMARY -->
        <div class="timbulan-top-bar">
          
          <!-- GLOBAL SEARCH -->
          <div class="timbulan-search">
            <span class="material-icons search-icon">search</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari TPS..." 
              class="modern-search-input"
            />
          </div>

          <div class="timbulan-filters-modern">
            <div class="modern-select-group">
              <span class="material-icons select-icon">calendar_month</span>
              <select v-model="localMonth" @change="fetchData" class="modern-select">
                <option v-for="(name, index) in monthNames" :key="index" :value="index + 1">
                  {{ name }}
                </option>
              </select>
            </div>
            <div class="modern-select-group">
              <span class="material-icons select-icon">history</span>
              <select v-model="localYear" @change="fetchData" class="modern-select">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- LOADING STATE -->
        <div v-if="loading" class="timbulan-loading">
          <div class="loader-ring"></div>
          <p>Menganalisis data wilayah...</p>
        </div>

        <!-- DATA CONTENT -->
        <div v-else-if="timbulanData.length > 0" class="timbulan-main-content">

          <!-- TABLE FOR DESKTOP -->
          <div class="table-container desktop-only">
            <table class="data-table">
              <thead>
                <tr>
                  <th width="60">No</th>
                  <th>TPS</th>
                  <th class="text-center">Jumlah KK</th>
                  <th class="text-right">Total Volume</th>
                  <th class="text-right">Timbulan Harian</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredData" :key="item.nama_dusun">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td><span class="dusun-text">{{ item.nama_dusun }}</span></td>
                  <td>{{ item.jumlah_kk }}</td>
                  <td>{{ item.total_volume }} kg</td>
                  <td>
                    <div class="timbulan-badge" :class="getBadgeClass(item.timbulan_kg_per_kk_per_hari)">
                      {{ item.timbulan_kg_per_kk_per_hari }} <span>kg</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- LIST FOR MOBILE -->
          <div class="mobile-data-list">
            <div v-for="(item, index) in filteredData" :key="item.nama_dusun" class="mobile-item-card">
              <div class="mobile-card-header">
                <span class="mobile-rank">{{ index + 1 }}</span>
                <h4 class="mobile-dusun-title">{{ item.nama_dusun }}</h4>
              </div>
              <div class="mobile-card-body">
                <div class="mobile-stat">
                  <span class="label">Jumlah KK</span>
                  <span class="val">{{ item.jumlah_kk }}</span>
                </div>
                <div class="mobile-stat">
                  <span class="label">Total Sampah</span>
                  <span class="val">{{ item.total_volume }} kg</span>
                </div>
                <div class="mobile-stat-main">
                  <span class="label">Rata-rata Timbulan</span>
                  <div class="main-val">
                    <strong>{{ item.timbulan_kg_per_kk_per_hari }}</strong>
                    <small>kg/KK/hari</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div v-else class="timbulan-empty">
          <div class="empty-icon-wrap">
            <span class="material-icons">sentiment_dissatisfied</span>
          </div>
          <h3>Data tidak ditemukan</h3>
          <p>Belum ada data pengangkutan sampah untuk wilayah ini pada periode {{ monthNames[localMonth - 1] }} {{ localYear }}.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/services/api'

const props = defineProps({
  isModalOpen: { type: Boolean, default: false },
  month: { type: Number, default: new Date().getMonth() + 1 },
  year: { type: Number, default: new Date().getFullYear() }
})

const emit = defineEmits(['close'])
const loading = ref(false)
const timbulanData = ref([])
const localMonth = ref(props.month)
const localYear = ref(props.year)

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = computed(() => {
  const current = new Date().getFullYear()
  const arr = []
  for (let i = 0; i < 5; i++) arr.push(current - i)
  return arr
})

const searchQuery = ref('')

const filteredData = computed(() => {
  if (!searchQuery.value) return timbulanData.value
  const query = searchQuery.value.toLowerCase()
  return timbulanData.value.filter(item => 
    item.nama_dusun.toLowerCase().includes(query)
  )
})

function getBadgeClass(val) {
  if (val > 1.0) return 'danger'
  if (val > 0.5) return 'warning'
  return 'success'
}

async function fetchData() {
  try {
    loading.value = true
    const res = await api.get(`/api/dashboard?month=${localMonth.value}&year=${localYear.value}`)
    timbulanData.value = res.data.timbulanPerKapita || []
  } catch (err) {
    console.error('Gagal ambil data timbulan', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.isModalOpen, (newVal) => {
  if (newVal) {
    localMonth.value = props.month
    localYear.value = props.year
    fetchData()
  }
})

onMounted(() => {
  if (props.isModalOpen) fetchData()
})
</script>

<style scoped>
@import "@/assets/styles/home.css";
.timbulan-modal {
  width: 95%;
  max-width: 850px;
  max-height: 92vh;
  border-radius: 24px !important;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3);
}

/* HEADER */
.timbulan-header {
  padding: 24px 32px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timbulan-header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.timbulan-header-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #2E7D32, #43A047);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(46, 125, 50, 0.2);
}

.timbulan-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.timbulan-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 2px 0 0;
}

.timbulan-close {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.timbulan-close:hover {
  background: #f8fafc;
  color: #ef4444;
  border-color: #fecaca;
  transform: rotate(90deg);
}

/* BODY */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #fcfdfe;
}

/* TOP BAR (Filters & Stats) */
.timbulan-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
}

.timbulan-filters-modern {
  display: flex;
  gap: 12px;
}

.modern-select-group {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 12px;
  font-size: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.modern-select {
  padding: 10px 16px 10px 40px;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  background: #fff;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}

.modern-select:focus {
  border-color: #2E7D32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

/* SEARCH */
.timbulan-search {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 20px;
}

.modern-search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* TABLE */
.table-container {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 14px 16px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #1e293b;
  text-align: center;
}

.timbulan-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding: 1px 3px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 15px;
}

.timbulan-badge span { font-size: 11px; font-weight: 600; opacity: 0.8; }

.timbulan-badge.success { background: #f0fdf4; color: #166534; }
.timbulan-badge.warning { background: #fffbeb; color: #92400e; }
.timbulan-badge.danger { background: #fef2f2; color: #991b1b; }

/* LOADING */
.timbulan-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.loader-ring {
  width: 48px;
  height: 48px;
  border: 4px solid #f1f5f9;
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* EMPTY STATE */
.timbulan-empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.empty-icon-wrap {
  font-size: 40px;
  color: #94a3b8;
}

.timbulan-empty h3 {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.timbulan-empty p {
  color: #64748b;
  max-width: 400px;
  margin: 0 auto;
}

/* MOBILE LIST */
.mobile-data-list {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.mobile-item-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
}

.mobile-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
}

.mobile-rank {
  font-size: 14px;
  font-weight: 900;
  color: #2E7D32;
  background: #f0fdf4;
  padding: 2px 8px;
  border-radius: 6px;
}

.mobile-dusun-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.mobile-card-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mobile-stat {
  display: flex;
  flex-direction: column;
}

.mobile-stat .label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.mobile-stat .val { font-size: 14px; font-weight: 700; color: #334155; }

.mobile-stat-main {
  grid-column: span 2;
  background: #f8fafc;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-stat-main .label { font-size: 11px; font-weight: 700; color: #64748b; }
.mobile-stat-main .main-val { display: flex; align-items: baseline; gap: 4px; }
.mobile-stat-main .main-val strong { font-size: 20px; font-weight: 900; color: #2E7D32; }
.mobile-stat-main .main-val small { font-size: 10px; color: #94a3b8; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .timbulan-header { padding: 16px 20px; gap: 12px; }
  .timbulan-header-icon { width: 44px; height: 44px; border-radius: 12px; }
  .timbulan-title { font-size: 16px; }
  .timbulan-subtitle { font-size: 12px; }
  
  .timbulan-body { padding: 16px; }
  
  .timbulan-top-bar { 
    flex-direction: column; 
    align-items: stretch; 
    gap: 12px; 
    margin-bottom: 20px; 
  }

  .timbulan-search {
    max-width: none;
    width: 100%;
  }

  .timbulan-filters-modern {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
  }

  .modern-select {
    min-width: 0;
    width: 100%;
    padding: 10px 12px 10px 36px;
    font-size: 13px;
  }
  
  .select-icon {
    left: 10px;
    font-size: 16px;
  }

  .table-responsive-desktop { display: none; }
  .mobile-data-list { display: flex; }
}

@media (max-width: 480px) {
  .timbulan-filters-modern {
    grid-template-columns: 1fr;
  }
}
</style>
