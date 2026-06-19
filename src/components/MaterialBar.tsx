import { cn } from '@/lib/utils'

interface MaterialBarProps {
  label: string
  value: number
  threshold?: number
  showValue?: boolean
}

export default function MaterialBar({
  label,
  value,
  threshold = 30,
  showValue = true,
}: MaterialBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  let progressColor = 'bg-green-500'
  if (clampedValue < 5) {
    progressColor = 'bg-red-500'
  } else if (clampedValue < threshold) {
    progressColor = 'bg-orange-500'
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {showValue && (
        <span className="text-sm font-semibold text-gray-900">{clampedValue}%</span>
      )}
    </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            progressColor
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
