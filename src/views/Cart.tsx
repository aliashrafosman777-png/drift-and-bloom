// @ts-nocheck
"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Package,
  Truck,
  PackageCheck,
  ChevronDown,
  Shield,
  CreditCard,
  Banknote,
  Gift,
  Sprout,
  PawPrint,
  Flame,
  LogIn,
  Languages,
  Mail,
  MapPin,
  Phone,
  UserRound,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import Container from '../components/common/Container'
import Button from '../components/common/Button'
import CartItem from '../components/cart/CartItem'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import { Reveal, Stagger, fadeUp } from '../components/common/Motion'
import OptimizedImage from '../components/common/OptimizedImage'
import { apiFetch } from '../lib/api'

const BREADCRUMB_STEPS = ['Cart', 'Information', 'Payment', 'Review']

const PROGRESS_STEPS = [
  { label: 'Order Confirmed', icon: Check },
  { label: 'Being Prepared', icon: Package },
  { label: 'Out for Delivery', icon: Truck },
  { label: 'Delivered', icon: PackageCheck },
]

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, badges: ['VISA', 'MC', 'AMEX'] },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote, badges: [] },
  { id: 'fawry', label: 'Fawry', icon: Banknote, badges: ['Fawry'] },
]

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
  giftMessage: '',
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^\+?[0-9\s()\-]{8,20}$/
const requiredFields = ['fullName', 'phone', 'email', 'address', 'city']

function validateForm(form) {
  const errors = {}
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.'
  else if (form.fullName.trim().length < 3) errors.fullName = 'Please enter your full name.'

  const phoneDigits = form.phone.replace(/\D/g, '')
  if (!form.phone.trim()) errors.phone = 'Phone number is required.'
  else if (!phoneRegex.test(form.phone.trim()) || phoneDigits.length < 8 || phoneDigits.length > 15) {
    errors.phone = 'Please enter a valid phone number.'
  }

  if (!form.email.trim()) errors.email = 'Email address is required.'
  else if (!emailRegex.test(form.email.trim())) errors.email = 'Please enter a valid email address.'

  if (!form.address.trim()) errors.address = 'Full shipping address is required.'
  else if (form.address.trim().length < 3) errors.address = 'Please enter a more complete address.'

  if (!form.city.trim()) errors.city = 'City is required.'

  return errors
}

