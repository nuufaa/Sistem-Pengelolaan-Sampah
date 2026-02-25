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
            <th>No. HP</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(p, i) in petugasList" :key="p.id_petugas">
            <td>{{ i + 1 }}</td>
            <td>{{ p.nama }}</td>
            <td>{{ p.no_telp }}</td>
            <td>
              <span class="status-badge" :class="p.status_petugas">
                {{ p.status_petugas === 'aktif' ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(p)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(p.id_petugas)">
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
import { onMounted, ref } from 'vue'
import PetugasModal from '@/components/petugasModal.vue'

const petugasList = ref([])
const showModal = ref(false)
const form = ref(null)

async function fetchPetugas() {
  const res = await api.get('/api/petugas')
  petugasList.value = res.data
}

onMounted(fetchPetugas)

/* METHODS */
function openAdd() {
  form.value = {
    id_petugas: null,
    nama: '',
    no_telp: '',
    status_petugas: 'aktif'
  }
  showModal.value = true
}

function openEdit(p) {
  form.value = { ...p }
  showModal.value = true
}

// function save(data) {
//   if (data.id) {
//     const i = petugasList.value.findIndex(p => p.id === data.id)
//     petugasList.value[i] = data
//   } else {
//     petugasList.value.push({
//       ...data,
//       id: Date.now()
//     })
//   }
//   showModal.value = false
// }

// function remove(id) {
//   if (confirm('Hapus petugas ini?')) {
//     petugasList.value = petugasList.value.filter(p => p.id !== id)
//   }
// }
// </script>

async function save(data) {
  if (data.id_petugas) {
    await api.put(`/api/petugas/${data.id_petugas}`, data)
  } else {
    await api.post('/api/petugas', data)
  }
  showModal.value = false
  await fetchPetugas()
}

async function remove(id) {
  if (confirm('Hapus petugas ini?')) {
    await api.delete(`/api/petugas/${id}`)
    await fetchPetugas()
  }
}

<style scoped src="@/assets/styles/admin.css"></style>