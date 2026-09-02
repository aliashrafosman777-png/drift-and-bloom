import { cache } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import mongoose from 'mongoose'
import ProductDetails from '@/views/ProductDetails'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

type ProductPageProps = {
  params: Promise<{ id: string }>
}

type PackageMetadataRecord = {
  _id: mongoose.Types.ObjectId
  slug: string
  name: string
  tagline: string
  description: string
  price: number
  rating: number
  reviewsCount: number
  image: string
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://driftnblooms.com'

const getPackage = cache(async (id: string): Promise<PackageMetadataRecord | null> => {
  await connectDB()
  const identity = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id }
  return Product.findOne({
    ...identity,
    deletedAt: null,
    isActive: true,
    packageCategory: { $ne: 'fish' },
    productType: { $nin: ['candles', 'plants'] },
  })
    .select('_id slug name tagline description price rating reviewsCount image')
    .lean<PackageMetadataRecord>()
})

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getPackage(id)

  if (!product) {
    return {
      title: 'Package Not Found',
      description: 'The requested Drift & Bloom package could not be found.',
      alternates: { canonical: '/packages' },
    }
  }

  const canonicalId = product.slug || product._id.toString()
  const description = product.description || product.tagline
  return {
    title: `${product.name} Collection`,
    description,
    alternates: { canonical: `/packages/${canonicalId}` },
    openGraph: {
      title: `${product.name} Collection | Drift & Bloom`,
      description,
      url: `/packages/${canonicalId}`,
      images: product.image
        ? [{ url: product.image, width: 1200, height: 630, alt: `${product.name} collection` }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} Collection | Drift & Bloom`,
      description,
      images: product.image ? [product.image] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getPackage(id)
  const canonicalId = product?.slug || product?._id.toString() || id
  const image = product?.image
    ? product.image.startsWith('http') ? product.image : `${siteUrl}${product.image}`
    : undefined
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${product.name} Collection`,
        image: image ? [image] : undefined,
        description: product.description || product.tagline,
        brand: { '@type': 'Brand', name: 'Drift & Bloom' },
        sku: product._id.toString(),
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EGP',
          price: product.price,
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/packages/${canonicalId}`,
        },
        aggregateRating: product.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              reviewCount: product.reviewsCount || 1,
            }
          : undefined,
      }
    : null

  return (
    <>
      {jsonLd && (
        <Script
          id={`product-jsonld-${canonicalId}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetails />
    </>
  )
}
