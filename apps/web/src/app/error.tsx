'use client'

import React from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Something went wrong</h1>
      <p>{error?.message || 'Unexpected error.'}</p>
      <button onClick={() => reset()} style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: '#eef2ff' }}>
        Try again
      </button>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0


