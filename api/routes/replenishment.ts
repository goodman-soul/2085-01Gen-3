import { Router, type Request, type Response } from 'express'
import { getTasks, getTaskById, completeTask, getHistory } from '../services/replenishmentService.js'

const router = Router()

router.get('/tasks', (req: Request, res: Response): void => {
  const status = req.query.status as string | undefined
  const tasks = getTasks(status)
  res.json({
    success: true,
    data: tasks,
  })
})

router.get('/tasks/:id', (req: Request, res: Response): void => {
  const task = getTaskById(req.params.id)
  if (!task) {
    res.status(404).json({
      success: false,
      error: 'Task not found',
    })
    return
  }
  res.json({
    success: true,
    data: task,
  })
})

router.post('/tasks/:id/complete', (req: Request, res: Response): void => {
  const success = completeTask(req.params.id)
  if (!success) {
    res.status(404).json({
      success: false,
      error: 'Task not found or already completed',
    })
    return
  }
  res.json({
    success: true,
    message: 'Task completed',
  })
})

router.get('/history', (req: Request, res: Response): void => {
  const days = req.query.days ? Number(req.query.days) : 30
  const history = getHistory(days)
  res.json({
    success: true,
    data: history,
  })
})

export default router
