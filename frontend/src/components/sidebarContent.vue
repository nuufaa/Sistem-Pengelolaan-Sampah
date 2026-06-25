<template>
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
            <div class="desa-card">
              <div class="desa-header">
                <span class="material-icons">event</span>
                <h3>Jam Operasional</h3>
              </div>  
              <div class="desa-tps-info">
                <span>
                  Jam buang warga:
                </span>
                <span>
                  {{ formatJam(jadwal.jam_buang_mulai) }}–{{ formatJam(jadwal.jam_buang_selesai) }}
                </span>
            </div>

            <div class="desa-tps-info">
              <span>
                Pengambilan: 
              </span>
              <span>
                {{ formatJam(jadwal.jam_ambil_mulai) }}–{{ formatJam(jadwal.jam_ambil_selesai) }}
              </span>
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

    <!-- CARD RIWAYAT LAPORAN -->
    <div class="desa-card laporan-card">
      <div class="desa-header">
        <span class="material-icons">report</span>
        <h3>Riwayat Laporan</h3>
      </div>

      <div class="desa-tps-info">
        <span class="material-icons">description</span>
        <span>{{ totalLaporan }} Laporan Masuk</span>
      </div>

      <button class="btn-lihat-jadwal laporan-btn" @click="$emit('openLaporanModal')">
        <span class="material-icons">visibility</span>
        <span>Lihat Riwayat Laporan</span>
      </button>
    </div>  

    <!-- Filter Card -->
    <div class="card filter-card">
      <div class="card-header">
        <span class="material-icons">filter_list</span>
        <h2>Filter Tampilan</h2>
      </div>
    <div class="card-body">
      <label class="filter-label">Status Titik Sampah:</label>
      <div class="filter-group">
        <label class="checkbox-label status-normal">
          <input 
          type="checkbox"
          value="normal"
          :checked="props.selectedStatus.includes('normal')"
          @change="handleStatusChange('normal', $event)"
          >
          <span class="status-icon">●</span>
          <span>Normal <span class="count">({{ totalTPS - totalTPSHampirPenuh - totalTPSPenuh }})</span></span>
        </label>

        <label class="checkbox-label status-warning">
          <input 
          type="checkbox"
          value="hampir_penuh"
          :checked="props.selectedStatus.includes('hampir_penuh')"
          @change="handleStatusChange('hampir_penuh', $event)"
          >
          <span class="status-icon">●</span>
          <span>Hampir Penuh <span class="count">({{ totalTPSHampirPenuh }})</span></span>
        </label>

        <label class="checkbox-label status-danger">
          <input 
          type="checkbox"
          value="penuh"
          :checked="props.selectedStatus.includes('penuh')"
          @change="handleStatusChange('penuh', $event)"
          >
          <span class="status-icon">●</span>
          <span>Penuh <span class="count">({{ totalTPSPenuh }})</span></span>
        </label>
      </div>

        <div class="legend">
            <h3>Informasi Peta:</h3>
            <div class="legend-item">
              <span class="legend-dot normal"></span>
              <span>Normal (&lt; 50%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot warning"></span>
              <span>Hampir Penuh (50% - 79%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot danger"></span>
              <span>Penuh (≥ 80%)</span>
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
            <div class="stat-number">{{ totalTPS }}</div>
            <div class="stat-label">Total Titik</div>
          </div>
          <div class="stat-item warning">
            <div class="stat-number">{{ totalTPSHampirPenuh }}</div>
            <div class="stat-label">Perlu Perhatian</div>
          </div>
          <div class="stat-item danger">
            <div class="stat-number">{{ totalTPSPenuh }}</div>
            <div class="stat-label">Penuh</div>
          </div>
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
        <button class="btn-lihat-jadwal laporan-btn" @click="$emit('openVolumeSampahStatModal')">
          <span class="material-icons">visibility</span>
          <span>Lihat Statistik Volume Sampah</span>
        </button>
      </div>
    </div>

    <!-- Ranking TPS Card -->
    <div class="card">
      <div class="card-header">
        <span class="material-icons">emoji_events</span>
        <h2>Ranking TPS Terbaik</h2>
      </div>

      <div class="card-body">
        <!-- LOADING -->
        <div v-if="loading" class="loading-state">
          <div
              v-for="n in 2"
              :key="n"
              class="sidebar-ranking-item skeleton"
          >
            <div class="skeleton-line short"></div>
            <div class="skeleton-line tall"></div>
            <div class="skeleton-line xshort"></div>
          </div>
        </div>
        <!-- EMPTY -->
        <div v-else-if="rankingTPS.length === 0" class="empty-text">
          <span class="material-icons">info</span>
          <p>Tidak ada data tersedia</p>
        </div>
        <!-- DATA -->
        <div v-else class="ranking-list">
          <div
            v-for="(item, index) in rankingTPS.slice(0, 3)"
            :key="item.id_tps"
            class="sidebar-ranking-item"
          >
          <div class="sidebar-ranking-medal">
            <span v-if="index===0">🥇</span>
            <span v-else-if="index===1">🥈</span>
            <span v-else-if="index===2">🥉</span>
            <span v-else>{{ index+1 }}.</span>
          </div>

          <div class="sidebar-ranking-info">
            <div class="sidebar-ranking-name">
              {{ item.nama_tps }}
            </div>
            <div class="sidebar-ranking-desa">
              {{ item.nama_dusun }}
            </div>
          </div>

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
      <button class="btn-lihat-jadwal laporan-btn mb-3" @click="$emit('openTimbulanModal')">
        <span class="material-icons">visibility</span>
        <span>Lihat Detail Timbulan</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { fetchTitikTps } from '@/services/wasteService.js'
import api from '@/services/api'
import { useDesaLogo } from '@/services/useDesaLogo'
import { TabSync } from '@/services/tabSync'

const { fetchLogo } = useDesaLogo()
let unsubscribeSync = null
onMounted(fetchLogo)

// Date and Schedule
const currentDate = ref('')
const todaySchedules = ref([])
const jadwalTPS = ref([])

const wastePoints = ref([])
const loading = ref(false)
const error = ref(null)

const totalTPS = ref(0)
const totalTPSPenuh = ref(0)
const totalTPSHampirPenuh = ref(0)
const totalLaporan = ref(0)
const rankingTPS = ref([])
const timbulanPerKapita = ref([])

const emit = defineEmits(['reportOpened', 'openScheduleModal', 'statusChanged', 'openLaporanModal', 'openVolumeSampahStatModal', 'openTimbulanModal'])
const jadwal = ref({
  jam_buang_mulai: '',
  jam_buang_selesai: '',
  jam_ambil_mulai: '',
  jam_ambil_selesai: ''
})

// Receive reportRef and selectedStatus from parent (home.vue)
const props = defineProps({
  reportRef: {
    type: Object,
    default: null
  },
  selectedStatus: {
    type: Array,
    default: () => ['normal', 'hampir_penuh', 'penuh']
  }
})

function formatJam(val) {
  if (!val) return '--:--'
  return String(val).slice(0, 5)
}

function handleStatusChange(status, event) {
  const newStatus = [...props.selectedStatus]
  
  if (event.target.checked) {
    // Add status if checked
    if (!newStatus.includes(status)) {
      newStatus.push(status)
    }
  } else {
    // Remove status if unchecked
    const index = newStatus.indexOf(status)
    if (index > -1) {
      newStatus.splice(index, 1)
    }
  }
  
  // Emit update untuk parent
  emit('update:selectedStatus', newStatus)
}

async function fetchTotalLaporan() {
  try {
    const res = await api.get('/api/lapor')
    totalLaporan.value = res.data.length
  } catch (err) {
    console.error('Gagal ambil total laporan', err)
  }
}

onMounted(() => {
  fetchTotalLaporan()
})

async function fetchTPSByStatus() {
  try {

    const statusQuery = props.selectedStatus.join(',')

    const res = await fetch(`/api/tps/status?status=${statusQuery}`)
    const data = await res.json()

    wastePoints.value = data

    // Emit event untuk memberitahu parent bahwa status telah berubah
    emit('statusChanged')

  } catch (err) {
    console.error('Gagal filter TPS:', err)
  }
}

async function fetchjamOperasional() {
  try {
    const res = await api.get('api/jam-operasional')

    jadwal.value = res.data[0] || {}

  } catch (error) {
    console.error('Gagal ambil jam operasional', error)
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

  } catch (error) {
    console.error("Gagal ambil dashboard:", error)
  }
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

  const schedules = wastePoints.value.filter(point => {
    // Cek apakah jadwal mengandung hari ini
    return point.hari_pengambilan?.includes(todayName)
  }).map(point => {
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

  const uniqueTps = new Set(
    jadwalTPS.value.filter(tps => tps.nama_dusun === desaCode).map(tps => tps.id_tps) 
  )

  return uniqueTps.size
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
  emit('openScheduleModal', desa)
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

    fetchjamOperasional()
  } catch (err) {
    console.error('Gagal ambil data TPS:', err.message)
    wastePoints.value = []
    error.value = err.message
  } finally {
    loading.value = false
  }

  fetchDashboard()

  unsubscribeSync = TabSync.listen((event) => {
    console.log('Sidebar TabSync event:', event)
    if (event === 'tps_updated' || event === 'jadwal_updated') {
      fetchDashboard()
    }
    if (event === 'settings_updated') {
      fetchLogo()
      fetchjamOperasional()
    }
    if (event === 'laporan_updated') {
      fetchTotalLaporan()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeSync) unsubscribeSync()
})

watch(() => props.selectedStatus, () => {
  fetchTPSByStatus()
}, { deep: true })

</script>

<style src="@/assets/styles/home.css"></style>