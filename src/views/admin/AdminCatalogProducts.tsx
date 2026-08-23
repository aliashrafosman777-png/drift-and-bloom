'use client'

import React, { useMemo, useState } from 'react'
import { AlertCircle, Edit2, Leaf, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import AddCatalogProductModal from '@/components/admin/AddCatalogProductModal'
import OptimizedImage from '@/components/common/OptimizedImage'
import StatusBadge from '@/components/admin/StatusBadge'
import {
  useCatalogProducts,
  type CatalogProduct,
} from '@/context/CatalogProductContext'
import type { CatalogProductType } from '@/lib/catalogProducts'

function statusLabel(status: CatalogProduct['status']) {
  if (status === 'out_of_stock') return 'Out of Stock'
  if (status === 'draft') return 'Draft'
  return 'Active'
}

function titleCase(value: string | null) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '—'
}

export default function AdminCatalogProducts() {
  const {
    catalogProducts,
    loading,
    error,
    refreshCatalogProducts,
    removeCatalogProduct,
  } = useCatalogProducts()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<CatalogProductType | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<CatalogProduct | null>(null)
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => catalogProducts.filter((product) => {
    const matchesSearch = product.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
    const matchesType = filterType === 'all' || product.productType === filterType
    return matchesSearch && matchesType
  }), [catalogProducts, filterType, search])

  const candleCount = catalogProducts.filter((product) => product.productType === 'candles').length
  const plantCount = catalogProducts.filter((product) => product.productType === 'plants').length

  const openAdd = () => { setEditProduct(null); setModalOpen(true) }
  const openEdit = (product: CatalogProduct) => { setEditProduct(product); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditProduct(null) }

  const handleDelete = async (product: CatalogProduct) => {
    if (!window.confirm(`Remove "${product.name}"? This action cannot be undone.`)) return
    setDeletingId(product.id)
    setActionError('')
    try {
      await removeCatalogProduct(product.id)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'The product could not be deleted.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Leaf className="h-5 w-5 text-olive" /> Candles & Plants</h1>
          <p className="text-sm text-gray-500">
            {loading && !catalogProducts.length
              ? 'Loading products from the database…'
              : error && !catalogProducts.length
                ? 'Product counts unavailable'
                : `${catalogProducts.length} products — ${candleCount} Candles, ${plantCount} Plants`}
          </p>
        </div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-[#2F3727] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e2419]">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {(error || actionError) && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <span className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{actionError || `Products could not be loaded: ${error}`}</span>
          <button type="button" onClick={() => { setActionError(''); void refreshCatalogProducts() }} className="inline-flex shrink-0 items-center gap-1 font-medium underline"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Candles & Plants..." className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {([
            { id: 'all', label: 'All' },
            { id: 'candles', label: 'Candles' },
            { id: 'plants', label: 'Plants' },
          ] satisfies Array<{ id: CatalogProductType | 'all'; label: string }>).map((filter) => (
            <button key={filter.id} type="button" onClick={() => setFilterType(filter.id)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${filterType === filter.id ? 'bg-olive text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Type / Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Price</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:table-cell">Status</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 lg:table-cell">Tags</th>
              <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
            </tr></thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Leaf className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-400">{error ? 'Products could not be read from the database. Use Retry above.' : search ? `No products match "${search}"` : filterType !== 'all' ? `No ${titleCase(filterType)} products yet.` : 'No Candle or Plant products yet.'}</p>
                  {!error && !search && <button type="button" onClick={openAdd} className="mt-3 text-sm font-medium text-olive hover:text-olive-dark">+ Add your first product</button>}
                </td></tr>
              ) : filtered.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3">
                    <OptimizedImage src={product.image} alt={product.name} className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover" />
                    <div><p className="text-xs font-medium text-gray-900">{product.name}</p><p className="max-w-[180px] truncate text-[11px] text-gray-400">{product.shortDescription}</p></div>
                  </div></td>
                  <td className="px-4 py-3"><div className="space-y-1">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${product.productType === 'candles' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>{titleCase(product.productType)}</span>
                    {product.candleCategory && <p className="text-[11px] text-gray-400">{titleCase(product.candleCategory)}</p>}
                  </div></td>
                  <td className="px-4 py-3"><span className="text-xs font-semibold text-gray-800">EGP {product.price.toLocaleString()}</span>{product.discountPrice && <p className="text-[11px] text-green-600">Sale: EGP {product.discountPrice.toLocaleString()}</p>}</td>
                  <td className="hidden px-4 py-3 sm:table-cell"><StatusBadge status={statusLabel(product.status)} /></td>
                  <td className="hidden px-4 py-3 lg:table-cell"><div className="flex flex-wrap gap-1">{product.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{tag}</span>)}{product.tags.length > 2 && <span className="text-[10px] text-gray-400">+{product.tags.length - 2}</span>}</div></td>
                  <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1">
                    <button type="button" onClick={() => openEdit(product)} title="Edit" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-olive"><Edit2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => void handleDelete(product)} title="Delete" disabled={deletingId === product.id} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <AddCatalogProductModal onClose={closeModal} editProduct={editProduct} />}
    </div>
  )
}
