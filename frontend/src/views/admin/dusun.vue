<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Kelola Dusun</h2>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Dusun
      </button>
    </div>

    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Dusun</th>
            <th>Jumlah KK</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(k, i) in dusunList" :key="k.id_dusun">
            <td>{{ i + 1 }}</td>
            <td>{{ k.nama_dusun }}</td>
            <td>{{ k.jumlah_kk }}</td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(k)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(k.id_dusun)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="card-list mobile-only">
      <div 
        class="data-card" 
        v-for="(k, i) in dusunList" 
        :key="k.id_dusun"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ k.nama_dusun }}
            </div>
            <div class="data-card-subtitle">
              {{ k.jumlah_kk }}
            </div>
          </div>
        </div>

        <div class="data-card-footer">
          <button class="btn-card-action edit" @click="openEdit(k)">
            <span class="material-icons">edit</span>
            Edit
          </button>

          <button class="btn-card-action delete" @click="remove(k.id_dusun)">
            <span class="material-icons">delete</span>
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL COMPONENT -->
    <dusunModal
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
import dusunModal from '@/components/dusunModal.vue'

const dusunList = ref([])
const showModal = ref(false)
const selected = ref(null)

async function fetchDusun() {
  try {
    const res = await api.get('/api/dusun')
    dusunList.value = res.data
  } catch (err) {
    console.error('Gagal ambil data dusun', err)
  }
}

onMounted(fetchDusun)

function openAdd() {
  selected.value = {
    id_dusun: null,
    nama_dusun: '',
    jumlah_kk: ''
  }
  showModal.value = true
}

function openEdit(k) {
  selected.value = { ...k }
  showModal.value = true
}

async function save(data) {
  try {
    if (data.id_dusun) {
      // UPDATE
      await api.put(` /api/dusun/${data.id_dusun}`, data)
    } else {
      // CREATE
      await api.post('/api/dusun', data)
    }
    await fetchDusun()
    showModal.value = false
  } catch (err) {
    console.error('Gagal simpan dusun', err)
  }
}

async function remove(id) {
  if (!confirm('Yakin ingin menghapus dusun ini?')) return

  try {
    await api.delete(`/api/dusun/${id}`)
    await fetchDusun()
  } catch (err) {
    console.error('Gagal hapus kendaraan', err)
  }
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>