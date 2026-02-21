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

    <!-- TABLE -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>NIP</th>
            <th>No. HP</th>
            <th>Desa</th>
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

    <!-- MODAL COMPONENT -->
    <PetugasModal
      v-if="showModal"
      :model-value="form"
      @save="save"
      @close="showModal = false"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import PetugasModal from '@/components/petugasModal.vue'

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

const showModal = ref(false)
const form = ref(null)

/* METHODS */
function openAdd() {
  form.value = {
    id: null,
    nama: '',
    nip: '',
    hp: '',
    desa: '',
    status: 'aktif'
  }
  showModal.value = true
}

function openEdit(p) {
  form.value = { ...p }
  showModal.value = true
}

function save(data) {
  if (data.id) {
    const i = petugasList.value.findIndex(p => p.id === data.id)
    petugasList.value[i] = data
  } else {
    petugasList.value.push({
      ...data,
      id: Date.now()
    })
  }
  showModal.value = false
}

function remove(id) {
  if (confirm('Hapus petugas ini?')) {
    petugasList.value = petugasList.value.filter(p => p.id !== id)
  }
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>