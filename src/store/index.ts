import { create } from 'zustand';
import {
  devices,
  replenishment,
  sales,
  products,
  settings,
  dashboard,
} from '../lib/api';
import type {
  Device,
  DeviceStatus,
  ReplenishmentTask,
  SalesAnomaly,
  SalesTrendItem,
  Product,
  DashboardStats,
  FloorSummary,
} from '../../shared/types';

interface AppState {
  devices: Device[];
  selectedDevice: Device | null;
  deviceHistory: DeviceStatus[];
  tasks: ReplenishmentTask[];
  taskHistory: ReplenishmentTask[];
  anomalies: SalesAnomaly[];
  products: Product[];
  dashboardStats: DashboardStats | null;
  floorSummaries: FloorSummary[];
  pendingTasks: ReplenishmentTask[];
  recentAnomalies: SalesAnomaly[];
  salesTrend: SalesTrendItem[];
  settings: Record<string, string>;
  loading: Record<string, boolean>;
  error: string | null;

  setLoading: (key: string, value: boolean) => void;
  setError: (error: string | null) => void;

  fetchDevices: (floorId?: number) => Promise<void>;
  fetchDevice: (id: string) => Promise<void>;
  fetchDeviceHistory: (id: string, days?: number) => Promise<void>;

  fetchTasks: (status?: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  fetchHistory: (days?: number) => Promise<void>;

  fetchTrend: (days?: number) => Promise<void>;
  fetchAnomalies: (confirmed?: boolean) => Promise<void>;
  confirmAnomaly: (id: number, cause?: string) => Promise<void>;

  fetchProducts: (status?: string) => Promise<void>;
  updateProductStatus: (id: string, status: string) => Promise<void>;

  fetchSettings: () => Promise<void>;
  updateSettings: (data: Record<string, string>) => Promise<void>;

  fetchDashboardData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  devices: [],
  selectedDevice: null,
  deviceHistory: [],
  tasks: [],
  taskHistory: [],
  anomalies: [],
  products: [],
  dashboardStats: null,
  floorSummaries: [],
  pendingTasks: [],
  recentAnomalies: [],
  salesTrend: [],
  settings: {},
  loading: {},
  error: null,

  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  setError: (error) => set({ error }),

  fetchDevices: async (floorId) => {
    try {
      get().setLoading('devices', true);
      get().setError(null);
      const response = await devices.getDevices(floorId);
      set({ devices: response.data || [] });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch devices');
    } finally {
      get().setLoading('devices', false);
    }
  },

  fetchDevice: async (id) => {
    try {
      get().setLoading('device', true);
      get().setError(null);
      const response = await devices.getDevice(id);
      set({ selectedDevice: response.data || null });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch device');
    } finally {
      get().setLoading('device', false);
    }
  },

  fetchDeviceHistory: async (id, days) => {
    try {
      get().setLoading('deviceHistory', true);
      get().setError(null);
      const response = await devices.getDeviceHistory(id, days);
      set({ deviceHistory: response.data || [] });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch device history');
    } finally {
      get().setLoading('deviceHistory', false);
    }
  },

  fetchTasks: async (status) => {
    try {
      get().setLoading('tasks', true);
      get().setError(null);
      const response = await replenishment.getTasks(status);
      set({ tasks: response.data || [] });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
    } finally {
      get().setLoading('tasks', false);
    }
  },

  completeTask: async (id) => {
    try {
      get().setLoading('completeTask', true);
      get().setError(null);
      await replenishment.completeTask(id);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, status: 'completed' as const } : task
        ),
        pendingTasks: state.pendingTasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to complete task');
    } finally {
      get().setLoading('completeTask', false);
    }
  },

  fetchHistory: async (days) => {
    try {
      get().setLoading('taskHistory', true);
      get().setError(null);
      const response = await replenishment.getHistory(days);
      set({ taskHistory: response.data || [] });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch task history');
    } finally {
      get().setLoading('taskHistory', false);
    }
  },

  fetchTrend: async (days) => {
    try {
      get().setLoading('trend', true);
      get().setError(null);
      const response = await sales.getTrend(days);
      set({ salesTrend: response.data || [] });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch sales trend');
    } finally {
      get().setLoading('trend', false);
    }
  },

  fetchAnomalies: async (confirmed) => {
    try {
      get().setLoading('anomalies', true);
      get().setError(null);
      const response = await sales.getAnomalies(confirmed);
      set({ anomalies: response.data || [] });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch anomalies');
    } finally {
      get().setLoading('anomalies', false);
    }
  },

  confirmAnomaly: async (id, cause) => {
    try {
      get().setLoading('confirmAnomaly', true);
      get().setError(null);
      await sales.confirmAnomaly(id, cause);
      set((state) => ({
        anomalies: state.anomalies.map((anomaly) =>
          anomaly.id === id ? { ...anomaly, confirmed: true, cause: cause as SalesAnomaly['cause'] || anomaly.cause } : anomaly
        ),
        recentAnomalies: state.recentAnomalies.map((anomaly) =>
          anomaly.id === id ? { ...anomaly, confirmed: true, cause: cause as SalesAnomaly['cause'] || anomaly.cause } : anomaly
        ),
      }));
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to confirm anomaly');
    } finally {
      get().setLoading('confirmAnomaly', false);
    }
  },

  fetchProducts: async (status) => {
    try {
      get().setLoading('products', true);
      get().setError(null);
      const response = await products.getProducts(status);
      set({ products: response.data || [] });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch products');
    } finally {
      get().setLoading('products', false);
    }
  },

  updateProductStatus: async (id, status) => {
    try {
      get().setLoading('updateProductStatus', true);
      get().setError(null);
      await products.updateProductStatus(id, status);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id
            ? {
                ...product,
                status: status as 'active' | 'inactive',
                removedAt: status === 'inactive' ? new Date().toISOString() : null,
              }
            : product
        ),
      }));
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to update product status');
    } finally {
      get().setLoading('updateProductStatus', false);
    }
  },

  fetchSettings: async () => {
    try {
      get().setLoading('settings', true);
      get().setError(null);
      const response = await settings.getSettings();
      const settingsMap: Record<string, string> = {};
      (response.data || []).forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      set({ settings: settingsMap });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch settings');
    } finally {
      get().setLoading('settings', false);
    }
  },

  updateSettings: async (data) => {
    try {
      get().setLoading('updateSettings', true);
      get().setError(null);
      await settings.updateSettings(data);
      set((state) => ({
        settings: { ...state.settings, ...data },
      }));
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      get().setLoading('updateSettings', false);
    }
  },

  fetchDashboardData: async () => {
    try {
      get().setLoading('dashboard', true);
      get().setError(null);

      const [statsRes, floorsRes, tasksRes, anomaliesRes] = await Promise.all([
        dashboard.getStats(),
        dashboard.getFloorSummaries(),
        dashboard.getPendingTasks(),
        dashboard.getRecentAnomalies(),
      ]);

      set({
        dashboardStats: statsRes.data || null,
        floorSummaries: floorsRes.data || [],
        pendingTasks: tasksRes.data || [],
        recentAnomalies: anomaliesRes.data || [],
      });
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    } finally {
      get().setLoading('dashboard', false);
    }
  },
}));
