<template>
  <section class="content-section active">
    <div class="section-header">
      <h2>Dashboard Petugas</h2>
      <div class="header-date">
        {{ today }}
      </div>
    </div>

    <!-- Statistik -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background:#E3F2FD">
          <span class="material-icons" style="color:#2196F3">assignment</span>
        </div>
        <div class="stat-info">
          <h3>{{ total }}</h3>
          <p>Total Tugas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#FFF3E0">
          <span class="material-icons" style="color:#FF9800">pending</span>
        </div>
        <div class="stat-info">
          <h3>{{ pending }}</h3>
          <p>Belum Mulai</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#E8F5E9">
          <span class="material-icons" style="color:#4CAF50">check_circle</span>
        </div>
        <div class="stat-info">
          <h3>{{ done }}</h3>
          <p>Selesai</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#FFF9C4">
          <span class="material-icons" style="color:#FBC02D">autorenew</span>
        </div>
        <div class="stat-info">
          <h3>{{ progress }}</h3>
          <p>Sedang Berlangsung</p>
        </div>
      </div>
    </div>

    <!-- Tugas Hari Ini -->
    <div class="today-tasks">
      <h3>Tugas Hari Ini</h3>
      <p style="color:#757575">Belum ada tugas hari ini</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

/* dummy data sementara */
const total = ref(0)
const pending = ref(0)
const done = ref(0)
const progress = ref(0)
</script>

<style scoped src="@/assets/styles/petugas.css"></style>