import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Providers } from '@/components/layout/providers';
import { Header, Footer } from '@/components/layout/header';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'TimeVerse — Your Life, Measured in Moments.', template: '%s · TimeVerse' },
  description:
    'Count down to what matters. Look back on what shaped you. A beautiful, private space for every meaningful moment.',
  icons: { icon: '/icon.svg' },
  applicationName: 'TimeVerse',
};
export const viewport: Viewport = { themeColor: '#f8f7fc', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={GeistSans.variable}>
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
