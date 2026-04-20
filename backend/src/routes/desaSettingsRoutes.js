const express = require('express')
const router = express.Router()
const DesaSettingsController = require('../controllers/DesaSettingsController')

router.get('/desa-settings/logo', DesaSettingsController.getLogo)
router.post('/desa-settings/logo', DesaSettingsController.saveLogo)
router.delete('/desa-settings/logo', DesaSettingsController.deleteLogo)

module.exports = router