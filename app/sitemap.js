const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ais-pre-kz5r5lwd2wsk7dgmpmc3bz-136733511848.asia-southeast1.run.app';

export default function sitemap() {
  const currentDate = new Date();

  return [
    {
      url: APP_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${APP_URL}/analyze`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
