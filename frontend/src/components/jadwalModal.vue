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
  tgl_terakhir_diambil: null
})

watch(
  () => props.modelValue,
  val => {
    if (val) {
      Object.assign(localForm, {
        id_jadwal: val.id_jadwal,
        id_tps: Number(val.id_tps), 
        id_petugas: Number(val.id_petugas),
        hari_pengambilan:  Array.isArray(val.hari_pengambilan)
      ? val.hari_pengambilan.map(Number)
      : [],
        tgl_terakhir_diambil: val.tgl_terakhir_diambil
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