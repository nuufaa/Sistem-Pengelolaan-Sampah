<template>
  <section class="content-section active">
    <div class="section-header">
      <h2 class="section-title">Dashboard</h2>
    </div>

    <!-- STAT CARDS -->
    <div class="stats-cards">
      <div class="stat-card stat-green">
        <div class="stat-icon-wrap">
          <span class="material-icons">delete</span>
        </div>
        <div class="stat-info">
          <h3 class="stat-value">{{ animatedTPS }}</h3>
          <p class="stat-label">Total TPS</p>
        </div>
        <div class="stat-bg-icon">
          <span class="material-icons">delete</span>
        </div>
      </div>

      <div class="stat-card stat-orange">
        <div class="stat-icon-wrap">
          <span class="material-icons">badge</span>
        </div>
        <div class="stat-info">
          <h3 class="stat-value">{{ animatedPetugas }}</h3>
          <p class="stat-label">Total Petugas</p>
        </div>
        <div class="stat-bg-icon">
          <span class="material-icons">badge</span>
        </div>
      </div>

      <div class="stat-card stat-blue">
        <div class="stat-icon-wrap">
          <span class="material-icons">report</span>
        </div>
        <div class="stat-info">
          <h3 class="stat-value">{{ animatedLaporan }}</h3>
          <p class="stat-label">Laporan Bulan Ini</p>
        </div>
        <div class="stat-bg-icon">
          <span class="material-icons">report</span>
        </div>
      </div>

      <div class="stat-card stat-red">
        <div class="stat-icon-wrap">
          <span class="material-icons">warning</span>
        </div>
        <div class="stat-info">
          <h3 class="stat-value">{{ animatedTPSPenuh }}</h3>
          <p class="stat-label">TPS Penuh</p>
        </div>
        <div class="stat-bg-icon">
          <span class="material-icons">warning</span>
        </div>
      </div>
    </div>

    <!-- CHARTS -->
    <div class="dashboard-charts">

      <!-- PIE CHART: Status TPS -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Status TPS Terkini</h3>
            <p class="chart-subtitle">Distribusi kondisi seluruh TPS</p>
          </div>
          <button class="btn-refresh" @click="fetchDashboard" :disabled="loading" title="Refresh data">
            <span class="material-icons" :class="{ spinning: loading }">refresh</span>
          </button>
        </div>

        <div class="chart-body">
          <div v-if="loading" class="chart-skeleton">
            <div class="skeleton-circle"></div>
          </div>
          <template v-else>
            <canvas ref="statusChartRef"></canvas>
            <div class="doughnut-center">
              <span class="doughnut-total">{{ statusTotal }}</span>
              <span class="doughnut-label">Total TPS</span>
            </div>
          </template>
        </div>

        <div class="custom-legend" v-if="!loading">
          <div class="legend-item" v-for="item in statusLegend" :key="item.status">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- LINE/BAR CHART: Laporan dengan Filter -->
      <div class="chart-card chart-card-wide">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Tren Laporan</h3>
            <p class="chart-subtitle">
              <strong>X-Axis:</strong> Tanggal | <strong>Y-Axis:</strong> Jumlah Laporan
            </p>
          </div>
          <div class="chart-controls">
            <div class="toggle-group">
              <button
                class="toggle-btn"
                :class="{ active: chartType === 'line' }"
                @click="setChartType('line')"
                title="Line chart"
              >
                <span class="material-icons">show_chart</span>
              </button>
              <button
                class="toggle-btn"
                :class="{ active: chartType === 'bar' }"
                @click="setChartType('bar')"
                title="Bar chart"
              >
                <span class="material-icons">bar_chart</span>
              </button>
            </div>

            <!-- Filter Periode -->
            <div class="filter-tabs">
              <button
                class="filter-tab"
                :class="{ active: periode === 'mingguan' }"
                @click="setPeriode('mingguan')"
              >
                Mingguan
              </button>
              <button
                class="filter-tab"
                :class="{ active: periode === 'bulanan' }"
                @click="setPeriode('bulanan')"
              >
                Bulanan
              </button>
            </div>

            <!-- Month/Year Picker (Only if Bulanan) -->
            <div v-if="periode === 'bulanan'" class="date-pickers">
              <select v-model="selectedMonth" class="date-select">
                <option v-for="(m, i) in months" :key="i" :value="i + 1">
                  {{ m }}
                </option>
              </select>
              <select v-model="selectedYear" class="date-select">
                <option v-for="y in years" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="chart-body chart-body-tall">
          <div v-if="loading" class="chart-skeleton">
            <div class="skeleton-bars">
              <div class="skeleton-bar" v-for="n in 7" :key="n" :style="{ height: (Math.random() * 60 + 20) + '%' }"></div>
            </div>
          </div>
          <canvas v-else ref="laporanChartRef"></canvas>
        </div>

        <!-- Summary bawah chart -->
        <div class="chart-summary" v-if="!loading">
          <div class="summary-item" title="Total laporan dalam periode yang dipilih">
            <span class="summary-label">Total Laporan</span>
            <span class="summary-value">{{ laporanTotal }}</span>
            <span class="summary-info">laporan</span>
          </div>
          <div class="summary-item" title="Rata-rata laporan per hari">
            <span class="summary-label">Rata-rata / Hari</span>
            <span class="summary-value">{{ laporanAvg }}</span>
            <span class="summary-info">laporan</span>
          </div>
          <div class="summary-item" title="Jumlah laporan tertinggi dalam periode" style="border-color: #3b82f6; background: rgba(59,130,246,0.05);">
            <span class="summary-label">Jumlah Laporan Tertinggi</span>
            <span class="summary-value summary-high">{{ laporanMax }}</span>
            <span class="summary-info">laporan</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onUnmounted, watch, nextTick } from 'vue'
