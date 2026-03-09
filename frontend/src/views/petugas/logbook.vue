<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Logbook Kendaraan</h2>
      <!-- <div class="header-date">{{ todayLabel }}</div> -->
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
                :value="k.id_kendaraan"
              >
                {{ k.nomor_kendaraan }} ({{ k.nomor_polisi }})
              </option>
            </select>
          </div>

          <!-- <div class="form-group">
            <label>Tanggal Pengambilan</label>
            <input type="date" v-model="form.tgl_pengambilan" class="form-control" required />
          </div> -->
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
                :value="tps.id_tps"
                v-model="form.tpsVisited"
              />
              {{ tps.nama_tps }}
            </label>
          </div>
        </div>

        <!-- <div class="form-group">
          <label>Catatan (Opsional)</label>
          <textarea
            v-model="form.catatan"
            class="form-control"
            rows="3"
          ></textarea>
        </div> -->

        <div class="form-footer">
          <button type="button" class="btn-secondary" @click="resetForm">
            Reset
          </button>
          <!-- <button type="submit" class="btn-primary" >
            Simpan Logbook
          </button> -->
          <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? "Menyimpan..." : "Simpan Logbook" }}
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
          <!-- <div v-if="todayLogbook"> -->
          <template v-if="todayLogbook">

            <div class="logbook-info-item">
              <span class="label">Kendaraan</span>
              <span class="value">{{ todayLogbook?.nomor_kendaraan }}</span>
            </div>
            <div class="logbook-info-item">
              <span class="label">Petugas</span>
              <span class="value">{{ todayLogbook?.nama }}</span>
            </div>
            <div class="logbook-info-item">
              <span class="label">Jumlah TPS</span>
              <!-- <span class="value">{{ todayLogbook.tpsVisited.length }} TPS</span> -->
               <span class="value">{{ todayLogbook?.tpsVisited?.length || 0 }} TPS</span>
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
                {{ todayLogbook?.tpsVisited?.join(', ') }}
              </span>
            </div>
          </template>
          <!-- </div> -->

          <div v-else class="no-logbook">
            Belum ada aktivitas hari ini
          </div>
        </div>
      </div>

      <!-- RIWAYAT -->
      <div class="logbook-history">
        <h3>Riwayat Logbook</h3>

        <div v-if="historyLogbook.length" class="logbook-list">
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
                <span class="label">Petugas</span>
                <span class="value">{{ log.nama }}</span>
              </div>
              <div class="logbook-item-row">
                <span class="label">Jumlah TPS</span>
                <span class="value">{{ log.tpsVisited.length }} TPS</span>
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
import { ref, reactive, onMounted, computed} from 'vue'
import api from '@/services/api'

const kendaraanList = ref([])
const tpsList = ref([])
// const logbookData = ref([])
const daftarTugas = ref([])

const loading = ref(false)

const form = reactive({
  id_kendaraan: '',
  tpsVisited: []
})

const todayLogbook = computed(() => {

  if (!daftarTugas.value.length) return null

  const today = new Date().toLocaleDateString('id-CA')
  const todayData = daftarTugas.value.filter(item => {
    const itemDate = new Date(item.tgl_pengambilan)
      .toLocaleDateString('id-CA')

    return itemDate === today
  })

  if (!todayData.length) return null
  return {
    nomor_kendaraan: todayData[0].nomor_kendaraan,
    nama: todayData[0].nama,
    tpsVisited: [...new Set(todayData.map(t => t.nama_tps))]
  }
})

const historyLogbook = computed(() => {
  if (!daftarTugas.value.length) return []

  const grouped = {}

  daftarTugas.value.forEach(item => {
    const key = item.tgl_pengambilan + "-" + item.id_kendaraan

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        tanggal: item.tgl_pengambilan,
        kendaraan: item.nomor_kendaraan,
        tpsVisited: [],
        nama: item.nama
      }
    }

    grouped[key].tpsVisited.push(item.nama_tps)
  })

  return Object.values(grouped).sort((a,b) =>
    new Date(b.tanggal) - new Date(a.tanggal)
  )
})


async function fetchKendaraan() {
  const res = await api.get('/api/kendaraan')
  kendaraanList.value = res.data
}

async function fetchTPS() {
  const res = await api.get('/api/tps')
  tpsList.value = res.data
}

async function fetchDaftarTugas() {
  const res = await api.get('/api/daftar-tugas')
  daftarTugas.value = res.data
}

async function submitLogbook() {
  
  if (!form.tpsVisited.length) {
    alert("Pilih minimal satu TPS")
    return
  }
  loading.value = true
  
  try {
    await api.put('/api/daftar-tugas/logbook', {
      id_kendaraan: form.id_kendaraan,
      tpsVisited: form.tpsVisited
    })

    alert("Logbook berhasil disimpan")
    resetForm();
    await fetchDaftarTugas()

  } catch (error) {
    console.error("Gagal simpan logbook", error)
  }finally {
    loading.value = false
  }
}

function resetForm() {
  form.id_kendaraan = ""
  form.tpsVisited = []
}

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
  fetchKendaraan()
  fetchTPS()
  fetchDaftarTugas()
})

</script>

<style scoped src="@/assets/styles/petugas.css"></style>