import { apiFetch} from '../services/api'

// --- di services/wasteService.js ---------------------------------
export async function fetchTitikTps() {
  try {
    const data = await apiFetch('/api/tps/info')
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Fetch TPS gagal:', err)
    return []
  }
}

export const scheduleData = [ /* … */ ];
export const tpsData      = [ /* digunakan hanya untuk contoh */ ];
