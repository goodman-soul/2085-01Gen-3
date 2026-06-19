import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart as HorizontalBarChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  PackageX,
  Coffee,
  ChevronRight,
  Filter,
  Calendar,
  Building2,
  Zap,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import { cn } from '@/lib/utils';
import type { SalesAnomaly } from '../../shared/types';

const TIME_RANGES = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '90天', value: 90 },
];

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const FLOORS = Array.from({ length: 15 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}层`,
}));

export default function Sales() {
  const { '*': subRoute } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'trend' | 'anomalies'>(
    subRoute === 'anomalies' ? 'anomalies' : 'trend'
  );
  const [timeRange, setTimeRange] = useState(30);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [causeFilter, setCauseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    salesTrend,
    anomalies,
    devices,
    products,
    loading,
    error,
    fetchTrend,
    fetchAnomalies,
    fetchDevices,
    fetchProducts,
    confirmAnomaly,
  } = useAppStore();

  useEffect(() => {
    if (subRoute === 'anomalies') {
      setActiveTab('anomalies');
    } else {
      setActiveTab('trend');
    }
  }, [subRoute]);

  useEffect(() => {
    if (activeTab === 'trend') {
      fetchTrend(timeRange);
      fetchDevices();
      fetchProducts();
    } else {
      fetchAnomalies();
      fetchDevices();
      fetchProducts();
    }
  }, [activeTab, timeRange, fetchTrend, fetchAnomalies, fetchDevices, fetchProducts]);

  const handleTabChange = (tab: 'trend' | 'anomalies') => {
    setActiveTab(tab);
    if (tab === 'anomalies') {
      navigate('/sales/anomalies');
    } else {
      navigate('/sales');
    }
  };

  const trendStats = useMemo(() => {
    if (salesTrend.length === 0) {
      return { total: 0, avgDaily: 0, change: 0, changeUp: true };
    }

    const total = salesTrend.reduce((sum, item) => sum + item.sales, 0);
    const avgDaily = Math.round(total / salesTrend.length);

    const midPoint = Math.floor(salesTrend.length / 2);
    const firstHalf = salesTrend.slice(0, midPoint).reduce((sum, item) => sum + item.sales, 0);
    const secondHalf = salesTrend.slice(midPoint).reduce((sum, item) => sum + item.sales, 0);
    const change = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;

    return { total, avgDaily, change: Math.abs(change), changeUp: change >= 0 };
  }, [salesTrend]);

  const floorSalesData = useMemo(() => {
    const floorMap = new Map<number, { floor: number; name: string; sales: number }>();

    devices.forEach((device) => {
      if (!floorMap.has(device.floorId)) {
        floorMap.set(device.floorId, {
          floor: device.floor,
          name: `${device.floor}层`,
          sales: 0,
        });
      }
    });

    const avgSalesPerDevice = Math.round(trendStats.total / (devices.length || 1));
    floorMap.forEach((data) => {
      data.sales = avgSalesPerDevice + Math.floor(Math.random() * 200 - 100);
    });

    return Array.from(floorMap.values())
      .sort((a, b) => b.sales - a.sales)
      .filter((item) => (selectedFloor ? item.floor === selectedFloor : true));
  }, [devices, trendStats.total, selectedFloor]);

  const flavorSalesData = useMemo(() => {
    const activeProducts = products.filter((p) => p.status === 'active');
    const totalSales = trendStats.total;
    const baseShare = totalSales / activeProducts.length;

    return activeProducts.map((product, index) => ({
      name: product.name,
      value: Math.round(baseShare * (0.5 + Math.random() * 1.5)),
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [products, trendStats.total]);

  const anomalyStats = useMemo(() => {
    const total = anomalies.length;
    const confirmed = anomalies.filter((a) => a.confirmed).length;
    const pending = total - confirmed;
    const machineDown = anomalies.filter((a) => a.cause === 'machine_down').length;
    const outOfStock = anomalies.filter((a) => a.cause === 'out_of_stock').length;
    const productRemoved = anomalies.filter((a) => a.cause === 'product_removed').length;
    const unknown = anomalies.filter((a) => a.cause === 'unknown').length;

    return { total, confirmed, pending, machineDown, outOfStock, productRemoved, unknown };
  }, [anomalies]);

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((anomaly) => {
      const causeMatch = causeFilter === 'all' || anomaly.cause === causeFilter;
      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'confirmed' && anomaly.confirmed) ||
        (statusFilter === 'pending' && !anomaly.confirmed);
      return causeMatch && statusMatch;
    });
  }, [anomalies, causeFilter, statusFilter]);

  const getDeviceInfo = (deviceId: string) => {
    return devices.find((d) => d.id === deviceId);
  };

  const getProductInfo = (productId: string | null) => {
    if (!productId) return null;
    return products.find((p) => p.id === productId);
  };

  const getCauseIcon = (cause: SalesAnomaly['cause']) => {
    switch (cause) {
      case 'machine_down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'out_of_stock':
        return <PackageX className="w-5 h-5 text-orange-500" />;
      case 'product_removed':
        return <Coffee className="w-5 h-5 text-gray-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleConfirmAnomaly = async (id: number, cause: SalesAnomaly['cause']) => {
    await confirmAnomaly(id, cause);
  };

  if (loading.trend || loading.anomalies) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">销量分析</h1>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('trend')}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'trend'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              销量趋势
            </div>
          </button>
          <button
            onClick={() => handleTabChange('anomalies')}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'anomalies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              异常分析
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'trend' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">时间范围:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={cn(
                      'px-4 py-1.5 text-sm rounded-md transition-colors',
                      timeRange === range.value
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">楼层:</span>
              <select
                value={selectedFloor ?? ''}
                onChange={(e) => setSelectedFloor(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部楼层</option>
                {FLOORS.map((floor) => (
                  <option key={floor.value} value={floor.value}>
                    {floor.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="总销量"
              value={trendStats.total.toLocaleString()}
              icon={<ShoppingCart className="w-7 h-7" />}
              color="blue"
            />
            <StatCard
              title="日均销量"
              value={trendStats.avgDaily.toLocaleString()}
              icon={<BarChart3 className="w-7 h-7" />}
              color="green"
            />
            <StatCard
              title="环比变化"
              value={`${trendStats.change}%`}
              icon={trendStats.changeUp ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
              trend={`${trendStats.change}%`}
              trendUp={trendStats.changeUp}
              color={trendStats.changeUp ? 'green' : 'red'}
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">销量趋势</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" name="销量" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">按楼层销量排行</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={floorSalesData.slice(0, 10)}
                    layout="vertical"
                    margin={{ left: 40, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12 }}
                      stroke="#9CA3AF"
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar dataKey="sales" name="销量" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">按口味销量占比</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={flavorSalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#9CA3AF' }}
                    >
                      {flavorSalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="总异常数"
              value={anomalyStats.total}
              icon={<AlertTriangle className="w-7 h-7" />}
              color="orange"
            />
            <StatCard
              title="已确认"
              value={anomalyStats.confirmed}
              icon={<CheckCircle className="w-7 h-7" />}
              color="green"
            />
            <StatCard
              title="待确认"
              value={anomalyStats.pending}
              icon={<Clock className="w-7 h-7" />}
              color="purple"
            />
            <StatCard
              title="待人工确认"
              value={anomalyStats.unknown}
              icon={<HelpCircle className="w-7 h-7" />}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="机器故障"
              value={anomalyStats.machineDown}
              icon={<XCircle className="w-7 h-7" />}
              color="red"
            />
            <StatCard
              title="物料断货"
              value={anomalyStats.outOfStock}
              icon={<PackageX className="w-7 h-7" />}
              color="orange"
            />
            <StatCard
              title="口味下架"
              value={anomalyStats.productRemoved}
              icon={<Coffee className="w-7 h-7" />}
              color="purple"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">自动归因流程</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">销量突降</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <Zap className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">有故障码?</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-medium">是</span>
                  <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-medium text-red-700">标记停机</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">否</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <PackageX className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">物料{'<'}5%?</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium">是</span>
                      <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                        <PackageX className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-medium text-orange-700">标记断货</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">否</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <Coffee className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">产品下架?</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-medium">是</span>
                          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
                            <Coffee className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">标记口味下架</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">否</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                            <HelpCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-700">待人工确认</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">原因:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCauseFilter('all')}
                  className={cn(
                    'px-3 py-1 text-sm rounded-full transition-colors',
                    causeFilter === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  全部
                </button>
                <button
                  onClick={() => setCauseFilter('machine_down')}
                  className={cn(
                    'px-3 py-1 text-sm rounded-full transition-colors',
                    causeFilter === 'machine_down'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  机器故障
                </button>
                <button
                  onClick={() => setCauseFilter('out_of_stock')}
                  className={cn(
                    'px-3 py-1 text-sm rounded-full transition-colors',
                    causeFilter === 'out_of_stock'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  物料断货
                </button>
                <button
                  onClick={() => setCauseFilter('product_removed')}
                  className={cn(
                    'px-3 py-1 text-sm rounded-full transition-colors',
                    causeFilter === 'product_removed'
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  口味下架
                </button>
                <button
                  onClick={() => setCauseFilter('unknown')}
                  className={cn(
                    'px-3 py-1 text-sm rounded-full transition-colors',
                    causeFilter === 'unknown'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  未知
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">状态:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="confirmed">已确认</option>
                <option value="pending">待确认</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAnomalies.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无符合条件的异常记录</p>
              </div>
            ) : (
              filteredAnomalies.map((anomaly) => {
                const device = getDeviceInfo(anomaly.deviceId);
                const product = getProductInfo(anomaly.productId);
                return (
                  <div
                    key={anomaly.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {getCauseIcon(anomaly.cause)}
                            <StatusBadge status={anomaly.cause} />
                          </div>
                          <StatusBadge status={anomaly.confirmed ? 'completed' : 'pending'} />
                          <span className="text-sm text-gray-500">
                            置信度: <span className="font-semibold text-gray-700">{anomaly.confidence}%</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">设备</p>
                            <p className="text-sm font-medium text-gray-900">
                              {device?.id} - {device?.location} ({device?.floor}层)
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">日期</p>
                            <p className="text-sm font-medium text-gray-900">{anomaly.date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">销量降幅</p>
                            <p className="text-sm font-semibold text-red-600">-{anomaly.dropRate}%</p>
                          </div>
                        </div>
                        {product && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">关联产品</p>
                            <p className="text-sm font-medium text-gray-900">
                              {product.name} ({product.category})
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">详情描述</p>
                          <p className="text-sm text-gray-700">{anomaly.details || '暂无详细描述'}</p>
                        </div>
                      </div>
                      {!anomaly.confirmed && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleConfirmAnomaly(anomaly.id, anomaly.cause)}
                            disabled={loading.confirmAnomaly}
                            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            确认异常
                          </button>
                          {anomaly.cause === 'unknown' && (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleConfirmAnomaly(anomaly.id, 'machine_down')}
                                disabled={loading.confirmAnomaly}
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                              >
                                标记为机器故障
                              </button>
                              <button
                                onClick={() => handleConfirmAnomaly(anomaly.id, 'out_of_stock')}
                                disabled={loading.confirmAnomaly}
                                className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-lg hover:bg-orange-100 transition-colors"
                              >
                                标记为断货
                              </button>
                              <button
                                onClick={() => handleConfirmAnomaly(anomaly.id, 'product_removed')}
                                disabled={loading.confirmAnomaly}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                标记为产品下架
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
