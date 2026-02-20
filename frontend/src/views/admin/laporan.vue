<template>
  <section class="content-section active">
    <!-- HEADER -->
    <div class="section-header">
      <h2>Riwayat Pelaporan Masyarakat</h2>
    </div>

    <!-- TABLE DESKTOP -->
    <div class="table-container desktop-only">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>TPS</th>
            <th>Desa</th>
            <th>Kondisi</th>
            <th>Pelapor</th>
            <th>Tanggal & Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(laporan, i) in laporanList" :key="laporan.id">
            <td>{{ i + 1 }}</td>
            <td>{{ getTPS(laporan.tpsId)?.nama }}</td>
            <td>Desa {{ getTPS(laporan.tpsId)?.desa }}</td>
            <td>{{ kondisiText(laporan.kondisi) }}</td>
            <td>{{ laporan.pelapor }}</td>
            <td>{{ laporan.tanggal }}</td>
            <td>
              <button class="btn-action" @click="openDetail(laporan)">
                <span class="material-icons">visibility</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="card-list mobile-only">
      <div
        v-for="laporan in laporanList"
        :key="laporan.id"
        class="data-card"
      >
        <div class="data-card-header">
          <div>
            <div class="data-card-title">
              {{ getTPS(laporan.tpsId)?.nama }}
            </div>
            <div class="data-card-subtitle">
              Desa {{ getTPS(laporan.tpsId)?.desa }}
            </div>
          </div>
        </div>

        <div class="data-card-body">
          <div class="data-card-item">
            <span class="data-card-label">Kondisi:</span>
            <span class="data-card-value">
              {{ kondisiText(laporan.kondisi) }}
            </span>
          </div>
          <div class="data-card-item">
            <span class="data-card-label">Pelapor:</span>
            <span class="data-card-value">{{ laporan.pelapor }}</span>
          </div>
          <div class="data-card-item">
            <span class="data-card-label">Tanggal:</span>
            <span class="data-card-value">{{ laporan.tanggal }}</span>
          </div>
        </div>

        <div class="data-card-footer">
          <button class="btn-card-action" @click="openDetail(laporan)">
            <span class="material-icons">visibility</span>
            <span>Lihat Detail</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL -->
    <div v-if="showModal" class="modal show">
      <div class="modal-overlay" @click="closeModal"></div>

      <div class="modal-content">
        <div class="modal-header">
          <h2>Detail Laporan</h2>
          <button class="modal-close" @click="closeModal">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-item"><b>TPS:</b> {{ tpsDetail?.nama }}</div>
          <div class="detail-item"><b>Desa:</b> Desa {{ tpsDetail?.desa }}</div>
          <div class="detail-item">
            <b>Kondisi:</b> {{ kondisiText(selected?.kondisi) }}
          </div>
          <div class="detail-item"><b>Pelapor:</b> {{ selected?.pelapor }}</div>
          <div class="detail-item"><b>No. HP:</b> {{ selected?.hp }}</div>
          <div class="detail-item">
            <b>Tanggal:</b> {{ selected?.tanggal }}
          </div>
          <div class="detail-item">
            <b>Keterangan:</b><br />
            {{ selected?.keterangan }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="closeModal">Tutup</button>
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
const tpsData = ref([
  { id: 1, nama: 'TPS A1 – Pasar Utara', desa: 'A' },
  { id: 2, nama: 'TPS B1 – Terminal Selatan', desa: 'B' }
])

const laporanList = ref([
  {
    id: 1,
    tpsId: 1,
    kondisi: 'penuh',
    pelapor: 'Warga A',
    hp: '08123456789',
    tanggal: '20 Februari 2026 10:15',
    keterangan: 'TPS sudah penuh dan meluber'
  }
])

/* =====================
   MODAL STATE
===================== */
const showModal = ref(false)
const selected = ref(null)

const tpsDetail = computed(() =>
  selected.value ? getTPS(selected.value.tpsId) : null
)

/* =====================
   METHODS
===================== */
function getTPS(id) {
  return tpsData.value.find(t => t.id === id)
}

function kondisiText(kondisi) {
  return {
    hampir_penuh: 'Hampir Penuh',
    penuh: 'Sudah Penuh',
    berserakan: 'Sampah Berserakan'
  }[kondisi] || kondisi
}

function openDetail(laporan) {
  selected.value = laporan
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>
