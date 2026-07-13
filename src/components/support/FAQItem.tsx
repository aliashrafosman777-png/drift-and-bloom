// @ts-nocheck
"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { fadeUp } from '../common/Motion'

export default function FAQItem({ id, question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="bg-white border border-charcoal/8 rounded-2xl overflow-hidden shadow-soft self-start"
      id={id ? `faq-${id}` : undefined}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition duration-300 hover:bg-beige/45"
        aria-expanded={open}
        aria-controls={id ? `faq-answer-${id}` : undefined}
      >
        <span className="text-sm sm:text-base text-charcoal font-medium leading-snug">{question}</span>
        <ChevronDown size={17} className={`shrink-0 text-charcoal/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id ? `faq-answer-${id}` : undefined}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 pt-1 text-sm text-charcoal/60 leading-relaxed border-t border-charcoal/6">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
