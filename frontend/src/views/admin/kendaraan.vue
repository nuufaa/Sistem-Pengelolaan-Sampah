<!-- <template>
  <div>
    <h2>Kelola Kendaraan</h2>
  </div>
</template> -->

<template>
  <section class="content-section">
    <!-- Header -->
    <div class="section-header">
      <h2>Kelola Kendaraan</h2>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Kendaraan
      </button>
    </div>

    <!-- Desktop Table -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nomor Kendaraan</th>
            <th>Plat Nomor</th>
            <th>Kapasitas (kg)</th>
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

    <!-- MODAL -->
    <div class="modal show" v-if="showModal">
      <div class="modal-overlay" @click="closeModal"></div>

      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ form.id ? 'Edit Kendaraan' : 'Tambah Kendaraan' }}</h2>
          <button class="modal-close" @click="closeModal">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form class="modal-body" @submit.prevent="save">
          <div class="form-group">
            <label>Nomor Kendaraan</label>
            <input v-model="form.nomor" required placeholder="Truck 01" />
          </div>

          <div class="form-group">
            <label>Plat Nomor</label>
            <input v-model="form.plat" required placeholder="H 1234 AB" />
          </div>

          <div class="form-group">
            <label>Kapasitas (kg)</label>
            <input
              type="number"
              v-model.number="form.kapasitas"
              required
            />
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="available">Tersedia</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">
              Batal
            </button>
            <button type="submit" class="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

/* ======================
   STATE
====================== */
const showModal = ref(false)

const kendaraanList = ref([
  {
    id: 1,
    nomor: 'Truck 01',
    plat: 'H 1234 AB',
    kapasitas: 5000,
    status: 'available'
  }
])

const form = ref({
  id: null,
  nomor: '',
  plat: '',
  kapasitas: '',
  status: 'available'
})

/* ======================
   METHODS
====================== */
function openAdd() {
  resetForm()
  showModal.value = true
}

function openEdit(k) {
  form.value = { ...k }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function save() {
  if (form.value.id) {
    const i = kendaraanList.value.findIndex(
      k => k.id === form.value.id
    )
    kendaraanList.value[i] = { ...form.value }
  } else {
    kendaraanList.value.push({
      ...form.value,
      id: Date.now()
    })
  }
  closeModal()
}

function remove(id) {
  if (confirm('Hapus kendaraan ini?')) {
    kendaraanList.value = kendaraanList.value.filter(
      k => k.id !== id
    )
  }
}

function resetForm() {
  form.value = {
    id: null,
    nomor: '',
    plat: '',
    kapasitas: '',
    status: 'available'
  }
}

function statusText(status) {
  return status === 'available'
    ? 'Tersedia'
    : 'Maintenance'
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>