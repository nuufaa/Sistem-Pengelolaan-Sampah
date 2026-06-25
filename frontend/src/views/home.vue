<template>
    <header class="header">
        <div class="header-left">
            <div class="logo-container">
                <div class="logo-icon-wrapper">
                    <img 
                        v-if="logoSrc" 
                        :src="logoSrc" 
                        alt="Logo Desa"
                        class="logo-img-navbar"
                    />
                    <span v-else class="material-icons logo-icon">domain</span>
                </div>
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
                    @openVolumeSampahStatModal="openVolumeSampahStatModal"
                    @openTimbulanModal="isModalTimbulanOpen = true"
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
                @openLaporanModal="openLaporanModal"
                @openVolumeSampahStatModal="openVolumeSampahStatModal"
                @openTimbulanModal="isModalTimbulanOpen = true"
                @statusChanged="updateMarkers"
                @update:selectedStatus="selectedStatus = $event"
            />
        </div>
    </div>
    <div 
        v-if="isBottomSheetOpen"
        class="bottom-sheet-backdrop show"
        @click="closeBottomSheet"
        @touchstart.prevent="closeBottomSheet"
    ></div>

    <!-- Modal TPS Schedule -->
    <div class="modal" id="modalSchedule" v-if="isModalScheduleOpen" :class="{ show: isModalScheduleOpen }" @touchmove.stop>
    <div class="modal-overlay" id="modalScheduleOverlay" @click="isModalScheduleOpen = false" @touchmove.stop></div>
    <div class="modal-content modal-schedule" @touchmove.stop>

        <div class="modal-header">
            <h2>
                <span class="material-icons">calendar_month</span>
                <span>Jadwal Lengkap TPS {{ selectedDesa?.desa }}</span>
            </h2>
            <button class="modal-close" @click="isModalScheduleOpen = false">
                <span class="material-icons">close</span>
            </button>
        </div>

        <div class="modal-body" id="tpsScheduleContent">

        <!-- Toolbar: search + sort -->
        <div class="schedule-toolbar">
            <input
            v-model="scheduleSearch"
            type="text"
            placeholder="Cari nama TPS..."
            class="schedule-search"
            />
        </div>

        <!-- Filter tabs -->
        <div class="schedule-filter-tabs">
            <button
            v-for="tab in scheduleTabs"
            :key="tab.key"
            class="schedule-tab"
            :class="[tab.key, { active: scheduleFilter === tab.key }]"
            @click="scheduleFilter = tab.key"
            >
            <span v-if="tab.key !== 'all'" class="tab-dot" :style="{ background: tab.warna }" />
            {{ tab.label }}
            <span class="tab-count">
                ({{ tab.key === 'all' ? modalTPSList.length : scheduleCountByStatus[tab.key] ?? 0 }})
            </span>
            </button>
        </div>

        <!-- Grid 2 kolom -->
        <div v-if="scheduleFiltered.length > 0">
            <div
            v-for="tps in scheduleFiltered"
            :key="tps.id_tps"
            class="tps-mini-card"
            :class="tps.status_angkut"
            >
            <div class="tps-mini-left">
                <div class="tps-mini-icon">
                    <span class="material-icons">delete</span>
                </div>
                <div class="tps-mini-info">
                    <div class="tps-mini-name">{{ tps.nama_tps }}</div>
                    <div class="tps-mini-hari">Setiap {{ tps.hari_pengambilan || '-' }}</div>
                </div>
            </div>
            <div class="tps-status-badge" :class="tps.status_angkut">
                <span class="material-icons">{{ getStatusIcon(tps.status_angkut) }}</span>
                <span>{{ getStatusText(tps.status_angkut) }}</span>
            </div>
            </div>
        </div>

        <!-- Empty state -->
        <div class="schedule-empty" v-else>
            <span class="material-icons">search_off</span>
            <p>Tidak ada TPS yang cocok</p>
        </div>

        <!-- Footer count -->
        <p class="schedule-footer-count" v-if="scheduleFiltered.length > 0">
            Menampilkan {{ scheduleFiltered.length }} dari {{ scheduleFiltered.length }} TPS
        </p>

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

    <!-- Modal Volume Sampah Statistics -->
    <volumeSampahStat 
        ref="volumeSampahStatRef"
        :isModalOpen="isModalVolumeSampahOpen"
        :volumeSampahData="volumeSampahHarian"
        @close="isModalVolumeSampahOpen = false"
    />

    <!-- Modal Timbulan Per Kapita -->
    <timbulanPerKapitaStat
        :isModalOpen="isModalTimbulanOpen"
        @close="isModalTimbulanOpen = false"
    />

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
                        <input type="password" placeholder="Masukkan password..." />
                        <button type="button">
                            <span class="material-icons">visibility</span>
                        </button>
                    </div>
                    <span class="login-error"></span>
                </div>

                <button type="submit" class="login-submit-btn">
                    <span>
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