import api from '@/services/api'
import Chart from 'chart.js/auto'
import { TabSync } from '@/services/tabSync'

const loading = ref(true)

const totalTPS = ref(0)
const totalPetugas = ref(0)
const totalLaporan = ref(0)
const totalTPSPenuh = ref(0)

// Animated counters
const animatedTPS = ref(0)
const animatedPetugas = ref(0)
const animatedLaporan = ref(0)
const animatedTPSPenuh = ref(0)

const statusChartRef = ref(null)
const laporanChartRef = ref(null)

let statusChart = null
let laporanChart = null
let resizeObserver = null

// Auto-refresh interval
let pollInterval = null
const POLL_INTERVAL_MS = 30 * 1000 // 30 detik
let unsubscribeSync = null

// Chart config
const periode = ref('mingguan')   // 'mingguan' | 'bulanan'
const chartType = ref('line')     // 'line' | 'bar'

const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const years = computed(() => {
  const current = new Date().getFullYear()
  const start = 2024
  const res = []
  for (let y = current; y >= start; y--) res.push(y)
  return res
})

// Raw data simpan untuk re-render saat filter/type berubah
const rawLaporan7Hari = ref([])
const rawLaporanBulanIni = ref([])
const rawStatusTPS = ref([])

// ── Legend & Summary ────────────────────────────────────
const statusMap = {
  normal:       { label: 'Normal',       color: '#22c55e' },
  hampir_penuh: { label: 'Hampir Penuh', color: '#f59e0b' },
  penuh:        { label: 'Penuh',        color: '#ef4444' },
}
const ORDER = ['normal', 'hampir_penuh', 'penuh']

const statusLegend = computed(() =>
  ORDER.map(s => ({
    status: s,
    label: statusMap[s].label,
    color: statusMap[s].color,
    value: rawStatusTPS.value.find(i => i.status_tps === s)?.total ?? 0,
  }))
)
const statusTotal = computed(() => statusLegend.value.reduce((a, b) => a + b.value, 0))

