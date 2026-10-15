
import './globals.css';

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000')
).replace(/\/+$/, '');

const SITE_NAME = 'PreJudge';
const CREATOR_NAME = 'Ritesh Sarkar';
const CREATOR_URL = 'https://ritesh-sarkar.vercel.app/';
const DEFAULT_TITLE = 'PreJudge - Check Your Code Before You Submit';

const DESCRIPTION =
  'Check your competitive programming solutions before submission. PreJudge helps you test code, examine edge cases, and identify potential issues before the official judge.';

export const metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: DEFAULT_TITLE,
    template: '%s | PreJudge',
  },

  description: DESCRIPTION,

  applicationName: SITE_NAME,
  authors: [
    {
      name: CREATOR_NAME,
      url: CREATOR_URL,
    },
  ],
  creator: CREATOR_NAME,
  publisher: SITE_NAME,
  category: 'technology',

  keywords: [
    'PreJudge',
    'competitive programming',
    'code testing',
    'online judge',
    'pre-submission code checker',
    'algorithm testing',
    'edge case testing',
    'programming problem solving',
    'Beecrowd',
    'C++ programming',
    'Python programming',
    'Java programming',
    'JavaScript programming',
    'code debugging',
    'code validation',
    'programming contest preparation',
    'algorithm optimization',
    'code quality assurance',
    'programming challenge',
    'code review',
    'programming practice',
    'competitive programming practice',
    'programming problem analysis',
    'code execution',
    'code evaluation',
    'programming problem testing',
    'code correctness',
    'programming problem solving skills',
    'Ritesh Sarkar'
  ],

  alternates: {
    canonical: '/',
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },

  manifest: '/manifest.json',

  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    locale: 'en_US',
    images: [
      {
        url: '/OG.png',
        width: 1200,
        height: 630,
        alt: 'PreJudge - Check your code before you submit',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    images: ['/OG.png'],
    creator: '@riteshsarkar',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07090e',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: APP_URL,
    description: DESCRIPTION,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    image: `${APP_URL}/OG.png`,
    author: {
      '@type': 'Person',
      name: CREATOR_NAME,
      url: CREATOR_URL,
    },
  };

  // Escape HTML-sensitive characters before embedding JSON-LD.
  const safeJsonLd = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link
          rel="icon"
          href="/logo.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="/logo.png"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd }}
        />
      </head>

      <body
        className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
