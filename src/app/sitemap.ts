import type { MetadataRoute } from 'next'
import { products } from '@/data/products'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://driftnblooms.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['/', '/packages', '/build-your-package', '/build-package', '/find-your-soul', '/support']

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '/' ? 'weekly' : 'monthly',
      priority: route === '/' ? 1 : 0.8,
    } as const)),
    ...products.map((product) => ({
      url: `${siteUrl}/packages/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    } as const)),
  ]
}
