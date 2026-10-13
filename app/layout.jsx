import './globals.css';

export const metadata = {

  title: {
    default: 'PreJudge — Test Your Code Before the Judge Does | AI CP Sandbox',
    template: '%s | PreJudge',
  },
  description: 'AI-assisted competitive programming pre-submission checker. Compile and execute C++, Python, and Java in an isolated sandbox with edge-case detection and algorithmic review before official Beecrowd and CP submissions.',
  applicationName: 'PreJudge',
  keywords: [
    'PreJudge',
    'Beecrowd',
    'URI Online Judge',
    'Competitive Programming',
    'Online Judge Pre-tester',
    'C++20 Sandbox',
    'Python Algorithm Checker',
    'Java CP Checker',
    'Edge Case Generator',
    'Wrong Answer Prevention',
    'Time Limit Exceeded Debugger',
    'Algorithm Analysis',
    'Code Evaluation Sandbox',
    'Ritesh Sarkar',
  ],
  authors: [{ name: 'Ritesh Sarkar', url: 'https://ritesh-sarkar.vercel.app/' }],
  creator: 'Ritesh Sarkar',
  publisher: 'PreJudge',
  category: 'Developer Tools',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/faveicon.ico', type: 'image/png' },
    ],
    apple: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'PreJudge — Test Your Code Before the Judge Does',
    description: 'AI-assisted competitive programming pre-submission checker. Test code against edge cases and isolated sandbox execution before the official judge.',
    url: '/',
    siteName: 'PreJudge',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/OG.png',
        width: 1200,
        height: 630,
        alt: 'PreJudge — Competitive Programming Pre-Submission Checker & Sandbox',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PreJudge — Test Your Code Before the Judge Does',
    description: 'AI-assisted competitive programming pre-submission checker. Run sandboxed C++, Python, and Java code against edge cases before the judge.',
    images: ['/OG.png'],
    creator: '@riteshsarkar',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PreJudge',
    description: 'AI-assisted competitive programming pre-submission checker. Compiles and executes code in an isolated sandbox with edge-case analysis for Beecrowd and CP problems.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    image: `OG.png`,
    logo: `logo.png`,
    author: {
      '@type': 'Person',
      name: 'Ritesh Sarkar',
      url: 'https://ritesh-sarkar.vercel.app/',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Isolated sandboxed code execution for C++20, Python 3, Java, and C',
      'Automated edge-case test generation',
      'AI algorithmic flaw and bottleneck analysis',
      'Beecrowd problem resolution and test verification',
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="theme-color" content="#07090e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
