import { describe, it, expect } from 'vitest'
import { cn, formatPrice, formatDate, slugify, truncate } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null as unknown as string)).toBe('foo')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })

  it('handles array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })
})

describe('formatPrice', () => {
  it('formats a ZAR price correctly', () => {
    const result = formatPrice(99.99)
    expect(result).toContain('99')
    expect(result).toContain('R')
  })

  it('accepts a string price', () => {
    const result = formatPrice('250')
    expect(result).toContain('250')
  })

  it('accepts an object with toString', () => {
    const price = { toString: () => '1000' }
    const result = formatPrice(price)
    expect(result).toContain('1')
  })

  it('formats zero correctly', () => {
    const result = formatPrice(0)
    expect(result).toContain('R')
    expect(result).toContain('0')
  })

  it('formats large price correctly', () => {
    const result = formatPrice(10000)
    expect(result).toContain('10')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats an ISO date string', () => {
    const result = formatDate('2024-06-01')
    expect(typeof result).toBe('string')
    expect(result).toMatch(/2024/)
  })

  it('handles start and end of year', () => {
    expect(() => formatDate('2024-01-01')).not.toThrow()
    expect(() => formatDate('2024-12-31')).not.toThrow()
  })
})

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('HELLO')).toBe('hello')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Fresh Fruit & Vegetables!')).toBe('fresh-fruit-vegetables')
  })

  it('collapses multiple separators', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles already-slugified string', () => {
    expect(slugify('herbs-spices')).toBe('herbs-spices')
  })
})

describe('truncate', () => {
  it('returns string unchanged when under limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns string unchanged when exactly at limit', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates and appends ellipsis when over limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('handles limit of 0', () => {
    expect(truncate('hello', 0)).toBe('…')
  })

  it('preserves unicode', () => {
    const result = truncate('Südafrika market', 9)
    expect(result).toContain('…')
  })
})
