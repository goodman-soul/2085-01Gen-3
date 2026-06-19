import { cn } from '@/lib/utils'

interface LoadingProps {
  variant?: 'card' | 'list' | 'text' | 'circle' | 'table'
  count?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded-lg',
        className
      )}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="w-14 h-14 rounded-xl" />
      </div>
    </div>
  )
}

function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="w-20 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function TextSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === count - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

function CircleSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }
  return <Skeleton className={cn('rounded-full', sizeClasses[size])} />
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            'px-6 py-4 flex gap-4',
            rowIndex !== rows - 1 && 'border-b border-gray-100'
          )}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                'h-4 flex-1',
                colIndex === cols - 1 && 'w-24 flex-none'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Loading({
  variant = 'card',
  count,
  size,
  className,
}: LoadingProps) {
  return (
    <div className={cn(className)}>
      {variant === 'card' && <CardSkeleton />}
      {variant === 'list' && <ListSkeleton count={count} />}
      {variant === 'text' && <TextSkeleton count={count} />}
      {variant === 'circle' && <CircleSkeleton size={size} />}
      {variant === 'table' && <TableSkeleton rows={count} />}
    </div>
  )
}
