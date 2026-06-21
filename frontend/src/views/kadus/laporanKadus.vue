<template>
  <div class="laporan-kadus">
    <h2>Laporan - Kadus/Kades</h2>
    <div class="laporan-list">
      <div v-for="laporan in laporanList" :key="laporan.id" class="laporan-item">
        <h3>{{ laporan.judul }}</h3>
        <p>{{ laporan.deskripsi }}</p>
        <small>Tanggal: {{ laporan.tanggal }}</small>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../services/api.js'

export default {
  name: 'LaporanKadus',
  data() {
    return {
      laporanList: []
    }
  },
  async mounted() {
    await this.loadLaporan()
  },
  methods: {
    async loadLaporan() {
      try {
        const response = await api.get('/kadus/laporan')
        this.laporanList = response.data
      } catch (error) {
        console.error('Error loading laporan:', error)
      }
    }
  }
}
</script>

<style scoped>
.laporan-kadus {
  padding: 2rem;
}

.laporan-list {
  margin-top: 2rem;
}

.laporan-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.laporan-item h3 {
  margin: 0 0 0.5rem 0;
}

.laporan-item p {
  margin: 0 0 0.5rem 0;
}

.laporan-item small {
  color: #666;
}
</style>