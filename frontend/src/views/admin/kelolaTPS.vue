<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Kelola Titik Pengambilan Sampah (TPS)</h2>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah TPS
      </button>
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
            <th>Aksi</th>
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
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(tps)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(tps.id_tps)">
                <span class="material-icons">delete</span>
              </button>
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

        <div class="data-card-footer">
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
import { ref, onMounted, computed, onActivated } from 'vue'
import { apiFetch } from '../../services/api'
import TPSModal from '@/components/TPSModal.vue'

const showModal = ref(false)
const selectedTPS = ref(null)
const dusunList = ref([])
const tpsList = ref([])

const currentPage = ref(1)
const itemsPerPage = ref(5)

// COMPUTED: Pagination Logic
const totalPages = computed(() => {
  return Math.ceil(tpsList.value.length / itemsPerPage.value)
})

const paginatedTPS = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return tpsList.value.slice(start, end)
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

let loaded = false

onMounted(async () => {
  await fetchTPS()
  await fetchDusun()
  loaded = true
})

onActivated(() => {
  if (!loaded) fetchTPS()
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