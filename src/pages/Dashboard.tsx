import { useEffect } from 'react'
import { Cpu, Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts'
import { useAppStore } from '@/store'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import StatCard from '@/components/StatCard'
import MaterialBar from '@/components/MaterialBar'
import StatusBadge from '@/components/StatusBadge'
import type {
  DashboardStats,
  FloorSummary,
  ReplenishmentTask,
  SalesAnomaly,
  SalesTrendItem,
} from '../../shared/types'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: {
    anomaly?: boolean
  }
}

function CustomDot(props: CustomDotProps) {
  const { cx, cy, payload } = props
  if (payload?.anomaly && cx !== undefined && cy !== undefined) {
    return <Dot cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
  }
  return null
}

export default function Dashboard() {
  const {
    dashboardStats,
    floorSummaries,
    pendingTasks,
    recentAnomalies,
    salesTrend,
    loading,
    error,
    fetchDashboardData,
    fetchTrend,
    completeTask,
    confirmAnomaly,
  } = useAppStore()

  useEffect(() => {
    fetchDashboardData()
    fetchTrend(14)
  }, [fetchDashboardData, fetchTrend])

  const isLoading = loading.dashboard || loading.trend
  const hasError = error

  const handleRefresh = () => {
    fetchDashboardData()
    fetchTrend(14)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Loading key={i} variant="card" />
          ))}
        </div>
        <Loading variant="card" className="h-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Loading key={i} variant="card" className="h-48" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Loading variant="table" count={5} />
          <Loading variant="table" count={5} />
        </div>
      </div>
    )
  }

  if (hasError) {
    return <Error message={error} onRetry={handleRefresh} />
  }

  if (!dashboardStats) {
    return <Error message="无法加载仪表盘数据" onRetry={handleRefresh} />
  }

  const stats = dashboardStats
  const floors = floorSummaries
  const tasks = pendingTasks
  const anomalies = recentAnomalies
  const trend = salesTrend

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="设备总数"
          value={`${stats.totalDevices} 台`}
          icon={<Cpu className="w-7 h-7" />}
          trend={`${stats.onlineDevices} 台在线`}
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="待补任务"
          value={`${stats.pendingTasks} 个`}
          icon={<Package className="w-7 h-7" />}
          color="orange"
        />
        <StatCard
          title="今日销量"
          value={formatCurrency(stats.todaySales)}
          icon={<TrendingUp className="w-7 h-7" />}
          trendUp={true}
          color="green"
        />
        <StatCard
          title="销量异常"
          value={`${stats.anomalies} 个`}
          icon={<AlertTriangle className="w-7 h-7" />}
          color="red"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">销量趋势</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tickFormatter={(value) => `¥${value}`}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), '销售额']}
                labelFormatter={(label) => `日期: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSales)"
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-600">正常销量</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600">异常日期</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">楼层物料状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {floors.map((floor) => (
            <div
              key={floor.floor}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{floor.name}</h3>
                  <p className="text-sm text-gray-500">
                    {floor.deviceCount} 台设备 · {floor.warningCount} 个预警
                  </p>
                </div>
                {floor.warningCount > 0 && (
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <MaterialBar label="豆仓" value={floor.beanAvg} />
                <MaterialBar label="奶盒" value={floor.milkAvg} />
                <MaterialBar label="水箱" value={floor.waterAvg} />
                <MaterialBar label="杯子" value={floor.cupAvg} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">待处理补货任务</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    楼层
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    负责人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      暂无待处理任务
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {task.floor} 楼
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{task.assignee}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDateTime(task.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => completeTask(task.id)}
                          disabled={loading.completeTask}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4" />
                          完成
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">近期销量异常</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    设备
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    降幅
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    原因
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    置信度
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {anomalies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      暂无销量异常
                    </td>
                  </tr>
                ) : (
                  anomalies.map((anomaly) => (
                    <tr key={anomaly.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {anomaly.deviceId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{anomaly.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600">
                          -{anomaly.dropRate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={anomaly.cause} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(anomaly.confidence * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {anomaly.confirmed ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            已确认
                          </span>
                        ) : (
                          <button
                            onClick={() => confirmAnomaly(anomaly.id)}
                            disabled={loading.confirmAnomaly}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            确认
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