const laporanValues = computed(() => {
  const data = periode.value === 'mingguan' ? rawLaporan7Hari.value : rawLaporanBulanIni.value
  return buildLaporanValues(data, periode.value)
})

const laporanTotal = computed(() => laporanValues.value.values.reduce((a, b) => a + b, 0))
const laporanMax   = computed(() => Math.max(...laporanValues.value.values, 0))
const laporanAvg   = computed(() =>
  laporanValues.value.values.length
    ? (laporanTotal.value / laporanValues.value.values.length).toFixed(1)
    : 0
)

// ── Debounce Helper ────────────────────────────────────
function debounce(fn, delay = 300) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const debouncedRenderCharts = debounce(() => {
  if (!loading.value) {
    nextTick(() => {
      renderStatusChart()
      renderLaporanChart()
    })
  }
}, 200)

// ── Animate counter ────────────────────────────────────
function animateCount(target, animated, duration = 800) {
  const start = animated.value
  const diff = target - start
  const steps = 30
  const step = diff / steps
  let current = 0
  const timer = setInterval(() => {
    current++
    animated.value = Math.round(start + step * current)
    if (current >= steps) {
      animated.value = target
      clearInterval(timer)
    }
  }, duration / steps)
}

// ── Fetch ───────────────────────────────────────────────
async function fetchDashboard() {
  loading.value = true
  try {
    const params = {}
    if (periode.value === 'bulanan') {
      params.month = selectedMonth.value
      params.year = selectedYear.value
    }
    
    const res = await api.get('/api/dashboard/admin', { params })
    const d = res.data

    totalTPS.value      = d.totalTPS
    totalPetugas.value  = d.totalPetugas
    totalLaporan.value  = d.totalLaporan
    totalTPSPenuh.value = d.totalTPSPenuh

    animateCount(d.totalTPS,      animatedTPS)
    animateCount(d.totalPetugas,  animatedPetugas)
    animateCount(d.totalLaporan,  animatedLaporan)
    animateCount(d.totalTPSPenuh, animatedTPSPenuh)

    rawStatusTPS.value      = d.statusTPS      ?? []
    rawLaporan7Hari.value   = d.laporan7Hari   ?? []
    rawLaporanBulanIni.value = d.laporanBulanIni ?? []

    loading.value = false

    await nextTick()
    renderStatusChart()
    renderLaporanChart()
  } catch (err) {
    console.error('Gagal ambil dashboard:', err)
    loading.value = false
  }
}

// ── Setup Resize Observer & Window Listener ────────────────────────────
function setupResizeObserver() {
  if (typeof ResizeObserver === 'undefined') return
  
  const container = document.querySelector('.dashboard-charts')
  if (!container) return

  resizeObserver = new ResizeObserver(() => {
    debouncedRenderCharts()
  })

  resizeObserver.observe(container)
}

function setupWindowResizeListener() {
  window.addEventListener('resize', debouncedRenderCharts)
}

function removeWindowResizeListener() {
  window.removeEventListener('resize', debouncedRenderCharts)
}

onMounted(() => {
  fetchDashboard()
  setupResizeObserver()
  setupWindowResizeListener()

  // Start polling
  pollInterval = setInterval(fetchDashboard, POLL_INTERVAL_MS)

  // Listen to updates from other tabs
  unsubscribeSync = TabSync.listen((event) => {
    console.log('TabSync event received:', event)
    fetchDashboard() // Refresh whenever any data changes in other tabs
  })
})

onActivated(() => {
  fetchDashboard()
  setupResizeObserver()
  setupWindowResizeListener()
  
  if (!pollInterval) {
    pollInterval = setInterval(fetchDashboard, POLL_INTERVAL_MS)
  }
  if (!unsubscribeSync) {
    unsubscribeSync = TabSync.listen(() => fetchDashboard())
  }
})

