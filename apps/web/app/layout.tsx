import '@yuki/ui/tailwind.css'

import { auth } from '@yuki/auth'
import { SessionProvider } from '@yuki/auth/react'
import { cn, GeistMono, GeistSans, ThemeProvider } from '@yuki/ui'

import { seo } from '@/lib/seo'
import { TRPCReactProvider } from '@/lib/trpc/react'

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans', GeistSans.variable, GeistMono.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <SessionProvider session={session}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout

export const metadata = seo({})
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(0 0% 100%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(240 10% 3.9%)' },
  ],
}
