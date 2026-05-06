<template>
  <div class="modal" v-if="isModalOpen" :class="{ show: isModalOpen }">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content vol-modal">

      <!-- HEADER -->
      <div class="vol-header">
        <div class="vol-header-left">
          <div class="vol-header-icon">
            <span class="material-icons">bar_chart</span>
          </div>
          <div>
            <h2 class="vol-title">Statistik Volume Sampah</h2>
            <p class="vol-subtitle">Data pengangkutan TPS harian</p>
          </div>
        </div>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- BODY -->
      <div class="vol-body">

        <!-- FILTERS -->
        <div class="vol-filters">
          <div class="vol-filter-item">
            <span class="vol-filter-label">Periode</span>
            <div class="vol-period-tabs">
              <button
                class="vol-period-tab"
                :class="{ active: filterChart === 'mingguan' }"
                @click="filterChart = 'mingguan'"
              >7 Hari</button>
              <button
                class="vol-period-tab"
                :class="{ active: filterChart === 'bulanan' }"
                @click="filterChart = 'bulanan'"
              >Bulanan</button>
            </div>
          </div>

          <div class="vol-filter-item">
            <span class="vol-filter-label">TPS dipilih</span>
            <div class="vol-dropdown-wrap">
              <button class="vol-dropdown-btn" @click="toggleDropdown">
                <span class="material-icons" style="font-size:16px;color:#4CAF50">delete_outline</span>
                <span>{{ selectedTPS.length }} dari {{ tpsList.length }} TPS</span>
                <span class="material-icons vol-chevron" :class="{ rotated: isDropdownOpen }">expand_more</span>
              </button>

              <div v-if="isDropdownOpen" class="vol-dropdown-menu">
                <div class="vol-dropdown-head">
                  <input
                    v-model="searchTPS"
                    type="text"
                    placeholder="Cari TPS..."
                    class="vol-search"
                  />
                  <div class="vol-dropdown-actions">
                    <button @click="selectAllTPS" class="vol-action-btn green">Semua</button>
                    <button @click="deselectAllTPS" class="vol-action-btn red">Kosong</button>
                  </div>
                </div>
                <div class="vol-dropdown-list">
                  <label
                    v-for="tps in filteredTPSList"
                    :key="tps"
                    class="vol-option"
                  >
                    <input
                      type="checkbox"
                      :value="tps"
                      v-model="selectedTPS"
                      class="vol-checkbox"
                    />
                    <span class="vol-option-dot" :style="{ background: getTpsColor(tps) }"></span>
                    <span class="vol-option-text">{{ tps }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CHART AREA -->
        <div class="vol-chart-wrap">
          <div v-if="selectedTPS.length === 0" class="vol-empty">
            <span class="material-icons">bar_chart</span>
            <p>Pilih minimal satu TPS untuk melihat grafik</p>
          </div>
          <canvas v-else ref="volumeSampahChartRef" class="vol-canvas"></canvas>
        </div>

        <!-- LEGEND CUSTOM -->
        <div class="vol-legend" v-if="selectedTPS.length > 0">
          <div
            v-for="tps in selectedTPS"
            :key="tps"
            class="vol-legend-item"
          >
            <span class="vol-legend-dot" :style="{ background: getTpsColor(tps) }"></span>
            <span class="vol-legend-name">{{ tps }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import Chart from 'chart.js/auto'
import { ref, watch, nextTick, computed } from 'vue'

const volumeSampahHarian = ref([])
let volumeSampahChart = null
const volumeSampahChartRef = ref(null)
const filterChart = ref('mingguan')
const tpsList = ref([])
const selectedTPS = ref([])
const isDropdownOpen = ref(false)
const searchTPS = ref('')

const props = defineProps({
  isModalOpen: { type: Boolean, default: false },
  volumeSampahData: { type: Array, default: () => [] }
})

// Palette warna yang lebih soft dan mudah dibedakan
const COLORS = [
  '#2E7D32', '#1565C0', '#E65100', '#6A1B9A', '#00838F',
  '#AD1457', '#558B2F', '#283593', '#BF360C', '#4527A0',
  '#00695C', '#C62828', '#0277BD', '#F57F17', '#37474F'
]

function getTpsColor(tps) {
  const idx = tpsList.value.indexOf(tps)
  return COLORS[idx % COLORS.length]
}

watch(() => props.volumeSampahData, (newData) => {
  if (newData && newData.length > 0) {
    volumeSampahHarian.value = newData
    tpsList.value = [...new Set(newData.map(item => item.nama_tps))]
    selectedTPS.value = [...tpsList.value]
    nextTick(() => {
      renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value)
    })
  }
}, { deep: true })

async function renderVolumeSampahChart(data, filter = 'mingguan', selectedTPSList = []) {
  if (!volumeSampahChartRef.value) await nextTick()
  if (!volumeSampahChartRef.value) return

  if (volumeSampahChart) {
    volumeSampahChart.destroy()
    volumeSampahChart = null
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  }

  let labels = []
  if (filter === 'mingguan') {
    labels = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    })
  } else if (filter === 'bulanan') {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    labels = [...Array(daysInMonth)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1)
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    })
  }

  const dataMap = {}
  data.forEach(d => {
    const key = `${formatDate(d.tanggal)}-${d.nama_tps}`
    dataMap[key] = (dataMap[key] || 0) + d.total_volume
  })

  const filteredList = selectedTPSList.length > 0
    ? selectedTPSList
    : [...new Set(data.map(item => item.nama_tps))]

  const datasets = filteredList.map((tps) => {
    const color = getTpsColor(tps)
    const hasData = labels.some(label => (dataMap[`${label}-${tps}`] || 0) > 0)
    return {
      label: tps,
      data: labels.map(label => dataMap[`${label}-${tps}`] || 0),
      borderColor: color,
      backgroundColor: color + '15',
      borderWidth: hasData ? 2 : 1.5,
      fill: false,
      tension: 0.35,
      pointRadius: labels.map(label => (dataMap[`${label}-${tps}`] || 0) > 0 ? 5 : 3),
      pointHoverRadius: 7,
      pointBackgroundColor: labels.map(label =>
        (dataMap[`${label}-${tps}`] || 0) > 0 ? color : '#fff'
      ),
      pointBorderColor: color,
      pointBorderWidth: 2,
    }
  })

  volumeSampahChart = new Chart(volumeSampahChartRef.value, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 8, right: 8, bottom: 0, left: 0 } },
      scales: {
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: '#F0F0F0', drawTicks: false },
          ticks: {
            callback: v => v === 0 ? '0' : v + ' kg',
            font: { size: 11, family: 'DM Sans, sans-serif' },
            color: '#9E9E9E',
            padding: 8,
            maxTicksLimit: 6,
          }
        },
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: {
            font: { size: 11, family: 'DM Sans, sans-serif' },
            color: '#9E9E9E',
            maxRotation: 0,
            padding: 4,
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A1A2E',
          titleColor: '#fff',
          bodyColor: '#ccc',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          padding: { top: 10, bottom: 10, left: 14, right: 14 },
          cornerRadius: 10,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          callbacks: {
            title: (items) => items[0]?.label || '',
            label: (ctx) => {
              const val = ctx.raw
              return ` ${ctx.dataset.label}: ${val > 0 ? val + ' kg' : '-'}`
            },
            filter: (item) => item.raw > 0
          }
        }
      }
    }
  })
}

