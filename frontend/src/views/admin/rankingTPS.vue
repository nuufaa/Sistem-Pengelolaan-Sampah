<template>
  <section class="content-section active">
    <div class="section-header">
      <h2 class="section-title">Ranking TPS Terbaik</h2>
      <div class="header-actions">
        <div class="filter-controls">
          <div class="date-input-group">
            <input type="date" v-model="startDate" @change="fetchData" class="btn-secondary date-input">
            <span class="date-sep">Sampai</span>
            <input type="date" v-model="endDate" @change="fetchData" class="btn-secondary date-input">
          </div>
          <div class="divider-v"></div>
          <select v-model="selectedMonth" @change="fetchData" class="btn-secondary">
            <option v-for="(name, index) in monthNames" :key="index" :value="index + 1">
              {{ name }}
            </option>
          </select>
          <select v-model="selectedYear" @change="fetchData" class="btn-secondary">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <button class="btn-primary" @click="fetchData" :disabled="loading">
            <span class="material-icons" :class="{ spinning: loading }">refresh</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data ranking...</p>
    </div>

    <div v-else class="monitoring-grid">
      <div class="chart-card">
        <div class="card-header-flex">
          <h3 class="chart-title">Data Peringkat TPS</h3>
          <span class="period-label">
            <template v-if="startDate && endDate">
              {{ formatDate(startDate) }} - {{ formatDate(endDate) }}
            </template>
            <template v-else>
              {{ monthNames[selectedMonth - 1] }} {{ selectedYear }}
            </template>
          </span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>TPS</th>
                <th>Wilayah</th>
                <th>Kapasitas</th>
                <th>Volume</th>
                <th>Skor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in rankingTPS" :key="item.id_tps" class="responsive-tr">
                <td>{{ index + 1 }}</td>
                <td>{{ item.nama_tps }}</td>
                <td>{{ item.nama_dusun }}</td>
                <td>{{ item.kapasitas }} kg</td>
                <td>{{ item.total_volume }} kg</td>
                <td>
                  <div class="score-display">
                    <!-- <div class="score-bar-bg">
                      <div class="score-bar-fill" :style="{ width: item.score + '%', background: getScoreColor(item.score) }"></div>
                    </div> -->
                  </div>
                  <span class="score-text">{{ item.score }}%</span>
                </td>
              </tr>
              <tr v-if="rankingTPS.length === 0">
                <td colspan="6" class="text-center py-4">Tidak ada data ranking untuk periode ini</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const startDate = ref('')
const endDate = ref('')
const rankingTPS = ref([])

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = computed(() => {
  const current = new Date().getFullYear()
  return [current, current - 1, current - 2]
})

async function fetchData() {
  try {
    loading.value = true
    let url = `/api/dashboard?month=${selectedMonth.value}&year=${selectedYear.value}`
    if (startDate.value && endDate.value) {
      url = `/api/dashboard?start_date=${startDate.value}&end_date=${endDate.value}`
    }
    const res = await api.get(url)
    rankingTPS.value = res.data.rankingTPS || []
  } catch (err) {
    console.error('Gagal ambil data ranking:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(fetchData)
</script>

<style scoped src="@/assets/styles/admin.css"></style>
<style scoped>
.monitoring-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}
.period-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  background: var(--status-normal-bg);
  padding: 4px 12px;
  border-radius: 20px;
}
.rank-badge {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}
.rank-1 { background: #FFD700; color: #856404; }
.rank-2 { background: #C0C0C0; color: #383d41; }
.rank-3 { background: #CD7F32; color: #fff; }

.rank-badge {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  border: 2px solid transparent;
}

.rank-1 { background: #fffbeb; color: #856404; border-color: #fde68a; }
.rank-2 { background: #f8fafc; color: #475569; border-color: #e2e8f0; }
.rank-3 { background: #fff7ed; color: #9a3412; border-color: #fed7aa; }

.score-display {
  display: flex;
  align-items: center;
  gap: 12px;
}
.score-bar-bg {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  min-width: 100px;
}
.score-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-out;
}
.score-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 40px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.date-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-input {
  padding: 8px 12px;
  font-size: 13px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
}
.date-sep {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}
.divider-v {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 4px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .header-actions {
    width: 100%;
  }
  .filter-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .date-input-group {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px;
  }
  .divider-v {
    display: none;
  }
  .filter-controls select {
    width: 100%;
  }
  .filter-controls .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .data-table thead {
    display: none;
  }
  .data-table, .data-table tbody, .data-table tr, .data-table td {
    display: block;
    width: 100%;
  }
  .data-table tr {
    margin-bottom: 16px;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 16px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f8fafc;
    text-align: left;
  }
  .data-table td:last-child {
    border-bottom: none;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .data-table td::before {
    content: attr(data-label);
    font-weight: 700;
    color: #94a3b8;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  /* Khusus Peringkat & TPS di atas */
  .data-table td[data-label="Peringkat"] {
    background: #f8fafc;
    margin: -16px -16px 8px -16px;
    padding: 12px 16px;
    border-radius: 16px 16px 0 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .data-table td[data-label="TPS"] {
    font-size: 16px;
    color: #0f172a;
    border-bottom: 2px solid #f1f5f9;
    margin-bottom: 4px;
    padding-bottom: 12px;
  }
  .score-display {
    width: 100%;
    margin-top: 4px;
  }
  .score-bar-bg {
    min-width: unset;
    width: 100%;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: var(--text-secondary);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-primary);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.spinning { animation: spin 1s linear infinite; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
</style>
