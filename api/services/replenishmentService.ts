import { getDb } from '../db/index.js'
import type { ReplenishmentTask, ReplenishmentItem } from '../../shared/types.js'

function toCamelCaseItem(row: any): ReplenishmentItem {
  return {
    id: row.id,
    taskId: row.task_id,
    deviceId: row.device_id,
    beanNeeded: row.bean_needed,
    milkNeeded: row.milk_needed,
    waterNeeded: row.water_needed,
    cupNeeded: row.cup_needed,
  }
}

function toCamelCaseTask(row: any, items: ReplenishmentItem[]): ReplenishmentTask {
  return {
    id: row.id,
    floorId: row.floor_id,
    floor: row.floor_number,
    status: row.status,
    items,
    assignee: row.assignee,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }
}

function getTaskItems(taskId: string): ReplenishmentItem[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT * FROM replenishment_item
    WHERE task_id = ?
    ORDER BY id
  `).all(taskId)
  return rows.map(toCamelCaseItem)
}

export function getTasks(status?: string): ReplenishmentTask[] {
  const db = getDb()
  let sql = `
    SELECT rt.*, f.floor_number
    FROM replenishment_task rt
    LEFT JOIN floor f ON rt.floor_id = f.id
  `
  const params: any[] = []
  if (status) {
    sql += ' WHERE rt.status = ?'
    params.push(status)
  }
  sql += ' ORDER BY rt.created_at DESC'
  const rows = db.prepare(sql).all(...params) as any[]
  return rows.map(row => {
    const items = getTaskItems(row.id)
    return toCamelCaseTask(row, items)
  })
}

export function getTaskById(id: string): ReplenishmentTask | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT rt.*, f.floor_number
    FROM replenishment_task rt
    LEFT JOIN floor f ON rt.floor_id = f.id
    WHERE rt.id = ?
  `).get(id)
  if (!row) return null
  const items = getTaskItems(id)
  return toCamelCaseTask(row, items)
}

export function completeTask(id: string): boolean {
  const db = getDb()
  const result = db.prepare(`
    UPDATE replenishment_task
    SET status = 'completed', completed_at = datetime('now')
    WHERE id = ? AND status != 'completed'
  `).run(id)
  return result.changes > 0
}

export function getHistory(days: number = 30): ReplenishmentTask[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT rt.*, f.floor_number
    FROM replenishment_task rt
    LEFT JOIN floor f ON rt.floor_id = f.id
    WHERE rt.status = 'completed'
    AND rt.completed_at >= datetime('now', ?)
    ORDER BY rt.completed_at DESC
  `).all(`-${days} days`) as any[]
  return rows.map(row => {
    const items = getTaskItems(row.id)
    return toCamelCaseTask(row, items)
  })
}
