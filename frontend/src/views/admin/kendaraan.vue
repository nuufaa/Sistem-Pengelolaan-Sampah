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
import { ref, onMounted } from 'vue'
import api, { apiFetch } from '@/services/api'
import KendaraanModal from '@/components/kendaraanModal.vue'

const showModal = ref(false)
const selected = ref({})

const kendaraanList = ref([])

async function fetchKendaraan() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('TOKEN_NOT_FOUND')
    }

    const res = await api.get('/kendaraan',{
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    )
    kendaraanList.value = res.data
  } catch (err) {
    console.error('Gagal ambil kendaraan', err)
  }
}

onMounted(fetchKendaraan)

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

async function save(data) {
  try {
    if (data.id) {
      // UPDATE
      await api.put(`/kendaraan/${data.id}`, data)
    } else {
      // CREATE
      await api.post('/kendaraan', data)
    }
    await fetchKendaraan()
    showModal.value = false
  } catch (err) {
    console.error('Gagal simpan kendaraan', err)
  }
}

async function remove(id) {
  if (!confirm('Yakin ingin menghapus kendaraan ini?')) return

  try {
    await api.delete(`/kendaraan/${id}`)
    await fetchKendaraan()
  } catch (err) {
    console.error('Gagal hapus kendaraan', err)
  }
}

function statusText(s) {
  return s === 'available' ? 'Tersedia' : 'Maintenance'
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>