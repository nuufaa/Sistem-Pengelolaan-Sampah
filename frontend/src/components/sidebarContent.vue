<template>
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
                        <div v-for="desa in dusunList" :key="desa.desaCode" class="desa-card">
                            <div class="desa-header">
                                <span class="material-icons">{{ desa.icon }}</span>
                                <h3>Desa Sembalun Bumbung</h3>
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
                        <div class="filter-group">
                        <label class="filter-label">Status Titik Sampah:</label>

                        <label class="checkbox-label status-normal">
                            <input 
                            type="checkbox"
                            value="normal"
                            v-model="selectedStatus"
                            >
                            <span class="status-icon">●</span>
                            <span>Normal <span class="count">({{ totalTPS - totalTPSHampirPenuh - totalTPSPenuh }})</span></span>
                        </label>

                        <label class="checkbox-label status-warning">
                            <input 
                            type="checkbox"
                            value="hampir_penuh"
                            v-model="selectedStatus"
                            >
                            <span class="status-icon">●</span>
                            <span>Hampir Penuh <span class="count">({{ totalTPSHampirPenuh }})</span></span>
                        </label>

                        <label class="checkbox-label status-danger">
                            <input 
                            type="checkbox"
                            value="penuh"
                            v-model="selectedStatus"
                            >
                            <span class="status-icon">●</span>
                            <span>Penuh <span class="count">({{ totalTPSPenuh }})</span></span>
                        </label>

                        </div>

                        <div class="legend">
                            <h3>Informasi Peta:</h3>
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
                                <div class="stat-number" id="statTotal">{{ totalTPS }}</div>
                                <div class="stat-label">Total Titik</div>
                            </div>
                            <div class="stat-item warning">
                                <div class="stat-number" id="statWarning">{{ totalTPSHampirPenuh }}</div>
                                <div class="stat-label">Perlu Perhatian</div>
                            </div>
                            <div class="stat-item danger">
                                <div class="stat-number" id="statDanger">{{ totalTPSPenuh }}</div>
                                <div class="stat-label">Penuh</div>
                            </div>
                        </div>
                        <div class="last-update">
                            Terakhir Diperbarui: <span id="lastUpdate"></span>
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
                        <!-- <div id="volumeSampahSidebar"></div> -->
                        <canvas ref="volumeSampahChartRef" class="bar-chart"></canvas>
                    </div>
                </div>

                <!-- Ranking TPS Card -->
                <div class="card">
                    <div class="card-header">
                        <span class="material-icons">emoji_events</span>
                        <h2>Ranking TPS Terbaik</h2>
                    </div>
                    <div class="card-body">
                        <div class="ranking-list">
                        <div
                        v-for="(item,index) in rankingTPS"
                        :key="item.id_tps"
                        class="sidebar-ranking-item"
                        >
                            <!-- medal / ranking -->
                            <div class="sidebar-ranking-medal">
                                <span v-if="index===0">🥇</span>
                                <span v-else-if="index===1">🥈</span>
                                <span v-else-if="index===2">🥉</span>
                                <span v-else>{{ index+1 }}.</span>
                            </div>

                            <!-- info TPS -->
                            <div class="sidebar-ranking-info">
                            <div class="sidebar-ranking-name">
                                {{ item.nama_tps }}
                            </div>
                            <div class="sidebar-ranking-desa">
                                {{ item.nama_dusun }}
                            </div>
                            </div>
                            <!-- score -->
                            <div class="sidebar-ranking-score">
                            {{ item.score }}
                            </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timbulan Per Kapita Card -->
                <div class="card">
                    <div class="card-header">
                        <span class="material-icons">people</span>
                        <h2>Timbulan Per Kapita</h2>
                    </div>
                    <div class="card-body">
                        <!-- <div id="timbulanSidebar"></div> -->
                        <div
                            v-for="(item, index) in timbulanPerKapita"
                            :key="item.nama_dusun"
                            class="sidebar-timbulan-item"
                            :style="{ animationDelay: `${index * 0.1}s` }"
                        >
                        <div class="sidebar-timbulan-desa">{{ item.nama_dusun }}</div>
                        <div class="sidebar-timbulan-value">{{ item.timbulan_kg_per_kk_per_hari }}</div>
                        <div class="sidebar-timbulan-unit">kg/KK/hari</div>
                    </div>
                    <div v-if="timbulanPerKapita.length === 0 && !loading" class="empty-state">
                    Tidak ada data tersedia
                    </div>

                    <div v-if="loading" class="loading-state">
                        <div
                            v-for="n in 2"
                            :key="n"
                            class="sidebar-timbulan-item skeleton"
                        >
                            <div class="skeleton-line short"></div>
                            <div class="skeleton-line tall"></div>
                            <div class="skeleton-line xshort"></div>
                        </div>
                    </div>
                </div>
            </div>
