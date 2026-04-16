'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        {error.message || 'An unexpected error occurred while loading the dashboard.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Hard reload
        </button>
      </div>
      {error.digest && (
        <p className="mt-8 text-[10px] text-gray-400 font-mono">ID: {error.digest}</p>
      )}
    </div>
  )
}
