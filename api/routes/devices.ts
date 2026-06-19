import { Router, type Request, type Response } from 'express'
import { getDevices, getDeviceById, getDeviceHistory } from '../services/deviceService.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const floorId = req.query.floorId ? Number(req.query.floorId) : undefined
  const devices = getDevices(floorId)
  res.json({
    success: true,
    data: devices,
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const device = getDeviceById(req.params.id)
  if (!device) {
    res.status(404).json({
      success: false,
      error: 'Device not found',
    })
    return
  }
  res.json({
    success: true,
    data: device,
  })
})

router.get('/:id/history', (req: Request, res: Response): void => {
  const days = req.query.days ? Number(req.query.days) : 30
  const history = getDeviceHistory(req.params.id, days)
  res.json({
    success: true,
    data: history,
  })
})

export default router
