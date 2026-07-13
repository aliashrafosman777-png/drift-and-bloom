// @ts-nocheck
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingCart,
  AlertTriangle,
  Users,
} from 'lucide-react'
import StatusBadge from '../../components/admin/StatusBadge'
import { apiFetch } from '../../lib/api'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerDetail, setCustomerDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCustomers = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)

      const res = await apiFetch(`/api/admin/customers?${params.toString()}`)
      setCustomers(res.data?.customers || [])
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 })
    } catch (err) {
      setError(err.message || 'Failed to load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(1), 300)
    return () => clearTimeout(timer)
  }, [fetchCustomers])

  const viewCustomer = async (id) => {
    try {
      setDetailLoading(true)
      setSelectedCustomer(id)
      setCustomerDetail(null)
      const res = await apiFetch(`/api/admin/customers/${id}`)
      setCustomerDetail(res.data || null)
    } catch (err) {
      console.error('Error fetching customer:', err)
      setCustomerDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      await apiFetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
      setCustomers((prev) => prev.filter((c) => c._id !== id))
      setDeleteConfirm(null)
      setSelectedCustomer(null)
      setCustomerDetail(null)
    } catch (err) {
      console.error('Error deleting customer:', err)
    } finally {
      setDeleting(false)
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500">{pagination.total} total customers</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none w-56"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => fetchCustomers(1)} className="text-sm text-red-700 font-medium hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Phone</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Total Spent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden xl:table-cell">Joined</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3.5 px-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-400">
                        {error ? 'Unable to load customers' : 'No customers found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-olive to-olive-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {customer.name?.charAt(0)?.toUpperCase() || customer.firstName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <p className="font-medium text-gray-900 text-xs">
                            {customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs hidden md:table-cell">{customer.email || '-'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs hidden lg:table-cell">{customer.phone || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                          <ShoppingCart className="w-3 h-3 text-gray-400" />
                          {customer.totalOrders || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 text-xs">
                        {formatPrice(customer.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs hidden xl:table-cell">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => viewCustomer(customer._id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-olive transition-colors"
                            title="View profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(customer._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => fetchCustomers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchCustomers(pagination.page + 1)}
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

      {/* ── Customer Detail Modal ── */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedCustomer(null)
            setCustomerDetail(null)
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-900">Customer Profile</h3>
              <button
                onClick={() => {
                  setSelectedCustomer(null)
                  setCustomerDetail(null)
                }}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {detailLoading ? (
              <div className="p-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-olive border-t-transparent rounded-full animate-spin" />
              </div>
            ) : customerDetail ? (
              <div className="px-5 py-4 space-y-4">
                {/* Profile */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-olive to-olive-dark flex items-center justify-center text-white text-lg font-bold">
                    {customerDetail.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{customerDetail.name || '-'}</p>
                    <p className="text-sm text-gray-500">{customerDetail.email || '-'}</p>
                    {customerDetail.phone && (
                      <p className="text-xs text-gray-400">{customerDetail.phone}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{customerDetail.totalOrders || 0}</p>
                    <p className="text-[11px] text-gray-500">Orders</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{formatPrice(customerDetail.totalSpent)}</p>
                    <p className="text-[11px] text-gray-500">Spent</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-gray-900">{formatDate(customerDetail.createdAt)}</p>
                    <p className="text-[11px] text-gray-500">Joined</p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Orders</p>
                  <div className="space-y-2">
                    {customerDetail.orders?.length > 0 ? (
                      customerDetail.orders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                          <div>
                            <p className="text-xs font-medium text-gray-800">
                              {order._id?.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-gray-800">
                              {formatPrice(order.total)}
                            </p>
                            <StatusBadge status={order.orderStatus || 'Pending'} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-3">No orders yet</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Unable to load customer profile</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-2">Delete Customer</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
