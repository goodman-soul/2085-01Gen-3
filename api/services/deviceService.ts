import { getDb } from '../db/index.js'
import type { Device, DeviceStatus } from '../../shared/types.js'

function toCamelCaseDevice(row: any): Device {
  return {
    id: row.id,
    floorId: row.floor_id,
    floor: row.floor_number,
    location: row.location,
    status: row.status,
    bean: row.bean,
    milk: row.milk,
    water: row.water,
    cup: row.cup,
    faultCode: row.fault_code,
    lastReport: row.last_report,
  }
}

function toCamelCaseDeviceStatus(row: any): DeviceStatus {
  return {
    id: row.id,
    deviceId: row.device_id,
    bean: row.bean,
    milk: row.milk,
    water: row.water,
    cup: row.cup,
    faultCode: row.fault_code,
    timestamp: row.timestamp,
  }
}

export function getDevices(floorId?: number): Device[] {
  const db = getDb()
  let sql = `
    SELECT d.*, f.floor_number
    FROM device d
    LEFT JOIN floor f ON d.floor_id = f.id
  `
  const params: any[] = []
  if (floorId !== undefined) {
    sql += ' WHERE d.floor_id = ?'
    params.push(floorId)
  }
  sql += ' ORDER BY f.floor_number, d.id'
  const rows = db.prepare(sql).all(...params)
  return rows.map(toCamelCaseDevice)
}

export function getDeviceById(id: string): Device | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT d.*, f.floor_number
    FROM device d
    LEFT JOIN floor f ON d.floor_id = f.id
    WHERE d.id = ?
  `).get(id)
  return row ? toCamelCaseDevice(row) : null
}

export function getDeviceHistory(id: string, days: number = 30): DeviceStatus[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT * FROM device_status
    WHERE device_id = ?
    AND timestamp >= datetime('now', ?)
    ORDER BY timestamp DESC
  `).all(id, `-${days} days`)
  return rows.map(toCamelCaseDeviceStatus)
}
