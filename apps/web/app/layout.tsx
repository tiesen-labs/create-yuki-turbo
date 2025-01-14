import '@yuki/ui/tailwind.css'

import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'

import { Toaster } from '@yuki/ui/toaster'
import { cn } from '@yuki/ui/utils'

import { SessionProvider } from '@/lib/auth/react'
import { auth } from '@/lib/auth/server'
import { seo } from '@/lib/seo'
import { TRPCReactProvider } from '@/lib/trpc/react'

const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

export default async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn('font-sans antialiased', geistSans.variable, geistMono.variable)}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <SessionProvider session={session}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = seo({})
