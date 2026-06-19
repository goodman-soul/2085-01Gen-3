import { getDb } from '../db/index.js'
import type { DashboardStats, FloorSummary, ReplenishmentTask, SalesAnomaly } from '../../shared/types.js'

function toCamelCaseTask(row: any): ReplenishmentTask {
  return {
    id: row.id,
    floorId: row.floor_id,
    floor: row.floor_number,
    status: row.status,
    items: [],
    assignee: row.assignee,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }
}

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

export function getStats(): DashboardStats {
  const db = getDb()
  const deviceStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error,
      SUM(CASE WHEN (bean < 30 OR milk < 30 OR water < 30 OR cup < 30) AND status != 'error' THEN 1 ELSE 0 END) as warning
    FROM device
  `).get() as any
  
  const pendingTasks = db.prepare(`
    SELECT COUNT(*) as count
    FROM replenishment_task
    WHERE status IN ('pending', 'in_progress')
  `).get() as any
  
  const todaySales = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM sales_record
    WHERE date(timestamp) = date('now')
  `).get() as any
  
  const anomalies = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN confirmed = 1 THEN 1 ELSE 0 END) as confirmed
    FROM sales_anomaly
  `).get() as any
  
  return {
    totalDevices: deviceStats.total,
    onlineDevices: deviceStats.online,
    warningDevices: deviceStats.warning,
    errorDevices: deviceStats.error,
    pendingTasks: pendingTasks.count,
    todaySales: todaySales.total,
    anomalies: anomalies.total,
    confirmedAnomalies: anomalies.confirmed,
  }
}

export function getFloorSummaries(): FloorSummary[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT
      f.floor_number as floor,
      f.name,
      COUNT(d.id) as device_count,
      SUM(CASE WHEN (d.bean < 30 OR d.milk < 30 OR d.water < 30 OR d.cup < 30) AND d.status != 'error' THEN 1 ELSE 0 END) as warning_count,
      AVG(d.bean) as bean_avg,
      AVG(d.milk) as milk_avg,
      AVG(d.water) as water_avg,
      AVG(d.cup) as cup_avg
    FROM floor f
    LEFT JOIN device d ON f.id = d.floor_id
    GROUP BY f.id
    ORDER BY f.floor_number
  `).all()
  
  return rows.map((row: any) => ({
    floor: row.floor,
    name: row.name,
    deviceCount: row.device_count,
    warningCount: row.warning_count,
    beanAvg: Math.round(row.bean_avg || 0),
    milkAvg: Math.round(row.milk_avg || 0),
    waterAvg: Math.round(row.water_avg || 0),
    cupAvg: Math.round(row.cup_avg || 0),
  }))
}

export function getPendingTasks(): ReplenishmentTask[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT rt.*, f.floor_number
    FROM replenishment_task rt
    LEFT JOIN floor f ON rt.floor_id = f.id
    WHERE rt.status IN ('pending', 'in_progress')
    ORDER BY rt.created_at DESC
    LIMIT 10
  `).all()
  return rows.map(toCamelCaseTask)
}

export function getRecentAnomalies(): SalesAnomaly[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT * FROM sales_anomaly
    ORDER BY date DESC, id DESC
    LIMIT 10
  `).all()
  return rows.map(toCamelCaseAnomaly)
}
