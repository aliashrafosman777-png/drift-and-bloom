// @ts-nocheck
"use client"

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  ArrowRight,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import { apiFetch } from '../../lib/api'


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1f2937',
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af', font: { size: 11 } },
    },
    y: {
      grid: { color: '#f3f4f6' },
      ticks: { color: '#9ca3af', font: { size: 11 } },
      beginAtZero: true,
    },
  },
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchDashboard() {
      try {
        setError(null)
        const res = await apiFetch('/api/admin/stats')
        if (!cancelled && res.data) {
          setData(res.data)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDashboard()
    return () => { cancelled = true }
  }, [])

  // Safe data accessors
  const totalRevenue = data?.totalRevenue ?? 0
  const totalOrders = data?.totalOrders ?? 0
  const totalCustomers = data?.totalCustomers ?? 0
  const totalPackages = data?.totalPackages ?? 0

  const stats = useMemo(() => [
    {
      title: 'Total Revenue',
      value: `LE ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-700',
      hint: totalOrders > 0 ? `From ${totalOrders} orders` : 'No orders yet',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'from-amber-500 to-amber-700',
      hint: totalOrders > 0 ? `${totalOrders} total` : 'No orders yet',
    },
    {
      title: 'Customers',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-700',
      hint: 'Registered users',
    },
    {
      title: 'Active Packages',
      value: totalPackages.toLocaleString(),
      icon: Package,
      color: 'from-purple-500 to-purple-700',
      hint: 'In catalog',
    },
  ], [totalRevenue, totalOrders, totalCustomers, totalPackages])

  const ordersChartData = useMemo(() => {
    const monthly = data?.monthlyRevenue
    if (!monthly?.length) return null
    return {
      labels: monthly.map((m) => MONTHS[(m._id?.month || 1) - 1] + ' ' + (m._id?.year || '')),
      datasets: [{
        label: 'Orders',
        data: monthly.map((m) => m.orders || 0),
        borderColor: '#46523B',
        backgroundColor: 'rgba(70, 82, 59, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#46523B',
        pointHoverRadius: 6,
        borderWidth: 2,
      }],
    }
  }, [data])

  const revenueChartData = useMemo(() => {
    const monthly = data?.monthlyRevenue
    if (!monthly?.length) return null
    return {
      labels: monthly.map((m) => MONTHS[(m._id?.month || 1) - 1] + ' ' + (m._id?.year || '')),
      datasets: [{
        label: 'Revenue (LE)',
        data: monthly.map((m) => m.revenue || 0),
        backgroundColor: 'rgba(70, 82, 59, 0.7)',
        hoverBackgroundColor: '#46523B',
        borderRadius: 6,
        borderSkipped: false,
      }],
    }
  }, [data])

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Processing: 'bg-indigo-100 text-indigo-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-olive border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-olive text-white rounded-lg hover:bg-olive-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            label={stat.title}
            value={stat.value}
            hint={stat.hint}
            color={stat.color}
          />
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Orders per Month</h3>
          <div className="h-64">
            {ordersChartData ? (
              <Line data={ordersChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <BarChart3 className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No order data yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue per Month</h3>
          <div className="h-64">
            {revenueChartData ? (
              <Bar data={revenueChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <DollarSign className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No revenue data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Widgets Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latest Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Latest Orders</h3>
            <Link
              href="/admin/orders"
              className="text-xs text-olive hover:text-olive-dark font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentOrders?.length > 0 ? (
              data.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {order._id?.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.fullName || order.customer?.firstName || 'Guest'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.orderStatus || 'Pending'} />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center py-6 text-gray-400">
                <Package className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Top Selling Packages
            </h3>
            <div className="space-y-2.5">
              {data?.topProducts?.length > 0 ? (
                data.topProducts.slice(0, 5).map((product, i) => (
                  <div
                    key={product._id || i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-gray-400 w-4">
                        #{i + 1}
                      </span>
                      <p className="text-sm text-gray-700 truncate max-w-[180px]">
                        {product.productName || 'Unnamed Package'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      {product.totalSold || 0} sold
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">
                  No product data available
                </p>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Order Status
            </h3>
            {data?.orderStatusStats &&
            Object.keys(data.orderStatusStats).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.orderStatusStats).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50"
                  >
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        statusColors[status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {status}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">
                No order status data
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
