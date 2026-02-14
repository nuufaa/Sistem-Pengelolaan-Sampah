<template>
    <div class="petugas-page">
    <!-- Header -->
    <header class="petugas-header">
        <button class="hamburger-menu" id="hamburgerMenu">
            <span class="material-icons">menu</span>
        </button>
        <div class="header-title">
            <span class="material-icons">local_shipping</span>
            <h1>Dashboard Petugas</h1>
        </div>
        <div class="header-actions">
            <span class="petugas-name" id="petugasName">Petugas Desa</span>
            <button class="btn-logout" id="btnLogout">
                <span class="material-icons">logout</span>
                <span>Keluar</span>
            </button>
        </div>
    </header>

    <!-- Container -->
    <div class="petugas-container">
        <!-- Sidebar -->
        <aside class="petugas-sidebar" id="petugasSidebar">
            <div class="sidebar-overlay" id="sidebarOverlay"></div>
            <div class="sidebar-content">
                <div class="sidebar-header">
                    <span class="material-icons">badge</span>
                    <div>
                        <h2 id="sidebarPetugasName">Ahmad Fauzi</h2>
                        <p id="sidebarPetugasDesa">Desa Sembalun Bumbung</p>
                    </div>
                </div>
                
                <!-- <nav class="sidebar-nav">
                    <a href="#" class="nav-item active" data-section="dashboard">
                        <span class="material-icons">dashboard</span>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" class="nav-item" data-section="pengambilan">
                        <span class="material-icons">list_alt</span>
                        <span>Daftar Pengambilan</span>
                    </a>
                    <a href="#" class="nav-item" data-section="peta">
                        <span class="material-icons">map</span>
                        <span>Peta TPS</span>
                    </a>
                    <a href="#" class="nav-item" data-section="kepatuhan">
                        <span class="material-icons">schedule</span>
                        <span>Kepatuhan Jadwal</span>
                    </a>
                    <a href="#" class="nav-item" data-section="logbook">
                        <span class="material-icons">description</span>
                        <span>Logbook Kendaraan</span>
                    </a>
                </nav> -->

<router-link to="/petugas" class="nav-item" active-class="active">
  <span class="material-icons">dashboard</span>
  <span>Dashboard</span>
</router-link>

<router-link to="/petugas/pengambilan" class="nav-item" active-class="active">
  <span class="material-icons">list_alt</span>
  <span>Daftar Pengambilan</span>
</router-link>

<!-- <router-link to="/petugas/peta" class="nav-item" active-class="active">
  <span class="material-icons">map</span>
  <span>Peta TPS</span>
</router-link> -->

<router-link to="/petugas/kepatuhan" class="nav-item" active-class="active">
  <span class="material-icons">schedule</span>
  <span>Kepatuhan Jadwal</span>
</router-link>

<router-link to="/petugas/logbook" class="nav-item" active-class="active">
  <span class="material-icons">description</span>
  <span>Logbook Kendaraan</span>
