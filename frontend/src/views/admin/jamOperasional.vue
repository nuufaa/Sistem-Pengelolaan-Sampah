<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Jam Operasional</h2>
      <button v-if="userRole === 'admin'" class="btn-primary" @click="openAdd">
        <span class="material-icons">add</span>
        Tambah Jam
      </button>
    </div>

    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Jam Buang Mulai</th>
            <th>Jam Buang Selesai</th>
            <th>Jam Pengambilan Mulai</th>
            <th>Jam Pengambilan Selesai</th>
            <th v-if="userRole === 'admin'">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(jo, i) in jamOperasionalList" :key="jo.id_operasional">
            <td>{{ i + 1 }}</td>
            <td>{{ jo.jam_buang_mulai }}</td>
            <td>{{ jo.jam_buang_selesai }}</td>
            <td>{{ jo.jam_ambil_mulai }}</td>
            <td>{{ jo.jam_ambil_selesai }}</td>
            <td v-if="userRole === 'admin'" class="action-buttons">
              <button class="btn-action edit" @click="openEdit(jo)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-action delete" @click="remove(jo.id_operasional)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="card-list mobile-only">
      <div 
        class="data-card" 
        v-for="(jo) in jamOperasionalList" 
        :key="jo.id_operasional"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              Jam buang: {{ jo.jam_buang_mulai }} - {{ jo.jam_buang_selesai }}
            </div>
            <div class="data-card-title">
              Jam angkut: {{ jo.jam_ambil_mulai }} - {{ jo.jam_ambil_selesai }}
            </div>
          </div>
        </div>

        <div v-if="userRole === 'admin'" class="data-card-footer">
          <button class="btn-card-action edit" @click="openEdit(jo)">
            <span class="material-icons">edit</span>
            Edit
          </button>

          <button class="btn-card-action delete" @click="remove(jo.id_operasional)">
            <span class="material-icons">delete</span>
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL COMPONENT -->
    <jamOperasionalModal
      v-if="showModal"
      :model-value="selected"
      @close="showModal = false"
      @save="save"
    />
  </section>
  <br><br>

  <div v-if="userRole === 'admin'" class="card">
    <div class="card-header">
      <span class="material-icons">image</span>
      <h2>Logo Desa</h2>
    </div>
    <div class="card-body">

      <p class="label">Upload logo baru</p>
      <div
        class="upload-zone"
        :class="{ 'drag-over': isDragging }"
        @click="$refs.fileInput.click()"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
      >
        <div class="logo-preview-box">
          <img v-if="previewUrl" :src="previewUrl" alt="Preview" />
          <span v-else class="material-icons placeholder-icon">add_photo_alternate</span>
        </div>
        <p class="upload-hint">
          <strong>Klik untuk pilih file</strong> atau drag &amp; drop<br>
          PNG, JPG, SVG · Maks. 512 KB · Rekomendasi 256×256px
        </p>
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          style="display: none"
          @change="onFileChange"
        />
      </div>

      <!-- Info file terpilih -->
      <template v-if="selectedFile">
        <div class="meta-row">
          <span class="meta-key">File</span>
          <span class="meta-val">{{ selectedFile.name }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-key">Ukuran</span>
          <span class="meta-val">{{ (selectedFile.size / 1024).toFixed(0) }} KB</span>
        </div>
        <div class="meta-row">
          <span class="meta-key">Status</span>
          <span v-if="isOverLimit" class="status-badge danger">Melebihi 512 KB</span>
          <span v-else class="status-badge success">Siap disimpan</span>
        </div>
      </template>

      <!-- Error -->
      <p v-if="error" class="error-text">
        <span class="material-icons" style="font-size: 15px; vertical-align: middle;">error_outline</span>
        {{ error }}
      </p>

      <hr class="divider" />

      <!-- Logo aktif -->
      <p class="label">Logo aktif saat ini</p>
      <div v-if="loading" class="empty-text">Memuat...</div>
      <div v-else-if="logoSrc" class="current-logo-row">
        <img :src="logoSrc" alt="Logo aktif" class="current-logo-img" />
        <div class="current-logo-meta">
          <span class="current-logo-name">Logo Desa Sembalun Bumbung</span>
          <span class="current-logo-date">
            Terakhir diubah: {{ lastUpdated ?? '-' }}
          </span>
        </div>
        <span class="status-badge success">Aktif</span>
      </div>
      <p v-else class="empty-text">Belum ada logo tersimpan</p>

      <div class="info-box">
        <span class="material-icons" style="font-size: 15px;">info</span>
        <span>
          Logo disimpan sebagai Base64 di tabel <code>desa_settings</code>.
          Perubahan langsung tampil di sidebar dan navbar.
        </span>
      </div>

      <!-- Actions -->
      <div class="action-row">
        <button
          class="btn-primary"
          :disabled="!selectedFile || isOverLimit || saving"
          @click="handleSave"
        >
          <span class="material-icons">upload</span>
          {{ saving ? 'Menyimpan...' : 'Simpan Logo' }}
        </button>
        <button
          v-if="logoSrc"
          class="btn-secondary"
          :disabled="saving"
          @click="handleDelete"
        >
          <span class="material-icons">delete</span>
          Hapus
        </button>
      </div>

    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import api from '@/services/api'
import jamOperasionalModal from '@/components/jamOperasionalModal.vue'
import { useDesaLogo } from '@/services/useDesaLogo'
import { TabSync } from '@/services/tabSync'

const jamOperasionalList = ref([])
const showModal = ref(false)
const selected = ref(null)
const userRole = computed(() => sessionStorage.getItem('role') || 'kadus')
let unsubscribeSync = null

const { logoSrc, lastUpdated, loading, saving, error, fetchLogo, saveLogo, deleteLogo } = useDesaLogo()

const selectedFile = ref(null)
const previewUrl = ref(null)
const isDragging = ref(false)

const MAX_SIZE = 512 * 1024

const isOverLimit = computed(() =>
  selectedFile.value ? selectedFile.value.size > MAX_SIZE : false
)

onMounted(() => {
  fetchLogo()
  fetchjamOperasional()

  unsubscribeSync = TabSync.listen((event) => {
    if (event === 'settings_updated') {
      fetchLogo()
      fetchjamOperasional()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeSync) unsubscribeSync()
})

function onFileChange(e) {
  processFile(e.target.files[0])
}

function onDrop(e) {
  isDragging.value = false
  processFile(e.dataTransfer.files[0])
}

function processFile(file) {
  if (!file) return
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { previewUrl.value = e.target.result }
  reader.readAsDataURL(file)
}

async function handleSave() {
  if (!selectedFile.value || isOverLimit.value) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    const ok = await saveLogo(e.target.result)
    if (ok) {
      selectedFile.value = null
      previewUrl.value = null
      TabSync.emit('settings_updated')
    }
  }
  reader.readAsDataURL(selectedFile.value)
}

async function handleDelete() {
  if (!confirm('Hapus logo desa?')) return
  await deleteLogo()
  TabSync.emit('settings_updated')
}
async function fetchjamOperasional() {
  try {
    const res = await api.get('/api/jam-operasional')
    jamOperasionalList.value = res.data
  } catch (err) {
    console.error('Gagal ambil data', err)
  }
}

// fetchjamOperasional called in onMounted


function openAdd() {
  selected.value = {
    id_operasional: null,
    jam_buang_mulai: '',
    jam_buang_selesai: '',
    jam_ambil_mulai: '',
    jam_ambil_selesai: ''
  }
  showModal.value = true
}

function openEdit(jo) {
  selected.value = { ...jo }
  showModal.value = true
}

async function save(data) {
  try {
    if (data.id_operasional) {
      // UPDATE
      await api.put(`/api/jam-operasional/${data.id_operasional}`, data)

    } else {
      // CREATE
      await api.post('/api/jam-operasional', data)
    }
    await fetchjamOperasional()
    TabSync.emit('settings_updated')
    showModal.value = false
  } catch (err) {
    console.error('Gagal simpan data', err)
    console.log(err.response.data) 
    console.log('ERROR BACKEND:', err.response?.data)
  }
}

async function remove(id) {
  if (!confirm('Yakin ingin menghapus data ini?')) return

  try {
    await api.delete(`/api/jam-operasional/${id}`)
    TabSync.emit('settings_updated')
    await fetchjamOperasional()
  } catch (err) {
    console.error('Gagal hapus', err)
  }
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>
<style scoped>
.upload-zone {
  border: 1.5px dashed #ccc;
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  margin-bottom: 12px;
}
.upload-zone:hover,
.upload-zone.drag-over { border-color: #1b5e38; }

.logo-preview-box {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  background: #dcefd8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  overflow: hidden;
}
.logo-preview-box img { width: 100%; height: 100%; object-fit: contain; }
.placeholder-icon { font-size: 32px; color: #1b5e38; }

.upload-hint { font-size: 13px; color: #666; line-height: 1.6; }

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 13px;
  border-bottom: 0.5px solid #eee;
}
.meta-key { color: #888; }
.meta-val { font-weight: 500; }

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
}
.status-badge.success { background: #dcefd8; color: #27500A; }
.status-badge.danger { background: #fde8e8; color: #9b1c1c; }

.error-text {
  font-size: 13px;
  color: #c0392b;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.divider { border: none; border-top: 1px solid #eee; margin: 14px 0; }

.label { font-size: 13px; color: #666; margin-bottom: 8px; }

.current-logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.current-logo-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: contain;
  background: #dcefd8;
  border: 1px solid #eee;
}
.current-logo-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.current-logo-name { font-size: 13px; font-weight: 500; }
.current-logo-date { font-size: 12px; color: #888; }

.empty-text { font-size: 13px; color: #aaa; margin-bottom: 12px; }

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #e8f4fd;
  color: #1a5276;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  margin-bottom: 14px;
}

.action-row {
  display: flex;
  gap: 8px;
}
</style>