<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Daftar Pengambilan Sampah</h2>

      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="">Semua Status</option>
          <option value="belum_diangkut">Belum Mulai</option>
          <option value="diangkut">Sedang Berlangsung</option>
          <option value="selesai">Selesai</option>
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
            <th>Jadwal</th>
            <th>Tanggal Pengambilan</th>
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
            <td>{{ item.nama_tps }}</td>
            <td>{{ hariLabel(item.hari_pengambilan) }}</td>
            <td>{{ formatDate(item.tgl_pengambilan)}}</td>
            <td>{{ formatDate(item.tgl_terakhir_diambil) }}</td>
            <td>{{ item.id_kendaraan || '-' }}</td>
            <td>
              {{ item.volume_sampah != null ? item.volume_sampah : '-' }}
            </td>
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

    <!-- MODAL UPDATE -->
    <UpdatePengambilanModal
      :show="showModal"
      :data="selectedItem"
      :kendaraan-list="kendaraanList"
      @close="showModal = false"
      @save="handleSave"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted} from 'vue'
import api from '@/services/api'
import UpdatePengambilanModal from '@/components/updateStatusModal.vue'

const showModal = ref(false)
const selectedItem = ref(null)
const filterStatus = ref('')
const pengambilanData = ref([])
const kendaraanList = ref([])

async function fetchKendaraan() {
  const res = await api.get('/api/kendaraan')
  kendaraanList.value = res.data
}

async function fetchPengambilan() {
  try {
    // console.log('fetchPengambilan - token', localStorage.getItem('token'));
    // hit backend route that returns current daftar tugas for logged-in petugas

    await api.post('/api/daftar-tugas/generate');

    const res = await api.get('/api/daftar-tugas');
    // console.log('GET /api/daftar-tugas response', res.data);
    pengambilanData.value = res.data;
  } catch (err) {
    console.error('Gagal ambil pengambilan', err);
  }
}

onMounted(() => {
    fetchPengambilan(),
    fetchKendaraan()
})

/* FILTER */
const filteredData = computed(() => {
  if (!filterStatus.value) return pengambilanData.value
  return pengambilanData.value.filter(
    i => i.status_angkut === filterStatus.value
  )
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

// function handleSave(payload) {
//   if (!selectedItem.value) return

//   selectedItem.value.status = payload.status
//   selectedItem.value.kendaraan = payload.kendaraan
//   selectedItem.value.volume = payload.volume
//   selectedItem.value.volumeUnit = payload.unit
//   selectedItem.value.notes = payload.notes

//   if (payload.status === 'done') {
//     selectedItem.value.lastPickup =
//       new Date().toLocaleDateString('id-ID', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric'
//       })
//   }

//   showModal.value = false
// }

// payload coming from modal has generic field names, convert to what backend expects
async function handleSave(payload) {
  if (!selectedItem.value) return;

  const body = {
    status_angkut: payload.status,
    id_kendaraan: payload.id_kendaraan || null,
    volume_sampah: payload.volume || null
  };

  try {
    await api.put(`/api/daftar-tugas/${selectedItem.value.id}/status`, body)
    showModal.value = false
    await fetchPengambilan()
  } catch (err) {
    console.error('Gagal update status', err)
  }
}

function statusText(status) {
  return {
    belum_diangkut: 'Belum Mulai',
    diangkut: 'Sedang Berlangsung',
    selesai: 'Selesai'
  }[status]
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

<style scoped src="@/assets/styles/petugas.css"></style>
