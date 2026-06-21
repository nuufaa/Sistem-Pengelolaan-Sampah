<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Data Kendaraan</h2>
      <button v-if="userRole === 'admin'" class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Kendaraan
      </button>
    </div>

    <!-- SEARCH & FILTER -->
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
          <option value="tersedia">Tersedia</option>
          <option value="perbaikan">Perbaikan</option>
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
        Menampilkan {{ filteredKendaraan.length }} dari {{ kendaraanList.length }} data
      </span>
      <span v-else>
        Total {{ kendaraanList.length }} data
      </span>

      <span v-if="searchQuery">
        (Pencarian: "{{ searchQuery }}")
      </span>

      <span v-if="filterStatus">
        (Status: {{ statusText(filterStatus) }})
      </span>
    </div>

    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nomor</th>
            <th>Plat</th>
            <th>Kapasitas</th>
            <th>Status</th>
            <th v-if="userRole === 'admin'">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(k, i) in paginatedKendaraan" :key="k.id_kendaraan">
            <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ k.nomor_kendaraan }}</td>
            <td>{{ k.nomor_polisi }}</td>
            <td>{{ k.kapasitas_angkut }}</td>
            <td>
              <span class="status-badge" :class="k.status_kendaraan">
                {{ statusText(k.status_kendaraan) }}
              </span>
            </td>
            <td v-if="userRole === 'admin'" class="action-buttons">
              <button class="btn-action edit" @click="openEdit(k)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(k.id_kendaraan)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>

        <tr v-if="paginatedKendaraan.length === 0">
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
        v-for="(k) in paginatedKendaraan"
        :key="k.id_kendaraan"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ k.nomor_kendaraan }}
            </div>
            <div class="data-card-subtitle">
              {{ k.nomor_polisi }}
            </div>
          </div>

          <span class="status-badge" :class="k.status_kendaraan">
            {{ statusText(k.status_kendaraan) }}
          </span>
        </div>

        <div class="data-card-body">
          <div class="data-card-item">
            <span class="data-card-label">Kapasitas</span>
            <span class="data-card-value">{{ k.kapasitas_angkut }}</span>
          </div>
        </div>

        <div v-if="userRole === 'admin'" class="data-card-footer">
          <button class="btn-card-action edit" @click="openEdit(k)">
            <span class="material-icons">edit</span>
            Edit
          </button>

          <button class="btn-card-action delete" @click="remove(k.id_kendaraan)">
            <span class="material-icons">delete</span>
            Hapus
          </button>
        </div>
      </div>

      <div v-if="paginatedKendaraan.length === 0" class="empty-state-card">
        <span class="material-icons">inbox</span>
        <p>Data tidak ditemukan</p>
      </div>
    </div>

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
    <KendaraanModal
      v-if="showModal"
      :model-value="selected"
      @close="showModal = false"
      @save="save"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import api from '@/services/api'
import KendaraanModal from '@/components/kendaraanModal.vue'
import { TabSync } from '@/services/tabSync'

const kendaraanList = ref([])
const showModal = ref(false)
const selected = ref(null)
let unsubscribeSync = null
const userRole = computed(() => sessionStorage.getItem('role') || 'kadus')

const searchQuery = ref('')
const filterStatus = ref('')

const currentPage = ref(1)
const itemsPerPage = ref(5)

const filteredKendaraan = computed(() => {
  return kendaraanList.value.filter(k => {
    const q = searchQuery.value.toLowerCase()

    const matchSearch = !q ||
      k.nomor_kendaraan.toLowerCase().includes(q) ||
      k.nomor_polisi.toLowerCase().includes(q) ||
      String(k.kapasitas_angkut).includes(q) ||
      statusText(k.status_kendaraan).toLowerCase().includes(q)

    const matchStatus =
      !filterStatus.value ||
      k.status_kendaraan === filterStatus.value

    return matchSearch && matchStatus
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredKendaraan.value.length / itemsPerPage.value)
})

const paginatedKendaraan = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredKendaraan.value.slice(start, end)
})

watch([searchQuery, filterStatus], () => {
  currentPage.value = 1
})

function resetFilter() {
  searchQuery.value = ''
  filterStatus.value = ''
  currentPage.value = 1
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

async function fetchKendaraan() {
  try {
    const res = await api.get('/api/kendaraan')
    kendaraanList.value = res.data
  } catch (err) {
    console.error('Gagal ambil kendaraan', err)
  }
}

onMounted(() => {
  fetchKendaraan()

  unsubscribeSync = TabSync.listen((event) => {
    if (event === 'kendaraan_updated') {
      fetchKendaraan()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeSync) unsubscribeSync()
})

function openAdd() {
  selected.value = {
    id_kendaraan: null,
    nomor_kendaraan: '',
    nomor_polisi: '',
    kapasitas_angkut: '',
    status_kendaraan: 'tersedia'
  }
  showModal.value = true
}

function openEdit(k) {
  selected.value = { ...k }
  showModal.value = true
}

async function save(data) {
  try {
    if (data.id_kendaraan) {
      // UPDATE
      await api.put(`/api/kendaraan/${data.id_kendaraan}`, data)
    } else {
      // CREATE
      await api.post('/api/kendaraan', data)
    }
    await fetchKendaraan()
    TabSync.emit('kendaraan_updated')
    showModal.value = false
  } catch (err) {
    console.error('Gagal simpan kendaraan', err)
  }
}

async function remove(id) {
  if (!confirm('Yakin ingin menghapus kendaraan ini?')) return

  try {
    await api.delete(`/api/kendaraan/${id}`)
    TabSync.emit('kendaraan_updated')
    await fetchKendaraan()
  } catch (err) {
    console.error('Gagal hapus kendaraan', err)
  }
}

function statusText(s) {
  return s === 'tersedia' ? 'Tersedia' : 'Perbaikan'
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>