</router-link>

            </div>
        </aside>

        <!-- Main Content -->
        <main class="petugas-main">
            <router-view />
            <!-- Dashboard Section -->
            <section class="content-section active" id="section-dashboard">
                <div class="section-header">
                    <h2>Dashboard Petugas</h2>
                    <div class="header-date" id="headerDate"></div>
                </div>
                
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #E3F2FD;">
                            <span class="material-icons" style="color: #2196F3;">assignment</span>
                        </div>
                        <div class="stat-info">
                            <h3 id="statTotal">0</h3>
                            <p>Total Tugas</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #FFF3E0;">
                            <span class="material-icons" style="color: #FF9800;">pending</span>
                        </div>
                        <div class="stat-info">
                            <h3 id="statPending">0</h3>
                            <p>Belum Mulai</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #E8F5E9;">
                            <span class="material-icons" style="color: #4CAF50;">check_circle</span>
                        </div>
                        <div class="stat-info">
                            <h3 id="statDone">0</h3>
                            <p>Selesai</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #FFF9C4;">
                            <span class="material-icons" style="color: #FBC02D;">autorenew</span>
                        </div>
                        <div class="stat-info">
                            <h3 id="statProgress">0</h3>
                            <p>Sedang Berlangsung</p>
                        </div>
                    </div>
                </div>

                <div class="today-tasks">
                    <h3>Tugas Hari Ini</h3>
                    <div class="task-list" id="todayTaskList">
                        <!-- Dynamic content -->
                    </div>
                </div>
            </section>

            <!-- Pengambilan Section -->
            <section class="content-section" id="section-pengambilan">
                <div class="section-header">
                    <h2>Daftar Pengambilan Sampah</h2>
                    <div class="filter-group">
                        <select id="filterStatus" class="filter-select">
                            <option value="">Semua Status</option>
                            <option value="pending">Belum Mulai</option>
                            <option value="progress">Sedang Berlangsung</option>
                            <option value="done">Selesai</option>
                        </select>
                    </div>
                </div>
                
                <!-- Desktop Table -->
                <div class="table-container desktop-only">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama TPS</th>
                                <th>Desa</th>
                                <th>Jadwal</th>
                                <th>Terakhir Diambil</th>
                                <th>Kendaraan</th>
                                <th>Volume</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="pengambilanTableBody"></tbody>
                    </table>
                </div>

                <!-- Mobile Cards -->
                <div class="card-list mobile-only" id="pengambilanCardList"></div>
            </section>

            <!-- Peta Section
            <section class="content-section" id="section-peta">
                <div class="section-header">
                    <h2>Peta Titik Pengambilan Sampah</h2>
                </div>
                
                <div class="map-container">
                    <div id="mapPetugas" style="height: 600px; border-radius: 12px;"></div>
                </div>

                <div class="map-legend">
                    <h4>Keterangan:</h4>
                    <div class="legend-items">
                        <div class="legend-item">
                            <span class="legend-marker" style="background: #FF9800;"></span>
                            <span>Belum Mulai</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-marker" style="background: #2196F3;"></span>
                            <span>Sedang Berlangsung</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-marker" style="background: #4CAF50;"></span>
                            <span>Selesai</span>
                        </div>
                    </div>
                </div>
            </section> -->

            <!-- Kepatuhan Jadwal Section -->
            <section class="content-section" id="section-kepatuhan">
                <div class="section-header">
                    <h2>Kepatuhan Jadwal Pengambilan</h2>
                </div>
                
                <div class="kepatuhan-container">
                    <div class="kepatuhan-summary">
                        <div class="summary-item tepat">
                            <span class="material-icons">check_circle</span>
                            <div>
                                <h3 id="kepatuhanTepat">0</h3>
                                <p>Tepat Waktu</p>
                            </div>
                        </div>
                        <div class="summary-item terlambat">
                            <span class="material-icons">warning</span>
                            <div>
                                <h3 id="kepatuhanTerlambat">0</h3>
                                <p>Terlambat</p>
                            </div>
                        </div>
                    </div>

                    <div class="kepatuhan-list" id="kepatuhanList">
                        <!-- Dynamic content -->
                    </div>
                </div>
            </section>

            <!-- Logbook Kendaraan Section -->
            <section class="content-section" id="section-logbook">
                <div class="section-header">
                    <h2>Ringkasan Logbook Kendaraan</h2>
                    <div class="header-date" id="logbookDate"></div>
                </div>

                <!-- Form Tambah Logbook Baru -->
                <div class="logbook-form-card">
                    <div class="form-card-header">
                        <span class="material-icons">add_circle</span>
                        <h3>Tambah Logbook Baru</h3>
                    </div>
                    <form id="formTambahLogbook" class="logbook-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Pilih Kendaraan</label>
                                <select id="logbookKendaraan" class="form-control" required>
                                    <option value="">-- Pilih Kendaraan --</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Tanggal Pengambilan</label>
                                <input type="date" id="logbookTanggal" class="form-control" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Waktu Mulai</label>
                                <input type="time" id="logbookWaktuMulai" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Waktu Selesai</label>
                                <input type="time" id="logbookWaktuSelesai" class="form-control" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Km Awal</label>
                                <input type="number" id="logbookKmAwal" class="form-control" placeholder="Masukkan km awal" required>
                            </div>
                            <div class="form-group">
                                <label>Km Akhir</label>
                                <input type="number" id="logbookKmAkhir" class="form-control" placeholder="Masukkan km akhir" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>TPS yang Dikunjungi (Pilih satu atau lebih)</label>
                            <div class="checkbox-group" id="logbookTpsCheckbox">
                                <!-- Dynamic checkboxes -->
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Catatan (Opsional)</label>
                            <textarea id="logbookCatatan" class="form-control" rows="3" placeholder="Tambahkan catatan jika diperlukan"></textarea>
                        </div>

                        <div class="form-footer">
                            <button type="button" class="btn-secondary" id="btnResetLogbook">
                                <span class="material-icons">refresh</span>
                                <span>Reset</span>
                            </button>
                            <button type="submit" class="btn-primary">
                                <span class="material-icons">save</span>
                                <span>Simpan Logbook</span>
                            </button>
                        </div>
                    </form>
                </div>
                
                <div class="logbook-container">
                    <div class="logbook-card">
                        <div class="logbook-header">
                            <span class="material-icons">local_shipping</span>
                            <h3>Kendaraan Hari Ini</h3>
                        </div>
                        <div class="logbook-body" id="logbookToday">
                            <!-- Dynamic content -->
                        </div>
                    </div>

                    <div class="logbook-history">
                        <h3>Riwayat Logbook</h3>
                        <div class="logbook-list" id="logbookHistory">
                            <!-- Dynamic content -->
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- Modal Update Status -->
    <div class="modal" id="modalUpdateStatus">
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Update Status Pengambilan</h2>
                <button class="modal-close" onclick="closeModal('modalUpdateStatus')">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="updateTpsId">
                
                <div class="tps-info" id="tpsInfo">
                    <!-- Dynamic content -->
                </div>

                <div class="form-group">
                    <label>Pilih Kendaraan</label>
                    <select id="selectKendaraan" class="form-control">
                        <option value="">-- Pilih Kendaraan --</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Volume Sampah</label>
                    <div class="volume-input-group">
                        <div class="volume-unit-selector">
                            <label class="radio-option">
                                <input type="radio" name="volumeUnit" value="kg" checked>
                                <span>Kilogram (kg)</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="volumeUnit" value="persen">
                                <span>Persentase (%)</span>
                            </label>
                        </div>
                        <div class="volume-input-row">
                            <input type="number" id="volumeValue" class="form-control" placeholder="Masukkan angka" min="0">
                            <span class="volume-unit-label" id="volumeUnitLabel">kg</span>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Status Pengambilan</label>
                    <div class="status-buttons">
                        <button class="status-btn" data-status="pending">
                            <span class="material-icons">pending</span>
                            <span>Belum Mulai</span>
                        </button>
                        <button class="status-btn" data-status="progress">
                            <span class="material-icons">autorenew</span>
                            <span>Sedang Berlangsung</span>
                        </button>
                        <button class="status-btn" data-status="done">
                            <span class="material-icons">check_circle</span>
                            <span>Selesai</span>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Catatan (Opsional)</label>
                    <textarea id="updateNotes" rows="3" placeholder="Tambahkan catatan jika diperlukan"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('modalUpdateStatus')">Batal</button>
                <button type="button" class="btn-primary" id="btnConfirmUpdate">
                    <span class="material-icons">save</span>
                    <span>Simpan Status</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
        <span class="material-icons toast-icon">check_circle</span>
        <span class="toast-message" id="toastMessage"></span>
    </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* =========================
   STATE DASAR
