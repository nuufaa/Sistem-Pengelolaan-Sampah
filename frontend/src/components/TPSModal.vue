<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content modal-large">
      <div class="modal-header">
        <h2>{{ form.id ? 'Edit TPS' : 'Tambah TPS' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="form-row">
          <div class="form-group">
            <label>Nama TPS *</label>
            <input v-model="form.nama" required />
          </div>

          <div class="form-group">
            <label>Desa *</label>
            <select v-model="form.desa" required>
              <option value="">Pilih Desa</option>
              <option>Desa A</option>
              <option>Desa B</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Kapasitas (%) *</label>
            <input type="number" v-model.number="form.kapasitas" min="0" max="100" />
          </div>

          <div class="form-group">
            <label>Status *</label>
            <select v-model="form.status">
              <option value="normal">Normal</option>
              <option value="warning">Hampir Penuh</option>
              <option value="danger">Penuh</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Lokasi *</label>
          <div class="location-input">
            <input readonly :value="form.lat" placeholder="Latitude" />
            <input readonly :value="form.lng" placeholder="Longitude" />
            <button type="button" class="btn-secondary" @click="showMap = true">
              <span class="material-icons">map</span>
              Pilih di Peta
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">
            Batal
          </button>
          <button class="btn-primary">
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