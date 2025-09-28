import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Career Reality Coach - Stop Romanticizing Careers',
  description: 'Get brutally honest answers about what it\'s actually like to work in your dream job. US-first career reality checks with adaptive AI questioning.',
  keywords: 'career, job, reality check, career coaching, job search, career planning',
  authors: [{ name: 'Career Reality Coach' }],
  openGraph: {
    title: 'Career Reality Coach - Stop Romanticizing Careers',
    description: 'Get brutally honest answers about what it\'s actually like to work in your dream job.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Reality Coach - Stop Romanticizing Careers',
    description: 'Get brutally honest answers about what it\'s actually like to work in your dream job.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}