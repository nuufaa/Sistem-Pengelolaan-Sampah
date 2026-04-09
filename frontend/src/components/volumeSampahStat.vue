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
                <select v-model="filterChart">
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                </select>
                <canvas ref="volumeSampahChartRef" class="line-chart" style="height: 300px;"></canvas>
            </div>
        </div>
    </div>

</template>

<script setup>
import Chart from 'chart.js/auto'
import { ref, watch, defineProps, defineEmits, nextTick } from 'vue'

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

const emit = defineEmits(['close'])

const volumeSampahHarian = ref([])
let volumeSampahChart = null
const volumeSampahChartRef = ref(null)
const filterChart = ref('mingguan')

watch(() => props.volumeSampahData, (newData) => {
  if (newData && newData.length > 0) {
    volumeSampahHarian.value = newData
    // Trigger render immediately
    nextTick(() => {
      renderVolumeSampahChart(volumeSampahHarian.value, filterChart.value)
    })
  }
}, { deep: true })

async function renderVolumeSampahChart(data, filter = 'mingguan') {
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

  const tpsList = [...new Set(data.map(item => item.nama_tps))]

  const dataMap = {}

  data.forEach(d => {
    const key = `${formatDate(d.tanggal)}-${d.nama_tps}`

    if (!dataMap[key]) {
      dataMap[key] = 0
    }

    dataMap[key] += d.total_volume
  })

  const datasets = tpsList.map((tps) => {
    return {
      label: tps,
      data: labels.map(label => {
        return dataMap[`${label}-${tps}`] || 0
      })
    }
  })

  volumeSampahChart = new Chart(volumeSampahChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      barPercentage: 0.4,
      categoryPercentage: 0.7,
      barThickness: 5,
      maxBarThickness: 20,
      borderRadius: 5,

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => value + ' kg'
          }
        }
      },

      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 12,
              weight: 'bold'
            },
            padding: 8,
            usePointStyle: true
          }
        },
        tooltip: {
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
      filterChart.value
    )
  }
})
</script>

<style scoped>
select {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.line-chart {
  position: relative;
  width: 100%;
  height: 400px;
}
</style>