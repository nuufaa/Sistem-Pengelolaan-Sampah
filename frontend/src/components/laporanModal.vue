<template>
  <div class="modal show">
    <div class="modal-overlay" @click="$emit('close')" />

    <div class="modal-content">
      <div class="modal-header">
        <h2>Detail Laporan</h2>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="detail-item"><b>TPS:</b> {{ tps?.nama }}</div>
        <div class="detail-item"><b>Desa:</b> Desa {{ tps?.desa }}</div>
        <div class="detail-item">
          <b>Kondisi:</b> {{ kondisiText(laporan?.kondisi) }}
        </div>
        <div class="detail-item"><b>Pelapor:</b> {{ laporan?.pelapor }}</div>
        <div class="detail-item"><b>No. HP:</b> {{ laporan?.hp }}</div>
        <div class="detail-item"><b>Tanggal:</b> {{ laporan?.tanggal }}</div>
        <div class="detail-item">
          <b>Keterangan:</b><br />
          {{ laporan?.keterangan }}
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
  tps: Object
})

function kondisiText(kondisi) {
  return {
    hampir_penuh: 'Hampir Penuh',
    penuh: 'Sudah Penuh',
    berserakan: 'Sampah Berserakan'
  }[kondisi] || kondisi
}
</script>

<style scoped src="@/assets/styles/admin.css"></style>