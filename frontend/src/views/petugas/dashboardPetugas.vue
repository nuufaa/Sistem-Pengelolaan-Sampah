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
          <p>Total Seluruh Tugas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#E3F2FD">
          <span class="material-icons" style="color:#2196F3">assignment</span>
        </div>
        <div class="stat-info">
          <h3>{{ progress }}</h3>
          <p>Total Tugas Minggu Ini</p>
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
    </div>

    <div class="today-tasks">
      <h3>Tugas Hari Ini</h3>
      <div v-if="todayTasks.length === 0" class="no-tasks" style="color:#757575; padding:20px; text-align:center;">
        Tidak ada tugas hari ini
      </div>
      <div v-else class="task-list">
        <div v-for="task in todayTasks" :key="task.id" class="task-item" :class="{ 'task-done': task.status_angkut === 'selesai' }">
          <div class="task-info">
            <div class="task-title-row">
              <h4>{{ task.nama_tps }}</h4>
              <span v-if="task.status_angkut === 'selesai'" class="status-badge selesai">Selesai</span>
              <span v-else class="status-badge belum">Belum Diangkut</span>
            </div>
            <p>
              Terakhir diambil: {{ task.tgl_terakhir_diambil ? new Date(task.tgl_terakhir_diambil).toLocaleDateString('id-ID') : 'Belum diambil' }}
              • Jadwal: {{ new Date(task.tgl_pengambilan).toLocaleDateString('id-ID') }}
            </p>
          </div>
            <button v-if="task.status_angkut !== 'selesai'" class="btn-update" @click="openUpdateModal(task)">
              <span class="material-icons">edit</span>
              <span>Update</span>
            </button>
            <div v-else class="done-icon">
              <span class="material-icons" style="color: #4CAF50">check_circle</span>
            </div>
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

  </section>
</template>

<script setup>
import { ref, computed, onMounted} from 'vue'
import api from '@/services/api'
import UpdatePengambilanModal from '@/components/updateStatusModal.vue'

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const total = ref(0)
const progress = ref(0)
const pending = ref(0)
const done = ref(0)
const volumeSampahHarian = ref([])

const tpsData = ref([])
const pengambilanData = ref([])
const kendaraanList = ref([])

const showModal = ref(false)
const selectedItem = ref(null)

async function fetchPengambilan() {
  try {
    // Generate tugas untuk memastikan tidak ada delay jika cron belum jalan
    await api.post('/api/daftar-tugas/generate');
    const res = await api.get('/api/daftar-tugas');
    pengambilanData.value = res.data;
    tpsData.value = res.data.tps || []
  } catch (error) {
    console.error("Gagal ambil daftar tugas:", error)
  }
}

async function fetchKendaraan() {
  const res = await api.get('/api/kendaraan')
  kendaraanList.value = res.data
}

async function fetchDashboard() {
  try {
    const res = await api.get('/api/dashboard/petugas')
    total.value = res.data.total
    progress.value = res.data.progress
    pending.value = res.data.pending
    done.value = res.data.done
    volumeSampahHarian.value = res.data.volumeSampahHarian

    // renderVolumeSampahChart(volumeSampahHarian)

  } catch (error) {
    console.error("Gagal ambil dashboard:", error)
  }
}

const todayTasks = computed(() => {
  // Dapatkan tanggal hari ini tanpa waktu (jam, menit, detik)
  const todayDate = new Date()
  const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
  
  return pengambilanData.value.filter(task => {
    if (!task.tgl_pengambilan) return false
    
    const taskDate = new Date(task.tgl_pengambilan)
    // Normalisasi taskDate ke tengah malam untuk perbandingan hari yang akurat
    const taskDateNormalized = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
    
    // Tampilkan semua tugas hari ini (baik yang sudah diambil maupun belum)
    return taskDateNormalized.getTime() === today.getTime()
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
  await fetchPengambilan()
  fetchDashboard()
  fetchKendaraan()
})
</script>


<style scoped src="@/assets/styles/petugas.css"></style>

<style scoped>
.task-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge.selesai {
  background: #E8F5E9;
  color: #4CAF50;
}

.status-badge.belum {
  background: #FFF3E0;
  color: #FF9800;
}

.task-item.task-done {
  opacity: 0.8;
  border-left: 4px solid #4CAF50;
}
</style>