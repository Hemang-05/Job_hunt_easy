import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'], // Prevent indexing of private areas and APIs
    },
    sitemap: 'https://jobhunteasy.com/sitemap.xml',
  }
}
