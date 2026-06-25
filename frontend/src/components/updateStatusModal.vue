<template>
  <div v-if="show" class="modal show">
    <div class="modal-overlay" @click="close" />

    <div class="modal-content">
      <!-- HEADER -->
      <div class="modal-header">
        <h2>Update Status Pengambilan</h2>
        <button class="modal-close" @click="close">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- BODY -->
      <div class="modal-body">
        <!-- INFO TPS -->
        <div class="tps-info">
          <h3>{{ data.nama_tps }}</h3>
          <p>Hari Pengambilan: {{ data.hari_pengambilan}}</p>
          <p>Kendaraan: 
            {{
              kendaraanList.find(k => k.id_kendaraan === form.id_kendaraan)?.nomor_kendaraan
                || '-- Pilih dimenu logbook  --'
              }}
          </p>
        </div>

        <!-- VOLUME -->
        <div class="form-group">
          <label>Volume Sampah</label>

          <div class="volume-unit-selector">
            <label class="radio-option">
              <input type="radio" value="kg" v-model="form.unit" />
              Kilogram (kg)
            </label>

            <label class="radio-option">
              <input type="radio" value="percent" v-model="form.unit" />
              Persentase (%)
            </label>
          </div>

          <div class="volume-input-row">
            <input
              type="number"
              class="form-control"
              v-model="form.volume_sampah"
              :placeholder="form.unit === 'kg'
                ? 'Masukkan volume dalam kilogram'
                : 'Masukkan persentase (0–100)'"
              :max="form.unit === 'kg' ? 10000 : 100"
              required
            />
            <span class="volume-unit-label">
              {{ form.unit === 'kg' ? 'kg' : '%' }}
            </span>
          </div>
        </div>

        <!-- STATUS -->
        <div class="form-group">
          <label>Status Pengambilan</label>

          <div class="status-buttons">
            <button
              type="button"
              class="status-btn"
              :class="{ selected: form.status_angkut === 'belum_diangkut' }"
              @click="form.status_angkut = 'belum_diangkut'"
            >
              <span class="material-icons">pending</span>
              Belum Mulai
            </button>

            <button
              type="button"
              class="status-btn"
              :class="{ selected: form.status_angkut === 'selesai' }"
              @click="form.status_angkut = 'selesai'"
            >
              <span class="material-icons">check_circle</span>
              Selesai
            </button>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Batal</button>
        <button class="btn-primary" @click="submit">
          <span class="material-icons">save</span>
          Simpan Status
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  data: Object,
  kendaraanList: Array
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  id_kendaraan: '',
  volume_sampah: '',
  unit: 'kg',
  status_angkut: '',
  notes: ''
})

watch(() => props.data, (val) => {
    if (!val) return

    form.id_kendaraan = val.id_kendaraan || ''
    form.volume_sampah = val.volume_sampah || ''
    form.status_angkut = val.status_angkut || ''
  },
  { immediate: true }
)

const close = () => emit('close')

const submit = () => {
  if (!form.id_kendaraan || !form.volume_sampah) {
    alert('Semua field wajib diisi!')
    return
  }

  emit('save', { ...form })
  close()
}
</script>

<style scoped src="@/assets/styles/petugas.css"></style>