watch(filterChart, () => {
  if (volumeSampahHarian.value.length) {
    renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value)
  }
})

watch(selectedTPS, () => {
  if (volumeSampahHarian.value.length) {
    nextTick(() => {
      renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value)
    })
  }
}, { deep: true })

function selectAllTPS() { selectedTPS.value = [...tpsList.value] }
function deselectAllTPS() { selectedTPS.value = [] }
function toggleDropdown() { isDropdownOpen.value = !isDropdownOpen.value }

const filteredTPSList = computed(() => {
  if (!searchTPS.value) return tpsList.value
  return tpsList.value.filter(tps =>
    tps.toLowerCase().includes(searchTPS.value.toLowerCase())
  )
})
</script>

<style src="@/assets/styles/home.css"></style>

<style scoped>
/* ===== MODAL WRAPPER ===== */
:deep(.modal) {
  pointer-events: auto;
  z-index: 4001 !important;
}
:deep(.modal-overlay) { pointer-events: auto; }
:deep(.modal-content) {
  pointer-events: auto !important;
  z-index: 4002 !important;
}

.vol-modal {
  width: 92%;
  max-width: 720px;
  max-height: 88vh;
  border-radius: 16px !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== HEADER ===== */
.vol-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
  background: linear-gradient(135deg, rgba(46,125,50,0.04) 0%, #fff 100%);
  flex-shrink: 0;
}

.vol-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vol-header-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vol-header-icon {
  color: #fff;
  font-size: 20px;
}

.vol-title {
  font-size: 15px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0;
  line-height: 1.2;
}

.vol-subtitle {
  font-size: 12px;
  color: #9E9E9E;
  margin: 2px 0 0;
}

/* .vol-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #757575;
}
.vol-close:hover { background: #F5F5F5; color: #212121; }
.vol-close .material-icons { font-size: 18px; } */

/* ===== BODY ===== */
.vol-body {
  padding: 16px 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

/* ===== FILTERS ===== */
.vol-filters {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.vol-filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vol-filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #9E9E9E;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Period tabs */
.vol-period-tabs {
  display: flex;
  background: #F5F5F5;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.vol-period-tab {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #757575;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.vol-period-tab.active {
  background: #fff;
  color: #2E7D32;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
}

/* Dropdown */
.vol-dropdown-wrap {
  position: relative;
  min-width: 180px;
}

.vol-dropdown-btn {
  width: 100%;
  padding: 7px 12px;
  border: 1.5px solid #E0E0E0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #424242;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.vol-dropdown-btn:hover { border-color: #4CAF50; }

.vol-chevron {
  font-size: 18px !important;
  color: #9E9E9E;
  margin-left: auto;
  transition: transform 0.2s;
}
.vol-chevron.rotated { transform: rotate(180deg); }

.vol-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  overflow: hidden;
  min-width: 220px;
}

.vol-dropdown-head {
  padding: 10px;
  border-bottom: 1px solid #F0F0F0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #FAFAFA;
}

.vol-search {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
}
.vol-search:focus { border-color: #4CAF50; }

.vol-dropdown-actions {
  display: flex;
  gap: 6px;
}

.vol-action-btn {
  flex: 1;
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
.vol-action-btn.green { background: #E8F5E9; color: #2E7D32; }
.vol-action-btn.green:hover { background: #2E7D32; color: #fff; }
.vol-action-btn.red { background: #FFEBEE; color: #C62828; }
.vol-action-btn.red:hover { background: #C62828; color: #fff; }

.vol-dropdown-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 6px;
}

.vol-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  color: #424242;
  transition: background 0.15s;
}
.vol-option:hover { background: #F5F5F5; }

.vol-checkbox {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #4CAF50;
  flex-shrink: 0;
}

.vol-option-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.vol-option-text { user-select: none; line-height: 1; }

/* ===== CHART ===== */
.vol-chart-wrap {
  background: #FAFAFA;
  border-radius: 12px;
  border: 1px solid #F0F0F0;
  padding: 16px 12px 12px;
  height: 280px;
  position: relative;
  flex-shrink: 0;
}

.vol-canvas {
  width: 100% !important;
  height: 100% !important;
}

.vol-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: #BDBDBD;
}
.vol-empty { font-size: 40px; }
.vol-empty p { font-size: 13px; }

/* ===== LEGEND ===== */
.vol-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
}

.vol-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #616161;
  background: #F5F5F5;
  border-radius: 20px;
  padding: 4px 10px 4px 6px;
}

.vol-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.vol-legend-name {
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== MOBILE ===== */
@media (max-width: 600px) {
  .vol-modal {
    width: 96% !important;
    max-height: 90vh;
  }

  .vol-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .vol-dropdown-wrap {
    min-width: unset;
    width: 100%;
  }

  .vol-chart-wrap {
    height: 220px;
  }
}
</style>