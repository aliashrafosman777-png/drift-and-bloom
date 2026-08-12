// @ts-nocheck
"use client"

import React, { useEffect, useRef, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Fish } from 'lucide-react'
import {
  FormInput, FormTextarea, FormSelect,
  FormTagInput, FormSection,
} from './FormFields'
import ImageUploader from './ImageUploader'
import { useFishProducts } from '../../context/FishProductContext'
import OptimizedImage from '../common/OptimizedImage'

// ── Select option lists ──────────────────────────────────────────────────────
const FISH_SUB_CATEGORY_OPTIONS = [
  { value: 'aquatic-life', label: 'Aquatic Life — Betta fish, shrimp, crab, etc.' },
  { value: 'aquariums',    label: 'Aquariums — Fish tanks and setups' },
]

const AQUATIC_LIFE_TYPE_OPTIONS = [
  { value: 'betta-fish', label: 'Betta Fish' },
  { value: 'shrimp',     label: 'Shrimp' },
  { value: 'crab',       label: 'Crab' },
  { value: 'pleco-fish', label: 'Pleco Fish' },
]

const STATUS_OPTIONS = [
  { value: 'active',       label: 'Active — visible on store' },
  { value: 'draft',        label: 'Draft — hidden from store' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

// ── Initial form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name:             '',
  shortDescription: '',
  description:      '',
  story:            '',
  fishSubCategory:  'aquatic-life',
  aquaticLifeType:  'betta-fish',
  price:            '',
  discountPrice:    '',
  tags:             [],
  status:           'active',
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate(form, images) {
  const errors = {}
  if (!form.name.trim())       errors.name = 'Product name is required.'
  if (!form.shortDescription.trim()) errors.shortDescription = 'Short description is required.'
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
    errors.price = 'A valid price is required.'
  if (images.length === 0)     errors.images = 'At least one image is required.'
  return errors
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'basic',  label: 'Basic Info' },
  { id: 'images', label: 'Images' },
  { id: 'tags',   label: 'Tags & Status' },
]

// ── Fish-specific preset tags ────────────────────────────────────────────────
const FISH_PRESET_TAGS = [
  'Compact', 'Calm', 'Desk Friendly', 'Balanced', 'Botanical', 'Premium',
  'Luxury', 'Statement', 'Gift Ready', 'Betta Fish', 'Shrimp', 'Crab',
  'Pleco Fish', 'Beginner', 'Low Maintenance',
]

export default function AddFishProductModal({ onClose, editProduct = null }) {
  const { addFishProduct, updateFishProduct } = useFishProducts()
  const isEditing = !!editProduct

  const [form,   setForm]   = useState(isEditing ? toFormState(editProduct) : EMPTY_FORM)
  const [images, setImages] = useState(() => {
    if (!isEditing || !editProduct) return []
    // Pre-populate images from existing product
    const existing = []
    if (editProduct.image) existing.push({ id: 'main-' + Date.now(), preview: editProduct.image })
    if (editProduct.gallery) {
      editProduct.gallery.forEach((url, i) => {
        existing.push({ id: `gallery-${i}-${Date.now()}`, preview: url })
      })
    }
    return existing
  })
  const [tab,    setTab]    = useState('basic')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
    const val = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form, images)
    if (Object.keys(errs).length) {
      setErrors(errs)
      if (errs.name || errs.shortDescription || errs.price) setTab('basic')
      else if (errs.images) setTab('images')
      return
    }

    setSaving(true)
    setSubmitError('')
    setStatus('idle')
    try {
      const payload = { ...form, images }
      if (isEditing) {
        await updateFishProduct(editProduct.id, payload)
      } else {
        await addFishProduct(payload)
      }
      setStatus('success')
      setTimeout(onClose, 1000)
    } catch (error) {
      setStatus('error')
      setSubmitError(error instanceof Error ? error.message : 'The product could not be saved.')
      setSaving(false)
    }
  }

  // Live preview image
  const previewImage = images[0]?.preview || '/assets/fishs.jpeg'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/40 px-4 py-8">
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-lift my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-charcoal/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-olive/10 text-olive flex items-center justify-center">
              <Fish size={18} />
            </div>
            <h2 className="font-serif text-2xl text-charcoal">
              {isEditing ? `Edit — ${editProduct.name}` : 'Add Fish Product'}
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
            <CheckCircle2 size={16} /> Fish product {isEditing ? 'updated' : 'added'} successfully!
          </div>
        )}
        {status === 'error' && (
          <div className="mx-7 mt-5 flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} /> {submitError || 'The product could not be saved. Please try again.'}
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
                  (t.id === 'basic'  && (errors.name || errors.shortDescription || errors.price)) ||
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

            <form id="fish-product-form" onSubmit={handleSubmit} className="px-7 py-6 space-y-6">
              {/* ── Basic Info ── */}
              {tab === 'basic' && (
                <>
                  <FormSection title="Product Information">
                    <FormInput
                      label="Product Name" name="name" value={form.name}
                      onChange={handleChange} required
                      placeholder="e.g. Mini Aquarium"
                      error={errors.name}
                    />
                    <FormInput
                      label="Short Description" name="shortDescription" value={form.shortDescription}
                      onChange={handleChange} required
                      placeholder="One sentence summary of this product"
                      error={errors.shortDescription}
                    />
                    <FormTextarea
                      label="Full Description" name="description" value={form.description}
                      onChange={handleChange} rows={3}
                      placeholder="Describe the product in detail — what it includes, who it's for."
                    />
                    <FormTextarea
                      label="Product Story" name="story" value={form.story}
                      onChange={handleChange} rows={3}
                      placeholder="The story behind this product — what inspired it."
                    />
                  </FormSection>

                  <FormSection title="Sub-Category">
                    <FormSelect
                      label="Fish Sub-Category" name="fishSubCategory" value={form.fishSubCategory}
                      onChange={handleChange}
                      options={FISH_SUB_CATEGORY_OPTIONS} required
                    />
                    {form.fishSubCategory === 'aquatic-life' && (
                      <FormSelect
                        label="Aquatic Life Category" name="aquaticLifeType" value={form.aquaticLifeType}
                        onChange={handleChange}
                        options={AQUATIC_LIFE_TYPE_OPTIONS} required
                      />
                    )}
                  </FormSection>

                  <FormSection title="Pricing">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Price (EGP)" name="price" type="number" value={form.price}
                        onChange={handleChange} required placeholder="e.g. 950"
                        error={errors.price}
                      />
                      <FormInput
                        label="Discount Price" name="discountPrice" type="number" value={form.discountPrice}
                        onChange={handleChange} placeholder="Optional"
                        hint="Leave blank for no discount"
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
                    {/* Fish-specific quick-add tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {FISH_PRESET_TAGS.filter((t) => !form.tags.includes(t)).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleChange({ target: { name: 'tags', value: [...form.tags, t] } })}
                          className="text-[11px] text-charcoal/50 hover:text-olive border border-charcoal/10 hover:border-olive/30 px-2.5 py-1 rounded-full transition duration-200"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
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
                    form="fish-product-form"
                    disabled={saving}
                    className="bg-olive hover:bg-olive-dark text-cream px-6 py-2.5 rounded-full text-sm font-medium uppercase tracking-label transition duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Product'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="lg:w-72 xl:w-80 shrink-0 p-6 bg-ivory rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-beige border border-charcoal/8">
                <OptimizedImage
                  src={previewImage}
                  alt="Product preview"
                  className="w-full h-40 object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg text-charcoal">
                  {form.name || 'Product Name'}
                </h3>
                <p className="text-xs text-charcoal/50 mt-1 line-clamp-2">
                  {form.shortDescription || 'Short description will appear here...'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-label text-charcoal/40">
                  {form.fishSubCategory === 'aquariums' ? '🐚 Aquariums' : '💧 Aquatic Life'}
                </span>
                <span className="font-serif text-lg text-brown">
                  {form.price ? `EGP ${Number(form.price).toLocaleString()}` : 'EGP —'}
                </span>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[10px] bg-beige text-charcoal/50 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-charcoal/30 text-center pt-2 border-t border-charcoal/8">
                Preview updates as you type
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Convert an existing product back into the flat form shape for editing
function toFormState(product) {
  return {
    name:             product.name             || '',
    shortDescription: product.shortDescription || '',
    description:      product.description      || '',
    story:            product.story            || '',
    fishSubCategory:  product.fishSubCategory  || 'aquatic-life',
    aquaticLifeType:  product.aquaticLifeType  || 'betta-fish',
    price:            product.price?.toString() || '',
    discountPrice:    product.discountPrice?.toString() || '',
    tags:             product.tags             || [],
    status:           product.status           || 'active',
  }
}
