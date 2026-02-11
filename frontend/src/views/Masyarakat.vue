<template>
    <!-- Header -->

    <div class="map-container">
    <div id="map"></div>
  </div>

    <header class="header">
        <div class="header-left">
            <div class="logo-container">
                <span class="material-icons logo-icon">domain</span>
                <div class="logo-text">
                    <h1>Desa Utara & Selatan</h1>
                    <p>Sistem Pengelolaan Sampah</p>
                </div>
            </div>
        </div>
        <div class="header-right">
            <button class="btn-login-header" id="btnOpenLogin">
                <span class="material-icons">login</span>
                <span>Masuk</span>
            </button>
            <button class="btn-report" id="btnReport">
                <span class="material-icons">report_problem</span>
                <span>Lapor Sampah Penuh</span>
            </button>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <button class="sidebar-toggle" id="sidebarToggle">
                <span class="material-icons">chevron_left</span>
            </button>

            <div class="sidebar-content">
                <!-- Schedule Card -->
                <div class="card schedule-card">
                    <div class="card-header">
                        <span class="material-icons">event</span>
                        <h2>Jadwal Pengambilan Sampah</h2>
                    </div>
                    <div class="card-body">
                        <div class="schedule-info">
                            <div class="info-item">
                                <span class="material-icons">today</span>
                                <span id="currentDate">Senin, 16 Januari 2026</span>
                            </div>
                        </div>

                        <div class="schedule-list" id="scheduleList">
                            <!-- Dynamic schedule items -->
                        </div>
                    </div>
                </div>

                <!-- Filter Card -->
                <div class="card filter-card">
                    <div class="card-header">
                        <span class="material-icons">filter_list</span>
                        <h2>Filter Tampilan</h2>
                    </div>
                    <div class="card-body">
                        <div class="filter-group">
                            <label class="filter-label">Pilih Desa:</label>
                            <div class="radio-group">
                                <label class="radio-label">
                                    <input type="radio" name="village" value="utara" checked>
                                    <span>Desa Utara</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="village" value="selatan">
                                    <span>Desa Selatan</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="village" value="all">
                                    <span>Semua Desa</span>
                                </label>
                            </div>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">Status Titik Sampah:</label>
                            <label class="checkbox-label status-normal">
                                <input type="checkbox" value="normal" checked>
                                <span class="status-icon">●</span>
                                <span>Normal <span class="count" id="countNormal">(25)</span></span>
                            </label>
                            <label class="checkbox-label status-warning">
                                <input type="checkbox" value="warning" checked>
                                <span class="status-icon">●</span>
                                <span>Hampir Penuh <span class="count" id="countWarning">(8)</span></span>
                            </label>
                            <label class="checkbox-label status-danger">
                                <input type="checkbox" value="danger" checked>
                                <span class="status-icon">●</span>
                                <span>Penuh <span class="count" id="countDanger">(3)</span></span>
                            </label>
                        </div>

                        <div class="legend">
                            <h3>Legenda Peta:</h3>
                            <div class="legend-item">
                                <span class="legend-dot normal"></span>
                                <span>Normal - Aman</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot warning"></span>
                                <span>Hampir Penuh - Perhatian</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot danger"></span>
                                <span>Penuh - Perlu Segera</span>
                            </div>
                            <div class="legend-item">
                                <span class="material-icons legend-icon">person_pin_circle</span>
                                <span>Lokasi Anda</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistics Card -->
                <div class="card stats-card">
                    <div class="card-header">
                        <span class="material-icons">bar_chart</span>
                        <h2>Statistik Hari Ini</h2>
                    </div>
                    <div class="card-body">
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number" id="statTotal">36</div>
                                <div class="stat-label">Total Titik</div>
                            </div>
                            <div class="stat-item warning">
                                <div class="stat-number" id="statWarning">8</div>
                                <div class="stat-label">Perlu Perhatian</div>
                            </div>
                            <div class="stat-item danger">
                                <div class="stat-number" id="statDanger">3</div>
                                <div class="stat-label">Penuh</div>
                            </div>
                        </div>
                        <div class="last-update">
                            Terakhir Diperbarui: <span id="lastUpdate">13:45</span>
                        </div>
                    </div>
                </div>

                <!-- Volume Sampah Card -->
                <div class="card">
                    <div class="card-header">
                        <span class="material-icons">assessment</span>
                        <h2>Volume Sampah TPS</h2>
                    </div>
                    <div class="card-body">
                        <div id="volumeSampahSidebar"></div>
                    </div>
                </div>

                <!-- Tren Bulanan Card -->
                <div class="card">
                    <div class="card-header">
                        <span class="material-icons">trending_up</span>
                        <h2>Tren Sampah Bulanan</h2>
                    </div>
                    <div class="card-body">
                        <div id="trenBulananSidebar"></div>
                    </div>
                </div>

                <!-- Status TPS Card -->
                <div class="card">
                    <div class="card-header">
                        <span class="material-icons">info</span>
                        <h2>Status TPS</h2>
                    </div>
                    <div class="card-body">
                        <div id="statusTPSSidebar"></div>
                    </div>
                </div>

                <!-- Ranking TPS Card -->
                <div class="card">
                    <div class="card-header">
                        <span class="material-icons">emoji_events</span>
                        <h2>Ranking TPS</h2>
                    </div>
                    <div class="card-body">
                        <div id="rankingTPSSidebar"></div>
                    </div>
                </div>

                <!-- Timbulan Per Kapita Card -->
                <div class="card">
                    <div class="card-header">
                        <span class="material-icons">people</span>
                        <h2>Timbulan Per Kapita</h2>
                    </div>
                    <div class="card-body">
                        <div id="timbulanSidebar"></div>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Map Container -->
        <div class="map-container">
            <div id="map"></div>
            <div class="map-controls">
                <button class="map-btn" id="btnMyLocation" title="Lokasi Saya">
                    <span class="material-icons">my_location</span>
                </button>
            </div>
            
            <!-- Mobile Bottom Sheet Toggle Button -->
            <button class="bottom-sheet-trigger" id="bottomSheetTrigger">
                <span class="material-icons">expand_less</span>
                <span class="trigger-text">Jadwal Pengambilan</span>
            </button>
        </div>
    </main>

    <!-- Mobile Bottom Sheet (Clone of Sidebar for Mobile) -->
    <div class="bottom-sheet" id="bottomSheet">
        <div class="bottom-sheet-header">
            <div class="bottom-sheet-handle"></div>
            <h3>Jadwal Pengambilan Sampah</h3>
            <button class="bottom-sheet-close" id="bottomSheetClose">
                <span class="material-icons">expand_more</span>
            </button>
        </div>
        <div class="bottom-sheet-content" id="bottomSheetContent">
            <!-- Dynamic content - same as sidebar -->
        </div>
    </div>

    <!-- Modal Report -->
    <div class="modal" id="modalReport">
        <div class="modal-overlay" id="modalOverlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>
                    <span class="material-icons">edit_note</span>
                    Laporan Kondisi Sampah
                </h2>
                <button class="modal-close" id="modalClose">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <form class="modal-body" id="reportForm">
                <div class="form-group">
                    <label for="locationSelect">Lokasi Titik Sampah <span class="required">*</span></label>
                    <select id="locationSelect" required>
                        <option value="">Pilih lokasi...</option>
                        <option value="1">TPS Pasar Desa Utara</option>
                        <option value="2">TPS Masjid Besar</option>
                        <option value="3">TPS Sekolah Dasar</option>
                        <option value="4">TPS Terminal Desa</option>
                        <option value="5">TPS Puskesmas</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Kondisi <span class="required">*</span></label>
                    <div class="radio-group-vertical">
                        <label class="radio-label">
                            <input type="radio" name="condition" value="hampir_penuh" required>
                            <span>Hampir Penuh</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="condition" value="penuh">
                            <span>Sudah Penuh</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="condition" value="berserakan">
                            <span>Sampah Berserakan</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label for="photoUpload">Foto (Opsional)</label>
                    <div class="file-upload">
                        <input type="file" id="photoUpload" accept="image/*">
                        <label for="photoUpload" class="file-upload-label">
                            <span class="material-icons">photo_camera</span>
                            <span id="fileLabel">Pilih foto</span>
                        </label>
                    </div>
                    <div id="imagePreview" class="image-preview"></div>
                </div>

                <div class="form-group">
                    <label for="description">Keterangan Tambahan:</label>
                    <textarea id="description" rows="4" placeholder="Jelaskan kondisi sampah..."></textarea>
                </div>

                <div class="form-group">
                    <label for="reporterName">Nama Pelapor (Opsional):</label>
                    <input type="text" id="reporterName" placeholder="Nama Anda">
                </div>

                <div class="form-group">
                    <label for="reporterPhone">No. HP (Opsional):</label>
                    <input type="tel" id="reporterPhone" placeholder="08xx xxxx xxxx">
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="btnCancel">Batal</button>
                    <button type="submit" class="btn-primary">
                        <span class="material-icons">send</span>
                        Kirim Laporan
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal TPS Schedule -->
    <div class="modal" id="modalSchedule">
        <div class="modal-overlay" id="modalScheduleOverlay"></div>
        <div class="modal-content modal-schedule">
            <div class="modal-header">
                <h2>
                    <span class="material-icons">calendar_month</span>
                    <span id="scheduleModalTitle">Jadwal Lengkap TPS Desa A</span>
                </h2>
                <button class="modal-close" id="modalScheduleClose">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="modal-body" id="tpsScheduleContent">
                <!-- Dynamic TPS schedule list -->
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
        <span class="material-icons toast-icon">check_circle</span>
        <span class="toast-message" id="toastMessage">Laporan berhasil dikirim!</span>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="loader"></div>
        <p>Memuat data...</p>
    </div>

    <!-- Modal Login Popup -->
    <div class="modal-login-overlay" id="modalLoginOverlay"></div>
    <div class="modal-login" id="modalLogin">
        <div class="modal-login-header">
            <div class="modal-login-logo">
                <span class="material-icons">domain</span>
            </div>
            <div>
                <h2>Masuk ke Sistem</h2>
                <p>Sistem Pengelolaan Sampah Desa</p>
            </div>
            <button class="modal-login-close" id="btnCloseLogin">
                <span class="material-icons">close</span>
            </button>
        </div>

        <div class="modal-login-roles">
            <button class="login-role-tab active" data-role="petugas">
                <span class="material-icons">badge</span>
                <span>Petugas</span>
            </button>
            <button class="login-role-tab" data-role="admin">
                <span class="material-icons">admin_panel_settings</span>
                <span>Admin</span>
            </button>
        </div>

        <div class="modal-login-body">
            <p class="login-role-desc" id="loginRoleDesc">Kelola jadwal &amp; status pengambilan sampah</p>

            <form id="popupLoginForm" autocomplete="off">
                <div class="login-field">
                    <label for="popupUsername">
                        <span class="material-icons">person</span>
                        Username
                    </label>
                    <input type="text" id="popupUsername" placeholder="Masukkan username..." />
                    <span class="login-error" id="popupUsernameError"></span>
                </div>

                <div class="login-field">
                    <label for="popupPassword">
                        <span class="material-icons">lock</span>
                        Password
                    </label>
                    <div class="login-pw-wrap">
                        <input type="password" id="popupPassword" placeholder="Masukkan password..." />
                        <button type="button" id="popupTogglePw">
                            <span class="material-icons" id="popupToggleIcon">visibility</span>
                        </button>
                    </div>
                    <span class="login-error" id="popupPasswordError"></span>
                </div>

                <div class="login-hint">
                    <span class="material-icons">tips_and_updates</span>
                    <span id="loginHintText">Demo: <code>petugas</code> / <code>1234</code></span>
                </div>

                <button type="submit" class="login-submit-btn" id="loginSubmitBtn">
                    <span id="loginSubmitText">
                        <span class="material-icons">login</span>
                        Masuk
                    </span>
                    <span id="loginSubmitLoading" style="display:none;">
                        <span class="login-spinner"></span>
                        Memverifikasi...
                    </span>
                </button>
            </form>

            <div class="login-divider"><span>atau</span></div>

            <p class="login-public-note">
                Anda sudah berada di halaman publik.
                <br>Masyarakat tidak perlu login untuk melihat informasi.
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import L from 'leaflet'
// import 'leaflet/dist/leaflet.css'

