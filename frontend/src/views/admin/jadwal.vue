<!-- <template>
  <div>
    <h2>Kelola Jadwal Pengambilan</h2>
  </div>
</template> -->

<template>
  <section class="content-section">
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
            <th>Desa</th>
            <th>Interval (Hari)</th>
            <th>Terakhir Diambil</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(j, i) in jadwalList" :key="j.id">
            <td>{{ i + 1 }}</td>
            <td>{{ getTPS(j.tpsId)?.nama }}</td>
            <td>Desa {{ getTPS(j.tpsId)?.desa }}</td>
            <td>Setiap {{ j.interval }} hari</td>
            <td>{{ formatDate(j.lastPickup) }}</td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(j)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(j.id)">
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
          <h2>{{ form.id ? 'Edit Jadwal' : 'Tambah Jadwal' }}</h2>
          <button class="modal-close" @click="closeModal">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form class="modal-body" @submit.prevent="save">
          <div class="form-group">
            <label>TPS</label>
            <select v-model.number="form.tpsId" required>
              <option value="">Pilih TPS</option>
              <option
                v-for="t in tpsList"
                :key="t.id"
                :value="t.id"
              >
                {{ t.nama }} (Desa {{ t.desa }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Interval Pengambilan (Hari)</label>
            <input
              type="number"
              min="1"
              max="30"
              v-model.number="form.interval"
              required
            />
            <small>Pengambilan dilakukan setiap N hari</small>
          </div>

          <div class="form-group">
            <label>Terakhir Diambil</label>
            <input type="date" v-model="form.lastPickup" required />
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
   DUMMY TPS (nanti ganti API / Pinia)
====================== */
const tpsList = ref([
  { id: 1, nama: 'TPS Pasar Utara', desa: 'A' },
  { id: 2, nama: 'TPS Masjid Besar', desa: 'B' }
])

/* ======================
   STATE
====================== */
const showModal = ref(false)

const jadwalList = ref([
  {
    id: 1,
    tpsId: 1,
    interval: 3,
    lastPickup: '2026-01-13'
  }
])

const form = ref({
  id: null,
  tpsId: '',
  interval: 1,
  lastPickup: ''
})

/* ======================
   METHODS
====================== */
function openAdd() {
  resetForm()
  showModal.value = true
}

function openEdit(j) {
  form.value = { ...j }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function save() {
  if (form.value.id) {
    const i = jadwalList.value.findIndex(
      j => j.id === form.value.id
    )
    jadwalList.value[i] = { ...form.value }
  } else {
    jadwalList.value.push({
      ...form.value,
      id: Date.now()
    })
  }
  closeModal()
}

function remove(id) {
  if (confirm('Hapus jadwal ini?')) {
    jadwalList.value = jadwalList.value.filter(
      j => j.id !== id
    )
  }
}

function resetForm() {
  form.value = {
    id: null,
    tpsId: '',
    interval: 1,
    lastPickup: ''
  }
}

function getTPS(id) {
  return tpsList.value.find(t => t.id === id)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>
