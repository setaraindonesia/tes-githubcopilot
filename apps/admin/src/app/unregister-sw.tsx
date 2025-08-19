'use client'

import { useEffect } from 'react'

const UnregisterSW = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister().catch(() => {}))
      }).catch(() => {})
    }
  }, [])
  return null
}

export default UnregisterSW