import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { fetchTitikTps } from '@/services/wasteService.js'
import LoginModal from '@/components/loginModal.vue'
import ReportModal from '@/components/reportModal.vue'
import sidebarContent from '@/components/sidebarContent.vue'
import volumeSampahStat from '@/components/volumeSampahStat.vue'
import timbulanPerKapitaStat from '@/components/timbulanPerKapitaStat.vue'
import { useToast } from '@/services/useToast'
import api from '@/services/api'
import { useDesaLogo } from '@/services/useDesaLogo'
import { TabSync } from '@/services/tabSync'

const { logoSrc, fetchLogo } = useDesaLogo()
onMounted(fetchLogo)

// Mobile detection
let isMobile = ref(window.innerWidth <= 768);

const isModalLaporanOpen = ref(false)
const laporanList = ref([])

// Date and Schedule
const currentDate = ref('')
const todaySchedules = ref([])
const jadwalTPS = ref([])
const selectedDesa = ref(null)
const isModalScheduleOpen = ref(false)

const map = ref(null)
const markerCluster = ref(null)
let markers = ref([]);
const wastePoints = ref([])

const selectedVillage = ref('all')
const selectedStatus = ref(['normal', 'hampir_penuh', 'penuh'])

const loginRef = ref(null)
const reportRef = ref(null)

const isModalVolumeSampahOpen = ref(false)
const isModalTimbulanOpen = ref(false)
const volumeSampahHarian = ref([])
const loading = ref(false)
const error = ref(null)
const modalTPSList = ref([])
const isBottomSheetOpen = ref(false)
let unsubscribeSync = null

// Auto-refresh interval untuk update status marker
let pollInterval = null
const POLL_INTERVAL_MS = 30 * 1000 // 30 detik (sebelumnya 5 menit)

// variabel untuk jadwal lengkap tps
const scheduleSearch  = ref('')
const scheduleSort    = ref('id')
const scheduleFilter  = ref('all')

const scheduleTabs = [
  { key: 'all',            label: 'Semua',           warna: '' },
  { key: 'selesai',        label: 'Selesai',          warna: '#639922' },
  { key: 'belum_diangkut', label: 'Belum dimulai',    warna: '#888780' },
]

const scheduleCountByStatus = computed(() =>
  modalTPSList.value.reduce((acc, t) => {
    acc[t.status_angkut] = (acc[t.status_angkut] ?? 0) + 1
    return acc
  }, {})
)

const scheduleFiltered = computed(() => {
  if (!Array.isArray(modalTPSList.value)) return []
  
  // Deduplikasi
  const uniqueMap = new Map()
  modalTPSList.value.forEach(t => {
    if (!uniqueMap.has(t.id_tps)) {
      uniqueMap.set(t.id_tps, t)
    }
  })
 
  let data = Array.from(uniqueMap.values())
 
  // Filter status - DENGAN VALIDASI KEY
  if (scheduleFilter.value !== 'all') {
    const validKeys = ['belum_diangkut', 'selesai']
    
    // Debug jika key tidak valid
    if (!validKeys.includes(scheduleFilter.value)) {
      console.warn(`Invalid filter key: ${scheduleFilter.value}`)
    }
    
    data = data.filter(t => t.status_angkut === scheduleFilter.value)
  }
 
  // Search
  const q = scheduleSearch.value.toLowerCase()
  if (q) {
    data = data.filter(t =>
      t.nama_tps?.toLowerCase().includes(q)
    )
  }
  
  // Sort status
  data.sort((a, b) => {
    const pA = statusPriority[a.status_angkut] || 99
    const pB = statusPriority[b.status_angkut] || 99

    if (pA !== pB) return pA - pB

    // optional: kalau sama → urut nama
    return a.nama_tps.localeCompare(b.nama_tps)
  })

  return data
})

async function fetchLaporan() {
  try {
    const res = await api.get('/api/lapor')
    laporanList.value = res.data
  } catch (err) {
    console.error('Gagal ambil laporan', err)
  }
}

async function fetchVolumeSampahData() {
  try {
    const res = await api.get('/api/dashboard')
    volumeSampahHarian.value = res.data.volumeSampahHarian || []
  } catch (err) {
    console.error('Gagal ambil data volume sampah', err)
  }
}

function openLaporanModal() {
  isModalLaporanOpen.value = true
  fetchLaporan()
}

