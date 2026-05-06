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

// ── State ──────────────────────────────────────────────
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
const abortController = ref(null)
let resizeObserver = null

// Chart config
const periode = ref('mingguan')   // 'mingguan' | 'bulanan'
const chartType = ref('line')     // 'line' | 'bar'

// Raw data simpan untuk re-render saat filter/type berubah
const rawLaporan7Hari = ref([])
const rawLaporan30Hari = ref([])
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
  const data = periode.value === 'mingguan' ? rawLaporan7Hari.value : rawLaporan30Hari.value
  return buildLaporanValues(data, periode.value === 'mingguan' ? 7 : 30)
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
    const res = await api.get('/api/dashboard/admin')
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
    rawLaporan30Hari.value  = d.laporan30Hari  ?? d.laporan7Hari ?? []

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
})

onActivated(() => {
  fetchDashboard()
  setupResizeObserver()
  setupWindowResizeListener()
})

onUnmounted(() => {
  removeWindowResizeListener()
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

// ── Helpers ─────────────────────────────────────────────
function buildLaporanValues(data, days) {
  const labels = []
  const values = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const tanggal = d.toLocaleDateString('en-CA')

    if (days <= 7) {
      labels.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }))
    } else {
      labels.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }))
    }

    const found = (data ?? []).find(item => {
      const dbDate = new Date(item.tanggal).toLocaleDateString('en-CA')
      return dbDate === tanggal
    })
    values.push(found ? found.total : 0)
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