========================= */

// sidebar & section
const sidebarOpen = ref(false)
const activeSection = ref('dashboard')

// modal
const showUpdateModal = ref(false)
const selectedPengambilan = ref(null)

// filter
const filterStatus = ref('')

// map
let map = null

/* =========================
   DATA DUMMY (NANTI API)
========================= */

const currentPetugas = ref({
  id: 1,
  nama: 'Ahmad Fauzi',
  desa: 'A'
})

const tpsData = ref([
  { id: 1, nama: 'TPS A1 - Pasar Utara', desa: 'A', lat: -8.5833, lng: 116.1167 },
  { id: 2, nama: 'TPS A2 - Masjid Besar', desa: 'A', lat: -8.5845, lng: 116.118 },
  { id: 3, nama: 'TPS A3 - Sekolah Dasar', desa: 'A', lat: -8.586, lng: 116.115 }
])

const pengambilanData = ref([
  { id: 1, tpsId: 1, interval: 3, lastPickup: '2026-01-13', status: 'pending', kendaraan: '', volume: 0 },
  { id: 2, tpsId: 2, interval: 2, lastPickup: '2026-01-15', status: 'progress', kendaraan: '', volume: 0 },
  { id: 3, tpsId: 3, interval: 4, lastPickup: '2026-01-12', status: 'done', kendaraan: 'Truck 01', volume: 92 }
])

