<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Dashboard</h2>
    </div>

    <!-- STAT CARDS -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #E8F5E9;">
          <span class="material-icons" style="color: #4CAF50;">delete</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalTPS }}</h3>
          <p>Total TPS</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #FFF3E0;">
          <span class="material-icons" style="color: #FF9800;">badge</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalPetugas }}</h3>
          <p>Total Petugas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #E3F2FD;">
          <span class="material-icons" style="color: #2196F3;">report</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalLaporan }}</h3>
          <p>Laporan Bulan Ini</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #FFEBEE;">
          <span class="material-icons" style="color: #F44336;">warning</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalTPSPenuh }}</h3>
          <p>TPS Penuh</p>
        </div>
      </div>
    </div>

    <!-- CHART PLACEHOLDER -->
    <div class="dashboard-charts">
      <div class="chart-card">
        <h3>Status TPS Terkini</h3>
        <canvas ref="statusChartRef" class="pie-chart"></canvas>
      </div>

      <div class="chart-card">
        <h3>Laporan 7 Hari Terakhir</h3>
        <canvas ref="laporanChartRef" class="line-chart"></canvas>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick} from 'vue'
import api from '@/services/api'
import Chart from 'chart.js/auto' 

const totalTPS = ref(0)
const totalPetugas = ref(0)
const totalLaporan = ref(0)
const totalTPSPenuh = ref(0)

const statusChartRef = ref(null)
const laporanChartRef = ref(null)

let statusChart = null
let laporanChart = null

async function fetchDashboard() {
  try {
    const res = await api.get('/api/dashboard/admin')

    totalTPS.value = res.data.totalTPS
    totalPetugas.value = res.data.totalPetugas
    totalLaporan.value = res.data.totalLaporan
    totalTPSPenuh.value = res.data.totalTPSPenuh

    await nextTick()
    renderStatusChart(res.data.statusTPS)
    renderLaporanChart(res.data.laporan7Hari)

  } catch (error) {
    console.error("Gagal ambil dashboard:", error)
  }
}
onMounted(fetchDashboard)

function renderStatusChart(data) {
  if (statusChart) statusChart.destroy()

  const labels = data.map(item => item.status_tps)
  const values = data.map(item => item.total)

  statusChart = new Chart(statusChartRef.value, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'Status TPS',
        data: values,
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
    }
  })
}


function renderLaporanChart(data) {
  if (laporanChart) laporanChart.destroy()

  const days = 7
  const labels = []
  const values = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    const tanggal = d.toLocaleDateString('en-CA')

    // label tampil
    labels.push(
      d.toLocaleDateString('id-ID', { weekday: 'short' })
    )

    // cari data laporan
    const laporan = data.find(item => {
      const dbDate = new Date(item.tanggal).toLocaleDateString('en-CA')
      return dbDate === tanggal
    })

    values.push(laporan ? laporan.total : 0)
  }

  laporanChart = new Chart(laporanChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Jumlah Laporan',
        data: values,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#2196F3',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  })
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>