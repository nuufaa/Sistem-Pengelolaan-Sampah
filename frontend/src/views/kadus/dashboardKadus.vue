<template>
  <div class="dashboard-kadus">
    <h2>Dashboard Kadus/Kades</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total TPS</h3>
        <p>{{ stats.totalTps }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Dusun</h3>
        <p>{{ stats.totalDusun }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Petugas</h3>
        <p>{{ stats.totalPetugas }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Kendaraan</h3>
        <p>{{ stats.totalKendaraan }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../services/api.js'

export default {
  name: 'DashboardKadus',
  data() {
    return {
      stats: {
        totalTps: 0,
        totalDusun: 0,
        totalPetugas: 0,
        totalKendaraan: 0
      }
    }
  },
  async mounted() {
    await this.loadDashboard()
  },
  methods: {
    async loadDashboard() {
      try {
        const response = await api.get('/kadus/dashboard')
        this.stats = response.data.data
      } catch (error) {
        console.error('Error loading dashboard:', error)
      }
    }
  }
}
</script>

<style scoped>
.dashboard-kadus {
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.stat-card p {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}
</style>