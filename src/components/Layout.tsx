import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Cpu,
  Package,
  TrendingUp,
  Coffee,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/devices', label: '设备管理', icon: Cpu },
  { path: '/replenishment', label: '补货管理', icon: Package },
  { path: '/sales', label: '销量分析', icon: TrendingUp },
  { path: '/products', label: '口味管理', icon: Coffee },
  { path: '/settings', label: '系统设置', icon: Settings },
]

const breadcrumbMap: Record<string, string> = {
  '/': '仪表盘',
  '/devices': '设备管理',
  '/replenishment': '补货管理',
  '/sales': '销量分析',
  '/products': '口味管理',
  '/settings': '系统设置',
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const currentPath = location.pathname
  const breadcrumbLabel = breadcrumbMap[currentPath] || '页面'

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!collapsed && (
            <span className="text-xl font-bold text-gray-800">咖啡机管理</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">管理员</p>
                <p className="text-xs text-gray-500 truncate">admin@example.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              首页
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{breadcrumbLabel}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索..."
                className="w-64 pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">管理员</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
