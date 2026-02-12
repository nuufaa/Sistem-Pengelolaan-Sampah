<template>
    <!-- Header

    <div class="map-container">
    <div id="map"></div>
  </div> -->

    <header class="header">
        <div class="header-left">
            <div class="logo-container">
                <span class="material-icons logo-icon">domain</span>
                <div class="logo-text">
                    <h1>Sistem Pengelolaan Sampah</h1>
                    <p>Desa Sembalun Bumbung</p>
                </div>
            </div>
        </div>
        <div class="header-right">
            <button class="btn-login-header" @click="loginRef.open()">
                <span class="material-icons">login</span>
                <span>Masuk</span>
            </button>

            <LoginModal ref="loginRef" />

            <button class="btn-report" @click="openReport()">
                <span class="material-icons">report_problem</span>
                <span>Lapor Sampah Penuh</span>
            </button>

            <ReportModal ref="reportRef" />
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
                <!-- Schedule Card - Desa List -->
                <div class="card schedule-card">
                    <div class="card-header">
                        <span class="material-icons">event</span>
                        <h2>Jadwal Pengambilan Sampah</h2>
                    </div>
                    <div class="card-body">
                        <!-- Current Date Info -->
                        <div class="schedule-info">
                            <div class="info-item">
                                <span class="material-icons">event</span>
                                <span>{{ currentDate }}</span>
                            </div>
                        </div>

                        <!-- Desa Cards -->
                        <div v-for="desa in desaList" :key="desa.desaCode" class="desa-card">
                            <div class="desa-header">
                                <span class="material-icons">{{ desa.icon }}</span>
                                <h3>{{ desa.desa }}</h3>
                            </div>
                            <div class="desa-tps-info">
                                <span class="material-icons">delete</span>
                                <span class="tps-count">{{ getTpsCountByDesa(desa.desaCode) }} TPS Terdaftar</span>
                            </div>
                            <button class="btn-lihat-jadwal" @click="openScheduleModal(desa)">
                                <span class="material-icons">event_note</span>
                                <span>Lihat Jadwal Lengkap TPS {{ desa.desa }}</span>
                            </button>
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
                        <!-- <div class="filter-group">
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
                        </div> -->

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
                            <!-- <div class="legend-item">
                                <span class="material-icons legend-icon">person_pin_circle</span>
                                <span>Lokasi Anda</span>
                            </div> -->
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

    <!-- Report modal provided by ReportModal component -->

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
// import LoginModal from '@/components/LoginModal.vue'

