// @ts-nocheck
"use client"

import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, Package, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import RatingStars from '../../components/common/RatingStars'
import AddProductModal from '../../components/admin/AddProductModal'
import StatusBadge from '../../components/admin/StatusBadge'
import { useProducts } from '../../context/ProductContext'
import OptimizedImage from '../../components/common/OptimizedImage'

function productStatusLabel(p) {
  if (p.status === 'out_of_stock' || p.status === 'Out of Stock') return 'Out of Stock'
  if (p.status === 'draft' || p.status === 'Draft') return 'Draft'
  return 'Active'
}

export default function AdminProducts() {
  const { products, removeProduct } = useProducts()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditProduct(null); setModalOpen(true) }
  const openEdit = (product) => { setEditProduct(product); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditProduct(null) }

  const handleDelete = (id, name) => {
    if (window.confirm(`Remove "${name}"? This only affects the demo session.`)) {
      removeProduct(id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Packages</h1>
          <p className="text-sm text-gray-500">{products.length} packages in your catalog.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: '#2F3727', color: '#fff' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e2419' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2F3727' }}
        >
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search packages..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Package</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden xl:table-cell">Tags</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-400">
                      {search ? `No packages match "${search}"` : 'No packages yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <OptimizedImage
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{p.name}</p>
                          <p className="text-[11px] text-gray-400 max-w-[180px] truncate">
                            {p.tagline}
                          </p>
                          {p.sku && (
                            <p className="text-[10px] text-gray-300 mt-0.5">SKU: {p.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs capitalize hidden md:table-cell">
                      {p.categories?.[0] || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-gray-800 font-semibold text-xs">
                          LE {p.price.toLocaleString()}
                        </span>
                        {p.discountPrice && (
                          <p className="text-[11px] text-green-600">
                            Sale: LE {Number(p.discountPrice).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <RatingStars rating={p.rating} showNumber={false} size="text-xs" />
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <StatusBadge status={productStatusLabel(p)} />
                    </td>
                    <td className="py-3 px-4 hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(p.tags || []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {(p.tags || []).length > 2 && (
                          <span className="text-[10px] text-gray-400">
                            +{p.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/packages/${p.id}`}
                          target="_blank"
                          title="View on store"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-olive transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEdit(p)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-olive transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
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
      </div>

      {modalOpen && (
        <AddProductModal onClose={closeModal} editProduct={editProduct} />
      )}
    </div>
  )
}
