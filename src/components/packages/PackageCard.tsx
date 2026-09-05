"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import RatingStars from '../common/RatingStars'
import Button from '../common/Button'
import { fadeUp } from '../common/Motion'
import { isBestSellerProduct } from '../../data/products'
import OptimizedImage from '../common/OptimizedImage'
import ProductPrice from '../common/ProductPrice'
import type { PackageProduct } from '@/context/ProductContext'

export default function PackageCard({ product }: { product: PackageProduct }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-charcoal/5 bg-white shadow-card transition duration-300 hover:shadow-lift sm:rounded-2xl"
    >
      <Link
        href={`/packages/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-beige/30 sm:aspect-auto"
        aria-label={`View ${product.name} package`}
      >
        <OptimizedImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition duration-700 ease-out group-hover:scale-105 sm:h-56 sm:object-cover"
          sizes="(max-width: 639px) 46vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
          loading="lazy"
          decoding="async"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-olive/18 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        {isBestSellerProduct(product) && (
          <span className="absolute top-3 right-3 bg-olive text-cream text-[10px] uppercase tracking-label px-2.5 py-1 rounded-full shadow-soft">
            Best Seller
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <h3 className="font-serif text-base text-charcoal sm:text-xl">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-charcoal/55 sm:text-sm">{product.tagline}</p>
        <div className="mb-3 mt-3 flex flex-col items-start gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <RatingStars rating={product.rating} reviews={product.reviews} size="text-xs sm:text-sm" />
          <ProductPrice
            price={product.price}
            discountPrice={product.discountPrice}
            className="text-sm sm:text-base"
            originalClassName="text-xs text-charcoal/40 line-through sm:text-sm"
          />
        </div>
        <Button href={`/packages/${product.id}`} size="sm" className="mt-auto px-2 text-[10px] sm:px-4 sm:text-xs" fullWidth>
          View Package
        </Button>
      </div>
    </motion.article>
  )
}
