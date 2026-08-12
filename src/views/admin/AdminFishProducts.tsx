// @ts-nocheck
"use client"

import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Fish, Shell, Droplets, AlertCircle, RefreshCw } from 'lucide-react'
import AddFishProductModal from '../../components/admin/AddFishProductModal'
import StatusBadge from '../../components/admin/StatusBadge'
import { useFishProducts } from '../../context/FishProductContext'
import OptimizedImage from '../../components/common/OptimizedImage'

function productStatusLabel(p) {
  if (p.status === 'out_of_stock' || p.status === 'Out of Stock') return 'Out of Stock'
  if (p.status === 'draft' || p.status === 'Draft') return 'Draft'
  return 'Active'
}

const AQUATIC_LIFE_LABEL_MAP: Record<string, string> = {
  'betta-fish': 'Betta Fish',
  'shrimp': 'Shrimp',
  'crab': 'Crab',
  'pleco-fish': 'Pleco Fish',
}

function subCategoryBadge(product) {
  const subCat = typeof product === 'string' ? product : (product.fishSubCategory || product.subCategory)
  if (subCat === 'aquariums') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
        <Shell size={11} /> Aquariums
      </span>
    )
  }
  const typeKey = typeof product === 'object' ? (product.aquaticLifeType || '') : ''
  const typeLabel = AQUATIC_LIFE_LABEL_MAP[typeKey] || (typeof product === 'object' && product.tags?.find(t => ['Betta Fish', 'Shrimp', 'Crab', 'Pleco Fish'].includes(t))) || 'Betta Fish'
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
        <Droplets size={11} /> Aquatic Life
      </span>
      <span className="text-[10px] text-blue-700/80 font-semibold pl-1">
        • {typeLabel}
      </span>
    </div>
  )
}

export default function AdminFishProducts() {
  const {
    fishProducts,
    loading,
    error,
    refreshFishProducts,
    removeFishProduct,
  } = useFishProducts()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [filterSubCat, setFilterSubCat] = useState('all')
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  let filtered = fishProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  if (filterSubCat !== 'all') {
    filtered = filtered.filter((p) => p.fishSubCategory === filterSubCat)
  }

  const openAdd = () => { setEditProduct(null); setModalOpen(true) }
  const openEdit = (product) => { setEditProduct(product); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditProduct(null) }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Remove "${name}"? This action cannot be undone.`)) {
      setActionError('')
      setDeletingId(id)
      try {
        await removeFishProduct(id)
      } catch (deleteError) {
        setActionError(deleteError instanceof Error ? deleteError.message : 'The product could not be deleted.')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const aquariumCount = fishProducts.filter((p) => p.fishSubCategory === 'aquariums').length
  const aquaticLifeCount = fishProducts.filter((p) => p.fishSubCategory === 'aquatic-life').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Fish className="w-5 h-5 text-olive" /> Fish Products
          </h1>
          <p className="text-sm text-gray-500">
            {loading && fishProducts.length === 0
              ? 'Loading products from the database…'
              : error && fishProducts.length === 0
                ? 'Product counts unavailable'
              : `${fishProducts.length} products — ${aquariumCount} Aquariums, ${aquaticLifeCount} Aquatic Life`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: '#2F3727', color: '#fff' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e2419' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2F3727' }}
        >
          <Plus className="w-4 h-4" /> Add Fish Product
        </button>
      </div>

      {(error || actionError) && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <span className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {actionError || `Products could not be loaded: ${error}`}
          </span>
          <button
            type="button"
            onClick={() => { setActionError(''); void refreshFishProducts() }}
            className="inline-flex shrink-0 items-center gap-1 font-medium underline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fish products..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'aquariums', label: 'Aquariums' },
            { id: 'aquatic-life', label: 'Aquatic Life' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterSubCat(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition duration-200 ${
                filterSubCat === f.id
                  ? 'bg-olive text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Sub-Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Tags</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Fish className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-400">
                      {error
                        ? 'Products could not be read from the database. Use Retry above.'
                        : search
                          ? `No products match "${search}"`
                          : 'No fish products yet'}
                    </p>
                    {!error && !search && (
                      <button
                        onClick={openAdd}
                        className="mt-3 text-sm text-olive hover:text-olive-dark font-medium"
                      >
                        + Add your first fish product
                      </button>
                    )}
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
                            {p.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {subCategoryBadge(p)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-gray-800 font-semibold text-xs">
                          EGP {p.price.toLocaleString()}
                        </span>
                        {p.discountPrice && (
                          <p className="text-[11px] text-green-600">
                            Sale: EGP {Number(p.discountPrice).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <StatusBadge status={productStatusLabel(p)} />
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
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
                        <button
                          onClick={() => openEdit(p)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-olive transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void handleDelete(p.id, p.name)}
                          title="Delete"
                          disabled={deletingId === p.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:cursor-wait disabled:opacity-40"
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
        <AddFishProductModal onClose={closeModal} editProduct={editProduct} />
      )}
    </div>
  )
}
