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
            <p class="vol-subtitle">Data pengangkutan TPS · {{ currentMonthLabel }}</p>
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

          <!-- Filter Tanggal -->
          <div class="vol-filter-item">
            <span class="vol-filter-label">Tanggal</span>
            <div class="vol-date-wrap" :class="{ 'filter-active': filterMode === 'tanggal' }">
              <span class="material-icons vol-date-icon">calendar_today</span>
              <input type="date" class="vol-date-input" v-model="filterTanggal" @change="onTanggalChange" />
            </div>
          </div>

          <!-- Separator -->
          <div class="vol-filter-sep">
            <span class="vol-filter-sep-line"></span>
            <span class="vol-filter-sep-text">atau</span>
            <span class="vol-filter-sep-line"></span>
          </div>

          <!-- Filter Bulan -->
          <div class="vol-filter-item">
            <span class="vol-filter-label">Bulan</span>
            <div class="vol-date-wrap" :class="{ 'filter-active': filterMode === 'bulan' }">
              <span class="material-icons vol-date-icon">date_range</span>
              <input type="month" class="vol-date-input" v-model="filterBulan" @change="onBulanChange" />
            </div>
          </div>

          <!-- Tombol Reset -->
          <button v-if="filterMode !== null" class="vol-reset-btn" @click="resetFilter" title="Reset filter">
            <span class="material-icons">restart_alt</span>
          </button>

          <!-- TPS dipilih -->
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
const filterChart = ref('bulanan')
const tpsList = ref([])
const selectedTPS = ref([])
const isDropdownOpen = ref(false)
const searchTPS = ref('')

// Filter tanggal & bulan
const filterMode = ref(null) // null | 'tanggal' | 'bulan'
const filterTanggal = ref('')
const filterBulan = ref('')


const props = defineProps({
  isModalOpen: { type: Boolean, default: false },
  volumeSampahData: { type: Array, default: () => [] }
})

// Palette warna
const COLORS = [
  '#2E7D32', '#1565C0', '#E65100', '#6A1B9A', '#00838F',
  '#AD1457', '#558B2F', '#283593', '#BF360C', '#4527A0',
  '#00695C', '#C62828', '#0277BD', '#F57F17', '#37474F'
]

function getTpsColor(tps) {
  const idx = tpsList.value.indexOf(tps)
  return COLORS[idx % COLORS.length]
}

function onTanggalChange() {
  if (!filterTanggal.value) return
  filterMode.value = 'tanggal'
  filterBulan.value = ''
  nextTick(() => renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value))
}

function onBulanChange() {
  if (!filterBulan.value) return
  filterMode.value = 'bulan'
  filterTanggal.value = ''
  nextTick(() => renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value))
}

function resetFilter() {
  filterMode.value = null
  filterTanggal.value = ''
  filterBulan.value = ''
  nextTick(() => renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value))
}

const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const currentMonthLabel = computed(() => {
  const now = new Date()
  return `${MONTHS_FULL[now.getMonth()]} ${now.getFullYear()}`
})

watch(() => props.volumeSampahData, (newData) => {
  if (newData && newData.length > 0) {
    volumeSampahHarian.value = newData
    tpsList.value = [...new Set(newData.map(item => item.nama_tps))]
    if (selectedTPS.value.length === 0) {
      selectedTPS.value = [...tpsList.value]
    }
    if (props.isModalOpen) {
      nextTick(() => {
        renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value)
      })
    }
  }
}, { deep: true, immediate: true })

watch(() => props.isModalOpen, (isOpen) => {
  if (isOpen) {
    // Set default bulan sekarang jika belum ada filter aktif
    if (!filterBulan.value && filterMode.value !== 'tanggal') {
      const now = new Date()
      filterBulan.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      filterMode.value = 'bulan'
    }
    if (volumeSampahHarian.value.length > 0) {
      nextTick(() => {
        renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value)
      })
    }
  }
})

