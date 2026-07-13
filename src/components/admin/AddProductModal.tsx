// @ts-nocheck
"use client"

import React, { useEffect, useRef, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Package } from 'lucide-react'
import {
  FormInput, FormTextarea, FormSelect,
  FormToggle, FormTagInput, FormSection,
} from './FormFields'
import ImageUploader from './ImageUploader'
import ProductPreview from './ProductPreview'
import { useProducts } from '../../context/ProductContext'

// ── Select option lists ──────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: 'calm',          label: 'Calm' },
  { value: 'best-seller',   label: 'Best Seller' },
  { value: 'gifting',       label: 'Gifting' },
  { value: 'love',          label: 'Love' },
  { value: 'self-care',     label: 'Self-Care' },
  { value: 'new-beginnings',label: 'New Beginnings' },
]

const COLLECTION_OPTIONS = [
  { value: 'return',    label: 'Return' },
  { value: 'growth',    label: 'Growth' },
  { value: 'stillness', label: 'Stillness' },
  { value: 'home',      label: 'Home' },
  { value: 'grounded',  label: 'Grounded' },
  { value: 'joy',       label: 'Joy' },
  { value: 'love',      label: 'Love' },
  { value: 'dream',     label: 'Dream' },
  { value: 'renewal',   label: 'Renewal' },
  { value: 'balance',   label: 'Balance' },
]

