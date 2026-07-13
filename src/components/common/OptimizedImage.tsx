// @ts-nocheck
"use client"

import Image, { type ImageProps } from 'next/image'
import { motion } from 'framer-motion'
import React, { forwardRef } from 'react'

type OptimizedImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: ImageProps['src'] | string | null
  alt?: string
}

function isRuntimePreview(src: OptimizedImageProps['src']) {
  return typeof src === 'string' && /^(blob:|data:)/.test(src)
}

const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(function OptimizedImage(
  { src, alt = '', width = 900, height = 900, sizes = '(max-width: 768px) 100vw, 50vw', ...props },
  ref,
) {
  const safeSrc = src || '/assets/package.png'

  if (isRuntimePreview(safeSrc)) {
    // Admin upload previews are browser-only blob/data URLs, so a native image is the safest runtime fallback.
    // All static and public assets still use next/image below.
    // eslint-disable-next-line @next/next/no-img-element
    return <img ref={ref} src={String(safeSrc)} alt={alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  }

  return (
    <Image
      ref={ref}
      src={safeSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      {...props}
    />
  )
})

export const MotionOptimizedImage = motion(OptimizedImage)
export default OptimizedImage
