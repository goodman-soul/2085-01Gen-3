import { cn } from '@/lib/utils'

type StatusType =
  | 'online'
  | 'offline'
  | 'error'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'out_of_stock'
  | 'machine_down'
  | 'product_removed'
  | 'unknown'

interface StatusBadgeProps {
  status: StatusType
}

const statusConfig: Record<
  StatusType,
  { label: string; bg: string; text: string; dot: string }
> = {
  online: {
    label: '在线',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  offline: {
    label: '离线',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  error: {
    label: '错误',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  pending: {
    label: '待处理',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },
  in_progress: {
    label: '进行中',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  completed: {
    label: '已完成',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  cancelled: {
    label: '已取消',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  out_of_stock: {
    label: '缺货',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  machine_down: {
    label: '机器故障',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  product_removed: {
    label: '已下架',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  unknown: {
    label: '未知',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.unknown

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
