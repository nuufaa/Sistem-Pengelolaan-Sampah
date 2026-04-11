<template>
  <!-- MODAL STATISTIK VOLUME SAMPAH -->
  <div class="modal" 
      v-if="isModalOpen" 
      :class="{ show: isModalOpen }"
  >
    <div class="modal-overlay" @click="$emit('close')"></div>
      <div class="modal-content modal-schedule">
        <!-- HEADER -->
        <div class="modal-header">
          <h2>
          <span class="material-icons">bar_chart</span>
          Statistik Volume Sampah TPS
          </h2>
          <button class="modal-close" @click="$emit('close')">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- BODY -->
        <div class="modal-body schedule-body">
          <div class="filters-container">
            <div class="filter-group">
              <label>Periode:</label>
              <select v-model="filterChart" class="filter-select">
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
              </select>
            </div>

            <div class="filter-group">
              <label>TPS:</label>
              <div class="dropdown-container">
                <button @click="toggleDropdown" class="dropdown-button">
                    <span>{{ selectedTPS.length > 0 ? `${selectedTPS.length} TPS dipilih` : 'Pilih TPS' }}</span>
                    <span class="dropdown-icon" :class="{ open: isDropdownOpen }">▼</span>
                </button>

                <div v-if="isDropdownOpen" class="dropdown-menu">
                  <div class="dropdown-actions">
                      <button @click="selectAllTPS" class="action-btn select-all">Semua</button>
                      <button @click="deselectAllTPS" class="action-btn deselect-all">Kosong</button>
                  </div>
                  <div class="dropdown-search">
                      <input 
                          v-model="searchTPS" 
                          type="text" 
                          placeholder="Cari TPS..."
                          class="search-input"
                      />
                  </div>
                  <div class="dropdown-options">
                    <label v-for="tps in filteredTPSList" :key="tps" class="option-label">
                      <input 
                          type="checkbox" 
                          :value="tps" 
                          v-model="selectedTPS"
                          class="option-checkbox"
                      />
                      <span class="option-text">{{ tps }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
            <canvas ref="volumeSampahChartRef" class="line-chart"></canvas>
        </div>
      </div>
    </div>

</template>

<script setup>
import Chart from 'chart.js/auto'
import { ref, watch, defineProps, nextTick, computed } from 'vue'

const volumeSampahHarian = ref([])
let volumeSampahChart = null
const volumeSampahChartRef = ref(null)
const filterChart = ref('mingguan')
const tpsList = ref([])
const selectedTPS = ref([])
const isDropdownOpen = ref(false)
const searchTPS = ref('')

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false
  },
  volumeSampahData: {
    type: Array,
    default: () => []
  }
})

watch(() => props.volumeSampahData, (newData) => {
  if (newData && newData.length > 0) {
    volumeSampahHarian.value = newData
    // Update TPS list and set all as selected
    tpsList.value = [...new Set(newData.map(item => item.nama_tps))]
    selectedTPS.value = [...tpsList.value]
    // Trigger render immediately
    nextTick(() => {
      renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value, selectedTPS.value)
    })
  }
}, { deep: true })

async function renderVolumeSampahChart(data, filter = 'mingguan', selectedTPSList = []) {
  // Ensure canvas ref exists
  if (!volumeSampahChartRef.value) {
    await nextTick()
  }

  if (!volumeSampahChartRef.value) {
    console.error('Canvas ref not available')
    return
  }

  // destroy chart lama
  if (volumeSampahChart) {
    volumeSampahChart.destroy()
  }

  // format tanggal ke "10 Mar"
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    })
  }

  let labels = []

  if (filter === 'mingguan') {
    labels = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short'
      })
    })
  }

  else if (filter === 'bulanan') {
    const now = new Date()
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate()

    labels = [...Array(daysInMonth)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1)
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short'
      })
    })
  }

  const dataMap = {}

  data.forEach(d => {
    const key = `${formatDate(d.tanggal)}-${d.nama_tps}`

    if (!dataMap[key]) {
      dataMap[key] = 0
    }

    dataMap[key] += d.total_volume
  })

  // Filter datasets berdasarkan selected TPS
  const filteredTPSList = selectedTPSList.length > 0 ? selectedTPSList : [...new Set(data.map(item => item.nama_tps))]

  // Color palette untuk chart
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
    '#36A2EB', '#FFCE56', '#FF9F40', '#C9CBCF', '#9966FF'
  ]

  const datasets = filteredTPSList.map((tps, index) => {
    return {
      label: tps,
      data: labels.map(label => {
        return dataMap[`${label}-${tps}`] || 0
      }),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }
  })

  volumeSampahChart = new Chart(volumeSampahChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: true,
            color: '#e0e0e0'
          },
          ticks: {
            callback: (value) => value + ' kg',
            font: {
              size: 12
            }
          }
        },
        x: {
          grid: {
            drawBorder: true,
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      },

      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            font: {
              size: 12,
              weight: '500'
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          borderRadius: 4,
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.raw} kg`
            }
          }
        }
      }
    }
  })
}

watch(filterChart, () => {
  if (volumeSampahHarian.value.length) {
    renderVolumeSampahChart(
      volumeSampahHarian.value,
      filterChart.value,
      selectedTPS.value
    )
  }
})

watch(selectedTPS, () => {
  if (volumeSampahHarian.value.length) {
    renderVolumeSampahChart(
      volumeSampahHarian.value,
      filterChart.value,
      selectedTPS.value
    )
  }
}, { deep: true })

// Helper functions untuk select/deselect all
function selectAllTPS() {
  selectedTPS.value = [...tpsList.value]
}

function deselectAllTPS() {
  selectedTPS.value = []
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

const filteredTPSList = computed(() => {
  if (!searchTPS.value) {
    return tpsList.value
  }
  return tpsList.value.filter(tps => 
    tps.toLowerCase().includes(searchTPS.value.toLowerCase())
  )
})

// Close dropdown when clicking outside
watch(isDropdownOpen, (newVal) => {
  if (newVal) {
    searchTPS.value = ''
  }
})
</script>

<style scoped>
.filters-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 13px;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:hover {
  border-color: #999;
}

.filter-select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

/* Dropdown Styles */
.dropdown-container {
  position: relative;
}

.dropdown-button {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.dropdown-button:hover {
  border-color: #999;
}

.dropdown-button:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.dropdown-icon {
  font-size: 10px;
  transition: transform 0.2s ease;
  margin-left: 8px;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 6px 6px;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-actions {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.action-btn {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn.select-all:hover {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.action-btn.deselect-all:hover {
  background-color: #f44336;
  color: white;
  border-color: #f44336;
}

.dropdown-search {
  padding: 10px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.dropdown-options {
  max-height: 250px;
  overflow-y: auto;
  padding: 8px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 13px;
}

.option-label:hover {
  background-color: #f0f0f0;
}

.option-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4CAF50;
}

.option-text {
  user-select: none;
}

.line-chart {
  width: 100%;
  height: 400px;
  position: relative;
}
</style>