/* =========================
   COMPUTED
========================= */

const filteredPengambilan = computed(() => {
  let data = pengambilanData.value.filter(p => {
    const tps = tpsData.value.find(t => t.id === p.tpsId)
    return tps && tps.desa === currentPetugas.value.desa
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

/* =========================
   NAVIGATION
========================= */

function switchSection(section) {
  activeSection.value = section
  sidebarOpen.value = false

//   if (section === 'peta') {
//     nextTick(() => {
//       if (!map) initMap()
//     })
//   }
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

/* =========================
   MODAL UPDATE STATUS
========================= */

function openUpdateModal(item) {
  selectedPengambilan.value = { ...item }
  showUpdateModal.value = true
}

function closeUpdateModal() {
  showUpdateModal.value = false
}

function saveUpdateStatus() {
  const idx = pengambilanData.value.findIndex(p => p.id === selectedPengambilan.value.id)
  if (idx !== -1) {
    pengambilanData.value[idx] = selectedPengambilan.value
  }
  closeUpdateModal()
  updateMapMarkers()
}

/* =========================
   MAP
========================= */

function initMap() {
  map = L.map('mapPetugas').setView([-8.585, 116.1165], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  updateMapMarkers()
}

function updateMapMarkers() {
  if (!map) return

  map.eachLayer(layer => {
    if (layer instanceof L.Marker) map.removeLayer(layer)
  })

  filteredPengambilan.value.forEach(p => {
    const tps = tpsData.value.find(t => t.id === p.tpsId)
    if (!tps) return

    const color =
      p.status === 'pending' ? '#FF9800' :
      p.status === 'progress' ? '#2196F3' :
      '#4CAF50'

    const icon = L.divIcon({
      className: '',
      html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white"></div>`,
      iconSize: [28, 28]
    })

    L.marker([tps.lat, tps.lng], { icon })
      .addTo(map)
      .bindPopup(`
        <b>${tps.nama}</b><br/>
        Status: ${p.status}<br/>
        <button id="btn-${p.id}">Update</button>
      `)
      .on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`btn-${p.id}`)
          if (btn) btn.onclick = () => openUpdateModal(p)
        })
      })
  })
}

/* =========================
   UTILITIES
========================= */

function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/* =========================
   LIFECYCLE
========================= */

onMounted(() => {
  // default section
  activeSection.value = 'dashboard'
})
</script>

<style scoped src="@/assets/styles/petugas.css"></style>