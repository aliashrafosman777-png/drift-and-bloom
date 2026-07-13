// @ts-nocheck
"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import Button from '../common/Button'

const INPUT_CLASS = 'w-full rounded-xl border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal transition duration-300 placeholder:text-charcoal/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40'

function Field({ label, name, value, onChange, onBlur, error, type = 'text', placeholder, required = false, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-label text-charcoal/50">
        {Icon && <Icon size={13} className="text-gold-dark" />}
        {label} {required && <span className="text-brown">*</span>}
      </span>
      {children || (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${INPUT_CLASS} ${error ? 'border-red-300 bg-red-50/40 focus:border-red-300 focus:ring-red-100' : ''}`}
        />
      )}
      {error && (
        <motion.p
          id={`${name}-error`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}
    </label>
  )
}

export default function CheckoutForm({ form, errors, touched, onChange, onBlur, onSubmit, isReady, itemCount }) {
  const showError = (name) => touched[name] ? errors[name] : ''

  return (
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-gold/15 bg-white/75 p-5 shadow-soft sm:p-7 lg:p-8"
    >
      <div className="mb-7">
        <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-label text-gold-dark">
          Secure Checkout
        </p>
        <h2 className="font-serif text-4xl text-charcoal sm:text-5xl">Customer Information</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/60 sm:text-base">
          Add your shipping details so we can prepare your personalized Drift &amp; Bloom order with care.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={onChange}
          onBlur={onBlur}
          error={showError('fullName')}
          placeholder="Enter your full name"
          required
          icon={UserRound}
        />
        <Field
          label="Email Address"
          name="email"
          value={form.email}
          onChange={onChange}
          onBlur={onBlur}
          error={showError('email')}
          type="email"
          placeholder="name@example.com"
          required
          icon={Mail}
        />
        <Field
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={onChange}
          onBlur={onBlur}
          error={showError('phone')}
          type="tel"
          placeholder="01000000000"
          required
          icon={Phone}
        />
        <Field
          label="City"
          name="city"
          value={form.city}
          onChange={onChange}
          onBlur={onBlur}
          error={showError('city')}
          placeholder="Cairo"
          required
          icon={MapPin}
        />
        <Field
          label="Full Shipping Address"
          name="address"
          value={form.address}
          onChange={onChange}
          onBlur={onBlur}
          error={showError('address')}
          required
          icon={MapPin}
        >
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={onChange}
            onBlur={onBlur}
            rows={4}
            placeholder="Building, street, floor, apartment, landmark..."
            aria-invalid={Boolean(showError('address'))}
            aria-describedby={showError('address') ? 'address-error' : undefined}
            className={`${INPUT_CLASS} resize-none ${showError('address') ? 'border-red-300 bg-red-50/40 focus:border-red-300 focus:ring-red-100' : ''}`}
          />
        </Field>
        <div className="space-y-5">
          <Field
            label="Postal Code"
            name="postalCode"
            value={form.postalCode}
            onChange={onChange}
            onBlur={onBlur}
            error={showError('postalCode')}
            placeholder="Optional"
          />
          <Field
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={onChange}
            onBlur={onBlur}
            error={showError('notes')}
          >
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={onChange}
              onBlur={onBlur}
              rows={4}
              placeholder="Optional notes for your order..."
              className={`${INPUT_CLASS} resize-none`}
            />
          </Field>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gold/15 bg-beige/50 p-4 text-sm text-charcoal/60">
        {itemCount > 0 ? (
          <p>You have {itemCount} item{itemCount === 1 ? '' : 's'} in your package. Complete the required fields to review the order.</p>
        ) : (
          <p>Add at least one product before you can confirm your order.</p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-charcoal/40">Fields marked with * are required.</p>
        <Button type="submit" size="lg" disabled={!isReady}>
          Review Order <ArrowRight size={16} />
        </Button>
      </div>
    </motion.form>
  )
}
