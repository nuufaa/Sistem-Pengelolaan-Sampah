<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Daftar Pengambilan Sampah</h2>

      <div class="filter-group">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'pengambilan' }"
          @click="activeTab = 'pengambilan'">
          Pengambilan Aktif
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'riwayat' }"
          @click="activeTab = 'riwayat'">
          Riwayat Selesai
        </button>
      </div>
    </div>

    <!-- SEARCH -->
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
    </div>

    <!-- INFO HASIL SEARCH -->
    <div class="filter-result-info">
      <span v-if="searchQuery">
        Menampilkan 
        {{ activeTab === 'pengambilan' ? filteredPengambilan.length : filteredRiwayat.length }} 
        dari 
        {{ activeTab === 'pengambilan' ? pengambilanData.length : riwayatData.length }} data
      </span>

      <span v-else>
        Total 
        {{ activeTab === 'pengambilan' ? pengambilanData.length : riwayatData.length }} data
      </span>

      <span v-if="searchQuery">
        (Pencarian: "{{ searchQuery }}")
      </span>
    </div>

    <!-- ================= TAB 1 ================= -->
    <div v-if="activeTab === 'pengambilan'" class="tab-content">

      <div class="table-container desktop-only">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama TPS</th>
              <th>Jadwal</th>
              <th>Tanggal</th>
              <th>Kendaraan</th>
              <th>Volume</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in paginatedData" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.nama_tps }}</td>
              <td>{{ hariLabel(item.hari_pengambilan) }}</td>
              <td>{{ formatDate(item.tgl_pengambilan) }}</td>
              <td>{{ item.nomor_kendaraan || '-' }}</td>
              <td>{{ item.volume_sampah ?? '-' }}</td>
              <td>
                <span class="status-badge" :class="item.status_angkut">
                  {{ statusText(item.status_angkut) }}
                </span>
              </td>
              <td>
                <button class="btn-update" @click="openModal(item)">
                  Update
                </button>
              </td>
            </tr>

            <!-- EMPTY -->
            <tr v-if="paginatedData.length === 0">
              <td colspan="8" class="empty-state">
                <span class="material-icons">inbox</span>
                <p>
                  {{ searchQuery ? 'Data tidak ditemukan' : 'Tidak ada daftar pengambilan' }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE -->
      <div class="card-list mobile-only">
        <div class="pickup-card" v-for="item in paginatedData" :key="item.id">
          <div class="card-header">
            <div>
              <h3 class="card-title">{{ item.nama_tps }}</h3>
              <p class="card-subtitle">{{ hariLabel(item.hari_pengambilan) }}</p>
            </div>
            <span class="status-badge" :class="item.status_angkut">
              {{ statusText(item.status_angkut) }}
            </span>
          </div>

        <div class="card-body">

            <div class="card-item">
              <span class="label">Tanggal</span>
              <span class="value">{{ formatDate(item.tgl_pengambilan) }}</span>
            </div>

            <div class="card-item">
              <span class="label">Kendaraan</span>
              <span class="value">{{ item.nomor_kendaraan || '-' }}</span>
            </div>

            <div class="card-item">
              <span class="label">Volume</span>
              <span class="value">{{ item.volume_sampah ?? '-' }}</span>
            </div>

          </div>

          <div class="card-footer">
            <button class="btn-update" @click="openModal(item)">
              Update
            </button>
          </div>
        </div>

        <div v-if="filteredPengambilan.length === 0" class="empty-state-card">
          <span class="material-icons">inbox</span>
          <p>{{ searchQuery ? 'Data tidak ditemukan' : 'Tidak ada daftar pengambilan' }}</p>
        </div>
      </div>
    </div>

    <!-- ================= TAB 2 ================= -->
    <div v-if="activeTab === 'riwayat'" class="tab-content">

      <div class="table-container desktop-only">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama TPS</th>
              <th>Jadwal</th>
              <th>Tanggal</th>
              <th>Selesai</th>
              <th>Kendaraan</th>
              <th>Volume</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in paginatedData" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.nama_tps }}</td>
              <td>{{ hariLabel(item.hari_pengambilan) }}</td>
              <td>{{ formatDate(item.tgl_pengambilan) }}</td>
              <td>{{ formatDate(item.tgl_terakhir_diambil) }}</td>
              <td>{{ item.nomor_kendaraan || '-' }}</td>
              <td>{{ item.volume_sampah ?? '-' }}</td>
            </tr>

            <!-- EMPTY -->
            <tr v-if="paginatedData.length === 0">
              <td colspan="7" class="empty-state">
                <span class="material-icons">inbox</span>
                <p>
                  {{ searchQuery ? 'Data tidak ditemukan' : 'Belum ada riwayat pengambilan' }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE -->
      <div class="card-list mobile-only">
          <div class="pickup-card" v-for="item in paginatedData" :key="item.id">

            <div class="card-header">
              <div>
                <h3 class="card-title">{{ item.nama_tps }}</h3>
                <p class="card-subtitle">{{ hariLabel(item.hari_pengambilan) }}</p>
              </div>

              <span class="status-badge selesai">
                Selesai
              </span>
            </div>

            <div class="card-body">

              <div class="card-item">
                <span class="label">Tanggal</span>
                <span class="value">{{ formatDate(item.tgl_pengambilan) }}</span>
              </div>

              <div class="card-item">
                <span class="label">Selesai</span>
                <span class="value">{{ formatDate(item.tgl_terakhir_diambil) }}</span>
              </div>

              <div class="card-item">
                <span class="label">Kendaraan</span>
                <span class="value">{{ item.nomor_kendaraan || '-' }}</span>
              </div>

              <div class="card-item">
                <span class="label">Volume</span>
                <span class="value">{{ item.volume_sampah ?? '-' }}</span>
              </div>
            </div>
          </div>

        <div v-if="filteredRiwayat.length === 0" class="empty-state-card">
          <span class="material-icons">inbox</span>
          <p>{{ searchQuery ? 'Data tidak ditemukan' : 'Belum ada riwayat pengambilan' }}</p>
        </div>
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

    <UpdatePengambilanModal
      :show="showModal"
      :data="selectedItem"
      :kendaraanList="kendaraanList"
      @close="showModal = false"
      @save="handleSave"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch} from 'vue'
import api from '@/services/api'
import UpdatePengambilanModal from '@/components/updateStatusModal.vue'

const activeTab = ref('pengambilan')
const showModal = ref(false)
const selectedItem = ref(null)

const pengambilanData = ref([])
const riwayatData = ref([])
const kendaraanList = ref([])

const currentPage = ref(1)
const itemsPerPage = ref(5)

const searchQuery = ref('')

/* ================= FILTER ================= */
const filteredPengambilan = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  if (!q) return pengambilanData.value

  return pengambilanData.value.filter(i => {
    const nama = i.nama_tps?.toLowerCase() || ''
    const hari = hariLabel(i.hari_pengambilan)?.toLowerCase() || ''
    const tanggal = formatDate(i.tgl_pengambilan)?.toLowerCase() || ''
    const kendaraan = (i.nomor_kendaraan || '').toLowerCase()
    const volume = String(i.volume_sampah || '')
    const status = statusText(i.status_angkut)?.toLowerCase() || ''

    return (
      nama.includes(q) ||
      hari.includes(q) ||
      tanggal.includes(q) ||
      kendaraan.includes(q) ||
      volume.includes(q) ||
      status.includes(q)
    )
  })
})

