// @ts-nocheck
"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import RatingStars from '../common/RatingStars'
import Button from '../common/Button'
import { fadeUp } from '../common/Motion'
import { getCollectionImage } from '../../utils/collectionImages'
import OptimizedImage from '../common/OptimizedImage'

export default function ProductCard({ product }) {
  const cardImage = getCollectionImage(product.name || product.id, product.image)

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group bg-white rounded-2xl overflow-hidden border border-charcoal/5 shadow-card flex flex-col h-full transition duration-300 hover:shadow-lift"
    >
      <Link href={`/packages/${product.id}`} className="block overflow-hidden" aria-label={`View ${product.name} details`}>
        <OptimizedImage
          src={cardImage}
          alt={product.name}
          className="w-full h-44 sm:h-52 object-cover transition duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </Link>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg text-charcoal">{product.name}</h3>
        <RatingStars rating={product.rating} reviews={product.reviews} />
        <p className="text-brown font-medium mt-2 mb-4">LE {product.price.toLocaleString()}</p>
        <Button href={`/packages/${product.id}`} variant="outline" size="sm" className="mt-auto" fullWidth>
          View Details
        </Button>
      </div>
    </motion.article>
  )
}
