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
            <select v-model="form.id_kendaraan" class="form-control" required>
              <option value="">-- Pilih Kendaraan --</option>
              <option
                v-for="k in kendaraanList"
                :key="k.nomor_kendaraan"
                :value="k.nomor_kendaraan"
              >
                {{ k.nomor_kendaraan }} ({{ k.nomor_polisi }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Tanggal Pengambilan</label>
            <input type="date" v-model="form.tanggal" class="form-control" required />
          </div>
        </div>

        <!-- <div class="form-row">
          <div class="form-group">
            <label>Waktu Mulai</label>
            <input type="time" v-model="form.waktuMulai" class="form-control" required />
          </div>

          <div class="form-group">
            <label>Waktu Selesai</label>
            <input type="time" v-model="form.waktuSelesai" class="form-control" required />
          </div>
        </div> -->

        <div class="form-group">
          <label>TPS yang Dikunjungi</label>
          <div class="checkbox-group">
            <label
              v-for="tps in tpsList"
              :key="tps.id_tps"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="tps.nama_tps"
                v-model="form.tpsVisited"
              />
              {{ tps.nama_tps }}
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
            <!-- <div class="logbook-info-item">
              <span class="label">Waktu</span>
              <span class="value">
                {{ todayLogbook.waktuMulai }} - {{ todayLogbook.waktuSelesai }}
              </span>
            </div> -->
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
              <!-- <div class="logbook-item-row">
                <span class="label">Waktu</span>
                <span class="value">{{ log.waktuMulai }} - {{ log.waktuSelesai }}</span>
              </div> -->
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
import { ref, computed, onMounted} from 'vue'
import api from '@/services/api'

const kendaraanList = ref([])
const tpsList = ref([])
const logbookData = ref([])

async function fetchLogbook() {
  try {

    const res = await api.get('/api/logbook')
    logbookData.value = res.data

  } catch (error) {
    console.error("Gagal ambil logbook", error)
  }
}

async function fetchKendaraan() {
  const res = await api.get('/api/kendaraan')
  kendaraanList.value = res.data
}

async function fetchTPS() {
  const res = await api.get('/api/tps')
  tpsList.value = res.data
}

async function submitLogbook() {
  
  if (!form.value.tpsVisited.length) {
    alert("Pilih minimal satu TPS")
    return
  }
  
  try {
    
    await api.post('/api/logbook', {
      id_kendaraan: form.value.id_kendaraan,
      tanggal: form.value.tanggal,
      tpsVisited: form.value.tpsVisited,
      catatan: form.value.catatan
    })
    
    await fetchLogbook()
    
    resetForm()
    
  } catch (error) {
    console.error("Gagal simpan logbook", error)
  }
  
}

// const todayLabel = new Date().toLocaleDateString('id-ID', {
//   weekday: 'long',
//   day: 'numeric',
//   month: 'long',
//   year: 'numeric'
// })

// function formatDate(date) {
//   return new Date(date).toLocaleDateString('id-ID', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
//   })
// }

function formatDate(date) {
  if (!date) return '-'

  const d = new Date(date)

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchLogbook()
  fetchKendaraan()
  fetchTPS()
})

</script>

<style scoped src="@/assets/styles/petugas.css"></style>