<template>
  <section class="content-section active">
    <div class="section-header">
      <h2 class="section-title">Dashboard</h2>
      <p class="section-subtitle">Ringkasan data TPS & laporan terkini</p>
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

        <!-- Legend Kustom -->
        <div class="custom-legend" v-if="!loading">
          <div class="legend-item" v-for="item in statusLegend" :key="item.status">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.value }}</span>
            <span class="legend-pct">
              ({{ statusTotal > 0 ? Math.round((item.value / statusTotal) * 100) : 0 }}%)
            </span>
          </div>
        </div>
      </div>

      <!-- LINE/BAR CHART: Laporan dengan Filter -->
      <div class="chart-card chart-card-wide">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Tren Laporan</h3>
            <p class="chart-subtitle">Jumlah laporan per periode</p>
          </div>
          <div class="chart-controls">
            <!-- Toggle Chart Type -->
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
          <div class="summary-item">
            <span class="summary-label">Total Periode</span>
            <span class="summary-value">{{ laporanTotal }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Rata-rata / Hari</span>
            <span class="summary-value">{{ laporanAvg }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Tertinggi</span>
            <span class="summary-value summary-high">{{ laporanMax }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, watch, nextTick } from 'vue'
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

onMounted(fetchDashboard)
onActivated(fetchDashboard)

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

<style scoped>
/* ── Section Header ────────────────────────────────── */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}
.section-subtitle {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 0 0 20px;
}

/* ── Stat Cards ────────────────────────────────────── */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.stat-green  { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); }
.stat-orange { background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); }
.stat-blue   { background: linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%); }
.stat-red    { background: linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%); }

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-green  .stat-icon-wrap { background: rgba(34,197,94,0.2);  }
.stat-orange .stat-icon-wrap { background: rgba(245,158,11,0.2); }
.stat-blue   .stat-icon-wrap { background: rgba(59,130,246,0.2); }
.stat-red    .stat-icon-wrap { background: rgba(239,68,68,0.2);  }

.stat-green  .stat-icon-wrap .material-icons { color: #16a34a; }
.stat-orange .stat-icon-wrap .material-icons { color: #d97706; }
.stat-blue   .stat-icon-wrap .material-icons { color: #2563eb; }
.stat-red    .stat-icon-wrap .material-icons { color: #dc2626; }

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  color: #0f172a;
  margin: 0 0 3px;
}
.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* background decorative icon */
.stat-bg-icon {
  position: absolute;
  right: -6px;
  bottom: -6px;
  opacity: 0.07;
}
.stat-bg-icon .material-icons { font-size: 72px; }

/* ── Chart Cards ───────────────────────────────────── */
.dashboard-charts {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 960px) {
  .dashboard-charts { grid-template-columns: 1fr; }
}

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.chart-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}
.chart-subtitle {
  font-size: 0.72rem;
  color: #94a3b8;
  margin: 0;
}

/* Refresh button */
.btn-refresh {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.btn-refresh:hover { background: #e2e8f0; }
.btn-refresh .material-icons { font-size: 18px; color: #64748b; }
.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

.spinning {
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Chart body */
.chart-body {
  height: 190px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart-body-tall {
  height: 240px;
  display: block;
}

/* Skeleton loading */
.chart-skeleton {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.skeleton-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
}
.skeleton-bars {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 100%;
  width: 100%;
  padding: 16px 8px 0;
}
.skeleton-bar {
  flex: 1;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

/* ── Controls: Toggle & Filter ─────────────────────── */
.chart-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* Toggle chart type */
.toggle-group {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.toggle-btn {
  background: transparent;
  border: none;
  border-radius: 6px;
  width: 30px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.toggle-btn .material-icons { font-size: 16px; color: #94a3b8; }
.toggle-btn.active {
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.toggle-btn.active .material-icons { color: #3b82f6; }

/* Filter tabs */
.filter-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.filter-tab {
  background: transparent;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.filter-tab.active {
  background: #ffffff;
  color: #3b82f6;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

/* ── Custom Legend (Pie) ───────────────────────────── */
.custom-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  padding: 7px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-label { color: #475569; flex: 1; font-weight: 500; }
.legend-value { font-weight: 800; color: #0f172a; min-width: 20px; text-align: right; }
.legend-pct   { color: #94a3b8; font-size: 0.7rem; min-width: 42px; text-align: right; }

/* ── Summary (Line/Bar) ────────────────────────────── */
.chart-summary {
  display: flex;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}
.summary-item {
  flex: 1;
  text-align: center;
  padding: 10px 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
}
.summary-label {
  display: block;
  font-size: 0.68rem;
  color: #94a3b8;
  margin-bottom: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.summary-value {
  display: block;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}
.summary-high { color: #3b82f6; }

/* ── Doughnut center label ─────────────────────────── */
.doughnut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
.doughnut-total {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}
.doughnut-label {
  display: block;
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>