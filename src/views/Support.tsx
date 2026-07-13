// @ts-nocheck
"use client"

import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMail, FiPhone, FiClock, FiHelpCircle, FiCheck } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Container from '../components/common/Container'
import Button from '../components/common/Button'
import FAQItem from '../components/support/FAQItem'
import USPStrip from '../components/common/USPStrip'
import { useToast } from '../components/common/Toast'
import { Reveal, Stagger, fadeUp } from '../components/common/Motion'

const FAQS = [
  { q: 'How long does it take to get a response?', a: 'Our support team typically replies within 24 hours on business days. Order-related questions are usually answered even faster.' },
  { q: 'What if my package arrives damaged?', a: "We're so sorry! Reach out within 48 hours of delivery with a photo and your order number, and we'll send a replacement or refund right away." },
  { q: 'Can I change or cancel my order?', a: 'You can change or cancel your order within 2 hours of placing it. After that, your package will already be in preparation.' },
  { q: 'How do I return a package?', a: "Living plants and used candles can't be returned, but unopened, unused items can be returned within 7 days. Contact support to start the process." },
  { q: 'Do you offer refunds or replacements?', a: "Yes — if something isn't right, we'll always offer a replacement or refund depending on the situation. Just tell us what happened." },
  { q: 'Where is my order?', a: 'You can track your order status anytime from the confirmation page, or contact us with your order number for a live update.' },
]

const CONTACT_CARDS = [
  { icon: FiMail, title: 'Email Us', body: "Send us an email and we'll respond within 24 hours", detail: 'driftandbloom28@gmail.com' },
  { icon: FiPhone, title: 'Call Us', body: 'Non-Stop Service', detail: '+20 109 782 4111\n01142229915' },
  { icon: FiClock, title: 'Business Hours', body: 'Serving You 24/7', detail: '' },
]

const initialForm = { name: '', email: '', subject: '', message: '' }
const validate = (form) => {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email.'
  if (!form.subject.trim()) errors.subject = 'Subject is required.'
  if (form.message.trim().length < 10) errors.message = 'Please add a little more detail.'
  return errors
}

function SupportInput({ as = 'input', name, value, onChange, onBlur, error, touched, placeholder, type = 'text', className = '' }) {
  const Component = as
  const showError = touched && error
  return (
    <label className={className || 'block'}>
      <Component
        name={name}
        type={as === 'input' ? type : undefined}
        rows={as === 'textarea' ? 5 : undefined}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={Boolean(showError)}
        aria-describedby={showError ? `${name}-error` : undefined}
        className={`w-full bg-beige rounded-xl px-4 py-3 text-sm transition duration-300 focus:outline-none focus:ring-2 focus:ring-gold/40 ${as === 'textarea' ? 'resize-none' : ''} ${showError ? 'bg-red-50/60 ring-1 ring-red-200' : ''}`}
      />
      <AnimatePresence>
        {showError && <motion.p id={`${name}-error`} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs text-red-500">{error}</motion.p>}
      </AnimatePresence>
    </label>
  )
}

export default function Support() {
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()
  const errors = useMemo(() => validate(form), [form])
  const canSubmit = Object.keys(errors).length === 0

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, subject: true, message: true })
    if (!canSubmit) {
      showToast('Please complete the support form correctly.', 'info')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.message || 'Failed to send message. Please try again.', 'error')
        return
      }
      setSent(true)
      setForm(initialForm)
      setTouched({})
      showToast("Thanks — your message has been sent. We'll be in touch soon.")
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="bg-olive py-12 sm:py-16">
        <Container className="text-center">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-4xl sm:text-5xl text-cream">
            Support &amp; Complaints
          </motion.h1>
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.45 }} className="block w-28 h-px bg-brown mx-auto mt-4" />
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="text-cream/80 max-w-xl mx-auto mt-4 text-sm sm:text-base">
            We're here to help. Whether something arrived damaged, delayed, or not as expected, we'll make it right with care and attention.
          </motion.p>
        </Container>
      </section>

      <section className="bg-cream py-12 sm:py-16">
        <Container className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Reveal className="lg:col-span-2 bg-white border border-charcoal/5 rounded-2xl p-6 sm:p-8 shadow-soft">
            <h2 className="font-serif text-2xl text-charcoal mb-1">Send Us a Message</h2>
            <p className="text-charcoal/50 text-sm mb-6">Please fill out the form below and our team will get back to you.</p>

            <AnimatePresence>
              {sent && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 bg-sage-50 text-sage-600 text-sm rounded-lg px-4 py-3 mb-6">
                  <FiCheck size={16} /> Thanks — your message has been sent.
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
              <SupportInput name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} touched={touched.name} placeholder="Full Name *" />
              <SupportInput name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={touched.email} placeholder="Email Address *" />
              <SupportInput name="subject" value={form.subject} onChange={handleChange} onBlur={handleBlur} error={errors.subject} touched={touched.subject} placeholder="Subject *" className="sm:col-span-2" />
              <SupportInput as="textarea" name="message" value={form.message} onChange={handleChange} onBlur={handleBlur} error={errors.message} touched={touched.message} placeholder="Please describe the issue in detail..." className="sm:col-span-2" />
              <Button type="submit" size="lg" fullWidth disabled={submitting} className="sm:col-span-2">
                {submitting ? 'Sending...' : 'Submit Message'}
              </Button>
            </form>
            <p className="text-xs text-charcoal/40 text-center mt-4">🔒 Your information is safe with us and will only be used to assist your request.</p>
          </Reveal>

          <Stagger className="space-y-5">
            {CONTACT_CARDS.map(({ icon: Icon, title, body, detail }) => (
              <motion.div key={title} variants={fadeUp} whileHover={{ y: -3 }} className="bg-white border border-charcoal/5 rounded-2xl p-6 flex gap-5 shadow-soft">
                <div className="w-12 h-12 rounded-full bg-beige text-olive flex items-center justify-center shrink-0"><Icon size={20} /></div>
                <div>
                  <h3 className="font-serif font-semibold text-charcoal text-base">{title}</h3>
                  <p className="text-sm text-charcoal/50 mt-1">{body}</p>
                  {detail && detail.split('\n').map((line) => (
                    <p key={line} className="text-sm text-brown mt-1 font-medium">{line}</p>
                  ))}
                </div>
              </motion.div>
            ))}
            <motion.div variants={fadeUp} className="bg-olive rounded-2xl p-6 text-center shadow-soft">
              <h3 className="font-serif font-semibold text-cream text-base mb-1">Chat on WhatsApp</h3>
              <p className="text-cream/70 text-sm mb-4">For a quick reply, message us directly</p>
              <a
                href="https://wa.me/201142229915"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-medium px-8 py-3 rounded-full text-sm transition duration-300 hover:scale-105 shadow-lg"
              >
                <FaWhatsapp size={20} />
                WhatsApp
              </a>
            </motion.div>
          </Stagger>
        </Container>
      </section>

      <section className="bg-beige py-12 sm:py-16">
        <Container className="max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal text-center mb-8">Frequently Asked Questions</h2>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {FAQS.map((f, i) => <FAQItem key={f.q} id={i} question={f.q} answer={f.a} />)}
          </Stagger>
        </Container>
      </section>


      <USPStrip />
    </>
  )
}
