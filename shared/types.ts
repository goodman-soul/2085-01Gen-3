export interface Device {
  id: string;
  floorId: number;
  floor: number;
  location: string;
  status: 'online' | 'offline' | 'error';
  bean: number;
  milk: number;
  water: number;
  cup: number;
  faultCode: string | null;
  lastReport: string;
}

export interface DeviceStatus {
  id: number;
  deviceId: string;
  bean: number;
  milk: number;
  water: number;
  cup: number;
  faultCode: string | null;
  timestamp: string;
}

export interface ReplenishmentTask {
  id: string;
  floorId: number;
  floor: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  items: ReplenishmentItem[];
  assignee: string;
  createdAt: string;
  completedAt: string | null;
}

export interface ReplenishmentItem {
  id: number;
  taskId: string;
  deviceId: string;
  beanNeeded: number;
  milkNeeded: number;
  waterNeeded: number;
  cupNeeded: number;
}

export interface SalesRecord {
  id: number;
  deviceId: string;
  productId: string;
  amount: number;
  timestamp: string;
}

export interface SalesAnomaly {
  id: number;
  deviceId: string;
  productId: string | null;
  date: string;
  dropRate: number;
  cause: 'out_of_stock' | 'machine_down' | 'product_removed' | 'unknown';
  confidence: number;
  details: string | null;
  confirmed: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
  removedAt: string | null;
}

export interface Floor {
  id: number;
  floorNumber: number;
  name: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  warningDevices: number;
  errorDevices: number;
  pendingTasks: number;
  todaySales: number;
  anomalies: number;
  confirmedAnomalies: number;
}

export interface SalesTrendItem {
  date: string;
  sales: number;
  anomaly?: boolean;
}

export interface FloorSummary {
  floor: number;
  name: string;
  deviceCount: number;
  warningCount: number;
  beanAvg: number;
  milkAvg: number;
  waterAvg: number;
  cupAvg: number;
}
