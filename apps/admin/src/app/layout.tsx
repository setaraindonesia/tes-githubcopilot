import { FC, ReactNode } from 'react'
import type { Metadata } from 'next'
import './globals.css'
import UnregisterSW from './unregister-sw'

export const metadata: Metadata = {
  title: 'Setaradapps Admin - Dashboard',
  description: 'Admin dashboard for Setaradapps platform',
}

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased bg-gray-50">
        {children}
        <UnregisterSW />
      </body>
    </html>
  )
}

export default AdminLayout
