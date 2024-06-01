import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import prisma from '@/prisma/client'
import NavBar from './NavBar'

const font = Nunito({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SLIDE',
  description: 'Image Gallery',
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
  const tagArray = tags.map((tag) => tag.name)

  return (
    <html lang="en">
      <body className={font.className + ' h-screen'}>
        <NavBar tags={tagArray} />
        <div className="p-4">{children}</div>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
export default RootLayout
