import { Router, type Request, type Response } from 'express'
import { getSettings, updateSettings } from '../services/settingsService.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const settings = getSettings()
  res.json({
    success: true,
    data: settings,
  })
})

router.put('/', (req: Request, res: Response): void => {
  const data = req.body as Record<string, string>
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    res.status(400).json({
      success: false,
      error: 'Invalid data format. Must be an object',
    })
    return
  }
  const success = updateSettings(data)
  if (!success) {
    res.status(400).json({
      success: false,
      error: 'Failed to update settings',
    })
    return
  }
  res.json({
    success: true,
    message: 'Settings updated',
  })
})

export default router
