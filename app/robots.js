const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ais-pre-kz5r5lwd2wsk7dgmpmc3bz-136733511848.asia-southeast1.run.app';

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
