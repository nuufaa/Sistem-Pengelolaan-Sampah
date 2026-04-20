const {db} = require("../config/db")

const DESA_CODE = 'sembalun_bumbung'

const DesaSettingsModel = {
  async getLogo() {
    const [rows] = await db.query(
      'SELECT logo_base64, updated_at FROM desa_settings WHERE desa_code = ?',
      [DESA_CODE]
    )
    return rows[0] ?? null
  },

  async upsertLogo(logo_base64) {
    await db.query(
      `INSERT INTO desa_settings (desa_code, logo_base64)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE logo_base64 = VALUES(logo_base64)`,
      [DESA_CODE, logo_base64]
    )
  },

  async deleteLogo() {
    await db.query(
      'UPDATE desa_settings SET logo_base64 = NULL WHERE desa_code = ?',
      [DESA_CODE]
    )
  }
}

module.exports = DesaSettingsModel