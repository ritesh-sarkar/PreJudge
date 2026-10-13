const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
