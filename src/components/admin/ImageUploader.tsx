// @ts-nocheck
"use client"

import React, { useRef, useState } from 'react'
import { ImagePlus, X, Star, Upload } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'

export default function ImageUploader({ images = [], onChange }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const readFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
    valid.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImg = { id: Date.now() + Math.random(), file, preview: e.target.result }
        onChange((prev) => [...prev, newImg])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    readFiles(e.dataTransfer.files)
  }

  const handleRemove = (id) => {
    onChange((prev) => prev.filter((img) => img.id !== id))
  }

  const handleSetMain = (id) => {
    onChange((prev) => {
      const idx = prev.findIndex((img) => img.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      const [moved] = next.splice(idx, 1)
      return [moved, ...next]
    })
  }

  return (
    <div>
      <span className="block text-xs font-medium text-charcoal/60 mb-1.5 uppercase tracking-label">
        Product Images <span className="text-brown">*</span>
      </span>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition duration-200 ${
          dragging
            ? 'border-olive bg-olive/5'
            : 'border-charcoal/15 bg-beige hover:border-olive/40 hover:bg-beige-dark'
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-charcoal/30" />
        <p className="text-sm text-charcoal/60">
          <span className="text-olive font-medium">Click to upload</span> or drag & drop
        </p>
        <p className="text-xs text-charcoal/35 mt-1">PNG, JPG, WEBP — up to 5 MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => readFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
          {images.map((img, i) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-charcoal/10">
              <OptimizedImage src={img.preview} alt="" className="w-full h-full object-cover" />
              {/* Main badge */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-olive text-cream text-[9px] uppercase tracking-label px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star size={8} /> Main
                </span>
              )}
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-2">
                {i !== 0 && (
                  <button
                    type="button"
                    title="Set as main"
                    onClick={(e) => { e.stopPropagation(); handleSetMain(img.id) }}
                    className="w-7 h-7 rounded-full bg-white/90 text-charcoal flex items-center justify-center hover:bg-cream"
                  >
                    <Star size={13} />
                  </button>
                )}
                <button
                  type="button"
                  title="Remove"
                  onClick={(e) => { e.stopPropagation(); handleRemove(img.id) }}
                  className="w-7 h-7 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:bg-cream"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Add more */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-charcoal/15 bg-beige hover:border-olive/40 flex flex-col items-center justify-center text-charcoal/40 hover:text-olive transition duration-200"
          >
            <ImagePlus size={20} />
            <span className="text-[10px] mt-1">Add</span>
          </button>
        </div>
      )}
    </div>
  )
}
