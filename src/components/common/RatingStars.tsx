// @ts-nocheck
"use client"

import React from 'react'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

export default function RatingStars({ rating = 0, reviews, size = 'text-sm', showNumber = true }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} />)
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} />)
    else stars.push(<FaRegStar key={i} />)
  }

  return (
    <div className={`flex items-center gap-1.5 ${size}`}>
      <div className="flex items-center gap-0.5 text-brown">{stars}</div>
      {showNumber && (
        <span className="text-charcoal/50 text-xs">
          {rating.toFixed(1)}
          {reviews !== undefined && ` (${reviews})`}
        </span>
      )}
    </div>
  )
}
