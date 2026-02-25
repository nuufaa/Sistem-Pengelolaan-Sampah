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
          <tr v-for="(k, i) in kendaraanList" :key="k.id_kendaraan">
            <td>{{ i + 1 }}</td>
            <td>{{ k.nomor_kendaraan }}</td>
            <td>{{ k.nomor_polisi }}</td>
            <td>{{ k.kapasitas_angkut }}</td>
            <td>
              <span class="status-badge" :class="k.status_kendaraan">
                {{ statusText(k.status_kendaraan) }}
              </span>
            </td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(k)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(k.id_kendaraan)">
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
import api from '@/services/api'
import KendaraanModal from '@/components/kendaraanModal.vue'

const kendaraanList = ref([])
const showModal = ref(false)
const selected = ref(null)

async function fetchKendaraan() {
  try {
    const res = await api.get('/api/kendaraan')
    kendaraanList.value = res.data
  } catch (err) {
    console.error('Gagal ambil kendaraan', err)
  }
}

onMounted(fetchKendaraan)

function openAdd() {
  selected.value = {
    id_kendaraan: null,
    nomor_kendaraan: '',
    nomor_polisi: '',
    kapasitas_angkut: '',
    status_kendaraan: 'tersedia'
  }
  showModal.value = true
}

function openEdit(k) {
  selected.value = { ...k }
  showModal.value = true
}

async function save(data) {
  try {
    if (data.id_kendaraan) {
      // UPDATE
      await api.put(`/api/kendaraan/${data.id_kendaraan}`, data)
    } else {
      // CREATE
      await api.post('/api/kendaraan', data)
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
    await api.delete(`/api/kendaraan/${id}`)
    await fetchKendaraan()
  } catch (err) {
    console.error('Gagal hapus kendaraan', err)
  }
}

function statusText(s) {
  return s === 'tersedia' ? 'Tersedia' : 'Perbaikan'
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>