import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SVG Tools - 专业在线SVG编辑器 | 免费SVG代码编辑与优化工具',
  description: '专业的在线SVG编辑器，支持实时代码编辑、形状生成、SVG优化压缩、格式化。免费的SVG工具，无需下载安装，支持导出PNG/SVG格式。',
  keywords: ['SVG编辑器', 'SVG工具', '在线SVG编辑', 'SVG优化', 'SVG代码编辑器', 'SVG转PNG', '矢量图编辑', 'SVG格式化', 'SVG压缩', 'Web SVG工具'],
  authors: [{ name: 'SVG Tools Team' }],
  creator: 'SVG Tools',
  publisher: 'SVG Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
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
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://svg-tools.vercel.app',
    title: 'SVG Tools - 专业在线SVG编辑器',
    description: '专业的在线SVG编辑器，支持实时代码编辑、形状生成、SVG优化压缩、格式化。免费使用，无需注册。',
    siteName: 'SVG Tools',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SVG Tools - 专业在线SVG编辑器',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SVG Tools - 专业在线SVG编辑器',
    description: '专业的在线SVG编辑器，支持实时代码编辑、形状生成、SVG优化压缩。免费使用，无需注册。',
    images: ['/og-image.png'],
    creator: '@svgtools',
  },
  alternates: {
    canonical: 'https://svg-tools.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 