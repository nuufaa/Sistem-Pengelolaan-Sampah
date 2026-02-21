<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ modelValue.id ? 'Edit Kendaraan' : 'Tambah Kendaraan' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="form-group">
          <label>Nomor Kendaraan</label>
          <input v-model="local.nomor" required />
        </div>

        <div class="form-group">
          <label>Plat Nomor</label>
          <input v-model="local.plat" required />
        </div>

        <div class="form-group">
          <label>Kapasitas (kg)</label>
          <input type="number" v-model.number="local.kapasitas" required />
        </div>

        <div class="form-group">
          <label>Status</label>
          <select v-model="local.status">
            <option value="available">Tersedia</option>
            <option value="maintenance">Maintenance</option>
          </select>
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
  id: null,
  nomor: '',
  plat: '',
  kapasitas: '',
  status: 'available'
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