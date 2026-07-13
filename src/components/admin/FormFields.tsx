// @ts-nocheck
"use client"

import React, { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

const BASE =
  'w-full bg-beige border border-charcoal/10 rounded-xl px-4 py-3 text-sm text-charcoal ' +
  'placeholder:text-charcoal/35 focus:outline-none focus:ring-2 focus:ring-gold/40 ' +
  'focus:border-gold transition duration-200'

export function FormInput({
  label, name, value, onChange, required, type = 'text',
  placeholder, hint, error, className = '',
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-xs font-medium text-charcoal/60 mb-1.5 uppercase tracking-label">
          {label} {required && <span className="text-brown">*</span>}
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required={required}
        className={`${BASE} ${error ? 'border-red-300 ring-1 ring-red-200' : ''}`}
      />
      {hint  && <p className="text-[11px] text-charcoal/40 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </label>
  )
}

export function FormTextarea({ label, name, value, onChange, required, placeholder, rows = 3, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-xs font-medium text-charcoal/60 mb-1.5 uppercase tracking-label">
          {label} {required && <span className="text-brown">*</span>}
        </span>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required={required}
        rows={rows}
        className={`${BASE} resize-none`}
      />
    </label>
  )
}

export function FormSelect({ label, name, value, onChange, required, options = [], className = '' }) {
  return (
    <label className={`block relative ${className}`}>
      {label && (
        <span className="block text-xs font-medium text-charcoal/60 mb-1.5 uppercase tracking-label">
          {label} {required && <span className="text-brown">*</span>}
        </span>
      )}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${BASE} appearance-none pr-10`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
      </div>
    </label>
  )
}

export function FormToggle({ label, name, checked, onChange, hint }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-charcoal font-medium">{label}</p>
        {hint && <p className="text-[11px] text-charcoal/45 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange({ target: { name, value: !checked, type: 'toggle', checked: !checked } })}
        className={`relative w-11 h-6 rounded-full transition duration-300 ${checked ? 'bg-olive' : 'bg-charcoal/20'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  )
}

const PRESET_TAGS = [
  'Indoor', 'Outdoor', 'Low Maintenance', 'Beginner', 'Gift',
  'Office', 'Bedroom', 'Living Room', 'Pet Friendly', 'Air Purifying', 'Rare',
]

export function FormTagInput({ label, value = [], onChange, name }) {
  const [input, setInput] = useState('')

  const addTag = (tag) => {
    const t = tag.trim()
    if (t && !value.includes(t)) {
      onChange({ target: { name, value: [...value, t] } })
    }
    setInput('')
  }

  const removeTag = (tag) => {
    onChange({ target: { name, value: value.filter((v) => v !== tag) } })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div>
      {label && (
        <span className="block text-xs font-medium text-charcoal/60 mb-1.5 uppercase tracking-label">{label}</span>
      )}
      <div className="bg-beige border border-charcoal/10 rounded-xl p-3 focus-within:ring-2 focus-within:ring-gold/40 focus-within:border-gold transition duration-200">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 bg-olive/10 text-olive px-2.5 py-1 rounded-full text-xs font-medium">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-olive/60 hover:text-olive">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a tag and press Enter..."
          className="w-full bg-transparent text-sm text-charcoal placeholder:text-charcoal/35 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {PRESET_TAGS.filter((t) => !value.includes(t)).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => addTag(t)}
            className="text-[11px] text-charcoal/50 hover:text-olive border border-charcoal/10 hover:border-olive/30 px-2.5 py-1 rounded-full transition duration-200"
          >
            + {t}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FormSection({ title, children, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-serif text-base text-charcoal border-b border-charcoal/8 pb-2">{title}</h3>
      {children}
    </div>
  )
}
