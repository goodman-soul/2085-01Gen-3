import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
  className?: string
}

export default function Error({
  title = '加载失败',
  message = '抱歉，加载数据时出现错误，请稍后重试。',
  onRetry,
  retryText = '重新加载',
  className,
}: ErrorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" />
          {retryText}
        </button>
      )}
    </div>
  )
}
