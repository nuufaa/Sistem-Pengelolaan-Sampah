<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ localForm.id_petugas ? 'Edit Petugas' : 'Tambah Petugas' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="form-group">
          <label>Nama Lengkap *</label>
          <input v-model="localForm.nama" required />
        </div>

        <div class="form-group">
          <label>No. HP *</label>
          <input v-model="localForm.no_telp" required />
        </div>

        <div class="form-group">
          <label>Status *</label>
          <select v-model="localForm.status_petugas" required>
            <option value=1>Aktif</option>
            <option value=0>Non-Aktif</option>
          </select>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn-secondary"
            @click="$emit('close')"
          >
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
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: Object
})

const emit = defineEmits(['save', 'close'])

const localForm = reactive({
  id_petugas: null,
  nama: '',
  no_telp: '',
  status_petugas: 'aktif'
})

watch(
  () => props.modelValue,
  val => {
    Object.assign(
      localForm,
      val || {
        id_petugas: null,
        nama: '',
        no_telp: '',
        status_petugas: 'aktif'
      }
    )
  },
  { immediate: true }
)

// function submit() {
//   emit('save', { ...localForm })
// }

function submit() {
  if (!localForm.nama || !localForm.no_telp) {
    alert('Nama dan No HP wajib diisi')
    return
  }
  
  emit('save', { ...localForm })
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>