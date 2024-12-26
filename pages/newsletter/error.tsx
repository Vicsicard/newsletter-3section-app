'use client'

import { useEffect } from 'react'

export default function NewsletterError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Newsletter error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Newsletter
        </h2>
        <p className="text-gray-600 mb-4">
          We encountered an error while loading the newsletter. This could be due to:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-600">
          <li>Temporary connection issues</li>
          <li>The newsletter may have been removed</li>
          <li>You may not have permission to view this content</li>
        </ul>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}
