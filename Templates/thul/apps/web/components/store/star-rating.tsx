'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  onChange?: (value: number) => void
}

export function StarRating({ value, max = 5, size = 'md', onChange }: StarRatingProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type={onChange ? 'button' : undefined}
          onClick={onChange ? () => onChange(star) : undefined}
          className={cn('text-gray-300', onChange && 'cursor-pointer hover:text-yellow-400', !onChange && 'cursor-default')}
          disabled={!onChange}
        >
          <Star
            className={cn(starSize, star <= value && 'fill-yellow-400 text-yellow-400')}
          />
        </button>
      ))}
    </div>
  )
}
