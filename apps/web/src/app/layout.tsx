import { FC, ReactNode } from 'react'
import type { Metadata } from 'next'
import './globals.css'
import dynamic from 'next/dynamic'
import UnregisterSW from './unregister-sw'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Setaradapps - Your Digital Platform',
  description: 'Comprehensive marketplace, payments, and asset management platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Setaradapps',
    statusBarStyle: 'default',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

interface RootLayoutProps {
  children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <UnregisterSW />
      </body>
    </html>
  )
}

export default RootLayout
