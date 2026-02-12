<template>
  <div class="modal" :class="{ show: isOpen }" v-if="isOpen">
    <div class="modal-overlay" @click="close"></div>

    <div class="modal-content">
      <div class="modal-header">
        <h2>
          <span class="material-icons">edit_note</span>
          Laporan Kondisi Sampah
        </h2>
        <button class="modal-close" @click="close">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <!-- Lokasi -->
        <div class="form-group">
          <label>Lokasi Titik Sampah <span class="required">*</span></label>
          <select v-model="form.location" required>
            <option value="">Pilih lokasi...</option>
            <option v-for="tps in tpsList" :key="tps.id" :value="tps.id">
              {{ tps.name }}
            </option>
          </select>
        </div>

        <!-- Kondisi -->
        <div class="form-group">
          <label>Kondisi <span class="required">*</span></label>
          <div class="radio-group-vertical">
            <label class="radio-label" v-for="c in conditions" :key="c.value">
              <input
                type="radio"
                :value="c.value"
                v-model="form.condition"
              />
              <span>{{ c.label }}</span>
            </label>
          </div>
        </div>

        <!-- Foto -->
        <div class="form-group">
          <label>Foto (Opsional)</label>
          <div class="file-upload">
            <input type="file" id="photoUpload" accept="image/*" @change="previewImage" />
            <label for="photoUpload" class="file-upload-label">
              <span class="material-icons">photo_camera</span>
              <span id="fileLabel">{{ fileLabel }}</span>
            </label>
          </div>
          <div class="image-preview" :class="{ show: imagePreview }">
            <img :src="imagePreview" />
          </div>
        </div>

        <!-- Keterangan -->
        <div class="form-group">
          <label>Keterangan Tambahan</label>
          <textarea v-model="form.description" rows="4" placeholder="Jelaskan kondisi sampah..."></textarea>
        </div>

        <!-- Identitas -->
        <div class="form-group">
          <label>Nama Pelapor</label>
          <input type="text" v-model="form.name" placeholder="Nama Anda" />
        </div>

        <div class="form-group">
          <label>No. HP</label>
          <input type="tel" v-model="form.phone" placeholder="08xx xxxx xxxx" />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="close">
            Batal
          </button>
          <button type="submit" class="btn-primary">
            <span class="material-icons">send</span>
            Kirim Laporan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import '@/assets/styles/report.css'

const isOpen = ref(false)

const form = ref({
  location: '',
  condition: '',
  description: '',
  name: '',
  phone: ''
})

const imagePreview = ref(null)
const fileLabel = ref('Pilih foto')

const tpsList = [
  { id: 1, name: 'TPS Pasar Desa Utara' },
  { id: 2, name: 'TPS Masjid Besar' },
  { id: 3, name: 'TPS Sekolah Dasar' }
]

const conditions = [
  { value: 'hampir_penuh', label: 'Hampir Penuh' },
  { value: 'penuh', label: 'Sudah Penuh' },
  { value: 'berserakan', label: 'Sampah Berserakan' }
]

function previewImage(e) {
  const file = e.target.files[0]
  if (file) {
    imagePreview.value = URL.createObjectURL(file)
    fileLabel.value = file.name
  } else {
    imagePreview.value = null
    fileLabel.value = 'Pilih foto'
  }
}

function submit() {
  console.log('Data laporan:', form.value)
  close()
}

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

defineExpose({ open, close })
</script>