function CustomerField({ label, name, value, error, touched, onChange, onBlur, type = 'text', placeholder, icon: Icon, children }) {
  const showError = touched && error
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-label text-charcoal/50">
        {Icon && <Icon size={13} className="text-gold-dark" />}
        {label}
        {requiredFields.includes(name) && <span className="text-brown">*</span>}
      </span>
      {children || (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={Boolean(showError)}
          aria-describedby={showError ? `${name}-error` : undefined}
          className={`w-full rounded-xl border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 transition duration-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 ${
            showError ? 'border-red-300 bg-red-50/40 focus:border-red-300 focus:ring-red-100' : ''
          }`}
        />
      )}
      <AnimatePresence>
        {showError && (
          <motion.p
            id={`${name}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </label>
  )
}

function InstructionLanguageCard({ languages, selectedLanguage, onSelect }) {
  return (
    <motion.section
      layout
      className="rounded-2xl border border-gold/15 bg-beige/45 p-5"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-olive shadow-soft">
          <Languages size={17} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-label text-gold-dark">Instruction Card</p>
          <h3 className="mt-1 font-serif text-2xl text-charcoal">Instruction Language</h3>
          <p className="mt-1 text-sm leading-relaxed text-charcoal/60">
            Choose which language you would like your product instructions to be provided in.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Instruction language">
        {languages.map((language) => {
          const active = selectedLanguage === language
          return (
            <motion.button
              key={language}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(language)}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition duration-300 ${
                active
                  ? 'border-olive bg-olive text-cream shadow-soft'
                  : 'border-charcoal/10 bg-white text-charcoal hover:border-gold/40 hover:shadow-soft'
              }`}
            >
              <span>
                <span className="block font-serif text-xl">{language}</span>
                <span className={`mt-1 block text-xs ${active ? 'text-cream/65' : 'text-charcoal/45'}`}>
                  Printed care instructions
                </span>
              </span>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-cream bg-cream text-olive' : 'border-charcoal/20'}`}>
                {active && <Check size={12} />}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.section>
  )
}

function OrderReview({ form, items, subtotal, shipping, total, paymentMethod, instructionLanguage, onBack, onConfirm, isSubmitting }) {
  const payment = PAYMENT_METHODS.find((method) => method.id === paymentMethod)

  return (
    <Container className="py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-gold/15 bg-white/80 p-5 shadow-lift sm:p-8"
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-label text-gold-dark">
              <Sparkles size={14} /> Final Review
            </p>
            <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">Review Your Order</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/60 sm:text-base">
              Confirm the customer details, instruction language, products, quantities, and total before placing the order.
            </p>
          </div>
          <div className="rounded-2xl bg-olive px-5 py-4 text-cream shadow-soft">
            <p className="text-xs uppercase tracking-label text-cream/60">Total Amount</p>
            <p className="mt-1 font-serif text-3xl">LE {total.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-charcoal/5 bg-beige/40 p-5">
            <h2 className="mb-4 font-serif text-2xl text-charcoal">Customer Information</h2>
            <div className="space-y-3 text-sm text-charcoal/70">
              <p className="flex items-start gap-2"><UserRound size={15} className="mt-0.5 text-gold-dark" /> <span><strong className="text-charcoal">{form.fullName}</strong><br />{form.email}</span></p>
              <p className="flex items-center gap-2"><Phone size={15} className="text-gold-dark" /> {form.phone}</p>
              <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 text-gold-dark" /> <span>{form.address}<br />{form.city}{form.postalCode ? `, ${form.postalCode}` : ''}</span></p>
              <p className="flex items-center gap-2"><Languages size={15} className="text-gold-dark" /> Instruction Language: <strong className="text-charcoal">{instructionLanguage}</strong></p>
              <p className="flex items-center gap-2"><payment.icon size={15} className="text-gold-dark" /> Payment: <strong className="text-charcoal">{payment.label}</strong></p>
              {form.giftMessage && <p className="rounded-xl bg-white/70 p-3 text-charcoal/60"><strong className="text-charcoal">Gift Note:</strong> {form.giftMessage}</p>}
              {form.notes && <p className="rounded-xl bg-white/70 p-3 text-charcoal/60"><strong className="text-charcoal">Delivery Notes:</strong> {form.notes}</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-charcoal/5 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl text-charcoal">Selected Products</h2>
              <span className="rounded-full bg-olive/10 px-3 py-1 text-xs uppercase tracking-label text-olive">
                {items.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <motion.div key={`${item.productId}-${item.plantOption || 'default'}`} layout className="flex items-center gap-3 rounded-2xl border border-charcoal/5 bg-beige/35 p-3">
                  <OptimizedImage src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-lg text-charcoal">{item.isCustomPackage ? item.name : `The ${item.name} Collection`}</p>
                    <p className="text-xs text-charcoal/45">Qty {item.quantity} × LE {item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-serif text-xl text-brown">LE {(item.price * item.quantity).toLocaleString()}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-charcoal/10 pt-4 text-sm text-charcoal/65">
              <div className="flex justify-between"><span>Subtotal</span><span>LE {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `LE ${shipping}`}</span></div>
              <div className="flex justify-between text-base font-medium text-charcoal"><span>Total</span><span className="font-serif text-xl">LE {total.toLocaleString()}</span></div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            <ChevronLeft size={16} /> Back to Edit
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting} size="lg" className="bg-olive-dark border-olive-dark hover:bg-charcoal">
            {isSubmitting ? 'Placing Order...' : <><Gift size={16} /> Confirm Order</>}
          </Button>
        </div>
      </motion.div>
    </Container>
  )
}

export default function Cart() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    shipping,
    total,
    clearCart,
    instructionLanguage,
    setInstructionLanguage,
    instructionLanguages,
  } = useCart()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [giftNoteOpen, setGiftNoteOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = useMemo(() => validateForm(form), [form])
  const isFormValid = Object.keys(errors).length === 0
  const canReview = items.length > 0 && isFormValid

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleBlur = (e) => setTouched((current) => ({ ...current, [e.target.name]: true }))

  const touchAllRequired = () => {
    setTouched(requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), { postalCode: true, notes: true, giftMessage: true }))
  }

  const handleReviewOrder = (e) => {
    e?.preventDefault()
    touchAllRequired()
    if (!items.length) {
      showToast('Add at least one product before confirming your order.', 'info')
      return
    }
    if (!isFormValid) {
      showToast('Please complete the required customer information first.', 'info')
      return
    }
    setReviewOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConfirmOrder = async () => {
    if (!canReview || isSubmitting) return
    setIsSubmitting(true)

    try {
      const PAYMENT_LABEL = {
        card: 'Card',
        cod: 'Cash on Delivery',
        fawry: 'Fawry',
      }

      const orderPayload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        items: items.map((item) => ({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          plantOption: item.plantOption || '',
          image: item.image || '',
          isCustomPackage: Boolean(item.isCustomPackage),
          packageSelections: item.packageSelections || [],
        })),
        subtotal,
        shipping,
        total,
        paymentMethod: PAYMENT_LABEL[paymentMethod] || paymentMethod,
        shippingAddress: {
          street: form.address.trim(),
          city: form.city.trim(),
          zip: form.postalCode.trim(),
        },
        notes: form.notes.trim(),
        giftMessage: form.giftMessage.trim(),
        instructionLanguage,
      }

      const response = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      })

      // Capture the order ID for the success page
      const createdOrder = response?.data as any
      const newOrderId = createdOrder?._id || createdOrder?.id || ''

      setIsSubmitting(false)
      setOrderId(newOrderId)
      setOrderPlaced(true)
      setReviewOpen(false)
      clearCart()
      showToast('Order placed successfully! 🎉')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setIsSubmitting(false)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      showToast(errorMessage || 'Failed to place order. Please try again.', 'info')
    }
  }

  if (orderPlaced) {
    return (
      <Container className="py-20 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="bg-cream rounded-3xl border border-gold/15 p-8 sm:p-12 text-center shadow-lift"
        >
          <motion.div
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
            className="w-16 h-16 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center mx-auto mb-6"
          >
            <Gift size={28} />
          </motion.div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
            Your Drift &amp; Bloom story is being prepared.
          </h1>
          <p className="text-charcoal/60 mt-3 text-sm sm:text-base">
            We'll carefully prepare and deliver your thoughtful gift{form.fullName ? `, ${form.fullName}` : ''}.
          </p>
          {orderId && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-olive/10 px-4 py-2.5 text-sm font-medium text-olive">
              <Package size={15} /> Order #{orderId.slice(-8).toUpperCase()}
            </p>
          )}

          <div className="flex items-center justify-between mt-12 mb-2">
            {PROGRESS_STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center flex-1">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center mb-2 transition duration-300 ${
                      i === 0 ? 'bg-olive text-cream shadow-sm' : 'bg-beige text-charcoal/30'
                    }`}
                  >
                    <step.icon size={16} />
                  </div>
                  <span className="text-[11px] text-charcoal/50 max-w-[80px]">{step.label}</span>
                </div>
                {i < PROGRESS_STEPS.length - 1 && <span className="h-px bg-gold/30 flex-1 mb-7 mx-1" />}
              </React.Fragment>
            ))}
          </div>

          <Button href="/packages" className="mt-8">
            Continue Shopping
          </Button>
        </motion.div>
      </Container>
    )
  }

  if (reviewOpen) {
    return (
      <OrderReview
        form={form}
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        paymentMethod={paymentMethod}
        instructionLanguage={instructionLanguage}
        onBack={() => setReviewOpen(false)}
        onConfirm={handleConfirmOrder}
        isSubmitting={isSubmitting}
      />
    )
  }

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gold/15 bg-white/70 p-8 shadow-soft sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-beige text-olive">
            <Package size={30} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-3">Your Cart is Empty</h1>
          <p className="text-charcoal/60 mb-8 text-sm sm:text-base">
            Looks like you haven't found your package yet. Start with a curated collection or build your own from scratch.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/packages">Browse Packages</Button>
            <Button href="/build-your-package" variant="outline">Build Your Package</Button>
          </div>
        </motion.div>
      </Container>
    )
  }

  return (
    <Container className="py-10 sm:py-14">
      <Reveal>
        <h1 className="font-serif text-4xl text-charcoal mb-2">Your Cart</h1>
        <nav className="flex items-center gap-2 text-xs text-charcoal/45 mb-6" aria-label="Checkout progress">
          {BREADCRUMB_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <span className={i === 0 ? 'text-olive font-medium' : ''}>{step}</span>
              {i < BREADCRUMB_STEPS.length - 1 && <span>›</span>}
            </React.Fragment>
          ))}
        </nav>
      </Reveal>

      {!isAuthenticated && (
        <Reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-beige border border-gold/20 rounded-2xl px-5 py-4 mb-8 shadow-soft">
          <p className="flex items-center gap-2 text-sm text-charcoal/70">
            <LogIn size={15} className="text-olive shrink-0" /> You can checkout as a guest, or sign in for faster order tracking.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Button href="/login" state={{ from: '/cart', message: 'Log in for faster checkout and order tracking.' }} variant="outline" size="sm">
              Log In
            </Button>
            <Button href="/register" state={{ from: '/cart', message: 'Create an account for faster checkout.' }} size="sm">
              Create Account
            </Button>
          </div>
        </Reveal>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-2 space-y-6">
          <motion.div layout className="bg-cream rounded-2xl border border-gold/15 p-5 sm:p-6 shadow-soft">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.plantOption || 'default'}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.28 }}
                >
                  <CartItem
                    item={item}
                    onUpdateQuantity={(qty) => updateQuantity(item.productId, item.plantOption, qty)}
                    onRemove={() => {
                      removeFromCart(item.productId, item.plantOption)
                      showToast(`${item.name} removed from your cart.`, 'info')
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setGiftNoteOpen((o) => !o)}
              className="w-full flex items-center justify-between text-sm text-charcoal/70 pt-4 mt-1 border-t border-charcoal/10 transition duration-300 hover:text-olive"
              aria-expanded={giftNoteOpen}
            >
              <span className="flex items-center gap-2">
                <Gift size={15} className="text-brown" /> Add a gift note to your order
              </span>
              <ChevronDown size={16} className={`transition duration-300 ${giftNoteOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {giftNoteOpen && (
                <motion.textarea
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  name="giftMessage"
                  value={form.giftMessage}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Write a short note to include with your gift..."
                  className="w-full bg-beige rounded-xl px-4 py-3 text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                />
              )}
            </AnimatePresence>
          </motion.div>

          <motion.form onSubmit={handleReviewOrder} className="bg-cream rounded-2xl border border-gold/15 p-5 sm:p-6 shadow-soft" noValidate>
            <h2 className="font-serif text-2xl text-charcoal mb-2">Customer Information</h2>
            <p className="mb-5 text-sm text-charcoal/55">Complete the required details before reviewing your order.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomerField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} onBlur={handleBlur} error={errors.fullName} touched={touched.fullName} placeholder="Enter your full name" icon={UserRound} />
              <CustomerField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} touched={touched.phone} type="tel" placeholder="01000000000" icon={Phone} />
              <CustomerField label="Email Address" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={touched.email} type="email" placeholder="name@example.com" icon={Mail} />
              <CustomerField label="City" name="city" value={form.city} onChange={handleChange} onBlur={handleBlur} error={errors.city} touched={touched.city} placeholder="Cairo" icon={MapPin} />
              <CustomerField label="Full Shipping Address" name="address" value={form.address} onChange={handleChange} onBlur={handleBlur} error={errors.address} touched={touched.address} icon={MapPin}>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={4}
                  placeholder="Building, street, floor, apartment, landmark..."
                  aria-invalid={Boolean(touched.address && errors.address)}
                  aria-describedby={touched.address && errors.address ? 'address-error' : undefined}
                  className={`w-full rounded-xl border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 transition duration-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 sm:col-span-2 resize-none ${
                    touched.address && errors.address ? 'border-red-300 bg-red-50/40 focus:border-red-300 focus:ring-red-100' : ''
                  }`}
                />
              </CustomerField>
              <CustomerField label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} onBlur={handleBlur} touched={touched.postalCode} placeholder="Optional" />
              <CustomerField label="Delivery Notes" name="notes" value={form.notes} onChange={handleChange} onBlur={handleBlur} touched={touched.notes} placeholder="Optional" />
            </div>
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </motion.form>

          <InstructionLanguageCard
            languages={instructionLanguages}
            selectedLanguage={instructionLanguage}
            onSelect={(language) => {
              setInstructionLanguage(language)
              showToast(`Instruction language set to ${language}.`)
            }}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-28">
          <motion.div layout className="bg-cream rounded-2xl border border-gold/15 p-6 shadow-soft">
            <h2 className="font-serif text-xl text-charcoal mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-charcoal/70">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <motion.span key={subtotal} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>LE {subtotal.toLocaleString()}</motion.span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span className="flex items-center gap-1">Shipping <Truck size={13} className="text-charcoal/30" /></span>
                <span>{shipping === 0 ? 'Free' : `LE ${shipping}`}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span className="flex items-center gap-1">Instructions <Languages size={13} className="text-charcoal/30" /></span>
                <span>{instructionLanguage}</span>
              </div>
              <div className="border-t border-charcoal/10 pt-3 flex justify-between font-medium text-charcoal text-base">
                <span>Total</span>
                <motion.span key={total} initial={{ scale: 0.96, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="font-serif text-xl">LE {total.toLocaleString()}</motion.span>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-sage-600 mt-4 bg-sage-50 rounded-lg px-3 py-2.5">
              <Truck size={13} /> Enjoy free shipping on orders over LE 3,000.
            </p>
          </motion.div>

          <div className="bg-cream rounded-2xl border border-gold/15 p-6 shadow-soft">
            <h2 className="font-serif text-xl text-charcoal mb-5">Payment Method</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <motion.label
                  key={method.id}
                  whileHover={{ y: -2 }}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition duration-300 ${
                    paymentMethod === method.id ? 'border-olive bg-olive/5 shadow-soft' : 'border-charcoal/10 hover:border-gold/40'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-olive w-4 h-4" />
                    <method.icon size={16} className="text-charcoal/50" />
                    <span className="text-sm text-charcoal">{method.label}</span>
                  </span>
                  {method.badges.length > 0 && (
                    <span className="flex items-center gap-1">
                      {method.badges.map((b) => (
                        <span key={b} className="text-[9px] font-semibold uppercase tracking-wide bg-beige-dark text-charcoal/60 px-1.5 py-0.5 rounded">{b}</span>
                      ))}
                    </span>
                  )}
                </motion.label>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-charcoal/40 mt-4">
              <Shield size={13} /> Secure &amp; Encrypted Checkout. Your payment details are safe with us.
            </p>
          </div>

          <div className="bg-olive rounded-2xl p-6 text-cream shadow-lift">
            <h2 className="font-serif text-xl mb-1">Confirm Your Order</h2>
            <p className="text-cream/60 text-xs mb-5">Review your selections before placing the order.</p>
            <Stagger className="space-y-3 mb-5">
              {items.map((item) => (
                <motion.div key={`confirm-${item.productId}-${item.plantOption || 'default'}`} variants={fadeUp} className="flex gap-3 bg-cream/10 rounded-xl p-3">
                  <OptimizedImage src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <div className="text-xs">
                    <p className="font-serif text-sm text-cream">{item.isCustomPackage ? item.name : `The ${item.name} Collection`}</p>
                    {item.plantOption && <p className="flex items-center gap-1 text-cream/55 mt-1"><Sprout size={11} /> Plant Selected: {item.plantOption}</p>}
                    <p className="flex items-center gap-1 text-cream/55"><PawPrint size={11} /> Pet-Friendly: Yes</p>
                    {item.scent && <p className="flex items-center gap-1 text-cream/55"><Flame size={11} /> Candle Scent: {item.scent}</p>}
                  </div>
                </motion.div>
              ))}
            </Stagger>
            <p className="flex items-center gap-2 text-xs bg-cream/10 rounded-lg px-3 py-2.5">
              <Languages size={14} className="text-sage-300 shrink-0" /> Printed instructions: {instructionLanguage}
            </p>
          </div>

          <Button onClick={handleReviewOrder} disabled={!canReview} size="lg" fullWidth className="bg-olive-dark border-olive-dark hover:bg-charcoal">
            <Gift size={16} /> Review Order
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal/40 -mt-3">
            {canReview ? <CheckCircle2 size={12} className="text-sage-600" /> : <Shield size={12} />}
            {canReview ? 'Ready for final review' : 'Add products and complete required fields'}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/packages" className="text-sm text-olive underline decoration-gold/60 underline-offset-4 transition duration-300 hover:text-olive-dark">
          ← Continue Shopping
        </Link>
      </div>
    </Container>
  )
}
