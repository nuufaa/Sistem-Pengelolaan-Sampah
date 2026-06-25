<template>
  <section class="content-section active">
    <!-- Header -->
    <div class="section-header">
      <h2>Data Jadwal Pengambilan</h2>
      <button v-if="userRole === 'admin'" class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Jadwal
      </button>
    </div>

    <!-- SEARCH & FILTER BAR -->
    <div class="filter-bar">
      <div class="search-wrapper">
        <span class="material-icons search-icon">search</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Cari"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="filter-group">
        <div class="date-field">
          <label class="date-label">Dari</label>
          <div class="date-input-wrapper">
            <span class="material-icons date-icon">calendar_today</span>
            <input
              v-model="filterTanggalDari"
              type="date"
              class="filter-date"
              :max="filterTanggalSampai || undefined"
            />
          </div>
        </div>

        <div class="date-field">
          <label class="date-label">Sampai</label>
          <div class="date-input-wrapper">
            <span class="material-icons date-icon">calendar_today</span>
            <input
              v-model="filterTanggalSampai"
              type="date"
              class="filter-date"
              :min="filterTanggalDari || undefined"
            />
          </div>
        </div>

        <select v-model="filterPetugas" class="filter-select">
          <option value="">Semua Petugas</option>
          <option v-for="p in petugasList" :key="p.id_petugas" :value="p.id_petugas">
            {{ p.nama }}
          </option>
        </select>

        <select v-model="filterHari" class="filter-select">
          <option value="">Semua Hari</option>
          <option value="0">Senin</option>
          <option value="1">Selasa</option>
          <option value="2">Rabu</option>
          <option value="3">Kamis</option>
          <option value="4">Jumat</option>
          <option value="5">Sabtu</option>
          <option value="7">Minggu</option>
        </select>

        <button
          v-if="searchQuery || filterPetugas || filterHari !== '' || filterTanggalDari || filterTanggalSampai"
          class="btn-reset"
          @click="resetFilter"
        >
          <span class="material-icons">filter_alt_off</span>
          Reset
        </button>
      </div>
    </div>

    <!-- INFO HASIL FILTER -->
    <div class="filter-result-info">
      <span v-if="searchQuery || filterPetugas || filterHari || filterTanggalDari || filterTanggalSampai">
        Menampilkan {{ filteredJadwal.length }} dari {{ jadwalList.length }} data
      </span>
      <span v-else>
        Total {{ jadwalList.length }} data
      </span>

      <!-- INFO SEARCH -->
      <span v-if="searchQuery">
        (Pencarian: "{{ searchQuery }}")
      </span>

      <!-- INFO HARI -->
      <span v-if="filterHari !== ''">
        (Hari: {{ ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu', 'Minggu'][Number(filterHari)] }})
      </span>

      <!-- INFO TANGGAL -->
      <span v-if="filterTanggalDari || filterTanggalSampai">
        (Tanggal: {{ filterTanggalDari || '...' }} - {{ filterTanggalSampai || '...' }})
      </span>

      <!-- INFO PETUGAS -->
      <span v-if="filterPetugas">
        (Petugas dipilih)
      </span>
    </div>

    <!-- Desktop Table -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>TPS</th>
            <th>Petugas</th>
            <th>Hari Pengambilan</th>
            <th>Terakhir Diambil</th>
            <th v-if="userRole === 'admin'">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(j, i) in paginatedJadwal" :key="j.id_jadwal">
            <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ j.nama_tps }}</td>
            <td>{{ j.nama}}</td>
            <td>Setiap {{ j.hari_label }}</td>
            <td>{{ formatDate(j.tgl_terakhir_diambil) }}</td>
            <td v-if="userRole === 'admin'" class="action-buttons">
              <button class="btn-action edit" @click="openEdit(j)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(j.id_jadwal)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>

        <tr v-if="paginatedJadwal.length === 0">
          <td colspan="6" class="empty-state">
            <span class="material-icons">inbox</span>
            <p>Data tidak ditemukan</p>
          </td>
        </tr>

      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="card-list mobile-only">
      <div 
        class="data-card" 
        v-for="(j) in paginatedJadwal" 
        :key="j.id_jadwal"
      >
        <!-- HEADER -->
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ j.nama_tps }}
            </div>
            <div class="data-card-subtitle">
              {{ j.nama }}
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="data-card-body">
          <div class="data-card-item">
            <span class="data-card-label">Hari</span>
            <span class="data-card-value">
              Setiap {{ j.hari_label }}
            </span>
          </div>

          <div class="data-card-item">
            <span class="data-card-label">Terakhir Diambil</span>
            <span class="data-card-value">
              {{ formatDate(j.tgl_terakhir_diambil) }}
            </span>
          </div>
        </div>

        <!-- FOOTER -->
        <div v-if="userRole === 'admin'" class="data-card-footer">
          <button class="btn-card-action edit" @click="openEdit(j)">
            <span class="material-icons">edit</span>
            Edit
          </button>

          <button class="btn-card-action delete" @click="remove(j.id_jadwal)">
            <span class="material-icons">delete</span>
            Hapus
          </button>
        </div>
      </div>

      <div v-if="paginatedJadwal.length === 0" class="empty-state-card">
        <span class="material-icons">inbox</span>
        <p>Data tidak ditemukan</p>
      </div>

    </div>

    <!-- PAGINATION -->
    <div class="pagination-container" v-if="totalPages > 1">
      <button 
        class="pagination-btn" 
        @click="previousPage"
        :disabled="currentPage === 1"
      >
        <span class="material-icons">chevron_left</span>
        Sebelumnya
      </button>

      <div class="pagination-info">
        <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <select v-model.number="itemsPerPage" class="items-per-page">
          <option :value="5">5 per halaman</option>
          <option :value="10">10 per halaman</option>
        </select>
      </div>

      <button 
        class="pagination-btn" 
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >
        Selanjutnya
        <span class="material-icons">chevron_right</span>
      </button>
    </div>

    <!-- MODAL COMPONENT -->
    <JadwalModal
      v-if="showModal"
      :model-value="form"
      :tps-list="tpsList"
      :petugas-list="petugasList"
      :used-days="usedDays"
      @save="save"
      @close="showModal = false"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import api from '@/services/api'
