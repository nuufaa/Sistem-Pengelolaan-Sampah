<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Kepatuhan Jadwal Petugas</h2>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-state">
      <p>Memuat data kepatuhan...</p>
    </div>

    <!-- TABLE -->
    <div v-else class="table-container">
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
          <tr v-for="(item, index) in kepatuhanData" :key="item.id_petugas + '-' + index" class="data-row">
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
          <tr v-if="kepatuhanData.length === 0">
            <td colspan="8" class="no-data">
              Tidak ada data kepatuhan petugas
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DETAIL -->
    <!-- <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detail Kepatuhan - {{ detailPetugasNama }}</h3>
          <button class="btn-close" @click="showDetail = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="detailLoading" class="loading-state">
            <p>Memuat detail...</p>
          </div>
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>TPS</th>
                <th>Hari Jadwal</th>
                <th>Tanggal Jadwal</th>
                <th>Tanggal Pengambilan</th>
                <th>Status Kepatuhan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in detailKepatuhan" :key="detail.id_daftar_tugas" class="detail-row">
                <td data-label="TPS">{{ detail.nama_tps }}</td>
                <td data-label="Hari Jadwal">{{ detail.hari_pengambilan }}</td>
                <td data-label="Tanggal Jadwal">{{ formatDate(detail.tgl_pengambilan) }}</td>
                <td data-label="Tanggal Pengambilan">{{ detail.tgl_terakhir_diambil ? formatDate(detail.tgl_terakhir_diambil) : '-' }}</td>
                <td data-label="Status Kepatuhan">
                  <span
                    class="status-kepatuhan"
                    :class="detail.status_kepatuhan === 'Tepat Waktu' ? 'tepat' : 'terlambat'"
                  >
                    {{ detail.status_kepatuhan }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div> -->
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
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import kepatuhanDetailModal from '@/components/kepatuhanJadwal.vue'

const kepatuhanData = ref([])
const detailKepatuhan = ref([])
const loading = ref(false)
const detailLoading = ref(false)
const showDetail = ref(false)
const detailPetugasId = ref(null)
const detailPetugasNama = ref('')
const showModal = ref(false)
const selected = ref(null)
const detailData = ref([])

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

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchKepatuhan()
})

</script>
<style scoped src="@/assets/styles/admin.css"></style>

