import type { Metadata } from 'next'
import Script from 'next/script'
import ProductDetails from '@/views/ProductDetails'
import { products } from '@/data/products'

type ProductPageProps = {
  params: Promise<{ id: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://driftnblooms.com'

export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = products.find((item) => item.id === id)

  if (!product) {
    return {
      title: 'Package Not Found',
      description: 'The requested Drift & Bloom package could not be found.',
      alternates: { canonical: '/packages' },
    }
  }

  return {
    title: `${product.name} Collection`,
    description: product.description || product.tagline,
    alternates: { canonical: `/packages/${product.id}` },
    openGraph: {
      title: `${product.name} Collection | Drift & Bloom`,
      description: product.description || product.tagline,
      url: `/packages/${product.id}`,
      images: [{ url: product.image, width: 1200, height: 630, alt: `${product.name} collection` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} Collection | Drift & Bloom`,
      description: product.description || product.tagline,
      images: [product.image],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${product.name} Collection`,
        image: [`${siteUrl}${product.image}`],
        description: product.description || product.tagline,
        brand: { '@type': 'Brand', name: 'Drift & Bloom' },
        sku: product.id,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EGP',
          price: product.price,
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/packages/${product.id}`,
        },
        aggregateRating: product.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              reviewCount: product.reviews || 1,
            }
          : undefined,
      }
    : null

  return (
    <>
      {jsonLd && (
        <Script
          id={`product-jsonld-${id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetails />
    </>
  )
}
