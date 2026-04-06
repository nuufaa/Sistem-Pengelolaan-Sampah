<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ localForm.id_operasional ? 'Edit Jam Operasional' : 'Tambah Jam Operasional' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

    <form class="modal-body" @submit.prevent="submit">
        <div class="form-group">
          <label>Jam Buang Sampah Warga</label>
          <small>Rentang waktu warga boleh membuang sampah</small>
          <div class="time-row">
            <div class="time-field">
              <label class="sub-label">Mulai</label>
              <input type="time" v-model="localForm.jam_buang_mulai" required />
            </div>
            <span class="time-sep">–</span>
            <div class="time-field">
              <label class="sub-label">Selesai</label>
              <input type="time" v-model="localForm.jam_buang_selesai" required />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Jam Pengambilan Petugas</label>
            <div class="time-row">
              <div class="time-field">
                <label class="sub-label">Mulai</label>
                <input type="time" v-model="localForm.jam_ambil_mulai" required />
              </div>
              <span class="time-sep">–</span>
                <div class="time-field">
                  <label class="sub-label">Selesai</label>
                  <input type="time" v-model="localForm.jam_ambil_selesai" required />
                </div>
            </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">
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
  modelValue: {
    type: Object,
    required: true
  }
})  

const emit = defineEmits(['save', 'close'])

const localForm = reactive({
  id_operasional: null,
    jam_buang_mulai: '',
    jam_buang_selesai: '',
    jam_ambil_mulai: '',
    jam_ambil_selesai: ''
})

watch(
  () => props.modelValue,
  val => {
    Object.assign(localForm, {
      id_operasional: null,
      jam_buang_mulai: '',
      jam_buang_selesai: '',
      jam_ambil_mulai: '',
      jam_ambil_selesai: ''
    })

    if (val) {
      Object.assign(localForm, val)
    }
  },
  { immediate: true }
)

function submit() {
  emit('save', { ...localForm })
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>