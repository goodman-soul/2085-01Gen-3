import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string | number
  trendUp?: boolean
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const colorClasses = {
  blue: 'border-blue-500',
  green: 'border-green-500',
  purple: 'border-purple-500',
  orange: 'border-orange-500',
  red: 'border-red-500',
}

const iconBgClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  color = 'blue',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border-b-4 transition-all hover:shadow-md',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              {trendUp ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trendUp ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend}
              </span>
              <span className="text-sm text-gray-400">较上月</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center',
            iconBgClasses[color]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
