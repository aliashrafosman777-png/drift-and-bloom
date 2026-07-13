// @ts-nocheck
"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ChevronLeft, Gift, MapPin, Phone, UserRound } from 'lucide-react'
import Button from '../common/Button'
import OptimizedImage from '../common/OptimizedImage'

export default function FinalOrderReview({ categories, selectedItems, customer, total, itemCount, onBack, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-gold/15 bg-white/80 p-5 shadow-lift sm:p-7 lg:p-8"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-label text-gold-dark">
            Final Review
          </p>
          <h2 className="font-serif text-4xl text-charcoal sm:text-5xl">Review Your Order</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/60 sm:text-base">
            Please check the customer information, quantities, and total before confirming your order.
          </p>
        </div>
        <div className="rounded-2xl bg-olive px-5 py-4 text-cream shadow-soft">
          <p className="text-xs uppercase tracking-label text-cream/60">Total Amount</p>
          <p className="mt-1 font-serif text-3xl">EGP {total.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-charcoal/5 bg-beige/40 p-5">
          <h3 className="mb-4 font-serif text-2xl text-charcoal">Customer Information</h3>
          <div className="space-y-3 text-sm text-charcoal/70">
            <p className="flex items-start gap-2"><UserRound size={15} className="mt-0.5 text-gold-dark" /> <span><strong className="text-charcoal">{customer.fullName}</strong><br />{customer.email}</span></p>
            <p className="flex items-center gap-2"><Phone size={15} className="text-gold-dark" /> {customer.phone}</p>
            <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 text-gold-dark" /> <span>{customer.address}<br />{customer.city}{customer.postalCode ? `, ${customer.postalCode}` : ''}</span></p>
            {customer.notes && (
              <p className="rounded-xl bg-white/70 p-3 text-charcoal/60"><strong className="text-charcoal">Notes:</strong> {customer.notes}</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-charcoal/5 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-serif text-2xl text-charcoal">Selected Package</h3>
            <span className="rounded-full bg-olive/10 px-3 py-1 text-xs uppercase tracking-label text-olive">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-5">
            {categories.map((category) => {
              const lines = selectedItems[category.id] || []
              if (lines.length === 0) return null

              return (
                <div key={category.id}>
                  <h4 className="mb-2 text-[11px] uppercase tracking-label text-charcoal/45">
                    Selected {category.label}
                  </h4>
                  <div className="space-y-2">
                    {lines.map(({ product, quantity }) => (
                      <motion.div
                        key={product.id}
                        layout
                        className="flex items-center gap-3 rounded-2xl border border-charcoal/5 bg-beige/35 p-3"
                      >
                        <OptimizedImage src={product.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-lg text-charcoal">{product.name}</p>
                          <p className="text-xs text-charcoal/45">
                            Qty {quantity} × EGP {product.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-serif text-xl text-brown">
                          EGP {(product.price * quantity).toLocaleString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          <ChevronLeft size={16} /> Back to Edit
        </Button>
        <Button onClick={onConfirm} size="lg" className="bg-olive-dark border-olive-dark hover:bg-charcoal">
          <Gift size={16} /> Confirm Order
        </Button>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-charcoal/40">
        <CheckCircle2 size={14} className="text-sage-600" /> Your order details will be prepared with care and intention.
      </p>
    </motion.div>
  )
}
