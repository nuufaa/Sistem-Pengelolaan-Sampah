<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Jam Operasional</h2>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Jam
      </button>
    </div>

    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Jam Buang Mulai</th>
            <th>Jam Buang Selesai</th>
            <th>Jam Pengambilan Mulai</th>
            <th>Jam Pengambilan Selesai</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(jo, i) in jamOperasionalList" :key="jo.id_operasional">
            <td>{{ i + 1 }}</td>
            <td>{{ jo.jam_buang_mulai }}</td>
            <td>{{ jo.jam_buang_selesai }}</td>
            <td>{{ jo.jam_ambil_mulai }}</td>
            <td>{{ jo.jam_ambil_selesai }}</td>
            <td class="action-buttons">
              <button class="btn-action edit" @click="openEdit(jo)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(jo.id_operasional)">
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
        v-for="(jo) in jamOperasionalList" 
        :key="jo.id_operasional"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ jo.jam_buang_mulai }}
            </div>
            <div class="data-card-subtitle">
              {{ jo.jam_buang_selesai }}
            </div>
            <div class="data-card-title">
              {{ jo.jam_ambil_mulai }}
            </div>
            <div class="data-card-subtitle">
              {{ jo.jam_ambil_selesai }}
            </div>
          </div>
        </div>

        <div class="data-card-footer">
          <button class="btn-card-action edit" @click="openEdit(jo)">
            <span class="material-icons">edit</span>
            Edit
          </button>

          <button class="btn-card-action delete" @click="remove(jo.id_operasional)">
            <span class="material-icons">delete</span>
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL COMPONENT -->
    <jamOperasionalModal
      v-if="showModal"
      :model-value="selected"
      @close="showModal = false"
      @save="save"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import api from '@/services/api'
import jamOperasionalModal from '@/components/jamOperasionalModal.vue'

const jamOperasionalList = ref([])
const showModal = ref(false)
const selected = ref(null)

async function fetchjamOperasional() {
  try {
    const res = await api.get('/api/jam-operasional')
    jamOperasionalList.value = res.data
  } catch (err) {
    console.error('Gagal ambil data', err)
  }
}

onMounted(fetchjamOperasional)

onActivated(() => {
  fetchjamOperasional()
})

function openAdd() {
  selected.value = {
    id_operasional: null,
    jam_buang_mulai: '',
    jam_buang_selesai: '',
    jam_ambil_mulai: '',
    jam_ambil_selesai: ''
  }
  showModal.value = true
}

function openEdit(jo) {
  selected.value = { ...jo }
  showModal.value = true
}

async function save(data) {
  try {
    if (data.id_operasional) {
      // UPDATE
      await api.put(`/api/jam-operasional/${data.id_operasional}`, data)

    } else {
      // CREATE
      await api.post('/api/jam-operasional', data)
    }
    await fetchjamOperasional()
    showModal.value = false
  } catch (err) {
    console.error('Gagal simpan data', err)
    console.log(err.response.data) 
    console.log('ERROR BACKEND:', err.response?.data)
  }
}

async function remove(id) {
  if (!confirm('Yakin ingin menghapus data ini?')) return

  try {
    await api.delete(`/api/jam-operasional/${id}`)
    await fetchjamOperasional()
  } catch (err) {
    console.error('Gagal hapus', err)
  }
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>