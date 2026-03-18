<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Riwayat Pelaporan Masyarakat</h2>
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
          <tr v-for="(laporan, i) in laporanList" :key="laporan.id_laporan">
            <td>{{ i + 1 }}</td>
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
      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="card-list mobile-only">
      <div
        v-for="laporan in laporanList"
        :key="laporan.id_laporan"
        class="data-card"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ laporan.nama_pelapor }}
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
            <span class="data-card-label">Tanggal:</span>
            <span class="data-card-value">{{ laporan.tgl_laporan }}</span>
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
import { ref, computed, onMounted} from 'vue'
import api from '@/services/api.js'
import LaporanDetailModal from '@/components/laporanModal.vue'

const laporanList = ref([])
const showModal = ref(false)
const selected = ref(null)

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

onMounted(fetchLaporan)

function kondisiText(kondisi) {
  return {
    hampir_penuh: 'Hampir Penuh',
    penuh: 'Sudah Penuh',
    berserakan: 'Sampah Berserakan'
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

</script>

<style scoped src="@/assets/styles/admin.css"></style>