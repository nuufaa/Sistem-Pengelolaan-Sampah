<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ local.id_dusun ? 'Edit Dusun' : 'Tambah Dusun' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="form-group">
          <label>Dusun</label>
          <input v-model="local.nama_dusun" placeholder="Masukkan nama dusun" required />
        </div>

        <div class="form-group">
          <label>Jumlah KK</label>
          <input v-model="local.jumlah_kk" placeholder="Masukkan jumlah kk" required />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">
            Batal
          </button>
          <button type="submit" class="btn-primary">
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
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

const local = reactive({
  id_dusun: null,
  nama_dusun: '',
  jumlah_kk: ''
})

watch(
  () => props.modelValue,
  val => Object.assign(local, val),
  { immediate: true }
)

function submit() {
  emit('save', { ...local })
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>