import JadwalModal from '@/components/jadwalModal.vue'
import { toIndex } from '@/services/hariJadwal'
import { TabSync } from '@/services/tabSync'

const jadwalList = ref([])
const tpsList = ref([])
const showModal = ref(false)
const form = ref(null)
const petugasList = ref([])
const usedDays = ref([])
const abortController = ref(null)
let unsubscribeSync = null
const userRole = computed(() => sessionStorage.getItem('role') || 'kadus')

const currentPage = ref(1)
const itemsPerPage = ref(5)

const searchQuery = ref('')
// const filterTPS = ref('')
const filterPetugas = ref('')
const filterHari = ref('')
const filterTanggalDari = ref('')
const filterTanggalSampai = ref('')
const filteredJadwal = computed(() => {
  return jadwalList.value.filter(j => {
    const q = searchQuery.value.toLowerCase()

    // SAFE DATE (tanpa ISO biar ga geser)
    const tgl = j.tgl_terakhir_diambil
      ? new Date(j.tgl_terakhir_diambil)
      : null

    const tglDari = filterTanggalDari.value
      ? new Date(filterTanggalDari.value)
      : null

    const tglSampai = filterTanggalSampai.value
      ? new Date(filterTanggalSampai.value)
      : null

    // GLOBAL SEARCH
    const matchSearch =
      !q ||
      Object.values(j).some(val =>
        String(val ?? '').toLowerCase().includes(q)
      ) ||
      formatDate(j.tgl_terakhir_diambil).toLowerCase().includes(q)

    // FILTER PETUGAS
    const matchPetugas =
      !filterPetugas.value || j.id_petugas == filterPetugas.value

    // FIX HARI (PASTIIN NUMBER)
    const matchHari =
      filterHari.value === '' ||
      (Array.isArray(j.hari_pengambilan)
        ? j.hari_pengambilan.map(Number).includes(Number(filterHari.value))
        : Number(j.hari_pengambilan) === Number(filterHari.value))

    // FILTER TANGGAL (REAL DATE COMPARISON)
    const matchDate =
      (!tglDari || (tgl && tgl >= tglDari)) &&
      (!tglSampai || (tgl && tgl <= tglSampai))

    return matchSearch && matchPetugas && matchHari && matchDate
  })
})

// COMPUTED: Pagination Logic
const totalPages = computed(() => {
  return Math.ceil(filteredJadwal.value.length / itemsPerPage.value)
})

const paginatedJadwal = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredJadwal.value.slice(start, end)
})

