// @ts-nocheck
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react'
import StatusBadge from '../../components/admin/StatusBadge'
import { apiFetch } from '../../lib/api'

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const statusSelectColors = {
  Pending:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  Processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Shipped:    'bg-purple-100 text-purple-800 border-purple-200',
  Delivered:  'bg-green-100 text-green-800 border-green-200',
  Cancelled:  'bg-red-100 text-red-800 border-red-200',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await apiFetch(`/api/orders?${params.toString()}`)
      setOrders(res.data?.orders || [])
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 })
    } catch (err) {
      setError(err.message || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(1), 300)
    return () => clearTimeout(timer)
  }, [fetchOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId)
      await apiFetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus: newStatus }),
      })
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      )
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }))
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return '-'
    }
  }
  const formatPrice = (price) => 'LE ' + (Number(price) || 0).toLocaleString()

  return (
    <>
      <div className="space-y-4">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{pagination.total} total orders</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none w-52"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => fetchOrders(1)} className="text-sm text-red-700 font-medium hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden xl:table-cell">City</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-16">View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="py-3.5 px-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-400">
                        {error ? 'Unable to load orders' : 'No orders found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 text-xs">
                          {order._id?.slice(-8).toUpperCase()}
                        </p>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <p className="text-gray-800 font-medium text-xs">
                          {order.fullName || order.customer?.firstName || 'Guest'}
                        </p>
                        <p className="text-gray-400 text-[11px]">{order.email || '-'}</p>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-gray-600 text-xs">
                        {order.phone || '-'}
                      </td>
                      <td className="py-3 px-4 hidden xl:table-cell text-gray-600 text-xs">
                        {order.shippingAddress?.city || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 text-xs">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={order.orderStatus || 'Pending'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingStatus === order._id}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-full border cursor-pointer outline-none ${
                            statusSelectColors[order.orderStatus] || 'bg-gray-100 text-gray-600 border-gray-200'
                          } ${updatingStatus === order._id ? 'opacity-50' : ''}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs hidden sm:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-olive transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => fetchOrders(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-900">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Order info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Order Number</p>
                  <p className="font-bold text-gray-900">
                    {selectedOrder._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <StatusBadge status={selectedOrder.orderStatus || 'Pending'} />
              </div>

              {/* Customer & Shipping */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Customer & Shipping
                </p>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {selectedOrder.fullName || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {selectedOrder.email || 'No email'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {selectedOrder.phone || '-'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {[
                      selectedOrder.shippingAddress?.street,
                      selectedOrder.shippingAddress?.city,
                      selectedOrder.shippingAddress?.zip,
                    ]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Items ({selectedOrder.items?.length || 0})
                </p>
                <div className="space-y-2">
                  {selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover bg-gray-100"
                              loading="lazy"
                            />
                          )}
                          <div>
                            <p className="text-sm text-gray-800">
                              {item.name || 'Unknown item'}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Qty: {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {formatPrice((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No items</p>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Shipping</span>
                  <span>{formatPrice(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Notes / Gift message */}
              {(selectedOrder.notes || selectedOrder.giftMessage) && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                  {selectedOrder.notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Notes</p>
                      <p className="text-sm text-gray-700 mt-1">{selectedOrder.notes}</p>
                    </div>
                  )}
                  {selectedOrder.giftMessage && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Gift Message</p>
                      <p className="text-sm text-gray-700 mt-1">{selectedOrder.giftMessage}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Change status */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Change Status
                </p>
                <select
                  value={selectedOrder.orderStatus || 'Pending'}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder._id, e.target.value)
                  }
                  disabled={updatingStatus === selectedOrder._id}
                  className={`w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none ${
                    updatingStatus === selectedOrder._id ? 'opacity-50' : ''
                  }`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
