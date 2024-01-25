import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import '../../globals.css'

const font = Nunito({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SLIDE',
  description: 'Image Gallery',
}

const SlideLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={font.className + ' h-screen no-scroll'}>{children}</body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
export default SlideLayout
