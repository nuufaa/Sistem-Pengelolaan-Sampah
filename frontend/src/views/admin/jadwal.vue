<template>
  <section class="content-section active">
    <!-- Header -->
    <div class="section-header">
      <h2>Kelola Jadwal Pengambilan</h2>
      <button class="btn-primary" @click="openAdd">
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
          placeholder="Cari nama TPS atau petugas..."
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="filter-group">
        <select v-model="filterTPS" class="filter-select">
          <option value="">Semua TPS</option>
          <option v-for="t in tpsList" :key="t.id_tps" :value="t.id_tps">
            {{ t.nama_tps }}
          </option>
        </select>

        <select v-model="filterPetugas" class="filter-select">
          <option value="">Semua Petugas</option>
          <option v-for="p in petugasList" :key="p.id_petugas" :value="p.id_petugas">
            {{ p.nama }}
          </option>
        </select>

        <select v-model="filterHari" class="filter-select">
          <option value="">Semua Hari</option>
          <option value="0">Minggu</option>
          <option value="1">Senin</option>
          <option value="2">Selasa</option>
          <option value="3">Rabu</option>
          <option value="4">Kamis</option>
          <option value="5">Jumat</option>
          <option value="6">Sabtu</option>
        </select>

        <button
          v-if="searchQuery || filterTPS || filterPetugas || filterHari !== ''"
          class="btn-reset"
          @click="resetFilter"
        >
          <span class="material-icons">filter_alt_off</span>
          Reset
        </button>
      </div>
    </div>

    <!-- INFO HASIL FILTER -->
    <div class="filter-result-info" v-if="searchQuery || filterTPS || filterPetugas || filterHari !== ''">
      Menampilkan {{ filteredJadwal.length }} dari {{ jadwalList.length }} data
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
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(j, i) in paginatedJadwal" :key="j.id_jadwal">
            <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ j.nama_tps }}</td>
            <td>{{ j.nama}}</td>
            <td>Setiap {{ j.hari_label }}</td>
            <td>{{ formatDate(j.tgl_terakhir_diambil) }}</td>
            <td class="action-buttons">
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
        <div class="data-card-footer">
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
import { ref, onMounted, computed, watch, onActivated } from 'vue'
import api from '@/services/api'
import JadwalModal from '@/components/jadwalModal.vue'
import { toIndex } from '@/services/hariJadwal'

const jadwalList = ref([])
const tpsList = ref([])
const showModal = ref(false)
const form = ref(null)
const petugasList = ref([])
const usedDays = ref([])

const currentPage = ref(1)
const itemsPerPage = ref(5)

const searchQuery = ref('')
const filterTPS = ref('')
const filterPetugas = ref('')
const filterHari = ref('')

// COMPUTED: Filter Logic
const filteredJadwal = computed(() => {
  return jadwalList.value.filter(j => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = !q ||
      j.nama_tps.toLowerCase().includes(q) ||
      j.nama.toLowerCase().includes(q)

    const matchTPS = !filterTPS.value || j.id_tps == filterTPS.value

    const matchPetugas = !filterPetugas.value || j.id_petugas == filterPetugas.value

    // hari_pengambilan bisa array atau string, cek keduanya
    const matchHari = filterHari.value === '' || (() => {
      const hariVal = Number(filterHari.value)
      if (Array.isArray(j.hari_pengambilan)) {
        return j.hari_pengambilan.map(Number).includes(hariVal)
      }
      return Number(j.hari_pengambilan) === hariVal
    })()

    return matchSearch && matchTPS && matchPetugas && matchHari
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

// Gabungkan watch yang sudah ada dengan watch filter baru
watch([searchQuery, filterTPS, filterPetugas, filterHari], () => {
  currentPage.value = 1
})

function resetFilter() {
  searchQuery.value = ''
  filterTPS.value = ''
  filterPetugas.value = ''
  filterHari.value = ''
  currentPage.value = 1
}

async function fetchJadwal() {
  const res = await api.get('/api/jadwal')
  jadwalList.value = res.data
}

async function fetchTPS() {
  const res = await api.get('/api/tps')
  tpsList.value = res.data
}

async function fetchPetugas() {
  const res = await api.get('/api/petugas')
  petugasList.value = res.data
}

async function fetchUsedDays(id_tps, excludeDays = []) {
  try {
    if (!id_tps) {
      usedDays.value = []
      return
    }
    const res = await api.get(`/api/jadwal/used-days/${id_tps}`)
    // Filter out days that are currently being edited
    usedDays.value = (res.data.usedDays || []).filter(day => !excludeDays.includes(day))
  } catch (error) {
    console.error('Error fetching used days:', error)
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
})

onActivated(() => {
  fetchJadwal()
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
    
    await fetchJadwal()
  } catch (error) {
    console.error(error.response?.data || error)
    alert(error.response?.data?.message || 'Gagal menyimpan jadwal')
  }
}

async function remove(id) {
  if (confirm('Hapus jadwal ini?')) {
    await api.delete(`/api/jadwal/${id}`)
    await fetchJadwal()
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