import { getDb } from '../db/index.js'
import type { Product } from '../../shared/types.js'

function toCamelCaseProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    status: row.status,
    removedAt: row.removed_at,
  }
}

export function getProducts(status?: string): Product[] {
  const db = getDb()
  let sql = 'SELECT * FROM product'
  const params: any[] = []
  if (status) {
    sql += ' WHERE status = ?'
    params.push(status)
  }
  sql += ' ORDER BY category, name'
  const rows = db.prepare(sql).all(...params)
  return rows.map(toCamelCaseProduct)
}

export function updateProductStatus(id: string, status: string): boolean {
  const db = getDb()
  const updateData: any[] = [status, id]
  let sql = 'UPDATE product SET status = ?'
  if (status === 'inactive') {
    sql += ", removed_at = datetime('now')"
  } else {
    sql += ', removed_at = NULL'
  }
  sql += ' WHERE id = ?'
  const result = db.prepare(sql).run(...updateData)
  return result.changes > 0
}
