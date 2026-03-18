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
            <th>Username</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(p, i) in petugasList" :key="p.id_petugas">
            <td>{{ i + 1 }}</td>
            <td>{{ p.nama }}</td>
            <td>{{ p.no_telp }}</td>
            <td>{{ p.username }}</td>
            <td>
              <span class="status-badge" :class="p.status_petugas">
                {{ p.status_petugas === 1 ? 'Aktif' : 'Non-Aktif' }}
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
import api from '@/services/api'
import PetugasModal from '@/components/petugasModal.vue'

const petugasList = ref([])
const showModal = ref(false)
const form = ref(null)

async function fetchPetugas() {
  const res = await api.get('/api/petugas')
  petugasList.value = res.data
}

onMounted(fetchPetugas)

function openAdd() {
  form.value = {
    id_petugas: null,
    nama: '',
    no_telp: '',
    username: '',
    password: '',
    status_petugas: '1'
  }
  showModal.value = true
}

function openEdit(p) {
  form.value = {
    id_petugas: p.id_petugas,
    nama: p.nama,
    no_telp: p.no_telp,
    username: p.username,
    password: '',
    status_petugas: p.status_petugas
  }
  showModal.value = true
}

async function save(data) {
  try {
    const payload = {
      nama: data.nama,
      no_telp: data.no_telp,
      username: data.username,
      password: data.password,
      status_petugas: data.status_petugas,
      id_admin: data.id_admin
    }
  
    if (data.id_petugas) {
      await api.put(`/api/petugas/${data.id_petugas}`, payload)
    } else {
      await api.post('/api/petugas', payload)
    }
  
    showModal.value = false
    await fetchPetugas()
    
  } catch (error) {
    console.error('Gagal simpan petugas', error)
  }
}

async function remove(id) {
  if (!confirm('Yakin ingin menghapus petugas ini?')) return

  try {
    await api.delete(`/api/petugas/${id}`)
    await fetchPetugas()
  } catch (err) {
    console.error('Gagal hapus petugas', err)
  }
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>