import { ref, onMounted, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { wastePoints, scheduleData, tpsData } from '@/services/WasteService.js'
import LoginModal from '@/components/LoginModal.vue'
import ReportModal from '@/components/ReportModal.vue'


// Simulasi role user (ubah ke true untuk mode petugas)
// let isOfficer = ref(false); // false = masyarakat, true = petugas

// Mobile detection
let isMobile = ref(window.innerWidth <= 768);

// Date and Schedule
const currentDate = ref('')
const todaySchedules = ref([])
const desaList = ref(scheduleData)
const selectedDesa = ref(null)
const isModalScheduleOpen = ref(false)

// // Bottom sheet state
// let isBottomSheetOpen = false;

// // TPS detail sheet for mobile
// let currentTpsDetail = null;

const map = ref(null)
const markerCluster = ref(null)
let markers = ref([]);

const selectedVillage = ref('all')
const selectedStatus = ref(['normal', 'warning', 'danger'])

const loginRef = ref(null)

const reportRef = ref(null)

function openReport() {
    console.log('openReport called, reportRef=', reportRef.value)
    if (reportRef.value && typeof reportRef.value.open === 'function') {
        reportRef.value.open()
        return
    }

    console.warn('reportRef not ready or open() missing')
    // Fallback: try legacy static modal if present
    const staticModal = document.getElementById('modalReport')
    if (staticModal) {
        staticModal.style.display = 'flex'
        return
    }

    alert('Modal laporan tidak tersedia (reportRef null). Periksa console untuk detail.')
}

// ===== Date and Schedule Functions =====
function formatDate(date = new Date()) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    const dayName = days[date.getDay()]
    const dayNum = date.getDate()
    const monthName = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${dayName}, ${dayNum} ${monthName} ${year}`
}

function getCurrentDayName(date = new Date()) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return days[date.getDay()]
}

function getTodaySchedules() {
    const today = new Date()
    const todayName = getCurrentDayName(today)
    
    const schedules = wastePoints
        .filter(point => {
            // Cek apakah jadwal mengandung hari ini
            return point.schedule.includes(todayName)
        })
        .map(point => {
            // Ekstrak waktu dari schedule (format: "Hari1 & Hari2, HH.MM WIB")
            const timeMatch = point.schedule.match(/(\d{2}\.\d{2})/)
            const time = timeMatch ? timeMatch[1] : '-'
            
            return {
                id: point.id,
                name: point.name,
                time: time + ' WIB',
                address: point.address
            }
        })
    
    // Sort by time
    schedules.sort((a, b) => {
        const timeA = a.time.replace('.', ':').replace(' WIB', '')
        const timeB = b.time.replace('.', ':').replace(' WIB', '')
        return timeA.localeCompare(timeB)
    })
    
    return schedules
}

// ===== Desa and TPS Functions =====
function getTpsCountByDesa(desaCode) {
    return tpsData.filter(tps => tps.desa === desaCode).length
}

function getTpsListByDesa(desaCode) {
    return tpsData.filter(tps => tps.desa === desaCode)
}

function getStatusLabel(status) {
    const statusMap = {
        'pending': 'Belum Dimulai',
        'active': 'Sedang Berlangsung',
        'completed': 'Selesai'
    }
    return statusMap[status] || status
}

function getStatusClass(status) {
    const classMap = {
        'pending': 'status-pending',
        'active': 'status-active',
        'completed': 'status-completed'
    }
    return classMap[status] || ''
}

function openScheduleModal(desa) {
    selectedDesa.value = desa
    isModalScheduleOpen.value = true
    
    // Render modal content
    const tpsList = getTpsListByDesa(desa.desaCode)
    const modalContent = document.getElementById('tpsScheduleContent')
    
    let html = ''
    tpsList.forEach(tps => {
        const statusLabel = getStatusLabel(tps.status)
        const statusClass = getStatusClass(tps.status)
        
        html += `
            <div class="tps-schedule-item ${statusClass}">
                <div class="tps-item-header">
                    <span class="material-icons">delete</span>
                    <span class="tps-item-name">${tps.name}</span>
                </div>
                <div class="tps-item-body">
                    <div class="tps-item-info">
                        <span class="material-icons">schedule</span>
                        <span>Pengambilan setiap ${tps.interval} hari</span>
                    </div>
                    <div class="tps-item-status">
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                    </div>
                </div>
            </div>
        `
    })
    
    html += `
        <div class="schedule-footer-info">
            <span class="material-icons">info</span>
            <span>Status pengambilan hanya dapat diubah oleh petugas.</span>
        </div>
    `
    
    modalContent.innerHTML = html
    
    // Update modal title
    document.getElementById('scheduleModalTitle').textContent = `Jadwal Lengkap TPS ${desa.desa}`
    
    // Show modal with centered display
    const modalSchedule = document.getElementById('modalSchedule')
    modalSchedule.style.display = 'flex'
}

function closeScheduleModal() {
    isModalScheduleOpen.value = false
    document.getElementById('modalSchedule').style.display = 'none'
}


function initializeDateTime() {
    currentDate.value = formatDate()
    todaySchedules.value = getTodaySchedules()
}

onMounted(() => {
    initializeDateTime()
    
    // Modal schedule event listeners
    const modalSchedule = document.getElementById('modalSchedule')
    const modalScheduleClose = document.getElementById('modalScheduleClose')
    const modalScheduleOverlay = document.getElementById('modalScheduleOverlay')
    
    if (modalScheduleClose) {
        modalScheduleClose.addEventListener('click', closeScheduleModal)
    }
    
    if (modalScheduleOverlay) {
        modalScheduleOverlay.addEventListener('click', closeScheduleModal)
    }
    
    initMap()
})

function initMap() {
    map.value = L.map('map').setView([-8.5833, 116.1167], 14)

    //kordinat desa bumbung
    // map.value = L.map('map').setView([-8.384399, 116.542617], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
    }).addTo(map.value)

    markerCluster.value = L.markerClusterGroup()
    updateMarkers()
    map.value.addLayer(markerCluster.value)
}

// ===== Create Popup Content =====
function createPopupContent(point) {
    const statusClass = point.status;
    const statusText = {
        normal: 'Normal',
        warning: 'Hampir Penuh',
        danger: 'Penuh'
    }[point.status];

    return `
        <div class="popup-content">
            <div class="popup-header">
                <span class="material-icons">delete</span>
                <div class="popup-title">${point.name}</div>
            </div>
            <div class="popup-body">
                <div class="popup-info">
                    <div class="popup-status ${statusClass}">
                        <span style="font-size: 10px;">●</span>
                        ${statusText} (${point.capacity}%)
                    </div>
                </div>
                <div class="popup-info">
                    <span class="material-icons">location_on</span>
                    <span>${point.address}</span>
                </div>
                <div class="popup-info">
                    <span class="material-icons">schedule</span>
                    <span>${point.schedule}</span>
                </div>
                <div class="popup-info">
                    <span class="material-icons">update</span>
                    <span>Update: ${point.lastUpdate}</span>
                </div>
            </div>
            <div class="popup-footer">
                <button class="popup-btn popup-btn-secondary" onclick="viewDetail(${point.id})">
                    Lihat Detail
                </button>
                <button class="popup-btn popup-btn-primary" onclick="reportFromMap(${point.id})">
                    Laporkan
                </button>
            </div>
        </div>
    `;
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

    // Use popup for both desktop and mobile
    marker.bindPopup(createPopupContent(point), {
        maxWidth: isMobile.value ? 280 : 300,
        className: 'custom-popup',
        autoPan: true,
        autoPanPadding: [10, 10]
    });

    markerCluster.value.addLayer(marker);
    markers.value.push({ marker, point });

    });
}

</script>

<style src="@/assets/styles/home.css"></style>
