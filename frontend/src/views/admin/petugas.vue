<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Kelola Data Petugas</h2>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Petugas
      </button>
    </div>

    <!-- TABLE DESKTOP -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Petugas</th>
            <th>NIP</th>
            <th>No. HP</th>
            <th>Desa Tugas</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(p, i) in petugasList" :key="p.id">
            <td>{{ i + 1 }}</td>
            <td>{{ p.nama }}</td>
            <td>{{ p.nip }}</td>
            <td>{{ p.hp }}</td>
            <td>Desa {{ p.desa }}</td>
            <td>
              <span class="status-badge" :class="p.status">
                {{ p.status === 'aktif' ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(p)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(p.id)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal show">
      <div class="modal-overlay" @click="closeModal"></div>

      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ form.id ? 'Edit Petugas' : 'Tambah Petugas' }}</h2>
          <button class="modal-close" @click="closeModal">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form class="modal-body" @submit.prevent="save">
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input v-model="form.nama" required />
          </div>

          <div class="form-group">
            <label>NIP *</label>
            <input v-model="form.nip" required />
          </div>

          <div class="form-group">
            <label>No. HP *</label>
            <input v-model="form.hp" required />
          </div>

          <div class="form-group">
            <label>Desa Tugas *</label>
            <select v-model="form.desa" required>
              <option value="">Pilih Desa</option>
              <option value="A">Desa A</option>
              <option value="B">Desa B</option>
              <option value="All">Semua Desa</option>
            </select>
          </div>

          <div class="form-group">
            <label>Status *</label>
            <select v-model="form.status" required>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">
              Batal
            </button>
            <button type="submit" class="btn-primary">
              <span class="material-icons">save</span>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'

/* DATA */
const petugasList = ref([
  {
    id: 1,
    nama: 'Budi Santoso',
    nip: '1987654321',
    hp: '08123456789',
    desa: 'A',
    status: 'aktif'
  }
])

/* MODAL */
const showModal = ref(false)

const form = reactive({
  id: null,
  nama: '',
  nip: '',
  hp: '',
  desa: '',
  status: 'aktif'
})

/* METHODS */
function openAdd() {
  resetForm()
  showModal.value = true
}

function openEdit(p) {
  Object.assign(form, p)
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function resetForm() {
  form.id = null
  form.nama = ''
  form.nip = ''
  form.hp = ''
  form.desa = ''
  form.status = 'aktif'
}

function save() {
  if (form.id) {
    const i = petugasList.value.findIndex(p => p.id === form.id)
    petugasList.value[i] = { ...form }
  } else {
    petugasList.value.push({
      ...form,
      id: Date.now()
    })
  }
  closeModal()
}

function remove(id) {
  if (confirm('Hapus petugas ini?')) {
    petugasList.value = petugasList.value.filter(p => p.id !== id)
  }
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>
