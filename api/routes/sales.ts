import { Router, type Request, type Response } from 'express'
import { getTrend, getAnomalies, confirmAnomaly } from '../services/salesService.js'

const router = Router()

router.get('/trend', (req: Request, res: Response): void => {
  const days = req.query.days ? Number(req.query.days) : 7
  const trend = getTrend(days)
  res.json({
    success: true,
    data: trend,
  })
})

router.get('/anomalies', (req: Request, res: Response): void => {
  let confirmed: boolean | undefined
  if (req.query.confirmed !== undefined) {
    confirmed = req.query.confirmed === 'true' || req.query.confirmed === '1'
  }
  const anomalies = getAnomalies(confirmed)
  res.json({
    success: true,
    data: anomalies,
  })
})

router.post('/anomalies/:id/confirm', (req: Request, res: Response): void => {
  const id = Number(req.params.id)
  const cause = req.body.cause as string | undefined
  const success = confirmAnomaly(id, cause)
  if (!success) {
    res.status(404).json({
      success: false,
      error: 'Anomaly not found',
    })
    return
  }
  res.json({
    success: true,
    message: 'Anomaly confirmed',
  })
})

export default router
