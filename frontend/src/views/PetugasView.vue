<template>
  <!-- ================= HEADER ================= -->
  <header class="petugas-header">
    <button class="hamburger-menu" @click="toggleSidebar">
      <span class="material-icons">menu</span>
    </button>

    <div class="header-title">
      <span class="material-icons">local_shipping</span>
      <h1>Dashboard Petugas</h1>
    </div>

    <div class="header-actions">
      <span class="petugas-name">{{ currentPetugas.nama }}</span>
      <button class="btn-logout" @click="handleLogout">
        <span class="material-icons">logout</span>
        <span>Keluar</span>
      </button>
    </div>
  </header>

  <div class="petugas-container">
    <!-- ================= SIDEBAR ================= -->
    <aside class="petugas-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-overlay" @click="closeSidebar"></div>

      <div class="sidebar-content">
        <div class="sidebar-header">
          <span class="material-icons">badge</span>
          <div>
            <h2>{{ currentPetugas.nama }}</h2>
            <p>Desa {{ currentPetugas.desa }}</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a
            v-for="menu in menus"
            :key="menu.key"
            href="#"
            class="nav-item"
            :class="{ active: activeSection === menu.key }"
            @click.prevent="switchSection(menu.key)"
          >
            <span class="material-icons">{{ menu.icon }}</span>
            <span>{{ menu.label }}</span>
          </a>
        </nav>
      </div>
    </aside>

    <!-- ================= MAIN ================= -->
    <main class="petugas-main">
      <!-- ================= DASHBOARD ================= -->
      <section v-if="activeSection === 'dashboard'" class="content-section active">
        <div class="section-header">
          <h2>Dashboard Petugas</h2>
          <div class="header-date">{{ headerDate }}</div>
        </div>

        <div class="stats-cards">
          <div class="stat-card">
            <h3>{{ statTotal }}</h3>
            <p>Total Tugas</p>
          </div>
          <div class="stat-card">
            <h3>{{ statPending }}</h3>
            <p>Belum Mulai</p>
          </div>
          <div class="stat-card">
            <h3>{{ statProgress }}</h3>
            <p>Sedang Berlangsung</p>
          </div>
          <div class="stat-card">
            <h3>{{ statDone }}</h3>
            <p>Selesai</p>
          </div>
        </div>

        <div class="today-tasks">
          <h3>Tugas Hari Ini</h3>

          <div v-if="todayTasks.length === 0" class="empty">
            Tidak ada tugas hari ini
          </div>

          <div
            v-for="task in todayTasks"
            :key="task.id"
            class="task-item"
          >
            <div>
              <h4>{{ task.tps.nama }}</h4>
              <p>Desa {{ task.tps.desa }}</p>
            </div>
            <button class="btn-update" @click="openUpdateModal(task.id)">
              Update
            </button>
          </div>
        </div>
      </section>

      <!-- ================= PENGAMBILAN ================= -->
      <section v-if="activeSection === 'pengambilan'" class="content-section">
        <div class="section-header">
          <h2>Daftar Pengambilan</h2>

          <select v-model="filterStatus">
            <option value="">Semua</option>
            <option value="pending">Belum Mulai</option>
            <option value="progress">Berlangsung</option>
            <option value="done">Selesai</option>
          </select>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>TPS</th>
              <th>Desa</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredPengambilan" :key="p.id">
              <td>{{ getTps(p.tpsId).nama }}</td>
              <td>{{ getTps(p.tpsId).desa }}</td>
              <td>{{ statusText(p.status) }}</td>
              <td>
                <button @click="openUpdateModal(p.id)">Update</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- ================= PETA ================= -->
      <section v-if="activeSection === 'peta'" class="content-section">
        <h2>Peta TPS</h2>
        <div id="mapPetugas" style="height: 500px;"></div>
      </section>
    </main>
  </div>

  <!-- ================= MODAL UPDATE ================= -->
  <div v-if="showUpdateModal" class="modal show">
    <div class="modal-content">
      <h3>Update Status</h3>

      <select v-model="selectedStatus">
        <option value="pending">Belum Mulai</option>
        <option value="progress">Berlangsung</option>
        <option value="done">Selesai</option>
      </select>

      <button @click="confirmUpdate">Simpan</button>
      <button @click="closeUpdateModal">Batal</button>
    </div>
  </div>

  <!-- ================= TOAST ================= -->
  <div v-if="showToast" class="toast show">
    {{ toastMessage }}
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* ================= DATA ================= */
const currentPetugas = reactive({
  id: 1,
  nama: 'Ahmad Fauzi',
  desa: 'A'
})

