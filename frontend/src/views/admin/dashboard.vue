<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Dashboard</h2>
    </div>

    <!-- STAT CARDS -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #E8F5E9;">
          <span class="material-icons" style="color: #4CAF50;">delete</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalTPS }}</h3>
          <p>Total TPS</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #FFF3E0;">
          <span class="material-icons" style="color: #FF9800;">badge</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalPetugas }}</h3>
          <p>Total Petugas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #E3F2FD;">
          <span class="material-icons" style="color: #2196F3;">report</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalLaporan }}</h3>
          <p>Laporan Bulan Ini</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #FFEBEE;">
          <span class="material-icons" style="color: #F44336;">warning</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalTPSPenuh }}</h3>
          <p>TPS Penuh</p>
        </div>
      </div>
    </div>

    <!-- CHART PLACEHOLDER -->
    <div class="dashboard-charts">
      <div class="chart-card">
        <h3>Status TPS Terkini</h3>
        <canvas></canvas>
      </div>

      <div class="chart-card">
        <h3>Laporan 7 Hari Terakhir</h3>
        <canvas></canvas>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

/* =====================
   DUMMY DATA
   (nanti ganti dari API / service)
===================== */
const tpsData = ref([
  { id: 1, status: 'normal' },
  { id: 2, status: 'danger' },
  { id: 3, status: 'normal' },
  { id: 4, status: 'danger' }
])

const petugasData = ref([
  { id: 1, status: 'aktif' },
  { id: 2, status: 'aktif' },
  { id: 3, status: 'nonaktif' }
])

const laporanData = ref([
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 }
])

/* =====================
   COMPUTED (pengganti renderDashboard())
===================== */
const totalTPS = computed(() => tpsData.value.length)

const totalPetugas = computed(() =>
  petugasData.value.filter(p => p.status === 'aktif').length
)

const totalLaporan = computed(() => laporanData.value.length)

const totalTPSPenuh = computed(() =>
  tpsData.value.filter(t => t.status === 'danger').length
)
</script>

<style scoped src="@/assets/styles/admin.css"></style>
