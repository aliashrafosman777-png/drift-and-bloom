// @ts-nocheck
"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import RatingStars from '../common/RatingStars'
import Button from '../common/Button'
import { fadeUp } from '../common/Motion'
import { isBestSellerProduct } from '../../data/products'
import { getCollectionImage } from '../../utils/collectionImages'
import OptimizedImage from '../common/OptimizedImage'

export default function PackageCard({ product }) {
  const cardImage = getCollectionImage(product.name || product.id, product.image)

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group bg-white rounded-2xl overflow-hidden border border-charcoal/5 shadow-card flex flex-col h-full transition duration-300 hover:shadow-lift"
    >
      <Link href={`/packages/${product.id}`} className="relative block overflow-hidden" aria-label={`View ${product.name} package`}>
        <OptimizedImage
          src={cardImage}
          alt={product.name}
          className="w-full h-48 sm:h-56 object-cover transition duration-700 ease-out group-hover:scale-105"
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
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-serif text-xl text-charcoal">{product.name}</h3>
        <p className="text-charcoal/55 text-sm mt-1.5 line-clamp-2">{product.tagline}</p>
        <div className="flex items-center justify-between mt-3 mb-4">
          <RatingStars rating={product.rating} reviews={product.reviews} />
          <span className="text-brown font-medium">LE {product.price.toLocaleString()}</span>
        </div>
        <Button href={`/packages/${product.id}`} size="sm" className="mt-auto" fullWidth>
          View Package
        </Button>
      </div>
    </motion.article>
  )
}
