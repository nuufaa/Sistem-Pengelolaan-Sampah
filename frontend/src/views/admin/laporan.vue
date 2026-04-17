<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Riwayat Pelaporan Masyarakat</h2>
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
        <select v-model="filterKondisi" class="filter-select">
          <option value="">Semua Kondisi</option>
          <option value="hampir_penuh">Hampir Penuh</option>
          <option value="penuh">Sudah Penuh</option>
          <option value="sampah_berserakan">Sampah Berserakan</option>
        </select>

        <!-- DATE INPUTS -->
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

        <button
          v-if="searchQuery || filterKondisi || filterTanggalDari || filterTanggalSampai"
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
      <!-- jumlah data -->
      <span v-if="searchQuery || filterKondisi || filterTanggalDari || filterTanggalSampai">
        Menampilkan {{ filteredLaporan.length }} dari {{ laporanList.length }} laporan
      </span>
      <span v-else>
        Total {{ laporanList.length }} laporan
      </span>

      <!-- keterangan search -->
      <span v-if="searchQuery">
        (Pencarian: "{{ searchQuery }}")
      </span>

      <!-- keterangan kondisi -->
      <span v-if="filterKondisi">
        (Kondisi: {{ kondisiText(filterKondisi) }})
      </span>

      <!-- keterangan tanggal -->
      <span v-if="filterTanggalDari || filterTanggalSampai">
        (Tanggal: {{ filterTanggalDari || '...' }} - {{ filterTanggalSampai || '...' }})
      </span>
    </div>

    <!-- TABLE DESKTOP -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>TPS</th>
            <th>Kondisi</th>
            <th>Pelapor</th>
            <th>Tanggal & Waktu</th>
            <th>Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(laporan, i) in paginatedLaporan" :key="laporan.id_laporan">
            <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ laporan.nama_tps }}</td>
            <td>{{ kondisiText(laporan.kondisi_tps) }}</td>
            <td>{{ laporan.nama_pelapor}}</td>
            <td>{{ formatDate(laporan.tgl_laporan) }}</td>
            <td>{{ laporan.deskripsi || '-' }}</td>
            <td class="action-buttons">
              <button class="btn-action" @click="openDetail(laporan)">
                <span class="material-icons">visibility</span>
              </button>
            </td>
          </tr>
        </tbody>

        <tr v-if="paginatedLaporan.length === 0">
          <td colspan="7" class="empty-state">
            <span class="material-icons">inbox</span>
            <p>Data tidak ditemukan</p>
          </td>
        </tr>

      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="card-list mobile-only">
      <div
        v-for="laporan in paginatedLaporan"
        :key="laporan.id_laporan"
        class="data-card"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ laporan.nama_tps}}
            </div>
          </div>
        </div>

        <div class="data-card-body">
          <div class="data-card-item">
            <span class="data-card-label">Kondisi:</span>
            <span class="data-card-value">
              {{ kondisiText(laporan.kondisi_tps) }}
            </span>
          </div>
          <div class="data-card-item">
            <span class="data-card-label">Pelapor:</span>
            <span class="data-card-value">{{ laporan.nama_pelapor}}</span>
          </div>
          <div class="data-card-item">
            <span class="data-card-label">Tanggal & Waktu:</span>
            <span class="data-card-value">{{ formatDate(laporan.tgl_laporan) }}</span>
          </div>
          <div class="data-card-item">
            <span class="data-card-label">Keterangan:</span>
            <span class="data-card-value">{{ laporan.deskripsi || '-' }}</span>
          </div>
        </div>

        <div class="data-card-footer">
          <button class="btn-card-action" @click="openDetail(laporan)">
            <span class="material-icons">visibility</span>
            <span>Lihat Detail</span>
          </button>
        </div>
      </div>

      <div v-if="paginatedLaporan.length === 0" class="empty-state-card">
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
    <LaporanDetailModal
      v-if="showModal"
      :laporan="selected"
      :tps="tpsDetail"
      @close="showModal = false"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api.js'
import LaporanDetailModal from '@/components/laporanModalAdmin.vue'

const laporanList = ref([])
const showModal = ref(false)
const selected = ref(null)

const currentPage = ref(1)
const itemsPerPage = ref(5)

const searchQuery = ref('')
const filterKondisi = ref('')
const filterTanggalDari = ref('')
const filterTanggalSampai = ref('')

const filteredLaporan = computed(() => {
  return laporanList.value.filter(laporan => {
    const q = searchQuery.value.toLowerCase()

    // format tanggal biar bisa dicari
    const formattedDate = laporan.tgl_laporan
      ? formatDate(laporan.tgl_laporan).toLowerCase()
      : ''

    // ubah kondisi jadi text biar bisa dicari
    const kondisi = kondisiText(laporan.kondisi_tps).toLowerCase()

    const matchSearch = !q ||
      laporan.nama_tps.toLowerCase().includes(q) ||
      laporan.nama_pelapor.toLowerCase().includes(q) ||
      kondisi.includes(q) ||
      formattedDate.includes(q) ||
      (laporan.deskripsi || '').toLowerCase().includes(q)

    const matchKondisi = !filterKondisi.value ||
      laporan.kondisi_tps === filterKondisi.value

    const tglLaporan = laporan.tgl_laporan
      ? new Date(new Date(laporan.tgl_laporan).toDateString())
      : null

    const matchDari = !filterTanggalDari.value || (
      tglLaporan && tglLaporan >= new Date(filterTanggalDari.value)
    )

    const matchSampai = !filterTanggalSampai.value || (
      tglLaporan && tglLaporan <= new Date(filterTanggalSampai.value)
    )

    return matchSearch && matchKondisi && matchDari && matchSampai
  })
})

// COMPUTED: Pagination Logic
const totalPages = computed(() => {
  return Math.ceil(filteredLaporan.value.length / itemsPerPage.value)
})

const paginatedLaporan = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLaporan.value.slice(start, end)
})

// Reset halaman saat filter berubah
watch([searchQuery, filterKondisi, filterTanggalDari, filterTanggalSampai], () => {
  currentPage.value = 1
})

function resetFilter() {
  searchQuery.value = ''
  filterKondisi.value = ''
  filterTanggalDari.value = ''
  filterTanggalSampai.value = ''
  currentPage.value = 1
}

const tpsDetail = computed(() =>
  selected.value ?(selected.value.id_tps) : null
)

async function fetchLaporan() {
  try {
    const res = await api.get('/api/lapor')
    laporanList.value = res.data
  } catch (err) {
    console.error('Gagal ambil laporan', err)
  }
}

onMounted(async () => {
  fetchLaporan()
})

function kondisiText(kondisi) {
  return {
    hampir_penuh: 'Hampir Penuh',
    penuh: 'Sudah Penuh',
    sampah_berserakan: 'Sampah Berserakan'
  }[kondisi] || kondisi
}

function openDetail(laporan) {
  selected.value = laporan
  showModal.value = true
}

function formatDate(date) {
  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
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