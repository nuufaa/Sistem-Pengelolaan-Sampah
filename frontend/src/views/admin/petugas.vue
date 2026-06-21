<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Data Petugas</h2>
      <button v-if="userRole === 'admin'" class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Petugas
      </button>
    </div>

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
          <option value="1">Aktif</option>
          <option value="0">Non-Aktif</option>
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

    <div class="filter-result-info">
      <span v-if="searchQuery || filterStatus">
        Menampilkan {{ filteredPetugas.length }} dari {{ petugasList.length }} data
      </span>
      <span v-else>
        Total {{ petugasList.length }} data
      </span>

      <span v-if="searchQuery">
        (Pencarian: "{{ searchQuery }}")
      </span>

      <span v-if="filterStatus">
        (Status: {{ filterStatus === '1' ? 'Aktif' : 'Non-Aktif' }})
      </span>
    </div>

    <!-- TABLE -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>No. HP</th>
            <th>Username</th>
            <th>Status</th>
            <th v-if="userRole === 'admin'">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(p, i) in paginatedPetugas" :key="p.id_petugas">
            <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ p.nama }}</td>
            <td>{{ p.no_telp }}</td>
            <td>{{ p.username }}</td>
            <td>
              <span class="status-badge" :class="p.status_petugas">
                {{ p.status_petugas === 1 ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </td>
            <td v-if="userRole === 'admin'" class="action-buttons">
              <button class="btn-action edit" @click="openEdit(p)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(p.id_petugas)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>

        <tr v-if="paginatedPetugas.length === 0">
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
        v-for="(p) in paginatedPetugas"
        :key="p.id_petugas"
      >

        <!-- HEADER -->
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ p.nama }}
            </div>
            <div class="data-card-subtitle">
              {{ p.username }}
            </div>
          </div>

          <span 
            class="status-badge" 
            :class="p.status_petugas === 1 ? 'aktif' : 'nonaktif'"
          >
            {{ p.status_petugas === 1 ? 'Aktif' : 'Non-Aktif' }}
          </span>
        </div>

        <!-- BODY -->
        <div class="data-card-body">
          <div class="data-card-item">
            <span class="data-card-label">No. HP</span>
            <span class="data-card-value">{{ p.no_telp }}</span>
          </div>
        </div>

        <!-- FOOTER -->
        <div v-if="userRole === 'admin'" class="data-card-footer">
          <button class="btn-card-action edit" @click="openEdit(p)">
            <span class="material-icons">edit</span>
            Edit
          </button>

          <button class="btn-card-action delete" @click="remove(p.id_petugas)">
            <span class="material-icons">delete</span>
            Hapus
          </button>
        </div>
      </div>

      <div v-if="paginatedPetugas.length === 0" class="empty-state-card">
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
    <PetugasModal
      v-if="showModal"
      :model-value="form"
      @save="save"
      @close="showModal = false"
    />
  </section>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, computed, watch  } from 'vue'
import api from '@/services/api'
import PetugasModal from '@/components/petugasModal.vue'
import { TabSync } from '@/services/tabSync'

const petugasList = ref([])
const showModal = ref(false)
const form = ref(null)
const abortController = ref(null)
let unsubscribeSync = null
const userRole = computed(() => sessionStorage.getItem('role') || 'kadus')

const searchQuery = ref('')
const filterStatus = ref('')

const currentPage = ref(1)
const itemsPerPage = ref(5)

const filteredPetugas = computed(() => {
  return petugasList.value.filter(p => {
    const q = searchQuery.value.toLowerCase()

    const matchSearch = !q ||
      p.nama.toLowerCase().includes(q) ||
      p.no_telp.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      (p.status_petugas === 1 ? 'aktif' : 'non-aktif').includes(q)

    const matchStatus =
      !filterStatus.value ||
      String(p.status_petugas) === filterStatus.value

    return matchSearch && matchStatus
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredPetugas.value.length / itemsPerPage.value)
})

const paginatedPetugas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPetugas.value.slice(start, end)
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

async function fetchPetugas() {
  try {
    // Cancel previous request jika ada
    if (abortController.value) {
      abortController.value.abort()
    }
    
    // Create new abort controller untuk request ini
    abortController.value = new AbortController()
    
    const res = await api.get('/api/petugas', {
      signal: abortController.value.signal
    })
    petugasList.value = res.data
  } catch (error) {
    // Abaikan error jika request di-cancel
    if (error.name === 'CanceledError') {
      console.log('Petugas fetch cancelled')
      return
    }
    console.error('Gagal fetch petugas:', error)
  }
}

onMounted(() => {
  fetchPetugas()

  unsubscribeSync = TabSync.listen((event) => {
    if (event === 'petugas_updated') {
      fetchPetugas()
    }
  })
})

onBeforeUnmount(() => {
  // Cancel semua pending request ketika component di-unmount
  if (abortController.value) {
    abortController.value.abort()
  }
  if (unsubscribeSync) unsubscribeSync()
})

function openAdd() {
  form.value = {
    id_petugas: null,
    nama: '',
    no_telp: '',
    username: '',
    password: '',
    status_petugas: '1'
  }
  showModal.value = true
}

function openEdit(p) {
  form.value = {
    id_petugas: p.id_petugas,
    nama: p.nama,
    no_telp: p.no_telp,
    username: p.username,
    password: '',
    status_petugas: p.status_petugas
  }
  showModal.value = true
}

async function save(data) {
  try {
    const payload = {
      nama: data.nama,
      no_telp: data.no_telp,
      username: data.username,
      password: data.password,
      status_petugas: data.status_petugas,
      id_admin: data.id_admin
    }
  
    if (data.id_petugas) {
      await api.put(`/api/petugas/${data.id_petugas}`, payload)
    } else {
      await api.post('/api/petugas', payload)
    }
  
    showModal.value = false
    TabSync.emit('petugas_updated')
    await fetchPetugas()
    
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('Gagal simpan petugas', error)
    }
  }
}

async function remove(id) {
  if (!confirm('Yakin ingin menghapus petugas ini?')) return

  try {
    await api.delete(`/api/petugas/${id}`)
    TabSync.emit('petugas_updated')
    await fetchPetugas()
  } catch (err) {
    if (err.name !== 'CanceledError') {
      console.error('Gagal hapus petugas', err)
    }
  }
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>