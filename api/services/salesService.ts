import { getDb } from '../db/index.js'
import type { SalesAnomaly, SalesTrendItem } from '../../shared/types.js'

function toCamelCaseAnomaly(row: any): SalesAnomaly {
  return {
    id: row.id,
    deviceId: row.device_id,
    productId: row.product_id,
    date: row.date,
    dropRate: row.drop_rate,
    cause: row.cause,
    confidence: row.confidence,
    details: row.details,
    confirmed: !!row.confirmed,
  }
}

export function getTrend(days: number = 7): SalesTrendItem[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT 
      date(timestamp) as date,
      SUM(amount) as sales
    FROM sales_record
    WHERE timestamp >= datetime('now', ?)
    GROUP BY date(timestamp)
    ORDER BY date DESC
  `).all(`-${days} days`)
  
  const anomalyDates = new Set(
    db.prepare(`
      SELECT DISTINCT date FROM sales_anomaly
      WHERE date >= date('now', ?)
    `).all(`-${days} days`).map((r: any) => r.date)
  )
  
  return rows.map((row: any) => ({
    date: row.date,
    sales: row.sales,
    anomaly: anomalyDates.has(row.date),
  }))
}

export function getAnomalies(confirmed?: boolean): SalesAnomaly[] {
  const db = getDb()
  let sql = `
    SELECT * FROM sales_anomaly
  `
  const params: any[] = []
  if (confirmed !== undefined) {
    sql += ' WHERE confirmed = ?'
    params.push(confirmed ? 1 : 0)
  }
  sql += ' ORDER BY date DESC, id DESC'
  const rows = db.prepare(sql).all(...params)
  return rows.map(toCamelCaseAnomaly)
}

export function confirmAnomaly(id: number, cause?: string): boolean {
  const db = getDb()
  const updateData: any[] = [1, id]
  let sql = 'UPDATE sales_anomaly SET confirmed = ?'
  if (cause) {
    sql += ', cause = ?'
    updateData.unshift(cause)
  }
  sql += ' WHERE id = ?'
  const result = db.prepare(sql).run(...updateData)
  return result.changes > 0
}
