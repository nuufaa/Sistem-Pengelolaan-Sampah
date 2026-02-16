<template>
  <section class="content-section">
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
            <th>Desa</th>
            <th>Lokasi</th>
            <th>Kapasitas</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(tps, i) in tpsList" :key="tps.id">
            <td>{{ i + 1 }}</td>
            <td>{{ tps.nama }}</td>
            <td>{{ tps.desa }}</td>
            <td>{{ tps.lat }}, {{ tps.lng }}</td>
            <td>{{ tps.kapasitas }}%</td>
            <td>
              <span class="status-badge" :class="tps.status">
                {{ statusText(tps.status) }}
              </span>
            </td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(tps)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(tps.id)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <TPSModal
      v-if="showModal"
      :tps="selectedTPS"
      @close="closeModal"
      @save="saveTPS"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import TPSModal from '@/components/TPSModal.vue'

const showModal = ref(false)
const selectedTPS = ref(null)

const tpsList = ref([
  {
    id: 1,
    nama: 'TPS A1 – Pasar Utara',
    desa: 'Desa A',
    lat: -8.5833,
    lng: 116.1167,
    kapasitas: 65,
    status: 'warning'
  }
])

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

function saveTPS(data) {
  if (data.id) {
    const i = tpsList.value.findIndex(t => t.id === data.id)
    tpsList.value[i] = data
  } else {
    data.id = Date.now()
    tpsList.value.push(data)
  }
  closeModal()
}

function remove(id) {
  if (confirm('Hapus TPS ini?')) {
    tpsList.value = tpsList.value.filter(t => t.id !== id)
  }
}

function statusText(status) {
  return {
    normal: 'Normal',
    warning: 'Hampir Penuh',
    danger: 'Penuh'
  }[status]
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>


<!-- <template>
  <section class="content-section">
    <h2>Kelola Titik Pengambilan Sampah (TPS)</h2>
    <p>Jika teks ini muncul, berarti router & layout AMAN.</p>
  </section>
</template>

<script setup>
</script> -->
