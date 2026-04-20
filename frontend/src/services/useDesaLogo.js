import { ref } from 'vue'
import axios from 'axios'

export function useDesaLogo() {
  const logoSrc = ref(null)
  const lastUpdated = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function fetchLogo() {
    loading.value = true
    try {
      const { data } = await axios.get('/api/desa-settings/logo')
      logoSrc.value = data.logo_base64 ?? null
      lastUpdated.value = data.updated_at
        ? new Date(data.updated_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
          })
        : null
    } catch {
      error.value = 'Gagal memuat logo'
    } finally {
      loading.value = false
    }
  }

  async function saveLogo(base64) {
    saving.value = true
    error.value = null
    try {
      await axios.post('/api/desa-settings/logo', { logo_base64: base64 })
      logoSrc.value = base64
      await fetchLogo()
      return true
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Gagal menyimpan logo'
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteLogo() {
    saving.value = true
    try {
      await axios.delete('/api/desa-settings/logo')
      logoSrc.value = null
      lastUpdated.value = null
    } catch {
      error.value = 'Gagal menghapus logo'
    } finally {
      saving.value = false
    }
  }

  return { logoSrc, lastUpdated, loading, saving, error, fetchLogo, saveLogo, deleteLogo }
}