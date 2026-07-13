// @ts-nocheck
"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiX } from 'react-icons/fi'

export default function SearchBar({ value, onChange, placeholder = 'Search packages...' }) {
  return (
    <motion.div className="relative w-full" whileFocus={{ scale: 1.01 }}>
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-white border border-charcoal/15 rounded-full pl-11 pr-11 py-3 text-sm placeholder:text-charcoal/40 transition duration-300 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-charcoal/35 transition duration-300 hover:bg-beige hover:text-charcoal"
          aria-label="Clear search"
        >
          <FiX size={14} />
        </button>
      )}
    </motion.div>
  )
}
