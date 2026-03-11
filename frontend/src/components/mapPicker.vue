<template>
  <div class="modal-overlay-wrapper" @click.self="$emit('close')">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-header d-flex justify-content-between align-items-center">
        <h3 class="modal-title">Pilih Lokasi TPS</h3>
        <button type="button" class="btn-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div ref="mapEl" class="map-container"></div>

      <div class="modal-footer d-flex gap-2 justify-content-end">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">Batal</button>
        <button type="button" class="btn btn-primary" @click="confirm">
          <span class="material-icons">check</span>
          Pilih Lokasi Ini
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import L from 'leaflet'

const props = defineProps({
  lat: Number,
  lng: Number,
  mode: {
    type: String,
    default: 'default'
  }
})
const emit = defineEmits(['select', 'close'])

const mapEl = ref(null)
let map, marker
let selected = { lat: props.lat, lng: props.lng }

onMounted(() => {

  // koordinat default sembalun bumbung
  const defaultLat = -8.384399
  const defaultLng = 116.542617

  map = L.map(mapEl.value).setView(
    [defaultLat, defaultLng],
    15
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map)

  marker = L.marker([defaultLat, defaultLng]).addTo(map)

  selected = { lat: defaultLat, lng: defaultLng }

  // jika mode current → ambil lokasi user
  if (props.mode === 'current') {
    getCurrentLocation()
  }

  // jika ada lat lng dari parent
  if (props.lat && props.lng) {
    marker.setLatLng([props.lat, props.lng])
    map.setView([props.lat, props.lng], 16)

    selected = {
      lat: props.lat,
      lng: props.lng
    }
  }

  map.on('click', e => {
    selected = e.latlng
    marker.setLatLng(selected)
  })

})

function getCurrentLocation() {

  if (!navigator.geolocation) {
    alert("Browser tidak mendukung lokasi")
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {

      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      selected = { lat, lng }

      marker.setLatLng([lat, lng])
      map.setView([lat, lng], 17)

    },
    (err) => {
      console.error(err)
      alert("Gagal mengambil lokasi")
    },
    { enableHighAccuracy: true }
  )

}

function confirm() {
  emit('select', selected)
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
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-fullscreen {
  width: 90%;
  height: 85vh;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
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

.map-container {
  flex: 1;
  min-height: 400px;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  gap: 0.5rem;
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

.justify-content-end {
  justify-content: flex-end;
}

.align-items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .modal-dialog {
    border-radius: 12px 12px 0 0;
  }

  .modal-fullscreen {
    width: 100%;
    height: 90vh;
  }
}
</style>