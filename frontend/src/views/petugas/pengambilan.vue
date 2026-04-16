<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Daftar Pengambilan Sampah</h2>

      <div class="filter-group">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'pengambilan' }"
          @click="activeTab = 'pengambilan'">
          Pengambilan Aktif
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'riwayat' }"
          @click="activeTab = 'riwayat'">
          Riwayat Selesai
        </button>
      </div>
    </div>

    <!-- TAB 1: PENGAMBILAN AKTIF -->
    <div v-if="activeTab === 'pengambilan'" class="tab-content">
      <div class="table-container desktop-only">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama TPS</th>
              <th>Jadwal</th>
              <th>Tanggal Pengambilan</th>
              <th>Kendaraan</th>
              <th>Volume</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in pengambilanData" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.nama_tps }}</td>
              <td>{{ hariLabel(item.hari_pengambilan) }}</td>
              <td>{{ formatDate(item.tgl_pengambilan)}}</td>
              <td>{{ item.nomor_kendaraan || '-' }}</td>
              <td>{{ item.volume_sampah != null ? item.volume_sampah : '-' }}</td>
              <td>
                <span class="status-badge" :class="item.status_angkut">
                  {{ statusText(item.status_angkut) }}
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

      <!-- MOBILE CARD -->
      <div class="card-list mobile-only">
        <div class="pickup-card" v-for="(item) in pengambilanData" :key="item.id">
          
          <div class="card-header">
            <div>
              <h3 class="card-title">{{ item.nama_tps }}</h3>
              <p class="card-subtitle">{{ hariLabel(item.hari_pengambilan) }}</p>
            </div>
            <span class="status-badge" :class="item.status_angkut">
              {{ statusText(item.status_angkut) }}
            </span>
          </div>

          <div class="card-body">
            <div class="card-item">
              <span>Tanggal Pengambilan</span>
              <span>{{ formatDate(item.tgl_pengambilan) }}</span>
            </div>

            <div class="card-item">
              <span>Kendaraan</span>
              <span>{{ item.nomor_kendaraan || '-' }}</span>
            </div>

            <div class="card-item">
              <span>Volume</span>
              <span>{{ item.volume_sampah ?? '-' }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button class="btn-update" @click="openModal(item)">
              Update
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- TAB 2: RIWAYAT SELESAI -->
    <div v-if="activeTab === 'riwayat'" class="tab-content">
      <div class="table-container desktop-only">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama TPS</th>
              <th>Jadwal</th>
              <th>Tanggal Pengambilan</th>
              <th>Selesai Tanggal</th>
              <th>Kendaraan</th>
              <th>Volume</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in riwayatData" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.nama_tps }}</td>
              <td>{{ hariLabel(item.hari_pengambilan) }}</td>
              <td>{{ formatDate(item.tgl_pengambilan)}}</td>
              <td>{{ item.tgl_terakhir_diambil ? formatDate(item.tgl_terakhir_diambil) : '-' }}</td>
              <td>{{ item.nomor_kendaraan || '-' }}</td>
              <td>{{ item.volume_sampah != null ? item.volume_sampah : '-' }}</td>
              <td>
                <span class="status-badge selesai">
                  Selesai
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARD -->
      <div class="card-list mobile-only">
        <div class="pickup-card" v-for="(item) in riwayatData" :key="item.id">
          
          <div class="card-header">
            <div>
              <h3 class="card-title">{{ item.nama_tps }}</h3>
              <p class="card-subtitle">{{ hariLabel(item.hari_pengambilan) }}</p>
            </div>
            <span class="status-badge selesai">
              Selesai
            </span>
          </div>

          <div class="card-body">
            <div class="card-item">
              <span>Tanggal Pengambilan</span>
              <span>{{ formatDate(item.tgl_pengambilan) }}</span>
            </div>

            <div class="card-item">
              <span>Selesai Tanggal</span>
              <span>{{ item.tgl_terakhir_diambil ? formatDate(item.tgl_terakhir_diambil) : '-' }}</span>
            </div>

            <div class="card-item">
              <span>Kendaraan</span>
              <span>{{ item.nomor_kendaraan || '-' }}</span>
            </div>

            <div class="card-item">
              <span>Volume</span>
              <span>{{ item.volume_sampah ?? '-' }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <UpdatePengambilanModal
      :show="showModal"
      :data="selectedItem"
      :kendaraanList="kendaraanList"
      @close="showModal = false"
      @save="handleSave"
    />
  </section>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import api from '@/services/api'
import UpdatePengambilanModal from '@/components/updateStatusModal.vue'

const activeTab = ref('pengambilan')
const showModal = ref(false)
const selectedItem = ref(null)
const pengambilanData = ref([])
const riwayatData = ref([])
const kendaraanList = ref([])

async function fetchKendaraan() {
  const res = await api.get('/api/kendaraan')
  kendaraanList.value = res.data
}

// Fetch ACTIVE tasks (belum_diangkut, diangkut) + next occurrence only
async function fetchPengambilan() {
  try {
    await api.post('/api/daftar-tugas/generate');
    const res = await api.get('/api/daftar-tugas');
    pengambilanData.value = res.data;
  } catch (err) {
    console.error('Gagal ambil pengambilan', err);
  }
}

// Fetch COMPLETED tasks (selesai) - riwayat
async function fetchRiwayat() {
  try {
    const res = await api.get('/api/daftar-tugas/history/completed');
    riwayatData.value = res.data;
  } catch (err) {
    console.error('Gagal ambil riwayat', err);
  }
}

onMounted(() => {
  fetchPengambilan();
  fetchRiwayat();
  fetchKendaraan();
})

function hariLabel(hariStr) {
  if (!hariStr) return '-';
  const labels = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Minggu'
  ];
  const hariArray = hariStr.split(',').map(h => parseInt(h.trim()));
  return hariArray.map(idx => labels[idx] || '-').join(', ');
}

function openModal(item) {
  selectedItem.value = item
  showModal.value = true
}

async function handleSave(payload) {
  if (!selectedItem.value) return;

  const body = {
    status_angkut: payload.status_angkut,
    id_kendaraan: payload.id_kendaraan || null,
    volume_sampah: payload.volume_sampah || null
  };

  try {
    await api.put(`/api/daftar-tugas/${selectedItem.value.id}/status`, body)
    showModal.value = false
    // Refresh both tabs
    await fetchPengambilan()
    await fetchRiwayat()
  } catch (err) {
    console.error('Gagal update status', err)
  }
}

function statusText(status) {
  return {
    belum_diangkut: 'Belum Mulai',
    selesai: 'Selesai'
  }[status]
}

function formatDate(date) {
  if (!date) return '-'

  // FIX: Handle both ISO format and plain YYYY-MM-DD strings
  let dateStr = date
  
  // Jika ada T (ISO format), parse to local date
  if (date.includes('T')) {
    const d = new Date(date)
    const localYear = d.getFullYear()
    const localMonth = String(d.getMonth() + 1).padStart(2, '0')
    const localDay = String(d.getDate()).padStart(2, '0')
    dateStr = `${localYear}-${localMonth}-${localDay}`
  }
  
  return dateStr
}

</script>

<style scoped src="@/assets/styles/petugas.css"></style>