function openVolumeSampahStatModal() {
  isModalVolumeSampahOpen.value = true
  fetchVolumeSampahData()
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

const statusPriority = {
  belum_diangkut: 1,
  selesai: 2
}

const sortedLaporan = computed(() => {
  return laporanList.value
    // FILTER: buang yang TPS-nya sudah selesai
    .filter(laporan => {
      const tps = jadwalTPS.value.find(
        t => Number(t.id_tps) === Number(laporan.id_tps)
      )

      // kalau TPS belum selesai → tampilkan
      return tps?.status_angkut !== 'selesai'
    })

    // SORT: berdasarkan urgensi
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
  selesai: { text: 'Selesai', icon: 'check_circle' },
}

const getStatusText = (status) => {
    return statusInfo[status]?.text || 'Belum Dimulai'
}

const getStatusIcon = (status) => {
    return statusInfo[status]?.icon || 'schedule'
}

const openBottomSheet = () => {
  isBottomSheetOpen.value = true
}

const closeBottomSheet = () => {
  isBottomSheetOpen.value = false
}

const toggleBottomSheet = () => {
  isBottomSheetOpen.value = !isBottomSheetOpen.value
}

function openReport(id_tps = null) {
    if (reportRef.value && typeof reportRef.value.openModal === 'function') {
        reportRef.value.openModal(id_tps)
        return
    }

    alert('Modal laporan tidak tersedia (reportRef null). Periksa console untuk detail.')
}

// Expose ke global window agar bisa diakses dari atribut onclick di string HTML Leaflet popup
window.openReport = openReport;

function openScheduleModal(desa) { 
    selectedDesa.value = desa
    isModalScheduleOpen.value = true
    
    // Filter + debug dengan validasi status_angkut
    modalTPSList.value = jadwalTPS.value
        .filter(tps => tps.nama_dusun === desa.desaCode)
        .map(tps => ({
        ...tps,
        // Pastikan status_angkut valid
        status_angkut: ['belum_diangkut', 'selesai'].includes(tps.status_angkut)
            ? tps.status_angkut
            : 'belum_diangkut'
        }))

    // reset filter & search setiap modal dibuka
    scheduleSearch.value  = ''
    scheduleSort.value    = 'id'
    scheduleFilter.value  = 'all'

    // Log untuk debugging
    console.log('Modal TPS list:', modalTPSList.value.map(t => ({
        id: t.id_tps,
        nama: t.nama_tps,
        status: t.status_angkut
    })))
    
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
    jadwalTPS.value = Array.isArray(result) ? result : []
    // wastePoints.value = jadwalTPS.value

    // Deduplikasi: 1 id_tps = 1 entry, prioritaskan yang hari_pengambilan-nya ada
const tpsMap = new Map()
    jadwalTPS.value.forEach(item => {
        const existing = tpsMap.get(item.id_tps)
        // Ambil entry baru jika belum ada, atau jika yang baru punya hari_pengambilan lebih lengkap
        if (!existing || (!existing.hari_pengambilan && item.hari_pengambilan)) {
            tpsMap.set(item.id_tps, item)
        }
    })
    wastePoints.value = Array.from(tpsMap.values())

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

  // Mulai polling auto-refresh setiap 5 menit
  pollInterval = setInterval(async () => {
    try {
      const result = await fetchTitikTps()
      const tpsMap = new Map()
      ;(Array.isArray(result) ? result : []).forEach(item => {
        const existing = tpsMap.get(item.id_tps)
        if (!existing || (!existing.hari_pengambilan && item.hari_pengambilan)) {
          tpsMap.set(item.id_tps, item)
        }
      })
      wastePoints.value = Array.from(tpsMap.values())
      jadwalTPS.value = Array.isArray(result) ? result : []
      console.log('[Poll] Data TPS diperbarui:', new Date().toLocaleTimeString())
    } catch (err) {
      console.warn('[Poll] Gagal refresh data TPS:', err.message)
    }
  }, POLL_INTERVAL_MS)

  // Listen to updates from other tabs
  unsubscribeSync = TabSync.listen(async (event) => {
    console.log('Home TabSync event:', event)
    if (event === 'tps_updated' || event === 'laporan_updated' || event === 'jadwal_updated') {
      try {
        const result = await fetchTitikTps()
        const tpsMap = new Map()
        ;(Array.isArray(result) ? result : []).forEach(item => {
          const existing = tpsMap.get(item.id_tps)
          if (!existing || (!existing.hari_pengambilan && item.hari_pengambilan)) {
            tpsMap.set(item.id_tps, item)
          }
        })
        wastePoints.value = Array.from(tpsMap.values())
        jadwalTPS.value = Array.isArray(result) ? result : []
        
        // If modal schedule is open, update its data too
        if (isModalScheduleOpen.value && selectedDesa.value) {
            openScheduleModal(selectedDesa.value)
        }
      } catch (err) {
        console.warn('TabSync refresh failed:', err)
      }
    }
    if (event === 'settings_updated') {
      fetchLogo()
    }
  })
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  if (unsubscribeSync) unsubscribeSync()
})

function initMap() {
    //kordinat desa bumbung
    map.value = L.map('map').setView([-8.384399, 116.542617], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
    }).addTo(map.value)

    markerCluster.value = L.markerClusterGroup()
    map.value.addLayer(markerCluster.value)
    watch(wastePoints, () => {
        if (map.value) {
            updateMarkers()
        }
    })
}

function getMarkerIcon(status_tps) {
    const status = status_tps;
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
                background: ${colors[status]};
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
    }[statusClass];

    //hitung persentase sampah utk kondisi tps
    const persen = point.persentase_sampah || 
        (point.kapasitas ? Math.round((point.volume_sampah / point.kapasitas) * 100) : 0)

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

// Bersihkan polling interval saat komponen di-unmount
onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
})

</script>

<style src="@/assets/styles/home.css"></style>