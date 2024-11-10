import '@yuki/ui/tailwind.css'

import { cn, geistSans, ThemeProvider } from '@yuki/ui'

import { seo } from '@/lib/seo'

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <html lang="en" suppressHydrationWarning>
    <body className={cn('min-h-dvh font-sans antialiased', geistSans.variable)}>
      <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </body>
  </html>
)

export default RootLayout

export const metadata = seo({})
