<template>
  <div class="modal show">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detail Kepatuhan - {{ kepatuhan?.nama }}</h3>
          <button class="modal-close" @click="$emit('close')">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="loading-state">
            <p>Memuat detail...</p>
          </div>
          <table v-else class="data-table">
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
              <tr v-for="detail in detail" :key="detail.id_daftar_tugas" class="detail-row">
                <td data-label="TPS">{{ detail.nama_tps }}</td>
                <td data-label="Hari Jadwal">{{ detail.hari_pengambilan }}</td>
                <td data-label="Tanggal Jadwal">{{ formatDate(detail.tgl_pengambilan) }}</td>
                <td data-label="Tanggal Pengambilan">{{ detail.tgl_terakhir_diambil ? formatDate(detail.tgl_terakhir_diambil) : '-' }}</td>
                <td data-label="Status Kepatuhan">
                  <span
                    class="status-kepatuhan"
                    :class="detail.status_kepatuhan === 'Tepat Waktu' ? 'tepat' : 'terlambat'"
                  >
                    {{ detail.status_kepatuhan }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close'])
const props = defineProps({
    kepatuhan: Object,
    detail: Array,
    loading: Boolean
})

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>