import { apiFetch} from '../services/api'

export async function fetchTitikTps() {
  try {
    const data = await apiFetch('/api/tps/info')
    
    if (!Array.isArray(data)) {
      console.warn('fetchTitikTps: Data bukan array', data)
      return []
    }

    // NORMALISASI: pastikan setiap item punya status_angkut yang valid
    const normalizedData = data.map(item => {
      // Ambil status_angkut dari response, default ke 'belum_diangkut'
      const status = item.status_angkut?.trim() || 'belum_diangkut'
      const validStatuses = ['belum_diangkut', 'diangkut', 'selesai']
      
      return {
        ...item,
        // Validasi: hanya accept status yang valid
        status_angkut: validStatuses.includes(status.toLowerCase()) 
          ? status.toLowerCase() 
          : 'belum_diangkut'
      }
    })

    return normalizedData
  } catch (err) {
    console.error('Fetch TPS gagal:', err)
    return []
  }
}

export const scheduleData = [ ];
export const tpsData      = [ ];
