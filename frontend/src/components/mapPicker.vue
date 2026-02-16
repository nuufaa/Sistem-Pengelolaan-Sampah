<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content modal-fullscreen">
      <div class="modal-header">
        <h2>Pilih Lokasi TPS</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body" style="padding:0">
        <div ref="mapEl" style="height:100%" />
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">Batal</button>
        <button class="btn-primary" @click="confirm">
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
  lng: Number
})
const emit = defineEmits(['select', 'close'])

const mapEl = ref(null)
let map, marker
let selected = { lat: props.lat, lng: props.lng }

onMounted(() => {
  map = L.map(mapEl.value).setView([props.lat, props.lng], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  marker = L.marker([props.lat, props.lng]).addTo(map)

  map.on('click', e => {
    selected = e.latlng
    marker.setLatLng(selected)
  })
})

function confirm() {
  emit('select', selected)
}
</script>