watch([searchQuery, filterPetugas, filterHari, filterTanggalDari, filterTanggalSampai], () => {
  currentPage.value = 1
})

function resetFilter() {
  searchQuery.value = ''
  filterPetugas.value = ''
  filterHari.value = ''
  filterTanggalDari.value = ''
  filterTanggalSampai.value = ''
  currentPage.value = 1
}

async function fetchJadwal() {
  try {
    if (abortController.value) {
      abortController.value.abort()
    }
    abortController.value = new AbortController()
    
    const res = await api.get('/api/jadwal', {
      signal: abortController.value.signal
    })
    jadwalList.value = res.data
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('Gagal fetch jadwal:', error)
    }
  }
}

async function fetchTPS() {
  try {
    const res = await api.get('/api/tps')
    tpsList.value = res.data
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('Gagal fetch TPS:', error)
    }
  }
}

async function fetchPetugas() {
  try {
    const res = await api.get('/api/petugas')
    petugasList.value = res.data
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('Gagal fetch petugas:', error)
    }
  }
}

async function fetchUsedDays(id_tps, excludeDays = []) {
  try {
    if (!id_tps) {
      usedDays.value = []
      return
    }
    const res = await api.get(`/api/jadwal/used-days/${id_tps}`)

    usedDays.value = (res.data.usedDays || []).filter(day => !excludeDays.includes(day))
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('Error fetching used days:', error)
    }
    usedDays.value = []
  }
}

// WATCH: Fetch used days ketika id_tps berubah
watch(
  () => form.value?.id_tps,
  (newId_tps) => {
    if (showModal.value) {
      // Exclude current schedule's days when fetching used days
      const currentDays = form.value?.hari_pengambilan || []
      fetchUsedDays(newId_tps, currentDays)
    }
  }
)

onMounted(() => {
  fetchPetugas()
  fetchJadwal()
  fetchTPS()

  unsubscribeSync = TabSync.listen((event) => {
    if (event === 'jadwal_updated' || event === 'tps_updated' || event === 'petugas_updated') {
      fetchJadwal()
      if (event === 'tps_updated') fetchTPS()
      if (event === 'petugas_updated') fetchPetugas()
    }
  })
})

onBeforeUnmount(() => {
  if (abortController.value) {
    abortController.value.abort()
  }
  if (unsubscribeSync) unsubscribeSync()
})

function openAdd() {
  form.value = {
    id_jadwal: '',
    id_tps: '',
    id_petugas: '',
    hari_pengambilan: '',
    tgl_terakhir_diambil: null
  }
  usedDays.value = []
  showModal.value = true
}

function openEdit(jadwal) {
  const hariPengambilan = typeof jadwal.hari_pengambilan === 'string'
    ? toIndex(jadwal.hari_pengambilan)
    : jadwal.hari_pengambilan
    
  form.value = {
    ...jadwal,
    hari_pengambilan: hariPengambilan
  }
  
  // Fetch used days untuk TPS yang di-edit, excluding current schedule's days
  fetchUsedDays(jadwal.id_tps, hariPengambilan)
  
  showModal.value = true
}

async function save(data) {
  try {
    const payload = {
      id_tps: data.id_tps,
      id_petugas: data.id_petugas,
      hari_pengambilan: Array.isArray(data.hari_pengambilan)
        ? data.hari_pengambilan.map(Number)
        : [],
      id_admin: data.id_admin
    }

    // kirim tgl_terakhir_diambil HANYA kalau ada
    if (data.tgl_terakhir_diambil) {
      payload.tgl_terakhir_diambil = data.tgl_terakhir_diambil
    }

    if (data.id_jadwal && data.id_jadwal.length) {
      await api.put(`/api/jadwal/${data.id_tps}`, payload);
    } else {
      await api.post('/api/jadwal', payload);
    }
    showModal.value = false
    usedDays.value = []
    
    TabSync.emit('jadwal_updated')
    await fetchJadwal()
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error(error.response?.data || error)
      alert(error.response?.data?.message || 'Gagal menyimpan jadwal')
    }
  }
}

async function remove(id) {
  if (confirm('Hapus jadwal ini?')) {
    try {
      await api.delete(`/api/jadwal/${id}`)
      TabSync.emit('jadwal_updated')
      await fetchJadwal()
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Gagal hapus jadwal:', error)
      }
    }
  }
}

function formatDate(date) {
  if (!date) return 'Belum pernah diambil'

  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>