</template>

<script setup>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { ref, onMounted, watch, nextTick, computed} from 'vue'
import { fetchTitikTps } from '@/services/wasteService.js'
import LoginModal from '@/components/loginModal.vue'
import ReportModal from '@/components/reportModal.vue'
import api from '@/services/api'
import Chart from 'chart.js/auto'

// Mobile detection
let isMobile = ref(window.innerWidth <= 768);

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

const emit = defineEmits(['reportOpened'])

// Receive reportRef from parent (home.vue)
const props = defineProps({
  reportRef: {
    type: Object,
    default: null
  }
})

const wastePoints = ref([])
const loading = ref(false)
const error = ref(null)

const totalTPS = ref(0)
const totalTPSPenuh = ref(0)
const totalTPSHampirPenuh = ref(0)
const rankingTPS = ref(0)
const timbulanPerKapita = ref(0)

const volumeSampahChartRef = ref(null)
let volumeSampahChart = null
const modalTPSList = ref([])


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

function renderVolumeSampahChart(data) {
  if (volumeSampahChart) volumeSampahChart.destroy()

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    })
  }

  const labels = [...new Set(data.map(item => formatDate(item.tanggal)))]

  const tpsList = [...new Set(data.map(item => item.nama_tps))]

  const datasets = tpsList.map((tps, index) => {
    return {
      label: tps,
      data: labels.map(label => {
        const found = data.find(d => 
          formatDate(d.tanggal) === label && d.nama_tps === tps
        )
        return found ? found.total_volume : 0
      }),
      backgroundColor: index % 2 === 0 ? '#66BB6A' : '#FFA726'
    }
  })

  volumeSampahChart = new Chart(volumeSampahChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
     barPercentage: 0.5,
        categoryPercentage: 0.5,
        maxBarThickness: 40,
        responsive: true,
        maintainAspectRatio: false,
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
            pointStyle: 'circle',
                labels: {
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                padding: 8,
                usePointStyle: true,
                pointStyle: 'circle'
                }
            },
            tooltip: {
            callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw} kg`
            }
            }
        }
    }
  })
}

async function fetchTPSByStatus() {
  try {

    const statusQuery = selectedStatus.value.join(',')

    const res = await fetch(`/api/tps/status?status=${statusQuery}`)
    const data = await res.json()

    wastePoints.value = data

    updateMarkers()

  } catch (err) {
    console.error('Gagal filter TPS:', err)
  }
}


async function fetchDashboard() {
  try {
    const res = await api.get('/api/dashboard')

    totalTPS.value = res.data.totalTPS
    totalTPSPenuh.value = res.data.totalTPSPenuh
    totalTPSHampirPenuh.value = res.data.totalTPSHampirPenuh
    rankingTPS.value = res.data.rankingTPS
    timbulanPerKapita.value = res.data.timbulanPerKapita

    await nextTick()
    renderVolumeSampahChart(res.data.volumeSampahHarian)

  } catch (error) {
    console.error("Gagal ambil dashboard:", error)
  }
}

function openReport(id_tps = null) {
    // Open modal using reportRef from parent (home.vue)
    if (props.reportRef && typeof props.reportRef.openModal === 'function') {
        props.reportRef.openModal(id_tps)
    }
    
    // Always emit to notify parent component to close bottom sheet (mobile)
    emit('reportOpened')
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

// ===== Desa and TPS Functions =====
function getTpsCountByDesa(desaCode) {
  if (!Array.isArray(jadwalTPS.value)) return 0

  return jadwalTPS.value.filter(
    tps => tps.nama_dusun === desaCode
  ).length
}

const dusunList = computed(() => {
  const map = {}

  jadwalTPS.value.forEach(tps => {
    if (!map[tps.nama_dusun]) {
      map[tps.nama_dusun] = {
        desaCode: tps.nama_dusun,
        desa: tps.nama_dusun,
        icon: "location_city"
      }
    }
  })

  return Object.values(map)
})

function openScheduleModal(desa) {
    selectedDesa.value = desa
    isModalScheduleOpen.value = true

    modalTPSList.value = jadwalTPS.value.filter(
        tps => tps.nama_dusun === desa.desaCode
    )
}

function closeScheduleModal() {
    isModalScheduleOpen.value = false
    selectedDesa.value = null
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
    // initMap()

    //Render marker setelah map siap
    // nextTick(() => {
    //   updateMarkers()
    // })

  } catch (err) {
    console.error('Gagal ambil data TPS:', err.message)
    wastePoints.value = []
    error.value = err.message
  } finally {
    loading.value = false
  }

  fetchDashboard()

})

watch(selectedStatus, () => {
  fetchTPSByStatus()
})

// function initMap() {
//     //kordinat desa bumbung
//     map.value = L.map('map').setView([-8.384399, 116.542617], 14)

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '© OpenStreetMap'
//     }).addTo(map.value)

//     markerCluster.value = L.markerClusterGroup()
//     map.value.addLayer(markerCluster.value)
//     // updateMarkers()
//     watch(wastePoints, () => {
//         if (map.value) {
//             updateMarkers()
//         }
//     })
// }

// function getMarkerIcon(status_tps) {
//     const colors = {
//         normal: '#4CAF50',
//         hampir_penuh: '#FFC107',
//         penuh: '#F44336'
//     };

//     return L.divIcon({
//         className: 'custom-marker',
//         html: `
//             <div style="
//                 width: 30px;
//                 height: 30px;
//                 background: ${colors[status_tps]};
//                 border: 3px solid white;
//                 border-radius: 50%;
//                 box-shadow: 0 2px 8px rgba(0,0,0,0.3);
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//             ">
//                 <span class="material-icons" style="font-size: 16px; color: white;">delete</span>
//             </div>
//         `,
//         iconSize: [30, 30],
//         iconAnchor: [15, 15]
//     });
// }

