import { useEffect, useMemo, useState } from 'react'
import { Package, TrendingUp, AlertTriangle, BarChart3, Clock, Eye } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useAppStore } from '@/store'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { cn } from '@/lib/utils'
import type { Product } from '../../shared/types'

interface DeviceSales {
  deviceId: string
  deviceName: string
  sales: number
  percentage: number
}

interface ProductSalesData {
  productId: string
  sales30d: number
  totalPercentage: number
  deviceSales: DeviceSales[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function generateMockSalesData(products: Product[]): ProductSalesData[] {
  const devices = [
    { id: 'DEV001', name: '1楼-A区' },
    { id: 'DEV002', name: '2楼-B区' },
    { id: 'DEV003', name: '3楼-C区' },
    { id: 'DEV004', name: '5楼-休息区' },
    { id: 'DEV005', name: '8楼-茶水间' },
  ]

  return products.map((product) => {
    const deviceSales = devices.map((device) => ({
      deviceId: device.id,
      deviceName: device.name,
      sales: Math.floor(Math.random() * 200) + 20,
      percentage: 0,
    }))

    const totalSales = deviceSales.reduce((sum, d) => sum + d.sales, 0)
    deviceSales.forEach((d) => {
      d.percentage = Math.round((d.sales / totalSales) * 100)
    })

    return {
      productId: product.id,
      sales30d: totalSales,
      totalPercentage: Math.floor(Math.random() * 30) + 5,
      deviceSales: deviceSales.sort((a, b) => b.percentage - a.percentage),
    }
  })
}

function MiniDonutChart({ percentage }: { percentage: number }) {
  const data = [
    { name: '占比', value: percentage },
    { name: '其他', value: 100 - percentage },
  ]

  const getColor = (value: number) => {
    if (value >= 25) return '#ef4444'
    if (value >= 15) return '#f59e0b'
    return '#3b82f6'
  }

  return (
    <div className="relative w-16 h-16">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={22}
            outerRadius={30}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={getColor(percentage)} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">{percentage}%</span>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  salesData,
  onToggleStatus,
  onViewDetails,
  loading,
}: {
  product: Product
  salesData: ProductSalesData
  onToggleStatus: () => void
  onViewDetails: () => void
  loading: boolean
}) {
  const isActive = product.status === 'active'
  const hasHighImpact = salesData.deviceSales.some((d) => d.percentage >= 20)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isActive ? 'bg-green-500' : 'bg-gray-400'
                  )}
                />
                {isActive ? '在售' : '已下架'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {product.category}
              </span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>
          <MiniDonutChart percentage={salesData.totalPercentage} />
        </div>

        {!isActive && product.removedAt && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>下架时间：{formatDateTime(product.removedAt)}</span>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              近30天销量
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {salesData.sales30d} 杯
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">销量占比</span>
            <span
              className={cn(
                'text-sm font-semibold',
                salesData.totalPercentage >= 25
                  ? 'text-red-600'
                  : salesData.totalPercentage >= 15
                  ? 'text-amber-600'
                  : 'text-blue-600'
              )}
            >
              {salesData.totalPercentage}%
            </span>
          </div>
        </div>

        {hasHighImpact && !isActive && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 mb-2">下架影响警告</p>
                <div className="space-y-1.5">
                  {salesData.deviceSales
                    .filter((d) => d.percentage >= 20)
                    .map((device) => (
                      <div
                        key={device.deviceId}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-red-600">{device.deviceName}</span>
                        <span className="font-semibold text-red-700">
                          {device.percentage}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {isActive && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-blue-700 mb-2">各设备销量占比</p>
            <div className="grid grid-cols-2 gap-1.5">
              {salesData.deviceSales.slice(0, 4).map((device) => (
                <div
                  key={device.deviceId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-blue-600">{device.deviceName}</span>
                  <span
                    className={cn(
                      'font-semibold',
                      device.percentage >= 20 ? 'text-red-600' : 'text-blue-700'
                    )}
                  >
                    {device.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            销量详情
          </button>
          <button
            onClick={onToggleStatus}
            disabled={loading}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
              isActive ? 'bg-green-500' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                isActive ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all')
  const { products, loading, error, fetchProducts, updateProductStatus } = useAppStore()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const salesData = useMemo(() => generateMockSalesData(products), [products])

  const getSalesData = (productId: string) => {
    return salesData.find((s) => s.productId === productId)!
  }

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return products
    return products.filter((p) => p.status === activeTab)
  }, [products, activeTab])

  const handleRefresh = () => {
    fetchProducts()
  }

  const handleToggleStatus = (product: Product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active'
    updateProductStatus(product.id, newStatus)
  }

  const handleViewDetails = (product: Product) => {
    alert(`查看产品「${product.name}」的销量详情`)
  }

  if (loading.products && products.length === 0) {
    return (
      <div className="space-y-6">
        <Loading variant="card" className="h-12 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Loading key={i} variant="card" className="h-80" />
          ))}
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return <Error message={error} onRetry={handleRefresh} />
  }

  const tabs = [
    { key: 'all', label: '全部产品', count: products.length },
    { key: 'active', label: '在售', count: products.filter((p) => p.status === 'active').length },
    { key: 'inactive', label: '已下架', count: products.filter((p) => p.status === 'inactive').length },
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">口味管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理产品上下架状态及查看销售数据</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <BarChart3 className="w-4 h-4" />
              {tab.label}
              <span
                className={cn(
                  'inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium',
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">暂无产品</h3>
          <p className="text-gray-500">当前筛选条件下没有产品数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              salesData={getSalesData(product.id)}
              onToggleStatus={() => handleToggleStatus(product)}
              onViewDetails={() => handleViewDetails(product)}
              loading={!!loading.updateProductStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}
