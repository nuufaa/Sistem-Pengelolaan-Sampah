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
          <h3>{{ data.tps.nama }}</h3>
          <p>Desa {{ data.tps.desa }}</p>
          <p>Interval Pengambilan: Setiap {{ data.interval }} hari</p>
          <p>Terakhir Diambil: {{ data.lastPickup }}</p>
        </div>

        <!-- PILIH KENDARAAN -->
        <div class="form-group">
          <label>Pilih Kendaraan</label>
          <select v-model="form.kendaraan" class="form-control">
            <option value="">-- Pilih Kendaraan --</option>
            <option v-for="k in kendaraan" :key="k" :value="k">
              {{ k }}
            </option>
          </select>
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
              v-model="form.volume"
              :placeholder="form.unit === 'kg'
                ? 'Masukkan volume dalam kilogram'
                : 'Masukkan persentase (0–100)'"
              :max="form.unit === 'kg' ? 10000 : 100"
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
              class="status-btn"
              :class="{ selected: form.status === 'pending' }"
              @click="form.status = 'pending'"
            >
              <span class="material-icons">pending</span>
              Belum Mulai
            </button>

            <button
              class="status-btn"
              :class="{ selected: form.status === 'progress' }"
              @click="form.status = 'progress'"
            >
              <span class="material-icons">autorenew</span>
              Sedang Berlangsung
            </button>

            <button
              class="status-btn"
              :class="{ selected: form.status === 'done' }"
              @click="form.status = 'done'"
            >
              <span class="material-icons">check_circle</span>
              Selesai
            </button>
          </div>
        </div>

        <!-- CATATAN -->
        <div class="form-group">
          <label>Catatan (Opsional)</label>
          <textarea
            rows="3"
            v-model="form.notes"
            placeholder="Tambahkan catatan jika diperlukan"
          />
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
import { reactive } from 'vue'

const props = defineProps({
  show: Boolean,
  data: Object
})

const emit = defineEmits(['close', 'save'])

const kendaraan = ['Truck 01', 'Truck 02']

const form = reactive({
  kendaraan: '',
  volume: '',
  unit: 'kg',
  status: 'pending',
  notes: ''
})

const close = () => emit('close')

const submit = () => {
  emit('save', { ...form })
  close()
}
</script>

<style scoped src="@/assets/styles/petugas.css"></style>