onUnmounted(() => {
  removeWindowResizeListener()
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  if (unsubscribeSync) {
    unsubscribeSync()
    unsubscribeSync = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (statusChart) {
    statusChart.destroy()
    statusChart = null
  }
  if (laporanChart) {
    laporanChart.destroy()
    laporanChart = null
  }
})

// ── Watch filter / chart type ───────────────────────────
watch([periode, chartType], () => {
  if (!loading.value) renderLaporanChart()
})

watch([selectedMonth, selectedYear], () => {
  if (periode.value === 'bulanan') fetchDashboard()
})

// ── Helpers ─────────────────────────────────────────────
function buildLaporanValues(data, mode) {
  const labels = []
  const values = []

  const today = new Date()
  let startDate, endDate

  if (mode === 'mingguan') {
    // 7 hari ke belakang dari hari ini
    startDate = new Date()
    startDate.setDate(today.getDate() - 6)
    endDate = today
  } else {
    // Full 1 Bulan (dari tanggal 1 sampai akhir bulan yang dipilih)
    startDate = new Date(selectedYear.value, selectedMonth.value - 1, 1)
    endDate = new Date(selectedYear.value, selectedMonth.value, 0)
  }

  let current = new Date(startDate)
  while (current <= endDate) {
    const tanggal = current.toLocaleDateString('en-CA')

    if (mode === 'mingguan') {
      labels.push(current.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }))
    } else {
      // Untuk bulanan hanya tampilkan angka tanggalnya agar tidak terlalu rapat
      labels.push(current.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }))
    }

    const found = (data ?? []).find(item => {
      const dbDate = new Date(item.tanggal).toLocaleDateString('en-CA')
      return dbDate === tanggal
    })
    values.push(found ? found.total : 0)

    current.setDate(current.getDate() + 1)
  }

  return { labels, values }
}

// ── Chart Renders ───────────────────────────────────────
function renderStatusChart() {
  if (statusChart) { statusChart.destroy(); statusChart = null }
  if (!statusChartRef.value) return

  const labels = statusLegend.value.map(i => i.label)
  const values = statusLegend.value.map(i => i.value)
  const colors = statusLegend.value.map(i => i.color)

  statusChart = new Chart(statusChartRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} TPS`
          }
        }
      },
      animation: {
        animateRotate: true,
        duration: 800,
        easing: 'easeInOutQuart'
      }
    }
  })
}

function renderLaporanChart() {
  if (laporanChart) { laporanChart.destroy(); laporanChart = null }
  if (!laporanChartRef.value) return

  const { labels, values } = laporanValues.value
  const isBar = chartType.value === 'bar'

  laporanChart = new Chart(laporanChartRef.value, {
    type: chartType.value,
    data: {
      labels,
      datasets: [{
        label: 'Jumlah Laporan',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: isBar
          ? values.map((_, i) => `rgba(59,130,246,${0.5 + (i % 3) * 0.1})`)
          : 'rgba(59,130,246,0.12)',
        borderWidth: isBar ? 0 : 2.5,
        borderRadius: isBar ? 6 : 0,
        fill: !isBar,
        tension: 0.4,
        pointRadius: isBar ? 0 : 5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          titleColor: '#94a3b8',
          bodyColor: '#f1f5f9',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} laporan`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#94a3b8' },
          grid: { color: 'rgba(148,163,184,0.12)' }
        },
        x: {
          ticks: {
            color: '#94a3b8',
            maxRotation: periode.value === 'bulanan' ? 45 : 0,
          },
          grid: { display: false }
        }
      },
      animation: {
        duration: 600,
        easing: 'easeInOutQuart'
      }
    }
  })
}

// ── Actions ─────────────────────────────────────────────
function setPeriode(val) {
  periode.value = val
}
function setChartType(val) {
  chartType.value = val
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>
<style scoped>
.date-pickers {
  display: flex;
  gap: 8px;
  align-items: center;
}
.date-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.date-select:focus {
  border-color: var(--primary);
}
</style>