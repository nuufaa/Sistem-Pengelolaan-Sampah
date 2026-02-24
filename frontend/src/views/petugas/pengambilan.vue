<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Daftar Pengambilan Sampah</h2>

      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="">Semua Status</option>
          <option value="pending">Belum Mulai</option>
          <option value="progress">Sedang Berlangsung</option>
          <option value="done">Selesai</option>
        </select>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama TPS</th>
            <th>Desa</th>
            <th>Jadwal</th>
            <th>Terakhir Diambil</th>
            <th>Kendaraan</th>
            <th>Volume</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in filteredData" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.tps.nama_tps }}</td>
            <td>{{ item.tps.nama_dusun }}</td>
            <td>Setiap {{ item.hari_pengambilan }} hari</td>
            <td>{{ item.tgl_terakhir_diambil }}</td>
            <td>{{ item.id_kendaraan || '-' }}</td>
            <td>
              {{ item.volume_sampah
                ? item.volume_sampah + ' ' + item.volumeUnit
                : '-' }}
            </td>
            <td>
              <span class="status-badge" :class="item.status">
                {{ statusText(item.status) }}
              </span>
            </td>
            <td>
              <button class="btn-update" @click="openModal(item)">
                Update
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL UPDATE -->
    <UpdatePengambilanModal
      :show="showModal"
      :data="selectedItem"
      @close="showModal = false"
      @save="handleSave"
    />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import UpdatePengambilanModal from '@/components/updateStatusModal.vue'

/* =====================
   STATE
===================== */
const showModal = ref(false)
const selectedItem = ref(null)
const filterStatus = ref('')

/* =====================
   DATA DUMMY (STRUKTUR BARU)
===================== */
const pengambilanData = ref([
  {
    id: 1,
    tps: {
      nama: 'TPS A1 - Pasar Utara',
      desa: 'Desa A'
    },
    interval: 3,
    lastPickup: '13 Januari 2026',
    kendaraan: '',
    volume: '',
    volumeUnit: 'kg',
    status: 'pending',
    notes: ''
  },
  {
    id: 2,
    tps: {
      nama: 'TPS A2 - Masjid Besar',
      desa: 'Desa A'
    },
    interval: 2,
    lastPickup: '15 Januari 2026',
    kendaraan: '',
    volume: '',
    volumeUnit: 'kg',
    status: 'progress',
    notes: ''
  },
  {
    id: 3,
    tps: {
      nama: 'TPS A3 - Sekolah Dasar',
      desa: 'Desa A'
    },
    interval: 4,
    lastPickup: '12 Januari 2026',
    kendaraan: 'Truck 01',
    volume: 92,
    volumeUnit: 'kg',
    status: 'done',
    notes: ''
  }
])

/* =====================
   COMPUTED
===================== */
const filteredData = computed(() => {
  if (!filterStatus.value) return pengambilanData.value
  return pengambilanData.value.filter(
    item => item.status === filterStatus.value
  )
})

/* =====================
   METHODS
===================== */
function openModal(item) {
  selectedItem.value = item
  showModal.value = true
}

function handleSave(payload) {
  if (!selectedItem.value) return

  selectedItem.value.status = payload.status
  selectedItem.value.kendaraan = payload.kendaraan
  selectedItem.value.volume = payload.volume
  selectedItem.value.volumeUnit = payload.unit
  selectedItem.value.notes = payload.notes

  if (payload.status === 'done') {
    selectedItem.value.lastPickup =
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
  }

  showModal.value = false
}

function statusText(status) {
  return {
    pending: 'Belum Mulai',
    progress: 'Sedang Berlangsung',
    done: 'Selesai'
  }[status]
}
</script>

<style scoped src="@/assets/styles/petugas.css"></style>
