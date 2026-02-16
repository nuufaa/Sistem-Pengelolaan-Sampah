<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Logbook Kendaraan</h2>
      <div class="header-date">{{ todayLabel }}</div>
    </div>

    <!-- FORM TAMBAH LOGBOOK -->
    <div class="logbook-form-card">
      <div class="form-card-header">
        <span class="material-icons">add_circle</span>
        <h3>Tambah Logbook Baru</h3>
      </div>

      <form class="logbook-form" @submit.prevent="submitLogbook">
        <div class="form-row">
          <div class="form-group">
            <label>Pilih Kendaraan</label>
            <select v-model="form.kendaraan" class="form-control" required>
              <option value="">-- Pilih Kendaraan --</option>
              <option
                v-for="k in kendaraanList"
                :key="k.nomor"
                :value="k.nomor"
              >
                {{ k.nomor }} ({{ k.plat }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Tanggal Pengambilan</label>
            <input type="date" v-model="form.tanggal" class="form-control" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Waktu Mulai</label>
            <input type="time" v-model="form.waktuMulai" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Waktu Selesai</label>
            <input type="time" v-model="form.waktuSelesai" class="form-control" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Km Awal</label>
            <input type="number" v-model.number="form.kmAwal" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Km Akhir</label>
            <input type="number" v-model.number="form.kmAkhir" class="form-control" required />
          </div>
        </div>

        <div class="form-group">
          <label>TPS yang Dikunjungi</label>
          <div class="checkbox-group">
            <label
              v-for="tps in tpsList"
              :key="tps.id"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="tps.nama"
                v-model="form.tpsVisited"
              />
              {{ tps.nama }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Catatan (Opsional)</label>
          <textarea
            v-model="form.catatan"
            class="form-control"
            rows="3"
          ></textarea>
        </div>

        <div class="form-footer">
          <button type="button" class="btn-secondary" @click="resetForm">
            Reset
          </button>
          <button type="submit" class="btn-primary">
            Simpan Logbook
          </button>
        </div>
      </form>
    </div>

    <!-- KENDARAAN HARI INI -->
    <div class="logbook-container">
      <div class="logbook-card">
        <div class="logbook-header">
          <span class="material-icons">local_shipping</span>
          <h3>Kendaraan Hari Ini</h3>
        </div>

        <div class="logbook-body">
          <div v-if="todayLogbook">
            <div class="logbook-info-item">
              <span class="label">Kendaraan</span>
              <span class="value">{{ todayLogbook.kendaraan }}</span>
            </div>
            <div class="logbook-info-item">
              <span class="label">Jumlah TPS</span>
              <span class="value">{{ todayLogbook.tpsVisited.length }} TPS</span>
            </div>
            <div class="logbook-info-item">
              <span class="label">Waktu</span>
              <span class="value">
                {{ todayLogbook.waktuMulai }} - {{ todayLogbook.waktuSelesai }}
              </span>
            </div>
            <div class="logbook-info-item">
              <span class="label">TPS</span>
              <span class="value">
                {{ todayLogbook.tpsVisited.join(', ') }}
              </span>
            </div>
          </div>

          <div v-else class="no-logbook">
            Belum ada aktivitas hari ini
          </div>
        </div>
      </div>

      <!-- RIWAYAT -->
      <div class="logbook-history">
        <h3>Riwayat Logbook</h3>

        <div v-if="historyLogbook.length">
          <div
            v-for="log in historyLogbook"
            :key="log.id"
            class="logbook-item"
          >
            <div class="logbook-item-header">
              <h4>{{ log.kendaraan }}</h4>
              <span class="logbook-item-date">{{ formatDate(log.tanggal) }}</span>
            </div>

            <div class="logbook-item-body">
              <div class="logbook-item-row">
                <span class="label">Jumlah TPS</span>
                <span class="value">{{ log.tpsVisited.length }}</span>
              </div>
              <div class="logbook-item-row">
                <span class="label">Waktu</span>
                <span class="value">{{ log.waktuMulai }} - {{ log.waktuSelesai }}</span>
              </div>
              <div class="logbook-item-row">
                <span class="label">TPS</span>
                <span class="value">{{ log.tpsVisited.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-logbook">
          Belum ada riwayat logbook
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

/* =====================
   DUMMY DATA
===================== */
const kendaraanList = [
  { nomor: 'Truck 01', plat: 'DR 1234 AB' },
  { nomor: 'Truck 02', plat: 'DR 5678 CD' }
]

const tpsList = [
  { id: 1, nama: 'TPS A1 - Pasar Utara' },
  { id: 2, nama: 'TPS A2 - Masjid Besar' },
  { id: 3, nama: 'TPS A3 - Sekolah Dasar' }
]

const logbookData = ref([])

/* =====================
   FORM STATE
===================== */
const today = new Date().toISOString().split('T')[0]

const form = ref({
  kendaraan: '',
  tanggal: today,
  waktuMulai: '',
  waktuSelesai: '',
  kmAwal: null,
  kmAkhir: null,
  tpsVisited: [],
  catatan: ''
})

/* =====================
   COMPUTED
===================== */
const todayLabel = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const todayLogbook = computed(() =>
  logbookData.value.find(l => l.tanggal === today)
)

const historyLogbook = computed(() =>
  logbookData.value.filter(l => l.tanggal !== today)
)

/* =====================
   METHODS
===================== */
function submitLogbook() {
  if (form.value.kmAwal >= form.value.kmAkhir) {
    alert('Km akhir harus lebih besar dari km awal')
    return
  }

  if (!form.value.tpsVisited.length) {
    alert('Pilih minimal satu TPS')
    return
  }

  logbookData.value.unshift({
    id: Date.now(),
    ...form.value
  })

  resetForm()
}

function resetForm() {
  form.value = {
    kendaraan: '',
    tanggal: today,
    waktuMulai: '',
    waktuSelesai: '',
    kmAwal: null,
    kmAkhir: null,
    tpsVisited: [],
    catatan: ''
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped src="@/assets/styles/petugas.css"></style>

