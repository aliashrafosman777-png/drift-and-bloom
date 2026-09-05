'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Leaf, X } from 'lucide-react'
import {
  FormInput,
  FormSection,
  FormSelect,
  FormTagInput,
  FormTextarea,
} from './FormFields'
import ImageUploader from './ImageUploader'
import OptimizedImage from '../common/OptimizedImage'
import ProductPrice from '../common/ProductPrice'
import {
  useCatalogProducts,
  type CatalogProduct,
  type CatalogProductForm,
} from '@/context/CatalogProductContext'
import type { ProductImageInput } from '@/lib/clientProductImages'

const PRODUCT_TYPE_OPTIONS = [
  { value: '', label: 'Choose product type' },
  { value: 'candles', label: 'Candles' },
  { value: 'plants', label: 'Plants' },
]

const CANDLE_CATEGORY_OPTIONS = [
  { value: '', label: 'Choose candle category' },
  { value: 'essential', label: 'Essential' },
  { value: 'signature', label: 'Signature' },
  { value: 'art', label: 'Art' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active — visible on store' },
  { value: 'draft', label: 'Draft — hidden from store' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

type FormState = Omit<CatalogProductForm, 'images'>
type FormField = keyof FormState
type FormErrors = Partial<Record<'name' | 'shortDescription' | 'productType' | 'candleCategory' | 'price' | 'discountPrice' | 'images', string>>
type ResultState = { type: '' | 'success' | 'error'; message: string }

const EMPTY_FORM: FormState = {
  name: '',
  shortDescription: '',
  description: '',
  story: '',
  productType: '',
  candleCategory: '',
  price: '',
  discountPrice: '',
  tags: [],
  status: 'active',
}

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'images', label: 'Images' },
  { id: 'tags', label: 'Tags & Status' },
]

const QUICK_TAGS = [
  'Relaxing', 'Handmade', 'Floral', 'Warm', 'Fresh', 'Easy Care',
  'Airy', 'Minimal', 'Botanical', 'Gift Ready', 'Premium', 'Low Maintenance',
]

function formFromProduct(product: CatalogProduct): FormState {
  return {
    name: product.name || '',
    shortDescription: product.shortDescription || '',
    description: product.description || '',
    story: product.story || '',
    productType: product.productType || '',
    candleCategory: product.productType === 'candles' ? product.candleCategory || '' : '',
    price: product.price?.toString() || '',
    discountPrice: product.discountPrice?.toString() || '',
    tags: product.tags || [],
    status: product.status || 'active',
  }
}

function validate(form: FormState, images: ProductImageInput[]): FormErrors {
  const errors: FormErrors = {}
  const price = Number(form.price)
  const discountPrice = form.discountPrice === '' ? null : Number(form.discountPrice)
  if (!form.name.trim()) errors.name = 'Product name is required.'
  if (!form.shortDescription.trim()) errors.shortDescription = 'Short description is required.'
  if (!form.productType) errors.productType = 'Choose Candles or Plants.'
  if (form.productType === 'candles' && !form.candleCategory) {
    errors.candleCategory = 'Choose Essential, Signature, or Art.'
  }
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Enter a price greater than zero.'
  if (discountPrice !== null && (!Number.isFinite(discountPrice) || discountPrice <= 0 || discountPrice >= price)) {
    errors.discountPrice = 'Discount price must be lower than the regular price.'
  }
  if (!images.length) errors.images = 'At least one image is required.'
  return errors
}

type AddCatalogProductModalProps = {
  onClose: () => void
  editProduct?: CatalogProduct | null
}

export default function AddCatalogProductModal({
  onClose,
  editProduct = null,
}: AddCatalogProductModalProps) {
  const { addCatalogProduct, updateCatalogProduct } = useCatalogProducts()
  const isEditing = Boolean(editProduct)
  const [form, setForm] = useState(isEditing ? formFromProduct(editProduct) : EMPTY_FORM)
  const [images, setImages] = useState<ProductImageInput[]>(() => {
    if (!editProduct) return []
    return [editProduct.image, ...(editProduct.gallery || [])].filter(Boolean).map((url, index) => ({
      id: `existing-${index}-${editProduct.id}`,
      preview: url,
      url,
      publicId: editProduct.imagePublicIds?.[index] || '',
    }))
  })
  const [tab, setTab] = useState('basic')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<ResultState>({ type: '', message: '' })

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose() }
    window.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [onClose, saving])

  const handleChange = (event: { target: { name: string; value: string | string[] } }) => {
    const { name, value } = event.target
    if (!(name in EMPTY_FORM)) return
    const field = name as FormField
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'productType' && value === 'plants' ? { candleCategory: '' } : {}),
    }) as FormState)
    setErrors((current) => {
      const next = { ...current }
      delete next[field as keyof FormErrors]
      if (field === 'productType') delete next.candleCategory
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(form, images)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setTab(nextErrors.images && Object.keys(nextErrors).length === 1 ? 'images' : 'basic')
      return
    }

    setSaving(true)
    setResult({ type: '', message: '' })
    try {
      const payload = { ...form, images }
      if (isEditing) await updateCatalogProduct(editProduct.id, payload)
      else await addCatalogProduct(payload)
      setResult({
        type: 'success',
        message: `Product ${isEditing ? 'updated' : 'added'} successfully!`,
      })
      window.setTimeout(onClose, 800)
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'The product could not be saved.',
      })
      setSaving(false)
    }
  }

  const previewImage = images[0]?.preview || (form.productType === 'candles' ? '/assets/candles.jpeg' : '/assets/plants.jpeg')
  const basicHasError = errors.name || errors.shortDescription || errors.productType || errors.candleCategory || errors.price || errors.discountPrice

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/40 px-4 py-8">
      <div className="relative my-auto w-full max-w-5xl rounded-3xl bg-white shadow-lift" role="dialog" aria-modal="true" aria-labelledby="catalog-product-title">
        <div className="flex items-center justify-between border-b border-charcoal/8 px-7 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-olive/10 text-olive"><Leaf size={18} /></span>
            <h2 id="catalog-product-title" className="font-serif text-2xl text-charcoal">
              {isEditing ? `Edit — ${editProduct.name}` : 'Add Candle or Plant Product'}
            </h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="flex h-9 w-9 items-center justify-center rounded-xl text-charcoal/50 hover:bg-beige" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {result.type && (
          <div className={`mx-7 mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${result.type === 'success' ? 'bg-sage-50 text-sage-700' : 'bg-red-50 text-red-600'}`} role={result.type === 'error' ? 'alert' : 'status'}>
            {result.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {result.message}
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="mx-7 mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3" role="alert">
            <p className="mb-1 text-sm font-medium text-red-600">Please fix the following:</p>
            <ul className="list-inside list-disc space-y-0.5">
              {Object.values(errors).filter((message): message is string => Boolean(message)).map((message) => <li key={message} className="text-xs text-red-500">{message}</li>)}
            </ul>
          </div>
        )}

        <div className="flex flex-col divide-y divide-charcoal/8 lg:flex-row lg:divide-x lg:divide-y-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 overflow-x-auto px-7 pb-1 pt-5">
              {TABS.map((item) => {
                const hasError = (item.id === 'basic' && basicHasError) || (item.id === 'images' && errors.images)
                return (
                  <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-medium ${tab === item.id ? 'bg-olive text-cream' : 'text-charcoal/60 hover:bg-beige hover:text-olive'}`}>
                    {item.label}{hasError && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-400" />}
                  </button>
                )
              })}
            </div>

            <form id="catalog-product-form" onSubmit={handleSubmit} className="space-y-6 px-7 py-6">
              {tab === 'basic' && (
                <>
                  <FormSection title="Product Information">
                    <FormInput label="Product Name" name="name" value={form.name} onChange={handleChange} required hint="" error={errors.name} placeholder="e.g. Lavender Candle" />
                    <FormInput label="Short Description" name="shortDescription" value={form.shortDescription} onChange={handleChange} required hint="" error={errors.shortDescription} placeholder="One sentence summary of this product" />
                    <FormTextarea label="Full Description" name="description" value={form.description} onChange={handleChange} required={false} rows={3} placeholder="Describe the product in detail." />
                    <FormTextarea label="Product Story" name="story" value={form.story} onChange={handleChange} required={false} rows={3} placeholder="The story behind this product." />
                  </FormSection>
                  <FormSection title="Product Classification">
                    <FormSelect label="Product Type" name="productType" value={form.productType} onChange={handleChange} options={PRODUCT_TYPE_OPTIONS} required />
                    {errors.productType && <p className="text-xs text-red-500">{errors.productType}</p>}
                    {form.productType === 'candles' && (
                      <>
                        <FormSelect label="Category" name="candleCategory" value={form.candleCategory} onChange={handleChange} options={CANDLE_CATEGORY_OPTIONS} required />
                        {errors.candleCategory && <p className="text-xs text-red-500">{errors.candleCategory}</p>}
                      </>
                    )}
                  </FormSection>
                  <FormSection title="Pricing">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput label="Price (EGP)" name="price" type="number" value={form.price} onChange={handleChange} required hint="" error={errors.price} placeholder="e.g. 650" />
                      <FormInput label="Discount Price" name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} required={false} error={errors.discountPrice} placeholder="Optional" hint="Must be lower than the regular price" />
                    </div>
                  </FormSection>
                </>
              )}

              {tab === 'images' && (
                <FormSection title="Product Images">
                  <ImageUploader images={images} onChange={setImages} />
                  {errors.images && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle size={12} /> {errors.images}</p>}
                  <p className="text-xs text-charcoal/40">The first image is the main product image. Images are stored durably with the product.</p>
                </FormSection>
              )}

              {tab === 'tags' && (
                <>
                  <FormSection title="Tags">
                    <FormTagInput label="Product Tags" name="tags" value={form.tags} onChange={handleChange} />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {QUICK_TAGS.filter((tag) => !form.tags.includes(tag)).map((tag) => (
                        <button key={tag} type="button" onClick={() => handleChange({ target: { name: 'tags', value: [...form.tags, tag] } })} className="rounded-full border border-charcoal/10 px-2.5 py-1 text-[11px] text-charcoal/50 hover:border-olive/30 hover:text-olive">+ {tag}</button>
                      ))}
                    </div>
                  </FormSection>
                  <FormSection title="Product Status">
                    <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} options={STATUS_OPTIONS} required={false} />
                    <p className="text-xs text-charcoal/40">Only Active products appear in Build Your Package.</p>
                  </FormSection>
                </>
              )}
            </form>

            <div className="flex items-center justify-between gap-4 border-t border-charcoal/8 px-7 py-5">
              <button type="button" onClick={onClose} disabled={saving} className="text-sm text-charcoal/50 hover:text-charcoal">Cancel</button>
              <div className="flex items-center gap-3">
                {tab !== TABS[0].id && <button type="button" onClick={() => setTab(TABS[TABS.findIndex((item) => item.id === tab) - 1].id)} className="text-xs text-charcoal/40 hover:text-olive">← Back</button>}
                {tab !== TABS[TABS.length - 1].id ? (
                  <button type="button" onClick={() => setTab(TABS[TABS.findIndex((item) => item.id === tab) + 1].id)} className="rounded-full bg-beige px-5 py-2.5 text-sm font-medium text-charcoal hover:bg-beige-dark">Next →</button>
                ) : (
                  <button type="submit" form="catalog-product-form" disabled={saving} className="rounded-full bg-olive px-6 py-2.5 text-sm font-medium uppercase tracking-label text-cream hover:bg-olive-dark disabled:opacity-60">
                    {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Product'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="shrink-0 rounded-b-3xl bg-ivory p-6 lg:w-72 lg:rounded-b-none lg:rounded-r-3xl xl:w-80">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-charcoal/8 bg-beige"><OptimizedImage src={previewImage} alt="Product preview" className="h-40 w-full object-cover" /></div>
              <div><h3 className="font-serif text-lg text-charcoal">{form.name || 'Product Name'}</h3><p className="mt-1 line-clamp-2 text-xs text-charcoal/50">{form.shortDescription || 'Short description will appear here...'}</p></div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-label text-charcoal/40">{form.productType === 'candles' ? `🕯 ${form.candleCategory || 'Candles'}` : form.productType === 'plants' ? '🌿 Plants' : 'Product type'}</span>
                {form.price ? (
                  <ProductPrice
                    price={Number(form.price)}
                    discountPrice={form.discountPrice ? Number(form.discountPrice) : null}
                    currency="EGP"
                    className="justify-end font-serif"
                    currentClassName="text-lg text-brown"
                    originalClassName="text-xs text-charcoal/35 line-through"
                  />
                ) : <span className="font-serif text-lg text-brown">EGP —</span>}
              </div>
              {form.tags.length > 0 && <div className="flex flex-wrap gap-1">{form.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-beige px-2 py-0.5 text-[10px] text-charcoal/50">{tag}</span>)}</div>}
              <p className="border-t border-charcoal/8 pt-2 text-center text-[10px] text-charcoal/30">Preview updates as you type</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
