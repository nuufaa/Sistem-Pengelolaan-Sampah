<template>
  <div class="modal" :class="{ show: isOpen }">
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
          <select v-model="form.id_tps" required>
            <option value="">Pilih lokasi...</option>
            <option v-for="tps in tpsList" 
              :key="tps.id_tps" 
              :value="tps.id_tps"
            >
              {{ tps.nama_tps }}
            </option>
          </select>
        </div>

        <!-- Kondisi -->
        <div class="form-group">
          <label>Kondisi <span class="required">*</span></label>
          <div class="radio-group-vertical">
            <label class="radio-label" v-for="c in kondisi_tps" :key="c">
              <input
                type="radio"
                :value="c.value"
                v-model="form.kondisi_tps"
                required
              />
              <span>{{ c.label }}</span>
            </label>
          </div>
        </div>

        <!-- Keterangan -->
        <div class="form-group">
          <label>Keterangan Tambahan</label>
          <textarea v-model="form.deskripsi" rows="4" placeholder="Jelaskan kondisi sampah..."></textarea>
        </div>

        <!-- Identitas -->
        <div class="form-group">
          <label>Nama Pelapor <span class="required">*</span></label>
          <input type="text" v-model="form.nama_pelapor" placeholder="Nama Anda" required />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="close">
            Batal
          </button>
          <button type="submit" class="btn-primary" :disabled="loading">
            <span class="material-icons">send</span>
            {{ loading ? 'Mengirim...' : 'Kirim Laporan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../services/api'
import { useToast } from '@/services/useToast'

const { showToast } = useToast()
const isOpen = ref(false)
const selectedTPS = ref(null)
const selectedFile = ref(null)
const imagePreview = ref(null)
const tpsList = ref([])
const fileLabel = ref('Pilih foto')
const loading = ref(false)

const form = ref({
  id_tps: '',
  kondisi_tps: '',
  deskripsi: '',
  nama_pelapor: ''
})

const kondisi_tps = [
  { value: "hampir_penuh", label: "Hampir Penuh" },
  { value: "penuh", label: "Penuh" },
  { value: "sampah_berserakan", label: "Sampah Berserakan" }
]

async function fetchTps() {
  try {
    const res = await apiFetch("/api/tps")
    tpsList.value = res

  } catch (err) {
    console.error("Gagal ambil TPS:", err)
  }
}

async function submit() {
  loading.value = true
  try {
    const formData = new FormData()

    formData.append("id_tps", form.value.id_tps)
    formData.append("kondisi_tps", form.value.kondisi_tps)
    formData.append("deskripsi", form.value.deskripsi)
    formData.append("nama_pelapor", form.value.nama_pelapor)

    if (selectedFile.value) {
      formData.append("foto_tps", selectedFile.value)
    }

    await apiFetch("/api/lapor", {
      method: 'POST',
      body: formData,
      auth: false
    })
    showToast('Laporan berhasil dikirim! Terima kasih atas partisipasi Anda.');

    resetForm()
    close ()

  } catch (err) {
    console.error("Gagal kirim laporan:", err)
    alert("Gagal mengirim laporan")
  } finally{
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    id_tps: "",
    kondisi_tps: "",
    deskripsi: "",
    nama_pelapor: ""
  }

  selectedFile.value = null
  imagePreview.value = null
  fileLabel.value = "Pilih foto"
}

function openModal(id_tps = null) {
  selectedTPS.value = id_tps
  isOpen.value = true
  document.body.style.overflow = 'hidden'

  if (id_tps) {
    form.value.id_tps = id_tps
  } else {
    form.value.id_tps = '' 
  }

}

const emit = defineEmits(['closed'])

function close() {
  isOpen.value = false
  document.body.style.overflow = ''
  emit('closed')
}

defineExpose({
  openModal
})

onMounted(fetchTps)

</script>

<style src="@/assets/styles/report.css" scoped></style>
