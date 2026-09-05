"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import RatingStars from '../common/RatingStars'
import Button from '../common/Button'
import { fadeUp } from '../common/Motion'
import OptimizedImage from '../common/OptimizedImage'
import type { PackageProduct } from '@/context/ProductContext'

export default function ProductCard({ product }: { product: PackageProduct }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-charcoal/5 bg-white shadow-card transition duration-300 hover:shadow-lift sm:rounded-2xl"
    >
      <Link
        href={`/packages/${product.id}`}
        className="block aspect-[4/3] overflow-hidden bg-beige/30 sm:aspect-auto"
        aria-label={`View ${product.name} details`}
      >
        <OptimizedImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition duration-700 ease-out group-hover:scale-105 sm:h-52 sm:object-cover"
          sizes="(max-width: 639px) 46vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
          loading="lazy"
          decoding="async"
        />
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <h3 className="font-serif text-base text-charcoal sm:text-lg">{product.name}</h3>
        <RatingStars rating={product.rating} reviews={product.reviews} size="text-xs sm:text-sm" />
        <p className="mb-3 mt-2 text-sm font-medium text-brown sm:mb-4 sm:text-base">LE {product.price.toLocaleString()}</p>
        <Button href={`/packages/${product.id}`} variant="outline" size="sm" className="mt-auto px-2 text-[10px] sm:px-4 sm:text-xs" fullWidth>
          View Details
        </Button>
      </div>
    </motion.article>
  )
}
