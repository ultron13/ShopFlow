'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { StarRating } from './star-rating'
import toast from 'react-hot-toast'

export function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess?: () => void }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const createReview = trpc.reviews.create.useMutation({
    onSuccess() {
      toast.success('Review submitted!')
      setRating(0)
      setTitle('')
      setBody('')
      onSuccess?.()
    },
    onError(err) {
      toast.error(err.message)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a rating'); return }
    createReview.mutate({ productId, rating, title: title || undefined, body: body || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4">
      <h3 className="font-semibold">Write a Review</h3>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your review"
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Review (optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Share your experience…"
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <button
        type="submit"
        disabled={createReview.isPending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {createReview.isPending ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
