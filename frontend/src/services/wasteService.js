import { apiFetch} from '../services/api'

export async function fetchTitikTps() {
  try {
    const data = await apiFetch('/api/tps/info')
    
    // return Array.isArray(data) ? data : []
    // NORMALISASI: pastikan setiap item punya status_angkut yang valid
    return data.map(item => ({
      ...item,
      // Trim whitespace, default ke 'belum_diangkut' jika tidak ada
      status_angkut: (item.status_angkut?.trim() || 'belum_diangkut').toLowerCase()
    }))
  } catch (err) {
    console.error('Fetch TPS gagal:', err)
    return []
  }
}

export const scheduleData = [ ];
export const tpsData      = [ ];
