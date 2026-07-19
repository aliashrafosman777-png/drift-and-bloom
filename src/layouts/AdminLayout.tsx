// @ts-nocheck
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoadingFallback from '../components/common/LoadingFallback'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Packages',  href: '/admin/products', icon: Package },
  { name: 'Orders',    href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Messages',  href: '/admin/messages', icon: MessageSquare },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, logout, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/login?from=/admin')
    }
  }, [isAdmin, loading, router])

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (loading || !isAdmin) return <LoadingFallback />

  const isActive = (href: string, end?: boolean) =>
    end ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  const handleLogout = () => {
    logout()
    router.replace('/login?from=/admin')
  }

  const currentPageName = navItems.find(
    (item) => isActive(item.href, item.end)
  )?.name || 'Admin Dashboard'

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#faf6f0' }}>
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#2F3727' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className="flex items-center justify-between px-5 py-5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Link href="/admin" className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#C9A961' }}
              >
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-none">
                  Drift & Bloom
                </h1>
                <p
                  className="text-[10px] font-medium mt-0.5"
                  style={{ color: '#C9A961' }}
                >
                  ADMIN PANEL
                </p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 py-4 px-3 space-y-1 overflow-y-auto"
            role="navigation"
            aria-label="Admin navigation"
          >
            {navItems.map((item) => {
              const active = isActive(item.href, item.end)
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: active
                      ? 'rgba(201, 169, 97, 0.15)'
                      : 'transparent',
                    color: active ? '#C9A961' : 'rgba(255,255,255,0.7)',
                    borderLeft: active
                      ? '3px solid #C9A961'
                      : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor =
                        'rgba(255,255,255,0.05)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.95)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                    }
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className="w-[18px] h-[18px] flex-shrink-0"
                    style={{
                      color: active ? '#C9A961' : 'rgba(255,255,255,0.4)',
                    }}
                  />
                  <span className="flex-1">{item.name}</span>
                  {active && (
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: '#C9A961' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User info at bottom */}
          <div
            className="p-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#C9A961' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'Admin'}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header
          className="sticky top-0 z-30 border-b"
          style={{
            backgroundColor: 'rgba(250, 246, 240, 0.85)',
            backdropFilter: 'blur(12px)',
            borderColor: '#e8e0d5',
          }}
        >
          <div className="flex items-center justify-between px-4 lg:px-6 h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/60 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" style={{ color: '#2F3727' }} />
              </button>
              <h2
                className="text-lg font-semibold"
                style={{ color: '#2F3727' }}
              >
                {currentPageName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Admin profile */}
              <div
                className="hidden sm:flex items-center gap-2 pl-2 mr-1"
                style={{ borderLeft: '1px solid #e8e0d5' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: '#2F3727' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: '#2F3727' }}
                >
                  {user?.name}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ml-1"
                style={{ backgroundColor: '#2F3727', color: '#fff' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e2419'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2F3727'
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
