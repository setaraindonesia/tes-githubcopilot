import React from 'react'

export default function NotFound() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0


