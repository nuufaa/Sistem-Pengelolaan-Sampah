<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ localForm.id ? 'Edit Jadwal' : 'Tambah Jadwal' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="form-group">
          <label>TPS</label>
          <select v-model.number="localForm.tpsId" required>
            <option value="">Pilih TPS</option>
            <option
              v-for="t in tpsList"
              :key="t.id"
              :value="t.id"
            >
              {{ t.nama }} (Desa {{ t.desa }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Interval Pengambilan (Hari)</label>
          <input
            type="number"
            min="1"
            max="30"
            v-model.number="localForm.interval"
            required
          />
          <small>Pengambilan dilakukan setiap N hari</small>
        </div>

        <div class="form-group">
          <label>Terakhir Diambil</label>
          <input type="date" v-model="localForm.lastPickup" required />
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
  modelValue: Object,
  tpsList: Array
})

const emit = defineEmits(['save', 'close'])

const localForm = reactive({
  id: null,
  tpsId: '',
  interval: 1,
  lastPickup: ''
})

watch(
  () => props.modelValue,
  val => {
    Object.assign(localForm, val || {
      id: null,
      tpsId: '',
      interval: 1,
      lastPickup: ''
    })
  },
  { immediate: true }
)

function submit() {
  emit('save', { ...localForm })
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>