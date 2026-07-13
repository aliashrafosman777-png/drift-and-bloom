import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://driftnblooms.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/login', '/cart', '/login', '/register'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
