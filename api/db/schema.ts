export const initSql = `
-- 楼层表
CREATE TABLE IF NOT EXISTS floor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  floor_number INTEGER NOT NULL,
  name TEXT NOT NULL
);

-- 设备表
CREATE TABLE IF NOT EXISTS device (
  id TEXT PRIMARY KEY,
  floor_id INTEGER NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online',
  bean INTEGER NOT NULL DEFAULT 100,
  milk INTEGER NOT NULL DEFAULT 100,
  water INTEGER NOT NULL DEFAULT 100,
  cup INTEGER NOT NULL DEFAULT 100,
  fault_code TEXT,
  last_report DATETIME NOT NULL,
  FOREIGN KEY (floor_id) REFERENCES floor(id)
);

-- 设备状态历史表
CREATE TABLE IF NOT EXISTS device_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  bean INTEGER NOT NULL,
  milk INTEGER NOT NULL,
  water INTEGER NOT NULL,
  cup INTEGER NOT NULL,
  fault_code TEXT,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (device_id) REFERENCES device(id)
);

-- 补货任务表
CREATE TABLE IF NOT EXISTS replenishment_task (
  id TEXT PRIMARY KEY,
  floor_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assignee TEXT,
  created_at DATETIME NOT NULL,
  completed_at DATETIME,
  FOREIGN KEY (floor_id) REFERENCES floor(id)
);

-- 补货项目表
CREATE TABLE IF NOT EXISTS replenishment_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  bean_needed INTEGER NOT NULL DEFAULT 0,
  milk_needed INTEGER NOT NULL DEFAULT 0,
  water_needed INTEGER NOT NULL DEFAULT 0,
  cup_needed INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES replenishment_task(id),
  FOREIGN KEY (device_id) REFERENCES device(id)
);

-- 产品表
CREATE TABLE IF NOT EXISTS product (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  removed_at DATETIME
);

-- 销售记录表
CREATE TABLE IF NOT EXISTS sales_record (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (device_id) REFERENCES device(id),
  FOREIGN KEY (product_id) REFERENCES product(id)
);

-- 销量异常表
CREATE TABLE IF NOT EXISTS sales_anomaly (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  product_id TEXT,
  date DATE NOT NULL,
  drop_rate DECIMAL(5,2) NOT NULL,
  cause TEXT NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  details TEXT,
  confirmed BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (device_id) REFERENCES device(id),
  FOREIGN KEY (product_id) REFERENCES product(id)
);

-- 系统设置表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_device_floor ON device(floor_id);
CREATE INDEX IF NOT EXISTS idx_device_status_device ON device_status(device_id);
CREATE INDEX IF NOT EXISTS idx_device_status_timestamp ON device_status(timestamp);
CREATE INDEX IF NOT EXISTS idx_replenishment_task_floor ON replenishment_task(floor_id);
CREATE INDEX IF NOT EXISTS idx_sales_record_device ON sales_record(device_id);
CREATE INDEX IF NOT EXISTS idx_sales_record_product ON sales_record(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_record_timestamp ON sales_record(timestamp);
CREATE INDEX IF NOT EXISTS idx_sales_anomaly_device ON sales_anomaly(device_id);
CREATE INDEX IF NOT EXISTS idx_sales_anomaly_date ON sales_anomaly(date);
`;
