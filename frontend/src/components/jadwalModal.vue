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
            <option value="">Pilih TPS</option>
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
          <select v-model.number="localForm.hari_pengambilan" required>
            <option value="">Pilih Hari Pengambilan</option>
            <option value="0">Senin</option>
            <option value="1">Selasa</option>
            <option value="2">Rabu</option>
            <option value="3">Kamis</option>
            <option value="4">Jumat</option>
            <option value="5">Sabtu</option>
            <option value="6">Minggu</option>
          </select>
          <small>Pengambilan dilakukan setiap N hari</small>
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

const localForm = reactive({
  id_jadwal: '',
  id_tps: '',
  id_petugas: '',
  hari_pengambilan: '',
  tgl_terakhir_diambil: null
})

watch(
  () => props.modelValue,
  val => {
    if (val) {
      Object.assign(localForm, {
        id_jadwal: val.id_jadwal,
        id_tps: Number(val.id_tps), 
        id_petugas: val.id_petugas,
        hari_pengambilan: val.hari_pengambilan,
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