<template>
  <div class="modal show">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">

        <!-- HEADER -->
        <div class="modal-header">
          <h3>Detail Kepatuhan - {{ kepatuhan?.nama }}</h3>
          <button class="modal-close" @click="$emit('close')">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">

          <!-- LOADING -->
          <div v-if="loading" class="loading-state">
            <p>Memuat detail...</p>
          </div>

          <div v-else>

            <!-- 🔍 SEARCH -->
            <div class="filter-bar">
              <div class="search-wrapper">
                <span class="material-icons search-icon">search</span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="Cari TPS, hari, tanggal, status..."
                />
                <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>

            <!-- 📊 INFO HASIL FILTER -->
            <div class="filter-result-info">
              <span v-if="searchQuery">
                Menampilkan {{ filteredDetail.length }} dari {{ detail.length }} data
              </span>
              <span v-else>
                Total {{ detail.length }} data
              </span>

              <span v-if="searchQuery">
                (Pencarian: "{{ searchQuery }}")
              </span>
            </div>

            <!-- 📋 TABLE -->
            <div class="table-container desktop-only">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>TPS</th>
                    <th>Hari Jadwal</th>
                    <th>Tanggal Jadwal</th>
                    <th>Tanggal Pengambilan</th>
                    <th>Status Kepatuhan</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="d in filteredDetail" :key="d.id_daftar_tugas" class="detail-row">
                    <td>{{ d.nama_tps }}</td>

                    <!-- ✅ HARI SUDAH FORMAT -->
                    <td>{{ formatHari(d.hari_pengambilan) }}</td>

                    <td>{{ formatDate(d.tgl_pengambilan) }}</td>

                    <td>
                      {{ d.tgl_terakhir_diambil 
                        ? formatDate(d.tgl_terakhir_diambil) 
                        : '-' 
                      }}
                    </td>

                    <td>
                      <span
                        class="status-kepatuhan"
                        :class="d.status_kepatuhan === 'Tepat Waktu' ? 'tepat' : 'terlambat'"
                      >
                        {{ d.status_kepatuhan }}
                      </span>
                    </td>
                  </tr>

                  <!-- EMPTY -->
                  <tr v-if="filteredDetail.length === 0">
                    <td colspan="5" class="empty-state">
                      <span class="material-icons">inbox</span>
                      <p>Data tidak ditemukan</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

             <!-- MOBILE CARD -->
            <div class="card-list mobile-only">

              <div 
                class="data-card"
                v-for="d in filteredDetail"
                :key="d.id_daftar_tugas"
              >
                <!-- HEADER -->
                <div class="data-card-header">
                  <div>
                    <div class="data-card-title">
                      {{ d.nama_tps }}
                    </div>
                    <div class="data-card-subtitle">
                      {{ formatHari(d.hari_pengambilan) }}
                    </div>
                  </div>

                  <span
                    class="status-kepatuhan"
                    :class="d.status_kepatuhan === 'Tepat Waktu' ? 'tepat' : 'terlambat'"
                  >
                    {{ d.status_kepatuhan }}
                  </span>
                </div>

                <!-- BODY -->
                <div class="data-card-body">
                  <div class="data-card-item">
                    <span class="data-card-label">Tanggal Jadwal</span>
                    <span class="data-card-value">
                      {{ formatDate(d.tgl_pengambilan) }}
                    </span>
                  </div>

                  <div class="data-card-item">
                    <span class="data-card-label">Tanggal Ambil</span>
                    <span class="data-card-value">
                      {{ d.tgl_terakhir_diambil 
                        ? formatDate(d.tgl_terakhir_diambil) 
                        : '-' 
                      }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- EMPTY -->
              <div v-if="filteredDetail.length === 0" class="empty-state-card">
                <span class="material-icons">inbox</span>
                <p>Data tidak ditemukan</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['close'])

const props = defineProps({
  kepatuhan: Object,
  detail: Array,
  loading: Boolean
})
const searchQuery = ref('')

function formatHari(hari) {
  const hariMap = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Minggu'
  ]

  if (Array.isArray(hari)) {
    return hari.map(h => hariMap[Number(h)]).join(', ')
  }

  return hariMap[Number(hari)] || '-'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const filteredDetail = computed(() => {
  return props.detail.filter(d => {
    const q = searchQuery.value.toLowerCase()

    const hariText = formatHari(d.hari_pengambilan).toLowerCase()
    const tglJadwal = formatDate(d.tgl_pengambilan).toLowerCase()
    const tglAmbil = d.tgl_terakhir_diambil
      ? formatDate(d.tgl_terakhir_diambil).toLowerCase()
      : ''

    const matchSearch =
      !q ||
      Object.values(d).some(val =>
        String(val ?? '').toLowerCase().includes(q)
      ) ||
      hariText.includes(q) ||
      tglJadwal.includes(q) ||
      tglAmbil.includes(q)

    return matchSearch
  })
})
</script>

<style scoped src="@/assets/styles/admin.css"></style>