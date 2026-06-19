import { Router, type Request, type Response } from 'express'
import { getStats, getFloorSummaries, getPendingTasks, getRecentAnomalies } from '../services/dashboardService.js'

const router = Router()

router.get('/stats', (req: Request, res: Response): void => {
  const stats = getStats()
  res.json({
    success: true,
    data: stats,
  })
})

router.get('/floors', (req: Request, res: Response): void => {
  const summaries = getFloorSummaries()
  res.json({
    success: true,
    data: summaries,
  })
})

router.get('/tasks/pending', (req: Request, res: Response): void => {
  const tasks = getPendingTasks()
  res.json({
    success: true,
    data: tasks,
  })
})

router.get('/anomalies/recent', (req: Request, res: Response): void => {
  const anomalies = getRecentAnomalies()
  res.json({
    success: true,
    data: anomalies,
  })
})

export default router
