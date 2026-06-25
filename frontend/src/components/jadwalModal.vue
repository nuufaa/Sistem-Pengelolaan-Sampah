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

        <!-- Info Hari yang Sudah Digunakan -->
        <div v-if="usedDaysLabel" class="form-group info-box">
          <p class="info-text">
            <span class="material-icons">info</span>
            Hari yang sudah digunakan: <strong>{{ usedDaysLabel }}</strong>
          </p>
        </div>

        <div class="form-group">
          <label>Hari Pengambilan</label>
          <small>Pilih hari pengambilan sampah</small>

          <div class="hari-grid">
            <label
              v-for="(hari, index) in daftarHari"
              :key="index"
              class="hari-pill"
              :class="{ 
                active: localForm.hari_pengambilan.includes(index),
                disabled: isHariDisabled(index)
              }"
              :title="isHariDisabled(index) ? 'Hari ini sudah digunakan' : ''"
            > 
              <input
                type="checkbox"
                :value="index"
                v-model="localForm.hari_pengambilan"
                :disabled="isHariDisabled(index)"
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

        <!-- ERROR MESSAGE -->
        <div v-if="errorMessage" class="form-group error-box">
          <p class="error-text">
            <span class="material-icons">error</span>
            {{ errorMessage }}
          </p>
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
import { reactive, watch, computed, ref } from 'vue'

const props = defineProps({
  modelValue: Object,
  tpsList: Array,
  petugasList: Array,
  usedDays: {
    type: Array,
    default: () => []
  }
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

const errorMessage = ref('')

const localForm = reactive({
  id_jadwal: null,
  id_tps: '',
  id_petugas: '',
  hari_pengambilan: [],
  tgl_terakhir_diambil: null,
  status: 'belum_mulai' // Default status
})

const usedDaysLabel = computed(() => {
  if (!props.usedDays || props.usedDays.length === 0) return ''
  return props.usedDays.map(day => daftarHari[day]).join(', ')
})

function isHariDisabled(hariIndex) {
  return props.usedDays && props.usedDays.includes(hariIndex)
}

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
      errorMessage.value = ''
    }
  },
  { immediate: true }
)

function submit() {
  // VALIDASI: Cek apakah ada hari yang dipilih yang sudah disabled
  const invalidDays = localForm.hari_pengambilan.filter(day => isHariDisabled(day))
  
  if (invalidDays.length > 0) {
    const conflictingDays = invalidDays.map(day => daftarHari[day]).join(', ')
    errorMessage.value = `Tidak dapat memilih hari yang sudah digunakan: ${conflictingDays}`
    return
  }

  errorMessage.value = ''
  emit('save', { ...localForm })
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>