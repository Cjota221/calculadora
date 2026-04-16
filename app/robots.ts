import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/comprar', '/login'],
        disallow: ['/app/', '/admin/', '/api/'],
      },
    ],
    sitemap: 'https://calculadoraprecifique.com/sitemap.xml',
    host: 'https://calculadoraprecifique.com',
  }
}