// import 'leaflet.markercluster'
// import 'leaflet.markercluster/dist/MarkerCluster.css'
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import 'leaflet/dist/leaflet.css'

import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { wastePoints } from '@/services/waste.service'

// Simulasi role user (ubah ke true untuk mode petugas)
let isOfficer = ref(false); // false = masyarakat, true = petugas

// Mobile detection
let isMobile = ref(window.innerWidth <= 768);

// // Bottom sheet state
// let isBottomSheetOpen = false;

// // TPS detail sheet for mobile
// let currentTpsDetail = null;

const map = ref(null)
const markerCluster = ref(null)

const selectedVillage = ref('all')
const selectedStatus = ref(['normal', 'warning', 'danger'])

// ===== Initialize Map =====
// let map;
// let markers = [];
// let markerCluster;
// let userMarker;


//   let map
//   let markerCluster

onMounted(() => {
  initMap()
})

function initMap() {
  map.value = L.map('map').setView([-8.5833, 116.1167], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map.value)

  markerCluster.value = L.markerClusterGroup()
  updateMarkers()
  map.value.addLayer(markerCluster.value)
}

function updateMarkers() {
  markerCluster.value.clearLayers()

  const filtered = wastePoints.filter(p =>
    (selectedVillage.value === 'all' || p.village === selectedVillage.value) &&
    selectedStatus.value.includes(p.status)
  )

  filtered.forEach(point => {
    const marker = L.marker([point.lat, point.lng])
    markerCluster.value.addLayer(marker)
  })
}

</script>

<style src="@/assets/styles/masyarakat.css"></style>
