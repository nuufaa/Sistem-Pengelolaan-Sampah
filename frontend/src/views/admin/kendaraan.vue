<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Kelola Kendaraan</h2>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Kendaraan
      </button>
    </div>

    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nomor</th>
            <th>Plat</th>
            <th>Kapasitas</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(k, i) in kendaraanList" :key="k.id">
            <td>{{ i + 1 }}</td>
            <td>{{ k.nomor }}</td>
            <td>{{ k.plat }}</td>
            <td>{{ k.kapasitas }}</td>
            <td>
              <span class="status-badge" :class="k.status">
                {{ statusText(k.status) }}
              </span>
            </td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(k)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(k.id)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL COMPONENT -->
    <KendaraanModal
      v-if="showModal"
      :model-value="selected"
      @close="showModal = false"
      @save="save"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import KendaraanModal from '@/components/kendaraanModal.vue'

const showModal = ref(false)
const selected = ref({})

const kendaraanList = ref([
  {
    id: 1,
    nomor: 'Truck 01',
    plat: 'H 1234 AB',
    kapasitas: 5000,
    status: 'available'
  }
])

function openAdd() {
  selected.value = {
    id: null,
    nomor: '',
    plat: '',
    kapasitas: '',
    status: 'available'
  }
  showModal.value = true
}

function openEdit(k) {
  selected.value = { ...k }
  showModal.value = true
}

function save(data) {
  if (data.id) {
    const i = kendaraanList.value.findIndex(k => k.id === data.id)
    kendaraanList.value[i] = data
  } else {
    kendaraanList.value.push({ ...data, id: Date.now() })
  }
  showModal.value = false
}

function remove(id) {
  if (confirm('Hapus kendaraan ini?')) {
    kendaraanList.value = kendaraanList.value.filter(k => k.id !== id)
  }
}

function statusText(s) {
  return s === 'available' ? 'Tersedia' : 'Maintenance'
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>