async function renderVolumeSampahChart(data, filter = 'mingguan', selectedTPSList = []) {
  if (!volumeSampahChartRef.value) await nextTick()
  if (!volumeSampahChartRef.value) return

  if (volumeSampahChart) {
    volumeSampahChart.destroy()
    volumeSampahChart = null
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  // Format tanggal stabil untuk label (Contoh: 12 Mei)
  const formatTglLabel = (d) => {
    if (!d) return ''
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`
  }

  // Parser tanggal — mendukung string ('2026-05-12' atau ISO) dan JS Date object (dari MySQL2)
  const parseDate = (input) => {
    if (!input) return null
    // Jika sudah berupa Date object (MySQL2 mengembalikan DATE column sebagai Date)
    if (input instanceof Date) {
      if (isNaN(input.getTime())) return null
      return new Date(input.getFullYear(), input.getMonth(), input.getDate())
    }
    // Jika string
    try {
      const str = String(input)
      const [year, month, day] = str.split('T')[0].split('-').map(Number)
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null
      return new Date(year, month - 1, day)
    } catch (e) {
      return null
    }
  }

  // Ambil bagian tanggal (YYYY, MM, DD) dari Date object atau string secara aman
  const getDateParts = (input) => {
    const d = parseDate(input)
    if (!d) return null
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }
  }

  // Format tanggal untuk key mapping dataMap
  const formatDateKey = (input) => {
    const d = parseDate(input)
    return formatTglLabel(d)
  }

  // Tentukan labels — filter aktif didahulukan
  let labels = []
  if (filterMode.value === 'tanggal' && filterTanggal.value) {
    const d = parseDate(filterTanggal.value)
    if (d) labels = [formatTglLabel(d)]
  } else if (filterMode.value === 'bulan' && filterBulan.value) {
    const [y, m] = filterBulan.value.split('-').map(Number)
    const daysInMonth = new Date(y, m, 0).getDate()
    labels = [...Array(daysInMonth)].map((_, i) =>
      formatTglLabel(new Date(y, m - 1, i + 1))
    )
  } else if (filter === 'mingguan') {
    labels = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (6 - i))
      return formatTglLabel(d)
    })
  } else if (filter === 'bulanan') {
    // Jika tidak ada filter bulan aktif, gunakan bulan dari data terbaru atau bulan sekarang
    let refDate = new Date()
    if (data && data.length > 0) {
      const lastDataDate = parseDate(data[data.length - 1].tanggal)
      if (lastDataDate) refDate = lastDataDate
    }
    const y = refDate.getFullYear()
    const m = refDate.getMonth() + 1
    const daysInMonth = new Date(y, m, 0).getDate()
    labels = [...Array(daysInMonth)].map((_, i) =>
      formatTglLabel(new Date(y, m - 1, i + 1))
    )
  }

  // Filter data sesuai mode aktif — getDateParts() menangani Date object & string
  const filteredData = (() => {
    if (!data) return []
    if (filterMode.value === 'tanggal' && filterTanggal.value) {
      const [ty, tm, td] = filterTanggal.value.split('-').map(Number)
      return data.filter(d => {
        const p = getDateParts(d.tanggal)
        if (!p) return false
        return ty === p.y && tm === p.m && td === p.d
      })
    }
    if (filterMode.value === 'bulan' && filterBulan.value) {
      const [year, month] = filterBulan.value.split('-').map(Number)
      return data.filter(d => {
        const p = getDateParts(d.tanggal)
        if (!p) return false
        return p.y === year && p.m === month
      })
    }
    return data
  })()

  const dataMap = {}
  filteredData.forEach(d => {
    const labelKey = formatDateKey(d.tanggal)
    if (!labelKey) return
    const key = `${labelKey}-${d.nama_tps}`
    dataMap[key] = (dataMap[key] || 0) + Number(d.total_volume || 0)
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
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    fill: false,
    tension: 0.3,
    pointRadius: labels.map(label => (dataMap[`${label}-${tps}`] || 0) > 0 ? 3 : 0),
    pointHoverRadius: labels.map(label => (dataMap[`${label}-${tps}`] || 0) > 0 ? 5 : 0),
    pointBackgroundColor: '#fff',
    pointBorderColor: color,
    pointBorderWidth: 1.5,
    spanGaps: false,
    borderDash: hasData ? [] : [4, 4],  // garis putus jika TPS tidak ada data
  }
})

  volumeSampahChart = new Chart(volumeSampahChartRef.value, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
  maintainAspectRatio: false,
  clip: false,
  interaction: { mode: 'index', intersect: false },
  layout: { padding: { top: 60, right: 16, bottom: 0, left: 0 } },
  elements: {
    line: { capBezierPoints: true }
  },
  scales: {
  y: {
    beginAtZero: true,
    border: { display: false, color: '#BDBDBD', dash: [4, 4] },  // garis Y putus-putus seperti GA
    grid: {
      color: '#BDBDBD',
      drawTicks: false,
      lineWidth: 1,
    },
    ticks: {
      callback: v => v === 0 ? '0' : v + ' kg',
      font: { size: 11, family: 'DM Sans, sans-serif' },
      color: '#9AA0A6',  // warna label GA
      padding: 12,
      maxTicksLimit: 5,
    }
  },
  x: {
    border: { display: false },
    grid: {
      color: '#F1F3F4',   // GA menampilkan grid vertikal tipis
      drawTicks: false,
      lineWidth: 1,
    },
    ticks: {
      font: { size: 11, family: 'DM Sans, sans-serif' },
      color: '#9AA0A6',
      maxRotation: 0,
      autoSkip: true,
      maxTicksLimit: 10,
      padding: 8,
    }
  }
},
      plugins: {
        legend: { display: false },
        tooltip: {
  enabled: false,
  external: (context) => {
    const { chart, tooltip } = context

    let el = document.getElementById('vol-custom-tooltip')
    if (!el) {
      el = document.createElement('div')
      el.id = 'vol-custom-tooltip'
      el.style.cssText = `
        position: absolute;
        background: #1A1A2E;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        padding: 10px 14px;
        pointer-events: none;
        z-index: 9999;
        min-width: 200px;
        font-family: DM Sans, sans-serif;
        font-size: 12px;
        color: #D0D0D0;
        transition: opacity 0.15s;
      `
      chart.canvas.parentNode.style.position = 'relative'
      chart.canvas.parentNode.appendChild(el)
    }

    if (tooltip.opacity === 0) {
      el.style.opacity = '0'
      return
    }

    const items = tooltip.dataPoints?.filter(p => p.raw > 0) || []
    items.sort((a, b) => b.raw - a.raw)

    const title = `
      <div style="color:#fff;font-weight:600;font-size:13px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.1)">
        ${tooltip.title?.[0] || ''}
      </div>`

    const rows = items.map(p => {
      const color = p.dataset.borderColor
      const name = p.dataset.label
      const val = p.raw
      return `
        <div style="display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:6px;padding:3px 0">
          <span style="width:7px;height:7px;border-radius:50%;background:${color};justify-self:center"></span>
          <span style="font-size:12px;color:#D0D0D0">${name}</span>
          <span style="font-size:12px;color:#fff;font-weight:500;font-variant-numeric:tabular-nums;text-align:right">${val} kg</span>
        </div>`
    }).join('')

    const total = items.reduce((s, p) => s + p.raw, 0)
    const footer = `
      <div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);display:grid;grid-template-columns:1fr auto;gap:6px">
        <span style="color:#9E9E9E;font-size:12px">Total</span>
        <span style="color:#fff;font-weight:600;font-size:12px;font-variant-numeric:tabular-nums;text-align:right">${total} kg</span>
      </div>`

    el.innerHTML = title + rows + footer

    const { offsetLeft, offsetTop } = chart.canvas
    let left = offsetLeft + tooltip.caretX + 12
    let top = offsetTop + tooltip.caretY - el.offsetHeight / 2

    if (left + 220 > chart.canvas.parentNode.offsetWidth) {
      left = offsetLeft + tooltip.caretX - el.offsetWidth - 12
    }
    if (top < 0) top = 8

    el.style.left = left + 'px'
    el.style.top = top + 'px'
    el.style.opacity = '1'
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
  flex-wrap: wrap;
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

/* Filter tanggal & bulan */
.vol-date-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid #E0E0E0;
  border-radius: 8px;
  padding: 6px 10px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.vol-date-wrap:hover { border-color: #4CAF50; }
.vol-date-wrap.filter-active {
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46,125,50,0.10);
}
.vol-date-icon { font-size: 16px !important; color: #4CAF50; flex-shrink: 0; }
.vol-date-input {
  border: none;
  outline: none;
  font-size: 13px;
  font-weight: 500;
  color: #424242;
  background: transparent;
  cursor: pointer;
}

/* Separator */
.vol-filter-sep {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 8px;
  gap: 3px;
}
.vol-filter-sep-line { width: 1px; height: 14px; background: #E0E0E0; }
.vol-filter-sep-text {
  font-size: 10px;
  font-weight: 600;
  color: #BDBDBD;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Reset button */
.vol-reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #FFCDD2;
  background: #FFEBEE;
  color: #C62828;
  cursor: pointer;
  align-self: flex-end;
  transition: all 0.2s;
  flex-shrink: 0;
}
.vol-reset-btn:hover { background: #C62828; color: #fff; border-color: #C62828; }
.vol-reset-btn .material-icons { font-size: 18px !important; }

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
  /* background: #FAFAFA;
  border-radius: 12px;
  border: 1px solid #F0F0F0;
  padding: 16px 12px 12px;
  height: 280px;
  position: relative;
  flex-shrink: 0;
   overflow: visible; */
   background: #fff;
  border-radius: 12px;
  border: 1px solid #EEEEEE;
  padding: 16px 12px 12px;
  height: 280px;
  position: relative;
  flex-shrink: 0;
  overflow: visible;
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

  .vol-filter-sep {
    flex-direction: row;
    gap: 6px;
  }
  .vol-filter-sep-line {
    flex: 1;
    width: auto;
    height: 1px;
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