<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Dashboard Petugas</h2>
      <div class="header-date">
        {{ today }}
      </div>
    </div>

    <!-- Statistik -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background:#E3F2FD">
          <span class="material-icons" style="color:#2196F3">assignment</span>
        </div>
        <div class="stat-info">
          <h3>{{ total }}</h3>
          <p>Total Tugas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#FFF3E0">
          <span class="material-icons" style="color:#FF9800">pending</span>
        </div>
        <div class="stat-info">
          <h3>{{ pending }}</h3>
          <p>Belum Mulai</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#E8F5E9">
          <span class="material-icons" style="color:#4CAF50">check_circle</span>
        </div>
        <div class="stat-info">
          <h3>{{ done }}</h3>
          <p>Selesai</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#FFF9C4">
          <span class="material-icons" style="color:#FBC02D">autorenew</span>
        </div>
        <div class="stat-info">
          <h3>{{ progress }}</h3>
          <p>Sedang Berlangsung</p>
        </div>
      </div>
    </div>

    <div class="today-tasks">
      <h3>Tugas Hari Ini</h3>
      <div v-if="todayTasks.length === 0" class="no-tasks" style="color:#757575; padding:20px; text-align:center;">
        Tidak ada tugas hari ini
      </div>
      <div v-else class="task-list">
        <div v-for="task in todayTasks" :key="task.id_daftar_tugas" class="task-item">
          <div class="task-info">
            <h4>{{ task.nama_tps }}</h4>
            <p>
              Terakhir diambil: {{ task.tgl_terakhir_diambil ? new Date(task.tgl_terakhir_diambil).toLocaleDateString('id-ID') : 'Belum diambil' }}
              • Jadwal: {{ new Date(task.tgl_pengambilan).toLocaleDateString('id-ID') }}
            </p>
          </div>
            <button class="btn-update" @click="openUpdateModal(task)">
              <span class="material-icons">edit</span>
              <span>Update</span>
            </button>
        </div>
      </div>
    </div>

    <UpdatePengambilanModal
      :show="showModal"
      :data="selectedItem"
      :kendaraanList="kendaraanList"
      @close="showModal = false"
      @save="handleSave"
    />

    <!-- CHART PLACEHOLDER -->
    <div class="dashboard-charts">
      <div class="chart-card">
        <h3>Status TPS Terkini</h3>
        <canvas ref="statusChartRef" class="pie-chart"></canvas>
      </div>

      <div class="chart-card">
        <h3>Laporan 7 Hari Terakhir</h3>
          <select v-model="filterChart">
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
        </select>
        <canvas ref="volumeSampahChartRef" class="line-chart"></canvas>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'
import UpdatePengambilanModal from '@/components/updateStatusModal.vue'
import Chart from 'chart.js/auto'

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const total = ref(0)
const pending = ref(0)
const done = ref(0)
const progress = ref(0)
const volumeSampahHarian = ref([])

const tpsData = ref([])
const pengambilanData = ref([])
const kendaraanList = ref([])

const showModal = ref(false)
const selectedItem = ref(null)

let volumeSampahChart = null
const volumeSampahChartRef = ref(null)
const filterChart = ref('mingguan') // default filter

async function fetchPengambilan() {
  try {
    const res = await api.get('/api/daftar-tugas');
    pengambilanData.value = res.data;
    tpsData.value = res.data.tps || []
  } catch (error) {
    console.error("Gagal ambil daftar tugas:", error)
  }
}

function renderVolumeSampahChart(data, filter = 'mingguan') {
  // destroy chart lama
  if (volumeSampahChart) {
    volumeSampahChart.destroy()
  }

  // format tanggal ke "10 Mar"
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    })
  }

  let labels = []

  if (filter === 'mingguan') {
    labels = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short'
      })
    })
  }

  else if (filter === 'bulanan') {
    const now = new Date()
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate()

    labels = [...Array(daysInMonth)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1)
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short'
      })
    })
  }

  const tpsList = [...new Set(data.map(item => item.nama_tps))]

  const dataMap = {}

  data.forEach(d => {
    const key = `${formatDate(d.tanggal)}-${d.nama_tps}`

    if (!dataMap[key]) {
      dataMap[key] = 0
    }

    dataMap[key] += d.total_volume
  })

  const datasets = tpsList.map((tps) => {
    return {
      label: tps,
      data: labels.map(label => {
        return dataMap[`${label}-${tps}`] || 0
      })
    }
  })

  volumeSampahChart = new Chart(volumeSampahChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      barPercentage: 0.4,
      categoryPercentage: 0.7,
      barThickness: 5,
      maxBarThickness: 20,
      borderRadius: 5,

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => value + ' kg'
          }
        }
      },

      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 12,
              weight: 'bold'
            },
            padding: 8,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.raw} kg`
            }
          }
        }
      }
    }
  })
}

async function fetchKendaraan() {
  const res = await api.get('/api/kendaraan')
  kendaraanList.value = res.data
}

async function fetchDashboard() {
  try {
    const res = await api.get('/api/dashboard/petugas')
    total.value = res.data.total
    pending.value = res.data.pending
    done.value = res.data.done
    progress.value = res.data.progress
    volumeSampahHarian.value = res.data.volumeSampahHarian

    // renderVolumeSampahChart(volumeSampahHarian)

  } catch (error) {
    console.error("Gagal ambil dashboard:", error)
  }
}

watch([filterChart, volumeSampahHarian], () => {
  if (volumeSampahHarian.value.length) {
    renderVolumeSampahChart(
      volumeSampahHarian.value,
      filterChart.value
    )
  }
})

const todayTasks = computed(() => {
  const todayDate = new Date()
  return pengambilanData.value.filter(task => {
    if (!task.tgl_pengambilan) return false
    
    const taskDate = new Date(task.tgl_pengambilan)
    // tampilkan kalau tgl_pengambilan <= hari ini dan belum diambil
    return taskDate <= todayDate && task.tgl_terakhir_diambil === null
  })
})

async function handleSave(payload) {
  if (!selectedItem.value) return;
  
  const body = {
    status_angkut: payload.status_angkut,
    id_kendaraan: payload.id_kendaraan || null,
    volume_sampah: payload.volume_sampah || null
  };
  
  try {
    await api.put(`/api/daftar-tugas/${selectedItem.value.id}/status`, body)
    showModal.value = false
    await fetchPengambilan()
  } catch (err) {
    console.error('Gagal update status', err)
  }
}

function openUpdateModal(id) {
  selectedItem.value = id
  showModal.value = true
}

onMounted(async () => {
  fetchPengambilan()
  fetchDashboard()
  fetchKendaraan()
})
</script>


<style scoped src="@/assets/styles/petugas.css"></style>