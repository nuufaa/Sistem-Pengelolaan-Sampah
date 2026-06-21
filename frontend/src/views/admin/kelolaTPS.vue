<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Data Titik Pengambilan Sampah (TPS)</h2>
      <button v-if="userRole === 'admin'" class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah TPS
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
        <select v-model="filterStatus" class="filter-select">
          <option value="">Semua Status</option>
          <option value="normal">Normal</option>
          <option value="hampir_penuh">Hampir Penuh</option>
          <option value="penuh">Penuh</option>
        </select>

        <button
          v-if="searchQuery || filterStatus"
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
      <span v-if="searchQuery || filterStatus">
        Menampilkan {{ filteredTPS.length }} dari {{ tpsList.length }} data

        <template v-if="searchQuery">
          | Pencarian: "<b>{{ searchQuery }}</b>"
        </template>

        <template v-if="filterStatus">
          | Status: <b>{{ statusText(filterStatus) }}</b>
        </template>
      </span>

      <span v-else>
        Total {{ tpsList.length }} data
      </span>
    </div>

    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama TPS</th>
            <th>Alamat</th>
            <th>Dusun</th>
            <th>Lokasi</th>
            <th>Kapasitas TPS (Kg)</th>
            <th>Status TPS</th>
            <th v-if="userRole === 'admin'">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(tps, i) in paginatedTPS" :key="tps.id_tps">
            <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ tps.nama_tps }}</td>
            <td>{{ tps.alamat }}</td>
            <td>{{ tps.nama_dusun }}</td>
            <td>{{ tps.latitude }}, {{ tps.longitude }}</td>
            <td>{{ tps.kapasitas }} kg</td>
            <td>
              <span class="status-badge" :class="tps.status_tps">
                {{ statusText(tps.status_tps) }}
              </span>
            </td>
            <td v-if="userRole === 'admin'" class="action-buttons">
              <button class="btn-action edit" @click="openEdit(tps)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(tps.id_tps)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>

          <tr v-if="paginatedTPS.length === 0">
            <td colspan="8" class="empty-state">
              <span class="material-icons">inbox</span>
              <p>Data tidak ditemukan</p>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="card-list mobile-only">
      <div 
        class="data-card" 
        v-for="(tps) in paginatedTPS" 
        :key="tps.id_tps"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ tps.nama_tps }}
            </div>
            <div class="data-card-subtitle">
              {{ tps.alamat }}
            </div>
          </div>

          <span class="status-badge" :class="tps.status_tps">
            {{ statusText(tps.status_tps) }}
          </span>
        </div>

        <div class="data-card-body">
          <div class="data-card-item">
            <span class="data-card-label">Dusun</span>
            <span class="data-card-value">{{ tps.nama_dusun }}</span>
          </div>
          <div class="data-card-item">
            <span class="data-card-label">Kapasitas</span>
            <span class="data-card-value">{{ tps.kapasitas }} kg</span>
          </div>
        </div>

        <div v-if="userRole === 'admin'" class="data-card-footer">
          <button class="btn-card-action edit" @click="openEdit(tps)">
            <span class="material-icons">edit</span>
            Edit
          </button>

          <button class="btn-card-action delete" @click="remove(tps.id_tps)">
            <span class="material-icons">delete</span>
            Hapus
          </button>
        </div>
      </div>

        <div v-if="paginatedTPS.length === 0" class="empty-state-card">
          <span class="material-icons">inbox</span>
          <div class="filter-result-info">
            Data tidak ditemukan
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

    <!-- MODAL - Conditionally Rendered -->
    <TPSModal
      v-if="showModal"
      :tps="selectedTPS"
      :dusunList="dusunList"
      @close="closeModal"
      @save="saveTPS"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { apiFetch } from '../../services/api'
import TPSModal from '@/components/TPSModal.vue'
import { TabSync } from '@/services/tabSync'

const showModal = ref(false)
const selectedTPS = ref(null)
const dusunList = ref([])
const tpsList = ref([])
let unsubscribeSync = null

const userRole = computed(() => sessionStorage.getItem('role') || 'kadus')

const currentPage = ref(1)
const itemsPerPage = ref(5)

const searchQuery = ref('')
const filterStatus = ref('')

const filteredTPS = computed(() => {
  return tpsList.value.filter(tps => {
    const q = searchQuery.value.toLowerCase()

    // GLOBAL SEARCH
    const matchSearch = !q || Object.values(tps).some(val =>
      val && String(val).toLowerCase().includes(q)
    )

    // FILTER STATUS tetap ada
    const matchStatus = !filterStatus.value || tps.status_tps === filterStatus.value

    return matchSearch && matchStatus
  })
})

// Update paginatedTPS agar pakai filteredTPS
const totalPages = computed(() => {
  return Math.ceil(filteredTPS.value.length / itemsPerPage.value)
})

const paginatedTPS = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTPS.value.slice(start, end)
})

function resetFilter() {
  searchQuery.value = ''
  // filterDusun.value = ''
  filterStatus.value = ''
  currentPage.value = 1
}

watch([searchQuery, filterStatus], () => {
  currentPage.value = 1
})

async function fetchTPS() {
  try {
    const data = await apiFetch("/api/tps")
    tpsList.value = data
    // Reset ke halaman 1 saat fetch ulang
    currentPage.value = 1
  } catch (err) {
    console.error("Gagal ambil TPS:", err.message)
  }
}

async function fetchDusun() {
  try {
    dusunList.value = await apiFetch("/api/dusun")
  } catch (err) {
    console.error("Gagal ambil dusun:", err.message)
  }
}

onMounted(async () => {
  fetchTPS()
  fetchDusun()

  unsubscribeSync = TabSync.listen((event) => {
    if (event === 'tps_updated' || event === 'dusun_updated') {
      fetchTPS()
      if (event === 'dusun_updated') fetchDusun()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeSync) unsubscribeSync()
})

function openAdd() {
  selectedTPS.value = null
  showModal.value = true
}

function openEdit(tps) {
  selectedTPS.value = { ...tps }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function saveTPS(data) {
  try {
    const formData = new FormData()

    formData.append("nama_tps", data.nama_tps)
    formData.append("alamat", data.alamat)
    formData.append("id_dusun", data.id_dusun)
    formData.append("latitude", data.latitude)
    formData.append("longitude", data.longitude)
    formData.append("kapasitas", data.kapasitas)
    formData.append("status_tps", data.status_tps)

    if (data.foto_tps instanceof File) {
      formData.append("foto_tps", data.foto_tps)
    }

    if (data.id_tps) {
      await apiFetch(`/api/tps/${data.id_tps}`, {
        method: 'PUT',
        body: formData,
        auth: true
      })
    } else {
      await apiFetch("/api/tps", {
        method: 'POST',
        body: formData,
        auth: true
      })
    }

    TabSync.emit('tps_updated')
    fetchTPS()
    closeModal()

  } catch (err) {
    console.error("Gagal simpan:", err)
  }
}

async function remove(id) {
  if (!confirm('Hapus TPS ini?')) return

  try {
    const data = await apiFetch(`/api/tps/${id}`, {
      method: 'DELETE',
      auth: true
    })
    alert(data.message)
    TabSync.emit('tps_updated')
    fetchTPS()
  } catch (err) {
    alert(err?.message || 'Gagal hapus lapangan')
  }
}

function statusText(status) {
  return {
    normal: 'Normal',
    hampir_penuh: 'Hampir Penuh',
    penuh: 'Penuh'
  }[status] || status
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