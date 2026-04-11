<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ localForm.id_jadwal ? 'Edit Jadwal' : 'Tambah Jadwal' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="form-group">
          <label>TPS</label>
          <select v-model.number="localForm.id_tps" required>
            <option :value="null">Pilih TPS</option>
            <option
              v-for="t in tpsList"
              :key="t.id_tps"
              :value="t.id_tps"
            >
              {{ t.nama_tps }} 
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Hari Pengambilan</label>
          <small>Pilih hari pengambilan sampah</small>

          <div class="hari-grid">
            <label
              v-for="(hari, index) in daftarHari"
              :key="index"
              class="hari-pill"
              :class="{ active: localForm.hari_pengambilan.includes(index) }"
            > 
              <input
                type="checkbox"
                :value="index"
                v-model="localForm.hari_pengambilan"
              />
              {{ hari }}
            </label>
          </div>
          
          <small>Pengambilan akan dilakukan setiap N hari</small>
        </div>

        <div class="form-group">
          <label>Petugas</label>
          <select v-model.number="localForm.id_petugas" required>
            <option value="">Pilih Petugas</option>
            <option
              v-for="t in petugasList"
              :key="t.id_petugas"
              :value="t.id_petugas"
            >
              {{ t.nama }}
            </option>
          </select>
        </div>

        <!-- STATUS SECTION -->
        <div class="form-group">
          <label>Status Jadwal</label>
          <div class="status-grid">
            <label class="status-radio">
              <input
                type="radio"
                value="belum_mulai"
                v-model="localForm.status"
                required
              />
              <span class="status-label belum-mulai">
                <span class="material-icons">schedule</span>
                Belum Mulai
              </span>
            </label>

            <label class="status-radio">
              <input
                type="radio"
                value="selesai"
                v-model="localForm.status"
                required
              />
              <span class="status-label selesai">
                <span class="material-icons">check_circle</span>
                Selesai
              </span>
            </label>
          </div>
        </div>

        <!-- TANGGAL PENGAMBILAN (hanya muncul jika status selesai) -->
        <div v-if="localForm.status === 'selesai'" class="form-group">
          <label>Tanggal Pengambilan Terakhir</label>
          <input
            type="date"
            v-model="localForm.tgl_terakhir_diambil"
            required
          />
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
  tpsList: Array,
  petugasList: Array
})

const emit = defineEmits(['save', 'close'])

const daftarHari = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu'
]

const localForm = reactive({
  id_jadwal: null,
  id_tps: '',
  id_petugas: '',
  hari_pengambilan: [],
  tgl_terakhir_diambil: null,
  status: 'belum_mulai' // Default status
})

watch(
  () => props.modelValue,
  val => {
    if (val) {
      Object.assign(localForm, {
        id_jadwal: val.id_jadwal,
        id_tps: Number(val.id_tps), 
        id_petugas: Number(val.id_petugas),
        hari_pengambilan: Array.isArray(val.hari_pengambilan)
          ? val.hari_pengambilan.map(Number)
          : [],
        tgl_terakhir_diambil: val.tgl_terakhir_diambil,
        status: val.status || 'belum_mulai'
      })
    }
  },
  { immediate: true }
)

function submit() {
  emit('save', { ...localForm })
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>

<style scoped>
/* Status Grid Layout */
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
}

.status-radio {
  position: relative;
  cursor: pointer;
}

.status-radio input[type="radio"] {
  display: none;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.status-label .material-icons {
  font-size: 1.5rem;
}

/* Belum Mulai Status */
.status-label.belum-mulai {
  color: #ff9800;
}

.status-radio input[value="belum_mulai"]:checked + .status-label.belum-mulai {
  background-color: #fff3e0;
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.status-label.belum-mulai:hover {
  border-color: #ff9800;
  background-color: #fff8f0;
}

/* Selesai Status */
.status-label.selesai {
  color: #4caf50;
}

.status-radio input[value="selesai"]:checked + .status-label.selesai {
  background-color: #e8f5e9;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.status-label.selesai:hover {
  border-color: #4caf50;
  background-color: #f1f8f6;
}

/* Responsive untuk mobile */
@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>