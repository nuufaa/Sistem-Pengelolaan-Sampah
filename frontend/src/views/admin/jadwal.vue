<template>
  <section class="content-section active">
    <!-- Header -->
    <div class="section-header">
      <h2>Kelola Jadwal Pengambilan</h2>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Jadwal
      </button>
    </div>

    <!-- Desktop Table -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>TPS</th>
            <th>Petugas</th>
            <th>Hari Pengambilan</th>
            <th>Terakhir Diambil</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(j, i) in jadwalList" :key="j.id_jadwal">
            <td>{{ i + 1 }}</td>
            <td>{{ j.nama_tps }}</td>
            <td>{{ j.nama}}</td>
            <td>Setiap {{ j.hari_pengambilan }}</td>
            <td>{{ formatDate(j.tgl_terakhir_diambil) }}</td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(j)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(j.id_jadwal)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL COMPONENT -->
    <JadwalModal
      v-if="showModal"
      :model-value="form"
      :tps-list="tpsList"
      :petugas-list="petugasList"
      @save="save"
      @close="showModal = false"
    />
  </section>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import api from '@/services/api'
import JadwalModal from '@/components/jadwalModal.vue'
import { toIndex } from '@/services/hariJadwal'

const jadwalList = ref([])
const tpsList = ref([])
const showModal = ref(false)
const form = ref(null)
const petugasList = ref([])

async function fetchJadwal() {
  const res = await api.get('/api/jadwal')
  jadwalList.value = res.data
}

async function fetchTPS() {
  const res = await api.get('/api/tps')
  tpsList.value = res.data
}

async function fetchPetugas() {
  const res = await api.get('/api/petugas')
  petugasList.value = res.data
}

onMounted(() => {
  fetchPetugas()
  fetchJadwal()
  fetchTPS()
})

/* METHODS */
function openAdd() {
  form.value = {
    id_jadwal: null,
    id_tps: ' ',
    id_petugas: ' ',
    hari_pengambilan: ' ',
    tgl_terakhir_diambil: null
  }
  showModal.value = true
}

function openEdit(jadwal) {
  form.value = {
    ...jadwal,
    hari_pengambilan:
      typeof jadwal.hari_pengambilan === 'string'
        ? toIndex(jadwal.hari_pengambilan)
        : jadwal.hari_pengambilan
  }

  showModal.value = true
}

async function save(data) {
  try {
    const payload = {
      ...data,
      hari_pengambilan:
        typeof data.hari_pengambilan === 'string'
          ? toIndex(data.hari_pengambilan)
          : data.hari_pengambilan
    }

    if (data.id_jadwal) {
      await api.put(`/api/jadwal/${data.id_jadwal}`, payload)
    } else {
      await api.post('/api/jadwal', payload)
    }

    showModal.value = false
    await fetchJadwal()

  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan jadwal')
  }
}

async function remove(id) {
  if (confirm('Hapus jadwal ini?')) {
    await api.delete(`/api/jadwal/${id}`)
    await fetchJadwal()
  }
}

function getTPS(id) {
  return tpsList.value.find(t => t.id_tps === Number(id))
}

function formatDate(date) {
  if (!date) return 'Belum pernah diambil'

  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>