<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content laporan-modal">
      <div class="modal-header">
        <h2>Detail Laporan</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="detail-item"><b>TPS:</b> {{ laporan?.nama_tps }}</div>
        <div class="detail-item">
          <b>Kondisi:</b> {{ kondisiText(laporan?.kondisi_tps) }}
        </div>
        <div class="detail-item"><b>Pelapor:</b> {{ laporan?.nama_pelapor }}</div>
        <div class="detail-item"><b>Tanggal & Waktu:</b> {{ formatDate(laporan?.tgl_laporan) }}</div>
        <div class="detail-item">
          <b>Keterangan:</b> {{ laporan?.deskripsi || '-' }}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-primary" @click="$emit('close')">
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  laporan: Object,
})

function kondisiText(kondisi) {
  return {
    hampir_penuh: 'Hampir Penuh',
    penuh: 'Sudah Penuh',
    sampah_berserakan: 'Sampah Berserakan'
  }[kondisi] || kondisi
}

function formatDate(date) {
  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

</script>

<style scoped src="@/assets/styles/admin.css"></style>