<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Kepatuhan Jadwal Petugas</h2>
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
        <select v-model="filterPetugas" class="filter-select">
          <option value="">Semua Petugas</option>
          <option 
            v-for="p in kepatuhanData" 
            :key="p.id_petugas" 
            :value="p.id_petugas"
          >
            {{ p.nama }}
          </option>
        </select>

        <button
          v-if="searchQuery || filterPetugas"
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
      <span v-if="searchQuery || filterPetugas">
        Menampilkan {{ filteredKepatuhan.length }} dari {{ kepatuhanData.length }} data
      </span>
      <span v-else>
        Total {{ kepatuhanData.length }} data
      </span>

      <span v-if="searchQuery">
        (Pencarian: "{{ searchQuery }}")
      </span>

      <span v-if="filterPetugas">
        (Petugas: {{ kepatuhanData.find(p => p.id_petugas == filterPetugas)?.nama }})
      </span>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-state">
      <p>Memuat data kepatuhan...</p>
    </div>

    <!-- TABLE -->
    <div v-else class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Petugas</th>
            <th>Total Pengambilan</th>
            <th>Tepat Waktu</th>
            <th>Terlambat</th>
            <th>Persentase Tepat</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredKepatuhan" :key="item.id_petugas + '-' + index">
            <td data-label="No">{{ index + 1 }}</td>
            <td data-label="Nama Petugas" class="nama-petugas">{{ item.nama }}</td>
            <td data-label="Total">{{ item.total_selesai }}</td>
            <td data-label="Tepat" class="tepat-waktu">
              <span>{{ item.tepat_waktu }}</span>
            </td>
            <td data-label="Terlambat" class="terlambat">
              <span>{{ item.terlambat }}</span>
            </td>
            <td data-label="Persentase">
              <div class="persentase-container">
                <div class="persentase-bar">
                  <div
                    class="persentase-fill"
                    :class="item.persentase_tepat_waktu >= 80 ? 'good' : item.persentase_tepat_waktu >= 60 ? 'medium' : 'poor'"
                    :style="{ width: item.persentase_tepat_waktu + '%' }"
                  ></div>
                </div>
                <span class="persentase-text">{{ item.persentase_tepat_waktu || 0 }}%</span>
              </div>
            </td>
            <td data-label="Status">
              <span
                class="status-badge"
                :class="item.persentase_tepat_waktu >= 80 ? 'excellent' : item.persentase_tepat_waktu >= 60 ? 'good' : 'warning'"
              >
                {{
                  item.persentase_tepat_waktu >= 80
                    ? 'Sangat Baik'
                    : item.persentase_tepat_waktu >= 60
                      ? 'Baik'
                      : 'Perlu Perhatian'
                }}
              </span>
            </td>
            <td class="action-buttons">
              <button class="btn-action" @click="lihatDetail(item)">
                <span class="material-icons">visibility</span>
              </button>
            </td>
          </tr>
          <tr v-if="filteredKepatuhan.length === 0">
            <td colspan="8" class="empty-state">
              <span class="material-icons">inbox</span>
              <p>Data tidak ditemukan</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARD -->
    <div v-if="!loading" class="card-list mobile-only">
      <div 
        class="data-card"
        v-for="(item, index) in filteredKepatuhan"
        :key="item.id_petugas + '-' + index"
      >
        <!-- HEADER -->
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ item.nama }}
            </div>
            <div class="data-card-subtitle">
              Total: {{ item.total_selesai }} pengambilan
            </div>
          </div>

          <span
            class="status-badge"
            :class="item.persentase_tepat_waktu >= 80 ? 'excellent' : item.persentase_tepat_waktu >= 60 ? 'good' : 'warning'"
          >
            {{
              item.persentase_tepat_waktu >= 80
                ? 'Sangat Baik'
                : item.persentase_tepat_waktu >= 60
                  ? 'Baik'
                  : 'Perlu Perhatian'
            }}
          </span>
        </div>

        <!-- BODY -->
        <div class="data-card-body">
          <div class="data-card-item">
            <span class="data-card-label">Tepat Waktu</span>
            <span class="data-card-value">{{ item.tepat_waktu }}</span>
          </div>

          <div class="data-card-item">
            <span class="data-card-label">Terlambat</span>
            <span class="data-card-value">{{ item.terlambat }}</span>
          </div>

          <div class="data-card-item">
            <span class="data-card-label">Persentase</span>
            <span class="data-card-value">{{ item.persentase_tepat_waktu || 0 }}%</span>
          </div>

          <!-- PROGRESS BAR -->
          <div class="persentase-container">
            <div class="persentase-bar">
              <div
                class="persentase-fill"
                :class="item.persentase_tepat_waktu >= 80 ? 'good' : item.persentase_tepat_waktu >= 60 ? 'medium' : 'poor'"
                :style="{ width: item.persentase_tepat_waktu + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="data-card-footer">
          <button class="btn-card-action" @click="lihatDetail(item)">
            <span class="material-icons">visibility</span>
            Detail
          </button>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-if="filteredKepatuhan.length === 0" class="empty-state-card">
        <span class="material-icons">inbox</span>
        <p>Data tidak ditemukan</p>
      </div>
    </div>

    <!-- MODAL COMPONENT -->
    <kepatuhanDetailModal
      v-if="showModal && selected"
      :kepatuhan="selected"
      :detail="detailData"
      :loading="detailLoading"
      @close="showModal = false"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, computed} from 'vue'
import api from '@/services/api'
import kepatuhanDetailModal from '@/components/kepatuhanJadwal.vue'

const kepatuhanData = ref([])
const loading = ref(false)
const detailLoading = ref(false)
const showModal = ref(false)
const selected = ref(null)
const detailData = ref([])
const searchQuery = ref('')
const filterPetugas = ref('')

const filteredKepatuhan = computed(() => {
  return kepatuhanData.value.filter(item => {
    const q = searchQuery.value.toLowerCase()

  const statusText =
    item.persentase_tepat_waktu >= 80
      ? 'sangat baik'
      : item.persentase_tepat_waktu >= 60
        ? 'baik'
        : 'perlu perhatian'

  const matchSearch =
    !q ||
    Object.values(item).some(val =>
      String(val ?? '').toLowerCase().includes(q)
    ) ||
    statusText.includes(q)

    // FILTER PETUGAS
    const matchPetugas =
      !filterPetugas.value ||
      item.id_petugas == filterPetugas.value

    return matchSearch && matchPetugas
  })
})

function resetFilter() {
  searchQuery.value = ''
  filterPetugas.value = ''
}

async function fetchKepatuhan() {
  loading.value = true
  try {
    const res = await api.get('/api/dashboard/kepatuhan/all')
    kepatuhanData.value = res.data
  } catch (error) {
    console.error('Gagal mengambil kepatuhan petugas:', error)
    kepatuhanData.value = []
  } finally {
    loading.value = false
  }
}

async function lihatDetail(item) {
  selected.value = item
  showModal.value = true
  detailLoading.value = true

  try {
    const res = await api.get(`/api/dashboard/kepatuhan/detail/${item.id_petugas}`)
    detailData.value = res.data
  } catch (err) {
    console.error('Gagal ambil detail:', err)
    detailData.value = []
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  fetchKepatuhan()
})

</script>

<style scoped src="@/assets/styles/admin.css"></style>