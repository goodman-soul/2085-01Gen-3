import { Router, type Request, type Response } from 'express'
import { getProducts, updateProductStatus } from '../services/productService.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const status = req.query.status as string | undefined
  const products = getProducts(status)
  res.json({
    success: true,
    data: products,
  })
})

router.patch('/:id/status', (req: Request, res: Response): void => {
  const status = req.body.status as string
  if (!status || !['active', 'inactive'].includes(status)) {
    res.status(400).json({
      success: false,
      error: 'Invalid status. Must be "active" or "inactive"',
    })
    return
  }
  const success = updateProductStatus(req.params.id, status)
  if (!success) {
    res.status(404).json({
      success: false,
      error: 'Product not found',
    })
    return
  }
  res.json({
    success: true,
    message: 'Product status updated',
  })
})

export default router
