import { get, post, put, patch } from './apiClient';
import type {
  Device,
  DeviceStatus,
  ReplenishmentTask,
  SalesAnomaly,
  SalesTrendItem,
  Product,
  Setting,
  DashboardStats,
  FloorSummary,
} from '../../shared/types';

export const devices = {
  getDevices: (floorId?: number) => {
    const url = floorId !== undefined ? `/devices?floorId=${floorId}` : '/devices';
    return get<Device[]>(url);
  },

  getDevice: (id: string) => {
    return get<Device>(`/devices/${id}`);
  },

  getDeviceHistory: (id: string, days?: number) => {
    const url = days !== undefined ? `/devices/${id}/history?days=${days}` : `/devices/${id}/history`;
    return get<DeviceStatus[]>(url);
  },
};

export const replenishment = {
  getTasks: (status?: string) => {
    const url = status ? `/replenishment/tasks?status=${status}` : '/replenishment/tasks';
    return get<ReplenishmentTask[]>(url);
  },

  getTask: (id: string) => {
    return get<ReplenishmentTask>(`/replenishment/tasks/${id}`);
  },

  completeTask: (id: string) => {
    return post(`/replenishment/tasks/${id}/complete`);
  },

  getHistory: (days?: number) => {
    const url = days !== undefined ? `/replenishment/history?days=${days}` : '/replenishment/history';
    return get<ReplenishmentTask[]>(url);
  },
};

export const sales = {
  getTrend: (days?: number) => {
    const url = days !== undefined ? `/sales/trend?days=${days}` : '/sales/trend';
    return get<SalesTrendItem[]>(url);
  },

  getAnomalies: (confirmed?: boolean) => {
    const url = confirmed !== undefined ? `/sales/anomalies?confirmed=${confirmed}` : '/sales/anomalies';
    return get<SalesAnomaly[]>(url);
  },

  confirmAnomaly: (id: number, cause?: string) => {
    return post(`/sales/anomalies/${id}/confirm`, cause ? { cause } : undefined);
  },
};

export const products = {
  getProducts: (status?: string) => {
    const url = status ? `/products?status=${status}` : '/products';
    return get<Product[]>(url);
  },

  updateProductStatus: (id: string, status: string) => {
    return patch(`/products/${id}/status`, { status });
  },
};

export const settings = {
  getSettings: () => {
    return get<Setting[]>('/settings');
  },

  updateSettings: (data: Record<string, string>) => {
    return put('/settings', data);
  },
};

export const dashboard = {
  getStats: () => {
    return get<DashboardStats>('/dashboard/stats');
  },

  getFloorSummaries: () => {
    return get<FloorSummary[]>('/dashboard/floors');
  },

  getPendingTasks: () => {
    return get<ReplenishmentTask[]>('/dashboard/tasks/pending');
  },

  getRecentAnomalies: () => {
    return get<SalesAnomaly[]>('/dashboard/anomalies/recent');
  },
};
