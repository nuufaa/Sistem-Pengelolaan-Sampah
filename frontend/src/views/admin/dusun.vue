<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Data Dusun</h2>
      <button v-if="userRole === 'admin'" class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Dusun
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
        <select v-model="filterKK" class="filter-select">
          <option value="">Semua Jumlah KK</option>
          <option value="sedikit">Sedikit (< 100 KK)</option>
          <option value="sedang">Sedang (100 - 300 KK)</option>
          <option value="banyak">Banyak (> 300 KK)</option>
        </select>

        <button
          v-if="searchQuery || filterKK"
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
      <span v-if="searchQuery || filterKK">
        Menampilkan {{ filteredDusun.length }} dari {{ dusunList.length }} data
        <template v-if="searchQuery">
          | Pencarian: "<b>{{ searchQuery }}</b>"
        </template>
        <template v-if="filterKK">
          | Filter KK: 
          <b>
            {{
              filterKK === 'sedikit' ? 'Sedikit (< 100)' :
              filterKK === 'sedang' ? 'Sedang (100 - 300)' :
              'Banyak (> 300)'
            }}
          </b>
        </template>
      </span>

      <span v-else>
        Total {{ dusunList.length }} data
      </span>
    </div>

    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Dusun</th>
            <th>Jumlah KK</th>
            <th v-if="userRole === 'admin'">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(k, i) in paginatedDusun" :key="k.id_dusun">
            <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ k.nama_dusun }}</td>
            <td>{{ k.jumlah_kk }}</td>
            <td v-if="userRole === 'admin'" class="action-buttons">
              <button class="btn-action edit" @click="openEdit(k)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(k.id_dusun)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>

        <tr v-if="paginatedDusun.length === 0">
          <td colspan="4">
            <span class="material-icons">inbox</span>
            <div class="filter-result-info">
                  Data tidak ditemukan
            </div>
          </td>
        </tr>

      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="card-list mobile-only">
      <div 
        class="data-card" 
        v-for="(k) in paginatedDusun" 
        :key="k.id_dusun"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ k.nama_dusun }}
            </div>
            <div class="data-card-subtitle">
              {{ k.jumlah_kk }}
            </div>
          </div>
        </div>

        <div v-if="userRole === 'admin'" class="data-card-footer">
          <button class="btn-card-action edit" @click="openEdit(k)">
            <span class="material-icons">edit</span>
            Edit
          </button>

          <button class="btn-card-action delete" @click="remove(k.id_dusun)">
            <span class="material-icons">delete</span>
            Hapus
          </button>
        </div>
      </div>

      <div v-if="paginatedDusun.length === 0" class="empty-state-card">
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

    <!-- MODAL COMPONENT -->
    <dusunModal
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
import dusunModal from '@/components/dusunModal.vue'
import { TabSync } from '@/services/tabSync'

const dusunList = ref([])
const showModal = ref(false)
const selected = ref(null)
let unsubscribeSync = null
const userRole = computed(() => sessionStorage.getItem('role') || 'kadus')
const currentPage = ref(1)
const itemsPerPage = ref(5)

const searchQuery = ref('')
const filterKK = ref('')

const filteredDusun = computed(() => {
  return dusunList.value.filter(k => {
    const q = searchQuery.value.toLowerCase().trim()

    const nama = (k.nama_dusun || '').toLowerCase()
    const kk = String(k.jumlah_kk || '')

    const matchSearch = !q ||
      nama.includes(q) ||
      kk.includes(q)

    const jumlah = Number(k.jumlah_kk)
    const matchKK =
      !filterKK.value ||
      (filterKK.value === 'sedikit' && jumlah < 100) ||
      (filterKK.value === 'sedang' && jumlah >= 100 && jumlah <= 300) ||
      (filterKK.value === 'banyak' && jumlah > 300)

    return matchSearch && matchKK
  })
})

// COMPUTED: Pagination Logic
const totalPages = computed(() => {
  return Math.ceil(filteredDusun.value.length / itemsPerPage.value)
})

const paginatedDusun = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredDusun.value.slice(start, end)
})

// Reset halaman saat filter berubah
watch([searchQuery, filterKK], () => {
  currentPage.value = 1
})

function resetFilter() {
  searchQuery.value = ''
  filterKK.value = ''
  currentPage.value = 1
}

async function fetchDusun() {
  try {
    const res = await api.get('/api/dusun')
    dusunList.value = res.data
  } catch (err) {
    console.error('Gagal ambil data dusun', err)
  }
}

onMounted(() => {
  fetchDusun()

  unsubscribeSync = TabSync.listen((event) => {
    if (event === 'dusun_updated') {
      fetchDusun()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeSync) unsubscribeSync()
})

function openAdd() {
  selected.value = {
    id_dusun: null,
    nama_dusun: '',
    jumlah_kk: ''
  }
  showModal.value = true
}

function openEdit(k) {
  selected.value = { ...k }
  showModal.value = true
}

async function save(data) {
  try {
    if (data.id_dusun) {

      await api.put(` /api/dusun/${data.id_dusun}`, data)
    } else {

      await api.post('/api/dusun', data)
    }
    await fetchDusun()
    TabSync.emit('dusun_updated')
    showModal.value = false
  } catch (err) {
    console.error('Gagal simpan dusun', err)
  }
}

async function remove(id) {
  if (!confirm('Yakin ingin menghapus dusun ini?')) return

  try {
    await api.delete(`/api/dusun/${id}`)
    TabSync.emit('dusun_updated')
    await fetchDusun()
  } catch (err) {
    console.error('Gagal hapus kendaraan', err)
  }
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