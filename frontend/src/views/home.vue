<template>
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
    <main class="main-content" :class="{ 'modal-backdrop-active': isModalScheduleOpen }">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <button class="sidebar-toggle" id="sidebarToggle">
                <span class="material-icons">chevron_left</span>
            </button>

            <div class="sidebar-content">
                <sidebarContent   
                    :selectedStatus="selectedStatus"
                    @openScheduleModal="openScheduleModal"
                    @openLaporanModal="openLaporanModal"
                    @statusChanged="updateMarkers"
                    @update:selectedStatus="selectedStatus = $event"
                />
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
              <button
                class="bottom-sheet-trigger"
                :class="{ hidden: isBottomSheetOpen }"
                @click="openBottomSheet"
                @touchstart.prevent="openBottomSheet"
            >
             <!-- <span class="trigger-text">Jadwal Pengambilan</span> -->
            </button>
        </div>
    </main>
    <div class="bottom-sheet" id="bottomSheet" :class="{ open: isBottomSheetOpen, 'modal-backdrop-active': isModalScheduleOpen }">
        <div class="bottom-sheet-header" @click="toggleBottomSheet" @touchstart.prevent="toggleBottomSheet">
            <div class="bottom-sheet-handle"></div>
            <h3>Jadwal Pengambilan Sampah</h3>
            <button class="bottom-sheet-close" @click.stop="closeBottomSheet" @touchstart.prevent.stop="closeBottomSheet">
                <span class="material-icons">expand_more</span>
            </button>
        </div>
        <div class="bottom-sheet-content">
            <!-- Dynamic content - same as sidebar -->
            <sidebarContent
                :selectedStatus="selectedStatus"
                @openScheduleModal="openScheduleModal"
                @statusChanged="updateMarkers"
                @update:selectedStatus="selectedStatus = $event"
            />
        </div>
    </div>
    <div 
        v-if="isBottomSheetOpen"
        class="bottom-sheet-backdrop"
        @click="closeBottomSheet"
        @touchstart.prevent="closeBottomSheet"
    ></div>

    <!-- Report modal provided by ReportModal component -->

    <!-- Modal TPS Schedule -->
    <div class="modal" id="modalSchedule" v-if="isModalScheduleOpen" :class="{ show: isModalScheduleOpen }" @touchmove.stop>
        <div class="modal-overlay" id="modalScheduleOverlay" @click="isModalScheduleOpen = false" @touchmove.stop></div>
        <div class="modal-content modal-schedule" @touchmove.stop>
            <div class="modal-header">
                <h2>
                    <span class="material-icons">calendar_month</span>
                    <span id="scheduleModalTitle">Jadwal Lengkap TPS {{ selectedDesa?.desa }}</span>
                </h2>
                <button class="modal-close" @click="isModalScheduleOpen = false">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="modal-body" id="tpsScheduleContent">
                <!-- Dynamic TPS schedule list -->
                <div v-for="tps in modalTPSList" :key="tps.id_tps" class="tps-schedule-item">
                    <div class="tps-header">
                        <span class="material-icons">delete</span>
                        <div class="tps-info">
                            <h3>{{ tps.nama_tps }}</h3>
                            <div class="tps-interval">
                                <span class="material-icons">update</span>
                                <span>Jadwal pengambilan setiap hari {{ tps.hari_pengambilan || '-' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="tps-body">
                        <div class="tps-status-row">
                            <span class="tps-status-label">Status Pengambilan:</span>
                            <div class="tps-status-badge" :class="tps.status_angkut">
                                <span class="material-icons" :class="tps.status_angkut">
                                    {{ getStatusIcon(tps.status_angkut) }}
                                </span>
                                <span>
                                    {{ getStatusText(tps.status_angkut) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL RIWAYAT LAPORAN -->
    <div class="modal" 
        v-if="isModalLaporanOpen" 
        :class="{ show: isModalLaporanOpen }"
    >
    <div class="modal-overlay" @click="isModalLaporanOpen = false"></div>

    <div class="modal-content modal-schedule">
        <!-- HEADER -->
        <div class="modal-header">
        <h2>
            <span class="material-icons">report</span>
            Riwayat Laporan Masyarakat
        </h2>
        <button class="modal-close" @click="isModalLaporanOpen = false">
            <span class="material-icons">close</span>
        </button>
        </div>

        <!-- BODY -->
        <div class="modal-body schedule-body">

        <!-- EMPTY -->
        <div v-if="laporanList.length === 0" class="empty-state">
            Tidak ada laporan
        </div>

        <!-- GRID -->
        <div class="schedule-grid">
    <div v-for="laporan in sortedLaporan"
        :key="laporan.id_laporan"
        class="laporan-card"
    >
    <!-- HEADER -->
    <div class="laporan-header">
        <div class="laporan-date">
        {{ formatDateTime(laporan.tgl_laporan) }}
        </div>

        <div class="laporan-badge" :class="laporan.kondisi_tps">
        {{ kondisiText(laporan.kondisi_tps) }}
        </div>
    </div>

    <!-- TITLE -->
    <div class="laporan-title">
        {{ laporan.nama_tps }}
    </div>

    <!-- DESKRIPSI -->
    <div class="laporan-desc">
        {{ laporan.deskripsi || 'Tidak ada keterangan' }}
    </div>

    <!-- FOOTER -->
    <div class="laporan-footer">
        <span class="material-icons">person</span>
        <span>{{ laporan.nama_pelapor }}</span>
    </div>
    </div>
        </div>

        </div>
    </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast"  
        :class="{ show: isToastVisible }" 
        :style="{ background: toastColor }"
    >
        <span class="material-icons toast-icon">{{ toastIcon }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
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
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { ref, onMounted, watch, nextTick,  computed} from 'vue'
import { fetchTitikTps } from '@/services/wasteService.js'
import LoginModal from '@/components/loginModal.vue'
import ReportModal from '@/components/reportModal.vue'
import sidebarContent from '@/components/sidebarContent.vue'
import { useToast } from '@/services/useToast'
import api from '@/services/api'

// Mobile detection
let isMobile = ref(window.innerWidth <= 768);

const isModalLaporanOpen = ref(false)
const laporanList = ref([])
const showDetailModal = ref(false)
const selectedLaporan = ref(null)

// Date and Schedule
const currentDate = ref('')
const todaySchedules = ref([])
const jadwalTPS = ref([])
const selectedDesa = ref(null)
const isModalScheduleOpen = ref(false)

const map = ref(null)
const markerCluster = ref(null)
let markers = ref([]);

const selectedVillage = ref('all')
const selectedStatus = ref(['normal', 'hampir_penuh', 'penuh'])

const loginRef = ref(null)
const reportRef = ref(null)

const wastePoints = ref([])
const loading = ref(false)
const error = ref(null)
const modalTPSList = ref([])
const isBottomSheetOpen = ref(false)

async function fetchLaporan() {
  try {
    const res = await api.get('/api/lapor')
    laporanList.value = res.data
  } catch (err) {
    console.error('Gagal ambil laporan', err)
  }
}

function openLaporanModal() {
  isModalLaporanOpen.value = true
  fetchLaporan()
}

function openDetail(laporan) {
  selectedLaporan.value = laporan
  showDetailModal.value = true
}

function kondisiText(kondisi) {
  return {
    hampir_penuh: 'Hampir Penuh',
    penuh: 'Penuh',
    sampah_berserakan: 'Sampah Berserakan'
  }[kondisi] || kondisi
}

function formatDateTime(date) {
  const d = new Date(date)

  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const kondisiPriority = {
  sampah_berserakan: 1,
  penuh: 2,
  hampir_penuh: 3
}

// const sortedLaporan = computed(() => {
//   return [...laporanList.value].sort((a, b) => {
//     return kondisiPriority[a.kondisi_tps] - kondisiPriority[b.kondisi_tps]
//   })
// })

const sortedLaporan = computed(() => {
  return laporanList.value
    // ✅ FILTER: buang yang TPS-nya sudah selesai
    .filter(laporan => {
      const tps = jadwalTPS.value.find(
        t => Number(t.id_tps) === Number(laporan.id_tps)
      )

      // kalau TPS belum selesai → tampilkan
      return tps?.status_angkut !== 'selesai'
    })

    // ✅ SORT: berdasarkan urgensi
    .sort((a, b) => {
      const pA = kondisiPriority[a.kondisi_tps] || 99
      const pB = kondisiPriority[b.kondisi_tps] || 99

      if (pA !== pB) return pA - pB

      // optional: kalau sama → terbaru dulu
      return new Date(b.tgl_laporan) - new Date(a.tgl_laporan)
    })
})

const { 
    isToastVisible, 
    toastMessage, 
    toastIcon, 
    toastColor 
} = useToast()

const statusInfo = {
    belum_diangkut: { text: 'Belum Dimulai', icon: 'schedule' },
    diangkut: { text: 'Sedang Berlangsung', icon: 'local_shipping' },
    selesai: { text: 'Selesai', icon: 'check_circle' },
}

const getStatusText = (status) => {
    return statusInfo[status]?.text || 'Belum Dimulai'
}

const getStatusIcon = (status) => {
    return statusInfo[status]?.icon || 'schedule'
}

const openBottomSheet = () => {
  console.log('openBottomSheet clicked (before):', isBottomSheetOpen.value)
  isBottomSheetOpen.value = true
  console.log('openBottomSheet set to:', isBottomSheetOpen.value)
}

const closeBottomSheet = () => {
  console.log('closeBottomSheet clicked (before):', isBottomSheetOpen.value)
  isBottomSheetOpen.value = false
  console.log('closeBottomSheet set to:', isBottomSheetOpen.value)
}

const toggleBottomSheet = () => {
  console.log('toggleBottomSheet (before):', isBottomSheetOpen.value)
  isBottomSheetOpen.value = !isBottomSheetOpen.value
  console.log('toggleBottomSheet (after):', isBottomSheetOpen.value)
}

function openReport(id_tps = null) {
    if (reportRef.value && typeof reportRef.value.openModal === 'function') {
        reportRef.value.openModal(id_tps)
        return
    }

    alert('Modal laporan tidak tersedia (reportRef null). Periksa console untuk detail.')
}

function openScheduleModal(desa) { 
    selectedDesa.value = desa
    isModalScheduleOpen.value = true

    modalTPSList.value = jadwalTPS.value.filter(
        tps => tps.nama_dusun === desa.desaCode
    )
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
    if (!Array.isArray(wastePoints.value)) return []

    const today = new Date()
    const todayName = getCurrentDayName(today)
    
    const schedules = wastePoints.value
        .filter(point => {
            // Cek apakah jadwal mengandung hari ini
            return point.hari_pengambilan?.includes(todayName)
        })
        .map(point => {
            // Ekstrak waktu dari schedule (format: "Hari1 & Hari2, HH.MM WIB")
            const timeMatch = point.hari_pengambilan.match(/(\d{2}\.\d{2})/)
            const time = timeMatch ? timeMatch[1] : '-'
            
            return {
                id: point.id,
                nama_tps: point.nama_tps,
                time: time + ' WIB',
                alamat: point.alamat
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

function initializeDateTime() {
    currentDate.value = formatDate()
    todaySchedules.value = getTodaySchedules()
}

onMounted(async () => {
  try {
    loading.value = true

    //Ambil data dulu
    const result = await fetchTitikTps()
    wastePoints.value = Array.isArray(result) ? result : []
    jadwalTPS.value = result

    //Set tanggal & schedule
    initializeDateTime()

    //Inisialisasi map
    initMap()

    //Render marker setelah map siap
    nextTick(() => {
      updateMarkers()
    })

  } catch (err) {
    console.error('Gagal ambil data TPS:', err.message)
    wastePoints.value = []
    error.value = err.message
  } finally {
    loading.value = false
  }
})

function initMap() {
    //kordinat desa bumbung
    map.value = L.map('map').setView([-8.384399, 116.542617], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
    }).addTo(map.value)

    markerCluster.value = L.markerClusterGroup()
    map.value.addLayer(markerCluster.value)
    // updateMarkers()
    watch(wastePoints, () => {
        if (map.value) {
            updateMarkers()
        }
    })
}

function getMarkerIcon(status_tps) {
    const colors = {
        normal: '#4CAF50',
        hampir_penuh: '#FFC107',
        penuh: '#F44336'
    };

    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                width: 30px;
                height: 30px;
                background: ${colors[status_tps]};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span class="material-icons" style="font-size: 16px; color: white;">delete</span>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

function formatTgl(date) {
  if (!date) return '-'

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// pop up titik tps
function createPopupContent(point) {
    const statusClass = point.status_tps;
    const statusText = {
        normal: 'Normal',
        hampir_penuh: 'Hampir Penuh',
        penuh: 'Penuh'
    }[point.status_tps];
    const persen = point.kapasitas
        ? Math.round((point.volume_sampah / point.kapasitas) * 100)
        : 0

    return `
        <div class="popup-content">
            <div class="popup-header">
                <span class="material-icons">delete</span>
                <div class="popup-title">${point.nama_tps}</div>
            </div>
            <div class="popup-body">
                <div class="popup-info">
                    <div class="popup-status ${statusClass}">
                        <span style="font-size: 10px;">●</span>
                        ${statusText} (${persen}%)
                    </div>
                </div>
                <div class="popup-info">
                    <span class="material-icons">location_on</span>
                    <span>${point.alamat}</span>
                </div>
                <div class="popup-info">
                    <span class="material-icons">schedule</span>
                    <span>Setiap hari: ${point.hari_pengambilan || '-'}</span>
                </div>
                <div class="popup-info">
                    <span class="material-icons">update</span>
                    <span>Tgl terakhir diambil: ${formatTgl(point.tgl_terakhir_diambil)}</span>
                </div>
            </div>
            <div class="popup-footer">
                <button class="popup-btn popup-btn-primary" onclick="openReport(${point.id_tps})">
                    Laporkan
                </button>
            </div>
        </div>
    `;
}

function updateMarkers() {
    markerCluster.value.clearLayers()

    const filtered = wastePoints.value.filter(p =>
    (selectedVillage.value === 'all' || p.village === selectedVillage.value) &&
    selectedStatus.value.includes(p.status_tps)
    )

    filtered.forEach(point => {
    const marker = L.marker(
        [parseFloat(point.latitude), parseFloat(point.longitude)],
        { icon: getMarkerIcon(point.status_tps) }
    );

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

// Watch untuk trigger updateMarkers ketika selectedStatus berubah
watch(selectedStatus, () => {
  if (map.value) {
    updateMarkers()
  }
}, { deep: true })

</script>

<style src="@/assets/styles/home.css"></style>