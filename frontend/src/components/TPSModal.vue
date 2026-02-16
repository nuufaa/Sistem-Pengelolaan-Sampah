<template>
  <div class="modal-overlay-wrapper" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg">
      <div class="modal-header d-flex justify-content-between align-items-center">
        <h3 class="modal-title">{{ form.id ? 'Edit TPS' : 'Tambah TPS' }}</h3>
        <button type="button" class="btn-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label">Nama TPS *</label>
          <input type="text" v-model="form.nama" class="form-control" placeholder="Nama TPS" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Desa *</label>
            <select v-model="form.desa" class="form-control" required>
              <option value="">Pilih Desa</option>
              <option>Desa A</option>
              <option>Desa B</option>
              <option>Desa C</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Kapasitas (%) *</label>
            <input type="number" v-model.number="form.kapasitas" class="form-control" min="0" max="100" placeholder="0-100" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Status *</label>
          <select v-model="form.status" class="form-control" required>
            <option value="normal">Normal</option>
            <option value="warning">Hampir Penuh</option>
            <option value="danger">Penuh</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Lokasi (Latitude, Longitude) *</label>
          <div class="location-input-group">
            <input type="number" step="0.0001" readonly v-model.number="form.lat" class="form-control" placeholder="Latitude" />
            <input type="number" step="0.0001" readonly v-model.number="form.lng" class="form-control" placeholder="Longitude" />
            <button type="button" class="btn btn-secondary" @click="showMap = true">
              <span class="material-icons">map</span>
              Pilih di Peta
            </button>
          </div>
        </div>

        <div class="modal-footer d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Batal
          </button>
          <button type="submit" class="btn btn-primary">
            <span class="material-icons">save</span>
            Simpan
          </button>
        </div>
      </form>
    </div>

    <MapPicker
      v-if="showMap"
      :lat="form.lat"
      :lng="form.lng"
      @close="showMap = false"
      @select="setLocation"
    />
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import MapPicker from './mapPicker.vue'

const props = defineProps({
  tps: Object
})
const emit = defineEmits(['save', 'close'])

const showMap = ref(false)

const form = reactive({
  id: null,
  nama: '',
  desa: '',
  lat: -8.5833,
  lng: 116.1167,
  kapasitas: 0,
  status: 'normal'
})

watch(
  () => props.tps,
  val => {
    if (val) Object.assign(form, val)
  },
  { immediate: true }
)

function setLocation({ lat, lng }) {
  form.lat = lat
  form.lng = lng
  showMap.value = false
}

function submit() {
  emit('save', { ...form })
}
</script>

<style scoped>
.modal-overlay-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-lg {
  max-width: 700px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #212121;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.location-input-group {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  align-items: end;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.justify-content-end {
  justify-content: flex-end;
}

.align-items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 600px) {
  .modal-dialog {
    width: 95%;
    border-radius: 12px 12px 0 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .location-input-group {
    grid-template-columns: 1fr;
  }
}
</style>