const STATUS_OPTIONS = [
  { value: 'active',       label: 'Active — visible on store' },
  { value: 'draft',        label: 'Draft — hidden from store' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

const SIZE_OPTIONS = [
  { value: 'compact',  label: 'Compact — fits on a desk or shelf' },
  { value: 'medium',   label: 'Medium — standard package size' },
  { value: 'large',    label: 'Large — statement piece' },
]

const DIFFICULTY_OPTIONS = [
  { value: 'beginner',     label: 'Beginner — easy to care for' },
  { value: 'intermediate', label: 'Intermediate — some attention needed' },
  { value: 'advanced',     label: 'Advanced — requires expertise' },
]

const LIGHT_OPTIONS = [
  { value: 'low',    label: 'Low Light — shade tolerant' },
  { value: 'medium', label: 'Medium Light — indirect sun' },
  { value: 'bright', label: 'Bright Light — direct or strong sun' },
]

const WATERING_OPTIONS = [
  { value: 'daily',     label: 'Daily' },
  { value: 'weekly',    label: 'Weekly' },
  { value: 'biweekly',  label: 'Every 2 weeks' },
  { value: 'monthly',   label: 'Monthly' },
]

// ── Initial form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name:          '',
  tagline:       '',
  description:   '',
  categories:    ['calm'],
  collection:    'stillness',
  price:         '',
  discountPrice: '',
  stock:         '',
  sku:           '',
  status:        'active',
  size:          'medium',
  difficulty:    'beginner',
  light:         'medium',
  watering:      'weekly',
  petFriendly:   false,
  airPurifying:  false,
  tags:          [],
  scent:         '',
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate(form, images) {
  const errors = {}
  if (!form.name.trim())        errors.name  = 'Package name is required.'
  if (!form.tagline.trim())     errors.tagline = 'Short description is required.'
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
    errors.price = 'A valid price is required.'
  if (images.length === 0)      errors.images = 'At least one image is required.'
  return errors
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'basic',   label: 'Basic Info' },
  { id: 'images',  label: 'Images' },
  { id: 'details', label: 'Product Details' },
  { id: 'tags',    label: 'Tags & Status' },
]

export default function AddProductModal({ onClose, editProduct = null }) {
  const { addProduct, updateProduct } = useProducts()
  const isEditing = !!editProduct

  const [form,    setForm]    = useState(isEditing ? toFormState(editProduct) : EMPTY_FORM)
  const [images,  setImages]  = useState([])
  const [tab,     setTab]     = useState('basic')
  const [errors,  setErrors]  = useState({})
  const [status,  setStatus]  = useState('idle') // 'idle' | 'success' | 'error'
  const [saving,  setSaving]  = useState(false)

  const modalRef = useRef()

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : type === 'toggle' ? e.target.value : value
    setForm((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  const handleCategoryChange = (e) => {
    setForm((prev) => ({ ...prev, categories: [e.target.value] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form, images)
    if (Object.keys(errs).length) {
      setErrors(errs)
      // Jump to first tab with errors
      if (errs.name || errs.tagline || errs.price)    setTab('basic')
      else if (errs.images)                            setTab('images')
      return
    }

    setSaving(true)
    try {
      // Simulates async API call — swap with real fetch() later
      await new Promise((r) => setTimeout(r, 400))
      const payload = { ...form, images }
      if (isEditing) {
        updateProduct(editProduct.id, payload)
      } else {
        addProduct(payload)
      }
      setStatus('success')
      setTimeout(onClose, 1200)
    } catch {
      setStatus('error')
      setSaving(false)
    }
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/40 px-4 py-8">
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-lift my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-charcoal/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-olive/10 text-olive flex items-center justify-center">
              <Package size={18} />
            </div>
            <h2 className="font-serif text-2xl text-charcoal">
              {isEditing ? `Edit — ${editProduct.name}` : 'Add New Package'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-beige flex items-center justify-center text-charcoal/50 hover:text-charcoal transition duration-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success / error banner */}
        {status === 'success' && (
          <div className="mx-7 mt-5 flex items-center gap-2 bg-sage-50 text-sage-700 rounded-xl px-4 py-3 text-sm">
            <CheckCircle2 size={16} /> Package {isEditing ? 'updated' : 'added'} successfully!
          </div>
        )}
        {status === 'error' && (
          <div className="mx-7 mt-5 flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} /> Something went wrong. Please try again.
          </div>
        )}

        {/* Validation summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-7 mt-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 font-medium mb-1">Please fix the following:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {Object.values(errors).map((e) => (
                <li key={e} className="text-xs text-red-500">{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-charcoal/8">
          {/* ── Left: Form ── */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-7 pt-5 pb-1 overflow-x-auto no-scrollbar">
              {TABS.map((t) => {
                const hasError =
                  (t.id === 'basic'  && (errors.name || errors.tagline || errors.price)) ||
                  (t.id === 'images' && errors.images)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`relative shrink-0 px-4 py-2 rounded-full text-xs font-medium transition duration-200 ${
                      tab === t.id
                        ? 'bg-olive text-cream'
                        : 'text-charcoal/60 hover:text-olive hover:bg-beige'
                    }`}
                  >
                    {t.label}
                    {hasError && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400" />
                    )}
                  </button>
                )
              })}
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="px-7 py-6 space-y-6">
              {/* ── Basic Info ── */}
              {tab === 'basic' && (
                <>
                  <FormSection title="Basic Information">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Package Name" name="name" value={form.name}
                        onChange={handleChange} required
                        placeholder="e.g. The Stillness Collection"
                        error={errors.name}
                      />
                      <FormInput
                        label="Candle Scent" name="scent" value={form.scent}
                        onChange={handleChange}
                        placeholder="e.g. Lavender + Chamomile"
                      />
                    </div>
                    <FormInput
                      label="Short Description (Tagline)" name="tagline" value={form.tagline}
                      onChange={handleChange} required
                      placeholder="One sentence that captures the feeling of this package"
                      error={errors.tagline}
                    />
                    <FormTextarea
                      label="Full Description" name="description" value={form.description}
                      onChange={handleChange} rows={4}
                      placeholder="Describe the package in detail — what it includes, who it's for, and the feeling it creates."
                    />
                  </FormSection>

                  <FormSection title="Category & Collection">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Category" name="category" value={form.categories[0]}
                        onChange={handleCategoryChange}
                        options={CATEGORY_OPTIONS} required
                      />
                      <FormSelect
                        label="Collection" name="collection" value={form.collection}
                        onChange={handleChange}
                        options={COLLECTION_OPTIONS}
                      />
                    </div>
                  </FormSection>

                  <FormSection title="Pricing & Inventory">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormInput
                        label="Price (LE)" name="price" type="number" value={form.price}
                        onChange={handleChange} required placeholder="e.g. 1250"
                        error={errors.price}
                      />
                      <FormInput
                        label="Discount Price" name="discountPrice" type="number" value={form.discountPrice}
                        onChange={handleChange} placeholder="Optional"
                        hint="Leave blank for no discount"
                      />
                      <FormInput
                        label="Stock Qty" name="stock" type="number" value={form.stock}
                        onChange={handleChange} placeholder="e.g. 50"
                      />
                      <FormInput
                        label="SKU" name="sku" value={form.sku}
                        onChange={handleChange} placeholder="Optional"
                        hint="For inventory tracking"
                      />
                    </div>
                  </FormSection>
                </>
              )}

              {/* ── Images ── */}
              {tab === 'images' && (
                <FormSection title="Product Images">
                  <ImageUploader images={images} onChange={setImages} />
                  {errors.images && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.images}
                    </p>
                  )}
                  <p className="text-xs text-charcoal/40">
                    The first image becomes the main product image. Hover any image to reorder or remove it.
                  </p>
                </FormSection>
              )}

              {/* ── Product Details ── */}
              {tab === 'details' && (
                <>
                  <FormSection title="Plant & Package Details">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Package Size" name="size" value={form.size}
                        onChange={handleChange} options={SIZE_OPTIONS}
                      />
                      <FormSelect
                        label="Difficulty Level" name="difficulty" value={form.difficulty}
                        onChange={handleChange} options={DIFFICULTY_OPTIONS}
                      />
                      <FormSelect
                        label="Light Requirement" name="light" value={form.light}
                        onChange={handleChange} options={LIGHT_OPTIONS}
                      />
                      <FormSelect
                        label="Watering Frequency" name="watering" value={form.watering}
                        onChange={handleChange} options={WATERING_OPTIONS}
                      />
                    </div>
                  </FormSection>

                  <FormSection title="Plant Properties">
                    <div className="divide-y divide-charcoal/6">
                      <FormToggle
                        label="Pet Friendly"
                        name="petFriendly"
                        checked={form.petFriendly}
                        onChange={handleChange}
                        hint="Safe for cats and dogs"
                      />
                      <FormToggle
                        label="Air Purifying"
                        name="airPurifying"
                        checked={form.airPurifying}
                        onChange={handleChange}
                        hint="Removes toxins from the air"
                      />
                    </div>
                  </FormSection>
                </>
              )}

              {/* ── Tags & Status ── */}
              {tab === 'tags' && (
                <>
                  <FormSection title="Tags">
                    <FormTagInput
                      label="Product Tags"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                    />
                  </FormSection>

                  <FormSection title="Product Status">
                    <FormSelect
                      label="Status" name="status" value={form.status}
                      onChange={handleChange} options={STATUS_OPTIONS}
                    />
                    <p className="text-xs text-charcoal/40">
                      Draft products are only visible in the admin. Set to Active to publish.
                    </p>
                  </FormSection>
                </>
              )}
            </form>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-charcoal/8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-charcoal/50 hover:text-charcoal transition duration-200"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTab(TABS[(TABS.findIndex((t) => t.id === tab) - 1 + TABS.length) % TABS.length].id)
                  }}
                  className="text-xs text-charcoal/40 hover:text-olive"
                  hidden={tab === TABS[0].id}
                >
                  ← Back
                </button>
                {tab !== TABS[TABS.length - 1].id ? (
                  <button
                    type="button"
                    onClick={() => setTab(TABS[TABS.findIndex((t) => t.id === tab) + 1].id)}
                    className="bg-beige hover:bg-beige-dark text-charcoal px-5 py-2.5 rounded-full text-sm font-medium transition duration-200"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="product-form"
                    disabled={saving}
                    className="bg-olive hover:bg-olive-dark text-cream px-6 py-2.5 rounded-full text-sm font-medium uppercase tracking-label transition duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Package'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="lg:w-72 xl:w-80 shrink-0 p-6 bg-ivory rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
            <ProductPreview form={form} images={images} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Convert an existing product back into the flat form shape for editing
function toFormState(product) {
  return {
    name:          product.name        || '',
    tagline:       product.tagline     || '',
    description:   product.description || '',
    categories:    product.categories  || ['calm'],
    collection:    product.id          || 'stillness',
    price:         product.price?.toString()         || '',
    discountPrice: product.discountPrice?.toString() || '',
    stock:         product.stock?.toString()         || '',
    sku:           product.sku         || '',
    status:        product.status      || 'active',
    size:          product.size        || 'medium',
    difficulty:    product.difficulty  || 'beginner',
    light:         product.light       || 'medium',
    watering:      product.watering    || 'weekly',
    petFriendly:   !!product.petFriendly,
    airPurifying:  !!product.airPurifying,
    tags:          product.tags        || [],
    scent:         product.scent       || '',
  }
}