const tpsData = ref([
  { id: 1, nama: 'TPS A1', desa: 'A', lat: -8.583, lng: 116.116 },
  { id: 2, nama: 'TPS A2', desa: 'A', lat: -8.584, lng: 116.118 }
])

const pengambilanData = ref([
  { id: 1, tpsId: 1, interval: 3, lastPickup: '2026-01-20', status: 'pending' },
  { id: 2, tpsId: 2, interval: 2, lastPickup: '2026-01-22', status: 'progress' }
])

/* ================= UI STATE ================= */
const activeSection = ref('dashboard')
const sidebarOpen = ref(false)
const filterStatus = ref('')
const showUpdateModal = ref(false)
const selectedPengambilanId = ref(null)
const selectedStatus = ref('')
const showToast = ref(false)
const toastMessage = ref('')

/* ================= MENU ================= */
const menus = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'pengambilan', label: 'Pengambilan', icon: 'list' },
  { key: 'peta', label: 'Peta TPS', icon: 'map' }
]

/* ================= COMPUTED ================= */
const filteredPengambilan = computed(() => {
  let data = pengambilanData.value.filter(p => {
    const tps = getTps(p.tpsId)
    return tps && tps.desa === currentPetugas.desa
  })
  if (filterStatus.value) {
    data = data.filter(p => p.status === filterStatus.value)
  }
  return data
})

const statTotal = computed(() => filteredPengambilan.value.length)
const statPending = computed(() => filteredPengambilan.value.filter(p => p.status === 'pending').length)
const statProgress = computed(() => filteredPengambilan.value.filter(p => p.status === 'progress').length)
const statDone = computed(() => filteredPengambilan.value.filter(p => p.status === 'done').length)

const todayTasks = computed(() => {
  const today = new Date()
  return filteredPengambilan.value.filter(p => {
    const last = new Date(p.lastPickup)
    const diff = (today - last) / 86400000
    return diff >= p.interval && p.status !== 'done'
  }).map(p => ({
    ...p,
    tps: getTps(p.tpsId)
  }))
})

const headerDate = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

/* ================= METHODS ================= */
function getTps(id) {
  return tpsData.value.find(t => t.id === id) || {}
}

function statusText(s) {
  return { pending: 'Belum Mulai', progress: 'Berlangsung', done: 'Selesai' }[s]
}

function switchSection(sec) {
  activeSection.value = sec
  if (sec === 'peta') setTimeout(initMap, 100)
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
function closeSidebar() {
  sidebarOpen.value = false
}

function openUpdateModal(id) {
  selectedPengambilanId.value = id
  selectedStatus.value = pengambilanData.value.find(p => p.id === id).status
  showUpdateModal.value = true
}

function closeUpdateModal() {
  showUpdateModal.value = false
}

function confirmUpdate() {
  const p = pengambilanData.value.find(p => p.id === selectedPengambilanId.value)
  if (p) p.status = selectedStatus.value
  showToastMessage('Status berhasil diperbarui')
  closeUpdateModal()
}

function showToastMessage(msg) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

function handleLogout() {
  alert('Logout')
}

/* ================= MAP ================= */
let map
function initMap() {
  if (map) return
  map = L.map('mapPetugas').setView([-8.584, 116.117], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  tpsData.value.forEach(tps => {
    L.marker([tps.lat, tps.lng]).addTo(map).bindPopup(tps.nama)
  })
}

onMounted(() => {
  console.log('Petugas.vue mounted')
})
</script>

<style src="@/assets/styles/petugas.css"></style>