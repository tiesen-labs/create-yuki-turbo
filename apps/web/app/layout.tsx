import '@yuki/ui/tailwind.css'

import { auth } from '@yuki/auth'
import { SessionProvider } from '@yuki/auth/react'
import { cn, ThemeProvider } from '@yuki/ui'

import { geistSans } from '@/lib/fonts'
import { seo } from '@/lib/seo'
import { TRPCReactProvider } from '@/lib/trpc/react'

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-dvh font-sans antialiased', geistSans.variable)}>
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
