import { getDb } from '../db/index.js'
import type { Setting } from '../../shared/types.js'

function toCamelCaseSetting(row: any): Setting {
  return {
    key: row.key,
    value: row.value,
  }
}

export function getSettings(): Setting[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM settings').all()
  return rows.map(toCamelCaseSetting)
}

export function getSettingsMap(): Record<string, string> {
  const settings = getSettings()
  const map: Record<string, string> = {}
  settings.forEach((s) => {
    map[s.key] = s.value
  })
  return map
}

export function updateSettings(data: Record<string, string>): boolean {
  const db = getDb()
  const keys = Object.keys(data)
  if (keys.length === 0) return false
  
  const stmt = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `)
  
  const transaction = db.transaction((items: [string, string][]) => {
    for (const [key, value] of items) {
      stmt.run(key, value)
    }
  })
  
  try {
    transaction(keys.map(k => [k, data[k]] as [string, string]))
    return true
  } catch (e) {
    return false
  }
}