onMounted(() => {
    // window.openReport = openReport  // Moved to home.vue to ensure bottom sheet closes
})

// function formatTgl(date) {
//   if (!date) return '-'

//   const d = new Date(date)
//   const year = d.getFullYear()
//   const month = String(d.getMonth() + 1).padStart(2, '0')
//   const day = String(d.getDate()).padStart(2, '0')

//   return `${year}-${month}-${day}`
// }

// pop up titik tps
// function createPopupContent(point) {
//     const statusClass = point.status_tps;
//     const statusText = {
//         normal: 'Normal',
//         hampir_penuh: 'Hampir Penuh',
//         penuh: 'Penuh'
//     }[point.status_tps];

//     return `
//         <div class="popup-content">
//             <div class="popup-header">
//                 <span class="material-icons">delete</span>
//                 <div class="popup-title">${point.nama_tps}</div>
//             </div>
//             <div class="popup-body">
//                 <div class="popup-info">
//                     <div class="popup-status ${statusClass}">
//                         <span style="font-size: 10px;">●</span>
//                         ${statusText}
//                     </div>
//                 </div>
//                 <div class="popup-info">
//                     <span class="material-icons">location_on</span>
//                     <span>${point.alamat}</span>
//                 </div>
//                 <div class="popup-info">
//                     <span class="material-icons">schedule</span>
//                     <span>Setiap hari: ${point.hari_pengambilan || '-'}</span>
//                 </div>
//                 <div class="popup-info">
//                     <span class="material-icons">update</span>
//                     <span>Tgl terakhir diambil: ${formatTgl(point.tgl_terakhir_diambil)}</span>
//                 </div>
//             </div>
//             <div class="popup-footer">
//                 <button class="popup-btn popup-btn-primary" onclick="openReport(${point.id_tps})">
//                     Laporkan
//                 </button>
//             </div>
//         </div>
//     `;
// }

// function updateMarkers() {
//     markerCluster.value.clearLayers()

//     const filtered = wastePoints.value.filter(p =>
//     (selectedVillage.value === 'all' || p.village === selectedVillage.value) &&
//     selectedStatus.value.includes(p.status_tps)
//     )

//     filtered.forEach(point => {
//     const marker = L.marker(
//         [parseFloat(point.latitude), parseFloat(point.longitude)],
//         { icon: getMarkerIcon(point.status_tps) }
//     );

//     // Use popup for both desktop and mobile
//     marker.bindPopup(createPopupContent(point), {
//         maxWidth: isMobile.value ? 280 : 300,
//         className: 'custom-popup',
//         autoPan: true,
//         autoPanPadding: [10, 10]
//     });

//     markerCluster.value.addLayer(marker);
//     markers.value.push({ marker, point });

//     });

// }

</script>

<style src="@/assets/styles/home.css"></style>