const filteredRiwayat = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  if (!q) return riwayatData.value

  return riwayatData.value.filter(i => {
    const nama = i.nama_tps?.toLowerCase() || ''
    const hari = hariLabel(i.hari_pengambilan)?.toLowerCase() || ''
    const tanggal = formatDate(i.tgl_pengambilan)?.toLowerCase() || ''
    const selesai = formatDate(i.tgl_terakhir_diambil)?.toLowerCase() || ''
    const kendaraan = (i.nomor_kendaraan || '').toLowerCase() 
    const volume = String(i.volume_sampah || '') 

    return (
      nama.includes(q) ||
      hari.includes(q) ||
      tanggal.includes(q) ||
      selesai.includes(q) ||
      kendaraan.includes(q) || 
      volume.includes(q)     
    )
  })
})

const totalPages = computed(() => {
  const data = activeTab.value === 'pengambilan'
    ? filteredPengambilan.value
    : filteredRiwayat.value

  return Math.ceil(data.length / itemsPerPage.value) || 1
})

const paginatedData = computed(() => {
  const data = activeTab.value === 'pengambilan'
    ? filteredPengambilan.value
    : filteredRiwayat.value

  const start = (currentPage.value - 1) * itemsPerPage.value
  return data.slice(start, start + itemsPerPage.value)
})

watch([searchQuery, activeTab, itemsPerPage], () => {
  currentPage.value = 1
})

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

/* ================= FETCH ================= */
async function fetchPengambilan() {
  await api.post('/api/daftar-tugas/generate')
  const res = await api.get('/api/daftar-tugas')
  pengambilanData.value = res.data
}

async function fetchRiwayat() {
  const res = await api.get('/api/daftar-tugas/history/completed')
  riwayatData.value = res.data
}

async function fetchKendaraan() {
  const res = await api.get('/api/kendaraan')
  kendaraanList.value = res.data
}

onMounted(() => {
  fetchPengambilan()
  fetchRiwayat()
  fetchKendaraan()
})

/* ================= HELPER ================= */
function hariLabel(hariStr) {
  if (!hariStr) return '-'
  
  // Jika backend sudah mengirimkan teks hari (mengandung huruf), gunakan langsung
  if (/[a-zA-Z]/.test(hariStr)) return hariStr
  
  const labels = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
  return hariStr.split(',').map(h => {
    const idx = parseInt(h.trim())
    return labels[idx] || h
  }).join(', ')
}

function formatDate(date) {
  if (!date) return '-'
  if (date.includes('T')) {
    const d = new Date(date)
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
  }
  return date
}

function statusText(status) {
  return {
    belum_diangkut: 'Belum Mulai',
    selesai: 'Selesai'
  }[status]
}

function openModal(item) {
  selectedItem.value = item
  showModal.value = true
}

async function handleSave(payload) {
  await api.put(`/api/daftar-tugas/${selectedItem.value.id}/status`, payload)
  showModal.value = false
  fetchPengambilan()
  fetchRiwayat()
}
</script>

<style scoped src="@/assets/styles/petugas.css"></style>
