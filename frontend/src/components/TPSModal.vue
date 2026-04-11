<template>
  <div class="modal-overlay-wrapper" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg">
      <div class="modal-header d-flex justify-content-between align-items-center">
        <h3 class="modal-title">{{ form.id_tps ? 'Edit TPS' : 'Tambah TPS' }}</h3>
        <button type="button" class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label">Nama TPS *</label>
          <input type="text" v-model="form.nama_tps" class="form-control" placeholder="Nama TPS" required />
        </div>

        <div class="form-group">
          <label class="form-label">Alamat *</label>
          <input type="text" v-model="form.alamat" class="form-control" placeholder="Alamat" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Dusun *</label>
            <select v-model="form.id_dusun" class="form-control" required>
              <option value="">Pilih Dusun</option>
              <option v-for="dusun in dusunList" 
              :key="dusun.id_dusun" 
              :value="Number(dusun.id_dusun)"
            >
              {{ dusun.nama_dusun }}
            </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Kapasitas TPS (Kg) *</label>
            <input type="number" v-model.number="form.kapasitas" class="form-control" min="0" placeholder="0" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Status *</label>
          <select v-model="form.status_tps" class="form-control" required>
            <option value="normal">Normal</option>
            <option value="hampir_penuh">Hampir Penuh</option>
            <option value="penuh">Penuh</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Lokasi (Latitude, Longitude) *</label>
          <div class="location-wrapper">
            <div class="location-coordinates">
              <input
                type="number"
                step="any"
                v-model.number="form.latitude"
                class="form-control"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="any"
                v-model.number="form.longitude"
                class="form-control"
                placeholder="Longitude"
              />
            </div>
          </div>
          <div class="location-actions">
            <button type="button" class="btn btn-secondary" @click="openMap">
              <span class="material-icons">map</span>
              Pilih di Peta
            </button>
            <button type="button" class="btn btn-info" @click="openCurrentMap">
              <span class="material-icons">my_location</span>
              Gunakan Lokasi Saya
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
      :lat="form.latitude"
      :lng="form.longitude"
      :mode="mapMode"
      @close="showMap = false"
      @select="setLocation"
    />
  </div>
</template>

<script setup>
import { watch, ref} from 'vue'
import MapPicker from './mapPicker.vue'

const props = defineProps({
  tps: Object,
  dusunList: Array
})

const emit = defineEmits(['save', 'close'])
const showMap = ref(false)
const previewImage = ref(null)
const mapMode = ref("default")

const form = ref({
  id_tps: null,
  nama_tps: '',
  alamat: '',
  id_dusun: '',
  latitude: null,
  longitude: null,
  kapasitas: '',
  status_tps: '',
  foto_tps: ''
})

watch(
  () => props.tps,
  (val) => {
    if (val) {
      Object.assign(form.value, val)

      if (val.foto_tps) {
        previewImage.value = `http://localhost:3000/uploads/${val.foto_tps}`
      }
    }
  },
  { immediate: true }
)

function setLocation({ lat, lng }) {
  form.value.latitude = lat
  form.value.longitude = lng
  showMap.value = false
}

function openMap(){
  mapMode.value = "default"
  showMap.value = true
}

function openCurrentMap(){
  mapMode.value = "current"
  showMap.value = true
}

function submit() {
  emit('save', { ...form.value })
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>