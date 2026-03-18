<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Kelola Titik Pengambilan Sampah (TPS)</h2>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah TPS
      </button>
    </div>

    <div class="table-container">
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
            <th>Foto TPS</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(tps, i) in tpsList" :key="tps.id_tps">
            <td>{{ i + 1 }}</td>
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
            <td>{{ tps.foto_tps || '-' }}</td>
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
import { ref, onMounted } from 'vue'
import { apiFetch } from '../../services/api'
import TPSModal from '@/components/TPSModal.vue'

const showModal = ref(false)
const selectedTPS = ref(null)
const dusunList = ref([])
const tpsList = ref([])

async function fetchTPS() {
  try {
    const data = await apiFetch("/api/tps")
    console.log(data)
    tpsList.value = data
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

onMounted(() => {
  fetchTPS()
  fetchDusun()
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

    fetchTPS();
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
</script>

<style scoped src="@/assets/styles/admin.css"></style>
