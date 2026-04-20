const DesaSettingsModel = require('../models/DesaSettingsModel')

const MAX_BASE64_KB = 700 // ~512KB file asli setelah di-encode Base64

const DesaSettingsController = {
  async getLogo(req, res) {
    try {
      const data = await DesaSettingsModel.getLogo()
      res.json(data ?? { logo_base64: null, updated_at: null })
    } catch (err) {
      console.error('getLogo error:', err)
      res.status(500).json({ message: 'Gagal mengambil logo' })
    }
  },

  async saveLogo(req, res) {
    const { logo_base64 } = req.body

    if (!logo_base64) {
      return res.status(400).json({ message: 'logo_base64 wajib diisi' })
    }

    const sizeKB = Buffer.byteLength(logo_base64, 'utf8') / 1024
    if (sizeKB > MAX_BASE64_KB) {
      return res.status(400).json({ message: 'Ukuran file melebihi batas 512 KB' })
    }

    try {
      await DesaSettingsModel.upsertLogo(logo_base64)
      res.json({ message: 'Logo berhasil disimpan' })
    } catch (err) {
      console.error('saveLogo error:', err)
      res.status(500).json({ message: 'Gagal menyimpan logo' })
    }
  },

  async deleteLogo(req, res) {
    try {
      await DesaSettingsModel.deleteLogo()
      res.json({ message: 'Logo berhasil dihapus' })
    } catch (err) {
      console.error('deleteLogo error:', err)
      res.status(500).json({ message: 'Gagal menghapus logo' })
    }
  }
}

module.exports = DesaSettingsController